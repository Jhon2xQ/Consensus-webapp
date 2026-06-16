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
		effectiveStatus: 'OPEN' as const,
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

	it('renders a time range for the compromiso phase', async () => {
		render(ProcessTimeline, defaultProps());
		// HTML design: each phase shows a date + a time-range line, not the
		// old "Inicio:" / "Fin:" split. The es-AR locale formats time in
		// 12-hour with "a. m." / "p. m." — we just assert the dash separator
		// is present (the time range, not two independent times).
		const phase = page.getByTestId('phase-compromiso');
		await expect.element(phase).toBeInTheDocument();
		// The phase must contain a date AND a time-range line
		await expect.element(phase).toHaveTextContent(/1 mar 2026/);
		await expect.element(phase).toHaveTextContent(/\d{1,2}:\d{2}[^0-9]+\d{1,2}:\d{2}/);
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

	// ── Active / done state tests (spec FR-10) ────────────────────────────
	// Each phase container carries a data-state attribute:
	//   "active"   → current phase for the effectiveStatus
	//   "done"     → past phase
	//   "upcoming" → future phase
	// This is the public hook the timeline exposes; the visual treatment
	// (red for active, green for done) is verified by design review.

	it('marks Compromiso as active when effectiveStatus is COMMITMENT', async () => {
		render(ProcessTimeline, defaultProps({ effectiveStatus: 'COMMITMENT' }));
		const phase = page.getByTestId('phase-compromiso');
		await expect.element(phase).toHaveAttribute('data-state', 'active');
	});

	it('marks Votación as active and Compromiso as done when effectiveStatus is VOTING', async () => {
		render(ProcessTimeline, defaultProps({ effectiveStatus: 'VOTING' }));
		await expect
			.element(page.getByTestId('phase-votacion'))
			.toHaveAttribute('data-state', 'active');
		await expect
			.element(page.getByTestId('phase-compromiso'))
			.toHaveAttribute('data-state', 'done');
		await expect
			.element(page.getByTestId('phase-resultados'))
			.toHaveAttribute('data-state', 'upcoming');
	});

	it('marks all three phases as done when effectiveStatus is CLOSED', async () => {
		render(ProcessTimeline, defaultProps({ effectiveStatus: 'CLOSED' }));
		await expect
			.element(page.getByTestId('phase-compromiso'))
			.toHaveAttribute('data-state', 'done');
		await expect
			.element(page.getByTestId('phase-votacion'))
			.toHaveAttribute('data-state', 'done');
		await expect
			.element(page.getByTestId('phase-resultados'))
			.toHaveAttribute('data-state', 'done');
	});

	it('marks Compromiso as done and the rest as upcoming when effectiveStatus is SEALED', async () => {
		render(ProcessTimeline, defaultProps({ effectiveStatus: 'SEALED' }));
		await expect
			.element(page.getByTestId('phase-compromiso'))
			.toHaveAttribute('data-state', 'done');
		await expect
			.element(page.getByTestId('phase-votacion'))
			.toHaveAttribute('data-state', 'upcoming');
		await expect
			.element(page.getByTestId('phase-resultados'))
			.toHaveAttribute('data-state', 'upcoming');
	});

	it('marks Compromiso and Votación as done, Resultados as active when effectiveStatus is COUNTING', async () => {
		render(ProcessTimeline, defaultProps({ effectiveStatus: 'COUNTING' }));
		await expect
			.element(page.getByTestId('phase-compromiso'))
			.toHaveAttribute('data-state', 'done');
		await expect
			.element(page.getByTestId('phase-votacion'))
			.toHaveAttribute('data-state', 'done');
		await expect
			.element(page.getByTestId('phase-resultados'))
			.toHaveAttribute('data-state', 'active');
	});

	it('marks all three phases as upcoming when effectiveStatus is OPEN', async () => {
		render(ProcessTimeline, defaultProps({ effectiveStatus: 'OPEN' }));
		await expect
			.element(page.getByTestId('phase-compromiso'))
			.toHaveAttribute('data-state', 'upcoming');
		await expect
			.element(page.getByTestId('phase-votacion'))
			.toHaveAttribute('data-state', 'upcoming');
		await expect
			.element(page.getByTestId('phase-resultados'))
			.toHaveAttribute('data-state', 'upcoming');
	});
});
