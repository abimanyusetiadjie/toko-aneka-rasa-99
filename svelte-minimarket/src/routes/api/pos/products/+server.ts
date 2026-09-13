import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
	const search = url.searchParams.get('q')?.trim() || '';

	let sql = `
		SELECT 
			p.id, p.sku, p.name, p.category_id, p.stock, p.unit as base_unit,
			COALESCE(pu.price, p.price) as price,
			COALESCE(pu.barcode, p.sku) as barcode,
			pu.id as unit_id,
			pu.unit_name,
			c.name as category_name
		FROM products p
		LEFT JOIN categories c ON p.category_id = c.id
		LEFT JOIN product_units pu ON p.id = pu.product_id AND pu.conversion_factor = 1
	`;

	const params: any[] = [];
	if (search) {
		sql += ` WHERE p.name ILIKE $1 OR p.sku ILIKE $1 OR pu.barcode ILIKE $1`;
		params.push(`%${search}%`);
	}
	sql += ` ORDER BY p.name ASC LIMIT 50`;

	try {
		const products = await query(sql, params);
		return json({ products: products || [] });
	} catch (e: any) {
		return json({ products: [] });
	}
};
