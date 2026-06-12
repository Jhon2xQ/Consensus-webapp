import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DashboardHeader from './DashboardHeader.svelte';

const mockPage = vi.hoisted(() => ({
	url: new URL('http://localhost/dashboard'),
	data: { user: { name: 'Alice', email: 'a@x', picture: null, roles: ['consensus-creator'] } }
}));

vi.mock('$app/state', () => ({ page: mockPage }));

describe('DashboardHeader.svelte', () => {
	it('renders all 5 nav links on desktop', async () => {
		render(DashboardHeader);
		await expect.element(page.getByRole('link', { name: /Dashboard/ })).toBeInTheDocument();
		await expect.element(page.getByRole('link', { name: /Procesos/ })).toBeInTheDocument();
		await expect.element(page.getByRole('link', { name: /Equipos/ })).toBeInTheDocument();
		await expect.element(page.getByRole('link', { name: /Votantes/ })).toBeInTheDocument();
		await expect.element(page.getByRole('link', { name: /Sufragios/ })).toBeInTheDocument();
	});

	it('marks Dashboard as active on /dashboard', async () => {
		render(DashboardHeader);
		const link = page.getByRole('link', { name: /Dashboard/ });
		await expect.element(link).toHaveAttribute('aria-current', 'page');
	});

	it('marks Procesos as active on child route /dashboard/procesos/123', async () => {
		mockPage.url = new URL('http://localhost/dashboard/procesos/123');
		render(DashboardHeader);
		const link = page.getByRole('link', { name: /Procesos/ });
		await expect.element(link).toHaveAttribute('aria-current', 'page');
		mockPage.url = new URL('http://localhost/dashboard'); // reset
	});

	it('does not falsely activate Procesos on /dashboard/procesos-archive', async () => {
		mockPage.url = new URL('http://localhost/dashboard/procesos-archive');
		render(DashboardHeader);
		const links = page.getByRole('link', { name: /Procesos/ });
		await expect.element(links).not.toHaveAttribute('aria-current', 'page');
		mockPage.url = new URL('http://localhost/dashboard'); // reset
	});

	it('shows hamburger on default viewport and opens mobile nav menu', async () => {
		render(DashboardHeader);
		const trigger = page.getByRole('button', { name: 'Abrir menú de navegación' });
		await expect.element(trigger).toBeInTheDocument();
		await trigger.click();
		await expect.element(page.getByRole('menuitem', { name: /Dashboard/ })).toBeInTheDocument();
	});

	it('shows Home button for consensus-creator on md+', async () => {
		render(DashboardHeader);
		await expect.element(page.getByText('Home')).toBeInTheDocument();
	});

	it('hides Home button for non-creator role', async () => {
		mockPage.data.user.roles = ['voter'];
		render(DashboardHeader);
		await expect.element(page.getByText('Home')).not.toBeInTheDocument();
		mockPage.data.user.roles = ['consensus-creator']; // reset
	});

	it('shows user info in user dropdown', async () => {
		render(DashboardHeader);
		const userMenuTrigger = page.getByRole('button', { name: 'Menú de usuario' });
		await expect.element(userMenuTrigger).toBeInTheDocument();
		await userMenuTrigger.click();
		await expect.element(page.getByRole('menuitem', { name: /cerrar sesi[óo]n/i })).toBeInTheDocument();
	});
});
