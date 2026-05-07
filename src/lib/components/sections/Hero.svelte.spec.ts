import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Hero from './Hero.svelte';

describe('Hero.svelte', () => {
	it('renders the badge with "Procesos Activos: 1,204"', async () => {
		render(Hero);

		await expect.element(page.getByText('Procesos Activos: 1,204')).toBeInTheDocument();
	});

	it('renders the heading with "redefinida." highlighted', async () => {
		render(Hero);

		await expect.element(page.getByText(/Votación descentralizada/)).toBeInTheDocument();
		await expect.element(page.getByText('redefinida.')).toBeInTheDocument();
	});

	it('renders the subtitle paragraph', async () => {
		render(Hero);

		await expect.element(
			page.getByText(/Gobernanza segura, transparente y verificable/)
		).toBeInTheDocument();
	});

	it('renders the primary CTA "Iniciar Propuesta"', async () => {
		render(Hero);

		await expect.element(page.getByText('Iniciar Propuesta')).toBeInTheDocument();
	});

	it('renders the secondary CTA "Leer Docs"', async () => {
		render(Hero);

		await expect.element(page.getByText('Leer Docs')).toBeInTheDocument();
	});

	it('renders the hero image with alt text', async () => {
		render(Hero);

		const img = page.getByRole('img');
		await expect.element(img).toBeInTheDocument();
	});
});
