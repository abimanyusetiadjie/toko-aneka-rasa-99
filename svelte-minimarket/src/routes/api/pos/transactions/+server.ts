import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pool, updateMemoryProductStock } from '$lib/server/db';
import { broadcastRealtimeEvent } from '$lib/server/realtime-hub';
import { pushStockToShopee } from '$lib/server/shopee-service';
import { CreateTransactionSchema } from '$lib/schemas/transaction.schema';
import { calculatePointsEarned } from '$lib/services/points';
import crypto from 'crypto';

export const POST: RequestHandler = async ({ request, locals }) => {
	let rawBody: any;
	try {
		rawBody = await request.json();
	} catch {
		throw error(400, 'Format payload JSON tidak valid');
	}

	// 1. Zod Validation
	const parseResult = CreateTransactionSchema.safeParse(rawBody);
	if (!parseResult.success) {
		const errMsg = parseResult.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
		throw error(400, `Validasi Gagal: ${errMsg}`);
	}

	const data = parseResult.data;
	const client = await pool.connect();

	try {
		// 2. Idempotency Check (Cegah Double-Charge)
		const existingTx = await client.query(
			`SELECT id, receipt_number, total_amount, created_at 
			 FROM transactions 
			 WHERE idempotency_key = $1 
			 LIMIT 1`,
			[data.idempotency_key]
		);

		if (existingTx.rows.length > 0) {
			return json({
				status: 'success',
				message: 'Transaksi sudah diproses sebelumnya (Idempotent Response)',
				transaction_id: existingTx.rows[0].id,
				receipt_number: existingTx.rows[0].receipt_number,
				is_duplicate: true
			});
		}

		await client.query('BEGIN');

		const transactionId = crypto.randomUUID();
		const receiptNumber = `RCPT-${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)}-${Math.floor(1000 + Math.random() * 9000)}`;

		// Ambil user ID dari JWT session (A-GAP-03 FIXED)
		if (!locals.user) throw new Error('Unauthorized');
		let userId = locals.user.id;
		let storeId = locals.user.store_id || '11111111-1111-1111-1111-111111111111';

		// Proteksi: Jika userId pada cookie sesi adalah ID warisan non-UUID (cth: 'u-budi' atau 'u-siti'),
		// konversikan secara otomatis ke UUID resmi di database agar Postgres tidak melempar error syntax UUID.
		const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		if (!UUID_PATTERN.test(userId)) {
			const uRes = await client.query(
				`SELECT id, store_id FROM users WHERE username = $1 LIMIT 1`,
				[locals.user.username]
			);
			if (uRes.rows.length > 0) {
				userId = uRes.rows[0].id;
				storeId = uRes.rows[0].store_id || storeId;
			} else {
				userId = '932ba9fe-2627-463b-898a-62a4c2b5ae41';
			}
		}

		if (!UUID_PATTERN.test(storeId)) {
			storeId = '11111111-1111-1111-1111-111111111111';
		}

		// 3. Validasi Saldo Poin Member (Jika menggunakan poin)
		if (data.member_id && (data.points_redeemed || 0) > 0) {
			const memberRes = await client.query(
				`SELECT id, points_balance, name FROM members WHERE id = $1 FOR UPDATE`,
				[data.member_id]
			);
			if (memberRes.rows.length === 0) {
				throw new Error('Data member tidak ditemukan.');
			}
			const member = memberRes.rows[0];
			if (Number(member.points_balance) < (data.points_redeemed || 0)) {
				throw new Error(`Saldo poin member "${member.name}" tidak mencukupi (Tersedia: ${member.points_balance} Poin, Diminta: ${data.points_redeemed} Poin).`);
			}
		}

		let calculatedSubtotal = 0;
		const preparedDetails: any[] = [];
		const isOfflineSync = data.is_offline_sync === true;

		// 4. Verifikasi Harga Mutlak Server & Row-Level Lock Stok (SELECT ... FOR UPDATE)
		for (const item of data.items) {
			// Row-level lock pada tabel produk untuk mencegah concurrent lost update
			// Cek apakah item.unit_id adalah UUID valid atau kode barcode/SKU
			const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.unit_id);
			let unitRes;

			if (isUuid) {
				unitRes = await client.query(
					`SELECT pu.id as unit_id, pu.product_id, pu.unit_name, pu.conversion_factor, pu.price, 
					        p.id as prod_id, p.name as product_name, p.stock, COALESCE(p.cost_price, 0) as base_hpp
					 FROM product_units pu
					 JOIN products p ON pu.product_id = p.id
					 WHERE pu.id = $1
					 FOR UPDATE OF p`,
					[item.unit_id]
				);
			} else {
				// Fallback aman jika item berasal dari draft lokal versi sebelumnya atau SKU
				const cleanCode = item.unit_id.replace(/^u-/, '');
				unitRes = await client.query(
					`SELECT pu.id as unit_id, pu.product_id, pu.unit_name, pu.conversion_factor, pu.price, 
					        p.id as prod_id, p.name as product_name, p.stock, COALESCE(p.cost_price, 0) as base_hpp
					 FROM product_units pu
					 JOIN products p ON pu.product_id = p.id
					 WHERE pu.barcode = $1 OR p.sku = $1 OR pu.barcode ILIKE $2
					 LIMIT 1
					 FOR UPDATE OF p`,
					[cleanCode, `%${cleanCode}%`]
				);
			}

			if (unitRes.rows.length === 0) {
				throw new Error(`Satuan produk "${item.unit_id}" tidak ditemukan.`);
			}

			const unit = unitRes.rows[0];
			const qty = Number(item.qty);
			const baseQty = Math.round(qty * Number(unit.conversion_factor));

			// Prioritas 1: Jika ini sync offline, bypass validasi stok (biarkan negatif) agar data penjualan tidak hilang.
			if (!isOfflineSync && Number(unit.stock) < baseQty) {
				throw new Error(`Stok fisik tidak mencukupi untuk "${unit.product_name}". Tersedia: ${unit.stock} Pcs, Diminta: ${baseQty} Pcs.`);
			}

			// Prioritas 1: Jika offline sync, percayai harga snapshot saat offline (jika ada), kalau tidak gunakan harga server.
			const pricePerUnit = Math.round(isOfflineSync && item.price_snapshot !== undefined ? item.price_snapshot : Number(unit.price));
			const subtotal = Math.round(qty * pricePerUnit);
			calculatedSubtotal += subtotal;

			preparedDetails.push({
				detailId: crypto.randomUUID(),
				productId: unit.prod_id,
				unitId: unit.unit_id,
				productName: unit.product_name,
				unitName: unit.unit_name,
				qty,
				conversionFactor: unit.conversion_factor,
				baseQty,
				pricePerUnit,
				baseHpp: Math.round(unit.base_hpp),
				subtotal,
				currentStock: Number(unit.stock)
			});
		}

		// Verifikasi total finansial mutlak di server (Anti-Tampering)
		const calculatedFinalTotal = Math.max(0, calculatedSubtotal - Math.round(data.points_discount || 0));
		
		// A-GAP-02 FIXED: Validasi Total Pembayaran >= Tagihan di Server
		// Prioritas 4: Gunakan Math.round() untuk integer murni, hilangkan toleransi -1 yang rawan bug.
		const totalPaid = Math.round(data.payments.reduce((sum, p) => sum + Number(p.amount), 0));
		
		// Prioritas 1: Jika offline sync, percayai totalPaid dari client untuk mencegah gagal sinkronisasi akibat price drift.
		if (!isOfflineSync && totalPaid < calculatedFinalTotal) {
			throw new Error(`Pembayaran tidak mencukupi. Tagihan Rp ${calculatedFinalTotal}, tapi total bayar Rp ${totalPaid}. Transaksi ditolak.`);
		}
		
		// Jika offline sync, gunakan total yang dibayarkan saat offline sebagai final total.
		const actualFinalTotal = isOfflineSync ? totalPaid : calculatedFinalTotal;

		// A-GAP-01 FIXED: Poin dihitung dari Subtotal SEBELUM diskon poin
		const pointsEarned = data.member_id ? Math.round(calculatePointsEarned(calculatedSubtotal)) : 0;

		// 5. Insert Header Transaksi
		// A-GAP-04 FIXED: Cari shift_id aktif untuk kasir ini
		const shiftRes = await client.query(
			`SELECT id FROM cashier_shifts WHERE user_id = $1 AND status = 'OPEN' ORDER BY opened_at DESC LIMIT 1`,
			[userId]
		);
		const shiftId = shiftRes.rows[0]?.id || null;

		const txCreatedAt = data.client_timestamp ? new Date(data.client_timestamp) : new Date();

		await client.query(
			`INSERT INTO transactions (
				id, store_id, shift_id, user_id, member_id, receipt_number, idempotency_key, 
				subtotal_amount, discount_amount, total_amount, points_earned, points_redeemed, status, payment_method, created_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'COMPLETED', $13, $14)`,
			[
				transactionId,
				storeId,
				shiftId, // Sprint 2: Link to active shift
				userId,
				data.member_id || null,
				receiptNumber,
				data.idempotency_key,
				calculatedSubtotal,
				Math.round(data.points_discount || 0),
				actualFinalTotal, // Prioritas 1: Gunakan total uang asli jika offline sync
				pointsEarned,
				data.points_redeemed || 0,
				data.payments[0]?.payment_method || 'CASH',
				txCreatedAt // Prioritas 3: Tanggal sinkronisasi tidak boleh mengubah tanggal transaksi aktual
			]
		);

		// 6. Eksekusi Pengurangan Stok & Catat Ledger
		for (const detail of preparedDetails) {
			// Insert Detail
			await client.query(
				`INSERT INTO transaction_details (
					id, transaction_id, product_id, unit_id, qty, conversion_factor, base_qty, price_per_unit, cost_price_snapshot, subtotal
				) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
				[
					detail.detailId,
					transactionId,
					detail.productId,
					detail.unitId,
					detail.qty,
					detail.conversionFactor,
					detail.baseQty,
					detail.pricePerUnit,
					detail.baseHpp,
					detail.subtotal
				]
			);

			// Kurangi Stok Produk Secara Atomik
			const newBalance = detail.currentStock - detail.baseQty;
			await client.query(
				`UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2`,
				[newBalance, detail.productId]
			);

			// Catat Double-Entry Stock Movement Ledger (Audit Trail Finansial)
			await client.query(
				`INSERT INTO stock_movements (
					id, store_id, product_id, reference_type, reference_id, qty_base_change, balance_after, unit_cost_snapshot, created_by, notes, created_at
				) VALUES ($1, $2, $3, 'SALE', $4, $5, $6, $7, $8, $9, $10)`,
				[
					crypto.randomUUID(),
					storeId,
					detail.productId,
					transactionId,
					-detail.baseQty,
					newBalance,
					detail.baseHpp,
					userId,
					`Penjualan kasir No: ${receiptNumber} (${detail.qty} ${detail.unitName})`,
					txCreatedAt
				]
			);
		}

		// 7. Insert Pembayaran (Split Payments)
		for (const pay of data.payments) {
			await client.query(
				`INSERT INTO transaction_payments (
					id, transaction_id, payment_method, amount, payment_reference, change_given
				) VALUES ($1, $2, $3, $4, $5, $6)`,
				[
					crypto.randomUUID(),
					transactionId,
					pay.payment_method,
					pay.amount,
					pay.payment_reference || null,
					pay.change_given || 0
				]
			);
		}

		// 8. Update Saldo Poin & Total Belanja Member
		if (data.member_id) {
			const netPointChange = pointsEarned - (data.points_redeemed || 0);
			await client.query(
				`UPDATE members 
				 SET points_balance = GREATEST(0, points_balance + $1),
				     total_spend = total_spend + $2
				 WHERE id = $3`,
				[netPointChange, calculatedFinalTotal, data.member_id]
			);
		}

		await client.query('COMMIT');

		// 9. Real-Time Broadcast ke seluruh perangkat (HP owner, PC admin, dll.)
		try {
			broadcastRealtimeEvent({
				type: 'TRANSACTION_COMPLETED',
				data: {
					receiptNumber,
					totalAmount: actualFinalTotal,
					items: preparedDetails.map((d) => ({
						productId: d.productId,
						productName: d.productName,
						qty: d.qty,
						baseQty: d.baseQty,
						newBalance: d.currentStock - d.baseQty
					})),
					timestamp: new Date().toISOString(),
					message: `Transaksi baru No: ${receiptNumber} sebesar Rp ${actualFinalTotal.toLocaleString('id-ID')}`
				}
			});

			// Sinkronisasi memori lokal server jika fallback aktif
			for (const detail of preparedDetails) {
				updateMemoryProductStock(detail.productId, detail.currentStock - detail.baseQty);
			}

			// 2-Way Sync: Update etalase Shopee seketika
			pushStockToShopee(
				preparedDetails.map((d) => ({
					newStock: Math.max(0, d.currentStock - d.baseQty)
				}))
			).catch(() => {});
		} catch (broadcastErr) {
			console.error('Realtime broadcast error (non-fatal):', broadcastErr);
		}

		return json({
			status: 'success',
			message: 'Transaksi berhasil disimpan secara aman',
			transaction_id: transactionId,
			receipt_number: receiptNumber,
			points_earned: pointsEarned,
			total_amount: calculatedFinalTotal
		}, { status: 201 });

	} catch (err: any) {
		await client.query('ROLLBACK');
		throw error(500, err.message || 'Transaksi Gagal');
	} finally {
		client.release();
	}
};
