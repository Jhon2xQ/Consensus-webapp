import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Header from './Header.svelte';

describe('Header.svelte', () => {
	it('renders the logo with "Consensus" text', async () => {
		render(Header);

		await expect.element(page.getByText('Consensus')).toBeInTheDocument();
	});

	it('renders navigation links', async () => {
		render(Header);

		await expect.element(page.getByText('Cómo Funciona')).toBeInTheDocument();
		await expect.element(page.getByText('Tecnología')).toBeInTheDocument();
	});

	it('renders the "Iniciar Sesión" CTA link', async () => {
		render(Header);

		const cta = page.getByText('Iniciar Sesión');
		await expect.element(cta).toBeInTheDocument();
	});

	it('renders the logo icon "C" square with exact match', async () => {
		render(Header);

		await expect.element(page.getByText(/^C$/)).toBeInTheDocument();
	});
});
