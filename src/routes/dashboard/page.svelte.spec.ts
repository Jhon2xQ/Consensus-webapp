import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DashboardPage from './+page.svelte';

vi.mock('$app/state', () => ({
	page: { url: new URL('http://localhost/dashboard') }
}));

describe('Dashboard +page.svelte', () => {
	it('renders dashboard heading', async () => {
		render(DashboardPage);

		await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Dashboard');
	});

	it('renders stat cards', async () => {
		render(DashboardPage);

		await expect.element(page.getByText('Total Procesos')).toBeInTheDocument();
		await expect.element(page.getByText('Total Equipos')).toBeInTheDocument();
		await expect.element(page.getByText('Total Inscripciones')).toBeInTheDocument();
	});

	it('shows process names', async () => {
		render(DashboardPage);

		await expect.element(page.getByText('Elecciones Nacionales 2026')).toBeInTheDocument();
	});
});
