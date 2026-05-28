import { describe, it, expect } from 'vitest';
import { generateChallenge, extractRpId } from './webauthn';

describe('generateChallenge', () => {
	it('returns a non-empty string', () => {
		const challenge = generateChallenge();
		expect(challenge.length).toBeGreaterThan(0);
	});

	it('returns a base64url-safe string (no +, /, or =)', () => {
		const challenge = generateChallenge();
		expect(challenge).not.toContain('+');
		expect(challenge).not.toContain('/');
		expect(challenge).not.toContain('=');
	});

	it('generates unique challenges on each call', () => {
		const c1 = generateChallenge();
		const c2 = generateChallenge();
		expect(c1).not.toBe(c2);
	});

	it('returns approximately 43 characters (32 bytes base64url)', () => {
		const challenge = generateChallenge();
		expect(challenge.length).toBeGreaterThanOrEqual(42);
		expect(challenge.length).toBeLessThanOrEqual(44);
	});
});

describe('extractRpId', () => {
	it('returns the host as-is when no port', () => {
		expect(extractRpId('localhost')).toBe('localhost');
		expect(extractRpId('consensus.carmenio.com')).toBe('consensus.carmenio.com');
	});

	it('strips port from host', () => {
		expect(extractRpId('localhost:5173')).toBe('localhost');
		expect(extractRpId('consensus.carmenio.com:443')).toBe('consensus.carmenio.com');
	});

	it('defaults to "localhost" when host is null', () => {
		expect(extractRpId(null)).toBe('localhost');
	});
});
