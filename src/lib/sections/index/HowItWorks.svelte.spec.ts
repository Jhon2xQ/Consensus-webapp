import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import HowItWorks from './HowItWorks.svelte';

describe('HowItWorks.svelte', () => {
	it('renders the section heading "El Flujo de Consensus"', async () => {
		render(HowItWorks);
		await expect
			.element(page.getByRole('heading', { level: 2, name: 'El Flujo de Consensus' }))
			.toBeInTheDocument();
	});

	it('renders the "Proceso" mono section label', async () => {
		render(HowItWorks);
		await expect.element(page.getByText('Proceso')).toBeInTheDocument();
	});

	it('renders the subtitle paragraph', async () => {
		render(HowItWorks);
		await expect
			.element(page.getByText(/Un desglose intuitivo paso a paso/))
			.toBeInTheDocument();
	});

	it('renders the 4 "Paso XX" step labels (project style, NOT bare "01")', async () => {
		render(HowItWorks);
		// Product decision (sdd/landing-redesign/product-assumptions): the step
		// labels keep the project wording "Paso 01..04" instead of the bare
		// "01..04" used in consensus-landing.html.
		await expect.element(page.getByText('Paso 01')).toBeInTheDocument();
		await expect.element(page.getByText('Paso 02')).toBeInTheDocument();
		await expect.element(page.getByText('Paso 03')).toBeInTheDocument();
		await expect.element(page.getByText('Paso 04')).toBeInTheDocument();
		// The HTML variant ("01", "02" as standalone) must NOT appear.
		await expect.element(page.getByText('01', { exact: true })).not.toBeInTheDocument();
		await expect.element(page.getByText('02', { exact: true })).not.toBeInTheDocument();
	});

	it('renders the 4 step titles as <h3> headings', async () => {
		render(HowItWorks);
		await expect
			.element(page.getByRole('heading', { level: 3, name: 'Firma del Voto' }))
			.toBeInTheDocument();
		await expect
			.element(
				page.getByRole('heading', { level: 3, name: 'Verificación de Identidad' })
			)
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('heading', { level: 3, name: 'Persistencia On-Chain' }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('heading', { level: 3, name: 'Escrutinio y Resultados' }))
			.toBeInTheDocument();
	});

	it('renders each step inside an <article> element (HTML card pattern, not shadcn Card)', async () => {
		render(HowItWorks);
		const articles = page.getByRole('article');
		// Should render exactly 4 step articles.
		await expect.element(articles.first()).toBeInTheDocument();
		await expect.element(articles.nth(3)).toBeInTheDocument();
		// And we must have 4 of them total — assert the count via a 5th index that must NOT exist.
		await expect.element(articles.nth(4)).not.toBeInTheDocument();
	});

	it('renders the 4 step descriptions (one per card)', async () => {
		render(HowItWorks);
		// Each description text is a unique substring that can only be matched by the
		// production code rendering the corresponding card body.
		await expect
			.element(page.getByText(/Generación de pruebas de pertenencia/))
			.toBeInTheDocument();
		await expect
			.element(page.getByText(/Validación criptográfica sin revelar identidad/))
			.toBeInTheDocument();
		await expect
			.element(page.getByText(/Registro inmutable en blockchain/))
			.toBeInTheDocument();
		await expect
			.element(page.getByText(/Conteo automatizado con resultados verificables/))
			.toBeInTheDocument();
	});
});
