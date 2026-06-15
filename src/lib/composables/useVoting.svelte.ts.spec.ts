import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Team } from '$lib/types/team';
import type { Enrollment } from '$lib/types/enrollment';
import type { VotingStage, ProofError } from '$lib/types/proof';
import { useVoting, type UseVotingParams } from './useVoting.svelte';

// ── Hoisted mocks (must be defined before vi.mock calls) ────────────────
const {
	mockVerifyPasskey,
	mockDeriveIdentity,
	mockBuildVotingProof,
	mockSubmitVotingProof,
	mockGoto,
	mockInvalidateAll,
	mockFetch
} = vi.hoisted(() => ({
	mockVerifyPasskey: vi.fn(),
	mockDeriveIdentity: vi.fn(),
	mockBuildVotingProof: vi.fn(),
	mockSubmitVotingProof: vi.fn(),
	mockGoto: vi.fn(),
	mockInvalidateAll: vi.fn(),
	mockFetch: vi.fn()
}));

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

vi.stubGlobal('fetch', mockFetch);

// ── Fixtures ────────────────────────────────────────────────────────────

const teamA: Team = {
	id: 'team-a',
	name: 'Equipo A',
	electoralProcessId: 'proc-1'
};

const teamB: Team = {
	id: 'team-b',
	name: 'Equipo B',
	electoralProcessId: 'proc-1'
};

const mockIdentity = {
	commitment: { toString: () => '12345' }
};

const mockProof = {
	merkleTreeDepth: 20,
	merkleTreeRoot: 'root-1',
	nullifier: 'nullifier-1',
	message: 'message-1',
	scope: 'scope-1',
	points: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']
};

type ParamsOverrides = {
	userSub?: string | null;
	processId?: string;
	groupId?: string | null;
	userEnrollment?: Enrollment | null;
	commitments?: string[];
	commitmentsError?: boolean;
};

function makeParams(overrides: ParamsOverrides = {}): UseVotingParams {
	// Spread to preserve explicit `null` values — `overrides.userSub ?? default`
	// would fall through on `null` and return the default, masking the test intent.
	const config = {
		userSub: 'user-1' as string | null,
		processId: 'proc-1' as string,
		groupId: 'group-1' as string | null,
		userEnrollment: null as Enrollment | null,
		commitments: ['c1', 'c2', 'c3'] as string[],
		commitmentsError: false as boolean,
		...overrides
	};
	return {
		userSub: () => config.userSub,
		processId: () => config.processId,
		groupId: () => config.groupId,
		userEnrollment: () => config.userEnrollment,
		commitments: () => config.commitments,
		commitmentsError: () => config.commitmentsError
	};
}

// ── Setup ───────────────────────────────────────────────────────────────

beforeEach(() => {
	vi.clearAllMocks();

	// Sensible defaults — tests override as needed.
	mockVerifyPasskey.mockResolvedValue({ credentialId: 'cred-1' });
	mockDeriveIdentity.mockResolvedValue({
		identity: mockIdentity,
		commitment: '12345'
	});
	mockBuildVotingProof.mockResolvedValue(mockProof);
	mockSubmitVotingProof.mockResolvedValue({
		success: true,
		data: { transaction: { hash: '0xabc' } }
	});
	mockFetch.mockResolvedValue({
		ok: true,
		json: async () => ({})
	});
	mockInvalidateAll.mockResolvedValue(undefined);
	mockGoto.mockResolvedValue(undefined);
});

// ── Initial state ───────────────────────────────────────────────────────

describe('useVoting — initial state', () => {
	it('returns idle flow, no selection, no error, no dialog, hasVoted false', () => {
		const v = useVoting(makeParams());

		expect(v.votingFlow).toBe('idle');
		expect(v.selectedTeam).toBeNull();
		expect(v.error).toBeNull();
		expect(v.showConfirmDialog).toBe(false);
		expect(v.hasVoted).toBe(false);
	});
});

// ── selectTeam ──────────────────────────────────────────────────────────

