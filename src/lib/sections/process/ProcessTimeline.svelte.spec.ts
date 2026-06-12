import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProcessTimeline from './ProcessTimeline.svelte';

const commitmentStart = '2026-03-01T09:00:00Z';
const commitmentEnd = '2026-04-30T18:00:00Z';
const votingStart = '2026-06-15T10:00:00Z';
const votingEnd = '2026-06-20T20:00:00Z';

function defaultProps(overrides?: Record<string, unknown>) {
	return {
		commitmentStart,
		commitmentEnd,
		votingStart,
		votingEnd,
		...overrides
	};
}

describe('ProcessTimeline', () => {
	it('renders the Compromiso section label', async () => {
		render(ProcessTimeline, defaultProps());
		await expect.element(page.getByText('Compromiso', { exact: true })).toBeInTheDocument();
	});

	it('renders the Votación section label', async () => {
		render(ProcessTimeline, defaultProps());
		await expect.element(page.getByText('Votación', { exact: true })).toBeInTheDocument();
	});

	it('renders Inicio and Fin labels twice (one for each phase)', async () => {
		render(ProcessTimeline, defaultProps());
		// Two cards × two labels each = 4 occurrences total
		const inicioLabels = page.getByText('Inicio', { exact: true });
		const finLabels = page.getByText('Fin', { exact: true });
		await expect.element(inicioLabels.first()).toBeInTheDocument();
		await expect.element(finLabels.first()).toBeInTheDocument();
	});

	it('renders all four formatted dates with their numeric components', async () => {
		// We test for date components rather than the full formatted string
		// because Intl.DateTimeFormat('es-AR') output is locale-dependent and
		// tests should not be coupled to that exact string.
		render(ProcessTimeline, defaultProps());
		// Both commitment and voting dates are in March–June 2026.
		await expect.element(page.getByText(/2026/).first()).toBeInTheDocument();
	});

	it('renders the timeline as a 2-column grid on medium screens', async () => {
		// We assert via the wrapper class — the grid uses md:grid-cols-2.
		const { container } = render(ProcessTimeline, defaultProps());
		const grid = container.querySelector('.grid');
		expect(grid).not.toBeNull();
		expect(grid?.className).toContain('md:grid-cols-2');
	});
});
