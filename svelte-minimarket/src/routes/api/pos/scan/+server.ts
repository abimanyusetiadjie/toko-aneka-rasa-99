import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/server/db';
import type { Product, ProductUnit } from '$lib/types';

export const GET: RequestHandler = async ({ url }) => {
	const barcode = url.searchParams.get('barcode')?.trim();

	if (!barcode) {
		throw error(400, 'Barcode wajib diisi');
	}

	try {
		// 1. Cari unit berdasarkan barcode
		const units = await query<ProductUnit>(
			`SELECT id, product_id, unit_name, conversion_factor, price, barcode 
			 FROM product_units 
			 WHERE barcode = $1 
			 LIMIT 1`,
			[barcode]
		);

		if (units.length === 0) {
			throw error(404, `Produk dengan barcode "${barcode}" tidak ditemukan.`);
		}

		const scannedUnit = units[0];

		// 2. Cari data induk produk
		const products = await query<Product>(
			`SELECT p.id, p.sku, p.name, p.category_id, p.unit as base_unit, COALESCE(p.cost_price, 0) as base_hpp, p.stock, false as is_taxable, c.name as category_name
			 FROM products p
			 LEFT JOIN categories c ON p.category_id = c.id
			 WHERE p.id = $1 
			 LIMIT 1`,
			[scannedUnit.product_id]
		);

		if (products.length === 0) {
			throw error(404, 'Data produk induk tidak ditemukan atau rusak.');
		}

		const product = products[0];

		// 3. Ambil seluruh variasi satuan yang tersedia untuk produk ini
		const allUnits = await query<ProductUnit>(
			`SELECT id, product_id, unit_name, conversion_factor, price, barcode 
			 FROM product_units 
			 WHERE product_id = $1 
			 ORDER BY conversion_factor ASC`,
			[product.id]
		);

		return json({
			scanned_unit: scannedUnit,
			product,
			all_units: allUnits
		});
	} catch (err: any) {
		if (err.status) throw err;
		throw error(500, 'Gagal memproses pemindaian: ' + err.message);
	}
};
