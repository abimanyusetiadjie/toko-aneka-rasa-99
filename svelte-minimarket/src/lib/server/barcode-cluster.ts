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
	sku: string = '',
	categoryId: string = ''
): CategoryCluster {
	// 0. Deteksi langsung dari ID Kategori Resmi PostgreSQL (100% Deterministik)
	const CID_MAP: Record<string, CategoryCluster> = {
		'05fc957b-f0b1-4bb8-b101-a73ebaa1c1aa': { prefix: '10', name: 'KEMPLANG PANGGANG' },
		'e4d7a211-9491-49b9-8e47-2bf3e7b1a201': { prefix: '11', name: 'KEMPLANG GORENG' },
		'7a3cbb9c-080e-42fb-9bb7-f2b14f4e1f93': { prefix: '12', name: 'KEMPLANG PASIR' },
		'7774e144-8dae-4e31-8ae2-6e27a69bcba2': { prefix: '13', name: 'KEMPLANG RING / KOIN' },
		'0c78d523-1858-48a6-9671-c53a43e5b97e': { prefix: '20', name: 'GETAS BANGKA' },
		'a571ea00-b6f7-418b-ae10-8b093354cb43': { prefix: '30', name: 'KERUPUK MENTAH' },
		'1e74cb32-59e4-403b-97c6-01665230f5b7': { prefix: '40', name: 'BUMBU & OLEH-OLEH BANGKA' },
		'965f7c22-b529-43c3-ae62-c11dfd9a6566': { prefix: '50', name: 'KUE KHAS BANGKA' },
		'2c6e6e22-e421-4f93-8686-35ba0633b474': { prefix: '60', name: 'KOPI BANGKA' },
		'60c489bd-d317-4d28-8bad-f24e8e732fc2': { prefix: '70', name: 'CEMILAN' },
		'3448a39a-5f33-4f96-be6a-e64e52b22556': { prefix: '90', name: 'NON-MAKANAN' },
		'55555555-5555-5555-5555-555555555555': { prefix: '99', name: 'UMUM' }
	};

	const cat = (categoryName || '').toUpperCase();
	const name = (productName || '').toUpperCase();
	const s = (sku || '').toUpperCase();

	// Amplang adalah cemilan Bangka (bukan getas bulat), pastikan selalu masuk klaster CEMILAN (70)
	if (name.includes('AMPLANG') || s.includes('AMP')) {
		return { prefix: '70', name: 'CEMILAN' };
	}

	if (categoryId && CID_MAP[categoryId]) {
		return CID_MAP[categoryId];
	}

	// 1. Deteksi langsung dari nama kategori & produk
	if (
		cat.includes('PANGGANG') || name.includes('PANGGANG') || 
		name.includes('OVEN') || name.includes('OVN') || name.includes('BAKAR') || 
		name.includes('SARI LAUT') || name.includes('MM KOTAK') || name.includes('MM BULAT') || 
		name.includes('KEMPLANG MM') || s.includes('PNG')
	) {
		return { prefix: '10', name: 'KEMPLANG PANGGANG' };
	}
	if (cat.includes('PASIR') || name.includes('PASIR') || s.includes('PSR')) return { prefix: '12', name: 'KEMPLANG PASIR' };
	if (cat.includes('GORENG') || name.includes('KEMPLANG GORENG') || name.includes('GORENG')) return { prefix: '11', name: 'KEMPLANG GORENG' };
	if (cat.includes('RING') || cat.includes('KOIN') || name.includes('KOIN') || name.includes('RING')) return { prefix: '13', name: 'KEMPLANG RING / KOIN' };
	// Khusus Amplang: Amplang adalah cemilan (bukan getas bulat/panjang), pastikan selalu klaster 70
	if (name.includes('AMPLANG') || s.includes('AMP')) return { prefix: '70', name: 'CEMILAN' };

	if (cat.includes('GETAS') || name.includes('GETAS') || s.includes('GET')) return { prefix: '20', name: 'GETAS BANGKA' };
	if (cat.includes('MENTAH') || name.includes('MENTAH')) return { prefix: '30', name: 'KERUPUK MENTAH' };
	if (
		cat.includes('BUMBU') || cat.includes('OLEH-OLEH') ||
		name.includes('TERASI') || name.includes('RUSIP') || name.includes('KECAP') ||
		name.includes('ASAM') || name.includes('ASEM') || name.includes('LEMPOK') ||
		name.includes('CALO') || name.includes('KECALO') || name.includes('MADU') ||
		name.includes('GULA') || name.includes('KABUNG') || name.includes('LADA') || name.includes('SAHANG') ||
		s.includes('TER') || s.includes('KEC') || s.includes('ASA') || s.includes('MAD')
	) {
		return { prefix: '40', name: 'BUMBU & OLEH-OLEH BANGKA' };
	}
	if (
		cat.includes('KUE') || name.includes('KUE') || name.includes('RINTAK') ||
		name.includes('PIA') || name.includes('BONG LI') || name.includes('BANGKIT') ||
		s.includes('KUE')
	) {
		return { prefix: '50', name: 'KUE KHAS BANGKA' };
	}
	if (cat.includes('KOPI') || name.includes('KOPI') || s.includes('KOP')) return { prefix: '60', name: 'KOPI BANGKA' };
	if (
		cat.includes('NON') || cat.includes('ALAT') || cat.includes('PACKING') ||
		name.includes('BUBBLE') || name.includes('WRAP') || name.includes('PLASTIK') ||
		name.includes('KANTONG') || name.includes('KRESEK') || name.includes('DUS') ||
		name.includes('KARTON') || name.includes('SIKAT') || name.includes('LAKBAN') ||
		name.includes('SOLASI') || name.includes('TALI')
	) {
		return { prefix: '90', name: 'NON-MAKANAN' };
	}
	if (
		cat.includes('CEMILAN') || cat.includes('SNACK') || name.includes('AMPLANG') ||
		name.includes('KACANG') || name.includes('KERIPIK') || name.includes('KERUPUK') ||
		name.includes('STIK') || name.includes('STICK') || name.includes('PILUS') ||
		name.includes('KRICU') || name.includes('KERICU') || name.includes('EMPING') ||
		name.includes('INDOMIE') || name.includes('MIE') ||
		s.includes('AMP') || s.includes('KAC') || s.includes('KER') || s.includes('CEM')
	) {
		return { prefix: '70', name: 'CEMILAN' };
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
	categorySeqMap: Record<string, number>,
	categoryId: string = ''
): string {
	const { prefix } = getCategoryPrefix(categoryName, productName, sku, categoryId);
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
