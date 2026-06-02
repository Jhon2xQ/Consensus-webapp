import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiError } from '$lib/server/api';

// ── Hoisted mocks ──
const { mockDeleteProcess, mockCreateGroup, mockSyncMembers } = vi.hoisted(() => ({
	mockDeleteProcess: vi.fn(),
	mockCreateGroup: vi.fn(),
	mockSyncMembers: vi.fn()
}));

vi.mock('$lib/server/process.service', async (importOriginal) => {
	const actual = (await importOriginal()) as object;
	return {
		...actual,
		deleteProcess: mockDeleteProcess
	};
});

vi.mock('$lib/server/relayer.service', async (importOriginal) => {
	const actual = (await importOriginal()) as object;
	return {
		...actual,
		createGroup: mockCreateGroup,
		syncMembers: mockSyncMembers
	};
});

// ── Import after mocks ──
import { actions } from './+page.server';

const mockLocals = {} as App.Locals;

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
// delete action
// ============================================================
describe('delete action', () => {
	it('calls deleteProcess with correct id and redirects with success', async () => {
		mockDeleteProcess.mockResolvedValue(undefined);

		const formData = createFormData({ id: 'proc-123' });
		const request = createRequest(formData);

		await expect(
			actions.delete({ request, locals: mockLocals } as any)
		).rejects.toMatchObject({
			status: 303,
			location: '/dashboard/procesos?success=Proceso+eliminado+exitosamente'
		});

		expect(mockDeleteProcess).toHaveBeenCalledWith(mockLocals, 'proc-123');
	});

	it('returns fail(400) when id is missing from formData', async () => {
		const formData = createFormData({ otherField: 'value' });
		const request = createRequest(formData);

		const result = await actions.delete({
			request,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.error).toBe('ID de proceso requerido');
		expect(mockDeleteProcess).not.toHaveBeenCalled();
	});

	it('returns fail(401) when deleteProcess throws ApiError 401', async () => {
		mockDeleteProcess.mockRejectedValue(
			new ApiError(401, 'UNAUTHORIZED', 'Not authenticated')
		);

		const formData = createFormData({ id: 'proc-123' });
		const request = createRequest(formData);

		const result = await actions.delete({
			request,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 401);
		expect((result as any).data.error).toBe('No estás autenticado');
	});

	it('returns fail(404) when deleteProcess throws ApiError 404', async () => {
		mockDeleteProcess.mockRejectedValue(
			new ApiError(404, 'NOT_FOUND', 'Proceso no encontrado')
		);

		const formData = createFormData({ id: 'proc-456' });
		const request = createRequest(formData);

		const result = await actions.delete({
			request,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 404);
		expect((result as any).data.error).toBe('Proceso no encontrado');
	});

	it('returns fail(500) on non-ApiError exception', async () => {
		mockDeleteProcess.mockRejectedValue(new Error('Network failure'));

		const formData = createFormData({ id: 'proc-789' });
		const request = createRequest(formData);

		const result = await actions.delete({
			request,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 500);
		expect((result as any).data.error).toBe('Error al eliminar el proceso');
	});
});

// ============================================================
// createGroup action
// ============================================================
describe('createGroup action', () => {
	it('calls createGroup and redirects with success message', async () => {
		mockCreateGroup.mockResolvedValue({
			id: 'proc-1',
			name: 'Proceso',
			groupId: '0xabc',
			estatus: 'SEALED'
		});

		const formData = createFormData({ id: 'proc-1' });
		const request = createRequest(formData);

		await expect(
			actions.createGroup({ request, locals: mockLocals } as any)
		).rejects.toMatchObject({
			status: 303,
			location: '/dashboard/procesos?success=Grupo+creado+exitosamente'
		});

		expect(mockCreateGroup).toHaveBeenCalledWith(mockLocals, 'proc-1');
	});

	it('returns fail(400) when createGroup throws ApiError 400 (wrong state)', async () => {
		mockCreateGroup.mockRejectedValue(
			new ApiError(400, 'BAD_REQUEST', 'Group can only be created during SEALED window')
		);

		const formData = createFormData({ id: 'proc-1' });
		const request = createRequest(formData);

		const result = await actions.createGroup({
			request,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.error).toBe('El proceso ya no está en estado Sellado');
	});

	it('returns fail(401) when createGroup throws ApiError 401', async () => {
		mockCreateGroup.mockRejectedValue(new ApiError(401, 'UNAUTHORIZED', 'Not authenticated'));

		const formData = createFormData({ id: 'proc-1' });
		const request = createRequest(formData);

		const result = await actions.createGroup({
			request,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 401);
		expect((result as any).data.error).toBe('No estás autenticado');
	});

	it('returns fail(404) when createGroup throws ApiError 404', async () => {
		mockCreateGroup.mockRejectedValue(new ApiError(404, 'NOT_FOUND', 'Proceso no encontrado'));

		const formData = createFormData({ id: 'missing' });
		const request = createRequest(formData);

		const result = await actions.createGroup({
			request,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 404);
		expect((result as any).data.error).toBe('Proceso no encontrado');
	});

	it('returns fail(409) when createGroup throws ApiError 409 (already has group)', async () => {
		mockCreateGroup.mockRejectedValue(new ApiError(409, 'CONFLICT', 'Already has a group'));

		const formData = createFormData({ id: 'proc-1' });
		const request = createRequest(formData);

		const result = await actions.createGroup({
			request,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 409);
		expect((result as any).data.error).toBe('Este proceso ya tiene un grupo asignado');
	});

	it('returns fail(502) when createGroup throws ApiError 502 (relayer down)', async () => {
		mockCreateGroup.mockRejectedValue(new ApiError(502, 'BAD_GATEWAY', 'Relayer down'));

		const formData = createFormData({ id: 'proc-1' });
		const request = createRequest(formData);

		const result = await actions.createGroup({
			request,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 502);
		expect((result as any).data.error).toBe('Error del Relayer. Reintentá más tarde');
	});

	it('returns fail(500) on non-ApiError exception', async () => {
		mockCreateGroup.mockRejectedValue(new Error('Network failure'));

		const formData = createFormData({ id: 'proc-1' });
		const request = createRequest(formData);

		const result = await actions.createGroup({
			request,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 500);
		expect((result as any).data.error).toBe('Error al crear el grupo');
	});
});

// ============================================================
// syncMembers action
// ============================================================
describe('syncMembers action', () => {
	it('calls syncMembers and redirects with success message', async () => {
		mockSyncMembers.mockResolvedValue({ count: 5, transactionHash: '0xtxhash' });

		const formData = createFormData({ id: 'proc-1' });
		const request = createRequest(formData);

		await expect(
			actions.syncMembers({ request, locals: mockLocals } as any)
		).rejects.toMatchObject({
			status: 303,
			location: '/dashboard/procesos?success=Sincronizacion+exitosa'
		});

		expect(mockSyncMembers).toHaveBeenCalledWith(mockLocals, 'proc-1');
	});

	it('returns fail(400) when syncMembers throws ApiError 400 (no group / wrong state)', async () => {
		mockSyncMembers.mockRejectedValue(
			new ApiError(400, 'BAD_REQUEST', 'No group assigned to this process')
		);

		const formData = createFormData({ id: 'proc-1' });
		const request = createRequest(formData);

		const result = await actions.syncMembers({
			request,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.error).toBe('Primero creá el grupo on-chain');
	});

	it('returns fail(401) when syncMembers throws ApiError 401', async () => {
		mockSyncMembers.mockRejectedValue(new ApiError(401, 'UNAUTHORIZED', 'Not authenticated'));

		const formData = createFormData({ id: 'proc-1' });
		const request = createRequest(formData);

		const result = await actions.syncMembers({
			request,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 401);
		expect((result as any).data.error).toBe('No estás autenticado');
	});

	it('returns fail(404) when syncMembers throws ApiError 404', async () => {
		mockSyncMembers.mockRejectedValue(new ApiError(404, 'NOT_FOUND', 'Proceso no encontrado'));

		const formData = createFormData({ id: 'missing' });
		const request = createRequest(formData);

		const result = await actions.syncMembers({
			request,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 404);
		expect((result as any).data.error).toBe('Proceso no encontrado');
	});

	it('returns fail(502) when syncMembers throws ApiError 502 (relayer down)', async () => {
		mockSyncMembers.mockRejectedValue(new ApiError(502, 'BAD_GATEWAY', 'Relayer down'));

		const formData = createFormData({ id: 'proc-1' });
		const request = createRequest(formData);

		const result = await actions.syncMembers({
			request,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 502);
		expect((result as any).data.error).toBe('Error del Relayer. Reintentá más tarde');
	});

	it('returns fail(500) on non-ApiError exception', async () => {
		mockSyncMembers.mockRejectedValue(new Error('Network failure'));

		const formData = createFormData({ id: 'proc-1' });
		const request = createRequest(formData);

		const result = await actions.syncMembers({
			request,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 500);
		expect((result as any).data.error).toBe('Error al sincronizar los compromisos');
	});

	it('returns fail(400) when id is missing from formData', async () => {
		const formData = createFormData({ otherField: 'value' });
		const request = createRequest(formData);

		const result = await actions.syncMembers({
			request,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.error).toBe('ID de proceso requerido');
		expect(mockSyncMembers).not.toHaveBeenCalled();
	});
});
