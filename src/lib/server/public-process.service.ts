import { fetchPublicJson } from '$lib/server/api';
import { ApiError } from '$lib/server/api';
import type {
	ElectoralProcess,
	ElectoralProcessStatus,
	ProcessState
} from '$lib/types/electoral-process';
import type { ApiResponse, PaginatedResponse } from '$lib/types/api-response';

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
 * Thrown when the live /state endpoint is unreachable or returns a server error.
 * Callers can use this to degrade gracefully (e.g. fall back to the status
 * snapshot from the detail load). 404s are NOT wrapped in this — they're
 * propagated as ApiError so callers can map them to a not-found failure.
 */
export class ProcessStateUnavailableError extends Error {
	constructor(
		public readonly processId: string,
		public readonly cause: unknown
	) {
		super(`Failed to fetch state for process ${processId}`);
		this.name = 'ProcessStateUnavailableError';
	}
}

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

/**
 * Fetch a single public electoral process by ID.
 * Public endpoint — no authentication required.
 *
 * @throws {ApiError} Propagates any ApiError thrown by fetchPublicJson (including 404).
 */
export async function getPublicProcessById(id: string): Promise<ElectoralProcess> {
	const response = await fetchPublicJson<ApiResponse<ElectoralProcess>>(
		`/api/public/processes/${id}`
	);
	return response.data;
}

/**
 * Fetch the real-time status of a process via the dedicated /state endpoint.
 * The backend computes the state from the process dates in real-time, so this
 * is the source of truth for any decision that should respect the current
 * phase (e.g. gating commitment submissions).
 *
 * 404 is propagated as ApiError so callers can fail the request. 5xx and
 * network errors are wrapped in ProcessStateUnavailableError so callers can
 * degrade gracefully (e.g. fall back to the `estatus` field from the detail
 * load).
 *
 * @throws {ApiError} When the backend returns 404 (process not found).
 * @throws {ProcessStateUnavailableError} On 5xx or network failure.
 */
export async function getProcessState(id: string): Promise<ElectoralProcessStatus> {
	let response: ApiResponse<ProcessState>;
	try {
		response = await fetchPublicJson<ApiResponse<ProcessState>>(
			`/api/public/processes/${id}/state`
		);
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) {
			throw err;
		}
		throw new ProcessStateUnavailableError(id, err);
	}
	return response.data.state;
}
