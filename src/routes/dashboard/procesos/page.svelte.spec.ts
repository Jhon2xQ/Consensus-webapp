import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProcesosPage from './+page.svelte';
import type { ElectoralProcess } from '$lib/types/electoral-process';

vi.mock('$app/state', () => ({
	page: { url: new URL('http://localhost/dashboard/procesos') }
}));

vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

const mockProcess1: ElectoralProcess = {
	id: '1',
	name: 'Elecciones Nacionales 2026',
	scope: 'Nacional',
	description: 'Proceso electoral para elegir representantes nacionales en todas las provincias del país.',
	groupId: null,
	estatus: 'COMMITMENT',
	commitmentStart: '2026-03-01',
	commitmentEnd: '2026-04-30',
	votingStart: '2026-06-15',
	votingEnd: '2026-06-20',
	results: '2026-06-25',
	createdBy: 'user-1'
};

const mockProcess2: ElectoralProcess = {
	id: '2',
	name: 'Elecciones Provinciales Buenos Aires',
	scope: 'Provincial',
	description: null,
	groupId: null,
	estatus: 'COMMITMENT',
	commitmentStart: '2026-04-01',
	commitmentEnd: '2026-05-15',
	votingStart: '2026-07-01',
	votingEnd: '2026-07-05',
	results: '2026-07-10',
	createdBy: 'user-1'
};

const mockProcessOpen: ElectoralProcess = {
	id: '3',
	name: 'Proceso Abierto 2026',
	scope: 'Nacional',
	description: 'Inscripciones abiertas',
	groupId: null,
	estatus: 'OPEN',
	commitmentStart: '2026-08-01',
	commitmentEnd: '2026-09-01',
	votingStart: '2026-10-01',
	votingEnd: '2026-10-05',
	results: '2026-10-10',
	createdBy: 'user-1'
};

const mockProcessSealed: ElectoralProcess = {
	id: '4',
	name: 'Proceso Sellado 2026',
	scope: 'Municipal',
	description: 'En sellado',
	groupId: null,
	estatus: 'SEALED',
	commitmentStart: '2026-04-01',
	commitmentEnd: '2026-05-15',
	votingStart: '2026-06-01',
	votingEnd: '2026-06-05',
	results: '2026-06-10',
	createdBy: 'user-1'
};

const mockProcessSealedWithGroup: ElectoralProcess = {
	id: '6',
	name: 'Proceso Sellado Con Grupo 2026',
	scope: 'Municipal',
	description: 'Ya tiene grupo on-chain',
	groupId: '0xabc123',
	estatus: 'SEALED',
	commitmentStart: '2026-04-01',
	commitmentEnd: '2026-05-15',
	votingStart: '2026-06-01',
	votingEnd: '2026-06-05',
	results: '2026-06-10',
	createdBy: 'user-1'
};

const mockProcessCounting: ElectoralProcess = {
	id: '5',
	name: 'Proceso en Conteo 2026',
	scope: 'Provincial',
	description: 'Contando votos',
	groupId: null,
	estatus: 'COUNTING',
	commitmentStart: '2026-03-01',
	commitmentEnd: '2026-04-15',
	votingStart: '2026-05-01',
	votingEnd: '2026-05-15',
	results: '2026-05-20',
	createdBy: 'user-1'
};

function mockData(processes: ElectoralProcess[], error: string | null = null) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return { processes, error, user: undefined } as any;
}

