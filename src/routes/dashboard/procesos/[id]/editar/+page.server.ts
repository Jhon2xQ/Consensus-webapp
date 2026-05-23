import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getProcessById, updateProcess, deleteProcess, type CreateProcessBody } from '$lib/server/process.service';
import { getTeams, createTeam, deleteTeam } from '$lib/server/team.service';
import { getEnrollments, createEnrollment, deleteEnrollment } from '$lib/server/enrollment.service';
import { ApiError } from '$lib/server/api';

type FormErrors = Record<string, string>;

export const load: PageServerLoad = async ({ params, locals }) => {
	try {
		const [process, teams, enrollments] = await Promise.all([
			getProcessById(locals, params.id),
			getTeams(locals, params.id).catch(() => []),
			getEnrollments(locals, params.id).catch(() => [])
		]);
		return { process, teams, enrollments };
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) {
			error(404, 'Proceso electoral no encontrado');
		}
		throw err;
	}
};

export const actions = {
	default: async ({ request, params, locals }) => {
		const formData = await request.formData();

		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const commitmentStart = formData.get('commitmentStart') as string;
		const commitmentEnd = formData.get('commitmentEnd') as string;
		const votingStart = formData.get('votingStart') as string;
		const votingEnd = formData.get('votingEnd') as string;
		const results = formData.get('results') as string;

		const errors: FormErrors = {};

		// Required field validation
		if (!name?.trim()) {
			errors.name = 'El nombre es obligatorio';
		}

		if (!commitmentStart) {
			errors.commitmentStart = 'La fecha de inicio de compromiso es obligatoria';
		}

		if (!commitmentEnd) {
			errors.commitmentEnd = 'La fecha de fin de compromiso es obligatoria';
		}

		if (!votingStart) {
			errors.votingStart = 'La fecha de inicio de votación es obligatoria';
		}

		if (!votingEnd) {
			errors.votingEnd = 'La fecha de fin de votación es obligatoria';
		}

		if (!results) {
			errors.results = 'La fecha de resultados es obligatoria';
		}

		// Date order validation
		if (commitmentStart && commitmentEnd) {
			if (new Date(commitmentStart) >= new Date(commitmentEnd)) {
				errors.commitmentEnd = 'La fecha de fin debe ser posterior al inicio del compromiso';
			}
		}

		if (votingStart && votingEnd) {
			if (new Date(votingStart) >= new Date(votingEnd)) {
				errors.votingEnd = 'La fecha de fin debe ser posterior al inicio de la votación';
			}
		}

		if (commitmentEnd && votingStart) {
			if (new Date(commitmentEnd) >= new Date(votingStart)) {
				errors.votingStart = 'La votación debe comenzar después del período de compromiso';
			}
		}

		if (votingEnd && results) {
			if (new Date(votingEnd) >= new Date(results)) {
				errors.results = 'La fecha de resultados debe ser posterior al fin de la votación';
			}
		}

		// If there are errors, return them with the submitted values
		if (Object.keys(errors).length > 0) {
			return fail(400, {
				errors,
				values: {
					name,
					description,
					commitmentStart,
					commitmentEnd,
					votingStart,
					votingEnd,
					results
				}
			});
		}

		const body: Partial<CreateProcessBody> = {
			name: name.trim(),
			scope: name.trim(),
			description: description?.trim() || undefined,
			commitmentStart,
			commitmentEnd,
			votingStart,
			votingEnd,
			results
		};

		try {
			await updateProcess(locals, params.id, body);
		} catch (err) {
			if (err instanceof ApiError) {
				if (err.status === 404) {
					error(404, 'Proceso electoral no encontrado');
				}
				if (err.status === 409) {
					return fail(409, {
						errors: { name: 'Ya existe un proceso con ese nombre' },
						values: { name, description, commitmentStart, commitmentEnd, votingStart, votingEnd, results }
					});
				}
				return fail(err.status, {
					errors: { _form: err.message },
					values: { name, description, commitmentStart, commitmentEnd, votingStart, votingEnd, results }
				});
			}
			throw err;
		}

		throw redirect(303, `/dashboard/procesos/${params.id}?success=Proceso+actualizado+exitosamente`);
	},

	agregarEquipo: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const teamName = formData.get('teamName') as string;
		const avatarUrl = formData.get('avatarUrl') as string;

		// Validate
		if (!teamName?.trim()) {
			return fail(400, { errors: { teamName: 'El nombre del equipo es obligatorio' } });
		}
		if (teamName.trim().length < 2) {
			return fail(400, { errors: { teamName: 'El nombre debe tener al menos 2 caracteres' } });
		}
		if (teamName.trim().length > 100) {
			return fail(400, { errors: { teamName: 'El nombre no puede exceder 100 caracteres' } });
		}

		try {
			await createTeam(locals, params.id, {
				name: teamName.trim(),
				avatarUrl: avatarUrl?.trim() || undefined
			});
			return { success: true };
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { errors: { _form: err.message } });
			}
			throw err;
		}
	},

	eliminarEquipo: async ({ request, locals }) => {
		const formData = await request.formData();
		const teamId = formData.get('teamId') as string;

		if (!teamId?.trim()) {
			return fail(400, { errors: { _form: 'ID de equipo requerido' } });
		}

		try {
			await deleteTeam(locals, teamId.trim());
			return { success: true };
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { errors: { _form: err.message } });
			}
			throw err;
		}
	},

	agregarVotante: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const email = (formData.get('email') as string)?.trim();

		if (!email) {
			return fail(400, { errors: { email: 'El email es obligatorio' } });
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return fail(400, { errors: { email: 'El email no es válido' } });
		}

		try {
			await createEnrollment(locals, params.id, { email });
			return { success: true };
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { errors: { _form: err.message } });
			}
			throw err;
		}
	},

	eliminarVotante: async ({ request, locals }) => {
		const formData = await request.formData();
		const enrollmentId = formData.get('enrollmentId') as string;

		if (!enrollmentId?.trim()) {
			return fail(400, { errors: { _form: 'ID de inscripción requerido' } });
		}

		try {
			await deleteEnrollment(locals, enrollmentId.trim());
			return { success: true };
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { errors: { _form: err.message } });
			}
			throw err;
		}
	},

	eliminar: async ({ params, locals }) => {
		try {
			await deleteProcess(locals, params.id);
		} catch (err) {
			if (err instanceof ApiError) {
				if (err.status === 404) {
					error(404, 'Proceso electoral no encontrado');
				}
				return fail(err.status, {
					errors: { _form: err.message }
				});
			}
			throw err;
		}

		throw redirect(303, '/dashboard/procesos?success=Proceso+eliminado+exitosamente');
	}
} satisfies Actions;
