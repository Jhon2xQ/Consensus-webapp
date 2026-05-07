import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import HowItWorks from './HowItWorks.svelte';

describe('HowItWorks.svelte', () => {
	it('renders the section heading', async () => {
		render(HowItWorks);
		await expect.element(page.getByRole('heading', { level: 2, name: 'El Flujo de Consensus' })).toBeInTheDocument();
	});

	it('renders all 4 steps', async () => {
		render(HowItWorks);
		await expect.element(page.getByText('Paso 01')).toBeInTheDocument();
		await expect.element(page.getByText('Paso 02')).toBeInTheDocument();
		await expect.element(page.getByText('Paso 03')).toBeInTheDocument();
		await expect.element(page.getByText('Paso 04')).toBeInTheDocument();
	});

	it('renders step titles', async () => {
		render(HowItWorks);
		await expect.element(page.getByRole('heading', { level: 3, name: 'Firma del Voto' })).toBeInTheDocument();
		await expect.element(page.getByRole('heading', { level: 3, name: 'Verificación de Identidad' })).toBeInTheDocument();
		await expect.element(page.getByRole('heading', { level: 3, name: 'Persistencia On-Chain' })).toBeInTheDocument();
		await expect.element(page.getByRole('heading', { level: 3, name: 'Escrutinio y Resultados' })).toBeInTheDocument();
	});
});
