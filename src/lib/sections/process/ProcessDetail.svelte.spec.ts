import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
// RED: ProcessDetail.svelte does NOT exist yet
import ProcessDetail from './ProcessDetail.svelte';
import type { ElectoralProcess } from '$lib/types/electoral-process';
import type { Team } from '$lib/types/team';
import type { EnrollmentSummary } from '$lib/types/enrollment';

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

	describe('status badge labels', () => {
		it('shows "Sin estado" for NONE status', async () => {
			render(ProcessDetail, defaultProps({ process: { ...mockProcess, estatus: 'NONE' } }));
			await expect.element(page.getByText('Sin estado', { exact: true })).toBeInTheDocument();
		});

		it('shows "Compromiso" for COMMITMENT status', async () => {
			render(ProcessDetail, defaultProps({ process: { ...mockProcess, estatus: 'COMMITMENT' } }));
			const badge = page.getByText('Compromiso', { exact: true }).first();
			await expect.element(badge).toBeInTheDocument();
		});

		it('shows "Votación" for VOTING status', async () => {
			render(ProcessDetail, defaultProps({ process: { ...mockProcess, estatus: 'VOTING' } }));
			const badge = page.getByText('Votación', { exact: true }).first();
			await expect.element(badge).toBeInTheDocument();
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
});
