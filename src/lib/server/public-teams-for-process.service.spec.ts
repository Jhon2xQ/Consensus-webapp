import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Team } from '$lib/types/team';
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

// RED: getPublicTeamsForProcess does NOT exist yet on team.service
import { getPublicTeamsForProcess } from './team.service';

const mockTeam: Team = {
	id: 'team-1',
	name: 'Equipo Alpha',
	avatarUrl: null,
	electoralProcessId: '1'
};

function mockApiResponse<T>(data: T) {
	return { success: true, message: 'OK', data, timestamp: '2026-01-01T00:00:00Z' };
}

describe('getPublicTeamsForProcess', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls fetchPublicJson with /api/public/processes/{processId}/teams', async () => {
		mockFetchPublicJson.mockResolvedValue(mockApiResponse([mockTeam]));

		await getPublicTeamsForProcess('1');

		expect(mockFetchPublicJson).toHaveBeenCalledTimes(1);
		expect(mockFetchPublicJson).toHaveBeenCalledWith('/api/public/processes/1/teams');
	});

	it('returns Team[] from response.data', async () => {
		mockFetchPublicJson.mockResolvedValue(mockApiResponse([mockTeam]));

		const result = await getPublicTeamsForProcess('1');

		expect(result).toEqual([mockTeam]);
	});

	it('returns empty array when no teams exist', async () => {
		mockFetchPublicJson.mockResolvedValue(mockApiResponse([]));

		const result = await getPublicTeamsForProcess('1');

		expect(result).toEqual([]);
	});

	it('propagates ApiError when fetchPublicJson rejects', async () => {
		const apiError = new ApiError(500, 'API_ERROR', 'Server error');
		mockFetchPublicJson.mockRejectedValue(apiError);

		await expect(getPublicTeamsForProcess('1')).rejects.toThrow(apiError);
	});
});
