import sys

filepath = 'svelte-minimarket/src/routes/+page.svelte'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find("<!-- ===== 3. NEW BENTO SHOWCASE")
end = content.find("<!-- ===== 4. KATALOG PRODUK DINAMIS")

if start != -1 and end != -1:
    content = content[:start] + content[end:]

# Replace the CTA in Hero
old_cta = """						<!-- Secondary 3 Lini Produk CTA -->
						<a
							href="#lini-produk"
							class="bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
						>
							<Package class="w-4 h-4 text-amber-600" />
							<span>Lihat 3 Lini Produk Utama</span>
						</a>"""

new_cta = """						<!-- Secondary CTA -->
						<a
							href="#katalog"
							class="bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
						>
							<Package class="w-4 h-4 text-amber-600" />
							<span>Lihat Katalog Lengkap</span>
						</a>"""

content = content.replace(old_cta, new_cta)

# Remove the broken footer links
content = content.replace('<li><a href="#lini-produk" class="hover:text-white transition">3 Lini Produk</a></li>\n', '')
content = content.replace('<li><a href="#cerita" class="hover:text-white transition">Cerita Toko</a></li>\n', '')


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Deleted bento successfully")
