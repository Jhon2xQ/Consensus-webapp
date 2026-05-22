import type { Enrollment } from '$lib/types/enrollment';

export const enrollments: Enrollment[] = [
	// Process 1 — COMMITMENT phase (hasVoted: false)
	{
		id: 'enr-1',
		electoralProcessId: '1',
		email: 'user-101@example.com',
		userId: 'user-101',
		commitment: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
		hasVoted: false
	},
	{
		id: 'enr-2',
		electoralProcessId: '1',
		email: 'user-102@example.com',
		userId: 'user-102',
		commitment: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab',
		hasVoted: false
	},
	{
		id: 'enr-3',
		electoralProcessId: '1',
		email: 'user-103@example.com',
		userId: 'user-103',
		commitment: '0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
		hasVoted: false
	},
	// Process 2 — COMMITMENT phase (hasVoted: false)
	{
		id: 'enr-4',
		electoralProcessId: '2',
		email: 'user-201@example.com',
		userId: 'user-201',
		commitment: '0x4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
		hasVoted: false
	},
	{
		id: 'enr-5',
		electoralProcessId: '2',
		email: 'user-202@example.com',
		userId: 'user-202',
		commitment: '0x5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
		hasVoted: false
	},
	// Process 4 — VOTING phase (hasVoted: mixed)
	{
		id: 'enr-6',
		electoralProcessId: '4',
		email: 'user-401@example.com',
		userId: 'user-401',
		commitment: '0x6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
		hasVoted: true
	},
	{
		id: 'enr-7',
		electoralProcessId: '4',
		email: 'user-402@example.com',
		userId: 'user-402',
		commitment: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
		hasVoted: false
	},
	// Process 5 — VOTING phase (hasVoted: mixed)
	{
		id: 'enr-8',
		electoralProcessId: '5',
		email: 'user-501@example.com',
		userId: 'user-501',
		commitment: '0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678',
		hasVoted: true
	},
	{
		id: 'enr-9',
		electoralProcessId: '5',
		email: 'user-502@example.com',
		userId: 'user-502',
		commitment: '0x90abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
		hasVoted: true
	},
	// Process 7 — CLOSED phase (hasVoted: true)
	{
		id: 'enr-10',
		electoralProcessId: '7',
		email: 'user-701@example.com',
		userId: 'user-701',
		commitment: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
		hasVoted: true
	},
	{
		id: 'enr-11',
		electoralProcessId: '7',
		email: 'user-702@example.com',
		userId: 'user-702',
		commitment: '0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc',
		hasVoted: true
	},
	// Process 8 — CLOSED phase (hasVoted: true)
	{
		id: 'enr-12',
		electoralProcessId: '8',
		email: 'user-801@example.com',
		userId: 'user-801',
		commitment: '0xcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd',
		hasVoted: true
	}
];