describe('useVoting — selectTeam', () => {
	it('sets selectedTeam when a team is clicked', () => {
		const v = useVoting(makeParams());
		v.selectTeam(teamA);
		expect(v.selectedTeam).toEqual(teamA);
	});

	it('toggles selectedTeam off when the same team is clicked again', () => {
		const v = useVoting(makeParams());
		v.selectTeam(teamA);
		v.selectTeam(teamA);
		expect(v.selectedTeam).toBeNull();
	});

	it('switches selection to a different team', () => {
		const v = useVoting(makeParams());
		v.selectTeam(teamA);
		v.selectTeam(teamB);
		expect(v.selectedTeam).toEqual(teamB);
	});

	it('is a no-op when votingFlow is not idle', async () => {
		const v = useVoting(makeParams());

		// Defer verifyPasskey so submitVote stays in 'verifying-passkey'.
		let resolveVerify: (value: { credentialId: string }) => void = () => {};
		mockVerifyPasskey.mockImplementation(
			() => new Promise((resolve) => { resolveVerify = resolve; })
		);

		v.selectTeam(teamA); // First selection works
		const submitP = v.submitVote();

		// After the synchronous prelude, votingFlow is 'verifying-passkey'.
		expect(v.votingFlow).toBe('verifying-passkey');

		// selectTeam must be ignored while the flow is in progress.
		v.selectTeam(teamB);
		expect(v.selectedTeam).toEqual(teamA);

		v.selectTeam(teamA); // Toggle attempt also ignored
		expect(v.selectedTeam).toEqual(teamA);

		// Unblock submitVote so we don't leak an open promise.
		resolveVerify({ credentialId: 'cred-1' });
		await submitP.catch(() => {});
	});

	it('is a no-op when hasVoted is true', () => {
		const v = useVoting(
			makeParams({
				userEnrollment: {
					id: 'enr-1',
					electoralProcessId: 'proc-1',
					email: 'test@test.com',
					userId: 'user-1',
					commitment: '12345',
					hasVoted: true
				}
			})
		);

		v.selectTeam(teamA);
		expect(v.selectedTeam).toBeNull();
	});
});

// ── hasVoted ────────────────────────────────────────────────────────────

describe('useVoting — hasVoted', () => {
	it('reflects userEnrollment.hasVoted when true', () => {
		const v = useVoting(
			makeParams({
				userEnrollment: {
					id: 'enr-1',
					electoralProcessId: 'proc-1',
					email: 'test@test.com',
					userId: 'user-1',
					commitment: '12345',
					hasVoted: true
				}
			})
		);

		expect(v.hasVoted).toBe(true);
	});

	it('is false when userEnrollment.hasVoted is false', () => {
		const v = useVoting(
			makeParams({
				userEnrollment: {
					id: 'enr-1',
					electoralProcessId: 'proc-1',
					email: 'test@test.com',
					userId: 'user-1',
					commitment: '12345',
					hasVoted: false
				}
			})
		);

		expect(v.hasVoted).toBe(false);
	});
});

// ── Dialog controls ─────────────────────────────────────────────────────

describe('useVoting — dialog controls', () => {
	it('openConfirmDialog sets showConfirmDialog to true', () => {
		const v = useVoting(makeParams());
		v.openConfirmDialog();
		expect(v.showConfirmDialog).toBe(true);
	});

	it('closeConfirmDialog sets showConfirmDialog to false', () => {
		const v = useVoting(makeParams());
		v.openConfirmDialog();
		v.closeConfirmDialog();
		expect(v.showConfirmDialog).toBe(false);
	});

	it('resetError clears error and returns flow to idle', () => {
		const v = useVoting(makeParams());

		v.resetError();
		expect(v.error).toBeNull();
		expect(v.votingFlow).toBe('idle');
	});
});

// ── submitVote — orchestration ──────────────────────────────────────────

