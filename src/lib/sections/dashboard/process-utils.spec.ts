import { describe, it, expect } from 'vitest';
import {
	getStatusLabel,
	getStatusColor,
	parseLocalDate,
	formatDate,
	formatDateRange,
	toISO8601,
	toDatetimeLocal,
	formatDateTime,
	STATUS_LABELS,
	STATUS_COLORS
} from './process-utils';
import type { ElectoralProcessStatus } from '$lib/types/electoral-process';
import { PROCESS_STATUSES } from '$lib/types/electoral-process';

describe('process-utils', () => {
	describe('getStatusLabel', () => {
		it('returns Spanish label for each status', () => {
			expect(getStatusLabel('OPEN')).toBe('Abierto');
			expect(getStatusLabel('COMMITMENT')).toBe('Compromiso');
			expect(getStatusLabel('SEALED')).toBe('Sellado');
			expect(getStatusLabel('VOTING')).toBe('Votación');
			expect(getStatusLabel('COUNTING')).toBe('Conteo');
			expect(getStatusLabel('CLOSED')).toBe('Cerrado');
		});

		it('covers all statuses defined in the type', () => {
			for (const status of PROCESS_STATUSES) {
				expect(getStatusLabel(status)).toBeTruthy();
			}
		});
	});

	describe('getStatusColor', () => {
		it('returns a color string for each status', () => {
			for (const status of PROCESS_STATUSES) {
				const color = getStatusColor(status);
				expect(color).toBeTruthy();
				expect(typeof color).toBe('string');
			}
		});

		it('returns distinct colors for different statuses', () => {
			const commitmentColor = getStatusColor('COMMITMENT');
			const votingColor = getStatusColor('VOTING');
			const closedColor = getStatusColor('CLOSED');
			expect(commitmentColor).not.toBe(votingColor);
			expect(votingColor).not.toBe(closedColor);
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

	// ── REQ-5: DateTime conversion utilities ──
	describe('toISO8601', () => {
		it('converts datetime-local string to ISO-8601 UTC (America/Lima UTC-5)', () => {
			const result = toISO8601('2026-05-25T14:30');
			expect(result).toBe('2026-05-25T19:30:00.000Z');
		});

		it('handles midnight datetime-local', () => {
			const result = toISO8601('2026-05-25T00:00');
			expect(result).toContain('T');
			expect(result).toContain('Z');
		});
	});

	describe('toDatetimeLocal', () => {
		it('converts ISO-8601 UTC to datetime-local format (America/Lima UTC-5)', () => {
			const result = toDatetimeLocal('2026-05-25T19:30:00Z');
			expect(result).toBe('2026-05-25T14:30');
		});

		it('handles midnight ISO to datetime-local', () => {
			const result = toDatetimeLocal('2026-05-25T05:00:00Z');
			expect(result).toBe('2026-05-25T00:00');
		});
	});

	describe('formatDateTime', () => {
		it('renders localized date and time from ISO-8601', () => {
			const result = formatDateTime('2026-05-25T19:30:00Z');
			expect(result).toContain('2026');
			expect(result).toContain('may');
			expect(result).toContain('25');
			// es-AR locale uses 12-hour format: "14:30" → "2:30 p. m."
			expect(result).toContain(':30');
			expect(result).toContain('p.');
		});

		it('does not throw with legacy date-only string (backward compat)', () => {
			expect(() => formatDateTime('2026-05-25')).not.toThrow();
			const result = formatDateTime('2026-05-25');
			expect(result).toBeTruthy();
			expect(result).toContain('2026');
		});
	});

	describe('roundtrip conversion', () => {
		it('toDatetimeLocal(toISO8601(dt)) preserves original datetime-local', () => {
			const original = '2026-05-25T14:30';
			const iso = toISO8601(original);
			const back = toDatetimeLocal(iso);
			expect(back).toBe(original);
		});
	});

	describe('parseLocalDate backward compat', () => {
		it('parses ISO-8601 datetime strings without throwing', () => {
			const date = parseLocalDate('2026-05-25T14:30:00Z');
			expect(date.getFullYear()).toBe(2026);
			expect(date.getMonth()).toBe(4); // May = 4 in local time
			expect(date.getDate()).toBe(25);
		});

		it('still parses date-only strings correctly', () => {
			const date = parseLocalDate('2026-03-15');
			expect(date.getFullYear()).toBe(2026);
			expect(date.getMonth()).toBe(2);
			expect(date.getDate()).toBe(15);
		});
	});
});
