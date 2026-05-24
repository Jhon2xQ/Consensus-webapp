import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getMyProcesses } from '$lib/server/process.service';
import { getTeams, createTeam, updateTeam, deleteTeam } from '$lib/server/team.service';
import { ApiError } from '$lib/server/api';

type FormErrors = Record<string, string>;

export const load: PageServerLoad = async ({ url, locals }) => {
	const processes = await getMyProcesses(locals, { size: 50 });
	const processId = url.searchParams.get('processId') ?? undefined;

	if (processId) {
		const teams = await getTeams(locals, processId);
		return { processes, teams, selectedProcessId: processId };
	}

	return { processes };
};

export const actions = {
	'crear-equipo': async ({ request, locals }) => {
		const formData = await request.formData();

		const processId = (formData.get('processId') as string)?.trim();
		const name = (formData.get('name') as string)?.trim();
		const avatarUrlRaw = formData.get('avatarUrl') as string;
		const avatarUrl = avatarUrlRaw?.trim() || null;

		const errors: FormErrors = {};

		if (!processId) {
			errors.processId = 'El proceso es obligatorio';
		}

		if (!name) {
			errors.name = 'El nombre es obligatorio';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors });
		}

		try {
			await createTeam(locals, processId!, [{ name: name!, avatarUrl }]);
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { errors: { _form: err.message } });
			}
			throw err;
		}

		throw redirect(303, `/dashboard/equipos?processId=${processId}&success=Equipo+creado+exitosamente`);
	},

	'editar-equipo': async ({ request, locals }) => {
		const formData = await request.formData();

		const teamId = (formData.get('teamId') as string)?.trim();
		const processId = (formData.get('processId') as string)?.trim();
		const name = (formData.get('name') as string)?.trim();
		const avatarUrlRaw = formData.get('avatarUrl') as string;
		const avatarUrl = avatarUrlRaw?.trim() || null;

		const errors: FormErrors = {};

		if (!teamId) {
			errors.teamId = 'El equipo es obligatorio';
		}

		if (!name) {
			errors.name = 'El nombre es obligatorio';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors });
		}

		try {
			await updateTeam(locals, teamId!, { name: name!, avatarUrl });
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { errors: { _form: err.message } });
			}
			throw err;
		}

		throw redirect(303, `/dashboard/equipos?processId=${processId}&success=Equipo+actualizado+exitosamente`);
	},

	'eliminar-equipo': async ({ request, locals }) => {
		const formData = await request.formData();

		const teamId = (formData.get('teamId') as string)?.trim();
		const processId = (formData.get('processId') as string)?.trim();

		const errors: FormErrors = {};

		if (!teamId) {
			errors.teamId = 'El equipo es obligatorio';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors });
		}

		try {
			await deleteTeam(locals, teamId!);
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { errors: { _form: err.message } });
			}
			throw err;
		}

		throw redirect(303, `/dashboard/equipos?processId=${processId}&success=Equipo+eliminado+exitosamente`);
	}
} satisfies Actions;
