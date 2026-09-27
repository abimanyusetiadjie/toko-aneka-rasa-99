import re

# File 1: Admin Dashboard Print Format Address Fix
file1_path = 'src/routes/admin/dashboard/+page.svelte'
with open(file1_path, 'r', encoding='utf-8') as f:
    content1 = f.read()

# Fix HTML Header
content1 = content1.replace('TOKO ANEKA RASA 99 PANGKALPINANG', 'Toko Aneka Rasa 99')
content1 = content1.replace('Pusat Oleh-Oleh Khas Bangka & Minimarket Modern', 'Agen Kerupuk Mentah & Pusat Oleh-Oleh Khas Bangka')
content1 = content1.replace('Jl. Jend. Sudirman No. 99, Pangkalpinang, Bangka Belitung | Telp: (0717) 432199', 'Perumahan Poris Indah Blok B 11 No. 1, Kota Tangerang | Telp: 0813-8710-9586')
content1 = content1.replace("Pangkalpinang, ${new Date()", "Kota Tangerang, ${new Date()")

# Fix HTML View Modal
content1 = content1.replace('TOKO ANEKA RASA 99', 'Toko Aneka Rasa 99')
content1 = content1.replace('Jl. Jend. Sudirman No. 99, Pangkalpinang, Bangka Belitung &bull; Telp: (0717) 432199 / 0812-3456-7890', 'Perumahan Poris Indah Blok B 11 No. 1, Kota Tangerang &bull; Telp: 0813-8710-9586')
content1 = content1.replace('Jl. Jend. Sudirman No. 99, Pangkalpinang, Bangka Belitung   Telp: (0717) 432199 / 0812-3456-7890', 'Perumahan Poris Indah Blok B 11 No. 1, Kota Tangerang &bull; Telp: 0813-8710-9586')
content1 = content1.replace("Pangkalpinang, {new Date()", "Kota Tangerang, {new Date()")


with open(file1_path, 'w', encoding='utf-8') as f:
    f.write(content1)

# File 2: Shopee Mapping Dropdown Widen
file2_path = 'src/routes/admin/shopee/mapping/+page.svelte'
with open(file2_path, 'r', encoding='utf-8') as f:
    content2 = f.read()

# Change string substring from 30 to 90
content2 = content2.replace('{sp.item_name.substring(0, 30)}{sp.item_name.length > 30 ? \'...\' : \'\'}', '{sp.item_name.substring(0, 90)}{sp.item_name.length > 90 ? \'...\' : \'\'}')
# Widen the select input
content2 = content2.replace('min-w-[250px]', 'w-full min-w-[350px] max-w-xl')

with open(file2_path, 'w', encoding='utf-8') as f:
    f.write(content2)

print('Both files patched successfully!')
