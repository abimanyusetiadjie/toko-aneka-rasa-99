import sys

filepath = 'svelte-minimarket/src/routes/+page.svelte'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find("<!-- ===== 3. KATEGORI PILIHAN (BENTO CARDS) ===== -->")
end = content.find("<!-- ===== 4. KATALOG PRODUK DINAMIS")

if start != -1 and end != -1:
    content = content[:start] + content[end:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Deleted bento")
