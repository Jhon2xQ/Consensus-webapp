export type Team = {
	id: string;
	name: string;
	avatarUrl?: string;
	electoralProcessId: string;
};

export type CreateTeamBody = {
	name: string;
	avatarUrl?: string;
};

export type UpdateTeamBody = {
	name: string;
	avatarUrl?: string;
};
