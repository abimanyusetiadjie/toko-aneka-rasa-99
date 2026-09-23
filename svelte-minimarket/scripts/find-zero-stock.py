import json
import re

with open('src/lib/server/seeds/tokoanekarasa99.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's extract PRODUCTS array
start = text.find('export const PRODUCTS: SeedProduct[] = [')
end = text.find('export const PRODUCT_UNITS: SeedProductUnit[] = [')
sub = text[start + len('export const PRODUCTS: SeedProduct[] = '):end].strip()
if sub.endswith(';'):
    sub = sub[:-1]

products = json.loads(sub)
print('Total products:', len(products))

zero_stock = [p for p in products if p['stock'] == 0]
print(f'Total zero stock products: {len(zero_stock)}')
for p in zero_stock:
    print(f"  [{p['barcode']}] {p['name']} (sku: {p['sku']}) -> stock: {p['stock']}")

# Search for any product with '33' or 'Besar' in name
for p in products:
    if '33' in p['name'] or 'besar' in p['name'].lower():
        print(f"  FOUND: [{p['barcode']}] {p['name']} -> stock: {p['stock']}")
