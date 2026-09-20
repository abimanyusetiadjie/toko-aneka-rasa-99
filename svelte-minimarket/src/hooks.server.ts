import { verifySessionToken } from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// 1. Ambil session_token dari cookies
	const sessionToken = event.cookies.get('session_token');

	if (sessionToken) {
		const user = await verifySessionToken(sessionToken);
		if (user) {
			event.locals.user = user;
		}
	}

	// 2. Proteksi rute internal: /admin, /pos, dll. Wajib login.
	const path = event.url.pathname;
	if ((path.startsWith('/admin') || path.startsWith('/pos')) && !event.locals.user) {
		throw redirect(303, `/login?redirect=${encodeURIComponent(path)}`);
	}

	// Lanjutkan request
	return resolve(event);
};
