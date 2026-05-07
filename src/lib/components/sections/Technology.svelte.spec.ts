import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Technology from './Technology.svelte';

describe('Technology.svelte', () => {
	it('renders the dark section heading', async () => {
		render(Technology);

		await expect.element(
			page.getByText(/Impulsado por matemáticas/)
		).toBeInTheDocument();
	});

	it('renders ZK feature card with title and icon', async () => {
		render(Technology);

		await expect.element(page.getByText(/Arquitectura de Conocimiento Cero/)).toBeInTheDocument();
		await expect.element(page.getByText(/^ZK$/)).toBeInTheDocument();
	});

	it('renders Blockchain feature card with title and icon', async () => {
		render(Technology);

		await expect.element(page.getByText(/Libro Mayor Inmutable/)).toBeInTheDocument();
		await expect.element(page.getByText(/^BC$/)).toBeInTheDocument();
	});

	it('renders the technology image', async () => {
		render(Technology);

		const img = page.getByRole('img');
		await expect.element(img).toBeInTheDocument();
	});
});
