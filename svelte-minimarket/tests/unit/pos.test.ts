import { describe, it, expect } from 'vitest';
import { calculatePointsEarned, calculatePointDiscount } from '../../src/lib/services/points';
import { MockQRISGateway } from '../../src/lib/payment/qris-adapter';
import { CreateTransactionSchema } from '../../src/lib/schemas/transaction.schema';

describe('Unit Tests: POS Business Logic & Rules', () => {
	it('Member Point Accumulation: Rp 10.000 = 1 Poin', () => {
		expect(calculatePointsEarned(0)).toBe(0);
		expect(calculatePointsEarned(9999)).toBe(0);
		expect(calculatePointsEarned(10000)).toBe(1);
		expect(calculatePointsEarned(25000)).toBe(2);
		expect(calculatePointsEarned(105000)).toBe(10);
	});

	it('Member Point Redemption: 10 Poin = Rp 100 Diskon', () => {
		const result1 = calculatePointDiscount(10, 50000);
		expect(result1.discountAmount).toBe(100);
		expect(result1.pointsUsed).toBe(10);

		const result2 = calculatePointDiscount(150, 50000);
		expect(result2.discountAmount).toBe(1500); // 150 * 10
		expect(result2.pointsUsed).toBe(150);

		// Diskon tidak boleh melebihi total tagihan
		const capped = calculatePointDiscount(500, 2000);
		expect(capped.discountAmount).toBe(2000);
		expect(capped.pointsUsed).toBe(200);
	});

	it('Dynamic QRIS Gateway generates valid payload and settles correctly', async () => {
		const gateway = new MockQRISGateway();
		const qris = await gateway.generateQRIS({
			transactionId: 'TX-TEST-001',
			amount: 75000
		});

		expect(qris.success).toBe(true);
		expect(qris.amount).toBe(75000);
		expect(qris.qrString).toContain('000201010212');
		expect(qris.status).toBe('PENDING');

		// Simulasi pembeli bayar
		gateway.simulateCustomerPayment(qris.referenceId);
		const statusAfter = await gateway.checkStatus(qris.referenceId);
		expect(statusAfter).toBe('SETTLED');
	});

	it('Zod Validation: Validates Transaction Schema & Idempotency Key', () => {
		const validPayload = {
			idempotency_key: 'idemp-uuid-12345678',
			total_amount: 50000,
			items: [{ unit_id: 'unit-1', qty: 2 }],
			payments: [{ payment_method: 'CASH', amount: 50000 }]
		};

		const parseResult = CreateTransactionSchema.safeParse(validPayload);
		expect(parseResult.success).toBe(true);

		// Test invalid payload without idempotency key
		const invalidPayload = {
			total_amount: 50000,
			items: [{ unit_id: 'unit-1', qty: 2 }],
			payments: [{ payment_method: 'CASH', amount: 50000 }]
		};
		const invalidResult = CreateTransactionSchema.safeParse(invalidPayload);
		expect(invalidResult.success).toBe(false);
	});
});
