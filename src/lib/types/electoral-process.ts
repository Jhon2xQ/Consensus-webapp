export type ElectoralProcessStatus =
	| 'OPEN'
	| 'COMMITMENT'
	| 'SEALED'
	| 'VOTING'
	| 'COUNTING'
	| 'CLOSED';

export const PROCESS_STATUSES: readonly ElectoralProcessStatus[] = [
	'OPEN',
	'COMMITMENT',
	'SEALED',
	'VOTING',
	'COUNTING',
	'CLOSED'
] as const;

export type ProcessState = {
	processId: string;
	state: ElectoralProcessStatus;
};

export type ElectoralProcess = {
	id: string;
	name: string;
	scope: string;
	description: string | null;
	groupId: string | null;
	estatus: ElectoralProcessStatus;
	commitmentStart: string;
	commitmentEnd: string;
	votingStart: string;
	votingEnd: string;
	results: string;
	createdBy: string;
	teamsCount?: number | null;
	participantsCount?: number | null;
};
