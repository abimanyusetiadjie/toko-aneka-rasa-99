<script lang="ts">
	import type { PageData } from './$types';
	import {
		Phone, MapPin, Clock, Star, ShoppingBag, ShieldCheck,
		ChevronRight, Menu, X, ArrowRight, Truck, Award, Sparkles,
		MessageCircle, ExternalLink, User, ShoppingCart,
		Plus, Minus, Trash2, CheckCircle2, ThumbsUp, Package
	} from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const WA_PHONE = '6281387109586';
	const STORE_NAME = 'Toko Aneka Rasa 99';
	const STORE_ADDRESS = 'Perumahan Poris Indah Blok B 11 No. 1, RT 001/RW 005, Kel. Cipondoh Indah, Kec. Cipondoh, Kota Tangerang, Banten 15148';
	const STORE_HOURS = 'Buka Setiap Hari: 07.30 – 21.30 WIB';

	let mobileMenuOpen = $state(false);
	let cartOpen = $state(false);

	interface FeaturedProduct { id: string; name: string; desc: string; price: number; emoji: string; badge: string; }

	const FEATURED: FeaturedProduct[] = [
		{ id: 'fp1', name: 'Kemplang Panggang Cap MM', desc: 'Dipanggang di atas bara arang. Aroma asap harum, tekstur renyah di luar dan empuk di dalam. Disertai sambal terasi khas. Tanpa pengawet.', price: 37500, emoji: '🔥', badge: 'Terlaris' },
		{ id: 'fp2', name: 'Getas Bulat Cap Tiga Roda', desc: 'Getas bulat dari ikan tenggiri pilihan. Renyah, gurih, dan tidak terlalu asin. Cocok untuk camilan sehari-hari atau oleh-oleh.', price: 42500, emoji: '🐟', badge: 'Favorit' },
		{ id: 'fp3', name: 'Terasi AB No.1 Asli Bangka', desc: 'Terasi udang rebon super. Wangi khas, warna natural, tanpa pewarna. Langsung dari pengolahan tradisional Bangka.', price: 55000, emoji: '🌶️', badge: 'Original' },
		{ id: 'fp4', name: 'Kemplang Goreng Pasir Tjokro', desc: 'Kemplang goreng pasir dengan tekstur ekstra renyah. Rasa gurih ikan tenggiri yang kuat. Cocok dimakan langsung atau lauk.', price: 32000, emoji: '🟡', badge: 'Crispy' },
		{ id: 'fp5', name: 'Getas Amplang Ikan Tenggiri', desc: 'Camilan khas Bangka berbahan ikan tenggiri. Bentuk bulat, renyah, dan tahan lama. Favorit untuk dibawa pulang.', price: 25000, emoji: '🫙', badge: 'Hemat' },
		{ id: 'fp6', name: 'Kericu Keripik Telur Cumi', desc: 'Keripik dari telur cumi segar. Gurih, renyah, dan aroma cumi yang khas. Camilan premium khas Bangka.', price: 30000, emoji: '🦑', badge: 'Premium' },
		{ id: 'fp7', name: 'Lempok Cempedak', desc: 'Manisan cempedak tradisional. Manis legit, tekstur lembut, dibuat dengan resep turun-temurun.', price: 35000, emoji: '🍬', badge: 'Manis' },
		{ id: 'fp8', name: 'Kecap Asin Bangka Cap Siong', desc: 'Kecap asin khas Bangka. Rasa gurih dan pas untuk masakan sehari-hari maupun oleh-oleh.', price: 18000, emoji: '🫗', badge: 'Bumbu' }
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
	{@html `<script type="application/ld+json">{"@context":"https://schema.org","@type":["Store","LocalBusiness"],"name":"Toko Aneka Rasa 99","url":"https://tokoanekarasa99.my.id","telephone":"+6281387109586","address":{"@type":"PostalAddress","streetAddress":"Perumahan Poris Indah Blok B 11 No. 1, RT 001/RW 005, Kel. Cipondoh Indah","addressLocality":"Kota Tangerang","addressRegion":"Banten","postalCode":"15148","addressCountry":"ID"},"geo":{"@type":"GeoCoordinates","latitude":-6.1783,"longitude":106.6713},"openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],"opens":"07:30","closes":"21:30"}],"aggregateRating":{"@type":"AggregateRating","ratingValue":"4.9","reviewCount":"128"}}<\/script>`}
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen font-['Plus_Jakarta_Sans',sans-serif] bg-[#FFFDF9] text-gray-800">

	<!-- ===== FLOATING WA BUTTON (Mobile only) ===== -->
	<a
		href="https://wa.me/{WA_PHONE}"
		target="_blank"
		rel="noopener noreferrer"
		class="fixed bottom-6 right-5 z-50 md:hidden flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-3 rounded-full shadow-xl transition-all"
		aria-label="Chat WhatsApp"
	>
		<MessageCircle class="w-5 h-5" />
		<span class="text-sm">Chat WA</span>
	</a>

	<!-- ===== MINI CART PANEL ===== -->
	{#if cartOpen && cart.length > 0}
	<div class="fixed bottom-0 right-0 left-0 md:left-auto md:right-6 md:bottom-6 md:w-96 z-40 bg-white rounded-t-2xl md:rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[80vh]">
		<div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-red-600 rounded-t-2xl text-white">
			<div class="flex items-center gap-2 font-bold">
				<ShoppingCart class="w-5 h-5" />
				<span>Keranjang ({cartCount} item)</span>
			</div>
			<button onclick={() => cartOpen = false} class="p-1 hover:bg-red-700 rounded-full transition"><X class="w-5 h-5" /></button>
		</div>
		<div class="overflow-y-auto flex-1 px-4 py-2 divide-y divide-gray-100">
			{#each cart as item}
			<div class="flex items-center gap-3 py-3">
				<span class="text-2xl">{item.emoji}</span>
				<div class="flex-1 min-w-0">
					<p class="font-semibold text-sm text-gray-800 truncate">{item.name}</p>
					<p class="text-xs text-gray-500">Rp {formatCurrency(item.price)} / bks</p>
				</div>
				<div class="flex items-center gap-1">
					<button onclick={() => changeQty(item.id, -1)} class="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"><Minus class="w-3 h-3" /></button>
					<span class="w-6 text-center text-sm font-bold">{item.qty}</span>
					<button onclick={() => changeQty(item.id, 1)} class="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"><Plus class="w-3 h-3" /></button>
				</div>
				<div class="text-right">
					<p class="font-bold text-sm text-red-600">Rp {formatCurrency(item.price * item.qty)}</p>
					<button onclick={() => removeFromCart(item.id)} class="text-xs text-gray-400 hover:text-red-500 flex items-center gap-0.5 mt-0.5"><Trash2 class="w-3 h-3" />Hapus</button>
				</div>
			</div>
			{/each}
		</div>
		<div class="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
			<div class="flex justify-between items-center mb-3">
				<span class="text-gray-600 text-sm">Total</span>
				<span class="font-black text-lg text-red-600">Rp {formatCurrency(cartTotal)}</span>
			</div>
			<button onclick={checkoutWhatsApp} class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition text-sm">
				<MessageCircle class="w-4 h-4" />
				Pesan via WhatsApp
			</button>
		</div>
	</div>
	{/if}

	<!-- ===== STICKY NAVBAR ===== -->
	<header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
		<nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<!-- Brand -->
				<a href="/" class="flex items-center gap-2.5 group">
					<div class="w-9 h-9 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
						<ShoppingBag class="w-5 h-5 text-white" />
					</div>
					<div class="hidden sm:block">
						<p class="font-black text-gray-900 text-sm leading-tight">Toko Aneka Rasa 99</p>
						<p class="text-xs text-red-600 font-semibold">Kemplang & Oleh-Oleh Bangka</p>
					</div>
				</a>

				<!-- Desktop nav links -->
				<div class="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
					<a href="#produk" class="hover:text-red-600 transition">Produk</a>
					<a href="#testimoni" class="hover:text-red-600 transition">Testimoni</a>
					<a href="#kontak" class="hover:text-red-600 transition">Kontak</a>
					<a href="/pos" class="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-xs transition"><User class="w-3.5 h-3.5" />Kasir</a>
				</div>

				<!-- Right CTAs -->
				<div class="flex items-center gap-2">
					<!-- Cart button (desktop) -->
					<button
						onclick={() => cartOpen = !cartOpen}
						class="relative hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-sm font-semibold text-gray-700"
					>
						<ShoppingCart class="w-4 h-4" />
						<span>Keranjang</span>
						{#if cartCount > 0}
						<span class="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>
						{/if}
					</button>
					<a
						href="https://wa.me/{WA_PHONE}"
						target="_blank"
						rel="noopener noreferrer"
						class="hidden md:flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm"
					>
						<Phone class="w-4 h-4" />
						Pesan Sekarang
					</a>
					<!-- Mobile hamburger -->
					<button onclick={() => mobileMenuOpen = !mobileMenuOpen} class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition text-gray-600" aria-label="Menu">
						{#if mobileMenuOpen}<X class="w-5 h-5" />{:else}<Menu class="w-5 h-5" />{/if}
					</button>
				</div>
			</div>

			<!-- Mobile Menu -->
			{#if mobileMenuOpen}
			<div class="md:hidden pb-4 border-t border-gray-100 pt-3 flex flex-col gap-1">
				<a href="#produk" onclick={() => mobileMenuOpen = false} class="px-3 py-2.5 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 hover:text-red-600 transition text-sm">Produk</a>
				<a href="#testimoni" onclick={() => mobileMenuOpen = false} class="px-3 py-2.5 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 hover:text-red-600 transition text-sm">Testimoni</a>
				<a href="#kontak" onclick={() => mobileMenuOpen = false} class="px-3 py-2.5 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 hover:text-red-600 transition text-sm">Kontak</a>
				<a href="https://wa.me/{WA_PHONE}" target="_blank" rel="noopener noreferrer" class="mt-2 bg-green-500 text-white font-bold text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-2">
					<Phone class="w-4 h-4" /> Pesan via WhatsApp
				</a>
				{#if cartCount > 0}
				<button onclick={() => { cartOpen = true; mobileMenuOpen = false; }} class="mt-1 bg-red-600 text-white font-bold text-sm px-4 py-3 rounded-xl flex items-center justify-center gap-2">
					<ShoppingCart class="w-4 h-4" /> Keranjang ({cartCount})
				</button>
				{/if}
			</div>
			{/if}
		</nav>
	</header>

	<!-- ===== HERO SECTION ===== -->
	<section class="relative overflow-hidden bg-gradient-to-br from-[#FFF8F0] via-[#FFFDF9] to-[#FFF1E6] pt-14 pb-20 md:pt-20 md:pb-28">
		<!-- Decorative blobs -->
		<div class="absolute -top-20 -left-20 w-80 h-80 bg-red-100 rounded-full mix-blend-multiply blur-3xl opacity-40 pointer-events-none"></div>
		<div class="absolute -bottom-20 -right-20 w-96 h-96 bg-amber-100 rounded-full mix-blend-multiply blur-3xl opacity-40 pointer-events-none"></div>

		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
			<div class="grid lg:grid-cols-2 gap-12 items-center">
				<!-- Left: copy -->
				<div>
					<div class="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold mb-5 shadow-sm">
						<Sparkles class="w-3.5 h-3.5" />
						Oleh-Oleh Khas Bangka Belitung Terpercaya
					</div>
					<h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-5">
						Kemplang & Oleh-Oleh<br />
						<span class="text-red-600">Khas Bangka</span><br />
						<span class="text-amber-500">Renyah & Asli</span>
					</h1>
					<p class="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
						Pusat Kemplang Panggang, Getas Ikan Tenggiri, Terasi Asli, dan ratusan oleh-oleh khas Bangka Belitung terbaik. Tersedia di Poris Indah, Tangerang — siap kirim ke seluruh Indonesia.
					</p>
					<!-- CTA buttons -->
					<div class="flex flex-wrap gap-3 mb-8">
						<a
							href="https://wa.me/{WA_PHONE}"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition text-sm"
						>
							<MessageCircle class="w-5 h-5" />
							Pesan via WhatsApp
						</a>
						<a
							href="#produk"
							class="inline-flex items-center gap-2 bg-white border-2 border-red-200 hover:border-red-400 text-red-600 font-bold px-6 py-3.5 rounded-xl transition text-sm"
						>
							Lihat Produk
							<ChevronRight class="w-4 h-4" />
						</a>
					</div>
					<!-- Trust strip -->
					<div class="flex flex-wrap gap-4 text-xs font-semibold text-gray-500">
						<span class="flex items-center gap-1.5"><ShieldCheck class="w-4 h-4 text-green-500" />Produk Halal</span>
						<span class="flex items-center gap-1.5"><Truck class="w-4 h-4 text-blue-500" />Kirim Seluruh Indonesia</span>
						<span class="flex items-center gap-1.5"><Award class="w-4 h-4 text-amber-500" />Kualitas Terjamin</span>
						<span class="flex items-center gap-1.5"><Star class="w-4 h-4 text-yellow-400" />4.9★ (128 ulasan)</span>
					</div>
				</div>

				<!-- Right: hero card with 3 best sellers -->
				<div class="relative">
					<div class="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6">
						<div class="flex items-center gap-2 mb-4">
							<span class="text-xl">🏆</span>
							<h2 class="font-black text-gray-800 text-lg">3 Produk Terlaris</h2>
						</div>
						<div class="space-y-3">
							{#each FEATURED.slice(0, 3) as item, i}
							<div class="flex items-center gap-4 p-3 rounded-xl {i === 0 ? 'bg-red-50 border border-red-100' : 'bg-gray-50'}">
								<span class="text-3xl">{item.emoji}</span>
								<div class="flex-1 min-w-0">
									<p class="font-bold text-sm text-gray-800 truncate">{item.name}</p>
									<p class="text-xs text-gray-500">Rp {formatCurrency(item.price)} / bks</p>
								</div>
								<button
									onclick={() => addToCart(item)}
									class="shrink-0 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
								>
									<Plus class="w-3 h-3" />Tambah
								</button>
							</div>
							{/each}
						</div>
						<a href="#produk" class="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition">
							Lihat Semua Produk <ArrowRight class="w-3.5 h-3.5" />
						</a>
					</div>
					<!-- Floating badge -->
					<div class="absolute -top-3 -right-3 bg-amber-400 text-amber-900 text-xs font-black px-3 py-1.5 rounded-full shadow-lg rotate-3">
						✨ Stok Terbatas!
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ===== KEUNGGULAN SECTION ===== -->
	<section class="py-16 md:py-20 bg-white" id="keunggulan">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-12">
				<span class="inline-block bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-100 mb-3">Mengapa Kami?</span>
				<h2 class="text-3xl md:text-4xl font-black text-gray-900 mb-3">4 Alasan Pilih <span class="text-red-600">Toko Aneka Rasa 99</span></h2>
				<p class="text-gray-500 max-w-xl mx-auto text-sm">Kami bukan sekadar toko — kami adalah jembatan cita rasa asli Bangka Belitung untuk Anda di manapun berada.</p>
			</div>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-14">
				<div class="bg-gradient-to-br from-red-50 to-red-100 border border-red-100 rounded-2xl p-5 text-center hover:shadow-md transition">
					<div class="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow"><ShieldCheck class="w-6 h-6 text-white" /></div>
					<h3 class="font-black text-gray-800 text-sm mb-1">Asli & Halal</h3>
					<p class="text-xs text-gray-500 leading-relaxed">Produk asli tanpa pengawet berbahaya, terjamin halal</p>
				</div>
				<div class="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 rounded-2xl p-5 text-center hover:shadow-md transition">
					<div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow"><Truck class="w-6 h-6 text-white" /></div>
					<h3 class="font-black text-gray-800 text-sm mb-1">Kirim Nasional</h3>
					<p class="text-xs text-gray-500 leading-relaxed">Packing aman, kirim ke seluruh pelosok Indonesia</p>
				</div>
				<div class="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-100 rounded-2xl p-5 text-center hover:shadow-md transition">
					<div class="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow"><Award class="w-6 h-6 text-white" /></div>
					<h3 class="font-black text-gray-800 text-sm mb-1">Kualitas Premium</h3>
					<p class="text-xs text-gray-500 leading-relaxed">Ikan tenggiri segar pilihan, diproses secara tradisional</p>
				</div>
				<div class="bg-gradient-to-br from-green-50 to-green-100 border border-green-100 rounded-2xl p-5 text-center hover:shadow-md transition">
					<div class="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow"><ThumbsUp class="w-6 h-6 text-white" /></div>
					<h3 class="font-black text-gray-800 text-sm mb-1">Langganan Setia</h3>
					<p class="text-xs text-gray-500 leading-relaxed">Ribuan pelanggan puas dari Tangerang hingga luar negeri</p>
				</div>
			</div>
			<!-- Stats counter -->
			<div class="grid grid-cols-2 md:grid-cols-4 gap-5">
				<div class="text-center">
					<p class="text-4xl font-black text-red-600 mb-1">500+</p>
					<p class="text-xs text-gray-500 font-semibold">Jenis Produk Tersedia</p>
				</div>
				<div class="text-center">
					<p class="text-4xl font-black text-red-600 mb-1">15+</p>
					<p class="text-xs text-gray-500 font-semibold">Tahun Berpengalaman</p>
				</div>
				<div class="text-center">
					<p class="text-4xl font-black text-red-600 mb-1">10K+</p>
					<p class="text-xs text-gray-500 font-semibold">Pelanggan Puas</p>
				</div>
				<div class="text-center">
					<p class="text-4xl font-black text-red-600 mb-1">4.9★</p>
					<p class="text-xs text-gray-500 font-semibold">Rating Rata-Rata</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ===== PRODUK SECTION ===== -->
	<section class="py-16 md:py-20 bg-[#FFFDF9]" id="produk">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-12">
				<span class="inline-block bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-100 mb-3">Pilihan Terbaik</span>
				<h2 class="text-3xl md:text-4xl font-black text-gray-900 mb-3">Produk <span class="text-red-600">Unggulan</span> Kami</h2>
				<p class="text-gray-500 max-w-xl mx-auto text-sm">Kemplang, getas, terasi, dan aneka camilan khas Bangka Belitung yang sudah terbukti lezat dan berkualitas.</p>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
				{#each FEATURED as product}
				<div class="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden flex flex-col">
					<!-- Emoji illustration area -->
					<div class="bg-gradient-to-br from-amber-50 to-red-50 h-32 flex items-center justify-center relative">
						<span class="text-6xl group-hover:scale-110 transition-transform duration-300">{product.emoji}</span>
						<span class="absolute top-2 right-2 bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded-full">{product.badge}</span>
					</div>
					<!-- Content -->
					<div class="p-4 flex flex-col flex-1">
						<h3 class="font-black text-gray-800 text-sm mb-1.5 leading-tight">{product.name}</h3>
						<p class="text-xs text-gray-500 leading-relaxed mb-3 flex-1">{product.desc}</p>
						<div class="flex items-center justify-between mb-3">
							<p class="font-black text-red-600 text-base">Rp {formatCurrency(product.price)}</p>
							<span class="text-xs text-gray-400">/ bungkus</span>
						</div>
						<!-- Action buttons -->
						<div class="flex gap-2">
							<a
								href={productWaLink(product.name, product.price)}
								target="_blank"
								rel="noopener noreferrer"
								class="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition"
							>
								<MessageCircle class="w-3.5 h-3.5" />WA
							</a>
							<button
								onclick={() => addToCart(product)}
								class="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition"
							>
								<Plus class="w-3.5 h-3.5" />Keranjang
							</button>
						</div>
					</div>
				</div>
				{/each}
			</div>

			<div class="text-center mt-10">
				<a
					href="https://wa.me/{WA_PHONE}?text=Halo%20Toko%20Aneka%20Rasa%2099%2C%20saya%20mau%20lihat%20katalog%20lengkap%20produk%20tersedia."
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 bg-white border-2 border-red-200 hover:border-red-400 text-red-600 font-bold px-8 py-3.5 rounded-xl transition shadow-sm text-sm"
				>
					<Package class="w-5 h-5" />
					Lihat Katalog Lengkap via WhatsApp
					<ExternalLink class="w-4 h-4" />
				</a>
			</div>
		</div>
	</section>

	<!-- ===== CARA PESAN SECTION ===== -->
	<section class="py-16 md:py-20 bg-white">
		<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-12">
				<span class="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-100 mb-3">Mudah & Cepat</span>
				<h2 class="text-3xl md:text-4xl font-black text-gray-900 mb-3">Cara <span class="text-red-600">Pesan</span></h2>
				<p class="text-gray-500 max-w-lg mx-auto text-sm">Pesan oleh-oleh khas Bangka dengan mudah, hanya dalam 3 langkah!</p>
			</div>
			<div class="grid md:grid-cols-3 gap-6">
				<div class="text-center relative">
					<div class="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
						<span class="text-white font-black text-xl">1</span>
					</div>
					<h3 class="font-black text-gray-800 mb-2">Pilih Produk</h3>
					<p class="text-sm text-gray-500 leading-relaxed">Lihat katalog produk unggulan kami. Tambahkan ke keranjang atau langsung tanya via WhatsApp.</p>
					<!-- Connector -->
					<div class="hidden md:block absolute top-7 left-[calc(50%+2rem)] w-full h-0.5 bg-gradient-to-r from-red-200 to-red-100"></div>
				</div>
				<div class="text-center relative">
					<div class="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
						<span class="text-white font-black text-xl">2</span>
					</div>
					<h3 class="font-black text-gray-800 mb-2">Chat WhatsApp</h3>
					<p class="text-sm text-gray-500 leading-relaxed">Kirim pesanan via WhatsApp. Konfirmasi stok, harga, dan ongkir bersama kami langsung.</p>
					<div class="hidden md:block absolute top-7 left-[calc(50%+2rem)] w-full h-0.5 bg-gradient-to-r from-amber-200 to-amber-100"></div>
				</div>
				<div class="text-center">
					<div class="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
						<span class="text-white font-black text-xl">3</span>
					</div>
					<h3 class="font-black text-gray-800 mb-2">Terima Pesanan</h3>
					<p class="text-sm text-gray-500 leading-relaxed">Bayar & pesanan dikemas rapi. Ambil langsung di toko atau kami kirimkan ke alamat Anda.</p>
				</div>
			</div>
			<div class="mt-10 text-center">
				<a
					href="https://wa.me/{WA_PHONE}"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-2xl shadow-lg transition text-sm"
				>
					<MessageCircle class="w-5 h-5" />
					Mulai Pesan Sekarang
					<ArrowRight class="w-4 h-4" />
				</a>
			</div>
		</div>
	</section>

	<!-- ===== TESTIMONI SECTION ===== -->
	<section class="py-16 md:py-20 bg-[#FFFDF9]" id="testimoni">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-12">
				<span class="inline-block bg-yellow-50 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full border border-yellow-100 mb-3">Kata Pelanggan</span>
				<h2 class="text-3xl md:text-4xl font-black text-gray-900 mb-3">Ribuan Pelanggan <span class="text-red-600">Sudah Puas</span></h2>
				<p class="text-gray-500 max-w-xl mx-auto text-sm">Kepuasan pelanggan adalah prioritas utama kami. Ini kata mereka tentang Toko Aneka Rasa 99.</p>
			</div>
			<div class="grid md:grid-cols-2 gap-5">
				{#each testimonials as t}
				<div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
					<div class="flex items-center gap-1 mb-3">
						{#each { length: t.stars } as _}
						<Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
						{/each}
					</div>
					<p class="text-gray-700 text-sm leading-relaxed mb-4 italic">"{t.review}"</p>
					<div class="flex items-center gap-3">
						<div class="w-9 h-9 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
							<User class="w-4 h-4 text-red-600" />
						</div>
						<div>
							<p class="font-bold text-gray-800 text-sm">{t.name}</p>
							<p class="text-xs text-gray-400">{t.city} · {t.product}</p>
						</div>
					</div>
				</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- ===== KONTAK SECTION ===== -->
	<section class="py-16 md:py-20 bg-white" id="kontak">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-12">
				<span class="inline-block bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-100 mb-3">Hubungi Kami</span>
				<h2 class="text-3xl md:text-4xl font-black text-gray-900 mb-3">Temukan & <span class="text-red-600">Hubungi</span> Kami</h2>
				<p class="text-gray-500 max-w-xl mx-auto text-sm">Kunjungi toko kami di Poris Indah Tangerang, atau hubungi via WhatsApp untuk pemesanan dan informasi produk.</p>
			</div>

			<div class="grid lg:grid-cols-2 gap-10">
				<!-- Left: contact info + map -->
				<div class="space-y-5">
					<div class="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-sm transition">
						<div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0"><MapPin class="w-5 h-5 text-red-600" /></div>
						<div>
							<p class="font-bold text-gray-800 text-sm mb-0.5">Alamat Toko</p>
							<p class="text-sm text-gray-600 leading-relaxed">{STORE_ADDRESS}</p>
						</div>
					</div>
					<div class="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-sm transition">
						<div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0"><Phone class="w-5 h-5 text-green-600" /></div>
						<div>
							<p class="font-bold text-gray-800 text-sm mb-0.5">WhatsApp / Telepon</p>
							<a href="https://wa.me/{WA_PHONE}" target="_blank" rel="noopener noreferrer" class="text-green-600 font-bold text-sm hover:underline">+62 813-8710-9586</a>
						</div>
					</div>
					<div class="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-sm transition">
						<div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0"><Clock class="w-5 h-5 text-amber-600" /></div>
						<div>
							<p class="font-bold text-gray-800 text-sm mb-0.5">Jam Operasional</p>
							<p class="text-sm text-gray-600">{STORE_HOURS}</p>
						</div>
					</div>
					<!-- Google Maps embed -->
					<div class="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
						<iframe
							src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d247.5!2d106.6713!3d-6.1783!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTAnNDIuMCJTIDEwNsKwNDAnMTYuNyJF!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
							width="100%"
							height="220"
							style="border:0;"
							allowfullscreen={true}
							loading="lazy"
							referrerpolicy="no-referrer-when-downgrade"
							title="Lokasi Toko Aneka Rasa 99"
						></iframe>
					</div>
				</div>

				<!-- Right: Quick order form -->
				<div class="bg-gradient-to-br from-red-600 to-red-700 rounded-3xl p-7 text-white shadow-xl">
					<div class="flex items-center gap-2 mb-6">
						<ShoppingBag class="w-6 h-6" />
						<h3 class="font-black text-xl">Form Pesan Cepat</h3>
					</div>
					<form onsubmit={handleQuickOrderSubmit} class="space-y-4">
						<div>
							<label for="cname" class="block text-xs font-bold text-red-100 mb-1.5">Nama Anda</label>
							<input
								id="cname"
								type="text"
								bind:value={customerName}
								placeholder="Contoh: Ibu Sari"
								class="w-full px-4 py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition"
							/>
						</div>
						<div>
							<label for="ccity" class="block text-xs font-bold text-red-100 mb-1.5">Kota Pengiriman</label>
							<input
								id="ccity"
								type="text"
								bind:value={customerCity}
								placeholder="Contoh: Jakarta Selatan"
								class="w-full px-4 py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition"
							/>
						</div>
						<div>
							<label for="cprod" class="block text-xs font-bold text-red-100 mb-1.5">Produk yang Diminati</label>
							<select
								id="cprod"
								bind:value={selectedQuickProduct}
								class="w-full px-4 py-3 rounded-xl bg-white/15 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition appearance-none"
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
							<label for="cnotes" class="block text-xs font-bold text-red-100 mb-1.5">Catatan Tambahan (Opsional)</label>
							<textarea
								id="cnotes"
								bind:value={orderNotes}
								rows={2}
								placeholder="Jumlah, variasi, atau permintaan khusus..."
								class="w-full px-4 py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition resize-none"
							></textarea>
						</div>
						<button
							type="submit"
							class="w-full bg-white hover:bg-gray-50 text-red-600 font-black py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg text-sm"
						>
							<MessageCircle class="w-5 h-5" />
							Kirim Pesanan via WhatsApp
						</button>
					</form>
					<p class="text-center text-red-100 text-xs mt-4 flex items-center justify-center gap-1">
						<CheckCircle2 class="w-3.5 h-3.5" />
						Pesanan langsung diterima oleh admin toko
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ===== FOOTER ===== -->
	<footer class="bg-gray-900 text-gray-400 pt-12 pb-8">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid md:grid-cols-3 gap-8 mb-10">
				<!-- Brand -->
				<div>
					<div class="flex items-center gap-2.5 mb-4">
						<div class="w-9 h-9 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-md">
							<ShoppingBag class="w-5 h-5 text-white" />
						</div>
						<div>
							<p class="font-black text-white text-sm">Toko Aneka Rasa 99</p>
							<p class="text-xs text-red-400">Kemplang & Oleh-Oleh Bangka</p>
						</div>
					</div>
					<p class="text-xs leading-relaxed mb-4">Pusat oleh-oleh khas Bangka Belitung terlengkap di Poris Indah, Tangerang. Kemplang, getas, terasi, dan ratusan produk pilihan.</p>
					<a
						href="https://wa.me/{WA_PHONE}"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition"
					>
						<MessageCircle class="w-3.5 h-3.5" />Chat WhatsApp
					</a>
				</div>

				<!-- Navigation -->
				<div>
					<h4 class="font-black text-white text-sm mb-4">Navigasi</h4>
					<ul class="space-y-2 text-sm">
						<li><a href="#produk" class="hover:text-white transition flex items-center gap-1.5"><ChevronRight class="w-3.5 h-3.5 text-red-400" />Produk Unggulan</a></li>
						<li><a href="#testimoni" class="hover:text-white transition flex items-center gap-1.5"><ChevronRight class="w-3.5 h-3.5 text-red-400" />Testimoni</a></li>
						<li><a href="#kontak" class="hover:text-white transition flex items-center gap-1.5"><ChevronRight class="w-3.5 h-3.5 text-red-400" />Kontak & Lokasi</a></li>
						<li>
							<a href="/pos" class="hover:text-white transition flex items-center gap-1.5 opacity-50">
								<ChevronRight class="w-3.5 h-3.5 text-gray-500" />
								<User class="w-3 h-3" />Portal Kasir
							</a>
						</li>
					</ul>
				</div>

				<!-- Info -->
				<div>
					<h4 class="font-black text-white text-sm mb-4">Info Toko</h4>
					<ul class="space-y-3 text-xs">
						<li class="flex items-start gap-2"><MapPin class="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" /><span>{STORE_ADDRESS}</span></li>
						<li class="flex items-center gap-2"><Clock class="w-3.5 h-3.5 text-amber-400 shrink-0" /><span>{STORE_HOURS}</span></li>
						<li class="flex items-center gap-2"><Phone class="w-3.5 h-3.5 text-green-400 shrink-0" /><a href="https://wa.me/{WA_PHONE}" class="hover:text-white transition">+62 813-8710-9586</a></li>
					</ul>
				</div>
			</div>

			<div class="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
				<p>© {new Date().getFullYear()} Toko Aneka Rasa 99. Semua Hak Dilindungi.</p>
				<div class="flex items-center gap-4">
					<a href="https://tokoanekarasa99.my.id/" class="hover:text-white transition">tokoanekarasa99.my.id</a>
					<a href="/pos" class="hover:text-white transition flex items-center gap-1 opacity-40"><ExternalLink class="w-3 h-3" />Kasir Portal</a>
				</div>
			</div>
		</div>
	</footer>

</div>
