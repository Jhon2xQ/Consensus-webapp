import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Sidebar from './Sidebar.svelte';

const mockPage = vi.hoisted(() => ({
	url: new URL('http://localhost/dashboard')
}));

vi.mock('$app/state', () => ({
	page: mockPage
}));

describe('Sidebar.svelte', () => {
	it('renders navigation links', async () => {
		render(Sidebar);

		await expect.element(page.getByText('Dashboard')).toBeInTheDocument();
		await expect.element(page.getByText('Procesos')).toBeInTheDocument();
	});

	it('renders logo when not collapsed', async () => {
		render(Sidebar);

		await expect.element(page.getByText('Consensus')).toBeInTheDocument();
	});

	it('hides logo when collapsed', async () => {
		render(Sidebar, { props: { collapsed: true } });

		await expect.element(page.getByText('Consensus')).not.toBeInTheDocument();
	});

	it('shows user name when provided', async () => {
		render(Sidebar, {
			props: { user: { name: 'Juan Pérez', username: 'jperez', picture: null } }
		});

		await expect.element(page.getByText('Juan Pérez')).toBeInTheDocument();
	});

	it('shows logout button', async () => {
		render(Sidebar);

		await expect.element(page.getByText('Cerrar Sesión')).toBeInTheDocument();
	});

	it('hides labels when collapsed', async () => {
		render(Sidebar, { props: { collapsed: true } });

		await expect.element(page.getByText('Procesos')).not.toBeInTheDocument();
	});

	it('has a toggle button with correct aria-label', async () => {
		render(Sidebar);

		const toggleButton = page.getByRole('button', { name: 'Colapsar sidebar' });
		await expect.element(toggleButton).toBeInTheDocument();
	});
});
