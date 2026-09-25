import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getShopeeConnectionStatus } from '$lib/server/shopee-service';

export const GET: RequestHandler = async () => {
	const partnerId = process.env.SHOPEE_PARTNER_ID || '';
	const partnerKey = process.env.SHOPEE_PARTNER_KEY || '';
	const shopId = process.env.SHOPEE_SHOP_ID || '';

	const maskedKey = partnerKey.length > 10 
		? `${partnerKey.slice(0, 7)}...${partnerKey.slice(-6)} (Total: ${partnerKey.length} karakter)`
		: partnerKey ? 'Terisi' : 'KOSONG / BELUM TERBACA';

	const status = getShopeeConnectionStatus();

	return json({
		status: 'success',
		shopee_ready: Boolean(partnerId && partnerKey && shopId),
		mode: status.mode,
		diagnostics: {
			SHOPEE_PARTNER_ID: partnerId || 'KOSONG / BELUM TERBACA',
			SHOPEE_PARTNER_KEY: maskedKey,
			SHOPEE_SHOP_ID: shopId || 'KOSONG / BELUM TERBACA'
		},
		message: Boolean(partnerId && partnerKey && shopId)
			? '✅ Seluruh kredensial Shopee Live telah terbaca sempurna oleh aplikasi!'
			: '⚠️ Masih ada variabel yang belum terbaca. Pastikan sudah menjalankan: pm2 restart all --update-env'
	});
};
