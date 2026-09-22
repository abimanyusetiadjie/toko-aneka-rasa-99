import type { PageServerLoad, Actions } from './$types';
import { query } from '$lib/server/db';
import { getCategoryPrefix, build6DigitBarcode } from '$lib/server/barcode-cluster';

export const load: PageServerLoad = async () => {
	try {
		const rawProducts = await query<any>(`
			SELECT 
				p.id, p.sku, p.name, p.category_id, 
				COALESCE(p.unit, 'pcs') as base_unit, 
				COALESCE(pu.price, p.price, p.selling_price, 0) as price,
				COALESCE(pu.price, p.selling_price, p.price, 0) as selling_price, 
				p.stock,
				c.name as category_name,
				COALESCE(pu.barcode, p.barcode, p.sku) as barcode
			FROM products p
			LEFT JOIN categories c ON p.category_id = c.id
			LEFT JOIN product_units pu ON p.id = pu.product_id AND pu.conversion_factor = 1
			ORDER BY c.name ASC, p.name ASC
		`);

		const products = rawProducts || [];

		// Koreksi Spesifik Amplang -> CEMILAN (700314)
		const amplangProd = products.find((p: any) => 
			(p.name || '').toLowerCase().includes('amplang') || (p.sku || '').toUpperCase().includes('AMP')
		);
		if (amplangProd && (amplangProd.barcode === '200314' || amplangProd.barcode === 'SKU-AMP-314' || amplangProd.barcode !== '700314' || (amplangProd.category_name || '').toUpperCase() !== 'CEMILAN')) {
			amplangProd.barcode = '700314';
			amplangProd.category_id = '60c489bd-d317-4d28-8bad-f24e8e732fc2';
			amplangProd.category_name = 'CEMILAN';
			query(`UPDATE products SET category_id = '60c489bd-d317-4d28-8bad-f24e8e732fc2', barcode = '700314' WHERE id = $1`, [amplangProd.id]).catch(() => {});
			query(`UPDATE product_units SET barcode = '700314' WHERE product_id = $1 AND (conversion_factor = 1 OR conversion_factor IS NULL)`, [amplangProd.id]).catch(() => {});
		}

		// Konversi Otomatis / Self-Healing ke 6-Digit Klaster Bersih
		// Kumpulkan barcode 6-digit yang sudah valid
		const usedBarcodes = new Set<string>();
		const categorySeqMap: Record<string, number> = {};

		for (const prod of products) {
			const b = (prod.barcode || '').trim();
			if (/^\d{6}$/.test(b)) {
				usedBarcodes.add(b);
			}
		}

		// Konversi setiap produk yang belum memiliki barcode 6-digit (dengan await agar tersimpan permanen di DB)
		const unmigrated = products.filter(p => !/^\d{6}$/.test((p.barcode || '').trim()));
		if (unmigrated.length > 0) {
			for (const prod of unmigrated) {
				const newCode = build6DigitBarcode(
					prod.category_name,
					prod.name,
					prod.sku,
					usedBarcodes,
					categorySeqMap
				);
				prod.barcode = newCode;

				try {
					await query(`UPDATE products SET barcode = $1 WHERE id = $2`, [newCode, prod.id]);
					const unitCheck = await query<any>(`SELECT id FROM product_units WHERE product_id = $1`, [prod.id]);
					if (unitCheck && unitCheck.length > 0) {
						await query(
							`UPDATE product_units 
							 SET barcode = $1 
							 WHERE product_id = $2 AND (conversion_factor = 1 OR conversion_factor IS NULL)`, 
							[newCode, prod.id]
						);
					} else {
						await query(
							`INSERT INTO product_units (id, product_id, unit_name, conversion_factor, price, barcode)
							 VALUES ($1, $2, 'Pcs', 1, (SELECT COALESCE(price, 0) FROM products WHERE id = $2), $3)
							 ON CONFLICT (id) DO NOTHING`,
							[crypto.randomUUID(), prod.id, newCode]
						);
					}
				} catch (err) {
					console.error('[Barcode Auto-Healing Error]', prod.name, err);
				}
			}
		}

		return { 
			products,
			totalConverted: unmigrated.length
		};
	} catch (e: any) {
		return { products: [], totalConverted: 0, error: e.message };
	}
};

