import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createTeam, deleteTeam, getTeams } from '$lib/server/team.service';
import { ApiError } from '$lib/server/api';

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const teams = await getTeams(locals, params.processId);
		return json({ success: true, data: teams });
	} catch (err) {
		if (err instanceof ApiError) {
			return json({ success: false, message: err.message }, { status: err.status });
		}
		throw err;
	}
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	try {
		const body = await request.json();
		const team = await createTeam(locals, params.processId, body);
		return json({ success: true, data: team }, { status: 201 });
	} catch (err) {
		if (err instanceof ApiError) {
			return json({ success: false, message: err.message }, { status: err.status });
		}
		throw err;
	}
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
	try {
		const { teamId } = await request.json();
		await deleteTeam(locals, teamId);
		return json({ success: true });
	} catch (err) {
		if (err instanceof ApiError) {
			return json({ success: false, message: err.message }, { status: err.status });
		}
		throw err;
	}
};
