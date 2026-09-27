import re

file_path = 'src/routes/admin/shopee/mapping/+page.server.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacement_automap = """
			// Auto map based on exact SKU match
			const localProducts = await query(`SELECT id, sku FROM products WHERE shopee_item_id IS NULL AND sku IS NOT NULL AND sku != ''`);
			
			let allItemIds = [];
			let offset = 0;
			let hasNext = true;
			while (hasNext && offset < 1000) {
				const itemListRes = await callShopeeApi('/api/v2/product/get_item_list', { offset, page_size: 50, item_status: 'NORMAL' }, 'GET');
				if (itemListRes && itemListRes.item && itemListRes.item.length > 0) {
					allItemIds.push(...itemListRes.item.map((i: any) => i.item_id));
					offset += 50;
					if (!itemListRes.has_next_page) hasNext = false;
				} else {
					hasNext = false;
				}
			}

			let mappedCount = 0;
			for (let i = 0; i < allItemIds.length; i += 50) {
				const batchIds = allItemIds.slice(i, i + 50);
				const baseInfoRes = await callShopeeApi('/api/v2/product/get_item_base_info', { item_id_list: batchIds.join(',') }, 'GET');
				if (baseInfoRes && baseInfoRes.item_list) {
					for (const sp of baseInfoRes.item_list) {
						if (!sp.item_sku) continue;
						const match = localProducts.find((lp) => lp.sku.toLowerCase() === sp.item_sku.toLowerCase());
						if (match) {
							await query(`UPDATE products SET shopee_item_id = $1 WHERE id = $2`, [sp.item_id, match.id]);
							mappedCount++;
						}
					}
				}
			}
			return { success: true, message: `Berhasil auto-map ${mappedCount} produk berdasarkan SKU!` };
"""

content = re.sub(
    r"// Auto map based on exact SKU match.*?(?=return \{ success: true)", 
    replacement_automap, 
    content, 
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done updating automap')
