import { describe, it, expect } from 'vitest';
import {
	getStatusDistribution,
	getRecentProcesses,
	getTeamsPerProcess,
	getActiveProcessCount,
	getVotedCount,
	getMaxStatusCount,
	getProcessNameById
} from './dashboard-utils';
import type { ElectoralProcess, ElectoralProcessStatus } from '$lib/types/electoral-process';
import { PROCESS_STATUSES } from '$lib/types/electoral-process';
import type { Team } from '$lib/types/team';
import type { Enrollment } from '$lib/types/enrollment';

const mockProcesses: ElectoralProcess[] = [
	{
		id: '1',
		name: 'Process A',
		scope: 'Nacional',
		description: null,
		groupId: null,
		estatus: 'COMMITMENT',
		commitmentStart: '2026-03-01',
		commitmentEnd: '2026-04-30',
		votingStart: '2026-06-15',
		votingEnd: '2026-06-20',
		results: '2026-06-25',
		createdBy: 'user-1'
	},
	{
		id: '2',
		name: 'Process B',
		scope: 'Provincial',
		description: null,
		groupId: null,
		estatus: 'VOTING',
		commitmentStart: '2026-04-01',
		commitmentEnd: '2026-05-15',
		votingStart: '2026-07-01',
		votingEnd: '2026-07-05',
		results: '2026-07-10',
		createdBy: 'user-1'
	},
	{
		id: '3',
		name: 'Process C',
		scope: 'Municipal',
		description: null,
		groupId: null,
		estatus: 'CLOSED',
		commitmentStart: '2025-09-01',
		commitmentEnd: '2025-10-15',
		votingStart: '2025-11-10',
		votingEnd: '2025-11-15',
		results: '2025-11-20',
		createdBy: 'user-1'
	},
	{
		id: '4',
		name: 'Process D',
		scope: 'Nacional',
		description: null,
		groupId: null,
		estatus: 'COMMITMENT',
		commitmentStart: '2026-05-10',
		commitmentEnd: '2026-06-30',
		votingStart: '2026-08-10',
		votingEnd: '2026-08-12',
		results: '2026-08-15',
		createdBy: 'user-1'
	}
];

const mockTeams: Team[] = [
	{ id: 't1', name: 'Team A', electoralProcessId: '1' },
	{ id: 't2', name: 'Team B', electoralProcessId: '1' },
	{ id: 't3', name: 'Team C', electoralProcessId: '2' }
];

const mockEnrollments: Enrollment[] = [
	{ id: 'e1', electoralProcessId: '1', email: 'u1@test.com', userId: 'u1', commitment: '0xabc', hasVoted: true },
	{ id: 'e2', electoralProcessId: '1', email: 'u2@test.com', userId: 'u2', commitment: '0xdef', hasVoted: false },
	{ id: 'e3', electoralProcessId: '2', email: 'u3@test.com', userId: 'u3', commitment: '0xghi', hasVoted: true }
];