describe('useVoting — submitVote orchestration', () => {
	it('returns early when no userSub', async () => {
		const v = useVoting(makeParams({ userSub: null }));
		v.selectTeam(teamA);

		await v.submitVote();

		expect(v.votingFlow).toBe('idle');
		expect(mockVerifyPasskey).not.toHaveBeenCalled();
	});

	it('returns early when no selectedTeam', async () => {
		const v = useVoting(makeParams());

		await v.submitVote();

		expect(v.votingFlow).toBe('idle');
		expect(mockVerifyPasskey).not.toHaveBeenCalled();
	});

	it('returns early when no groupId', async () => {
		const v = useVoting(makeParams({ groupId: null }));
		v.selectTeam(teamA);

		await v.submitVote();

		expect(v.votingFlow).toBe('idle');
		expect(mockVerifyPasskey).not.toHaveBeenCalled();
	});

	it('returns early when hasVoted is true', async () => {
		const v = useVoting(
			makeParams({
				userEnrollment: {
					id: 'enr-1',
					electoralProcessId: 'proc-1',
					email: 'test@test.com',
					userId: 'user-1',
					commitment: '12345',
					hasVoted: true
				}
			})
		);
		v.selectTeam(teamA);

		await v.submitVote();

		expect(v.votingFlow).toBe('idle');
		expect(mockVerifyPasskey).not.toHaveBeenCalled();
	});

	it('calls verifyPasskey → deriveIdentity → buildVotingProof → submitVotingProof in order', async () => {
		const callOrder: string[] = [];

		mockVerifyPasskey.mockImplementation(async () => {
			callOrder.push('verifyPasskey');
			return { credentialId: 'cred-1' };
		});
		mockDeriveIdentity.mockImplementation(async () => {
			callOrder.push('deriveIdentity');
			return { identity: mockIdentity, commitment: '12345' };
		});
		mockBuildVotingProof.mockImplementation(async () => {
			callOrder.push('buildVotingProof');
			return mockProof;
		});
		mockSubmitVotingProof.mockImplementation(async () => {
			callOrder.push('submitVotingProof');
			return { success: true, data: { transaction: { hash: '0xabc' } } };
		});

		const v = useVoting(makeParams());
		v.selectTeam(teamA);
		await v.submitVote();

		expect(callOrder).toEqual([
			'verifyPasskey',
			'deriveIdentity',
			'buildVotingProof',
			'submitVotingProof'
		]);
	});

	it('passes credentialId from passkey result into deriveIdentity', async () => {
		mockVerifyPasskey.mockResolvedValueOnce({ credentialId: 'cred-from-passkey' });

		const v = useVoting(makeParams());
		v.selectTeam(teamA);
		await v.submitVote();

		expect(mockDeriveIdentity).toHaveBeenCalledWith(
			'user-1',
			'cred-from-passkey',
			'proc-1'
		);
	});

	it('passes the selected team name into buildVotingProof', async () => {
		const v = useVoting(makeParams());
		v.selectTeam(teamA);
		await v.submitVote();

		expect(mockBuildVotingProof).toHaveBeenCalledWith(
			expect.objectContaining({
				teamName: teamA.name,
				processId: 'proc-1',
				groupId: 'group-1',
				commitments: ['c1', 'c2', 'c3']
			})
		);
	});

	it('transitions votingFlow through verifying-passkey → building-proof → submitting → success', async () => {
		const stagesObserved: VotingStage[] = [];
		const holder: { v: ReturnType<typeof useVoting> | null } = { v: null };

		mockVerifyPasskey.mockImplementation(async () => {
			stagesObserved.push(holder.v?.votingFlow ?? 'idle');
			return { credentialId: 'cred-1' };
		});
		mockDeriveIdentity.mockImplementation(async () => {
			stagesObserved.push(holder.v?.votingFlow ?? 'idle');
			return { identity: mockIdentity, commitment: '12345' };
		});
		mockBuildVotingProof.mockImplementation(async () => {
			stagesObserved.push(holder.v?.votingFlow ?? 'idle');
			return mockProof;
		});
		mockSubmitVotingProof.mockImplementation(async () => {
			stagesObserved.push(holder.v?.votingFlow ?? 'idle');
			return { success: true, data: { transaction: { hash: '0xabc' } } };
		});

		holder.v = useVoting(makeParams());
		holder.v.selectTeam(teamA);
		await holder.v.submitVote();

		// verifyPasskey runs during 'verifying-passkey'
		// deriveIdentity also runs during 'verifying-passkey' (state hasn't transitioned yet)
		// buildVotingProof runs during 'building-proof'
		// submitVotingProof runs during 'submitting'
		expect(stagesObserved).toEqual([
			'verifying-passkey',
			'verifying-passkey',
			'building-proof',
			'submitting'
		]);
		expect(holder.v.votingFlow).toBe('success');
	});
});

