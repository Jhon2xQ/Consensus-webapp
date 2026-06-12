import type { Team } from '$lib/types/team';
import type { Enrollment } from '$lib/types/enrollment';
import type { VotingStage, ProofError } from '$lib/types/proof';
import { goto, invalidateAll } from '$app/navigation';
import { verifyPasskey } from '$lib/services/passkey.service';
import { deriveIdentity } from '$lib/services/semaphore.service';
import { buildVotingProof, submitVotingProof } from '$lib/services/proof.service';

export type UseVotingParams = {
	userSub: () => string | null;
	processId: () => string;
	groupId: () => string | null;
	userEnrollment: () => Enrollment | null;
	commitments: () => string[];
	commitmentsError: () => boolean;
};

export type UseVotingReturn = {
	selectedTeam: Team | null;
	votingFlow: VotingStage;
	error: string | null;
	hasVoted: boolean;
	showConfirmDialog: boolean;
	selectTeam: (team: Team) => void;
	openConfirmDialog: () => void;
	closeConfirmDialog: () => void;
	submitVote: () => Promise<void>;
	resetError: () => void;
};

/**
 * Map any error thrown during the voting flow to a user-facing Spanish message.
 *
 * ProofError objects carry a `kind` discriminator; everything else is treated
 * as a generic Error. The 'relayer-4xx' case has special handling for
 * nullifier collisions (the user already voted on-chain).
 */
function getVoteErrorMessage(error: unknown): string {
	if (error && typeof error === 'object' && 'kind' in error) {
		const proofError = error as ProofError;
		switch (proofError.kind) {
			case 'snark-download':
				return 'Error al descargar la librería de pruebas. Verificá tu conexión.';
			case 'merkle-failed':
				return 'Error al generar la prueba. Intentá de nuevo.';
			case 'identity-not-in-group':
				return proofError.message || 'No se encontró tu compromiso en el árbol de votantes.';
			case 'relayer-4xx':
				if (proofError.message?.toLowerCase().includes('nullifier')) {
					return 'Ya emitiste tu voto para este proceso.';
				}
				return proofError.message || 'Error del relayer. Intentá de nuevo.';
			case 'relayer-5xx':
				return 'El relayer no está disponible. Intentá más tarde.';
			case 'validation':
				return proofError.message || 'La prueba no fue válida.';
		}
	}
	if (error instanceof Error) return error.message;
	return 'Error al enviar el voto. Intentá de nuevo.';
}

/**
 * Composable that owns the voting state machine.
 *
 * State lives in closure-scoped `$state` / `$derived` runes — each call to
 * `useVoting()` gets an isolated instance. The returned object exposes the
 * state via getters so consumers always read the current value.
 */
