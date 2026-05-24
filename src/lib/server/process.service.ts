import { fetchBackendJson } from '$lib/server/api';
import type { ElectoralProcess } from '$lib/types/electoral-process';
import type { PaginatedResponse } from '$lib/types/api-response';

export type ProcessQueryParams = {
	size?: number;
};

export type CreateProcessBody = {
	name: string;
	scope: string;
	description?: string;
	commitmentStart: string;
	commitmentEnd: string;
	votingStart: string;
	votingEnd: string;
	results: string;
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

/**
 * Fetch a single electoral process by ID from the public backend API.
 *
 * @throws {ApiError} Propagates any ApiError thrown by fetchBackendJson (e.g. 404).
 */
export async function getProcessById(
	locals: App.Locals,
	id: string
): Promise<ElectoralProcess> {
	return fetchBackendJson<ElectoralProcess>(locals, `/api/public/processes/${id}`);
}

/**
 * Create a new electoral process via the backend API.
 *
 * @throws {ApiError} Propagates any ApiError thrown by fetchBackendJson (e.g. 401, 409 conflict).
 */
export async function createProcess(
	locals: App.Locals,
	body: CreateProcessBody
): Promise<ElectoralProcess> {
	return fetchBackendJson<ElectoralProcess>(locals, '/api/private/processes', {
		method: 'POST',
		body
	});
}

/**
 * Update an existing electoral process via the backend API.
 *
 * @throws {ApiError} Propagates any ApiError thrown by fetchBackendJson (e.g. 401, 404).
 */
export async function updateProcess(
	locals: App.Locals,
	id: string,
	body: Partial<CreateProcessBody>
): Promise<ElectoralProcess> {
	return fetchBackendJson<ElectoralProcess>(locals, `/api/private/processes/${id}`, {
		method: 'PUT',
		body
	});
}

/**
 * Delete an electoral process via the backend API.
 *
 * @throws {ApiError} Propagates any ApiError thrown by fetchBackendJson (e.g. 401, 403, 404).
 */
export async function deleteProcess(
	locals: App.Locals,
	id: string
): Promise<void> {
	await fetchBackendJson<ElectoralProcess>(locals, `/api/private/processes/${id}`, {
		method: 'DELETE'
	});
}
