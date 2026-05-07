import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Layout from './+layout.svelte';

describe('+layout.svelte', () => {
	it('renders the Header with "Iniciar Sesión" CTA', async () => {
		render(Layout);

		await expect.element(page.getByText('Iniciar Sesión')).toBeInTheDocument();
	});

	it('renders the Footer with copyright text', async () => {
		render(Layout);

		await expect.element(
			page.getByText('© 2024 Plataforma Consensus. Todos los derechos reservados.')
		).toBeInTheDocument();
	});

	it('renders nav links from Header', async () => {
		render(Layout);

		await expect.element(page.getByText('Cómo Funciona')).toBeInTheDocument();
	});
});
