import { page } from 'vitest/browser';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CommitmentActionZone from './CommitmentActionZone.svelte';
import type { ElectoralProcess } from '$lib/types/electoral-process';
import type { Enrollment } from '$lib/types/enrollment';

// ── Hoisted mocks (must be defined before vi.mock calls) ────────────────
const mockVerifyPasskey = vi.hoisted(() => vi.fn());
const mockDeriveIdentity = vi.hoisted(() => vi.fn());

vi.mock('$lib/services/passkey.service', () => ({
	verifyPasskey: mockVerifyPasskey
}));

vi.mock('$lib/services/semaphore.service', () => ({
	deriveIdentity: mockDeriveIdentity
}));

// ── Fixtures ────────────────────────────────────────────────────────────

const mockProcess: ElectoralProcess = {
	id: 'proc-1',
	name: 'Elecciones 2026',
	scope: 'Nacional',
	description: 'Proceso electoral',
	groupId: 'group-1',
	estatus: 'COMMITMENT',
	commitmentStart: '2026-03-01T00:00:00Z',
	commitmentEnd: '2026-04-30T00:00:00Z',
	votingStart: '2026-06-15T00:00:00Z',
	votingEnd: '2026-06-20T00:00:00Z',
	results: '2026-06-25T00:00:00Z',
	createdBy: 'user-1'
};

const enrolledUser: Enrollment = {
	id: 'enr-1',
	electoralProcessId: 'proc-1',
	email: 'test@example.com',
	userId: 'user-abc-123',
	commitment: 'commitment-hash-abc',
	hasVoted: false
};

function defaultProps(overrides?: Record<string, unknown>) {
	return {
		process: mockProcess,
		userSub: 'user-abc-123',
		userEnrollment: null,
		...overrides
	};
}

describe('CommitmentActionZone', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('button state', () => {
		it('shows "Compromiso enviado" disabled button when userEnrollment.commitment is set', async () => {
			render(CommitmentActionZone, defaultProps({ userEnrollment: enrolledUser }));
			const btn = page.getByRole('button', { name: 'Compromiso enviado' });
			await expect.element(btn).toBeInTheDocument();
			await expect.element(btn).toBeDisabled();
		});

		it('shows "Enviar compromiso" enabled button when userEnrollment.commitment is null', async () => {
			render(CommitmentActionZone, defaultProps({ userEnrollment: null }));
			const btn = page.getByRole('button', { name: 'Enviar compromiso' });
			await expect.element(btn).toBeInTheDocument();
			await expect.element(btn).toBeEnabled();
		});

		it('shows "Enviar compromiso" enabled button when userEnrollment exists but commitment is null', async () => {
			const enrollmentWithoutCommitment: Enrollment = {
				...enrolledUser,
				commitment: null
			};
			render(
				CommitmentActionZone,
				defaultProps({ userEnrollment: enrollmentWithoutCommitment })
			);
			const btn = page.getByRole('button', { name: 'Enviar compromiso' });
			await expect.element(btn).toBeInTheDocument();
			await expect.element(btn).toBeEnabled();
		});

		it('does not show "Compromiso enviado" button when not committed', async () => {
			render(CommitmentActionZone, defaultProps({ userEnrollment: null }));
			await expect
				.element(page.getByRole('button', { name: 'Compromiso enviado' }))
				.not.toBeInTheDocument();
		});
	});

	describe('no-userSub error path', () => {
		it('shows "Debés estar autenticado..." error when no userSub and button clicked', async () => {
			render(CommitmentActionZone, defaultProps({ userSub: null }));

			// No error visible before click
			await expect
				.element(page.getByText('Debés estar autenticado'))
				.not.toBeInTheDocument();

			await page.getByRole('button', { name: 'Enviar compromiso' }).click();

			await expect
				.element(page.getByText('Debés estar autenticado para enviar un compromiso'))
				.toBeInTheDocument();
		});

		it('does not call verifyPasskey when userSub is null', async () => {
			render(CommitmentActionZone, defaultProps({ userSub: null }));
			await page.getByRole('button', { name: 'Enviar compromiso' }).click();
			expect(mockVerifyPasskey).not.toHaveBeenCalled();
			expect(mockDeriveIdentity).not.toHaveBeenCalled();
		});
	});

	describe('hidden form', () => {
		it('renders the hidden form with the update-commitment action', async () => {
			const { container } = render(CommitmentActionZone, defaultProps());
			const form = container.querySelector('form[action="?/update-commitment"]');
			expect(form).not.toBeNull();
			expect(form?.getAttribute('method')?.toLowerCase()).toBe('post');
		});

		it('renders the hidden commitment input', async () => {
			const { container } = render(CommitmentActionZone, defaultProps());
			const input = container.querySelector('input[name="commitment"]');
			expect(input).not.toBeNull();
			expect(input?.getAttribute('type')).toBe('hidden');
		});
	});

	describe('initial state — no hints visible', () => {
		it('does not show the QR scan hint before submission', async () => {
			render(CommitmentActionZone, defaultProps());
			await expect
				.element(page.getByText('Escaneá el QR que aparece en pantalla con tu móvil'))
				.not.toBeInTheDocument();
		});

		it('does not show any error message before submission', async () => {
			render(CommitmentActionZone, defaultProps());
			await expect
				.element(page.getByText('Debés estar autenticado'))
				.not.toBeInTheDocument();
		});
	});
});
