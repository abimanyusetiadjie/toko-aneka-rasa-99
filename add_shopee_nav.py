import sys

filepath = 'svelte-minimarket/src/routes/+page.svelte'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = "<!-- WhatsApp Primary CTA with shimmer effect -->"

shopee_btn = """					<!-- Shopee Primary CTA -->
					<a
						href="https://shopee.co.id/tokoanekarasa99"
						target="_blank"
						rel="noopener noreferrer"
						class="hidden sm:inline-flex items-center gap-2 bg-[#EE4D2D] hover:bg-[#d73211] text-white px-4 lg:px-5 py-2.5 rounded-xl text-xs lg:text-sm font-extrabold shadow-md shadow-orange-600/25 hover:shadow-lg hover:shadow-orange-600/35 transition-all cursor-pointer active:scale-95"
					>
						<img src="/shopee-icon.png" class="w-5 h-5 object-contain rounded-sm" alt="Shopee" />
						<span>Toko Shopee</span>
					</a>

					"""

if target in content:
    content = content.replace(target, shopee_btn + target)
    print("Injected Shopee button into Navbar")
else:
    print("Could not find target")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
