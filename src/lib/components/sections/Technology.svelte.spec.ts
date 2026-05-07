import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Technology from './Technology.svelte';

describe('Technology.svelte', () => {
	it('renders the section heading', async () => {
		render(Technology);
		await expect.element(page.getByRole('heading', { level: 2, name: /Impulsado por matemáticas/ })).toBeInTheDocument();
	});

	it('renders the ZK badge and description', async () => {
		render(Technology);
		await expect.element(page.getByText('ZK')).toBeInTheDocument();
		await expect.element(page.getByRole('heading', { level: 3, name: 'Arquitectura de Conocimiento Cero' })).toBeInTheDocument();
	});

	it('renders the BC badge and description', async () => {
		render(Technology);
		await expect.element(page.getByText('BC')).toBeInTheDocument();
		await expect.element(page.getByRole('heading', { level: 3, name: 'Libro Mayor Inmutable' })).toBeInTheDocument();
	});

	it('renders the technology image', async () => {
		render(Technology);
		await expect.element(page.getByAltText(/criptográfica y matemática/)).toBeInTheDocument();
	});
});
