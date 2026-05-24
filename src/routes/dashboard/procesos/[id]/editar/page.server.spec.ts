import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiError } from '$lib/server/api';

// ── Hoisted mocks (required for vi.mock factory to reference them) ──
const {
	mockGetProcessById,
	mockUpdateProcess,
	mockDeleteProcess
} = vi.hoisted(() => ({
	mockGetProcessById: vi.fn(),
	mockUpdateProcess: vi.fn(),
	mockDeleteProcess: vi.fn()
}));

vi.mock('$lib/server/process.service', async (importOriginal) => {
	const actual = (await importOriginal()) as object;
	return {
		...actual,
		getProcessById: mockGetProcessById,
		updateProcess: mockUpdateProcess,
		deleteProcess: mockDeleteProcess
	};
});

// ── Import after mocks ──
import { actions, load } from './+page.server';

const mockLocals = {} as App.Locals;
const mockParams = { id: 'proc-123' };

function createFormData(entries: Record<string, string>): FormData {
	const fd = new FormData();
	for (const [key, value] of Object.entries(entries)) {
		fd.append(key, value);
	}
	return fd;
}

function createRequest(formData: FormData): Request {
	return new Request('http://localhost/test', {
		method: 'POST',
		body: formData
	});
}

beforeEach(() => {
	vi.clearAllMocks();
});

// ============================================================
// load function
// ============================================================
describe('load function', () => {
	it('returns process without teams/enrollments', async () => {
		const mockProcess = {
			id: 'proc-123',
			name: 'Elecciones 2026',
			description: 'Proceso de prueba',
			commitmentStart: '2026-01-01T00:00:00Z',
			commitmentEnd: '2026-02-01T00:00:00Z',
			votingStart: '2026-03-01T00:00:00Z',
			votingEnd: '2026-03-15T00:00:00Z',
			results: '2026-04-01T00:00:00Z',
			scope: 'Elecciones 2026',
			status: 'draft',
			createdBy: 'user-1'
		};
		mockGetProcessById.mockResolvedValue(mockProcess);

		const result = await load({
			params: mockParams,
			locals: mockLocals
		} as any);

		expect(mockGetProcessById).toHaveBeenCalledWith(mockLocals, 'proc-123');
		expect(result).toEqual({ process: mockProcess });
		expect(result).not.toHaveProperty('teams');
		expect(result).not.toHaveProperty('enrollments');
	});

	it('loads process with a different id from params', async () => {
		const mockProcess = {
			id: 'proc-999',
			name: 'Otro Proceso',
			description: null,
			commitmentStart: '2026-06-01T00:00:00Z',
			commitmentEnd: '2026-07-01T00:00:00Z',
			votingStart: '2026-08-01T00:00:00Z',
			votingEnd: '2026-08-15T00:00:00Z',
			results: '2026-09-01T00:00:00Z',
			scope: 'Otro Proceso',
			status: 'active',
			createdBy: 'user-2'
		};
		mockGetProcessById.mockResolvedValue(mockProcess);

		const result = await load({
			params: { id: 'proc-999' },
			locals: mockLocals
		} as any);

		expect(mockGetProcessById).toHaveBeenCalledWith(mockLocals, 'proc-999');
		expect(result).toEqual({ process: mockProcess });
		expect(result).not.toHaveProperty('teams');
	});

	it('throws 404 error when process is not found', async () => {
		mockGetProcessById.mockRejectedValue(
			new ApiError(404, 'NOT_FOUND', 'Proceso no encontrado')
		);

		try {
			await load({
				params: mockParams,
				locals: mockLocals
			} as any);
			expect(true).toBe(false); // Should not reach here
		} catch (err: any) {
			expect(err).toHaveProperty('status', 404);
			expect(err).toHaveProperty('body');
			expect(err.body).toHaveProperty('message', 'Proceso electoral no encontrado');
		}
	});
});

