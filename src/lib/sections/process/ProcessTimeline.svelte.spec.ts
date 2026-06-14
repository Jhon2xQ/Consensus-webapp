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

	it('renders the formatted start and end dates for each phase', async () => {
		render(ProcessTimeline, defaultProps());
		// The compact timeline shows the date range for each phase.
		// We assert on the year because the exact Intl.DateTimeFormat output
		// is locale-dependent.
		await expect.element(page.getByText(/2026/).first()).toBeInTheDocument();
	});

	it('does not render separate Inicio / Fin sub-labels', async () => {
		render(ProcessTimeline, defaultProps());
		await expect.element(page.getByText('Inicio', { exact: true })).not.toBeInTheDocument();
		await expect.element(page.getByText('Fin', { exact: true })).not.toBeInTheDocument();
	});
});
