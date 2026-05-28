import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './+server.js';

function createRequestEvent(body: unknown = {}, host = 'localhost') {
	const request = new Request('http://localhost/api/passkey/auth-options', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', host },
		body: JSON.stringify(body)
	});

	return {
		request,
		url: new URL('http://localhost/api/passkey/auth-options'),
		params: {},
		locals: {}
	} as any;
}

describe('POST /api/passkey/auth-options', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns 200 with valid WebAuthn PublicKeyCredentialRequestOptions', async () => {
		const response = await POST(createRequestEvent());
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toHaveProperty('challenge');
		expect(typeof data.challenge).toBe('string');
		expect(data.challenge.length).toBeGreaterThan(0);
	});

	it('returns timeout and userVerification fields', async () => {
		const response = await POST(createRequestEvent());
		const data = await response.json();

		expect(data.timeout).toBe(60000);
		expect(data.userVerification).toBe('preferred');
	});

	it('returns rpId from host header', async () => {
		const response = await POST(createRequestEvent({}, 'consensus.carmenio.com'));
		const data = await response.json();

		expect(data.rpId).toBe('consensus.carmenio.com');
	});

	it('falls back to "localhost" when host header is missing', async () => {
		const response = await POST(createRequestEvent());
		const data = await response.json();

		expect(data.rpId).toBe('localhost');
	});

	it('strips port from host header', async () => {
		const response = await POST(createRequestEvent({}, 'localhost:5173'));
		const data = await response.json();

		expect(data.rpId).toBe('localhost');
	});

	it('generates a unique challenge on each request', async () => {
		const res1 = await POST(createRequestEvent());
		const res2 = await POST(createRequestEvent());
		const data1 = await res1.json();
		const data2 = await res2.json();

		expect(data1.challenge).not.toBe(data2.challenge);
	});
});
