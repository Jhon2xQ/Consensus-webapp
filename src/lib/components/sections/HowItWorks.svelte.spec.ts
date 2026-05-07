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

		await expect.element(page.getByRole('heading', { name: 'Propuesta' })).toBeInTheDocument();
		await expect.element(page.getByRole('heading', { name: 'Discusión' })).toBeInTheDocument();
		await expect.element(page.getByRole('heading', { name: 'Votación' })).toBeInTheDocument();
		await expect.element(page.getByRole('heading', { name: 'Escrutinio' })).toBeInTheDocument();
	});

	it('renders step numbers 1 through 4', async () => {
		render(HowItWorks);

		await expect.element(page.getByText(/^1$/)).toBeInTheDocument();
		await expect.element(page.getByText(/^2$/)).toBeInTheDocument();
		await expect.element(page.getByText(/^3$/)).toBeInTheDocument();
		await expect.element(page.getByText(/^4$/)).toBeInTheDocument();
	});

	it('renders subtitle description', async () => {
		render(HowItWorks);

		await expect.element(
			page.getByText(/Un desglose intuitivo paso a paso/)
		).toBeInTheDocument();
	});
});
