import re
file_path = 'src/routes/admin/shopee/mapping/+page.svelte'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """	let isAutoMapping = $state(false);
	let isSubmitting = $state<string | null>(null);

	let mappedShopeeIds = $derived(data.localProducts.map(p => Number(p.shopee_item_id)).filter(id => id > 0));"""

content = re.sub(r'	let isAutoMapping = \$state\(false\);\s*let isSubmitting = \$state<string \| null>\(null\);', replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
