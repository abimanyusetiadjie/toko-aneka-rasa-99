import re

file_path = 'src/lib/server/shopee-service.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacement = r"""					stock_list: [
						{
							model_id: productRow.shopee_model_id ? Number(productRow.shopee_model_id) : 0,
							normal_stock: itm.newStock,
							seller_stock: [
								{
									stock: itm.newStock
								}
							]
						}
					]"""

content = re.sub(
    r"					stock_list: \[\s*\{\s*model_id: productRow\.shopee_model_id \? Number\(productRow\.shopee_model_id\) : 0,\s*normal_stock: itm\.newStock\s*\}\s*\]",
    replacement,
    content,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done fixing seller_stock in shopee-service.ts')
