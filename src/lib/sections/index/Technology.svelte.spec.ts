import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Technology from './Technology.svelte';

describe('Technology.svelte', () => {
	it('renders the section heading "Impulsado por matemáticas, asegurado por Blockchain."', async () => {
		render(Technology);
		await expect
			.element(
				page.getByRole('heading', {
					level: 2,
					name: 'Impulsado por matemáticas, asegurado por Blockchain.'
				})
			)
			.toBeInTheDocument();
	});

	it('renders the "Tecnología" mono section label', async () => {
		render(Technology);
		await expect.element(page.getByText('Tecnología')).toBeInTheDocument();
	});

	it('renders the subtitle about knowledge zero and immutable ledger', async () => {
		render(Technology);
		await expect
			.element(
				page.getByText(/Arquitectura de conocimiento cero y libro mayor inmutable/)
			)
			.toBeInTheDocument();
	});

	it('renders the ZK badge with the "(Semaphore)" suffix in the full label', async () => {
		render(Technology);
		// Mono tag "ZK" — use exact match because the SVG also contains a "zk" label.
		await expect.element(page.getByText('ZK', { exact: true })).toBeInTheDocument();
		// Full new badge label per FR-T-2: includes the (Semaphore) protocol hint
		await expect
			.element(page.getByText('Arquitectura de Conocimiento Cero (Semaphore)'))
			.toBeInTheDocument();
	});

	it('renders the BC badge with the "(blockchain)" suffix in the full label', async () => {
		render(Technology);
		await expect.element(page.getByText('BC')).toBeInTheDocument();
		await expect
			.element(page.getByText('Libro Mayor Inmutable (blockchain)'))
			.toBeInTheDocument();
	});

	it('renders the extra explanatory Semaphore paragraph (max-width 420px)', async () => {
		render(Technology);
		// Per FR-T-3, the section MUST include an extra explanatory paragraph
		// below the badges explaining how Semaphore links private identity to a group.
		await expect
			.element(
				page.getByText(/Semaphore permite generar identidades privadas/)
			)
			.toBeInTheDocument();
	});

	it('renders an inline SVG with the zero-knowledge circuit aria-label and viewBox', async () => {
		render(Technology);
		const svg = page.getByRole('img', { name: 'Circuito criptográfico de conocimiento cero' });
		await expect.element(svg).toBeInTheDocument();
		// Per FR-T-4 the viewBox is 560x420 (matches the HTML wireframe).
		await expect.element(svg).toHaveAttribute('viewBox', '0 0 560 420');
	});

	it('renders the zero-knowledge equation text inside the SVG', async () => {
		render(Technology);
		// Per FR-T-4 the SVG includes the equation H(identity) ∈ merkle_tree(group_root).
		// This string only exists in production code if the SVG is rendered with the
		// full circuit diagram from the HTML.
		await expect
			.element(page.getByText('H(identity) ∈ merkle_tree(group_root)'))
			.toBeInTheDocument();
	});

	it('does NOT render an external <img> tag (replaced by inline SVG)', async () => {
		render(Technology);
		// No <img> with the old Google-URL alt text should exist.
		const imgs = page.getByAltText(/Representación artística de tecnología/);
		await expect.element(imgs).not.toBeInTheDocument();
	});
});
