import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProcessList from './ProcessList.svelte';
import type { ElectoralProcess } from '$lib/types/electoral-process';

const mockProcess: ElectoralProcess = {
	id: '1',
	name: 'Elecciones Nacionales 2026',
	scope: 'Nacional',
	description: 'Proceso electoral para elegir representantes nacionales.',
	estatus: 'COMMITMENT',
	commitmentStart: '2026-03-01T00:00:00Z',
	commitmentEnd: '2026-04-30T00:00:00Z',
	votingStart: '2026-06-15T00:00:00Z',
	votingEnd: '2026-06-20T00:00:00Z',
	results: '2026-06-25T00:00:00Z',
	createdBy: 'user-1'
};

const mockProcessNoDesc: ElectoralProcess = {
	...mockProcess,
	id: '2',
	name: 'Elecciones Provinciales Buenos Aires',
	scope: 'Provincial',
	description: null,
	estatus: 'VOTING'
};

const mockProcessClosed: ElectoralProcess = {
	...mockProcess,
	id: '3',
	name: 'Comicios Cerrados',
	scope: 'Municipal',
	description: null,
	estatus: 'CLOSED'
};

function defaultProps(overrides?: Record<string, unknown>) {
	return {
		processes: [mockProcess],
		page: 1,
		totalElements: 1,
		error: null,
		onpagechange: vi.fn(),
		...overrides
	};
}

describe('ProcessList.svelte (public)', () => {
	describe('process card rendering', () => {
		it('renders the page title', async () => {
			render(ProcessList, defaultProps());
			await expect
				.element(page.getByRole('heading', { level: 1, name: 'Procesos Electorales' }))
				.toBeInTheDocument();
		});

		it('renders process name', async () => {
			render(ProcessList, defaultProps());
			await expect.element(page.getByText('Elecciones Nacionales 2026')).toBeInTheDocument();
		});

		it('renders scope label', async () => {
			render(ProcessList, defaultProps());
			await expect.element(page.getByText('Nacional', { exact: true })).toBeInTheDocument();
		});

		it('renders description when not null', async () => {
			render(ProcessList, defaultProps());
			await expect
				.element(page.getByText('Proceso electoral para elegir representantes nacionales.'))
				.toBeInTheDocument();
		});

		it('does not render description when null', async () => {
			render(ProcessList, defaultProps({ processes: [mockProcessNoDesc] }));
			await expect
				.element(page.getByText('Proceso electoral para elegir representantes nacionales.'))
				.not.toBeInTheDocument();
			await expect.element(page.getByText('Elecciones Provinciales Buenos Aires')).toBeInTheDocument();
		});

		it('renders ABIERTO badge for non-CLOSED process', async () => {
			render(ProcessList, defaultProps());
			await expect.element(page.getByText('ABIERTO', { exact: true })).toBeInTheDocument();
		});

		it('renders CERRADO badge for CLOSED process', async () => {
			render(ProcessList, defaultProps({ processes: [mockProcessClosed] }));
			await expect.element(page.getByText('CERRADO', { exact: true })).toBeInTheDocument();
		});

		it('renders commitment column header', async () => {
			render(ProcessList, defaultProps());
			await expect.element(page.getByText('Compromiso', { exact: true })).toBeInTheDocument();
		});

		it('renders voting column header', async () => {
			render(ProcessList, defaultProps());
			await expect.element(page.getByText('Votación', { exact: true })).toBeInTheDocument();
		});

		it('renders results column header', async () => {
			render(ProcessList, defaultProps());
			await expect.element(page.getByText('Resultados', { exact: true })).toBeInTheDocument();
		});

		it('renders PARTICIPAR button', async () => {
			render(ProcessList, defaultProps());
			const participateBtn = page.getByRole('button', { name: /Participar/ });
			await expect.element(participateBtn).toBeInTheDocument();
		});

		it('renders multiple process cards', async () => {
			render(
				ProcessList,
				defaultProps({
					processes: [mockProcess, mockProcessNoDesc, mockProcessClosed],
					totalElements: 3
				})
			);
			await expect.element(page.getByText('Elecciones Nacionales 2026')).toBeInTheDocument();
			await expect.element(page.getByText('Elecciones Provinciales Buenos Aires')).toBeInTheDocument();
			await expect.element(page.getByText('Comicios Cerrados')).toBeInTheDocument();
		});
	});

	describe('states', () => {
		it('shows empty message when processes is empty and totalElements is 0', async () => {
			render(ProcessList, defaultProps({ processes: [], page: 1, totalElements: 0 }));
			await expect.element(page.getByText('No hay procesos disponibles.')).toBeInTheDocument();
		});

		it('shows error message when error prop is set', async () => {
			render(
				ProcessList,
				defaultProps({ processes: [], error: 'Error al cargar los procesos. Intente nuevamente.' })
			);
			await expect
				.element(page.getByText('Error al cargar los procesos. Intente nuevamente.'))
				.toBeInTheDocument();
		});

		it('does not show process cards when error is set', async () => {
			render(
				ProcessList,
				defaultProps({
					processes: [mockProcess],
					error: 'Error al cargar los procesos. Intente nuevamente.'
				})
			);
			await expect.element(page.getByText('Elecciones Nacionales 2026')).not.toBeInTheDocument();
		});
	});

	describe('pagination', () => {
		it('shows page number with format "N / M"', async () => {
			render(
				ProcessList,
				defaultProps({
					processes: [mockProcess, mockProcessNoDesc],
					page: 1,
					totalElements: 6
				})
			);
			await expect.element(page.getByText(/1 \/ 2/)).toBeInTheDocument();
		});

		it('renders previous button disabled on page 1', async () => {
			render(ProcessList, defaultProps({ page: 1, totalElements: 10, processes: [mockProcess] }));
			const prevButton = page.getByRole('button', { name: /Anterior/ });
			await expect.element(prevButton).toBeDisabled();
		});

		it('renders next button enabled when there are more pages', async () => {
			render(
				ProcessList,
				defaultProps({
					processes: [mockProcess, mockProcessNoDesc, mockProcessClosed],
					page: 1,
					totalElements: 12
				})
			);
			const nextButton = page.getByRole('button', { name: /Siguiente/ });
			await expect.element(nextButton).toBeEnabled();
		});

		it('renders both prev and next buttons', async () => {
			render(ProcessList, defaultProps({ page: 2, totalElements: 15 }));
			await expect.element(page.getByRole('button', { name: /Anterior/ })).toBeInTheDocument();
			await expect.element(page.getByRole('button', { name: /Siguiente/ })).toBeInTheDocument();
		});

		it('next button is disabled on last page', async () => {
			render(ProcessList, defaultProps({ page: 2, totalElements: 10, processes: [mockProcess] }));
			const nextButton = page.getByRole('button', { name: /Siguiente/ });
			await expect.element(nextButton).toBeDisabled();
		});
	});
});
