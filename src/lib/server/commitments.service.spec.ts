import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiError } from './api';

const { mockFetchBackendJson } = vi.hoisted(() => ({
	mockFetchBackendJson: vi.fn()
}));

vi.mock('$lib/server/api', async (importOriginal) => {
	const actual = (await importOriginal()) as typeof import('./api');
	return {
		...actual,
		fetchBackendJson: mockFetchBackendJson
	};
});

import { getProcessCommitments } from './commitments.service';

function mockApiResponse<T>(data: T) {
	return { success: true, message: 'OK', data, timestamp: '2026-01-01T00:00:00Z' };
}

const mockLocals = {} as App.Locals;

beforeEach(() => {
	vi.clearAllMocks();
});

describe('getProcessCommitments', () => {
	it('calls GET /api/private/processes/{id}/members and returns the data array', async () => {
		const commitments = ['12345', '67890', '11111'];
		mockFetchBackendJson.mockResolvedValue(mockApiResponse(commitments));

		const result = await getProcessCommitments(mockLocals, 'proc-1');

		expect(mockFetchBackendJson).toHaveBeenCalledTimes(1);
		expect(mockFetchBackendJson).toHaveBeenCalledWith(
			mockLocals,
			'/api/private/processes/proc-1/members'
		);
		expect(result).toEqual(commitments);
	});

	it('returns an empty array when no commitments exist', async () => {
		mockFetchBackendJson.mockResolvedValue(mockApiResponse<string[]>([]));

		const result = await getProcessCommitments(mockLocals, 'proc-1');

		expect(result).toEqual([]);
	});

	it('returns commitments in the order provided by the backend', async () => {
		const commitments = ['999', '1', '500'];
		mockFetchBackendJson.mockResolvedValue(mockApiResponse(commitments));

		const result = await getProcessCommitments(mockLocals, 'proc-1');

		expect(result).toEqual(['999', '1', '500']);
	});

	it('propagates ApiError(404) when the process does not exist', async () => {
		const apiError = new ApiError(404, 'API_ERROR', 'Electoral process not found: proc-1');
		mockFetchBackendJson.mockRejectedValue(apiError);

		await expect(getProcessCommitments(mockLocals, 'missing')).rejects.toThrow(apiError);
	});

	it('propagates ApiError(401) when the token is missing or expired', async () => {
		const apiError = new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
		mockFetchBackendJson.mockRejectedValue(apiError);

		await expect(getProcessCommitments(mockLocals, 'proc-1')).rejects.toThrow(apiError);
	});

	it('propagates ApiError on 5xx backend failures', async () => {
		const apiError = new ApiError(502, 'API_ERROR', 'Request failed with status 502');
		mockFetchBackendJson.mockRejectedValue(apiError);

		await expect(getProcessCommitments(mockLocals, 'proc-1')).rejects.toThrow(apiError);
	});
});
