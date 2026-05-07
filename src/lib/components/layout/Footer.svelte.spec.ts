import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Footer from './Footer.svelte';

describe('Footer.svelte', () => {
	it('renders the brand name', async () => {
		render(Footer);
		await expect.element(page.getByText('Consensus', { exact: true })).toBeInTheDocument();
	});

	it('renders the product section', async () => {
		render(Footer);
		await expect.element(page.getByRole('heading', { level: 4, name: 'Producto' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Características' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Seguridad' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Documentación' })).toBeInTheDocument();
	});

	it('renders the company section', async () => {
		render(Footer);
		await expect.element(page.getByRole('heading', { level: 4, name: 'Empresa' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Sobre Nosotros' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Carreras' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Contacto' })).toBeInTheDocument();
	});

	it('renders the copyright notice', async () => {
		render(Footer);
		await expect.element(page.getByText(/2026 Plataforma Consensus/)).toBeInTheDocument();
	});

	it('renders social media icons with labels', async () => {
		render(Footer);
		await expect.element(page.getByLabelText('GitHub')).toBeInTheDocument();
		await expect.element(page.getByLabelText('LinkedIn')).toBeInTheDocument();
		await expect.element(page.getByLabelText('X')).toBeInTheDocument();
	});
});
