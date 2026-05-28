import { describe, it, expect } from 'vitest';
import { deriveIdentity } from './semaphore.service';

describe('deriveIdentity', () => {
	it('returns a commitment string', async () => {
		const result = await deriveIdentity('user-1', 'cred-1', 'process-1');
		expect(typeof result.commitment).toBe('string');
		expect(result.commitment.length).toBeGreaterThan(0);
	});

	it('same inputs always produce the same commitment (deterministic)', async () => {
		const r1 = await deriveIdentity('user-1', 'cred-1', 'process-1');
		const r2 = await deriveIdentity('user-1', 'cred-1', 'process-1');
		const r3 = await deriveIdentity('user-1', 'cred-1', 'process-1');

		expect(r1.commitment).toBe(r2.commitment);
		expect(r2.commitment).toBe(r3.commitment);
	});

	it('different userId produces different commitment', async () => {
		const r1 = await deriveIdentity('user-1', 'cred-1', 'process-1');
		const r2 = await deriveIdentity('user-2', 'cred-1', 'process-1');

		expect(r1.commitment).not.toBe(r2.commitment);
	});

	it('different credentialId produces different commitment', async () => {
		const r1 = await deriveIdentity('user-1', 'cred-1', 'process-1');
		const r2 = await deriveIdentity('user-1', 'cred-2', 'process-1');

		expect(r1.commitment).not.toBe(r2.commitment);
	});

	it('different processId produces different commitment', async () => {
		const r1 = await deriveIdentity('user-1', 'cred-1', 'process-1');
		const r2 = await deriveIdentity('user-1', 'cred-1', 'process-2');

		expect(r1.commitment).not.toBe(r2.commitment);
	});

	it('throws when credentialId is empty', async () => {
		await expect(deriveIdentity('user-1', '', 'process-1')).rejects.toThrow(
			/credentialId required/
		);
	});

	it('commitment is a valid decimal string (big integer)', async () => {
		const result = await deriveIdentity('user-1', 'cred-1', 'process-1');
		// Should be parseable as a BigInt
		expect(() => BigInt(result.commitment)).not.toThrow();
		// Should be positive
		expect(BigInt(result.commitment)).toBeGreaterThan(0n);
	});

	it('commitment is less than the BN254 field prime', async () => {
		const FIELD_PRIME = BigInt(
			'21888242871839275222246405745257275088548364400416034343698204186575808495617'
		);
		const result = await deriveIdentity('user-1', 'cred-1', 'process-1');
		expect(BigInt(result.commitment)).toBeLessThan(FIELD_PRIME);
	});

	it('does not return trapdoor or nullifier', async () => {
		const result = await deriveIdentity('user-1', 'cred-1', 'process-1');
		expect(result).not.toHaveProperty('trapdoor');
		expect(result).not.toHaveProperty('nullifier');
		expect(Object.keys(result)).toEqual(['commitment']);
	});

	it('works with realistic-looking IDs', async () => {
		const result = await deriveIdentity(
			'usr_a1b2c3d4e5f6',
			'cred_xK9mN2pQ',
			'proc_2024_presidential'
		);
		expect(typeof result.commitment).toBe('string');
		expect(BigInt(result.commitment)).toBeGreaterThan(0n);
	});
});