export const actions: Actions = {
	convertAll: async () => {
		try {
			const rawProducts = await query<any>(`
				SELECT 
					p.id, p.sku, p.name, p.category_id, 
					c.name as category_name,
					COALESCE(pu.barcode, p.barcode, p.sku) as barcode
				FROM products p
				LEFT JOIN categories c ON p.category_id = c.id
				LEFT JOIN product_units pu ON p.id = pu.product_id AND pu.conversion_factor = 1
				ORDER BY c.name ASC, p.name ASC
			`);

			const products = rawProducts || [];
			const usedBarcodes = new Set<string>();
			const categorySeqMap: Record<string, number> = {};

			// Pastikan Amplang selalu ke CEMILAN (700314)
			await query(`
				UPDATE products 
				SET category_id = '60c489bd-d317-4d28-8bad-f24e8e732fc2', barcode = '700314' 
				WHERE LOWER(name) LIKE '%amplang%' OR UPPER(sku) LIKE '%AMP%'
			`).catch(() => {});
			await query(`
				UPDATE product_units 
				SET barcode = '700314' 
				WHERE product_id IN (SELECT id FROM products WHERE LOWER(name) LIKE '%amplang%' OR UPPER(sku) LIKE '%AMP%')
				  AND (conversion_factor = 1 OR conversion_factor IS NULL)
			`).catch(() => {});

			// Kumpulkan yang sudah 6 digit
			for (const prod of products) {
				if ((prod.name || '').toLowerCase().includes('amplang') || (prod.sku || '').toUpperCase().includes('AMP')) {
					prod.barcode = '700314';
					prod.category_name = 'CEMILAN';
				}
				const b = (prod.barcode || '').trim();
				if (/^\d{6}$/.test(b)) {
					usedBarcodes.add(b);
				}
			}

			// Bersihkan barcode sementara agar tidak clash pada UNIQUE constraint
			await query(`UPDATE product_units SET barcode = CONCAT('TMP_', substring(id::text, 1, 8)) WHERE barcode IS NOT NULL AND barcode !~ '^[0-9]{6}$'`).catch(() => {});

			let count = 0;
			for (const prod of products) {
				let finalCode = (prod.barcode || '').trim();
				if (!/^\d{6}$/.test(finalCode)) {
					finalCode = build6DigitBarcode(
						prod.category_name,
						prod.name,
						prod.sku,
						usedBarcodes,
						categorySeqMap
					);
				}

				await query(`UPDATE products SET barcode = $1 WHERE id = $2`, [finalCode, prod.id]);
				
				const units = await query<any>(`SELECT id FROM product_units WHERE product_id = $1`, [prod.id]);
				if (units.length > 0) {
					await query(
						`UPDATE product_units 
						 SET barcode = $1 
						 WHERE product_id = $2 AND (conversion_factor = 1 OR conversion_factor IS NULL)`, 
						[finalCode, prod.id]
					);
				} else {
					await query(
						`INSERT INTO product_units (id, product_id, unit_name, conversion_factor, price, barcode)
						 VALUES ($1, $2, 'Pcs', 1, (SELECT COALESCE(price, 0) FROM products WHERE id = $2), $3)
						 ON CONFLICT (id) DO NOTHING`,
						[crypto.randomUUID(), prod.id, finalCode]
					);
				}
				count++;
			}

			return {
				success: true,
				message: `Sukses! Seluruh ${count} produk di inventori telah berhasil disinkronkan ke barcode 6-digit klaster bersih (KK-XXXX)!`
			};
		} catch (err: any) {
			return {
				success: false,
				message: 'Gagal mengonversi barcode: ' + err.message
			};
		}
	}
};
