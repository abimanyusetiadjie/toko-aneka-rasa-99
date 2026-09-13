import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Jika tidak ada session user, lempar ke login
	if (!locals.user) {
		throw redirect(303, `/login?redirect=${url.pathname}`);
	}

	return {
		user: locals.user
	};
};
