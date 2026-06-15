import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Identity } from '@semaphore-protocol/core';
import type { ProofError } from '$lib/types/proof';
import { buildVotingProof, submitVotingProof } from './proof.service';

// ── Mocks ──
const { MockGroup, mockGenerateProof } = vi.hoisted(() => {
	class MockGroup {
		root: bigint;
		constructor(members: bigint[]) {
			this.root = BigInt(123);
		}
	}
	const mockGenerateProof = vi.fn();
	return { MockGroup, mockGenerateProof };
});

vi.mock('@semaphore-protocol/group', () => ({
	Group: MockGroup
}));

vi.mock('@semaphore-protocol/proof', () => ({
	generateProof: mockGenerateProof
}));

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock env
vi.mock('$env/dynamic/public', () => ({
	env: {
		PUBLIC_RELAYER_API_URL: 'https://relayer.example.com'
	}
}));

beforeEach(() => {
	vi.clearAllMocks();
});

describe('buildVotingProof', () => {
	it('builds group from pre-loaded commitments and generates proof', async () => {
		const identity = new Identity('test-seed');
		const commitments = [identity.commitment.toString(), '67890', '11111'];

		// Mock generateProof
		const mockProof = {
			merkleTreeDepth: 20,
			merkleTreeRoot: '123',
			nullifier: '456',
			message: 'Equipo A',
			scope: 'proc-42',
			points: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']
		};
		mockGenerateProof.mockResolvedValueOnce(mockProof);

		const result = await buildVotingProof({
			identity,
			groupId: 'group-1',
			processId: 'proc-42',
			teamName: 'Equipo A',
			commitments
		});

		// Verify generateProof was called with a Group instance
		expect(mockGenerateProof).toHaveBeenCalledWith(
			identity,
			expect.any(MockGroup),
			48372189119763425552198978496551648004736015106475216423350523710744037816954n,
			89061027359091757604669380787291759126923427694506796548474207502827945494064n
		);

		// Verify result
		expect(result).toEqual(mockProof);
	});

	it('does not call fetch — commitments come pre-loaded', async () => {
		const identity = new Identity('test-seed');
		mockGenerateProof.mockResolvedValueOnce({
			merkleTreeDepth: 20,
			merkleTreeRoot: 'x',
			nullifier: 'y',
			message: 'Equipo A',
			scope: 'proc-1',
			points: []
		});

		await buildVotingProof({
			identity,
			groupId: 'group-1',
			processId: 'proc-1',
			teamName: 'Equipo A',
			commitments: [identity.commitment.toString()]
		});

		expect(mockFetch).not.toHaveBeenCalled();
	});

	it('throws identity-not-in-group when commitment is not in the array', async () => {
		const identity = new Identity('other-seed');

		await expect(
			buildVotingProof({
				identity,
				groupId: 'group-1',
				processId: 'proc-1',
				teamName: 'Equipo A',
				commitments: ['111', '222', '333']
			})
		).rejects.toEqual({
			kind: 'identity-not-in-group',
			message: 'Tu compromiso no se encuentra en el árbol de votantes. Verificá que hayas enviado tu compromiso desde este dispositivo.'
		});
	});

	it('throws merkle-failed error when generateProof fails', async () => {
		const identity = new Identity('test-seed');

		mockGenerateProof.mockRejectedValueOnce(new Error('Snark computation failed'));

		await expect(
			buildVotingProof({
				identity,
				groupId: 'group-1',
				processId: 'proc-42',
				teamName: 'Equipo A',
				commitments: [identity.commitment.toString(), '67890', '11111']
			})
		).rejects.toEqual({
			kind: 'merkle-failed',
			message: 'Error al generar la prueba ZK'
		});
	});

	it('converts string commitments to bigint for Group', async () => {
		const identity = new Identity('test-seed');
		const commitments = [identity.commitment.toString(), '111111111111111111'];

		const mockProof = {
			merkleTreeDepth: 20,
			merkleTreeRoot: '456',
			nullifier: '789',
			message: 'Equipo B',
			scope: 'proc-43',
			points: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']
		};
		mockGenerateProof.mockResolvedValueOnce(mockProof);

		await buildVotingProof({
			identity,
			groupId: 'group-2',
			processId: 'proc-43',
			teamName: 'Equipo B',
			commitments
		});

		// Verify generateProof was called with a Group instance
		expect(mockGenerateProof).toHaveBeenCalledWith(
			identity,
			expect.any(MockGroup),
			34998467565892384141537495295439947866726190305254194210388848620590297824266n,
			9221748722220242723228722385434345259831565202181691594216325347713215797523n
		);
	});
});

describe('submitVotingProof', () => {
	it('sends correct body to Relayer', async () => {
		const proof = {
			merkleTreeDepth: 20,
			merkleTreeRoot: '123',
			nullifier: '456',
			message: 'Equipo A',
			scope: 'proc-42',
			points: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']
		};

		const mockResponse = {
			success: true,
			data: { transaction: { hash: '0xabc123' } }
		};

		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockResponse
		});

		const result = await submitVotingProof({ groupId: 'group-1', proof });

		// Verify fetch was called with correct URL and body
		expect(mockFetch).toHaveBeenCalledWith(
			'https://relayer.example.com/api/semaphore/proofs/validate',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					groupId: 'group-1',
					proof: {
						merkleTreeDepth: 20,
						merkleTreeRoot: '123',
						nullifier: '456',
						message: 'Equipo A',
						scope: 'proc-42',
						points: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']
					}
				})
			}
		);

		expect(result).toEqual(mockResponse);
	});

	it('returns { success: false, message } for 4xx responses (already on-chain)', async () => {
		const proof = {
			merkleTreeDepth: 20,
			merkleTreeRoot: '123',
			nullifier: '456',
			message: 'Equipo A',
			scope: 'proc-42',
			points: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']
		};

		// The relayer always includes { success, ... } in the body — even on 4xx.
		mockFetch.mockResolvedValueOnce({
			ok: false,
			status: 409,
			json: async () => ({ success: false, message: 'Nullifier already used' })
		});

		const result = await submitVotingProof({ groupId: 'group-1', proof });
		expect(result).toEqual({ success: false, message: 'Nullifier already used' });
	});

	it('throws relayer-5xx error for 5xx responses without success body', async () => {
		const proof = {
			merkleTreeDepth: 20,
			merkleTreeRoot: '123',
			nullifier: '456',
			message: 'Equipo A',
			scope: 'proc-42',
			points: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']
		};

		mockFetch.mockResolvedValueOnce({
			ok: false,
			status: 500,
			json: async () => ({ message: 'Internal server error' }) // no `success` field
		});

		await expect(submitVotingProof({ groupId: 'group-1', proof })).rejects.toEqual({
			kind: 'relayer-5xx',
			message: 'Relayer error: 500'
		});
	});

	it('throws relayer-5xx for 5xx when JSON parsing fails', async () => {
		const proof = {
			merkleTreeDepth: 20,
			merkleTreeRoot: '123',
			nullifier: '456',
			message: 'Equipo A',
			scope: 'proc-42',
			points: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']
		};

		mockFetch.mockResolvedValueOnce({
			ok: false,
			status: 502,
			json: async () => { throw new Error('not json'); }
		});

		await expect(submitVotingProof({ groupId: 'group-1', proof })).rejects.toEqual({
			kind: 'relayer-5xx',
			message: 'Relayer error: 502'
		});
	});
});
