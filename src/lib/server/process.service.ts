import { fetchBackendJson } from '$lib/server/api';
import type { ElectoralProcess } from '$lib/types/electoral-process';
import type { PaginatedResponse } from '$lib/types/api-response';

export type ProcessQueryParams = {
	size?: number;
};

/**
 * Fetch the current user's electoral processes from the backend API.
 * Default page size is 5. Supported sizes: 5, 10, 20.
 *
 * @throws {ApiError} Propagates any ApiError thrown by fetchBackendJson (e.g. 401).
 */
export async function getMyProcesses(
	locals: App.Locals,
	params?: ProcessQueryParams
): Promise<ElectoralProcess[]> {
	const size = params?.size ?? 5;
	const query = new URLSearchParams({ size: String(size) });
	const path = `/api/private/processes?${query.toString()}`;

	const response = await fetchBackendJson<PaginatedResponse<ElectoralProcess>>(locals, path);
	return response.data.content;
}
