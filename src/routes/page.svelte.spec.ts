import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('+page.svelte', () => {
	it('renders the Hero section', async () => {
		render(Page);

		await expect.element(page.getByText(/redefinida\./)).toBeInTheDocument();
	});

	it('renders the HowItWorks section', async () => {
		render(Page);

		await expect.element(page.getByText('El Flujo de Consensus')).toBeInTheDocument();
	});

	it('renders the Technology section', async () => {
		render(Page);

		await expect.element(page.getByText(/Impulsado por matemáticas/)).toBeInTheDocument();
	});

	it('renders the TrustedBy section', async () => {
		render(Page);

		await expect.element(page.getByText(/^VENTURE_A$/)).toBeInTheDocument();
	});
});
