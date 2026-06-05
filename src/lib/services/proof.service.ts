import { env } from '$env/dynamic/public';
import type { VotingProofInput, VotingFullProof, ProofSubmissionResult, ProofError } from '$lib/types/proof';

/**
 * Build a zk-SNARK voting proof for the Semaphore Relayer.
 *
 * Commitments must be pre-loaded server-side and passed in. The browser never
 * calls the private backend directly (it's not reachable from the public CDN).
 *
 * This function dynamically imports @semaphore-protocol/group and @semaphore-protocol/proof
 * to avoid loading WASM/snarkjs in the initial bundle.
 *
 * @throws {ProofError} When proof generation fails
 */
export async function buildVotingProof(input: VotingProofInput): Promise<VotingFullProof> {
	const { identity, processId, teamName, commitments } = input;

	// Convert string commitments to bigint for Group constructor
	const members = commitments.map((c) => BigInt(c));

	// Dynamic imports to avoid loading WASM in initial bundle
	let Group: typeof import('@semaphore-protocol/group')['Group'];
	let generateProof: typeof import('@semaphore-protocol/proof')['generateProof'];

	try {
		({ Group } = await import('@semaphore-protocol/group'));
		({ generateProof } = await import('@semaphore-protocol/proof'));
	} catch {
		throw {
			kind: 'snark-download',
			message: 'Error al descargar la librería de pruebas ZK'
		} satisfies ProofError;
	}

	// Build Merkle tree from commitments
	const group = new Group(members);

	// Generate zk-SNARK proof
	// message = teamName (what the user votes for)
	// scope = processId (external nullifier to prevent double voting)
	let fullProof: VotingFullProof;

	try {
		fullProof = await generateProof(identity, group, teamName, processId);
	} catch {
		throw {
			kind: 'merkle-failed',
			message: 'Error al generar la prueba ZK'
		} satisfies ProofError;
	}

	return fullProof;
}

/**
 * Submit a zk-SNARK proof to the Semaphore Relayer for on-chain validation.
 *
 * @throws {ProofError} When submission fails
 */
export async function submitVotingProof(input: {
	groupId: string;
	proof: VotingFullProof;
}): Promise<ProofSubmissionResult> {
	const { groupId, proof } = input;
	const relayerUrl = env.PUBLIC_RELAYER_API_URL;

	if (!relayerUrl) {
		throw new Error('PUBLIC_RELAYER_API_URL is not configured');
	}

	const response = await fetch(`${relayerUrl}/api/semaphore/proofs/validate`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			groupId,
			proof: {
				merkleTreeDepth: proof.merkleTreeDepth,
				merkleTreeRoot: proof.merkleTreeRoot,
				nullifier: proof.nullifier,
				message: proof.message,
				scope: proof.scope,
				points: proof.points
			}
		})
	});

	if (response.ok) {
		return await response.json();
	}

	// Handle error responses
	const errorBody = await response.json().catch(() => ({}));

	if (response.status >= 500) {
		throw {
			kind: 'relayer-5xx',
			message: `Relayer error: ${response.status}`
		};
	}

	if (response.status === 400) {
		throw {
			kind: 'validation',
			message: errorBody.message || 'Validation error'
		};
	}

	// 4xx (including 409 conflict for nullifier already used)
	throw {
		kind: 'relayer-4xx',
		message: errorBody.message || `Relayer error: ${response.status}`
	};
}
