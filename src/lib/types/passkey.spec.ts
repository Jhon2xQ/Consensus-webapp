import { describe, it, expect } from 'vitest';
import type {
	PasskeyResult,
	RegisterOptionsResponse,
	AuthOptionsResponse
} from './passkey';

describe('passkey types', () => {
	it('PasskeyResult has credentialId string property', () => {
		const result: PasskeyResult = { credentialId: 'abc-123' };
		expect(result.credentialId).toBe('abc-123');
	});

	it('RegisterOptionsResponse contains all required WebAuthn fields', () => {
		const response: RegisterOptionsResponse = {
			challenge: 'dGVzdC1jaGFsbGVuZ2U',
			rp: { name: 'Consensus', id: 'localhost' },
			user: { id: 'user-1', name: 'alice@example.com', displayName: 'Alice' },
			pubKeyCredParams: [
				{ type: 'public-key', alg: -7 },
				{ type: 'public-key', alg: -257 }
			],
			timeout: 60000,
			attestation: 'none',
			authenticatorSelection: {
				residentKey: 'preferred',
				userVerification: 'preferred'
			}
		};

		expect(response.rp.name).toBe('Consensus');
		expect(response.user.id).toBe('user-1');
		expect(response.pubKeyCredParams).toHaveLength(2);
		expect(response.timeout).toBe(60000);
		expect(response.authenticatorSelection.residentKey).toBe('preferred');
	});

	it('AuthOptionsResponse contains challenge and rpId', () => {
		const response: AuthOptionsResponse = {
			challenge: 'dGVzdC1hdXRoLWNoYWxsZW5nZQ',
			timeout: 60000,
			userVerification: 'preferred',
			rpId: 'localhost'
		};

		expect(response.challenge).toBe('dGVzdC1hdXRoLWNoYWxsZW5nZQ');
		expect(response.rpId).toBe('localhost');
		expect(response.timeout).toBe(60000);
	});

	it('RegisterOptionsResponse works with different rp.id (production domain)', () => {
		const response: RegisterOptionsResponse = {
			challenge: 'abc123',
			rp: { name: 'Consensus', id: 'consensus.carmenio.com' },
			user: { id: 'u-99', name: 'bob@test.com', displayName: 'Bob' },
			pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
			timeout: 120000,
			attestation: 'direct',
			authenticatorSelection: {
				residentKey: 'required',
				userVerification: 'required'
			}
		};

		expect(response.rp.id).toBe('consensus.carmenio.com');
		expect(response.attestation).toBe('direct');
		expect(response.authenticatorSelection.userVerification).toBe('required');
	});

	it('RegisterOptionsResponse handles empty pubKeyCredParams', () => {
		const response: RegisterOptionsResponse = {
			challenge: 'xyz',
			rp: { name: 'Test', id: 'test.com' },
			user: { id: '1', name: 'a@b.com', displayName: 'A' },
			pubKeyCredParams: [],
			timeout: 30000,
			attestation: 'none',
			authenticatorSelection: {
				residentKey: 'discouraged',
				userVerification: 'discouraged'
			}
		};

		expect(response.pubKeyCredParams).toHaveLength(0);
	});

	it('AuthOptionsResponse works with production rpId', () => {
		const response: AuthOptionsResponse = {
			challenge: 'prod-challenge-value',
			timeout: 120000,
			userVerification: 'required',
			rpId: 'consensus.carmenio.com'
		};

		expect(response.rpId).toBe('consensus.carmenio.com');
		expect(response.userVerification).toBe('required');
	});
});
