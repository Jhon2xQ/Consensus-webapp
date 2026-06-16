export type Team = {
	id: string;
	name: string;
	avatarUrl?: string | null;
	/**
	 * Aggregated vote count for this team. Populated by the API once it
	 * lands. Until then, `TeamsList` falls back to
	 * `deterministicVoteCount(id)` (MOCK).
	 */
	voteCount?: number | null;
	electoralProcessId: string;
};

export type CreateTeamBody = {
	name: string;
	avatarUrl?: string | null;
};

export type UpdateTeamBody = {
	name?: string;
	avatarUrl?: string | null;
};
