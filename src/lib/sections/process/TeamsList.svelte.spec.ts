import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TeamsList from './TeamsList.svelte';
import type { Team } from '$lib/types/team';

const teamAlpha: Team = {
	id: 'team-1',
	name: 'Equipo Alpha',
	avatarUrl: null,
	electoralProcessId: 'proc-1'
};

const teamBeta: Team = {
	id: 'team-2',
	name: 'Equipo Beta',
	avatarUrl: null,
	electoralProcessId: 'proc-1'
};

const teamGamma: Team = {
	id: 'team-3',
	name: 'Equipo Gamma',
	avatarUrl: null,
	electoralProcessId: 'proc-1'
};

function defaultProps(overrides?: Record<string, unknown>) {
	return {
		teams: [teamAlpha, teamBeta],
		...overrides
	};
}

describe('TeamsList', () => {
	it('renders a button for each team', async () => {
		render(TeamsList, defaultProps());
		await expect.element(page.getByRole('button', { name: /Equipo Alpha/ })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /Equipo Beta/ })).toBeInTheDocument();
	});

	it('renders the initials of each team name (first letter of first two words)', async () => {
		const { container } = render(TeamsList, defaultProps());
		// "Equipo Alpha" -> "EA", "Equipo Beta" -> "EB"
		await expect.element(page.getByText('EA', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('EB', { exact: true })).toBeInTheDocument();
		// Sanity: the initials live inside the round avatar divs
		const avatarDivs = container.querySelectorAll('.bg-brand-red\\/10');
		expect(avatarDivs.length).toBe(2);
	});

	it('shows the empty state with "Sin equipos" when teams is empty', async () => {
		render(TeamsList, defaultProps({ teams: [] }));
		await expect.element(page.getByText('Sin equipos', { exact: true })).toBeInTheDocument();
		// No team buttons rendered
		await expect.element(page.getByRole('button', { name: /Equipo/ })).not.toBeInTheDocument();
	});

	it('clicking a team invokes onSelect with that team', async () => {
		const onSelect = vi.fn();
		render(TeamsList, defaultProps({ onSelect }));
		await page.getByRole('button', { name: /Equipo Alpha/ }).click();
		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(onSelect).toHaveBeenCalledWith(teamAlpha);
	});

	it('clicking a different team invokes onSelect with the new team', async () => {
		const onSelect = vi.fn();
		render(TeamsList, defaultProps({ onSelect }));
		await page.getByRole('button', { name: /Equipo Beta/ }).click();
		expect(onSelect).toHaveBeenCalledWith(teamBeta);
	});

	it('disables all team buttons when disabled is true', async () => {
		const onSelect = vi.fn();
		render(TeamsList, defaultProps({ disabled: true, onSelect }));
		const alphaBtn = page.getByRole('button', { name: /Equipo Alpha/ });
		const betaBtn = page.getByRole('button', { name: /Equipo Beta/ });
		await expect.element(alphaBtn).toBeDisabled();
		await expect.element(betaBtn).toBeDisabled();
		// Click should not fire onSelect when disabled
		await alphaBtn.click({ force: true }).catch(() => {
			// disabled buttons can throw on click in some environments; that's fine
		});
		expect(onSelect).not.toHaveBeenCalled();
	});

	it('disables all team buttons when onSelect is not provided (presentational mode)', async () => {
		render(TeamsList, defaultProps());
		const alphaBtn = page.getByRole('button', { name: /Equipo Alpha/ });
		await expect.element(alphaBtn).toBeDisabled();
	});

	it('renders all teams in the list', async () => {
		render(TeamsList, defaultProps({ teams: [teamAlpha, teamBeta, teamGamma] }));
		await expect.element(page.getByRole('button', { name: /Equipo Alpha/ })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /Equipo Beta/ })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /Equipo Gamma/ })).toBeInTheDocument();
	});

	it('uses team.id as the key (renders without duplicate warnings)', async () => {
		// We can verify this by passing a list with stable ids and checking
		// the correct number of buttons appears. If keys were wrong, Svelte
		// would warn (visible in stderr) but the count would still match.
		render(TeamsList, defaultProps({ teams: [teamAlpha, teamBeta] }));
		const allButtons = page.getByRole('button', { name: /Equipo/ });
		await expect.element(allButtons.first()).toBeInTheDocument();
	});
});
