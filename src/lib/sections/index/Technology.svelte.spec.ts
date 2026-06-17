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

	it('renders the technology.png <img> with the ZK and blockchain alt text', async () => {
		render(Technology);
		const img = page.getByRole('img', {
			name: 'Representacion de tecnologia ZK y blockchain'
		});
		await expect.element(img).toBeInTheDocument();
	});

	it('does NOT render the equation text inside the SVG (cleaned-up design)', async () => {
		render(Technology);
		// The old SVG included the equation H(identity) ∈ merkle_tree(group_root).
		// The cleanup removed the equation and the "ZERO-KNOWLEDGE CIRCUIT" label
		// to keep the illustration minimal and design-system compliant.
		await expect
			.element(page.getByText('H(identity) ∈ merkle_tree(group_root)'))
			.not.toBeInTheDocument();
	});

	it('does NOT render the "ZERO-KNOWLEDGE CIRCUIT" label inside the SVG (cleaned-up design)', async () => {
		render(Technology);
		await expect.element(page.getByText('ZERO-KNOWLEDGE CIRCUIT')).not.toBeInTheDocument();
	});
});
