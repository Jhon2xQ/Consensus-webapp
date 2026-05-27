import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { EnrollmentSummary } from '$lib/types/enrollment';
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

// RED: file public-enrollment.service.ts does NOT exist yet
import { getPublicEnrollmentSummary } from './public-enrollment.service';

function mockApiResponse<T>(data: T) {
	return { success: true, message: 'OK', data, timestamp: '2026-01-01T00:00:00Z' };
}

describe('getPublicEnrollmentSummary', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls fetchPublicJson with /api/public/processes/{processId}/enrollments', async () => {
		const summary: EnrollmentSummary = { totalParticipants: 150, totalCommitments: 120, totalVoted: 90 };
		mockFetchPublicJson.mockResolvedValue(mockApiResponse(summary));

		await getPublicEnrollmentSummary('1');

		expect(mockFetchPublicJson).toHaveBeenCalledTimes(1);
		expect(mockFetchPublicJson).toHaveBeenCalledWith('/api/public/processes/1/enrollments');
	});

	it('returns EnrollmentSummary from response.data', async () => {
		const summary: EnrollmentSummary = { totalParticipants: 150, totalCommitments: 120, totalVoted: 90 };
		mockFetchPublicJson.mockResolvedValue(mockApiResponse(summary));

		const result = await getPublicEnrollmentSummary('1');

		expect(result).toEqual(summary);
	});

	it('returns zeros for empty process', async () => {
		const summary: EnrollmentSummary = { totalParticipants: 0, totalCommitments: 0, totalVoted: 0 };
		mockFetchPublicJson.mockResolvedValue(mockApiResponse(summary));

		const result = await getPublicEnrollmentSummary('2');

		expect(result).toEqual(summary);
	});

	it('propagates ApiError when fetchPublicJson rejects', async () => {
		const apiError = new ApiError(500, 'API_ERROR', 'Server error');
		mockFetchPublicJson.mockRejectedValue(apiError);

		await expect(getPublicEnrollmentSummary('1')).rejects.toThrow(apiError);
	});
});
