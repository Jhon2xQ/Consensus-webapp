import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Layout from './+layout.svelte';

// Mock page.data for DashboardHeader (needs page.url and page.data.user)
const mockPage = vi.hoisted(() => ({
	url: new URL('http://localhost/dashboard'),
	data: {}
}));

vi.mock('$app/state', () => ({
	page: mockPage
}));

describe('Dashboard +layout.svelte', () => {
	it('renders DashboardHeader and main content area', async () => {
		render(Layout);

		// DashboardHeader renders the Consensus brand wordmark
		await expect.element(page.getByText('Consensus')).toBeInTheDocument();

		// DashboardHeader renders the sign-in button (no user in mock data)
		await expect.element(page.getByText('Iniciar Sesión')).toBeInTheDocument();
	});

	it('renders main content area for child pages', async () => {
		render(Layout);

		// The main content area exists — it wraps the child content slot
		const main = page.getByRole('main');
		await expect.element(main).toBeInTheDocument();
	});
});
