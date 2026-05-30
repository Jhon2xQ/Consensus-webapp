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
	body: { email: string }[]
): Promise<Enrollment[]> {
	const response = await fetchBackendJson<ApiResponse<Enrollment[]>>(
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

/**
 * Get enrollment for a specific user in an electoral process.
 * Returns null if the user is not enrolled.
 * Calls GET /api/private/processes/{processId}/enrollments and filters by userId.
 */
export async function getUserEnrollment(
	locals: App.Locals,
	processId: string,
	userId: string
): Promise<Enrollment | null> {
	const enrollments = await getEnrollments(locals, processId);
	return enrollments.find((e) => e.userId === userId) ?? null;
}

/**
 * Update (set or change) the commitment for a user's enrollment.
 * Calls PUT /api/private/processes/{processId}/enrollments
 */
export async function updateCommitment(
	locals: App.Locals,
	processId: string,
	commitment: string
): Promise<Enrollment> {
	const response = await fetchBackendJson<ApiResponse<Enrollment>>(
		locals,
		`/api/private/processes/${processId}/enrollments`,
		{ method: 'PUT', body: { commitment } }
	);
	return response.data;
}
