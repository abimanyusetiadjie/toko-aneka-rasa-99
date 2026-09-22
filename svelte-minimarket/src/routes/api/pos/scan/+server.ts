import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/server/db';
import type { Product, ProductUnit } from '$lib/types';

export const GET: RequestHandler = async ({ url, setHeaders }) => {
	setHeaders({
		'cache-control': 'no-cache, no-store, must-revalidate'
	});
	const barcode = url.searchParams.get('barcode')?.trim();

	if (!barcode) {
		throw error(400, 'Barcode wajib diisi');
	}

	// Smart Code Candidates: scanner bisa membaca "KAC830", "SKU-KAC-830", dsb.
	const upperBarcode = barcode.toUpperCase();
	const cleanAlphanumeric = upperBarcode.replace(/^SKU-?/i, '').replace(/[^A-Z0-9]/g, '');

	const candidates = Array.from(
		new Set([
			barcode,
			upperBarcode,
			cleanAlphanumeric,
			`SKU-${cleanAlphanumeric}`,
			`SKU-${barcode}`,
			`SKU-${upperBarcode}`
		])
	).filter(Boolean);

	// Jika format seperti 3 huruf + 3 angka (contoh KAC + 830), tambahkan SKU-KAC-830
	const matchSplit = cleanAlphanumeric.match(/^([A-Z]{2,4})(\d{2,5})$/);
	if (matchSplit) {
		candidates.push(`SKU-${matchSplit[1]}-${matchSplit[2]}`);
		candidates.push(`${matchSplit[1]}-${matchSplit[2]}`);
	}

	try {
		// 1. Cari unit berdasarkan barcode (exact, ILIKE, ANY candidates, atau normalized)
		let units = await query<ProductUnit>(
			`SELECT id, product_id, unit_name, conversion_factor, price, barcode 
			 FROM product_units 
			 WHERE barcode = ANY($1) 
			    OR barcode ILIKE ANY($1)
			    OR REPLACE(REPLACE(UPPER(barcode), 'SKU-', ''), '-', '') = $2
			 LIMIT 1`,
			[candidates, cleanAlphanumeric]
		);

		let productId = units[0]?.product_id;

		// 2. Fallback: Jika belum ada di product_units, cari di tabel products (barcode, SKU, atau ID)
		if (units.length === 0) {
			const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(barcode);
			let matched: any[] = [];
			if (isUuid) {
				matched = await query<any>(
					`SELECT id, sku, name, unit, price, cost_price, barcode 
					 FROM products 
					 WHERE id = $1 
					 LIMIT 1`,
					[barcode]
				);
			}

			if (matched.length === 0) {
				matched = await query<any>(
					`SELECT id, sku, name, unit, price, cost_price, barcode 
					 FROM products 
					 WHERE barcode = ANY($1) 
					    OR sku = ANY($1) 
					    OR barcode ILIKE ANY($1) 
					    OR sku ILIKE ANY($1)
					    OR REPLACE(REPLACE(UPPER(sku), 'SKU-', ''), '-', '') = $2
					    OR REPLACE(REPLACE(UPPER(barcode), 'SKU-', ''), '-', '') = $2
					 LIMIT 1`,
					[candidates, cleanAlphanumeric]
				);
			}

			if (matched.length > 0) {
				productId = matched[0].id;
				// Cari apakah ada unit apapun untuk produk ini
				units = await query<ProductUnit>(
					`SELECT id, product_id, unit_name, conversion_factor, price, barcode 
					 FROM product_units 
					 WHERE product_id = $1 
					 ORDER BY conversion_factor ASC 
					 LIMIT 1`,
					[productId]
				);

				// Jika di product_units belum ada, buat unit default
				if (units.length === 0) {
					units = [{
						id: `unit-${matched[0].id}`,
						product_id: matched[0].id,
						unit_name: matched[0].unit || 'Pcs',
						conversion_factor: 1,
						price: matched[0].price || 0,
						barcode: barcode
					}];
				}
			}
		}

		if (units.length === 0 || !productId) {
			throw error(404, `Produk dengan barcode "${barcode}" tidak ditemukan.`);
		}

		const scannedUnit = units[0];

		// 3. Cari data induk produk (hanya yang aktif)
		const products = await query<Product>(
			`SELECT p.id, p.sku, p.name, p.category_id, p.unit as base_unit, COALESCE(p.cost_price, 0) as base_hpp, p.stock, false as is_taxable, c.name as category_name
			 FROM products p
			 LEFT JOIN categories c ON p.category_id = c.id
			 WHERE p.id = $1 AND (p.is_active = true OR p.is_active IS NULL)
			 LIMIT 1`,
			[productId]
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
