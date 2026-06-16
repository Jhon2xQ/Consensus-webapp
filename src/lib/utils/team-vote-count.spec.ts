import { describe, expect, it } from 'vitest';
import { deterministicVoteCount } from './team-vote-count';

describe('deterministicVoteCount', () => {
	it('returns the same number when called repeatedly with the same id', () => {
		const id = 'team-alpha';
		const first = deterministicVoteCount(id);
		const second = deterministicVoteCount(id);
		const third = deterministicVoteCount(id);
		expect(second).toBe(first);
		expect(third).toBe(first);
	});

	it('returns an integer in the [0, 500] range for a typical id', () => {
		const result = deterministicVoteCount('team-42');
		expect(Number.isInteger(result)).toBe(true);
		expect(result).toBeGreaterThanOrEqual(0);
		expect(result).toBeLessThanOrEqual(500);
	});

	it('returns the pinned value for the id "team-1"', () => {
		// Pinned input #1 — locks in the hash function. If the algorithm
		// changes, this test breaks immediately.
		expect(deterministicVoteCount('team-1')).toBe(315);
	});

	it('returns the pinned value for the id "team-2"', () => {
		// Pinned input #2 — triangulates with a different string so a
		// constant-return implementation cannot satisfy both cases.
		expect(deterministicVoteCount('team-2')).toBe(314);
	});

	it('returns values in [0, 500] for a sweep of distinct ids (range invariant)', () => {
		// Triangulation: ensure the range invariant holds across many inputs,
		// not just the pinned ones. This guards against an off-by-one in the
		// modulo or a sign issue in the hash that the pinned cases might miss.
		for (let i = 0; i < 50; i++) {
			const result = deterministicVoteCount(`sweep-${i}`);
			expect(Number.isInteger(result)).toBe(true);
			expect(result).toBeGreaterThanOrEqual(0);
			expect(result).toBeLessThanOrEqual(500);
		}
	});

	it('is pure — same id always produces the same value across separate calls', () => {
		// Direct check of the determinism contract: call the function in two
		// independent contexts and assert equality. This is the spec scenario
		// "Deterministic mock" from spec.md §3.
		const a = deterministicVoteCount('team-1');
		const b = deterministicVoteCount('team-1');
		expect(a).toBe(b);
	});
});
