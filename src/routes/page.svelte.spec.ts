import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('+page.svelte', () => {
	it('renders all four sections', async () => {
		render(Page);
		await expect.element(page.getByRole('heading', { level: 1 })).toBeInTheDocument();
		await expect.element(page.getByText('El Flujo de Consensus')).toBeInTheDocument();
		await expect.element(page.getByText(/Impulsado por matemáticas/)).toBeInTheDocument();
		await expect.element(page.getByText('Respaldado por Líderes de la Industria')).toBeInTheDocument();
	});

	it('renders within a main landmark', async () => {
		render(Page);
		await expect.element(page.getByRole('main')).toBeInTheDocument();
	});
});
