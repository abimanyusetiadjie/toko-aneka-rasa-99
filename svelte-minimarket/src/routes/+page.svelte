<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let mobileMenuOpen = $state(false);

	const featuredProducts = [
		{
			name: 'Kemplang Ikan Panggang',
			desc: 'Panggang arang khas + sambal terasi',
			price: 'Rp 25.000+',
			img: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&q=80',
			tag: 'Terlaris',
			tagColor: 'bg-[#C8102E] text-white',
			link: 'https://shopee.co.id/tokoanekarasa99'
		},
		{
			name: 'Getas / Keretek Tenggiri',
			desc: 'Renyah gurih dari sagu & ikan segar',
			price: 'Rp 28.000+',
			img: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&q=80',
			tag: 'Favorit',
			tagColor: 'bg-[#FFC107] text-gray-950',
			link: 'https://shopee.co.id/tokoanekarasa99'
		},
		{
			name: 'Kericu Telur Cumi',
			desc: 'Keripik telur cumi gurih langka',
			price: 'Rp 30.000+',
			img: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80',
			tag: 'Spesial',
			tagColor: 'bg-[#C8102E] text-white',
			link: 'https://shopee.co.id/tokoanekarasa99'
		},
		{
			name: 'Lempok Cempedak Asli',
			desc: 'Dodol cempedak murni manis legit',
			price: 'Rp 35.000+',
			img: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&q=80',
			tag: 'Manis',
			tagColor: 'bg-[#FFC107] text-gray-950',
			link: 'https://shopee.co.id/tokoanekarasa99'
		},
		{
			name: 'Terasi Bangka AB Super',
			desc: 'Udang rebon super wangi alami',
			price: 'Rp 15.000+',
			img: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80',
			tag: 'Bumbu',
			tagColor: 'bg-[#C8102E] text-white',
			link: 'https://shopee.co.id/tokoanekarasa99'
		},
		{
			name: 'Kue Rintak Sagu',
			desc: 'Kue bangkit sagu aren meleleh di lidah',
			price: 'Rp 22.000+',
			img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80',
			tag: 'Klasik',
			tagColor: 'bg-[#FFC107] text-gray-950',
			link: 'https://shopee.co.id/tokoanekarasa99'
		}
	];
</script>

