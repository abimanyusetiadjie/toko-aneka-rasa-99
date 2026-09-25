import { verifySessionToken } from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// 1. Ambil & verifikasi session_token dari cookies
	const sessionToken = event.cookies.get('session_token');

	if (sessionToken) {
		const user = await verifySessionToken(sessionToken);
		if (user) {
			event.locals.user = user;
		} else {
			// Token tidak valid atau kedaluwarsa -> bersihkan cookie
			event.cookies.delete('session_token', { path: '/' });
		}
	}

	const path = event.url.pathname;

	// 2. Filter ketat: Proteksi API internal (/api/pos, /api/shopee non-webhook)
	const isInternalApi =
		path.startsWith('/api/pos') ||
		(path.startsWith('/api/shopee') && !path.startsWith('/api/webhooks/shopee') && !path.startsWith('/api/shopee/status'));

	if (isInternalApi && !event.locals.user) {
		return new Response(
			JSON.stringify({
				status: 'error',
				error: 'Akses Ditolak: Anda harus login untuk mengakses layanan sistem ini.'
			}),
			{
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}

	// 3. Filter ketat: Proteksi rute halaman sistem (/admin, /pos)
	// Siapapun yang belum login langsung dialihkan ke /login
	const isSystemPage = path.startsWith('/admin') || path.startsWith('/pos');

	if (isSystemPage && !event.locals.user) {
		throw redirect(303, `/login?redirect=${encodeURIComponent(path)}`);
	}

	// 4. Filter ketat: Role-Based Authorization
	// Kasir (role_id === 2) dilarang masuk ke halaman admin omset & manajemen pegawai
	if (path.startsWith('/admin') && event.locals.user && event.locals.user.role_id > 1) {
		if (path.startsWith('/admin/dashboard') || path.startsWith('/admin/pegawai')) {
			throw redirect(303, '/pos');
		}
	}

	// Lanjutkan request
	return resolve(event);
};
