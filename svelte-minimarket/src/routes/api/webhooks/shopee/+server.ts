import { json } from '@sveltejs/kit';
import type { RequestHandler } from './';
import { createShopeeOrder, updateShopeeOrderStatus, cancelShopeeOrder, callShopeeApi } from '/server/shopee-service';
import { query } from '/server/db';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json().catch(() => ({}));
		console.log('✅ [WEBHOOK SHOPEE] Menerima Notifikasi:', body.code || body.event || body.action);

		const { event, data, code } = body;

		// Shopee V2 Push Mechanism for order_status_push is code = 3
		if (code === 3 || event === 'order_status_update' || body.action === 'status_update') {
			const orderSn = data?.ordersn || data?.order_sn || body.order_sn;
			const newStatus = data?.status || body.status;
			
			if (!orderSn) return json({ success: true, message: 'Tidak ada order_sn' });

			// Cek apakah order ini sudah ada di database kita
			const existing = await query(SELECT id, order_status FROM shopee_orders WHERE order_sn = , [orderSn]);
			
			if (existing.length === 0) {
				// Pesanan baru! Kita harus tarik detailnya dari API Shopee
				const detailRes = await callShopeeApi('/api/v2/order/get_order_detail', {
					order_sn_list: orderSn,
					response_optional_fields: 'item_list,buyer_user_id,buyer_username,estimated_shipping_fee,shipping_carrier,total_amount,tracking_no'
				}, 'GET');

				if (detailRes && detailRes.order_list && detailRes.order_list.length > 0) {
					const o = detailRes.order_list[0];
					const itemList = o.item_list || [];
					const items = itemList.map((i: any) => ({
						sku: i.item_sku || '',
						name: i.item_name || '',
						qty: i.model_quantity_purchased || 0,
						price: i.model_discounted_price || 0
					}));

					await createShopeeOrder({
						order_sn: o.order_sn,
						buyer_username: o.buyer_username || o.buyer_user_id || 'shopee_user',
						shipping_carrier: o.shipping_carrier || 'Reguler',
						tracking_number: o.tracking_no || '',
						total_amount: o.total_amount || 0,
						items: items
					});
					
					console.log(✅ [WEBHOOK SHOPEE] Pesanan  berhasil disimpan & stok dipotong.);
				}
			} else {
				// Pesanan sudah ada, tinggal update status
				if (newStatus === 'CANCELLED') {
					await cancelShopeeOrder(orderSn);
					console.log(✅ [WEBHOOK SHOPEE] Pesanan  dibatalkan & stok dikembalikan.);
				} else if (newStatus) {
					// Jika ada nomor resi dari payload webhook (tracking_no_push biasanya code = 4, tapi kadang ikut di 3)
					const trackingNo = data?.tracking_no || body.tracking_number;
					await updateShopeeOrderStatus(orderSn, newStatus, trackingNo);
					console.log(✅ [WEBHOOK SHOPEE] Status pesanan  diubah ke .);
				}
			}
			return json({ success: true, message: 'Push Code 3 diproses.' });
		}
		
		// Jika tracking_no_push (Code 4)
		if (code === 4) {
			const orderSn = data?.ordersn || data?.order_sn;
			const trackingNo = data?.tracking_no;
			if (orderSn && trackingNo) {
				await updateShopeeOrderStatus(orderSn, 'READY_TO_SHIP', trackingNo);
				console.log(✅ [WEBHOOK SHOPEE] Resi  tersimpan untuk .);
			}
			return json({ success: true, message: 'Push Code 4 diproses.' });
		}

		return json({ success: true, message: 'Webhook Shopee diterima.' });
	} catch (err: any) {
		console.error('❌ [WEBHOOK SHOPEE ERROR]:', err.message);
		return json({ success: false, error: err.message }, { status: 500 });
	}
};
