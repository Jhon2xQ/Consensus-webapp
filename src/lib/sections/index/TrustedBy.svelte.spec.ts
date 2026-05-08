import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TrustedBy from './TrustedBy.svelte';

describe('TrustedBy.svelte', () => {
	it('renders the section label', async () => {
		render(TrustedBy);
		await expect.element(page.getByText('Respaldado por Líderes de la Industria')).toBeInTheDocument();
	});

	it('renders all 4 logos', async () => {
		render(TrustedBy);
		await expect.element(page.getByText('VENTURE_A')).toBeInTheDocument();
		await expect.element(page.getByText('CAPITAL_B')).toBeInTheDocument();
		await expect.element(page.getByText('FUND_C')).toBeInTheDocument();
		await expect.element(page.getByText('PARTNERS_D')).toBeInTheDocument();
	});
});
