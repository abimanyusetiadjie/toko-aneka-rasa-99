<script lang="ts">
	import type { PageData } from './$types';
	import {
		Phone,
		MapPin,
		Clock,
		Star,
		ShoppingBag,
		ShieldCheck,
		CheckCircle2,
		ChevronRight,
		Search,
		Menu,
		X,
		ArrowRight,
		Truck,
		Award,
		ThumbsUp,
		Sparkles,
		MessageCircle,
		ExternalLink,
		User,
		ShoppingCart
	} from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	// State untuk UI Landing Page
	let mobileMenuOpen = $state(false);
	let selectedCategory = $state('ALL');
	let searchQuery = $state('');

	// State Form Pemesanan Cepat
	let customerName = $state('');
	let customerCity = $state('');
	let orderNotes = $state('');
	let selectedQuickProduct = $state('');

	// Nomor WhatsApp Toko (format internasional 62...)
	const WA_PHONE = '6281299887766';
	const STORE_NAME = 'Toko Aneka Rasa 99';
	const STORE_ADDRESS = 'Perumahan Poris Indah Blok B 11 No. 1, RT 001 / RW 005, Kel. Cipondoh Indah, Kec. Cipondoh, Kota Tangerang, Banten 15148';
	const STORE_HOURS = 'Buka Setiap Hari: 07.30 - 21.30 WIB';

	// Filter produk dinamis
	let filteredProducts = $derived(
		(data.products || []).filter((p) => {
			const matchCategory =
				selectedCategory === 'ALL' ||
				p.category_id === selectedCategory ||
				(p.category_name && p.category_name.toLowerCase().includes(selectedCategory.toLowerCase()));
			const matchSearch =
				searchQuery.trim() === '' ||
				p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.sku.toLowerCase().includes(searchQuery.toLowerCase());
			return matchCategory && matchSearch;
		})
	);

	// Helper generate WhatsApp link untuk produk tertentu
	function getProductWaLink(productName: string, price: number) {
		const formattedPrice = new Intl.NumberFormat('id-ID').format(price);
		const text = `Halo ${STORE_NAME}, saya melihat website Anda dan berminat memesan *${productName}* (Rp ${formattedPrice}). Apakah produk ini tersedia?`;
		return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(text)}`;
	}

	// Helper generate WhatsApp link dari formulir pemesanan cepat
	function handleQuickOrderSubmit(e: Event) {
		e.preventDefault();
		const name = customerName.trim() || 'Pelanggan';
		const city = customerCity.trim() || '-';
		const item = selectedQuickProduct.trim() || 'Oleh-oleh Khas Bangka';
		const notes = orderNotes.trim() ? `\nCatatan Tambahan: ${orderNotes.trim()}` : '';

		const message = `Halo ${STORE_NAME}! 🌊\n\nNama Saya: *${name}*\nKota Pengiriman: *${city}*\nProduk yang ingin dipesan: *${item}*${notes}\n\nMohon info ketersediaan stok, total biaya, dan ongkos kirim. Terima kasih!`;
		const url = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`;
		window.open(url, '_blank');
	}

	// Testimoni Pelanggan Terpilih
	const testimonials = [
		{
			name: 'Ibu Ratna Hendrawan',
			city: 'Jakarta Selatan',
			review: 'Getasnya bener-bener renyah empuk, ikannya kerasa banget dan gak keras sama sekali bikin sakit gigi. Anak-anak di rumah doyan banget. Langganan terus kalau ke Poris!',
			stars: 5,
			product: 'Getas Bulat Ikan Tenggiri'
		},
		{
			name: 'Bpk. Hendra Wijaya',
			city: 'Surabaya',
			review: 'Kemplang panggangnya wangi arang khas Bangka, dipadukan sama sambal terasinya mantap pedas manis pas. Kirim ke Surabaya packing rapi kardus tebal, gak ada yang hancur.',
			stars: 5,
			product: 'Kemplang Panggang Cap MM'
		},
		{
			name: 'Ci Meyling',
			city: 'Tangerang',
			review: 'Sudah langganan bertahun-tahun di Toko Aneka Rasa 99. Kalo mau kirim hampers atau oleh-oleh ke kerabat keluarga pasti belinya di sini. Kualitas ikannya selalu konsisten juara.',
			stars: 5,
			product: 'Hampers Kerupuk Mawar & Getas'
		},
		{
			name: 'Ibu Dian Pratiwi',
			city: 'Bandung',
			review: 'Terasi Bangka No. 1 dan Sambal Rusip-nya otentik banget! Aromanya wangi sedap bikin masakan kangkung terasi langsung mirip di resto Belitung asli.',
			stars: 5,
			product: 'Terasi AB No. 1 Pulau Bangka'
		},
		{
			name: 'Bpk. Robertus K.',
			city: 'Semarang',
			review: 'Beli kemplang pasir sangrai dan kerupuk tenggiri. Pelayanan admin WhatsApp sangat cepat dan ramah, dikirim via cargo cepat sekali sampai. Recommended seller!',
			stars: 5,
			product: 'Kemplang Pasir Sangrai'
		},
		{
			name: 'Kevin Tan',
			city: 'Medan',
			review: 'Abon Ikan Tenggiri Sambalingkung-nya enak banget untuk lauk nasi hangat. Sangat praktis, gurih alami tanpa amis, dan higienis kemasannya.',
			stars: 5,
			product: 'Abon Ikan Sambalingkung'
		}
	];
</script>

