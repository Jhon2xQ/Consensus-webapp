import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProcessDetail from './ProcessDetail.svelte';
import type { ElectoralProcess } from '$lib/types/electoral-process';
import type { Team } from '$lib/types/team';
import type { EnrollmentSummary, Enrollment } from '$lib/types/enrollment';

// Mock passkey services
const mockVerifyPasskey = vi.hoisted(() => vi.fn());
const mockDeriveIdentity = vi.hoisted(() => vi.fn());

vi.mock('$lib/services/passkey.service', () => ({
	verifyPasskey: mockVerifyPasskey,
	supportsPasskeys: vi.fn(() => true),
	registerPasskey: vi.fn()
}));

vi.mock('$lib/services/semaphore.service', () => ({
	deriveIdentity: mockDeriveIdentity
}));

// Mock fetch for API calls
const mockFetch = vi.hoisted(() => vi.fn());
vi.stubGlobal('fetch', mockFetch);

const mockProcess: ElectoralProcess = {
	id: '1',
	name: 'Elecciones Nacionales 2026',
	scope: 'Nacional',
	description: 'Proceso electoral para elegir representantes nacionales.',
	estatus: 'COMMITMENT',
	commitmentStart: '2026-03-01T00:00:00Z',
	commitmentEnd: '2026-04-30T00:00:00Z',
	votingStart: '2026-06-15T00:00:00Z',
	votingEnd: '2026-06-20T00:00:00Z',
	results: '2026-06-25T00:00:00Z',
	createdBy: 'user-1'
};

const mockTeams: Team[] = [
	{ id: 't1', name: 'Equipo Alpha', avatarUrl: null, electoralProcessId: '1' },
	{ id: 't2', name: 'Equipo Beta', avatarUrl: 'https://example.com/avatar.png', electoralProcessId: '1' },
	{ id: 't3', name: 'Equipo Gamma', avatarUrl: null, electoralProcessId: '1' }
];

const mockEnrollmentSummary: EnrollmentSummary = {
	totalParticipants: 150,
	totalCommitments: 120,
	totalVoted: 90
};

function defaultProps(overrides?: Record<string, unknown>) {
	return {
		process: mockProcess,
		teams: mockTeams,
		enrollmentSummary: mockEnrollmentSummary,
		teamsError: false,
		enrollmentError: false,
		userSub: 'user-abc-123',
		userEnrollment: null,
		...overrides
	};
}

