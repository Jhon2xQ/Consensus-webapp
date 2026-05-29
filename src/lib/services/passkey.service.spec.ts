import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supportsPasskeys, registerPasskey, verifyPasskey } from './passkey.service';

// ── Mocks ──
const {
	mockStartRegistration,
	mockStartAuthentication,
	mockBrowserSupportsWebAuthn,
	mockGenerateChallenge
} = vi.hoisted(() => ({
	mockStartRegistration: vi.fn(),
	mockStartAuthentication: vi.fn(),
	mockBrowserSupportsWebAuthn: vi.fn(),
	mockGenerateChallenge: vi.fn()
}));

vi.mock('@simplewebauthn/browser', () => ({
	startRegistration: mockStartRegistration,
	startAuthentication: mockStartAuthentication,
	browserSupportsWebAuthn: mockBrowserSupportsWebAuthn
}));

vi.mock('$lib/utils/webauthn', () => ({
	generateChallenge: mockGenerateChallenge
}));

// ── Window mock ──
beforeEach(() => {
	vi.clearAllMocks();
	Object.defineProperty(globalThis, 'window', {
		value: { location: { hostname: 'localhost' } },
		writable: true,
		configurable: true
	});
});

describe('supportsPasskeys', () => {
	it('returns true when browser supports WebAuthn', () => {
		mockBrowserSupportsWebAuthn.mockReturnValue(true);
		expect(supportsPasskeys()).toBe(true);
	});

	it('returns false when browser does not support WebAuthn', () => {
		mockBrowserSupportsWebAuthn.mockReturnValue(false);
		expect(supportsPasskeys()).toBe(false);
	});

	it('delegates to browserSupportsWebAuthn', () => {
		mockBrowserSupportsWebAuthn.mockReturnValue(true);
		supportsPasskeys();
		expect(mockBrowserSupportsWebAuthn).toHaveBeenCalledTimes(1);
	});
});

describe('registerPasskey', () => {
	it('generates challenge client-side and starts registration with correct options', async () => {
		mockGenerateChallenge.mockReturnValue('test-challenge');
		mockStartRegistration.mockResolvedValue({ id: 'cred-abc-123' });

		const result = await registerPasskey('user-1', 'test@example.com');

		expect(mockGenerateChallenge).toHaveBeenCalledTimes(1);
		expect(mockStartRegistration).toHaveBeenCalledWith({
			optionsJSON: {
				challenge: 'test-challenge',
				rp: { name: 'Consensus', id: 'localhost' },
				user: { id: 'user-1', name: 'CONSENSUS', displayName: 'CONSENSUS' },
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
			}
		});
		expect(result).toEqual({ credentialId: 'cred-abc-123' });
	});

	it('uses window.location.hostname for rpId', async () => {
		Object.defineProperty(globalThis, 'window', {
			value: { location: { hostname: 'consensus.carmenio.com' } },
			writable: true,
			configurable: true
		});
		mockGenerateChallenge.mockReturnValue('prod-challenge');
		mockStartRegistration.mockResolvedValue({ id: 'cred-prod' });

		await registerPasskey('user-2', 'bob@test.com');

		const callArgs = mockStartRegistration.mock.calls[0][0];
		expect(callArgs.optionsJSON.rp.id).toBe('consensus.carmenio.com');
	});

	it('throws when startRegistration rejects (user cancelled)', async () => {
		mockGenerateChallenge.mockReturnValue('test-challenge');
		mockStartRegistration.mockRejectedValue(new Error('The ceremony was cancelled'));

		await expect(registerPasskey('user-1', 'test@example.com')).rejects.toThrow(
			/The ceremony was cancelled/
		);
	});
});

describe('verifyPasskey', () => {
	it('generates challenge client-side and starts authentication with correct options', async () => {
		mockGenerateChallenge.mockReturnValue('auth-challenge');
		mockStartAuthentication.mockResolvedValue({ id: 'cred-xyz-789' });

		const result = await verifyPasskey();

		expect(mockGenerateChallenge).toHaveBeenCalledTimes(1);
		expect(mockStartAuthentication).toHaveBeenCalledWith({
			optionsJSON: {
				challenge: 'auth-challenge',
				timeout: 60000,
				userVerification: 'preferred',
				rpId: 'localhost'
			}
		});
		expect(result).toEqual({ credentialId: 'cred-xyz-789' });
	});

	it('uses window.location.hostname for rpId', async () => {
		Object.defineProperty(globalThis, 'window', {
			value: { location: { hostname: 'myapp.example.com' } },
			writable: true,
			configurable: true
		});
		mockGenerateChallenge.mockReturnValue('auth-challenge');
		mockStartAuthentication.mockResolvedValue({ id: 'cred-prod' });

		await verifyPasskey();

		const callArgs = mockStartAuthentication.mock.calls[0][0];
		expect(callArgs.optionsJSON.rpId).toBe('myapp.example.com');
	});

	it('throws when startAuthentication rejects (user cancelled)', async () => {
		mockGenerateChallenge.mockReturnValue('auth-challenge');
		mockStartAuthentication.mockRejectedValue(new Error('The ceremony was cancelled'));

		await expect(verifyPasskey()).rejects.toThrow(/The ceremony was cancelled/);
	});
});
