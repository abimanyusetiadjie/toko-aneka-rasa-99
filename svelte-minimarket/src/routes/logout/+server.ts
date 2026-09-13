import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, locals }) => {
	// Hapus cookie
	cookies.delete('session_token', { path: '/' });
	locals.user = undefined;
	
	throw redirect(303, '/login');
};
