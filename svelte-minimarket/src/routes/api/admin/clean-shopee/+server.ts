import { json } from '@sveltejs/kit';
import { query } from '$lib/server/db';

export const GET = async () => {
	try {
		// 1. Hapus transactions yang berhubungan dengan Shopee
		await query(`DELETE FROM transaction_details WHERE transaction_id IN (SELECT id FROM transactions WHERE channel = 'SHOPEE')`);
		await query(`DELETE FROM transactions WHERE channel = 'SHOPEE'`);
		
		// 2. Hapus shopee_orders (pesanan lama yang ditarik saat mapping masih kosong)
		await query(`DELETE FROM shopee_orders`);
		
		return json({ 
			success: true, 
			message: 'CLEANUP BERHASIL: Pesanan lama yang macet telah dihapus. Silakan klik tombol "Tarik Order" lagi.' 
		});
	} catch (err: any) {
		return json({ error: err.message });
	}
};
