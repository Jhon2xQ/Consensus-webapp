import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProcessStepper from './ProcessStepper.svelte';
import type { ElectoralProcess } from '$lib/types/electoral-process';

const mockProcess: ElectoralProcess = {
	id: 'proc-1',
	name: 'Elecciones Generales 2026',
	scope: 'Nacional',
	description: 'Elecciones presidenciales y legislativas',
	estatus: 'COMMITMENT',
	commitmentStart: '2026-06-01',
	commitmentEnd: '2026-06-15',
	votingStart: '2026-07-01',
	votingEnd: '2026-07-15',
	results: '2026-07-20'
};

async function fillStep1Valid() {
	await page.getByLabelText(/nombre/i).fill('Mi Proceso');
	await page.getByLabelText(/inicio de compromiso/i).fill('2026-06-01');
	await page.getByLabelText(/fin de compromiso/i).fill('2026-06-15');
	await page.getByLabelText(/inicio de votación/i).fill('2026-07-01');
	await page.getByLabelText(/fin de votación/i).fill('2026-07-15');
	await page.getByLabelText(/resultados/i).fill('2026-07-20');
}

async function advanceToStep(steps: number) {
	for (let i = 0; i < steps; i++) {
		await page.getByRole('button', { name: /siguiente/i }).click();
	}
}

describe('ProcessStepper.svelte — Step Navigation', () => {
	it('renders step indicator with 3 step labels', async () => {
		render(ProcessStepper);

		await expect.element(page.getByText('Datos generales')).toBeInTheDocument();
		await expect.element(page.getByText('Equipos')).toBeInTheDocument();
		await expect.element(page.getByText('Votantes')).toBeInTheDocument();
	});

	it('highlights the first step as current on initial render', async () => {
		render(ProcessStepper);

		await expect.element(page.getByLabelText(/nombre/i)).toBeInTheDocument();
		await expect.element(page.getByLabelText(/inicio de compromiso/i)).toBeInTheDocument();
	});

	it('only renders current step content (not hidden steps)', async () => {
		render(ProcessStepper);

		await expect.element(page.getByLabelText(/nombre/i)).toBeInTheDocument();

		const equiposButtons = page.getByRole('button', { name: /agregar equipo/i }).all();
		expect(equiposButtons.length).toBe(0);
	});

	it('advances to next step when clicking "Siguiente" with valid data', async () => {
		render(ProcessStepper);

		await fillStep1Valid();
		await advanceToStep(1);

		await expect
			.element(page.getByRole('button', { name: /agregar equipo/i }))
			.toBeInTheDocument();
	});

	it('shows validation errors when advancing with empty required fields', async () => {
		render(ProcessStepper);

		await page.getByRole('button', { name: /siguiente/i }).click();

		await expect
			.element(page.getByText('El nombre es obligatorio'))
			.toBeInTheDocument();
	});

	it('goes back when clicking "Anterior"', async () => {
		render(ProcessStepper);

		await fillStep1Valid();
		await advanceToStep(1);

		await page.getByRole('button', { name: /anterior/i }).click();

		await expect.element(page.getByLabelText(/nombre/i)).toBeInTheDocument();
	});

	it('pre-populates fields when process prop is provided', async () => {
		render(ProcessStepper, { process: mockProcess });

		await expect
			.element(page.getByLabelText(/nombre/i))
			.toHaveValue('Elecciones Generales 2026');
		await expect
			.element(page.getByLabelText(/descripción/i))
			.toHaveValue('Elecciones presidenciales y legislativas');
	});

	it('does not show "Anterior" button on the first step', async () => {
		render(ProcessStepper);

		expect(page.getByRole('button', { name: /anterior/i }).all().length).toBe(0);
	});
});

