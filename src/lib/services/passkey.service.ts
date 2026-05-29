import {
	startRegistration,
	startAuthentication,
	browserSupportsWebAuthn
} from '@simplewebauthn/browser';
import { generateChallenge } from '$lib/utils/webauthn';
import type { PasskeyResult, RegisterOptions, AuthOptions } from '$lib/types/passkey';

/**
 * Check whether the current browser supports WebAuthn.
 */
export function supportsPasskeys(): boolean {
	return browserSupportsWebAuthn();
}

/**
 * Register a new passkey: generate challenge client-side, trigger WebAuthn ceremony,
 * return the credentialId.
 *
 * @throws {Error} When WebAuthn ceremony is cancelled or fails.
 */
export async function registerPasskey(
	userId: string,
	userName: string
): Promise<PasskeyResult> {
	const challenge = generateChallenge();
	const rpId = window.location.hostname;

	const options: RegisterOptions = {
		challenge,
		rp: { name: 'Consensus', id: rpId },
		user: { id: userId, name: 'CONSENSUS', displayName: 'CONSENSUS' },
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

	const registration = await startRegistration({ optionsJSON: options });

	return { credentialId: registration.id };
}

/**
 * Verify an existing passkey: generate challenge client-side, trigger WebAuthn ceremony,
 * return the matching credentialId.
 *
 * @throws {Error} When WebAuthn ceremony is cancelled or fails.
 */
export async function verifyPasskey(): Promise<PasskeyResult> {
	const challenge = generateChallenge();
	const rpId = window.location.hostname;

	const options: AuthOptions = {
		challenge,
		timeout: 60000,
		userVerification: 'preferred',
		rpId
	};

	const authentication = await startAuthentication({ optionsJSON: options });

	return { credentialId: authentication.id };
}
