import type { ElectoralProcess } from '$lib/types/electoral-process';

// Mock data anchored to a fixed "now" of 2026-06-01 so the estatus
// distribution covers all six states regardless of when the test runs.
// Each process is one state — used by the dashboard distribution and
// status bar / ProcessList / ProcessTable / procesos page badge tests.
export const electoralProcesses: ElectoralProcess[] = [
	{
		id: '1',
		name: 'Elecciones Nacionales 2026',
		scope: 'Nacional',
		description: null,
		groupId: null,
		estatus: 'OPEN',
		commitmentStart: '2026-07-01T00:00:00Z',
		commitmentEnd: '2026-08-30T00:00:00Z',
		votingStart: '2026-09-15T00:00:00Z',
		votingEnd: '2026-09-20T00:00:00Z',
		results: '2026-09-25T00:00:00Z',
		createdBy: 'user-1'
	},
	{
		id: '2',
		name: 'Elecciones Provinciales Buenos Aires',
		scope: 'Provincial',
		description: null,
		groupId: null,
		estatus: 'COMMITMENT',
		commitmentStart: '2026-05-01T00:00:00Z',
		commitmentEnd: '2026-07-15T00:00:00Z',
		votingStart: '2026-08-01T00:00:00Z',
		votingEnd: '2026-08-05T00:00:00Z',
		results: '2026-08-10T00:00:00Z',
		createdBy: 'user-1'
	},
	{
		id: '3',
		name: 'Consulta Popular Vinculante',
		scope: 'Nacional',
		description: null,
		groupId: null,
		estatus: 'SEALED',
		commitmentStart: '2026-03-01T00:00:00Z',
		commitmentEnd: '2026-05-15T00:00:00Z',
		votingStart: '2026-06-10T00:00:00Z',
		votingEnd: '2026-06-12T00:00:00Z',
		results: '2026-06-15T00:00:00Z',
		createdBy: 'user-1'
	},
	{
		id: '4',
		name: 'Elecciones Municipales Córdoba',
		scope: 'Municipal',
		description: null,
		groupId: null,
		estatus: 'VOTING',
		commitmentStart: '2026-02-01T00:00:00Z',
		commitmentEnd: '2026-03-15T00:00:00Z',
		votingStart: '2026-05-25T00:00:00Z',
		votingEnd: '2026-06-10T00:00:00Z',
		results: '2026-06-15T00:00:00Z',
		createdBy: 'user-1'
	},
	{
		id: '5',
		name: 'Referéndum Nacional',
		scope: 'Nacional',
		description: null,
		groupId: null,
		estatus: 'COUNTING',
		commitmentStart: '2026-01-15T00:00:00Z',
		commitmentEnd: '2026-03-01T00:00:00Z',
		votingStart: '2026-04-01T00:00:00Z',
		votingEnd: '2026-05-15T00:00:00Z',
		results: '2026-06-10T00:00:00Z',
		createdBy: 'user-1'
	},
	{
		id: '6',
		name: 'Primarias Abiertas',
		scope: 'Nacional',
		description: null,
		groupId: null,
		estatus: 'CLOSED',
		commitmentStart: '2025-09-01T00:00:00Z',
		commitmentEnd: '2025-10-15T00:00:00Z',
		votingStart: '2025-11-10T00:00:00Z',
		votingEnd: '2025-11-15T00:00:00Z',
		results: '2025-11-20T00:00:00Z',
		createdBy: 'user-1'
	}
];
