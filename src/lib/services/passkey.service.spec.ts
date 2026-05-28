import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { supportsPasskeys, registerPasskey, verifyPasskey } from './passkey.service';

// ── Mocks ──
const { mockStartRegistration, mockStartAuthentication, mockBrowserSupportsWebAuthn } = vi.hoisted(() => ({
	mockStartRegistration: vi.fn(),
	mockStartAuthentication: vi.fn(),
	mockBrowserSupportsWebAuthn: vi.fn()
}));

vi.mock('@simplewebauthn/browser', () => ({
	startRegistration: mockStartRegistration,
	startAuthentication: mockStartAuthentication,
	browserSupportsWebAuthn: mockBrowserSupportsWebAuthn
}));

describe('supportsPasskeys', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

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
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it('calls API and starts registration, returns credentialId', async () => {
		const mockResponse = {
			challenge: 'test-challenge',
			rp: { name: 'Consensus', id: 'localhost' },
			user: { id: 'user-1', name: 'test@example.com', displayName: 'Test User' },
			pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
			timeout: 60000,
			attestation: 'none',
			authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' }
		};

		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockResponse)
		});

		mockStartRegistration.mockResolvedValue({ id: 'cred-abc-123' });

		const result = await registerPasskey('user-1', 'test@example.com');

		expect(globalThis.fetch).toHaveBeenCalledWith('/api/passkey/register-options', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId: 'user-1', userName: 'test@example.com' })
		});

		expect(mockStartRegistration).toHaveBeenCalledWith({ optionsJSON: mockResponse });
		expect(result).toEqual({ credentialId: 'cred-abc-123' });
	});

	it('throws when API response is not ok', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
			json: () => Promise.resolve({ error: 'Internal Server Error' })
		});

		await expect(registerPasskey('user-1', 'test@example.com')).rejects.toThrow(
			/Failed to register passkey/
		);
	});

	it('throws when network request fails', async () => {
		globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

		await expect(registerPasskey('user-1', 'test@example.com')).rejects.toThrow(
			/Network error/
		);
	});

	it('throws when startRegistration rejects (user cancelled)', async () => {
		const mockResponse = {
			challenge: 'test-challenge',
			rp: { name: 'Consensus', id: 'localhost' },
			user: { id: 'user-1', name: 'test@example.com', displayName: 'Test User' },
			pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
			timeout: 60000,
			attestation: 'none',
			authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' }
		};

		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockResponse)
		});

		mockStartRegistration.mockRejectedValue(new Error('The ceremony was cancelled'));

		await expect(registerPasskey('user-1', 'test@example.com')).rejects.toThrow(
			/The ceremony was cancelled/
		);
	});
});

describe('verifyPasskey', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it('calls API and starts authentication, returns credentialId', async () => {
		const mockResponse = {
			challenge: 'test-challenge',
			timeout: 60000,
			userVerification: 'preferred',
			rpId: 'localhost'
		};

		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockResponse)
		});

		mockStartAuthentication.mockResolvedValue({ id: 'cred-xyz-789' });

		const result = await verifyPasskey();

		expect(globalThis.fetch).toHaveBeenCalledWith('/api/passkey/auth-options', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' }
		});

		expect(mockStartAuthentication).toHaveBeenCalledWith({ optionsJSON: mockResponse });
		expect(result).toEqual({ credentialId: 'cred-xyz-789' });
	});

	it('throws when API response is not ok', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 403,
			json: () => Promise.resolve({ error: 'Forbidden' })
		});

		await expect(verifyPasskey()).rejects.toThrow(/Failed to verify passkey/);
	});

	it('throws when network request fails', async () => {
		globalThis.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

		await expect(verifyPasskey()).rejects.toThrow(/Failed to fetch/);
	});

	it('throws when startAuthentication rejects (user cancelled)', async () => {
		const mockResponse = {
			challenge: 'test-challenge',
			timeout: 60000,
			userVerification: 'preferred',
			rpId: 'localhost'
		};

		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockResponse)
		});

		mockStartAuthentication.mockRejectedValue(new Error('The ceremony was cancelled'));

		await expect(verifyPasskey()).rejects.toThrow(/The ceremony was cancelled/);
	});
});
