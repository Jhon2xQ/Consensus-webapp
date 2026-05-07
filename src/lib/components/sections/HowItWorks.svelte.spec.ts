import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import HowItWorks from './HowItWorks.svelte';

describe('HowItWorks.svelte', () => {
	it('renders section heading', async () => {
		render(HowItWorks);

		await expect.element(page.getByText('El Flujo de Consensus')).toBeInTheDocument();
	});

	it('renders all 4 steps in order', async () => {
		render(HowItWorks);

		await expect.element(page.getByRole('heading', { name: 'Firma del Voto' })).toBeInTheDocument();
		await expect.element(page.getByRole('heading', { name: 'Verificación de Identidad' })).toBeInTheDocument();
		await expect.element(page.getByRole('heading', { name: 'Persistencia On-Chain' })).toBeInTheDocument();
		await expect.element(page.getByRole('heading', { name: 'Escrutinio y Resultados' })).toBeInTheDocument();
	});

	it('renders step labels Paso 01 through Paso 04', async () => {
		render(HowItWorks);

		await expect.element(page.getByText('Paso 01')).toBeInTheDocument();
		await expect.element(page.getByText('Paso 02')).toBeInTheDocument();
		await expect.element(page.getByText('Paso 03')).toBeInTheDocument();
		await expect.element(page.getByText('Paso 04')).toBeInTheDocument();
	});

	it('renders subtitle description', async () => {
		render(HowItWorks);

		await expect.element(
			page.getByText(/Un desglose intuitivo paso a paso/)
		).toBeInTheDocument();
	});
});
