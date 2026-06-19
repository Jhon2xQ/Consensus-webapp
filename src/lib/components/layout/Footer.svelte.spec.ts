import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Footer from './Footer.svelte';

describe('Footer.svelte', () => {
	it('renders the brand name as a link to home', async () => {
		render(Footer);
		const homeLink = page.getByRole('link', { name: 'Consensus' });
		await expect.element(homeLink).toBeInTheDocument();
		await expect.element(homeLink).toHaveAttribute('href', '/');
	});

	it('renders the live navigation links', async () => {
		render(Footer);
		const procesos = page.getByRole('link', { name: 'Procesos' });
		const docs = page.getByRole('link', { name: 'Documentación' });
		await expect.element(procesos).toBeInTheDocument();
		await expect.element(procesos).toHaveAttribute('href', '/procesos');
		await expect.element(docs).toBeInTheDocument();
		await expect.element(docs).toHaveAttribute('href', '/docs');
	});

	it('renders the copyright notice', async () => {
		render(Footer);
		await expect.element(page.getByText(/2026 Plataforma Consensus/)).toBeInTheDocument();
	});

	it('renders social anchors with aria-labels and placeholder href', async () => {
		render(Footer);
		for (const label of ['GitHub', 'LinkedIn', 'Email']) {
			const anchor = page.getByRole('link', { name: label });
			await expect.element(anchor).toBeInTheDocument();
			await expect.element(anchor).toHaveAttribute('href', '#');
		}
	});
});
