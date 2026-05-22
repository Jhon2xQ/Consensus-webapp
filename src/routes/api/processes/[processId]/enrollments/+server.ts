import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createEnrollment, deleteEnrollment, getEnrollments } from '$lib/server/enrollment.service';
import { ApiError } from '$lib/server/api';

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const enrollments = await getEnrollments(locals, params.processId);
		return json({ success: true, data: enrollments });
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
		const enrollment = await createEnrollment(locals, params.processId, body);
		return json({ success: true, data: enrollment }, { status: 201 });
	} catch (err) {
		if (err instanceof ApiError) {
			return json({ success: false, message: err.message }, { status: err.status });
		}
		throw err;
	}
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
	try {
		const { enrollmentId } = await request.json();
		await deleteEnrollment(locals, enrollmentId);
		return json({ success: true });
	} catch (err) {
		if (err instanceof ApiError) {
			return json({ success: false, message: err.message }, { status: err.status });
		}
		throw err;
	}
};
