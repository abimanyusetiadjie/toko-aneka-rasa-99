import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/server/db';
import { syncShopeeStock } from '$lib/server/shopee-service';

export const GET: RequestHandler = async () => {
	try {
		// Ambil semua produk yang sudah di-mapping
		const products = await query(`
			SELECT id, name, stock, shopee_item_id, shopee_model_id 
			FROM products 
			WHERE shopee_item_id IS NOT NULL
		`);

		if (products.length === 0) {
			return json({ success: true, message: 'Belum ada produk yang di-mapping ke Shopee.', synced_count: 0 });
		}

		// Siapkan payload untuk syncShopeeStock
		const syncPayload = products.map((p: any) => ({
			product_id: p.id,
			newStock: Number(p.stock)
		}));

		// Eksekusi fungsi sinkronisasi (mendorong stok lokal ke etalase Shopee)
		const res = await syncShopeeStock(syncPayload);

		if (res.failed_items && res.failed_items.length > 0) {
			return json({ 
				success: true, 
				message: `Berhasil sinkron ${res.synced_count} produk, namun ada ${res.failed_items.length} yang gagal.`, 
				error_details: res.failed_items, 
				synced_count: res.synced_count,
				total_mapped: products.length
			});
        }

		return json({
			success: true,
			message: `Berhasil memeriksa dan memaksa sinkronisasi ${res.synced_count} produk yang sudah di-mapping!`,
			synced_count: res.synced_count,
			total_mapped: products.length
		});
	} catch (err: any) {
		return json({ success: false, error: err.message });
	}
};