// ============================================================
// eliminar action (existing — verify it still works)
// ============================================================
describe('eliminar action', () => {
	it('calls deleteProcess and throws redirect on success', async () => {
		mockDeleteProcess.mockResolvedValue(undefined);

		try {
			await actions.eliminar({
				params: mockParams,
				locals: mockLocals
			} as any);
			// Should not reach here — redirect throws
			expect(true).toBe(false);
		} catch (err: any) {
			expect(err).toHaveProperty('status', 303);
			expect(err).toHaveProperty('location');
		}

		expect(mockDeleteProcess).toHaveBeenCalledWith(mockLocals, 'proc-123');
	});

	it('returns fail with ApiError status when deletion fails', async () => {
		mockDeleteProcess.mockRejectedValue(
			new ApiError(403, 'FORBIDDEN', 'No tienes permisos')
		);

		const result = await actions.eliminar({
			params: mockParams,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 403);
		expect((result as any).data.errors).toHaveProperty('_form');
	});
});

// ============================================================
// default action (update process)
// ============================================================
describe('default action', () => {
	it('derives body.scope from name instead of reading scope from FormData', async () => {
		mockUpdateProcess.mockResolvedValue({});

		const formData = createFormData({
			name: 'Elecciones 2026',
			description: 'Test',
			commitmentStart: '2026-01-01T10:00',
			commitmentEnd: '2026-02-01T10:00',
			votingStart: '2026-03-01T10:00',
			votingEnd: '2026-03-15T10:00',
			results: '2026-04-01T10:00'
		});
		const request = createRequest(formData);

		try {
			await actions.default({
				request,
				params: mockParams,
				locals: mockLocals
			} as any);
		} catch (err: any) {
			// Redirect is expected — body was set before redirect
			expect(err).toHaveProperty('status', 303);
		}

		expect(mockUpdateProcess).toHaveBeenCalled();
		const updateBody = mockUpdateProcess.mock.calls[0][2];
		expect(updateBody.scope).toBe('Elecciones 2026');
		expect(updateBody.name).toBe('Elecciones 2026');
	});

	it('sends all fields in the update body with ISO-8601 conversion', async () => {
		mockUpdateProcess.mockResolvedValue({});

		const formData = createFormData({
			name: 'Elecciones Actualizadas',
			description: 'Nueva descripción',
			commitmentStart: '2026-05-01T08:00',
			commitmentEnd: '2026-06-01T08:00',
			votingStart: '2026-07-01T08:00',
			votingEnd: '2026-07-15T08:00',
			results: '2026-08-01T08:00'
		});
		const request = createRequest(formData);

		try {
			await actions.default({
				request,
				params: { id: 'proc-456' },
				locals: mockLocals
			} as any);
		} catch (err: any) {
			expect(err).toHaveProperty('status', 303);
		}

		expect(mockUpdateProcess).toHaveBeenCalledWith(mockLocals, 'proc-456', expect.objectContaining({
			name: 'Elecciones Actualizadas',
			scope: 'Elecciones Actualizadas',
			description: 'Nueva descripción'
		}));

		// Verify ISO-8601 conversion: timestamps end with 'Z' (UTC)
		const updateBody = mockUpdateProcess.mock.calls[0][2];
		expect(updateBody.commitmentStart).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
		expect(updateBody.commitmentEnd).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
		expect(updateBody.votingStart).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
		expect(updateBody.votingEnd).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
		expect(updateBody.results).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
	});

	it('returns fail(409) when update process conflicts (duplicate name)', async () => {
		mockUpdateProcess.mockRejectedValue(
			new ApiError(409, 'CONFLICT', 'Ya existe un proceso con ese nombre')
		);

		const formData = createFormData({
			name: 'Nombre Duplicado',
			commitmentStart: '2026-01-01T10:00',
			commitmentEnd: '2026-02-01T10:00',
			votingStart: '2026-03-01T10:00',
			votingEnd: '2026-03-15T10:00',
			results: '2026-04-01T10:00'
		});
		const request = createRequest(formData);

		const result = await actions.default({
			request,
			params: mockParams,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 409);
		expect((result as any).data.errors).toHaveProperty('name', 'Ya existe un proceso con ese nombre');
		// Should preserve submitted values on conflict
		expect((result as any).data.values).toHaveProperty('name', 'Nombre Duplicado');
	});

	it('validates date ordering: votingStart must be after commitmentEnd', async () => {
		const formData = createFormData({
			name: 'Proceso Test',
			commitmentStart: '2026-01-01T10:00',
			commitmentEnd: '2026-03-01T10:00',
			votingStart: '2026-02-01T10:00', // Before commitmentEnd
			votingEnd: '2026-04-01T10:00',
			results: '2026-05-01T10:00'
		});
		const request = createRequest(formData);

		const result = await actions.default({
			request,
			params: mockParams,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('votingStart');
		expect(mockUpdateProcess).not.toHaveBeenCalled();
	});

	it('does NOT validate scope field (removed from required validation)', async () => {
		mockUpdateProcess.mockResolvedValue({});

		const formData = createFormData({
			name: 'Elecciones 2026',
			description: 'Test',
			commitmentStart: '2026-01-01T10:00',
			commitmentEnd: '2026-02-01T10:00',
			votingStart: '2026-03-01T10:00',
			votingEnd: '2026-03-15T10:00',
			results: '2026-04-01T10:00'
		});
		const request = createRequest(formData);

		try {
			await actions.default({
				request,
				params: mockParams,
				locals: mockLocals
			} as any);
		} catch (err: any) {
			// Redirect means validation passed (no fail() returned)
			expect(err).toHaveProperty('status', 303);
		}

		// Should NOT have returned fail due to missing scope
		expect(mockUpdateProcess).toHaveBeenCalled();
	});

	it('still validates other required fields (name, dates)', async () => {
		const formData = createFormData({ name: '' });
		const request = createRequest(formData);

		const result = await actions.default({
			request,
			params: mockParams,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('name');
		// scope should NOT be in errors anymore
		expect((result as any).data.errors).not.toHaveProperty('scope');
	});
});
