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

		// Konversi setiap produk yang belum memiliki barcode 6-digit
		let convertedAny = false;
		for (const prod of products) {
			const b = (prod.barcode || '').trim();
			if (!/^\d{6}$/.test(b)) {
				const newCode = build6DigitBarcode(
					prod.category_name,
					prod.name,
					prod.sku,
					usedBarcodes,
					categorySeqMap
				);
				prod.barcode = newCode;
				convertedAny = true;

				// Simpan langsung ke database VPS
				query(`UPDATE products SET barcode = $1 WHERE id = $2`, [newCode, prod.id]).catch(() => {});
				query(`UPDATE product_units SET barcode = $1 WHERE product_id = $2`, [newCode, prod.id]).catch(() => {});
			}
		}

		return { 
			products,
			totalConverted: convertedAny ? products.length : 0
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

			let count = 0;
			for (const prod of products) {
				const newCode = build6DigitBarcode(
					prod.category_name,
					prod.name,
					prod.sku,
					usedBarcodes,
					categorySeqMap
				);

				await query(`UPDATE products SET barcode = $1 WHERE id = $2`, [newCode, prod.id]);
				
				const units = await query<any>(`SELECT id FROM product_units WHERE product_id = $1`, [prod.id]);
				if (units.length > 0) {
					await query(`UPDATE product_units SET barcode = $1 WHERE product_id = $2`, [newCode, prod.id]);
				} else {
					await query(
						`INSERT INTO product_units (id, product_id, unit_name, conversion_factor, price, barcode)
						 VALUES ($1, $2, 'Pcs', 1, (SELECT COALESCE(price, 0) FROM products WHERE id = $2), $3)
						 ON CONFLICT (id) DO NOTHING`,
						[crypto.randomUUID(), prod.id, newCode]
					);
				}
				count++;
			}

			return {
				success: true,
				message: `Sukses! Seluruh ${count} produk di inventori telah berhasil dikonversi ke barcode 6-digit klaster bersih (KK-XXXX)!`
			};
		} catch (err: any) {
			return {
				success: false,
				message: 'Gagal mengonversi barcode: ' + err.message
			};
		}
	}
};
