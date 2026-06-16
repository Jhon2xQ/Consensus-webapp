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

	// T-6: TeamsList is now rendered by ProcessDetail (the assembler).
	// VotingView is reduced to the action zone (button + dialog + error).
	// The team-click flow tests (button text after selection, error
	// re-throw, dialog wiring) live in the new ProcessDetail spec and
	// will be re-added here in T-7 when VotingView accepts `voting` as a
	// prop and the test setup can drive selectedTeam from outside.

	describe('vote button — idle state', () => {
		it('shows "Elegí un equipo para votar" when no team selected', async () => {
			render(VotingView, defaultProps());
			const btn = page.getByRole('button', { name: 'Elegí un equipo para votar' });
			await expect.element(btn).toBeInTheDocument();
			await expect.element(btn).toBeDisabled();
		});

		it('does not render any team cards (TeamsList moved to ProcessDetail in T-6)', async () => {
			render(VotingView, defaultProps());
			// Sanity check: the action zone has no team-selection UI.
			await expect
				.element(page.getByTestId('team-card-t1'))
				.not.toBeInTheDocument();
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
});