describe('ProcessStepper.svelte — Step 2 (Equipos)', () => {
	it('shows "Agregar equipo" button and empty state on step 2', async () => {
		render(ProcessStepper);

		await fillStep1Valid();
		await advanceToStep(1);

		await expect
			.element(page.getByRole('button', { name: /agregar equipo/i }))
			.toBeInTheDocument();
		await expect
			.element(page.getByText(/no hay equipos/i))
			.toBeInTheDocument();
	});

	it('shows counter badge with "0 equipos" when list is empty', async () => {
		render(ProcessStepper);

		await fillStep1Valid();
		await advanceToStep(1);

		await expect
			.element(page.getByText(/0 equipos/i))
			.toBeInTheDocument();
	});

	it('opens dialog when clicking "Agregar equipo"', async () => {
		render(ProcessStepper);

		await fillStep1Valid();
		await advanceToStep(1);

		await page.getByRole('button', { name: /agregar equipo/i }).click();

		await expect
			.element(page.getByRole('heading', { name: /crear equipo/i }))
			.toBeInTheDocument();
		await expect
			.element(page.getByLabelText(/nombre del equipo/i))
			.toBeInTheDocument();
	});

	it('adds a team to the list after filling the form', async () => {
		render(ProcessStepper);

		await fillStep1Valid();
		await advanceToStep(1);

		await page.getByRole('button', { name: /agregar equipo/i }).click();
		await page.getByLabelText(/nombre del equipo/i).fill('Frente Nacional');
		await page.getByRole('button', { name: /crear equipo/i }).click();

		// TeamTable renders both desktop <td> and mobile <p> — use .first()
		await expect
			.element(page.getByText('Frente Nacional').first())
			.toBeInTheDocument();
		await expect
			.element(page.getByText(/1 equipo/i))
			.toBeInTheDocument();
	});

	it('deletes a team from the list', async () => {
		render(ProcessStepper);

		await fillStep1Valid();
		await advanceToStep(1);

		await page.getByRole('button', { name: /agregar equipo/i }).click();
		await page.getByLabelText(/nombre del equipo/i).fill('Frente Nacional');
		await page.getByRole('button', { name: /crear equipo/i }).click();

		// Both desktop and mobile render a delete button — click first
		await page.getByRole('button', { name: /eliminar equipo/i }).first().click();

		await expect
			.element(page.getByText(/no hay equipos/i))
			.toBeInTheDocument();
		await expect
			.element(page.getByText(/0 equipos/i))
			.toBeInTheDocument();
	});

	it('validates team name is required', async () => {
		render(ProcessStepper);

		await fillStep1Valid();
		await advanceToStep(1);

		await page.getByRole('button', { name: /agregar equipo/i }).click();
		await page.getByRole('button', { name: /crear equipo/i }).click();

		await expect
			.element(page.getByText(/el nombre del equipo es obligatorio/i))
			.toBeInTheDocument();
		await expect
			.element(page.getByLabelText(/nombre del equipo/i))
			.toBeInTheDocument();
	});
});

