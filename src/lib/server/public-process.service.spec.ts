import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ElectoralProcess } from '$lib/types/electoral-process';
import type { PaginatedResponse } from '$lib/types/api-response';
import { ApiError } from './api';

// ── Mocks (hoisted so vi.mock factory can reference them) ──
const { mockFetchPublicJson } = vi.hoisted(() => ({
	mockFetchPublicJson: vi.fn()
}));

vi.mock('$lib/server/api', async (importOriginal) => {
	const actual = (await importOriginal()) as typeof import('./api');
	return {
		...actual,
		fetchPublicJson: mockFetchPublicJson
	};
});

// ── Import after mocks ──
import { getPublicProcesses } from './public-process.service';

const mockProcess: ElectoralProcess = {
	id: '1',
	name: 'Test Process',
	scope: 'Nacional',
	description: 'A test process',
	estatus: 'COMMITMENT',
	commitmentStart: '2026-01-01T00:00:00Z',
	commitmentEnd: '2026-02-01T00:00:00Z',
	votingStart: '2026-03-01T00:00:00Z',
	votingEnd: '2026-03-05T00:00:00Z',
	results: '2026-03-10T00:00:00Z',
	createdBy: 'user-1'
};

function mockPaginatedResponse(
	processes: ElectoralProcess[],
	page: number,
	size: number,
	totalElements: number
): PaginatedResponse<ElectoralProcess> {
	return {
		success: true,
		message: 'OK',
		data: {
			content: processes,
			page,
			size,
			totalElements,
			totalPages: Math.ceil(totalElements / size)
		},
		timestamp: '2026-01-01T00:00:00Z'
	};
}

describe('getPublicProcesses', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls fetchPublicJson with path /api/public/processes and default query params', async () => {
		mockFetchPublicJson.mockResolvedValue(mockPaginatedResponse([mockProcess], 0, 5, 1));

		await getPublicProcesses({ page: 1, size: 5 });

		expect(mockFetchPublicJson).toHaveBeenCalledTimes(1);
		expect(mockFetchPublicJson).toHaveBeenCalledWith('/api/public/processes?page=1&size=5&sort=name%2Casc');
	});

	it('accepts custom page and size params', async () => {
		mockFetchPublicJson.mockResolvedValue(mockPaginatedResponse([], 1, 10, 0));

		await getPublicProcesses({ page: 2, size: 10 });

		expect(mockFetchPublicJson).toHaveBeenCalledWith('/api/public/processes?page=2&size=10&sort=name%2Casc');
	});

	it('defaults page to 0 and size to 5 when not provided', async () => {
		mockFetchPublicJson.mockResolvedValue(mockPaginatedResponse([mockProcess], 0, 5, 1));

		await getPublicProcesses({});

		expect(mockFetchPublicJson).toHaveBeenCalledWith('/api/public/processes?page=0&size=5&sort=name%2Casc');
	});

	it('returns unwrapped { processes, page, size, totalPages, totalElements }', async () => {
		mockFetchPublicJson.mockResolvedValue(mockPaginatedResponse([mockProcess], 0, 5, 1));

		const result = await getPublicProcesses({ page: 1, size: 5 });

		expect(result).toEqual({
			processes: [mockProcess],
			page: 0,
			size: 5,
			totalPages: 1,
			totalElements: 1
		});
	});

	it('returns empty processes when content is empty', async () => {
		mockFetchPublicJson.mockResolvedValue(mockPaginatedResponse([], 0, 5, 0));

		const result = await getPublicProcesses({ page: 1, size: 5 });

		expect(result.processes).toEqual([]);
		expect(result.totalElements).toBe(0);
		expect(result.totalPages).toBe(0);
	});

	it('handles multiple processes and calculates totalPages correctly', async () => {
		const processes = [
			{ ...mockProcess, id: '1' },
			{ ...mockProcess, id: '2' },
			{ ...mockProcess, id: '3' }
		];
		mockFetchPublicJson.mockResolvedValue(mockPaginatedResponse(processes, 0, 3, 7));

		const result = await getPublicProcesses({ page: 1, size: 3 });

		expect(result.processes).toHaveLength(3);
		expect(result.totalElements).toBe(7);
		expect(result.totalPages).toBe(3);
	});

	it('propagates ApiError from fetchPublicJson', async () => {
		const apiError = new ApiError(500, 'API_ERROR', 'Internal server error');
		mockFetchPublicJson.mockRejectedValue(apiError);

		await expect(getPublicProcesses({ page: 1, size: 5 })).rejects.toThrow(apiError);
	});

	it('propagates network errors from fetchPublicJson', async () => {
		const networkError = new Error('Failed to fetch');
		mockFetchPublicJson.mockRejectedValue(networkError);

		await expect(getPublicProcesses({ page: 1, size: 5 })).rejects.toThrow('Failed to fetch');
	});
});
