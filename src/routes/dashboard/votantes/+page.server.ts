import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getMyProcesses } from '$lib/server/process.service';
import { getEnrollments, createEnrollment, deleteEnrollment } from '$lib/server/enrollment.service';
import { ApiError } from '$lib/server/api';

type FormErrors = Record<string, string>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const load: PageServerLoad = async ({ url, locals }) => {
	const processes = await getMyProcesses(locals, { size: 50 });
	const processId = url.searchParams.get('processId') ?? undefined;

	if (processId) {
		const enrollments = await getEnrollments(locals, processId);
		return { processes, enrollments, selectedProcessId: processId };
	}

	return { processes };
};

export const actions = {
	'crear-votante': async ({ request, locals }) => {
		const formData = await request.formData();

		const processId = (formData.get('processId') as string)?.trim();
		const email = (formData.get('email') as string)?.trim();

		const errors: FormErrors = {};

		if (!processId) {
			errors.processId = 'El proceso es obligatorio';
		}

		if (!email) {
			errors.email = 'El email es obligatorio';
		} else if (!EMAIL_REGEX.test(email)) {
			errors.email = 'El formato del email es inválido';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors });
		}

		try {
			await createEnrollment(locals, processId!, [{ email: email! }]);
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { errors: { _form: err.message } });
			}
			throw err;
		}

		throw redirect(303, `/dashboard/votantes?processId=${processId}&success=Votante+agregado+exitosamente`);
	},

	'eliminar-votante': async ({ request, locals }) => {
		const formData = await request.formData();

		const enrollmentId = (formData.get('enrollmentId') as string)?.trim();
		const processId = (formData.get('processId') as string)?.trim();

		const errors: FormErrors = {};

		if (!enrollmentId) {
			errors.enrollmentId = 'El votante es obligatorio';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors });
		}

		try {
			await deleteEnrollment(locals, enrollmentId!);
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { errors: { _form: err.message } });
			}
			throw err;
		}

		throw redirect(303, `/dashboard/votantes?processId=${processId}&success=Votante+eliminado+exitosamente`);
	}
} satisfies Actions;
