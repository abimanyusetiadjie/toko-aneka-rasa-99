import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { query } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login?redirect=/portal');
	}

	const isOwner = locals.user.role_id === 1 || locals.user.username?.toLowerCase().includes('owner');

	// Ambil ringkasan live data toko untuk kartu launcher
	let productCount = 244;
	let todaySales = 0;
	let lowStockCount = 0;

	try {
		const [pRes, tRes, lsRes] = await Promise.all([
			query(`SELECT COUNT(*) as count FROM products WHERE (is_active = true OR is_active IS NULL)`),
			query(`SELECT COALESCE(SUM(total_amount), 0) as total FROM transactions WHERE created_at >= CURRENT_DATE`),
			query(`SELECT COUNT(*) as count FROM products WHERE (is_active = true OR is_active IS NULL) AND stock < 5`)
		]);
		if (pRes[0]?.count) productCount = Number(pRes[0].count);
		if (tRes[0]?.total) todaySales = Number(tRes[0].total);
		if (lsRes[0]?.count) lowStockCount = Number(lsRes[0].count);
	} catch (e) {
		// Fallback jika query gagal
	}

	return {
		user: locals.user,
		isOwner,
		productCount,
		todaySales,
		lowStockCount,
		todayStr: new Intl.DateTimeFormat('id-ID', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(new Date())
	};
};
