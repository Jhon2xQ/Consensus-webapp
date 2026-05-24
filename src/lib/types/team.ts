export type Team = {
	id: string;
	name: string;
	avatarUrl?: string | null;
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
