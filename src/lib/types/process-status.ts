import type { ElectoralProcessStatus } from './electoral-process';

/**
 * Canonical Spanish labels for each electoral process status.
 * Single source of truth — never duplicate this map in components.
 */
export const STATUS_LABELS: Record<ElectoralProcessStatus, string> = {
	OPEN: 'Abierto',
	COMMITMENT: 'Compromiso',
	SEALED: 'Sellado',
	VOTING: 'Votación',
	COUNTING: 'Conteo',
	CLOSED: 'Cerrado'
};

/**
 * Tailwind class strings for the status badge — one distinct variant per state.
 */
export const STATUS_COLORS: Record<ElectoralProcessStatus, string> = {
	OPEN: 'bg-amber-50 text-amber-700 border-amber-200',
	COMMITMENT: 'bg-blue-50 text-blue-700 border-blue-200',
	SEALED: 'bg-purple-50 text-purple-700 border-purple-200',
	VOTING: 'bg-green-50 text-green-700 border-green-200',
	COUNTING: 'bg-orange-50 text-orange-700 border-orange-200',
	CLOSED: 'bg-red-50 text-red-700 border-red-200'
};

/**
 * Canonical display order for status groupings (dashboard distribution, legends, etc.).
 */
export const STATUS_ORDER: ElectoralProcessStatus[] = [
	'OPEN',
	'COMMITMENT',
	'SEALED',
	'VOTING',
	'COUNTING',
	'CLOSED'
];

/**
 * An "active" process is any state that still allows interaction — i.e. anything
 * other than the terminal CLOSED state. OPEN, COMMITMENT, SEALED, VOTING and
 * COUNTING all count as active.
 */
export function isActiveProcess(status: ElectoralProcessStatus): boolean {
	return status !== 'CLOSED';
}
