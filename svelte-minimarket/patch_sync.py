import re

file_path = 'src/routes/admin/shopee/mapping/+page.server.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add syncShopeeStock to the import
if 'syncShopeeStock' not in content:
    content = content.replace('callShopeeApi, getShopeeConnectionStatus', 'callShopeeApi, getShopeeConnectionStatus, syncShopeeStock')

replacement_mapProduct = r"""	mapProduct: async ({ request }) => {
		const data = await request.formData();
		const localId = String(data.get('local_id'));
		const shopeeItemId = data.get('shopee_item_id') ? Number(data.get('shopee_item_id')) : null;
		
		if (!localId) return { success: false, message: 'ID Lokal tidak valid' };

		try {
			await query(
				`UPDATE products SET shopee_item_id = $1, updated_at = NOW() WHERE id = $2`,
				[shopeeItemId, localId]
			);
			
			// Jika berhasil ditautkan ke Shopee (bukan dilepas tautannya), langsung tembak stok lokal ke Shopee!
			if (shopeeItemId) {
			    const prodRows = await query(`SELECT stock FROM products WHERE id = $1`, [localId]);
			    if (prodRows.length > 0) {
			        await syncShopeeStock([{ product_id: localId, newStock: Number(prodRows[0].stock) }]);
			    }
			}
			
			return { success: true, message: 'Tautan berhasil disimpan & stok disinkronkan ke Shopee!' };
		} catch (err: any) {
			return { success: false, message: 'Gagal menautkan produk: ' + err.message };
		}
	},"""

content = re.sub(
    r'	mapProduct: async \(\{ request \}\) => \{.*?(?=	autoMap: async)', 
    replacement_mapProduct + '\n', 
    content, 
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done updating mapProduct')
