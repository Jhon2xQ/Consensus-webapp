import { fetchBackendJson } from '$lib/server/api';
import type { ApiResponse } from '$lib/types/api-response';
import type { ElectoralProcess } from '$lib/types/electoral-process';

export type SyncMembersResult = {
	count: number;
	transactionHash: string | null;
};

/**
 * Create an on-chain Semaphore group for an electoral process via the Relayer.
 * Calls POST /api/private/processes/{processId}/groups
 *
 * @throws {ApiError} Propagates any ApiError thrown by fetchBackendJson
 *   (e.g. 400 wrong state, 404 not found, 409 already has a group, 502 relayer down).
 */
export async function createGroup(
	locals: App.Locals,
	processId: string
): Promise<ElectoralProcess> {
	return fetchBackendJson<ElectoralProcess>(
		locals,
		`/api/private/processes/${processId}/groups`,
		{ method: 'POST' }
	);
}

/**
 * Sync on-chain Semaphore group members for an electoral process via the Relayer.
 * Calls POST /api/private/processes/{processId}/members
 *
 * @throws {ApiError} Propagates any ApiError thrown by fetchBackendJson
 *   (e.g. 400 no group, 400 wrong state, 404 not found, 502 relayer down).
 */
export async function syncMembers(
	locals: App.Locals,
	processId: string
): Promise<SyncMembersResult> {
	const response = await fetchBackendJson<ApiResponse<SyncMembersResult>>(
		locals,
		`/api/private/processes/${processId}/members`,
		{ method: 'POST' }
	);
	return response.data;
}

