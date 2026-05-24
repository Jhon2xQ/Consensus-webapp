import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks ──
const { mockCreateProcess, mockCreateTeam, mockCreateEnrollment } = vi.hoisted(() => ({
	mockCreateProcess: vi.fn(),
	mockCreateTeam: vi.fn(),
	mockCreateEnrollment: vi.fn()
}));

vi.mock('$lib/server/process.service', async (importOriginal) => {
	const actual = (await importOriginal()) as object;
	return {
		...actual,
		createProcess: mockCreateProcess
	};
});

vi.mock('$lib/server/team.service', () => ({
	createTeam: mockCreateTeam
}));

vi.mock('$lib/server/enrollment.service', () => ({
	createEnrollment: mockCreateEnrollment
}));

// ── Import after mocks ──
import { actions } from './+page.server';

const mockLocals = {} as App.Locals;

beforeEach(() => {
	vi.clearAllMocks();
});

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

// ============================================================
// default action: scope derivation
// ============================================================
describe('default action — scope derivation', () => {
	it('derives body.scope from name instead of reading scope from FormData', async () => {
		mockCreateProcess.mockResolvedValue({ id: 'new-proc', name: 'Mi Proceso' });

		const formData = createFormData({
			name: 'Mi Proceso',
			description: 'Desc',
			commitmentStart: '2026-01-01',
			commitmentEnd: '2026-02-01',
			votingStart: '2026-03-01',
			votingEnd: '2026-03-15',
			results: '2026-04-01'
		});
		const request = createRequest(formData);

		try {
			await actions.default({ request, locals: mockLocals } as any);
		} catch (err: any) {
			expect(err).toHaveProperty('status', 303);
		}

		expect(mockCreateProcess).toHaveBeenCalled();
		const createBody = mockCreateProcess.mock.calls[0][1];
		expect(createBody.scope).toBe('Mi Proceso');
		expect(createBody.name).toBe('Mi Proceso');
	});

	it('trims name before using it as scope', async () => {
		mockCreateProcess.mockResolvedValue({ id: 'new-proc', name: '  Elecciones 2026  ' });

		const formData = createFormData({
			name: '  Elecciones 2026  ',
			commitmentStart: '2026-01-01',
			commitmentEnd: '2026-02-01',
			votingStart: '2026-03-01',
			votingEnd: '2026-03-15',
			results: '2026-04-01'
		});
		const request = createRequest(formData);

		try {
			await actions.default({ request, locals: mockLocals } as any);
		} catch (err: any) {
			expect(err).toHaveProperty('status', 303);
		}

		expect(mockCreateProcess).toHaveBeenCalled();
		const createBody = mockCreateProcess.mock.calls[0][1];
		expect(createBody.scope).toBe('Elecciones 2026');
	});

	it('does NOT validate scope as a required field (removed)', async () => {
		mockCreateProcess.mockResolvedValue({ id: 'new-proc', name: 'Test' });

		const formData = createFormData({
			name: 'Test',
			commitmentStart: '2026-01-01',
			commitmentEnd: '2026-02-01',
			votingStart: '2026-03-01',
			votingEnd: '2026-03-15',
			results: '2026-04-01'
		});
		const request = createRequest(formData);

		try {
			await actions.default({ request, locals: mockLocals } as any);
		} catch (err: any) {
			// Redirect means validation passed (no fail() due to missing scope)
			expect(err).toHaveProperty('status', 303);
		}

		expect(mockCreateProcess).toHaveBeenCalled();
	});

	it('still validates name is required', async () => {
		const formData = createFormData({ name: '' });
		const request = createRequest(formData);

		const result = await actions.default({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('name');
		expect((result as any).data.errors).not.toHaveProperty('scope');
	});

	it('scope is NOT in returned values on validation failure', async () => {
		const formData = createFormData({ name: '' });
		const request = createRequest(formData);

		const result = await actions.default({ request, locals: mockLocals } as any);

		expect((result as any).data.values).not.toHaveProperty('scope');
		expect((result as any).data.values).toHaveProperty('name');
	});
});

// ============================================================
// finalizar action — batch team + enrollment creation
// ============================================================
describe('finalizar action — batch creation', () => {
	it('calls createTeam ONCE with array of teams (not per-item loop)', async () => {
		mockCreateProcess.mockResolvedValue({ id: 'new-proc' });
		mockCreateTeam.mockResolvedValue([{ id: 't1', name: 'Equipo A' }]);

		const teams = [
			{ name: 'Equipo A', avatarUrl: 'https://a.com/1.png' },
			{ name: 'Equipo B', avatarUrl: null }
		];
		const enrollments = [{ email: 'v@test.com' }];

		const formData = createFormData({
			name: 'Proceso Test',
			commitmentStart: '2026-01-01T00:00',
			commitmentEnd: '2026-02-01T00:00',
			votingStart: '2026-03-01T00:00',
			votingEnd: '2026-04-01T00:00',
			results: '2026-05-01T00:00',
			_action: 'finalizar',
			_teams: JSON.stringify(teams),
			_enrollments: JSON.stringify(enrollments)
		});
		const request = createRequest(formData);

		try {
			await actions.default({ request, locals: mockLocals } as any);
		} catch (err: any) {
			expect(err).toHaveProperty('status', 303);
		}

		expect(mockCreateTeam).toHaveBeenCalledTimes(1);
		const teamArg = mockCreateTeam.mock.calls[0][2];
		expect(Array.isArray(teamArg)).toBe(true);
		expect(teamArg).toHaveLength(2);
		expect(teamArg[0]).toEqual({ name: 'Equipo A', avatarUrl: 'https://a.com/1.png' });
		expect(teamArg[1]).toEqual({ name: 'Equipo B', avatarUrl: null });
	});

	it('calls createEnrollment ONCE with array of enrollments (not per-item loop)', async () => {
		mockCreateProcess.mockResolvedValue({ id: 'new-proc' });
		mockCreateTeam.mockResolvedValue([]);
		mockCreateEnrollment.mockResolvedValue([{ id: 'e1', email: 'a@b.com' }]);

		const teams = [{ name: 'Equipo A' }];
		const enrollments = [
			{ email: 'a@b.com' },
			{ email: 'c@d.com' },
			{ email: 'e@f.com' }
		];

		const formData = createFormData({
			name: 'Proceso Test',
			commitmentStart: '2026-01-01T00:00',
			commitmentEnd: '2026-02-01T00:00',
			votingStart: '2026-03-01T00:00',
			votingEnd: '2026-04-01T00:00',
			results: '2026-05-01T00:00',
			_action: 'finalizar',
			_teams: JSON.stringify(teams),
			_enrollments: JSON.stringify(enrollments)
		});
		const request = createRequest(formData);

		try {
			await actions.default({ request, locals: mockLocals } as any);
		} catch (err: any) {
			expect(err).toHaveProperty('status', 303);
		}

		expect(mockCreateEnrollment).toHaveBeenCalledTimes(1);
		const enrollArg = mockCreateEnrollment.mock.calls[0][2];
		expect(Array.isArray(enrollArg)).toBe(true);
		expect(enrollArg).toHaveLength(3);
		expect(enrollArg[0]).toEqual({ email: 'a@b.com' });
		expect(enrollArg[1]).toEqual({ email: 'c@d.com' });
		expect(enrollArg[2]).toEqual({ email: 'e@f.com' });
	});

	it('strips id and electoralProcessId from team payloads', async () => {
		mockCreateProcess.mockResolvedValue({ id: 'new-proc' });
		mockCreateTeam.mockResolvedValue([]);
		mockCreateEnrollment.mockResolvedValue([]);

		const teamsWithExtras = [
			{ id: 'local-abc', name: 'Equipo X', avatarUrl: null, electoralProcessId: '' },
			{ id: 'local-def', name: 'Equipo Y', avatarUrl: 'https://img.com/p.png', electoralProcessId: '' }
		];
		const enrollments = [{ email: 'x@y.com' }];

		const formData = createFormData({
			name: 'Proceso Test',
			commitmentStart: '2026-01-01T00:00',
			commitmentEnd: '2026-02-01T00:00',
			votingStart: '2026-03-01T00:00',
			votingEnd: '2026-04-01T00:00',
			results: '2026-05-01T00:00',
			_action: 'finalizar',
			_teams: JSON.stringify(teamsWithExtras),
			_enrollments: JSON.stringify(enrollments)
		});
		const request = createRequest(formData);

		try {
			await actions.default({ request, locals: mockLocals } as any);
		} catch (err: any) {
			expect(err).toHaveProperty('status', 303);
		}

		const teamArg = mockCreateTeam.mock.calls[0][2];
		expect(teamArg[0]).not.toHaveProperty('id');
		expect(teamArg[0]).not.toHaveProperty('electoralProcessId');
		expect(teamArg[0]).toEqual({ name: 'Equipo X', avatarUrl: null });
		expect(teamArg[1]).toEqual({ name: 'Equipo Y', avatarUrl: 'https://img.com/p.png' });
	});

	it('strips extra properties from enrollment payloads', async () => {
		mockCreateProcess.mockResolvedValue({ id: 'new-proc' });
		mockCreateTeam.mockResolvedValue([]);
		mockCreateEnrollment.mockResolvedValue([]);

		const teams = [{ name: 'Equipo A' }];
		const enrollmentsWithExtras = [
			{ id: 'local-xxx', electoralProcessId: '', email: 'a@b.com', userId: null, commitment: null, hasVoted: false },
			{ id: 'local-yyy', electoralProcessId: '', email: 'c@d.com', userId: 'u1', commitment: 'yes', hasVoted: true }
		];

		const formData = createFormData({
			name: 'Proceso Test',
			commitmentStart: '2026-01-01T00:00',
			commitmentEnd: '2026-02-01T00:00',
			votingStart: '2026-03-01T00:00',
			votingEnd: '2026-04-01T00:00',
			results: '2026-05-01T00:00',
			_action: 'finalizar',
			_teams: JSON.stringify(teams),
			_enrollments: JSON.stringify(enrollmentsWithExtras)
		});
		const request = createRequest(formData);

		try {
			await actions.default({ request, locals: mockLocals } as any);
		} catch (err: any) {
			expect(err).toHaveProperty('status', 303);
		}

		const enrollArg = mockCreateEnrollment.mock.calls[0][2];
		expect(enrollArg[0]).toEqual({ email: 'a@b.com' });
		expect(enrollArg[0]).not.toHaveProperty('id');
		expect(enrollArg[0]).not.toHaveProperty('electoralProcessId');
		expect(enrollArg[0]).not.toHaveProperty('userId');
		expect(enrollArg[0]).not.toHaveProperty('commitment');
		expect(enrollArg[0]).not.toHaveProperty('hasVoted');
		expect(enrollArg[1]).toEqual({ email: 'c@d.com' });
	});

	it('validates at least 1 team before calling createTeam', async () => {
		const formData = createFormData({
			name: 'Proceso Test',
			commitmentStart: '2026-01-01T00:00',
			commitmentEnd: '2026-02-01T00:00',
			votingStart: '2026-03-01T00:00',
			votingEnd: '2026-04-01T00:00',
			results: '2026-05-01T00:00',
			_action: 'finalizar',
			_teams: '[]',
			_enrollments: JSON.stringify([{ email: 'x@y.com' }])
		});
		const request = createRequest(formData);

		const result = await actions.default({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors._form).toContain('equipo');
		expect(mockCreateProcess).not.toHaveBeenCalled();
	});

	it('validates at least 1 enrollment before calling createEnrollment', async () => {
		mockCreateProcess.mockResolvedValue({ id: 'new-proc' });
		mockCreateTeam.mockResolvedValue([]);

		const formData = createFormData({
			name: 'Proceso Test',
			commitmentStart: '2026-01-01T00:00',
			commitmentEnd: '2026-02-01T00:00',
			votingStart: '2026-03-01T00:00',
			votingEnd: '2026-04-01T00:00',
			results: '2026-05-01T00:00',
			_action: 'finalizar',
			_teams: JSON.stringify([{ name: 'Equipo A' }]),
			_enrollments: '[]'
		});
		const request = createRequest(formData);

		const result = await actions.default({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors._form).toContain('votante');
		// createProcess IS called (validated teams, but enrollments fail)
	});

	it('returns fail(400) on malformed JSON in _teams or _enrollments', async () => {
		const formData = createFormData({
			name: 'Proceso Test',
			commitmentStart: '2026-01-01T00:00',
			commitmentEnd: '2026-02-01T00:00',
			votingStart: '2026-03-01T00:00',
			votingEnd: '2026-04-01T00:00',
			results: '2026-05-01T00:00',
			_action: 'finalizar',
			_teams: '{not valid json',
			_enrollments: '[]'
		});
		const request = createRequest(formData);

		const result = await actions.default({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors._form).toContain('Error al procesar');
	});
});
