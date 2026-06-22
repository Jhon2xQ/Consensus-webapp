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
	// ── Status eyebrow (FR: dynamic indicator of effectiveStatus) ─────────
	// The eyebrow surfaces the current effectiveStatus as Spanish copy using
	// STATUS_LABELS as the single source of truth. Format is the literal
	// string "ESTADO ACTUAL : <label>", uppercased to match the eyebrow
	// aesthetic. The whole block wears the status text color AND a matching
	// border (border-{color} derived from STATUS_LABEL_COLORS via .replace).

	// One test per status — splitting keeps `getByText(..., { exact: true })`
	// strict-mode friendly (a loop leaves multiple renders in the DOM).

	it('renders "ESTADO ACTUAL : Abierto" when effectiveStatus is OPEN', async () => {
		render(ProcessTimeline, defaultProps({ effectiveStatus: 'OPEN' }));
		await expect
			.element(page.getByText('ESTADO ACTUAL : Abierto', { exact: true }))
			.toBeInTheDocument();
	});

	it('renders "ESTADO ACTUAL : Compromiso" when effectiveStatus is COMMITMENT', async () => {
		render(ProcessTimeline, defaultProps({ effectiveStatus: 'COMMITMENT' }));
		await expect
			.element(page.getByText('ESTADO ACTUAL : Compromiso', { exact: true }))
			.toBeInTheDocument();
	});

	it('renders "ESTADO ACTUAL : Sellado" when effectiveStatus is SEALED', async () => {
		render(ProcessTimeline, defaultProps({ effectiveStatus: 'SEALED' }));
		await expect
			.element(page.getByText('ESTADO ACTUAL : Sellado', { exact: true }))
			.toBeInTheDocument();
	});

	it('renders "ESTADO ACTUAL : Votación" when effectiveStatus is VOTING', async () => {
		render(ProcessTimeline, defaultProps({ effectiveStatus: 'VOTING' }));
		await expect
			.element(page.getByText('ESTADO ACTUAL : Votación', { exact: true }))
			.toBeInTheDocument();
	});

	it('renders "ESTADO ACTUAL : Conteo" when effectiveStatus is COUNTING', async () => {
		render(ProcessTimeline, defaultProps({ effectiveStatus: 'COUNTING' }));
		await expect
			.element(page.getByText('ESTADO ACTUAL : Conteo', { exact: true }))
			.toBeInTheDocument();
	});

	it('renders "ESTADO ACTUAL : Cerrado" when effectiveStatus is CLOSED', async () => {
		render(ProcessTimeline, defaultProps({ effectiveStatus: 'CLOSED' }));
		await expect
			.element(page.getByText('ESTADO ACTUAL : Cerrado', { exact: true }))
			.toBeInTheDocument();
	});

	it('exposes the status eyebrow via data-testid="timeline-status-eyebrow"', async () => {
		// Defensive check that the eyebrow is queryable by testid — the
		// other eyebrow tests use text matching; this one locks the hook
		// itself so consumers (or future refactors) can target it directly.
		render(ProcessTimeline, defaultProps({ effectiveStatus: 'COMMITMENT' }));
		const eyebrow = page.getByTestId('timeline-status-eyebrow');
		await expect.element(eyebrow).toBeInTheDocument();
		await expect.element(eyebrow).toHaveTextContent('ESTADO ACTUAL : Compromiso');
	});

	// The eyebrow block wears the status color (text + border). The status
	// text color comes from STATUS_LABEL_COLORS[status]; the matching border
	// color is derived by swapping the text- prefix for border-.

	it('applies the status text color to the eyebrow block (COMMITMENT → blue)', async () => {
		render(ProcessTimeline, defaultProps({ effectiveStatus: 'COMMITMENT' }));
		const eyebrow = page.getByTestId('timeline-status-eyebrow');
		await expect.element(eyebrow).toHaveClass('text-blue-800');
		await expect.element(eyebrow).toHaveClass('border-blue-800');
	});

	it('applies the status text color to the eyebrow block (VOTING → green)', async () => {
		render(ProcessTimeline, defaultProps({ effectiveStatus: 'VOTING' }));
		const eyebrow = page.getByTestId('timeline-status-eyebrow');
		await expect.element(eyebrow).toHaveClass('text-green-800');
		await expect.element(eyebrow).toHaveClass('border-green-800');
	});

	it('applies the status text color to the eyebrow block (COUNTING → orange)', async () => {
		render(ProcessTimeline, defaultProps({ effectiveStatus: 'COUNTING' }));
		const eyebrow = page.getByTestId('timeline-status-eyebrow');
		await expect.element(eyebrow).toHaveClass('text-orange-800');
		await expect.element(eyebrow).toHaveClass('border-orange-800');
	});

	it('does not keep the eyebrow in text-consensus-muted (color is status-driven)', async () => {
		// Inverse of the old "prefix stays muted" rule. The whole block is
		// tinted by the status color, so the muted class must be absent.
		render(ProcessTimeline, defaultProps({ effectiveStatus: 'COMMITMENT' }));
		const eyebrow = page.getByTestId('timeline-status-eyebrow');
		await expect.element(eyebrow).not.toHaveClass('text-consensus-muted');
	});

	it('keeps the timeline-status-eyebrow-value testid with the status word as plain text', async () => {
		// The inner span keeps its testid but is now plain text — no per-span
		// color class, since the parent h2 carries the color for the whole
		// block (label + value).
		render(ProcessTimeline, defaultProps({ effectiveStatus: 'COMMITMENT' }));
		const value = page.getByTestId('timeline-status-eyebrow-value');
		await expect.element(value).toBeInTheDocument();
		await expect.element(value).toHaveTextContent('Compromiso');
		await expect.element(value).not.toHaveClass('text-blue-800');
	});

	// ── Phase labels ──────────────────────────────────────────────────────

	it('renders all three phase labels', async () => {
		render(ProcessTimeline, defaultProps());
		await expect
			.element(page.getByTestId('phase-compromiso-label'))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId('phase-votacion-label'))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId('phase-resultados-label'))
			.toBeInTheDocument();
	});

	it('renders the Compromiso label with the phase text', async () => {
		render(ProcessTimeline, defaultProps());
		await expect
			.element(page.getByTestId('phase-compromiso-label'))
			.toHaveTextContent('Compromiso');
	});

	it('renders the Votación label with the phase text', async () => {
		render(ProcessTimeline, defaultProps());
		await expect
			.element(page.getByTestId('phase-votacion-label'))
			.toHaveTextContent('Votación');
	});

	it('renders the Resultados label with the phase text', async () => {
		render(ProcessTimeline, defaultProps());
		await expect
			.element(page.getByTestId('phase-resultados-label'))
			.toHaveTextContent('Resultados');
	});

	// ── Phase label color logic ───────────────────────────────────────────
	// Design contract:
	//   - Phase labels are ALWAYS text-consensus-muted. No status color,
	//     no per-phase tinting. The eyebrow block is the single source of
	//     status color on the page; labels stay neutral so the eyebrow
	//     reads as the highlighted affordance.

	it('renders every phase label as text-consensus-muted', async () => {
		// Active phase (VOTING → Votación) and inactive phases alike must
		// all read muted. This locks the "no per-phase tint" rule so a
		// future regression that re-tints the active label fails loudly.
		render(ProcessTimeline, defaultProps({ effectiveStatus: 'VOTING' }));
		await expect
			.element(page.getByTestId('phase-compromiso-label'))
			.toHaveClass('text-consensus-muted');
		await expect
			.element(page.getByTestId('phase-votacion-label'))
			.toHaveClass('text-consensus-muted');
		await expect
			.element(page.getByTestId('phase-resultados-label'))
			.toHaveClass('text-consensus-muted');
	});

	it('does not apply any status text color to any phase label', async () => {
		// Inverse guard: no label carries text-blue-800 / text-green-800 /
		// text-orange-800 / text-red-800 / text-violet-800 / text-amber-800.
		render(ProcessTimeline, defaultProps({ effectiveStatus: 'COMMITMENT' }));
		for (const id of ['phase-compromiso-label', 'phase-votacion-label', 'phase-resultados-label']) {
			const label = page.getByTestId(id);
			await expect.element(label).not.toHaveClass('text-blue-800');
			await expect.element(label).not.toHaveClass('text-green-800');
			await expect.element(label).not.toHaveClass('text-orange-800');
			await expect.element(label).not.toHaveClass('text-red-800');
			await expect.element(label).not.toHaveClass('text-violet-800');
			await expect.element(label).not.toHaveClass('text-amber-800');
		}
	});

	// ── Compromiso: start + end dates and times ──────────────────────────

	it('renders the formatted start date for the Compromiso phase', async () => {
		render(ProcessTimeline, defaultProps());
		const startDate = page.getByTestId('phase-compromiso-start-date');
		await expect.element(startDate).toBeInTheDocument();
		// 2026-03-01 → "01 marzo 2026" in es_PE (zero-padded day, full month
		// name, literals like "de" filtered out). The exact month name and
		// year depend on the test runner's locale and timezone, so we assert
		// the structural shape: 2-digit day, any month name, 4-digit year.
		await expect.element(startDate).toHaveTextContent(/^01 \S+ 2026$/);
	});

	it('renders the formatted end date for the Compromiso phase', async () => {
		render(ProcessTimeline, defaultProps());
		const endDate = page.getByTestId('phase-compromiso-end-date');
		await expect.element(endDate).toBeInTheDocument();
		await expect.element(endDate).toHaveTextContent(/^30 \S+ 2026$/);
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
		await expect.element(startDate).toHaveTextContent(/^15 \S+ 2026$/);
	});

	it('renders the formatted end date for the Votación phase', async () => {
		render(ProcessTimeline, defaultProps());
		const endDate = page.getByTestId('phase-votacion-end-date');
		await expect.element(endDate).toBeInTheDocument();
		await expect.element(endDate).toHaveTextContent(/^20 \S+ 2026$/);
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
		await expect.element(dateLine).toHaveTextContent(/^25 \S+ 2026$/);
	});

	it('renders the time for the Resultados phase', async () => {
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

	// ── Layout structure: two full datetime units side-by-side ───────────
	// Design contract for range phases (Compromiso, Votación):
	//   - Each "datetime unit" is a flex-col stacking date above time, with
	//     date in primary text and time muted/mono.
	//   - Two units sit on a single flex row, separated by an en-dash.
	//   - DOM order: start-unit, dash, end-unit.

	it('places Compromiso start/end as stacked datetime units with the dash between them', async () => {
		render(ProcessTimeline, defaultProps());
		const startDate = page.getByTestId('phase-compromiso-start-date').element();
		const startTime = page.getByTestId('phase-compromiso-start-time').element();
		const separator = page.getByTestId('phase-compromiso-separator').element();
		const endDate = page.getByTestId('phase-compromiso-end-date').element();
		const endTime = page.getByTestId('phase-compromiso-end-time').element();

		// start-date and start-time share one parent (the start unit).
		const startUnit = startDate.parentElement;
		expect(startUnit).toBe(startTime.parentElement);
		// end-date and end-time share a different parent (the end unit).
		const endUnit = endDate.parentElement;
		expect(endUnit).toBe(endTime.parentElement);
		expect(endUnit).not.toBe(startUnit);

		// Inside each unit, the date comes before the time.
		const startChildren = Array.from(startUnit!.children);
		expect(startChildren.indexOf(startDate)).toBeLessThan(startChildren.indexOf(startTime));
		const endChildren = Array.from(endUnit!.children);
		expect(endChildren.indexOf(endDate)).toBeLessThan(endChildren.indexOf(endTime));

		// Both units and the dash share the SAME row parent.
		const row = startUnit!.parentElement;
		expect(row).toBe(separator.parentElement);
		expect(row).toBe(endUnit!.parentElement);

		// DOM order on the row: start-unit, dash, end-unit.
		const rowChildren = Array.from(row!.children);
		const iStart = rowChildren.indexOf(startUnit!);
		const iSep = rowChildren.indexOf(separator);
		const iEnd = rowChildren.indexOf(endUnit!);
		expect(iStart).toBeLessThan(iSep);
		expect(iSep).toBeLessThan(iEnd);
	});

	it('places Votación start/end as stacked datetime units with the dash between them', async () => {
		render(ProcessTimeline, defaultProps());
		const startDate = page.getByTestId('phase-votacion-start-date').element();
		const startTime = page.getByTestId('phase-votacion-start-time').element();
		const separator = page.getByTestId('phase-votacion-separator').element();
		const endDate = page.getByTestId('phase-votacion-end-date').element();
		const endTime = page.getByTestId('phase-votacion-end-time').element();

		const startUnit = startDate.parentElement;
		expect(startUnit).toBe(startTime.parentElement);
		const endUnit = endDate.parentElement;
		expect(endUnit).toBe(endTime.parentElement);
		expect(endUnit).not.toBe(startUnit);

		const startChildren = Array.from(startUnit!.children);
		expect(startChildren.indexOf(startDate)).toBeLessThan(startChildren.indexOf(startTime));
		const endChildren = Array.from(endUnit!.children);
		expect(endChildren.indexOf(endDate)).toBeLessThan(endChildren.indexOf(endTime));

		const row = startUnit!.parentElement;
		expect(row).toBe(separator.parentElement);
		expect(row).toBe(endUnit!.parentElement);

		const rowChildren = Array.from(row!.children);
		expect(rowChildren.indexOf(startUnit!)).toBeLessThan(rowChildren.indexOf(separator));
		expect(rowChildren.indexOf(separator)).toBeLessThan(rowChildren.indexOf(endUnit!));
	});

	it('places the Resultados date and time in a stacked datetime unit', async () => {
		render(ProcessTimeline, defaultProps());
		const dateLine = page.getByTestId('phase-resultados-date').element();
		const timeLine = page.getByTestId('phase-resultados-time').element();

		// Single unit: date and time share the same parent (a flex-col).
		const unit = dateLine.parentElement;
		expect(unit).toBe(timeLine.parentElement);
		expect(unit?.className).toContain('flex-col');

		// Date comes before time inside the unit.
		const children = Array.from(unit!.children);
		expect(children.indexOf(dateLine)).toBeLessThan(children.indexOf(timeLine));
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