import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	// Xendit Webhook Listener
	// Dokumentasi asli: https://developers.xendit.co/api-reference/#webhooks
	
	try {
		const token = request.headers.get('x-callback-token');
		// Di production, cek token ini dengan XENDIT_WEBHOOK_TOKEN di .env
		if (!token) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		
		console.log('🔔 [WEBHOOK XENDIT] Menerima Notifikasi Pembayaran:', body.event);

		if (body.event === 'qr.payment' && body.data.status === 'COMPLETED') {
			const refId = body.data.reference_id;
			console.log(`✅ [WEBHOOK XENDIT] Pembayaran Sukses untuk REF: ${refId}`);
			
			// Di produksi: UPDATE transactions SET status = 'PAID' WHERE id = refId
			// Karena Svelte POS mem-poll status lewat qris-adapter,
			// Kita cukup membalas 200 OK agar Xendit tahu webhook diterima
		}

		return json({ message: 'Webhook received successfully' });
	} catch (e: any) {
		console.error('❌ [WEBHOOK ERROR]', e.message);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
};
