import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks ──
const { mockCreateProcess } = vi.hoisted(() => ({
	mockCreateProcess: vi.fn()
}));

vi.mock('$lib/server/process.service', async (importOriginal) => {
	const actual = (await importOriginal()) as object;
	return {
		...actual,
		createProcess: mockCreateProcess
	};
});

// Import after mocks
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
// validation: date ordering (kept from original)
// ============================================================
describe('validation — date ordering', () => {
	it('rejects commitmentEnd <= commitmentStart', async () => {
		const formData = createFormData({
			name: 'Test',
			commitmentStart: '2026-02-01T00:00',
			commitmentEnd: '2026-01-01T00:00',
			votingStart: '2026-03-01T00:00',
			votingEnd: '2026-04-01T00:00',
			results: '2026-05-01T00:00'
		});
		const request = createRequest(formData);

		const result = await actions.default({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('commitmentEnd');
	});

	it('rejects votingEnd <= votingStart', async () => {
		const formData = createFormData({
			name: 'Test',
			commitmentStart: '2026-01-01T00:00',
			commitmentEnd: '2026-02-01T00:00',
			votingStart: '2026-04-01T00:00',
			votingEnd: '2026-03-01T00:00',
			results: '2026-05-01T00:00'
		});
		const request = createRequest(formData);

		const result = await actions.default({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('votingEnd');
	});

	it('rejects votingStart <= commitmentEnd', async () => {
		const formData = createFormData({
			name: 'Test',
			commitmentStart: '2026-01-01T00:00',
			commitmentEnd: '2026-03-01T00:00',
			votingStart: '2026-02-01T00:00',
			votingEnd: '2026-04-01T00:00',
			results: '2026-05-01T00:00'
		});
		const request = createRequest(formData);

		const result = await actions.default({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('votingStart');
	});

	it('rejects results <= votingEnd', async () => {
		const formData = createFormData({
			name: 'Test',
			commitmentStart: '2026-01-01T00:00',
			commitmentEnd: '2026-02-01T00:00',
			votingStart: '2026-03-01T00:00',
			votingEnd: '2026-05-01T00:00',
			results: '2026-04-01T00:00'
		});
		const request = createRequest(formData);

		const result = await actions.default({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.errors).toHaveProperty('results');
	});
});

// ============================================================
// simplified process creation (no teams, no enrollments)
// ============================================================
describe('simplified process creation — no teams/enrollments', () => {
	it('creates process without calling team or enrollment services', async () => {
		mockCreateProcess.mockResolvedValue({ id: 'new-proc-123', name: 'Elecciones 2026' });

		const formData = createFormData({
			name: 'Elecciones 2026',
			description: 'Proceso electoral nacional',
			commitmentStart: '2026-01-01T00:00',
			commitmentEnd: '2026-02-01T00:00',
			votingStart: '2026-03-01T00:00',
			votingEnd: '2026-03-15T00:00',
			results: '2026-04-01T00:00'
		});
		const request = createRequest(formData);

		try {
			await actions.default({ request, locals: mockLocals } as any);
		} catch (err: any) {
			expect(err).toHaveProperty('status', 303);
		}

		expect(mockCreateProcess).toHaveBeenCalledTimes(1);
		const createBody = mockCreateProcess.mock.calls[0][1];
		expect(createBody.name).toBe('Elecciones 2026');
		expect(createBody.description).toBe('Proceso electoral nacional');
	});

	it('redirects to procesos list on success', async () => {
		mockCreateProcess.mockResolvedValue({ id: 'new-proc' });

		const formData = createFormData({
			name: 'Test',
			commitmentStart: '2026-01-01T00:00',
			commitmentEnd: '2026-02-01T00:00',
			votingStart: '2026-03-01T00:00',
			votingEnd: '2026-04-01T00:00',
			results: '2026-05-01T00:00'
		});
		const request = createRequest(formData);

		expect.assertions(1);
		try {
			await actions.default({ request, locals: mockLocals } as any);
		} catch (err: any) {
			expect(err).toHaveProperty('status', 303);
		}
	});

	it('handles 409 duplicate name error', async () => {
		const { ApiError } = await import('$lib/server/api');
		const apiError = new ApiError(409, 'DUPLICATE', 'Duplicate');
		mockCreateProcess.mockRejectedValue(apiError);

		const formData = createFormData({
			name: 'Duplicado',
			commitmentStart: '2026-01-01T00:00',
			commitmentEnd: '2026-02-01T00:00',
			votingStart: '2026-03-01T00:00',
			votingEnd: '2026-04-01T00:00',
			results: '2026-05-01T00:00'
		});
		const request = createRequest(formData);

		const result = await actions.default({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 409);
		expect((result as any).data.errors).toHaveProperty('name');
		expect((result as any).data.errors.name).toContain('existe');
	});

	it('returns all field values on validation failure', async () => {
		const formData = createFormData({
			name: '',
			description: 'Una descripción',
			commitmentStart: '',
			commitmentEnd: '',
			votingStart: '',
			votingEnd: '',
			results: ''
		});
		const request = createRequest(formData);

		const result = await actions.default({ request, locals: mockLocals } as any);

		expect(result).toHaveProperty('status', 400);
		expect((result as any).data.values).toEqual({
			name: '',
			description: 'Una descripción',
			commitmentStart: '',
			commitmentEnd: '',
			votingStart: '',
			votingEnd: '',
			results: ''
		});
	});

	it('converts datetime-local strings to ISO-8601 for API call', async () => {
		mockCreateProcess.mockResolvedValue({ id: 'p1' });

		const formData = createFormData({
			name: 'Test ISO',
			commitmentStart: '2026-06-01T10:30',
			commitmentEnd: '2026-06-15T18:00',
			votingStart: '2026-07-01T08:00',
			votingEnd: '2026-07-10T20:00',
			results: '2026-07-15T12:00'
		});
		const request = createRequest(formData);

		try {
			await actions.default({ request, locals: mockLocals } as any);
		} catch (err: any) {
			expect(err).toHaveProperty('status', 303);
		}

		const createBody = mockCreateProcess.mock.calls[0][1];
		expect(createBody.commitmentStart).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
		expect(createBody.commitmentEnd).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
		expect(createBody.votingStart).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
		expect(createBody.votingEnd).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
		expect(createBody.results).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
	});
});
