import { page } from 'vitest/browser';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProcessHeader from './ProcessHeader.svelte';

describe('ProcessHeader', () => {
	beforeEach(() => {
		// navigator.clipboard is defined as a read-only property in the browser test
		// environment, so we override it with Object.defineProperty (vi.stubGlobal
		// + Object.assign fails because the setter is missing).
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText: vi.fn().mockResolvedValue(undefined) },
			writable: true,
			configurable: true
		});
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('renders process name in an H1', async () => {
		render(ProcessHeader, { name: 'Elecciones 2026', status: 'OPEN', scope: 'Nacional' });
		await expect
			.element(page.getByRole('heading', { level: 1, name: 'Elecciones 2026' }))
			.toBeInTheDocument();
	});

	it('renders the canonical Spanish label for OPEN status', async () => {
		render(ProcessHeader, { name: 'Test', status: 'OPEN', scope: 'Nacional' });
		await expect.element(page.getByText('Abierto', { exact: true })).toBeInTheDocument();
	});

	it('renders the canonical Spanish label for VOTING status', async () => {
		render(ProcessHeader, { name: 'Test', status: 'VOTING', scope: 'Nacional' });
		await expect.element(page.getByText('Votación', { exact: true })).toBeInTheDocument();
	});

	it('renders the canonical Spanish label for CLOSED status', async () => {
		render(ProcessHeader, { name: 'Test', status: 'CLOSED', scope: 'Nacional' });
		await expect.element(page.getByText('Cerrado', { exact: true })).toBeInTheDocument();
	});

	it('renders the back link to /procesos', async () => {
		render(ProcessHeader, { name: 'Test', status: 'OPEN', scope: 'Nacional' });
		const backLink = page.getByRole('link', { name: /Volver a procesos/ });
		await expect.element(backLink).toBeInTheDocument();
		await expect.element(backLink).toHaveAttribute('href', '/procesos');
	});

	it('renders the scope with the "Alcance:" label', async () => {
		render(ProcessHeader, { name: 'Test', status: 'OPEN', scope: 'Municipal' });
		await expect.element(page.getByText('Alcance:', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('Municipal', { exact: true })).toBeInTheDocument();
	});

	it('exposes the full scope as a tooltip on the scope element', async () => {
		render(ProcessHeader, { name: 'Test', status: 'OPEN', scope: 'Municipal' });
		const scopeElement = page.getByText('Municipal', { exact: true });
		await expect.element(scopeElement).toHaveAttribute('title', 'Municipal');
	});

	it('renders a copy-to-clipboard button when scope is provided', async () => {
		render(ProcessHeader, { name: 'Test', status: 'OPEN', scope: 'Municipal' });
		await expect.element(page.getByRole('button', { name: 'Copiar alcance' })).toBeInTheDocument();
	});

	it('does not render the Alcance row when scope is null', async () => {
		render(ProcessHeader, { name: 'Test', status: 'OPEN', scope: null });
		await expect.element(page.getByText('Alcance:', { exact: true })).not.toBeInTheDocument();
	});

	it('does not render the copy button when scope is null', async () => {
		render(ProcessHeader, { name: 'Test', status: 'OPEN', scope: null });
		await expect
			.element(page.getByRole('button', { name: 'Copiar alcance' }))
			.not.toBeInTheDocument();
	});

	it('clicking the copy button writes the scope to the clipboard', async () => {
		const writeTextSpy = navigator.clipboard.writeText as ReturnType<typeof vi.fn>;
		render(ProcessHeader, { name: 'Test', status: 'OPEN', scope: 'Provincial' });
		await page.getByRole('button', { name: 'Copiar alcance' }).click();
		expect(writeTextSpy).toHaveBeenCalledWith('Provincial');
	});

	it('clicking the copy button triggers the clipboard write (success state)', async () => {
		// Use fake timers so the 1500ms reset doesn't fire during the assertion.
		vi.useFakeTimers();
		const writeTextSpy = navigator.clipboard.writeText as ReturnType<typeof vi.fn>;
		render(ProcessHeader, { name: 'Test', status: 'OPEN', scope: 'Provincial' });
		await page.getByRole('button', { name: 'Copiar alcance' }).click();
		expect(writeTextSpy).toHaveBeenCalled();
	});
});

describe('description', () => {
	it('renders description text when provided', async () => {
		render(ProcessHeader, {
			name: 'Test',
			status: 'OPEN',
			scope: null,
			description: 'A great process'
		});
		await expect.element(page.getByText('A great process')).toBeInTheDocument();
	});

	it('does not render description when null', async () => {
		render(ProcessHeader, {
			name: 'Test',
			status: 'OPEN',
			scope: null,
			description: null
		});
		await expect.element(page.getByText('A great process')).not.toBeInTheDocument();
	});
});
