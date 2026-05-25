import { fetchPublicJson } from '$lib/server/api';
import type { ElectoralProcess } from '$lib/types/electoral-process';
import type { PaginatedResponse } from '$lib/types/api-response';

export type PublicProcessQueryParams = {
	page?: number;
	size?: number;
};

export type PublicProcessResult = {
	processes: ElectoralProcess[];
	page: number;
	size: number;
	totalPages: number;
	totalElements: number;
};

/**
 * Fetch paginated public electoral processes.
 * Public endpoint — no authentication required.
 *
 * @throws {ApiError} Propagates any ApiError thrown by fetchPublicJson.
 */
export async function getPublicProcesses(
	params?: PublicProcessQueryParams
): Promise<PublicProcessResult> {
	const page = params?.page ?? 0;
	const size = params?.size ?? 5;
	const query = new URLSearchParams({
		page: String(page),
		size: String(size),
		sort: 'name,asc'
	});
	const path = `/api/public/processes?${query.toString()}`;

	const response = await fetchPublicJson<PaginatedResponse<ElectoralProcess>>(path);
	return {
		processes: response.data.content,
		page: response.data.page,
		size: response.data.size,
		totalPages: response.data.totalPages,
		totalElements: response.data.totalElements
	};
}