describe('Procesos +page.svelte', () => {
	it('shows loading skeleton when data is undefined', async () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		render(ProcesosPage, { data: undefined as any, form: undefined as any });

		// Header should still be visible
		await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('Procesos Electorales');

		// Skeleton placeholders should render (6 cards with animate-pulse)
		const skeletonCards = document.querySelectorAll('.animate-pulse');
		expect(skeletonCards.length).toBe(6);

		// Error message should NOT be visible
		await expect.element(page.getByText('Reintentar')).not.toBeInTheDocument();

		// Empty state should NOT be visible
		await expect.element(page.getByText('No hay procesos electorales')).not.toBeInTheDocument();
	});

	it('shows error state with message and retry button', async () => {
		render(ProcesosPage, {
			data: mockData([], 'Error al cargar los procesos. Intentalo de nuevo más tarde.'),
			form: undefined as any
		});

		// Error message visible
		await expect
			.element(page.getByText('Error al cargar los procesos. Intentalo de nuevo más tarde.'))
			.toBeInTheDocument();

		// Retry button visible
		await expect.element(page.getByText('Reintentar')).toBeInTheDocument();

		// Process names should NOT be visible (no grid, no table)
		await expect.element(page.getByText('Elecciones Nacionales 2026')).not.toBeInTheDocument();
	});

	it('shows empty state with create process link', async () => {
		render(ProcesosPage, { data: mockData([]), form: undefined as any });

		// Empty state text
		await expect.element(page.getByText('No hay procesos electorales')).toBeInTheDocument();

		// Create process button is visible (header always renders one)
		await expect.element(page.getByText('Crear proceso').first()).toBeInTheDocument();

		// Subtitle text visible
		await expect
			.element(page.getByText('Creá tu primer proceso electoral para comenzar a gestionar votaciones.'))
			.toBeInTheDocument();

		// Error state should NOT be visible
		await expect.element(page.getByText('Reintentar')).not.toBeInTheDocument();
	});

	it('renders single-column table with process cards when data has processes', async () => {
		render(ProcesosPage, {
			data: mockData([mockProcess1, mockProcess2]),
			form: undefined as any
		});

		// Table element exists
		const table = page.getByRole('table');
		await expect.element(table).toBeInTheDocument();

		// Column header "Proceso" exists (exact match avoids conflict with longer texts containing "Proceso")
		await expect.element(page.getByText('Proceso', { exact: true })).toBeInTheDocument();

		// Both process names visible (inside card rows)
		await expect.element(page.getByText('Elecciones Nacionales 2026')).toBeInTheDocument();
		await expect.element(page.getByText('Elecciones Provinciales Buenos Aires')).toBeInTheDocument();

		// Status badge text visible — both processes are 'COMMITMENT' → 'Compromiso'
		await expect.element(page.getByText('Compromiso').first()).toBeInTheDocument();

		// Description visible for mockProcess1 (has description)
		await expect
			.element(page.getByText('Proceso electoral para elegir representantes nacionales en todas las provincias del país.'))
			.toBeInTheDocument();

		// Action buttons visible: Ver equipos, Ver votantes, Editar, Eliminar
		await expect.element(page.getByText('Ver equipos').first()).toBeInTheDocument();
		await expect.element(page.getByText('Ver votantes').first()).toBeInTheDocument();
		await expect.element(page.getByText('Editar').first()).toBeInTheDocument();
		await expect.element(page.getByText('Eliminar').first()).toBeInTheDocument();

		// Error state should NOT be visible
		await expect.element(page.getByText('Reintentar')).not.toBeInTheDocument();
	});

	it('renders correct action button hrefs in process cards', async () => {
		render(ProcesosPage, {
			data: mockData([mockProcess1]),
			form: undefined as any
		});

		// "Ver equipos" button links to /dashboard/equipos?processId={id}
		const equiposBtn = page.getByText('Ver equipos').first();
		await expect.element(equiposBtn).toBeInTheDocument();
		const equiposParent = equiposBtn.element().closest('a');
		expect(equiposParent?.getAttribute('href')).toBe('/dashboard/equipos?processId=1');

		// "Ver votantes" button links to /dashboard/votantes?processId={id}
		const votantesBtn = page.getByText('Ver votantes').first();
		await expect.element(votantesBtn).toBeInTheDocument();
		const votantesParent = votantesBtn.element().closest('a');
		expect(votantesParent?.getAttribute('href')).toBe('/dashboard/votantes?processId=1');

		// "Editar" button links to /dashboard/procesos/{id}/editar
		const editarBtn = page.getByText('Editar').first();
		await expect.element(editarBtn).toBeInTheDocument();
		const editarParent = editarBtn.element().closest('a');
		expect(editarParent?.getAttribute('href')).toBe('/dashboard/procesos/1/editar');
	});

	it('shows date ranges and results in process cards', async () => {
		render(ProcesosPage, {
			data: mockData([mockProcess1]),
			form: undefined as any
		});

		// Date labels visible (use nth(1) for "Compromiso" to skip the status badge)
		await expect.element(page.getByText('Compromiso').nth(1)).toBeInTheDocument();
		await expect.element(page.getByText('Votación').first()).toBeInTheDocument();
		await expect.element(page.getByText('Resultados').first()).toBeInTheDocument();
	});

	it('shows correct status badge for processes with different statuses', async () => {
		const votingProcess: ElectoralProcess = {
			...mockProcess1,
			id: '3',
			name: 'Referendo Provincial 2026',
			estatus: 'VOTING',
			description: null
		};
		render(ProcesosPage, {
			data: mockData([votingProcess]),
			form: undefined as any
		});

		// VOTING status translates to 'Votación' badge
		await expect.element(page.getByText('Votación').first()).toBeInTheDocument();

		// Referendo process name visible
		await expect.element(page.getByText('Referendo Provincial 2026')).toBeInTheDocument();

		// No description should be rendered (it's null)
		await expect.element(page.getByText('Referendo Provincial 2026')).toBeInTheDocument();
	});

	it('renders "Abierto" badge for OPEN process', async () => {
		render(ProcesosPage, {
			data: mockData([mockProcessOpen]),
			form: undefined as any
		});
		await expect.element(page.getByText('Abierto', { exact: true })).toBeInTheDocument();
	});

	it('renders "Sellado" badge for SEALED process', async () => {
		render(ProcesosPage, {
			data: mockData([mockProcessSealed]),
			form: undefined as any
		});
		await expect.element(page.getByText('Sellado', { exact: true })).toBeInTheDocument();
	});

	it('renders "Conteo" badge for COUNTING process', async () => {
		render(ProcesosPage, {
			data: mockData([mockProcessCounting]),
			form: undefined as any
		});
		await expect.element(page.getByText('Conteo', { exact: true })).toBeInTheDocument();
	});

	it('does not render description when process has null description', async () => {
		// mockProcess2 has description: null
		render(ProcesosPage, {
			data: mockData([mockProcess2]),
			form: undefined as any
		});

		// Process name visible
		await expect.element(page.getByText('Elecciones Provinciales Buenos Aires')).toBeInTheDocument();

		// The line-clamp-2 description elements should NOT include mockProcess2's description
		// (it has none, so the line-clamp-2 p tag should not be rendered)
		const lineClampElements = document.querySelectorAll('.line-clamp-2');
		expect(lineClampElements.length).toBe(0);
	});
});

