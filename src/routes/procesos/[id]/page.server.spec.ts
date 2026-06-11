import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from './+page.server';
import type { ElectoralProcess, ElectoralProcessStatus } from '$lib/types/electoral-process';
import type { Team } from '$lib/types/team';
import type { EnrollmentSummary, Enrollment } from '$lib/types/enrollment';

type LoadResult = {
	process: ElectoralProcess;
	liveState: ElectoralProcessStatus;
	teams: Team[];
	enrollmentSummary: EnrollmentSummary | null;
	teamsError: boolean;
	enrollmentError: boolean;
	userSub: string | null;
	userEnrollment: Enrollment | null;
};

// Mocks
const mockGetPublicProcessById = vi.hoisted(() => vi.fn());
const mockGetPublicTeamsForProcess = vi.hoisted(() => vi.fn());
const mockGetPublicEnrollmentSummary = vi.hoisted(() => vi.fn());
const mockGetUserEnrollment = vi.hoisted(() => vi.fn());
const mockGetProcessState = vi.hoisted(() => vi.fn());
const mockUpdateCommitment = vi.hoisted(() => vi.fn());
const mockMarkAsVoted = vi.hoisted(() => vi.fn());

vi.mock('$lib/server/public-process.service', async (importOriginal) => {
	const actual = (await importOriginal()) as typeof import('$lib/server/public-process.service');
	return {
		...actual,
		getPublicProcessById: mockGetPublicProcessById,
		getProcessState: mockGetProcessState
	};
});

vi.mock('$lib/server/team.service', () => ({
	getPublicTeamsForProcess: mockGetPublicTeamsForProcess
}));

vi.mock('$lib/server/public-enrollment.service', () => ({
	getPublicEnrollmentSummary: mockGetPublicEnrollmentSummary
}));

vi.mock('$lib/server/enrollment.service', () => ({
	getUserEnrollment: mockGetUserEnrollment,
	updateCommitment: mockUpdateCommitment,
	markAsVoted: mockMarkAsVoted
}));

vi.mock('@sveltejs/kit', () => ({
	error: (status: number, message: string) => {
		throw { status, message };
	},
	fail: (status: number, data?: unknown) => ({ status, data }),
	redirect: (status: number, location: string) => {
		throw { status, location };
	}
}));

const mockProcess = {
	id: 'proc-1',
	name: 'Test Process',
	scope: 'Nacional',
	description: 'Desc',
	estatus: 'COMMITMENT',
	commitmentStart: '2026-03-01T00:00:00Z',
	commitmentEnd: '2026-04-30T00:00:00Z',
	votingStart: '2026-06-15T00:00:00Z',
	votingEnd: '2026-06-20T00:00:00Z',
	results: '2026-06-25T00:00:00Z',
	createdBy: 'user-1'
};

const mockLocals = {
	user: {
		sub: 'user-abc-123',
		name: 'Test User',
		email: 'test@example.com'
	},
	logtoClient: {}
};

