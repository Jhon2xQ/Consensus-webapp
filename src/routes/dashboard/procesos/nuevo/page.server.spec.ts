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
