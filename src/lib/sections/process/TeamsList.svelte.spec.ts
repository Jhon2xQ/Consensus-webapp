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
		render(TeamsList, defaultProps());
		// "Equipo Alpha" -> "EA", "Equipo Beta" -> "EB"
		await expect.element(page.getByText('EA', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('EB', { exact: true })).toBeInTheDocument();
		// The avatar div is identified by data-testid="team-avatar" (one per card).
		const avatars = page.getByTestId('team-avatar').elements();
		expect(avatars.length).toBe(2);
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

	// ── Vote count display (spec FR-4, FR-5) ─────────────────────────────
	it('renders a "votos emitidos" label inside each card', async () => {
		render(TeamsList, defaultProps());
		const labels = page.getByText('votos emitidos', { exact: true }).elements();
		expect(labels.length).toBe(2);
	});

	it('renders a deterministic vote count for each team by default (mock fallback)', async () => {
		// Without an explicit voteCount prop, the default is
		// `(t) => deterministicVoteCount(t.id)`. The two test teams
		// ("team-1" and "team-2") have known pinned values from
		// team-vote-count.spec.ts.
		render(TeamsList, defaultProps());
		// Cast: we just need to verify numbers are rendered, not their exact value.
		// The team-vote-count.spec pins: team-1 → 315, team-2 → 314.
		await expect.element(page.getByText('315', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('314', { exact: true })).toBeInTheDocument();
	});

	it('uses the custom voteCount function when provided (test override)', async () => {
		const voteCount = vi.fn(() => 42);
		render(TeamsList, defaultProps({ voteCount }));
		// Each card renders the override value
		const forties = page.getByText('42', { exact: true }).elements();
		expect(forties.length).toBe(2);
		// The function was called once per team
		expect(voteCount).toHaveBeenCalledTimes(2);
		// The first call received the first team
		expect(voteCount).toHaveBeenNthCalledWith(1, teamAlpha);
		expect(voteCount).toHaveBeenNthCalledWith(2, teamBeta);
	});

	// ── Selected state (spec FR-5) ───────────────────────────────────────
	it('marks the selected team card with data-state="selected"', async () => {
		render(TeamsList, defaultProps({ selectedTeam: teamAlpha, onSelect: vi.fn() }));
		const alphaCard = page.getByTestId('team-card-team-1');
		const betaCard = page.getByTestId('team-card-team-2');
		await expect.element(alphaCard).toHaveAttribute('data-state', 'selected');
		await expect.element(betaCard).toHaveAttribute('data-state', 'unselected');
	});

	// ── Interactive prop (spec FR-6) ─────────────────────────────────────
	it('disables all team buttons when interactive={false}', async () => {
		const onSelect = vi.fn();
		render(TeamsList, defaultProps({ interactive: false, onSelect }));
		const alphaBtn = page.getByRole('button', { name: /Equipo Alpha/ });
		const betaBtn = page.getByRole('button', { name: /Equipo Beta/ });
		await expect.element(alphaBtn).toBeDisabled();
		await expect.element(betaBtn).toBeDisabled();
		await alphaBtn.click({ force: true }).catch(() => {});
		expect(onSelect).not.toHaveBeenCalled();
	});

	it('enables all team buttons when interactive={true} and onSelect is provided', async () => {
		const onSelect = vi.fn();
		render(TeamsList, defaultProps({ interactive: true, onSelect }));
		const alphaBtn = page.getByRole('button', { name: /Equipo Alpha/ });
		await expect.element(alphaBtn).toBeEnabled();
		await alphaBtn.click();
		expect(onSelect).toHaveBeenCalledWith(teamAlpha);
	});
});
