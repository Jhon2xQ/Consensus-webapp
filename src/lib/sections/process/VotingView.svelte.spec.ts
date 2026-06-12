import { page } from 'vitest/browser';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import VotingView from './VotingView.svelte';
import type { ElectoralProcess } from '$lib/types/electoral-process';
import type { Team } from '$lib/types/team';
import type { Enrollment } from '$lib/types/enrollment';

// ── Hoisted mocks (must be defined before vi.mock calls) ────────────────
const mockVerifyPasskey = vi.hoisted(() => vi.fn());
const mockDeriveIdentity = vi.hoisted(() => vi.fn());
const mockBuildVotingProof = vi.hoisted(() => vi.fn());
const mockSubmitVotingProof = vi.hoisted(() => vi.fn());
const mockGoto = vi.hoisted(() => vi.fn());
const mockInvalidateAll = vi.hoisted(() => vi.fn());
const mockFetch = vi.hoisted(() => vi.fn());

vi.mock('$lib/services/passkey.service', () => ({
	verifyPasskey: mockVerifyPasskey
}));

vi.mock('$lib/services/semaphore.service', () => ({
	deriveIdentity: mockDeriveIdentity
}));

vi.mock('$lib/services/proof.service', () => ({
	buildVotingProof: mockBuildVotingProof,
	submitVotingProof: mockSubmitVotingProof
}));

vi.mock('$app/navigation', () => ({
	goto: mockGoto,
	invalidateAll: mockInvalidateAll
}));

vi.mock('$env/dynamic/public', () => ({
	env: { PUBLIC_RELAYER_API_URL: 'https://relayer.example.com' }
}));

vi.stubGlobal('fetch', mockFetch);

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

const mockTeams: Team[] = [
	{ id: 't1', name: 'Equipo Alpha', avatarUrl: null, electoralProcessId: 'proc-1' },
	{ id: 't2', name: 'Equipo Beta', avatarUrl: null, electoralProcessId: 'proc-1' },
	{ id: 't3', name: 'Equipo Gamma', avatarUrl: null, electoralProcessId: 'proc-1' }
];

const enrolledUser: Enrollment = {
	id: 'enr-1',
	electoralProcessId: 'proc-1',
	email: 'test@example.com',
	userId: 'user-abc-123',
	commitment: 'commitment-abc',
	hasVoted: false
};

const votedUser: Enrollment = {
	...enrolledUser,
	hasVoted: true
};

function defaultProps(overrides?: Record<string, unknown>) {
	return {
		process: mockProcess,
		teams: mockTeams,
		userSub: 'user-abc-123',
		userEnrollment: null,
		commitments: ['1', '2', '3'],
		commitmentsError: false,
		...overrides
	};
}

