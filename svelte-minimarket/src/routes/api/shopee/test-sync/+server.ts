import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/server/db';
import { callShopeeApi } from '$lib/server/shopee-service';

export const GET: RequestHandler = async () => {
	try {
		// Ambil satu produk yang sudah ditautkan
		const rows = await query(`SELECT id, shopee_item_id, shopee_model_id, name, stock FROM products WHERE shopee_item_id IS NOT NULL LIMIT 1`);
		if (rows.length === 0) {
			return json({ success: false, error: 'Tidak ada produk yang ditautkan.' });
		}

		const product = rows[0];
		
		// Coba paksa update stok
		const payload = {
			item_id: Number(product.shopee_item_id),
			stock_list: [
				{
					model_id: product.shopee_model_id ? Number(product.shopee_model_id) : 0,
					seller_stock: [
						{
							stock: product.stock
						}
					]
				}
			]
		};

		const result = await callShopeeApi('/api/v2/product/update_stock', payload, 'POST');

		return json({
			success: true,
			message: 'Sinkronisasi berhasil diuji.',
			product: product.name,
			payload,
			shopee_response: result
		});
	} catch (err: any) {
		return json({
			success: false,
			error: err.message,
			stack: err.stack
		}, { status: 500 });
	}
};
