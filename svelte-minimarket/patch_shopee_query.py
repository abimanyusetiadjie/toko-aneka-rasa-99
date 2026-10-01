import re

with open('src/lib/server/shopee-service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CreateShopeeOrderInput interface
interface_pattern = r'''export interface CreateShopeeOrderInput \{
	order_sn\?: string;
	store_id\?: string;
	buyer_username: string;
	shipping_carrier\?: string;
	tracking_number\?: string;
	total_amount\?: number;
	items: \{
		product_id\?: string;
		sku\?: string;
		name: string;
		qty: number;
		price: number;
	\}\[\];
\}'''

new_interface = '''export interface CreateShopeeOrderInput {
	order_sn?: string;
	store_id?: string;
	buyer_username: string;
	shipping_carrier?: string;
	tracking_number?: string;
	total_amount?: number;
	items: {
		product_id?: string;
		sku?: string;
		name: string;
		qty: number;
		price: number;
		shopee_item_id?: number | string;
		shopee_model_id?: number | string;
	}[];
}'''
content = re.sub(interface_pattern, new_interface, content)

# 2. Update search query
search_pattern = r'''			// Cari produk di database berdasarkan SKU atau Nama.*?`%\$\{itm\.name\.slice\(0, 10\)\}%`\]\s*\);\s*\}'''

new_search = '''			let prodRes: any = { rows: [] };
			
			// PRIORITAS 1: Cari produk di database berdasarkan mapping Shopee Varian (Model ID)
			if (itm.shopee_model_id && Number(itm.shopee_model_id) > 0) {
				prodRes = await client.query(
					`SELECT id, sku, name, stock, base_hpp, price FROM products WHERE shopee_item_id = $1 AND shopee_model_id = $2 LIMIT 1 FOR UPDATE`,
					[String(itm.shopee_item_id), String(itm.shopee_model_id)]
				);
			}

			// PRIORITAS 2: Cari produk berdasarkan mapping Shopee Induk (jika tidak ketemu pakai model)
			if (prodRes.rows.length === 0 && itm.shopee_item_id) {
				prodRes = await client.query(
					`SELECT id, sku, name, stock, base_hpp, price FROM products WHERE shopee_item_id = $1 LIMIT 1 FOR UPDATE`,
					[String(itm.shopee_item_id)]
				);
			}

			// PRIORITAS 3: Cari produk berdasarkan SKU persis (jika mapping belum di-set)
			if (prodRes.rows.length === 0 && itm.sku) {
				prodRes = await client.query(
					`SELECT id, sku, name, stock, base_hpp, price FROM products WHERE sku = $1 LIMIT 1 FOR UPDATE`,
					[itm.sku]
				);
			}

			// PRIORITAS 4: Cari produk berdasarkan Nama persis
			if (prodRes.rows.length === 0 && itm.name) {
				prodRes = await client.query(
					`SELECT id, sku, name, stock, base_hpp, price FROM products WHERE name = $1 LIMIT 1 FOR UPDATE`,
					[itm.name]
				);
			}
			
			// PRIORITAS 5: Fallback pencarian fuzzy (ILIKE)
			if (prodRes.rows.length === 0 && itm.name) {
				prodRes = await client.query(
					`SELECT id, sku, name, stock, base_hpp, price FROM products WHERE name ILIKE $1 LIMIT 1 FOR UPDATE`,
					[`%${itm.name.slice(0, 10)}%`]
				);
			}'''

content = re.sub(search_pattern, new_search, content, flags=re.DOTALL)

with open('src/lib/server/shopee-service.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Patch applied successfully via regex')
