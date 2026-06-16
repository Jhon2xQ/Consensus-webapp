import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProcessDetail from './ProcessDetail.svelte';
import type { ElectoralProcess } from '$lib/types/electoral-process';
import type { Team } from '$lib/types/team';
import type { EnrollmentSummary, Enrollment } from '$lib/types/enrollment';
import type { ComponentProps } from 'svelte';

type DetailProps = ComponentProps<typeof ProcessDetail>;

// Mock services that the views pull in transitively (proof.service reads
// import.meta.env at module load, which must be stubbed in the browser env).
vi.mock('$env/dynamic/public', () => ({
	env: {}
}));

vi.mock('$lib/services/passkey.service', () => ({
	verifyPasskey: vi.fn()
}));

vi.mock('$lib/services/semaphore.service', () => ({
	deriveIdentity: vi.fn()
}));

vi.mock('$lib/services/proof.service', () => ({
	buildVotingProof: vi.fn(),
	submitVotingProof: vi.fn()
}));

vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidateAll: vi.fn()
}));

const baseProcess: ElectoralProcess = {
	id: 'proc-1',
	name: 'Elección 2026',
	scope: 'org-xyz',
	description: 'Proceso de elección de autoridades',
	estatus: 'OPEN',
	commitmentStart: '2026-01-01T00:00:00Z',
	commitmentEnd: '2026-01-15T00:00:00Z',
	votingStart: '2026-01-16T00:00:00Z',
	votingEnd: '2026-01-30T00:00:00Z',
	groupId: 'group-1',
	results: '2026-02-05T00:00:00Z',
	createdBy: 'admin-1'
};

const baseTeams: Team[] = [
	{ id: 'team-1', name: 'Team Alpha', electoralProcessId: 'proc-1' },
	{ id: 'team-2', name: 'Team Beta', electoralProcessId: 'proc-1' }
];

const baseSummary: EnrollmentSummary = {
	totalParticipants: 100,
	totalCommitments: 80,
	totalVoted: 50
};

const baseProps: DetailProps = {
	process: baseProcess,
	liveStatus: null,
	teams: baseTeams,
	enrollmentSummary: baseSummary,
	teamsError: false,
	enrollmentError: false,
	userSub: 'user-123',
	userEnrollment: null as Enrollment | null,
	commitments: [] as string[],
	commitmentsError: false
};

