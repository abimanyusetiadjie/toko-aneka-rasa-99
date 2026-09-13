import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { phone, receiptData } = await request.json();

		if (!phone || !receiptData) {
			return json({ error: 'Phone number and receipt data are required' }, { status: 400 });
		}

		// Validasi nomor Indonesia (08x atau 628x)
		let targetPhone = phone.replace(/\D/g, '');
		if (targetPhone.startsWith('0')) {
			targetPhone = '62' + targetPhone.substring(1);
		}

		// Susun pesan WA (Format Teks yang Rapi)
		const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
		
		let itemsText = receiptData.items.map((i: any) => 
			`- ${i.name}\n  ${i.qty} x ${formatCurrency(i.price)} = ${formatCurrency(i.qty * i.price)}`
		).join('\n');

		const message = `*Tanda Terima Pembelian*\n🏪 TOKO ANEKA RASA 99\n📍 Poris Indah Blok B 11 No.1\nNomor Struk: ${receiptData.receiptNumber}\nTanggal: ${new Date().toLocaleString('id-ID')}\n\n*Rincian Pesanan:*\n${itemsText}\n\n========================\n*Subtotal:* ${formatCurrency(receiptData.subtotal)}\n*Diskon:* -${formatCurrency(receiptData.discount)}\n*TOTAL:* ${formatCurrency(receiptData.total)}\n========================\n\nTerima kasih telah berbelanja di Toko Aneka Rasa 99!\n*Pusat Kemplang, Getas & Oleh-Oleh Khas Bangka.*`;

		// Simulasi Pengiriman ke Fonnte jika Token belum diset
		// Di produksi, pasang FONNTE_TOKEN di .env
		const FONNTE_TOKEN = process.env.FONNTE_TOKEN || 'SIMULATION_MODE';

		if (FONNTE_TOKEN === 'SIMULATION_MODE') {
			console.log(`\n💬 [SIMULASI WA FONNTE] Mengirim struk ke ${targetPhone}:\n${message}\n`);
			
			// Simulasi delay jaringan API
			await new Promise((resolve) => setTimeout(resolve, 800));
			
			return json({ 
				success: true, 
				message: 'Struk berhasil dikirim (SIMULASI)', 
				target: targetPhone 
			});
		}

		// REAL PRODUCTION CALL TO FONNTE
		const formData = new URLSearchParams();
		formData.append('target', targetPhone);
		formData.append('message', message);

		const fonnteRes = await fetch('https://api.fonnte.com/send', {
			method: 'POST',
			headers: {
				'Authorization': FONNTE_TOKEN
			},
			body: formData
		});

		const result = await fonnteRes.json();
		
		if (result.status) {
			return json({ success: true, message: 'Struk berhasil dikirim ke WhatsApp' });
		} else {
			return json({ error: result.reason || 'Gagal mengirim pesan via Fonnte' }, { status: 400 });
		}

	} catch (err: any) {
		console.error('WhatsApp Receipt Error:', err.message);
		return json({ error: 'Terjadi kesalahan saat mengirim struk WhatsApp' }, { status: 500 });
	}
};
