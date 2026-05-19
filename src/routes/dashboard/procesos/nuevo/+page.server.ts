import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

type FormErrors = Record<string, string>;

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const name = formData.get('name') as string;
		const scope = formData.get('scope') as string;
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

		// If there are errors, return them
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

		// Simulate success — in production this would call the backend API
		// Mock: generate an ID and redirect
		const newId = `proc-${Date.now()}`;

		// In a real app, we would save to database here
		// For now, just redirect to the procesos list
		throw redirect(303, '/dashboard/procesos');
	}
} satisfies Actions;
