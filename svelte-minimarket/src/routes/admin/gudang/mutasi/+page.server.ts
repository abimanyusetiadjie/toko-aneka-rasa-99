import type { PageServerLoad } from './$types';
import { query } from '$lib/server/db';

export const load: PageServerLoad = async ({ url, setHeaders, locals }) => {
	setHeaders({
		'cache-control': 'private, max-age=15, stale-while-revalidate=30'
	});
	const isOwner = locals.user?.role_id === 1 || locals.user?.username?.toLowerCase().includes('owner');
	const filterType = url.searchParams.get('type') || 'ALL';

	try {
		let sql = `
			SELECT 
				sm.id, sm.created_at, sm.reference_type, sm.qty_base_change, sm.balance_after,
				sm.unit_cost_snapshot, sm.notes, p.name as product_name, p.sku
			FROM stock_movements sm
			JOIN products p ON sm.product_id = p.id
		`;

		const params: any[] = [];
		if (filterType !== 'ALL') {
			sql += ` WHERE sm.reference_type = $1`;
			params.push(filterType);
		}

		sql += ` ORDER BY sm.created_at DESC LIMIT 50`;

		const rawMovements = await query(sql, params);
		const movements = (rawMovements || []).map((m: any) => ({
			...m,
			unit_cost_snapshot: isOwner ? Number(m.unit_cost_snapshot || 0) : 0
		}));

		return { movements, filterType, isOwner: !!isOwner };
	} catch (e: any) {
		return { movements: [], filterType, isOwner: !!isOwner, error: e.message };
	}
};
