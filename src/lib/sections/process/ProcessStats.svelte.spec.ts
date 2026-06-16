import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProcessStats from './ProcessStats.svelte';
import type { EnrollmentSummary } from '$lib/types/enrollment';

const summary: EnrollmentSummary = {
	totalParticipants: 42,
	totalCommitments: 30,
	totalVoted: 18
};

const summaryZeros: EnrollmentSummary = {
	totalParticipants: 0,
	totalCommitments: 0,
	totalVoted: 0
};

function defaultProps(overrides?: Record<string, unknown>) {
	return {
		summary,
		...overrides
	};
}

describe('ProcessStats', () => {
	it('renders the three stat labels', async () => {
		render(ProcessStats, defaultProps());
		await expect.element(page.getByText('Participantes', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('Compromisos', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('Votaron', { exact: true })).toBeInTheDocument();
	});

	it('renders each summary value as a number', async () => {
		render(ProcessStats, defaultProps());
		await expect.element(page.getByText('42', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('30', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('18', { exact: true })).toBeInTheDocument();
	});

	it('renders dashes (—) for all values when summary is null', async () => {
		render(ProcessStats, defaultProps({ summary: null }));
		// Spec FR-11: muted "—" for unavailable values. The HTML design
		// uses an em-dash, NOT "0" — this is a behavior change from the
		// old component.
		const dashes = page.getByText('—', { exact: true });
		await expect.element(dashes.first()).toBeInTheDocument();
		// All three stat slots render a dash
		const allDashes = page.getByText('—', { exact: true }).elements();
		expect(allDashes.length).toBe(3);
		// Labels still appear
		await expect.element(page.getByText('Participantes', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('Compromisos', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('Votaron', { exact: true })).toBeInTheDocument();
	});

	it('marks each unavailable value as muted via data-state="muted"', async () => {
		// The design contract is the muted visual treatment. We use a
		// data-state attribute as the public hook so the test does not
		// couple to specific Tailwind class names.
		render(ProcessStats, defaultProps({ summary: null }));
		const mutedValues = page.getByTestId('stat-value-muted');
		expect(mutedValues.elements().length).toBe(3);
	});

	it('renders zeros when summary has zero values (zero is a valid count, not "—")', async () => {
		render(ProcessStats, defaultProps({ summary: summaryZeros }));
		await expect.element(page.getByText('0', { exact: true }).first()).toBeInTheDocument();
		// All three "0" values
		const zeros = page.getByText('0', { exact: true }).elements();
		expect(zeros.length).toBe(3);
	});

	it('renders "No disponible" when error is true', async () => {
		render(ProcessStats, defaultProps({ error: true }));
		await expect.element(page.getByText('No disponible', { exact: true })).toBeInTheDocument();
	});

	it('does not render stat labels when error is true', async () => {
		render(ProcessStats, defaultProps({ error: true }));
		await expect
			.element(page.getByText('Participantes', { exact: true }))
			.not.toBeInTheDocument();
		await expect
			.element(page.getByText('Compromisos', { exact: true }))
			.not.toBeInTheDocument();
		await expect.element(page.getByText('Votaron', { exact: true })).not.toBeInTheDocument();
	});

	it('does not render "No disponible" when there is no error', async () => {
		render(ProcessStats, defaultProps());
		await expect
			.element(page.getByText('No disponible', { exact: true }))
			.not.toBeInTheDocument();
	});

	describe('variant prop', () => {
		it('default variant keeps the horizontal grid (sm:grid-cols-3)', async () => {
			// RED: assert that the default keeps sm:grid-cols-3 so it
			// preserves the existing layout. With no variant prop, the
			// component should still render the 3-column grid at sm+.
			const { container } = render(ProcessStats, defaultProps());
			const grid = container.querySelector('div.grid');
			expect(grid).toBeTruthy();
			expect(grid?.className).toMatch(/\bsm:grid-cols-3\b/);
		});

		it('variant="vertical" switches to grid-cols-1 (one stat per row)', async () => {
			// RED: assert that variant="vertical" produces a single-column
			// grid. The horizontal `sm:grid-cols-3` MUST NOT be applied.
			const { container } = render(ProcessStats, defaultProps({ variant: 'vertical' }));
			const grid = container.querySelector('div.grid');
			expect(grid).toBeTruthy();
			expect(grid?.className).toMatch(/\bgrid-cols-1\b/);
			expect(grid?.className).not.toMatch(/\bsm:grid-cols-3\b/);
		});

		it('variant="vertical" with error=true shows only "No disponible" and no stat grid', async () => {
			// RED: assert that the error branch is unchanged across variants.
			// Only the "No disponible" message is rendered; no stat grid.
			const { container } = render(
				ProcessStats,
				defaultProps({ error: true, variant: 'vertical' })
			);
			await expect
				.element(page.getByText('No disponible', { exact: true }))
				.toBeInTheDocument();
			const grid = container.querySelector('div.grid');
			expect(grid).toBeFalsy();
		});
	});
});
