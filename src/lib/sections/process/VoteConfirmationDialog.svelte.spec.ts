import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import VoteConfirmationDialog from './VoteConfirmationDialog.svelte';

function defaultProps(overrides?: Record<string, unknown>) {
	return {
		open: true,
		teamName: 'Equipo Alpha',
		onConfirm: vi.fn(),
		onClose: vi.fn(),
		...overrides
	};
}

describe('VoteConfirmationDialog', () => {
	it('renders the confirmation title', async () => {
		render(VoteConfirmationDialog, defaultProps());
		await expect
			.element(page.getByRole('heading', { name: 'Confirmar voto' }))
			.toBeInTheDocument();
	});

	it('includes the team name in the confirmation copy', async () => {
		render(VoteConfirmationDialog, defaultProps({ teamName: 'Equipo Beta' }));
		await expect
			.element(page.getByText(/Confirmás tu voto por/))
			.toBeInTheDocument();
		// The team name appears in bold
		await expect
			.element(page.getByText('Equipo Beta', { exact: true }))
			.toBeInTheDocument();
	});

	it('mentions that the action is irreversible', async () => {
		render(VoteConfirmationDialog, defaultProps());
		await expect.element(page.getByText(/irreversible/)).toBeInTheDocument();
	});

	it('renders a Cancelar button', async () => {
		render(VoteConfirmationDialog, defaultProps());
		await expect
			.element(page.getByRole('button', { name: 'Cancelar', exact: true }))
			.toBeInTheDocument();
	});

	it('renders a Confirmar voto button', async () => {
		render(VoteConfirmationDialog, defaultProps());
		await expect
			.element(page.getByRole('button', { name: 'Confirmar voto', exact: true }))
			.toBeInTheDocument();
	});

	it('clicking Confirmar voto invokes onConfirm', async () => {
		const onConfirm = vi.fn();
		render(VoteConfirmationDialog, defaultProps({ onConfirm }));
		await page.getByRole('button', { name: 'Confirmar voto', exact: true }).click();
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it('clicking Cancelar invokes onClose', async () => {
		const onClose = vi.fn();
		render(VoteConfirmationDialog, defaultProps({ onClose }));
		await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('falls back gracefully when teamName is null', async () => {
		// Should not throw; should still render the title and "irreversible" copy.
		render(VoteConfirmationDialog, defaultProps({ teamName: null }));
		await expect
			.element(page.getByRole('heading', { name: 'Confirmar voto' }))
			.toBeInTheDocument();
		await expect.element(page.getByText(/irreversible/)).toBeInTheDocument();
	});
});
