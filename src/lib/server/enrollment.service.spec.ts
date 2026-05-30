import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Enrollment } from '$lib/types/enrollment';
import { ApiError } from './api';

const { mockFetchBackendJson } = vi.hoisted(() => ({
	mockFetchBackendJson: vi.fn()
}));

vi.mock('$lib/server/api', async (importOriginal) => {
	const actual = (await importOriginal()) as typeof import('./api');
	return {
		...actual,
		fetchBackendJson: mockFetchBackendJson
	};
});

import { updateCommitment } from './enrollment.service';

function mockEnrollment(overrides: Partial<Enrollment> = {}): Enrollment {
	return {
		id: 'enr-1',
		electoralProcessId: 'proc-1',
		email: 'user@example.com',
		userId: 'user-sub-1',
		commitment: 'commitment-abc',
		hasVoted: false,
		...overrides
	};
}

function mockApiResponse<T>(data: T) {
	return { success: true, message: 'OK', data, timestamp: '2026-01-01T00:00:00Z' };
}

describe('updateCommitment', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls fetchBackendJson with PUT and correct path', async () => {
		const enrollment = mockEnrollment();
		mockFetchBackendJson.mockResolvedValue(mockApiResponse(enrollment));

		const locals = {} as App.Locals;
		await updateCommitment(locals, 'proc-1', 'commitment-xyz');

		expect(mockFetchBackendJson).toHaveBeenCalledTimes(1);
		expect(mockFetchBackendJson).toHaveBeenCalledWith(
			locals,
			'/api/private/processes/proc-1/enrollments',
			{ method: 'PUT', body: { commitment: 'commitment-xyz' } }
		);
	});

	it('returns the enrollment from response.data', async () => {
		const enrollment = mockEnrollment({ commitment: 'new-commitment' });
		mockFetchBackendJson.mockResolvedValue(mockApiResponse(enrollment));

		const locals = {} as App.Locals;
		const result = await updateCommitment(locals, 'proc-1', 'new-commitment');

		expect(result).toEqual(enrollment);
	});

	it('propagates ApiError when fetchBackendJson rejects', async () => {
		const apiError = new ApiError(404, 'API_ERROR', 'Enrollment not found');
		mockFetchBackendJson.mockRejectedValue(apiError);

		const locals = {} as App.Locals;

		await expect(updateCommitment(locals, 'proc-1', 'commitment-xyz')).rejects.toThrow(apiError);
	});

	it('propagates ApiError on 400 status', async () => {
		const apiError = new ApiError(400, 'API_ERROR', 'Enrollment not open for this process');
		mockFetchBackendJson.mockRejectedValue(apiError);

		const locals = {} as App.Locals;

		await expect(updateCommitment(locals, 'proc-1', 'commitment-xyz')).rejects.toThrow(apiError);
	});

	it('propagates ApiError on 403 status', async () => {
		const apiError = new ApiError(403, 'API_ERROR', 'Access denied: insufficient permissions');
		mockFetchBackendJson.mockRejectedValue(apiError);

		const locals = {} as App.Locals;

		await expect(updateCommitment(locals, 'proc-1', 'commitment-xyz')).rejects.toThrow(apiError);
	});

	it('serializes commitment as JSON string in body', async () => {
		const enrollment = mockEnrollment({ commitment: 'semaphore-123' });
		mockFetchBackendJson.mockResolvedValue(mockApiResponse(enrollment));

		const locals = {} as App.Locals;
		await updateCommitment(locals, 'proc-1', 'semaphore-123');

		const callArgs = mockFetchBackendJson.mock.calls[0];
		expect(callArgs[2]).toEqual({ method: 'PUT', body: { commitment: 'semaphore-123' } });
	});
});
