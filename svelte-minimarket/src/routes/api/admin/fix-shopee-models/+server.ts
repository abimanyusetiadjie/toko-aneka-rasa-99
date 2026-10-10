import { json } from '@sveltejs/kit';
import { query } from '$lib/server/db';
import { callShopeeApi } from '$lib/server/shopee-service';

export const GET = async () => {
	try {
		// Ambil produk yang di-map ke Shopee tapi model_id-nya '0' atau NULL
		const products = await query(`
			SELECT id, name, shopee_item_id 
			FROM products 
			WHERE shopee_item_id IS NOT NULL 
			AND (shopee_model_id IS NULL OR shopee_model_id = '0')
		`);

		if (products.length === 0) {
			return json({ success: true, message: 'Tidak ada produk dengan model_id 0 yang perlu diperbaiki.' });
		}

		// Ambil unik shopee_item_id
		const itemIds = [...new Set(products.map(p => p.shopee_item_id))];
		let fixedCount = 0;
		let results = [];

		for (let i = 0; i < itemIds.length; i += 50) {
			const batchIds = itemIds.slice(i, i + 50);
			const baseInfoRes = await callShopeeApi('/api/v2/product/get_item_base_info', { item_id_list: batchIds.join(',') }, 'GET');
			
			if (baseInfoRes && baseInfoRes.item_list) {
				for (const sp of baseInfoRes.item_list) {
					// Paksa memanggil get_model_list tanpa mempedulikan has_model (karena API sering tidak akurat)
					let modelListRes = null;
					try {
						modelListRes = await callShopeeApi('/api/v2/product/get_model_list', { item_id: Number(sp.item_id) }, 'GET');
					} catch (e) {
						// Abaikan jika memang tidak ada model
					}

					if (modelListRes && modelListRes.model && modelListRes.model.length > 0) {
						// Cari produk lokal mana saja yang nge-link ke item ini
						const linkedLocalProducts = products.filter(p => Number(p.shopee_item_id) === sp.item_id);
						
						for (const lp of linkedLocalProducts) {
							let bestModel = null;
							let bestScore = -1;

							const localName = lp.name.toLowerCase();

							for (const mod of modelListRes.model) {
								const modName = (mod.model_name || '').toLowerCase();
								let score = 0;

								// Pencocokan logika ukuran/gram
								const sizes = ['250', '500', '100', '200', '300', '1kg', '5kg', '3kg', 'besar', 'kecil', 'mini'];
								for (const s of sizes) {
									if (localName.includes(s) && modName.includes(s)) score += 10;
									if (localName.includes(s) && !modName.includes(s)) score -= 5;
								}

								// Pencocokan kata spesifik
								const words = modName.split(/[\s,]+/);
								for (const w of words) {
									if (w.length > 2 && localName.includes(w)) score += 5;
								}

								if (score > bestScore) {
									bestScore = score;
									bestModel = mod;
								}
							}

							if (bestModel && bestScore >= 0) {
								await query(`UPDATE products SET shopee_model_id = $1 WHERE id = $2`, [bestModel.model_id, lp.id]);
								fixedCount++;
								results.push(`Fix: ${lp.name} -> Varian: ${bestModel.model_name} (Score: ${bestScore})`);
							} else {
								// Fallback: ambil varian pertama jika mentok
								const firstModel = modelListRes.model[0];
								await query(`UPDATE products SET shopee_model_id = $1 WHERE id = $2`, [firstModel.model_id, lp.id]);
								fixedCount++;
								results.push(`Fallback First: ${lp.name} -> Varian: ${firstModel.model_name}`);
							}
						}
					}
				}
			}
		}

		return json({
			success: true,
			message: `Berhasil memperbaiki ${fixedCount} produk yang kehilangan model_id.`,
			details: results
		});
	} catch (err: any) {
		return json({ success: false, error: err.message });
	}
};
