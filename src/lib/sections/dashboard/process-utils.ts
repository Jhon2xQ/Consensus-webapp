import type { ElectoralProcessStatus } from '$lib/types/electoral-process';

export const STATUS_LABELS: Record<ElectoralProcessStatus, string> = {
	NONE: 'Inactivo',
	COMMITMENT: 'Compromiso',
	VOTING: 'Votación',
	CLOSED: 'Cerrado',
	PAUSED: 'Pausado',
	CANCELLED: 'Cancelado'
};

export const STATUS_COLORS: Record<ElectoralProcessStatus, string> = {
	NONE: 'bg-gray-100 text-gray-600 border-gray-200',
	COMMITMENT: 'bg-blue-50 text-blue-700 border-blue-200',
	VOTING: 'bg-green-50 text-green-700 border-green-200',
	CLOSED: 'bg-red-50 text-red-700 border-red-200',
	PAUSED: 'bg-amber-50 text-amber-700 border-amber-200',
	CANCELLED: 'bg-red-50 text-red-700 border-red-200'
};

export function parseLocalDate(iso: string): Date {
	// Handle both ISO-8601 (e.g., "2026-05-25T14:30:00Z") and date-only ("2026-05-25")
	if (iso.includes('T')) {
		return new Date(iso);
	}
	const [y, m, d] = iso.split('-').map(Number);
	return new Date(y, (m as number) - 1, d);
}

export function formatDate(iso: string): string {
	return new Intl.DateTimeFormat('es-AR', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	}).format(parseLocalDate(iso));
}

export function formatDateRange(start: string, end: string): string {
	return `${formatDate(start)} - ${formatDate(end)}`;
}

// ── REQ-5: DateTime conversion utilities ──

/** Convert a datetime-local string (browser local time) to ISO-8601 UTC */
export function toISO8601(dt: string): string {
	return new Date(dt).toISOString();
}

/** Convert an ISO-8601 UTC string to datetime-local format (YYYY-MM-DDTHH:MM) in local time */
export function toDatetimeLocal(iso: string): string {
	const d = new Date(iso);
	const yyyy = d.getFullYear();
	const MM = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	const HH = String(d.getHours()).padStart(2, '0');
	const mm = String(d.getMinutes()).padStart(2, '0');
	return `${yyyy}-${MM}-${dd}T${HH}:${mm}`;
}

/**
 * Normalize a datetime value to YYYY-MM-DDTHH:MM format.
 * - If already in YYYY-MM-DDTHH:MM → return as-is
 * - If date-only YYYY-MM-DD → append T00:00
 * - If ISO 8601 with Z or offset → convert to local datetime
 * - If empty → return empty string (no forced default)
 */
export function normalizeDatetime(value: string): string {
	if (!value) return '';
	// Already in datetime-local format
	if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
	// ISO 8601 with timezone info → convert to local
	if (value.includes('T') && (value.includes('Z') || value.includes('+') || value.includes('-'))) {
		return toDatetimeLocal(value);
	}
	// Date-only YYYY-MM-DD → append T00:00
	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T00:00`;
	// Fallback: try parsing
	const d = new Date(value);
	if (isNaN(d.getTime())) return value;
	return toDatetimeLocal(value);
}

/** Format an ISO-8601 string as localized date and time using es-AR locale */
export function formatDateTime(iso: string): string {
	return new Intl.DateTimeFormat('es-AR', {
		dateStyle: 'medium',
		timeStyle: 'short'
	}).format(new Date(iso));
}

export function getStatusLabel(status: ElectoralProcessStatus): string {
	return STATUS_LABELS[status] ?? status;
}

export function getStatusColor(status: ElectoralProcessStatus): string {
	return STATUS_COLORS[status] ?? STATUS_COLORS.NONE;
}
