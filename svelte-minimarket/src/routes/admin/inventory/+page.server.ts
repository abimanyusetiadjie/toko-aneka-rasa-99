import type { PageServerLoad, Actions } from './$types';
import { query, updateMemoryProductStock } from '$lib/server/db';
import { broadcastRealtimeEvent } from '$lib/server/realtime-hub';
import type { Product, Category } from '$lib/types';
import { build6DigitBarcode } from '$lib/server/barcode-cluster';

export const load: PageServerLoad = async ({ setHeaders, locals }) => {
	setHeaders({
		'cache-control': 'no-cache, no-store, must-revalidate'
	});
	const isOwner = locals.user?.role_id === 1 || locals.user?.username?.toLowerCase().includes('owner');

	try {
		const [rawProducts, categories, rawMovements] = await Promise.all([
			query<Product>(`
				SELECT 
					p.id, p.sku, p.name, p.category_id, 
					COALESCE(p.unit, 'pcs') as base_unit, 
					COALESCE(p.cost_price, 0) as base_hpp, 
					p.stock,
					c.name as category_name,
					COALESCE(pu.price, p.price) as selling_price,
					COALESCE(p.barcode, pu.barcode, p.sku) as barcode
				FROM products p
				LEFT JOIN categories c ON p.category_id = c.id
				LEFT JOIN LATERAL (
					SELECT id, unit_name, price, barcode
					FROM product_units
					WHERE product_id = p.id AND (conversion_factor = 1 OR conversion_factor IS NULL)
					ORDER BY CASE WHEN price > 0 THEN 1 ELSE 2 END, created_at DESC
					LIMIT 1
				) pu ON true
				WHERE (p.is_active = true OR p.is_active IS NULL)
				ORDER BY p.name ASC
			`),
			query<Category>(`SELECT id, name FROM categories ORDER BY name ASC`),
			query(`
				SELECT 
					sm.id, sm.reference_type, sm.qty_base_change, sm.balance_after, sm.unit_cost_snapshot,
					sm.notes, sm.created_at, p.name as product_name
				FROM stock_movements sm
				JOIN products p ON sm.product_id = p.id
				ORDER BY sm.created_at DESC
				LIMIT 10
			`)
		]);

		const products = (rawProducts || []).map((p) => ({
			...p,
			base_hpp: isOwner ? Number(p.base_hpp || 0) : 0
		}));

		const movements = (rawMovements || []).map((m: any) => ({
			...m,
			unit_cost_snapshot: isOwner ? Number(m.unit_cost_snapshot || 0) : 0
		}));

		return { 
			products, 
			categories: categories || [], 
			movements,
			isOwner: !!isOwner 
		};
	} catch (e: any) {
		return { products: [], categories: [], movements: [], isOwner: !!isOwner, error: e.message };
	}
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const isOwner = locals.user?.role_id === 1 || locals.user?.username?.toLowerCase().includes('owner');
		const data = await request.formData();
		const name = String(data.get('name') || '').trim();
		const rawCat = String(data.get('category_id') || '').trim();
		const category_id = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawCat)
			? rawCat
			: '55555555-5555-5555-5555-555555555555';
		const base_hpp = isOwner ? Number(data.get('base_hpp') || 0) : 0;
		const selling_price = Number(data.get('selling_price') || 0);
		const stock = Number(data.get('stock') || 0);
		let barcode = String(data.get('barcode') || '').trim();
		let sku = String(data.get('sku') || '').trim();

		if (!name) {
			return { success: false, message: 'Nama produk wajib diisi.' };
		}

		if (!sku) {
			sku = 'SKU-' + name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
		}
		if (!barcode) {
			const catRow = await query<any>(`SELECT name FROM categories WHERE id = $1`, [category_id]);
			const existingUnits = await query<any>(`SELECT barcode FROM product_units WHERE barcode ~ '^[0-9]{6}$'`);
			const usedSet = new Set<string>((existingUnits || []).map((u: any) => u.barcode));
			barcode = build6DigitBarcode(catRow[0]?.name || '', name, sku, usedSet, {}, category_id);
		}

		const productId = crypto.randomUUID();
		const unitId = crypto.randomUUID();
		const storeId = '11111111-1111-1111-1111-111111111111';

		try {
			// Sprint 3: Alert Barcode Duplikat
			const existingBarcode = await query(`SELECT id FROM product_units WHERE barcode = $1`, [barcode]);
			if (existingBarcode.length > 0) {
				return { success: false, message: `Gagal: Barcode "${barcode}" sudah terdaftar di sistem!` };
			}

			await query(
				`INSERT INTO products (id, store_id, sku, name, category_id, base_unit, base_hpp, cost_price, stock, barcode)
				 VALUES ($1, $2, $3, $4, $5, 'Pcs', $6, $6, $7, $8)`,
				[productId, storeId, sku, name, category_id, base_hpp, stock, barcode]
			);

			await query(
				`INSERT INTO product_units (id, product_id, unit_name, conversion_factor, price, barcode)
				 VALUES ($1, $2, 'Pcs', 1, $3, $4)`,
				[unitId, productId, selling_price || base_hpp * 1.25, barcode]
			);

			if (stock > 0) {
				await query(
					`INSERT INTO stock_movements (
						id, store_id, product_id, reference_type, qty_base_change, balance_after, unit_cost_snapshot, notes
					) VALUES ($1, $2, $3, 'INITIAL', $4, $5, $6, 'Stok Awal Produk Baru')`,
					[crypto.randomUUID(), storeId, productId, stock, stock, base_hpp]
				);
			}

			updateMemoryProductStock(productId, stock);
			if (barcode) updateMemoryProductStock(barcode, stock);

			broadcastRealtimeEvent({
				type: 'STOCK_CHANGED',
				data: {
					items: [{ productId, qty: stock, baseQty: stock, newBalance: stock }],
					timestamp: new Date().toISOString(),
					message: `Produk baru ditambahkan: ${name} (Barcode: ${barcode})`
				}
			});

			return { success: true, message: `Produk "${name}" & Barcode "${barcode}" berhasil disimpan.` };
		} catch (err: any) {
			return { success: false, message: 'Gagal menambahkan produk: ' + err.message };
		}
	},

	restock: async ({ request, locals }) => {
		const isOwner = locals.user?.role_id === 1 || locals.user?.username?.toLowerCase().includes('owner');
		const data = await request.formData();
		const id = String(data.get('id'));
		const addQty = Number(data.get('qty'));
		const purchaseCost = Number(data.get('purchase_cost'));
		const notes = String(data.get('notes') || 'Restock Barang Masuk');

		if (!id || addQty <= 0) {
			return { success: false, message: 'Kuantiti restock harus lebih dari 0.' };
		}

		try {
			const prodList = await query<Product>(`SELECT id, stock, base_hpp, cost_price, name, sku FROM products WHERE id = $1`, [id]);
			const prod = prodList[0];
			if (!prod) return { success: false, message: 'Produk tidak ditemukan.' };

			const currentHpp = Number(prod.base_hpp || prod.cost_price || 0);
			const unitCost = (isOwner && purchaseCost > 0) ? purchaseCost : currentHpp;

			// CRITICAL: Gunakan atomic increment (stock = stock + $1) untuk mencegah race condition
			// Jika kasir menjual barang bersamaan dengan admin menambah stok, 
			// metode lama (read-modify-write) bisa menimpa pengurangan stok kasir
			const updateResult = await query<any>(
				`UPDATE products SET stock = stock + $1, base_hpp = $2, cost_price = $2, updated_at = NOW() WHERE id = $3 RETURNING stock`,
				[addQty, unitCost, id]
			);
			const newBalance = Number(updateResult[0]?.stock ?? (Number(prod.stock) + addQty));

			await query(
				`INSERT INTO stock_movements (
					id, store_id, product_id, reference_type, qty_base_change, balance_after, unit_cost_snapshot, notes
				) VALUES ($1, '11111111-1111-1111-1111-111111111111', $2, 'RESTOCK', $3, $4, $5, $6)`,
				[crypto.randomUUID(), id, addQty, newBalance, unitCost, notes]
			);

			updateMemoryProductStock(id, newBalance);
			if (prod.sku) updateMemoryProductStock(prod.sku, newBalance);
			if (prod.name) updateMemoryProductStock(prod.name, newBalance);

			broadcastRealtimeEvent({
				type: 'STOCK_CHANGED',
				data: {
					items: [{ productId: id, qty: addQty, baseQty: addQty, newBalance }],
					timestamp: new Date().toISOString(),
					message: `Restock barang: +${addQty} Pcs untuk ${prod.name}`
				}
			});

			return { success: true, message: `Berhasil menambah stok +${addQty} Pcs!` };
		} catch (err: any) {
			return { success: false, message: 'Gagal melakukan restock: ' + err.message };
		}
	},

	update: async ({ request, locals }) => {
		const isOwner = locals.user?.role_id === 1 || locals.user?.username?.toLowerCase().includes('owner');
		const data = await request.formData();
		const id = String(data.get('id'));
		const name = String(data.get('name') || '').trim();
		const rawCat = String(data.get('category_id') || '').trim();
		const category_id = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawCat)
			? rawCat
			: '55555555-5555-5555-5555-555555555555';
		const base_hpp_form = Number(data.get('base_hpp') || 0);
		const selling_price = Number(data.get('selling_price') || 0);
		const stock = Number(data.get('stock') || 0);
		const barcode = String(data.get('barcode') || '').trim();

		if (!id || !name) {
			return { success: false, message: 'Data tidak lengkap.' };
		}

		try {
			// Cek duplikasi barcode di produk lain
			if (barcode) {
				const existingBarcode = await query(
					`SELECT id, product_id FROM product_units WHERE barcode = $1 AND product_id != $2
					 UNION
					 SELECT id, id as product_id FROM products WHERE barcode = $1 AND id != $2`, 
					[barcode, id]
				);
				if (existingBarcode.length > 0) {
					return { success: false, message: `Gagal: Barcode "${barcode}" sudah dipakai oleh produk lain!` };
				}
			}

			const existingProd = await query<Product>(`SELECT base_hpp, cost_price, sku, barcode, stock FROM products WHERE id = $1`, [id]);
			const currentHpp = Number(existingProd[0]?.base_hpp || existingProd[0]?.cost_price || 0);
			const base_hpp = isOwner ? base_hpp_form : currentHpp;
			const oldStock = Number(existingProd[0]?.stock ?? stock);

			let finalBarcode = barcode;
			if (!finalBarcode) {
				const catRow = await query<any>(`SELECT name FROM categories WHERE id = $1`, [category_id]);
				const existingUnits = await query<any>(`SELECT barcode FROM product_units WHERE barcode ~ '^[0-9]{6}$' UNION SELECT barcode FROM products WHERE barcode ~ '^[0-9]{6}$'`);
				const usedSet = new Set<string>((existingUnits || []).map((u: any) => u.barcode));
				finalBarcode = build6DigitBarcode(catRow[0]?.name || '', name, existingProd[0]?.sku || '', usedSet, {}, category_id);
			}

			await query(
				`UPDATE products 
				 SET name = $1, category_id = $2, base_hpp = $3, cost_price = $3, price = $4, stock = $5, barcode = $6, updated_at = NOW()
				 WHERE id = $7`,
				[name, category_id, base_hpp, selling_price, stock, finalBarcode, id]
			);

			// Catat riwayat jika ada perubahan jumlah stok manual
			const stockDiff = stock - oldStock;
			if (stockDiff !== 0) {
				await query(
					`INSERT INTO stock_movements (
						id, store_id, product_id, reference_type, qty_base_change, balance_after, unit_cost_snapshot, notes
					) VALUES ($1, '11111111-1111-1111-1111-111111111111', $2, 'ADJUSTMENT', $3, $4, $5, $6)`,
					[
						crypto.randomUUID(),
						id,
						stockDiff,
						stock,
						base_hpp,
						`Koreksi Manual Admin: ${oldStock} -> ${stock} (${stockDiff > 0 ? '+' + stockDiff : stockDiff})`
					]
				);
			}

			const existingUnits = await query<any>(`SELECT id FROM product_units WHERE product_id = $1`, [id]);
			if (existingUnits.length > 0) {
				await query(
					`UPDATE product_units 
					 SET price = $1, barcode = $2
					 WHERE product_id = $3 AND (conversion_factor = 1 OR conversion_factor IS NULL)`,
					[selling_price, finalBarcode, id]
				);
			} else {
				await query(
					`INSERT INTO product_units (id, product_id, unit_name, conversion_factor, price, barcode)
					 VALUES ($1, $2, 'Pcs', 1, $3, $4)`,
					[crypto.randomUUID(), id, selling_price, finalBarcode]
				);
			}

			updateMemoryProductStock(id, stock);
			if (finalBarcode) updateMemoryProductStock(finalBarcode, stock);
			if (name) updateMemoryProductStock(name, stock);

			broadcastRealtimeEvent({
				type: 'STOCK_CHANGED',
				data: {
					items: [{ productId: id, qty: 0, baseQty: 0, newBalance: stock, price: selling_price, barcode: finalBarcode, name }],
					timestamp: new Date().toISOString(),
					message: `Produk diperbarui: ${name} (Barcode: ${finalBarcode})`
				}
			});

			return { success: true, message: `Produk "${name}" berhasil diperbarui dengan Barcode "${finalBarcode}".` };
		} catch (err: any) {
			return { success: false, message: 'Gagal memperbarui produk: ' + err.message };
		}
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id'));
		if (!id) return { success: false, message: 'ID produk tidak valid.' };

		try {
			// Cek apakah produk sudah pernah terlibat dalam transaksi penjualan
			let hasTransactions = false;
			try {
				const txUsage = await query(`SELECT id FROM transaction_details WHERE product_id = $1 LIMIT 1`, [id]);
				if (txUsage && txUsage.length > 0) hasTransactions = true;
			} catch {}

			if (hasTransactions) {
				// Soft delete: tandai tidak aktif agar riwayat nota/laporan keuangan masa lalu tetap valid
				await query(`UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1`, [id]);
				await query(`DELETE FROM product_units WHERE product_id = $1`, [id]);
			} else {
				// Hard delete bersih jika belum ada transaksi
				try { await query(`DELETE FROM stock_movements WHERE product_id = $1`, [id]); } catch {}
				try { await query(`DELETE FROM product_units WHERE product_id = $1`, [id]); } catch {}
				await query(`DELETE FROM products WHERE id = $1`, [id]);
			}

			updateMemoryProductStock(id, 0);

			broadcastRealtimeEvent({
				type: 'STOCK_CHANGED',
				data: {
					items: [{ productId: id, qty: 0, baseQty: 0, newBalance: 0 }],
					timestamp: new Date().toISOString(),
					message: `Produk dihapus dari inventori`
				}
			});

			return { success: true, message: 'Produk berhasil dihapus dari inventori detik ini juga.' };
		} catch (err: any) {
			return { success: false, message: 'Gagal menghapus produk: ' + err.message };
		}
	}
};
