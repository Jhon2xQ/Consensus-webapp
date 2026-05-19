import type { Team } from '$lib/types/team';

export const teams: Team[] = [
	{
		id: 'team-1',
		name: 'Frente Nacional',
		avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?fn=Frente+Nacional',
		electoralProcessId: '1'
	},
	{
		id: 'team-2',
		name: 'Coalición Federal',
		avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?fn=Coalicion+Federal',
		electoralProcessId: '1'
	},
	{
		id: 'team-3',
		name: 'Unión Provincial',
		electoralProcessId: '2'
	},
	{
		id: 'team-4',
		name: 'Movimiento Popular',
		avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?fn=Movimiento+Popular',
		electoralProcessId: '2'
	},
	{
		id: 'team-5',
		name: 'Bloque Ciudadano',
		electoralProcessId: '3'
	},
	{
		id: 'team-6',
		name: 'Alianza Municipal',
		avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?fn=Alianza+Municipal',
		electoralProcessId: '4'
	},
	{
		id: 'team-7',
		name: 'Frente del Pueblo',
		electoralProcessId: '5'
	},
	{
		id: 'team-8',
		name: 'Convergencia Democrática',
		avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?fn=Convergencia+Democratica',
		electoralProcessId: '6'
	},
	{
		id: 'team-9',
		name: 'Mesa Sindical Unitaria',
		electoralProcessId: '7'
	},
	{
		id: 'team-10',
		name: 'Vecinos Organizados',
		avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?fn=Vecinos+Organizados',
		electoralProcessId: '8'
	}
];