describe('+page.server.ts load', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetPublicProcessById.mockResolvedValue(mockProcess);
		mockGetProcessState.mockResolvedValue('COMMITMENT');
		mockGetPublicTeamsForProcess.mockResolvedValue([]);
		mockGetPublicEnrollmentSummary.mockResolvedValue({
			totalParticipants: 10,
			totalCommitments: 5,
			totalVoted: 3
		});
	});

	it('includes userSub from locals.user.sub', async () => {
		const result = (await load({
			params: { id: 'proc-1' },
			locals: mockLocals
		} as any)) as LoadResult;

		expect(result.userSub).toBe('user-abc-123');
	});

	it('returns null userSub when user is not authenticated', async () => {
		const result = (await load({
			params: { id: 'proc-1' },
			locals: { logtoClient: {} }
		} as any)) as LoadResult;

		expect(result.userSub).toBeNull();
	});

	it('fetches user enrollment for the current user and process', async () => {
		const mockEnrollment = {
			id: 'enr-1',
			electoralProcessId: 'proc-1',
			email: 'test@example.com',
			userId: 'user-abc-123',
			commitment: null,
			hasVoted: false
		};
		mockGetUserEnrollment.mockResolvedValue(mockEnrollment);

		const result = (await load({
			params: { id: 'proc-1' },
			locals: mockLocals
		} as any)) as LoadResult;

		expect(mockGetUserEnrollment).toHaveBeenCalledWith(mockLocals, 'proc-1', 'user-abc-123');
		expect(result.userEnrollment).toEqual(mockEnrollment);
	});

	it('returns null userEnrollment when user is not authenticated', async () => {
		const result = (await load({
			params: { id: 'proc-1' },
			locals: { logtoClient: {} }
		} as any)) as LoadResult;

		expect(mockGetUserEnrollment).not.toHaveBeenCalled();
		expect(result.userEnrollment).toBeNull();
	});

	it('returns null userEnrollment when getUserEnrollment throws', async () => {
		mockGetUserEnrollment.mockRejectedValue(new Error('API error'));

		const result = (await load({
			params: { id: 'proc-1' },
			locals: mockLocals
		} as any)) as LoadResult;

		expect(result.userEnrollment).toBeNull();
	});

	it('still returns existing fields (process, teams, enrollmentSummary)', async () => {
		const result = (await load({
			params: { id: 'proc-1' },
			locals: mockLocals
		} as any)) as LoadResult;

		expect(result.process).toEqual(mockProcess);
		expect(result.teams).toEqual([]);
		expect(result.enrollmentSummary).toEqual({
			totalParticipants: 10,
			totalCommitments: 5,
			totalVoted: 3
		});
	});

	it('returns liveState from getProcessState when the /state call succeeds', async () => {
		mockGetProcessState.mockResolvedValue('SEALED');

		const result = (await load({
			params: { id: 'proc-1' },
			locals: mockLocals
		} as any)) as LoadResult;

		expect(result.liveState).toBe('SEALED');
	});

	it('falls back to process.estatus when getProcessState throws a non-404 error', async () => {
		mockGetProcessState.mockRejectedValue(new Error('Network down'));

		const result = (await load({
			params: { id: 'proc-1' },
			locals: mockLocals
		} as any)) as LoadResult;

		// process.estatus is 'COMMITMENT' in mockProcess
		expect(result.liveState).toBe('COMMITMENT');
	});

	it('throws a SvelteKit 404 error when getProcessState returns 404', async () => {
		const { ApiError } = await import('$lib/server/api');
		mockGetProcessState.mockRejectedValue(new ApiError(404, 'API_ERROR', 'Not found'));

		await expect(
			load({
				params: { id: 'missing' },
				locals: mockLocals
			} as any)
		).rejects.toMatchObject({ status: 404 });
	});
});

// =====================================================================
// update-commitment action — /state guard
// =====================================================================

function createFormData(entries: Record<string, string>): FormData {
	const fd = new FormData();
	for (const [key, value] of Object.entries(entries)) {
		fd.append(key, value);
	}
	return fd;
}

function createActionRequest(formData: FormData): Request {
	return new Request('http://localhost/procesos/proc-1?/update-commitment', {
		method: 'POST',
		body: formData
	});
}

