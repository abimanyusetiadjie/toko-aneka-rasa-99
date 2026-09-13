import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createShopeeOrder, updateShopeeOrderStatus, cancelShopeeOrder } from '$lib/server/shopee-service';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json().catch(() => ({}));
		console.log('🔔 [WEBHOOK SHOPEE] Menerima Notifikasi:', body.event || body.action);

		const { event, data } = body;

		if (event === 'order_create' || body.action === 'order_create') {
			const orderData = data || body;
			const created = await createShopeeOrder({
				order_sn: orderData.order_sn,
				buyer_username: orderData.buyer_username || 'pembeli_shopee',
				shipping_carrier: orderData.shipping_carrier || 'SPX Express',
				tracking_number: orderData.tracking_number,
				items: orderData.items || []
			});
			return json({ success: true, message: 'Pesanan Shopee berhasil diproses & stok terpotong.', order: created });
		}

		if (event === 'order_status_update' || body.action === 'status_update') {
			const orderSn = data?.order_sn || body.order_sn;
			const newStatus = data?.status || body.status;
			const trackingNo = data?.tracking_no || body.tracking_number;

			if (newStatus === 'CANCELLED') {
				await cancelShopeeOrder(orderSn);
				return json({ success: true, message: 'Pesanan Shopee dibatalkan & stok dikembalikan.' });
			}

			if (orderSn && newStatus) {
				await updateShopeeOrderStatus(orderSn, newStatus, trackingNo);
				return json({ success: true, message: `Status pesanan Shopee diubah ke ${newStatus}` });
			}
		}

		return json({ success: true, message: 'Webhook Shopee diterima.' });
	} catch (err: any) {
		console.error('❌ [WEBHOOK SHOPEE ERROR]:', err.message);
		return json({ success: false, error: err.message }, { status: 500 });
	}
};
