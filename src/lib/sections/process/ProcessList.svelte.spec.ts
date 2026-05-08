import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProcessList from './ProcessList.svelte';
import { electoralProcesses } from '$lib/mock/electoral-processes';

describe('ProcessList.svelte', () => {
	it('renders the page title', async () => {
		render(ProcessList, { processes: electoralProcesses });
		await expect
			.element(page.getByRole('heading', { level: 1, name: 'Procesos Electorales' }))
			.toBeInTheDocument();
	});

	it('renders exactly 10 rows', async () => {
		render(ProcessList, { processes: electoralProcesses });
		const rows = page.getByRole('row').all();
		expect(rows.length).toBe(10);
	});

	it('renders a semantic table', async () => {
		render(ProcessList, { processes: electoralProcesses });
		await expect.element(page.getByRole('table')).toBeInTheDocument();
	});

	it('displays process names', async () => {
		render(ProcessList, { processes: electoralProcesses });
		await expect.element(page.getByText('Elecciones Nacionales 2026')).toBeInTheDocument();
		await expect.element(page.getByText('Referéndum Nacional')).toBeInTheDocument();
	});

	it('displays scope labels', async () => {
		render(ProcessList, { processes: electoralProcesses });
		await expect.element(page.getByText('Nacional').first()).toBeInTheDocument();
		await expect.element(page.getByText('Provincial').first()).toBeInTheDocument();
		await expect.element(page.getByText('Municipal').first()).toBeInTheDocument();
	});

	it('displays status badges with Spanish labels', async () => {
		render(ProcessList, { processes: electoralProcesses });
		await expect.element(page.getByText('Compromiso').first()).toBeInTheDocument();
		await expect.element(page.getByText('Votación').first()).toBeInTheDocument();
		await expect.element(page.getByText('Cerrado').first()).toBeInTheDocument();
		await expect.element(page.getByText('Inactivo')).toBeInTheDocument();
		await expect.element(page.getByText('Pausado')).toBeInTheDocument();
	});

	it('displays formatted voting dates', async () => {
		render(ProcessList, { processes: electoralProcesses });
		await expect.element(page.getByText(/jun/).first()).toBeInTheDocument();
	});
});
