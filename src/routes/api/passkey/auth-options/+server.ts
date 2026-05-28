import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateChallenge, extractRpId } from '$lib/utils/webauthn';

export const POST: RequestHandler = async ({ request }) => {
	const challenge = generateChallenge();
	const rpId = extractRpId(request.headers.get('host'));

	return json({
		challenge,
		timeout: 60000,
		userVerification: 'preferred',
		rpId
	});
};