describe('ProcessDetail', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('page chrome (ProcessHeader)', () => {
		it('renders process name as a heading', async () => {
			render(ProcessDetail, baseProps);
			await expect
				.element(page.getByRole('heading', { level: 1 }))
				.toHaveTextContent('Elección 2026');
		});

		it('renders the back link to /procesos', async () => {
			render(ProcessDetail, baseProps);
			const backLink = page.getByRole('link', { name: /Volver a procesos/ });
			await expect.element(backLink).toHaveAttribute('href', '/procesos');
		});

		it.each([
			['OPEN', 'Abierto'],
			['COMMITMENT', 'Compromiso'],
			['SEALED', 'Sellado'],
			['VOTING', 'Votación'],
			['COUNTING', 'Conteo'],
			['CLOSED', 'Cerrado']
		])('renders the %s status badge with label "%s"', async (status, label) => {
			render(ProcessDetail, {
				...baseProps,
				process: { ...baseProcess, estatus: status as ElectoralProcess['estatus'] }
			});
			await expect.element(page.getByText(label).first()).toBeInTheDocument();
		});

		it('forwards process.description to ProcessHeader', async () => {
			render(ProcessDetail, baseProps);
			await expect
				.element(page.getByText('Proceso de elección de autoridades'))
				.toBeInTheDocument();
		});

		it('does not render the description paragraph when process.description is null', async () => {
			render(ProcessDetail, {
				...baseProps,
				process: { ...baseProcess, description: null }
			});
			await expect
				.element(page.getByText('Proceso de elección de autoridades'))
				.not.toBeInTheDocument();
		});
	});

	describe('view selection by effectiveStatus', () => {
		it.each(['OPEN', 'SEALED', 'COUNTING', 'CLOSED'])(
			'renders ReadOnlyProcessView in %s phase (no action buttons)',
			async (status) => {
				render(ProcessDetail, {
					...baseProps,
					process: { ...baseProcess, estatus: status as ElectoralProcess['estatus'] }
				});
				// ReadOnlyProcessView renders no action buttons.
				await expect
					.element(page.getByRole('button', { name: /Enviar compromiso/ }))
					.not.toBeInTheDocument();
				await expect
					.element(page.getByRole('button', { name: /Votar por/ }))
					.not.toBeInTheDocument();
			}
		);

		it('renders CommitmentView in COMMITMENT phase (Enviar compromiso button)', async () => {
			render(ProcessDetail, {
				...baseProps,
				process: { ...baseProcess, estatus: 'COMMITMENT' }
			});
			await expect
				.element(page.getByRole('button', { name: /Enviar compromiso/ }))
				.toBeInTheDocument();
		});

		it('renders VotingView in VOTING phase (Elegí un equipo button when no team selected)', async () => {
			render(ProcessDetail, {
				...baseProps,
				process: { ...baseProcess, estatus: 'VOTING' }
			});
			await expect
				.element(page.getByRole('button', { name: /Elegí un equipo/ }))
				.toBeInTheDocument();
		});
	});

	describe('liveStatus override', () => {
		it('uses liveStatus instead of process.estatus when provided', async () => {
			render(ProcessDetail, {
				...baseProps,
				process: { ...baseProcess, estatus: 'OPEN' },
				liveStatus: 'VOTING'
			});
			// Badge label should be "Votación" (liveStatus), not "Abierto" (process.estatus)
			await expect.element(page.getByText('Votación').first()).toBeInTheDocument();
			await expect.element(page.getByText('Abierto')).not.toBeInTheDocument();
			// VotingView should be rendered
			await expect
				.element(page.getByRole('button', { name: /Elegí un equipo/ }))
				.toBeInTheDocument();
		});

		it('falls back to process.estatus when liveStatus is null', async () => {
			render(ProcessDetail, {
				...baseProps,
				process: { ...baseProcess, estatus: 'COMMITMENT' },
				liveStatus: null
			});
			await expect
				.element(page.getByRole('button', { name: /Enviar compromiso/ }))
				.toBeInTheDocument();
		});
	});

	describe('prop pass-through to children', () => {
		it('passes enrollmentSummary to ProcessStats inside ReadOnlyProcessView', async () => {
			render(ProcessDetail, baseProps);
			await expect.element(page.getByText('100')).toBeInTheDocument();
			await expect.element(page.getByText('80')).toBeInTheDocument();
			await expect.element(page.getByText('50')).toBeInTheDocument();
		});

		it('passes empty teams to ReadOnlyProcessView without crashing', async () => {
			render(ProcessDetail, { ...baseProps, teams: [] });
			// ReadOnlyProcessView renders the teams card; the empty state is "Sin equipos"
			await expect.element(page.getByText('Sin equipos')).toBeInTheDocument();
		});

		it('shows "No disponible" in ProcessStats when enrollmentError is true', async () => {
			render(ProcessDetail, { ...baseProps, enrollmentError: true });
			await expect.element(page.getByText('No disponible')).toBeInTheDocument();
		});
	});

	// T-6: ProcessDetail is now the assembler (FR-1, FR-2). TeamsList is
	// always present; ActionZone is conditional; useVoting is hoisted.
	describe('assembler (T-6: useVoting hoisted, unified layout)', () => {
		describe('TeamsList is always present (FR-1)', () => {
			it.each(['OPEN', 'COMMITMENT', 'SEALED', 'VOTING', 'COUNTING', 'CLOSED'])(
				'renders team cards in %s status',
				async (status) => {
					render(ProcessDetail, {
						...baseProps,
						process: { ...baseProcess, estatus: status as ElectoralProcess['estatus'] }
					});
					// TeamsList renders each team name as a card.
					await expect.element(page.getByText('Team Alpha')).toBeInTheDocument();
					await expect.element(page.getByText('Team Beta')).toBeInTheDocument();
				}
			);
		});

		describe('useVoting callbacks wired (FR-2)', () => {
			it('clicking a team card in VOTING phase updates its selected state via ProcessDetail\'s useVoting', async () => {
				render(ProcessDetail, {
					...baseProps,
					process: { ...baseProcess, estatus: 'VOTING' }
				});
				const teamCard = page.getByTestId('team-card-team-1');
				await expect.element(teamCard).toHaveAttribute('data-state', 'unselected');
				await teamCard.click();
				// ProcessDetail's hoisted useVoting is wired to TeamsList:
				// clicking a card calls voting.selectTeam, which flips the
				// card's data-state to "selected" on re-render.
				await expect.element(teamCard).toHaveAttribute('data-state', 'selected');
			});

			it('TeamsList cards are non-interactive in COMMITMENT phase (interactive=false)', async () => {
				render(ProcessDetail, {
					...baseProps,
					process: { ...baseProcess, estatus: 'COMMITMENT' }
				});
				const teamCard = page.getByTestId('team-card-team-1');
				// In COMMITMENT phase, the assembler passes interactive=false
				// to TeamsList, so the card is disabled.
				await expect.element(teamCard).toBeDisabled();
			});
		});
	});
});
