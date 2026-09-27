import sys

filepath = 'svelte-minimarket/src/routes/+page.svelte'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_menu = """				<div class="pt-2 flex flex-col gap-2">
					<a
						href="https://wa.me/{WA_PHONE}?text={encodeURIComponent('Halo Toko Aneka Rasa 99, saya ingin memesan:')}"
						target="_blank"
						rel="noopener noreferrer"
						class="w-full bg-[#25D366] text-white text-center py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow"
					>
						<span>Chat WhatsApp Sekarang</span>
					</a>
				</div>"""

new_menu = """				<div class="pt-2 flex flex-col gap-2">
					<a
						href="https://shopee.co.id/tokoanekarasa99"
						target="_blank"
						rel="noopener noreferrer"
						class="w-full bg-[#EE4D2D] text-white text-center py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow"
					>
						<img src="/shopee-icon.png" class="w-4 h-4 object-contain rounded-sm" alt="Shopee" />
						<span>Buka Toko Shopee</span>
					</a>
					<a
						href="https://wa.me/{WA_PHONE}?text={encodeURIComponent('Halo Toko Aneka Rasa 99, saya ingin memesan:')}"
						target="_blank"
						rel="noopener noreferrer"
						class="w-full bg-[#25D366] text-white text-center py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow"
					>
						<span>Chat WhatsApp Sekarang</span>
					</a>
				</div>"""

if old_menu in content:
    content = content.replace(old_menu, new_menu)
else:
    print("Old menu not found!")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Mobile Menu")
