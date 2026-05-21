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
	description: null,
	estatus: 'COMMITMENT',
	commitmentStart: '2026-03-01',
	commitmentEnd: '2026-04-30',
	votingStart: '2026-06-15',
	votingEnd: '2026-06-20',
	results: '2026-06-25'
};

const mockProcess2: ElectoralProcess = {
	id: '2',
	name: 'Elecciones Provinciales Buenos Aires',
	scope: 'Provincial',
	description: null,
	estatus: 'COMMITMENT',
	commitmentStart: '2026-04-01',
	commitmentEnd: '2026-05-15',
	votingStart: '2026-07-01',
	votingEnd: '2026-07-05',
	results: '2026-07-10'
};

describe('Procesos +page.svelte', () => {
	it('shows loading skeleton when data is undefined', async () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		render(ProcesosPage, { data: undefined as any });

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
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			data: { processes: [], error: 'Error al cargar los procesos. Intentalo de nuevo más tarde.', user: undefined } as any
		});

		// Error message visible
		await expect
			.element(page.getByText('Error al cargar los procesos. Intentalo de nuevo más tarde.'))
			.toBeInTheDocument();

		// Retry button visible
		await expect.element(page.getByText('Reintentar')).toBeInTheDocument();

		// Grid should NOT be visible (no process names)
		await expect.element(page.getByText('Elecciones Nacionales 2026')).not.toBeInTheDocument();
	});

	it('shows empty state with create process link', async () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		render(ProcesosPage, { data: { processes: [], error: null, user: undefined } as any });

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

	it('renders grid with process cards when data has processes', async () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		render(ProcesosPage, {
			data: { processes: [mockProcess1, mockProcess2], error: null, user: undefined } as any
		});

		// Both process names should be visible
		await expect.element(page.getByText('Elecciones Nacionales 2026')).toBeInTheDocument();
		await expect.element(page.getByText('Elecciones Provinciales Buenos Aires')).toBeInTheDocument();

		// Status badge text appears (at least once — both processes share 'COMMITMENT' status)
		await expect.element(page.getByText('Compromiso').first()).toBeInTheDocument();

		// Scaffold (Nacional · ...) appears in card
		await expect.element(page.getByText(/Nacional/).first()).toBeInTheDocument();

		// Error state should NOT be visible
		await expect.element(page.getByText('Reintentar')).not.toBeInTheDocument();
	});
});
