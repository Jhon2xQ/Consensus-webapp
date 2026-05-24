import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks ──
const {
	mockGetMyProcesses,
	mockGetTeams,
	mockCreateTeam,
	mockUpdateTeam,
	mockDeleteTeam
} = vi.hoisted(() => ({
	mockGetMyProcesses: vi.fn(),
	mockGetTeams: vi.fn(),
	mockCreateTeam: vi.fn(),
	mockUpdateTeam: vi.fn(),
	mockDeleteTeam: vi.fn()
}));

vi.mock('$lib/server/process.service', () => ({
	getMyProcesses: mockGetMyProcesses
}));

vi.mock('$lib/server/team.service', () => ({
	getTeams: mockGetTeams,
	createTeam: mockCreateTeam,
	updateTeam: mockUpdateTeam,
	deleteTeam: mockDeleteTeam
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
			url: new URL('http://localhost/dashboard/equipos'),
			locals: mockLocals
		} as any)) as any;

		expect(mockGetMyProcesses).toHaveBeenCalledWith(mockLocals, { size: 50 });
		expect(result.processes).toEqual([{ id: 'p1', name: 'Proceso 1' }]);
		expect(result.teams).toBeUndefined();
		expect(result.selectedProcessId).toBeUndefined();
	});

	it('load with processId returns processes + teams + selectedProcessId', async () => {
		mockGetMyProcesses.mockResolvedValue([{ id: 'p1', name: 'Proceso 1' }]);
		mockGetTeams.mockResolvedValue([{ id: 't1', name: 'Equipo A', electoralProcessId: 'p1' }]);

		const result = (await load({
			url: new URL('http://localhost/dashboard/equipos?processId=p1'),
			locals: mockLocals
		} as any)) as any;

		expect(mockGetMyProcesses).toHaveBeenCalled();
		expect(mockGetTeams).toHaveBeenCalledWith(mockLocals, 'p1');
		expect(result.processes).toHaveLength(1);
		expect(result.teams).toEqual([{ id: 't1', name: 'Equipo A', electoralProcessId: 'p1' }]);
		expect(result.selectedProcessId).toBe('p1');
	});

	it('load with invalid processId returns processes + empty teams array', async () => {
		mockGetMyProcesses.mockResolvedValue([{ id: 'p1', name: 'Proceso 1' }]);
		mockGetTeams.mockResolvedValue([]);

		const result = (await load({
			url: new URL('http://localhost/dashboard/equipos?processId=nonexistent'),
			locals: mockLocals
		} as any)) as any;

		expect(mockGetTeams).toHaveBeenCalledWith(mockLocals, 'nonexistent');
		expect(result.processes).toHaveLength(1);
		expect(result.teams).toEqual([]);
		expect(result.selectedProcessId).toBe('nonexistent');
	});
});

