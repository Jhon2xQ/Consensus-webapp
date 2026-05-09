import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	try {
		return {
			user: locals.user ?? null,
		};
	} catch {
		return { user: null };
	}
};
