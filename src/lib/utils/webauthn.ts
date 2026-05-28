/**
 * Generates a WebAuthn-safe base64url challenge string from 32 random bytes.
 */
export function generateChallenge(): string {
	const bytes = new Uint8Array(32);
	globalThis.crypto.getRandomValues(bytes);
	return btoa(String.fromCharCode(...bytes))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

/**
 * Extracts the rpId from a host header, stripping port if present.
 */
export function extractRpId(host: string | null): string {
	const h = host ?? 'localhost';
	return h.includes(':') ? h.split(':')[0] : h;
}
