<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let mobileMenuOpen = $state(false);

	const featuredProducts = [
		{
			name: 'Kemplang Ikan',
			desc: 'Kerupuk ikan tenggiri khas Bangka',
			price: 'Mulai Rp25rb',
			img: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&q=80',
			link: 'https://shopee.co.id/tokoanekarasa99'
		},
		{
			name: 'Getas / Keretek',
			desc: 'Camilan renyah dari sagu & cumi',
			price: 'Mulai Rp28rb',
			img: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&q=80',
			link: 'https://shopee.co.id/tokoanekarasa99'
		},
		{
			name: 'Kericu',
			desc: 'Keripik telur cumi khas Bangka',
			price: 'Mulai Rp30rb',
			img: 'https://images.unsplash.com/photo-1604908176997-4316b3e4c3e3?w=600&q=80',
			link: 'https://shopee.co.id/tokoanekarasa99'
		},
		{
			name: 'Lempok Cempedak',
			desc: 'Manisan cempedak tradisional',
			price: 'Mulai Rp35rb',
			img: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&q=80',
			link: 'https://shopee.co.id/tokoanekarasa99'
		},
		{
			name: 'Terasi Bangka',
			desc: 'Terasi udang / ikan khas',
			price: 'Mulai Rp15rb',
			img: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80',
			link: 'https://shopee.co.id/tokoanekarasa99'
		},
		{
			name: 'Kue Rintak',
			desc: 'Kue bangkit khas Bangka',
			price: 'Mulai Rp22rb',
			img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80',
			link: 'https://shopee.co.id/tokoanekarasa99'
		}
	];
</script>

