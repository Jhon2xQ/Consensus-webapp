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

export function getStatusLabel(status: ElectoralProcessStatus): string {
	return STATUS_LABELS[status] ?? status;
}

export function getStatusColor(status: ElectoralProcessStatus): string {
	return STATUS_COLORS[status] ?? STATUS_COLORS.NONE;
}
