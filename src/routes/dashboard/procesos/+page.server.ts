import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getMyProcesses } from '$lib/server/process.service';
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
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID de proceso requerido' });
		}

		// Mock delete — in production this would call the backend API
		return { success: true };
	}
} satisfies Actions;