<svelte:head>
	<title>Toko Aneka Rasa - Oleh-Oleh Khas Bangka Asli</title>
	<meta
		name="description"
		content="Toko oleh-oleh khas Bangka terlengkap. Kemplang, Getas, Kericu, Lempok Cempedak, dan camilan autentik dari Bumi Timah. Pengiriman ke seluruh Indonesia."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="font-sans text-gray-800 bg-white min-h-screen selection:bg-[#C8102E] selection:text-white" style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">
	<!-- Header -->
	<header class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
		<div class="max-w-6xl mx-auto px-4 sm:px-6">
			<div class="flex items-center justify-between h-16">
				<!-- Logo -->
				<a href="#beranda" class="flex items-center gap-2.5">
					<div class="w-9 h-9 rounded-full bg-[#C8102E] flex items-center justify-center text-white font-bold text-sm shadow-xs">
						AR
					</div>
					<div>
						<span class="font-bold text-gray-900 text-[15px] leading-tight block">Toko Aneka Rasa</span>
						<span class="text-[11px] text-gray-500 -mt-0.5 block">Oleh-Oleh Khas Bangka</span>
					</div>
				</a>

				<!-- Menu Desktop -->
				<nav class="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
					<a href="#beranda" class="hover:text-[#C8102E] transition">Beranda</a>
					<a href="#produk" class="hover:text-[#C8102E] transition">Produk</a>
					<a href="#tentang" class="hover:text-[#C8102E] transition">Tentang</a>
					<a href="#kontak" class="hover:text-[#C8102E] transition">Kontak</a>
				</nav>

				<!-- CTA Buttons -->
				<div class="flex items-center gap-3">
					<a
						href="https://shopee.co.id/tokoanekarasa99"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1.5 bg-[#C8102E] hover:bg-[#a80d26] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer"
					>
						Belanja di Shopee
					</a>

					<!-- Mobile Toggle -->
					<button
						type="button"
						onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
						class="p-2 rounded-lg text-gray-600 hover:text-gray-900 md:hidden"
						aria-label="Toggle menu"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
						</svg>
					</button>
				</div>
			</div>
		</div>

		<!-- Mobile Dropdown Menu -->
		{#if mobileMenuOpen}
			<div class="md:hidden bg-white border-b border-gray-100 px-6 py-4 space-y-3">
				<a href="#beranda" onclick={() => (mobileMenuOpen = false)} class="block text-sm font-medium text-gray-700 hover:text-[#C8102E]">Beranda</a>
				<a href="#produk" onclick={() => (mobileMenuOpen = false)} class="block text-sm font-medium text-gray-700 hover:text-[#C8102E]">Produk</a>
				<a href="#tentang" onclick={() => (mobileMenuOpen = false)} class="block text-sm font-medium text-gray-700 hover:text-[#C8102E]">Tentang</a>
				<a href="#kontak" onclick={() => (mobileMenuOpen = false)} class="block text-sm font-medium text-gray-700 hover:text-[#C8102E]">Kontak</a>
				<div class="pt-2 border-t border-gray-100">
					<a href="/login" class="block text-xs font-semibold text-gray-500 hover:text-gray-800">Portal Kasir POS / Staf</a>
				</div>
			</div>
		{/if}
	</header>

	<!-- Hero -->
	<section id="beranda" class="relative overflow-hidden bg-gradient-to-br from-[#C8102E] via-[#C8102E] to-[#9e0c24]">
		<!-- Soft yellow accent -->
		<div class="absolute top-0 right-0 w-96 h-96 bg-[#FFC107]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

		<div class="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
			<div class="max-w-2xl">
				<div class="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-medium px-3 py-1.5 rounded-full mb-5">
					<span class="w-1.5 h-1.5 rounded-full bg-[#FFC107]"></span>
					Pengiriman ke Seluruh Indonesia
				</div>

				<h1 class="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight tracking-tight">
					Oleh-Oleh Khas Bangka<br class="hidden sm:block" /> Asli & Terlengkap
				</h1>

				<p class="mt-4 text-white/90 text-base sm:text-lg leading-relaxed max-w-lg">
					Kemplang, Getas, Kericu, Lempok Cempedak & camilan renyah autentik langsung dari Bumi Timah.
				</p>

				<div class="mt-8 flex flex-col sm:flex-row gap-3">
					<a
						href="https://shopee.co.id/tokoanekarasa99"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center justify-center gap-2 bg-[#FFC107] text-gray-900 font-bold px-6 py-3.5 rounded-xl text-sm sm:text-base transition-all hover:bg-[#ffb300] hover:-translate-y-0.5 shadow-md"
					>
						Pesan Sekarang di Shopee
					</a>
					<a
						href="https://wa.me/6281299887766?text=Halo%20Toko%20Aneka%20Rasa,%20saya%20ingin%20tanya%20stok%20dan%20pesan%20oleh-oleh%20Bangka."
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-6 py-3.5 rounded-xl text-sm sm:text-base border border-white/25 transition-all hover:bg-white/20 hover:-translate-y-0.5"
					>
						Chat WhatsApp
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- Keunggulan -->
	<section class="py-14 sm:py-16 bg-[#FFF8E7]/60">
		<div class="max-w-6xl mx-auto px-4 sm:px-6">
			<div class="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
				<div class="text-center">
					<div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#C8102E]/10 flex items-center justify-center text-[#C8102E] text-xl font-bold">
						01
					</div>
					<h3 class="font-bold text-gray-900 text-sm sm:text-base">100% Asli Bangka</h3>
					<p class="mt-1 text-xs sm:text-sm text-gray-600">Langsung dari produsen lokal</p>
				</div>
				<div class="text-center">
					<div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#C8102E]/10 flex items-center justify-center text-[#C8102E] text-xl font-bold">
						02
					</div>
					<h3 class="font-bold text-gray-900 text-sm sm:text-base">Renyah & Gurih</h3>
					<p class="mt-1 text-xs sm:text-sm text-gray-600">Rasa autentik tradisional</p>
				</div>
				<div class="text-center">
					<div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#C8102E]/10 flex items-center justify-center text-[#C8102E] text-xl font-bold">
						03
					</div>
					<h3 class="font-bold text-gray-900 text-sm sm:text-base">Kemasan Aman</h3>
					<p class="mt-1 text-xs sm:text-sm text-gray-600">Rapi & siap dikirim jauh</p>
				</div>
				<div class="text-center">
					<div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#C8102E]/10 flex items-center justify-center text-[#C8102E] text-xl font-bold">
						04
					</div>
					<h3 class="font-bold text-gray-900 text-sm sm:text-base">Harga Terjangkau</h3>
					<p class="mt-1 text-xs sm:text-sm text-gray-600">Cocok untuk oleh-oleh</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Produk -->
	<section id="produk" class="py-16 sm:py-20">
		<div class="max-w-6xl mx-auto px-4 sm:px-6">
			<div class="text-center mb-10 sm:mb-12">
				<h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900">Produk Favorit Pelanggan</h2>
				<p class="mt-2 text-gray-600 text-sm sm:text-base">Pilihan camilan khas Bangka yang paling banyak dicari</p>
			</div>

			<div class="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
				{#each featuredProducts as p}
					<div class="bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
						<div class="aspect-4/3 bg-gray-100 overflow-hidden">
							<img src={p.img} alt={p.name} class="w-full h-full object-cover" loading="lazy" />
						</div>
						<div class="p-4">
							<h3 class="font-bold text-gray-900 text-sm sm:text-base">{p.name}</h3>
							<p class="text-xs text-gray-500 mt-0.5">{p.desc}</p>
							<div class="mt-3 flex items-center justify-between">
								<span class="text-[#C8102E] font-bold text-sm">{p.price}</span>
								<a href={p.link} target="_blank" rel="noopener noreferrer" class="text-xs font-semibold text-[#C8102E] hover:underline">
									Lihat
								</a>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-10 text-center">
				<a
					href="https://shopee.co.id/tokoanekarasa99"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 bg-[#C8102E] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all hover:bg-[#a80d26] hover:-translate-y-0.5 shadow-xs"
				>
					Lihat Semua Produk di Shopee
				</a>
			</div>
		</div>
	</section>

	<!-- Tentang -->
	<section id="tentang" class="py-16 sm:py-20 bg-gray-50">
		<div class="max-w-6xl mx-auto px-4 sm:px-6">
			<div class="max-w-2xl mx-auto text-center">
				<h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900">Tentang Toko Aneka Rasa</h2>
				<p class="mt-4 text-gray-600 leading-relaxed text-sm sm:text-base">
					Kami menyediakan berbagai oleh-oleh khas Bangka Belitung dengan kualitas terbaik.
					Mulai dari camilan renyah seperti kemplang dan getas, hingga produk tradisional seperti lempok cempedak dan terasi.
					Semua produk dipilih langsung dari produsen lokal agar rasa autentiknya tetap terjaga.
				</p>
				<p class="mt-3 text-gray-600 leading-relaxed text-sm sm:text-base">
					Cocok untuk dibawa pulang sebagai buah tangan atau dikirim langsung ke keluarga dan sahabat di seluruh Indonesia.
				</p>
			</div>
		</div>
	</section>

	<!-- CTA Akhir -->
	<section id="kontak" class="py-14 sm:py-16 bg-[#C8102E]">
		<div class="max-w-3xl mx-auto px-4 sm:px-6 text-center">
			<h2 class="text-2xl sm:text-3xl font-extrabold text-white">Siap Bawa Pulang Rasa Bangka?</h2>
			<p class="mt-3 text-white/90 text-sm sm:text-base">Pesan sekarang dan nikmati oleh-oleh autentik langsung di rumah.</p>

			<div class="mt-8 flex flex-col sm:flex-row justify-center gap-3">
				<a
					href="https://shopee.co.id/tokoanekarasa99"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center justify-center gap-2 bg-[#FFC107] text-gray-900 font-bold px-6 py-3.5 rounded-xl text-sm sm:text-base transition-all hover:bg-[#ffb300] hover:-translate-y-0.5 shadow-md"
				>
					Belanja di Shopee
				</a>
				<a
					href="https://wa.me/6281299887766?text=Halo%20Toko%20Aneka%20Rasa,%20saya%20ingin%20tanya%20stok%20dan%20pesan%20oleh-oleh%20Bangka."
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center justify-center gap-2 bg-white text-[#C8102E] font-semibold px-6 py-3.5 rounded-xl text-sm sm:text-base transition-all hover:bg-gray-50 hover:-translate-y-0.5 shadow-xs"
				>
					Chat WhatsApp
				</a>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="bg-gray-900 text-gray-400 py-8">
		<div class="max-w-6xl mx-auto px-4 sm:px-6">
			<div class="flex flex-col sm:flex-row items-center justify-between gap-4">
				<div class="text-center sm:text-left">
					<p class="font-semibold text-white text-sm">Toko Aneka Rasa</p>
					<p class="text-xs mt-0.5">Oleh-Oleh Khas Bangka Belitung</p>
				</div>
				<div class="flex items-center gap-4 text-xs sm:text-sm">
					<a href="https://shopee.co.id/tokoanekarasa99" target="_blank" rel="noopener noreferrer" class="hover:text-[#FFC107] transition">
						shopee.co.id/tokoanekarasa99
					</a>
					<span class="text-gray-700">|</span>
					<a href="/login" class="text-gray-400 hover:text-white transition">
						Login Kasir POS
					</a>
				</div>
			</div>
			<div class="mt-6 pt-6 border-t border-gray-800 text-center text-xs">
				© 2026 Toko Aneka Rasa. Semua hak dilindungi.
			</div>
		</div>
	</footer>
</div>
