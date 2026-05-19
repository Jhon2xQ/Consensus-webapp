export type Enrollment = {
	id: string;
	electoralProcessId: string;
	userId: string;
	commitment: string;
	hasVoted: boolean;
};

export type CreateEnrollmentBody = {
	userId: string;
	commitment: string;
};
