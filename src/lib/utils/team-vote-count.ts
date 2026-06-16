/**
 * Deterministic mock vote-count generator.
 *
 * Returns the same integer in [0, 500] for the same `id` on every call,
 * across processes, sessions, and reloads. Used as a placeholder for the
 * real vote-count API until it lands. MOCK — replace with API data when
 * available.
 *
 * Pure: no I/O, no side effects, no Date/Math.random.
 */
export function deterministicVoteCount(id: string): number {
	let hash = 0;
	for (let i = 0; i < id.length; i++) {
		hash = (hash * 31 + id.charCodeAt(i)) | 0;
	}
	return Math.abs(hash) % 501;
}
