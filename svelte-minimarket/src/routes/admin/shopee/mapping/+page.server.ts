import type { PageServerLoad, Actions } from './$types';
import { query } from '$lib/server/db';
import { callShopeeApi, getShopeeConnectionStatus } from '$lib/server/shopee-service';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const connStatus = getShopeeConnectionStatus();
	const shopId = process.env.SHOPEE_SHOP_ID || connStatus.shopId || '1075726207';

	try {
		// 1. Ambil produk lokal
		const localProducts = await query(`
			SELECT id, sku, name, stock, price, shopee_item_id, shopee_model_id 
			FROM products 
			ORDER BY name ASC
		`);

		
		// 2. Ambil seluruh produk Shopee secara rekursif (live dari Seller Center)
		let allItemIds = [];
		let offset = 0;
		const pageSize = 50;
		let hasNext = true;

		while (hasNext && offset < 1000) { // Safety limit 1000 produk
			const itemListRes = await callShopeeApi('/api/v2/product/get_item_list', {
				offset: offset,
				page_size: pageSize,
				item_status: 'NORMAL'
			}, 'GET');
			
			if (itemListRes && itemListRes.item && itemListRes.item.length > 0) {
				allItemIds.push(...itemListRes.item.map((i: any) => i.item_id));
				offset += pageSize;
				if (!itemListRes.has_next_page) hasNext = false;
			} else {
				hasNext = false;
			}
		}

		let shopeeProducts: any[] = [];
		
		// Ambil base info per batch (max 50 per request menurut dokumentasi Shopee)
		for (let i = 0; i < allItemIds.length; i += 50) {
			const batchIds = allItemIds.slice(i, i + 50);
			const baseInfoRes = await callShopeeApi('/api/v2/product/get_item_base_info', {
				item_id_list: batchIds.join(',')
			}, 'GET');
			
			if (baseInfoRes && baseInfoRes.item_list) {
				shopeeProducts.push(...baseInfoRes.item_list.map((item: any) => ({
					item_id: item.item_id,
					item_name: item.item_name,
					item_sku: item.item_sku,
					has_model: item.has_model,
					models: item.has_model ? item.model_list : []
				})));
			}
		}
return {
			localProducts,
			shopeeProducts
		};
	} catch (err: any) {
		console.error('[Shopee Mapping Error]', err);
		return {
			localProducts: [],
			shopeeProducts: [],
			error: err.message
		};
	}
};

export const actions: Actions = {
	mapProduct: async ({ request }) => {
		const data = await request.formData();
		const localId = String(data.get('local_id'));
		const shopeeItemId = data.get('shopee_item_id') ? Number(data.get('shopee_item_id')) : null;
		
		if (!localId) return { success: false, message: 'ID Lokal tidak valid' };

		try {
			await query(
				`UPDATE products SET shopee_item_id = $1, updated_at = NOW() WHERE id = $2`,
				[shopeeItemId, localId]
			);
			return { success: true, message: 'Tautan produk berhasil disimpan!' };
		} catch (err: any) {
			return { success: false, message: 'Gagal menautkan produk: ' + err.message };
		}
	},
	autoMap: async () => {
		try {
			
			// Auto map based on exact SKU match
			const localProducts = await query(`SELECT id, sku FROM products WHERE shopee_item_id IS NULL AND sku IS NOT NULL AND sku != ''`);
			
			let allItemIds = [];
			let offset = 0;
			let hasNext = true;
			while (hasNext && offset < 1000) {
				const itemListRes = await callShopeeApi('/api/v2/product/get_item_list', { offset, page_size: 50, item_status: 'NORMAL' }, 'GET');
				if (itemListRes && itemListRes.item && itemListRes.item.length > 0) {
					allItemIds.push(...itemListRes.item.map((i: any) => i.item_id));
					offset += 50;
					if (!itemListRes.has_next_page) hasNext = false;
				} else {
					hasNext = false;
				}
			}

			let mappedCount = 0;
			for (let i = 0; i < allItemIds.length; i += 50) {
				const batchIds = allItemIds.slice(i, i + 50);
				const baseInfoRes = await callShopeeApi('/api/v2/product/get_item_base_info', { item_id_list: batchIds.join(',') }, 'GET');
				if (baseInfoRes && baseInfoRes.item_list) {
					for (const sp of baseInfoRes.item_list) {
						if (!sp.item_sku) continue;
						const match = localProducts.find((lp) => lp.sku.toLowerCase() === sp.item_sku.toLowerCase());
						if (match) {
							await query(`UPDATE products SET shopee_item_id = $1 WHERE id = $2`, [sp.item_id, match.id]);
							mappedCount++;
						}
					}
				}
			}
			return { success: true, message: `Berhasil auto-map ${mappedCount} produk berdasarkan SKU!` };
return { success: true, message: `Berhasil auto-map ${mappedCount} produk berdasarkan SKU!` };
		} catch (err: any) {
			return { success: false, message: 'Auto-map gagal: ' + err.message };
		}
	}
};
