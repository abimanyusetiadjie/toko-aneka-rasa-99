import re

with open('src/lib/server/seeds/tokoanekarasa99.ts', 'r', encoding='utf-8') as f:
    text = f.read()

prod_start = text.find('export const PRODUCTS: SeedProduct[] = [')
unit_start = text.find('export const PRODUCT_UNITS: SeedProductUnit[] = [')

prod_text = text[prod_start:unit_start]
unit_text = text[unit_start:]

prod_barcodes = re.findall(r'"barcode":\s*"([^"]+)"', prod_text)
unit_barcodes = re.findall(r'"barcode":\s*"([^"]+)"', unit_text)

print(f'Products count: {len(prod_barcodes)}')
print(f'Units count: {len(unit_barcodes)}')

non_6_prod = [b for b in prod_barcodes if not (len(b) == 6 and b.isdigit())]
non_6_unit = [b for b in unit_barcodes if not (len(b) == 6 and b.isdigit())]

print(f'Non-6-digit in PRODUCTS: {len(non_6_prod)} -> {non_6_prod}')
print(f'Non-6-digit in PRODUCT_UNITS: {len(non_6_unit)} -> {non_6_unit[:10]} (total: {len(non_6_unit)})')
