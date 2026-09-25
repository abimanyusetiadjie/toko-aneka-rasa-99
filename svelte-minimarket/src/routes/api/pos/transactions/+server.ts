import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pool, updateMemoryProductStock, getProductForCheckout, recordMemoryTransaction, memoryTransactions, memoryStockMovements, memoryProducts, memoryProductUnits } from '$lib/server/db';
import { broadcastRealtimeEvent } from '$lib/server/realtime-hub';
import { pushStockToShopee } from '$lib/server/shopee-service';
import { CreateTransactionSchema } from '$lib/schemas/transaction.schema';
import { calculatePointsEarned } from '$lib/services/points';

export const GET: RequestHandler = async () => {
	let client: any = null;
	try {
		client = await pool.connect();
	} catch {
		client = null;
	}

	if (client) {
		try {
			const res = await client.query(
				`SELECT id, receipt_number, total_amount, payment_method, created_at, status 
				 FROM transactions 
				 WHERE created_at >= CURRENT_DATE 
				 ORDER BY created_at DESC 
				 LIMIT 100`
			);
			return json({
				status: 'success',
				transactions: res.rows
			});
		} catch {
			// fallback to memory
		} finally {
			try { client.release(); } catch {}
		}
	}

	return json({
		status: 'success',
		transactions: memoryTransactions
	});
};

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
	const isOfflineSync = data.is_offline_sync === true;

	const transactionId = crypto.randomUUID();
	const receiptNumber = `RCPT-${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)}-${Math.floor(1000 + Math.random() * 9000)}`;

	let userId = locals.user?.id || '46030803-a7e6-4827-b93e-0cafcf148ac7';
	let storeId: string | null = locals.user?.store_id || '11111111-1111-1111-1111-111111111111';

	let client: any = null;
	try {
		client = await pool.connect();
	} catch (connErr) {
		client = null;
	}

	// JALUR 1: Jika database PostgreSQL/Supabase terkoneksi aktif
	if (client) {
		try {
			const existingTx = await client.query(
				`SELECT id, receipt_number, total_amount, created_at FROM transactions WHERE idempotency_key = $1 LIMIT 1`,
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

			// Pastikan userId dan storeId valid di database untuk mencegah foreign key violation
			try {
				const userCheck = await client.query(`SELECT id FROM users WHERE id = $1 LIMIT 1`, [userId]);
				if (userCheck.rows.length === 0) {
					const anyUser = await client.query(`SELECT id FROM users ORDER BY created_at ASC LIMIT 1`);
					if (anyUser.rows.length > 0) userId = anyUser.rows[0].id;
				}
			} catch {}

			try {
				const storeCheck = await client.query(`SELECT id FROM stores WHERE id = $1 LIMIT 1`, [storeId]);
				if (storeCheck.rows.length === 0) {
					const anyStore = await client.query(`SELECT id FROM stores ORDER BY created_at ASC LIMIT 1`);
					storeId = anyStore.rows.length > 0 ? anyStore.rows[0].id : null;
				}
			} catch {}

			await client.query('BEGIN');

			// Validasi Poin Member
			if (data.member_id && (data.points_redeemed || 0) > 0) {
				const memberRes = await client.query(
					`SELECT id, points_balance, name FROM members WHERE id = $1 FOR UPDATE`,
					[data.member_id]
				);
				if (memberRes.rows.length > 0) {
					const member = memberRes.rows[0];
					if (Number(member.points_balance) < (data.points_redeemed || 0)) {
						throw new Error(`Saldo poin member "${member.name}" tidak mencukupi.`);
					}
				}
			}

			let calculatedSubtotal = 0;
			const preparedDetails: any[] = [];

			// Urutkan items secara deterministik untuk mencegah deadlock database
			// Jika 2 transaksi kasir bersamaan mengunci item A lalu B vs B lalu A, bisa deadlock
			const sortedItems = [...data.items].sort((a, b) => 
				String(a.unit_id || '').localeCompare(String(b.unit_id || ''))
			);

			for (const item of sortedItems) {
				const rawUnitId = String(item.unit_id || '').trim();
				const cleanCode = rawUnitId.replace(/^(unit-|u-)/i, '').trim();
				const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawUnitId);
				const isCleanUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanCode);

				let unitRes;
				if (isUuid) {
					// 1. Cek jika rawUnitId adalah pu.id ATAU p.id
					unitRes = await client.query(
						`SELECT pu.id as unit_id, p.id as prod_id, p.name as product_name, p.stock,
						        COALESCE(pu.unit_name, p.unit, 'Pcs') as unit_name,
						        COALESCE(pu.conversion_factor, 1) as conversion_factor,
						        COALESCE(pu.price, p.price, 0) as price,
						        COALESCE(p.cost_price, p.base_hpp, 0) as base_hpp
						 FROM products p
						 LEFT JOIN product_units pu ON p.id = pu.product_id
						 WHERE pu.id = $1 OR p.id = $1
						 ORDER BY CASE WHEN p.stock > 0 THEN 1 ELSE 2 END, pu.conversion_factor ASC
						 LIMIT 1
						 FOR UPDATE OF p`,
						[rawUnitId]
					);
				} else if (isCleanUuid) {
					// 2. Cek jika rawUnitId berupa format 'unit-<uuid>'
					unitRes = await client.query(
						`SELECT pu.id as unit_id, p.id as prod_id, p.name as product_name, p.stock,
						        COALESCE(pu.unit_name, p.unit, 'Pcs') as unit_name,
						        COALESCE(pu.conversion_factor, 1) as conversion_factor,
						        COALESCE(pu.price, p.price, 0) as price,
						        COALESCE(p.cost_price, p.base_hpp, 0) as base_hpp
						 FROM products p
						 LEFT JOIN product_units pu ON p.id = pu.product_id
						 WHERE p.id = $1 OR pu.id = $1
						 ORDER BY CASE WHEN p.stock > 0 THEN 1 ELSE 2 END, pu.conversion_factor ASC
						 LIMIT 1
						 FOR UPDATE OF p`,
						[cleanCode]
					);
				} else {
					// 3. Cek jika rawUnitId berupa Barcode atau SKU
					unitRes = await client.query(
						`SELECT pu.id as unit_id, p.id as prod_id, p.name as product_name, p.stock,
						        COALESCE(pu.unit_name, p.unit, 'Pcs') as unit_name,
						        COALESCE(pu.conversion_factor, 1) as conversion_factor,
						        COALESCE(pu.price, p.price, 0) as price,
						        COALESCE(p.cost_price, p.base_hpp, 0) as base_hpp
						 FROM products p
						 LEFT JOIN product_units pu ON p.id = pu.product_id
						 WHERE pu.barcode = $1 
						    OR p.sku = $1 
						    OR pu.barcode ILIKE $2 
						    OR p.sku ILIKE $2
						 ORDER BY CASE WHEN p.stock > 0 THEN 1 ELSE 2 END, pu.conversion_factor ASC
						 LIMIT 1
						 FOR UPDATE OF p`,
						[cleanCode, `%${cleanCode}%`]
					);
				}

				if (!unitRes || unitRes.rows.length === 0) {
					// Fallback cerdas: Jika ID yang dikirim dari keranjang kasir adalah UUID dari draft/cache lokal,
					// cari padanan barcode/SKU di mapping produk resmi, lalu cari di database VPS
					const seedUnit = memoryProductUnits.find(u => u.id === rawUnitId || u.product_id === rawUnitId);
					const seedProd = memoryProducts.find(p => p.id === rawUnitId || (seedUnit && p.id === seedUnit.product_id));
					const candidates: string[] = [];
					if (seedUnit?.barcode) candidates.push(seedUnit.barcode);
					if (seedProd?.barcode) candidates.push(seedProd.barcode);
					if (seedProd?.sku) candidates.push(seedProd.sku);

					if (candidates.length > 0) {
						unitRes = await client.query(
							`SELECT pu.id as unit_id, p.id as prod_id, p.name as product_name, p.stock,
							        COALESCE(pu.unit_name, p.unit, 'Pcs') as unit_name,
							        COALESCE(pu.conversion_factor, 1) as conversion_factor,
							        COALESCE(pu.price, p.price, 0) as price,
							        COALESCE(p.cost_price, p.base_hpp, 0) as base_hpp
							 FROM products p
							 LEFT JOIN product_units pu ON p.id = pu.product_id
							 WHERE pu.barcode = ANY($1) 
							    OR p.barcode = ANY($1) 
							    OR p.sku = ANY($1)
							 ORDER BY CASE WHEN p.stock > 0 THEN 1 ELSE 2 END, pu.conversion_factor ASC
							 LIMIT 1
							 FOR UPDATE OF p`,
							[candidates]
						);
					}
				}

				if (unitRes && unitRes.rows.length > 0) {
					const unit = unitRes.rows[0];
					const qty = Number(item.qty);
					const conversionFactor = Number(unit.conversion_factor || 1);
					const baseQty = Math.round(qty * conversionFactor);

					if (!isOfflineSync && Number(unit.stock) < baseQty) {
						throw new Error(`Stok fisik tidak mencukupi untuk "${unit.product_name}". Tersedia: ${unit.stock} Pcs, Diminta: ${baseQty} Pcs.`);
					}

					let validUnitId: string | null = null;
					// 1. Verifikasi jika unit.unit_id benar-benar ada di tabel product_units
					if (unit.unit_id) {
						const puCheck = await client.query(`SELECT id FROM product_units WHERE id = $1 LIMIT 1`, [unit.unit_id]);
						if (puCheck.rows.length > 0) {
							validUnitId = puCheck.rows[0].id;
						}
					}

					// 2. Jika belum valid, cari unit default produk ini di product_units
					if (!validUnitId) {
						const puMatch = await client.query(
							`SELECT id FROM product_units WHERE product_id = $1 ORDER BY conversion_factor ASC LIMIT 1`,
							[unit.prod_id]
						);
						if (puMatch.rows.length > 0) {
							validUnitId = puMatch.rows[0].id;
						} else {
							// 3. Buat baris unit baru jika belum ada
							const genUnitId = crypto.randomUUID();
							try {
								await client.query(
									`INSERT INTO product_units (id, product_id, unit_name, conversion_factor, price, barcode)
									 VALUES ($1, $2, $3, 1, $4, $5)
									 ON CONFLICT DO NOTHING`,
									[genUnitId, unit.prod_id, unit.unit_name || 'Pcs', unit.price, cleanCode || unit.prod_id]
								);
								const verifyRes = await client.query(
									`SELECT id FROM product_units WHERE id = $1 OR product_id = $2 ORDER BY CASE WHEN id = $1 THEN 0 ELSE 1 END LIMIT 1`,
									[genUnitId, unit.prod_id]
								);
								validUnitId = verifyRes.rows[0]?.id || null;
							} catch {
								validUnitId = null;
							}
						}
					}

					const pricePerUnit = Math.round(isOfflineSync && item.price_snapshot !== undefined ? item.price_snapshot : Number(unit.price));
					const subtotal = Math.round(qty * pricePerUnit);
					calculatedSubtotal += subtotal;

					preparedDetails.push({
						requestedId: item.unit_id,
						detailId: crypto.randomUUID(),
						productId: unit.prod_id,
						unitId: validUnitId,
						productName: unit.product_name,
						unitName: unit.unit_name,
						qty,
						conversionFactor,
						baseQty,
						pricePerUnit,
						baseHpp: Math.round(unit.base_hpp || 0),
						subtotal,
						currentStock: Number(unit.stock)
					});
				} else {
					console.warn('[POS Transactions] Item tidak ditemukan di DB:', item.unit_id);
				}
			}

			// CRITICAL: Jika ada item yang tidak ditemukan di database, tolak transaksi secara eksplisit
			// Jangan pernah jatuh diam-diam ke Jalur 2 (in-memory) karena bisa menyebabkan:
			// - Harga salah (default Rp 10.000)
			// - Stok tidak terpotong di database
			// - Transaksi hilang saat server restart
			if (preparedDetails.length !== data.items.length) {
				const missingItems = data.items
					.filter((_: any, i: number) => !preparedDetails.some((d: any) => 
						d.requestedId === data.items[i].unit_id || 
						d.unitId === data.items[i].unit_id || 
						d.productId === data.items[i].unit_id
					))
					.map((item: any) => item.unit_id);
				throw new Error(`Produk tidak ditemukan di database: ${missingItems.join(', ')}. Silakan scan ulang barang yang bermasalah.`);
			}

			// Seluruh item berhasil ditemukan di database
			if (preparedDetails.length === data.items.length) {
				const calculatedFinalTotal = Math.max(0, calculatedSubtotal - Math.round(data.points_discount || 0));
				const totalPaid = Math.round(data.payments.reduce((sum, p) => sum + Number(p.amount), 0));

				if (!isOfflineSync && totalPaid < calculatedFinalTotal) {
					throw new Error(`Pembayaran tidak mencukupi. Tagihan Rp ${calculatedFinalTotal}, bayar Rp ${totalPaid}.`);
				}

				const actualFinalTotal = isOfflineSync ? totalPaid : calculatedFinalTotal;
				const pointsEarned = data.member_id ? Math.round(calculatePointsEarned(calculatedSubtotal)) : 0;
				const txCreatedAt = data.client_timestamp ? new Date(data.client_timestamp) : new Date();

				let activeShiftId: string | null = null;
				try {
					const shiftRes = await client.query(
						`SELECT id FROM cashier_shifts WHERE user_id = $1 AND status = 'OPEN' ORDER BY opened_at DESC LIMIT 1`,
						[userId]
					);
					if (shiftRes.rows.length > 0) {
						activeShiftId = shiftRes.rows[0].id;
					}
				} catch {}

				await client.query(
					`INSERT INTO transactions (
						id, store_id, shift_id, user_id, member_id, receipt_number, idempotency_key, 
						subtotal_amount, discount_amount, total_amount, points_earned, points_redeemed, status, payment_method, created_at
					) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'COMPLETED', $13, $14)`,
					[
						transactionId, storeId, activeShiftId, userId, data.member_id || null, receiptNumber, data.idempotency_key,
						calculatedSubtotal, Math.round(data.points_discount || 0), actualFinalTotal, pointsEarned, data.points_redeemed || 0,
						data.payments[0]?.payment_method || 'CASH', txCreatedAt
					]
				);

				for (const detail of preparedDetails) {
					await client.query(
						`INSERT INTO transaction_details (
							id, transaction_id, product_id, unit_id, qty, conversion_factor, base_qty, price_per_unit, cost_price_snapshot, subtotal
						) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
						[detail.detailId, transactionId, detail.productId, detail.unitId, detail.qty, detail.conversionFactor, detail.baseQty, detail.pricePerUnit, detail.baseHpp, detail.subtotal]
					);

					const newBalance = detail.currentStock - detail.baseQty;
					await client.query(`UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2`, [newBalance, detail.productId]);

					try {
						await client.query(
							`INSERT INTO stock_movements (
								id, store_id, product_id, reference_type, reference_id, qty_base_change, balance_after, unit_cost_snapshot, created_by, notes, created_at
							) VALUES ($1, $2, $3, 'SALE', $4, $5, $6, $7, $8, $9, NOW())`,
							[
								crypto.randomUUID(),
								storeId,
								detail.productId,
								transactionId,
								-detail.baseQty,
								newBalance,
								detail.baseHpp,
								userId,
								`Penjualan Kasir No: ${receiptNumber}`
							]
						);
					} catch (smErr: any) {
						console.warn('[POS] Retrying stock_movements insert with basic columns:', smErr.message);
						await client.query(
							`INSERT INTO stock_movements (
								id, store_id, product_id, reference_type, qty_base_change, balance_after, unit_cost_snapshot, notes
							) VALUES ($1, $2, $3, 'SALE', $4, $5, $6, $7)`,
							[
								crypto.randomUUID(),
								storeId,
								detail.productId,
								-detail.baseQty,
								newBalance,
								detail.baseHpp,
								`Penjualan Kasir No: ${receiptNumber}`
							]
						);
					}
				}

				for (const pay of data.payments) {
					await client.query(
						`INSERT INTO transaction_payments (
							id, transaction_id, payment_method, amount, payment_reference, change_given
						) VALUES ($1, $2, $3, $4, $5, $6)`,
						[crypto.randomUUID(), transactionId, pay.payment_method, pay.amount, pay.payment_reference || null, pay.change_given || 0]
					);
				}

				if (activeShiftId) {
					const cashPaid = data.payments
						.filter((p: any) => p.payment_method === 'CASH')
						.reduce((sum: number, p: any) => sum + (Number(p.amount) - Number(p.change_given || 0)), 0);
					if (cashPaid > 0) {
						await client.query(
							`UPDATE cashier_shifts SET expected_cash = expected_cash + $1 WHERE id = $2`,
							[cashPaid, activeShiftId]
						);
					}
				}

				if (data.member_id) {
					const netPointChange = pointsEarned - (data.points_redeemed || 0);
					await client.query(
						`UPDATE members SET points_balance = GREATEST(0, points_balance + $1), total_spend = total_spend + $2 WHERE id = $3`,
						[netPointChange, calculatedFinalTotal, data.member_id]
					);
				}

				await client.query('COMMIT');

				for (const detail of preparedDetails) {
					updateMemoryProductStock(detail.productId, detail.currentStock - detail.baseQty);
				}

				try {
					broadcastRealtimeEvent({
						type: 'STOCK_CHANGED',
						data: {
							items: preparedDetails.map(d => ({
								productId: d.productId,
								qty: d.qty,
								baseQty: d.baseQty,
								newBalance: d.currentStock - d.baseQty
							})),
							timestamp: new Date().toISOString(),
							message: `Penjualan Kasir No: ${receiptNumber}`
						}
					});
				} catch {}

				try {
					broadcastRealtimeEvent({
						type: 'TRANSACTION_COMPLETED',
						data: {
							receiptNumber,
							totalAmount: actualFinalTotal,
							items: preparedDetails.map(d => ({
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
				} catch {}

				return json({
					status: 'success',
					message: 'Transaksi berhasil disimpan secara aman',
					transaction_id: transactionId,
					receipt_number: receiptNumber,
					points_earned: pointsEarned,
					total_amount: calculatedFinalTotal
				}, { status: 201 });
			}
		} catch (dbErr: any) {
			try { await client.query('ROLLBACK'); } catch {}
			console.error('[POS Checkout PostgreSQL Error]', {
				message: dbErr.message,
				detail: dbErr.detail,
				constraint: dbErr.constraint,
				table: dbErr.table,
				code: dbErr.code
			});
			// Semua error bisnis (stok, pembayaran, produk tidak ditemukan) harus langsung dikembalikan ke kasir
			if (dbErr.message.includes('Stok fisik tidak mencukupi') || 
			    dbErr.message.includes('Pembayaran tidak mencukupi') ||
			    dbErr.message.includes('Produk tidak ditemukan') ||
			    dbErr.message.includes('Saldo poin member')) {
				throw error(400, dbErr.message);
			}
			throw error(500, `Gagal memproses transaksi ke database: ${dbErr.message}`);
		} finally {
			try { client.release(); } catch {}
		}
	}

	// ==========================================
	// JALUR 2: CIRCUIT-BREAKER IN-MEMORY ENGINE
	// Digunakan di Cloudflare Pages edge runtime (< 1ms)
	// ==========================================
	let calculatedSubtotal = 0;
	const preparedDetails: any[] = [];

	for (const item of data.items) {
		const unitInfo = getProductForCheckout(item.unit_id);

		// CRITICAL: Jika produk tidak ditemukan di memori, tolak transaksi
		// Jangan pernah menggunakan default stok 100 atau harga Rp 10.000
		if (!unitInfo && !isOfflineSync) {
			throw error(400, `Produk dengan kode "${item.unit_id}" tidak ditemukan di sistem. Silakan scan ulang atau hubungi admin inventori.`);
		}

		const qty = Number(item.qty);
		const conversionFactor = unitInfo?.conversion_factor || 1;
		const baseQty = Math.round(qty * conversionFactor);
		const currentStock = unitInfo?.stock ?? 0;
		const productName = unitInfo?.product_name || 'Produk';
		const unitName = unitInfo?.unit_name || 'Pcs';
		// Gunakan price_snapshot dari keranjang kasir (sudah divalidasi saat scan), baru fallback ke memori
		const pricePerUnit = Number(item.price_snapshot !== undefined ? item.price_snapshot : (unitInfo?.price || 0));
		const subtotal = Math.round(qty * pricePerUnit);

		if (!isOfflineSync && currentStock < baseQty) {
			throw error(400, `Stok fisik tidak mencukupi untuk "${productName}". Tersedia: ${currentStock} Pcs, Diminta: ${baseQty} Pcs. Harap kurangi quantity atau hubungi admin inventori.`);
		}

		calculatedSubtotal += subtotal;

		preparedDetails.push({
			detailId: crypto.randomUUID(),
			productId: unitInfo?.prod_id || item.unit_id,
			unitId: item.unit_id,
			productName,
			unitName,
			qty,
			conversionFactor,
			baseQty,
			pricePerUnit,
			baseHpp: unitInfo?.base_hpp || 0,
			subtotal,
			currentStock
		});
	}

	const calculatedFinalTotal = Math.max(0, calculatedSubtotal - Math.round(data.points_discount || 0));
	const totalPaid = Math.round(data.payments.reduce((sum, p) => sum + Number(p.amount), 0));

	if (!isOfflineSync && totalPaid < calculatedFinalTotal) {
		throw error(400, `Pembayaran tidak mencukupi. Tagihan Rp ${calculatedFinalTotal.toLocaleString('id-ID')}, bayar Rp ${totalPaid.toLocaleString('id-ID')}.`);
	}

	const actualFinalTotal = isOfflineSync ? totalPaid : calculatedFinalTotal;
	const pointsEarned = data.member_id ? Math.round(calculatePointsEarned(calculatedSubtotal)) : 0;

	// Potong stok in-memory & catat riwayat mutasi
	// Biarkan stok menjadi negatif jika ini adalah offline sync, agar sinkron dengan database PostgreSQL
	for (const detail of preparedDetails) {
		const newBalance = detail.currentStock - detail.baseQty;
		updateMemoryProductStock(detail.productId, newBalance);

		memoryStockMovements.unshift({
			id: `sm-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
			product_id: detail.productId,
			product_name: detail.productName,
			sku: (detail as any).sku || 'SKU',
			reference_type: 'SALE',
			qty_base_change: -detail.baseQty,
			balance_after: Math.max(0, newBalance),
			unit_cost_snapshot: detail.baseHpp || 0,
			notes: `Penjualan Kasir No: ${receiptNumber}`,
			created_at: new Date().toISOString()
		});
	}

	// Catat riwayat transaksi in-memory
	recordMemoryTransaction({
		id: transactionId,
		receipt_number: receiptNumber,
		idempotency_key: data.idempotency_key,
		subtotal_amount: calculatedSubtotal,
		discount_amount: Math.round(data.points_discount || 0),
		total_amount: actualFinalTotal,
		payment_method: data.payments[0]?.payment_method || 'CASH',
		points_earned: pointsEarned,
		created_at: new Date().toISOString(),
		status: 'COMPLETED',
		items: preparedDetails
	});

	// Broadcast realtime events
	try {
		broadcastRealtimeEvent({
			type: 'STOCK_CHANGED',
			data: {
				items: preparedDetails.map(d => ({
					productId: d.productId,
					qty: d.qty,
					baseQty: d.baseQty,
					newBalance: Math.max(0, d.currentStock - d.baseQty)
				})),
				timestamp: new Date().toISOString(),
				message: `Penjualan Kasir No: ${receiptNumber}`
			}
		});
	} catch {}

	try {
		broadcastRealtimeEvent({
			type: 'TRANSACTION_COMPLETED',
			data: {
				receiptNumber,
				totalAmount: actualFinalTotal,
				items: preparedDetails.map(d => ({
					productId: d.productId,
					productName: d.productName,
					qty: d.qty,
					baseQty: d.baseQty,
					newBalance: Math.max(0, d.currentStock - d.baseQty)
				})),
				timestamp: new Date().toISOString(),
				message: `Transaksi baru No: ${receiptNumber} sebesar Rp ${actualFinalTotal.toLocaleString('id-ID')}`
			}
		});
	} catch {}

	return json({
		status: 'success',
		message: 'Transaksi berhasil disimpan secara aman',
		transaction_id: transactionId,
		receipt_number: receiptNumber,
		points_earned: pointsEarned,
		total_amount: calculatedFinalTotal
	}, { status: 201 });
};
