import { error } from '@sveltejs/kit';
import { getPublicProcessById } from '$lib/server/public-process.service';
import { getPublicTeamsForProcess } from '$lib/server/team.service';
import { getPublicEnrollmentSummary } from '$lib/server/public-enrollment.service';
import { ApiError } from '$lib/server/api';
import type { PageServerLoad } from './$types';
import type { Team } from '$lib/types/team';
import type { EnrollmentSummary } from '$lib/types/enrollment';

export const load: PageServerLoad = async ({ params }) => {
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

	return {
		process: process.value,
		teams: teamsResult,
		enrollmentSummary: enrollmentResult,
		teamsError,
		enrollmentError
	};
};
