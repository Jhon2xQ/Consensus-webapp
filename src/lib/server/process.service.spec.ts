import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiError } from './api';
import type { ElectoralProcess } from '$lib/types/electoral-process';
import type { PaginatedResponse } from '$lib/types/api-response';

// ── Mocks (hoisted so vi.mock factory can reference them) ──
const { mockFetchBackendJson, mockFetchBackend } = vi.hoisted(() => ({
	mockFetchBackendJson: vi.fn(),
	mockFetchBackend: vi.fn()
}));

vi.mock('$lib/server/api', async (importOriginal) => {
	const actual = (await importOriginal()) as typeof import('./api');
	return {
		...actual,
		fetchBackendJson: mockFetchBackendJson,
		fetchBackend: mockFetchBackend
	};
});

// ── Import after mocks ──
import { getMyProcesses, getProcessById, createProcess, updateProcess, deleteProcess } from './process.service';
import type { CreateProcessBody } from './process.service';
import type { ApiResponse } from '$lib/types/api-response';

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
	createdBy: 'user-1',
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

// ── getProcessById tests ──
describe('getProcessById', () => {
	function mockApiResponse<T>(data: T): ApiResponse<T> {
		return {
			success: true,
			message: 'OK',
			data,
			timestamp: '2026-01-01T00:00:00Z'
		};
	}

	it('calls GET /api/private/processes/{id} and unwraps ApiResponse.data', async () => {
		const mockProcess = createMockProcess();
		mockFetchBackendJson.mockResolvedValue(mockApiResponse(mockProcess));

		const result = await getProcessById(mockLocals, 'proc-1');

		expect(mockFetchBackendJson).toHaveBeenCalledWith(
			mockLocals,
			'/api/private/processes/proc-1'
		);
		expect(result).toEqual(mockProcess);
	});

	it('returns the unwrapped ElectoralProcess with correct fields', async () => {
		const mockProcess = createMockProcess({ id: 'proc-xyz', name: 'Proceso Específico' });
		mockFetchBackendJson.mockResolvedValue(mockApiResponse(mockProcess));

		const result = await getProcessById(mockLocals, 'proc-xyz');

		expect(result.id).toBe('proc-xyz');
		expect(result.name).toBe('Proceso Específico');
		expect(result.scope).toBe('Nacional');
	});

	it('propagates ApiError (e.g. 404 not found)', async () => {
		const apiError = new ApiError(404, 'NOT_FOUND', 'Proceso no encontrado');
		mockFetchBackendJson.mockRejectedValue(apiError);

		await expect(getProcessById(mockLocals, 'no-existe')).rejects.toThrow(ApiError);
	});
});

// ── createProcess tests ──
describe('createProcess', () => {
	const createBody: CreateProcessBody = {
		name: 'Nuevo Proceso',
		scope: 'Nacional',
		description: 'Descripción de prueba',
		commitmentStart: '2026-06-01',
		commitmentEnd: '2026-06-15',
		votingStart: '2026-07-01',
		votingEnd: '2026-07-15',
		results: '2026-07-20'
	};

	it('calls POST /api/private/processes with correct body', async () => {
		const mockProcess = createMockProcess({ name: 'Nuevo Proceso' });
		mockFetchBackendJson.mockResolvedValue(mockProcess);

		const result = await createProcess(mockLocals, createBody);

		expect(mockFetchBackendJson).toHaveBeenCalledWith(mockLocals, '/api/private/processes', {
			method: 'POST',
			body: createBody
		});
		expect(result).toEqual(mockProcess);
	});

	it('returns the created ElectoralProcess', async () => {
		const mockProcess = createMockProcess({ id: 'new-id', name: 'Nuevo Proceso' });
		mockFetchBackendJson.mockResolvedValue(mockProcess);

		const result = await createProcess(mockLocals, createBody);

		expect(result.id).toBe('new-id');
		expect(result.name).toBe('Nuevo Proceso');
	});

	it('propagates ApiError (e.g. 409 conflict)', async () => {
		const apiError = new ApiError(409, 'CONFLICT', 'Ya existe un proceso con ese nombre');
		mockFetchBackendJson.mockRejectedValue(apiError);

		await expect(createProcess(mockLocals, createBody)).rejects.toThrow(ApiError);
	});
});

// ── updateProcess tests ──
describe('updateProcess', () => {
	const updateBody: Partial<CreateProcessBody> = {
		name: 'Proceso Actualizado',
		scope: 'Provincial'
	};

	it('calls PUT /api/private/processes/{id} with correct path and body', async () => {
		const mockProcess = createMockProcess({ id: 'proc-1', name: 'Proceso Actualizado' });
		mockFetchBackendJson.mockResolvedValue(mockProcess);

		const result = await updateProcess(mockLocals, 'proc-1', updateBody);

		expect(mockFetchBackendJson).toHaveBeenCalledWith(
			mockLocals,
			'/api/private/processes/proc-1',
			{
				method: 'PUT',
				body: updateBody
			}
		);
		expect(result).toEqual(mockProcess);
	});

	it('propagates ApiError (e.g. 404 not found)', async () => {
		const apiError = new ApiError(404, 'NOT_FOUND', 'Proceso no encontrado');
		mockFetchBackendJson.mockRejectedValue(apiError);

		await expect(updateProcess(mockLocals, 'no-existe', updateBody)).rejects.toThrow(ApiError);
	});
});

// ── deleteProcess tests ──
describe('deleteProcess', () => {
	it('calls DELETE /api/private/processes/{id} with correct path', async () => {
		mockFetchBackend.mockResolvedValue(new Response(null, { status: 204 }));

		await deleteProcess(mockLocals, 'proc-1');

		expect(mockFetchBackend).toHaveBeenCalledWith(
			mockLocals,
			'/api/private/processes/proc-1',
			{
				method: 'DELETE'
			}
		);
	});

	it('returns void on success', async () => {
		mockFetchBackend.mockResolvedValue(new Response(null, { status: 204 }));

		const result = await deleteProcess(mockLocals, 'proc-1');

		expect(result).toBeUndefined();
	});

	it('propagates ApiError (e.g. 403 forbidden)', async () => {
		const apiError = new ApiError(403, 'FORBIDDEN', 'No tienes permisos');
		mockFetchBackend.mockRejectedValue(apiError);

		await expect(deleteProcess(mockLocals, 'proc-1')).rejects.toThrow(ApiError);
	});
});
