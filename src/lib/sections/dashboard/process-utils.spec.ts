import { describe, it, expect } from 'vitest';
import {
	getStatusLabel,
	getStatusColor,
	parseLocalDate,
	formatDate,
	formatDateRange,
	STATUS_LABELS,
	STATUS_COLORS
} from './process-utils';
import type { ElectoralProcessStatus } from '$lib/types/electoral-process';

describe('process-utils', () => {
	describe('getStatusLabel', () => {
		it('returns Spanish label for each status', () => {
			expect(getStatusLabel('NONE')).toBe('Inactivo');
			expect(getStatusLabel('COMMITMENT')).toBe('Compromiso');
			expect(getStatusLabel('VOTING')).toBe('Votación');
			expect(getStatusLabel('CLOSED')).toBe('Cerrado');
			expect(getStatusLabel('PAUSED')).toBe('Pausado');
			expect(getStatusLabel('CANCELLED')).toBe('Cancelado');
		});

		it('covers all statuses defined in the type', () => {
			const allStatuses: ElectoralProcessStatus[] = [
				'NONE',
				'COMMITMENT',
				'VOTING',
				'CLOSED',
				'PAUSED',
				'CANCELLED'
			];
			for (const status of allStatuses) {
				expect(getStatusLabel(status)).toBeTruthy();
			}
		});
	});

	describe('getStatusColor', () => {
		it('returns a color string for each status', () => {
			const allStatuses: ElectoralProcessStatus[] = [
				'NONE',
				'COMMITMENT',
				'VOTING',
				'CLOSED',
				'PAUSED',
				'CANCELLED'
			];
			for (const status of allStatuses) {
				const color = getStatusColor(status);
				expect(color).toBeTruthy();
				expect(typeof color).toBe('string');
			}
		});

		it('returns distinct colors for different statuses', () => {
			const commitmentColor = getStatusColor('COMMITMENT');
			const votingColor = getStatusColor('VOTING');
			const cancelledColor = getStatusColor('CANCELLED');
			expect(commitmentColor).not.toBe(votingColor);
			expect(votingColor).not.toBe(cancelledColor);
		});
	});

	describe('parseLocalDate', () => {
		it('parses ISO date string to local Date', () => {
			const date = parseLocalDate('2026-03-15');
			expect(date.getFullYear()).toBe(2026);
			expect(date.getMonth()).toBe(2); // March = 2
			expect(date.getDate()).toBe(15);
		});

		it('handles single-digit month and day', () => {
			const date = parseLocalDate('2026-01-05');
			expect(date.getFullYear()).toBe(2026);
			expect(date.getMonth()).toBe(0); // January = 0
			expect(date.getDate()).toBe(5);
		});
	});

	describe('formatDate', () => {
		it('formats ISO date to Argentine locale', () => {
			const formatted = formatDate('2026-03-15');
			expect(formatted).toContain('15');
			expect(formatted).toContain('2026');
		});

		it('formats different dates consistently', () => {
			const date1 = formatDate('2026-01-01');
			const date2 = formatDate('2026-12-31');
			expect(date1).toBeTruthy();
			expect(date2).toBeTruthy();
			expect(date1).not.toBe(date2);
		});
	});

	describe('formatDateRange', () => {
		it('formats two dates as a range with dash separator', () => {
			const range = formatDateRange('2026-03-01', '2026-03-15');
			expect(range).toContain(' - ');
		});

		it('includes both dates in the output', () => {
			const range = formatDateRange('2026-03-01', '2026-04-30');
			expect(range).toContain('2026');
		});
	});
});