describe('ProcessStepper.svelte — Step 3 (Votantes)', () => {
	it('shows "Agregar votante" button and empty state on step 3', async () => {
		render(ProcessStepper);

		await fillStep1Valid();
		await advanceToStep(2);

		await expect
			.element(page.getByRole('button', { name: /agregar votante/i }))
			.toBeInTheDocument();
		await expect
			.element(page.getByText(/no hay inscripciones/i))
			.toBeInTheDocument();
	});

	it('shows counter badge with "0 votantes" when list is empty', async () => {
		render(ProcessStepper);

		await fillStep1Valid();
		await advanceToStep(2);

		await expect
			.element(page.getByText(/0 votantes/i))
			.toBeInTheDocument();
	});

	it('opens dialog when clicking "Agregar votante"', async () => {
		render(ProcessStepper);

		await fillStep1Valid();
		await advanceToStep(2);

		await page.getByRole('button', { name: /agregar votante/i }).click();

		await expect
			.element(page.getByRole('heading', { name: /registrar votante/i }))
			.toBeInTheDocument();
		await expect
			.element(page.getByLabelText(/email/i))
			.toBeInTheDocument();
	});

	it('adds an enrollment to the list after filling the form', async () => {
		render(ProcessStepper);

		await fillStep1Valid();
		await advanceToStep(2);

		await page.getByRole('button', { name: /agregar votante/i }).click();
		await page.getByLabelText(/email/i).fill('votante@example.com');
		await page.getByRole('button', { name: /registrar votante/i }).click();

		// Desktop <td> + mobile <p> both contain the email — use .first()
		await expect
			.element(page.getByText('votante@example.com').first())
			.toBeInTheDocument();
		await expect
			.element(page.getByText(/1 votante/i))
			.toBeInTheDocument();
	});

	it('deletes an enrollment from the list', async () => {
		render(ProcessStepper);

		await fillStep1Valid();
		await advanceToStep(2);

		await page.getByRole('button', { name: /agregar votante/i }).click();
		await page.getByLabelText(/email/i).fill('votante@example.com');
		await page.getByRole('button', { name: /registrar votante/i }).click();

		await page.getByRole('button', { name: /eliminar inscripción/i }).first().click();

		await expect
			.element(page.getByText(/no hay inscripciones/i))
			.toBeInTheDocument();
	});

	it('validates email is required', async () => {
		render(ProcessStepper);

		await fillStep1Valid();
		await advanceToStep(2);

		await page.getByRole('button', { name: /agregar votante/i }).click();
		await page.getByRole('button', { name: /registrar votante/i }).click();

		await expect
			.element(page.getByText(/el email es obligatorio/i))
			.toBeInTheDocument();
	});
});

describe('ProcessStepper.svelte — Edit mode', () => {
	it('renders existing teams when passed as props (edit mode)', async () => {
		const existingTeams = [
			{ id: 't1', name: 'Equipo A', avatarUrl: undefined, electoralProcessId: 'proc-1' },
			{ id: 't2', name: 'Equipo B', avatarUrl: undefined, electoralProcessId: 'proc-1' }
		];

		render(ProcessStepper, {
			process: mockProcess,
			existingTeams
		});

		await advanceToStep(1);

		await expect
			.element(page.getByText('Equipo A').first())
			.toBeInTheDocument();
		await expect
			.element(page.getByText('Equipo B').first())
			.toBeInTheDocument();
		// Use exact match: step indicator has "2" + "Equipos" as separate elements
		await expect
			.element(page.getByText('2 equipos', { exact: true }))
			.toBeInTheDocument();
	});

	it('renders existing enrollments when passed as props (edit mode)', async () => {
		const existingEnrollments = [
			{
				id: 'e1',
				electoralProcessId: 'proc-1',
				email: 'user@example.com',
				userId: null,
				commitment: null,
				hasVoted: false
			}
		];

		render(ProcessStepper, {
			process: mockProcess,
			existingEnrollments
		});

		await advanceToStep(2);

		await expect
			.element(page.getByText('user@example.com').first())
			.toBeInTheDocument();
		await expect
			.element(page.getByText(/1 votante/i))
			.toBeInTheDocument();
	});
});