describe('actions.update-commitment /state guard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetProcessState.mockResolvedValue('COMMITMENT');
		mockUpdateCommitment.mockResolvedValue(undefined);
	});

	it('calls getProcessState to verify the live state', async () => {
		const formData = createFormData({ commitment: '0xabc123' });
		const request = createActionRequest(formData);

		try {
			await actions['update-commitment']({
				params: { id: 'proc-1' },
				locals: mockLocals,
				request
			} as any);
		} catch {
			// redirect is expected
		}

		expect(mockGetProcessState).toHaveBeenCalledWith('proc-1');
	});

	it('proceeds to updateCommitment when state is COMMITMENT', async () => {
		mockGetProcessState.mockResolvedValue('COMMITMENT');

		const formData = createFormData({ commitment: '0xabc123' });
		const request = createActionRequest(formData);

		try {
			await actions['update-commitment']({
				params: { id: 'proc-1' },
				locals: mockLocals,
				request
			} as any);
		} catch (err: any) {
			// Redirect to detail page is the success path
			expect(err).toHaveProperty('status', 303);
			expect(err).toHaveProperty('location', '/procesos/proc-1');
		}

		expect(mockUpdateCommitment).toHaveBeenCalledWith(mockLocals, 'proc-1', '0xabc123');
	});

	it('fails with 400 when state is OPEN (not yet commitment)', async () => {
		mockGetProcessState.mockResolvedValue('OPEN');

		const formData = createFormData({ commitment: '0xabc123' });
		const request = createActionRequest(formData);

		const result = await actions['update-commitment']({
			params: { id: 'proc-1' },
			locals: mockLocals,
			request
		} as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data).toHaveProperty(
			'error',
			'El proceso no está en fase de compromiso'
		);
		expect(mockUpdateCommitment).not.toHaveBeenCalled();
	});

	it('fails with 400 when state is SEALED (between commitment and voting)', async () => {
		mockGetProcessState.mockResolvedValue('SEALED');

		const formData = createFormData({ commitment: '0xabc123' });
		const request = createActionRequest(formData);

		const result = await actions['update-commitment']({
			params: { id: 'proc-1' },
			locals: mockLocals,
			request
		} as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data).toHaveProperty(
			'error',
			'El proceso no está en fase de compromiso'
		);
		expect(mockUpdateCommitment).not.toHaveBeenCalled();
	});

	it('fails with 400 when state is VOTING (already past commitment)', async () => {
		mockGetProcessState.mockResolvedValue('VOTING');

		const formData = createFormData({ commitment: '0xabc123' });
		const request = createActionRequest(formData);

		const result = await actions['update-commitment']({
			params: { id: 'proc-1' },
			locals: mockLocals,
			request
		} as any);

		expect(result).toHaveProperty('status', 400);
		expect(mockUpdateCommitment).not.toHaveBeenCalled();
	});

	it('fails with 400 when state is COUNTING', async () => {
		mockGetProcessState.mockResolvedValue('COUNTING');

		const formData = createFormData({ commitment: '0xabc123' });
		const request = createActionRequest(formData);

		const result = await actions['update-commitment']({
			params: { id: 'proc-1' },
			locals: mockLocals,
			request
		} as any);

		expect(result).toHaveProperty('status', 400);
		expect(mockUpdateCommitment).not.toHaveBeenCalled();
	});

	it('fails with 400 when state is CLOSED', async () => {
		mockGetProcessState.mockResolvedValue('CLOSED');

		const formData = createFormData({ commitment: '0xabc123' });
		const request = createActionRequest(formData);

		const result = await actions['update-commitment']({
			params: { id: 'proc-1' },
			locals: mockLocals,
			request
		} as any);

		expect(result).toHaveProperty('status', 400);
		expect(mockUpdateCommitment).not.toHaveBeenCalled();
	});

	it('fails with 404 when getProcessState returns a 404 ApiError', async () => {
		const { ApiError } = await import('$lib/server/api');
		mockGetProcessState.mockRejectedValue(new ApiError(404, 'API_ERROR', 'Not found'));

		const formData = createFormData({ commitment: '0xabc123' });
		const request = createActionRequest(formData);

		const result = await actions['update-commitment']({
			params: { id: 'missing' },
			locals: mockLocals,
			request
		} as any);

		expect(result).toHaveProperty('status', 404);
		expect((result as any).data).toHaveProperty('error', 'Proceso no encontrado');
		expect(mockUpdateCommitment).not.toHaveBeenCalled();
	});

	it('fails with 503 when getProcessState throws ProcessStateUnavailableError', async () => {
		const { ProcessStateUnavailableError } = await import(
			'$lib/server/public-process.service'
		);
		mockGetProcessState.mockRejectedValue(
			new ProcessStateUnavailableError('proc-1', new Error('Server down'))
		);

		const formData = createFormData({ commitment: '0xabc123' });
		const request = createActionRequest(formData);

		const result = await actions['update-commitment']({
			params: { id: 'proc-1' },
			locals: mockLocals,
			request
		} as any);

		expect(result).toHaveProperty('status', 503);
		expect(mockUpdateCommitment).not.toHaveBeenCalled();
	});

	it('fails with 400 when commitment is empty or missing', async () => {
		const formData = createFormData({ commitment: '  ' });
		const request = createActionRequest(formData);

		const result = await actions['update-commitment']({
			params: { id: 'proc-1' },
			locals: mockLocals,
			request
		} as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data).toHaveProperty('error', 'El compromiso es obligatorio');
		expect(mockGetProcessState).not.toHaveBeenCalled();
		expect(mockUpdateCommitment).not.toHaveBeenCalled();
	});
});

