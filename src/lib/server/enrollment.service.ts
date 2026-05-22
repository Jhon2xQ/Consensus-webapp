import { fetchBackendJson } from '$lib/server/api';
import type { Enrollment } from '$lib/types/enrollment';

type ApiResponse<T> = {
	success: boolean;
	message: string;
	data: T;
};

/**
 * Create a new enrollment (register voter by email) within an electoral process.
 * Calls POST /api/private/processes/{processId}/enrollments
 */
export async function createEnrollment(
	locals: App.Locals,
	processId: string,
	body: { email: string }
): Promise<Enrollment> {
	const response = await fetchBackendJson<ApiResponse<Enrollment>>(
		locals,
		`/api/private/processes/${processId}/enrollments`,
		{ method: 'POST', body }
	);
	return response.data;
}

/**
 * Delete an enrollment by its ID.
 * Calls DELETE /api/private/enrollments/{enrollmentId}
 */
export async function deleteEnrollment(
	locals: App.Locals,
	enrollmentId: string
): Promise<void> {
	await fetchBackendJson(locals, `/api/private/enrollments/${enrollmentId}`, {
		method: 'DELETE'
	});
}

/**
 * Get all enrollments for an electoral process.
 * Calls GET /api/private/processes/{processId}/enrollments
 */
export async function getEnrollments(
	locals: App.Locals,
	processId: string
): Promise<Enrollment[]> {
	const response = await fetchBackendJson<ApiResponse<Enrollment[]>>(
		locals,
		`/api/private/processes/${processId}/enrollments`
	);
	return response.data;
}
