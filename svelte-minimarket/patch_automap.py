import re

with open('src/routes/admin/shopee/mapping/+page.server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old_automap = r'''			for \(let i = 0; i < allItemIds\.length; i \+= 50\) \{
				const batchIds = allItemIds\.slice\(i, i \+ 50\);
				const baseInfoRes = await callShopeeApi\('/api/v2/product/get_item_base_info', \{ item_id_list: batchIds\.join\(','\) \}, 'GET'\);
				if \(baseInfoRes && baseInfoRes\.item_list\) \{
					for \(const sp of baseInfoRes\.item_list\) \{
						if \(\!sp\.item_sku\) continue;
						const match = localProducts\.find\(\(lp\) => lp\.sku\.toLowerCase\(\) === sp\.item_sku\.toLowerCase\(\)\);
						if \(match\) \{
							await query\(`UPDATE products SET shopee_item_id = \$1 WHERE id = \$2`, \[sp\.item_id, match\.id\]\);
							stocksToSync\.push\(\{ product_id: match\.id, newStock: Number\(match\.stock\) \}\);
							mappedCount\+\+;
						\}
					\}
				\}
			\}'''

new_automap = '''			for (let i = 0; i < allItemIds.length; i += 50) {
				const batchIds = allItemIds.slice(i, i + 50);
				const baseInfoRes = await callShopeeApi('/api/v2/product/get_item_base_info', { item_id_list: batchIds.join(',') }, 'GET');
				if (baseInfoRes && baseInfoRes.item_list) {
					for (const sp of baseInfoRes.item_list) {
						// 1. Cek Model (Varian) terlebih dahulu
						if (sp.has_model && sp.model_list && sp.model_list.length > 0) {
							for (const mod of sp.model_list) {
								if (!mod.model_sku) continue;
								const match = localProducts.find((lp) => lp.sku.toLowerCase() === mod.model_sku.toLowerCase());
								if (match) {
									await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = $2, updated_at = NOW() WHERE id = $3`, [sp.item_id, mod.model_id, match.id]);
									stocksToSync.push({ product_id: match.id, newStock: Number(match.stock) });
									mappedCount++;
								}
							}
						}
						// 2. Jika tidak ada model, cek SKU induk
						else if (sp.item_sku) {
							const match = localProducts.find((lp) => lp.sku.toLowerCase() === sp.item_sku.toLowerCase());
							if (match) {
								await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [sp.item_id, match.id]);
								stocksToSync.push({ product_id: match.id, newStock: Number(match.stock) });
								mappedCount++;
							}
						}
					}
				}
			}'''

content = re.sub(old_automap, new_automap, content, flags=re.DOTALL)

with open('src/routes/admin/shopee/mapping/+page.server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('AutoMap patched')
