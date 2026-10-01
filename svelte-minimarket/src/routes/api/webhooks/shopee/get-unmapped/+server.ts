import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/server/db';
import { callShopeeApi } from '$lib/server/shopee-service';

export const GET: RequestHandler = async () => {
	try {
		// 1. Unmapped local products
		const unmappedLocal = await query(`
			SELECT id, sku, name, stock 
			FROM products 
			WHERE shopee_item_id IS NULL
			ORDER BY name ASC
		`);

		// 2. All Shopee products
		let allItemIds: any[] = [];
		let offset = 0;
		let hasNext = true;

		while (hasNext && offset < 1000) {
			const itemListRes = await callShopeeApi('/api/v2/product/get_item_list', {
				offset: offset,
				page_size: 50,
				item_status: 'NORMAL'
			}, 'GET');
			
			if (itemListRes && itemListRes.item && itemListRes.item.length > 0) {
				allItemIds.push(...itemListRes.item.map((i: any) => i.item_id));
				offset += 50;
				if (!itemListRes.has_next_page) hasNext = false;
			} else {
				hasNext = false;
			}
		}

		let shopeeProducts: any[] = [];
		for (let i = 0; i < allItemIds.length; i += 50) {
			const batchIds = allItemIds.slice(i, i + 50);
			const baseInfoRes = await callShopeeApi('/api/v2/product/get_item_base_info', {
				item_id_list: batchIds.join(',')
			}, 'GET');
			
			if (baseInfoRes && baseInfoRes.item_list) {
				shopeeProducts.push(...baseInfoRes.item_list.map((item: any) => ({
					item_id: item.item_id,
					item_name: item.item_name,
					has_model: item.has_model,
					models: item.has_model ? item.model_list.map((m: any) => ({
						model_id: m.model_id,
						model_name: m.model_name
					})) : []
				})));
			}
		}

		return json({
			PLEASE_COPY_PASTE_THIS_TO_AI: "Yes, copy everything below and send to the AI chat",
			local_unmapped: unmappedLocal.map(l => ({ id: l.id, name: l.name })),
			shopee_available: shopeeProducts
		});
	} catch (err: any) {
		return json({ error: err.message });
	}
};
