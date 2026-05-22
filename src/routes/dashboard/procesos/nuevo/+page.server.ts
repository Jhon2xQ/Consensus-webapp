import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createProcess, type CreateProcessBody } from '$lib/server/process.service';
import { createTeam } from '$lib/server/team.service';
import { createEnrollment } from '$lib/server/enrollment.service';
import { ApiError } from '$lib/server/api';

type FormErrors = Record<string, string>;

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();

		const name = formData.get('name') as string;
		const scope = formData.get('scope') as string;
		const description = formData.get('description') as string;
		const commitmentStart = formData.get('commitmentStart') as string;
		const commitmentEnd = formData.get('commitmentEnd') as string;
		const votingStart = formData.get('votingStart') as string;
		const votingEnd = formData.get('votingEnd') as string;
		const results = formData.get('results') as string;
		const action = formData.get('_action') as string;

		const errors: FormErrors = {};

		// Required field validation
		if (!name?.trim()) {
			errors.name = 'El nombre es obligatorio';
		}

		if (!scope?.trim()) {
			errors.scope = 'El ámbito es obligatorio';
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

		// If there are field errors, return them
		if (Object.keys(errors).length > 0) {
			return fail(400, {
				errors,
				values: {
					name,
					scope,
					description,
					commitmentStart,
					commitmentEnd,
					votingStart,
					votingEnd,
					results
				}
			});
		}

		const body: CreateProcessBody = {
			name: name.trim(),
			scope: scope.trim(),
			description: description?.trim() || undefined,
			commitmentStart,
			commitmentEnd,
			votingStart,
			votingEnd,
			results
		};

		// ── "finalizar" action: create process + teams + enrollments ──
		if (action === 'finalizar') {
			// Parse teams and enrollments from hidden JSON fields
			const teamsStr = formData.get('_teams') as string;
			const enrollmentsStr = formData.get('_enrollments') as string;

			let teams: { name: string; avatarUrl?: string | null }[] = [];
			let enrollments: { email: string }[] = [];

			try {
				teams = JSON.parse(teamsStr || '[]');
				enrollments = JSON.parse(enrollmentsStr || '[]');
			} catch {
				return fail(400, {
					errors: { _form: 'Error al procesar los datos de equipos o votantes' },
					values: { name, scope, description, commitmentStart, commitmentEnd, votingStart, votingEnd, results }
				});
			}

			// Validate at least one team
			if (teams.length === 0) {
				return fail(400, {
					errors: { _form: 'Debe agregar al menos un equipo al proceso electoral' },
					values: { name, scope, description, commitmentStart, commitmentEnd, votingStart, votingEnd, results }
				});
			}

			// Validate at least one enrollment
			if (enrollments.length === 0) {
				return fail(400, {
					errors: { _form: 'Debe agregar al menos un votante al proceso electoral' },
					values: { name, scope, description, commitmentStart, commitmentEnd, votingStart, votingEnd, results }
				});
			}

			// 1. Create the process
			let process;
			try {
				process = await createProcess(locals, body);
			} catch (err) {
				if (err instanceof ApiError) {
					if (err.status === 409) {
						return fail(409, {
							errors: { name: 'Ya existe un proceso con ese nombre' },
							values: { name, scope, description, commitmentStart, commitmentEnd, votingStart, votingEnd, results }
						});
					}
					return fail(err.status, {
						errors: { _form: err.message },
						values: { name, scope, description, commitmentStart, commitmentEnd, votingStart, votingEnd, results }
					});
				}
				throw err;
			}

			// 2. Create teams
			for (const team of teams) {
				try {
					await createTeam(locals, process.id, {
						name: team.name,
						avatarUrl: team.avatarUrl || null
					});
				} catch (err) {
					if (err instanceof ApiError) {
						return fail(err.status, {
							errors: { _form: `Error al crear el equipo "${team.name}": ${err.message}` },
							values: { name, scope, description, commitmentStart, commitmentEnd, votingStart, votingEnd, results }
						});
					}
					throw err;
				}
			}

			// 3. Create enrollments
			for (const enrollment of enrollments) {
				try {
					await createEnrollment(locals, process.id, {
						email: enrollment.email
					});
				} catch (err) {
					if (err instanceof ApiError) {
						return fail(err.status, {
							errors: { _form: `Error al registrar el votante "${enrollment.email}": ${err.message}` },
							values: { name, scope, description, commitmentStart, commitmentEnd, votingStart, votingEnd, results }
						});
					}
					throw err;
				}
			}

			throw redirect(303, '/dashboard/procesos?success=Proceso+creado+exitosamente');
		}

		// ── Simple create (backward compatible) ──
		try {
			await createProcess(locals, body);
		} catch (err) {
			if (err instanceof ApiError) {
				if (err.status === 409) {
					return fail(409, {
						errors: { name: 'Ya existe un proceso con ese nombre' },
						values: { name, scope, description, commitmentStart, commitmentEnd, votingStart, votingEnd, results }
					});
				}
				return fail(err.status, {
					errors: { _form: err.message },
					values: { name, scope, description, commitmentStart, commitmentEnd, votingStart, votingEnd, results }
				});
			}
			throw err;
		}

		throw redirect(303, '/dashboard/procesos?success=Proceso+creado+exitosamente');
	}
} satisfies Actions;
