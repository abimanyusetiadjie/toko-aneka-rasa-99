import re

with open('src/routes/admin/shopee/mapping/+page.server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the inside of autoMap with a smarter version that checks both SKU and NAME.
old_automap = r'''			for \(let i = 0; i < allItemIds\.length; i \+= 50\) \{
				const batchIds = allItemIds\.slice\(i, i \+ 50\);
				const baseInfoRes = await callShopeeApi\('/api/v2/product/get_item_base_info', \{ item_id_list: batchIds\.join\(','\) \}, 'GET'\);
				if \(baseInfoRes && baseInfoRes\.item_list\) \{
					for \(const sp of baseInfoRes\.item_list\) \{
						// 1. Cek Model \(Varian\) terlebih dahulu
						if \(sp\.has_model && sp\.model_list && sp\.model_list\.length > 0\) \{
							for \(const mod of sp\.model_list\) \{
								if \(\!mod\.model_sku\) continue;
								const match = localProducts\.find\(\(lp\) => lp\.sku\.toLowerCase\(\) === mod\.model_sku\.toLowerCase\(\)\);
								if \(match\) \{
									await query\(`UPDATE products SET shopee_item_id = \$1, shopee_model_id = \$2, updated_at = NOW\(\) WHERE id = \$3`, \[sp\.item_id, mod\.model_id, match\.id\]\);
									stocksToSync\.push\(\{ product_id: match\.id, newStock: Number\(match\.stock\) \}\);
									mappedCount\+\+;
								\}
							\}
						\}
						// 2. Jika tidak ada model, cek SKU induk
						else if \(sp\.item_sku\) \{
							const match = localProducts\.find\(\(lp\) => lp\.sku\.toLowerCase\(\) === sp\.item_sku\.toLowerCase\(\)\);
							if \(match\) \{
								await query\(`UPDATE products SET shopee_item_id = \$1, shopee_model_id = NULL, updated_at = NOW\(\) WHERE id = \$2`, \[sp\.item_id, match\.id\]\);
								stocksToSync\.push\(\{ product_id: match\.id, newStock: Number\(match\.stock\) \}\);
								mappedCount\+\+;
							\}
						\}
					\}
				\}
			\}'''


new_automap = '''			for (let i = 0; i < allItemIds.length; i += 50) {
				const batchIds = allItemIds.slice(i, i + 50);
				const baseInfoRes = await callShopeeApi('/api/v2/product/get_item_base_info', { item_id_list: batchIds.join(',') }, 'GET');
				if (baseInfoRes && baseInfoRes.item_list) {
					for (const sp of baseInfoRes.item_list) {
						// 1. Cek Model (Varian)
						if (sp.has_model && sp.model_list && sp.model_list.length > 0) {
							for (const mod of sp.model_list) {
								let match = null;
								
								// Cari by SKU Varian dulu
								if (mod.model_sku) {
									match = localProducts.find((lp) => lp.sku && lp.sku.toLowerCase() === mod.model_sku.toLowerCase());
								}
								
								// Jika tidak ketemu/tidak ada SKU, coba tebak dari Nama!
								if (!match) {
									const shopeeBaseName = sp.item_name.toLowerCase().trim();
									const shopeeVarName = mod.model_name.toLowerCase().trim();
									
									match = localProducts.find((lp) => {
										const ln = lp.name.toLowerCase().trim();
										return (
											ln === `${shopeeBaseName} - ${shopeeVarName}` ||
											ln === `${shopeeBaseName} ${shopeeVarName}` ||
											ln === shopeeVarName ||
											(ln.includes(shopeeBaseName) && ln.includes(shopeeVarName))
										);
									});
								}

								if (match) {
									await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = $2, updated_at = NOW() WHERE id = $3`, [sp.item_id, mod.model_id, match.id]);
									stocksToSync.push({ product_id: match.id, newStock: Number(match.stock) });
									mappedCount++;
									
									// Hapus dari list agar tidak map ganda
									localProducts = localProducts.filter(lp => lp.id !== match.id);
								}
							}
						}
						// 2. Jika tidak ada model (Barang Tunggal)
						else {
							let match = null;
							
							// Cari by SKU Induk
							if (sp.item_sku) {
								match = localProducts.find((lp) => lp.sku && lp.sku.toLowerCase() === sp.item_sku.toLowerCase());
							}
							
							// Jika tidak ketemu/tidak ada SKU, tebak by Nama!
							if (!match) {
								const shopeeBaseName = sp.item_name.toLowerCase().trim();
								match = localProducts.find((lp) => lp.name.toLowerCase().trim() === shopeeBaseName);
							}

							if (match) {
								await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = NULL, updated_at = NOW() WHERE id = $2`, [sp.item_id, match.id]);
								stocksToSync.push({ product_id: match.id, newStock: Number(match.stock) });
								mappedCount++;
								
								// Hapus dari list
								localProducts = localProducts.filter(lp => lp.id !== match.id);
							}
						}
					}
				}
			}'''

content = re.sub(old_automap, new_automap, content, flags=re.DOTALL)

with open('src/routes/admin/shopee/mapping/+page.server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('AutoMap patched with Fuzzy Name Matching')
