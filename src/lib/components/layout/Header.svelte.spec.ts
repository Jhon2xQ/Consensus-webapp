import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Header from './Header.svelte';

describe('Header.svelte', () => {
	it('renders the brand name', async () => {
		render(Header);
		await expect.element(page.getByText('Consensus', { exact: true })).toBeInTheDocument();
	});

	it('renders navigation links', async () => {
		render(Header);
		await expect.element(page.getByRole('link', { name: 'Cómo Funciona' })).toBeInTheDocument();
		await expect.element(page.getByRole('link', { name: 'Tecnología' })).toBeInTheDocument();
	});

	it('renders the login button', async () => {
		render(Header);
		await expect.element(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument();
	});

	it('has a navigation landmark', async () => {
		render(Header);
		await expect.element(page.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument();
	});

	it('has a link to home', async () => {
		render(Header);
		const homeLink = page.getByRole('link', { name: 'Consensus' });
		await expect.element(homeLink).toHaveAttribute('href', '/');
	});

	it('renders the Procesos navigation link', async () => {
		render(Header);
		const procesosLink = page.getByRole('link', { name: 'Procesos' });
		await expect.element(procesosLink).toBeInTheDocument();
		await expect.element(procesosLink).toHaveAttribute('href', '/procesos');
	});
});
