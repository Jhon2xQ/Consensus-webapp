export type ElectoralProcessStatus =
	| 'NONE'
	| 'COMMITMENT'
	| 'VOTING'
	| 'CLOSED';

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
	createdBy: string;
};
