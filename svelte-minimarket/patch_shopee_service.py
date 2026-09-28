import re

file_path = 'src/lib/server/shopee-service.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacement = r"""	let synced_count = 0;
	let error_message = '';

	for (const itm of items) {
		try {
			let productRow = null;
			if (itm.product_id) {
				const rows = await query(`SELECT shopee_item_id, shopee_model_id, name FROM products WHERE id = $1`, [itm.product_id]);
				productRow = rows[0];
			} else if (itm.sku) {
				const rows = await query(`SELECT shopee_item_id, shopee_model_id, name FROM products WHERE sku = $1`, [itm.sku]);
				productRow = rows[0];
			}

			if (productRow && productRow.shopee_item_id) {
				await callShopeeApi('/api/v2/product/update_stock', {
					item_id: Number(productRow.shopee_item_id),
					stock_list: [
						{
							model_id: productRow.shopee_model_id ? Number(productRow.shopee_model_id) : 0,
							normal_stock: itm.newStock
						}
					]
				}, 'POST');
				synced_count++;
			}
		} catch (err: any) {
			console.error(`[Shopee Sync Error] Gagal update stok untuk item:`, err.message);
			error_message = err.message;
		}
	}
	return { success: true, synced_count, error_message };"""

content = re.sub(
    r"	let synced_count = 0;\s*for \(const itm of items\) \{.*?	return \{ success: true, synced_count \};",
    replacement,
    content,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done modifying shopee-service.ts')
