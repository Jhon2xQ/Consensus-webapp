import { fetchBackendJson } from '$lib/server/api';
import type { Team } from '$lib/types/team';

type ApiResponse<T> = {
	success: boolean;
	message: string;
	data: T;
};

/**
 * Create a new team within an electoral process.
 * Calls POST /api/private/processes/{processId}/teams
 */
export async function createTeam(
	locals: App.Locals,
	processId: string,
	body: { name: string; avatarUrl?: string | null }
): Promise<Team> {
	const response = await fetchBackendJson<ApiResponse<Team>>(
		locals,
		`/api/private/processes/${processId}/teams`,
		{ method: 'POST', body }
	);
	return response.data;
}

/**
 * Delete a team by its ID.
 * Calls DELETE /api/private/teams/{teamId}
 */
export async function deleteTeam(
	locals: App.Locals,
	teamId: string
): Promise<void> {
	await fetchBackendJson(locals, `/api/private/teams/${teamId}`, {
		method: 'DELETE'
	});
}

/**
 * Get all teams for an electoral process.
 * Calls GET /api/public/processes/{processId}/teams
 */
export async function getTeams(
	locals: App.Locals,
	processId: string
): Promise<Team[]> {
	const response = await fetchBackendJson<ApiResponse<Team[]>>(
		locals,
		`/api/public/processes/${processId}/teams`
	);
	return response.data;
}
