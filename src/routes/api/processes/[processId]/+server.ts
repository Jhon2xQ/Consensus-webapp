import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteProcess } from '$lib/server/process.service';
import { ApiError } from '$lib/server/api';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	try {
		await deleteProcess(locals, params.processId);
		return json({ success: true, message: 'Proceso eliminado exitosamente' });
	} catch (err) {
		if (err instanceof ApiError) {
			return json({ success: false, message: err.message }, { status: err.status });
		}
		return json(
			{ success: false, message: 'Error interno al eliminar el proceso' },
			{ status: 500 }
		);
	}
};
