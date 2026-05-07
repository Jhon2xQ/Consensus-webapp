import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Hero from './Hero.svelte';

describe('Hero.svelte', () => {
	it('renders the main heading', async () => {
		render(Hero);
		await expect.element(page.getByRole('heading', { level: 1 })).toBeInTheDocument();
	});

	it('contains the brand tagline', async () => {
		render(Hero);
		await expect.element(page.getByText('redefinida.')).toBeInTheDocument();
	});

	it('renders the CTA buttons', async () => {
		render(Hero);
		await expect.element(page.getByRole('button', { name: 'Iniciar Propuesta' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Leer Docs' })).toBeInTheDocument();
	});

	it('renders the hero image with alt text', async () => {
		render(Hero);
		await expect.element(page.getByAltText(/simboliza la toma de decisiones/)).toBeInTheDocument();
	});
});
