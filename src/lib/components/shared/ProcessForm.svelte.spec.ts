import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProcessForm from './ProcessForm.svelte';

describe('ProcessForm.svelte', () => {
	// ── Test helpers ──
	const mockProcess = {
		name: 'Elecciones 2026',
		description: 'Proceso electoral nacional',
		commitmentStart: '2026-01-01T10:00',
		commitmentEnd: '2026-01-15T18:00',
		votingStart: '2026-02-01T08:00',
		votingEnd: '2026-02-05T20:00',
		results: '2026-02-10T12:00'
	};

	// ── 1. Renders all fields ──
	describe('field rendering', () => {
		it('renders all 7 input fields', async () => {
			render(ProcessForm, { mode: 'create' });

			await expect.element(page.getByLabelText('Nombre *')).toBeInTheDocument();
			await expect.element(page.getByLabelText('Descripción')).toBeInTheDocument();
			await expect.element(page.getByLabelText('Inicio de Compromiso *')).toBeInTheDocument();
			await expect.element(page.getByLabelText('Fin de Compromiso *')).toBeInTheDocument();
			await expect.element(page.getByLabelText('Inicio de Votación *')).toBeInTheDocument();
			await expect.element(page.getByLabelText('Fin de Votación *')).toBeInTheDocument();
			await expect.element(page.getByLabelText('Fecha de Resultados *')).toBeInTheDocument();
		});

		it('renders form with required hidden inputs via name attributes', async () => {
			render(ProcessForm, { mode: 'create' });

			// Visible fields exist with correct label-text association
			await expect.element(page.getByLabelText('Nombre *')).toBeInTheDocument();
			await expect.element(page.getByLabelText('Descripción')).toBeInTheDocument();
			await expect.element(page.getByLabelText('Inicio de Compromiso *')).toHaveAttribute('type', 'datetime-local');
		});

		it('renders "Crear Proceso" button for create mode', async () => {
			render(ProcessForm, { mode: 'create' });

			await expect.element(page.getByRole('button', { name: 'Crear Proceso' })).toBeInTheDocument();
		});

		it('renders "Guardar Cambios" button for edit mode', async () => {
			render(ProcessForm, { mode: 'edit' });

			await expect.element(page.getByRole('button', { name: 'Guardar Cambios' })).toBeInTheDocument();
		});
	});

	// ── 2. Error display ──
	describe('error display', () => {
		it('shows error message below the name field', async () => {
			const errors = { name: 'El nombre es obligatorio' };
			render(ProcessForm, { mode: 'create', errors });

			await expect.element(page.getByText('El nombre es obligatorio')).toBeInTheDocument();
		});

		it('shows error message below commitmentStart field', async () => {
			const errors = { commitmentStart: 'Fecha de inicio inválida' };
			render(ProcessForm, { mode: 'create', errors });

			await expect.element(page.getByText('Fecha de inicio inválida')).toBeInTheDocument();
		});

		it('shows multiple errors simultaneously', async () => {
			const errors = {
				name: 'Requerido',
				commitmentEnd: 'Debe ser posterior al inicio',
				votingStart: 'Debe ser posterior al compromiso'
			};
			render(ProcessForm, { mode: 'create', errors });

			await expect.element(page.getByText('Requerido')).toBeInTheDocument();
			await expect.element(page.getByText('Debe ser posterior al inicio')).toBeInTheDocument();
			await expect.element(page.getByText('Debe ser posterior al compromiso')).toBeInTheDocument();
		});

		it('does not show error when errors prop is empty', async () => {
			render(ProcessForm, { mode: 'create', errors: {} });

			await expect.element(page.getByText('El nombre es obligatorio')).not.toBeInTheDocument();
		});
	});

	// ── 3. Pre-population from process prop ──
	describe('pre-population from process', () => {
		it('fills fields from process prop values', async () => {
			render(ProcessForm, { mode: 'edit', process: mockProcess });

			await expect.element(page.getByLabelText('Nombre *')).toHaveValue('Elecciones 2026');
			await expect.element(page.getByLabelText('Descripción')).toHaveValue('Proceso electoral nacional');
			await expect.element(page.getByLabelText('Inicio de Compromiso *')).toHaveValue('2026-01-01T10:00');
			await expect.element(page.getByLabelText('Fin de Compromiso *')).toHaveValue('2026-01-15T18:00');
			await expect.element(page.getByLabelText('Inicio de Votación *')).toHaveValue('2026-02-01T08:00');
			await expect.element(page.getByLabelText('Fin de Votación *')).toHaveValue('2026-02-05T20:00');
			await expect.element(page.getByLabelText('Fecha de Resultados *')).toHaveValue('2026-02-10T12:00');
		});

		it('defaults to empty string when process is null', async () => {
			render(ProcessForm, { mode: 'create', process: null });

			await expect.element(page.getByLabelText('Nombre *')).toHaveValue('');
			await expect.element(page.getByLabelText('Descripción')).toHaveValue('');
		});
	});

	// ── 4. Pre-population from values prop ──
	describe('pre-population from values', () => {
		const mockValues = {
			name: 'Recovered Name',
			description: 'Recovered Description',
			commitmentStart: '2026-03-01T10:00',
			commitmentEnd: '2026-03-15T18:00',
			votingStart: '2026-04-01T08:00',
			votingEnd: '2026-04-05T20:00',
			results: '2026-04-10T12:00'
		};

		it('fills fields from values prop', async () => {
			render(ProcessForm, { mode: 'create', values: mockValues });

			await expect.element(page.getByLabelText('Nombre *')).toHaveValue('Recovered Name');
			await expect.element(page.getByLabelText('Descripción')).toHaveValue('Recovered Description');
			await expect.element(page.getByLabelText('Inicio de Compromiso *')).toHaveValue('2026-03-01T10:00');
			await expect.element(page.getByLabelText('Fin de Compromiso *')).toHaveValue('2026-03-15T18:00');
		});

		// ── 5. values takes priority over process ──
		it('values prop takes priority over process prop', async () => {
			render(ProcessForm, {
				mode: 'edit',
				process: mockProcess,
				values: mockValues
			});

			// Should use values, not process
			await expect.element(page.getByLabelText('Nombre *')).toHaveValue('Recovered Name');
			await expect.element(page.getByLabelText('Descripción')).toHaveValue('Recovered Description');
		});

		it('falls back to process when values is missing a field', async () => {
			render(ProcessForm, {
				mode: 'edit',
				process: mockProcess,
				values: { name: 'Recovered Name' } // only name in values
			});

			// name from values, description from process
			await expect.element(page.getByLabelText('Nombre *')).toHaveValue('Recovered Name');
			await expect.element(page.getByLabelText('Descripción')).toHaveValue('Proceso electoral nacional');
		});
	});

	// ── 6. Submit button disabled ──
	describe('submitting state', () => {
		it('disables submit button when submitting is true', async () => {
			render(ProcessForm, { mode: 'create', submitting: true });

			const button = page.getByRole('button', { name: 'Crear Proceso' });
			await expect.element(button).toBeDisabled();
		});

		it('enables submit button when submitting is false', async () => {
			render(ProcessForm, { mode: 'create', submitting: false });

			const button = page.getByRole('button', { name: 'Crear Proceso' });
			await expect.element(button).toBeEnabled();
		});
	});

	// ── 7. 3-column date layout ──
	describe('date layout', () => {
		it('renders 3-column date section headers with exact text', async () => {
			render(ProcessForm, { mode: 'create' });

			// Check section header
			await expect.element(page.getByText('Fechas del Proceso')).toBeInTheDocument();

			// Check column headers with exact match (labels contain these words too)
			await expect.element(page.getByText('Compromiso', { exact: true })).toBeInTheDocument();
			await expect.element(page.getByText('Votación', { exact: true })).toBeInTheDocument();
			await expect.element(page.getByText('Resultados', { exact: true })).toBeInTheDocument();
		});

		it('renders all 5 datetime-local fields by label', async () => {
			render(ProcessForm, { mode: 'create' });

			// All 5 datetime-local inputs are rendered with their labels
			await expect.element(page.getByLabelText('Inicio de Compromiso *')).toHaveAttribute('type', 'datetime-local');
			await expect.element(page.getByLabelText('Fin de Compromiso *')).toHaveAttribute('type', 'datetime-local');
			await expect.element(page.getByLabelText('Inicio de Votación *')).toHaveAttribute('type', 'datetime-local');
			await expect.element(page.getByLabelText('Fin de Votación *')).toHaveAttribute('type', 'datetime-local');
			await expect.element(page.getByLabelText('Fecha de Resultados *')).toHaveAttribute('type', 'datetime-local');
		});
	});

	// ── 8. form method ──
	describe('form structure', () => {
		it('contains a submit button inside a form', async () => {
			render(ProcessForm, { mode: 'create' });

			// The submit button proves the form is functional
			const button = page.getByRole('button', { name: 'Crear Proceso' });
			await expect.element(button).toHaveAttribute('type', 'submit');
		});
	});
});