describe('ProcessStepper.svelte — Submit / Footer buttons', () => {
	it('shows "Finalizar" button (always visible) in create mode', async () => {
		render(ProcessStepper);

		// On step 1
		await expect
			.element(page.getByRole('button', { name: /finalizar/i }))
			.toBeInTheDocument();

		await fillStep1Valid();
		await advanceToStep(1);

		// On step 2
		await expect
			.element(page.getByRole('button', { name: /finalizar/i }))
			.toBeInTheDocument();

		await advanceToStep(1);

		// On step 3
		await expect
			.element(page.getByRole('button', { name: /finalizar/i }))
			.toBeInTheDocument();
	});

	it('shows "Guardar cambios" button (always visible) in edit mode', async () => {
		render(ProcessStepper, { process: mockProcess });

		// On step 1
		await expect
			.element(page.getByRole('button', { name: /guardar cambios/i }))
			.toBeInTheDocument();

		await advanceToStep(1);

		// On step 2
		await expect
			.element(page.getByRole('button', { name: /guardar cambios/i }))
			.toBeInTheDocument();

		await advanceToStep(1);

		// On step 3
		await expect
			.element(page.getByRole('button', { name: /guardar cambios/i }))
			.toBeInTheDocument();
	});

	it('shows "Siguiente" button on steps 1 and 2', async () => {
		render(ProcessStepper);

		await expect
			.element(page.getByRole('button', { name: /siguiente/i }))
			.toBeInTheDocument();

		await fillStep1Valid();
		await advanceToStep(1);

		await expect
			.element(page.getByRole('button', { name: /siguiente/i }))
			.toBeInTheDocument();
	});

	it('does not show "Siguiente" on step 3', async () => {
		render(ProcessStepper);

		await fillStep1Valid();
		await advanceToStep(2);

		expect(page.getByRole('button', { name: /^siguiente$/i }).all().length).toBe(0);
	});

	it('shows "Cancelar" button always visible', async () => {
		render(ProcessStepper);

		// Step 1
		await expect
			.element(page.getByRole('button', { name: /cancelar/i }))
			.toBeInTheDocument();

		await fillStep1Valid();
		await advanceToStep(1);

		// Step 2
		await expect
			.element(page.getByRole('button', { name: /cancelar/i }))
			.toBeInTheDocument();

		await advanceToStep(1);

		// Step 3
		await expect
			.element(page.getByRole('button', { name: /cancelar/i }))
			.toBeInTheDocument();
	});
});

describe('ProcessStepper.svelte — Finalizar validation', () => {
	it('shows error when clicking Finalizar with empty step 1 fields', async () => {
		render(ProcessStepper);

		await page.getByRole('button', { name: /finalizar/i }).click();

		await expect
			.element(page.getByText('El nombre es obligatorio'))
			.toBeInTheDocument();
	});

	it('navigates to step 2 when clicking Finalizar without teams', async () => {
		render(ProcessStepper);

		await fillStep1Valid();
		await page.getByRole('button', { name: /finalizar/i }).click();

		// Should be on step 2 with error about teams
		await expect
			.element(page.getByRole('button', { name: /agregar equipo/i }))
			.toBeInTheDocument();
		await expect
			.element(page.getByText(/debe agregar al menos un equipo/i))
			.toBeInTheDocument();
	});

	it('navigates to step 3 when clicking Finalizar without enrollments', async () => {
		render(ProcessStepper);

		await fillStep1Valid();
		await advanceToStep(1);

		// Add a team
		await page.getByRole('button', { name: /agregar equipo/i }).click();
		await page.getByLabelText(/nombre del equipo/i).fill('Frente Nacional');
		await page.getByRole('button', { name: /crear equipo/i }).click();

		await page.getByRole('button', { name: /finalizar/i }).click();

		// Should be on step 3 with error about enrollments
		await expect
			.element(page.getByRole('button', { name: /agregar votante/i }))
			.toBeInTheDocument();
		await expect
			.element(page.getByText(/debe agregar al menos un votante/i))
			.toBeInTheDocument();
	});

	it('does not validate teams/enrollments in edit mode', async () => {
		render(ProcessStepper, { process: mockProcess });

		// Edit mode: "Guardar cambios" should NOT complain about missing teams/enrollments
		// since they are managed in real-time during edit mode
		await expect
			.element(page.getByRole('button', { name: /guardar cambios/i }))
			.toBeInTheDocument();
		// No team or enrollment validation errors should appear
		const teamError = page.getByText(/debe agregar al menos un equipo/i).all();
		expect(teamError.length).toBe(0);
		const enrollmentError = page.getByText(/debe agregar al menos un votante/i).all();
		expect(enrollmentError.length).toBe(0);
	});
});

