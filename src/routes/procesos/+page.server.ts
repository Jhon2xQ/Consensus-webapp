import { getPublicProcesses } from '$lib/server/public-process.service';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 5;

export const load: PageServerLoad = async ({ url }) => {
	const pageParam = url.searchParams.get('page');

	// URL uses 1-based page numbers for user-friendliness.
	// API uses 0-based — convert before calling and convert back in the response.
	const urlPage = clampPositiveInt(Number(pageParam), 1);
	const apiPage = urlPage - 1;

	try {
		const result = await getPublicProcesses({ page: apiPage, size: PAGE_SIZE });
		return {
			processes: result.processes.map((p) => ({
				...p,
				// TODO: Replace with real values when the API exposes them.
				// Deterministic mock seeded by id so snapshots/tests are stable.
				teamsCount: ((p.id.charCodeAt(0) ?? 0) % 5) + 1,
				participantsCount: 200 + ((p.id.charCodeAt(1) ?? 0) * 137) % 1800
			})),
			page: result.page + 1,
			totalPages: result.totalPages,
			totalElements: result.totalElements,
			error: null
		};
	} catch (e) {
		return {
			processes: [],
			page: 1,
			totalPages: 0,
			totalElements: 0,
			error: 'Error al cargar los procesos. Intente nuevamente.'
		};
	}
};

/** Clamp to a positive integer, defaulting to fallback if NaN or ≤ 0 */
function clampPositiveInt(value: number, fallback: number): number {
	if (isNaN(value) || value <= 0) return fallback;
	return value;
}
