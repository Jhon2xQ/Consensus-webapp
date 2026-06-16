import { page } from 'vitest/browser';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import VotingActionZone from './VotingActionZone.svelte';
import type { ElectoralProcess } from '$lib/types/electoral-process';
import type { Team } from '$lib/types/team';
import type { ComponentProps } from 'svelte';

type ActionZoneProps = ComponentProps<typeof VotingActionZone>;
type Voting = ActionZoneProps['voting'];

// ── Fixtures ────────────────────────────────────────────────────────────

const mockProcess: ElectoralProcess = {
	id: 'proc-1',
	name: 'Elecciones 2026',
	scope: 'Nacional',
	description: 'Proceso electoral',
	groupId: 'group-1',
	estatus: 'VOTING',
	commitmentStart: '2026-03-01T00:00:00Z',
	commitmentEnd: '2026-04-30T00:00:00Z',
	votingStart: '2026-06-15T00:00:00Z',
	votingEnd: '2026-06-20T00:00:00Z',
	results: '2026-06-25T00:00:00Z',
	createdBy: 'user-1'
};

const teamAlpha: Team = {
	id: 't1',
	name: 'Equipo Alpha',
	avatarUrl: null,
	electoralProcessId: 'proc-1'
};

// ── Test helpers ────────────────────────────────────────────────────────

// Build a hand-rolled `voting` object (T-7 architecture: voting is a
// prop, not instantiated inside the component). Defaults are idle + no
// selection + no error; tests override the fields they care about.
function makeVoting(overrides?: Partial<Voting>): Voting {
	return {
		flow: 'idle',
		error: null,
		hasVoted: false,
		showConfirmDialog: false,
		openConfirmDialog: vi.fn(),
		closeConfirmDialog: vi.fn(),
		submitVote: vi.fn().mockResolvedValue(undefined),
		resetError: vi.fn(),
		...overrides
	};
}

function defaultProps(overrides?: Partial<ActionZoneProps>): ActionZoneProps {
	return {
		process: mockProcess,
		selectedTeam: null,
		voting: makeVoting(),
		...overrides
	};
}

// ── Tests ──────────────────────────────────────────────────────────────

