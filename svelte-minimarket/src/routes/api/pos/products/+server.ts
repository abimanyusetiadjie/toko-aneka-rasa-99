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
			COALESCE(NULLIF(pu.price, 0), p.price, 0) as price,
			COALESCE(p.barcode, pu.barcode, p.sku) as barcode,
			COALESCE(pu.id, p.id) as unit_id,
			COALESCE(pu.unit_name, p.unit, 'Pcs') as unit_name,
			c.name as category_name
		FROM products p
		LEFT JOIN categories c ON p.category_id = c.id
		LEFT JOIN LATERAL (
			SELECT id, unit_name, price, barcode
			FROM product_units
			WHERE product_id = p.id AND (conversion_factor = 1 OR conversion_factor IS NULL)
			ORDER BY CASE WHEN price > 0 THEN 1 ELSE 2 END, created_at DESC
			LIMIT 1
		) pu ON true
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
