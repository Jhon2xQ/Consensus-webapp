import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import EnrollmentTable from './EnrollmentTable.svelte';
import type { Enrollment } from '$lib/types/enrollment';

const mockEnrollments: Enrollment[] = [
	{
		id: 'enr-1',
		electoralProcessId: '1',
		userId: 'user-101',
		commitment: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
		hasVoted: false
	},
	{
		id: 'enr-2',
		electoralProcessId: '1',
		userId: 'user-102',
		commitment: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab',
		hasVoted: true
	}
];

describe('EnrollmentTable.svelte', () => {
	it('renders a semantic table', async () => {
		render(EnrollmentTable, { enrollments: mockEnrollments });
		await expect.element(page.getByRole('table')).toBeInTheDocument();
	});

	it('renders the correct number of data rows', async () => {
		render(EnrollmentTable, { enrollments: mockEnrollments });
		// header row + 2 data rows = 3 total
		const rows = page.getByRole('row').all();
		expect(rows.length).toBe(3);
	});

	it('displays userId for each enrollment', async () => {
		render(EnrollmentTable, { enrollments: mockEnrollments });
		// Use cell role to target desktop table specifically
		await expect.element(page.getByRole('cell', { name: 'user-101' })).toBeInTheDocument();
		await expect.element(page.getByRole('cell', { name: 'user-102' })).toBeInTheDocument();
	});

	it('displays truncated commitment', async () => {
		render(EnrollmentTable, { enrollments: mockEnrollments });
		await expect.element(page.getByText(/0x1a2b3c4d5e6f7890/).first()).toBeInTheDocument();
	});

	it('displays voted badge for hasVoted=true', async () => {
		render(EnrollmentTable, { enrollments: mockEnrollments });
		await expect.element(page.getByText('Sí').first()).toBeInTheDocument();
	});

	it('displays not-voted badge for hasVoted=false', async () => {
		render(EnrollmentTable, { enrollments: mockEnrollments });
		await expect.element(page.getByText('No').first()).toBeInTheDocument();
	});

	it('shows empty state when no enrollments', async () => {
		render(EnrollmentTable, { enrollments: [] });
		await expect
			.element(page.getByText('No hay inscripciones registradas'))
			.toBeInTheDocument();
	});

	it('does not render table when empty', async () => {
		render(EnrollmentTable, { enrollments: [] });
		const tables = page.getByRole('table').all();
		expect(tables.length).toBe(0);
	});
});
