import type { ElectoralProcess, ElectoralProcessStatus } from '$lib/types/electoral-process';
import type { Team } from '$lib/types/team';
import type { Enrollment } from '$lib/types/enrollment';

/**
 * Count processes by status.
 */
export function getStatusDistribution(processes: ElectoralProcess[]): Record<ElectoralProcessStatus, number> {
	const distribution: Record<ElectoralProcessStatus, number> = {
		NONE: 0,
		COMMITMENT: 0,
		VOTING: 0,
		CLOSED: 0,
		PAUSED: 0,
		CANCELLED: 0
	};

	for (const process of processes) {
		distribution[process.estatus]++;
	}

	return distribution;
}

/**
 * Get the most recently modified processes.
 * Since mock data has no updatedAt, we use votingStart as a proxy for recency.
 */
export function getRecentProcesses(processes: ElectoralProcess[], limit = 5): ElectoralProcess[] {
	return [...processes]
		.sort((a, b) => {
			const dateA = new Date(a.votingStart).getTime();
			const dateB = new Date(b.votingStart).getTime();
			return dateB - dateA;
		})
		.slice(0, limit);
}

/**
 * Count teams per process.
 */
export function getTeamsPerProcess(teams: Team[]): Map<string, number> {
	const counts = new Map<string, number>();
	for (const team of teams) {
		counts.set(team.electoralProcessId, (counts.get(team.electoralProcessId) ?? 0) + 1);
	}
	return counts;
}

/**
 * Count active processes (COMMITMENT or VOTING).
 */
export function getActiveProcessCount(processes: ElectoralProcess[]): number {
	return processes.filter((p) => p.estatus === 'COMMITMENT' || p.estatus === 'VOTING').length;
}

/**
 * Count voted enrollments.
 */
export function getVotedCount(enrollments: Enrollment[]): number {
	return enrollments.filter((e) => e.hasVoted).length;
}

/**
 * Get the maximum count in a status distribution for scaling bars.
 */
export function getMaxStatusCount(distribution: Record<string, number>): number {
	return Math.max(...Object.values(distribution), 1);
}

/**
 * Find a process name by ID.
 */
export function getProcessNameById(processes: ElectoralProcess[], id: string): string {
	return processes.find((p) => p.id === id)?.name ?? 'Desconocido';
}