// ============================================================
// action: crear-equipo
// ============================================================
describe('action: crear-equipo', () => {
	it('creates team successfully — redirects with processId', async () => {
		mockCreateTeam.mockResolvedValue([{ id: 'new-team', name: 'Nuevo Equipo' }]);

		const formData = createFormData({
			processId: 'p1',
			name: 'Nuevo Equipo',
			avatarUrl: 'https://example.com/avatar.png'
		});
		const request = createRequest(formData);

		try {
			await actions['crear-equipo']({ request, locals: mockLocals } as any);
		} catch (err: any) {
			expect(err).toHaveProperty('status', 303);
			expect(err).toHaveProperty('location');
			expect(err.location).toContain('/dashboard/equipos?processId=p1');
		}

		expect(mockCreateTeam).toHaveBeenCalledWith(
			mockLocals,
			'p1',
			[{ name: 'Nuevo Equipo', avatarUrl: 'https://example.com/avatar.png' }]
		);
	});

	it('returns 400 when name is missing', async () => {
		const formData = createFormData({
			processId: 'p1',
			name: ''
		});
		const request = createRequest(formData);

		const result = await actions['crear-equipo']({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('name');
		expect((result as any).data.errors.name).toContain('obligatorio');
		expect(mockCreateTeam).not.toHaveBeenCalled();
	});

	it('returns 400 when processId is missing', async () => {
		const formData = createFormData({
			name: 'Equipo Sin Proceso'
		});
		const request = createRequest(formData);

		const result = await actions['crear-equipo']({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('processId');
		expect(mockCreateTeam).not.toHaveBeenCalled();
	});

	it('handles 409 duplicate name error', async () => {
		const { ApiError } = await import('$lib/server/api');
		const apiError = new ApiError(409, 'DUPLICATE', 'Duplicate');
		mockCreateTeam.mockRejectedValue(apiError);

		const formData = createFormData({
			processId: 'p1',
			name: 'Duplicado'
		});
		const request = createRequest(formData);

		const result = await actions['crear-equipo']({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 409);
		expect((result as any).data.errors).toHaveProperty('_form');
	});

	it('handles 404 process not found error', async () => {
		const { ApiError } = await import('$lib/server/api');
		const apiError = new ApiError(404, 'NOT_FOUND', 'Not found');
		mockCreateTeam.mockRejectedValue(apiError);

		const formData = createFormData({
			processId: 'nonexistent',
			name: 'Equipo'
		});
		const request = createRequest(formData);

		const result = await actions['crear-equipo']({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 404);
		expect((result as any).data.errors).toHaveProperty('_form');
	});

	it('creates team with avatarUrl set to null when empty', async () => {
		mockCreateTeam.mockResolvedValue([{ id: 'new-team', name: 'Sin Avatar' }]);

		const formData = createFormData({
			processId: 'p1',
			name: 'Sin Avatar',
			avatarUrl: ''
		});
		const request = createRequest(formData);

		try {
			await actions['crear-equipo']({ request, locals: mockLocals } as any);
		} catch (err: any) {
			expect(err).toHaveProperty('status', 303);
		}

		expect(mockCreateTeam).toHaveBeenCalledWith(
			mockLocals,
			'p1',
			[{ name: 'Sin Avatar', avatarUrl: null }]
		);
	});
});

// ============================================================
// action: editar-equipo
// ============================================================
describe('action: editar-equipo', () => {
	it('updates team successfully — redirects with processId', async () => {
		mockUpdateTeam.mockResolvedValue({ id: 't1', name: 'Equipo Renombrado' });

		const formData = createFormData({
			teamId: 't1',
			processId: 'p1',
			name: 'Equipo Renombrado',
			avatarUrl: 'https://example.com/new-avatar.png'
		});
		const request = createRequest(formData);

		try {
			await actions['editar-equipo']({ request, locals: mockLocals } as any);
		} catch (err: any) {
			expect(err).toHaveProperty('status', 303);
			expect(err.location).toContain('/dashboard/equipos?processId=p1');
		}

		expect(mockUpdateTeam).toHaveBeenCalledWith(
			mockLocals,
			't1',
			{ name: 'Equipo Renombrado', avatarUrl: 'https://example.com/new-avatar.png' }
		);
	});

	it('returns 400 when teamId is missing', async () => {
		const formData = createFormData({
			processId: 'p1',
			name: 'Sin TeamId'
		});
		const request = createRequest(formData);

		const result = await actions['editar-equipo']({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('teamId');
		expect(mockUpdateTeam).not.toHaveBeenCalled();
	});

	it('handles 404 team not found error', async () => {
		const { ApiError } = await import('$lib/server/api');
		const apiError = new ApiError(404, 'NOT_FOUND', 'Not found');
		mockUpdateTeam.mockRejectedValue(apiError);

		const formData = createFormData({
			teamId: 'nonexistent',
			processId: 'p1',
			name: 'Equipo'
		});
		const request = createRequest(formData);

		const result = await actions['editar-equipo']({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 404);
		expect((result as any).data.errors).toHaveProperty('_form');
	});

	it('returns 400 when name is missing in edit', async () => {
		const formData = createFormData({
			teamId: 't1',
			processId: 'p1',
			name: ''
		});
		const request = createRequest(formData);

		const result = await actions['editar-equipo']({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('name');
		expect(mockUpdateTeam).not.toHaveBeenCalled();
	});

	it('sends only provided fields for partial update (empty avatarUrl → null)', async () => {
		mockUpdateTeam.mockResolvedValue({ id: 't1', name: 'Solo Nombre' });

		const formData = createFormData({
			teamId: 't1',
			processId: 'p1',
			name: 'Solo Nombre',
			avatarUrl: ''
		});
		const request = createRequest(formData);

		try {
			await actions['editar-equipo']({ request, locals: mockLocals } as any);
		} catch (err: any) {
			expect(err).toHaveProperty('status', 303);
		}

		expect(mockUpdateTeam).toHaveBeenCalledWith(
			mockLocals,
			't1',
			{ name: 'Solo Nombre', avatarUrl: null }
		);
	});
});

// ============================================================
// action: eliminar-equipo
// ============================================================
describe('action: eliminar-equipo', () => {
	it('deletes team successfully — redirects with processId', async () => {
		mockDeleteTeam.mockResolvedValue(undefined);

		const formData = createFormData({
			teamId: 't1',
			processId: 'p1'
		});
		const request = createRequest(formData);

		try {
			await actions['eliminar-equipo']({ request, locals: mockLocals } as any);
		} catch (err: any) {
			expect(err).toHaveProperty('status', 303);
			expect(err.location).toContain('/dashboard/equipos?processId=p1');
		}

		expect(mockDeleteTeam).toHaveBeenCalledWith(mockLocals, 't1');
	});

	it('returns 400 when teamId is missing', async () => {
		const formData = createFormData({
			processId: 'p1'
		});
		const request = createRequest(formData);

		const result = await actions['eliminar-equipo']({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('teamId');
		expect(mockDeleteTeam).not.toHaveBeenCalled();
	});

	it('handles 404 team not found error on delete', async () => {
		const { ApiError } = await import('$lib/server/api');
		const apiError = new ApiError(404, 'NOT_FOUND', 'Not found');
		mockDeleteTeam.mockRejectedValue(apiError);

		const formData = createFormData({
			teamId: 'nonexistent',
			processId: 'p1'
		});
		const request = createRequest(formData);

		const result = await actions['eliminar-equipo']({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 404);
		expect((result as any).data.errors).toHaveProperty('_form');
	});
});
