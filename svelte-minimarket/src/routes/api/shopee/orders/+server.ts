import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/server/db';
import {
	createShopeeOrder,
	updateShopeeOrderStatus,
	cancelShopeeOrder,
	simulateRandomShopeeOrder,
	memoryShopeeOrders
} from '$lib/server/shopee-service';
import type { ShopeeOrder } from '$lib/types';

export const GET: RequestHandler = async ({ url }) => {
	const status = url.searchParams.get('status')?.trim();
	const q = url.searchParams.get('q')?.trim();

	let sql = `
		SELECT 
			id, order_sn, store_id, buyer_username, order_status, shipping_carrier,
			tracking_number, total_amount, shopee_escrow_amount, items, stock_deducted,
			shopee_created_at, created_at, updated_at
		FROM shopee_orders
	`;

	const conditions: string[] = [];
	const params: any[] = [];

	if (status && status !== 'ALL') {
		params.push(status);
		conditions.push(`order_status = $${params.length}`);
	}

	if (q) {
		params.push(`%${q}%`);
		conditions.push(`(order_sn ILIKE $${params.length} OR buyer_username ILIKE $${params.length} OR tracking_number ILIKE $${params.length})`);
	}

	if (conditions.length > 0) {
		sql += ` WHERE ${conditions.join(' AND ')}`;
	}

	sql += ` ORDER BY shopee_created_at DESC LIMIT 100`;

	try {
		const orders = await query<ShopeeOrder>(sql, params);
		return json({ success: true, orders: orders || [] });
	} catch (err: any) {
		let fallback = [...memoryShopeeOrders];
		if (status && status !== 'ALL') {
			fallback = fallback.filter(o => o.order_status === status);
		}
		if (q) {
			const lower = q.toLowerCase();
			fallback = fallback.filter(o => o.order_sn.toLowerCase().includes(lower) || o.buyer_username.toLowerCase().includes(lower));
		}
		return json({ success: true, orders: fallback });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { action, order_sn, status, tracking_number } = body;

		if (action === 'simulate') {
			const simulated = await simulateRandomShopeeOrder();
			return json({
				success: true,
				message: `⚡ Pesanan Shopee #${simulated.order_sn} berhasil dibuat! Stok gudang telah dipotong otomatis.`,
				order: simulated
			});
		}

		if (action === 'update_status') {
			if (!order_sn || !status) {
				throw error(400, 'Parameter order_sn dan status wajib diisi');
			}

			if (status === 'CANCELLED') {
				const res = await cancelShopeeOrder(order_sn);
				return json(res);
			}

			const res = await updateShopeeOrderStatus(order_sn, status, tracking_number);
			return json({ success: true, message: `Status pesanan #${order_sn} berhasil diubah ke ${status}` });
		}

		if (action === 'create_manual') {
			const newOrder = await createShopeeOrder(body.order);
			return json({ success: true, order: newOrder });
		}

		throw error(400, 'Action tidak dikenali');
	} catch (err: any) {
		return json({ success: false, error: err.message }, { status: 500 });
	}
};
