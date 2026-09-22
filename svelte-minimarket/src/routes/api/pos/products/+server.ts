import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/server/db';

export const GET: RequestHandler = async ({ url, setHeaders }) => {
	setHeaders({
		'cache-control': 'no-cache, no-store, must-revalidate'
	});
	const search = url.searchParams.get('q')?.trim() || '';

	let sql = `
		SELECT 
			p.id, p.sku, p.name, p.category_id, p.stock, p.unit as base_unit,
			COALESCE(pu.price, p.price) as price,
			COALESCE(pu.barcode, p.barcode, p.sku) as barcode,
			pu.id as unit_id,
			pu.unit_name,
			c.name as category_name
		FROM products p
		LEFT JOIN categories c ON p.category_id = c.id
		LEFT JOIN product_units pu ON p.id = pu.product_id AND pu.conversion_factor = 1
		WHERE (p.is_active = true OR p.is_active IS NULL)
	`;

	const params: any[] = [];
	if (search) {
		const clean = search.toUpperCase().replace(/^SKU-?/i, '').replace(/[^A-Z0-9]/g, '');
		sql += ` AND (
			p.name ILIKE $1 
			OR p.sku ILIKE $1 
			OR pu.barcode ILIKE $1 
			OR p.barcode ILIKE $1
			OR REPLACE(REPLACE(UPPER(p.sku), 'SKU-', ''), '-', '') ILIKE $2
			OR REPLACE(REPLACE(UPPER(pu.barcode), 'SKU-', ''), '-', '') ILIKE $2
			OR REPLACE(REPLACE(UPPER(p.barcode), 'SKU-', ''), '-', '') ILIKE $2
		)`;
		params.push(`%${search}%`);
		params.push(`%${clean || search}%`);
	}
	sql += ` ORDER BY p.name ASC LIMIT 1000`;

	try {
		const products = await query(sql, params);
		return json({ products: products || [] });
	} catch (e: any) {
		return json({ products: [] });
	}
};
