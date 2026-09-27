import sys

filepath = 'svelte-minimarket/src/routes/+page.svelte'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace headline
old_headline = """					<!-- Hero Headline -->
					<div class="space-y-2">
						<h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.15]">
							Oleh-Oleh Khas Bangka Asli,
							<span class="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 bg-clip-text text-transparent block mt-1">
								Langsung dari Poris, Siap Kirim ke Seluruh Indonesia
							</span>
						</h1>
					</div>

					<!-- Narrative Subtitle -->
					<p class="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
						Pusat Kemplang Panggang Arang Cap MM, Getas Super Tenggiri Obor, Terasi Toboali, Kopi Cap 1, hingga <strong>Grosir & Eceran Aneka Kerupuk Mentah</strong>. Renyahnya juara, gurihnya alami tanpa pengawet.
					</p>"""

new_headline = """					<!-- Hero Headline -->
					<div class="space-y-2">
						<h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.15]">
							Oleh-Oleh Khas Bangka
							<span class="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 bg-clip-text text-transparent block mt-1 sm:inline sm:mt-0">
								Asli & Terlengkap
							</span>
						</h1>
					</div>

					<!-- Narrative Subtitle -->
					<p class="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
						Pusat Kemplang Panggang Arang MM, Getas Super Tenggiri, dan Grosir Kerupuk Mentah di Poris. Siap kirim ke seluruh Indonesia!
					</p>"""

if old_headline in content:
    content = content.replace(old_headline, new_headline)
else:
    print("Old headline not found!")

# Replace CTAs
old_cta = """					<!-- Action Buttons -->
					<div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
						<!-- Primary WhatsApp CTA with Shimmer -->
						<a
							href="https://wa.me/{WA_PHONE}?text={encodeURIComponent('Halo Toko Aneka Rasa 99, saya ingin memesan kemplang & oleh-oleh khas Bangka:')}"
							target="_blank"
							rel="noopener noreferrer"
							class="shimmer-btn bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-sm sm:text-base px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
						>
							<svg class="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
							<span>Pesan Cepat via WhatsApp</span>
							<ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
						</a>

						<!-- Secondary CTA -->
						<a
							href="#katalog"
							class="bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
						>
							<Package class="w-4 h-4 text-amber-600" />
							<span>Lihat Katalog Lengkap</span>
						</a>
					</div>"""

new_cta = """					<!-- Action Buttons -->
					<div class="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3 pt-2 w-full max-w-sm mx-auto lg:mx-0 sm:max-w-none">
						
						<div class="grid grid-cols-2 gap-3 w-full sm:w-auto">
							<!-- WhatsApp CTA -->
							<a
								href="https://wa.me/{WA_PHONE}?text={encodeURIComponent('Halo Toko Aneka Rasa 99, saya ingin memesan oleh-oleh khas Bangka:')}"
								target="_blank"
								rel="noopener noreferrer"
								class="shimmer-btn bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs sm:text-sm px-2 py-3 sm:px-6 sm:py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 group cursor-pointer text-center"
							>
								<svg class="w-6 h-6 sm:w-5 sm:h-5 fill-current shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
								<span>WhatsApp</span>
							</a>

							<!-- Shopee CTA -->
							<a
								href="https://shopee.co.id/tokoanekarasa99"
								target="_blank"
								rel="noopener noreferrer"
								class="shimmer-btn bg-[#EE4D2D] hover:bg-[#d73211] text-white font-black text-xs sm:text-sm px-2 py-3 sm:px-6 sm:py-3.5 rounded-xl shadow-lg shadow-orange-600/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 group cursor-pointer text-center"
							>
								<img src="/shopee-icon.png" class="w-6 h-6 sm:w-5 sm:h-5 object-contain rounded-sm shadow-sm" alt="Shopee" />
								<span>Toko Shopee</span>
							</a>
						</div>

						<!-- Catalog CTA -->
						<a
							href="#katalog"
							class="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base px-6 py-3 sm:py-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer sm:mt-0"
						>
							<Package class="w-4 h-4 text-amber-600" />
							<span>Lihat Katalog Lengkap</span>
						</a>
					</div>"""

if old_cta in content:
    content = content.replace(old_cta, new_cta)
else:
    print("Old CTA not found!")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Hero mobile CTAs")
