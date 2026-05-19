import type { Enrollment } from '$lib/types/enrollment';

/**
 * Get enrollments for a specific electoral process.
 */
export function getEnrollmentsByProcessId(
	enrollments: Enrollment[],
	processId: string
): Enrollment[] {
	return enrollments.filter((e) => e.electoralProcessId === processId);
}

/**
 * Truncate a commitment string for display.
 */
export function truncateCommitment(commitment: string, maxLength = 20): string {
	if (commitment.length <= maxLength) return commitment;
	return commitment.slice(0, maxLength - 1) + '…';
}

/**
 * Validate enrollment form data. Returns an errors object.
 */
export function validateEnrollmentForm(data: {
	userId: string;
	commitment: string;
}): Record<string, string> {
	const errors: Record<string, string> = {};

	if (!data.userId?.trim()) {
		errors.userId = 'El ID de usuario es obligatorio';
	}

	if (!data.commitment?.trim()) {
		errors.commitment = 'El compromiso criptográfico es obligatorio';
	} else if (data.commitment.trim().length < 10) {
		errors.commitment = 'El compromiso debe tener al menos 10 caracteres';
	}

	return errors;
}
