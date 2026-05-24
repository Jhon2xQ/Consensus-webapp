import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks ──
const {
	mockGetMyProcesses,
	mockGetEnrollments,
	mockCreateEnrollment,
	mockDeleteEnrollment
} = vi.hoisted(() => ({
	mockGetMyProcesses: vi.fn(),
	mockGetEnrollments: vi.fn(),
	mockCreateEnrollment: vi.fn(),
	mockDeleteEnrollment: vi.fn()
}));

vi.mock('$lib/server/process.service', () => ({
	getMyProcesses: mockGetMyProcesses
}));

vi.mock('$lib/server/enrollment.service', () => ({
	getEnrollments: mockGetEnrollments,
	createEnrollment: mockCreateEnrollment,
	deleteEnrollment: mockDeleteEnrollment
}));

// Import after mocks
import { load, actions } from './+page.server';

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
// load function
// ============================================================
describe('load — processes list', () => {
	it('returns processes list from getMyProcesses', async () => {
		mockGetMyProcesses.mockResolvedValue([{ id: 'p1', name: 'Proceso 1' }]);

		const result = (await load({
			url: new URL('http://localhost/dashboard/votantes'),
			locals: mockLocals
		} as any)) as any;

		expect(mockGetMyProcesses).toHaveBeenCalledWith(mockLocals, { size: 50 });
		expect(result.processes).toEqual([{ id: 'p1', name: 'Proceso 1' }]);
		expect(result.enrollments).toBeUndefined();
		expect(result.selectedProcessId).toBeUndefined();
	});

	it('load with processId returns processes + enrollments + selectedProcessId', async () => {
		mockGetMyProcesses.mockResolvedValue([{ id: 'p1', name: 'Proceso 1' }]);
		mockGetEnrollments.mockResolvedValue([
			{ id: 'e1', email: 'test@example.com', electoralProcessId: 'p1', hasVoted: false }
		]);

		const result = (await load({
			url: new URL('http://localhost/dashboard/votantes?processId=p1'),
			locals: mockLocals
		} as any)) as any;

		expect(mockGetMyProcesses).toHaveBeenCalled();
		expect(mockGetEnrollments).toHaveBeenCalledWith(mockLocals, 'p1');
		expect(result.processes).toHaveLength(1);
		expect(result.enrollments).toHaveLength(1);
		expect(result.selectedProcessId).toBe('p1');
	});

	it('load with invalid processId returns processes + empty enrollments array', async () => {
		mockGetMyProcesses.mockResolvedValue([{ id: 'p1', name: 'Proceso 1' }]);
		mockGetEnrollments.mockResolvedValue([]);

		const result = (await load({
			url: new URL('http://localhost/dashboard/votantes?processId=nonexistent'),
			locals: mockLocals
		} as any)) as any;

		expect(mockGetEnrollments).toHaveBeenCalledWith(mockLocals, 'nonexistent');
		expect(result.processes).toHaveLength(1);
		expect(result.enrollments).toEqual([]);
		expect(result.selectedProcessId).toBe('nonexistent');
	});
});

