import sys

filepath = 'svelte-minimarket/src/routes/+page.svelte'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# The user wants the wide banner section to also have bg-[#FCFAF6] instead of bg-slate-950
# so it matches the footer background, or maybe just remove the bg-slate-950 from the section
# and wrap both in a parent or just change the section.
content = content.replace('<section class="w-full bg-slate-950">', '<section class="w-full bg-[#FCFAF6] pt-10">')

old_footer = """	<!-- ===== 11. FOOTER ===== -->
	<footer class="bg-slate-950 text-slate-400 pt-12 pb-16">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
				<!-- Brand Col -->
				<div class="md:col-span-2 space-y-4">
					<div class="flex items-center gap-3">
						<img src="/logo.png" alt="Toko Aneka Rasa 99" class="w-11 h-11 rounded-full object-cover border border-slate-700" />
						<div>
							<p class="text-white font-black text-base">Toko Aneka Rasa 99 Poris</p>
							<p class="text-xs text-red-400 font-bold">Pusat Makanan Khas Bangka & Agen Kerupuk Mentah</p>
						</div>
					</div>
					<p class="text-xs text-slate-400 leading-relaxed max-w-md">
						Pusat Kemplang Panggang Arang MM, Getas Super Tenggiri Obor, Terasi Toboali, Kopi Cap 1, Grosir Kerupuk Mentah, dan Aneka Kue Tradisional Bangka. Melayani eceran dan pesanan partai besar ke seluruh Indonesia.
					</p>
					<div class="flex items-center gap-3 pt-1">
						<a
							href="https://wa.me/{WA_PHONE}"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-[#20ba5a] transition"
						>
							<MessageCircle class="w-3.5 h-3.5" /> Chat WhatsApp
						</a>
						<a
							href="https://shopee.co.id/tokoanekarasa99"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1.5 bg-[#EE4D2D] text-white text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-[#d73211] transition"
						>
							<ShoppingBag class="w-3.5 h-3.5" /> Toko Shopee
						</a>
					</div>
				</div>

				<!-- Nav Links -->
				<div class="space-y-3">
					<p class="text-white font-extrabold text-sm uppercase tracking-wider">Navigasi</p>
					<ul class="space-y-2 text-xs">
						<li><a href="#hero" class="hover:text-white transition">Beranda</a></li>
												<li><a href="#katalog" class="hover:text-white transition">Katalog Lengkap</a></li>
												<li><a href="#testimoni" class="hover:text-white transition">Testimoni</a></li>
						<li><a href="#kontak" class="hover:text-white transition">Lokasi & Kontak</a></li>
					</ul>
				</div>

				<!-- Store Info -->
				<div class="space-y-3">
					<p class="text-white font-extrabold text-sm uppercase tracking-wider">Alamat & Jam Buka</p>
					<div class="space-y-2.5 text-xs">
						<p class="leading-relaxed flex items-start gap-2">
							<MapPin class="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
							<span>{STORE_ADDRESS}</span>
						</p>
						<p class="flex items-center gap-2">
							<Clock class="w-4 h-4 text-amber-500 shrink-0" />
							<span>{STORE_HOURS}</span>
						</p>
						<p class="flex items-center gap-2">
							<Phone class="w-4 h-4 text-emerald-500 shrink-0" />
							<span>+62 813-8710-9586</span>
						</p>
					</div>
				</div>
			</div>

			<!-- Bottom Bar -->
			<div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
				<p>© {new Date().getFullYear()} Toko Aneka Rasa 99. Seluruh Hak Cipta Dilindungi.</p>
				<div class="flex items-center gap-4">
					<a href="/login" class="hover:text-slate-300 flex items-center gap-1 transition">
						<User class="w-3.5 h-3.5" /> Login Portal Kasir & Owner
					</a>
				</div>
			</div>
		</div>
	</footer>"""

new_footer = """	<!-- ===== 11. FOOTER ===== -->
	<footer class="bg-[#FCFAF6] text-slate-600 pt-8 pb-16">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-200/80">
				<!-- Brand Col -->
				<div class="md:col-span-2 space-y-4">
					<div class="flex items-center gap-3">
						<img src="/logo.png" alt="Toko Aneka Rasa 99" class="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-sm" />
						<div>
							<p class="text-slate-900 font-black text-base">Toko Aneka Rasa 99 Poris</p>
							<p class="text-xs text-red-600 font-bold">Pusat Makanan Khas Bangka & Agen Kerupuk Mentah</p>
						</div>
					</div>
					<p class="text-xs text-slate-600 leading-relaxed max-w-md">
						Pusat Kemplang Panggang Arang MM, Getas Super Tenggiri Obor, Terasi Toboali, Kopi Cap 1, Grosir Kerupuk Mentah, dan Aneka Kue Tradisional Bangka. Melayani eceran dan pesanan partai besar ke seluruh Indonesia.
					</p>
					<div class="flex items-center gap-3 pt-1">
						<a
							href="https://wa.me/{WA_PHONE}"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#20ba5a] transition shadow-md shadow-emerald-500/20"
						>
							<svg class="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
							Chat WhatsApp
						</a>
						<a
							href="https://shopee.co.id/tokoanekarasa99"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1.5 bg-[#EE4D2D] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#d73211] transition shadow-md shadow-orange-500/20"
						>
							<img src="/shopee-icon.png" class="w-3.5 h-3.5 object-contain rounded-sm" alt="Shopee" />
							Toko Shopee
						</a>
					</div>
				</div>

				<!-- Nav Links -->
				<div class="space-y-3">
					<p class="text-slate-900 font-extrabold text-sm uppercase tracking-wider">Navigasi</p>
					<ul class="space-y-2 text-xs">
						<li><a href="#hero" class="hover:text-red-600 transition">Beranda</a></li>
						<li><a href="#katalog" class="hover:text-red-600 transition">Katalog Lengkap</a></li>
						<li><a href="#testimoni" class="hover:text-red-600 transition">Testimoni</a></li>
						<li><a href="#kontak" class="hover:text-red-600 transition">Lokasi & Kontak</a></li>
					</ul>
				</div>

				<!-- Store Info -->
				<div class="space-y-3">
					<p class="text-slate-900 font-extrabold text-sm uppercase tracking-wider">Alamat & Jam Buka</p>
					<div class="space-y-2.5 text-xs">
						<p class="leading-relaxed flex items-start gap-2">
							<MapPin class="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
							<span>{STORE_ADDRESS}</span>
						</p>
						<p class="flex items-center gap-2">
							<Clock class="w-4 h-4 text-amber-500 shrink-0" />
							<span>{STORE_HOURS}</span>
						</p>
						<p class="flex items-center gap-2">
							<Phone class="w-4 h-4 text-emerald-500 shrink-0" />
							<span>+62 813-8710-9586</span>
						</p>
					</div>
				</div>
			</div>

			<!-- Bottom Bar -->
			<div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
				<p>© {new Date().getFullYear()} Toko Aneka Rasa 99. Seluruh Hak Cipta Dilindungi.</p>
				<div class="flex items-center gap-4">
					<a href="/login" class="hover:text-red-600 flex items-center gap-1 transition">
						<User class="w-3.5 h-3.5" /> Login Portal Kasir & Owner
					</a>
				</div>
			</div>
		</div>
	</footer>"""

if old_footer in content:
    content = content.replace(old_footer, new_footer)
else:
    print("WARNING: Could not find old footer to replace!")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated footer")