describe('dashboard-utils', () => {
	describe('getStatusDistribution', () => {
		it('counts processes by status', () => {
			const dist = getStatusDistribution(mockProcesses);
			expect(dist.COMMITMENT).toBe(2);
			expect(dist.VOTING).toBe(1);
			expect(dist.CLOSED).toBe(1);
			expect(dist.OPEN).toBe(0);
			expect(dist.SEALED).toBe(0);
			expect(dist.COUNTING).toBe(0);
		});

		it('returns all zeros for empty array', () => {
			const dist = getStatusDistribution([]);
			for (const status of PROCESS_STATUSES) {
				expect(dist[status]).toBe(0);
			}
		});

		it('counts all six statuses correctly when given one process per state', () => {
			const onePerState: ElectoralProcess[] = PROCESS_STATUSES.map((status, i) => ({
				id: String(i + 1),
				name: `Process ${status}`,
				scope: 'Nacional',
				description: null,
				groupId: null,
				estatus: status,
				commitmentStart: '2026-01-01',
				commitmentEnd: '2026-02-01',
				votingStart: '2026-03-01',
				votingEnd: '2026-03-05',
				results: '2026-03-10',
				createdBy: 'user-1'
			}));

			const dist = getStatusDistribution(onePerState);
			for (const status of PROCESS_STATUSES) {
				expect(dist[status]).toBe(1);
			}
		});
	});

	describe('getRecentProcesses', () => {
		it('returns processes sorted by votingStart descending', () => {
			const recent = getRecentProcesses(mockProcesses, 3);
			expect(recent).toHaveLength(3);
			expect(recent[0]!.id).toBe('4'); // 2026-08-10
			expect(recent[1]!.id).toBe('2'); // 2026-07-01
			expect(recent[2]!.id).toBe('1'); // 2026-06-15
		});

		it('limits results to specified count', () => {
			const recent = getRecentProcesses(mockProcesses, 2);
			expect(recent).toHaveLength(2);
		});

		it('returns all if limit exceeds array length', () => {
			const recent = getRecentProcesses(mockProcesses, 100);
			expect(recent).toHaveLength(4);
		});

		it('returns empty array for empty input', () => {
			expect(getRecentProcesses([])).toEqual([]);
		});
	});

	describe('getTeamsPerProcess', () => {
		it('counts teams per process ID', () => {
			const counts = getTeamsPerProcess(mockTeams);
			expect(counts.get('1')).toBe(2);
			expect(counts.get('2')).toBe(1);
		});

		it('returns empty map for no teams', () => {
			const counts = getTeamsPerProcess([]);
			expect(counts.size).toBe(0);
		});
	});

	describe('getActiveProcessCount', () => {
		it('counts all non-CLOSED processes (any active state)', () => {
			expect(getActiveProcessCount(mockProcesses)).toBe(3);
		});

		it('returns 0 for empty array', () => {
			expect(getActiveProcessCount([])).toBe(0);
		});

		it('includes OPEN, SEALED and COUNTING in the active count', () => {
			const processes: ElectoralProcess[] = PROCESS_STATUSES.map((status, i) => ({
				id: String(i + 1),
				name: `Process ${status}`,
				scope: 'Nacional',
				description: null,
				groupId: null,
				estatus: status,
				commitmentStart: '2026-01-01',
				commitmentEnd: '2026-02-01',
				votingStart: '2026-03-01',
				votingEnd: '2026-03-05',
				results: '2026-03-10',
				createdBy: 'user-1'
			}));

			// 6 total, 1 CLOSED → 5 active
			expect(getActiveProcessCount(processes)).toBe(5);
		});

		it('excludes only CLOSED from the active count', () => {
			const statuses: ElectoralProcessStatus[] = [
				'OPEN',
				'COMMITMENT',
				'SEALED',
				'VOTING',
				'COUNTING'
			];
			const processes: ElectoralProcess[] = statuses.map((status, i) => ({
				id: String(i + 1),
				name: `Process ${status}`,
				scope: 'Nacional',
				description: null,
				groupId: null,
				estatus: status,
				commitmentStart: '2026-01-01',
				commitmentEnd: '2026-02-01',
				votingStart: '2026-03-01',
				votingEnd: '2026-03-05',
				results: '2026-03-10',
				createdBy: 'user-1'
			}));

			expect(getActiveProcessCount(processes)).toBe(5);
		});
	});

	describe('getVotedCount', () => {
		it('counts enrollments where hasVoted is true', () => {
			expect(getVotedCount(mockEnrollments)).toBe(2);
		});

		it('returns 0 for empty array', () => {
			expect(getVotedCount([])).toBe(0);
		});
	});

	describe('getMaxStatusCount', () => {
		it('returns the maximum count', () => {
			expect(getMaxStatusCount({ A: 3, B: 7, C: 2 })).toBe(7);
		});

		it('returns 1 if all counts are 0', () => {
			expect(getMaxStatusCount({ A: 0, B: 0 })).toBe(1);
		});
	});

	describe('getProcessNameById', () => {
		it('returns the process name for a valid ID', () => {
			expect(getProcessNameById(mockProcesses, '2')).toBe('Process B');
		});

		it('returns "Desconocido" for unknown ID', () => {
			expect(getProcessNameById(mockProcesses, '999')).toBe('Desconocido');
		});
	});
});
