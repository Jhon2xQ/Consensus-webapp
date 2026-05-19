import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { electoralProcesses } from '$lib/mock/electoral-processes';

export const load: PageServerLoad = async () => {
	return { processes: electoralProcesses };
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
