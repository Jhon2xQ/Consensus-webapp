import { describe, it, expect } from 'vitest';
import { teams } from './teams';
import type { Team } from '$lib/types/team';

describe('teams mock data', () => {
	it('exports a non-empty array of teams', () => {
		expect(teams.length).toBeGreaterThan(0);
	});

	it('every team has required fields with correct types', () => {
		for (const team of teams) {
			expect(typeof team.id).toBe('string');
			expect(team.id.length).toBeGreaterThan(0);
			expect(typeof team.name).toBe('string');
			expect(team.name.length).toBeGreaterThan(0);
			expect(typeof team.electoralProcessId).toBe('string');
			expect(team.electoralProcessId.length).toBeGreaterThan(0);
		}
	});

	it('every team has a unique id', () => {
		const ids = teams.map((t) => t.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('avatarUrl is either undefined, null, or a non-empty string', () => {
		for (const team of teams) {
			if (team.avatarUrl != null) {
				expect(typeof team.avatarUrl).toBe('string');
				expect(team.avatarUrl.length).toBeGreaterThan(0);
			}
		}
	});

	it('every team references a valid electoralProcessId', () => {
		const validProcessIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
		for (const team of teams) {
			expect(validProcessIds).toContain(team.electoralProcessId);
		}
	});

	it('all items satisfy the Team type at compile time', () => {
		const _typeCheck: Team[] = teams;
		expect(_typeCheck).toBe(teams);
	});
});
