import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Header from './Header.svelte';

const mockPage = vi.hoisted(() => ({
	data: { user: null as Record<string, unknown> | null },
}));

vi.mock('$app/state', () => ({
	page: mockPage,
}));

describe('Header.svelte', () => {
	it('renders the brand name', async () => {
		render(Header);
		await expect.element(page.getByText('Consensus', { exact: true })).toBeInTheDocument();
	});

	it('renders the Procesos navigation link', async () => {
		render(Header);
		const procesosLink = page.getByRole('link', { name: 'Procesos' });
		await expect.element(procesosLink).toBeInTheDocument();
		await expect.element(procesosLink).toHaveAttribute('href', '/procesos');
	});

	it('has a navigation landmark', async () => {
		render(Header);
		await expect
			.element(page.getByRole('navigation', { name: 'Navegación principal' }))
			.toBeInTheDocument();
	});

	it('has a link to home', async () => {
		render(Header);
		const homeLink = page.getByRole('link', { name: 'Consensus' });
		await expect.element(homeLink).toHaveAttribute('href', '/');
	});

	describe('unauthenticated state', () => {
		beforeEach(() => {
			mockPage.data.user = null;
		});

		it('renders the login button inside a signIn form', async () => {
			render(Header);
			const form = page.getByRole('form', { name: 'Iniciar sesión' });
			await expect.element(form).toBeInTheDocument();
			await expect.element(form).toHaveAttribute('method', 'POST');
			await expect.element(form).toHaveAttribute('action', '/?/signIn');
			await expect.element(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument();
		});
	});

	describe('authenticated state', () => {
		beforeEach(() => {
			mockPage.data.user = {
				sub: 'test-user-123',
				name: 'María García',
				username: 'maria_g',
				picture: 'https://example.com/avatar.jpg',
			};
		});

		it('renders the user name', async () => {
			render(Header);
			await expect.element(page.getByText('María García')).toBeInTheDocument();
		});

		it('renders the logout button inside a signOut form', async () => {
			render(Header);
			const form = page.getByRole('form', { name: 'Cerrar sesión' });
			await expect.element(form).toBeInTheDocument();
			await expect.element(form).toHaveAttribute('method', 'POST');
			await expect.element(form).toHaveAttribute('action', '/?/signOut');
			await expect
				.element(page.getByRole('button', { name: 'Cerrar Sesión' }))
				.toBeInTheDocument();
		});

		it('renders the user avatar when picture is available', async () => {
			render(Header);
			const img = page.getByRole('img', { name: 'Avatar de María García' });
			await expect.element(img).toBeInTheDocument();
			await expect.element(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
		});

		it('falls back to username when name is not provided and picture is absent', async () => {
			mockPage.data.user = {
				sub: 'user-no-name',
				username: 'anon_user',
			};
			render(Header);
			await expect.element(page.getByText('anon_user')).toBeInTheDocument();
			await expect.element(page.getByRole('img')).not.toBeInTheDocument();
		});

		it('shows fallback text when neither name nor username is provided', async () => {
			mockPage.data.user = {
				sub: 'minimal-user',
			};
			render(Header);
			await expect.element(page.getByText('Usuario')).toBeInTheDocument();
			await expect.element(page.getByRole('img')).not.toBeInTheDocument();
		});
	});
});
