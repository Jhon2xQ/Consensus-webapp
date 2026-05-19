import { describe, it, expect } from 'vitest';
import {
	getEnrollmentsByProcessId,
	truncateCommitment,
	validateEnrollmentForm
} from './enrollment-utils';
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
		hasVoted: false
	},
	{
		id: 'enr-3',
		electoralProcessId: '2',
		userId: 'user-201',
		commitment: '0x4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
		hasVoted: true
	}
];

describe('enrollment-utils', () => {
	describe('getEnrollmentsByProcessId', () => {
		it('returns enrollments matching the given process id', () => {
			const result = getEnrollmentsByProcessId(mockEnrollments, '1');
			expect(result).toHaveLength(2);
			expect(result[0].id).toBe('enr-1');
			expect(result[1].id).toBe('enr-2');
		});

		it('returns empty array when no enrollments match', () => {
			const result = getEnrollmentsByProcessId(mockEnrollments, '999');
			expect(result).toHaveLength(0);
		});

		it('returns a single enrollment when only one matches', () => {
			const result = getEnrollmentsByProcessId(mockEnrollments, '2');
			expect(result).toHaveLength(1);
			expect(result[0].userId).toBe('user-201');
		});
	});

	describe('truncateCommitment', () => {
		it('returns full commitment when shorter than max length', () => {
			expect(truncateCommitment('0xabc', 20)).toBe('0xabc');
		});

		it('truncates long commitment with ellipsis', () => {
			const long = '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890';
			const result = truncateCommitment(long, 16);
			expect(result).toHaveLength(16);
			expect(result).toBe('0x1a2b3c4d5e6f7…');
		});

		it('uses default max length of 20', () => {
			const long = '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890';
			const result = truncateCommitment(long);
			expect(result).toHaveLength(20);
		});

		it('returns the string unchanged when exactly at max length', () => {
			const exact = '0x1234567890ab'; // 14 chars
			expect(truncateCommitment(exact, 14)).toBe(exact);
		});
	});

	describe('validateEnrollmentForm', () => {
		it('returns no errors for valid data', () => {
			const errors = validateEnrollmentForm({
				userId: 'user-101',
				commitment: '0x1a2b3c4d5e6f7890abcdef'
			});
			expect(Object.keys(errors)).toHaveLength(0);
		});

		it('returns error when userId is empty', () => {
			const errors = validateEnrollmentForm({ userId: '', commitment: '0xabc' });
			expect(errors.userId).toBe('El ID de usuario es obligatorio');
		});

		it('returns error when userId is only whitespace', () => {
			const errors = validateEnrollmentForm({ userId: '   ', commitment: '0xabc' });
			expect(errors.userId).toBe('El ID de usuario es obligatorio');
		});

		it('returns error when commitment is empty', () => {
			const errors = validateEnrollmentForm({ userId: 'user-1', commitment: '' });
			expect(errors.commitment).toBe('El compromiso criptográfico es obligatorio');
		});

		it('returns error when commitment is only whitespace', () => {
			const errors = validateEnrollmentForm({ userId: 'user-1', commitment: '   ' });
			expect(errors.commitment).toBe('El compromiso criptográfico es obligatorio');
		});

		it('returns both errors when both fields are empty', () => {
			const errors = validateEnrollmentForm({ userId: '', commitment: '' });
			expect(errors.userId).toBeDefined();
			expect(errors.commitment).toBeDefined();
		});

		it('returns error when commitment is too short', () => {
			const errors = validateEnrollmentForm({ userId: 'user-1', commitment: '0xabc' });
			expect(errors.commitment).toBe('El compromiso debe tener al menos 10 caracteres');
		});

		it('accepts commitment with exactly 10 characters', () => {
			const errors = validateEnrollmentForm({
				userId: 'user-1',
				commitment: '0x12345678'
			});
			expect(Object.keys(errors)).toHaveLength(0);
		});
	});
});