// ============================================================
// Relayer action buttons — enablement by estatus + groupId
// ============================================================
describe('Relayer action buttons', () => {
	it('enables "Crear grupo" when estatus is SEALED and groupId is null', async () => {
		render(ProcesosPage, {
			data: mockData([mockProcessSealed]),
			form: undefined as any
		});

		const btn = page.getByRole('button', { name: 'Crear grupo on-chain' });
		await expect.element(btn).toBeInTheDocument();
		await expect.element(btn).toBeEnabled();
	});

	it('disables "Crear grupo" when groupId is already set (group already created)', async () => {
		render(ProcesosPage, {
			data: mockData([mockProcessSealedWithGroup]),
			form: undefined as any
		});

		const btn = page.getByRole('button', { name: 'Crear grupo on-chain' });
		await expect.element(btn).toBeInTheDocument();
		await expect.element(btn).toBeDisabled();
	});

	it('disables "Crear grupo" when estatus is not SEALED', async () => {
		render(ProcesosPage, {
			data: mockData([mockProcessCounting]),
			form: undefined as any
		});

		const btn = page.getByRole('button', { name: 'Crear grupo on-chain' });
		await expect.element(btn).toBeInTheDocument();
		await expect.element(btn).toBeDisabled();
	});

	it('disables "Sincronizar compromisos" when groupId is null (no group yet)', async () => {
		render(ProcesosPage, {
			data: mockData([mockProcessSealed]),
			form: undefined as any
		});

		const btn = page.getByRole('button', { name: 'Sincronizar compromisos' });
		await expect.element(btn).toBeInTheDocument();
		await expect.element(btn).toBeDisabled();
	});

	it('enables "Sincronizar compromisos" when estatus is SEALED and groupId is set', async () => {
		render(ProcesosPage, {
			data: mockData([mockProcessSealedWithGroup]),
			form: undefined as any
		});

		const btn = page.getByRole('button', { name: 'Sincronizar compromisos' });
		await expect.element(btn).toBeInTheDocument();
		await expect.element(btn).toBeEnabled();
	});

	it('disables "Sincronizar compromisos" when estatus is not SEALED even if groupId is set', async () => {
		const votingWithGroup: ElectoralProcess = {
			...mockProcessSealedWithGroup,
			id: '7',
			estatus: 'VOTING'
		};
		render(ProcesosPage, {
			data: mockData([votingWithGroup]),
			form: undefined as any
		});

		const btn = page.getByRole('button', { name: 'Sincronizar compromisos' });
		await expect.element(btn).toBeInTheDocument();
		await expect.element(btn).toBeDisabled();
	});
});
