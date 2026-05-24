import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiError } from './api';
import type { Team } from '$lib/types/team';

// ── Mocks (hoisted so vi.mock factory can reference them) ──
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

// ── Import after mocks ──
import { createTeam, deleteTeam, getTeams, updateTeam } from './team.service';

// ── Helpers ──
const mockLocals = {} as App.Locals;

const createMockTeam = (overrides?: Partial<Team>): Team => ({
	id: 'team-1',
	name: 'Equipo A',
	avatarUrl: undefined,
	electoralProcessId: 'proc-1',
	...overrides
});

type ApiResponse<T> = {
	success: boolean;
	message: string;
	data: T;
};

beforeEach(() => {
	vi.clearAllMocks();
});

// ── updateTeam tests ──
describe('updateTeam', () => {
	const updateBody = {
		name: 'Equipo Actualizado',
		avatarUrl: null
	};

	it('sends PUT /api/private/teams/{teamId} with correct body', async () => {
		const mockTeam = createMockTeam({ name: 'Equipo Actualizado' });
		mockFetchBackendJson.mockResolvedValue({
			success: true,
			message: 'OK',
			data: mockTeam
		} as ApiResponse<Team>);

		await updateTeam(mockLocals, 'team-1', updateBody);

		expect(mockFetchBackendJson).toHaveBeenCalledWith(
			mockLocals,
			'/api/private/teams/team-1',
			{
				method: 'PUT',
				body: updateBody
			}
		);
	});

	it('returns the updated Team unwrapped from ApiResponse', async () => {
		const mockTeam = createMockTeam({ id: 'team-1', name: 'Equipo Actualizado', avatarUrl: null });
		mockFetchBackendJson.mockResolvedValue({
			success: true,
			message: 'OK',
			data: mockTeam
		} as ApiResponse<Team>);

		const result = await updateTeam(mockLocals, 'team-1', updateBody);

		expect(result).toEqual(mockTeam);
		expect(result.name).toBe('Equipo Actualizado');
		expect(result.avatarUrl).toBeNull();
	});

	it('sends only provided fields (partial update with name only)', async () => {
		const partialBody = { name: 'Solo Nombre' };
		const mockTeam = createMockTeam({ name: 'Solo Nombre' });
		mockFetchBackendJson.mockResolvedValue({
			success: true,
			message: 'OK',
			data: mockTeam
		} as ApiResponse<Team>);

		await updateTeam(mockLocals, 'team-1', partialBody);

		expect(mockFetchBackendJson).toHaveBeenCalledWith(
			mockLocals,
			'/api/private/teams/team-1',
			{
				method: 'PUT',
				body: { name: 'Solo Nombre' }
			}
		);
	});

	it('sends only provided fields (partial update with avatarUrl only)', async () => {
		const partialBody = { avatarUrl: '/avatars/team.png' };
		const mockTeam = createMockTeam({ avatarUrl: '/avatars/team.png' });
		mockFetchBackendJson.mockResolvedValue({
			success: true,
			message: 'OK',
			data: mockTeam
		} as ApiResponse<Team>);

		await updateTeam(mockLocals, 'team-1', partialBody);

		expect(mockFetchBackendJson).toHaveBeenCalledWith(
			mockLocals,
			'/api/private/teams/team-1',
			{
				method: 'PUT',
				body: { avatarUrl: '/avatars/team.png' }
			}
		);
	});

	it('propagates ApiError on 404 (team not found)', async () => {
		const apiError = new ApiError(404, 'NOT_FOUND', 'Equipo no encontrado');
		mockFetchBackendJson.mockRejectedValue(apiError);

		await expect(updateTeam(mockLocals, 'no-existe', updateBody)).rejects.toThrow(ApiError);
		await expect(updateTeam(mockLocals, 'no-existe', updateBody)).rejects.toThrow('Equipo no encontrado');
	});

	it('handles ApiResponse wrapper correctly (unwraps .data)', async () => {
		const mockTeam = createMockTeam({ name: 'Wrapped' });
		mockFetchBackendJson.mockResolvedValue({
			success: true,
			message: 'OK',
			data: mockTeam
		} as ApiResponse<Team>);

		const result = await updateTeam(mockLocals, 'team-1', { name: 'Wrapped' });

		// result should be the Team object itself, not the ApiResponse
		expect(result).toHaveProperty('id');
		expect(result).toHaveProperty('name');
		expect(result).toHaveProperty('electoralProcessId');
		expect(result).not.toHaveProperty('success');
		expect(result).not.toHaveProperty('message');
	});

	it('returns correct team id for different teams', async () => {
		const teamB = createMockTeam({ id: 'team-2', name: 'Equipo B' });
		mockFetchBackendJson.mockResolvedValue({
			success: true,
			message: 'OK',
			data: teamB
		} as ApiResponse<Team>);

		const result = await updateTeam(mockLocals, 'team-2', { name: 'Equipo B' });

		expect(result.id).toBe('team-2');
		expect(mockFetchBackendJson).toHaveBeenCalledWith(
			mockLocals,
			'/api/private/teams/team-2',
			expect.any(Object)
		);
	});
});
