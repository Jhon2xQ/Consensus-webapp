import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TrustedBy from './TrustedBy.svelte';

describe('TrustedBy.svelte', () => {
	it('renders the mono section label', async () => {
		render(TrustedBy);
		await expect
			.element(page.getByText('En colaboración con'))
			.toBeInTheDocument();
	});

	it('renders the UNSAAC partner logo with correct alt text', async () => {
		render(TrustedBy);
		await expect
			.element(page.getByRole('img', { name: 'Escuela de Posgrado UNSAAC' }))
			.toBeInTheDocument();
	});

	it('renders the Centro Federado partner logo with correct alt text', async () => {
		render(TrustedBy);
		await expect
			.element(
				page.getByRole('img', {
					name: 'Centro Federado de Ingenieria Informatica y de Sistemas'
				})
			)
			.toBeInTheDocument();
	});
});
