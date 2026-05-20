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
	it('renders all 5 navigation links', async () => {
		render(Sidebar);

		await expect.element(page.getByText('Dashboard')).toBeInTheDocument();
		await expect.element(page.getByText('Procesos')).toBeInTheDocument();
		await expect.element(page.getByText('Equipos')).toBeInTheDocument();
		await expect.element(page.getByText('Compromisos')).toBeInTheDocument();
		await expect.element(page.getByText('Sufragios')).toBeInTheDocument();
	});

	it('highlights active link based on current path', async () => {
		render(Sidebar);

		// Dashboard link should have aria-current="page" since mock page is /dashboard
		const activeLink = page.getByRole('link', { name: 'Dashboard' });
		await expect.element(activeLink).toHaveAttribute('aria-current', 'page');
	});

	it('renders the Consensus logo with link to /dashboard', async () => {
		render(Sidebar);

		await expect.element(page.getByText('Consensus')).toBeInTheDocument();
	});

	it('renders collapse button with ChevronLeft when expanded', async () => {
		render(Sidebar);

		const collapseBtn = page.getByRole('button', { name: 'Colapsar sidebar' });
		await expect.element(collapseBtn).toBeInTheDocument();
	});
});
