import { json } from '@sveltejs/kit';
import { query } from '$lib/server/db';

export const GET = async () => {
	try {
		// Kosongkan semua tautan Shopee di semua produk
		await query(`UPDATE products SET shopee_item_id = NULL, shopee_model_id = NULL, updated_at = NOW()`);
		
		return json({ 
			success: true, 
			message: 'RESET BERHASIL: Seluruh tautan produk Shopee telah dikosongkan 100%. Silakan mulai mapping dari awal!' 
		});
	} catch (err: any) {
		return json({ error: err.message });
	}
};
