import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Layout from './+layout.svelte';

describe('+layout.svelte', () => {
	it('renders header and footer', async () => {
		render(Layout);
		await expect.element(page.getByRole('banner')).toBeInTheDocument();
		await expect.element(page.getByRole('contentinfo')).toBeInTheDocument();
	});

	it('renders the Consensus brand in header', async () => {
		render(Layout);
		await expect.element(page.getByRole('banner').getByRole('link', { name: 'Consensus' })).toBeInTheDocument();
	});
});
