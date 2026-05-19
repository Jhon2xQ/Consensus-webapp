import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import EnrollmentForm from './EnrollmentForm.svelte';

describe('EnrollmentForm.svelte', () => {
	it('renders userId input field', async () => {
		render(EnrollmentForm);
		await expect.element(page.getByLabelText(/usuario/i)).toBeInTheDocument();
	});

	it('renders commitment input field', async () => {
		render(EnrollmentForm);
		await expect.element(page.getByLabelText(/compromiso/i)).toBeInTheDocument();
	});

	it('renders submit button with creation text', async () => {
		render(EnrollmentForm);
		await expect
			.element(page.getByRole('button', { name: /registrar inscripción/i }))
			.toBeInTheDocument();
	});

	it('renders cancel button when oncancel is provided', async () => {
		render(EnrollmentForm, { oncancel: () => {} });
		await expect
			.element(page.getByRole('button', { name: /cancelar/i }))
			.toBeInTheDocument();
	});

	it('does not render cancel button when oncancel is not provided', async () => {
		render(EnrollmentForm);
		const cancelButtons = page.getByRole('button', { name: /cancelar/i }).all();
		expect(cancelButtons.length).toBe(0);
	});

	it('shows error when userId is empty on submit', async () => {
		render(EnrollmentForm);
		await page.getByRole('button', { name: /registrar inscripción/i }).click();
		await expect
			.element(page.getByText('El ID de usuario es obligatorio'))
			.toBeInTheDocument();
	});

	it('shows error when commitment is empty on submit', async () => {
		render(EnrollmentForm);
		await page.getByLabelText(/usuario/i).fill('user-101');
		await page.getByRole('button', { name: /registrar inscripción/i }).click();
		await expect
			.element(page.getByText('El compromiso criptográfico es obligatorio'))
			.toBeInTheDocument();
	});

	it('shows error when commitment is too short', async () => {
		render(EnrollmentForm);
		await page.getByLabelText(/usuario/i).fill('user-101');
		await page.getByLabelText(/compromiso/i).fill('0xabc');
		await page.getByRole('button', { name: /registrar inscripción/i }).click();
		await expect
			.element(page.getByText('El compromiso debe tener al menos 10 caracteres'))
			.toBeInTheDocument();
	});

	// Note: valid-data submission is tested at the integration level (+page.svelte)
	// because the component relies on a parent <form use:enhance> wrapper.
	// Client-side validation logic is covered in enrollment-utils.spec.ts.
});
