import type { PageServerLoad, Actions } from './$types';
import { query } from '$lib/server/db';
import { broadcastRealtimeEvent } from '$lib/server/realtime-hub';
import type { Product } from '$lib/types';

export const load: PageServerLoad = async () => {
	try {
		const products = await query<Product>(`SELECT id, name, sku, stock, COALESCE(cost_price, 0) as base_hpp FROM products ORDER BY name ASC`);

		const receipts = await query(`
			SELECT 
				sm.id, sm.created_at, sm.qty_base_change, sm.balance_after, sm.unit_cost_snapshot,
				sm.notes, p.name as product_name, p.sku
			FROM stock_movements sm
			JOIN products p ON sm.product_id = p.id
			WHERE sm.reference_type IN ('RESTOCK', 'INITIAL')
			ORDER BY sm.created_at DESC
			LIMIT 20
		`);

		return { products: products || [], receipts: receipts || [] };
	} catch (e: any) {
		return { products: [], receipts: [], error: e.message };
	}
};

export const actions: Actions = {
	receiveStock: async ({ request }) => {
		const data = await request.formData();
		const product_id = String(data.get('product_id'));
		const qty = Number(data.get('qty'));
		const supplier_name = String(data.get('supplier_name') || '').trim();
		const invoice_number = String(data.get('invoice_number') || '').trim();
		const purchase_cost = Number(data.get('purchase_cost'));
		const notes = String(data.get('notes') || '').trim();

		if (!product_id || qty <= 0) {
			return { success: false, message: 'Pilih produk dan masukkan jumlah masuk yang valid.' };
		}

		try {
			const prodRes = await query<Product>(`SELECT id, stock, COALESCE(cost_price, 0) as base_hpp, name FROM products WHERE id = $1`, [product_id]);
			if (prodRes.length === 0) return { success: false, message: 'Produk tidak ditemukan.' };

			const prod = prodRes[0];
			const newBalance = Number(prod.stock) + qty;
			const unitCost = purchaseCostVal(purchase_cost, prod.base_hpp);

			await query(
				`UPDATE products 
				 SET stock = $1, cost_price = $2, updated_at = NOW() 
				 WHERE id = $3`,
				[newBalance, unitCost, product_id]
			);

			const movementNote = `Penerimaan dari ${supplier_name || 'Distributor'} (Faktur: ${invoice_number || '-'}) ${notes ? '• ' + notes : ''}`;

			await query(
				`INSERT INTO stock_movements (
					id, store_id, product_id, reference_type, qty_base_change, balance_after, unit_cost_snapshot, notes
				) VALUES ($1, '11111111-1111-1111-1111-111111111111', $2, 'RESTOCK', $3, $4, $5, $6)`,
				[crypto.randomUUID(), product_id, qty, newBalance, unitCost, movementNote]
			);

			broadcastRealtimeEvent({
				type: 'STOCK_CHANGED',
				data: {
					items: [{ productId: product_id, qty, baseQty: qty, newBalance }],
					timestamp: new Date().toISOString(),
					message: `Penerimaan Barang Masuk: +${qty} Pcs "${prod.name}"`
				}
			});

			return { success: true, message: `Berhasil menerima +${qty} Pcs "${prod.name}" ke gudang!` };
		} catch (err: any) {
			return { success: false, message: 'Gagal memproses penerimaan barang: ' + err.message };
		}
	}
};

function purchaseCostVal(inputCost: number, defaultCost: number): number {
	return inputCost > 0 ? inputCost : defaultCost;
}
