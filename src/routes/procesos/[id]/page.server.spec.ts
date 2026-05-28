import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server';

// Mocks
const mockGetPublicProcessById = vi.hoisted(() => vi.fn());
const mockGetPublicTeamsForProcess = vi.hoisted(() => vi.fn());
const mockGetPublicEnrollmentSummary = vi.hoisted(() => vi.fn());
const mockGetUserEnrollment = vi.hoisted(() => vi.fn());

vi.mock('$lib/server/public-process.service', () => ({
	getPublicProcessById: mockGetPublicProcessById
}));

vi.mock('$lib/server/team.service', () => ({
	getPublicTeamsForProcess: mockGetPublicTeamsForProcess
}));

vi.mock('$lib/server/public-enrollment.service', () => ({
	getPublicEnrollmentSummary: mockGetPublicEnrollmentSummary
}));

vi.mock('$lib/server/enrollment.service', () => ({
	getUserEnrollment: mockGetUserEnrollment
}));

vi.mock('@sveltejs/kit', () => ({
	error: (status: number, message: string) => {
		throw { status, message };
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
		mockGetPublicTeamsForProcess.mockResolvedValue([]);
		mockGetPublicEnrollmentSummary.mockResolvedValue({
			totalParticipants: 10,
			totalCommitments: 5,
			totalVoted: 3
		});
	});

	it('includes userSub from locals.user.sub', async () => {
		const result = await load({
			params: { id: 'proc-1' },
			locals: mockLocals
		} as any);

		expect(result.userSub).toBe('user-abc-123');
	});

	it('returns null userSub when user is not authenticated', async () => {
		const result = await load({
			params: { id: 'proc-1' },
			locals: { logtoClient: {} }
		} as any);

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

		const result = await load({
			params: { id: 'proc-1' },
			locals: mockLocals
		} as any);

		expect(mockGetUserEnrollment).toHaveBeenCalledWith(mockLocals, 'proc-1', 'user-abc-123');
		expect(result.userEnrollment).toEqual(mockEnrollment);
	});

	it('returns null userEnrollment when user is not authenticated', async () => {
		const result = await load({
			params: { id: 'proc-1' },
			locals: { logtoClient: {} }
		} as any);

		expect(mockGetUserEnrollment).not.toHaveBeenCalled();
		expect(result.userEnrollment).toBeNull();
	});

	it('returns null userEnrollment when getUserEnrollment throws', async () => {
		mockGetUserEnrollment.mockRejectedValue(new Error('API error'));

		const result = await load({
			params: { id: 'proc-1' },
			locals: mockLocals
		} as any);

		expect(result.userEnrollment).toBeNull();
	});

	it('still returns existing fields (process, teams, enrollmentSummary)', async () => {
		const result = await load({
			params: { id: 'proc-1' },
			locals: mockLocals
		} as any);

		expect(result.process).toEqual(mockProcess);
		expect(result.teams).toEqual([]);
		expect(result.enrollmentSummary).toEqual({
			totalParticipants: 10,
			totalCommitments: 5,
			totalVoted: 3
		});
	});
});
