export type ElectoralProcessStatus =
	| 'NONE'
	| 'COMMITMENT'
	| 'VOTING'
	| 'CLOSED'
	| 'PAUSED'
	| 'CANCELLED';

export type ElectoralProcess = {
	id: string;
	name: string;
	scope: string;
	description: string | null;
	estatus: ElectoralProcessStatus;
	commitmentStart: string;
	commitmentEnd: string;
	votingStart: string;
	votingEnd: string;
	results: string;
};
