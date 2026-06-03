import type { Identity } from '@semaphore-protocol/core';

export type VotingProofInput = {
	identity: Identity;
	groupId: string;
	processId: string;
	teamName: string;
	fetchCommitmentsUrl: string;
	voterSub: string;
};

export type VotingFullProof = {
	merkleTreeDepth: number;
	merkleTreeRoot: string;
	nullifier: string;
	message: string;
	scope: string;
	points: string[];
};

export type VotingStage =
	| 'idle'
	| 'verifying-passkey'
	| 'building-proof'
	| 'submitting'
	| 'success'
	| 'error';

export type VotingStageMessage = Record<VotingStage, string>;

export const VOTING_STAGE_MESSAGE: VotingStageMessage = {
	idle: '',
	'verifying-passkey': 'Verificando tu credencial...',
	'building-proof': 'Generando prueba ZK...',
	submitting: 'Confirmando en blockchain...',
	success: 'Voto registrado',
	error: ''
};

export type ProofSubmissionResult = {
	success: true;
	data: {
		transaction: {
			hash: string;
		};
	};
};

export type ProofError = {
	kind: 'snark-download' | 'merkle-failed' | 'relayer-4xx' | 'relayer-5xx' | 'validation';
	message?: string;
};
