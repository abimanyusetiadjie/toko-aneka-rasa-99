import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { broadcastRealtimeEvent } from '$lib/server/realtime-hub';
import crypto from 'crypto';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    console.log('🔔 [MIDTRANS WEBHOOK]:', body.order_id, body.transaction_status);

    const { order_id, status_code, gross_amount, signature_key, transaction_status } = body;

    if (!order_id) {
      return json({ message: 'Missing order_id' }, { status: 400 });
    }

    const serverKey = env.MIDTRANS_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY;
    if (serverKey && signature_key) {
      const expectedSignature = crypto
        .createHash('sha512')
        .update(order_id + status_code + gross_amount + serverKey)
        .digest('hex');

      if (signature_key !== expectedSignature) {
        console.warn('⚠️ [MIDTRANS WEBHOOK]: Signature mismatch!');
      }
    }

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      broadcastRealtimeEvent({
        type: 'TRANSACTION_COMPLETED',
        data: {
          receiptNumber: order_id,
          totalAmount: Number(gross_amount) || 0,
          paymentMethod: 'QRIS',
          timestamp: new Date().toISOString(),
          message: 'Pembayaran QRIS Berhasil: ' + order_id
        }
      });

      return json({ status: 'OK', message: 'Payment settlement recorded' });
    }

    return json({ status: 'OK', message: 'Notification received: ' + transaction_status });
  } catch (err: any) {
    console.error('❌ [MIDTRANS WEBHOOK ERROR]:', err.message);
    return json({ error: err.message }, { status: 500 });
  }
};