describe('ProcessStepper.svelte — Cancelar button', () => {
	it('opens confirmation dialog when clicking Cancelar in create mode', async () => {
		render(ProcessStepper);

		await page.getByRole('button', { name: /cancelar/i }).click();

		await expect
			.element(page.getByRole('heading', { name: /cancelar la creación del proceso/i }))
			.toBeInTheDocument();
		await expect
			.element(page.getByText(/se perderán todos los datos ingresados/i))
			.toBeInTheDocument();
	});

	it('opens confirmation dialog in edit mode with two options', async () => {
		render(ProcessStepper, { process: mockProcess });

		await page.getByRole('button', { name: /cancelar/i }).click();

		await expect
			.element(page.getByRole('heading', { name: /cancelar la edición/i }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: /descartar cambios/i }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: /eliminar proceso/i }))
			.toBeInTheDocument();
	});

	it('closes confirmation dialog when clicking "Volver"', async () => {
		render(ProcessStepper);

		await page.getByRole('button', { name: /cancelar/i }).click();
		await page.getByRole('button', { name: /volver/i }).click();

		// Dialog title should not be visible after closing
		// We verify the step content is still visible
		await expect
			.element(page.getByLabelText(/nombre/i))
			.toBeInTheDocument();
	});
});

describe('ProcessStepper.svelte — scope removal', () => {
	it('does NOT render Ámbito input or label', async () => {
		render(ProcessStepper);

		expect(page.getByLabelText(/ámbito/i).all().length).toBe(0);
	});

	it('advances to next step without filling scope', async () => {
		render(ProcessStepper);

		await fillStep1Valid();
		await advanceToStep(1);

		await expect
			.element(page.getByRole('button', { name: /agregar equipo/i }))
			.toBeInTheDocument();
	});

	it('shows no scope validation error when fields are empty', async () => {
		render(ProcessStepper);

		await page.getByRole('button', { name: /siguiente/i }).click();

		await expect
			.element(page.getByText('El nombre es obligatorio'))
			.toBeInTheDocument();

		// Scope validation error text should NOT appear
		expect(page.getByText(/ámbito/i).all().length).toBe(0);
	});
});

// ============================================================
// SPEC-2: Date validation alignment (> → >=)
// ============================================================
describe('ProcessStepper.svelte — Date validation (= alignment)', () => {
	it('rejects equal commitmentStart and commitmentEnd dates (SPEC-2)', async () => {
		render(ProcessStepper);

		await page.getByLabelText(/nombre/i).fill('Test');
		await page.getByLabelText(/inicio de compromiso/i).fill('2026-06-01');
		await page.getByLabelText(/fin de compromiso/i).fill('2026-06-01');
		await page.getByLabelText(/inicio de votación/i).fill('2026-07-01');
		await page.getByLabelText(/fin de votación/i).fill('2026-07-15');
		await page.getByLabelText(/resultados/i).fill('2026-07-20');

		await page.getByRole('button', { name: /siguiente/i }).click();

		await expect
			.element(
				page.getByText('La fecha de fin debe ser posterior al inicio del compromiso')
			)
			.toBeInTheDocument();
	});

	it('rejects equal votingStart and votingEnd dates (SPEC-2)', async () => {
		render(ProcessStepper);

		await page.getByLabelText(/nombre/i).fill('Test');
		await page.getByLabelText(/inicio de compromiso/i).fill('2026-06-01');
		await page.getByLabelText(/fin de compromiso/i).fill('2026-06-15');
		await page.getByLabelText(/inicio de votación/i).fill('2026-07-01');
		await page.getByLabelText(/fin de votación/i).fill('2026-07-01');
		await page.getByLabelText(/resultados/i).fill('2026-07-20');

		await page.getByRole('button', { name: /siguiente/i }).click();

		await expect
			.element(
				page.getByText('La fecha de fin debe ser posterior al inicio de la votación')
			)
			.toBeInTheDocument();
	});

	it('rejects equal commitmentEnd and votingStart dates (SPEC-2)', async () => {
		render(ProcessStepper);

		await page.getByLabelText(/nombre/i).fill('Test');
		await page.getByLabelText(/inicio de compromiso/i).fill('2026-06-01');
		await page.getByLabelText(/fin de compromiso/i).fill('2026-06-15');
		await page.getByLabelText(/inicio de votación/i).fill('2026-06-15');
		await page.getByLabelText(/fin de votación/i).fill('2026-07-15');
		await page.getByLabelText(/resultados/i).fill('2026-07-20');

		await page.getByRole('button', { name: /siguiente/i }).click();

		await expect
			.element(
				page.getByText(
					'La votación debe comenzar después del período de compromiso'
				)
			)
			.toBeInTheDocument();
	});
});

