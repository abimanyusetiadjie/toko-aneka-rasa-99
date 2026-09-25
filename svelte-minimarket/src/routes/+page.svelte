<script lang="ts">
	import type { PageData } from './$types';
	import {
		Phone, MapPin, Clock, Star, ShoppingBag, ShieldCheck,
		ChevronRight, ChevronLeft, Menu, X, ArrowRight, Truck, Award, Sparkles,
		MessageCircle, ExternalLink, User, ShoppingCart,
		Plus, Minus, Trash2, CheckCircle2, ThumbsUp, ChevronDown, HelpCircle,
		Package, Store, Check
	} from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const WA_PHONE = '6281387109586';
	const STORE_NAME = 'Toko Aneka Rasa 99';
	const STORE_ADDRESS = 'Perumahan Poris Indah Blok B 11 No. 1, RT 001/RW 005, Kel. Cipondoh Indah, Kec. Cipondoh, Kota Tangerang, Banten 15148';
	const STORE_HOURS = 'Buka Setiap Hari: 07.30 – 21.30 WIB';

	let mobileMenuOpen = $state(false);
	let cartOpen = $state(false);
	let waBubbleVisible = $state(true);

	// Category filter state
	type ProductCategory = 'all' | 'kemplang' | 'getas' | 'terasi' | 'snack';
	let selectedCategory = $state<ProductCategory>('all');

	interface FeaturedProduct {
		id: string;
		name: string;
		category: ProductCategory;
		desc: string;
		price: number;
		originalPrice?: number;
		weight: string;
		rating: number;
		reviewsCount: number;
		image: string;
		badge: string;
		highlight: string;
	}

	const FEATURED: FeaturedProduct[] = [
		{
			id: 'fp1',
			name: 'Kemplang Panggang Cap MM',
			category: 'kemplang',
			desc: 'Dipanggang tradisional di atas bara arang. Wangi asap harum, gurih renyah di luar, empuk gurih di dalam. Lengkap dengan sambal terasi autentik khas Bangka.',
			price: 37500,
			originalPrice: 43000,
			weight: '250 gr',
			rating: 5.0,
			reviewsCount: 142,
			image: '/images/products/kemplang.png',
			badge: '🔥 Paling Laris',
			highlight: 'Sambal Terasi Asli'
		},
		{
			id: 'fp2',
			name: 'Getas Bulat Cap Tiga Roda',
			category: 'getas',
			desc: 'Dibuat dari daging ikan tenggiri segar pilihan. Bulat renyah, gurih empuk, dan tidak keras di gigi. Camilan favorit keluarga.',
			price: 42500,
			originalPrice: 48000,
			weight: '250 gr',
			rating: 4.9,
			reviewsCount: 98,
			image: '/images/products/getas.png',
			badge: '⭐ Pilihan Utama',
			highlight: 'Ikan Tenggiri Super'
		},
		{
			id: 'fp3',
			name: 'Terasi AB No.1 Asli Bangka',
			category: 'terasi',
			desc: 'Terasi udang rebon asli tanpa campuran pewarna kimia. Wangi harum semerbak, bikin sambal dan tumisan sedap ala resto Belitung.',
			price: 55000,
			originalPrice: 62000,
			weight: '500 gr',
			rating: 5.0,
			reviewsCount: 86,
			image: '/images/products/terasi.png',
			badge: '🦐 Resep Murni',
			highlight: 'Udang Rebon Segar'
		},
		{
			id: 'fp4',
			name: 'Kemplang Goreng Pasir Tjokro',
			category: 'kemplang',
			desc: 'Digoreng tanpa minyak berlebih menggunakan media pasir bersih khas kepulauan. Tekstur ekstra garing & gurih ikan terasa kuat.',
			price: 32000,
			originalPrice: 37000,
			weight: '250 gr',
			rating: 4.8,
			reviewsCount: 64,
			image: '/images/products/kemplang.png',
			badge: '✨ Extra Krispi',
			highlight: 'Rendah Kolesterol'
		},
		{
			id: 'fp5',
			name: 'Getas Amplang Ikan Tenggiri',
			category: 'getas',
			desc: 'Bentuk lonjong renyah khas Bangka dengan bumbu bawang gurih alami. Praktis dibawa bepergian atau oleh-oleh ke kerabat.',
			price: 25000,
			originalPrice: 29000,
			weight: '200 gr',
			rating: 4.9,
			reviewsCount: 73,
			image: '/images/products/getas-tenggiri.png',
			badge: '📦 Paling Hemat',
			highlight: 'Gurih Tahan Lama'
		},
		{
			id: 'fp6',
			name: 'Kericu Keripik Telur Cumi',
			category: 'snack',
			desc: 'Camilan legendaris Bangka dari telur cumi segar dan sagu pilihan. Tekstur unik, renyah manis-gurih yang bikin ketagihan.',
			price: 30000,
			originalPrice: 35000,
			weight: '200 gr',
			rating: 4.9,
			reviewsCount: 55,
			image: '/images/products/snack-kericu.png',
			badge: '🦑 Khas Bangka',
			highlight: 'Telur Cumi Asli'
		},
		{
			id: 'fp7',
			name: 'Kerupuk Mentah Siap Goreng',
			category: 'kemplang',
			desc: 'Kerupuk ikan mentah kualitas ekspor. Praktis disimpan lama, mekar 3x lipat saat digoreng di rumah dengan aroma ikan segar.',
			price: 35000,
			originalPrice: 40000,
			weight: '500 gr',
			rating: 4.8,
			reviewsCount: 41,
			image: '/images/products/kerupuk-mentah.png',
			badge: '🍳 Siap Goreng',
			highlight: 'Mekar Maksimal'
		},
		{
			id: 'fp8',
			name: 'Aneka Kue Tradisional Bangka',
			category: 'snack',
			desc: 'Kue kering tradisional Bangka bertekstur legit renyah. Sangat cocok disajikan saat santai bersama kopi atau teh hangat.',
			price: 28000,
			originalPrice: 32000,
			weight: '250 gr',
			rating: 4.8,
			reviewsCount: 39,
			image: '/images/products/aneka-kue.png',
			badge: '🍪 Resep Kuno',
			highlight: 'Bahan Alami'
		}
	];

	let filteredProducts = $derived(
		selectedCategory === 'all'
			? FEATURED
			: FEATURED.filter(p => p.category === selectedCategory)
	);

	interface CartItem extends FeaturedProduct { qty: number; }
	let cart = $state<CartItem[]>([]);

	function addToCart(product: FeaturedProduct) {
		const existing = cart.find(c => c.id === product.id);
		if (existing) {
			cart = cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c);
		} else {
			cart = [...cart, { ...product, qty: 1 }];
		}
		cartOpen = true;
	}

	function removeFromCart(id: string) {
		cart = cart.filter(c => c.id !== id);
		if (cart.length === 0) cartOpen = false;
	}

	function changeQty(id: string, delta: number) {
		cart = cart.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c);
	}

	let cartTotal = $derived(cart.reduce((sum, c) => sum + c.price * c.qty, 0));
	let cartCount = $derived(cart.reduce((sum, c) => sum + c.qty, 0));

	function checkoutWhatsApp() {
		const lines = cart.map(c => `- ${c.name} (${c.qty} bks) Rp ${formatCurrency(c.price * c.qty)}`).join('\n');
		const msg = `Halo ${STORE_NAME}!\n\nSaya ingin memesan:\n${lines}\n\n*Total Belanja:* Rp ${formatCurrency(cartTotal)}\n\nMohon informasi ongkos kirim dan ketersediaan stok ya. Terima kasih!`;
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
		const notes = orderNotes.trim() ? `\nCatatan Tambahan: ${orderNotes.trim()}` : '';
		const msg = `Halo ${STORE_NAME}!\n\nSaya ingin memesan cepat:\n- Nama: *${name}*\n- Kota Tujuan: *${city}*\n- Produk: *${item}*${notes}\n\nMohon info ketersediaan stok, total biaya, dan perkiraan ongkir. Terima kasih!`;
		window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
	}

	function formatCurrency(val: number) {
		return new Intl.NumberFormat('id-ID').format(val);
	}

	function productWaLink(name: string, price: number) {
		const msg = `Halo ${STORE_NAME}, saya mau pesan *${name}* (Rp ${formatCurrency(price)}). Apakah stok masih tersedia?`;
		return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(msg)}`;
	}

	// Testimonials Carousel State
	const testimonials = [
		{
			name: 'Ibu Ratna Hendrawan',
			city: 'Jakarta Selatan',
			avatar: 'RH',
			review: 'Getasnya bener-bener renyah empuk, ikannya kerasa banget dan nggak amis. Anak-anak doyan sekali buat cemilan nonton TV. Selalu langganan setiap ada acara kumpul keluarga di Jakarta!',
			stars: 5,
			product: 'Getas Bulat Cap Tiga Roda',
			tag: 'Pelanggan Setia (4 Tahun)'
		},
		{
			name: 'Bpk. Hendra Wijaya',
			city: 'Surabaya',
			avatar: 'HW',
			review: 'Kemplang panggangnya otentik wangi arang Bangka asli! Sambal terasinya pedas gurih nagih banget. Kirim ke Surabaya aman terlindungi, packing kardus tebal tanpa ada yang remuk sama sekali.',
			stars: 5,
			product: 'Kemplang Panggang Cap MM',
			tag: 'Kirim Antar Pulau'
		},
		{
			name: 'Ci Meyling',
			city: 'Tangerang',
			avatar: 'CM',
			review: 'Sudah langganan bertahun-tahun langsung ke tokonya di Poris. Kalau mau kirim hampers oleh-oleh ke mertua dan rekan bisnis pasti pesannya di Toko Aneka Rasa 99. Kualitasnya selalu konsisten nomor satu!',
			stars: 5,
			product: 'Paket Kemplang & Hampers',
			tag: 'Langganan Poris'
		},
		{
			name: 'Ibu Dian Pratiwi',
			city: 'Bandung',
			avatar: 'DP',
			review: 'Terasi AB No. 1 Bangka-nya benar-benar juara dunia! Wangi alami tanpa pewarna merah aneh. Bikin tumis kangkung terasi aromanya langsung persis waktu liburan ke Belitung asli.',
			stars: 5,
			product: 'Terasi AB No. 1 Asli Bangka',
			tag: 'Verified Review'
		}
	];

	let activeTestimonial = $state(0);
	function nextTestimonial() {
		activeTestimonial = (activeTestimonial + 1) % testimonials.length;
	}
	function prevTestimonial() {
		activeTestimonial = (activeTestimonial - 1 + testimonials.length) % testimonials.length;
	}

	let openFaq = $state<number | null>(0);
	function toggleFaq(index: number) {
		openFaq = openFaq === index ? null : index;
	}

	const faqs = [
		{
			q: 'Apakah semua produk di Toko Aneka Rasa 99 asli didatangkan dari Bangka?',
			a: 'Benar sekali! Semua kemplang panggang, getas ikan tenggiri, terasi udang rebon, dan cemilan khas diproduksi langsung oleh sentra pengrajin tradisional di Bangka Belitung dengan resep turun-temurun tanpa bahan pengawet berbahaya.'
		},
		{
			q: 'Di mana alamat toko fisik Toko Aneka Rasa 99?',
			a: 'Toko kami berlokasi strategis di Perumahan Poris Indah Blok B 11 No. 1, Kel. Cipondoh Indah, Kec. Cipondoh, Kota Tangerang. Buka setiap hari mulai pukul 07.30 hingga 21.30 WIB. Anda bisa cari langsung di Google Maps dengan nama "Toko Aneka Rasa 99".'
		},
		{
			q: 'Bagaimana cara pemesanan online untuk kirim ke luar kota?',
			a: 'Sangat mudah! Anda cukup klik tombol WhatsApp di website ini atau pilih produk ke keranjang belanja. Admin kami akan langsung merespons dengan total rincian belanja dan rekomendasi ekspedisi tercepat (JNE, SiCepat, J&T, Paxel, atau Instant Grab/Gojek).'
		},
		{
			q: 'Bagaimana keamanan packing kerupuk & kemplang saat dikirim?',
			a: 'Kami memberikan standar packing khusus: setiap produk dilapisi bubble wrap tebal dan dimasukkan ke dalam kardus keras berlapis stiker Fragile/Jangan Dibanting. Kerupuk tiba di tangan Anda tetap utuh, renyah, dan siap dinikmati.'
		},
		{
			q: 'Apakah melayani pembelian dalam jumlah besar atau paket hampers?',
			a: 'Ya, kami melayani pemesanan grosir untuk reseller, oleh-oleh kantor, hajatan, hingga paket hampers Imlek, Lebaran, dan Natal dengan pita eksklusif. Hubungi WhatsApp admin kami untuk penawaran harga spesial!'
		}
	];
</script>

<svelte:head>
	<title>Toko Aneka Rasa 99 | Pusat Oleh-Oleh Khas Bangka Asli di Poris Tangerang</title>
	<meta name="description" content="Pusat Kemplang Panggang Arang, Getas Ikan Tenggiri Asli Bangka, Terasi AB Super, dan Aneka Oleh-Oleh Khas Bangka Belitung di Poris Tangerang. Renyah, gurih, 100% halal, siap kirim ke seluruh Indonesia." />
	<meta name="keywords" content="toko aneka rasa 99, kemplang bangka tangerang, getas tenggiri poris indah, oleh oleh khas bangka tangerang, kemplang panggang cipondoh, terasi bangka asli" />
	<meta name="author" content="Toko Aneka Rasa 99" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="https://tokoanekarasa99.my.id/" />
	<meta property="og:locale" content="id_ID" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Toko Aneka Rasa 99 | Oleh-Oleh Khas Bangka Asli Siap Kirim Nasional" />
	<meta property="og:description" content="Pusat Kemplang Panggang Arang, Getas Tenggiri Asli, dan Terasi Super Bangka di Poris Tangerang. Pesan cepat via WhatsApp!" />
	<meta property="og:url" content="https://tokoanekarasa99.my.id/" />
	<meta property="og:image" content="https://tokoanekarasa99.my.id/logo.png" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
</svelte:head>

<div class="min-h-screen bg-[#FCFAF6] text-slate-800 font-sans selection:bg-red-500 selection:text-white relative overflow-x-clip w-full">

	<!-- ===== FLOATING WHATSAPP BUTTON WITH INTERACTIVE SPEECH BUBBLE ===== -->
	<div class="fixed bottom-5 right-4 sm:right-6 z-40 flex flex-col items-end gap-2 pointer-events-none">
		{#if waBubbleVisible}
		<div class="pointer-events-auto bg-white border border-emerald-200/80 rounded-2xl p-3 sm:p-3.5 shadow-xl shadow-emerald-950/10 max-w-[260px] sm:max-w-[290px] animate-in fade-in slide-in-from-bottom-3 duration-300 relative group">
			<button
				type="button"
				onclick={() => waBubbleVisible = false}
				class="absolute -top-2 -left-2 bg-slate-100 hover:bg-slate-200 text-slate-500 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow cursor-pointer transition"
				aria-label="Tutup pesan"
			>
				✕
			</button>
			<div class="flex items-start gap-2.5">
				<div class="relative shrink-0">
					<img src="/logo.png" alt="Admin Toko" class="w-8 h-8 rounded-full object-cover border border-emerald-300" />
					<span class="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white absolute bottom-0 right-0 animate-pulse"></span>
				</div>
				<div class="text-xs">
					<p class="font-extrabold text-slate-900 leading-tight">Admin Toko Aneka Rasa 99</p>
					<p class="text-slate-600 text-[11px] mt-0.5 leading-snug">Ada yang bisa dibantu kak? Tanya stok kemplang & ongkir di sini yuk! 💬</p>
				</div>
			</div>
		</div>
		{/if}

		<a
			href="https://wa.me/{WA_PHONE}?text={encodeURIComponent('Halo Toko Aneka Rasa 99, saya ingin tanya seputar produk oleh-oleh Bangka:')}"
			target="_blank"
			rel="noopener noreferrer"
			class="pointer-events-auto group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xl shadow-emerald-600/30 hover:shadow-2xl hover:shadow-emerald-600/50 hover:scale-105 active:scale-95 transition-all duration-200"
			aria-label="Chat WhatsApp Admin Toko"
		>
			<svg class="w-7 h-7 sm:w-8 sm:h-8 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
				<path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
			</svg>
		</a>
	</div>

	<!-- ===== MINI CART SLIDE-OVER PANEL ===== -->
	{#if cartOpen && cart.length > 0}
	<button
		type="button"
		onclick={() => cartOpen = false}
		class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 transition-opacity cursor-default w-full h-full border-none p-0"
		aria-label="Tutup Keranjang Belanja"
	></button>

	<div class="fixed inset-x-0 bottom-0 md:left-auto md:right-6 md:bottom-6 md:w-96 z-50 bg-white rounded-t-3xl md:rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] w-full md:max-w-md animate-in slide-in-from-bottom duration-200">
		<div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-t-3xl md:rounded-t-2xl shrink-0">
			<div class="flex items-center gap-2.5 font-extrabold text-sm sm:text-base">
				<ShoppingCart class="w-5 h-5" />
				<span>Keranjang Belanja ({cartCount} item)</span>
			</div>
			<button onclick={() => cartOpen = false} class="p-1 hover:bg-white/20 rounded-full transition cursor-pointer" aria-label="Tutup Keranjang">
				<X class="w-5 h-5" />
			</button>
		</div>

		<div class="overflow-y-auto flex-1 px-4 py-3 divide-y divide-slate-100">
			{#each cart as item}
			<div class="flex items-center gap-3 py-3">
				<img src={item.image} alt={item.name} class="w-12 h-12 rounded-xl object-cover border border-amber-100 shadow-2xs shrink-0" />
				<div class="flex-1 min-w-0">
					<p class="font-bold text-xs sm:text-sm text-slate-900 truncate">{item.name}</p>
					<p class="text-[11px] text-slate-500 font-medium">Rp {formatCurrency(item.price)} / {item.weight}</p>
				</div>
				<div class="flex items-center gap-1.5 shrink-0 bg-slate-100 p-1 rounded-lg">
					<button onclick={() => changeQty(item.id, -1)} class="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition active:scale-90" aria-label="Kurang">
						<Minus class="w-3 h-3 text-slate-700" />
					</button>
					<span class="w-5 text-center text-xs font-bold text-slate-900">{item.qty}</span>
					<button onclick={() => changeQty(item.id, 1)} class="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition active:scale-90" aria-label="Tambah">
						<Plus class="w-3 h-3 text-slate-700" />
					</button>
				</div>
				<div class="text-right shrink-0">
					<p class="font-extrabold text-xs sm:text-sm text-red-600">Rp {formatCurrency(item.price * item.qty)}</p>
					<button onclick={() => removeFromCart(item.id)} class="text-[10px] text-slate-400 hover:text-red-600 flex items-center gap-0.5 mt-0.5 ml-auto transition">
						<Trash2 class="w-3 h-3" /> Hapus
					</button>
				</div>
			</div>
			{/each}
		</div>

		<div class="px-5 py-4 border-t border-slate-100 bg-slate-50/80 rounded-b-2xl shrink-0">
			<div class="flex justify-between items-center mb-3 text-sm">
				<span class="text-slate-600 font-semibold">Total Estimasi:</span>
				<span class="font-black text-lg text-red-600">Rp {formatCurrency(cartTotal)}</span>
			</div>
			<button
				onclick={checkoutWhatsApp}
				class="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition text-sm cursor-pointer"
			>
				<svg class="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
				<span>Kirim Pesanan ke WhatsApp</span>
			</button>
		</div>
	</div>
	{/if}

	<!-- ===== STICKY NAVBAR WITH GLASS EFFECT ===== -->
	<header class="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs transition-all">
		<nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16 sm:h-20">
				<!-- Brand Identity -->
				<a href="/" class="flex items-center gap-3 group min-w-0">
					<div class="relative">
						<img src="/logo.png" alt="Logo Toko Aneka Rasa 99" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-amber-400/80 shadow-xs group-hover:scale-105 transition-transform" />
						<span class="absolute -bottom-0.5 -right-0.5 bg-red-600 text-[9px] font-black text-white px-1 rounded-full">99</span>
					</div>
					<div class="min-w-0">
						<span class="font-black text-slate-900 text-sm sm:text-base tracking-tight leading-none block truncate">Toko Aneka Rasa 99</span>
						<span class="text-[11px] text-red-600 font-bold tracking-wide leading-none mt-1 block truncate">Pusat Oleh-Oleh Khas Bangka</span>
					</div>
				</a>

				<!-- Desktop Nav Links -->
				<div class="hidden md:flex items-center gap-7 text-xs lg:text-sm font-bold text-slate-600">
					<a href="#hero" class="hover:text-red-600 transition-colors">Beranda</a>
					<a href="#katalog" class="hover:text-red-600 transition-colors">Katalog Oleh-Oleh</a>
					<a href="#cerita" class="hover:text-red-600 transition-colors">Cerita Kami</a>
					<a href="#keunggulan" class="hover:text-red-600 transition-colors">Keunggulan</a>
					<a href="#testimoni" class="hover:text-red-600 transition-colors">Testimoni</a>
					<a href="#kontak" class="hover:text-red-600 transition-colors">Lokasi & Pesan</a>
				</div>

				<!-- Right Actions -->
				<div class="flex items-center gap-2 sm:gap-3">
					<!-- Cart Badge -->
					{#if cartCount > 0}
					<button
						onclick={() => cartOpen = !cartOpen}
						class="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition active:scale-95 cursor-pointer shadow-xs"
						aria-label="Buka Keranjang Belanja"
					>
						<ShoppingCart class="w-5 h-5" />
						<span class="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white animate-bounce">{cartCount}</span>
					</button>
					{/if}

					<!-- WhatsApp Primary CTA -->
					<a
						href="https://wa.me/{WA_PHONE}?text={encodeURIComponent('Halo Toko Aneka Rasa 99, saya ingin memesan oleh-oleh khas Bangka:')}"
						target="_blank"
						rel="noopener noreferrer"
						class="hidden sm:inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 lg:px-5 py-2.5 rounded-xl text-xs lg:text-sm font-extrabold shadow-sm shadow-emerald-600/20 hover:shadow-md hover:shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
					>
						<svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
						<span>Pesan via WA</span>
					</a>

					<!-- Mobile Menu Toggle -->
					<button
						onclick={() => mobileMenuOpen = !mobileMenuOpen}
						class="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition cursor-pointer"
						aria-label="Buka Menu Navigasi"
					>
						{#if mobileMenuOpen}<X class="w-6 h-6" />{:else}<Menu class="w-6 h-6" />{/if}
					</button>
				</div>
			</div>

			<!-- Mobile Menu Dropdown -->
			{#if mobileMenuOpen}
			<div class="md:hidden py-4 border-t border-slate-100 flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-150">
				<a href="#hero" onclick={() => mobileMenuOpen = false} class="px-3 py-2 rounded-lg font-bold text-slate-700 hover:bg-slate-50 hover:text-red-600 text-sm">Beranda</a>
				<a href="#katalog" onclick={() => mobileMenuOpen = false} class="px-3 py-2 rounded-lg font-bold text-slate-700 hover:bg-slate-50 hover:text-red-600 text-sm">Katalog Produk</a>
				<a href="#cerita" onclick={() => mobileMenuOpen = false} class="px-3 py-2 rounded-lg font-bold text-slate-700 hover:bg-slate-50 hover:text-red-600 text-sm">Cerita Kami</a>
				<a href="#keunggulan" onclick={() => mobileMenuOpen = false} class="px-3 py-2 rounded-lg font-bold text-slate-700 hover:bg-slate-50 hover:text-red-600 text-sm">Keunggulan Toko</a>
				<a href="#testimoni" onclick={() => mobileMenuOpen = false} class="px-3 py-2 rounded-lg font-bold text-slate-700 hover:bg-slate-50 hover:text-red-600 text-sm">Testimoni Pelanggan</a>
				<a href="#kontak" onclick={() => mobileMenuOpen = false} class="px-3 py-2 rounded-lg font-bold text-slate-700 hover:bg-slate-50 hover:text-red-600 text-sm">Lokasi & Kontak</a>
				<div class="pt-2 flex flex-col gap-2">
					<a
						href="https://wa.me/{WA_PHONE}?text={encodeURIComponent('Halo Toko Aneka Rasa 99, saya ingin memesan:')}"
						target="_blank"
						rel="noopener noreferrer"
						class="w-full bg-[#25D366] text-white text-center py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow"
					>
						<span>Chat WhatsApp Sekarang</span>
					</a>
				</div>
			</div>
			{/if}
		</nav>
	</header>

	<!-- ===== 1. HERO SECTION (DYNAMIC & EMOTIONAL REDESIGN) ===== -->
	<section id="hero" class="relative pt-6 pb-12 sm:pt-14 sm:pb-20 md:pt-20 md:pb-24 overflow-hidden isolate bg-gradient-to-b from-[#FFF5EC] via-[#FFFDF9] to-[#FCFAF6]">
		<!-- Decorative Ambient Glows -->
		<div class="absolute -top-24 -left-20 w-96 h-96 bg-red-200/40 rounded-full blur-3xl pointer-events-none -z-10"></div>
		<div class="absolute top-1/2 -right-24 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
				<!-- Left Column: Emotional Pitch & High-Converting CTAs -->
				<div class="lg:col-span-7 text-center lg:text-left space-y-4 sm:space-y-6">
					<!-- Live Store Status Badge -->
					<div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
						<span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
						<span>Buka Setiap Hari: 07.30 – 21.30 WIB</span>
						<span class="text-emerald-300">•</span>
						<span class="text-emerald-700 font-extrabold">Poris Indah, Tangerang</span>
					</div>

					<!-- Hero Headline -->
					<div class="space-y-2">
						<span class="text-xs sm:text-sm font-extrabold tracking-widest text-red-600 uppercase block">
							✨ Pusat Oleh-Oleh Khas Bangka Belitung Resmi
						</span>
						<h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.15]">
							Oleh-Oleh Khas Bangka Asli,
							<span class="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 bg-clip-text text-transparent block mt-1">
								Langsung dari Poris, Siap Kirim ke Seluruh Indonesia
							</span>
						</h1>
					</div>

					<!-- Narrative Subtitle -->
					<p class="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
						Dipanggang di atas bara arang tradisional, dipadukan dengan daging ikan tenggiri segar pilihan & racikan terasi super Bangka. Renyahnya juara, gurihnya alami tanpa pengawet.
					</p>

					<!-- Action Buttons -->
					<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
						<!-- Primary WhatsApp CTA -->
						<a
							href="https://wa.me/{WA_PHONE}?text={encodeURIComponent('Halo Toko Aneka Rasa 99, saya ingin memesan kemplang & oleh-oleh khas Bangka:')}"
							target="_blank"
							rel="noopener noreferrer"
							class="bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
						>
							<svg class="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
							<span>Pesan Cepat via WhatsApp</span>
							<ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
						</a>

						<!-- Secondary Catalog CTA -->
						<a
							href="#katalog"
							class="bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
						>
							<ShoppingBag class="w-4 h-4 text-red-600" />
							<span>Lihat Katalog Produk</span>
						</a>
					</div>

					<!-- Trust Signals Strip -->
					<div class="pt-4 border-t border-slate-200/60 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-600 font-semibold">
						<div class="flex items-center gap-1.5">
							<div class="flex text-amber-400">
								{#each Array(5) as _}
								<Star class="w-3.5 h-3.5 fill-current" />
								{/each}
							</div>
							<span class="font-extrabold text-slate-900">4.9 / 5.0</span>
							<span class="text-slate-400">(128+ Ulasan)</span>
						</div>
						<div class="flex items-center gap-1.5">
							<ShieldCheck class="w-4 h-4 text-emerald-600" />
							<span>100% Halal & Tanpa Pengawet</span>
						</div>
						<div class="flex items-center gap-1.5">
							<Truck class="w-4 h-4 text-blue-600" />
							<span>Packing Kardus Tebal & Bubble</span>
						</div>
					</div>
				</div>

				<!-- Right Column: Appetizing Featured Hero Showcase -->
				<div class="lg:col-span-5 relative">
					<!-- Hero Visual Card Container -->
					<div class="bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/60 border border-slate-200/80 relative">
						<!-- Badge Top -->
						<div class="flex items-center justify-between pb-4 border-b border-slate-100">
							<div class="flex items-center gap-2">
								<span class="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-black flex items-center gap-1">
									<Sparkles class="w-3.5 h-3.5 text-amber-600" />
									Paling Diminati Minggu Ini
								</span>
							</div>
							<span class="text-[11px] font-bold text-slate-400">Stok Segar</span>
						</div>

						<!-- Featured Top Pick Big Showcase -->
						<div class="pt-4">
							<div class="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50/50 aspect-4/3 border border-amber-100/60 group">
								<img
									src="/images/products/kemplang.png"
									alt="Kemplang Panggang Arang Khas Bangka"
									class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
								/>
								<div class="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
									🔥 Terlaris #1
								</div>
								<div class="absolute bottom-3 inset-x-3 bg-slate-950/75 backdrop-blur-md text-white p-3 rounded-xl flex items-center justify-between">
									<div>
										<p class="text-xs font-bold">Kemplang Panggang Cap MM</p>
										<p class="text-[11px] text-amber-300">Termasuk Sambal Terasi Bangka</p>
									</div>
									<p class="text-sm font-black text-white">Rp 37.500</p>
								</div>
							</div>
						</div>

						<!-- Mini list of 2 more hot items -->
						<div class="mt-4 space-y-2.5">
							{#each FEATURED.slice(1, 3) as item}
							<div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-100 transition-colors">
								<div class="flex items-center gap-3 min-w-0">
									<img src={item.image} alt={item.name} class="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
									<div class="min-w-0">
										<p class="font-bold text-xs sm:text-sm text-slate-900 truncate">{item.name}</p>
										<p class="text-[11px] text-slate-500">{item.weight} • <span class="font-bold text-red-600">Rp {formatCurrency(item.price)}</span></p>
									</div>
								</div>
								<button
									onclick={() => addToCart(item)}
									class="shrink-0 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 hover:border-red-600 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
								>
									<Plus class="w-3.5 h-3.5" />
									<span>Pesan</span>
								</button>
							</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ===== 2. TRUST STATS STRIP ===== -->
	<section class="border-y border-slate-200/80 bg-white py-8 sm:py-10">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center divide-x-0 lg:divide-x divide-slate-100">
				<div class="space-y-1">
					<p class="text-3xl sm:text-4xl font-black text-slate-900">500+</p>
					<p class="text-xs sm:text-sm font-bold text-slate-500">Varian Camilan & Oleh-Oleh</p>
				</div>
				<div class="space-y-1">
					<p class="text-3xl sm:text-4xl font-black text-red-600">15+ Thn</p>
					<p class="text-xs sm:text-sm font-bold text-slate-500">Menjaga Resep Autentik</p>
				</div>
				<div class="space-y-1">
					<p class="text-3xl sm:text-4xl font-black text-slate-900">10.000+</p>
					<p class="text-xs sm:text-sm font-bold text-slate-500">Pelanggan Puas Seluruh RI</p>
				</div>
				<div class="space-y-1">
					<p class="text-3xl sm:text-4xl font-black text-amber-500 flex items-center justify-center gap-1">
						<span>4.9</span>
						<Star class="w-6 h-6 fill-current text-amber-400" />
					</p>
					<p class="text-xs sm:text-sm font-bold text-slate-500">Rating Google & Shopee</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ===== 3. KATALOG PRODUK DENGAN FILTER CEPAT (INCREASE DESIRE) ===== -->
	<section id="katalog" class="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Section Header -->
		<div class="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-3">
			<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-extrabold uppercase tracking-wide">
				<Award class="w-3.5 h-3.5" /> Pilihan Terlengkap & Terlezat
			</span>
			<h2 class="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
				Katalog Oleh-Oleh <span class="text-red-600">Khas Bangka</span> Favorit
			</h2>
			<p class="text-slate-600 text-xs sm:text-sm sm:leading-relaxed">
				Dibuat dari bahan alami berkualitas tanpa pengawet. Pilih kategori camilan favorit Anda dan pesan dengan mudah via WhatsApp atau tambahkan ke keranjang.
			</p>
		</div>

		<!-- Category Filter Pills -->
		<div class="flex items-center justify-center flex-wrap gap-2 mb-8 sm:mb-12">
			<button
				onclick={() => selectedCategory = 'all'}
				class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer {selectedCategory === 'all' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'}"
			>
				Semua Produk ({FEATURED.length})
			</button>
			<button
				onclick={() => selectedCategory = 'kemplang'}
				class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer {selectedCategory === 'kemplang' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'}"
			>
				🔥 Kemplang Panggang & Goreng
			</button>
			<button
				onclick={() => selectedCategory = 'getas'}
				class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer {selectedCategory === 'getas' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'}"
			>
				🐟 Getas Ikan Tenggiri
			</button>
			<button
				onclick={() => selectedCategory = 'terasi'}
				class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer {selectedCategory === 'terasi' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'}"
			>
				🦐 Terasi Super Bangka
			</button>
			<button
				onclick={() => selectedCategory = 'snack'}
				class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer {selectedCategory === 'snack' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'}"
			>
				🦑 Kericu & Aneka Snack
			</button>
		</div>

		<!-- Product Grid -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
			{#each filteredProducts as product (product.id)}
			<div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden group">
				<!-- Product Image Area -->
				<div class="relative bg-gradient-to-br from-amber-50/50 to-orange-50/50 aspect-square overflow-hidden">
					<img
						src={product.image}
						alt="{product.name} - Oleh-oleh Khas Bangka"
						class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
						loading="lazy"
					/>
					<!-- Badge -->
					<div class="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
						{product.badge}
					</div>
					<!-- Highlight Tag -->
					<div class="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-slate-200/60 shadow-2xs">
						{product.highlight}
					</div>
				</div>

				<!-- Product Body -->
				<div class="p-4 sm:p-5 flex flex-col flex-1">
					<div class="flex items-center justify-between text-xs text-slate-400 mb-1">
						<span>Isi: <strong>{product.weight}</strong></span>
						<div class="flex items-center gap-1 text-amber-500 font-bold">
							<Star class="w-3.5 h-3.5 fill-current" />
							<span>{product.rating}</span>
							<span class="text-slate-400 font-normal">({product.reviewsCount})</span>
						</div>
					</div>

					<h3 class="font-black text-slate-900 text-base mb-1.5 group-hover:text-red-600 transition-colors leading-snug">
						{product.name}
					</h3>
					<p class="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4 flex-1">
						{product.desc}
					</p>

					<!-- Pricing & Discount -->
					<div class="pt-3 border-t border-slate-100 flex items-baseline justify-between mb-4">
						<div>
							<p class="text-base sm:text-lg font-black text-red-600 leading-none">
								Rp {formatCurrency(product.price)}
							</p>
							{#if product.originalPrice}
							<p class="text-[11px] text-slate-400 line-through mt-0.5">
								Rp {formatCurrency(product.originalPrice)}
							</p>
							{/if}
						</div>
						{#if product.originalPrice}
						<span class="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
							Hemat Rp {formatCurrency(product.originalPrice - product.price)}
						</span>
						{/if}
					</div>

					<!-- CTAs (Cart & Direct WA) -->
					<div class="grid grid-cols-2 gap-2">
						<button
							onclick={() => addToCart(product)}
							class="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer active:scale-95"
							title="Tambah ke Keranjang"
						>
							<ShoppingCart class="w-3.5 h-3.5" />
							<span>+ Keranjang</span>
						</button>

						<a
							href={productWaLink(product.name, product.price)}
							target="_blank"
							rel="noopener noreferrer"
							class="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-extrabold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
							title="Pesan Langsung via WA"
						>
							<MessageCircle class="w-3.5 h-3.5" />
							<span>Beli Cepat</span>
						</a>
					</div>
				</div>
			</div>
			{/each}
		</div>
	</section>

	<!-- ===== 4. CERITA KAMI / OUR STORY (AUTHENTIC HERITAGE) ===== -->
	<section id="cerita" class="py-14 sm:py-20 bg-white border-y border-slate-200/80">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
				<div class="lg:col-span-6 relative">
					<div class="rounded-3xl overflow-hidden border border-slate-200 shadow-xl relative aspect-4/3">
						<img
							src="/images/banner-toko.png"
							alt="Suasana Toko Aneka Rasa 99 Poris"
							class="w-full h-full object-cover"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-6">
							<div class="text-white space-y-1">
								<p class="text-xs font-extrabold text-amber-300 uppercase tracking-widest">Toko Fisik Kami</p>
								<p class="text-sm sm:text-base font-bold">Jl. Raya Poris Indah Blok B 11 No. 1, Tangerang</p>
							</div>
						</div>
					</div>
				</div>

				<div class="lg:col-span-6 space-y-5">
					<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold uppercase tracking-wide">
						<Store class="w-3.5 h-3.5" /> Cerita Dari Dapur Bangka
					</span>
					<h2 class="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight leading-snug">
						Menghadirkan Cita Rasa Asli Bangka Langsung ke Rumah Anda
					</h2>
					<p class="text-slate-600 text-sm sm:text-base leading-relaxed">
						Bermula dari kerinduan akan renyahnya kemplang panggang arang khas kampung halaman, <strong>Toko Aneka Rasa 99</strong> hadir di kawasan Poris Indah Tangerang untuk menjadi rumah bagi para pecinta kuliner autentik Bangka Belitung.
					</p>
					<p class="text-slate-600 text-sm sm:text-base leading-relaxed">
						Kami bekerja sama langsung dengan para pengrajin pesisir tradisional di Bangka. Setiap butir kemplang dan getas hanya menggunakan daging ikan tenggiri segar tanpa pengawet atau pemutih kimia. Itulah mengapa aroma harum arang dan gurih alaminya selalu dirindukan.
					</p>

					<div class="pt-2 flex items-center gap-4">
						<div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-black text-lg shrink-0">
							99
						</div>
						<div>
							<p class="font-extrabold text-slate-900 text-sm">Hendra & Keluarga</p>
							<p class="text-xs text-slate-500">Pendiri & Pengelola Toko Aneka Rasa 99</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ===== 5. MENGAPA KAMI (4 PILAR KEUNGGULAN) ===== -->
	<section id="keunggulan" class="py-14 sm:py-20 bg-[#FCFAF6]">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
				<span class="inline-block bg-amber-100 text-amber-900 text-xs font-black px-3 py-1 rounded-full">
					Standar Kualitas Tertinggi
				</span>
				<h2 class="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
					4 Alasan Mengapa Pelanggan Selalu Kembali ke <span class="text-red-600">Aneka Rasa 99</span>
				</h2>
				<p class="text-slate-600 text-xs sm:text-sm">
					Komitmen kami adalah menyajikan produk terbaik dengan rasa yang selalu konsisten dan pelayanan yang ramah.
				</p>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
				<div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-shadow">
					<div class="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center mb-4 shadow-sm">
						<ShieldCheck class="w-6 h-6" />
					</div>
					<h3 class="font-black text-slate-900 text-base mb-2">100% Ikan Tenggiri Asli</h3>
					<p class="text-xs text-slate-500 leading-relaxed">
						Menggunakan komposisi ikan tenggiri melimpah, bukan cuma tepung. Terasa gurih mantap di setiap gigitan.
					</p>
				</div>

				<div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-shadow">
					<div class="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-sm">
						<Truck class="w-6 h-6" />
					</div>
					<h3 class="font-black text-slate-900 text-base mb-2">Siap Kirim ke Seluruh RI</h3>
					<p class="text-xs text-slate-500 leading-relaxed">
						Melayani kirim ke Sumatera, Jawa, Bali, Kalimantan hingga Papua. Menggunakan ekspedisi cepat dan terpercaya.
					</p>
				</div>

				<div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-shadow">
					<div class="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-4 shadow-sm">
						<Package class="w-6 h-6" />
					</div>
					<h3 class="font-black text-slate-900 text-base mb-2">Garansi Packing Aman</h3>
					<p class="text-xs text-slate-500 leading-relaxed">
						Setiap pesanan dilapisi bubble wrap tebal dan kardus kuat. Bebas cemas kemplang remuk di perjalanan.
					</p>
				</div>

				<div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-shadow">
					<div class="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-sm">
						<Clock class="w-6 h-6" />
					</div>
					<h3 class="font-black text-slate-900 text-base mb-2">Buka Setiap Hari</h3>
					<p class="text-xs text-slate-500 leading-relaxed">
						Toko fisik buka non-stop dari 07.30 hingga 21.30 WIB. Kapanpun butuh oleh-oleh mendadak, kami selalu siap melayani!
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ===== 6. CARA PESAN (3 LANGKAH MUDAH) ===== -->
	<section class="py-14 sm:py-20 bg-white border-y border-slate-200/80">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2">
				<span class="text-xs font-extrabold text-red-600 uppercase tracking-widest">Praktis & Bebas Ribet</span>
				<h2 class="text-2xl sm:text-4xl font-black text-slate-950">Cara Mudah Memesan Oleh-Oleh</h2>
				<p class="text-xs sm:text-sm text-slate-500">Cukup 3 langkah sederhana, paket oleh-oleh sampai di depan pintu Anda.</p>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
				<div class="bg-slate-50 rounded-2xl p-6 border border-slate-200 relative text-center">
					<div class="w-10 h-10 rounded-full bg-red-600 text-white font-black text-sm flex items-center justify-center mx-auto mb-4 shadow">
						1
					</div>
					<h3 class="font-black text-slate-900 text-base mb-2">Pilih Produk Favorit</h3>
					<p class="text-xs text-slate-500 leading-relaxed">
						Telusuri kemplang panggang, getas, atau terasi yang Anda inginkan dari katalog produk di atas.
					</p>
				</div>

				<div class="bg-slate-50 rounded-2xl p-6 border border-slate-200 relative text-center">
					<div class="w-10 h-10 rounded-full bg-red-600 text-white font-black text-sm flex items-center justify-center mx-auto mb-4 shadow">
						2
					</div>
					<h3 class="font-black text-slate-900 text-base mb-2">Hubungi via WhatsApp</h3>
					<p class="text-xs text-slate-500 leading-relaxed">
						Kirim daftar pesanan Anda ke WhatsApp admin. Kami akan hitungkan total ongkos kirim termurah.
					</p>
				</div>

				<div class="bg-slate-50 rounded-2xl p-6 border border-slate-200 relative text-center">
					<div class="w-10 h-10 rounded-full bg-red-600 text-white font-black text-sm flex items-center justify-center mx-auto mb-4 shadow">
						3
					</div>
					<h3 class="font-black text-slate-900 text-base mb-2">Paket Tiba & Nikmati</h3>
					<p class="text-xs text-slate-500 leading-relaxed">
						Pesanan dipacking kardus tebal dan dikirim hari itu juga. Nikmati kerenyahannya bersama keluarga!
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ===== 7. TESTIMONI INTERAKTIF CAROUSEL ===== -->
	<section id="testimoni" class="py-14 sm:py-20 bg-[#FCFAF6] overflow-hidden">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-8 sm:mb-12 space-y-2">
				<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase">
					<ThumbsUp class="w-3.5 h-3.5" /> Ulasan Jujur Pelanggan
				</span>
				<h2 class="text-2xl sm:text-4xl font-black text-slate-950">
					Kata Mereka yang Sudah Menikmati
				</h2>
				<p class="text-xs sm:text-sm text-slate-500">
					Ribuan pelanggan dari Jakarta, Surabaya, Bandung hingga luar pulau mempercayakan oleh-olehnya pada kami.
				</p>
			</div>

			<!-- Carousel Card Frame -->
			<div class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl relative transition-all">
				<div class="flex items-center justify-between mb-6">
					<div class="flex items-center gap-3">
						<div class="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-rose-600 text-white font-black flex items-center justify-center shadow-md">
							{testimonials[activeTestimonial].avatar}
						</div>
						<div>
							<h3 class="font-black text-slate-900 text-base">{testimonials[activeTestimonial].name}</h3>
							<p class="text-xs text-slate-500 font-medium">{testimonials[activeTestimonial].city} • <span class="text-emerald-700 font-bold">{testimonials[activeTestimonial].tag}</span></p>
						</div>
					</div>

					<!-- Stars -->
					<div class="flex text-amber-400">
						{#each Array(testimonials[activeTestimonial].stars) as _}
						<Star class="w-4 h-4 fill-current" />
						{/each}
					</div>
				</div>

				<blockquote class="text-slate-700 text-sm sm:text-base leading-relaxed italic mb-6">
					"{testimonials[activeTestimonial].review}"
				</blockquote>

				<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
					<div class="text-xs text-slate-500">
						Produk dibeli: <strong class="text-slate-800">{testimonials[activeTestimonial].product}</strong>
					</div>

					<!-- Carousel Controls -->
					<div class="flex items-center gap-2 self-end sm:self-auto">
						<button
							onclick={prevTestimonial}
							class="w-10 h-10 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center transition active:scale-95 cursor-pointer"
							aria-label="Testimoni Sebelumnya"
						>
							<ChevronLeft class="w-5 h-5 text-slate-600" />
						</button>

						<div class="flex gap-1.5 px-2">
							{#each testimonials as _, i}
							<button
								onclick={() => activeTestimonial = i}
								class="w-2.5 h-2.5 rounded-full transition-all cursor-pointer {activeTestimonial === i ? 'w-6 bg-red-600' : 'bg-slate-300'}"
								aria-label="Pilih testimoni {i + 1}"
							></button>
							{/each}
						</div>

						<button
							onclick={nextTestimonial}
							class="w-10 h-10 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center transition active:scale-95 cursor-pointer"
							aria-label="Testimoni Selanjutnya"
						>
							<ChevronRight class="w-5 h-5 text-slate-600" />
						</button>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ===== 8. LOKASI TOKO & FORM PESAN CEPAT (MINIMALIS & HUMANIS) ===== -->
	<section id="kontak" class="py-14 sm:py-20 bg-white border-y border-slate-200/80">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid lg:grid-cols-12 gap-8 lg:gap-12">
				<!-- Left: Lokasi Toko & Google Maps -->
				<div class="lg:col-span-7 space-y-6">
					<div class="space-y-2">
						<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase">
							<MapPin class="w-3.5 h-3.5" /> Toko Fisik Kami
						</span>
						<h2 class="text-2xl sm:text-3xl font-black text-slate-950">Kunjungi Toko Fisik Kami di Poris</h2>
						<p class="text-xs sm:text-sm text-slate-600">
							Bagi Anda yang berdomisili di Tangerang, Jakarta Barat, atau sekitarnya, silakan mampir langsung untuk mencicipi dan memilih kemplang arang segar langsung dari toples!
						</p>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
							<div class="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
								<Clock class="w-4 h-4 text-amber-500" /> Jam Operasional
							</div>
							<p class="font-extrabold text-sm text-slate-900">{STORE_HOURS}</p>
							<p class="text-[11px] text-emerald-700 font-semibold mt-0.5">● Buka Setiap Hari (Termasuk Hari Libur)</p>
						</div>

						<div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
							<div class="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
								<Phone class="w-4 h-4 text-emerald-500" /> Kontak WhatsApp
							</div>
							<p class="font-extrabold text-sm text-slate-900">+62 813-8710-9586</p>
							<p class="text-[11px] text-slate-500 mt-0.5">Respon Cepat & Ramah</p>
						</div>
					</div>

					<!-- Google Maps Embed -->
					<div class="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-56 sm:h-64 relative">
						<iframe
							src="https://maps.google.com/maps?q=TOKO+ANEKA+RASA+99,+Jl.+Raya+Poris+Indah,+RT.007/RW.010,+Cipondoh+Indah,+Cipondoh,+Tangerang+City,+Banten+15122&t=&z=16&ie=UTF8&iwloc=&output=embed"
							style="border:0; width:100%; height:100%; display:block;"
							allowfullscreen={true}
							loading="lazy"
							referrerpolicy="no-referrer-when-downgrade"
							title="Lokasi Toko Aneka Rasa 99 di Google Maps"
						></iframe>
					</div>
				</div>

				<!-- Right: Elegant White Quick Order Form (No Screaming Red!) -->
				<div class="lg:col-span-5">
					<div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl relative">
						<div class="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
							<div class="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
								<ShoppingBag class="w-5 h-5" />
							</div>
							<div>
								<h3 class="font-black text-slate-900 text-lg">Form Pesan Cepat</h3>
								<p class="text-xs text-slate-500">Kirim format pesanan langsung ke WhatsApp admin</p>
							</div>
						</div>

						<form onsubmit={handleQuickOrderSubmit} class="space-y-4">
							<div>
								<label for="cname" class="block text-xs font-bold text-slate-700 mb-1">Nama Pemesan</label>
								<input
									id="cname"
									type="text"
									bind:value={customerName}
									placeholder="Contoh: Ibu Ratna"
									required
									class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm outline-none transition"
								/>
							</div>

							<div>
								<label for="ccity" class="block text-xs font-bold text-slate-700 mb-1">Kota / Kecamatan Tujuan</label>
								<input
									id="ccity"
									type="text"
									bind:value={customerCity}
									placeholder="Contoh: Surabaya Gubeng"
									required
									class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm outline-none transition"
								/>
							</div>

							<div>
								<label for="cprod" class="block text-xs font-bold text-slate-700 mb-1">Produk yang Diinginkan</label>
								<select
									id="cprod"
									bind:value={selectedQuickProduct}
									class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm outline-none transition bg-white"
								>
									<option value="">-- Pilih Produk Utama --</option>
									{#each FEATURED as p}
									<option value={p.name}>{p.name} (Rp {formatCurrency(p.price)})</option>
									{/each}
									<option value="Paket Campur Oleh-Oleh">Paket Campur Oleh-Oleh</option>
									<option value="Lainnya (Tanya via WA)">Lainnya (Tanya via WA)</option>
								</select>
							</div>

							<div>
								<label for="cnotes" class="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan (Jumlah / Permintaan)</label>
								<textarea
									id="cnotes"
									bind:value={orderNotes}
									rows={2}
									placeholder="Contoh: Kemplang 3 bks + Getas 2 bks, sambal ditambah ya..."
									class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm outline-none transition resize-none"
								></textarea>
							</div>

							<button
								type="submit"
								class="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition active:scale-98 cursor-pointer text-sm"
							>
								<svg class="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
								<span>Kirim Pesanan ke WhatsApp</span>
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ===== 9. FAQ ACCORDION SECTION ===== -->
	<section class="py-14 sm:py-20 bg-[#FCFAF6] border-b border-slate-200/80">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center mb-10 space-y-2">
				<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 text-slate-800 text-xs font-black uppercase">
					<HelpCircle class="w-3.5 h-3.5" /> Pertanyaan Populer
				</span>
				<h2 class="text-2xl sm:text-4xl font-black text-slate-950">Tanya Jawab Seputar Produk</h2>
				<p class="text-xs sm:text-sm text-slate-500">Semua yang perlu Anda ketahui sebelum memesan oleh-oleh khas Bangka di toko kami.</p>
			</div>

			<div class="space-y-3">
				{#each faqs as faq, i}
				<div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
					<button
						onclick={() => toggleFaq(i)}
						class="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-red-600 transition cursor-pointer"
					>
						<span>{faq.q}</span>
						<ChevronDown class="w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 {openFaq === i ? 'rotate-180 text-red-600' : ''}" />
					</button>
					{#if openFaq === i}
					<div class="px-5 sm:px-6 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-150">
						{faq.a}
					</div>
					{/if}
				</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- ===== 10. FOOTER ===== -->
	<footer class="bg-slate-950 text-slate-400 pt-12 pb-16">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
				<!-- Brand Col -->
				<div class="md:col-span-2 space-y-4">
					<div class="flex items-center gap-3">
						<img src="/logo.png" alt="Toko Aneka Rasa 99" class="w-11 h-11 rounded-full object-cover border border-slate-700" />
						<div>
							<p class="text-white font-black text-base">Toko Aneka Rasa 99</p>
							<p class="text-xs text-red-400 font-bold">Pusat Oleh-Oleh Khas Bangka Belitung</p>
						</div>
					</div>
					<p class="text-xs text-slate-400 leading-relaxed max-w-md">
						Menyediakan aneka kemplang panggang arang, getas ikan tenggiri, terasi super, kerupuk pasir, dan ratusan oleh-oleh khas Bangka Belitung berkualitas premium.
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
						<li><a href="#katalog" class="hover:text-white transition">Katalog Produk</a></li>
						<li><a href="#cerita" class="hover:text-white transition">Cerita Toko</a></li>
						<li><a href="#keunggulan" class="hover:text-white transition">Keunggulan Kami</a></li>
						<li><a href="#testimoni" class="hover:text-white transition">Testimoni Pelanggan</a></li>
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
	</footer>

</div>
