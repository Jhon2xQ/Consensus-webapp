import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ElectoralProcess } from '$lib/types/electoral-process';
import { ApiError } from './api';

const { mockFetchPublicJson } = vi.hoisted(() => ({
	mockFetchPublicJson: vi.fn()
}));

vi.mock('$lib/server/api', async (importOriginal) => {
	const actual = (await importOriginal()) as typeof import('./api');
	return {
		...actual,
		fetchPublicJson: mockFetchPublicJson
	};
});

// RED: getPublicProcessById does NOT exist yet
import { getPublicProcessById } from './public-process.service';

const mockProcess: ElectoralProcess = {
	id: '1',
	name: 'Test Process',
	scope: 'Nacional',
	description: 'A test process',
	estatus: 'COMMITMENT',
	commitmentStart: '2026-01-01T00:00:00Z',
	commitmentEnd: '2026-02-01T00:00:00Z',
	votingStart: '2026-03-01T00:00:00Z',
	votingEnd: '2026-03-05T00:00:00Z',
	results: '2026-03-10T00:00:00Z',
	createdBy: 'user-1'
};

function mockApiResponse<T>(data: T) {
	return { success: true, message: 'OK', data, timestamp: '2026-01-01T00:00:00Z' };
}

describe('getPublicProcessById', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls fetchPublicJson with /api/public/processes/{id}', async () => {
		mockFetchPublicJson.mockResolvedValue(mockApiResponse(mockProcess));

		await getPublicProcessById('1');

		expect(mockFetchPublicJson).toHaveBeenCalledTimes(1);
		expect(mockFetchPublicJson).toHaveBeenCalledWith('/api/public/processes/1');
	});

	it('returns the ElectoralProcess from response.data', async () => {
		mockFetchPublicJson.mockResolvedValue(mockApiResponse(mockProcess));

		const result = await getPublicProcessById('1');

		expect(result).toEqual(mockProcess);
	});

	it('propagates ApiError when fetchPublicJson rejects', async () => {
		const apiError = new ApiError(404, 'API_ERROR', 'Not found');
		mockFetchPublicJson.mockRejectedValue(apiError);

		await expect(getPublicProcessById('nonexistent')).rejects.toThrow(apiError);
	});
});