// ── submitVote — pre-checks ─────────────────────────────────────────────

describe('useVoting — submitVote pre-checks', () => {
	it('sets error and stops when commitmentsError is true', async () => {
		const v = useVoting(makeParams({ commitmentsError: true }));
		v.selectTeam(teamA);

		await v.submitVote();

		expect(v.votingFlow).toBe('error');
		expect(v.error).toBe(
			'No se pudieron cargar los compromisos. Recargá la página e intentá de nuevo.'
		);
		expect(mockVerifyPasskey).not.toHaveBeenCalled();
	});

	it('sets error and stops when commitments array is empty', async () => {
		const v = useVoting(makeParams({ commitments: [] }));
		v.selectTeam(teamA);

		await v.submitVote();

		expect(v.votingFlow).toBe('error');
		expect(v.error).toBe('Todavía no hay compromisos registrados en este proceso.');
		expect(mockVerifyPasskey).not.toHaveBeenCalled();
	});
});

// ── submitVote — passkey mismatch ───────────────────────────────────────

describe('useVoting — submitVote passkey mismatch', () => {
	it('sets error and stops when identity.commitment !== userEnrollment.commitment', async () => {
		const enrollment: Enrollment = {
			id: 'enr-1',
			electoralProcessId: 'proc-1',
			email: 'test@test.com',
			userId: 'user-1',
			commitment: 'ENROLLED_COMMITMENT',
			hasVoted: false
		};

		const mismatchedIdentity = {
			commitment: { toString: () => 'DIFFERENT_COMMITMENT' }
		};

		mockDeriveIdentity.mockResolvedValueOnce({
			identity: mismatchedIdentity,
			commitment: 'DIFFERENT_COMMITMENT'
		});

		const v = useVoting(makeParams({ userEnrollment: enrollment }));
		v.selectTeam(teamA);
		await v.submitVote();

		expect(v.votingFlow).toBe('error');
		expect(v.error).toBe('Usá la misma credencial con la que enviaste tu compromiso');
		expect(mockBuildVotingProof).not.toHaveBeenCalled();
	});

	it('passes the mismatch check when commitments match', async () => {
		const enrollment: Enrollment = {
			id: 'enr-1',
			electoralProcessId: 'proc-1',
			email: 'test@test.com',
			userId: 'user-1',
			commitment: '12345', // matches mockIdentity.commitment.toString()
			hasVoted: false
		};

		const v = useVoting(makeParams({ userEnrollment: enrollment }));
		v.selectTeam(teamA);
		await v.submitVote();

		expect(v.votingFlow).toBe('success');
		expect(mockBuildVotingProof).toHaveBeenCalled();
	});
});

// ── submitVote — error handling ──────────────────────────────────────────