<svelte:head>
	<title>Toko Aneka Rasa 99 • Oleh-Oleh Khas Bangka Asli & Terlengkap</title>
	<meta
		name="description"
		content="Pusat oleh-oleh khas Bangka Belitung asli. Kemplang panggang arang, getas ikan tenggiri, kericu, lempok cempedak, dan terasi Bangka super."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="font-sans text-gray-800 bg-[#FFFDF9] min-h-screen selection:bg-[#C8102E] selection:text-white" style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">
	
	<!-- ========================================================================= -->
	<!-- 1. STICKY NAVBAR (Compact h-16) -->
	<!-- ========================================================================= -->
	<header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-amber-100/80 shadow-xs transition-all">
		<div class="max-w-6xl mx-auto px-4 sm:px-6">
			<div class="flex items-center justify-between h-16">
				
				<!-- Logo & Nama -->
				<a href="#beranda" class="flex items-center gap-2.5 group">
					<div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#C8102E] to-[#A00C24] text-[#FFC107] flex items-center justify-center font-black text-sm shadow-xs border border-[#FFC107] group-hover:scale-105 transition-transform">
						99
					</div>
					<div>
						<div class="flex items-center gap-1.5">
							<span class="font-extrabold text-gray-900 text-base tracking-tight leading-none">Aneka Rasa 99</span>
							<span class="bg-[#FFC107] text-gray-950 text-[10px] font-black px-1.5 py-0.2 rounded uppercase font-mono tracking-wider">BANGKA</span>
						</div>
						<span class="text-[11px] text-gray-500 font-medium hidden sm:block">Pusat Kemplang, Getas & Oleh-Oleh Khas Bangka</span>
					</div>
				</a>

				<!-- Desktop Links -->
				<nav class="hidden md:flex items-center gap-6 text-xs font-bold text-gray-700">
					<a href="#beranda" class="hover:text-[#C8102E] transition-colors">Home</a>
					<a href="#tentang" class="hover:text-[#C8102E] transition-colors">Tentang</a>
					<a href="#produk" class="hover:text-[#C8102E] transition-colors">Produk</a>
					<a href="#testimoni" class="hover:text-[#C8102E] transition-colors">Testimoni</a>
					<a href="#kontak" class="hover:text-[#C8102E] transition-colors">Kontak</a>
				</nav>

				<!-- Action Buttons -->
				<div class="flex items-center gap-2.5">
					<a
						href="https://wa.me/6281299887766?text=Halo%20Toko%20Aneka%20Rasa%2099,%20saya%20ingin%20memesan%20oleh-oleh%20khas%20Bangka."
						target="_blank"
						rel="noopener noreferrer"
						class="hidden sm:inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-xs hover:-translate-y-0.5 transition-all"
					>
						<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
							<path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.196-.549-1.849-.766-3.036-2.656-3.128-2.778-.093-.122-.746-.992-.746-1.892 0-.9.472-1.343.64-1.528.17-.184.372-.23.496-.23.125 0 .25.002.359.006.115.006.269-.044.421.323.157.38.536 1.306.582 1.401.047.094.078.204.016.327-.062.124-.094.202-.187.311-.094.11-.197.245-.281.33-.094.094-.192.197-.082.385.11.189.489.807 1.05 1.306.721.642 1.328.841 1.517.934.188.094.298.079.408-.047.11-.125.472-.549.597-.736.126-.188.252-.157.424-.094.173.063 1.096.517 1.284.611.188.094.313.141.36.22.046.078.046.453-.098.858zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.436 5.176L2 22l4.981-1.306C8.423 21.549 10.155 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
						</svg>
						<span>Pesan WhatsApp</span>
					</a>

					<a
						href="https://shopee.co.id/tokoanekarasa99"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1.5 bg-[#C8102E] hover:bg-[#A00C24] text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-xs hover:-translate-y-0.5 transition-all"
					>
						<svg class="w-3.5 h-3.5 fill-current text-[#FFC107]" viewBox="0 0 24 24">
							<path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/>
						</svg>
						<span>Shopee</span>
					</a>

					<!-- Kasir Link -->
					<a
						href={data.user ? (data.user.role_id === 1 ? '/admin/dashboard' : '/pos') : '/login'}
						class="inline-flex items-center gap-1 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs px-3 py-2 rounded-lg shadow-xs hover:-translate-y-0.5 transition-all"
						title="Portal Kasir & Admin"
					>
						<span>{data.user ? 'Dashboard' : 'Kasir'}</span>
					</a>

					<!-- Mobile Toggle -->
					<button
						type="button"
						onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
						class="p-2 rounded-lg text-gray-700 hover:bg-amber-50 md:hidden"
						aria-label="Menu"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M4 6h16M4 12h16M4 18h16"></path>
						</svg>
					</button>
				</div>
			</div>
		</div>

		<!-- Mobile Dropdown -->
		{#if mobileMenuOpen}
			<div class="md:hidden bg-white border-b border-gray-200 px-5 py-3 space-y-2.5 text-xs font-bold shadow-md">
				<a href="#beranda" onclick={() => (mobileMenuOpen = false)} class="block py-1.5 text-gray-800 hover:text-[#C8102E]">Home</a>
				<a href="#tentang" onclick={() => (mobileMenuOpen = false)} class="block py-1.5 text-gray-800 hover:text-[#C8102E]">Tentang</a>
				<a href="#produk" onclick={() => (mobileMenuOpen = false)} class="block py-1.5 text-gray-800 hover:text-[#C8102E]">Produk Unggulan</a>
				<a href="#testimoni" onclick={() => (mobileMenuOpen = false)} class="block py-1.5 text-gray-800 hover:text-[#C8102E]">Testimoni</a>
				<a href="#kontak" onclick={() => (mobileMenuOpen = false)} class="block py-1.5 text-gray-800 hover:text-[#C8102E]">Kontak</a>
			</div>
		{/if}
	</header>

	<!-- ========================================================================= -->
	<!-- 2. HERO SECTION (Kompak & Padat, Merah & Kuning) -->
	<!-- ========================================================================= -->
	<section id="beranda" class="pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-amber-100/60 bg-gradient-to-b from-[#FFF8E7]/40 to-[#FFFDF9]">
		<div class="max-w-6xl mx-auto px-4 sm:px-6">
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
				
				<!-- Kolom Kiri: Headline & CTA -->
				<div class="lg:col-span-7 space-y-4 text-center lg:text-left">
					
					<div class="inline-flex items-center gap-2 bg-[#FFF8E7] border border-[#FFC107]/60 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-2xs">
						<span class="text-[#C8102E]">✦</span>
						<span>Pusat Oleh-Oleh Khas Bangka Belitung Asli Sejak 2014</span>
					</div>

					<h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
						Rasa Otentik <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#C8102E] via-[#E52E4D] to-[#FF8F00]">Pulau Bangka</span> di Setiap Gigitan.
					</h1>

					<p class="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
						Spesialis Kemplang Panggang Arang, Getas Bulat Ikan Tenggiri Super, Kerupuk Gurih, dan Terasi Asli Bangka. Dibuat dengan resep tradisional keluarga, kaya daging ikan asli, renyah, tanpa pemutih, dan bersertifikasi halal.
					</p>

					<!-- Tombol CTA -->
					<div class="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
						<a
							href="https://wa.me/6281299887766?text=Halo%20Toko%20Aneka%20Rasa%2099,%20saya%20ingin%20memesan%20oleh-oleh%20khas%20Bangka."
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-xs hover:-translate-y-0.5 transition-all"
						>
							<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
								<path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.196-.549-1.849-.766-3.036-2.656-3.128-2.778-.093-.122-.746-.992-.746-1.892 0-.9.472-1.343.64-1.528.17-.184.372-.23.496-.23.125 0 .25.002.359.006.115.006.269-.044.421.323.157.38.536 1.306.582 1.401.047.094.078.204.016.327-.062.124-.094.202-.187.311-.094.11-.197.245-.281.33-.094.094-.192.197-.082.385.11.189.489.807 1.05 1.306.721.642 1.328.841 1.517.934.188.094.298.079.408-.047.11-.125.472-.549.597-.736.126-.188.252-.157.424-.094.173.063 1.096.517 1.284.611.188.094.313.141.36.22.046.078.046.453-.098.858zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.436 5.176L2 22l4.981-1.306C8.423 21.549 10.155 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
							</svg>
							<span>Pesan Cepat via WhatsApp</span>
						</a>

						<a
							href="https://shopee.co.id/tokoanekarasa99"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1.5 bg-[#C8102E] hover:bg-[#A00C24] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-xs hover:-translate-y-0.5 transition-all"
						>
							<svg class="w-4 h-4 fill-current text-[#FFC107]" viewBox="0 0 24 24">
								<path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/>
							</svg>
							<span>Belanja di Shopee</span>
						</a>

						<a
							href="#produk"
							class="inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-700 hover:text-[#C8102E] hover:border-[#C8102E] font-bold text-xs sm:text-sm px-4 py-3 rounded-xl transition-all shadow-2xs"
						>
							<span>Lihat Katalog</span>
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
						</a>
					</div>

					<!-- Strip Nilai Singkat -->
					<div class="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-[11px] text-gray-500 font-semibold">
						<span class="flex items-center gap-1 text-gray-700">
							<span class="text-[#C8102E]">✔</span> 100% Ikan Tenggiri Asli
						</span>
						<span class="flex items-center gap-1 text-gray-700">
							<span class="text-[#FFA000]">★</span> Rating 4.9/5
						</span>
						<span class="flex items-center gap-1 text-gray-700">
							<span class="text-emerald-600">📦</span> Kirim Se-Indonesia
						</span>
						<span class="flex items-center gap-1 text-gray-700">
							<span class="text-[#C8102E]">🛡️</span> Kemasan Anti-Remuk
						</span>
					</div>

				</div>

				<!-- Kolom Kanan: Card Paket Best-Seller (Red & Yellow Compact) -->
				<div class="lg:col-span-5">
					<div class="bg-white rounded-2xl p-5 sm:p-6 border border-amber-200/90 shadow-sm hover:shadow-md transition-all duration-300">
						
						<!-- Card Header -->
						<div class="flex items-center justify-between pb-3.5 border-b border-gray-100">
							<div class="flex items-center gap-3">
								<div class="w-10 h-10 rounded-xl bg-[#FFF8E7] border border-[#FFC107]/60 text-[#C8102E] flex items-center justify-center font-black text-lg">
									99
								</div>
								<div>
									<h2 class="font-extrabold text-gray-900 text-sm sm:text-base leading-tight">Paket Best-Seller</h2>
									<p class="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
										<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
										Produk Segar Baru Restock
									</p>
								</div>
							</div>
							<span class="bg-[#FBE8EB] text-[#C8102E] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
								Favorit
							</span>
						</div>

						<!-- List 3 Produk Unggulan Kompak -->
						<div class="py-3 space-y-2">
							<div class="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFDF9] border border-amber-100/80 hover:border-amber-300 transition-colors">
								<div>
									<div class="font-bold text-xs text-gray-900">Kemplang Panggang Cap MM</div>
									<p class="text-[10px] text-gray-500">Panggang arang harum + sambal terasi khas</p>
								</div>
								<span class="text-xs font-black text-[#C8102E] font-mono">Rp 37.500</span>
							</div>

							<div class="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFDF9] border border-amber-100/80 hover:border-amber-300 transition-colors">
								<div>
									<div class="font-bold text-xs text-gray-900">Getas Bulat Cap Tiga Roda</div>
									<p class="text-[10px] text-gray-500">Renyah, gurih ikan tenggiri empuk</p>
								</div>
								<span class="text-xs font-black text-[#C8102E] font-mono">Rp 42.500</span>
							</div>

							<div class="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFDF9] border border-amber-100/80 hover:border-amber-300 transition-colors">
								<div>
									<div class="font-bold text-xs text-gray-900">Terasi AB No. 1 Asli Bangka</div>
									<p class="text-[10px] text-gray-500">Udang rebon super wangi tanpa pewarna</p>
								</div>
								<span class="text-xs font-black text-[#C8102E] font-mono">Rp 55.000</span>
							</div>
						</div>

						<!-- Tombol Pesan Paket Kuning Cerah -->
						<div class="pt-3 border-t border-gray-100">
							<a
								href="https://shopee.co.id/tokoanekarasa99"
								target="_blank"
								rel="noopener noreferrer"
								class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFC107] to-[#FFA000] hover:from-[#FFA000] hover:to-[#FFC107] text-gray-950 font-black text-xs sm:text-sm py-3 rounded-xl shadow-xs hover:shadow-md transition-all active:scale-98 cursor-pointer"
							>
								<span>Pesan Paket Hemat Ini di Shopee</span>
								<svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
							</a>
							<p class="text-[10px] text-center text-gray-400 mt-2">Bisa dikirim langsung hari ini via Shopee, GoSend, atau WhatsApp</p>
						</div>

					</div>
				</div>

			</div>
		</div>
	</section>

	<!-- ========================================================================= -->
	<!-- 3. SECTION KEUNGGULAN (Kompak) -->
	<!-- ========================================================================= -->
	<section id="tentang" class="py-10 sm:py-14 bg-white border-b border-amber-100">
		<div class="max-w-6xl mx-auto px-4 sm:px-6">
			
			<div class="text-center max-w-xl mx-auto mb-8">
				<span class="text-[10px] font-black uppercase tracking-wider text-[#C8102E] bg-[#FBE8EB] px-3 py-0.5 rounded-full">
					Keunggulan Aneka Rasa 99
				</span>
				<h2 class="text-xl sm:text-3xl font-black text-gray-900 mt-1.5 tracking-tight">
					Camilan Otentik Kualitas Terbaik
				</h2>
				<p class="text-xs text-gray-500 mt-1">
					Dibuat langsung dari pesisir Bangka dengan standar mutu rasa tanpa kompromi.
				</p>
			</div>

			<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
				<div class="p-4 rounded-xl bg-[#FFFDF9] border border-amber-200/70 hover:border-[#C8102E] hover:shadow-xs transition-all">
					<div class="w-10 h-10 rounded-lg bg-[#FBE8EB] text-[#C8102E] flex items-center justify-center font-black text-sm mb-2.5">
						01
					</div>
					<h3 class="font-bold text-gray-900 text-xs sm:text-sm">100% Asli Bangka</h3>
					<p class="text-[11px] text-gray-500 mt-1 leading-relaxed">
						Daging ikan tenggiri melimpah langsung dari pengrajin Pulau Bangka.
					</p>
				</div>

				<div class="p-4 rounded-xl bg-[#FFFDF9] border border-amber-200/70 hover:border-[#FFA000] hover:shadow-xs transition-all">
					<div class="w-10 h-10 rounded-lg bg-[#FFF8E7] text-[#FFA000] flex items-center justify-center font-black text-sm mb-2.5">
						02
					</div>
					<h3 class="font-bold text-gray-900 text-xs sm:text-sm">Renyah & Gurih</h3>
					<p class="text-[11px] text-gray-500 mt-1 leading-relaxed">
						Panggang arang harum merata, getas empuk renyah tanpa pengawet.
					</p>
				</div>

				<div class="p-4 rounded-xl bg-[#FFFDF9] border border-amber-200/70 hover:border-[#C8102E] hover:shadow-xs transition-all">
					<div class="w-10 h-10 rounded-lg bg-[#FBE8EB] text-[#C8102E] flex items-center justify-center font-black text-sm mb-2.5">
						03
					</div>
					<h3 class="font-bold text-gray-900 text-xs sm:text-sm">Kemasan Kardus Aman</h3>
					<p class="text-[11px] text-gray-500 mt-1 leading-relaxed">
						Double bubble wrap & kardus kokoh anti-remuk untuk kirim luar kota.
					</p>
				</div>

				<div class="p-4 rounded-xl bg-[#FFFDF9] border border-amber-200/70 hover:border-[#FFA000] hover:shadow-xs transition-all">
					<div class="w-10 h-10 rounded-lg bg-[#FFF8E7] text-[#FFA000] flex items-center justify-center font-black text-sm mb-2.5">
						04
					</div>
					<h3 class="font-bold text-gray-900 text-xs sm:text-sm">Harga Terjangkau</h3>
					<p class="text-[11px] text-gray-500 mt-1 leading-relaxed">
						Harga tangan pertama langsung dari pusat produksi Bangka Belitung.
					</p>
				</div>
			</div>

		</div>
	</section>

	<!-- ========================================================================= -->
	<!-- 4. SECTION PRODUK (Grid 6 Kompak) -->
	<!-- ========================================================================= -->
	<section id="produk" class="py-12 sm:py-16 bg-[#FFFDF9]">
		<div class="max-w-6xl mx-auto px-4 sm:px-6">
			
			<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
				<div>
					<span class="text-[10px] font-black uppercase tracking-wider text-[#C8102E] bg-[#FBE8EB] px-3 py-0.5 rounded-full">
						Katalog Unggulan
					</span>
					<h2 class="text-xl sm:text-3xl font-black text-gray-900 mt-1.5 tracking-tight">
						Produk Favorit Pelanggan
					</h2>
					<p class="text-xs text-gray-500 mt-0.5">
						Pilihan oleh-oleh paling banyak dicari dan dipesan pelanggan se-Indonesia.
					</p>
				</div>

				<a
					href="https://shopee.co.id/tokoanekarasa99"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-1.5 text-xs font-bold text-[#C8102E] hover:text-[#A00C24]"
				>
					<span>Buka Etalase Shopee Lengkap</span>
					<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
				</a>
			</div>

			<!-- Grid 6 Produk -->
			<div class="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
				{#each featuredProducts as p}
					<div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between">
						<div>
							<div class="relative aspect-4/3 overflow-hidden bg-amber-50">
								<img src={p.img} alt={p.name} class="w-full h-full object-cover" loading="lazy" />
								<span class="absolute top-2 left-2 {p.tagColor} text-[9px] font-black px-2 py-0.5 rounded-md">
									{p.tag}
								</span>
							</div>
							<div class="p-3.5">
								<h3 class="font-bold text-gray-900 text-xs sm:text-sm">{p.name}</h3>
								<p class="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{p.desc}</p>
							</div>
						</div>
						<div class="px-3.5 pb-3.5 pt-1 border-t border-gray-50 flex items-center justify-between">
							<span class="text-[#C8102E] font-black text-xs sm:text-sm font-mono">{p.price}</span>
							<a href={p.link} target="_blank" rel="noopener noreferrer" class="text-[11px] font-bold text-[#C8102E] hover:underline">
								Beli
							</a>
						</div>
					</div>
				{/each}
			</div>

		</div>
	</section>

	<!-- ========================================================================= -->
	<!-- 5. SECTION TESTIMONI -->
	<!-- ========================================================================= -->
	<section id="testimoni" class="py-10 sm:py-14 bg-white border-y border-amber-100">
		<div class="max-w-6xl mx-auto px-4 sm:px-6">
			
			<div class="text-center max-w-xl mx-auto mb-8">
				<span class="text-[10px] font-black uppercase tracking-wider text-[#C8102E] bg-[#FBE8EB] px-3 py-0.5 rounded-full">
					Ulasan Pembeli
				</span>
				<h2 class="text-xl sm:text-3xl font-black text-gray-900 mt-1.5 tracking-tight">
					Apa Kata Pelanggan Kami?
				</h2>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div class="p-4 rounded-xl bg-[#FFFDF9] border border-amber-100/90 shadow-2xs space-y-2">
					<div class="text-[#FFA000] text-xs font-black">★★★★★</div>
					<p class="text-xs text-gray-600 italic leading-relaxed">
						"Getasnya renyah empuk, ikannya kerasa banget gak alot. Anak-anak di rumah suka banget, langganan terus!"
					</p>
					<div class="pt-2 border-t border-gray-100 text-[11px]">
						<strong class="text-gray-900 block">Ibu Ratna</strong>
						<span class="text-gray-400">Jakarta Selatan</span>
					</div>
				</div>

				<div class="p-4 rounded-xl bg-[#FFFDF9] border border-amber-100/90 shadow-2xs space-y-2">
					<div class="text-[#FFA000] text-xs font-black">★★★★★</div>
					<p class="text-xs text-gray-600 italic leading-relaxed">
						"Kemplang panggangnya wangi arang khas Bangka, sambal terasinya mantap pedas manis pas. Kirim ke Surabaya packing kardus aman."
					</p>
					<div class="pt-2 border-t border-gray-100 text-[11px]">
						<strong class="text-gray-900 block">Bpk. Hendra</strong>
						<span class="text-gray-400">Surabaya</span>
					</div>
				</div>

				<div class="p-4 rounded-xl bg-[#FFFDF9] border border-amber-100/90 shadow-2xs space-y-2">
					<div class="text-[#FFA000] text-xs font-black">★★★★★</div>
					<p class="text-xs text-gray-600 italic leading-relaxed">
						"Sudah langganan bertahun-tahun di toko Poris. Kalau ada acara keluarga pasti belinya di Toko Aneka Rasa 99."
					</p>
					<div class="pt-2 border-t border-gray-100 text-[11px]">
						<strong class="text-gray-900 block">Ci Meyling</strong>
						<span class="text-gray-400">Tangerang</span>
					</div>
				</div>
			</div>

		</div>
	</section>

	<!-- ========================================================================= -->
	<!-- 6. SECTION CTA AKHIR & KONTAK (Merah Cerah dengan Tombol Kuning) -->
	<!-- ========================================================================= -->
	<section id="kontak" class="py-12 sm:py-16 bg-gradient-to-r from-[#C8102E] via-[#A00C24] to-[#C8102E] text-white">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
			
			<span class="inline-block bg-[#FFC107] text-gray-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
				Pesan Praktis & Cepat
			</span>

			<h2 class="text-2xl sm:text-4xl font-black tracking-tight text-white">
				Siap Bawa Pulang Rasa Bangka?
			</h2>

			<p class="text-xs sm:text-sm text-amber-100 max-w-lg mx-auto leading-relaxed">
				Pesan sekarang dan nikmati oleh-oleh autentik Bangka langsung di rumah Anda. Kami melayani pengiriman ke seluruh nusantara.
			</p>

			<div class="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3">
				<a
					href="https://shopee.co.id/tokoanekarasa99"
					target="_blank"
					rel="noopener noreferrer"
					class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFC107] hover:bg-[#ffb300] text-gray-950 font-black px-6 py-3 rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-98 cursor-pointer"
				>
					<svg class="w-4 h-4 fill-current text-[#C8102E]" viewBox="0 0 24 24">
						<path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/>
					</svg>
					<span>Belanja di Shopee</span>
				</a>

				<a
					href="https://wa.me/6281299887766?text=Halo%20Toko%20Aneka%20Rasa%2099,%20saya%20ingin%20tanya%20stok%20dan%20pesan%20oleh-oleh%20Bangka."
					target="_blank"
					rel="noopener noreferrer"
					class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#C8102E] hover:bg-amber-50 font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition-all shadow-xs active:scale-98 cursor-pointer"
				>
					<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
						<path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.196-.549-1.849-.766-3.036-2.656-3.128-2.778-.093-.122-.746-.992-.746-1.892 0-.9.472-1.343.64-1.528.17-.184.372-.23.496-.23.125 0 .25.002.359.006.115.006.269-.044.421.323.157.38.536 1.306.582 1.401.047.094.078.204.016.327-.062.124-.094.202-.187.311-.094.11-.197.245-.281.33-.094.094-.192.197-.082.385.11.189.489.807 1.05 1.306.721.642 1.328.841 1.517.934.188.094.298.079.408-.047.11-.125.472-.549.597-.736.126-.188.252-.157.424-.094.173.063 1.096.517 1.284.611.188.094.313.141.36.22.046.078.046.453-.098.858zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.436 5.176L2 22l4.981-1.306C8.423 21.549 10.155 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
					</svg>
					<span>Chat WhatsApp Admin</span>
				</a>
			</div>

		</div>
	</section>

	<!-- ========================================================================= -->
	<!-- 7. FOOTER -->
	<!-- ========================================================================= -->
	<footer class="bg-gray-900 text-gray-400 py-6 border-t border-gray-800 text-xs">
		<div class="max-w-6xl mx-auto px-4 sm:px-6">
			<div class="flex flex-col sm:flex-row items-center justify-between gap-3">
				<div class="text-center sm:text-left">
					<p class="font-bold text-white text-sm">Toko Aneka Rasa 99</p>
					<p class="text-[11px] text-gray-500">Perumahan Poris Indah Blok B 11 No. 1, Cipondoh, Tangerang</p>
				</div>
				<div class="flex items-center gap-4 text-xs">
					<a href="https://shopee.co.id/tokoanekarasa99" target="_blank" rel="noopener noreferrer" class="hover:text-[#FFC107] transition-colors">
						shopee.co.id/tokoanekarasa99
					</a>
					<span class="text-gray-700">|</span>
					<a href="/login" class="text-gray-400 hover:text-white transition-colors">
						Login Kasir POS
					</a>
				</div>
			</div>
			<div class="mt-4 pt-4 border-t border-gray-800/80 text-center text-[11px] text-gray-500">
				© 2026 Toko Aneka Rasa 99. Oleh-Oleh Khas Bangka Asli.
			</div>
		</div>
	</footer>

</div>