// =====================================================================
// mark-as-voted action — /state guard
// =====================================================================

describe('actions.mark-as-voted /state guard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetProcessState.mockResolvedValue('VOTING');
		mockMarkAsVoted.mockResolvedValue(undefined);
	});

	it('calls getProcessState to verify the live state', async () => {
		await actions['mark-as-voted']({
			params: { id: 'proc-1' },
			locals: mockLocals,
			request: new Request('http://localhost/procesos/proc-1?/mark-as-voted', { method: 'POST' })
		} as any);

		expect(mockGetProcessState).toHaveBeenCalledWith('proc-1');
	});

	it('proceeds to markAsVoted when state is VOTING', async () => {
		mockGetProcessState.mockResolvedValue('VOTING');

		const result = await actions['mark-as-voted']({
			params: { id: 'proc-1' },
			locals: mockLocals,
			request: new Request('http://localhost/procesos/proc-1?/mark-as-voted', { method: 'POST' })
		} as any);

		expect(result).toEqual({ success: true });
		expect(mockMarkAsVoted).toHaveBeenCalledWith(mockLocals, 'proc-1');
	});

	it('fails with 400 when state is COMMITMENT', async () => {
		mockGetProcessState.mockResolvedValue('COMMITMENT');

		const result = await actions['mark-as-voted']({
			params: { id: 'proc-1' },
			locals: mockLocals,
			request: new Request('http://localhost/procesos/proc-1?/mark-as-voted', { method: 'POST' })
		} as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data).toHaveProperty('error', 'El proceso no está en fase de votación');
		expect(mockMarkAsVoted).not.toHaveBeenCalled();
	});

	it('fails with 400 when state is OPEN', async () => {
		mockGetProcessState.mockResolvedValue('OPEN');

		const result = await actions['mark-as-voted']({
			params: { id: 'proc-1' },
			locals: mockLocals,
			request: new Request('http://localhost/procesos/proc-1?/mark-as-voted', { method: 'POST' })
		} as any);

		expect(result).toHaveProperty('status', 400);
		expect(mockMarkAsVoted).not.toHaveBeenCalled();
	});

	it('fails with 503 when getProcessState throws ProcessStateUnavailableError', async () => {
		const { ProcessStateUnavailableError } = await import(
			'$lib/server/public-process.service'
		);
		mockGetProcessState.mockRejectedValue(
			new ProcessStateUnavailableError('proc-1', new Error('Server down'))
		);

		const result = await actions['mark-as-voted']({
			params: { id: 'proc-1' },
			locals: mockLocals,
			request: new Request('http://localhost/procesos/proc-1?/mark-as-voted', { method: 'POST' })
		} as any);

		expect(result).toHaveProperty('status', 503);
		expect(mockMarkAsVoted).not.toHaveBeenCalled();
	});

	it('fails with the ApiError status when markAsVoted throws ApiError', async () => {
		mockGetProcessState.mockResolvedValue('VOTING');
		const { ApiError } = await import('$lib/server/api');
		mockMarkAsVoted.mockRejectedValue(new ApiError(422, 'API_ERROR', 'Invalid state'));

		const result = await actions['mark-as-voted']({
			params: { id: 'proc-1' },
			locals: mockLocals,
			request: new Request('http://localhost/procesos/proc-1?/mark-as-voted', { method: 'POST' })
		} as any);

		expect(result).toHaveProperty('status', 422);
		expect((result as any).data).toHaveProperty('error', 'Invalid state');
	});
});
