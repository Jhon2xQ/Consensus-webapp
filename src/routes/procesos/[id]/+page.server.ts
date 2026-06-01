import { error, fail, redirect } from '@sveltejs/kit';
import {
	getPublicProcessById,
	getProcessState,
	ProcessStateUnavailableError
} from '$lib/server/public-process.service';
import { getPublicTeamsForProcess } from '$lib/server/team.service';
import { getPublicEnrollmentSummary } from '$lib/server/public-enrollment.service';
import { getUserEnrollment, updateCommitment } from '$lib/server/enrollment.service';
import { ApiError } from '$lib/server/api';
import type { PageServerLoad, Actions } from './$types';
import type { Team } from '$lib/types/team';
import type { EnrollmentSummary, Enrollment } from '$lib/types/enrollment';

export const load: PageServerLoad = async ({ params, locals }) => {
	const id = params.id;

	const [process, teams, enrollmentSummary] = await Promise.allSettled([
		getPublicProcessById(id),
		getPublicTeamsForProcess(id),
		getPublicEnrollmentSummary(id)
	]);

	// Process 404 → error page
	if (process.status === 'rejected') {
		const err = process.reason;
		if (err instanceof ApiError && err.status === 404) {
			error(404, 'Proceso no encontrado');
		}
		error(500, 'Error al cargar el proceso');
	}

	let teamsResult: Team[] = [];
	let teamsError = false;

	if (teams.status === 'fulfilled') {
		teamsResult = teams.value;
	} else {
		teamsResult = [];
		teamsError = true;
	}

	let enrollmentResult: EnrollmentSummary | null = null;
	let enrollmentError = false;

	if (enrollmentSummary.status === 'fulfilled') {
		enrollmentResult = enrollmentSummary.value;
	} else {
		enrollmentError = true;
	}

	// Live state from the /state endpoint — used by the page badge and by
	// the action guard. Falls back to the snapshot from the detail load if
	// the live call fails, so the page can still render.
	let liveState = process.value.estatus;
	try {
		liveState = await getProcessState(id);
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) {
			error(404, 'Proceso no encontrado');
		}
		// Other failures (5xx, network) → degrade silently to the snapshot
	}

	// User enrollment for passkey/commitment integration
	const userSub = locals.user?.sub ?? null;
	let userEnrollment: Enrollment | null = null;

	if (userSub) {
		try {
			userEnrollment = await getUserEnrollment(locals, id, userSub);
		} catch {
			userEnrollment = null;
		}
	}

	return {
		process: process.value,
		liveState,
		teams: teamsResult,
		enrollmentSummary: enrollmentResult,
		teamsError,
		enrollmentError,
		userSub,
		userEnrollment
	};
};

export const actions = {
	'update-commitment': async ({ params, locals, request }) => {
		const processId = params.id;
		const formData = await request.formData();
		const commitment = (formData.get('commitment') as string)?.trim();

		if (!commitment) {
			return fail(400, { error: 'El compromiso es obligatorio' });
		}

		// Live state guard — the /state endpoint returns the real-time phase,
		// so we never submit a commitment when the process has moved on.
		try {
			const state = await getProcessState(processId);
			if (state !== 'COMMITMENT') {
				return fail(400, { error: 'El proceso no está en fase de compromiso' });
			}
		} catch (err) {
			if (err instanceof ApiError && err.status === 404) {
				return fail(404, { error: 'Proceso no encontrado' });
			}
			if (err instanceof ProcessStateUnavailableError) {
				return fail(503, { error: 'No se pudo verificar el estado del proceso' });
			}
			throw err;
		}

		try {
			await updateCommitment(locals, processId, commitment);
		} catch (err) {
			if (err instanceof ApiError) {
				return fail(err.status, { error: err.message });
			}
			throw err;
		}

		throw redirect(303, '/procesos/' + processId);
	}
} satisfies Actions;
