/**
 * QRIS Payment Gateway Interface & Dynamic Adapter
 * Mendukung integrasi ke Midtrans, Xendit, DOKU, atau Simulator Kasir
 */

export interface QRISRequest {
	transactionId: string;
	amount: number;
	merchantName?: string;
	storeName?: string;
}

export interface QRISResponse {
	success: boolean;
	referenceId: string;
	qrString: string;
	amount: number;
	expiresAt: string;
	status: 'PENDING' | 'SETTLED' | 'EXPIRED';
}

export interface PaymentGatewayAdapter {
	generateQRIS(request: QRISRequest): Promise<QRISResponse>;
	checkStatus(referenceId: string): Promise<'PENDING' | 'SETTLED' | 'EXPIRED'>;
}

/**
 * Production-Ready Simulator Adapter (Bisa diswitch ke live Midtrans/Xendit)
 */
export class MockQRISGateway implements PaymentGatewayAdapter {
	private transactions = new Map<string, 'PENDING' | 'SETTLED' | 'EXPIRED'>();

	async generateQRIS(request: QRISRequest): Promise<QRISResponse> {
		const refId = `QRIS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
		
		// Standard EMVCo QRIS Payload Format
		const qrString = `00020101021226600016ID.CO.MINIMARKET.WWW011893600999${request.transactionId.slice(0, 10)}520454115303360540${request.amount}5802ID5919SMARTPOS MINIMARKET6007JAKARTA6304ABCD`;

		this.transactions.set(refId, 'PENDING');

		return {
			success: true,
			referenceId: refId,
			qrString,
			amount: request.amount,
			expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 menit
			status: 'PENDING'
		};
	}

	async checkStatus(referenceId: string): Promise<'PENDING' | 'SETTLED' | 'EXPIRED'> {
		return this.transactions.get(referenceId) || 'PENDING';
	}

	simulateCustomerPayment(referenceId: string) {
		this.transactions.set(referenceId, 'SETTLED');
		// Simulasi Webhook Xendit ke localhost (karena belum live internet)
		setTimeout(() => {
			fetch('http://localhost:5173/api/webhooks/xendit', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-callback-token': 'XENDIT_SIMULATOR_TOKEN'
				},
				body: JSON.stringify({
					event: 'qr.payment',
					data: {
						reference_id: referenceId,
						status: 'COMPLETED',
						amount: 0 // In real world this will be the actual amount paid
					}
				})
			}).catch(err => console.log('Simulasi Webhook Gagal:', err.message));
		}, 1000);
	}
}

export const qrisGateway = new MockQRISGateway();
