import type { PageServerLoad } from './$types';
import { query } from '$lib/server/db';
import type { Product, Category } from '$lib/types';
import { CATEGORIES, PRODUCTS } from '$lib/server/seeds/tokoanekarasa99';

export const load: PageServerLoad = async ({ locals }) => {
	let products: Product[] = [];
	let categories: Category[] = [];

	try {
		products = await query<Product>(`
			SELECT p.id, p.name, p.sku, p.category_id, c.name as category_name, 
			       COALESCE(p.selling_price, p.price, 0) as price, 
			       p.stock, p.unit, p.barcode
			FROM products p
			LEFT JOIN categories c ON p.category_id = c.id
			WHERE p.is_active = true
			ORDER BY p.name ASC
			LIMIT 36
		`);

		categories = await query<Category>(`
			SELECT id, name, slug
			FROM categories
			ORDER BY name ASC
		`);
	} catch (e) {
		console.warn('Fallback to seed catalog for landing page', e);
	}

	if (!products || products.length === 0) {
		products = PRODUCTS.slice(0, 36).map(p => ({
			id: p.id,
			name: p.name,
			sku: p.sku,
			category_id: p.category_id,
			category_name: p.category_name,
			price: p.selling_price || p.price,
			stock: p.stock,
			unit: p.unit || 'pcs',
			base_unit: p.base_unit || 'PCS',
			base_hpp: p.base_hpp || 0,
			barcode: p.barcode
		}));
	}

	if (!categories || categories.length === 0) {
		categories = CATEGORIES.map(c => ({
			id: c.id,
			name: c.name,
			slug: c.slug
		}));
	}

	return {
		user: locals.user || null,
		products,
		categories
	};
};