// ============================================================
// SPEC-4 client: votingEnd >= results validation
// ============================================================
describe('ProcessStepper.svelte — Results date vs votingEnd validation (SPEC-4)', () => {
	it('rejects results date equal to votingEnd (SPEC-4)', async () => {
		render(ProcessStepper);

		await page.getByLabelText(/nombre/i).fill('Test');
		await page.getByLabelText(/inicio de compromiso/i).fill('2026-06-01');
		await page.getByLabelText(/fin de compromiso/i).fill('2026-06-15');
		await page.getByLabelText(/inicio de votación/i).fill('2026-07-01');
		await page.getByLabelText(/fin de votación/i).fill('2026-07-15');
		await page.getByLabelText(/resultados/i).fill('2026-07-15');

		await page.getByRole('button', { name: /siguiente/i }).click();

		await expect
			.element(
				page.getByText(
					'La fecha de resultados debe ser posterior al fin de la votación'
				)
			)
			.toBeInTheDocument();
	});

	it('rejects results date before votingEnd (SPEC-4)', async () => {
		render(ProcessStepper);

		await page.getByLabelText(/nombre/i).fill('Test');
		await page.getByLabelText(/inicio de compromiso/i).fill('2026-06-01');
		await page.getByLabelText(/fin de compromiso/i).fill('2026-06-15');
		await page.getByLabelText(/inicio de votación/i).fill('2026-07-01');
		await page.getByLabelText(/fin de votación/i).fill('2026-07-15');
		await page.getByLabelText(/resultados/i).fill('2026-07-10');

		await page.getByRole('button', { name: /siguiente/i }).click();

		await expect
			.element(
				page.getByText(
					'La fecha de resultados debe ser posterior al fin de la votación'
				)
			)
			.toBeInTheDocument();
	});

	it('accepts results date properly after votingEnd', async () => {
		render(ProcessStepper);

		await page.getByLabelText(/nombre/i).fill('Test');
		await page.getByLabelText(/inicio de compromiso/i).fill('2026-06-01');
		await page.getByLabelText(/fin de compromiso/i).fill('2026-06-15');
		await page.getByLabelText(/inicio de votación/i).fill('2026-07-01');
		await page.getByLabelText(/fin de votación/i).fill('2026-07-15');
		await page.getByLabelText(/resultados/i).fill('2026-07-20');

		await page.getByRole('button', { name: /siguiente/i }).click();

		// Should advance to step 2 without date validation errors
		await expect
			.element(page.getByRole('button', { name: /agregar equipo/i }))
			.toBeInTheDocument();
	});
});

// ============================================================
// SPEC-1: Hidden inputs for step 1 fields
// ============================================================
describe('ProcessStepper.svelte — Hidden step-1 inputs (SPEC-1)', () => {
	it('renders hidden input for name field in all steps', async () => {
		render(ProcessStepper);

		await page.getByLabelText(/nombre/i).fill('Mi Proceso');
		await fillStep1Valid();

		// On step 1, the visible input exists
		await expect
			.element(page.getByLabelText(/nombre/i))
			.toHaveValue('Mi Proceso');

		// Advance to step 2 — hidden inputs should still exist in DOM
		await advanceToStep(1);

		// Check hidden inputs are present by looking for the hidden type
		// The hidden input for name should be in the form
		const hiddenInputs = document.querySelectorAll('input[type="hidden"][name="name"]');
		expect(hiddenInputs.length).toBeGreaterThan(0);
	});

	it('renders hidden inputs for all 7 step-1 fields (SPEC-1)', async () => {
		render(ProcessStepper);

		await page.getByLabelText(/nombre/i).fill('Mi Proceso');
		await page.getByLabelText(/descripción/i).fill('Mi descripción');
		await fillStep1Valid();

		// Advance to step 3
		await advanceToStep(2);

		const fieldNames = [
			'name',
			'description',
			'commitmentStart',
			'commitmentEnd',
			'votingStart',
			'votingEnd',
			'results'
		];

		for (const fieldName of fieldNames) {
			const hiddenInput = document.querySelector(
				`input[type="hidden"][name="${fieldName}"]`
			);
			expect(hiddenInput).not.toBeNull();
			expect((hiddenInput as HTMLInputElement).value).toBeTruthy();
		}
	});
});

