import type { Team } from '$lib/types/team';

/**
 * Get teams for a specific electoral process.
 */
export function getTeamsByProcessId(teams: Team[], processId: string): Team[] {
	return teams.filter((t) => t.electoralProcessId === processId);
}

/**
 * Get the display name for a team, truncated if needed.
 */
export function getTeamDisplayName(team: Team, maxLength = 40): string {
	if (team.name.length <= maxLength) return team.name;
	return team.name.slice(0, maxLength) + '…';
}

/**
 * Generate initials from a team name for avatar fallback.
 */
export function getTeamInitials(name: string): string {
	return name
		.split(/\s+/)
		.slice(0, 2)
		.map((word) => word.charAt(0).toUpperCase())
		.join('');
}

/**
 * Validate team form data. Returns an errors object.
 */
export function validateTeamForm(data: { name: string }): Record<string, string> {
	const errors: Record<string, string> = {};

	if (!data.name?.trim()) {
		errors.name = 'El nombre del equipo es obligatorio';
	} else if (data.name.trim().length < 2) {
		errors.name = 'El nombre debe tener al menos 2 caracteres';
	} else if (data.name.trim().length > 100) {
		errors.name = 'El nombre no puede exceder 100 caracteres';
	}

	return errors;
}
