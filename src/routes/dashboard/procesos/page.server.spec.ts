import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiError } from '$lib/server/api';

// ── Hoisted mocks ──
const { mockDeleteProcess } = vi.hoisted(() => ({
	mockDeleteProcess: vi.fn()
}));

vi.mock('$lib/server/process.service', async (importOriginal) => {
	const actual = (await importOriginal()) as object;
	return {
		...actual,
		deleteProcess: mockDeleteProcess
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
	it('calls deleteProcess with correct id and returns success', async () => {
		mockDeleteProcess.mockResolvedValue(undefined);

		const formData = createFormData({ id: 'proc-123' });
		const request = createRequest(formData);

		const result = await actions.delete({
			request,
			locals: mockLocals
		} as any);

		expect(mockDeleteProcess).toHaveBeenCalledWith(mockLocals, 'proc-123');
		expect(result).toEqual({ success: true });
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
