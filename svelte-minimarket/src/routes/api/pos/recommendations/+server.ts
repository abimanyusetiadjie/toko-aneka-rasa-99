import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/server/db';
import type { Recommendation } from '$lib/types';

export const GET: RequestHandler = async ({ url }) => {
	const productId = url.searchParams.get('product_id')?.trim();

	if (!productId) {
		return json({ recommendations: [] });
	}

	try {
		// Cari rule ML di mana antecedent mengandung ID produk ini
		const rules = await query(
			`SELECT * FROM ml_association_rules 
			 WHERE antecedent_product_ids::text LIKE $1
			 ORDER BY lift DESC
			 LIMIT 3`,
			[`%${productId}%`]
		);

		const recommendations: Recommendation[] = [];

		for (const rule of rules) {
			const consequents: string[] = typeof rule.consequent_product_ids === 'string'
				? JSON.parse(rule.consequent_product_ids)
				: rule.consequent_product_ids;

			if (consequents && Array.isArray(consequents) && consequents.length > 0) {
				const prodRows = await query(
					`SELECT name FROM products WHERE id = ANY($1::uuid[])`,
					[consequents]
				);

				const names = prodRows.map((r: any) => r.name);

				if (names.length > 0) {
					recommendations.push({
						suggested_products: names.join(', '),
						confidence: Math.round(Number(rule.confidence) * 1000) / 10,
						lift: Math.round(Number(rule.lift) * 100) / 100,
						message: `Pelanggan sering membeli "${names.join(', ')}" bersamaan (${Math.round(Number(rule.confidence) * 100)}% kecenderungan)!`
					});
				}
			}
		}

		return json({ recommendations });
	} catch (e: any) {
		return json({ recommendations: [] });
	}
};
