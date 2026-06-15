import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TrustedBy from './TrustedBy.svelte';

describe('TrustedBy.svelte', () => {
	it('renders the mono section label', async () => {
		render(TrustedBy);
		// The label is preserved across the redesign (was text-brand-gray-800
		// uppercase tracking-widest; now font-mono text-[11px] uppercase from
		// the HTML, with the same text content).
		await expect
			.element(page.getByText('Respaldado por Líderes de la Industria'))
			.toBeInTheDocument();
	});

	it('renders all 4 placeholder logos as text', async () => {
		render(TrustedBy);
		await expect.element(page.getByText('VENTURE_A')).toBeInTheDocument();
		await expect.element(page.getByText('CAPITAL_B')).toBeInTheDocument();
		await expect.element(page.getByText('FUND_C')).toBeInTheDocument();
		await expect.element(page.getByText('PARTNERS_D')).toBeInTheDocument();
	});

	it('renders each logo inside a <span> element (placeholder text, not an <img>)', async () => {
		render(TrustedBy);
		// Per HTML design, placeholder logos are inline text spans (was <div> before).
		// This is a structural contract — <span> for text placeholders, <img> only for real logos.
		const ventureLogo = page.getByText('VENTURE_A');
		const tagName = ventureLogo.element().tagName.toLowerCase();
		expect(tagName).toBe('span');
	});
});
