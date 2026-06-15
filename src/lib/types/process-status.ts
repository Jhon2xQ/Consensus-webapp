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
 * Colors match the HTML CSS variables (amber for OPEN, blue for COMMITMENT, etc).
 */
export const STATUS_COLORS: Record<ElectoralProcessStatus, string> = {
	OPEN: 'bg-amber-50 text-amber-900 border-amber-300',
	COMMITMENT: 'bg-blue-50 text-blue-800 border-blue-300',
	SEALED: 'bg-violet-50 text-violet-800 border-violet-300',
	VOTING: 'bg-green-50 text-green-800 border-green-300',
	COUNTING: 'bg-orange-50 text-orange-800 border-orange-300',
	CLOSED: 'bg-red-50 text-red-800 border-red-300'
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
 * A "highlighted" process is one where the user can still act on it
 * (open registration, cast a vote). The card and button get red treatment.
 * SEALED, COUNTING, and CLOSED render as neutral.
 */
export function isHighlightedProcess(status: ElectoralProcessStatus): boolean {
	return status === 'OPEN' || status === 'COMMITMENT' || status === 'VOTING';
}

/**
 * An "active" process is any state that still allows interaction — i.e. anything
 * other than the terminal CLOSED state. OPEN, COMMITMENT, SEALED, VOTING and
 * COUNTING all count as active.
 */
export function isActiveProcess(status: ElectoralProcessStatus): boolean {
	return status !== 'CLOSED';
}
