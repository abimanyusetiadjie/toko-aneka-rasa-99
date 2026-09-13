import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Jika tidak ada session user, lempar ke login
	if (!locals.user) {
		throw redirect(303, `/login?redirect=${url.pathname}`);
	}

	// Role RBAC: Hanya akun terdaftar (Owner 1 & Kasir 2) yang dapat masuk ke panel admin
	if (locals.user.role_id > 2) {
		throw redirect(303, '/pos');
	}

	return {
		user: locals.user
	};
};
