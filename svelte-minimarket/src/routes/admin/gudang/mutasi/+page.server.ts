import type { PageServerLoad } from './$types';
import { query } from '$lib/server/db';

export const load: PageServerLoad = async ({ url, setHeaders, locals }) => {
	setHeaders({
		'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
	});
	const isOwner = locals.user?.role_id === 1 || locals.user?.username?.toLowerCase().includes('owner');
	const filterType = url.searchParams.get('type') || 'ALL';
	const searchQuery = (url.searchParams.get('q') || '').trim();

	try {
		let sql = `
			SELECT 
				sm.id, sm.created_at, sm.reference_type, sm.qty_base_change, sm.balance_after,
				sm.unit_cost_snapshot, sm.notes, 
				COALESCE(p.name, sm.notes, 'Produk') as product_name, 
				COALESCE(p.sku, '-') as sku
			FROM stock_movements sm
			LEFT JOIN products p ON sm.product_id = p.id
			WHERE 1=1
		`;

		const params: any[] = [];
		let paramIdx = 1;

		if (filterType === 'SHOPEE') {
			sql += ` AND sm.reference_type IN ('SHOPEE_ORDER', 'SHOPEE_CANCEL')`;
		} else if (filterType !== 'ALL') {
			sql += ` AND sm.reference_type = $${paramIdx++}`;
			params.push(filterType);
		}

		if (searchQuery) {
			sql += ` AND (p.name ILIKE $${paramIdx} OR p.sku ILIKE $${paramIdx} OR sm.notes ILIKE $${paramIdx})`;
			params.push(`%${searchQuery}%`);
			paramIdx++;
		}

		sql += ` ORDER BY CASE WHEN sm.reference_type = 'INITIAL' THEN 2 ELSE 1 END, sm.created_at DESC LIMIT 150`;

		const rawMovements = await query(sql, params);
		const movements = (rawMovements || []).map((m: any) => ({
			...m,
			unit_cost_snapshot: isOwner ? Number(m.unit_cost_snapshot || 0) : 0
		}));

		return { movements, filterType, searchQuery, isOwner: !!isOwner };
	} catch (e: any) {
		console.error('[Mutasi PageServerLoad Error]', e?.message || e);
		return { movements: [], filterType, searchQuery, isOwner: !!isOwner, error: e.message };
	}
};
