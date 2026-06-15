import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Footer from './Footer.svelte';

describe('Footer.svelte', () => {
	// =========================================================================
	// Brand column (FR-F-1, FR-F-2)
	// =========================================================================

	it('renders the brand name as a link to home', async () => {
		render(Footer);
		const homeLink = page.getByRole('link', { name: 'Consensus' });
		await expect.element(homeLink).toBeInTheDocument();
		await expect.element(homeLink).toHaveAttribute('href', '/');
	});

	it('renders the brand tagline describing the platform', async () => {
		render(Footer);
		await expect
			.element(
				page.getByText(
					'Construyendo la infraestructura para la toma de decisiones verificable, privada y descentralizada.'
				)
			)
			.toBeInTheDocument();
	});

	// =========================================================================
	// Producto column — raw <a> links (FR-F-3)
	// =========================================================================

	it('renders the Producto section with three anchor links', async () => {
		render(Footer);
		await expect
			.element(page.getByRole('heading', { level: 4, name: 'Producto' }))
			.toBeInTheDocument();
		const links = page.getByRole('link', { name: /^(Características|Seguridad|Documentación)$/ });
		await expect.element(links).toHaveLength(3);
		// Placeholder href per the orchestrator brief: no real URLs in v1.
		for (const name of ['Características', 'Seguridad', 'Documentación']) {
			const link = page.getByRole('link', { name });
			await expect.element(link).toHaveAttribute('href', '#');
		}
	});

	// =========================================================================
	// Empresa column — raw <a> links (FR-F-4)
	// =========================================================================

	it('renders the Empresa section with three anchor links', async () => {
		render(Footer);
		await expect
			.element(page.getByRole('heading', { level: 4, name: 'Empresa' }))
			.toBeInTheDocument();
		const links = page.getByRole('link', { name: /^(Sobre Nosotros|Carreras|Contacto)$/ });
		await expect.element(links).toHaveLength(3);
		for (const name of ['Sobre Nosotros', 'Carreras', 'Contacto']) {
			const link = page.getByRole('link', { name });
			await expect.element(link).toHaveAttribute('href', '#');
		}
	});

	// =========================================================================
	// Legal column MUST NOT be rendered (FR-F-5)
	// =========================================================================

	it('does NOT render a Legal column heading', async () => {
		render(Footer);
		await expect
			.element(page.getByRole('heading', { level: 4, name: 'Legal' }))
			.not.toBeInTheDocument();
	});

	it('does NOT render Privacidad or Términos links', async () => {
		render(Footer);
		await expect.element(page.getByRole('link', { name: 'Privacidad' })).not.toBeInTheDocument();
		await expect.element(page.getByRole('link', { name: 'Términos' })).not.toBeInTheDocument();
	});

	// =========================================================================
	// Copyright + social anchors (FR-F-6)
	// =========================================================================

	it('renders the copyright notice', async () => {
		render(Footer);
		await expect.element(page.getByText(/2026 Plataforma Consensus/)).toBeInTheDocument();
	});

	it('renders social anchors with aria-labels and placeholder href', async () => {
		render(Footer);
		for (const label of ['GitHub', 'LinkedIn', 'X']) {
			const anchor = page.getByRole('link', { name: label });
			await expect.element(anchor).toBeInTheDocument();
			// No real social profile URLs in v1 — all social anchors are placeholders.
			await expect.element(anchor).toHaveAttribute('href', '#');
		}
	});

	// =========================================================================
	// Grid contract: 4-column on md+, brand column wider than the rest (FR-F-1)
	// =========================================================================

	it('lays the columns on a 4-column grid on md+ viewports', async () => {
		render(Footer);
		// The grid is the parent of the brand <a>. The first <a> is inside the
		// brand column div, so we go up two parents (column div -> grid div).
		const brand = page.getByRole('link', { name: 'Consensus' });
		const grid = brand.element().parentElement?.parentElement;
		expect(grid).toBeTruthy();
		// The 4-column layout is encoded as 4 child <div>s in the grid:
		// [brand, Producto, Empresa, empty 4th (Legal removed)].
		expect(grid!.children.length).toBe(4);
		// The empty 4th column carries aria-hidden so it has no semantic role.
		const lastChild = grid!.children[3] as HTMLElement;
		expect(lastChild.getAttribute('aria-hidden')).toBe('true');
	});
});
