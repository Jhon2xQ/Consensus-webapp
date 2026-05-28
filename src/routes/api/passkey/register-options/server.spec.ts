import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './+server.js';

function createRequestEvent(body: unknown, host = 'localhost') {
	const request = new Request('http://localhost/api/passkey/register-options', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', host },
		body: JSON.stringify(body)
	});

	return {
		request,
		url: new URL('http://localhost/api/passkey/register-options'),
		params: {},
		locals: {}
	} as any;
}

describe('POST /api/passkey/register-options', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns 200 with valid WebAuthn PublicKeyCredentialCreationOptions', async () => {
		const response = await POST(
			createRequestEvent({ userId: 'user-1', userName: 'alice@example.com' })
		);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toHaveProperty('challenge');
		expect(typeof data.challenge).toBe('string');
		expect(data.challenge.length).toBeGreaterThan(0);
	});

	it('returns rp with name "Consensus" and id from host header', async () => {
		const response = await POST(
			createRequestEvent(
				{ userId: 'user-1', userName: 'alice@example.com' },
				'consensus.carmenio.com'
			)
		);
		const data = await response.json();

		expect(data.rp.name).toBe('Consensus');
		expect(data.rp.id).toBe('consensus.carmenio.com');
	});

	it('falls back to "localhost" when host header is missing', async () => {
		const response = await POST(
			createRequestEvent({ userId: 'user-1', userName: 'alice@example.com' })
		);
		const data = await response.json();

		expect(data.rp.id).toBe('localhost');
	});

	it('includes user id, name, and displayName', async () => {
		const response = await POST(
			createRequestEvent({ userId: 'u-42', userName: 'bob@test.com' })
		);
		const data = await response.json();

		expect(data.user.id).toBe('u-42');
		expect(data.user.name).toBe('bob@test.com');
		expect(data.user.displayName).toBe('bob@test.com');
	});

	it('returns pubKeyCredParams with ES256 and RS256 algorithms', async () => {
		const response = await POST(
			createRequestEvent({ userId: 'user-1', userName: 'alice@example.com' })
		);
		const data = await response.json();

		expect(data.pubKeyCredParams).toEqual([
			{ type: 'public-key', alg: -7 },
			{ type: 'public-key', alg: -257 }
		]);
	});

	it('returns attestation "none" and authenticatorSelection', async () => {
		const response = await POST(
			createRequestEvent({ userId: 'user-1', userName: 'alice@example.com' })
		);
		const data = await response.json();

		expect(data.attestation).toBe('none');
		expect(data.authenticatorSelection).toEqual({
			residentKey: 'preferred',
			userVerification: 'preferred'
		});
	});

	it('returns 400 when body is missing userId', async () => {
		const response = await POST(createRequestEvent({ userName: 'alice@example.com' }));

		expect(response.status).toBe(400);
	});

	it('returns 400 when body is missing userName', async () => {
		const response = await POST(createRequestEvent({ userId: 'user-1' }));

		expect(response.status).toBe(400);
	});

	it('generates a unique challenge on each request', async () => {
		const res1 = await POST(
			createRequestEvent({ userId: 'user-1', userName: 'alice@example.com' })
		);
		const res2 = await POST(
			createRequestEvent({ userId: 'user-1', userName: 'alice@example.com' })
		);
		const data1 = await res1.json();
		const data2 = await res2.json();

		expect(data1.challenge).not.toBe(data2.challenge);
	});
});
