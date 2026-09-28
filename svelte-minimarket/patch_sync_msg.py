import re

file_path = 'src/routes/admin/shopee/mapping/+page.server.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacement = r"""			// Jika berhasil ditautkan ke Shopee (bukan dilepas tautannya), langsung tembak stok lokal ke Shopee!
			let syncMsg = '';
			if (shopeeItemId) {
			    const prodRows = await query(`SELECT stock, name FROM products WHERE id = $1`, [localId]);
			    if (prodRows.length > 0) {
			        const res = await syncShopeeStock([{ product_id: localId, newStock: Number(prodRows[0].stock) }]);
			        if (res.error_message) {
			            syncMsg = ' (Stok gagal dikirim ke Shopee: ' + res.error_message + ')';
			        } else {
			            syncMsg = ' & stok sinkron!';
			        }
			    }
			}
			
			return { success: true, message: 'Tautan disimpan' + syncMsg };"""

content = re.sub(
    r"			// Jika berhasil ditautkan ke Shopee.*?return \{ success: true, message: 'Tautan berhasil disimpan & stok disinkronkan ke Shopee!' \};",
    replacement,
    content,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done modifying mapProduct')
