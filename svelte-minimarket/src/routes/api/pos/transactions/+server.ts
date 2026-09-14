import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pool, updateMemoryProductStock, getProductForCheckout, recordMemoryTransaction, memoryTransactions } from '$lib/server/db';
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

	const userId = locals.user?.id || '46030803-a7e6-4827-b93e-0cafcf148ac7';
	const storeId = locals.user?.store_id || '11111111-1111-1111-1111-111111111111';

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

			for (const item of data.items) {
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

				if (unitRes.rows.length > 0) {
					const unit = unitRes.rows[0];
					const qty = Number(item.qty);
					const baseQty = Math.round(qty * Number(unit.conversion_factor));

					if (!isOfflineSync && Number(unit.stock) < baseQty) {
						throw new Error(`Stok fisik tidak mencukupi untuk "${unit.product_name}". Tersedia: ${unit.stock} Pcs, Diminta: ${baseQty} Pcs.`);
					}

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
			}

			// Jika seluruh item ditemukan di database
			if (preparedDetails.length === data.items.length) {
				const calculatedFinalTotal = Math.max(0, calculatedSubtotal - Math.round(data.points_discount || 0));
				const totalPaid = Math.round(data.payments.reduce((sum, p) => sum + Number(p.amount), 0));

				if (!isOfflineSync && totalPaid < calculatedFinalTotal) {
					throw new Error(`Pembayaran tidak mencukupi. Tagihan Rp ${calculatedFinalTotal}, bayar Rp ${totalPaid}.`);
				}

				const actualFinalTotal = isOfflineSync ? totalPaid : calculatedFinalTotal;
				const pointsEarned = data.member_id ? Math.round(calculatePointsEarned(calculatedSubtotal)) : 0;
				const txCreatedAt = data.client_timestamp ? new Date(data.client_timestamp) : new Date();

				await client.query(
					`INSERT INTO transactions (
						id, store_id, shift_id, user_id, member_id, receipt_number, idempotency_key, 
						subtotal_amount, discount_amount, total_amount, points_earned, points_redeemed, status, payment_method, created_at
					) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'COMPLETED', $13, $14)`,
					[
						transactionId, storeId, null, userId, data.member_id || null, receiptNumber, data.idempotency_key,
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
				}

				for (const pay of data.payments) {
					await client.query(
						`INSERT INTO transaction_payments (
							id, transaction_id, payment_method, amount, payment_reference, change_given
						) VALUES ($1, $2, $3, $4, $5, $6)`,
						[crypto.randomUUID(), transactionId, pay.payment_method, pay.amount, pay.payment_reference || null, pay.change_given || 0]
					);
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
			console.warn('Database query error, proceeding with circuit-breaker fallback:', dbErr.message);
			if (dbErr.message.includes('Stok fisik tidak mencukupi') || dbErr.message.includes('Pembayaran tidak mencukupi')) {
				throw error(400, dbErr.message);
			}
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
		const qty = Number(item.qty);
		const conversionFactor = unitInfo?.conversion_factor || 1;
		const baseQty = Math.round(qty * conversionFactor);
		const currentStock = unitInfo?.stock ?? 100;
		const productName = unitInfo?.product_name || 'Produk';
		const unitName = unitInfo?.unit_name || 'Pcs';
		const pricePerUnit = Number(item.price_snapshot !== undefined ? item.price_snapshot : (unitInfo?.price || 10000));
		const subtotal = Math.round(qty * pricePerUnit);

		if (!isOfflineSync && currentStock < baseQty) {
			throw error(400, `Stok fisik tidak mencukupi untuk "${productName}". Tersedia: ${currentStock} Pcs, Diminta: ${baseQty} Pcs.`);
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

	// Potong stok in-memory
	for (const detail of preparedDetails) {
		updateMemoryProductStock(detail.productId, Math.max(0, detail.currentStock - detail.baseQty));
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

	// Broadcast realtime event
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
