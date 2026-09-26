import type { PageServerLoad } from './$types';
import { memoryProducts } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	const allProducts = memoryProducts.map(p => ({
		id: p.id,
		sku: p.sku,
		name: p.name,
		price: p.price,
		category_id: p.category_id
	}));

	return {
		user: locals.user || null,
		posProducts: allProducts
	};
};
