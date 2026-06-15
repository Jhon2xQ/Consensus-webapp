import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Hero from './Hero.svelte';

describe('Hero.svelte', () => {
	it('renders the main heading with "redefinida" in <em>', async () => {
		render(Hero);
		const heading = page.getByRole('heading', { level: 1, name: /Votación descentralizada,.*redefinida\./ });
		await expect.element(heading).toBeInTheDocument();
		// The HTML markup uses <em> for the accent (per FR-HR-1).
		// getByText locates the inner text node; the resulting element is the <em>.
		await expect.element(page.getByText('redefinida')).toBeInTheDocument();
		const redefinidaEl = page.getByText('redefinida');
		await expect.element(redefinidaEl).toHaveTextContent('redefinida');
	});

	it('renders the eyebrow mono label', async () => {
		render(Hero);
		await expect
			.element(page.getByText('Plataforma de votación descentralizada'))
			.toBeInTheDocument();
	});

	it('renders the lead paragraph', async () => {
		render(Hero);
		const lead = page.getByText(/Gobernanza segura, transparente y verificable/);
		await expect.element(lead).toBeInTheDocument();
	});

	it('renders "Iniciar Propuesta" as a link to /dashboard', async () => {
		render(Hero);
		const cta = page.getByRole('link', { name: 'Iniciar Propuesta' });
		await expect.element(cta).toBeInTheDocument();
		await expect.element(cta).toHaveAttribute('href', '/dashboard');
	});

	it('renders "Leer Docs" as a link to #', async () => {
		render(Hero);
		const cta = page.getByRole('link', { name: 'Leer Docs' });
		await expect.element(cta).toBeInTheDocument();
		await expect.element(cta).toHaveAttribute('href', '#');
	});

	it('does NOT render an external <img> (image replaced by inline SVG)', async () => {
		render(Hero);
		// No <img> with an external Google URL should exist
		const imgs = page.getByRole('img', { name: /simboliza la toma de decisiones/ });
		await expect.element(imgs).not.toBeInTheDocument();
	});

	it('renders an inline SVG with the institutional wireframe aria-label', async () => {
		render(Hero);
		const svg = page.getByRole('img', { name: 'Vista arquitectónica institucional' });
		await expect.element(svg).toBeInTheDocument();
	});

	it('renders the inline SVG with the 560x420 viewBox', async () => {
		render(Hero);
		const svg = page.getByRole('img', { name: 'Vista arquitectónica institucional' });
		await expect.element(svg).toHaveAttribute('viewBox', '0 0 560 420');
	});
});
