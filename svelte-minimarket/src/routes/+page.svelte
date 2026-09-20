<script lang="ts">
	import type { PageData } from './$types';
	import {
		Phone, MapPin, Clock, Star, ShoppingBag, ShieldCheck,
		ChevronRight, Menu, X, ArrowRight, Truck, Award, Sparkles,
		MessageCircle, ExternalLink, User, ShoppingCart,
		Plus, Minus, Trash2, CheckCircle2, ThumbsUp
	} from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const WA_PHONE = '6281387109586';
	const STORE_NAME = 'Toko Aneka Rasa 99';
	const STORE_ADDRESS = 'Jl. Raya Poris Indah, RT.007/RW.010, Cipondoh Indah, Kec. Cipondoh, Kota Tangerang, Banten 15122';
	const STORE_HOURS = 'Buka Setiap Hari: 07.30 – 21.30 WIB';

	let mobileMenuOpen = $state(false);
	let cartOpen = $state(false);

	interface FeaturedProduct { id: string; name: string; desc: string; price: number; image: string; badge: string; }

	const FEATURED: FeaturedProduct[] = [
		{ id: 'fp1', name: 'Kemplang Panggang Cap MM', desc: 'Dipanggang di atas bara arang. Aroma asap harum, tekstur renyah di luar dan empuk di dalam. Disertai sambal terasi khas. Tanpa pengawet.', price: 37500, image: '/images/products/kemplang.png', badge: 'Terlaris' },
		{ id: 'fp2', name: 'Getas Bulat Cap Tiga Roda', desc: 'Getas bulat dari ikan tenggiri pilihan. Renyah, gurih, dan tidak terlalu asin. Cocok untuk camilan sehari-hari atau oleh-oleh.', price: 42500, image: '/images/products/getas.png', badge: 'Favorit' },
		{ id: 'fp3', name: 'Terasi AB No.1 Asli Bangka', desc: 'Terasi udang rebon super asli Bangka. Wangi khas, warna natural tanpa pewarna, diolah secara higienis dan tradisional.', price: 55000, image: '/images/products/terasi.png', badge: 'Original' },
		{ id: 'fp4', name: 'Kemplang Goreng Pasir Tjokro', desc: 'Kemplang goreng pasir dengan tekstur ekstra renyah. Rasa gurih ikan tenggiri yang kuat. Cocok dimakan langsung atau lauk.', price: 32000, image: '/images/products/kemplang.png', badge: 'Crispy' },
		{ id: 'fp5', name: 'Getas Amplang Ikan Tenggiri', desc: 'Camilan khas Bangka berbahan ikan tenggiri asli. Bentuk bulat renyah, gurih tahan lama, oleh-oleh favorit keluarga.', price: 25000, image: '/images/products/getas.png', badge: 'Hemat' },
		{ id: 'fp6', name: 'Kericu Keripik Telur Cumi', desc: 'Keripik gurih dari telur cumi segar pilihan khas Bangka. Tekstur renyah krispi dengan cita rasa seafood istimewa.', price: 30000, image: '/images/products/snack-kericu.png', badge: 'Premium' },
		{ id: 'fp7', name: 'Kerupuk Mentah Khas Bangka', desc: 'Kerupuk mentah kualitas istimewa khas Bangka. Mudah digoreng, mekar sempurna, renyah dan gurih alami.', price: 35000, image: '/images/products/kerupuk-mentah.png', badge: 'Siap Goreng' },
		{ id: 'fp8', name: 'Aneka Kue Tradisional Bangka', desc: 'Kue tradisional khas Bangka dibuat dengan resep turun-temurun. Manis, gurih, legit, cocok untuk teman santai dan oleh-oleh.', price: 28000, image: '/images/products/kue.png', badge: 'Tradisional' }
	];

	interface CartItem extends FeaturedProduct { qty: number; }
	let cart = $state<CartItem[]>([]);

	function addToCart(product: FeaturedProduct) {
		const existing = cart.find(c => c.id === product.id);
		if (existing) { cart = cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c); }
		else { cart = [...cart, { ...product, qty: 1 }]; }
		cartOpen = true;
	}
	function removeFromCart(id: string) { cart = cart.filter(c => c.id !== id); if (cart.length === 0) cartOpen = false; }
	function changeQty(id: string, delta: number) { cart = cart.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c); }

	let cartTotal = $derived(cart.reduce((sum, c) => sum + c.price * c.qty, 0));
	let cartCount = $derived(cart.reduce((sum, c) => sum + c.qty, 0));

	function checkoutWhatsApp() {
		const lines = cart.map(c => `- ${c.name} (${c.qty} bks) Rp ${formatCurrency(c.price * c.qty)}`).join('\n');
		const msg = `Halo ${STORE_NAME}!\n\nPesanan saya:\n${lines}\n\nTotal: Rp ${formatCurrency(cartTotal)}\n\nMohon info stok dan ongkir. Terima kasih!`;
		window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
	}

	let customerName = $state('');
	let customerCity = $state('');
	let orderNotes = $state('');
	let selectedQuickProduct = $state('');

	function handleQuickOrderSubmit(e: Event) {
		e.preventDefault();
		const name = customerName.trim() || 'Pelanggan';
		const city = customerCity.trim() || '-';
		const item = selectedQuickProduct.trim() || 'Oleh-oleh Khas Bangka';
		const notes = orderNotes.trim() ? `\nCatatan: ${orderNotes.trim()}` : '';
		const msg = `Halo ${STORE_NAME}!\n\nNama: *${name}*\nKota: *${city}*\nProduk: *${item}*${notes}\n\nMohon info ketersediaan, total dan ongkir. Terima kasih!`;
		window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
	}

	function formatCurrency(val: number) { return new Intl.NumberFormat('id-ID').format(val); }
	function productWaLink(name: string, price: number) {
		const msg = `Halo ${STORE_NAME}, saya mau pesan *${name}* (Rp ${formatCurrency(price)}). Apakah tersedia?`;
		return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(msg)}`;
	}

	const testimonials = [
		{ name: 'Ibu Ratna Hendrawan', city: 'Jakarta Selatan', review: 'Getasnya bener-bener renyah empuk, ikannya kerasa banget. Anak-anak doyan banget. Langganan terus kalau ke Poris!', stars: 5, product: 'Getas Bulat Tiga Roda' },
		{ name: 'Bpk. Hendra Wijaya', city: 'Surabaya', review: 'Kemplang panggangnya wangi arang khas Bangka, sambal terasinya mantap. Kirim ke Surabaya packing rapi, tidak ada yang hancur.', stars: 5, product: 'Kemplang Panggang Cap MM' },
		{ name: 'Ci Meyling', city: 'Tangerang', review: 'Sudah langganan bertahun-tahun. Kalau mau kirim hampers ke kerabat pasti belinya di sini. Kualitas ikannya selalu konsisten juara!', stars: 5, product: 'Hampers Kerupuk dan Getas' },
		{ name: 'Ibu Dian Pratiwi', city: 'Bandung', review: 'Terasi Bangka No. 1 dan Sambal Rusip-nya otentik banget! Aromanya wangi bikin masakan kangkung terasi langsung mirip di Belitung asli.', stars: 5, product: 'Terasi AB No. 1 Bangka' }
	];
</script>

<svelte:head>
	<title>Toko Aneka Rasa 99 | Pusat Kemplang dan Oleh-Oleh Khas Bangka di Poris Tangerang</title>
	<meta name="description" content="Toko Aneka Rasa 99: Pusat Kemplang Panggang, Getas Ikan Tenggiri Asli Bangka, Kerupuk Pasir, Terasi AB, dan Oleh-Oleh Khas Bangka Belitung di Poris Indah Tangerang. Renyah, gurih, halal, siap kirim ke seluruh Indonesia." />
	<meta name="keywords" content="toko aneka rasa 99, kemplang bangka tangerang, getas tenggiri poris indah, oleh oleh khas bangka tangerang, kemplang panggang cipondoh" />
	<meta name="author" content="Toko Aneka Rasa 99" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="https://tokoanekarasa99.my.id/" />
	<meta property="og:locale" content="id_ID" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Toko Aneka Rasa 99 | Pusat Kemplang dan Oleh-Oleh Khas Bangka di Poris Tangerang" />
	<meta property="og:description" content="Pusat Kemplang Panggang, Getas Ikan Tenggiri Asli Bangka, Terasi dan Aneka Cemilan Khas Bangka di Poris Indah Tangerang." />
	<meta property="og:url" content="https://tokoanekarasa99.my.id/" />
	<meta property="og:site_name" content="Toko Aneka Rasa 99" />
	<meta property="og:image" content="https://tokoanekarasa99.my.id/logo.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Toko Aneka Rasa 99 | Pusat Kemplang dan Oleh-Oleh Khas Bangka" />
	<meta name="twitter:image" content="https://tokoanekarasa99.my.id/logo.png" />
	<meta name="geo.region" content="ID-BT" />
	<meta name="geo.placename" content="Kota Tangerang" />
	<meta name="geo.position" content="-6.1783;106.6713" />
	<meta name="ICBM" content="-6.1783, 106.6713" />
	{@html `<script type="application/ld+json">{"@context":"https://schema.org","@type":["Store","LocalBusiness"],"name":"Toko Aneka Rasa 99","url":"https://tokoanekarasa99.my.id","telephone":"+6281387109586","address":{"@type":"PostalAddress","streetAddress":"Jl. Raya Poris Indah, RT.007/RW.010, Kel. Cipondoh Indah","addressLocality":"Kota Tangerang","addressRegion":"Banten","postalCode":"15122","addressCountry":"ID"},"geo":{"@type":"GeoCoordinates","latitude":-6.1783,"longitude":106.6713},"openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],"opens":"07:30","closes":"21:30"}],"aggregateRating":{"@type":"AggregateRating","ratingValue":"4.9","reviewCount":"128"}}<\/script>`}
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen font-['Plus_Jakarta_Sans',sans-serif] bg-[#FFFDF9] text-gray-800 w-full max-w-full overflow-x-hidden">

	<!-- ===== FLOATING WHATSAPP BUTTON (ROUND FLOATING / MENGGANTUNG UNTUK SEMUA LAYAR) ===== -->
	{#if !cartOpen}
	<a
		href="https://wa.me/{WA_PHONE}?text={encodeURIComponent('Halo Toko Aneka Rasa 99, saya ingin tanya dan pesan oleh-oleh khas Bangka.')}"
		target="_blank"
		rel="noopener noreferrer"
		class="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-4 sm:bottom-6 sm:right-6 z-50 group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 ring-4 ring-white/90 shrink-0"
		aria-label="Hubungi WhatsApp Toko Aneka Rasa 99"
	>
		<!-- Pulse Ping Animation Effect -->
		<span class="absolute -inset-1 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none"></span>

		<!-- Official Real WhatsApp Icon -->
		<svg class="w-7 h-7 sm:w-8 sm:h-8 fill-current relative z-10 shrink-0" viewBox="0 0 24 24">
			<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
		</svg>

		<!-- Tooltip on hover (desktop) -->
		<span class="hidden sm:inline-block absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
			Chat WhatsApp Kami
		</span>
	</a>
	{/if}

	<!-- ===== MINI CART PANEL ===== -->
	{#if cartOpen && cart.length > 0}
	<div class="fixed inset-x-0 bottom-0 md:left-auto md:right-6 md:bottom-6 md:w-96 z-50 bg-white rounded-t-3xl md:rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[85vh] w-full md:max-w-md pb-[env(safe-area-inset-bottom,0px)]">
		<div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-red-600 rounded-t-2xl text-white shrink-0">
			<div class="flex items-center gap-2 font-bold min-w-0">
				<ShoppingCart class="w-5 h-5 shrink-0" />
				<span class="truncate">Keranjang ({cartCount} item)</span>
			</div>
			<button onclick={() => cartOpen = false} class="p-1 hover:bg-red-700 rounded-full transition cursor-pointer shrink-0" aria-label="Tutup Keranjang"><X class="w-5 h-5" /></button>
		</div>
		<div class="overflow-y-auto flex-1 px-3 sm:px-4 py-2 divide-y divide-gray-100">
			{#each cart as item}
			<div class="flex items-center gap-2.5 sm:gap-3 py-3 min-w-0">
				<img src={item.image} alt={item.name} class="w-11 h-11 rounded-lg object-cover border border-amber-100 shadow-2xs shrink-0" />
				<div class="flex-1 min-w-0">
					<p class="font-semibold text-xs sm:text-sm text-gray-800 truncate">{item.name}</p>
					<p class="text-[11px] sm:text-xs text-gray-500">Rp {formatCurrency(item.price)} / bks</p>
				</div>
				<div class="flex items-center gap-1 shrink-0">
					<button onclick={() => changeQty(item.id, -1)} class="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition cursor-pointer" aria-label="Kurangi Qty"><Minus class="w-3 h-3" /></button>
					<span class="w-5 sm:w-6 text-center text-xs sm:text-sm font-bold">{item.qty}</span>
					<button onclick={() => changeQty(item.id, 1)} class="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition cursor-pointer" aria-label="Tambah Qty"><Plus class="w-3 h-3" /></button>
				</div>
				<div class="text-right shrink-0">
					<p class="font-bold text-xs sm:text-sm text-red-600">Rp {formatCurrency(item.price * item.qty)}</p>
					<button onclick={() => removeFromCart(item.id)} class="text-[10px] sm:text-xs text-gray-400 hover:text-red-500 flex items-center gap-0.5 mt-0.5 ml-auto cursor-pointer"><Trash2 class="w-3 h-3" />Hapus</button>
				</div>
			</div>
			{/each}
		</div>
		<div class="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl shrink-0">
			<div class="flex justify-between items-center mb-3">
				<span class="text-gray-600 text-sm">Total</span>
				<span class="font-black text-base sm:text-lg text-red-600">Rp {formatCurrency(cartTotal)}</span>
			</div>
			<button onclick={checkoutWhatsApp} class="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition text-sm cursor-pointer active:scale-98">
				<svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
				<span>Pesan via WhatsApp</span>
			</button>
		</div>
	</div>
	{/if}

	<!-- ===== STICKY NAVBAR ===== -->
	<header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs w-full max-w-full">
		<nav class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<!-- Brand -->
				<a href="/" class="flex items-center gap-2 sm:gap-2.5 group min-w-0">
					<img src="/logo.png" alt="Toko Aneka Rasa 99" class="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs group-hover:scale-105 transition-transform shrink-0" />
					<div class="min-w-0">
						<p class="font-black text-gray-900 text-sm leading-tight truncate">Toko Aneka Rasa 99</p>
						<p class="text-[11px] text-red-600 font-semibold truncate hidden xs:block">Kemplang & Oleh-Oleh Bangka</p>
					</div>
				</a>

				<!-- Desktop nav links -->
				<div class="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
					<a href="#produk" class="hover:text-red-600 transition">Produk</a>
					<a href="#keunggulan" class="hover:text-red-600 transition">Keunggulan</a>
					<a href="#cara-pesan" class="hover:text-red-600 transition">Cara Pesan</a>
					<a href="#testimoni" class="hover:text-red-600 transition">Testimoni</a>
					<a href="#kontak" class="hover:text-red-600 transition">Kontak</a>
					<a href="/pos" class="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-xs transition"><User class="w-3.5 h-3.5" />Kasir</a>
				</div>

				<!-- Right CTAs -->
				<div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
					<!-- Cart button (visible on BOTH mobile & desktop when items > 0) -->
					{#if cartCount > 0}
					<button
						onclick={() => cartOpen = !cartOpen}
						class="relative flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition cursor-pointer shrink-0"
						aria-label="Keranjang Belanja"
					>
						<ShoppingCart class="w-5 h-5" />
						<span class="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">{cartCount}</span>
					</button>
					{/if}

					<!-- Desktop Cart button when empty -->
					{#if cartCount === 0}
					<button
						onclick={() => cartOpen = !cartOpen}
						class="relative hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-sm font-semibold text-gray-700 cursor-pointer"
					>
						<ShoppingCart class="w-4 h-4" />
						<span>Keranjang</span>
					</button>
					{/if}

					<!-- Desktop WA button -->
					<a
						href="https://wa.me/{WA_PHONE}"
						target="_blank"
						rel="noopener noreferrer"
						class="hidden md:flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm"
					>
						<svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
						<span>Pesan via WhatsApp</span>
					</a>

					<!-- Mobile hamburger -->
					<button onclick={() => mobileMenuOpen = !mobileMenuOpen} class="md:hidden p-2 rounded-xl hover:bg-gray-100 transition text-gray-600 cursor-pointer shrink-0" aria-label="Menu">
						{#if mobileMenuOpen}<X class="w-6 h-6" />{:else}<Menu class="w-6 h-6" />{/if}
					</button>
				</div>
			</div>

			<!-- Mobile Menu Dropdown -->
			{#if mobileMenuOpen}
			<div class="md:hidden pb-5 border-t border-gray-100 pt-3 flex flex-col gap-1 animate-in slide-in-from-top-2 duration-150 w-full">
				<a href="#produk" onclick={() => mobileMenuOpen = false} class="px-3 py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:text-red-600 transition text-sm flex items-center justify-between">
					<span>Produk Unggulan</span>
					<ChevronRight class="w-4 h-4 text-gray-400 shrink-0" />
				</a>
				<a href="#keunggulan" onclick={() => mobileMenuOpen = false} class="px-3 py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:text-red-600 transition text-sm flex items-center justify-between">
					<span>Keunggulan Kami</span>
					<ChevronRight class="w-4 h-4 text-gray-400 shrink-0" />
				</a>
				<a href="#cara-pesan" onclick={() => mobileMenuOpen = false} class="px-3 py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:text-red-600 transition text-sm flex items-center justify-between">
					<span>Cara Pesan</span>
					<ChevronRight class="w-4 h-4 text-gray-400 shrink-0" />
				</a>
				<a href="#testimoni" onclick={() => mobileMenuOpen = false} class="px-3 py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:text-red-600 transition text-sm flex items-center justify-between">
					<span>Testimoni Pelanggan</span>
					<ChevronRight class="w-4 h-4 text-gray-400 shrink-0" />
				</a>
				<a href="#kontak" onclick={() => mobileMenuOpen = false} class="px-3 py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:text-red-600 transition text-sm flex items-center justify-between">
					<span>Lokasi & Kontak Toko</span>
					<ChevronRight class="w-4 h-4 text-gray-400 shrink-0" />
				</a>
				<a href="/pos" class="px-3 py-2.5 rounded-xl font-semibold text-gray-500 hover:bg-gray-50 transition text-xs flex items-center gap-1.5">
					<User class="w-4 h-4 text-gray-400 shrink-0" />
					<span>Portal Staf / Kasir</span>
				</a>
				<div class="pt-2 flex flex-col gap-2 w-full">
					<a href="https://wa.me/{WA_PHONE}" target="_blank" rel="noopener noreferrer" class="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-xs text-center w-full">
						<svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
						<span>Pesan via WhatsApp</span>
					</a>
					<a href="https://shopee.co.id/tokoanekarasa99" target="_blank" rel="noopener noreferrer" class="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-xs text-center w-full">
						<ShoppingBag class="w-4 h-4 shrink-0" />
						<span>Buka Toko di Shopee</span>
					</a>
				</div>
			</div>
			{/if}
		</nav>
	</header>

	<!-- ===== HERO SECTION ===== -->
	<section class="relative overflow-hidden w-full max-w-full isolate bg-gradient-to-br from-[#FFF8F0] via-[#FFFDF9] to-[#FFF1E6] pt-6 pb-12 sm:pt-14 sm:pb-20 md:pt-20 md:pb-28">
		<!-- Decorative blobs (strictly contained) -->
		<div class="absolute -top-16 -left-16 w-64 h-64 sm:w-80 sm:h-80 bg-red-100/70 rounded-full mix-blend-multiply blur-3xl opacity-40 pointer-events-none"></div>
		<div class="absolute -bottom-16 -right-16 w-64 h-64 sm:w-96 sm:h-96 bg-amber-100/70 rounded-full mix-blend-multiply blur-3xl opacity-40 pointer-events-none"></div>

		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
			<div class="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
				<!-- Left: copy -->
				<div class="text-center lg:text-left min-w-0">
					<h1 class="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.2] sm:leading-tight mb-3 sm:mb-5 tracking-tight break-words">
						Kemplang & Oleh-Oleh<br />
						<span class="text-red-600">Khas Bangka</span><br />
						<span class="text-amber-500">Renyah & Asli</span>
					</h1>
					<p class="text-xs sm:text-base lg:text-lg text-gray-600 mb-5 sm:mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0 break-words">
						Pusat Kemplang Panggang, Getas Ikan Tenggiri, Terasi Asli, dan ratusan oleh-oleh khas Bangka Belitung terbaik. Tersedia di Poris Indah, Tangerang — siap kirim ke seluruh Indonesia.
					</p>
					<!-- CTA buttons -->
					<div class="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-5 sm:mb-8 justify-center lg:justify-start w-full">
						<a
							href="https://wa.me/{WA_PHONE}"
							target="_blank"
							rel="noopener noreferrer"
							class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-5 sm:px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm active:scale-98 text-center"
						>
							<svg class="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
							<span>Pesan via WhatsApp</span>
						</a>
						<a
							href="#produk"
							class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border-2 border-red-200 hover:border-red-400 text-red-600 font-bold px-5 sm:px-6 py-3.5 rounded-xl transition text-sm active:scale-98 text-center"
						>
							<span>Lihat Produk</span>
							<ChevronRight class="w-4 h-4 shrink-0" />
						</a>
					</div>
					<!-- Trust strip -->
					<div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 text-xs font-semibold text-gray-600 text-left">
						<div class="flex items-center gap-1.5 bg-white/90 px-2.5 py-2 sm:p-0 rounded-lg border sm:border-0 border-gray-100 shadow-xs sm:shadow-none min-w-0">
							<ShieldCheck class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0" />
							<span class="text-[11px] sm:text-xs font-bold text-gray-700 truncate">Produk Halal</span>
						</div>
						<div class="flex items-center gap-1.5 bg-white/90 px-2.5 py-2 sm:p-0 rounded-lg border sm:border-0 border-gray-100 shadow-xs sm:shadow-none min-w-0">
							<Truck class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 shrink-0" />
							<span class="text-[11px] sm:text-xs font-bold text-gray-700 truncate">Kirim Nasional</span>
						</div>
						<div class="flex items-center gap-1.5 bg-white/90 px-2.5 py-2 sm:p-0 rounded-lg border sm:border-0 border-gray-100 shadow-xs sm:shadow-none min-w-0">
							<Award class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
							<span class="text-[11px] sm:text-xs font-bold text-gray-700 truncate">Mutu Terjamin</span>
						</div>
						<div class="flex items-center gap-1.5 bg-white/90 px-2.5 py-2 sm:p-0 rounded-lg border sm:border-0 border-gray-100 shadow-xs sm:shadow-none min-w-0">
							<Star class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400 shrink-0" />
							<span class="text-[11px] sm:text-xs font-bold text-gray-700 truncate">4.9★ (128 ulasan)</span>
						</div>
					</div>
				</div>

				<!-- Right: hero card with 3 best sellers -->
				<div class="relative mt-2 lg:mt-0 w-full max-w-full">
					<div class="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-3.5 sm:p-6 w-full max-w-full">
						<div class="flex items-center justify-between gap-2 mb-3">
							<div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
								<span class="text-lg sm:text-xl shrink-0">🏆</span>
								<h2 class="font-black text-gray-800 text-sm sm:text-lg truncate">3 Produk Terlaris</h2>
							</div>
							<span class="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">Favorit</span>
						</div>
						<div class="space-y-2 sm:space-y-3">
							{#each FEATURED.slice(0, 3) as item, i}
							<div class="flex items-center gap-2.5 sm:gap-4 p-2 sm:p-3 rounded-xl {i === 0 ? 'bg-red-50/80 border border-red-100' : 'bg-gray-50'} min-w-0">
								<img src={item.image} alt={item.name} class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-amber-100 shadow-xs shrink-0" />
								<div class="flex-1 min-w-0">
									<p class="font-bold text-xs sm:text-sm text-gray-800 truncate">{item.name}</p>
									<p class="text-[10px] sm:text-xs text-gray-500">Rp {formatCurrency(item.price)}</p>
								</div>
								<button
									onclick={() => addToCart(item)}
									class="shrink-0 bg-red-600 hover:bg-red-700 text-white text-[11px] sm:text-xs font-bold px-2 sm:px-3 py-1.5 rounded-lg transition flex items-center gap-1 active:scale-95 cursor-pointer"
								>
									<Plus class="w-3 h-3 shrink-0" />Tambah
								</button>
							</div>
							{/each}
						</div>
						<a href="#produk" class="mt-3 flex items-center justify-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 transition">
							Lihat Semua Produk <ArrowRight class="w-3.5 h-3.5 shrink-0" />
						</a>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ===== KEUNGGULAN SECTION ===== -->
	<section class="py-12 sm:py-16 md:py-20 bg-white overflow-hidden w-full max-w-full" id="keunggulan">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-8 sm:mb-12">
				<span class="inline-block bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-100 mb-2 sm:mb-3">Mengapa Kami?</span>
				<h2 class="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 sm:mb-3">4 Alasan Pilih <span class="text-red-600">Toko Aneka Rasa 99</span></h2>
				<p class="text-gray-500 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">Kami bukan sekadar toko — kami adalah jembatan cita rasa asli Bangka Belitung untuk Anda di manapun berada.</p>
			</div>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 mb-8 sm:mb-14">
				<div class="bg-gradient-to-br from-red-50 to-red-100 border border-red-100 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-center hover:shadow-md transition min-w-0">
					<div class="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-2.5 sm:mb-3 shadow"><ShieldCheck class="w-5 h-5 sm:w-6 sm:h-6 text-white" /></div>
					<h3 class="font-black text-gray-800 text-xs sm:text-sm mb-1 truncate">Asli & Halal</h3>
					<p class="text-[11px] sm:text-xs text-gray-500 leading-snug sm:leading-relaxed">Produk asli tanpa pengawet berbahaya, terjamin halal</p>
				</div>
				<div class="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-center hover:shadow-md transition min-w-0">
					<div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2.5 sm:mb-3 shadow"><Truck class="w-5 h-5 sm:w-6 sm:h-6 text-white" /></div>
					<h3 class="font-black text-gray-800 text-xs sm:text-sm mb-1 truncate">Kirim Nasional</h3>
					<p class="text-[11px] sm:text-xs text-gray-500 leading-snug sm:leading-relaxed">Packing aman, kirim ke seluruh pelosok Indonesia</p>
				</div>
				<div class="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-100 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-center hover:shadow-md transition min-w-0">
					<div class="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-2.5 sm:mb-3 shadow"><Award class="w-5 h-5 sm:w-6 sm:h-6 text-white" /></div>
					<h3 class="font-black text-gray-800 text-xs sm:text-sm mb-1 truncate">Kualitas Premium</h3>
					<p class="text-[11px] sm:text-xs text-gray-500 leading-snug sm:leading-relaxed">Ikan tenggiri segar pilihan, diproses secara tradisional</p>
				</div>
				<div class="bg-gradient-to-br from-green-50 to-green-100 border border-green-100 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 text-center hover:shadow-md transition min-w-0">
					<div class="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-2.5 sm:mb-3 shadow"><ThumbsUp class="w-5 h-5 sm:w-6 sm:h-6 text-white" /></div>
					<h3 class="font-black text-gray-800 text-xs sm:text-sm mb-1 truncate">Langganan Setia</h3>
					<p class="text-[11px] sm:text-xs text-gray-500 leading-snug sm:leading-relaxed">Ribuan pelanggan puas dari Tangerang hingga luar negeri</p>
				</div>
			</div>
			<!-- Stats counter -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
				<div class="text-center">
					<p class="text-2xl sm:text-4xl font-black text-red-600 mb-0.5 sm:mb-1">500+</p>
					<p class="text-[11px] sm:text-xs text-gray-500 font-semibold">Jenis Produk Tersedia</p>
				</div>
				<div class="text-center">
					<p class="text-2xl sm:text-4xl font-black text-red-600 mb-0.5 sm:mb-1">15+</p>
					<p class="text-[11px] sm:text-xs text-gray-500 font-semibold">Tahun Berpengalaman</p>
				</div>
				<div class="text-center">
					<p class="text-2xl sm:text-4xl font-black text-red-600 mb-0.5 sm:mb-1">10K+</p>
					<p class="text-[11px] sm:text-xs text-gray-500 font-semibold">Pelanggan Puas</p>
				</div>
				<div class="text-center">
					<p class="text-2xl sm:text-4xl font-black text-red-600 mb-0.5 sm:mb-1">4.9★</p>
					<p class="text-[11px] sm:text-xs text-gray-500 font-semibold">Rating Rata-Rata</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ===== PRODUK SECTION ===== -->
	<section class="py-12 sm:py-16 md:py-20 bg-[#FFFDF9] overflow-hidden w-full max-w-full" id="produk">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-8 sm:mb-12">
				<span class="inline-block bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-100 mb-2 sm:mb-3">Pilihan Terbaik</span>
				<h2 class="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 sm:mb-3">Produk <span class="text-red-600">Unggulan</span> Kami</h2>
				<p class="text-gray-500 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">Kemplang, getas, terasi, dan aneka camilan khas Bangka Belitung yang sudah terbukti lezat dan berkualitas.</p>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
				{#each FEATURED as product}
				<div class="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden flex flex-col min-w-0">
					<!-- Product Image Area -->
					<div class="h-44 sm:h-48 bg-gradient-to-br from-amber-50/60 to-red-50/60 overflow-hidden relative group/img">
						<img
							src={product.image}
							alt={product.name}
							class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
							loading="lazy"
						/>
						<span class="absolute top-2.5 right-2.5 bg-red-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">{product.badge}</span>
					</div>
					<!-- Content -->
					<div class="p-3.5 sm:p-4 flex flex-col flex-1 min-w-0">
						<h3 class="font-black text-gray-800 text-sm mb-1.5 leading-tight break-words">{product.name}</h3>
						<p class="text-xs text-gray-500 leading-relaxed mb-3 flex-1">{product.desc}</p>
						<div class="flex items-center justify-between mb-3">
							<p class="font-black text-red-600 text-base">Rp {formatCurrency(product.price)}</p>
							<span class="text-xs text-gray-400">/ bungkus</span>
						</div>
						<!-- Action buttons -->
						<div class="grid grid-cols-2 gap-2 w-full">
							<a
								href={productWaLink(product.name, product.price)}
								target="_blank"
								rel="noopener noreferrer"
								class="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs w-full min-w-0"
							>
								<svg class="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
								<span class="truncate">WhatsApp</span>
							</a>
							<button
								onclick={() => addToCart(product)}
								class="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition w-full min-w-0 cursor-pointer"
							>
								<Plus class="w-3.5 h-3.5 shrink-0" />
								<span class="truncate">Keranjang</span>
							</button>
						</div>
					</div>
				</div>
				{/each}
			</div>

			<div class="mt-8 sm:mt-10 flex justify-center">
				<a
					href="https://shopee.co.id/tokoanekarasa99"
					target="_blank"
					rel="noopener noreferrer"
					class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#EE4D2D] hover:bg-[#d73211] text-white font-bold px-5 sm:px-8 py-3.5 rounded-xl transition shadow-md hover:shadow-lg text-xs sm:text-sm text-center active:scale-98"
				>
					<ShoppingBag class="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
					<span>Lihat Semua Produk di Shopee</span>
					<ExternalLink class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
				</a>
			</div>
		</div>
	</section>

	<!-- ===== CARA PESAN SECTION ===== -->
	<section class="py-12 sm:py-16 md:py-20 bg-white overflow-hidden w-full max-w-full" id="cara-pesan">
		<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-8 sm:mb-12">
				<span class="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-100 mb-2 sm:mb-3">Mudah & Cepat</span>
				<h2 class="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 sm:mb-3">Cara <span class="text-red-600">Pesan</span></h2>
				<p class="text-gray-500 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed">Pesan oleh-oleh khas Bangka dengan mudah, hanya dalam 3 langkah!</p>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
				<div class="text-center relative min-w-0">
					<div class="w-12 h-12 sm:w-14 sm:h-14 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
						<span class="text-white font-black text-lg sm:text-xl">1</span>
					</div>
					<h3 class="font-black text-gray-800 text-base mb-1.5">Pilih Produk</h3>
					<p class="text-xs sm:text-sm text-gray-500 leading-relaxed">Lihat katalog produk unggulan kami. Tambahkan ke keranjang atau langsung tanya via WhatsApp.</p>
					<!-- Connector only on desktop md+ -->
					<div class="hidden md:block absolute top-7 left-[calc(50%+2rem)] w-full h-0.5 bg-gradient-to-r from-red-200 to-red-100"></div>
				</div>
				<div class="text-center relative min-w-0">
					<div class="w-12 h-12 sm:w-14 sm:h-14 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
						<span class="text-white font-black text-lg sm:text-xl">2</span>
					</div>
					<h3 class="font-black text-gray-800 text-base mb-1.5">Chat WhatsApp</h3>
					<p class="text-xs sm:text-sm text-gray-500 leading-relaxed">Kirim pesanan via WhatsApp. Konfirmasi stok, harga, dan ongkir bersama kami langsung.</p>
					<div class="hidden md:block absolute top-7 left-[calc(50%+2rem)] w-full h-0.5 bg-gradient-to-r from-amber-200 to-amber-100"></div>
				</div>
				<div class="text-center min-w-0">
					<div class="w-12 h-12 sm:w-14 sm:h-14 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
						<span class="text-white font-black text-lg sm:text-xl">3</span>
					</div>
					<h3 class="font-black text-gray-800 text-base mb-1.5">Terima Pesanan</h3>
					<p class="text-xs sm:text-sm text-gray-500 leading-relaxed">Bayar & pesanan dikemas rapi. Ambil langsung di toko atau kami kirimkan ke alamat Anda.</p>
				</div>
			</div>
			<div class="mt-8 sm:mt-10 flex justify-center">
				<a
					href="https://wa.me/{WA_PHONE}"
					target="_blank"
					rel="noopener noreferrer"
					class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm sm:text-base text-center"
				>
					<svg class="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
					<span>Mulai Pesan Sekarang</span>
					<ArrowRight class="w-4 h-4 shrink-0" />
				</a>
			</div>
		</div>
	</section>

	<!-- ===== TESTIMONI SECTION ===== -->
	<section class="py-12 sm:py-16 md:py-20 bg-[#FFFDF9] overflow-hidden w-full max-w-full" id="testimoni">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-8 sm:mb-12">
				<span class="inline-block bg-yellow-50 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full border border-yellow-100 mb-2 sm:mb-3">Kata Pelanggan</span>
				<h2 class="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 sm:mb-3">Ribuan Pelanggan <span class="text-red-600">Sudah Puas</span></h2>
				<p class="text-gray-500 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">Kepuasan pelanggan adalah prioritas utama kami. Ini kata mereka tentang Toko Aneka Rasa 99.</p>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
				{#each testimonials as t}
				<div class="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 sm:p-6 hover:shadow-md transition min-w-0">
					<div class="flex items-center gap-1 mb-2.5 sm:mb-3">
						{#each { length: t.stars } as _}
						<Star class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400 shrink-0" />
						{/each}
					</div>
					<p class="text-gray-700 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 italic break-words">"{t.review}"</p>
					<div class="flex items-center gap-2.5 sm:gap-3">
						<div class="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shrink-0">
							<User class="w-4 h-4 text-red-600" />
						</div>
						<div class="flex-1 min-w-0">
							<p class="font-bold text-gray-800 text-xs sm:text-sm truncate">{t.name}</p>
							<p class="text-[11px] sm:text-xs text-gray-400 truncate">{t.city} · {t.product}</p>
						</div>
					</div>
				</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- ===== KONTAK SECTION ===== -->
	<section class="py-12 sm:py-16 md:py-20 bg-white overflow-hidden w-full max-w-full" id="kontak">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-8 sm:mb-12">
				<span class="inline-block bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-100 mb-2 sm:mb-3">Hubungi Kami</span>
				<h2 class="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 sm:mb-3">Temukan & <span class="text-red-600">Hubungi</span> Kami</h2>
				<p class="text-gray-500 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">Kunjungi toko kami di Poris Indah Tangerang, atau hubungi via WhatsApp untuk pemesanan dan informasi produk.</p>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
				<!-- Left: contact info + map -->
				<div class="space-y-4 sm:space-y-5 min-w-0">
					<div class="flex items-start gap-3 sm:gap-4 p-3.5 sm:p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-xs transition min-w-0">
						<div class="w-9 h-9 sm:w-10 sm:h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0"><MapPin class="w-4 h-4 sm:w-5 sm:h-5 text-red-600" /></div>
						<div class="flex-1 min-w-0">
							<p class="font-bold text-gray-800 text-xs sm:text-sm mb-0.5">Alamat Toko</p>
							<p class="text-xs sm:text-sm text-gray-600 leading-relaxed break-words">{STORE_ADDRESS}</p>
							<a
								href="https://www.google.com/maps/search/?api=1&query=TOKO+ANEKA+RASA+99,+Jl.+Raya+Poris+Indah,+RT.007/RW.010,+Cipondoh+Indah,+Cipondoh,+Tangerang+City,+Banten+15122"
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition mt-2.5"
							>
								<MapPin class="w-3.5 h-3.5" />
								<span>Buka Petunjuk Arah di Google Maps</span>
								<ExternalLink class="w-3 h-3 ml-0.5" />
							</a>
						</div>
					</div>
					<div class="flex items-start gap-3 sm:gap-4 p-3.5 sm:p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-xs transition min-w-0">
						<div class="w-9 h-9 sm:w-10 sm:h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0"><Phone class="w-4 h-4 sm:w-5 sm:h-5 text-green-600" /></div>
						<div class="flex-1 min-w-0">
							<p class="font-bold text-gray-800 text-xs sm:text-sm mb-0.5">WhatsApp / Telepon</p>
							<a href="https://wa.me/{WA_PHONE}" target="_blank" rel="noopener noreferrer" class="text-green-600 font-bold text-xs sm:text-sm hover:underline">+62 813-8710-9586</a>
						</div>
					</div>
					<div class="flex items-start gap-3 sm:gap-4 p-3.5 sm:p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-xs transition min-w-0">
						<div class="w-9 h-9 sm:w-10 sm:h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0"><Clock class="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" /></div>
						<div class="flex-1 min-w-0">
							<p class="font-bold text-gray-800 text-xs sm:text-sm mb-0.5">Jam Operasional</p>
							<p class="text-xs sm:text-sm text-gray-600">{STORE_HOURS}</p>
						</div>
					</div>
					<!-- Banner Toko Fisik -->
					<div class="rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative group bg-white">
						<img
							src="/images/banner-toko.png"
							alt="Spanduk Toko Aneka Rasa 99"
							class="w-full h-auto object-cover group-hover:scale-[1.01] transition-transform duration-300"
							loading="lazy"
						/>
						<div class="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
							<span class="font-bold text-gray-800 flex items-center gap-1.5">
								<MapPin class="w-3.5 h-3.5 text-red-600 shrink-0" />
								Kios Toko Aneka Rasa 99 - Poris Indah
							</span>
							<span class="text-gray-400 text-[11px] shrink-0">Kios Resmi</span>
						</div>
					</div>
					<!-- Google Maps embed -->
					<div class="rounded-2xl overflow-hidden border border-gray-200 shadow-sm w-full max-w-full aspect-video sm:aspect-auto sm:h-[220px]">
						<iframe
							src="https://maps.google.com/maps?q=TOKO+ANEKA+RASA+99,+Jl.+Raya+Poris+Indah,+RT.007/RW.010,+Cipondoh+Indah,+Cipondoh,+Tangerang+City,+Banten+15122&t=&z=16&ie=UTF8&iwloc=&output=embed"
							width="100%"
							height="100%"
							style="border:0;"
							allowfullscreen={true}
							loading="lazy"
							referrerpolicy="no-referrer-when-downgrade"
							title="Lokasi Toko Aneka Rasa 99"
							class="w-full h-full min-h-[200px]"
						></iframe>
					</div>
				</div>

				<!-- Right: Quick order form -->
				<div class="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl sm:rounded-3xl p-4 sm:p-7 text-white shadow-xl w-full max-w-full box-border">
					<div class="flex items-center gap-2 mb-4 sm:mb-6">
						<ShoppingBag class="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
						<h3 class="font-black text-base sm:text-xl">Form Pesan Cepat</h3>
					</div>
					<form onsubmit={handleQuickOrderSubmit} class="space-y-3 sm:space-y-4 w-full">
						<div>
							<label for="cname" class="block text-xs font-bold text-red-100 mb-1">Nama Anda</label>
							<input
								id="cname"
								type="text"
								bind:value={customerName}
								placeholder="Contoh: Ibu Sari"
								class="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/50 text-base focus:outline-none focus:ring-2 focus:ring-white/40 transition box-border"
							/>
						</div>
						<div>
							<label for="ccity" class="block text-xs font-bold text-red-100 mb-1">Kota Pengiriman</label>
							<input
								id="ccity"
								type="text"
								bind:value={customerCity}
								placeholder="Contoh: Jakarta Selatan"
								class="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/50 text-base focus:outline-none focus:ring-2 focus:ring-white/40 transition box-border"
							/>
						</div>
						<div>
							<label for="cprod" class="block text-xs font-bold text-red-100 mb-1">Produk yang Diminati</label>
							<select
								id="cprod"
								bind:value={selectedQuickProduct}
								class="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-white/15 border border-white/20 text-white text-base focus:outline-none focus:ring-2 focus:ring-white/40 transition appearance-none box-border"
							>
								<option value="" class="text-gray-800">-- Pilih Produk --</option>
								{#each FEATURED as p}
								<option value={p.name} class="text-gray-800">{p.name} - Rp {formatCurrency(p.price)}</option>
								{/each}
								<option value="Hampers / Paket Oleh-Oleh" class="text-gray-800">Hampers / Paket Oleh-Oleh</option>
								<option value="Lainnya (tanyakan via WA)" class="text-gray-800">Lainnya (tanyakan via WA)</option>
							</select>
						</div>
						<div>
							<label for="cnotes" class="block text-xs font-bold text-red-100 mb-1">Catatan Tambahan (Opsional)</label>
							<textarea
								id="cnotes"
								bind:value={orderNotes}
								rows={2}
								placeholder="Jumlah, variasi, atau permintaan khusus..."
								class="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/50 text-base focus:outline-none focus:ring-2 focus:ring-white/40 transition resize-none box-border"
							></textarea>
						</div>
						<button
							type="submit"
							class="w-full bg-white hover:bg-gray-50 text-emerald-700 font-black py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg text-sm cursor-pointer active:scale-98"
						>
							<svg class="w-5 h-5 fill-[#25D366] shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
							<span>Kirim Pesanan via WhatsApp</span>
						</button>
					</form>
					<p class="text-center text-red-100 text-xs mt-3 sm:mt-4 flex items-center justify-center gap-1">
						<CheckCircle2 class="w-3.5 h-3.5 shrink-0" />
						<span>Pesanan langsung diterima oleh admin toko</span>
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ===== FOOTER ===== -->
	<footer class="bg-gray-900 text-gray-400 pt-10 sm:pt-12 pb-8 overflow-hidden w-full max-w-full">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10">
				<!-- Brand -->
				<div class="min-w-0">
					<div class="flex items-center gap-2.5 mb-3 sm:mb-4">
						<img src="/logo.png" alt="Toko Aneka Rasa 99" class="w-10 h-10 rounded-full object-cover border border-slate-700 shadow-md shrink-0" />
						<div class="min-w-0">
							<p class="font-black text-white text-sm truncate">Toko Aneka Rasa 99</p>
							<p class="text-xs text-red-400 truncate">Kemplang & Oleh-Oleh Bangka</p>
						</div>
					</div>
					<p class="text-xs leading-relaxed mb-4 break-words">Pusat oleh-oleh khas Bangka Belitung terlengkap di Poris Indah, Tangerang. Kemplang, getas, terasi, dan ratusan produk pilihan.</p>
					<a
						href="https://wa.me/{WA_PHONE}"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition"
					>
						<MessageCircle class="w-3.5 h-3.5 shrink-0" />Chat WhatsApp
					</a>
				</div>

				<!-- Navigation -->
				<div>
					<h4 class="font-black text-white text-sm mb-3 sm:mb-4">Navigasi</h4>
					<ul class="space-y-2 text-sm">
						<li><a href="#produk" class="hover:text-white transition flex items-center gap-1.5"><ChevronRight class="w-3.5 h-3.5 text-red-400 shrink-0" />Produk Unggulan</a></li>
						<li><a href="#keunggulan" class="hover:text-white transition flex items-center gap-1.5"><ChevronRight class="w-3.5 h-3.5 text-red-400 shrink-0" />Keunggulan Kami</a></li>
						<li><a href="#cara-pesan" class="hover:text-white transition flex items-center gap-1.5"><ChevronRight class="w-3.5 h-3.5 text-red-400 shrink-0" />Cara Pesan</a></li>
						<li><a href="#testimoni" class="hover:text-white transition flex items-center gap-1.5"><ChevronRight class="w-3.5 h-3.5 text-red-400 shrink-0" />Testimoni</a></li>
						<li><a href="#kontak" class="hover:text-white transition flex items-center gap-1.5"><ChevronRight class="w-3.5 h-3.5 text-red-400 shrink-0" />Kontak & Lokasi</a></li>
						<li>
							<a href="/pos" class="hover:text-white transition flex items-center gap-1.5 opacity-50">
								<ChevronRight class="w-3.5 h-3.5 text-gray-500 shrink-0" />
								<User class="w-3 h-3 shrink-0" />Portal Kasir
							</a>
						</li>
					</ul>
				</div>

				<!-- Info -->
				<div class="min-w-0">
					<h4 class="font-black text-white text-sm mb-3 sm:mb-4">Info Toko</h4>
					<ul class="space-y-3 text-xs">
						<li class="flex items-start gap-2 min-w-0"><MapPin class="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" /><span class="break-words leading-relaxed">{STORE_ADDRESS}</span></li>
						<li class="flex items-center gap-2 min-w-0"><Clock class="w-3.5 h-3.5 text-amber-400 shrink-0" /><span class="break-words">{STORE_HOURS}</span></li>
						<li class="flex items-center gap-2 min-w-0"><Phone class="w-3.5 h-3.5 text-green-400 shrink-0" /><a href="https://wa.me/{WA_PHONE}" class="hover:text-white transition">+62 813-8710-9586</a></li>
					</ul>
				</div>
			</div>

			<div class="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-center sm:text-left">
				<p>© {new Date().getFullYear()} Toko Aneka Rasa 99. Semua Hak Dilindungi.</p>
				<div class="flex items-center gap-4">
					<a href="https://tokoanekarasa99.my.id/" class="hover:text-white transition">tokoanekarasa99.my.id</a>
					<a href="/pos" class="hover:text-white transition flex items-center gap-1 opacity-40"><ExternalLink class="w-3 h-3" />Kasir Portal</a>
				</div>
			</div>
		</div>
	</footer>

</div>
