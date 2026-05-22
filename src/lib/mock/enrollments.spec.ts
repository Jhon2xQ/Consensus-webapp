import { describe, it, expect } from 'vitest';
import { enrollments } from './enrollments';
import type { Enrollment } from '$lib/types/enrollment';

describe('enrollments mock data', () => {
	it('exports a non-empty array of enrollments', () => {
		expect(enrollments.length).toBeGreaterThan(0);
	});

	it('every enrollment has required fields with correct types', () => {
		for (const enrollment of enrollments) {
			expect(typeof enrollment.id).toBe('string');
			expect(enrollment.id.length).toBeGreaterThan(0);
			expect(typeof enrollment.electoralProcessId).toBe('string');
			expect(enrollment.electoralProcessId.length).toBeGreaterThan(0);
			expect(typeof enrollment.email).toBe('string');
			expect(enrollment.email.length).toBeGreaterThan(0);
			if (enrollment.userId !== null) {
				expect(typeof enrollment.userId).toBe('string');
				expect(enrollment.userId.length).toBeGreaterThan(0);
			}
			if (enrollment.commitment !== null) {
				expect(typeof enrollment.commitment).toBe('string');
				expect(enrollment.commitment.length).toBeGreaterThan(0);
			}
			expect(typeof enrollment.hasVoted).toBe('boolean');
		}
	});

	it('every enrollment has a unique id', () => {
		const ids = enrollments.map((e) => e.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('hasVoted is false for COMMITMENT-phase processes', () => {
		const commitmentProcessIds = ['1', '2', '3'];
		const commitmentEnrollments = enrollments.filter(
			(e) => commitmentProcessIds.includes(e.electoralProcessId)
		);
		for (const enrollment of commitmentEnrollments) {
			expect(enrollment.hasVoted).toBe(false);
		}
	});

	it('has a mix of voted and not-voted enrollments', () => {
		const voted = enrollments.filter((e) => e.hasVoted);
		const notVoted = enrollments.filter((e) => !e.hasVoted);
		expect(voted.length).toBeGreaterThan(0);
		expect(notVoted.length).toBeGreaterThan(0);
	});

	it('all items satisfy the Enrollment type at compile time', () => {
		const _typeCheck: Enrollment[] = enrollments;
		expect(_typeCheck).toBe(enrollments);
	});
});
