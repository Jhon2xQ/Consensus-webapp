import { describe, it, expect } from 'vitest';
import type { SemaphoreIdentityResult } from './semaphore';

describe('semaphore types', () => {
	it('SemaphoreIdentityResult has commitment string property', () => {
		const result: SemaphoreIdentityResult = {
			commitment: '12345678901234567890'
		};
		expect(result.commitment).toBe('12345678901234567890');
	});

	it('SemaphoreIdentityResult accepts hex-encoded commitment', () => {
		const result: SemaphoreIdentityResult = {
			commitment: '0x1a2b3c4d5e6f'
		};
		expect(result.commitment).toBe('0x1a2b3c4d5e6f');
	});

	it('SemaphoreIdentityResult works with large numeric string commitment', () => {
		const largeCommitment =
			'21888242871839275222246405745257275088548364400416034343698204186575808495617';
		const result: SemaphoreIdentityResult = { commitment: largeCommitment };
		expect(result.commitment).toBe(largeCommitment);
		expect(result.commitment.length).toBeGreaterThan(50);
	});
});
