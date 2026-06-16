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
			'renders no ActionZone in %s phase (read-only layout)',
			async (status) => {
				render(ProcessDetail, {
					...baseProps,
					process: { ...baseProcess, estatus: status as ElectoralProcess['estatus'] }
				});
				// No commitment button, no vote button — only Header/Timeline/Stats/TeamsList.
				await expect
					.element(page.getByRole('button', { name: /Enviar compromiso/ }))
					.not.toBeInTheDocument();
				await expect
					.element(page.getByRole('button', { name: /Compromiso enviado/ }))
					.not.toBeInTheDocument();
				await expect
					.element(page.getByRole('button', { name: /Votar por/ }))
					.not.toBeInTheDocument();
				await expect
					.element(page.getByRole('button', { name: /Elegí un equipo/ }))
					.not.toBeInTheDocument();
				await expect
					.element(page.getByRole('button', { name: /Ya votaste/ }))
					.not.toBeInTheDocument();
			}
		);

		it('renders CommitmentActionZone in COMMITMENT phase (Enviar compromiso button)', async () => {
			render(ProcessDetail, {
				...baseProps,
				process: { ...baseProcess, estatus: 'COMMITMENT' }
			});
			await expect
				.element(page.getByRole('button', { name: /Enviar compromiso/ }))
				.toBeInTheDocument();
		});

		it('renders VotingActionZone in VOTING phase (Elegí un equipo button when no team selected)', async () => {
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
			// VotingActionZone should be rendered
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
		it('passes enrollmentSummary to ProcessStats in the unified layout', async () => {
			render(ProcessDetail, baseProps);
			await expect.element(page.getByText('100')).toBeInTheDocument();
			await expect.element(page.getByText('80')).toBeInTheDocument();
			await expect.element(page.getByText('50')).toBeInTheDocument();
		});

		it('passes empty teams to TeamsList without crashing', async () => {
			render(ProcessDetail, { ...baseProps, teams: [] });
			// TeamsList empty state is "Sin equipos"
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

		// T-9: every status renders the same unified shell — Header,
		// Timeline, Stats, TeamsList — in that order, and no ActionZone
		// outside of COMMITMENT/VOTING. This layout is now asserted directly
		// on the assembler.
		describe('unified layout shell (T-9: assembler renders the full page for all statuses)', () => {
			it.each(['OPEN', 'SEALED', 'COUNTING', 'CLOSED'])(
				'renders Header + Timeline + Stats + TeamsList in %s (no ActionZone)',
				async (status) => {
					render(ProcessDetail, {
						...baseProps,
						process: { ...baseProcess, estatus: status as ElectoralProcess['estatus'] }
					});
					// Header is present (process name as h1).
					await expect
						.element(page.getByRole('heading', { level: 1, name: 'Elección 2026' }))
						.toBeInTheDocument();
					// Timeline phases are present.
					await expect
						.element(page.getByTestId('phase-compromiso'))
						.toBeInTheDocument();
					await expect.element(page.getByTestId('phase-votacion')).toBeInTheDocument();
					await expect.element(page.getByTestId('phase-resultados')).toBeInTheDocument();
					// Stats labels are present.
					await expect.element(page.getByText('Participantes')).toBeInTheDocument();
					await expect.element(page.getByText('Compromisos')).toBeInTheDocument();
					await expect.element(page.getByText('Votaron')).toBeInTheDocument();
					// TeamsList team cards are present.
					await expect.element(page.getByText('Team Alpha')).toBeInTheDocument();
					await expect.element(page.getByText('Team Beta')).toBeInTheDocument();
				}
			);

			it.each(['COMMITMENT', 'VOTING'])(
				'renders the same unified shell plus ActionZone in %s',
				async (status) => {
					render(ProcessDetail, {
						...baseProps,
						process: { ...baseProcess, estatus: status as ElectoralProcess['estatus'] }
					});
					// Same unified shell as the read-only statuses.
					await expect
						.element(page.getByRole('heading', { level: 1, name: 'Elección 2026' }))
						.toBeInTheDocument();
					await expect.element(page.getByText('Team Alpha')).toBeInTheDocument();
					// Plus the action zone.
					if (status === 'COMMITMENT') {
						await expect
							.element(page.getByRole('button', { name: /Enviar compromiso/ }))
							.toBeInTheDocument();
					} else {
						await expect
							.element(page.getByRole('button', { name: /Elegí un equipo/ }))
							.toBeInTheDocument();
					}
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

	// Phase 2: two-column grid layout (process-detail-layout-split).
	describe('upper section grid layout', () => {
		it('desktop: renders a grid container with lg:grid-cols-[3fr_1fr] holding Header+Timeline (left) and Stats (right)', async () => {
			// RED: assert the grid container exists with the expected class
			// and that the left/right cells are in the right relationship.
			const { container } = render(ProcessDetail, baseProps);

			const grid = page.getByTestId('process-detail-grid');
			await expect.element(grid).toBeInTheDocument();
			const gridEl = grid.element();
			expect(gridEl.className).toMatch(/\bgrid\b/);
			expect(gridEl.className).toMatch(/\bgrid-cols-1\b/);
			expect(gridEl.className).toMatch(/lg:grid-cols-\[3fr_1fr\]/);

			// Header (h1) and Timeline testids (phase-*) are inside the grid.
			const h1 = grid.getByRole('heading', { level: 1, name: 'Elección 2026' });
			await expect.element(h1).toBeInTheDocument();
			await expect.element(grid.getByTestId('phase-compromiso')).toBeInTheDocument();
			await expect.element(grid.getByTestId('phase-votacion')).toBeInTheDocument();
			await expect.element(grid.getByTestId('phase-resultados')).toBeInTheDocument();

			// Stats labels are inside the grid.
			await expect.element(grid.getByText('Participantes', { exact: true })).toBeInTheDocument();
			await expect.element(grid.getByText('Compromisos', { exact: true })).toBeInTheDocument();
			await expect.element(grid.getByText('Votaron', { exact: true })).toBeInTheDocument();

			// The grid is inside the max-w-7xl container.
			const maxW = container.querySelector('.max-w-7xl');
			expect(maxW).toBeTruthy();
			expect(maxW?.contains(gridEl)).toBe(true);
		});

		it('mobile: columns stack — Header+Timeline come before Stats in DOM order; both are above TeamsList', async () => {
			// RED: assert DOM order. The grid uses `grid-cols-1 lg:grid-cols-...`
			// so below `lg` it stacks. The flex-col left cell holds Header+Timeline
			// first, then the right cell holds Stats. TeamsList is a sibling of
			// the grid, not inside it.
			render(ProcessDetail, baseProps);

			const grid = page.getByTestId('process-detail-grid');
			const h1 = grid.getByRole('heading', { level: 1, name: 'Elección 2026' });
			const timeline = grid.getByTestId('phase-compromiso');
			const stats = grid.getByText('Participantes', { exact: true });
			const teamAlpha = page.getByText('Team Alpha', { exact: true });

			// Header+Timeline appear before Stats within the grid.
			const headerPos = (await h1.element().getBoundingClientRect()).top;
			const timelinePos = (await timeline.element().getBoundingClientRect()).top;
			const statsPos = (await stats.element().getBoundingClientRect()).top;
			expect(headerPos).toBeLessThan(statsPos);
			expect(timelinePos).toBeLessThan(statsPos);

			// TeamsList is below the grid (not inside it).
			const teamEl = teamAlpha.element();
			const gridEl = grid.element();
			expect(gridEl.contains(teamEl)).toBe(false);
			const gridBottom = (await gridEl.getBoundingClientRect()).bottom;
			const teamPos = (await teamEl.getBoundingClientRect()).top;
			expect(teamPos).toBeGreaterThanOrEqual(gridBottom - 1);
		});

		it('ProcessDetail passes variant="vertical" to ProcessStats (one stat per row)', async () => {
			// RED: assert that the upper-right stats use the vertical layout
			// by checking the root grid of ProcessStats inside the right cell
			// does NOT have sm:grid-cols-3.
			render(ProcessDetail, baseProps);

			const stats = page.getByText('Participantes', { exact: true });
			const statsRoot = stats.element().closest('div.grid');
			expect(statsRoot).toBeTruthy();
			expect(statsRoot?.className).toMatch(/\bgrid-cols-1\b/);
			expect(statsRoot?.className).not.toMatch(/\bsm:grid-cols-3\b/);
		});
	});
});
