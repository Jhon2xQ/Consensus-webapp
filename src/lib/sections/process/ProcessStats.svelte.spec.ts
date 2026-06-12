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

	it('renders zeros when summary is null', async () => {
		render(ProcessStats, defaultProps({ summary: null }));
		// All three "0" values
		const zeros = page.getByText('0', { exact: true });
		await expect.element(zeros.first()).toBeInTheDocument();
		// Labels still appear
		await expect.element(page.getByText('Participantes', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('Compromisos', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('Votaron', { exact: true })).toBeInTheDocument();
	});

	it('renders zeros when summary has zero values', async () => {
		render(ProcessStats, defaultProps({ summary: summaryZeros }));
		await expect.element(page.getByText('0', { exact: true }).first()).toBeInTheDocument();
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
});
