import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiError } from './api';
import type { ElectoralProcess } from '$lib/types/electoral-process';

// ── Mocks (hoisted so vi.mock factory can reference them) ──
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

// ── Import after mocks ──
import { createGroup, syncMembers } from './relayer.service';

type SyncMembersResult = {
	count: number;
	transactionHash: string | null;
};

// ── Helpers ──
const mockLocals = {} as App.Locals;

const createMockProcess = (overrides?: Partial<ElectoralProcess>): ElectoralProcess => ({
	id: 'proc-1',
	name: 'Test Process',
	scope: 'Nacional',
	description: null,
	groupId: null,
	estatus: 'SEALED',
	commitmentStart: '2026-01-01',
	commitmentEnd: '2026-02-01',
	votingStart: '2026-03-01',
	votingEnd: '2026-03-05',
	results: '2026-03-10',
	createdBy: 'user-1',
	...overrides
});

beforeEach(() => {
	vi.clearAllMocks();
});

// ── Tests ──
describe('createGroup', () => {
	it('calls POST /api/private/processes/{id}/groups and returns the ElectoralProcess', async () => {
		const mockProcess = createMockProcess({ groupId: '0xabc123' });
		mockFetchBackendJson.mockResolvedValue(mockProcess);

		const result = await createGroup(mockLocals, 'proc-1');

		expect(mockFetchBackendJson).toHaveBeenCalledWith(
			mockLocals,
			'/api/private/processes/proc-1/groups',
			{ method: 'POST' }
		);
		expect(result).toEqual(mockProcess);
	});

	it('returns the updated groupId from the response', async () => {
		const mockProcess = createMockProcess({ groupId: '0xgroup-onchain' });
		mockFetchBackendJson.mockResolvedValue(mockProcess);

		const result = await createGroup(mockLocals, 'proc-1');

		expect(result.groupId).toBe('0xgroup-onchain');
	});

	it('propagates ApiError(400) when the process is not in SEALED state', async () => {
		const apiError = new ApiError(400, 'BAD_REQUEST', 'Group can only be created during SEALED window');
		mockFetchBackendJson.mockRejectedValue(apiError);

		await expect(createGroup(mockLocals, 'proc-1')).rejects.toThrow(ApiError);
	});

	it('propagates ApiError(404) when the process does not exist', async () => {
		const apiError = new ApiError(404, 'NOT_FOUND', 'Electoral process not found');
		mockFetchBackendJson.mockRejectedValue(apiError);

		await expect(createGroup(mockLocals, 'missing')).rejects.toThrow(ApiError);
	});
});

// ── syncMembers tests ──
describe('syncMembers', () => {
	function mockSyncResponse(data: SyncMembersResult) {
		return {
			success: true,
			message: 'OK',
			data,
			timestamp: '2026-01-01T00:00:00Z'
		};
	}

	it('calls POST /api/private/processes/{id}/members and returns { count, transactionHash }', async () => {
		mockFetchBackendJson.mockResolvedValue(
			mockSyncResponse({ count: 5, transactionHash: '0xtxhash' })
		);

		const result = await syncMembers(mockLocals, 'proc-1');

		expect(mockFetchBackendJson).toHaveBeenCalledWith(
			mockLocals,
			'/api/private/processes/proc-1/members',
			{ method: 'POST' }
		);
		expect(result).toEqual({ count: 5, transactionHash: '0xtxhash' });
	});

	it('returns count and transactionHash from the response', async () => {
		mockFetchBackendJson.mockResolvedValue(
			mockSyncResponse({ count: 12, transactionHash: '0xother' })
		);

		const result = await syncMembers(mockLocals, 'proc-1');

		expect(result.count).toBe(12);
		expect(result.transactionHash).toBe('0xother');
	});

	it('propagates ApiError(400) when no group has been created yet', async () => {
		const apiError = new ApiError(400, 'BAD_REQUEST', 'No group assigned to this process');
		mockFetchBackendJson.mockRejectedValue(apiError);

		await expect(syncMembers(mockLocals, 'proc-1')).rejects.toThrow(ApiError);
	});

	it('propagates ApiError(404) when the process does not exist', async () => {
		const apiError = new ApiError(404, 'NOT_FOUND', 'Electoral process not found');
		mockFetchBackendJson.mockRejectedValue(apiError);

		await expect(syncMembers(mockLocals, 'missing')).rejects.toThrow(ApiError);
	});
});
