import re

with open('src/routes/admin/shopee/mapping/+page.server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old_action = r'''	mapProduct: async \(\{ request \}\) => \{
		const data = await request\.formData\(\);
		const localId = String\(data\.get\('local_id'\)\);
		const shopeeItemId = data\.get\('shopee_item_id'\) \? Number\(data\.get\('shopee_item_id'\)\) : null;
		
		if \(\!localId\) return \{ success: false, message: 'ID Lokal tidak valid' \};

		try \{
			await query\(
				`UPDATE products SET shopee_item_id = \$1, updated_at = NOW\(\) WHERE id = \$2`,
				\[shopeeItemId, localId\]
			\);'''

new_action = '''	mapProduct: async ({ request }) => {
		const data = await request.formData();
		const localId = String(data.get('local_id'));
		const mappingVal = data.get('shopee_mapping') ? String(data.get('shopee_mapping')) : '';
		
		let shopeeItemId = null;
		let shopeeModelId = null;
		
		if (mappingVal && mappingVal.includes('|')) {
			const parts = mappingVal.split('|');
			shopeeItemId = Number(parts[0]);
			shopeeModelId = Number(parts[1]);
		}
		
		if (!localId) return { success: false, message: 'ID Lokal tidak valid' };

		try {
			await query(
				`UPDATE products SET shopee_item_id = $1, shopee_model_id = $2, updated_at = NOW() WHERE id = $3`,
				[shopeeItemId, shopeeModelId, localId]
			);'''

content = re.sub(old_action, new_action, content, flags=re.DOTALL)

with open('src/routes/admin/shopee/mapping/+page.server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Server patched')
