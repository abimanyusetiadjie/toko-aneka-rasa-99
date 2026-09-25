import { z } from 'zod';

export const PaymentMethodEnum = z.enum(['CASH', 'DEBIT', 'QRIS', 'POINT', 'TRANSFER']);

export const TransactionItemSchema = z.object({
	unit_id: z.string().min(1, 'Unit ID wajib diisi'),
	qty: z.number().int().min(1, 'Jumlah kuantiti minimal 1'),
	price_snapshot: z.number().optional() // Snapshot harga saat transaksi offline
});

export const TransactionPaymentSchema = z.object({
	payment_method: PaymentMethodEnum,
	amount: z.number().min(0, 'Nominal pembayaran tidak boleh negatif'),
	payment_reference: z.string().optional().nullable(),
	change_given: z.number().min(0).optional().default(0)
});

export const CreateTransactionSchema = z.object({
	idempotency_key: z.string().min(8, 'Idempotency key wajib disertakan untuk mencegah double-charge'),
	member_id: z.string().optional().nullable(),
	points_redeemed: z.number().int().min(0).optional().default(0),
	points_discount: z.number().min(0).optional().default(0),
	manual_discount: z.number().min(0).optional().default(0),
	total_amount: z.number().min(0, 'Total transaksi tidak boleh negatif'),
	items: z.array(TransactionItemSchema).min(1, 'Keranjang belanja tidak boleh kosong'),
	payments: z.array(TransactionPaymentSchema).min(1, 'Minimal satu metode pembayaran harus dipilih'),
	is_offline_sync: z.boolean().optional().default(false),
	client_timestamp: z.string().optional()
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
