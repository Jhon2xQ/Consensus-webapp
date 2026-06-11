import { env } from '$env/dynamic/public';
import type { VotingProofInput, VotingFullProof, ProofError } from '$lib/types/proof';

/**
 * Hash a string via SHA-256 and return a BigInt suitable for Semaphore circuits.
 *
 * Both message and scope are capped at 31 chars by Semaphore's internal
 * encodeBytes32String. Rather than rely on that encoding (and deal with
 * length-specific conditionals), we always hash via Web Crypto and convert
 * to BigInt. This gives a uniform 256-bit output regardless of input length.
 */
async function toSemaphoreBigInt(value: string): Promise<bigint> {
	const data = new TextEncoder().encode(value);
	const hash = await crypto.subtle.digest('SHA-256', data);
	const hex = Array.from(new Uint8Array(hash))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
	return BigInt('0x' + hex);
}

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

	// Pre-check: identity must be in the Merkle tree, otherwise the proof
	// generation will fail with an opaque error upstream.
	const userCommitment = identity.commitment.toString();
	if (!commitments.includes(userCommitment)) {
		console.error(
			'[ProofService] identity NOT in commitments array.',
			'userCommitment:', userCommitment,
			'commitments:', commitments
		);
		throw {
			kind: 'identity-not-in-group',
			message: 'Tu compromiso no se encuentra en el árbol de votantes. Verificá que hayas enviado tu compromiso desde este dispositivo.'
		} satisfies ProofError;
	}

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
	// message = SHA-256(teamName) → what the user votes for
	// scope = SHA-256(processId) → external nullifier to prevent double voting
	//
	// Always hashing via SHA-256 (instead of conditionally encoding to bytes32)
	// avoids Semaphore's 31-char encodeBytes32String limit entirely. Both values
	// become uniform 256-bit BigInts regardless of input length.
	const [message, scope] = await Promise.all([
		toSemaphoreBigInt(teamName),
		toSemaphoreBigInt(processId)
	]);

	let fullProof: VotingFullProof;

	try {
		fullProof = await generateProof(identity, group, message, scope);
	} catch (err) {
		console.error('[ProofService] generateProof failed:', err);
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
 * The relayer always returns `{ success, ... }` in the body regardless of the
 * HTTP status code. This function returns that body when available.
 *
 * - `success: true` — first-time submission, proof published to chain
 * - `success: false` — proof was already on-chain (nullifier used)
 *
 * Only throws on network errors, missing config, or unparseable 5xx responses.
 */
export async function submitVotingProof(input: {
	groupId: string;
	proof: VotingFullProof;
}): Promise<{ success: boolean; message?: string; data?: { transaction: { hash: string } } }> {
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

	// Try to parse the body — the relayer sends { success, ... } consistently
	// across all status codes (200, 400, 409, etc.).
	const body = await response.json().catch(() => null);

	if (body && typeof body.success === 'boolean') {
		return body;
	}

	// 5xx without a parseable body — relayer is down.
	throw {
		kind: 'relayer-5xx',
		message: `Relayer error: ${response.status}`
	};
}
