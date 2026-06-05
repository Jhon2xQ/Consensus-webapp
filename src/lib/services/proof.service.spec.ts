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
		const commitments = ['12345', '67890', '11111'];

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
			'Equipo A',
			'proc-42'
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
			commitments: ['1', '2', '3']
		});

		expect(mockFetch).not.toHaveBeenCalled();
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
				commitments: ['12345', '67890', '11111']
			})
		).rejects.toEqual({
			kind: 'merkle-failed',
			message: 'Error al generar la prueba ZK'
		});
	});

	it('converts string commitments to bigint for Group', async () => {
		const identity = new Identity('test-seed');
		const commitments = ['999999999999999999', '111111111111111111'];

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
			'Equipo B',
			'proc-43'
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

	it('throws relayer-4xx error for 4xx responses', async () => {
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
			status: 409,
			json: async () => ({ message: 'nullifier already used' })
		});

		await expect(submitVotingProof({ groupId: 'group-1', proof })).rejects.toEqual({
			kind: 'relayer-4xx',
			message: 'nullifier already used'
		});
	});

	it('throws relayer-5xx error for 5xx responses', async () => {
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
			json: async () => ({ message: 'Internal server error' })
		});

		await expect(submitVotingProof({ groupId: 'group-1', proof })).rejects.toEqual({
			kind: 'relayer-5xx',
			message: 'Relayer error: 500'
		});
	});

	it('throws validation error for 400 responses', async () => {
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
			status: 400,
			json: async () => ({ message: 'Invalid proof format' })
		});

		await expect(submitVotingProof({ groupId: 'group-1', proof })).rejects.toEqual({
			kind: 'validation',
			message: 'Invalid proof format'
		});
	});
});
