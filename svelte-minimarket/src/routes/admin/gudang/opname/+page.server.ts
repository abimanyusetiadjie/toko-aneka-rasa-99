import type { PageServerLoad, Actions } from './$types';
import { query } from '$lib/server/db';
import { broadcastRealtimeEvent } from '$lib/server/realtime-hub';
import type { Product } from '$lib/types';

export const load: PageServerLoad = async () => {
	try {
		const products = await query<Product>(`SELECT id, name, sku, stock, COALESCE(cost_price, 0) as base_hpp FROM products ORDER BY name ASC`);

		const adjustments = await query(`
			SELECT 
				sm.id, sm.created_at, sm.qty_base_change, sm.balance_after, sm.unit_cost_snapshot,
				sm.notes, p.name as product_name, p.sku
			FROM stock_movements sm
			JOIN products p ON sm.product_id = p.id
			WHERE sm.reference_type = 'ADJUSTMENT'
			ORDER BY sm.created_at DESC
			LIMIT 20
		`);

		return { products: products || [], adjustments: adjustments || [] };
	} catch (e: any) {
		return { products: [], adjustments: [], error: e.message };
	}
};

export const actions: Actions = {
	adjustStock: async ({ request }) => {
		const data = await request.formData();
		const product_id = String(data.get('product_id'));
		const actual_stock = Number(data.get('actual_stock'));
		const reason = String(data.get('reason') || 'Audit Stock Opname');
		const notes = String(data.get('notes') || '').trim();

		if (!product_id || isNaN(actual_stock) || actual_stock < 0) {
			return { success: false, message: 'Data stok fisik aktual tidak valid.' };
		}

		try {
			const prodRes = await query<Product>(`SELECT id, stock, COALESCE(cost_price, 0) as base_hpp, name FROM products WHERE id = $1`, [product_id]);
			if (prodRes.length === 0) return { success: false, message: 'Produk tidak ditemukan.' };

			const prod = prodRes[0];
			const systemStock = Number(prod.stock);
			const difference = actual_stock - systemStock;

			if (difference === 0) {
				return { success: true, message: `Stok fisik sesuai dengan sistem (${actual_stock} Pcs). Tidak ada selisih.` };
			}

			await query(
				`UPDATE products 
				 SET stock = $1, updated_at = NOW() 
				 WHERE id = $2`,
				[actual_stock, product_id]
			);

			const movementNote = `Stock Opname: [${reason}] • Sistem: ${systemStock} Pcs -> Fisik: ${actual_stock} Pcs (Selisih: ${difference > 0 ? '+' : ''}${difference} Pcs) ${notes ? '• ' + notes : ''}`;

			await query(
				`INSERT INTO stock_movements (
					id, store_id, product_id, reference_type, qty_base_change, balance_after, unit_cost_snapshot, notes
				) VALUES ($1, '11111111-1111-1111-1111-111111111111', $2, 'ADJUSTMENT', $3, $4, $5, $6)`,
				[crypto.randomUUID(), product_id, difference, actual_stock, prod.base_hpp, movementNote]
			);

			broadcastRealtimeEvent({
				type: 'STOCK_CHANGED',
				data: {
					items: [{ productId: product_id, qty: Math.abs(difference), baseQty: Math.abs(difference), newBalance: actual_stock }],
					timestamp: new Date().toISOString(),
					message: `Stock Opname: ${prod.name} disesuaikan menjadi ${actual_stock} Pcs`
				}
			});

			return { 
				success: true, 
				message: `Penyesuaian stok "${prod.name}" berhasil dicatat (Selisih: ${difference > 0 ? '+' : ''}${difference} Pcs).` 
			};
		} catch (err: any) {
			return { success: false, message: 'Gagal mencatat penyesuaian: ' + err.message };
		}
	}
};
