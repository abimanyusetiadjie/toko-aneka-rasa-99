with open('src/routes/admin/inventory/+page.server.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

has_import = any('import { syncShopeeStock }' in line for line in lines)
if not has_import:
    lines.insert(2, "import { syncShopeeStock } from '$lib/server/shopee-service';\n")

with open('src/routes/admin/inventory/+page.server.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)
