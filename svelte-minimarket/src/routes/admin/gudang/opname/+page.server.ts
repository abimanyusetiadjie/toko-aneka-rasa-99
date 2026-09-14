import type { PageServerLoad, Actions } from './$types';
import { 
	query, 
	memoryShortages, 
	recordMemoryShortage, 
	updateMemoryShortageStatus, 
	deleteMemoryShortage,
	type IncomingShortage 
} from '$lib/server/db';
import { broadcastRealtimeEvent } from '$lib/server/realtime-hub';
import type { Product } from '$lib/types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({
		'cache-control': 'private, max-age=15, stale-while-revalidate=30'
	});
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
			LIMIT 25
		`);

		const pendingShortages = memoryShortages.filter(s => s.status === 'BELUM_DITAGIH');
		const submittedShortages = memoryShortages.filter(s => s.status === 'SUDAH_DIKLAIM');
		const resolvedShortages = memoryShortages.filter(s => s.status === 'SELESAI');

		const totalPendingValue = pendingShortages.reduce((acc, curr) => acc + (curr.shortage_value || 0), 0);
		const totalPendingPcs = pendingShortages.reduce((acc, curr) => acc + (curr.shortage_qty || 0), 0);

		return {
			products: products || [],
			adjustments: adjustments || [],
			shortages: [...memoryShortages],
			summary: {
				totalPendingCount: pendingShortages.length,
				totalPendingPcs,
				totalPendingValue,
				totalSubmittedCount: submittedShortages.length,
				totalResolvedCount: resolvedShortages.length
			}
		};
	} catch (e: any) {
		return {
			products: [],
			adjustments: [],
			shortages: [...memoryShortages],
			summary: {
				totalPendingCount: 0,
				totalPendingPcs: 0,
				totalPendingValue: 0,
				totalSubmittedCount: 0,
				totalResolvedCount: 0
			},
			error: e.message
		};
	}
};

export const actions: Actions = {
	/**
	 * Catat Rekap Cek Kiriman Barang Masuk & Kekurangan Ekspedisi/Supplier
	 */
	recordShortage: async ({ request }) => {
		const data = await request.formData();
		const invoice_number = String(data.get('invoice_number') || '').trim();
		const supplier_name = String(data.get('supplier_name') || '').trim();
		const product_id = String(data.get('product_id'));
		const expected_qty = Number(data.get('expected_qty'));
		const received_qty = Number(data.get('received_qty'));
		const auto_add_stock = data.get('auto_add_stock') === 'on' || data.get('auto_add_stock') === 'true';
		const notes = String(data.get('notes') || '').trim();
		const status = (String(data.get('status') || 'BELUM_DITAGIH')) as 'BELUM_DITAGIH' | 'SUDAH_DIKLAIM' | 'SELESAI';

		if (!invoice_number) {
			return { success: false, message: 'Nomor Surat Jalan / Faktur wajib diisi.' };
		}
		if (!product_id) {
			return { success: false, message: 'Pilih produk yang diperiksa.' };
		}
		if (isNaN(expected_qty) || expected_qty <= 0) {
			return { success: false, message: 'Jumlah yang seharusnya ada di Surat Jalan harus lebih dari 0.' };
		}
		if (isNaN(received_qty) || received_qty < 0) {
			return { success: false, message: 'Jumlah fisik yang diterima tidak valid.' };
		}

		const shortage_qty = expected_qty - received_qty;
		if (shortage_qty <= 0) {
			return { 
				success: false, 
				message: `Jumlah fisik (${received_qty} Pcs) sama atau lebih banyak dari surat jalan (${expected_qty} Pcs). Gunakan menu Penerimaan Barang Masuk biasa.` 
			};
		}

		try {
			const prodRes = await query<Product>(`SELECT id, stock, COALESCE(cost_price, 0) as base_hpp, name, sku FROM products WHERE id = $1`, [product_id]);
			if (prodRes.length === 0) return { success: false, message: 'Produk tidak ditemukan di sistem.' };

			const prod = prodRes[0];
			const unitCost = Number(prod.base_hpp || 0);
			const shortageValue = shortage_qty * unitCost;

			const newShortage: IncomingShortage = {
				id: `sht-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
				invoice_number,
				supplier_name: supplier_name || 'Distributor / Ekspedisi Laut Bangka',
				product_id: prod.id,
				product_name: prod.name,
				sku: prod.sku,
				expected_qty,
				received_qty,
				shortage_qty,
				unit_cost: unitCost,
				shortage_value: shortageValue,
				status,
				notes: notes || `Kekurangan kiriman fisik: kurang ${shortage_qty} Pcs dari Surat Jalan ${invoice_number}`,
				created_at: new Date().toISOString()
			};

			recordMemoryShortage(newShortage);

			// Jika kasir / staff memilih untuk langsung menambahkan fisik riil yang diterima ke stok toko
			if (auto_add_stock && received_qty > 0) {
				const currentStock = Number(prod.stock);
				const updatedStock = currentStock + received_qty;

				await query(
					`UPDATE products 
					 SET stock = $1, updated_at = NOW() 
					 WHERE id = $2`,
					[updatedStock, product_id]
				);

				const movementNote = `Penerimaan Parsial (Surat Jalan: ${invoice_number} • Kurang ${shortage_qty} Pcs) - Supplier: ${supplier_name || 'Bangka Cargo'}`;

				await query(
					`INSERT INTO stock_movements (
						id, store_id, product_id, reference_type, qty_base_change, balance_after, unit_cost_snapshot, notes
					) VALUES ($1, '11111111-1111-1111-1111-111111111111', $2, 'RESTOCK', $3, $4, $5, $6)`,
					[crypto.randomUUID(), product_id, received_qty, updatedStock, unitCost, movementNote]
				);

				broadcastRealtimeEvent({
					type: 'STOCK_CHANGED',
					data: {
						items: [{ productId: product_id, qty: received_qty, baseQty: received_qty, newBalance: updatedStock }],
						timestamp: new Date().toISOString(),
						message: `Barang Masuk Diterima: +${received_qty} Pcs "${prod.name}" (Tercatat Kurang -${shortage_qty} Pcs dari SJ ${invoice_number})`
					}
				});
			}

			return {
				success: true,
				message: `Kekurangan kiriman berhasil dicatat: Kurang ${shortage_qty} Pcs "${prod.name}" (Rp ${shortageValue.toLocaleString('id-ID')}). ${auto_add_stock && received_qty > 0 ? `+${received_qty} Pcs fisik telah masuk ke stok toko.` : ''}`
			};
		} catch (err: any) {
			return { success: false, message: 'Gagal mencatat kekurangan barang: ' + err.message };
		}
	},

	/**
	 * Update status klaim kekurangan kiriman
	 */
	updateShortageStatus: async ({ request }) => {
		const data = await request.formData();
		const shortage_id = String(data.get('shortage_id'));
		const status = String(data.get('status')) as 'BELUM_DITAGIH' | 'SUDAH_DIKLAIM' | 'SELESAI';
		const notes = String(data.get('notes') || '').trim();

		if (!shortage_id || !status) {
			return { success: false, message: 'ID kekurangan dan status wajib ditentukan.' };
		}

		updateMemoryShortageStatus(shortage_id, status, notes);

		const labelStatus = 
			status === 'SELESAI' ? 'Selesai (Sudah Dipotong Faktur / Diganti)' :
			status === 'SUDAH_DIKLAIM' ? 'Sudah Diajukan ke Supplier' : 'Belum Ditagih';

		return {
			success: true,
			message: `Status kekurangan berhasil diubah menjadi: "${labelStatus}"`
		};
	},

	/**
	 * Hapus catatan kekurangan
	 */
	deleteShortage: async ({ request }) => {
		const data = await request.formData();
		const shortage_id = String(data.get('shortage_id'));

		if (!shortage_id) {
			return { success: false, message: 'ID catatan tidak ditemukan.' };
		}

		deleteMemoryShortage(shortage_id);
		return { success: true, message: 'Catatan kekurangan berhasil dihapus.' };
	},

	/**
	 * Audit Stok Fisik Rak vs Hitungan Kasir & Barang Afkir Rusak Nyata
	 */
	adjustStock: async ({ request }) => {
		const data = await request.formData();
		const product_id = String(data.get('product_id'));
		const actual_stock = Number(data.get('actual_stock'));
		const reason = String(data.get('reason') || 'Selisih Hitungan Rak Kasir');
		const notes = String(data.get('notes') || '').trim();

		if (!product_id || isNaN(actual_stock) || actual_stock < 0) {
			return { success: false, message: 'Data stok fisik rak aktual tidak valid.' };
		}

		try {
			const prodRes = await query<Product>(`SELECT id, stock, COALESCE(cost_price, 0) as base_hpp, name FROM products WHERE id = $1`, [product_id]);
			if (prodRes.length === 0) return { success: false, message: 'Produk tidak ditemukan.' };

			const prod = prodRes[0];
			const systemStock = Number(prod.stock);
			const difference = actual_stock - systemStock;

			if (difference === 0) {
				return { success: true, message: `Stok fisik di rak sesuai dengan sistem (${actual_stock} Pcs). Tidak ada selisih.` };
			}

			await query(
				`UPDATE products 
				 SET stock = $1, updated_at = NOW() 
				 WHERE id = $2`,
				[actual_stock, product_id]
			);

			const movementNote = `Audit Rak: [${reason}] • Sistem: ${systemStock} Pcs -> Fisik Rak: ${actual_stock} Pcs (Selisih: ${difference > 0 ? '+' : ''}${difference} Pcs) ${notes ? '• ' + notes : ''}`;

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
					message: `Penyesuaian Rak: ${prod.name} disesuaikan menjadi ${actual_stock} Pcs (${reason})`
				}
			});

			return { 
				success: true, 
				message: `Penyesuaian stok rak "${prod.name}" berhasil dicatat (Selisih: ${difference > 0 ? '+' : ''}${difference} Pcs).` 
			};
		} catch (err: any) {
			return { success: false, message: 'Gagal mencatat penyesuaian: ' + err.message };
		}
	}
};

