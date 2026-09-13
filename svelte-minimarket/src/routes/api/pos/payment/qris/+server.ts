import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { qrisGateway } from '$lib/payment/qris-adapter';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => ({}));
	const { transaction_id, amount, action, reference_id } = body;

	if (action === 'simulate_payment') {
		if (!reference_id) throw error(400, 'Reference ID wajib diisi');
		qrisGateway.simulateCustomerPayment(reference_id);
		return json({
			success: true,
			status: 'SETTLED',
			message: 'Pembayaran QRIS berhasil disimulasikan!'
		});
	}

	if (!amount || amount <= 0) {
		throw error(400, 'Nominal QRIS tidak valid');
	}

	const txId = transaction_id || `temp-${Date.now()}`;
	const qrisRes = await qrisGateway.generateQRIS({
		transactionId: txId,
		amount: Number(amount)
	});

	return json(qrisRes);
};

export const GET: RequestHandler = async ({ url }) => {
	const refId = url.searchParams.get('reference_id');
	if (!refId) throw error(400, 'Reference ID wajib diisi');

	const status = await qrisGateway.checkStatus(refId);
	return json({ status });
};
