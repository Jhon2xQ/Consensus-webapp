import { describe, it, expect } from 'vitest';
import { Identity } from '@semaphore-protocol/core';
import type { SemaphoreIdentityResult } from './semaphore';

describe('semaphore types', () => {
	it('SemaphoreIdentityResult has commitment string property', () => {
		const identity = new Identity();
		const result: SemaphoreIdentityResult = {
			identity,
			commitment: identity.commitment.toString()
		};
		expect(result.commitment).toBe(identity.commitment.toString());
	});

	it('SemaphoreIdentityResult accepts hex-encoded commitment', () => {
		const identity = new Identity();
		const result: SemaphoreIdentityResult = {
			identity,
			commitment: '0x1a2b3c4d5e6f'
		};
		expect(result.commitment).toBe('0x1a2b3c4d5e6f');
	});

	it('SemaphoreIdentityResult works with large numeric string commitment', () => {
		const largeCommitment =
			'21888242871839275222246405745257275088548364400416034343698204186575808495617';
		const identity = new Identity();
		const result: SemaphoreIdentityResult = { identity, commitment: largeCommitment };
		expect(result.commitment).toBe(largeCommitment);
		expect(result.commitment.length).toBeGreaterThan(50);
	});

	it('SemaphoreIdentityResult has identity field that is an Identity instance', () => {
		const identity = new Identity();
		const result: SemaphoreIdentityResult = {
			identity,
			commitment: identity.commitment.toString()
		};
		expect(result.identity).toBeInstanceOf(Identity);
		expect(result.identity.commitment).toBe(identity.commitment);
	});
});
