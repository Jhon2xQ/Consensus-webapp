import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProcessTable from './ProcessTable.svelte';
import type { ElectoralProcess } from '$lib/types/electoral-process';

const mockProcesses: ElectoralProcess[] = [
	{
		id: 'proc-1',
		name: 'Elecciones Generales 2026',
		scope: 'Nacional',
		description: 'Elecciones presidenciales y legislativas',
		estatus: 'COMMITMENT',
		commitmentStart: '2026-06-01',
		commitmentEnd: '2026-06-15',
		votingStart: '2026-07-01',
		votingEnd: '2026-07-15',
		results: '',
		createdBy: 'user-1'
	},
	{
		id: 'proc-2',
		name: 'Referendo Constitucional',
		scope: 'Provincial',
		description: 'Aprobación de reforma constitucional',
		estatus: 'VOTING',
		commitmentStart: '2026-05-01',
		commitmentEnd: '2026-05-15',
		votingStart: '2026-06-01',
		votingEnd: '2026-06-30',
		results: '',
		createdBy: 'user-1'
	},
	{
		id: 'proc-3',
		name: 'Proceso Abierto',
		scope: 'Nacional',
		description: 'Inscripciones abiertas',
		estatus: 'OPEN',
		commitmentStart: '2026-08-01',
		commitmentEnd: '2026-09-01',
		votingStart: '2026-10-01',
		votingEnd: '2026-10-05',
		results: '2026-10-10',
		createdBy: 'user-1'
	},
	{
		id: 'proc-4',
		name: 'Proceso Sellado',
		scope: 'Provincial',
		description: 'Compromiso cerrado, esperando votación',
		estatus: 'SEALED',
		commitmentStart: '2026-04-01',
		commitmentEnd: '2026-05-15',
		votingStart: '2026-06-01',
		votingEnd: '2026-06-05',
		results: '2026-06-10',
		createdBy: 'user-1'
	},
	{
		id: 'proc-5',
		name: 'Proceso en Conteo',
		scope: 'Municipal',
		description: 'Votación cerrada, contando resultados',
		estatus: 'COUNTING',
		commitmentStart: '2026-03-01',
		commitmentEnd: '2026-04-15',
		votingStart: '2026-05-01',
		votingEnd: '2026-05-15',
		results: '2026-05-20',
		createdBy: 'user-1'
	}
];

describe('ProcessTable.svelte', () => {
	it('renders a semantic table', async () => {
		render(ProcessTable, { processes: mockProcesses });
		await expect.element(page.getByRole('table')).toBeInTheDocument();
	});

	it('renders the correct number of data rows', async () => {
		render(ProcessTable, { processes: mockProcesses });
		// header row + 5 data rows = 6 total
		const rows = page.getByRole('row').all();
		expect(rows.length).toBe(6);
	});

	it('displays process names', async () => {
		render(ProcessTable, { processes: mockProcesses });
		await expect
			.element(page.getByRole('cell', { name: 'Elecciones Generales 2026' }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('cell', { name: 'Referendo Constitucional' }))
			.toBeInTheDocument();
	});

	it('displays process scope', async () => {
		render(ProcessTable, { processes: mockProcesses });
		await expect.element(page.getByRole('cell', { name: 'Nacional' }).first()).toBeInTheDocument();
		await expect.element(page.getByRole('cell', { name: 'Provincial' }).first()).toBeInTheDocument();
		await expect.element(page.getByRole('cell', { name: 'Municipal' }).first()).toBeInTheDocument();
	});

	it('displays status badges with correct labels', async () => {
		render(ProcessTable, { processes: mockProcesses });
		await expect.element(page.getByText('Compromiso').first()).toBeInTheDocument();
		await expect.element(page.getByText('Votación').first()).toBeInTheDocument();
	});

	it('renders badges for all six states from the central map', async () => {
		render(ProcessTable, { processes: mockProcesses });
		await expect.element(page.getByText('Abierto').first()).toBeInTheDocument();
		await expect.element(page.getByText('Compromiso').first()).toBeInTheDocument();
		await expect.element(page.getByText('Sellado').first()).toBeInTheDocument();
		await expect.element(page.getByText('Votación').first()).toBeInTheDocument();
		await expect.element(page.getByText('Conteo').first()).toBeInTheDocument();
	});

	it('shows empty state when no processes', async () => {
		render(ProcessTable, { processes: [] });
		await expect
			.element(page.getByText('No hay procesos electorales'))
			.toBeInTheDocument();
	});

	it('does not render table when empty', async () => {
		render(ProcessTable, { processes: [] });
		const tables = page.getByRole('table').all();
		expect(tables.length).toBe(0);
	});

	it('renders action buttons for each process', async () => {
		render(ProcessTable, { processes: mockProcesses });
		const viewButtons = page.getByRole('link', { name: 'Ver detalle' }).all();
		expect(viewButtons.length).toBe(5);
	});
});
