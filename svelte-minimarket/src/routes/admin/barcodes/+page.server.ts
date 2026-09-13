import type { PageServerLoad } from './$types';
import { query } from '$lib/server/db';
import type { Product } from '$lib/types';

export const load: PageServerLoad = async () => {
	try {
		const products = await query<Product>(`
			SELECT 
				p.id, p.sku, p.name, p.category_id, 
				COALESCE(p.unit, 'pcs') as base_unit, 
				COALESCE(pu.price, p.price) as selling_price, 
				p.stock,
				c.name as category_name,
				COALESCE(pu.barcode, p.sku) as barcode
			FROM products p
			LEFT JOIN categories c ON p.category_id = c.id
			LEFT JOIN product_units pu ON p.id = pu.product_id AND pu.conversion_factor = 1
			ORDER BY c.name ASC, p.name ASC
		`);
		return { products: products || [] };
	} catch (e: any) {
		return { products: [] };
	}
};
