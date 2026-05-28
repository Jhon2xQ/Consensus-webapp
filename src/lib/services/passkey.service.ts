import {
	startRegistration,
	startAuthentication,
	browserSupportsWebAuthn
} from '@simplewebauthn/browser';
import type {
	PasskeyResult,
	RegisterOptionsResponse,
	AuthOptionsResponse
} from '$lib/types/passkey';

/**
 * Check whether the current browser supports WebAuthn.
 */
export function supportsPasskeys(): boolean {
	return browserSupportsWebAuthn();
}

/**
 * Register a new passkey: fetch challenge from API, trigger WebAuthn ceremony,
 * return the credentialId.
 *
 * @throws {Error} When API request fails or WebAuthn ceremony is cancelled/fails.
 */
export async function registerPasskey(
	userId: string,
	userName: string
): Promise<PasskeyResult> {
	const response = await fetch('/api/passkey/register-options', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ userId, userName })
	});

	if (!response.ok) {
		throw new Error(`Failed to register passkey: ${response.status}`);
	}

	const options: RegisterOptionsResponse = await response.json();
	const registration = await startRegistration({ optionsJSON: options });

	return { credentialId: registration.id };
}

/**
 * Verify an existing passkey: fetch challenge from API, trigger WebAuthn ceremony,
 * return the matching credentialId.
 *
 * @throws {Error} When API request fails or WebAuthn ceremony is cancelled/fails.
 */
export async function verifyPasskey(): Promise<PasskeyResult> {
	const response = await fetch('/api/passkey/auth-options', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' }
	});

	if (!response.ok) {
		throw new Error(`Failed to verify passkey: ${response.status}`);
	}

	const options: AuthOptionsResponse = await response.json();
	const authentication = await startAuthentication({ optionsJSON: options });

	return { credentialId: authentication.id };
}
