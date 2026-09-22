import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_URL = process.env.DATABASE_URL || 'postgresql://minimarket:AnekaRasa99Secure*@localhost:5432/minimarket_db';

// Aturan Klaster Barcode 6 Digit Resmi (KK-XXXX)
function getCategoryPrefix(categoryName = '', productName = '', sku = '') {
	const cat = (categoryName || '').toUpperCase();
	const name = (productName || '').toUpperCase();
	const s = (sku || '').toUpperCase();

	if (cat.includes('PANGGANG') || name.includes('PANGGANG') || name.includes('OVEN') || s.includes('PNG')) return { prefix: '10', name: 'KEMPLANG PANGGANG' };
	if (cat.includes('PASIR') || name.includes('PASIR') || s.includes('PSR')) return { prefix: '12', name: 'KEMPLANG PASIR' };
	if (cat.includes('GORENG') || name.includes('KEMPLANG GORENG') || name.includes('GORENG')) return { prefix: '11', name: 'KEMPLANG GORENG' };
	if (cat.includes('RING') || cat.includes('KOIN') || name.includes('KOIN') || name.includes('RING')) return { prefix: '13', name: 'KEMPLANG RING / KOIN' };
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

function build6DigitBarcode(categoryName, productName, sku, usedSet, categorySeqMap) {
	const { prefix } = getCategoryPrefix(categoryName, productName, sku);
	if (!categorySeqMap[prefix]) categorySeqMap[prefix] = 1;

	// Coba ambil angka unik dari SKU (misal: SKU-AMP-314 -> 314 -> 700314)
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

	// Jika bentrok atau tidak ada angka, cari urutan sekuensial
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

async function main() {
	console.log('='.repeat(70));
	console.log('🚀 SINKRONISASI BARCODE 6-DIGIT KLASTER BERSIH TOKO ANEKA RASA 99');
	console.log('='.repeat(70));
	console.log(`🔌 Menghubungkan ke Database: ${DB_URL.replace(/:[^:@]+@/, ':****@')}`);

	const client = new Client({
		connectionString: DB_URL,
		ssl: DB_URL.includes('localhost') || DB_URL.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
	});

	try {
		await client.connect();
		console.log('✅ Berhasil terhubung ke PostgreSQL!');

		// 1. Ambil seluruh data produk dari tabel products & product_units
		const res = await client.query(`
			SELECT 
				p.id, p.sku, p.name, p.category_id, 
				c.name as category_name,
				p.barcode as prod_barcode,
				pu.id as unit_id,
				pu.barcode as unit_barcode
			FROM products p
			LEFT JOIN categories c ON p.category_id = c.id
			LEFT JOIN product_units pu ON p.id = pu.product_id AND pu.conversion_factor = 1
			ORDER BY c.name ASC, p.name ASC
		`);

		const products = res.rows;
		console.log(`\n📦 Total Produk Terdaftar di Database VPS: ${products.length} barang`);

		// 2. Kumpulkan semua barcode 6-digit yang sudah valid
		const usedSet = new Set();
		const categorySeqMap = {};

		for (const p of products) {
			const b = (p.unit_barcode || p.prod_barcode || '').trim();
			if (/^\d{6}$/.test(b)) {
				usedSet.add(b);
			}
		}

		console.log(`🔍 Ditemukan ${usedSet.size} produk yang sudah memiliki kode 6-digit valid.`);

		// 3. Konversi dan sinkronisasi seluruh produk yang belum 6-digit
		const updates = [];
		const sqlStatements = [];
		sqlStatements.push('-- MIGRASI SINKRONISASI BARCODE 6-DIGIT BERSIH (KK-XXXX)');
		sqlStatements.push('BEGIN;\n');
		sqlStatements.push(`-- Bersihkan nilai non-6-digit sementara agar tidak terjadi tabrakan UNIQUE constraint`);
		sqlStatements.push(`UPDATE product_units SET barcode = CONCAT('TMP_', substring(id::text, 1, 8)) WHERE barcode IS NOT NULL AND barcode !~ '^[0-9]{6}$';\n`);

		let convertedCount = 0;
		let alreadySyncedCount = 0;

		for (const p of products) {
			const currentCode = (p.unit_barcode || p.prod_barcode || '').trim();
			let finalCode = currentCode;

			if (/^\d{6}$/.test(currentCode)) {
				// Sudah 6-digit, pastikan kedua tabel sinkron memiliki kode yang sama
				alreadySyncedCount++;
			} else {
				// Belum 6-digit (misal: SKU-AMP-314, 89997757623, atau kosong)
				finalCode = build6DigitBarcode(p.category_name, p.name, p.sku, usedSet, categorySeqMap);
				convertedCount++;
			}

			updates.push({
				id: p.id,
				name: p.name,
				sku: p.sku,
				oldCode: currentCode || '(kosong)',
				newCode: finalCode,
				category: p.category_name || 'Umum',
				hasUnit: !!p.unit_id
			});

			sqlStatements.push(
				`-- ${p.name} (${p.sku}) [${p.category_name || 'Umum'}] : ${currentCode} -> ${finalCode}`
			);
			sqlStatements.push(`UPDATE products SET barcode = '${finalCode}' WHERE id = '${p.id}';`);
			if (p.unit_id) {
				sqlStatements.push(`UPDATE product_units SET barcode = '${finalCode}' WHERE id = '${p.unit_id}';`);
			} else {
				sqlStatements.push(
					`INSERT INTO product_units (id, product_id, unit_name, conversion_factor, price, barcode)
					 VALUES (gen_random_uuid(), '${p.id}', 'Pcs', 1, (SELECT COALESCE(price, 0) FROM products WHERE id = '${p.id}'), '${finalCode}')
					 ON CONFLICT (product_id, unit_name) DO UPDATE SET barcode = EXCLUDED.barcode;`
				);
			}
		}

		sqlStatements.push('\nCOMMIT;');

		// 4. Eksekusi transaksi di PostgreSQL
		console.log(`\n⏳ Mengeksekusi sinkronisasi transaksi database untuk ${updates.length} produk...`);
		await client.query('BEGIN');

		// Bersihkan nilai non-6-digit sementara agar tidak terjadi tabrakan UNIQUE constraint
		await client.query(`UPDATE product_units SET barcode = CONCAT('TMP_', substring(id::text, 1, 8)) WHERE barcode IS NOT NULL AND barcode !~ '^[0-9]{6}$'`);

		for (const u of updates) {
			await client.query(`UPDATE products SET barcode = $1 WHERE id = $2`, [u.newCode, u.id]);
			
			const unitCheck = await client.query(`SELECT id FROM product_units WHERE product_id = $1`, [u.id]);
			if (unitCheck.rows.length > 0) {
				await client.query(
					`UPDATE product_units 
					 SET barcode = $1 
					 WHERE product_id = $2 AND (conversion_factor = 1 OR conversion_factor IS NULL)`, 
					[u.newCode, u.id]
				);
			} else {
				await client.query(
					`INSERT INTO product_units (id, product_id, unit_name, conversion_factor, price, barcode)
					 VALUES (gen_random_uuid(), $1, 'Pcs', 1, (SELECT COALESCE(price, 0) FROM products WHERE id = $1), $2)
					 ON CONFLICT (id) DO NOTHING`,
					[u.id, u.newCode]
				);
			}
		}

		await client.query('COMMIT');
		console.log('✅ TRANSAKSI DATABASE BERHASIL DICOMMIT!');

		// Simpan file SQL cadangan
		const sqlPath = path.join(__dirname, 'sync_all_barcodes_269.sql');
		fs.writeFileSync(sqlPath, sqlStatements.join('\n'), 'utf8');
		console.log(`📁 File SQL cadangan disimpan ke: ${sqlPath}`);

		// 5. Tampilkan Rangkuman Hasil
		console.log('\n' + '='.repeat(70));
		console.log('📊 RANGKUMAN HASIL SINKRONISASI:');
		console.log('='.repeat(70));
		console.log(`- Total Produk Disinkronkan : ${products.length} barang`);
		console.log(`- Sudah 6-Digit (Dipertahankan): ${alreadySyncedCount} barang`);
		console.log(`- Berhasil Dikonversi Baru  : ${convertedCount} barang`);

		console.log('\nContoh Hasil Produk yang Dikonversi:');
		const sampleChanged = updates.filter(u => u.oldCode !== u.newCode).slice(0, 10);
		console.table(sampleChanged.map(s => ({
			'Nama Produk': s.name.length > 30 ? s.name.slice(0, 27) + '...' : s.name,
			'SKU': s.sku,
			'Barcode Lama': s.oldCode,
			'Barcode Baru (6-Digit)': s.newCode,
			'Kategori': s.category
		})));

		console.log('\n🎉 SINKRONISASI SELESAI 100%! Semua barcode kini seragam 6-digit bersih di:');
		console.log('  1. Master Inventori (/admin/inventory)');
		console.log('  2. Lembar Cetak Label (/admin/barcodes)');
		console.log('  3. POS Kasir & Pemindai Laser Zenpert 4T520 (/pos)\n');

	} catch (err) {
		await client.query('ROLLBACK').catch(() => {});
		console.error('\n❌ Terjadi kesalahan saat sinkronisasi:', err.message);
		process.exit(1);
	} finally {
		await client.end();
		console.log('🔒 Koneksi PostgreSQL ditutup.');
	}
}

main();