describe('useVoting — submitVote error handling', () => {
	it('returns silently to idle on DOMException NotAllowedError', async () => {
		const cancelError = new DOMException('User cancelled', 'NotAllowedError');
		mockVerifyPasskey.mockRejectedValueOnce(cancelError);

		const v = useVoting(makeParams());
		v.selectTeam(teamA);
		await v.submitVote();

		expect(v.votingFlow).toBe('idle');
		expect(v.error).toBeNull();
	});

	it('maps relayer-4xx with nullifier message to a user-friendly error', async () => {
		mockSubmitVotingProof.mockRejectedValueOnce({
			kind: 'relayer-4xx',
			message: 'Nullifier already used for this scope'
		} satisfies ProofError);

		const v = useVoting(makeParams());
		v.selectTeam(teamA);
		await v.submitVote();

		expect(v.votingFlow).toBe('error');
		expect(v.error).toBe('Ya emitiste tu voto para este proceso.');
	});

	it('maps merkle-failed error to user-friendly message', async () => {
		mockBuildVotingProof.mockRejectedValueOnce({
			kind: 'merkle-failed',
			message: 'boom'
		} satisfies ProofError);

		const v = useVoting(makeParams());
		v.selectTeam(teamA);
		await v.submitVote();

		expect(v.votingFlow).toBe('error');
		expect(v.error).toBe('Error al generar la prueba. Intentá de nuevo.');
	});

	it('maps snark-download error to user-friendly message', async () => {
		mockBuildVotingProof.mockRejectedValueOnce({
			kind: 'snark-download',
			message: 'wasm load failed'
		} satisfies ProofError);

		const v = useVoting(makeParams());
		v.selectTeam(teamA);
		await v.submitVote();

		expect(v.votingFlow).toBe('error');
		expect(v.error).toBe(
			'Error al descargar la librería de pruebas. Verificá tu conexión.'
		);
	});

	it('maps relayer-5xx error to user-friendly message', async () => {
		mockSubmitVotingProof.mockRejectedValueOnce({
			kind: 'relayer-5xx',
			message: 'down'
		} satisfies ProofError);

		const v = useVoting(makeParams());
		v.selectTeam(teamA);
		await v.submitVote();

		expect(v.votingFlow).toBe('error');
		expect(v.error).toBe('El relayer no está disponible. Intentá más tarde.');
	});

	it('falls back to the Error message for non-ProofError throws', async () => {
		mockVerifyPasskey.mockRejectedValueOnce(new Error('Something weird happened'));

		const v = useVoting(makeParams());
		v.selectTeam(teamA);
		await v.submitVote();

		expect(v.votingFlow).toBe('error');
		expect(v.error).toBe('Something weird happened');
	});

	it('throws on a non-ok mark-as-voted response', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: false,
			status: 500,
			json: async () => ({ error: 'db down' })
		});

		const v = useVoting(makeParams());
		v.selectTeam(teamA);
		await v.submitVote();

		expect(v.votingFlow).toBe('error');
		expect(v.error).toContain('No se pudo registrar el voto en el servidor');
		expect(v.error).toContain('db down');
	});
});

// ── submitVote — success path ───────────────────────────────────────────

describe('useVoting — submitVote success path', () => {
	it('flips hasVoted, calls invalidateAll and goto on full success', async () => {
		const v = useVoting(makeParams());
		v.selectTeam(teamA);
		await v.submitVote();

		expect(v.votingFlow).toBe('success');
		expect(v.hasVoted).toBe(true);

		expect(mockInvalidateAll).toHaveBeenCalledTimes(1);
		expect(mockGoto).toHaveBeenCalledTimes(1);
		expect(mockGoto).toHaveBeenCalledWith(
			`?success=${encodeURIComponent('Voto registrado')}`,
			{ replaceState: true }
		);
	});

	it('does not call the mark-as-voted endpoint when relayer returns success: false (already on-chain)', async () => {
		mockSubmitVotingProof.mockResolvedValueOnce({
			success: false,
			message: 'Nullifier already used'
		});

		const v = useVoting(makeParams());
		v.selectTeam(teamA);
		await v.submitVote();

		expect(v.votingFlow).toBe('success');
		expect(v.hasVoted).toBe(true);
		expect(mockFetch).not.toHaveBeenCalled();
		expect(mockInvalidateAll).toHaveBeenCalledTimes(1);
		// No success banner on duplicate — the user already voted.
		expect(mockGoto).not.toHaveBeenCalled();
	});
});
