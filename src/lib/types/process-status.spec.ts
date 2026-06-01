import { describe, it, expect } from 'vitest';
import {
	STATUS_LABELS,
	STATUS_COLORS,
	STATUS_ORDER,
	isActiveProcess
} from './process-status';
import { PROCESS_STATUSES } from './electoral-process';
import type { ElectoralProcessStatus } from './electoral-process';

describe('process-status central maps', () => {
	describe('STATUS_LABELS', () => {
		it('returns "Abierto" for OPEN', () => {
			expect(STATUS_LABELS.OPEN).toBe('Abierto');
		});

		it('returns "Compromiso" for COMMITMENT', () => {
			expect(STATUS_LABELS.COMMITMENT).toBe('Compromiso');
		});

		it('returns "Sellado" for SEALED', () => {
			expect(STATUS_LABELS.SEALED).toBe('Sellado');
		});

		it('returns "Votación" for VOTING', () => {
			expect(STATUS_LABELS.VOTING).toBe('Votación');
		});

		it('returns "Conteo" for COUNTING', () => {
			expect(STATUS_LABELS.COUNTING).toBe('Conteo');
		});

		it('returns "Cerrado" for CLOSED', () => {
			expect(STATUS_LABELS.CLOSED).toBe('Cerrado');
		});

		it('covers every status in PROCESS_STATUSES', () => {
			for (const status of PROCESS_STATUSES) {
				expect(STATUS_LABELS[status]).toBeTruthy();
			}
		});
	});

	describe('STATUS_COLORS', () => {
		it('returns a non-empty Tailwind class string for every status', () => {
			for (const status of PROCESS_STATUSES) {
				const color = STATUS_COLORS[status];
				expect(typeof color).toBe('string');
				expect(color.length).toBeGreaterThan(0);
			}
		});

		it('returns distinct colors for different statuses', () => {
			const seen = new Set<string>();
			for (const status of PROCESS_STATUSES) {
				seen.add(STATUS_COLORS[status]);
			}
			// 6 statuses → 6 distinct colors
			expect(seen.size).toBe(PROCESS_STATUSES.length);
		});
	});

	describe('STATUS_ORDER', () => {
		it('lists statuses in canonical order: OPEN, COMMITMENT, SEALED, VOTING, COUNTING, CLOSED', () => {
			const expected: ElectoralProcessStatus[] = [
				'OPEN',
				'COMMITMENT',
				'SEALED',
				'VOTING',
				'COUNTING',
				'CLOSED'
			];
			expect(STATUS_ORDER).toEqual(expected);
		});
	});

	describe('isActiveProcess', () => {
		it('returns false for CLOSED', () => {
			expect(isActiveProcess('CLOSED')).toBe(false);
		});

		it('returns true for OPEN', () => {
			expect(isActiveProcess('OPEN')).toBe(true);
		});

		it('returns true for COMMITMENT', () => {
			expect(isActiveProcess('COMMITMENT')).toBe(true);
		});

		it('returns true for SEALED', () => {
			expect(isActiveProcess('SEALED')).toBe(true);
		});

		it('returns true for VOTING', () => {
			expect(isActiveProcess('VOTING')).toBe(true);
		});

		it('returns true for COUNTING', () => {
			expect(isActiveProcess('COUNTING')).toBe(true);
		});
	});
});
