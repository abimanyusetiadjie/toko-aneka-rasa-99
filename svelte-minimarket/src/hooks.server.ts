import { verifySessionToken } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// 1. Ambil session_token dari cookies
	const sessionToken = event.cookies.get('session_token');

	if (sessionToken) {
		const user = await verifySessionToken(sessionToken);
		if (user) {
			event.locals.user = user;
		}
	}

	// Lanjutkan request
	return resolve(event);
};
