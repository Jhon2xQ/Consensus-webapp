import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getMyProcesses, deleteProcess } from '$lib/server/process.service';
import { ApiError } from '$lib/server/api';

export const load: PageServerLoad = async ({ locals, url }) => {
	const rawSize = url.searchParams.get('size') ?? '5';
	const sizeNum = parseInt(rawSize, 10);
	const size = [5, 10, 20].includes(sizeNum) ? sizeNum : 5;

	try {
		const processes = await getMyProcesses(locals, { size });
		return { processes, error: null };
	} catch (e) {
		const message =
			e instanceof ApiError && e.status === 401
				? 'No estás autenticado'
				: 'Error al cargar los procesos. Intentalo de nuevo más tarde.';
		return { processes: [], error: message };
	}
};

export const actions = {
	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID de proceso requerido' });
		}

		try {
			await deleteProcess(locals, id);
			return { success: true };
		} catch (e) {
			if (e instanceof ApiError) {
				if (e.status === 401) {
					return fail(401, { error: 'No estás autenticado' });
				}
				if (e.status === 404) {
					return fail(404, { error: 'Proceso no encontrado' });
				}
			}
			return fail(500, { error: 'Error al eliminar el proceso' });
		}
	}
} satisfies Actions;
