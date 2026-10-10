import type { PageServerLoad, Actions } from './$types';
import { query } from '$lib/server/db';
import { callShopeeApi, getShopeeConnectionStatus, syncShopeeStock } from '$lib/server/shopee-service';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const connStatus = getShopeeConnectionStatus();
	const shopId = process.env.SHOPEE_SHOP_ID || connStatus.shopId || '1075726207';

	try {
		// 1. Ambil produk lokal
		let localProducts = await query(`
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
		
		// Sort alphabetically to prevent UI jumping when Shopee API order changes due to stock updates
		shopeeProducts.sort((a, b) => a.item_name.localeCompare(b.item_name));

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
		const mappingVal = data.get('shopee_mapping') ? String(data.get('shopee_mapping')) : '';
		
		let shopeeItemId = null;
		let shopeeModelId = null;
		
		if (mappingVal && mappingVal.includes('|')) {
			const parts = mappingVal.split('|');
			shopeeItemId = Number(parts[0]);
			shopeeModelId = Number(parts[1]);
		}
		
		if (!localId) return { success: false, message: 'ID Lokal tidak valid' };

		try {
			await query(
				`UPDATE products SET shopee_item_id = $1, shopee_model_id = $2, updated_at = NOW() WHERE id = $3`,
				[shopeeItemId, shopeeModelId, localId]
			);
			
			// Jika berhasil ditautkan ke Shopee (bukan dilepas tautannya), langsung tembak stok lokal ke Shopee!
			let syncMsg = '';
			if (shopeeItemId) {
			    const prodRows = await query(`SELECT stock, name FROM products WHERE id = $1`, [localId]);
			    if (prodRows.length > 0) {
			        const res = await syncShopeeStock([{ product_id: localId, newStock: Number(prodRows[0].stock) }]);
			        if (res.error_message) {
			            syncMsg = ' (Stok gagal dikirim ke Shopee: ' + res.error_message + ')';
			        } else {
			            syncMsg = ' & stok sinkron!';
			        }
			    }
			}
			
			return { success: true, message: 'Tautan disimpan' + syncMsg };
		} catch (err: any) {
			return { success: false, message: 'Gagal menautkan produk: ' + err.message };
		}
	},
	autoMap: async () => {
		try {
			
			// Auto map based on exact SKU match
			let localProducts = await query(`SELECT id, sku, name, stock FROM products WHERE shopee_item_id IS NULL AND sku IS NOT NULL AND sku != ''`);
			
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
			let stocksToSync = [];
			
			for (let i = 0; i < allItemIds.length; i += 50) {
				const batchIds = allItemIds.slice(i, i + 50);
				const baseInfoRes = await callShopeeApi('/api/v2/product/get_item_base_info', { item_id_list: batchIds.join(',') }, 'GET');
				if (baseInfoRes && baseInfoRes.item_list) {
					for (const sp of baseInfoRes.item_list) {
						// 1. Cek Model (Varian)
						if (sp.has_model) {
							let modelList = [];
							try {
								await new Promise(resolve => setTimeout(resolve, 200));
								const modelListRes = await callShopeeApi('/api/v2/product/get_model_list', { item_id: Number(sp.item_id) }, 'GET');
								if (modelListRes && modelListRes.model) modelList = modelListRes.model;
							} catch (e) {
								console.error(`Automap gagal get_model_list untuk ${sp.item_id}`);
							}

							if (modelList.length > 0) {
								for (const mod of modelList) {
									let match = null;
									
									// Cari by SKU Varian dulu
									if (mod.model_sku) {
										match = localProducts.find((lp) => lp.sku && lp.sku.toLowerCase() === mod.model_sku.toLowerCase());
									}
									
									// Jika tidak ketemu/tidak ada SKU, coba tebak dari Nama!
									if (!match) {
										const shopeeBaseName = sp.item_name.toLowerCase().trim();
										const shopeeVarName = (mod.model_name || '').toLowerCase().trim();
										
										match = localProducts.find((lp) => {
											const ln = lp.name.toLowerCase().trim();
											return (
												ln === `${shopeeBaseName} - ${shopeeVarName}` ||
												ln === `${shopeeBaseName} ${shopeeVarName}` ||
												ln === shopeeVarName ||
												(ln.includes(shopeeBaseName) && ln.includes(shopeeVarName))
											);
										});
									}

									if (match) {
										await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = $2, updated_at = NOW() WHERE id = $3`, [sp.item_id, mod.model_id, match.id]);
										stocksToSync.push({ product_id: match.id, newStock: Number(match.stock) });
										mappedCount++;
										
										// Hapus dari list agar tidak map ganda
										localProducts = localProducts.filter(lp => lp.id !== match.id);
									}
								}
							}
						}
						// 2. Jika tidak ada model (Barang Tunggal)
						else {
							let match = null;
							
							// Cari by SKU Induk
							if (sp.item_sku) {
								match = localProducts.find((lp) => lp.sku && lp.sku.toLowerCase() === sp.item_sku.toLowerCase());
							}
							
							// Jika tidak ketemu/tidak ada SKU, tebak by Nama!
							if (!match) {
								const shopeeBaseName = sp.item_name.toLowerCase().trim();
								match = localProducts.find((lp) => lp.name.toLowerCase().trim() === shopeeBaseName);
							}

							if (match) {
								await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [sp.item_id, match.id]);
								stocksToSync.push({ product_id: match.id, newStock: Number(match.stock) });
								mappedCount++;
								
								// Hapus dari list
								localProducts = localProducts.filter(lp => lp.id !== match.id);
							}
						}
					}
				}
			}
			
			if (stocksToSync.length > 0) {
			    await syncShopeeStock(stocksToSync);
			}
			
			return { success: true, message: `Berhasil auto-map ${mappedCount} produk berdasarkan SKU dan disinkronkan!` };
		} catch (err: any) {
			return { success: false, message: 'Auto-map gagal: ' + err.message };
		}
	}};
