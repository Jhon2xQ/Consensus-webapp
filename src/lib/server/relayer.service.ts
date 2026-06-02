import { fetchBackendJson } from '$lib/server/api';
import type { ElectoralProcess } from '$lib/types/electoral-process';

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
