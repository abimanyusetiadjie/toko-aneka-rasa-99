import type { PageServerLoad, Actions } from './$types';
import { query } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import {
	simulateRandomShopeeOrder,
	updateShopeeOrderStatus,
	cancelShopeeOrder,
	getShopeeConnectionStatus,
	getShopeeAuthUrl,
	exchangeShopeeToken
} from '$lib/server/shopee-service';
import type { ShopeeOrder } from '$lib/types';

export const load: PageServerLoad = async ({ url }) => {
	const shopIdFromUrl = url.searchParams.get('shop_id');
	const codeFromUrl = url.searchParams.get('code');
	
	if (shopIdFromUrl) {
		process.env.SHOPEE_SHOP_ID = shopIdFromUrl;
	}

	let exchangeError = null;
	if (shopIdFromUrl && codeFromUrl) {
		try {
			await exchangeShopeeToken(codeFromUrl, shopIdFromUrl);
			// Redirect untuk membuang code dari URL (mencegah error double-exchange jika di-reload)
			throw redirect(302, `/admin/shopee?auth_success=1&shop_id=${shopIdFromUrl}`);
		} catch (err: any) {
			if (err.status === 302) throw err; // Biarkan redirect dari sveltejs/kit lewat
			exchangeError = err.message;
		}
	}

	const isAuthSuccess = url.searchParams.get('auth_success') === '1';

	const redirectUrl = `${url.origin}/admin/shopee`;
	const authUrl = getShopeeAuthUrl(redirectUrl);

	try {
		const [orders, statsRows] = await Promise.all([
			query<ShopeeOrder>(`
				SELECT 
					id, order_sn, store_id, buyer_username, order_status, shipping_carrier,
					tracking_number, total_amount, shopee_escrow_amount, items, stock_deducted,
					shopee_created_at, created_at, updated_at
				FROM shopee_orders
				ORDER BY shopee_created_at DESC
				LIMIT 50
			`),
			query(`
				SELECT 
					COUNT(CASE WHEN order_status = 'READY_TO_SHIP' THEN 1 END)::int as ready_to_ship,
					COUNT(CASE WHEN order_status = 'SHIPPED' THEN 1 END)::int as shipped,
					COUNT(CASE WHEN order_status = 'COMPLETED' THEN 1 END)::int as completed,
					COUNT(CASE WHEN order_status = 'CANCELLED' THEN 1 END)::int as cancelled,
					COALESCE(SUM(CASE WHEN order_status != 'CANCELLED' THEN total_amount ELSE 0 END), 0)::float as total_revenue,
					COALESCE(SUM(CASE WHEN order_status != 'CANCELLED' THEN shopee_escrow_amount ELSE 0 END), 0)::float as total_escrow
				FROM shopee_orders
			`)
		]);

		const stats = statsRows[0] || {
			ready_to_ship: 0,
			shipped: 0,
			completed: 0,
			cancelled: 0,
			total_revenue: 0,
			total_escrow: 0
		};

		const connStatus = getShopeeConnectionStatus();
		return {
			orders: orders || [],
			stats,
			connectionStatus: {
				...connStatus,
				shopId: shopIdFromUrl || connStatus.shopId || '1075726207'
			},
			authSuccess: isAuthSuccess && !exchangeError ? { shopId: shopIdFromUrl } : null,
			authUrl,
			exchangeError
		};
	} catch (err: any) {
		const connStatus = getShopeeConnectionStatus();
		return {
			orders: [],
			stats: { ready_to_ship: 0, shipped: 0, completed: 0, cancelled: 0, total_revenue: 0, total_escrow: 0 },
			connectionStatus: {
				...connStatus,
				shopId: shopIdFromUrl || connStatus.shopId || '1075726207'
			},
			authSuccess: isAuthSuccess && !exchangeError ? { shopId: shopIdFromUrl } : null,
			authUrl,
			error: err.message,
			exchangeError
		};
	}
};

export const actions: Actions = {
	simulate: async () => {
		try {
			const order = await simulateRandomShopeeOrder();
			return {
				success: true,
				message: `⚡ Pesanan Shopee #${order.order_sn} (${order.buyer_username}) berhasil dibuat! Stok gudang telah dipotong otomatis.`
			};
		} catch (err: any) {
			return { success: false, message: 'Gagal membuat pesanan simulasi: ' + err.message };
		}
	},

	updateStatus: async ({ request }) => {
		const data = await request.formData();
		const orderSn = String(data.get('order_sn') || '');
		const status = String(data.get('status') || '');
		const trackingNo = String(data.get('tracking_number') || '').trim();

		if (!orderSn || !status) {
			return { success: false, message: 'Data pesanan tidak valid' };
		}

		try {
			if (status === 'CANCELLED') {
				await cancelShopeeOrder(orderSn);
				return { success: true, message: `Pesanan Shopee #${orderSn} berhasil dibatalkan & stok dikembalikan.` };
			}

			await updateShopeeOrderStatus(orderSn, status, trackingNo || undefined);
			return { success: true, message: `Status pesanan #${orderSn} berhasil diubah ke ${status}.` };
		} catch (err: any) {
			return { success: false, message: 'Gagal mengubah status: ' + err.message };
		}
	}
};
