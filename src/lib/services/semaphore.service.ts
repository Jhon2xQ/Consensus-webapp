import { Identity } from '@semaphore-protocol/core';
import type { SemaphoreIdentityResult } from '$lib/types/semaphore';

/**
 * Derive a deterministic Semaphore identity from userId + credentialId + processId.
 *
 * Same inputs always produce the same commitment. The trapdoor and nullifier
 * remain in browser memory only — only the commitment (public hash) is returned.
 *
 * @throws {Error} When credentialId is empty or undefined.
 */
export async function deriveIdentity(
	userId: string,
	credentialId: string,
	processId: string
): Promise<SemaphoreIdentityResult> {
	if (!credentialId) {
		throw new Error('credentialId required for identity derivation');
	}

	// Seed = SHA-256(userId:credentialId:processId)
	const seedString = `${userId}:${credentialId}:${processId}`;
	const encoder = new TextEncoder();
	const seedHash = await crypto.subtle.digest('SHA-256', encoder.encode(seedString));
	const seedHex = Array.from(new Uint8Array(seedHash))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');

	// Create Identity from the seed hex — Semaphore's Identity class
	// derives trapdoor, nullifier, publicKey, and commitment from the private key.
	const identity = new Identity(seedHex);

	// Only return the commitment (public hash) — trapdoor and nullifier stay private
	return { commitment: identity.commitment.toString() };
}