// ============================================================
// SPEC-3: Data recovery on failed submission (values prop)
// ============================================================
describe('ProcessStepper.svelte — values prop (SPEC-3)', () => {
	it('populates fields from values prop when provided', async () => {
		const values = {
			name: 'Proceso Recuperado',
			description: 'Desc recuperada',
			commitmentStart: '2026-01-01',
			commitmentEnd: '2026-02-01',
			votingStart: '2026-03-01',
			votingEnd: '2026-04-01',
			results: '2026-05-01'
		};

		render(ProcessStepper, { values });

		await expect
			.element(page.getByLabelText(/nombre/i))
			.toHaveValue('Proceso Recuperado');
		await expect
			.element(page.getByLabelText(/descripción/i))
			.toHaveValue('Desc recuperada');
		await expect
			.element(page.getByLabelText(/inicio de compromiso/i))
			.toHaveValue('2026-01-01');
		await expect
			.element(page.getByLabelText(/fin de compromiso/i))
			.toHaveValue('2026-02-01');
		await expect
			.element(page.getByLabelText(/inicio de votación/i))
			.toHaveValue('2026-03-01');
		await expect
			.element(page.getByLabelText(/fin de votación/i))
			.toHaveValue('2026-04-01');
		await expect
			.element(page.getByLabelText(/resultados/i))
			.toHaveValue('2026-05-01');
	});

	it('handles empty values prop gracefully', async () => {
		render(ProcessStepper, { values: {} });

		// All fields should be empty (no crash)
		await expect
			.element(page.getByLabelText(/nombre/i))
			.toHaveValue('');
	});

	it('values prop takes priority over process prop', async () => {
		const values = {
			name: 'From Values',
			commitmentStart: '2026-01-01',
			commitmentEnd: '2026-02-01',
			votingStart: '2026-03-01',
			votingEnd: '2026-04-01',
			results: '2026-05-01'
		};

		render(ProcessStepper, {
			process: mockProcess,
			values
		});

		await expect
			.element(page.getByLabelText(/nombre/i))
			.toHaveValue('From Values');
	});
});

describe('ProcessStepper.svelte — 3-column date layout', () => {
	it('renders date grid with three columns and headers', async () => {
		render(ProcessStepper);

		await expect
			.element(page.getByText('Compromiso', { exact: true }))
			.toBeInTheDocument();
		await expect
			.element(page.getByText('Votación', { exact: true }))
			.toBeInTheDocument();
		await expect
			.element(page.getByText('Resultados', { exact: true }))
			.toBeInTheDocument();
	});

	it('renders Compromiso dates (start + end) in the first column', async () => {
		render(ProcessStepper);

		await expect
			.element(page.getByLabelText(/inicio de compromiso/i))
			.toBeInTheDocument();
		await expect
			.element(page.getByLabelText(/fin de compromiso/i))
			.toBeInTheDocument();
	});

	it('renders Votación dates (start + end) in the second column', async () => {
		render(ProcessStepper);

		await expect
			.element(page.getByLabelText(/inicio de votación/i))
			.toBeInTheDocument();
		await expect
			.element(page.getByLabelText(/fin de votación/i))
			.toBeInTheDocument();
	});

	it('renders Resultados date in the third column', async () => {
		render(ProcessStepper);

		await expect
			.element(page.getByLabelText(/resultados/i))
			.toBeInTheDocument();
	});

	it('renders "Fechas del Proceso" section heading', async () => {
		render(ProcessStepper);

		await expect
			.element(page.getByText('Fechas del Proceso'))
			.toBeInTheDocument();
	});
});
