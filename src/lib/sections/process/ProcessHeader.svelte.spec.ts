import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProcessHeader from './ProcessHeader.svelte';

describe('ProcessHeader.svelte', () => {
	it('renders the process name in an h1 with the project heading style and no bottom margin', async () => {
		render(ProcessHeader, {
			name: 'Elección de autoridades 2026',
			status: 'OPEN',
			scope: 'org-xyz-2026',
			description: 'Proceso de prueba'
		});

		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toHaveTextContent('Elección de autoridades 2026');

		const headingEl = heading.element();
		expect(headingEl.tagName.toLowerCase()).toBe('h1');
		expect(headingEl.className).toMatch(/^text-4xl md:text-5xl font-bold tracking-tighter text-brand-black$/);
		expect(headingEl.className).not.toMatch(/\bmb-\d+\b/);
	});

	it('renders only the h1 and no badge, scope-pill, status-dot, or description', async () => {
		render(ProcessHeader, {
			name: 'Elección de autoridades 2026',
			status: 'COMMITMENT',
			scope: 'org-xyz-2026',
			description: 'Proceso de prueba'
		});

		// Exactly one h1 in the document.
		const h1s = page.getByRole('heading', { level: 1 });
		expect(h1s.elements().length).toBe(1);
		await expect.element(h1s).toHaveTextContent('Elección de autoridades 2026');

		// No status badge plumbing.
		expect(page.getByTestId('status-dot').elements().length).toBe(0);

		// No scope-pill plumbing.
		expect(page.getByTestId('scope-pill').elements().length).toBe(0);

		// No description <p>.
		const paragraphs = document.querySelectorAll('p');
		expect(paragraphs.length).toBe(0);

		// No copy-to-clipboard button.
		expect(
			page.getByRole('button', { name: 'Copiar alcance' }).elements().length
		).toBe(0);
	});
});