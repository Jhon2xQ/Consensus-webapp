import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { generateChallenge, extractRpId } from '$lib/utils/webauthn';

const RegisterOptionsSchema = z.object({
	userId: z.string().min(1),
	userName: z.string().min(1)
});

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const result = RegisterOptionsSchema.safeParse(body);

	if (!result.success) {
		return json({ error: 'Invalid request body' }, { status: 400 });
	}

	const { userId, userName } = result.data;
	const challenge = generateChallenge();
	const rpId = extractRpId(request.headers.get('host'));

	return json({
		challenge,
		rp: { name: 'Consensus', id: rpId },
		user: { id: userId, name: userName, displayName: userName },
		pubKeyCredParams: [
			{ type: 'public-key', alg: -7 },
			{ type: 'public-key', alg: -257 }
		],
		timeout: 60000,
		attestation: 'none',
		authenticatorSelection: {
			residentKey: 'preferred',
			userVerification: 'preferred'
		}
	});
};
