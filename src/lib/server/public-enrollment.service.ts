import { fetchPublicJson } from '$lib/server/api';
import type { EnrollmentSummary } from '$lib/types/enrollment';
import type { ApiResponse } from '$lib/types/api-response';

/**
 * Fetch enrollment summary for a public electoral process.
 * Calls GET /api/public/processes/{processId}/enrollments
 *
 * @throws {ApiError} Propagates any ApiError thrown by fetchPublicJson.
 */
export async function getPublicEnrollmentSummary(
	processId: string
): Promise<EnrollmentSummary> {
	const response = await fetchPublicJson<ApiResponse<EnrollmentSummary>>(
		`/api/public/processes/${processId}/enrollments`
	);
	return response.data;
}
