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
	// ── Phase labels ──────────────────────────────────────────────────────

	it('renders all three phase labels', async () => {
		render(ProcessTimeline, defaultProps());
		await expect.element(page.getByText('Compromiso', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('Votación', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('Resultados', { exact: true })).toBeInTheDocument();
	});

	// ── Compromiso: start + end dates and times ──────────────────────────

	it('renders the formatted start date for the Compromiso phase', async () => {
		render(ProcessTimeline, defaultProps());
		const startDate = page.getByTestId('phase-compromiso-start-date');
		await expect.element(startDate).toBeInTheDocument();
		await expect.element(startDate).toHaveTextContent(/1 mar 2026/);
	});

	it('renders the formatted end date for the Compromiso phase', async () => {
		render(ProcessTimeline, defaultProps());
		const endDate = page.getByTestId('phase-compromiso-end-date');
		await expect.element(endDate).toBeInTheDocument();
		await expect.element(endDate).toHaveTextContent(/30 abr 2026/);
	});

	it('renders the formatted start time for the Compromiso phase', async () => {
		render(ProcessTimeline, defaultProps());
		const startTime = page.getByTestId('phase-compromiso-start-time');
		await expect.element(startTime).toBeInTheDocument();
		// Time format: HH:MM (es-AR 12-hour with locale suffix is acceptable).
		await expect.element(startTime).toHaveTextContent(/\d{1,2}:\d{2}/);
	});

	it('renders the formatted end time for the Compromiso phase', async () => {
		render(ProcessTimeline, defaultProps());
		const endTime = page.getByTestId('phase-compromiso-end-time');
		await expect.element(endTime).toBeInTheDocument();
		await expect.element(endTime).toHaveTextContent(/\d{1,2}:\d{2}/);
	});

	it('renders a dash separator between the start and end of Compromiso', async () => {
		render(ProcessTimeline, defaultProps());
		const separator = page.getByTestId('phase-compromiso-separator');
		await expect.element(separator).toBeInTheDocument();
		await expect.element(separator).toHaveTextContent('–');
	});

	// ── Votación: start + end dates and times ────────────────────────────

	it('renders the formatted start date for the Votación phase', async () => {
		render(ProcessTimeline, defaultProps());
		const startDate = page.getByTestId('phase-votacion-start-date');
		await expect.element(startDate).toBeInTheDocument();
		await expect.element(startDate).toHaveTextContent(/15 jun 2026/);
	});

	it('renders the formatted end date for the Votación phase', async () => {
		render(ProcessTimeline, defaultProps());
		const endDate = page.getByTestId('phase-votacion-end-date');
		await expect.element(endDate).toBeInTheDocument();
		await expect.element(endDate).toHaveTextContent(/20 jun 2026/);
	});

	it('renders the formatted start time for the Votación phase', async () => {
		render(ProcessTimeline, defaultProps());
		const startTime = page.getByTestId('phase-votacion-start-time');
		await expect.element(startTime).toBeInTheDocument();
		await expect.element(startTime).toHaveTextContent(/\d{1,2}:\d{2}/);
	});

	it('renders the formatted end time for the Votación phase', async () => {
		render(ProcessTimeline, defaultProps());
		const endTime = page.getByTestId('phase-votacion-end-time');
		await expect.element(endTime).toBeInTheDocument();
		await expect.element(endTime).toHaveTextContent(/\d{1,2}:\d{2}/);
	});

	it('renders a dash separator between the start and end of Votación', async () => {
		render(ProcessTimeline, defaultProps());
		const separator = page.getByTestId('phase-votacion-separator');
		await expect.element(separator).toBeInTheDocument();
		await expect.element(separator).toHaveTextContent('–');
	});

	// ── Resultados: single point-in-time, no end ─────────────────────────

	it('renders the date for the Resultados phase', async () => {
		render(ProcessTimeline, defaultProps());
		const dateLine = page.getByTestId('phase-resultados-date');
		await expect.element(dateLine).toBeInTheDocument();
		await expect.element(dateLine).toHaveTextContent(/25 jun 2026/);
	});

	it('renders a time-only line for the Resultados phase', async () => {
		render(ProcessTimeline, defaultProps());
		const timeLine = page.getByTestId('phase-resultados-time');
		await expect.element(timeLine).toBeInTheDocument();
		// Time format: HH:MM (12-hour with locale suffix is acceptable).
		await expect.element(timeLine).toHaveTextContent(/\d{1,2}:\d{2}/);
	});

	it('does not render a dash separator for the Resultados phase', async () => {
		render(ProcessTimeline, defaultProps());
		// Resultados is a single point in time — the rendered text must
		// not contain the en-dash separator that marks a range.
		const phase = page.getByTestId('phase-resultados');
		await expect.element(phase).not.toHaveTextContent('–');
	});

	// ── Visual treatment: dates bold/fg, times muted/mono ────────────────
	// Design contract: dates use `text-consensus-fg font-semibold` (primary
	// text, bold) and times use `text-consensus-muted font-mono` (muted
	// gray, monospaced). This is the spec the rest of the timeline builds on.

	it('renders Compromiso start date with primary text color (not muted)', async () => {
		render(ProcessTimeline, defaultProps());
		const startDate = page.getByTestId('phase-compromiso-start-date');
		await expect.element(startDate).toHaveClass('text-consensus-fg');
		await expect.element(startDate).toHaveClass('font-semibold');
		await expect.element(startDate).not.toHaveClass('text-consensus-muted');
	});

	it('renders Compromiso start time with muted color and monospaced font', async () => {
		render(ProcessTimeline, defaultProps());
		const startTime = page.getByTestId('phase-compromiso-start-time');
		await expect.element(startTime).toHaveClass('text-consensus-muted');
		await expect.element(startTime).toHaveClass('font-mono');
	});

	it('renders Votación end date with primary text color (not muted)', async () => {
		render(ProcessTimeline, defaultProps());
		const endDate = page.getByTestId('phase-votacion-end-date');
		await expect.element(endDate).toHaveClass('text-consensus-fg');
		await expect.element(endDate).toHaveClass('font-semibold');
		await expect.element(endDate).not.toHaveClass('text-consensus-muted');
	});

	it('renders Votación end time with muted color and monospaced font', async () => {
		render(ProcessTimeline, defaultProps());
		const endTime = page.getByTestId('phase-votacion-end-time');
		await expect.element(endTime).toHaveClass('text-consensus-muted');
		await expect.element(endTime).toHaveClass('font-mono');
	});

	it('renders Resultados date with primary text color and time with muted color', async () => {
		render(ProcessTimeline, defaultProps());
		const dateLine = page.getByTestId('phase-resultados-date');
		const timeLine = page.getByTestId('phase-resultados-time');
		await expect.element(dateLine).toHaveClass('text-consensus-fg');
		await expect.element(dateLine).not.toHaveClass('text-consensus-muted');
		await expect.element(timeLine).toHaveClass('text-consensus-muted');
		await expect.element(timeLine).toHaveClass('font-mono');
	});

	it('renders the Compromiso dash separator with the muted color', async () => {
		render(ProcessTimeline, defaultProps());
		const separator = page.getByTestId('phase-compromiso-separator');
		await expect.element(separator).toHaveClass('text-consensus-muted');
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
