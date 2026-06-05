import { fetchBackendJson } from '$lib/server/api';

type ApiResponse<T> = {
	success: boolean;
	message: string;
	data: T;
};

/**
 * Get all commitments of enrollments for an electoral process.
 * Used to build the Merkle tree for zk-SNARK voting proofs.
 * Calls GET /api/private/processes/{processId}/members
 */
export async function getProcessCommitments(
	locals: App.Locals,
	processId: string
): Promise<string[]> {
	const response = await fetchBackendJson<ApiResponse<string[]>>(
		locals,
		`/api/private/processes/${processId}/members`
	);
	return response.data;
}
