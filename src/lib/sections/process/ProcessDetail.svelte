<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter,
		DialogClose
	} from '$lib/components/ui/dialog';
	import { cn } from '$lib/utils.js';
	import {
		ArrowLeft,
		Calendar,
		Vote,
		Users,
		Clock,
		CheckCircle,
		Send,
		Shield,
		Loader2,
		Copy
	} from '@lucide/svelte';
	import type { ElectoralProcess, ElectoralProcessStatus } from '$lib/types/electoral-process';
	import { STATUS_LABELS, STATUS_COLORS } from '$lib/types/process-status';
	import type { Team } from '$lib/types/team';
	import type { EnrollmentSummary, Enrollment } from '$lib/types/enrollment';
	import type { VotingStage, ProofError } from '$lib/types/proof';
	import { VOTING_STAGE_MESSAGE } from '$lib/types/proof';
	import { tick } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { verifyPasskey } from '$lib/services/passkey.service';
	import { deriveIdentity } from '$lib/services/semaphore.service';
	import { buildVotingProof, submitVotingProof } from '$lib/services/proof.service';

	type Props = {
		process: ElectoralProcess;
		liveStatus?: ElectoralProcessStatus | null;
		teams: Team[];
		enrollmentSummary: EnrollmentSummary | null;
		teamsError: boolean;
		enrollmentError: boolean;
		userSub: string | null;
		userEnrollment: Enrollment | null;
		commitments: string[];
		commitmentsError: boolean;
	};

	let {
		process,
		liveStatus = null,
		teams,
		enrollmentSummary = null,
		teamsError = false,
		enrollmentError = false,
		userSub = null,
		userEnrollment = null,
		commitments,
		commitmentsError = false
	}: Props = $props();

	// Use the live status from the /state endpoint when available; fall back
	// to the snapshot from the detail load. liveStatus is the source of truth
	// for the badge and for action gating.
	let effectiveStatus: ElectoralProcessStatus = $derived(liveStatus ?? process.estatus);

	// Action state — commitment uses the old pattern; voting uses the new state machine
	let submitting = $state<'none' | 'commitment'>('none');
	let actionError = $state<string | null>(null);
	let commitmentForm = $state<HTMLFormElement | null>(null);
	let pendingCommitment = $state('');

	// Voting state machine
	let selectedTeam = $state<Team | null>(null);
	let votingFlow: VotingStage = $state('idle');
	let actionErrorVote = $state<string | null>(null);
	let showVoteDialog = $state(false);
	let pendingM2mConfirm = $state(false);
	let scopeCopied = $state(false);

	// Process phase checks
	let isCommitmentPhase = $derived(effectiveStatus === 'COMMITMENT');
	let isVotingPhase = $derived(effectiveStatus === 'VOTING');

	// Already committed/voted checks — use optimistic local override
	let hasCommitted = $derived(userEnrollment?.commitment !== null && userEnrollment?.commitment !== undefined);
	let hasVoted = $derived(userEnrollment?.hasVoted === true);

	// Auto-clear pending M2M confirmation when server confirms hasVoted
	$effect(() => {
		if (hasVoted && pendingM2mConfirm) {
			pendingM2mConfirm = false;
		}
	});

	// ── Status helpers (delegate to central maps) ──
	function getStatusLabel(estatus: ElectoralProcessStatus): string {
		return STATUS_LABELS[estatus] ?? estatus;
	}

	function getStatusColor(estatus: ElectoralProcessStatus): string {
		return STATUS_COLORS[estatus] ?? 'bg-gray-100 text-gray-600 border-gray-200';
	}

	// ── Date formatting (inline) ──
	function formatDateTime(iso: string): string {
		return new Intl.DateTimeFormat('es-AR', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(iso));
	}

	// ── Team initials ──
	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((w) => w[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	// ── Vote error message mapping ──
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
		if (error instanceof Error) {
			return error.message;
		}
		return 'Error al enviar el voto. Intentá de nuevo.';
	}

	// ── Team selection ──
	function handleTeamClick(team: Team) {
		if (votingFlow !== 'idle' || hasVoted) return;
		if (selectedTeam?.id === team.id) {
			selectedTeam = null;
		} else {
			selectedTeam = team;
		}
	}

	// ── Vote dialog ──
	function openVoteDialog() {
		showVoteDialog = true;
	}

	function closeVoteDialog() {
		showVoteDialog = false;
	}

	function confirmVote() {
		showVoteDialog = false;
		handleSubmitVote();
	}

	// ── Voting flow ──
	async function handleSubmitVote() {
		if (!userSub || !selectedTeam || !process.groupId || hasVoted) {
			return;
		}

		// Pre-check: Merkle tree must be available before prompting passkey
		if (commitmentsError) {
			actionErrorVote = 'No se pudieron cargar los compromisos. Recargá la página e intentá de nuevo.';
			votingFlow = 'error';
			return;
		}
		if (commitments.length === 0) {
			actionErrorVote = 'Todavía no hay compromisos registrados en este proceso.';
			votingFlow = 'error';
			return;
		}

		actionErrorVote = null;

		try {
			// Step 1: Verify passkey
			votingFlow = 'verifying-passkey';
			const passkeyResult = await verifyPasskey();

			// Step 2: Derive identity
			const { identity } = await deriveIdentity(userSub, passkeyResult.credentialId, process.id);

			// Step 3: Passkey mismatch check
			if (userEnrollment?.commitment && identity.commitment.toString() !== userEnrollment.commitment) {
				actionErrorVote = 'Usá la misma credencial con la que enviaste tu compromiso';
				votingFlow = 'error';
				return;
			}

			// Step 4: Build proof with pre-loaded commitments
			votingFlow = 'building-proof';
			const fullProof = await buildVotingProof({
				identity,
				groupId: process.groupId,
				processId: process.id,
				teamName: selectedTeam.name,
				commitments
			});

			// Step 5: Submit to relayer
			votingFlow = 'submitting';
			const submission = await submitVotingProof({ groupId: process.groupId, proof: fullProof });

			// Step 6: Mark hasVoted = true via the server node (PUT to enrollments).
			// The relayer confirmed the proof; if the server-side mark fails, the
			// M2M callback will eventually reconcile. POST a record is NOT done
			// here — another service captures on-chain events.
			if (submission.success) {
				try {
					const markResponse = await fetch('?/mark-as-voted', { method: 'POST' });
					if (!markResponse.ok) {
						console.error('[Voting] mark-as-voted failed:', markResponse.status);
					}
				} catch (markErr) {
					console.error('[Voting] mark-as-voted request error:', markErr);
				}
			}

			// Step 7: Success — optimistic update
			votingFlow = 'success';
			await invalidateAll();
			// If the server-side mark failed and M2M callback hasn't arrived yet,
			// show pending confirmation copy as a fallback.
			if (!userEnrollment?.hasVoted) {
				pendingM2mConfirm = true;
			}
			await goto(`?success=${encodeURIComponent('Voto registrado')}`, { replaceState: true });
		} catch (err) {
			// Handle passkey cancellation (user closed modal) — silent return to idle
			if (err instanceof DOMException && err.name === 'NotAllowedError') {
				votingFlow = 'idle';
				return;
			}
			actionErrorVote = getVoteErrorMessage(err);
			votingFlow = 'error';
		}
	}

	// ── Commitment handler (unchanged) ──
	async function handleSubmitCommitment() {
		if (!userSub) {
			actionError = 'Debés estar autenticado para enviar un compromiso';
			return;
		}

		submitting = 'commitment';
		actionError = null;

		try {
			// Verify passkey — always shows modal/QR, returns credentialId fresh
			const passkeyResult = await verifyPasskey();

			// Derive identity
			const identity = await deriveIdentity(userSub, passkeyResult.credentialId, process.id);

			// Set commitment value and submit the hidden form
			pendingCommitment = identity.commitment;
			await tick();
			commitmentForm?.requestSubmit();
		} catch (err) {
			actionError = err instanceof Error ? err.message : 'Error al enviar compromiso';
		} finally {
			submitting = 'none';
		}
	}
</script>

<section class="pt-24 pb-12">
	<div class="max-w-7xl mx-auto px-6 lg:px-8">
		<!-- Back link -->
		<a href="/procesos" class="inline-flex items-center gap-1.5 text-sm text-brand-gray-400 hover:text-brand-red transition-colors mb-8">
			<ArrowLeft class="size-4" />
			Volver a procesos
		</a>

		<!-- Header: Name + Status Badge -->
		<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
			<h1 class="text-4xl md:text-5xl font-bold tracking-tighter text-brand-black">
				{process.name}
			</h1>
			<Badge
				variant="outline"
				class={cn('text-xs font-semibold px-3 py-1 w-fit', getStatusColor(effectiveStatus))}
			>
				{getStatusLabel(effectiveStatus)}
			</Badge>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Left column: Process Info + Teams -->
			<div class="lg:col-span-2 flex flex-col gap-6">
				<!-- Process Info Card -->
				<Card>
					<CardHeader>
						<CardTitle>Información del proceso</CardTitle>
					</CardHeader>
					<CardContent class="flex flex-col gap-4">
						{#if process.description !== null}
							<p class="text-sm text-brand-gray-800 leading-relaxed">
								{process.description}
							</p>
						{/if}

						<div class="flex items-center gap-2 text-sm">
							<span class="font-medium text-brand-black">Alcance:</span>
							<span class="inline-flex items-center gap-1.5 rounded-md border border-brand-gray-200 bg-brand-gray-50 px-2.5 py-0.5 text-xs font-medium text-brand-gray-700">
								{process.scope}
								<button
									onclick={() => {
										navigator.clipboard.writeText(process.scope);
										scopeCopied = true;
										setTimeout(() => { scopeCopied = false; }, 1500);
									}}
									class="inline-flex items-center justify-center rounded p-0.5 text-brand-gray-400 hover:text-brand-red transition-colors"
									aria-label="Copiar alcance"
								>
									{#if scopeCopied}
										<CheckCircle class="size-3.5 text-green-500" />
									{:else}
										<Copy class="size-3.5" />
									{/if}
								</button>
							</span>
						</div>

						<!-- Timeline: 2×2 grid -->
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
							<!-- Compromiso -->
							<div class="rounded-lg border border-brand-gray-200/60 bg-brand-gray-50/30 p-4 flex flex-col gap-2">
								<div class="flex items-center gap-1.5 text-[11px] font-semibold text-brand-gray-400 uppercase tracking-wider">
									<Calendar class="size-3.5" />
									Compromiso
								</div>
								<div class="space-y-1.5">
									<div>
										<span class="text-[11px] text-brand-gray-400 uppercase tracking-wider">Inicio</span>
										<p class="text-sm text-brand-black font-medium">{formatDateTime(process.commitmentStart)}</p>
									</div>
									<div>
										<span class="text-[11px] text-brand-gray-400 uppercase tracking-wider">Fin</span>
										<p class="text-sm text-brand-black font-medium">{formatDateTime(process.commitmentEnd)}</p>
									</div>
								</div>
							</div>

							<!-- Votación -->
							<div class="rounded-lg border border-brand-gray-200/60 bg-brand-gray-50/30 p-4 flex flex-col gap-2">
								<div class="flex items-center gap-1.5 text-[11px] font-semibold text-brand-gray-400 uppercase tracking-wider">
									<Vote class="size-3.5" />
									Votación
								</div>
								<div class="space-y-1.5">
									<div>
										<span class="text-[11px] text-brand-gray-400 uppercase tracking-wider">Inicio</span>
										<p class="text-sm text-brand-black font-medium">{formatDateTime(process.votingStart)}</p>
									</div>
									<div>
										<span class="text-[11px] text-brand-gray-400 uppercase tracking-wider">Fin</span>
										<p class="text-sm text-brand-black font-medium">{formatDateTime(process.votingEnd)}</p>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Teams Card -->
				<Card>
					<CardHeader>
						<CardTitle>Equipos</CardTitle>
					</CardHeader>
					<CardContent>
						{#if teamsError || teams.length === 0}
							<div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
								<Users class="size-10 mb-3 opacity-40" />
								<p class="text-sm font-medium">Sin equipos</p>
							</div>
						{:else}
							<div class="flex flex-col gap-3">
								{#each teams as team (team.id)}
									<button
										class={cn(
											'flex items-center gap-3 p-3 rounded-lg border transition-colors text-left w-full',
											selectedTeam?.id === team.id
												? 'border-brand-red bg-brand-red/5'
												: 'border-brand-gray-200/60 hover:border-brand-gray-300',
											(votingFlow !== 'idle' || hasVoted) && 'opacity-60 cursor-not-allowed'
										)}
										onclick={() => handleTeamClick(team)}
										disabled={votingFlow !== 'idle' || hasVoted}
									>
										<!-- Avatar placeholder (initials circle) -->
										<div class="size-9 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center text-xs font-bold shrink-0">
											{getInitials(team.name)}
										</div>
										<span class="text-sm font-medium text-brand-black flex-1">{team.name}</span>
										{#if selectedTeam?.id === team.id}
											<CheckCircle class="size-5 text-brand-red shrink-0" />
										{/if}
									</button>
								{/each}
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>

			<!-- Right column: Voter Summary -->
			<div class="lg:col-span-1">
				<Card>
					<CardHeader>
						<CardTitle>Resumen de votantes</CardTitle>
					</CardHeader>
					<CardContent>
						{#if enrollmentError}
							<p class="text-sm text-muted-foreground text-center py-4">No disponible</p>
						{:else}
							<div class="grid grid-cols-1 gap-3">
								<!-- Participants -->
								<div class="flex items-center gap-3 p-4 rounded-lg border border-brand-gray-200/60 bg-brand-gray-50/30">
									<Users class="size-5 text-brand-red shrink-0" />
									<div>
										<p class="text-2xl font-bold text-brand-black tabular-nums">
											{enrollmentSummary?.totalParticipants ?? 0}
										</p>
										<p class="text-xs text-brand-gray-400">Participantes</p>
									</div>
								</div>

								<!-- Commitments -->
								<div class="flex items-center gap-3 p-4 rounded-lg border border-brand-gray-200/60 bg-brand-gray-50/30">
									<Clock class="size-5 text-brand-red shrink-0" />
									<div>
										<p class="text-2xl font-bold text-brand-black tabular-nums">
											{enrollmentSummary?.totalCommitments ?? 0}
										</p>
										<p class="text-xs text-brand-gray-400">Compromisos</p>
									</div>
								</div>

								<!-- Voted -->
								<div class="flex items-center gap-3 p-4 rounded-lg border border-brand-gray-200/60 bg-brand-gray-50/30">
									<CheckCircle class="size-5 text-brand-red shrink-0" />
									<div>
										<p class="text-2xl font-bold text-brand-black tabular-nums">
											{enrollmentSummary?.totalVoted ?? 0}
										</p>
										<p class="text-xs text-brand-gray-400">Votaron</p>
									</div>
								</div>
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>
		</div>

		<!-- Action buttons -->
		{#if isCommitmentPhase || isVotingPhase}
			<!-- Hidden form for commitment submission via SvelteKit form action -->
			<form
				bind:this={commitmentForm}
				method="POST"
				action="?/update-commitment"
				class="hidden"
			>
				<input type="hidden" name="commitment" bind:value={pendingCommitment} />
			</form>

			<div class="mt-6 space-y-3">
				{#if isCommitmentPhase}
					{#if hasCommitted}
						<Button
							disabled
							class="w-full"
							variant="default"
						>
							<Shield class="size-4 mr-2" />
							Compromiso enviado
						</Button>
					{:else}
						<Button
							onclick={handleSubmitCommitment}
							disabled={submitting !== 'none'}
							class="w-full"
							variant="default"
						>
							<Send class="size-4 mr-2" />
							Enviar compromiso
						</Button>
					{/if}
				{/if}

				{#if isVotingPhase}
					{#if hasVoted}
						<Button
							disabled
							class="w-full"
							variant="default"
						>
							<Vote class="size-4 mr-2" />
							Ya votaste
						</Button>
					{:else if pendingM2mConfirm}
						<Button
							disabled
							class="w-full"
							variant="default"
						>
							<Loader2 class="size-4 mr-2 animate-spin" />
							Voto enviado — confirmando en blockchain...
						</Button>
					{:else if votingFlow === 'idle'}
						<Button
							onclick={selectedTeam ? openVoteDialog : undefined}
							disabled={!selectedTeam || !process.groupId}
							class="w-full bg-brand-red hover:bg-brand-red/90 text-white"
							variant="default"
						>
							{#if !process.groupId}
								El grupo on-chain no está configurado
							{:else if selectedTeam}
								Votar por {selectedTeam.name}
							{:else}
								Elegí un equipo para votar
							{/if}
						</Button>
					{:else if votingFlow === 'success'}
						<Button
							disabled
							class="w-full"
							variant="default"
						>
							<Vote class="size-4 mr-2" />
							Ya votaste
						</Button>
					{:else}
						<!-- Verifying / building / submitting states -->
						<Button
							disabled
							class="w-full"
							variant="default"
						>
							<Loader2 class="size-4 mr-2 animate-spin" />
							{VOTING_STAGE_MESSAGE[votingFlow]}
						</Button>
					{/if}
				{/if}

				{#if votingFlow === 'error' && actionErrorVote}
					<div class="flex flex-col gap-2">
						<p class="text-xs text-red-600 text-center">{actionErrorVote}</p>
						<Button
							onclick={() => { votingFlow = 'idle'; actionErrorVote = null; }}
							class="w-full"
							variant="outline"
						>
							Reintentar
						</Button>
					</div>
				{/if}

				{#if isCommitmentPhase && submitting !== 'none'}
					<p class="text-xs text-brand-gray-400 text-center">
						Escaneá el QR que aparece en pantalla con tu móvil
					</p>
				{/if}

				{#if actionError}
					<p class="text-xs text-red-600 text-center">{actionError}</p>
				{/if}
			</div>
		{/if}
	</div>
</section>

<!-- Vote Confirmation Dialog -->
<Dialog bind:open={showVoteDialog}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Confirmar voto</DialogTitle>
			<DialogDescription>
				¿Confirmás tu voto por <strong>{selectedTeam?.name}</strong>? Esta acción es irreversible.
			</DialogDescription>
		</DialogHeader>
		<DialogFooter>
			<DialogClose>
				<Button variant="outline" onclick={closeVoteDialog}>Cancelar</Button>
			</DialogClose>
			<Button variant="destructive" onclick={confirmVote}>Confirmar voto</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