describe('VotingActionZone', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('vote button — idle state', () => {
		it('shows "Elegí un equipo para votar" when no team selected', async () => {
			render(VotingActionZone, defaultProps());
			const btn = page.getByRole('button', { name: 'Elegí un equipo para votar' });
			await expect.element(btn).toBeInTheDocument();
			await expect.element(btn).toBeDisabled();
		});

		it('shows "Votar por {team.name}" when a team is selected', async () => {
			render(VotingActionZone, defaultProps({ selectedTeam: teamAlpha }));
			const btn = page.getByRole('button', { name: 'Votar por Equipo Alpha' });
			await expect.element(btn).toBeInTheDocument();
			await expect.element(btn).toBeEnabled();
		});

		it('shows "El grupo on-chain no está configurado" and disables button when groupId is null', async () => {
			render(
				VotingActionZone,
				defaultProps({
					selectedTeam: teamAlpha,
					process: { ...mockProcess, groupId: null }
				})
			);
			const btn = page.getByRole('button', {
				name: 'El grupo on-chain no está configurado'
			});
			await expect.element(btn).toBeInTheDocument();
			await expect.element(btn).toBeDisabled();
		});
	});

	describe('hasVoted state', () => {
		it('shows "Ya votaste" disabled button when voting.hasVoted is true', async () => {
			render(VotingActionZone, defaultProps({ voting: makeVoting({ hasVoted: true }) }));
			const btn = page.getByRole('button', { name: 'Ya votaste' });
			await expect.element(btn).toBeInTheDocument();
			await expect.element(btn).toBeDisabled();
		});
	});

	describe('error state', () => {
		it('shows error message and "Reintentar" button when voting.flow is "error"', async () => {
			const resetError = vi.fn();
			render(
				VotingActionZone,
				defaultProps({
					voting: makeVoting({
						flow: 'error',
						error: 'El relayer no está disponible',
						resetError
					})
				})
			);
			await expect
				.element(page.getByText('El relayer no está disponible'))
				.toBeInTheDocument();
			const retryBtn = page.getByRole('button', { name: 'Reintentar' });
			await expect.element(retryBtn).toBeInTheDocument();
		});

		it('clicking "Reintentar" calls voting.resetError', async () => {
			const resetError = vi.fn();
			render(
				VotingActionZone,
				defaultProps({
					voting: makeVoting({
						flow: 'error',
						error: 'El relayer no está disponible',
						resetError
					})
				})
			);
			await page.getByRole('button', { name: 'Reintentar' }).click();
			expect(resetError).toHaveBeenCalledTimes(1);
		});
	});

	describe('confirmation dialog wiring', () => {
		it('clicking "Votar por {team}" calls voting.openConfirmDialog', async () => {
			const openConfirmDialog = vi.fn();
			render(
				VotingActionZone,
				defaultProps({
					selectedTeam: teamAlpha,
					voting: makeVoting({ openConfirmDialog })
				})
			);
			await page.getByRole('button', { name: 'Votar por Equipo Alpha' }).click();
			expect(openConfirmDialog).toHaveBeenCalledTimes(1);
		});

		it('opens the dialog when voting.showConfirmDialog is true', async () => {
			render(
				VotingActionZone,
				defaultProps({
					selectedTeam: teamAlpha,
					voting: makeVoting({ showConfirmDialog: true })
				})
			);
			await expect
				.element(page.getByRole('heading', { name: 'Confirmar voto' }))
				.toBeInTheDocument();
		});

		it('clicking "Cancelar" in the dialog calls voting.closeConfirmDialog', async () => {
			const closeConfirmDialog = vi.fn();
			render(
				VotingActionZone,
				defaultProps({
					selectedTeam: teamAlpha,
					voting: makeVoting({ showConfirmDialog: true, closeConfirmDialog })
				})
			);
			await page.getByRole('button', { name: 'Cancelar' }).click();
			expect(closeConfirmDialog).toHaveBeenCalledTimes(1);
		});

		it('clicking "Confirmar voto" closes the dialog then calls submitVote', async () => {
			const closeConfirmDialog = vi.fn();
			const submitVote = vi.fn().mockResolvedValue(undefined);
			render(
				VotingActionZone,
				defaultProps({
					selectedTeam: teamAlpha,
					voting: makeVoting({ showConfirmDialog: true, closeConfirmDialog, submitVote })
				})
			);
			await page.getByRole('button', { name: 'Confirmar voto' }).click();
			// Close happens first so the dialog overlay doesn't block the
			// "Reintentar" button on error.
			expect(closeConfirmDialog).toHaveBeenCalledTimes(1);
			expect(submitVote).toHaveBeenCalledTimes(1);
		});
	});

	describe('flow stages', () => {
		it.each(['verifying-passkey', 'building-proof', 'submitting'] as const)(
			'shows the stage message when flow is "%s"',
			async (flow) => {
				render(VotingActionZone, defaultProps({ voting: makeVoting({ flow }) }));
				const expected: Record<string, string> = {
					'verifying-passkey': 'Verificando tu credencial...',
					'building-proof': 'Generando prueba ZK...',
					submitting: 'Confirmando en blockchain...'
				};
				const btn = page.getByRole('button', { name: expected[flow] });
				await expect.element(btn).toBeInTheDocument();
				await expect.element(btn).toBeDisabled();
			}
		);
	});

	describe('does not render team cards (TeamsList is in ProcessDetail)', () => {
		it('does not render the team cards inside the action zone', async () => {
			render(VotingActionZone, defaultProps());
			await expect
				.element(page.getByTestId('team-card-t1'))
				.not.toBeInTheDocument();
		});
	});
});
