import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiError } from '$lib/server/api';

// ── Hoisted mocks (required for vi.mock factory to reference them) ──
const {
	mockCreateTeam,
	mockDeleteTeam,
	mockCreateEnrollment,
	mockDeleteEnrollment,
	mockUpdateProcess,
	mockDeleteProcess
} = vi.hoisted(() => ({
	mockCreateTeam: vi.fn(),
	mockDeleteTeam: vi.fn(),
	mockCreateEnrollment: vi.fn(),
	mockDeleteEnrollment: vi.fn(),
	mockUpdateProcess: vi.fn(),
	mockDeleteProcess: vi.fn()
}));

vi.mock('$lib/server/team.service', () => ({
	createTeam: mockCreateTeam,
	deleteTeam: mockDeleteTeam,
	getTeams: vi.fn()
}));

vi.mock('$lib/server/enrollment.service', () => ({
	createEnrollment: mockCreateEnrollment,
	deleteEnrollment: mockDeleteEnrollment,
	getEnrollments: vi.fn()
}));

vi.mock('$lib/server/process.service', async (importOriginal) => {
	const actual = (await importOriginal()) as object;
	return {
		...actual,
		updateProcess: mockUpdateProcess,
		deleteProcess: mockDeleteProcess
	};
});

// ── Import after mocks ──
import { actions } from './+page.server';

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
// agregarEquipo action
// ============================================================
describe('agregarEquipo action', () => {
	it('returns { success: true } and calls createTeam with correct params', async () => {
		const mockTeam = {
			id: 'team-1',
			name: 'Frente Nacional',
			avatarUrl: undefined,
			electoralProcessId: 'proc-123'
		};
		mockCreateTeam.mockResolvedValue(mockTeam);

		const formData = createFormData({
			teamName: 'Frente Nacional',
			avatarUrl: 'https://example.com/avatar.png'
		});
		const request = createRequest(formData);

		const result = await actions.agregarEquipo({
			request,
			params: mockParams,
			locals: mockLocals
		} as any);

		expect(mockCreateTeam).toHaveBeenCalledWith(mockLocals, 'proc-123', [{
			name: 'Frente Nacional',
			avatarUrl: 'https://example.com/avatar.png'
		}]);
		expect(result).toEqual({ success: true });
	});

	it('returns fail(400) when teamName is missing', async () => {
		const formData = createFormData({});
		const request = createRequest(formData);

		const result = await actions.agregarEquipo({
			request,
			params: mockParams,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('teamName');
		expect(mockCreateTeam).not.toHaveBeenCalled();
	});

	it('returns fail(400) when teamName is too short (< 2 chars)', async () => {
		const formData = createFormData({ teamName: 'A' });
		const request = createRequest(formData);

		const result = await actions.agregarEquipo({
			request,
			params: mockParams,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('teamName');
		expect(mockCreateTeam).not.toHaveBeenCalled();
	});

	it('returns fail with service error status when createTeam fails with ApiError', async () => {
		mockCreateTeam.mockRejectedValue(
			new ApiError(409, 'CONFLICT', 'Ya existe un equipo con ese nombre')
		);

		const formData = createFormData({ teamName: 'Equipo Duplicado' });
		const request = createRequest(formData);

		const result = await actions.agregarEquipo({
			request,
			params: mockParams,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 409);
		expect((result as any).data.errors).toHaveProperty('_form');
	});
});

// ============================================================
// eliminarEquipo action
// ============================================================
describe('eliminarEquipo action', () => {
	it('returns { success: true } and calls deleteTeam with correct teamId', async () => {
		mockDeleteTeam.mockResolvedValue(undefined);

		const formData = createFormData({ teamId: 'team-99' });
		const request = createRequest(formData);

		const result = await actions.eliminarEquipo({
			request,
			params: mockParams,
			locals: mockLocals
		} as any);

		expect(mockDeleteTeam).toHaveBeenCalledWith(mockLocals, 'team-99');
		expect(result).toEqual({ success: true });
	});

	it('returns fail(400) when teamId is missing', async () => {
		const formData = createFormData({});
		const request = createRequest(formData);

		const result = await actions.eliminarEquipo({
			request,
			params: mockParams,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('_form');
	});

	it('returns fail with service error status when deleteTeam fails', async () => {
		mockDeleteTeam.mockRejectedValue(
			new ApiError(404, 'NOT_FOUND', 'Equipo no encontrado')
		);

		const formData = createFormData({ teamId: 'nonexistent' });
		const request = createRequest(formData);

		const result = await actions.eliminarEquipo({
			request,
			params: mockParams,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 404);
		expect((result as any).data.errors).toHaveProperty('_form');
	});
});

// ============================================================
// agregarVotante action
// ============================================================
describe('agregarVotante action', () => {
	it('returns { success: true } and calls createEnrollment with correct params', async () => {
		const mockEnrollment = {
			id: 'enr-1',
			electoralProcessId: 'proc-123',
			email: 'votante@example.com',
			userId: null,
			commitment: null,
			hasVoted: false
		};
		mockCreateEnrollment.mockResolvedValue(mockEnrollment);

		const formData = createFormData({ email: 'votante@example.com' });
		const request = createRequest(formData);

		const result = await actions.agregarVotante({
			request,
			params: mockParams,
			locals: mockLocals
		} as any);

		expect(mockCreateEnrollment).toHaveBeenCalledWith(mockLocals, 'proc-123', [{
			email: 'votante@example.com'
		}]);
		expect(result).toEqual({ success: true });
	});

	it('returns fail(400) when email is missing', async () => {
		const formData = createFormData({});
		const request = createRequest(formData);

		const result = await actions.agregarVotante({
			request,
			params: mockParams,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('email');
		expect(mockCreateEnrollment).not.toHaveBeenCalled();
	});

	it('returns fail(400) when email is invalid format', async () => {
		const formData = createFormData({ email: 'not-an-email' });
		const request = createRequest(formData);

		const result = await actions.agregarVotante({
			request,
			params: mockParams,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('email');
		expect(mockCreateEnrollment).not.toHaveBeenCalled();
	});

	it('returns fail with service error when createEnrollment fails', async () => {
		mockCreateEnrollment.mockRejectedValue(
			new ApiError(409, 'CONFLICT', 'El votante ya está registrado')
		);

		const formData = createFormData({ email: 'existing@example.com' });
		const request = createRequest(formData);

		const result = await actions.agregarVotante({
			request,
			params: mockParams,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 409);
		expect((result as any).data.errors).toHaveProperty('_form');
	});
});

// ============================================================
// eliminarVotante action
// ============================================================
describe('eliminarVotante action', () => {
	it('returns { success: true } and calls deleteEnrollment with correct enrollmentId', async () => {
		mockDeleteEnrollment.mockResolvedValue(undefined);

		const formData = createFormData({ enrollmentId: 'enr-77' });
		const request = createRequest(formData);

		const result = await actions.eliminarVotante({
			request,
			params: mockParams,
			locals: mockLocals
		} as any);

		expect(mockDeleteEnrollment).toHaveBeenCalledWith(mockLocals, 'enr-77');
		expect(result).toEqual({ success: true });
	});

	it('returns fail(400) when enrollmentId is missing', async () => {
		const formData = createFormData({});
		const request = createRequest(formData);

		const result = await actions.eliminarVotante({
			request,
			params: mockParams,
			locals: mockLocals
		} as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('_form');
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
// default action: scope derivation
// ============================================================
describe('default action — scope derivation', () => {
	it('derives body.scope from name instead of reading scope from FormData', async () => {
		mockUpdateProcess.mockResolvedValue({});

		const formData = createFormData({
			name: 'Elecciones 2026',
			description: 'Test',
			commitmentStart: '2026-01-01',
			commitmentEnd: '2026-02-01',
			votingStart: '2026-03-01',
			votingEnd: '2026-03-15',
			results: '2026-04-01'
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

	it('does NOT validate scope field (removed from required validation)', async () => {
		mockUpdateProcess.mockResolvedValue({});

		const formData = createFormData({
			name: 'Elecciones 2026',
			description: 'Test',
			commitmentStart: '2026-01-01',
			commitmentEnd: '2026-02-01',
			votingStart: '2026-03-01',
			votingEnd: '2026-03-15',
			results: '2026-04-01'
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
