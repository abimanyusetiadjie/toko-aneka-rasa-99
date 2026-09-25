/**
 * Utility untuk memproses dan menghasilkan QRIS Dinamis
 */

/**
 * CRC16-CCITT (0x1021)
 */
function crc16(str: string): string {
	let crc = 0xffff;
	for (let i = 0; i < str.length; i++) {
		crc ^= str.charCodeAt(i) << 8;
		for (let j = 0; j < 8; j++) {
			if ((crc & 0x8000) > 0) {
				crc = (crc << 1) ^ 0x1021;
			} else {
				crc = crc << 1;
			}
		}
	}
	crc &= 0xffff;
	let hex = crc.toString(16).toUpperCase();
	while (hex.length < 4) hex = '0' + hex;
	return hex;
}

/**
 * Mengubah QRIS Statis menjadi Dinamis dengan Nominal tertentu
 * @param staticQris String raw QRIS Statis
 * @param amount Nominal transaksi
 */
export function generateDynamicQris(staticQris: string, amount: number): string {
	if (!staticQris || amount <= 0) return staticQris;

	// 1. Ubah Point of Initiation Method dari Static (11) ke Dynamic (12)
	let dynamicQris = staticQris.replace('010211', '010212');

	// 2. Buat string Tag 54 (Transaction Amount)
	const amountStr = amount.toString();
	const amountLen = amountStr.length.toString().padStart(2, '0');
	const tag54 = `54${amountLen}${amountStr}`;

	// 3. Sisipkan Tag 54 sebelum Tag 58 (Country Code) jika ada, 
	// atau sebelum Tag 59 (Merchant Name), atau sekadar sebelum 6304
	// Biasanya Tag 5802ID ada.
	if (dynamicQris.includes('5802ID')) {
		dynamicQris = dynamicQris.replace('5802ID', `${tag54}5802ID`);
	} else if (dynamicQris.includes('6304')) {
		dynamicQris = dynamicQris.replace('6304', `${tag54}6304`);
	}

	// 4. Hitung ulang CRC
	// Buang 4 digit CRC lama di akhir string
	const qrisWithoutCrc = dynamicQris.slice(0, -4);
	const newCrc = crc16(qrisWithoutCrc);

	return qrisWithoutCrc + newCrc;
}

export const BASE_QRIS_STATIC = '00020101021126610016ID.CO.SHOPEE.WWW01189360091800237667680208237667680303UMI51440014ID.CO.QRIS.WWW0215ID10266021548520303UMI5204581253033605802ID5918Toko Aneka Rasa 996009TANGERANG61051514862070703A0163048EDD';
