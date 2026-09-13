import type { PageServerLoad } from './$types';
import { query } from '$lib/server/db';

export const load: PageServerLoad = async ({ url }) => {
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

		const movements = await query(sql, params);

		return { movements: movements || [], filterType };
	} catch (e: any) {
		return { movements: [], filterType, error: e.message };
	}
};
