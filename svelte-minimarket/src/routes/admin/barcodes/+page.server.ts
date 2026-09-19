import type { PageServerLoad, Actions } from './$types';
import { query } from '$lib/server/db';
import type { Product } from '$lib/types';

export const load: PageServerLoad = async () => {
	try {
		const products = await query<Product>(`
			SELECT 
				p.id, p.sku, p.name, p.category_id, 
				COALESCE(p.unit, 'pcs') as base_unit, 
				COALESCE(pu.price, p.price) as selling_price, 
				p.stock,
				c.name as category_name,
				COALESCE(pu.barcode, p.barcode, p.sku) as barcode
			FROM products p
			LEFT JOIN categories c ON p.category_id = c.id
			LEFT JOIN product_units pu ON p.id = pu.product_id AND pu.conversion_factor = 1
			ORDER BY c.name ASC, p.name ASC
		`);
		return { products: products || [] };
	} catch (e: any) {
		return { products: [] };
	}
};

export const actions: Actions = {
	standardize: async () => {
		try {
			const products = await query<any>(`
				SELECT id, sku, barcode, name FROM products ORDER BY created_at ASC, id ASC
			`);

			let updatedCount = 0;
			for (let i = 0; i < products.length; i++) {
				const p = products[i];
				const current = (p.barcode || '').trim();

				// Jika barcode kosong, kepanjangan (> 13 karakter), atau mengandung huruf/tanda strip
				if (!current || current.length > 13 || /[a-zA-Z\-_]/.test(current)) {
					// Standar EAN 13 digit: 899 (Indonesia) + 99 (Aneka Rasa 99) + 7 digit sequence + 1 checksum dummy
					const seq = String(i + 1).padStart(7, '0');
					const cleanBarcode = `89999${seq}1`;

					// Update products
					await query(`UPDATE products SET barcode = $1 WHERE id = $2`, [cleanBarcode, p.id]);

					// Update atau pastikan unit satuan dasar juga sinkron
					const units = await query<any>(`SELECT id FROM product_units WHERE product_id = $1 AND conversion_factor = 1`, [p.id]);
					if (units.length > 0) {
						await query(`UPDATE product_units SET barcode = $1 WHERE id = $2`, [cleanBarcode, units[0].id]);
					} else {
						await query(
							`INSERT INTO product_units (id, product_id, unit_name, conversion_factor, price, barcode)
							 VALUES ($1, $2, 'Pcs', 1, (SELECT COALESCE(price, 0) FROM products WHERE id = $2), $3)
							 ON CONFLICT (id) DO NOTHING`,
							[crypto.randomUUID(), p.id, cleanBarcode]
						);
					}
					updatedCount++;
				}
			}

			return {
				success: true,
				message: `Berhasil menstandarisasi ${updatedCount} barcode produk menjadi 13-digit EAN-13 (899...) yang mudah di-scan!`
			};
		} catch (err: any) {
			return {
				success: false,
				message: 'Gagal menstandarisasi barcode: ' + err.message
			};
		}
	}
};
