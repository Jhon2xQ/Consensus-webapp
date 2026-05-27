export type Enrollment = {
	id: string;
	electoralProcessId: string;
	email: string;
	userId: string | null;
	commitment: string | null;
	hasVoted: boolean;
};

export type CreateEnrollmentBody = {
	email: string;
};

export type EnrollmentSummary = {
	totalParticipants: number;
	totalCommitments: number;
	totalVoted: number;
};