<svelte:head>
	<title>Toko Aneka Rasa 99 | Pusat Kemplang & Oleh-Oleh Khas Bangka di Poris Tangerang</title>
	<meta
		name="description"
		content="Toko Aneka Rasa 99: Pusat Kemplang Panggang, Getas Ikan Tenggiri Asli Bangka, Kerupuk Pasir, Terasi AB, dan Oleh-Oleh Khas Bangka Belitung di Poris Indah Tangerang. Renyah, gurih, halal, siap kirim ke seluruh Indonesia."
	/>
	<meta
		name="keywords"
		content="toko aneka rasa 99, aneka rasa 99 poris, kemplang bangka tangerang, getas tenggiri poris indah, oleh oleh khas bangka tangerang, kemplang panggang cipondoh, kerupuk bangka poris, terasi bangka asli"
	/>
	<meta name="author" content="Toko Aneka Rasa 99" />
	<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

	<!-- Canonical URL -->
	<link rel="canonical" href="https://tokoanekarasa99.my.id/" />

	<!-- Open Graph / Facebook / WhatsApp -->
	<meta property="og:locale" content="id_ID" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Toko Aneka Rasa 99 | Pusat Kemplang & Oleh-Oleh Khas Bangka di Poris Tangerang" />
	<meta property="og:description" content="Pusat Kemplang Panggang, Getas Ikan Tenggiri Asli Bangka, Terasi & Aneka Cemilan Khas Bangka di Poris Indah Tangerang. Pesan mudah via WhatsApp." />
	<meta property="og:url" content="https://tokoanekarasa99.my.id/" />
	<meta property="og:site_name" content="Toko Aneka Rasa 99" />
	<meta property="og:image" content="https://tokoanekarasa99.my.id/logo.png" />
	<meta property="og:image:width" content="800" />
	<meta property="og:image:height" content="800" />
	<meta property="og:image:alt" content="Logo Toko Aneka Rasa 99" />

	<!-- Twitter Cards -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Toko Aneka Rasa 99 | Pusat Kemplang & Oleh-Oleh Khas Bangka" />
	<meta name="twitter:description" content="Pusat Kemplang Panggang, Getas Ikan Tenggiri Asli Bangka, & Oleh-Oleh Khas Bangka Belitung di Poris Indah Tangerang." />
	<meta name="twitter:image" content="https://tokoanekarasa99.my.id/logo.png" />

	<!-- Local SEO Geo Meta Tags (Poris Indah, Tangerang) -->
	<meta name="geo.region" content="ID-BT" />
	<meta name="geo.placename" content="Kota Tangerang" />
	<meta name="geo.position" content="-6.1783;106.6713" />
	<meta name="ICBM" content="-6.1783, 106.6713" />

	<!-- Structured Data (JSON-LD) LocalBusiness / Store -->
	{@html `<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": ["Store", "LocalBusiness"],
		"name": "Toko Aneka Rasa 99",
		"alternateName": ["Aneka Rasa 99 Poris", "Toko Aneka Rasa 99 Tangerang"],
		"url": "https://tokoanekarasa99.my.id",
		"logo": "https://tokoanekarasa99.my.id/logo.png",
		"image": "https://tokoanekarasa99.my.id/logo.png",
		"description": "Pusat Kemplang Panggang, Getas Ikan Tenggiri Asli Bangka, Kerupuk Pasir, Terasi AB, dan Oleh-Oleh Khas Bangka Belitung di Poris Indah Tangerang.",
		"telephone": "+6281299887766",
		"priceRange": "Rp 15.000 - Rp 150.000",
		"currenciesAccepted": "IDR",
		"paymentAccepted": "Cash, QRIS, Transfer Bank",
		"address": {
			"@type": "PostalAddress",
			"streetAddress": "Perumahan Poris Indah Blok B 11 No. 1, RT 001 / RW 005, Kel. Cipondoh Indah, Kec. Cipondoh",
			"addressLocality": "Kota Tangerang",
			"addressRegion": "Banten",
			"postalCode": "15148",
			"addressCountry": "ID"
		},
		"geo": {
			"@type": "GeoCoordinates",
			"latitude": -6.1783,
			"longitude": 106.6713
		},
		"openingHoursSpecification": [
			{
				"@type": "OpeningHoursSpecification",
				"dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
				"opens": "07:30",
				"closes": "21:30"
			}
		],
		"aggregateRating": {
			"@type": "AggregateRating",
			"ratingValue": "4.9",
			"reviewCount": "128"
		}
	}
	</script>`}

	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="min-h-screen bg-[#FFFDF9] text-slate-900 font-sans selection:bg-[#C8102E] selection:text-white" style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">
	
	<!-- ========================================================================= -->
	<!-- 🌟 STICKY NAVBAR (Kompak h-16, Tema Merah & Kuning) -->
	<!-- ========================================================================= -->
	<header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-amber-100/80 transition-all shadow-xs">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<!-- Brand Logo & Nama -->
				<a href="#home" class="flex items-center gap-2.5 group">
					<img
						src="/logo.png"
						alt="Logo Toko Aneka Rasa 99"
						class="w-10 h-10 rounded-full object-cover border-2 border-[#FFC107] shadow-2xs group-hover:scale-105 transition-transform shrink-0"
					/>
					<div>
						<div class="flex items-center gap-1.5">
							<span class="font-black text-lg text-slate-900 tracking-tight leading-none">Aneka Rasa 99</span>
							<span class="bg-[#FFC107] text-gray-950 text-[10px] font-black px-1.5 py-0.2 rounded font-mono uppercase tracking-wider">BANGKA</span>
						</div>
						<p class="text-[11px] text-slate-500 hidden sm:block">Pusat Kemplang, Getas & Oleh-Oleh Khas Bangka</p>
					</div>
				</a>

				<!-- Desktop Nav Links (5 Bagian Utama) -->
				<nav class="hidden md:flex items-center gap-6 text-xs font-bold text-slate-700">
					<a href="#home" class="hover:text-[#C8102E] transition-colors">Home</a>
					<a href="#tentang" class="hover:text-[#C8102E] transition-colors">Tentang</a>
					<a href="#produk" class="hover:text-[#C8102E] transition-colors">Produk</a>
					<a href="#testimoni" class="hover:text-[#C8102E] transition-colors">Testimoni</a>
					<a href="#kontak" class="hover:text-[#C8102E] transition-colors">Kontak</a>
				</nav>

				<!-- Action Buttons (Shopee Merah + WhatsApp + Kasir) -->
				<div class="hidden sm:flex items-center gap-2.5">
					<a
						href="https://shopee.co.id/tokoanekarasa99"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1.5 bg-[#C8102E] hover:bg-[#A00C24] text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
					>
						<svg class="w-3.5 h-3.5 fill-current text-[#FFC107]" viewBox="0 0 24 24">
							<path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/>
						</svg>
						<span>Shopee</span>
					</a>

					<a
						href="https://wa.me/{WA_PHONE}?text={encodeURIComponent('Halo Toko Aneka Rasa 99, saya ingin memesan oleh-oleh khas Bangka.')}"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
					>
						<MessageCircle class="w-3.5 h-3.5" />
						<span>Pesan WhatsApp</span>
					</a>

					{#if data.user}
						<a
							href={data.user.role_id === 1 ? '/admin/dashboard' : '/pos'}
							class="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
						>
							<ShoppingCart class="w-3.5 h-3.5 text-[#FFC107]" />
							<span>{data.user.role_id === 1 ? 'Dashboard' : 'Kasir'}</span>
						</a>
					{:else}
						<a
							href="/login"
							class="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 text-xs font-semibold px-2.5 py-2 rounded-xl transition-all"
							title="Portal Staf Toko & Kasir"
						>
							<User class="w-3.5 h-3.5 text-slate-500" />
							<span>Kasir</span>
						</a>
					{/if}
				</div>

				<!-- Mobile Hamburger Button -->
				<button
					type="button"
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
					class="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-amber-50 focus:outline-hidden"
					aria-label="Toggle menu"
				>
					{#if mobileMenuOpen}
						<X class="w-5 h-5" />
					{:else}
						<Menu class="w-5 h-5" />
					{/if}
				</button>
			</div>
		</div>

		<!-- Mobile Dropdown Menu -->
		{#if mobileMenuOpen}
			<div class="md:hidden bg-white border-b border-slate-200 px-4 pt-2.5 pb-4 space-y-2 text-xs font-bold">
				<a href="#home" onclick={() => (mobileMenuOpen = false)} class="block py-1.5 text-slate-700 hover:text-[#C8102E] border-b border-slate-100">Home</a>
				<a href="#tentang" onclick={() => (mobileMenuOpen = false)} class="block py-1.5 text-slate-700 hover:text-[#C8102E] border-b border-slate-100">Tentang</a>
				<a href="#produk" onclick={() => (mobileMenuOpen = false)} class="block py-1.5 text-slate-700 hover:text-[#C8102E] border-b border-slate-100">Produk</a>
				<a href="#testimoni" onclick={() => (mobileMenuOpen = false)} class="block py-1.5 text-slate-700 hover:text-[#C8102E] border-b border-slate-100">Testimoni</a>
				<a href="#kontak" onclick={() => (mobileMenuOpen = false)} class="block py-1.5 text-slate-700 hover:text-[#C8102E] border-b border-slate-100">Kontak & Lokasi</a>

				<div class="pt-2 flex gap-2">
					<a
						href="https://shopee.co.id/tokoanekarasa99"
						target="_blank"
						rel="noopener noreferrer"
						class="flex-1 flex items-center justify-center gap-1.5 bg-[#C8102E] text-white py-2 rounded-lg shadow-xs"
					>
						<span>Shopee</span>
					</a>
					<a
						href="https://wa.me/{WA_PHONE}"
						target="_blank"
						rel="noopener noreferrer"
						class="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 text-white py-2 rounded-lg shadow-xs"
					>
						<span>WhatsApp</span>
					</a>
				</div>
			</div>
		{/if}
	</header>

	<main>
		<!-- ========================================================================= -->
		<!-- 1. BAGIAN HOME / HERO (Kompak & Padat, Merah & Kuning) -->
		<!-- ========================================================================= -->
		<section id="home" class="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 bg-gradient-to-b from-[#FFF8E7]/60 via-[#FFFDF9] to-white border-b border-amber-100/60">
			<!-- Aksen Latar Belakang Halus -->
			<div class="absolute -top-20 -right-20 w-80 h-80 bg-[#FFC107]/15 rounded-full blur-3xl pointer-events-none"></div>
			<div class="absolute top-1/2 -left-20 w-72 h-72 bg-[#C8102E]/8 rounded-full blur-2xl pointer-events-none"></div>

			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
				<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
					
					<!-- Teks Hero Kiri (Kompak & Padat) -->
					<div class="lg:col-span-7 space-y-4 text-center lg:text-left">
						<div class="inline-flex items-center gap-2 bg-[#FFF8E7] border border-[#FFC107]/60 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-2xs">
							<Sparkles class="w-3.5 h-3.5 text-[#C8102E]" />
							<span>Pusat Oleh-Oleh Khas Bangka Belitung Asli Sejak 2014</span>
						</div>

						<h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
							Rasa Otentik <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#C8102E] via-[#E52E4D] to-[#FF8F00]">Pulau Bangka</span> di Setiap Gigitan.
						</h1>

						<p class="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
							Spesialis Kemplang Panggang Arang, Getas Bulat Ikan Tenggiri Super, Kerupuk Gurih, dan Terasi Asli Bangka. Dibuat dengan resep tradisional keluarga, kaya daging ikan asli, renyah, tanpa pemutih, dan bersertifikasi halal.
						</p>

						<!-- CTA Buttons (Merah Utama & Kuning/Outline) -->
						<div class="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
							<a
								href="https://wa.me/{WA_PHONE}?text={encodeURIComponent('Halo Toko Aneka Rasa 99, saya ingin memesan oleh-oleh khas Bangka.')}"
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
							>
								<MessageCircle class="w-4 h-4" />
								<span>Pesan Cepat via WhatsApp</span>
							</a>

							<a
								href="https://shopee.co.id/tokoanekarasa99"
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-[#A00C24] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
							>
								<svg class="w-4 h-4 fill-current text-[#FFC107]" viewBox="0 0 24 24">
									<path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/>
								</svg>
								<span>Belanja di Shopee</span>
							</a>

							<a
								href="#produk"
								class="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs sm:text-sm px-4 py-3 rounded-xl shadow-2xs transition-all cursor-pointer"
							>
								<span>Lihat Katalog Produk</span>
								<ChevronRight class="w-3.5 h-3.5 text-slate-400" />
							</a>
						</div>

						<!-- Trust Value Strip (Kompak & Padat) -->
						<div class="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left">
							<div class="bg-white/90 border border-amber-100 p-2.5 rounded-xl shadow-2xs">
								<div class="text-[#C8102E] font-black text-xs flex items-center gap-1">
									<span>🐟 100% Asli</span>
								</div>
								<p class="text-[10px] text-slate-500 mt-0.5">Daging Ikan Tenggiri</p>
							</div>

							<div class="bg-white/90 border border-amber-100 p-2.5 rounded-xl shadow-2xs">
								<div class="text-emerald-700 font-black text-xs flex items-center gap-1">
									<span>🛡️ Halal</span>
								</div>
								<p class="text-[10px] text-slate-500 mt-0.5">Higienis & Alami</p>
							</div>

							<div class="bg-white/90 border border-amber-100 p-2.5 rounded-xl shadow-2xs">
								<div class="text-[#C8102E] font-black text-xs flex items-center gap-1">
									<span>📦 Aman</span>
								</div>
								<p class="text-[10px] text-slate-500 mt-0.5">Kirim Se-Indonesia</p>
							</div>

							<div class="bg-white/90 border border-amber-100 p-2.5 rounded-xl shadow-2xs">
								<div class="text-[#FFA000] font-black text-xs flex items-center gap-1">
									<span>⚡ Cepat</span>
								</div>
								<p class="text-[10px] text-slate-500 mt-0.5">Sameday / Instant</p>
							</div>
						</div>
					</div>

					<!-- Visual Showcase Card (Persis Tata Letak Gambar yang Disukai Pengguna!) -->
					<div class="lg:col-span-5">
						<div class="relative mx-auto max-w-md bg-white border border-amber-200/90 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300">
							
							<!-- Header Card -->
							<div class="flex items-center justify-between pb-3.5 border-b border-slate-100">
								<div class="flex items-center gap-3">
									<div class="w-10 h-10 rounded-xl bg-[#FFF8E7] border border-[#FFC107]/60 flex items-center justify-center text-[#C8102E] font-black text-lg">
										99
									</div>
									<div>
										<h2 class="font-black text-slate-900 text-sm sm:text-base leading-tight">Paket Best-Seller</h2>
										<p class="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
											<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
											Produk Segar Baru Restock
										</p>
									</div>
								</div>
								<span class="bg-[#FBE8EB] text-[#C8102E] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">Favorit</span>
							</div>

							<!-- Item List Highlight Kompak -->
							<div class="py-3 space-y-2">
								<div class="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFDF9] border border-amber-100/80 hover:border-amber-300 transition-colors">
									<div>
										<div class="font-bold text-xs text-slate-900">Kemplang Panggang Cap MM</div>
										<p class="text-[10px] text-slate-500">Panggang arang harum + sambal terasi khas</p>
									</div>
									<span class="text-xs font-black text-[#C8102E] font-mono">Rp 37.500</span>
								</div>

								<div class="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFDF9] border border-amber-100/80 hover:border-amber-300 transition-colors">
									<div>
										<div class="font-bold text-xs text-slate-900">Getas Bulat Cap Tiga Roda</div>
										<p class="text-[10px] text-slate-500">Renyah, gurih ikan tenggiri empuk</p>
									</div>
									<span class="text-xs font-black text-[#C8102E] font-mono">Rp 42.500</span>
								</div>

								<div class="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFDF9] border border-amber-100/80 hover:border-amber-300 transition-colors">
									<div>
										<div class="font-bold text-xs text-slate-900">Terasi AB No. 1 Asli Bangka</div>
										<p class="text-[10px] text-slate-500">Udang rebon super wangi tanpa pewarna</p>
									</div>
									<span class="text-xs font-black text-[#C8102E] font-mono">Rp 55.000</span>
								</div>
							</div>

							<!-- Bottom Order Button Kuning Emas Cerah -->
							<div class="pt-3 border-t border-slate-100">
								<a
									href="https://shopee.co.id/tokoanekarasa99"
									target="_blank"
									rel="noopener noreferrer"
									class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFC107] to-[#FFA000] hover:from-[#FFA000] hover:to-[#FFC107] text-gray-950 font-black py-3 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-98 text-xs sm:text-sm"
								>
									<span>Pesan Paket Hemat Ini di Shopee</span>
									<ArrowRight class="w-4 h-4" />
								</a>
								<p class="text-[10px] text-center text-slate-400 mt-2">Bisa dikirim langsung hari ini via Shopee, GoSend, atau WhatsApp</p>
							</div>
						</div>
					</div>

				</div>
			</div>
		</section>

		<!-- ========================================================================= -->
		<!-- 2. BAGIAN TENTANG (Bangun Kepercayaan - Kompak) -->
		<!-- ========================================================================= -->
		<section id="tentang" class="py-10 sm:py-14 bg-white border-b border-amber-100">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<!-- Header Section -->
				<div class="text-center max-w-2xl mx-auto space-y-2">
					<span class="text-[10px] font-black uppercase tracking-wider text-[#C8102E] bg-[#FBE8EB] border border-[#C8102E]/20 px-3 py-0.5 rounded-full">
						Tentang Toko Aneka Rasa 99
					</span>
					<h2 class="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
						Mengapa Memilih Oleh-Oleh Kami?
					</h2>
					<p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
						Kelezatan sejati makanan tradisional Bangka terletak pada kemurnian bahan baku. Di Toko Aneka Rasa 99, kami memegang teguh resep otentik tanpa mengurangi komposisi ikan tenggiri asli.
					</p>
				</div>

				<!-- 4 Pilar Keunggulan Kompak -->
				<div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<!-- Pilar 1 -->
					<div class="bg-[#FFFDF9] border border-amber-100 p-5 rounded-2xl hover:border-[#C8102E] hover:shadow-sm transition-all">
						<div class="w-10 h-10 rounded-xl bg-[#FBE8EB] text-[#C8102E] flex items-center justify-center font-bold mb-3">
							<ShieldCheck class="w-5 h-5" />
						</div>
						<h3 class="text-sm font-bold text-slate-900 mb-1">100% Ikan Tenggiri Pilihan</h3>
						<p class="text-xs text-slate-600 leading-relaxed">
							Menggunakan daging ikan tenggiri segar kualitas terbaik. Komposisi ikannya padat, tidak dominan tepung, dan gurih alami.
						</p>
					</div>

					<!-- Pilar 2 -->
					<div class="bg-[#FFFDF9] border border-amber-100 p-5 rounded-2xl hover:border-[#FFC107] hover:shadow-sm transition-all">
						<div class="w-10 h-10 rounded-xl bg-[#FFF8E7] text-[#FFA000] flex items-center justify-center font-bold mb-3">
							<Sparkles class="w-5 h-5" />
						</div>
						<h3 class="text-sm font-bold text-slate-900 mb-1">Panggang Arang Tradisional</h3>
						<p class="text-xs text-slate-600 leading-relaxed">
							Kemplang dipanggang di atas bara arang kelapa alami. Menghasilkan aroma khas asap yang harum dan tekstur mekar renyah.
						</p>
					</div>

					<!-- Pilar 3 -->
					<div class="bg-[#FFFDF9] border border-amber-100 p-5 rounded-2xl hover:border-[#C8102E] hover:shadow-sm transition-all">
						<div class="w-10 h-10 rounded-xl bg-[#FBE8EB] text-[#C8102E] flex items-center justify-center font-bold mb-3">
							<Award class="w-5 h-5" />
						</div>
						<h3 class="text-sm font-bold text-slate-900 mb-1">Alami & Tanpa Pemutih</h3>
						<p class="text-xs text-slate-600 leading-relaxed">
							Diolah tanpa pemutih kimia dan digoreng dengan minyak kelapa pilihan berkualitas tinggi. Sehat dan aman untuk semua usia.
						</p>
					</div>

					<!-- Pilar 4 -->
					<div class="bg-[#FFFDF9] border border-amber-100 p-5 rounded-2xl hover:border-[#FFC107] hover:shadow-sm transition-all">
						<div class="w-10 h-10 rounded-xl bg-[#FFF8E7] text-[#FFA000] flex items-center justify-center font-bold mb-3">
							<Truck class="w-5 h-5" />
						</div>
						<h3 class="text-sm font-bold text-slate-900 mb-1">Kemasan Aman Anti-Remuk</h3>
						<p class="text-xs text-slate-600 leading-relaxed">
							Pengiriman luar kota dilindungi kardus tebal dan double bubble wrap tanpa biaya tambahan agar kemplang tiba utuh.
						</p>
					</div>
				</div>

				<!-- Stats Counter Kompak -->
				<div class="mt-8 p-5 sm:p-7 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md">
					<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
						<div>
							<div class="text-2xl sm:text-3xl font-black text-[#FFC107] font-mono">10+ Thn</div>
							<p class="text-[11px] text-slate-300 mt-0.5">Konsistensi Mutu & Rasa</p>
						</div>
						<div>
							<div class="text-2xl sm:text-3xl font-black text-[#FFC107] font-mono">50.000+</div>
							<p class="text-[11px] text-slate-300 mt-0.5">Pesanan Dikirimkan</p>
						</div>
						<div>
							<div class="text-2xl sm:text-3xl font-black text-[#FFC107] font-mono">4.9 / 5.0</div>
							<p class="text-[11px] text-slate-300 mt-0.5">Rating Kepuasan Ulasan</p>
						</div>
						<div>
							<div class="text-2xl sm:text-3xl font-black text-[#FFC107] font-mono">100%</div>
							<p class="text-[11px] text-slate-300 mt-0.5">Jaminan Cita Rasa Asli</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- ========================================================================= -->
		<!-- 3. BAGIAN PRODUK/JASA (Tampilkan yang Kamu Jual - Kompak) -->
		<!-- ========================================================================= -->
		<section id="produk" class="py-10 sm:py-14 bg-[#FFFDF9]">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<!-- Title & Search Bar -->
				<div class="flex flex-col md:flex-row md:items-end justify-between gap-3">
					<div>
						<span class="text-[10px] font-black uppercase tracking-wider text-[#C8102E] bg-[#FBE8EB] border border-[#C8102E]/20 px-3 py-0.5 rounded-full">
							Katalog Toko Aneka Rasa 99
						</span>
						<h2 class="text-xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
							Pilihan Oleh-Oleh Khas Bangka
						</h2>
						<p class="text-xs text-slate-600 mt-0.5">
							Daftar produk terbaik langsung dari etalase toko kami dengan harga resmi terjangkau.
						</p>
					</div>

					<!-- Search Bar -->
					<div class="relative w-full md:w-64">
						<Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Cari Getas, Kemplang..."
							class="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:border-[#C8102E] focus:outline-hidden shadow-2xs font-medium"
						/>
						{#if searchQuery}
							<button
								type="button"
								onclick={() => (searchQuery = '')}
								class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
							>
								<X class="w-3.5 h-3.5" />
							</button>
						{/if}
					</div>
				</div>

				<!-- Kategori Filter Tabs -->
				<div class="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
					<button
						type="button"
						onclick={() => (selectedCategory = 'ALL')}
						class="px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer {selectedCategory === 'ALL'
							? 'bg-[#C8102E] text-white shadow-xs'
							: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}"
					>
						Semua ({data.products.length})
					</button>

					{#each data.categories as cat}
						<button
							type="button"
							onclick={() => (selectedCategory = cat.id.toString())}
							class="px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer {selectedCategory === cat.id.toString()
								? 'bg-[#C8102E] text-white shadow-xs'
								: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}"
						>
							{cat.name}
						</button>
					{/each}
				</div>

				<!-- Grid Produk Kompak -->
				{#if filteredProducts.length === 0}
					<div class="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 mt-6">
						<ShoppingBag class="w-8 h-8 text-slate-300 mx-auto mb-2" />
						<h3 class="text-xs font-bold text-slate-700">Produk Tidak Ditemukan</h3>
						<p class="text-[11px] text-slate-500 mt-0.5">Coba gunakan kata kunci pencarian yang lain.</p>
						<button
							type="button"
							onclick={() => {
								selectedCategory = 'ALL';
								searchQuery = '';
							}}
							class="mt-2.5 px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
						>
							Reset Pencarian
						</button>
					</div>
				{:else}
					<div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
						{#each filteredProducts as product}
							<div class="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-[#FFC107] hover:shadow-md transition-all flex flex-col justify-between group">
								<div class="p-4 space-y-2.5">
									<!-- Badge Kategori & SKU -->
									<div class="flex items-center justify-between text-[10px] font-mono text-slate-500">
										<span class="bg-[#FFF8E7] text-[#C8102E] font-bold px-2 py-0.5 rounded border border-[#FFC107]/40">
											{product.category_name || 'OLEH-OLEH'}
										</span>
										<span>SKU: {product.sku || product.barcode || '-'}</span>
									</div>

									<!-- Nama Produk -->
									<div>
										<h3 class="font-bold text-slate-900 text-sm group-hover:text-[#C8102E] transition-colors line-clamp-2">
											{product.name}
										</h3>
										<p class="text-[10px] text-slate-500 mt-0.5">
											Kemasan: 1 {product.unit || 'pcs'} • Daging Ikan Tenggiri Asli
										</p>
									</div>

									<!-- Status Stok -->
									<div class="flex items-center gap-1.5 text-[10px]">
										<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
										<span class="text-emerald-700 font-medium">Ready Stock di Toko</span>
									</div>
								</div>

								<!-- Bottom Price & WA Button -->
								<div class="p-4 pt-0 border-t border-slate-100 space-y-2.5">
									<div class="flex items-baseline justify-between">
										<span class="text-[10px] text-slate-500">Harga Resmi:</span>
										<span class="text-base font-black text-[#C8102E] font-mono">
											Rp {new Intl.NumberFormat('id-ID').format(product.price || 0)}
										</span>
									</div>

									<a
										href={getProductWaLink(product.name, product.price || 0)}
										target="_blank"
										rel="noopener noreferrer"
										class="w-full flex items-center justify-center gap-1.5 bg-[#C8102E] hover:bg-[#A00C24] text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer"
									>
										<MessageCircle class="w-3.5 h-3.5" />
										<span>Pesan via WhatsApp</span>
									</a>
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Konsultasi / Pesanan Khusus -->
				<div class="mt-8 bg-[#FFF8E7] border border-[#FFC107]/60 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
					<div>
						<h3 class="font-black text-slate-900 text-sm sm:text-base">Butuh Pesanan Grosir, Partai Besar, atau Paket Hampers?</h3>
						<p class="text-xs text-slate-600 mt-0.5">
							Kami melayani pesanan khusus untuk oleh-oleh kantor, hajatan, reseller luar kota, dan pengiriman partai cargo.
						</p>
					</div>
					<a
						href="https://wa.me/{WA_PHONE}?text={encodeURIComponent('Halo Toko Aneka Rasa 99, saya ingin konsultasi pemesanan grosir/hampers partai besar.')}"
						target="_blank"
						rel="noopener noreferrer"
						class="shrink-0 inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
					>
						<span>Hubungi WhatsApp Admin Grosir</span>
						<ArrowRight class="w-3.5 h-3.5 text-[#FFC107]" />
					</a>
				</div>
			</div>
		</section>

		<!-- ========================================================================= -->
		<!-- 4. BAGIAN TESTIMONI (Bukti dari Customer - Kompak) -->
		<!-- ========================================================================= -->
		<section id="testimoni" class="py-10 sm:py-14 bg-white border-y border-amber-100">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<!-- Header Section -->
				<div class="text-center max-w-2xl mx-auto space-y-2">
					<span class="text-[10px] font-black uppercase tracking-wider text-[#C8102E] bg-[#FBE8EB] border border-[#C8102E]/20 px-3 py-0.5 rounded-full">
						Testimoni Pelanggan
					</span>
					<h2 class="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
						Dipercaya Oleh Ribuan Penikmat Oleh-Oleh Bangka
					</h2>
					<p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
						Ulasan jujur dari pelanggan setia kami yang memesan langsung maupun belanja di outlet fisik Poris Indah Tangerang.
					</p>
				</div>

				<!-- Grid Testimoni Kompak -->
				<div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
					{#each testimonials as t}
						<div class="bg-[#FFFDF9] border border-amber-100/90 p-4 sm:p-5 rounded-2xl flex flex-col justify-between hover:shadow-sm transition-all">
							<div class="space-y-2.5">
								<!-- Bintang Rating Kuning Emas -->
								<div class="flex items-center gap-1 text-[#FFA000]">
									{#each Array(t.stars) as _}
										<Star class="w-3.5 h-3.5 fill-[#FFA000]" />
									{/each}
								</div>

								<!-- Teks Ulasan -->
								<p class="text-xs text-slate-700 leading-relaxed italic">
									"{t.review}"
								</p>
							</div>

							<!-- Info Pelanggan -->
							<div class="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
								<div>
									<h3 class="font-bold text-xs text-slate-900">{t.name}</h3>
									<p class="text-[10px] text-slate-500">{t.city}</p>
								</div>
								<span class="text-[10px] font-mono text-[#C8102E] bg-[#FBE8EB] px-2 py-0.5 rounded">
									{t.product}
								</span>
							</div>
						</div>
					{/each}
				</div>

				<!-- Rating Badge Banner -->
				<div class="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
					<div class="flex items-center gap-1.5">
						<CheckCircle2 class="w-4 h-4 text-emerald-600" />
						<span class="font-bold">100% Ulasan Pelanggan Nyata</span>
					</div>
					<div class="flex items-center gap-1.5">
						<ThumbsUp class="w-4 h-4 text-[#C8102E]" />
						<span class="font-bold">Lebih dari 98% Pembeli Melakukan Repeat Order</span>
					</div>
				</div>
			</div>
		</section>

		<!-- ========================================================================= -->
		<!-- 5. BAGIAN KONTAK & PESANAN (Kompak, Tema Merah & Kuning) -->
		<!-- ========================================================================= -->
		<section id="kontak" class="py-10 sm:py-14 bg-gradient-to-b from-[#FFFDF9] to-[#FFF8E7]/40">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
					
					<!-- Info Kontak & Outlet Toko -->
					<div class="lg:col-span-6 space-y-4">
						<div>
							<span class="text-[10px] font-black uppercase tracking-wider text-[#C8102E] bg-[#FBE8EB] border border-[#C8102E]/20 px-3 py-0.5 rounded-full">
								Hubungi & Kunjungi Kami
							</span>
							<h2 class="text-xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
								Siap Mengirim Kelezatan Bangka ke Pintu Anda!
							</h2>
							<p class="text-xs text-slate-600 mt-1 leading-relaxed">
								Pesan sekarang untuk pengiriman cepat ke rumah Anda, atau mampir langsung ke toko kami untuk mencicipi renyahnya aneka kemplang.
							</p>
						</div>

						<!-- List Info Kompak -->
						<div class="space-y-3">
							<!-- Lokasi -->
							<div class="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
								<div class="w-9 h-9 rounded-lg bg-[#FFF8E7] border border-[#FFC107]/60 flex items-center justify-center text-[#C8102E] shrink-0">
									<MapPin class="w-4 h-4" />
								</div>
								<div>
									<h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alamat Toko Fisik</h3>
									<p class="text-xs font-bold text-slate-900 mt-0.5 leading-snug">
										{STORE_ADDRESS}
									</p>
									<a
										href="https://maps.google.com/?q=Toko+Aneka+Rasa+99+Poris+Indah+Tangerang"
										target="_blank"
										rel="noopener noreferrer"
										class="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-bold mt-1"
									>
										<span>Buka Petunjuk Arah di Google Maps</span>
										<ExternalLink class="w-3 h-3" />
									</a>
								</div>
							</div>

							<!-- Jam Operasional -->
							<div class="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
								<div class="w-9 h-9 rounded-lg bg-[#FBE8EB] border border-[#C8102E]/30 flex items-center justify-center text-[#C8102E] shrink-0">
									<Clock class="w-4 h-4" />
								</div>
								<div>
									<h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jam Buka Toko</h3>
									<p class="text-xs font-bold text-slate-900 mt-0.5">
										{STORE_HOURS}
									</p>
									<p class="text-[10px] text-slate-500">Buka setiap hari termasuk hari libur nasional & akhir pekan.</p>
								</div>
							</div>

							<!-- Kontak WhatsApp -->
							<div class="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
								<div class="w-9 h-9 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
									<Phone class="w-4 h-4" />
								</div>
								<div>
									<h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">WhatsApp Hotline CS</h3>
									<p class="text-xs font-bold text-slate-900 mt-0.5">
										+62 812-9988-7766 (Fast Response)
									</p>
									<p class="text-[10px] text-slate-500">Menerima tanya stok, konsultasi ongkir, dan pembelian grosir.</p>
								</div>
							</div>
						</div>
					</div>

					<!-- Form Pemesanan WhatsApp Interaktif -->
					<div class="lg:col-span-6">
						<div class="bg-white border border-amber-200/90 rounded-2xl p-5 sm:p-6 shadow-sm">
							<div class="space-y-1 pb-3 border-b border-slate-100">
								<h2 class="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
									<MessageCircle class="w-4 h-4 text-emerald-600" />
									<span>Formulir Pesanan Cepat WhatsApp</span>
								</h2>
								<p class="text-xs text-slate-500">
									Isi formulir ringkas ini dan pesanan Anda akan langsung terformat rapi di aplikasi WhatsApp!
								</p>
							</div>

							<form onsubmit={handleQuickOrderSubmit} class="mt-4 space-y-3 text-xs">
								<div>
									<label for="lp-name" class="block font-bold text-slate-700 mb-1">Nama Lengkap:</label>
									<input
										id="lp-name"
										type="text"
										bind:value={customerName}
										placeholder="Contoh: Budi Santoso"
										class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:border-[#C8102E] focus:bg-white focus:outline-hidden"
										required
									/>
								</div>

								<div>
									<label for="lp-city" class="block font-bold text-slate-700 mb-1">Kota / Alamat Pengiriman:</label>
									<input
										id="lp-city"
										type="text"
										bind:value={customerCity}
										placeholder="Contoh: Tangerang / Jakarta Barat / Surabaya"
										class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:border-[#C8102E] focus:bg-white focus:outline-hidden"
										required
									/>
								</div>

								<div>
									<label for="lp-product" class="block font-bold text-slate-700 mb-1">Pilih Produk yang Diinginkan:</label>
									<select
										id="lp-product"
										bind:value={selectedQuickProduct}
										class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:border-[#C8102E] focus:bg-white focus:outline-hidden"
									>
										<option value="">-- Pilih Produk Utama --</option>
										{#each data.products.slice(0, 15) as p}
											<option value={p.name}>{p.name} - Rp {new Intl.NumberFormat('id-ID').format(p.price || 0)}</option>
										{/each}
									</select>
								</div>

								<div>
									<label for="lp-notes" class="block font-bold text-slate-700 mb-1">Catatan Tambahan (Varian / Jumlah Bungkus):</label>
									<textarea
										id="lp-notes"
										bind:value={orderNotes}
										rows="2"
										placeholder="Contoh: Kemplang panggang 2 bks, Getas 3 bks, packing kardus."
										class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:border-[#C8102E] focus:bg-white focus:outline-hidden"
									></textarea>
								</div>

								<button
									type="submit"
									class="w-full flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-[#A00C24] text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-xs transition-all cursor-pointer active:scale-98"
								>
									<MessageCircle class="w-4 h-4" />
									<span>Kirim Pesanan ke WhatsApp Sekarang</span>
								</button>
								<p class="text-[10px] text-center text-slate-400">
									Admin toko kami akan langsung membalas dengan rincian total dan opsi ongkos kirim.
								</p>
							</form>
						</div>
					</div>

				</div>
			</div>
		</section>
	</main>

	<!-- ========================================================================= -->
	<!-- FOOTER -->
	<!-- ========================================================================= -->
	<footer class="bg-slate-900 text-white pt-10 pb-6 border-t border-slate-800">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 md:grid-cols-12 gap-6 pb-8 border-b border-slate-800">
				<!-- Brand Info -->
				<div class="md:col-span-5 space-y-2">
					<div class="flex items-center gap-2.5">
						<img src="/logo.png" alt="Toko Aneka Rasa 99" class="w-9 h-9 rounded-full border border-[#FFC107] object-cover" />
						<span class="font-black text-lg text-white tracking-tight">Toko Aneka Rasa 99</span>
					</div>
					<p class="text-xs text-slate-400 leading-relaxed max-w-sm">
						Pusat Kemplang Panggang, Getas Ikan Tenggiri, Kerupuk, dan Bumbu Asli Bangka Belitung. Melayani pemesanan eceran, grosir, dan hampers ke seluruh Indonesia.
					</p>
					<p class="text-[11px] text-slate-500 font-mono">
						{STORE_ADDRESS}
					</p>
				</div>

				<!-- Navigasi Cepat -->
				<div class="md:col-span-3 space-y-2">
					<h3 class="text-xs font-bold uppercase tracking-wider text-[#FFC107]">Navigasi Website</h3>
					<ul class="space-y-1 text-xs text-slate-300">
						<li><a href="#home" class="hover:text-[#FFC107] transition-colors">Home (Beranda)</a></li>
						<li><a href="#tentang" class="hover:text-[#FFC107] transition-colors">Tentang Kami</a></li>
						<li><a href="#produk" class="hover:text-[#FFC107] transition-colors">Katalog Produk</a></li>
						<li><a href="#testimoni" class="hover:text-[#FFC107] transition-colors">Testimoni Pelanggan</a></li>
						<li><a href="#kontak" class="hover:text-[#FFC107] transition-colors">Kontak & Lokasi</a></li>
					</ul>
				</div>

				<!-- Portal Karyawan & Sistem -->
				<div class="md:col-span-4 space-y-2">
					<h3 class="text-xs font-bold uppercase tracking-wider text-[#FFC107]">Portal Kasir & Admin Toko</h3>
					<p class="text-xs text-slate-400">
						Khusus kasir dan pemilik toko untuk mengoperasikan kasir POS, stok opname, dan laporan keuangan.
					</p>

					{#if data.user}
						<div class="flex flex-col gap-2">
							<a
								href="/pos"
								class="inline-flex items-center gap-2 bg-[#C8102E] hover:bg-[#A00C24] text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
							>
								<ShoppingCart class="w-3.5 h-3.5 text-[#FFC107]" />
								<span>Buka Terminal Kasir (POS)</span>
							</a>
							{#if data.user.role_id === 1}
								<a
									href="/admin/dashboard"
									class="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-[#FFC107] text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 transition-all cursor-pointer"
								>
									<span>Buka Dashboard Admin Toko</span>
								</a>
							{/if}
						</div>
					{:else}
						<a
							href="/login"
							class="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700 transition-all cursor-pointer"
						>
							<User class="w-3.5 h-3.5 text-[#FFC107]" />
							<span>Masuk ke Sistem Kasir / POS</span>
						</a>
					{/if}
				</div>
			</div>

			<!-- Copyright & Payment Badges -->
			<div class="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
				<p>© 2026 Toko Aneka Rasa 99. Hak Cipta Dilindungi Undang-Undang.</p>
				<div class="flex items-center gap-2 text-[11px]">
					<span class="bg-slate-800 px-2 py-0.5 rounded text-slate-300">QRIS Dinamis</span>
					<span class="bg-slate-800 px-2 py-0.5 rounded text-slate-300">Transfer Bank</span>
					<span class="bg-slate-800 px-2 py-0.5 rounded text-slate-300">Tunai</span>
					<span class="bg-slate-800 px-2 py-0.5 rounded text-slate-300">ShopeePay</span>
				</div>
			</div>
		</div>
	</footer>
</div>
