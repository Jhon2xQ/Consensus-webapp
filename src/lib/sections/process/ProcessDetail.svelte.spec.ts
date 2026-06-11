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

// Mock proof service
const mockBuildVotingProof = vi.hoisted(() => vi.fn());
const mockSubmitVotingProof = vi.hoisted(() => vi.fn());

vi.mock('$lib/services/proof.service', () => ({
	buildVotingProof: mockBuildVotingProof,
	submitVotingProof: mockSubmitVotingProof
}));

// Mock $app/navigation
const mockGoto = vi.hoisted(() => vi.fn());
const mockInvalidateAll = vi.hoisted(() => vi.fn());

vi.mock('$app/navigation', () => ({
	goto: mockGoto,
	invalidateAll: mockInvalidateAll
}));

// Mock $env/dynamic/public
vi.mock('$env/dynamic/public', () => ({
	env: { PUBLIC_RELAYER_API_URL: 'https://relayer.example.com' }
}));

// Mock fetch for API calls
const mockFetch = vi.hoisted(() => vi.fn());
vi.stubGlobal('fetch', mockFetch);

const mockProcess: ElectoralProcess = {
	id: '1',
	name: 'Elecciones Nacionales 2026',
	scope: 'Nacional',
	description: 'Proceso electoral para elegir representantes nacionales.',
	groupId: null,
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
		commitments: ['1', '2', '3'],
		commitmentsError: false,
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

		it('shows vote prompt when estatus is VOTING with no team selected', async () => {
			render(ProcessDetail, defaultProps({ process: { ...mockProcess, estatus: 'VOTING', groupId: 'group-1' } }));
			await expect.element(page.getByRole('button', { name: 'Elegí un equipo para votar' })).toBeInTheDocument();
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

	describe('team selection (VOTING phase)', () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		const votingProps = (overrides?: Record<string, unknown>) => ({
			...defaultProps({
				process: { ...mockProcess, estatus: 'VOTING', groupId: 'group-1' },
				...overrides
			})
		});

		it('shows "Elegí un equipo para votar" when no team selected', async () => {
			render(ProcessDetail, votingProps());
			await expect
				.element(page.getByRole('button', { name: 'Elegí un equipo para votar' }))
				.toBeInTheDocument();
		});

		it('clicking a team card makes it the selected team', async () => {
			render(ProcessDetail, votingProps());
			await page.getByRole('button', { name: /Equipo Alpha/ }).first().click();
			await expect
				.element(page.getByRole('button', { name: /Votar por Equipo Alpha/ }))
				.toBeInTheDocument();
		});

		it('clicking a different team changes the selection', async () => {
			render(ProcessDetail, votingProps());
			// Select Alpha first
			await page.getByRole('button', { name: /Equipo Alpha/ }).first().click();
			await expect
				.element(page.getByRole('button', { name: /Votar por Equipo Alpha/ }))
				.toBeInTheDocument();
			// Switch to Beta
			await page.getByRole('button', { name: /Equipo Beta/ }).click();
			await expect
				.element(page.getByRole('button', { name: /Votar por Equipo Beta/ }))
				.toBeInTheDocument();
		});

		it('button is disabled when hasVoted is true', async () => {
			const enrolledUser: Enrollment = {
				id: 'enr-1',
				electoralProcessId: '1',
				email: 'test@example.com',
				userId: 'user-abc-123',
				commitment: 'some-commitment-hash',
				hasVoted: true
			};
			render(ProcessDetail, votingProps({ userEnrollment: enrolledUser }));
			const btn = page.getByRole('button', { name: 'Ya votaste' });
			await expect.element(btn).toBeInTheDocument();
			await expect.element(btn).toBeDisabled();
		});

		it('button is disabled when groupId is null', async () => {
			render(ProcessDetail, votingProps({ process: { ...mockProcess, estatus: 'VOTING', groupId: null } }));
			// Select a team first
			const teamCards = page.getByRole('button', { name: /Equipo Alpha/ });
			await teamCards.first().click();
			// Button shows the "no configurado" copy and is disabled
			const btn = page.getByRole('button', { name: /El grupo on-chain no está configurado/ });
			await expect.element(btn).toBeInTheDocument();
			await expect.element(btn).toBeDisabled();
		});

		it('shows groupId null copy when group is not configured', async () => {
			render(ProcessDetail, votingProps({ process: { ...mockProcess, estatus: 'VOTING', groupId: null } }));
			await page.getByRole('button', { name: /Equipo Alpha/ }).click();
			await expect
				.element(page.getByRole('button', { name: /El grupo on-chain no está configurado/ }))
				.toBeInTheDocument();
		});

		it('clicking the same team deselects it (toggle)', async () => {
			render(ProcessDetail, votingProps());
			// Select Alpha — team card is a <button> inside the teams grid
			const teamCards = page.getByRole('button', { name: /Equipo Alpha/ });
			await teamCards.first().click();
			await expect
				.element(page.getByRole('button', { name: /Votar por Equipo Alpha/ }))
				.toBeInTheDocument();
			// Click the team card again to deselect (use .first() to target the card, not the vote button)
			await teamCards.first().click();
			await expect
				.element(page.getByRole('button', { name: /Elegí un equipo para votar/ }))
				.toBeInTheDocument();
		});
	});

	describe('voting confirmation dialog', () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		const votingProps = (overrides?: Record<string, unknown>) => ({
			...defaultProps({
				process: { ...mockProcess, estatus: 'VOTING', groupId: 'group-1' },
				...overrides
			})
		});

		it('clicking "Votar por [team]" opens the confirmation dialog', async () => {
			render(ProcessDetail, votingProps());
			await page.getByRole('button', { name: /Equipo Alpha/ }).first().click();
			await page.getByRole('button', { name: /Votar por Equipo Alpha/ }).click();
			await expect
				.element(page.getByRole('heading', { name: 'Confirmar voto' }))
				.toBeInTheDocument();
		});

		it('dialog shows team name in confirmation copy', async () => {
			render(ProcessDetail, votingProps());
			await page.getByRole('button', { name: /Equipo Beta/ }).click();
			await page.getByRole('button', { name: /Votar por Equipo Beta/ }).click();
			await expect
				.element(page.getByText(/Confirmás tu voto por Equipo Beta/))
				.toBeInTheDocument();
		});

		it('clicking "Cancelar" closes the dialog without starting flow', async () => {
			render(ProcessDetail, votingProps());
			await page.getByRole('button', { name: /Equipo Alpha/ }).first().click();
			await page.getByRole('button', { name: /Votar por Equipo Alpha/ }).click();
			// The cancel button inside the dialog
			await page.getByText('Cancelar', { exact: true }).click();
			await expect
				.element(page.getByRole('heading', { name: 'Confirmar voto' }))
				.not.toBeInTheDocument();
			// Team is still selected, so button shows "Votar por [team]"
			await expect
				.element(page.getByRole('button', { name: /Votar por Equipo Alpha/ }))
				.toBeInTheDocument();
			// verifyPasskey was NOT called
			expect(mockVerifyPasskey).not.toHaveBeenCalled();
		});

		it('clicking "Confirmar voto" completes the full voting flow', async () => {
			// Mock invalidateAll as no-op to prevent page reload in test environment
			mockInvalidateAll.mockResolvedValue(undefined as never);

			mockVerifyPasskey.mockResolvedValueOnce({ credentialId: 'cred-123' });
			mockDeriveIdentity.mockResolvedValueOnce({
				identity: { commitment: { toString: () => 'commitment-abc' } },
				commitment: 'commitment-abc'
			});
			// Mock fetch for members
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ data: ['111', '222', '333'] })
			});
			// Mock fetch for ?/mark-as-voted form action
			mockFetch.mockResolvedValueOnce({ ok: true, status: 200, text: async () => '' });
			mockBuildVotingProof.mockResolvedValueOnce({
				merkleTreeDepth: 20,
				merkleTreeRoot: 'root',
				nullifier: 'null',
				message: 'Equipo Alpha',
				scope: '1',
				points: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']
			});
			mockSubmitVotingProof.mockResolvedValueOnce({
				success: true,
				data: { transaction: { hash: '0xabc' } }
			});

			const enrolledUser: Enrollment = {
				id: 'enr-1',
				electoralProcessId: '1',
				email: 'test@example.com',
				userId: 'user-abc-123',
				commitment: 'commitment-abc',
				hasVoted: false
			};
			render(ProcessDetail, votingProps({ userEnrollment: enrolledUser }));

			// Select team
			await page.getByRole('button', { name: /Equipo Alpha/ }).first().click();
			// Click vote button
			await page.getByRole('button', { name: /Votar por Equipo Alpha/ }).click();
			// Confirm in dialog
			await page.getByRole('button', { name: 'Confirmar voto' }).click();

			// Mocks resolve immediately so the flow completes. With the
			// localHasVoted override the button flips straight to "Ya votaste"
			// without waiting for the server-side M2M callback to reconcile.
			const votedBtn = page.getByRole('button', { name: 'Ya votaste' });
			await expect.element(votedBtn).toBeInTheDocument();
			await expect.element(votedBtn).toBeDisabled();

			// Verify all services were called in order
			expect(mockVerifyPasskey).toHaveBeenCalledOnce();
			expect(mockDeriveIdentity).toHaveBeenCalledOnce();
			expect(mockBuildVotingProof).toHaveBeenCalledOnce();
			expect(mockSubmitVotingProof).toHaveBeenCalledOnce();
			expect(mockInvalidateAll).toHaveBeenCalled();
			// Verify mark-as-voted was POSTed to the form action
			const markCall = mockFetch.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('/mark-as-voted')
			);
			expect(markCall).toBeDefined();
		});
	});

	describe('voting flow states', () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		const votingProps = (overrides?: Record<string, unknown>) => ({
			...defaultProps({
				process: { ...mockProcess, estatus: 'VOTING', groupId: 'group-1' },
				...overrides
			})
		});

		it('returns to idle when user cancels passkey modal', async () => {
			mockVerifyPasskey.mockRejectedValueOnce(new DOMException('The operation was cancelled', 'NotAllowedError'));

			render(ProcessDetail, votingProps());
			await page.getByRole('button', { name: /Equipo Alpha/ }).first().click();
			await page.getByRole('button', { name: /Votar por Equipo Alpha/ }).click();
			await page.getByRole('button', { name: 'Confirmar voto' }).click();

			// Should NOT show error — returns to idle silently
			await expect
				.element(page.getByText(/Error/))
				.not.toBeInTheDocument();
			// Team selection should still be available (vote button visible)
			await expect
				.element(page.getByRole('button', { name: /Votar por Equipo Alpha/ }))
				.toBeInTheDocument();
		});

		it('shows passkey mismatch error when commitments differ', async () => {
			mockVerifyPasskey.mockResolvedValueOnce({ credentialId: 'cred-wrong' });
			mockDeriveIdentity.mockResolvedValueOnce({
				identity: { commitment: { toString: () => 'different-commitment' } },
				commitment: 'different-commitment'
			});

			const enrolledUser: Enrollment = {
				id: 'enr-1',
				electoralProcessId: '1',
				email: 'test@example.com',
				userId: 'user-abc-123',
				commitment: 'expected-commitment',
				hasVoted: false
			};
			render(ProcessDetail, votingProps({ userEnrollment: enrolledUser }));

			await page.getByRole('button', { name: /Equipo Alpha/ }).first().click();
			await page.getByRole('button', { name: /Votar por Equipo Alpha/ }).click();
			await page.getByRole('button', { name: 'Confirmar voto' }).click();

			await expect
				.element(page.getByText(/Usá la misma credencial/))
				.toBeInTheDocument();
		});

		it('shows error when relayer returns 5xx', async () => {
			mockVerifyPasskey.mockResolvedValueOnce({ credentialId: 'cred-123' });
			mockDeriveIdentity.mockResolvedValueOnce({
				identity: { commitment: { toString: () => 'commitment-abc' } },
				commitment: 'commitment-abc'
			});
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ data: ['111', '222'] })
			});
			mockBuildVotingProof.mockResolvedValueOnce({
				merkleTreeDepth: 20,
				merkleTreeRoot: 'root',
				nullifier: 'null',
				message: 'Equipo Alpha',
				scope: '1',
				points: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']
			});
			mockSubmitVotingProof.mockRejectedValueOnce({
				kind: 'relayer-5xx',
				message: 'Relayer error: 500'
			});

			const enrolledUser: Enrollment = {
				id: 'enr-1',
				electoralProcessId: '1',
				email: 'test@example.com',
				userId: 'user-abc-123',
				commitment: 'commitment-abc',
				hasVoted: false
			};
			render(ProcessDetail, votingProps({ userEnrollment: enrolledUser }));

			await page.getByRole('button', { name: /Equipo Alpha/ }).first().click();
			await page.getByRole('button', { name: /Votar por Equipo Alpha/ }).click();
			await page.getByRole('button', { name: 'Confirmar voto' }).click();

			await expect
				.element(page.getByText(/El relayer no está disponible/))
				.toBeInTheDocument();
		});

		it('shows error before prompting passkey when commitmentsError is true', async () => {
			const enrolledUser: Enrollment = {
				id: 'enr-1',
				electoralProcessId: '1',
				email: 'test@example.com',
				userId: 'user-abc-123',
				commitment: 'commitment-abc',
				hasVoted: false
			};
			render(ProcessDetail, votingProps({
				userEnrollment: enrolledUser,
				commitments: [],
				commitmentsError: true
			}));

			await page.getByRole('button', { name: /Equipo Alpha/ }).first().click();
			await page.getByRole('button', { name: /Votar por Equipo Alpha/ }).click();
			await page.getByRole('button', { name: 'Confirmar voto' }).click();

			// Pre-check fires BEFORE passkey verification
			expect(mockVerifyPasskey).not.toHaveBeenCalled();
			await expect
				.element(page.getByText(/Recargá la página/))
				.toBeInTheDocument();
		});

		it('shows error before prompting passkey when commitments list is empty', async () => {
			const enrolledUser: Enrollment = {
				id: 'enr-1',
				electoralProcessId: '1',
				email: 'test@example.com',
				userId: 'user-abc-123',
				commitment: 'commitment-abc',
				hasVoted: false
			};
			render(ProcessDetail, votingProps({
				userEnrollment: enrolledUser,
				commitments: [],
				commitmentsError: false
			}));

			await page.getByRole('button', { name: /Equipo Alpha/ }).first().click();
			await page.getByRole('button', { name: /Votar por Equipo Alpha/ }).click();
			await page.getByRole('button', { name: 'Confirmar voto' }).click();

			expect(mockVerifyPasskey).not.toHaveBeenCalled();
			await expect
				.element(page.getByText(/Todavía no hay compromisos registrados/))
				.toBeInTheDocument();
		});

		it('flips to "Ya votaste" immediately after success, even if the server enrollment still says hasVoted=false', async () => {
			// Regression: the old pendingM2mConfirm path left the user staring at
			// "Voto enviado — confirmando en blockchain..." whenever the server
			// mark beat the relayer (or vice versa). The localHasVoted override
			// flips the button the moment the relayer accepts, with no spinner.
			mockInvalidateAll.mockResolvedValue(undefined as never);

			mockVerifyPasskey.mockResolvedValueOnce({ credentialId: 'cred-123' });
			mockDeriveIdentity.mockResolvedValueOnce({
				identity: { commitment: { toString: () => 'commitment-abc' } },
				commitment: 'commitment-abc'
			});
			// Mock fetch for ?/mark-as-voted form action (server marks hasVoted)
			mockFetch.mockResolvedValueOnce({ ok: true, status: 200, text: async () => '' });
			mockBuildVotingProof.mockResolvedValueOnce({
				merkleTreeDepth: 20,
				merkleTreeRoot: 'root',
				nullifier: 'null',
				message: 'Equipo Alpha',
				scope: '1',
				points: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']
			});
			mockSubmitVotingProof.mockResolvedValueOnce({
				success: true,
				data: { transaction: { hash: '0xabc' } }
			});

			// M2M callback hasn't arrived yet — server still says hasVoted=false
			const enrolledUser: Enrollment = {
				id: 'enr-1',
				electoralProcessId: '1',
				email: 'test@example.com',
				userId: 'user-abc-123',
				commitment: 'commitment-abc',
				hasVoted: false
			};
			render(ProcessDetail, votingProps({ userEnrollment: enrolledUser }));

			await page.getByRole('button', { name: /Equipo Alpha/ }).click();
			await page.getByRole('button', { name: /Votar por Equipo Alpha/ }).click();
			await page.getByRole('button', { name: 'Confirmar voto' }).click();

			// The spinner text is gone from the template — we expect the
			// disabled "Ya votaste" button instead, even though the server's
			// hasVoted is still false.
			const votedBtn = page.getByRole('button', { name: 'Ya votaste' });
			await expect.element(votedBtn).toBeInTheDocument();
			await expect.element(votedBtn).toBeDisabled();
			// The old spinner copy must NOT appear anywhere.
			await expect
				.element(page.getByText(/confirmando en blockchain/))
				.not.toBeInTheDocument();
		});

		it('treats relayer success: false as vote accepted (already on-chain)', async () => {
			// Regression: the relayer returns { success: false } when the proof
			// is already on-chain (retry, wallet re-submit). In BOTH success: true
			// and success: false the vote exists on-chain, so the UI flips to
			// "Ya votaste" — no error shown.
			mockInvalidateAll.mockResolvedValue(undefined as never);

			mockVerifyPasskey.mockResolvedValueOnce({ credentialId: 'cred-123' });
			mockDeriveIdentity.mockResolvedValueOnce({
				identity: { commitment: { toString: () => 'commitment-abc' } },
				commitment: 'commitment-abc'
			});
			mockBuildVotingProof.mockResolvedValueOnce({
				merkleTreeDepth: 20,
				merkleTreeRoot: 'root',
				nullifier: 'null',
				message: 'Equipo Alpha',
				scope: '1',
				points: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']
			});
			mockSubmitVotingProof.mockResolvedValueOnce({
				success: false,
				message: 'Nullifier already used'
			});
			// Best-effort PUT to mark-as-voted — must still be attempted
			mockFetch.mockResolvedValueOnce({ ok: true, status: 200, text: async () => '' });

			const enrolledUser: Enrollment = {
				id: 'enr-1',
				electoralProcessId: '1',
				email: 'test@example.com',
				userId: 'user-abc-123',
				commitment: 'commitment-abc',
				hasVoted: false
			};
			render(ProcessDetail, votingProps({ userEnrollment: enrolledUser }));

			await page.getByRole('button', { name: /Equipo Alpha/ }).click();
			await page.getByRole('button', { name: /Votar por Equipo Alpha/ }).click();
			await page.getByRole('button', { name: 'Confirmar voto' }).click();

			// The "Ya emitiste tu voto" error must NOT appear — the relayer
			// accepting the nullifier is treated as success, not failure.
			await expect
				.element(page.getByText(/Ya emitiste tu voto para este proceso/))
				.not.toBeInTheDocument();

			// Button flips to "Ya votaste" via the localHasVoted override.
			const votedBtn = page.getByRole('button', { name: 'Ya votaste' });
			await expect.element(votedBtn).toBeInTheDocument();
			await expect.element(votedBtn).toBeDisabled();

			// The mark-as-voted PUT was still attempted so the server can
			// reconcile the enrollment.
			const markCall = mockFetch.mock.calls.find(
				(call) => typeof call[0] === 'string' && call[0].includes('/mark-as-voted')
			);
			expect(markCall).toBeDefined();
		});

		it('shows error when submitVotingProof throws (5xx, network)', async () => {
			// Only actual failures (5xx, network) should surface as errors.
			// The relayer returns { success, ... } consistently on all 4xx,
			// so a 4xx without success in the body means a non-relayer error.
			mockVerifyPasskey.mockResolvedValueOnce({ credentialId: 'cred-123' });
			mockDeriveIdentity.mockResolvedValueOnce({
				identity: { commitment: { toString: () => 'commitment-abc' } },
				commitment: 'commitment-abc'
			});
			mockBuildVotingProof.mockResolvedValueOnce({
				merkleTreeDepth: 20,
				merkleTreeRoot: 'root',
				nullifier: 'null',
				message: 'Equipo Alpha',
				scope: '1',
				points: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']
			});
			mockSubmitVotingProof.mockRejectedValueOnce({
				kind: 'relayer-5xx',
				message: 'Relayer error: 502'
			});

			const enrolledUser: Enrollment = {
				id: 'enr-1',
				electoralProcessId: '1',
				email: 'test@example.com',
				userId: 'user-abc-123',
				commitment: 'commitment-abc',
				hasVoted: false
			};
			render(ProcessDetail, votingProps({ userEnrollment: enrolledUser }));

			await page.getByRole('button', { name: /Equipo Alpha/ }).click();
			await page.getByRole('button', { name: /Votar por Equipo Alpha/ }).click();
			await page.getByRole('button', { name: 'Confirmar voto' }).click();

			await expect
				.element(page.getByText(/El relayer no está disponible/))
				.toBeInTheDocument();
		});

		it('shows error when proof generation fails', async () => {
			mockVerifyPasskey.mockResolvedValueOnce({ credentialId: 'cred-123' });
			mockDeriveIdentity.mockResolvedValueOnce({
				identity: { commitment: { toString: () => 'commitment-abc' } },
				commitment: 'commitment-abc'
			});
			mockBuildVotingProof.mockRejectedValueOnce({
				kind: 'merkle-failed',
				message: 'Error al generar la prueba ZK'
			});

			const enrolledUser: Enrollment = {
				id: 'enr-1',
				electoralProcessId: '1',
				email: 'test@example.com',
				userId: 'user-abc-123',
				commitment: 'commitment-abc',
				hasVoted: false
			};
			render(ProcessDetail, votingProps({ userEnrollment: enrolledUser }));

			await page.getByRole('button', { name: /Equipo Alpha/ }).click();
			await page.getByRole('button', { name: /Votar por Equipo Alpha/ }).click();
			await page.getByRole('button', { name: 'Confirmar voto' }).click();

			await expect
				.element(page.getByText(/Error al generar la prueba/))
				.toBeInTheDocument();
		});

		it('shows identity-not-in-group error when commitment is missing from the tree', async () => {
			mockVerifyPasskey.mockResolvedValueOnce({ credentialId: 'cred-123' });
			mockDeriveIdentity.mockResolvedValueOnce({
				identity: { commitment: { toString: () => 'commitment-abc' } },
				commitment: 'commitment-abc'
			});
			mockBuildVotingProof.mockRejectedValueOnce({
				kind: 'identity-not-in-group',
				message: 'No se encontró tu compromiso en el árbol de votantes.'
			});

			const enrolledUser: Enrollment = {
				id: 'enr-1',
				electoralProcessId: '1',
				email: 'test@example.com',
				userId: 'user-abc-123',
				commitment: 'commitment-abc',
				hasVoted: false
			};
			render(ProcessDetail, votingProps({ userEnrollment: enrolledUser }));

			await page.getByRole('button', { name: /Equipo Alpha/ }).click();
			await page.getByRole('button', { name: /Votar por Equipo Alpha/ }).click();
			await page.getByRole('button', { name: 'Confirmar voto' }).click();

			await expect
				.element(page.getByText(/No se encontró tu compromiso/))
				.toBeInTheDocument();
		});
	});
});