export function useVoting(params: UseVotingParams): UseVotingReturn {
	let selectedTeam = $state<Team | null>(null);
	let votingFlow = $state<VotingStage>('idle');
	let error = $state<string | null>(null);
	let localHasVoted = $state(false);
	let showConfirmDialog = $state(false);

	// Optimistic union of server view + local override. `localHasVoted` flips
	// to true the moment the relayer confirms the proof (or returns the
	// nullifier-already-used 4xx), so the UI never gets stuck waiting for
	// the server-side M2M callback to reconcile `userEnrollment.hasVoted`.
	let hasVoted = $derived((params.userEnrollment()?.hasVoted === true) || localHasVoted);

	function selectTeam(team: Team): void {
		if (votingFlow !== 'idle' || hasVoted) return;
		if (selectedTeam?.id === team.id) {
			selectedTeam = null;
		} else {
			selectedTeam = team;
		}
	}

	function openConfirmDialog(): void {
		showConfirmDialog = true;
	}

	function closeConfirmDialog(): void {
		showConfirmDialog = false;
	}

	function resetError(): void {
		error = null;
		votingFlow = 'idle';
	}

	async function submitVote(): Promise<void> {
		// Snapshot all reactive inputs at entry — guards against re-entry
		// (e.g. the parent unmounting mid-flow) and gives us stable locals
		// for the rest of the function.
		const userSub = params.userSub();
		const groupId = params.groupId();
		const userEnrollment = params.userEnrollment();
		const commitments = params.commitments();
		const commitmentsError = params.commitmentsError();
		const processId = params.processId();

		if (!userSub || !selectedTeam || !groupId || hasVoted) {
			return;
		}

		// Pre-check: Merkle tree must be available before prompting the
		// passkey modal. If we let the user click through to passkey and
		// THEN fail here, they've wasted a WebAuthn ceremony.
		if (commitmentsError) {
			error = 'No se pudieron cargar los compromisos. Recargá la página e intentá de nuevo.';
			votingFlow = 'error';
			return;
		}
		if (commitments.length === 0) {
			error = 'Todavía no hay compromisos registrados en este proceso.';
			votingFlow = 'error';
			return;
		}

		error = null;

		try {
			// Step 1: Verify passkey — triggers the WebAuthn modal/QR.
			votingFlow = 'verifying-passkey';
			const passkeyResult = await verifyPasskey();

			// Step 2: Derive deterministic identity from user + cred + process.
			const { identity } = await deriveIdentity(userSub, passkeyResult.credentialId, processId);

			// Step 3: Passkey mismatch check. The commitment they enrolled
			// with must match the one derived from the credential they just
			// used — otherwise they're trying to vote with a different
			// device/credential than the one they committed with.
			if (userEnrollment?.commitment && identity.commitment.toString() !== userEnrollment.commitment) {
				error = 'Usá la misma credencial con la que enviaste tu compromiso';
				votingFlow = 'error';
				return;
			}

			// Step 4: Build the zk-SNARK proof with the pre-loaded commitments.
			votingFlow = 'building-proof';
			const fullProof = await buildVotingProof({
				identity,
				groupId,
				processId,
				teamName: selectedTeam.name,
				commitments
			});

			// Step 5: Submit to the relayer. A 200 response means the proof
			// was accepted — either as first-time submission (success: true)
			// or as a re-submit of an already on-chain proof (success: false).
			// Both mean the user's vote exists on-chain.
			votingFlow = 'submitting';
			const relayerResult = await submitVotingProof({ groupId, proof: fullProof });

			// Relayer says the proof was already on-chain (nullifier used)
			// — the user already voted. Treat as success without re-calling
			// the backend.
			if (!relayerResult.success) {
				votingFlow = 'success';
				localHasVoted = true;
				await invalidateAll();
				return;
			}

			// Step 6: Mark hasVoted on the server via the SvelteKit action.
			// Only flip localHasVoted after the server confirms the update.
			const markResponse = await fetch('?/mark-as-voted', {
				method: 'POST',
				body: new URLSearchParams()
			});
			if (!markResponse.ok) {
				const body = await markResponse.json().catch(() => null);
				const errorMessage =
					body?.error || `El servidor respondió con estado ${markResponse.status}`;
				throw new Error(`No se pudo registrar el voto en el servidor: ${errorMessage}`);
			}
			localHasVoted = true;

			// Step 7: Success — invalidateAll re-fetches the server view
			// so subsequent renders use the canonical hasVoted.
			votingFlow = 'success';
			await invalidateAll();
			await goto(`?success=${encodeURIComponent('Voto registrado')}`, {
				replaceState: true
			});
		} catch (err) {
			// Passkey cancellation (user closed the modal) — silent return
			// to idle, no error message shown.
			if (err instanceof DOMException && err.name === 'NotAllowedError') {
				votingFlow = 'idle';
				return;
			}
			error = getVoteErrorMessage(err);
			votingFlow = 'error';
		}
	}

	return {
		get selectedTeam() {
			return selectedTeam;
		},
		get votingFlow() {
			return votingFlow;
		},
		get error() {
			return error;
		},
		get hasVoted() {
			return hasVoted;
		},
		get showConfirmDialog() {
			return showConfirmDialog;
		},
		selectTeam,
		openConfirmDialog,
		closeConfirmDialog,
		submitVote,
		resetError
	};
}
