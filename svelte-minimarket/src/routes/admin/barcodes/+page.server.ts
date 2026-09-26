import type { PageServerLoad, Actions } from './$types';
import { query } from '$lib/server/db';
import { getCategoryPrefix, build6DigitBarcode } from '$lib/server/barcode-cluster';

export const load: PageServerLoad = async () => {
	try {
		const rawProducts = await query<any>(`
			SELECT 
				p.id, p.sku, p.name, p.category_id, 
				COALESCE(p.unit, 'pcs') as base_unit, 
				COALESCE(pu.price, p.price, 0) as price,
				COALESCE(pu.price, p.price, 0) as selling_price, 
				p.stock,
				c.name as category_name,
				COALESCE(p.barcode, pu.barcode, p.sku) as barcode
			FROM products p
			LEFT JOIN categories c ON p.category_id = c.id
			LEFT JOIN LATERAL (
				SELECT barcode, price
				FROM product_units
				WHERE product_id = p.id AND (conversion_factor = 1 OR conversion_factor IS NULL)
				ORDER BY CASE WHEN barcode ~ '^[0-9]{6}$' THEN 1 ELSE 2 END, created_at DESC
				LIMIT 1
			) pu ON true
			WHERE (p.is_active = true OR p.is_active IS NULL)
			ORDER BY c.name ASC, p.name ASC
		`);

		const products = rawProducts || [];

		return { 
			products,
			totalConverted: 0
		};
	} catch (e: any) {
		console.error('[Error loading barcodes]', e);
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
					COALESCE(p.barcode, pu.barcode, p.sku) as barcode
				FROM products p
				LEFT JOIN categories c ON p.category_id = c.id
				LEFT JOIN LATERAL (
					SELECT barcode
					FROM product_units
					WHERE product_id = p.id AND (conversion_factor = 1 OR conversion_factor IS NULL)
					ORDER BY CASE WHEN barcode ~ '^[0-9]{6}$' THEN 1 ELSE 2 END, created_at DESC
					LIMIT 1
				) pu ON true
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
