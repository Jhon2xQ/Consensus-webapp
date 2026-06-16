import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ReadOnlyProcessView from './ReadOnlyProcessView.svelte';
import type { ElectoralProcess } from '$lib/types/electoral-process';
import type { Team } from '$lib/types/team';
import type { EnrollmentSummary } from '$lib/types/enrollment';

// ── Fixtures ────────────────────────────────────────────────────────────

const mockProcess: ElectoralProcess = {
	id: 'proc-1',
	name: 'Elecciones 2026',
	scope: 'Nacional',
	description: 'Proceso electoral',
	groupId: 'group-1',
	estatus: 'CLOSED',
	commitmentStart: '2026-03-01T00:00:00Z',
	commitmentEnd: '2026-04-30T00:00:00Z',
	votingStart: '2026-06-15T00:00:00Z',
	votingEnd: '2026-06-20T00:00:00Z',
	results: '2026-06-25T00:00:00Z',
	createdBy: 'user-1'
};

const mockTeams: Team[] = [
	{ id: 't1', name: 'Equipo Alpha', avatarUrl: null, electoralProcessId: 'proc-1' },
	{ id: 't2', name: 'Equipo Beta', avatarUrl: null, electoralProcessId: 'proc-1' }
];

const mockSummary: EnrollmentSummary = {
	totalParticipants: 150,
	totalCommitments: 120,
	totalVoted: 90
};

function defaultProps(overrides?: Record<string, unknown>) {
	return {
		process: mockProcess,
		teams: mockTeams,
		enrollmentSummary: mockSummary,
		enrollmentError: false,
		...overrides
	};
}

describe('ReadOnlyProcessView', () => {
	describe('team list (non-interactive)', () => {
		it('renders all team names from the prop', async () => {
			render(ReadOnlyProcessView, defaultProps());
			await expect.element(page.getByText('Equipo Alpha')).toBeInTheDocument();
			await expect.element(page.getByText('Equipo Beta')).toBeInTheDocument();
		});

		it('renders team initials inside the avatar bubbles', async () => {
			render(ReadOnlyProcessView, defaultProps());
			await expect.element(page.getByText('EA', { exact: true })).toBeInTheDocument();
			await expect.element(page.getByText('EB', { exact: true })).toBeInTheDocument();
		});

		it('renders disabled team buttons (presentational mode)', async () => {
			render(ReadOnlyProcessView, defaultProps());
			const alphaBtn = page.getByRole('button', { name: /Equipo Alpha/ });
			const betaBtn = page.getByRole('button', { name: /Equipo Beta/ });
			await expect.element(alphaBtn).toBeDisabled();
			await expect.element(betaBtn).toBeDisabled();
		});

		it('shows the "Sin equipos" empty state when teams is empty', async () => {
			render(ReadOnlyProcessView, defaultProps({ teams: [] }));
			await expect.element(page.getByText('Sin equipos')).toBeInTheDocument();
		});
	});

	describe('stats', () => {
		it('renders the three stat labels', async () => {
			render(ReadOnlyProcessView, defaultProps());
			await expect.element(page.getByText('Participantes')).toBeInTheDocument();
			await expect.element(page.getByText('Compromisos')).toBeInTheDocument();
			await expect.element(page.getByText('Votaron')).toBeInTheDocument();
		});

		it('renders each summary value as a number', async () => {
			render(ReadOnlyProcessView, defaultProps());
			await expect.element(page.getByText('150')).toBeInTheDocument();
			await expect.element(page.getByText('120')).toBeInTheDocument();
			await expect.element(page.getByText('90')).toBeInTheDocument();
		});

		it('shows "No disponible" when enrollmentError is true', async () => {
			render(
				ReadOnlyProcessView,
				defaultProps({ enrollmentError: true, enrollmentSummary: null })
			);
			await expect.element(page.getByText('No disponible')).toBeInTheDocument();
		});
	});

	describe('timeline', () => {
		it('renders the Compromiso, Votación and Resultados headers', async () => {
			render(ReadOnlyProcessView, defaultProps());
			// Each header is a small uppercase label — "Compromiso" and "Votación"
			// appear in the page also inside the team section header, so we
			// scope by text content + role of the surrounding element. The
			// simplest robust check: each appears in the document.
			const compromiso = page.getByText('Compromiso');
			await expect.element(compromiso.first()).toBeInTheDocument();
			const votacion = page.getByText('Votación');
			await expect.element(votacion.first()).toBeInTheDocument();
			await expect.element(page.getByText('Resultados', { exact: true })).toBeInTheDocument();
		});

		it('renders the timeline phase labels and a time-range format', async () => {
			render(ReadOnlyProcessView, defaultProps());
			// The Timeline now uses date + time-range format (per HTML design),
			// not the legacy "Inicio:" / "Fin:" labels. Assert the date pattern
			// and a time-range pattern are both present.
			await expect.element(page.getByText(/2026/).first()).toBeInTheDocument();
			await expect
				.element(page.getByTestId('phase-compromiso'))
				.toHaveTextContent(/\d{1,2}:\d{2}[^0-9]+\d{1,2}:\d{2}/);
		});

		it('renders formatted dates from the process prop', async () => {
			render(ReadOnlyProcessView, defaultProps());
			// The Intl.DateTimeFormat output for 'es-AR' with the given ISO strings
			// includes the year, day, and a time portion. The exact formatting
			// depends on the runtime, so we assert that at least the year appears
			// in the rendered text for commitment, voting and results dates.
			await expect.element(page.getByText(/2026/).first()).toBeInTheDocument();
		});
	});

	describe('no interaction', () => {
		it('does not render any action buttons', async () => {
			render(ReadOnlyProcessView, defaultProps());
			await expect
				.element(page.getByRole('button', { name: 'Enviar compromiso' }))
				.not.toBeInTheDocument();
			await expect
				.element(page.getByRole('button', { name: 'Compromiso enviado' }))
				.not.toBeInTheDocument();
			await expect
				.element(page.getByRole('button', { name: 'Ya votaste' }))
				.not.toBeInTheDocument();
			await expect
				.element(page.getByRole('button', { name: 'Votar por' }))
				.not.toBeInTheDocument();
			await expect
				.element(page.getByRole('button', { name: 'Elegí un equipo para votar' }))
				.not.toBeInTheDocument();
			await expect
				.element(page.getByRole('button', { name: 'Reintentar' }))
				.not.toBeInTheDocument();
		});

		it('does not render the hidden commitment form', async () => {
			const { container } = render(ReadOnlyProcessView, defaultProps());
			const form = container.querySelector('form[action="?/update-commitment"]');
			expect(form).toBeNull();
		});

		it('does not render the vote confirmation dialog', async () => {
			const { container } = render(ReadOnlyProcessView, defaultProps());
			// Dialog from shadcn is wrapped in a portal; checking by role
			// ("dialog") is more reliable than DOM presence.
			await expect
				.element(page.getByRole('heading', { name: 'Confirmar voto' }))
				.not.toBeInTheDocument();
		});
	});
});
