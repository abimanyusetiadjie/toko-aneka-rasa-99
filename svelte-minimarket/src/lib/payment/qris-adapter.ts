import { env } from '$env/dynamic/private';

/**
 * QRIS Payment Gateway Interface & Dynamic Adapter
 * Mendukung integrasi resmi Midtrans Core API & Simulator Kasir
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
 * Midtrans QRIS Dynamic Core API Adapter (Production & Sandbox)
 */
export class MidtransQRISGateway implements PaymentGatewayAdapter {
	private serverKey: string;
	private isProduction: boolean;

	constructor(serverKey: string, isProduction: boolean = false) {
		this.serverKey = serverKey;
		this.isProduction = isProduction;
	}

	private get baseUrl(): string {
		return this.isProduction
			? 'https://api.midtrans.com/v2'
			: 'https://api.sandbox.midtrans.com/v2';
	}

	private get authHeader(): string {
		const encoded = Buffer.from(this.serverKey + ':').toString('base64');
		return `Basic ${encoded}`;
	}

	async generateQRIS(request: QRISRequest): Promise<QRISResponse> {
		const orderId = request.transactionId || `POS-${Date.now()}`;
		const grossAmount = Math.round(request.amount);

		const payload = {
			payment_type: 'qris',
			transaction_details: {
				order_id: orderId,
				gross_amount: grossAmount
			},
			qris: {
				acquirer: 'gopay'
			}
		};

		const response = await fetch(`${this.baseUrl}/charge`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': this.authHeader
			},
			body: JSON.stringify(payload)
		});

		const data = await response.json();

		if (!response.ok || (data.status_code !== '201' && data.status_code !== '200')) {
			throw new Error(data.status_message || 'Gagal membuat QRIS di Midtrans');
		}

		return {
			success: true,
			referenceId: data.order_id || orderId,
			qrString: data.qr_string || '',
			amount: grossAmount,
			expiresAt: data.expiry_time || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
			status: 'PENDING'
		};
	}

	async checkStatus(referenceId: string): Promise<'PENDING' | 'SETTLED' | 'EXPIRED'> {
		try {
			const response = await fetch(`${this.baseUrl}/${referenceId}/status`, {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Authorization': this.authHeader
				}
			});

			if (!response.ok) return 'PENDING';

			const data = await response.json();
			const txStatus = data.transaction_status;

			if (txStatus === 'settlement' || txStatus === 'capture') {
				return 'SETTLED';
			} else if (txStatus === 'pending') {
				return 'PENDING';
			} else {
				return 'EXPIRED';
			}
		} catch {
			return 'PENDING';
		}
	}
}

/**
 * Production-Ready Simulator Adapter (Bisa diswitch ke live Midtrans/Xendit)
 */
export class MockQRISGateway implements PaymentGatewayAdapter {
	private transactions = new Map<string, 'PENDING' | 'SETTLED' | 'EXPIRED'>();

	async generateQRIS(request: QRISRequest): Promise<QRISResponse> {
		const refId = `QRIS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
		
		// Generate REAL Dynamic QRIS using Toko Aneka Rasa 99 Static QR string
		const { generateDynamicQris, BASE_QRIS_STATIC } = await import('$lib/utils/qris');
		const qrString = generateDynamicQris(BASE_QRIS_STATIC, request.amount);

		this.transactions.set(refId, 'PENDING');

		return {
			success: true,
			referenceId: refId,
			qrString,
			amount: request.amount,
			expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
			status: 'PENDING'
		};
	}

	async checkStatus(referenceId: string): Promise<'PENDING' | 'SETTLED' | 'EXPIRED'> {
		return this.transactions.get(referenceId) || 'PENDING';
	}

	simulateCustomerPayment(referenceId: string) {
		this.transactions.set(referenceId, 'SETTLED');
	}
}

export const mockQrisGateway = new MockQRISGateway();

function getActiveAdapter(): PaymentGatewayAdapter {
	const serverKey = env.MIDTRANS_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY;
	const isProd = env.MIDTRANS_IS_PRODUCTION === 'true' || process.env.MIDTRANS_IS_PRODUCTION === 'true';

	if (serverKey && serverKey.trim().length > 0 && !serverKey.includes('sample')) {
		return new MidtransQRISGateway(serverKey.trim(), isProd);
	}
	return mockQrisGateway;
}

export const qrisGateway = {
	generateQRIS: (request: QRISRequest) => getActiveAdapter().generateQRIS(request),
	checkStatus: (referenceId: string) => getActiveAdapter().checkStatus(referenceId),
	simulateCustomerPayment: (referenceId: string) => mockQrisGateway.simulateCustomerPayment(referenceId)
};

