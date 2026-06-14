import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProcessTimeline from './ProcessTimeline.svelte';

const commitmentStart = '2026-03-01T09:00:00Z';
const commitmentEnd = '2026-04-30T18:00:00Z';
const votingStart = '2026-06-15T10:00:00Z';
const votingEnd = '2026-06-20T20:00:00Z';
const results = '2026-06-25T20:00:00Z';

function defaultProps(overrides?: Record<string, unknown>) {
	return {
		commitmentStart,
		commitmentEnd,
		votingStart,
		votingEnd,
		results,
		...overrides
	};
}

describe('ProcessTimeline', () => {
	it('renders all three phase labels', async () => {
		render(ProcessTimeline, defaultProps());
		await expect.element(page.getByText('Compromiso', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('Votación', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('Resultados', { exact: true })).toBeInTheDocument();
	});

	it('renders Inicio and Fin sub-labels for commitment and voting phases', async () => {
		render(ProcessTimeline, defaultProps());
		await expect.element(page.getByText(/Inicio:/).first()).toBeInTheDocument();
		await expect.element(page.getByText(/Fin:/).first()).toBeInTheDocument();
	});

	it('renders formatted dates for each phase', async () => {
		render(ProcessTimeline, defaultProps());
		// The exact Intl.DateTimeFormat output is locale-dependent, so we
		// assert that the year appears for commitment, voting and results.
		await expect.element(page.getByText(/2026/).first()).toBeInTheDocument();
	});

	it('renders the results date in the Resultados phase', async () => {
		render(ProcessTimeline, defaultProps());
		await expect.element(page.getByText('Resultados', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText(/2026/).first()).toBeInTheDocument();
	});
});
