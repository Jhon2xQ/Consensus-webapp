import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiError } from './api';
import type { ElectoralProcess } from '$lib/types/electoral-process';
import type { PaginatedResponse } from '$lib/types/api-response';

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
import { getMyProcesses } from './process.service';

// ── Helpers ──
const mockLocals = {} as App.Locals;

const createMockProcess = (overrides?: Partial<ElectoralProcess>): ElectoralProcess => ({
	id: '1',
	name: 'Test Process',
	scope: 'Nacional',
	description: null,
	estatus: 'COMMITMENT',
	commitmentStart: '2026-01-01',
	commitmentEnd: '2026-02-01',
	votingStart: '2026-03-01',
	votingEnd: '2026-03-05',
	results: '2026-03-10',
	...overrides
});

function mockPaginatedResponse(processes: ElectoralProcess[], size = 5): PaginatedResponse<ElectoralProcess> {
	return {
		success: true,
		message: 'OK',
		data: {
			content: processes,
			page: 0,
			size,
			totalElements: processes.length,
			totalPages: processes.length > 0 ? 1 : 0
		},
		timestamp: '2026-01-01T00:00:00Z'
	};
}

beforeEach(() => {
	vi.clearAllMocks();
});

// ── Tests ──
describe('getMyProcesses', () => {
	it('returns unwrapped content from PaginatedResponse', async () => {
		const mockProcess = createMockProcess();
		mockFetchBackendJson.mockResolvedValue(mockPaginatedResponse([mockProcess]));

		const result = await getMyProcesses(mockLocals);

		expect(result).toEqual([mockProcess]);
		expect(result).toHaveLength(1);
	});

	it('returns empty array when content is empty', async () => {
		mockFetchBackendJson.mockResolvedValue(mockPaginatedResponse([], 5));

		const result = await getMyProcesses(mockLocals);

		expect(result).toEqual([]);
		expect(result).toHaveLength(0);
	});

	it('passes size param as query string (?size=10)', async () => {
		mockFetchBackendJson.mockResolvedValue(mockPaginatedResponse([], 10));

		await getMyProcesses(mockLocals, { size: 10 });

		expect(mockFetchBackendJson).toHaveBeenCalledWith(
			mockLocals,
			expect.stringContaining('size=10')
		);
	});

	it('defaults to size=5 when no params provided', async () => {
		mockFetchBackendJson.mockResolvedValue(mockPaginatedResponse([], 5));

		await getMyProcesses(mockLocals);

		expect(mockFetchBackendJson).toHaveBeenCalledWith(
			mockLocals,
			expect.stringContaining('size=5')
		);
	});

	it('propagates ApiError from fetchBackendJson', async () => {
		const apiError = new ApiError(401, 'UNAUTHORIZED', 'No estás autenticado');
		mockFetchBackendJson.mockRejectedValue(apiError);

		await expect(getMyProcesses(mockLocals)).rejects.toThrow(ApiError);
	});
});