describe('VotingView', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockVerifyPasskey.mockResolvedValue({ credentialId: 'cred-1' });
		mockDeriveIdentity.mockResolvedValue({
			identity: { commitment: { toString: () => 'commitment-abc' } },
			commitment: 'commitment-abc'
		});
		mockBuildVotingProof.mockResolvedValue({
			merkleTreeDepth: 20,
			merkleTreeRoot: 'root',
			nullifier: 'null',
			message: 'Equipo Alpha',
			scope: 'proc-1',
			points: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']
		});
		mockSubmitVotingProof.mockResolvedValue({
			success: true,
			data: { transaction: { hash: '0xabc' } }
		});
		mockInvalidateAll.mockResolvedValue(undefined as never);
		mockFetch.mockResolvedValue({ ok: true, status: 200, text: async () => '' });
	});

	describe('teams list', () => {
		it('renders all teams from the prop', async () => {
			render(VotingView, defaultProps());
			await expect.element(page.getByText('Equipo Alpha')).toBeInTheDocument();
			await expect.element(page.getByText('Equipo Beta')).toBeInTheDocument();
			await expect.element(page.getByText('Equipo Gamma')).toBeInTheDocument();
		});

		it('team buttons are enabled when no team is selected and user has not voted', async () => {
			render(VotingView, defaultProps());
			const alphaBtn = page.getByRole('button', { name: /Equipo Alpha/ }).first();
			await expect.element(alphaBtn).toBeEnabled();
		});
	});

	describe('vote button — idle state', () => {
		it('shows "Elegí un equipo para votar" when no team selected', async () => {
			render(VotingView, defaultProps());
			const btn = page.getByRole('button', { name: 'Elegí un equipo para votar' });
			await expect.element(btn).toBeInTheDocument();
			await expect.element(btn).toBeDisabled();
		});

		it('shows "Votar por {team.name}" when a team is selected', async () => {
			render(VotingView, defaultProps());
			await page.getByRole('button', { name: /Equipo Alpha/ }).first().click();
			const btn = page.getByRole('button', { name: 'Votar por Equipo Alpha' });
			await expect.element(btn).toBeInTheDocument();
			await expect.element(btn).toBeEnabled();
		});

		it('switches to "Votar por {otherTeam.name}" when user picks a different team', async () => {
			render(VotingView, defaultProps());
			await page.getByRole('button', { name: /Equipo Alpha/ }).first().click();
			await expect
				.element(page.getByRole('button', { name: 'Votar por Equipo Alpha' }))
				.toBeInTheDocument();
			await page.getByRole('button', { name: /Equipo Beta/ }).first().click();
			await expect
				.element(page.getByRole('button', { name: 'Votar por Equipo Beta' }))
				.toBeInTheDocument();
		});

		it('toggles selection off when clicking the same team again', async () => {
			render(VotingView, defaultProps());
			const teamCard = page.getByRole('button', { name: /Equipo Alpha/ }).first();
			await teamCard.click();
			await expect
				.element(page.getByRole('button', { name: 'Votar por Equipo Alpha' }))
				.toBeInTheDocument();
			await teamCard.click();
			await expect
				.element(page.getByRole('button', { name: 'Elegí un equipo para votar' }))
				.toBeInTheDocument();
		});

		it('shows "El grupo on-chain no está configurado" and disables button when groupId is null', async () => {
			render(
				VotingView,
				defaultProps({ process: { ...mockProcess, groupId: null } })
			);
			// Select a team first
			await page.getByRole('button', { name: /Equipo Alpha/ }).first().click();
			const btn = page.getByRole('button', {
				name: 'El grupo on-chain no está configurado'
			});
			await expect.element(btn).toBeInTheDocument();
			await expect.element(btn).toBeDisabled();
		});
	});

	describe('hasVoted state', () => {
		it('shows "Ya votaste" disabled button when userEnrollment.hasVoted is true', async () => {
			render(VotingView, defaultProps({ userEnrollment: votedUser }));
			const btn = page.getByRole('button', { name: 'Ya votaste' });
			await expect.element(btn).toBeInTheDocument();
			await expect.element(btn).toBeDisabled();
		});

		it('does not show the vote prompt when user has voted', async () => {
			render(VotingView, defaultProps({ userEnrollment: votedUser }));
			await expect
				.element(page.getByRole('button', { name: 'Elegí un equipo para votar' }))
				.not.toBeInTheDocument();
		});
	});

	describe('error state', () => {
		it('shows error message and "Reintentar" button after a failed relayer submission', async () => {
			// Services succeed up to the relayer — relayer returns 5xx
			mockSubmitVotingProof.mockRejectedValueOnce({
				kind: 'relayer-5xx',
				message: 'Relayer error: 500'
			});

			render(
				VotingView,
				defaultProps({ userEnrollment: { ...enrolledUser, hasVoted: false } })
			);

			// Select team, open dialog, confirm
			await page.getByRole('button', { name: /Equipo Alpha/ }).first().click();
			await page.getByRole('button', { name: 'Votar por Equipo Alpha' }).click();
			await page.getByRole('button', { name: 'Confirmar voto' }).click();

			// Error message + retry button appear
			const errorMsg = page.getByText('El relayer no está disponible');
			await expect.element(errorMsg).toBeInTheDocument();
			const retryBtn = page.getByRole('button', { name: 'Reintentar' });
			await expect.element(retryBtn).toBeInTheDocument();
		});

		it('clicking "Reintentar" clears the error and returns to idle', async () => {
			mockSubmitVotingProof.mockRejectedValueOnce({
				kind: 'relayer-5xx',
				message: 'Relayer error: 500'
			});

			render(VotingView, defaultProps({ userEnrollment: enrolledUser }));

			await page.getByRole('button', { name: /Equipo Alpha/ }).first().click();
			await page.getByRole('button', { name: 'Votar por Equipo Alpha' }).click();
			await page.getByRole('button', { name: 'Confirmar voto' }).click();

			await expect
				.element(page.getByText('El relayer no está disponible'))
				.toBeInTheDocument();

			await page.getByRole('button', { name: 'Reintentar' }).click();

			// Error cleared; idle button is back
			await expect
				.element(page.getByText('El relayer no está disponible'))
				.not.toBeInTheDocument();
			await expect
				.element(page.getByRole('button', { name: 'Votar por Equipo Alpha' }))
				.toBeInTheDocument();
		});

		it('shows passkey mismatch error when derived commitment differs from enrolled', async () => {
			mockDeriveIdentity.mockResolvedValueOnce({
				identity: { commitment: { toString: () => 'different-commitment' } },
				commitment: 'different-commitment'
			});

			render(
				VotingView,
				defaultProps({
					userEnrollment: { ...enrolledUser, commitment: 'expected-commitment' }
				})
			);

			await page.getByRole('button', { name: /Equipo Alpha/ }).first().click();
			await page.getByRole('button', { name: 'Votar por Equipo Alpha' }).click();
			await page.getByRole('button', { name: 'Confirmar voto' }).click();

			await expect
				.element(page.getByText('Usá la misma credencial'))
				.toBeInTheDocument();
		});
	});

	describe('confirmation dialog wiring', () => {
		it('clicking "Votar por {team}" opens the confirmation dialog', async () => {
			render(VotingView, defaultProps());
			await page.getByRole('button', { name: /Equipo Alpha/ }).first().click();
			await page.getByRole('button', { name: 'Votar por Equipo Alpha' }).click();
			await expect
				.element(page.getByRole('heading', { name: 'Confirmar voto' }))
				.toBeInTheDocument();
		});

		it('clicking "Cancelar" in the dialog closes it without starting the flow', async () => {
			render(VotingView, defaultProps());
			await page.getByRole('button', { name: /Equipo Alpha/ }).first().click();
			await page.getByRole('button', { name: 'Votar por Equipo Alpha' }).click();
			await page.getByRole('button', { name: 'Cancelar' }).click();
			await expect
				.element(page.getByRole('heading', { name: 'Confirmar voto' }))
				.not.toBeInTheDocument();
			expect(mockVerifyPasskey).not.toHaveBeenCalled();
		});
	});
});
