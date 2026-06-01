import type { ElectoralProcessStatus } from '$lib/types/electoral-process';
import { STATUS_LABELS, STATUS_COLORS } from '$lib/types/process-status';

// Re-export the central status maps so existing imports from `$lib/sections/dashboard/process-utils`
// keep working after the maps moved to `$lib/types/process-status`.
export { STATUS_LABELS, STATUS_COLORS, isActiveProcess } from '$lib/types/process-status';

const FALLBACK_COLOR = 'bg-gray-100 text-gray-600 border-gray-200';

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
	return STATUS_COLORS[status] ?? FALLBACK_COLOR;
}
