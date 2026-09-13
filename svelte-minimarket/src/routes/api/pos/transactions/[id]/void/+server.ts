import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pool } from '$lib/server/db';
import crypto from 'crypto';

export const POST: RequestHandler = async ({ params, locals }) => {
	// 1. Verifikasi Akses: Hanya Manager / Owner yang boleh melakukan Void
	if (!locals.user || locals.user.role_id > 2) {
		throw error(403, 'Hanya Manager atau Owner yang dapat melakukan Void Transaksi');
	}

	const transactionId = params.id;
	const client = await pool.connect();

	try {
		await client.query('BEGIN');

		// 2. Kunci row transaksi
		const txRes = await client.query(
			`SELECT id, status, store_id, receipt_number, total_amount, member_id, points_earned, points_redeemed 
			 FROM transactions WHERE id = $1 FOR UPDATE`,
			[transactionId]
		);

		if (txRes.rows.length === 0) {
			throw new Error('Transaksi tidak ditemukan.');
		}

		const tx = txRes.rows[0];

		if (tx.status === 'VOID') {
			throw new Error('Transaksi ini sudah dibatalkan sebelumnya.');
		}

		// 3. Ambil detail produk untuk pengembalian stok
		const detailsRes = await client.query(
			`SELECT id, product_id, base_qty, cost_price_snapshot, unit_id
			 FROM transaction_details WHERE transaction_id = $1 FOR UPDATE`,
			[transactionId]
		);

		// 4. Proses pengembalian stok
		for (const detail of detailsRes.rows) {
			// Update stok
			await client.query(
				`UPDATE products SET stock = stock + $1, updated_at = NOW() WHERE id = $2`,
				[detail.base_qty, detail.product_id]
			);

			// Catat di ledger stock_movements
			await client.query(
				`INSERT INTO stock_movements (
					id, store_id, product_id, reference_type, reference_id, qty_base_change, balance_after, unit_cost_snapshot, created_by, notes
				) VALUES ($1, $2, $3, 'VOID', $4, $5, (SELECT stock FROM products WHERE id = $3), $6, $7, $8)`,
				[
					crypto.randomUUID(),
					tx.store_id,
					detail.product_id,
					transactionId,
					detail.base_qty, // Nilai positif karena stok kembali
					detail.cost_price_snapshot,
					locals.user.id,
					`VOID Transaksi: ${tx.receipt_number}`
				]
			);
		}

		// 5. Kembalikan Poin Member (Jika ada)
		if (tx.member_id) {
			// Jika transaksi asli memberikan poin, kurangi poin tersebut
			// Jika transaksi asli mereedem poin, kembalikan poin tersebut
			const netPointChangeToReverse = (tx.points_redeemed || 0) - (tx.points_earned || 0);
			const netTotalSpendToReverse = -Number(tx.total_amount);

			await client.query(
				`UPDATE members 
				 SET points_balance = GREATEST(0, points_balance + $1),
				     total_spend = GREATEST(0, total_spend + $2)
				 WHERE id = $3`,
				[netPointChangeToReverse, netTotalSpendToReverse, tx.member_id]
			);
		}

		// 6. Ubah status transaksi menjadi VOID
		await client.query(
			`UPDATE transactions SET status = 'VOID' WHERE id = $1`,
			[transactionId]
		);

		await client.query('COMMIT');

		return json({
			status: 'success',
			message: `Transaksi ${tx.receipt_number} berhasil di-VOID. Stok telah dikembalikan.`
		});
	} catch (err: any) {
		await client.query('ROLLBACK');
		throw error(500, err.message || 'Gagal melakukan Void Transaksi');
	} finally {
		client.release();
	}
};
