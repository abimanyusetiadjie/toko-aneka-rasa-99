/**
 * Barcode Cluster Engine - Toko Aneka Rasa 99
 * Standar Klasterisasi 6 Digit Angka Ritel (KK-XXXX)
 * 
 * KK: 2 Digit Kategori
 * - 10: Kemplang Panggang
 * - 11: Kemplang Goreng
 * - 12: Kemplang Pasir
 * - 13: Kemplang Ring / Koin
 * - 20: Getas Bangka
 * - 30: Kerupuk Mentah
 * - 40: Bumbu & Oleh-Oleh
 * - 50: Kue Khas Bangka
 * - 60: Kopi Bangka
 * - 70: Cemilan / Snack
 * - 90: Non-Makanan
 * - 99: Umum / Lain-lain
 * 
 * XXXX: 4 Digit Nomor Unik Produk (0001 - 9999)
 */

export interface CategoryCluster {
	prefix: string;
	name: string;
}

export function getCategoryPrefix(
	categoryName: string = '',
	productName: string = '',
	sku: string = ''
): CategoryCluster {
	const cat = (categoryName || '').toUpperCase();
	const name = (productName || '').toUpperCase();
	const s = (sku || '').toUpperCase();

	// 1. Deteksi langsung dari nama kategori
	if (cat.includes('PANGGANG') || name.includes('PANGGANG') || s.includes('PNG')) return { prefix: '10', name: 'KEMPLANG PANGGANG' };
	if (cat.includes('GORENG') || name.includes('KEMPLANG GORENG')) return { prefix: '11', name: 'KEMPLANG GORENG' };
	if (cat.includes('PASIR') || name.includes('PASIR') || s.includes('PSR')) return { prefix: '12', name: 'KEMPLANG PASIR' };
	if (cat.includes('RING') || cat.includes('KOIN') || name.includes('KOIN') || name.includes('RING')) return { prefix: '13', name: 'KEMPLANG RING / KOIN' };
	if (cat.includes('GETAS') || name.includes('GETAS') || s.includes('GET')) return { prefix: '20', name: 'GETAS BANGKA' };
	if (cat.includes('MENTAH') || name.includes('MENTAH')) return { prefix: '30', name: 'KERUPUK MENTAH' };
	if (
		cat.includes('BUMBU') || cat.includes('OLEH-OLEH') ||
		name.includes('TERASI') || name.includes('RUSIP') || name.includes('KECAP') ||
		name.includes('ASAM') || name.includes('LEMPOK') || name.includes('CALO') ||
		name.includes('MADU') || s.includes('TER') || s.includes('KEC') || s.includes('ASA') || s.includes('MAD')
	) {
		return { prefix: '40', name: 'BUMBU & OLEH-OLEH BANGKA' };
	}
	if (
		cat.includes('KUE') || name.includes('KUE') || name.includes('RINTAK') ||
		name.includes('PIA') || name.includes('BONG LI') || s.includes('KUE')
	) {
		return { prefix: '50', name: 'KUE KHAS BANGKA' };
	}
	if (cat.includes('KOPI') || name.includes('KOPI') || s.includes('KOP')) return { prefix: '60', name: 'KOPI BANGKA' };
	if (
		cat.includes('CEMILAN') || cat.includes('SNACK') || name.includes('KACANG') ||
		name.includes('KERIPIK') || name.includes('KERUPUK') || name.includes('STIK') ||
		name.includes('PILUS') || name.includes('KRICU') || name.includes('KERICU') ||
		s.includes('KAC') || s.includes('KER') || s.includes('CEM')
	) {
		return { prefix: '70', name: 'CEMILAN' };
	}
	if (
		cat.includes('NON') || cat.includes('ALAT') || name.includes('PLASTIK') ||
		name.includes('KANTONG') || name.includes('KRESEK') || name.includes('DUS') || name.includes('SIKAT')
	) {
		return { prefix: '90', name: 'NON-MAKANAN' };
	}

	return { prefix: '99', name: 'UMUM' };
}

/**
 * Buat kode barcode 6-digit unik untuk satu produk
 */
export function build6DigitBarcode(
	categoryName: string = '',
	productName: string = '',
	sku: string = '',
	usedSet: Set<string>,
	categorySeqMap: Record<string, number>
): string {
	const { prefix } = getCategoryPrefix(categoryName, productName, sku);
	if (!categorySeqMap[prefix]) categorySeqMap[prefix] = 1;

	// Coba ambil angka dari SKU (contoh: SKU-KAC-830 -> 830) jika <= 9999
	const numMatch = (sku || '').match(/-(\d{1,4})$/);
	let assigned = '';

	if (numMatch) {
		const rawNum = parseInt(numMatch[1], 10);
		if (rawNum > 0 && rawNum <= 9999) {
			const candidate = prefix + String(rawNum).padStart(4, '0');
			if (!usedSet.has(candidate)) {
				assigned = candidate;
			}
		}
	}

	// Fallback urutan sekuensial jika bentrok atau tidak punya angka
	if (!assigned) {
		while (true) {
			const candidate = prefix + String(categorySeqMap[prefix]++).padStart(4, '0');
			if (!usedSet.has(candidate)) {
				assigned = candidate;
				break;
			}
		}
	}

	usedSet.add(assigned);
	return assigned;
}
