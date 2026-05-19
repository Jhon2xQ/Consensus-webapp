import { describe, it, expect } from 'vitest';
import {
	getTeamsByProcessId,
	getTeamDisplayName,
	getTeamInitials,
	validateTeamForm
} from './team-utils';
import type { Team } from '$lib/types/team';

const mockTeams: Team[] = [
	{ id: 'team-1', name: 'Frente Nacional', avatarUrl: 'https://example.com/avatar.png', electoralProcessId: '1' },
	{ id: 'team-2', name: 'Coalición Federal', electoralProcessId: '1' },
	{ id: 'team-3', name: 'Unión Provincial', electoralProcessId: '2' },
	{ id: 'team-4', name: 'Movimiento Popular', electoralProcessId: '3' }
];

describe('team-utils', () => {
	describe('getTeamsByProcessId', () => {
		it('returns teams matching the given process id', () => {
			const result = getTeamsByProcessId(mockTeams, '1');
			expect(result).toHaveLength(2);
			expect(result[0].id).toBe('team-1');
			expect(result[1].id).toBe('team-2');
		});

		it('returns empty array when no teams match', () => {
			const result = getTeamsByProcessId(mockTeams, '999');
			expect(result).toHaveLength(0);
		});

		it('returns a single team when only one matches', () => {
			const result = getTeamsByProcessId(mockTeams, '3');
			expect(result).toHaveLength(1);
			expect(result[0].name).toBe('Movimiento Popular');
		});
	});

	describe('getTeamDisplayName', () => {
		it('returns full name when shorter than max length', () => {
			const team: Team = { id: '1', name: 'Test', electoralProcessId: '1' };
			expect(getTeamDisplayName(team)).toBe('Test');
		});

		it('truncates long names with ellipsis', () => {
			const team: Team = {
				id: '1',
				name: 'This is a very long team name that exceeds the maximum length allowed',
				electoralProcessId: '1'
			};
			const result = getTeamDisplayName(team, 20);
			expect(result).toHaveLength(21); // 20 chars + ellipsis
			expect(result.endsWith('…')).toBe(true);
		});

		it('uses default max length of 40', () => {
			const team: Team = {
				id: '1',
				name: 'A'.repeat(50),
				electoralProcessId: '1'
			};
			const result = getTeamDisplayName(team);
			expect(result).toHaveLength(41);
		});
	});

	describe('getTeamInitials', () => {
		it('returns first letter of single word', () => {
			expect(getTeamInitials('Frente')).toBe('F');
		});

		it('returns first letters of two words', () => {
			expect(getTeamInitials('Frente Nacional')).toBe('FN');
		});

		it('returns first two initials from multi-word names', () => {
			expect(getTeamInitials('Movimiento Popular Argentino')).toBe('MP');
		});

		it('uppercases the initials', () => {
			expect(getTeamInitials('coalición federal')).toBe('CF');
		});
	});

	describe('validateTeamForm', () => {
		it('returns no errors for valid name', () => {
			const errors = validateTeamForm({ name: 'Frente Nacional' });
			expect(Object.keys(errors)).toHaveLength(0);
		});

		it('returns error when name is empty', () => {
			const errors = validateTeamForm({ name: '' });
			expect(errors.name).toBe('El nombre del equipo es obligatorio');
		});

		it('returns error when name is only whitespace', () => {
			const errors = validateTeamForm({ name: '   ' });
			expect(errors.name).toBe('El nombre del equipo es obligatorio');
		});

		it('returns error when name is too short', () => {
			const errors = validateTeamForm({ name: 'A' });
			expect(errors.name).toBe('El nombre debe tener al menos 2 caracteres');
		});

		it('returns error when name exceeds 100 characters', () => {
			const errors = validateTeamForm({ name: 'A'.repeat(101) });
			expect(errors.name).toBe('El nombre no puede exceder 100 caracteres');
		});

		it('accepts name with exactly 2 characters', () => {
			const errors = validateTeamForm({ name: 'AB' });
			expect(Object.keys(errors)).toHaveLength(0);
		});

		it('accepts name with exactly 100 characters', () => {
			const errors = validateTeamForm({ name: 'A'.repeat(100) });
			expect(Object.keys(errors)).toHaveLength(0);
		});
	});
});
