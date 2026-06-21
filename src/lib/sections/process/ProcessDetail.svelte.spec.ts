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

	describe('page chrome (ProcessHeader + back link)', () => {
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

		it('renders the back link with the prominent red button-like styling', async () => {
			render(ProcessDetail, baseProps);
			const backLink = page.getByRole('link', { name: /Volver a procesos/ });
			await expect.element(backLink).toBeInTheDocument();
			const cls = backLink.element().className;
			expect(cls).toMatch(/\btext-brand-red\b/);
			expect(cls).toMatch(/\bborder\b/);
			expect(cls).toMatch(/\bhover:text-brand-red-hover\b/);
			expect(cls).toMatch(/\btransition-colors\b/);
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
			// VotingActionZone should be rendered (liveStatus wins over process.estatus).
			await expect
				.element(page.getByRole('button', { name: /Elegí un equipo/ }))
				.toBeInTheDocument();
			// No commitment zone in VOTING phase.
			await expect
				.element(page.getByRole('button', { name: /Enviar compromiso/ }))
				.not.toBeInTheDocument();
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

	// Phase 2: sequential single-column layout (process-detail-layout-refactor).
	// The 2-col grid + flex-col left cell are gone; everything stacks in
	// the process-content container with `space-y-consensus-8` rhythm.
	describe('sequential layout', () => {
		it('does not render any element with data-testid="process-detail-grid"', async () => {
			render(ProcessDetail, baseProps);
			expect(page.getByTestId('process-detail-grid').elements().length).toBe(0);
		});

		it('does not render any element with the lg:grid-cols-[3fr_1fr] class', async () => {
			const { container } = render(ProcessDetail, baseProps);
			const gridCols = container.querySelectorAll('[class*="lg:grid-cols-[3fr_1fr]"]');
			expect(gridCols.length).toBe(0);
		});

		it('renders the section with two direct children — both div.max-w-7xl.mx-auto', async () => {
			const { container } = render(ProcessDetail, baseProps);
			const section = container.querySelector('section');
			expect(section).toBeTruthy();
			expect(section?.className).toMatch(/\bpt-24\b/);
			expect(section?.className).toMatch(/\bpb-12\b/);

			// Two direct children of the section.
			const directChildren = Array.from(section?.children ?? []);
			expect(directChildren.length).toBe(2);

			// Both are max-w-7xl containers.
			for (const child of directChildren) {
				expect(child.className).toMatch(/\bmax-w-7xl\b/);
				expect(child.className).toMatch(/\bmx-auto\b/);
				expect(child.tagName.toLowerCase()).toBe('div');
			}
		});

		it('places the back link in its own max-w-7xl container with mb-consensus-8', async () => {
			const { container } = render(ProcessDetail, baseProps);
			const section = container.querySelector('section');
			const directChildren = Array.from(section?.children ?? []);
			const firstContainer = directChildren[0];

			expect(firstContainer.className).toMatch(/\bmb-consensus-8\b/);

			// The container holds exactly one anchor to /procesos.
			const anchors = firstContainer.querySelectorAll('a[href="/procesos"]');
			expect(anchors.length).toBe(1);
			expect(anchors[0].textContent?.trim()).toContain('Volver a procesos');
			// The margin must NOT live on the anchor itself anymore.
			expect(anchors[0].className).not.toMatch(/\bmb-8\b/);
		});

		it('places process content (Header/Timeline/Stats/TeamsList) in a sibling max-w-7xl container with space-y-consensus-8', async () => {
			const { container } = render(ProcessDetail, baseProps);
			const section = container.querySelector('section');
			const directChildren = Array.from(section?.children ?? []);
			const contentContainer = directChildren[1];

			expect(contentContainer.className).toMatch(/\bspace-y-consensus-8\b/);

			// The content container is NOT the back-link container.
			expect(contentContainer.querySelector('a[href="/procesos"]')).toBeNull();

			// First child is the ProcessHeader wrapper (<header>) containing the h1.
			const firstChild = contentContainer.children[0];
			expect(firstChild.tagName.toLowerCase()).toBe('header');
			const innerH1 = firstChild.querySelector('h1');
			expect(innerH1).toBeTruthy();
			await expect
				.element(innerH1 as HTMLElement)
				.toHaveTextContent('Elección 2026');

			// Timeline testids live in the content container.
			expect(contentContainer.querySelector('[data-testid="phase-compromiso"]')).toBeTruthy();
			expect(contentContainer.querySelector('[data-testid="phase-votacion"]')).toBeTruthy();
			expect(contentContainer.querySelector('[data-testid="phase-resultados"]')).toBeTruthy();

			// Stats labels live in the content container.
			expect(contentContainer.querySelector('[class*="grid"]')).toBeTruthy();
			expect(contentContainer.textContent).toContain('Participantes');
			expect(contentContainer.textContent).toContain('Compromisos');
			expect(contentContainer.textContent).toContain('Votaron');

			// Team cards live in the content container.
			expect(contentContainer.textContent).toContain('Team Alpha');
			expect(contentContainer.textContent).toContain('Team Beta');
		});

		it('uses the process-content container as the single source of vertical rhythm (no per-child mb-/mt-/gap- stacking)', async () => {
			const { container } = render(ProcessDetail, baseProps);
			const section = container.querySelector('section');
			const directChildren = Array.from(section?.children ?? []);
			const contentContainer = directChildren[1] as HTMLElement;

			// No direct child of the content container may carry mb-/mt-/gap-
			// for vertical stacking. The space-y-consensus-8 on the parent
			// is the only source.
			const directInner = Array.from(contentContainer.children);
			for (const child of directInner) {
				expect(child.className).not.toMatch(/\bmb-\d+/);
				expect(child.className).not.toMatch(/\bmt-\d+/);
			}
		});

		it('ProcessDetail passes variant="horizontal" to ProcessStats (sm:grid-cols-3)', async () => {
			render(ProcessDetail, baseProps);

			const stats = page.getByText('Participantes', { exact: true });
			const statsRoot = stats.element().closest('div.grid');
			expect(statsRoot).toBeTruthy();
			expect(statsRoot?.className).toMatch(/\bsm:grid-cols-3\b/);
			// The horizontal variant must NOT carry the vertical-only override
			// `sm:grid-cols-1` (which is not present in either variant, but
			// is included as a defensive guard against future regressions).
			expect(statsRoot?.className).not.toMatch(/\bsm:grid-cols-1\b/);
		});
	});
});