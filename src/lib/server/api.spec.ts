import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiError, fetchBackend, fetchBackendJson } from './api';

// --- Mocks ---

vi.mock('$lib/environments/private', () => ({
	privateEnv: {
		backendApiUrl: 'http://localhost:3000',
		logtoApiResource: 'https://consensus.carmenio.com/api'
	}
}));

const mockGetAccessToken = vi.fn<(...args: unknown[]) => Promise<string>>();
const mockLocals = {
	logtoClient: { getAccessToken: mockGetAccessToken }
} as unknown as App.Locals;

const mockFetch = vi.fn<typeof globalThis.fetch>();

beforeEach(() => {
	vi.restoreAllMocks();
	mockGetAccessToken.mockReset();
	mockFetch.mockReset();
	vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

// --- Task 2.1: ApiError class ---

describe('ApiError', () => {
	it('sets status, code, message, and name', () => {
		const error = new ApiError(401, 'UNAUTHORIZED', 'Not authenticated');

		expect(error.status).toBe(401);
		expect(error.code).toBe('UNAUTHORIZED');
		expect(error.message).toBe('Not authenticated');
		expect(error.name).toBe('ApiError');
	});

	it('handles different error codes (triangulation)', () => {
		const forbidden = new ApiError(403, 'FORBIDDEN', 'Access denied');
		expect(forbidden.status).toBe(403);
		expect(forbidden.code).toBe('FORBIDDEN');

		const serverError = new ApiError(500, 'SERVER_ERROR', 'Internal server error');
		expect(serverError.status).toBe(500);
		expect(serverError.code).toBe('SERVER_ERROR');
	});

	it('is instance of Error', () => {
		const error = new ApiError(400, 'BAD_REQUEST', 'Bad request');
		expect(error).toBeInstanceOf(Error);
	});
});

// --- Task 2.2: fetchBackend — getAccessToken, Authorization header, forwarding ---

describe('fetchBackend', () => {
	it('calls getAccessToken with the configured resource indicator', async () => {
		mockGetAccessToken.mockResolvedValue('mock-jwt');
		mockFetch.mockResolvedValue(new Response('ok', { status: 200 }));

		await fetchBackend(mockLocals, '/test');

		expect(mockGetAccessToken).toHaveBeenCalledWith('https://consensus.carmenio.com/api');
	});

	it('attaches Authorization: Bearer <token> header', async () => {
		mockGetAccessToken.mockResolvedValue('mock-jwt');
		let capturedHeaders: Record<string, string> = {};
		mockFetch.mockImplementation(async (_url, init) => {
			capturedHeaders = (init?.headers ?? {}) as Record<string, string>;
			return new Response('ok', { status: 200 });
		});

		await fetchBackend(mockLocals, '/test');

		expect(capturedHeaders['Authorization']).toBe('Bearer mock-jwt');
	});

	it('constructs the correct backend URL from base + path', async () => {
		mockGetAccessToken.mockResolvedValue('mock-jwt');
		let capturedUrl = '';
		mockFetch.mockImplementation(async (url) => {
			capturedUrl = typeof url === 'string' ? url : url.toString();
			return new Response('ok', { status: 200 });
		});

		await fetchBackend(mockLocals, '/api/data');

		expect(capturedUrl).toBe('http://localhost:3000/api/data');
	});

	it('forwards method and serializes body as JSON', async () => {
		mockGetAccessToken.mockResolvedValue('mock-jwt');
		let capturedInit: RequestInit = {};
		mockFetch.mockImplementation(async (_url, init) => {
			capturedInit = init ?? {};
			return new Response('ok', { status: 200 });
		});

		await fetchBackend(mockLocals, '/submit', { method: 'POST', body: { key: 'value' } });

		expect(capturedInit.method).toBe('POST');
		expect(capturedInit.body).toBe(JSON.stringify({ key: 'value' }));
	});

	it('merges custom headers with Authorization', async () => {
		mockGetAccessToken.mockResolvedValue('mock-jwt');
		let capturedHeaders: Record<string, string> = {};
		mockFetch.mockImplementation(async (_url, init) => {
			capturedHeaders = (init?.headers ?? {}) as Record<string, string>;
			return new Response('ok', { status: 200 });
		});

		await fetchBackend(mockLocals, '/test', { headers: { 'X-Custom': 'value' } });

		expect(capturedHeaders['Authorization']).toBe('Bearer mock-jwt');
		expect(capturedHeaders['X-Custom']).toBe('value');
	});

	// --- Task 2.3: 401 retry ---

	it('retries once with fresh token on 401 response', async () => {
		mockGetAccessToken
			.mockResolvedValueOnce('expired-jwt')
			.mockResolvedValueOnce('fresh-jwt');

		let fetchCallCount = 0;
		mockFetch.mockImplementation(async () => {
			fetchCallCount++;
			return new Response('Unauthorized', { status: fetchCallCount === 1 ? 401 : 200 });
		});

		const response = await fetchBackend(mockLocals, '/test');

		expect(response.status).toBe(200);
		expect(mockGetAccessToken).toHaveBeenCalledTimes(2);
		expect(fetchCallCount).toBe(2);
	});

	it('throws ApiError on persistent 401 after retry', async () => {
		mockGetAccessToken
			.mockResolvedValueOnce('expired-jwt')
			.mockResolvedValueOnce('still-expired-jwt');

		mockFetch.mockResolvedValue(new Response('Unauthorized', { status: 401 }));

		const error = await fetchBackend(mockLocals, '/test').catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(401);
		expect(error.code).toBe('API_ERROR');
	});

	// --- Task 2.4: non-ok response ---

	it('throws ApiError on 404 response', async () => {
		mockGetAccessToken.mockResolvedValue('mock-jwt');
		mockFetch.mockResolvedValue(new Response('Not Found', { status: 404 }));

		const error = await fetchBackend(mockLocals, '/not-found').catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(404);
		expect(error.code).toBe('API_ERROR');
	});

	it('throws ApiError on 500 response', async () => {
		mockGetAccessToken.mockResolvedValue('mock-jwt');
		mockFetch.mockResolvedValue(new Response('Server Error', { status: 500 }));

		const error = await fetchBackend(mockLocals, '/error').catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(500);
		expect(error.code).toBe('API_ERROR');
	});
});

// --- Task 2.5: fetchBackendJson<T> ---

describe('fetchBackendJson', () => {
	it('parses JSON response and returns typed data', async () => {
		mockGetAccessToken.mockResolvedValue('mock-jwt');
		const body = { id: 1, name: 'test' };
		mockFetch.mockResolvedValue(
			new Response(JSON.stringify(body), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			})
		);

		const result = await fetchBackendJson<{ id: number; name: string }>(mockLocals, '/data');

		expect(result).toEqual(body);
	});

	it('throws ApiError when backend returns non-ok status', async () => {
		mockGetAccessToken.mockResolvedValue('mock-jwt');
		mockFetch.mockResolvedValue(new Response('Forbidden', { status: 403 }));

		const error: unknown = await fetchBackendJson(mockLocals, '/admin').catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect((error as ApiError).status).toBe(403);
	});
});

// --- Task 2.6: Unauthenticated user ---

describe('unauthenticated user', () => {
	it('throws ApiError(401, UNAUTHORIZED) when getAccessToken fails', async () => {
		mockGetAccessToken.mockRejectedValue(new Error('Not authenticated'));

		const error: unknown = await fetchBackend(mockLocals, '/test').catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect((error as ApiError).status).toBe(401);
		expect((error as ApiError).code).toBe('UNAUTHORIZED');
		expect((error as ApiError).message).toBe('Not authenticated');
	});

	it('fetchBackendJson also throws ApiError when unauthenticated', async () => {
		mockGetAccessToken.mockRejectedValue(new Error('Not authenticated'));

		const error: unknown = await fetchBackendJson(mockLocals, '/data').catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect((error as ApiError).status).toBe(401);
		expect((error as ApiError).code).toBe('UNAUTHORIZED');
	});
});