// ============================================================
// action: crear-votante
// ============================================================
describe('action: crear-votante', () => {
	const VALID_EMAIL = 'user@example.com';

	it('creates enrollment successfully — redirects with processId', async () => {
		mockCreateEnrollment.mockResolvedValue([{ id: 'new-enr', email: VALID_EMAIL }]);

		const formData = createFormData({
			processId: 'p1',
			email: VALID_EMAIL
		});
		const request = createRequest(formData);

		try {
			await actions['crear-votante']({ request, locals: mockLocals } as any);
		} catch (err: any) {
			expect(err).toHaveProperty('status', 303);
			expect(err).toHaveProperty('location');
			expect(err.location).toContain('/dashboard/votantes?processId=p1');
		}

		expect(mockCreateEnrollment).toHaveBeenCalledWith(
			mockLocals,
			'p1',
			[{ email: VALID_EMAIL }]
		);
	});

	it('returns 400 when email is missing', async () => {
		const formData = createFormData({
			processId: 'p1',
			email: ''
		});
		const request = createRequest(formData);

		const result = await actions['crear-votante']({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('email');
		expect((result as any).data.errors.email).toContain('obligatorio');
		expect(mockCreateEnrollment).not.toHaveBeenCalled();
	});

	it('returns 400 when processId is missing', async () => {
		const formData = createFormData({
			email: VALID_EMAIL
		});
		const request = createRequest(formData);

		const result = await actions['crear-votante']({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('processId');
		expect(mockCreateEnrollment).not.toHaveBeenCalled();
	});

	it('returns 400 on invalid email format — missing @', async () => {
		const formData = createFormData({
			processId: 'p1',
			email: 'notanemail'
		});
		const request = createRequest(formData);

		const result = await actions['crear-votante']({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('email');
		expect((result as any).data.errors.email).toContain('inválido');
		expect(mockCreateEnrollment).not.toHaveBeenCalled();
	});

	it('returns 400 on invalid email format — missing domain', async () => {
		const formData = createFormData({
			processId: 'p1',
			email: 'user@'
		});
		const request = createRequest(formData);

		const result = await actions['crear-votante']({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('email');
		expect(mockCreateEnrollment).not.toHaveBeenCalled();
	});

	it('handles 409 duplicate email error', async () => {
		const { ApiError } = await import('$lib/server/api');
		const apiError = new ApiError(409, 'DUPLICATE', 'Duplicate');
		mockCreateEnrollment.mockRejectedValue(apiError);

		const formData = createFormData({
			processId: 'p1',
			email: VALID_EMAIL
		});
		const request = createRequest(formData);

		const result = await actions['crear-votante']({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 409);
		expect((result as any).data.errors).toHaveProperty('_form');
	});

	it('handles 404 process not found error', async () => {
		const { ApiError } = await import('$lib/server/api');
		const apiError = new ApiError(404, 'NOT_FOUND', 'Not found');
		mockCreateEnrollment.mockRejectedValue(apiError);

		const formData = createFormData({
			processId: 'nonexistent',
			email: VALID_EMAIL
		});
		const request = createRequest(formData);

		const result = await actions['crear-votante']({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 404);
		expect((result as any).data.errors).toHaveProperty('_form');
	});

	it('trims email before validation and submission', async () => {
		mockCreateEnrollment.mockResolvedValue([{ id: 'new-enr', email: VALID_EMAIL }]);

		const formData = createFormData({
			processId: 'p1',
			email: '  user@example.com  '
		});
		const request = createRequest(formData);

		try {
			await actions['crear-votante']({ request, locals: mockLocals } as any);
		} catch (err: any) {
			expect(err).toHaveProperty('status', 303);
		}

		expect(mockCreateEnrollment).toHaveBeenCalledWith(
			mockLocals,
			'p1',
			[{ email: VALID_EMAIL }]
		);
	});
});

// ============================================================
// action: eliminar-votante
// ============================================================
describe('action: eliminar-votante', () => {
	it('deletes enrollment successfully — redirects with processId', async () => {
		mockDeleteEnrollment.mockResolvedValue(undefined);

		const formData = createFormData({
			enrollmentId: 'e1',
			processId: 'p1'
		});
		const request = createRequest(formData);

		try {
			await actions['eliminar-votante']({ request, locals: mockLocals } as any);
		} catch (err: any) {
			expect(err).toHaveProperty('status', 303);
			expect(err.location).toContain('/dashboard/votantes?processId=p1');
		}

		expect(mockDeleteEnrollment).toHaveBeenCalledWith(mockLocals, 'e1');
	});

	it('returns 400 when enrollmentId is missing', async () => {
		const formData = createFormData({
			processId: 'p1'
		});
		const request = createRequest(formData);

		const result = await actions['eliminar-votante']({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('enrollmentId');
		expect(mockDeleteEnrollment).not.toHaveBeenCalled();
	});

	it('handles 404 enrollment not found error on delete', async () => {
		const { ApiError } = await import('$lib/server/api');
		const apiError = new ApiError(404, 'NOT_FOUND', 'Not found');
		mockDeleteEnrollment.mockRejectedValue(apiError);

		const formData = createFormData({
			enrollmentId: 'nonexistent',
			processId: 'p1'
		});
		const request = createRequest(formData);

		const result = await actions['eliminar-votante']({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 404);
		expect((result as any).data.errors).toHaveProperty('_form');
	});
});

// ============================================================
// verify no edit action
// ============================================================
describe('action set — no edit', () => {
	it('does NOT have an editar-votante action', () => {
		expect(actions).not.toHaveProperty('editar-votante');
	});

	it('only has crear and eliminar actions', () => {
		const actionNames = Object.keys(actions);
		expect(actionNames).toContain('crear-votante');
		expect(actionNames).toContain('eliminar-votante');
		expect(actionNames).toHaveLength(2);
	});
});
