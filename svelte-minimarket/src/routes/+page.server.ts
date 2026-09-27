import type { PageServerLoad } from './$types';
import { memoryProducts } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
	// Cache landing page for ultra-fast reload (<50ms) and superior SEO Google Core Web Vitals
	setHeaders({
		'cache-control': 'public, max-age=60, s-maxage=600, stale-while-revalidate=86400'
	});

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