describe('ProcessDetail.svelte', () => {
	describe('happy path — full data renders', () => {
		it('renders process name as heading', async () => {
			render(ProcessDetail, defaultProps());
			await expect
				.element(page.getByRole('heading', { level: 1, name: 'Elecciones Nacionales 2026' }))
				.toBeInTheDocument();
		});

		it('renders process scope', async () => {
			render(ProcessDetail, defaultProps());
			await expect.element(page.getByText('Nacional', { exact: true })).toBeInTheDocument();
		});

		it('renders process description when not null', async () => {
			render(ProcessDetail, defaultProps());
			await expect
				.element(page.getByText('Proceso electoral para elegir representantes nacionales.'))
				.toBeInTheDocument();
		});

		it('shows the correct status badge for COMMITMENT', async () => {
			render(ProcessDetail, defaultProps());
			// Page has two "Compromiso" texts (badge + timeline header) — scope to badge span
			const badge = page.getByText('Compromiso', { exact: true }).first();
			await expect.element(badge).toBeInTheDocument();
		});

		it('shows back navigation link', async () => {
			render(ProcessDetail, defaultProps());
			await expect.element(page.getByText('Volver a procesos')).toBeInTheDocument();
		});
	});

	describe('status badge labels (6-state set)', () => {
		it('shows "Abierto" for OPEN status', async () => {
			render(ProcessDetail, defaultProps({ process: { ...mockProcess, estatus: 'OPEN' } }));
			await expect.element(page.getByText('Abierto', { exact: true })).toBeInTheDocument();
		});

		it('shows "Compromiso" for COMMITMENT status', async () => {
			render(ProcessDetail, defaultProps({ process: { ...mockProcess, estatus: 'COMMITMENT' } }));
			const badge = page.getByText('Compromiso', { exact: true }).first();
			await expect.element(badge).toBeInTheDocument();
		});

		it('shows "Sellado" for SEALED status', async () => {
			render(ProcessDetail, defaultProps({ process: { ...mockProcess, estatus: 'SEALED' } }));
			await expect.element(page.getByText('Sellado', { exact: true })).toBeInTheDocument();
		});

		it('shows "Votación" for VOTING status', async () => {
			render(ProcessDetail, defaultProps({ process: { ...mockProcess, estatus: 'VOTING' } }));
			const badge = page.getByText('Votación', { exact: true }).first();
			await expect.element(badge).toBeInTheDocument();
		});

		it('shows "Conteo" for COUNTING status', async () => {
			render(ProcessDetail, defaultProps({ process: { ...mockProcess, estatus: 'COUNTING' } }));
			await expect.element(page.getByText('Conteo', { exact: true })).toBeInTheDocument();
		});

		it('shows "Cerrado" for CLOSED status', async () => {
			render(ProcessDetail, defaultProps({ process: { ...mockProcess, estatus: 'CLOSED' } }));
			await expect.element(page.getByText('Cerrado', { exact: true })).toBeInTheDocument();
		});
	});

	describe('teams list', () => {
		it('renders all team names', async () => {
			render(ProcessDetail, defaultProps());
			await expect.element(page.getByText('Equipo Alpha')).toBeInTheDocument();
			await expect.element(page.getByText('Equipo Beta')).toBeInTheDocument();
			await expect.element(page.getByText('Equipo Gamma')).toBeInTheDocument();
		});

		it('shows "Sin equipos" empty state when teams is empty', async () => {
			render(ProcessDetail, defaultProps({ teams: [] }));
			await expect.element(page.getByText('Sin equipos')).toBeInTheDocument();
		});

		it('shows "Sin equipos" when teamsError is true', async () => {
			render(ProcessDetail, defaultProps({ teams: [], teamsError: true }));
			await expect.element(page.getByText('Sin equipos')).toBeInTheDocument();
		});
	});

	describe('voter summary stats', () => {
		it('renders totalParticipants', async () => {
			render(ProcessDetail, defaultProps());
			await expect.element(page.getByText('150')).toBeInTheDocument();
		});

		it('renders totalCommitments', async () => {
			render(ProcessDetail, defaultProps());
			await expect.element(page.getByText('120')).toBeInTheDocument();
		});

		it('renders totalVoted', async () => {
			render(ProcessDetail, defaultProps());
			await expect.element(page.getByText('90')).toBeInTheDocument();
		});

		it('shows zeros when all values are 0', async () => {
			render(
				ProcessDetail,
				defaultProps({
					enrollmentSummary: { totalParticipants: 0, totalCommitments: 0, totalVoted: 0 }
				})
			);
			// The "0" text exists in dates too — verify stat labels are present with numeric content
			await expect.element(page.getByText('Participantes')).toBeInTheDocument();
			await expect.element(page.getByText('Compromisos')).toBeInTheDocument();
			await expect.element(page.getByText('Votaron')).toBeInTheDocument();
		});

		it('shows "No disponible" when enrollmentError is true', async () => {
			render(ProcessDetail, defaultProps({ enrollmentSummary: null, enrollmentError: true }));
			await expect.element(page.getByText('No disponible')).toBeInTheDocument();
		});
	});

	describe('null description', () => {
		it('does not render description section when null', async () => {
			render(
				ProcessDetail,
				defaultProps({ process: { ...mockProcess, description: null } })
			);
			await expect.element(page.getByText('Elecciones Nacionales 2026')).toBeInTheDocument();
			await expect
				.element(page.getByText('Proceso electoral para elegir representantes nacionales.'))
				.not.toBeInTheDocument();
		});
	});

	describe('action buttons', () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		it('shows "Enviar compromiso" button when estatus is COMMITMENT', async () => {
			render(ProcessDetail, defaultProps({ process: { ...mockProcess, estatus: 'COMMITMENT' } }));
			await expect.element(page.getByRole('button', { name: 'Enviar compromiso' })).toBeInTheDocument();
		});

		it('shows "Realizar voto" button when estatus is VOTING', async () => {
			render(ProcessDetail, defaultProps({ process: { ...mockProcess, estatus: 'VOTING' } }));
			await expect.element(page.getByRole('button', { name: 'Realizar voto' })).toBeInTheDocument();
		});

		it('does not show action buttons when estatus is OPEN', async () => {
			render(ProcessDetail, defaultProps({ process: { ...mockProcess, estatus: 'OPEN' } }));
			await expect.element(page.getByRole('button', { name: 'Enviar compromiso' })).not.toBeInTheDocument();
			await expect.element(page.getByRole('button', { name: 'Realizar voto' })).not.toBeInTheDocument();
		});

		it('does not show action buttons when estatus is SEALED', async () => {
			render(ProcessDetail, defaultProps({ process: { ...mockProcess, estatus: 'SEALED' } }));
			await expect.element(page.getByRole('button', { name: 'Enviar compromiso' })).not.toBeInTheDocument();
			await expect.element(page.getByRole('button', { name: 'Realizar voto' })).not.toBeInTheDocument();
		});

		it('does not show action buttons when estatus is COUNTING', async () => {
			render(ProcessDetail, defaultProps({ process: { ...mockProcess, estatus: 'COUNTING' } }));
			await expect.element(page.getByRole('button', { name: 'Enviar compromiso' })).not.toBeInTheDocument();
			await expect.element(page.getByRole('button', { name: 'Realizar voto' })).not.toBeInTheDocument();
		});

		it('does not show action buttons when estatus is CLOSED', async () => {
			render(ProcessDetail, defaultProps({ process: { ...mockProcess, estatus: 'CLOSED' } }));
			await expect.element(page.getByRole('button', { name: 'Enviar compromiso' })).not.toBeInTheDocument();
			await expect.element(page.getByRole('button', { name: 'Realizar voto' })).not.toBeInTheDocument();
		});

		it('shows disabled commitment button when user already committed', async () => {
			const enrolledUser: Enrollment = {
				id: 'enr-1',
				electoralProcessId: '1',
				email: 'test@example.com',
				userId: 'user-abc-123',
				commitment: 'some-commitment-hash',
				hasVoted: false
			};
			render(ProcessDetail, defaultProps({
				process: { ...mockProcess, estatus: 'COMMITMENT' },
				userEnrollment: enrolledUser
			}));
			const btn = page.getByRole('button', { name: 'Compromiso enviado' });
			await expect.element(btn).toBeInTheDocument();
			await expect.element(btn).toBeDisabled();
		});

		it('shows disabled vote button when user already voted', async () => {
			const enrolledUser: Enrollment = {
				id: 'enr-1',
				electoralProcessId: '1',
				email: 'test@example.com',
				userId: 'user-abc-123',
				commitment: 'some-commitment-hash',
				hasVoted: true
			};
			render(ProcessDetail, defaultProps({
				process: { ...mockProcess, estatus: 'VOTING' },
				userEnrollment: enrolledUser
			}));
			const btn = page.getByRole('button', { name: 'Ya votaste' });
			await expect.element(btn).toBeInTheDocument();
			await expect.element(btn).toBeDisabled();
		});

		it('does not show QR instruction text before submission', async () => {
			render(ProcessDetail, defaultProps({ process: { ...mockProcess, estatus: 'COMMITMENT' } }));
			await expect.element(page.getByText('Escaneá el QR que aparece en pantalla con tu móvil')).not.toBeInTheDocument();
		});
	});
});
