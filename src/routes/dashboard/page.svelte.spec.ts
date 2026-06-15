import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DashboardPage from './+page.svelte';

vi.mock('$app/state', () => ({
	page: { url: new URL('http://localhost/dashboard') }
}));

vi.mock('$lib/mock', () => ({
	electoralProcesses: [
		{
			id: '1',
			name: 'Elecciones Nacionales 2026',
			scope: 'Nacional',
			estatus: 'OPEN',
			commitmentStart: '2026-07-01T00:00:00Z',
			commitmentEnd: '2026-07-15T00:00:00Z',
			sealedAt: null,
			votingStart: null,
			votingEnd: null,
			closedAt: null
		},
		{
			id: '2',
			name: 'Elecciones Regionales 2026',
			scope: 'Regional',
			estatus: 'VOTING',
			commitmentStart: '2026-06-01T00:00:00Z',
			commitmentEnd: '2026-06-15T00:00:00Z',
			sealedAt: '2026-06-16T00:00:00Z',
			votingStart: '2026-06-17T00:00:00Z',
			votingEnd: '2026-06-30T00:00:00Z',
			closedAt: null
		}
	]
}));

describe('Dashboard +page.svelte', () => {
	it('renders dashboard heading', async () => {
		render(DashboardPage);
		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Dashboard');
	});

	it('renders stat cards', async () => {
		render(DashboardPage);
		await expect.element(page.getByText('Total Procesos')).toBeInTheDocument();
		await expect.element(page.getByText('Procesos Activos')).toBeInTheDocument();
	});

	it('describes Procesos Activos with the 6-state rule', async () => {
		render(DashboardPage);
		await expect.element(page.getByText('Procesos aún sin cerrar')).toBeInTheDocument();
	});

	it('does not render the legacy "compromiso o votación" sub-description', async () => {
		render(DashboardPage);
		await expect
			.element(page.getByText('En fase de compromiso o votación'))
			.not.toBeInTheDocument();
	});

	it('renders status distribution section', async () => {
		render(DashboardPage);
		await expect.element(page.getByText('Distribución por Estado')).toBeInTheDocument();
	});
});
