import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getShopeeConnectionStatus, getShopeeEnv } from '$lib/server/shopee-service';

export const GET: RequestHandler = async () => {
	const partnerId = getShopeeEnv('SHOPEE_PARTNER_ID', '2045588');
	const partnerKey = getShopeeEnv('SHOPEE_PARTNER_KEY', 'shpk714e4d6841764d6f614753694f5752754e4855664e456e5176794f594170');
	const shopId = getShopeeEnv('SHOPEE_SHOP_ID', '1075726207');

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
