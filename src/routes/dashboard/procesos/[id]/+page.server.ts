import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { electoralProcesses } from '$lib/mock/electoral-processes';
import { teams } from '$lib/mock/teams';

type FormErrors = Record<string, string>;

export const load: PageServerLoad = async ({ params }) => {
	const process = electoralProcesses.find((p) => p.id === params.id);

	if (!process) {
		error(404, 'Proceso electoral no encontrado');
	}

	const processTeams = teams.filter((t) => t.electoralProcessId === params.id);

	return { process, teams: processTeams };
};

export const actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID de proceso requerido' });
		}

		// Mock delete — in production this would call the backend API
		throw redirect(303, '/dashboard/procesos');
	},

	createTeam: async ({ request, params }) => {
		const formData = await request.formData();
		const name = (formData.get('name') as string)?.trim();
		const avatarUrl = (formData.get('avatarUrl') as string)?.trim();

		const errors: FormErrors = {};

		if (!name) {
			errors.name = 'El nombre del equipo es obligatorio';
		} else if (name.length < 2) {
			errors.name = 'El nombre debe tener al menos 2 caracteres';
		} else if (name.length > 100) {
			errors.name = 'El nombre no puede exceder 100 caracteres';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				action: 'createTeam',
				errors,
				values: { name, avatarUrl }
			});
		}

		// Mock create — in production this would call POST /api/private/processes/{pid}/teams
		// For now, redirect back to the same page
		throw redirect(303, `/dashboard/procesos/${params.id}`);
	},

	updateTeam: async ({ request, params }) => {
		const formData = await request.formData();
		const teamId = formData.get('teamId') as string;
		const name = (formData.get('name') as string)?.trim();
		const avatarUrl = (formData.get('avatarUrl') as string)?.trim();

		const errors: FormErrors = {};

		if (!teamId) {
			return fail(400, { error: 'ID de equipo requerido' });
		}

		if (!name) {
			errors.name = 'El nombre del equipo es obligatorio';
		} else if (name.length < 2) {
			errors.name = 'El nombre debe tener al menos 2 caracteres';
		} else if (name.length > 100) {
			errors.name = 'El nombre no puede exceder 100 caracteres';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				action: 'updateTeam',
				errors,
				values: { teamId, name, avatarUrl }
			});
		}

		// Mock update — in production this would call PUT /api/private/teams/{id}
		throw redirect(303, `/dashboard/procesos/${params.id}`);
	},

	deleteTeam: async ({ request, params }) => {
		const formData = await request.formData();
		const teamId = formData.get('teamId') as string;

		if (!teamId) {
			return fail(400, { error: 'ID de equipo requerido' });
		}

		// Mock delete — in production this would call DELETE /api/private/teams/{id}
		throw redirect(303, `/dashboard/procesos/${params.id}`);
	}
} satisfies Actions;
