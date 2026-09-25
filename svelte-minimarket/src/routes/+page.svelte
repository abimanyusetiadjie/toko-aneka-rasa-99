<script lang="ts">
	import type { PageData } from './$types';
	import {
		Phone, MapPin, Clock, Star, ShoppingBag, ShieldCheck,
		ChevronRight, ChevronLeft, Menu, X, ArrowRight, Truck, Award, Sparkles,
		MessageCircle, ExternalLink, User, ShoppingCart,
		Plus, Minus, Trash2, CheckCircle2, ThumbsUp, ChevronDown, HelpCircle,
		Package, Store, Check, Coffee, Eye, Flame
	} from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const WA_PHONE = '6281387109586';
	const STORE_NAME = 'Toko Aneka Rasa 99';
	const STORE_ADDRESS = 'Perumahan Poris Indah Blok B 11 No. 1, RT 001/RW 005, Kel. Cipondoh Indah, Kec. Cipondoh, Kota Tangerang, Banten 15148';
	const STORE_HOURS = 'Buka Setiap Hari: 07.30 – 21.30 WIB';

	let mobileMenuOpen = $state(false);
	let cartOpen = $state(false);
	let waBubbleVisible = $state(true);

	// Lightbox Modal for Posters
	let activePosterModal = $state<string | null>(null);

	// Category filter state
	type ProductCategory = 'khas-bangka' | 'kerupuk-mentah' | 'kue-tradisional' | 'terasi-kopi';
	let selectedCategory = $state<ProductCategory>('khas-bangka');

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

	const PRODUCTS: FeaturedProduct[] = [
		// 1. Khas Bangka Matang
		{
			id: 'p1',
			name: 'Kemplang Panggang Cap MM',
			category: 'khas-bangka',
			desc: 'Dipanggang tradisional arang kelapa. Gurih renyah di luar, empuk gurih daging ikan tenggiri di dalam. Sudah lengkap dengan sambal terasi Bangka autentik.',
			price: 37500,
			originalPrice: 43000,
			weight: '250 gr',
			rating: 5.0,
			reviewsCount: 142,
			image: '/images/products/kemplang-mm.jpg',
			badge: '🔥 Paling Laris',
			highlight: 'Sambal Terasi Asli'
		},
		{
			id: 'p2',
			name: 'Getas Super Cap Obor (Tiga Roda)',
			category: 'khas-bangka',
			desc: 'Getas bulat lonjong dari daging ikan tenggiri segar pilihan. Tekstur renyah empuk, tidak keras saat digigit, dan rasa gurih alami yang bikin nagih.',
			price: 42500,
			originalPrice: 48000,
			weight: '250 gr',
			rating: 4.9,
			reviewsCount: 118,
			image: '/images/products/getas.png',
			badge: '⭐ Favorit Pembeli',
			highlight: 'Ikan Tenggiri Super'
		},
		{
			id: 'p3',
			name: 'Steak Telor Cumi Kuda Laut (Kericu)',
			category: 'khas-bangka',
			desc: 'Keripik dari telur cumi segar khas Bangka. Gurih, renyah, dan aroma cumi yang khas. Camilan premium dengan cita rasa otentik.',
			price: 30000,
			originalPrice: 35000,
			weight: '200 gr',
			rating: 4.9,
			reviewsCount: 92,
			image: '/images/products/steak-cumi-kuda-laut.jpg',
			badge: '🦑 Premium',
			highlight: 'Telur Cumi Segar'
		},
		{
			id: 'p4',
			name: 'Getas Lonceng Mas Khas Bangka',
			category: 'khas-bangka',
			desc: 'Getas butir bulat renyah kualitas super khas kepulauan Bangka. Sangat cocok untuk teman makan bakso, mie kuah, maupun camilan santai keluarga.',
			price: 38000,
			originalPrice: 43000,
			weight: '250 gr',
			rating: 4.9,
			reviewsCount: 76,
			image: '/images/products/getes-lonceng-mas.jpg',
			badge: '🐟 Gurih Maksimal',
			highlight: 'Ikan Tenggiri Murni'
		},

		// 2. Terasi & Kopi Bangka
		{
			id: 'p5',
			name: 'Terasi No. 1 Pulau Bangka AB Toboali',
			category: 'terasi-kopi',
			desc: 'Terasi udang rebon asli Toboali Bangka Selatan. Tanpa pewarna buatan, wangi harum semerbak, rahasia kelezatan sambal dan tumisan khas Bangka.',
			price: 35000,
			originalPrice: 40000,
			weight: '250 gr',
			rating: 5.0,
			reviewsCount: 95,
			image: '/images/products/terasi.png',
			badge: '🦐 Terasi Toboali',
			highlight: 'Udang Rebon Super'
		},
		{
			id: 'p6',
			name: 'Kopi Bubuk Cap 1 (Legendaris 1968)',
			category: 'terasi-kopi',
			desc: 'Kopi legendaris khas Sungailiat Bangka yang diproduksi sejak tahun 1968. Aroma harum khas roastery tradisional, pekat nikmat tiada tara.',
			price: 25000,
			originalPrice: 29000,
			weight: '200 gr',
			rating: 4.9,
			reviewsCount: 68,
			image: '/images/banners/poster-khas-bangka.jpg',
			badge: '☕ Sejak 1968',
			highlight: 'Aroma Sangrai Autentik'
		},
		{
			id: 'p7',
			name: 'Kopi Asli Cap Kingkong',
			category: 'terasi-kopi',
			desc: 'Kopi hitam khas Bangka dengan citarasa robusta kuat dan aroma khas warung kopi peranakan Bangka. Favorit pecinta kopi mantap.',
			price: 22000,
			originalPrice: 26000,
			weight: '200 gr',
			rating: 4.8,
			reviewsCount: 52,
			image: '/images/banners/poster-khas-bangka.jpg',
			badge: '🦍 Khas Warkop',
			highlight: 'Citarasa Pekat Mantap'
		},

		// 3. Agen Kerupuk Mentah (Grosir & Eceran)
		{
			id: 'p8',
			name: 'Kerupuk Ikan Mentah Khas Bangka',
			category: 'kerupuk-mentah',
			desc: 'Kerupuk mentah kualitas istimewa langsung dari pengrajin. Sangat mudah digoreng, mekar sempurna hingga 3x lipat, renyah dan gurih alami.',
			price: 35000,
			originalPrice: 40000,
			weight: '500 gr',
			rating: 4.9,
			reviewsCount: 88,
			image: '/images/products/kerupuk-mentah.png',
			badge: '🍳 Mekar Sempurna',
			highlight: 'Grosir & Eceran'
		},
		{
			id: 'p9',
			name: 'Kerupuk Udang Mentah Super',
			category: 'kerupuk-mentah',
			desc: 'Kerupuk udang mentah beraroma gurih renyah. Cocok untuk pelengkap catering, warung makan, hajatan, maupun digoreng sendiri di rumah.',
			price: 38000,
			originalPrice: 44000,
			weight: '500 gr',
			rating: 4.8,
			reviewsCount: 62,
			image: '/images/banners/poster-kerupuk-mentah.jpg',
			badge: '🦐 Udang Berasa',
			highlight: 'Pilihan Rumah Makan'
		},
		{
			id: 'p10',
			name: 'Kerupuk Jengkol & Bawang Mentah',
			category: 'kerupuk-mentah',
			desc: 'Kerupuk mentah varian jengkol dan bawang putih. Renyah garing khas nusantara, rasa gurih sedap untuk teman nasi hangat.',
			price: 40000,
			originalPrice: 46000,
			weight: '500 gr',
			rating: 4.8,
			reviewsCount: 47,
			image: '/images/banners/poster-kerupuk-mentah.jpg',
			badge: '🧄 Gurih Sedap',
			highlight: 'Bumbu Alami Pilihan'
		},

		// 4. Aneka Kue Tradisional Bangka
		{
			id: 'p11',
			name: 'Kue Semprong Arang Tradisional',
			category: 'kue-tradisional',
			desc: 'Kue semprong gulung yang dipanggang dengan cetakan arang tradisional. Renyah rapuh, manis gurih dengan aroma wangi kelapa panggang.',
			price: 30000,
			originalPrice: 35000,
			weight: '250 gr',
			rating: 4.9,
			reviewsCount: 71,
			image: '/images/banners/poster-aneka-kue.jpg',
			badge: '🥥 Panggang Arang',
			highlight: 'Renyah & Manis Legit'
		},
		{
			id: 'p12',
			name: 'Roti Kering / Roker Mr. Jo',
			category: 'kue-tradisional',
			desc: 'Roti kering renyah khas Bangka dengan olesan mentega dan gula gurih. Teman paling serasi untuk dicelup ke kopi hitam atau teh panas.',
			price: 28000,
			originalPrice: 33000,
			weight: '200 gr',
			rating: 4.8,
			reviewsCount: 54,
			image: '/images/banners/poster-aneka-kue.jpg',
			badge: '🍞 Sahabat Kopi',
			highlight: 'Krispi Tahan Lama'
		},
		{
			id: 'p13',
			name: 'Kue Sempret Cap ED & Kue Rintak',
			category: 'kue-tradisional',
			desc: 'Kue sempret dan kue rintak sagu asli resep turun-temurun Bangka. Meleleh empuk di lidah dengan rasa gurih manis santan asli.',
			price: 28000,
			originalPrice: 32000,
			weight: '250 gr',
			rating: 4.9,
			reviewsCount: 63,
			image: '/images/banners/poster-aneka-kue.jpg',
			badge: '🍪 Resep Autentik',
			highlight: 'Sagu Bangka Murni'
		}
	];

	let filteredProducts = $derived(PRODUCTS.filter(p => p.category === selectedCategory));

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
		const msg = `Halo ${STORE_NAME}!\n\nSaya ingin memesan oleh-oleh khas Bangka:\n${lines}\n\n*Total Belanja:* Rp ${formatCurrency(cartTotal)}\n\nMohon informasi ketersediaan stok & ongkir ke alamat saya ya. Terima kasih!`;
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
			product: 'Getas Super Cap Obor (Tiga Roda)',
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
			review: 'Sudah langganan bertahun-tahun langsung ke tokonya di Poris. Beli kerupuk mentah buat stok warung makan dan oleh-oleh ke mertua. Kualitasnya selalu konsisten nomor satu!',
			stars: 5,
			product: 'Kerupuk Mentah & Kemplang',
			tag: 'Langganan Poris'
		},
		{
			name: 'Ibu Dian Pratiwi',
			city: 'Bandung',
			avatar: 'DP',
			review: 'Terasi AB Toboali Bangka-nya benar-benar juara dunia! Wangi alami tanpa pewarna merah aneh. Bikin tumis kangkung terasi aromanya langsung persis waktu liburan ke Belitung asli.',
			stars: 5,
			product: 'Terasi No. 1 Pulau Bangka AB',
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
			a: 'Benar sekali! Semua kemplang panggang MM, getas ikan tenggiri, terasi udang rebon Toboali, kopi Cap 1 & Kingkong, hingga aneka kue tradisional didatangkan langsung dari pengrajin terpercaya di Pulau Bangka Belitung.'
		},
		{
			q: 'Apakah melayani pembelian kerupuk mentah dalam jumlah grosir / reseller?',
			a: 'Tentu saja! Kami adalah pusat grosir & eceran kerupuk mentah di Tangerang. Sedia kerupuk ikan mentah, udang, jengkol, bawang, cap Dakota & Lapter 99. Siap kirim karungan maupun bal-balan untuk reseller dan rumah makan dengan harga sangat bersaing.'
		},
		{
			q: 'Di mana alamat toko fisik Toko Aneka Rasa 99?',
			a: 'Toko kami beralamat di Perumahan Poris Indah Blok B 11 No. 1, Kel. Cipondoh Indah, Kec. Cipondoh, Kota Tangerang. Buka setiap hari mulai pukul 07.30 hingga 21.30 WIB. Lokasi dapat dicari di Google Maps dengan nama "Toko Aneka Rasa 99".'
		},
		{
			q: 'Bagaimana keamanan packing pengiriman kerupuk ke luar kota?',
			a: 'Kami menerapkan standar packing berlapis: setiap produk dibalut bubble wrap tebal dan dimasukkan ke dalam kardus tebal berlapis stiker Fragile/Jangan Dibanting. Kerupuk tiba di tangan Anda tetap utuh, renyah, dan siap dinikmati.'
		},
		{
			q: 'Bagaimana cara pemesanan cepat online?',
			a: 'Anda cukup klik tombol WhatsApp di website ini atau masukkan produk ke keranjang belanja lalu klik checkout WA. Admin kami langsung merespons dengan total rincian belanja dan rekomendasi ongkos kirim termurah.'
		}
	];
</script>

<svelte:head>
	<title>Toko Aneka Rasa 99 Poris | Pusat Makanan Khas Bangka, Agen Kerupuk Mentah & Kue Tradisional</title>
	<meta name="description" content="Pusat Grosir & Eceran Kemplang Panggang Arang MM, Getas Tenggiri Obor, Terasi AB Toboali, Kopi Cap 1, Aneka Kerupuk Mentah, dan Kue Tradisional Bangka di Poris Tangerang. Siap kirim seluruh Indonesia." />
	<meta name="keywords" content="toko aneka rasa 99, agen kerupuk mentah poris, kemplang bangka tangerang, getas tenggiri poris indah, terasi toboali bangka, kopi cap 1 bangka, kue semprong bangka" />
	<meta name="author" content="Toko Aneka Rasa 99" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="https://tokoanekarasa99.my.id/" />
	<meta property="og:title" content="Toko Aneka Rasa 99 Poris | Makanan Khas Bangka & Agen Kerupuk Mentah" />
	<meta property="og:description" content="Pusat Grosir & Eceran Kemplang Panggang, Getas Tenggiri, Terasi Super, dan Aneka Kerupuk Mentah Siap Kirim Seluruh Indonesia!" />
	<meta property="og:image" content="https://tokoanekarasa99.my.id/images/banners/poster-khas-bangka.jpg" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
	{@html `<script type="application/ld+json">{"@context":"https://schema.org","@type":["Store","LocalBusiness"],"name":"Toko Aneka Rasa 99","url":"https://tokoanekarasa99.my.id","logo":"https://tokoanekarasa99.my.id/logo.png","image":"https://tokoanekarasa99.my.id/logo.png","telephone":"+6281387109586","address":{"@type":"PostalAddress","streetAddress":"Perumahan Poris Indah Blok B 11 No. 1, RT 001/RW 005, Kel. Cipondoh Indah","addressLocality":"Kota Tangerang","addressRegion":"Banten","postalCode":"15148","addressCountry":"ID"},"geo":{"@type":"GeoCoordinates","latitude":-6.1783,"longitude":106.6713},"openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],"opens":"07:30","closes":"21:30"}],"aggregateRating":{"@type":"AggregateRating","ratingValue":"4.9","reviewCount":"128"}}<\/script>`}
</svelte:head>

<style>
	@keyframes float-subtle {
		0%, 100% { transform: translateY(0px); }
		50% { transform: translateY(-8px); }
	}
	@keyframes float-delayed {
		0%, 100% { transform: translateY(0px) rotate(0deg); }
		50% { transform: translateY(-6px) rotate(1deg); }
	}
	@keyframes shimmer-sweep {
		0% { transform: translateX(-150%) skewX(-20deg); }
		100% { transform: translateX(250%) skewX(-20deg); }
	}
	.animate-float {
		animation: float-subtle 4s ease-in-out infinite;
	}
	.animate-float-delayed {
		animation: float-delayed 4.5s ease-in-out infinite 1.5s;
	}
	.shimmer-btn {
		position: relative;
		overflow: hidden;
	}
	.shimmer-btn::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 40%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
		animation: shimmer-sweep 3.5s infinite;
	}
</style>

<div class="min-h-screen bg-[#FCFAF6] text-slate-800 font-sans selection:bg-red-500 selection:text-white relative overflow-x-clip w-full">

	<!-- ===== LIGHTBOX MODAL FOR POSTERS ===== -->
	{#if activePosterModal}
	<div
		class="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
		onclick={() => activePosterModal = null}
		role="dialog"
		aria-modal="true"
	>
		<div class="relative max-w-3xl max-h-[90vh] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-700" onclick={(e) => e.stopPropagation()}>
			<button
				onclick={() => activePosterModal = null}
				class="absolute top-4 right-4 z-10 bg-slate-900/80 hover:bg-red-600 text-white w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer shadow-lg"
				aria-label="Tutup Banner"
			>
				✕
			</button>
			<img src={activePosterModal} alt="Poster Toko Aneka Rasa 99" class="max-h-[82vh] w-auto mx-auto rounded-xl object-contain" />
			<div class="p-3 text-center">
				<a
					href="https://wa.me/{WA_PHONE}?text={encodeURIComponent('Halo Toko Aneka Rasa 99, saya tertarik dengan produk di poster ini. Mau tanya info stok dan harganya:')}"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-md transition"
				>
					<MessageCircle class="w-4 h-4" /> Tanya / Pesan Produk di Poster Ini
				</a>
			</div>
		</div>
	</div>
	{/if}

	<!-- ===== FLOATING WHATSAPP BUTTON ===== -->
	<div class="fixed bottom-5 right-4 sm:right-6 z-40 flex flex-col items-end gap-2 pointer-events-none">
		<a
			href="https://wa.me/{WA_PHONE}?text={encodeURIComponent('Halo Toko Aneka Rasa 99, saya ingin tanya seputar produk oleh-oleh Bangka:')}"
			target="_blank"
			rel="noopener noreferrer"
			class="pointer-events-auto group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xl shadow-emerald-600/35 hover:shadow-2xl hover:shadow-emerald-600/50 hover:scale-105 active:scale-95 transition-all duration-200"
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
		<div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-t-3xl md:rounded-t-2xl shrink-0">
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
						<span class="hidden sm:block text-[11px] text-red-600 font-bold tracking-wide leading-none mt-1 truncate">Pusat Oleh-Oleh Khas Bangka</span>
					</div>
				</a>

				<!-- Desktop Nav Links -->
				<div class="hidden md:flex items-center gap-6 lg:gap-7 text-xs lg:text-sm font-bold text-slate-600">
					<a href="#hero" class="hover:text-red-600 transition-colors">Beranda</a>
					<a href="#katalog" class="hover:text-red-600 transition-colors">Katalog & Produk</a>
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

					<!-- WhatsApp Primary CTA with shimmer effect -->
					<a
						href="https://wa.me/{WA_PHONE}?text={encodeURIComponent('Halo Toko Aneka Rasa 99, saya ingin memesan oleh-oleh khas Bangka:')}"
						target="_blank"
						rel="noopener noreferrer"
						class="shimmer-btn hidden sm:inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 lg:px-5 py-2.5 rounded-xl text-xs lg:text-sm font-extrabold shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 transition-all cursor-pointer active:scale-95"
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
				<a href="#katalog" onclick={() => mobileMenuOpen = false} class="px-3 py-2 rounded-lg font-bold text-slate-700 hover:bg-slate-50 hover:text-red-600 text-sm">Katalog & Produk</a>
				<a href="#testimoni" onclick={() => mobileMenuOpen = false} class="px-3 py-2 rounded-lg font-bold text-slate-700 hover:bg-slate-50 hover:text-red-600 text-sm">Testimoni</a>
				<a href="#kontak" onclick={() => mobileMenuOpen = false} class="px-3 py-2 rounded-lg font-bold text-slate-700 hover:bg-slate-50 hover:text-red-600 text-sm">Lokasi & Pesan</a>
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
	<section id="hero" class="relative pt-10 pb-16 sm:pt-14 sm:pb-20 md:pt-20 md:pb-24 overflow-hidden isolate bg-gradient-to-b from-[#FFF5EC] via-[#FFFDF9] to-[#FCFAF6]">
		<!-- Decorative Ambient Glows -->
		<div class="absolute -top-24 -left-20 w-96 h-96 bg-red-200/40 rounded-full blur-3xl pointer-events-none -z-10"></div>
		<div class="absolute top-1/2 -right-24 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
				<!-- Left Column: Emotional Pitch & High-Converting CTAs -->
				<div class="lg:col-span-7 text-center lg:text-left space-y-4 sm:space-y-6">
					<!-- Live Store Status Badge -->
					<div class="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
						<span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
						<span>Buka Setiap Hari: 07.30 – 21.30 WIB</span>
						<span class="text-emerald-300">•</span>
						<span class="text-emerald-700 font-extrabold">Poris Indah, Tangerang</span>
					</div>

					<!-- Hero Headline -->
					<div class="space-y-2">
						<span class="text-xs sm:text-sm font-extrabold tracking-widest text-red-600 uppercase block">
							✨ Pusat Oleh-Oleh Khas Bangka & Agen Kerupuk Mentah
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
						Pusat Kemplang Panggang Arang Cap MM, Getas Super Tenggiri Obor, Terasi Toboali, Kopi Cap 1, hingga <strong>Grosir & Eceran Aneka Kerupuk Mentah</strong>. Renyahnya juara, gurihnya alami tanpa pengawet.
					</p>

					<!-- Action Buttons -->
					<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
						<!-- Primary WhatsApp CTA with Shimmer -->
						<a
							href="https://wa.me/{WA_PHONE}?text={encodeURIComponent('Halo Toko Aneka Rasa 99, saya ingin memesan kemplang & oleh-oleh khas Bangka:')}"
							target="_blank"
							rel="noopener noreferrer"
							class="shimmer-btn bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
						>
							<svg class="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
							<span>Pesan Cepat via WhatsApp</span>
							<ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
						</a>

						<!-- Secondary 3 Lini Produk CTA -->
						<a
							href="#lini-produk"
							class="bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
						>
							<Sparkles class="w-4 h-4 text-amber-500" />
							<span>Lihat 3 Lini Produk Utama</span>
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

				<!-- Right Column: Visual Stage with Real Poster & Floating Elements -->
				<div class="lg:col-span-5 relative">
					<div class="relative group">
						<!-- Outer Warm Glow Card -->
						<div class="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 aspect-square relative cursor-pointer" onclick={() => activePosterModal = '/images/banners/poster-khas-bangka.jpg'}>
							<img
								src="/images/banners/poster-khas-bangka.jpg"
								alt="Katalog Makanan Khas Bangka Toko Aneka Rasa 99"
								class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
							/>
							<div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
							
							<div class="absolute bottom-4 inset-x-4 flex items-center justify-between text-white">
								<div>
									<span class="px-2.5 py-0.5 bg-red-600 text-[10px] font-black rounded-full uppercase tracking-wider mb-1 inline-block">Khas Bangka Pilihan</span>
									<p class="font-black text-sm sm:text-base">Aneka Makanan Khas Bangka</p>
									<p class="text-[11px] text-amber-300">Klik untuk perbesar banner</p>
								</div>
								<div class="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-red-600 transition-colors">
									<Eye class="w-4 h-4" />
								</div>
							</div>
						</div>

						<!-- Floating Pill 1 (Top-Left) -->
						<div class="animate-float absolute -top-4 -left-4 sm:-top-5 sm:-left-6 bg-white/95 backdrop-blur-md border border-amber-200 rounded-2xl p-2.5 sm:p-3 shadow-xl flex items-center gap-2.5 z-20">
							<div class="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 font-bold">
								🐟
							</div>
							<div class="text-left text-xs">
								<p class="font-black text-slate-900 leading-none">100% Tenggiri Asli</p>
								<p class="text-[10px] text-slate-500 font-semibold mt-0.5">Tanpa Pemutih / Pengawet</p>
							</div>
						</div>

						<!-- Floating Pill 2 (Bottom-Right) -->
						<div class="animate-float-delayed absolute -bottom-4 -right-3 sm:-bottom-5 sm:-right-5 bg-white/95 backdrop-blur-md border border-emerald-200 rounded-2xl p-2.5 sm:p-3 shadow-xl flex items-center gap-2.5 z-20">
							<div class="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 font-bold">
								⭐
							</div>
							<div class="text-left text-xs">
								<p class="font-black text-slate-900 leading-none">Rating 4.9 / 5.0</p>
								<p class="text-[10px] text-slate-500 font-semibold mt-0.5">Ulasan Google & Shopee</p>
							</div>
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

	<!-- ===== 3. NEW BENTO SHOWCASE: 3 LINI PRODUK UTAMA TOKO ===== -->
	<section id="lini-produk" class="py-14 sm:py-20 bg-[#F9F6F0] border-b border-slate-200/80">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<!-- Section Header -->
			<div class="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
				<span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
					<Sparkles class="w-3.5 h-3.5 text-amber-600" /> 3 Pilar Kekuatan Toko Kami
				</span>
				<h2 class="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
					Pilihan Terlengkap untuk Segala Kebutuhan Oleh-Oleh
				</h2>
				<p class="text-slate-600 text-xs sm:text-sm sm:leading-relaxed">
					Dari camilan matang siap santap, agen grosir kerupuk mentah untuk resto & reseller, hingga aneka kue kering tradisional legendaris. Klik kartu untuk melihat banner detail!
				</p>
			</div>

			<!-- Bento Grid (3 Cards) -->
			<div class="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-5 md:gap-8 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
				
				<!-- Bento Card 1: Makanan Khas Bangka -->
				<div class="bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col group shrink-0 w-[85%] snap-center md:w-auto">
					<div class="relative aspect-square overflow-hidden bg-slate-950 cursor-pointer" onclick={() => activePosterModal = '/images/banners/poster-khas-bangka.jpg'}>
						<img
							src="/images/banners/poster-khas-bangka.jpg"
							alt="Makanan Khas Bangka"
							class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
							<div class="text-white">
								<span class="px-2.5 py-1 bg-red-600 text-white rounded-full text-[10px] font-black uppercase">Paling Favorit</span>
								<h3 class="text-lg font-black mt-1">Makanan Khas Bangka</h3>
							</div>
						</div>
						<div class="absolute top-3 right-3 bg-black/50 text-white px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-xs flex items-center gap-1">
							<Eye class="w-3.5 h-3.5" /> Lihat Detail
						</div>
					</div>
					<div class="p-5 flex-1 flex flex-col justify-between space-y-4">
						<div class="space-y-2">
							<p class="text-xs text-slate-600 leading-relaxed">
								Kemplang Panggang Cap MM, Getas Super Cap Obor, Terasi AB Toboali, Kopi Cap 1, dan Getas Lonceng Mas. Resep warisan asli kepulauan Bangka.
							</p>
							<div class="flex flex-wrap gap-1.5 pt-1">
								<span class="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">Panggang Arang</span>
								<span class="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">Sambal Terasi</span>
								<span class="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">Tenggiri Segar</span>
							</div>
						</div>
						<button
							onclick={() => { selectedCategory = 'khas-bangka'; document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' }); }}
							class="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 shadow-sm"
						>
							<span>Pilih Produk Khas Bangka</span>
							<ArrowRight class="w-4 h-4" />
						</button>
					</div>
				</div>

				<!-- Bento Card 2: Agen Kerupuk Mentah -->
				<div class="bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col group shrink-0 w-[85%] snap-center md:w-auto">
					<div class="relative aspect-square overflow-hidden bg-slate-950 cursor-pointer" onclick={() => activePosterModal = '/images/banners/poster-kerupuk-mentah.jpg'}>
						<img
							src="/images/banners/poster-kerupuk-mentah.jpg"
							alt="Agen Kerupuk Mentah Aneka Rasa 99 Poris"
							class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
							<div class="text-white">
								<span class="px-2.5 py-1 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black uppercase">Grosir & Eceran</span>
								<h3 class="text-lg font-black mt-1">Pusat Kerupuk Mentah</h3>
							</div>
						</div>
						<div class="absolute top-3 right-3 bg-black/50 text-white px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-xs flex items-center gap-1">
							<Eye class="w-3.5 h-3.5" /> Lihat Detail
						</div>
					</div>
					<div class="p-5 flex-1 flex flex-col justify-between space-y-4">
						<div class="space-y-2">
							<p class="text-xs text-slate-600 leading-relaxed">
								Kerupuk ikan mentah, udang mentah, kerupuk jengkol, bawang putih, cap Dakota & Lapter 99. Siap kirim bal-balan untuk reseller & rumah makan.
							</p>
							<div class="flex flex-wrap gap-1.5 pt-1">
								<span class="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md">Harga Grosir Pabrik</span>
								<span class="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md">Mekar Sempurna</span>
								<span class="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md">Stok Terlengkap</span>
							</div>
						</div>
						<a
							href="https://wa.me/{WA_PHONE}?text={encodeURIComponent('Halo Toko Aneka Rasa 99, saya tertarik dengan informasi Grosir / Reseller Kerupuk Mentah. Mohon info pricelistnya ya:')}"
							target="_blank"
							rel="noopener noreferrer"
							class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 shadow-sm"
						>
							<span>Tanya Grosir Kerupuk via WA</span>
							<ArrowRight class="w-4 h-4" />
						</a>
					</div>
				</div>

				<!-- Bento Card 3: Aneka Kue Khas Bangka -->
				<div class="bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col group shrink-0 w-[85%] snap-center md:w-auto">
					<div class="relative aspect-square overflow-hidden bg-slate-950 cursor-pointer" onclick={() => activePosterModal = '/images/banners/poster-aneka-kue.jpg'}>
						<img
							src="/images/banners/poster-aneka-kue.jpg"
							alt="Aneka Kue Tradisional Khas Bangka"
							class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
							<div class="text-white">
								<span class="px-2.5 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-black uppercase">Resep Tradisional</span>
								<h3 class="text-lg font-black mt-1">Aneka Kue Kering Bangka</h3>
							</div>
						</div>
						<div class="absolute top-3 right-3 bg-black/50 text-white px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-xs flex items-center gap-1">
							<Eye class="w-3.5 h-3.5" /> Lihat Detail
						</div>
					</div>
					<div class="p-5 flex-1 flex flex-col justify-between space-y-4">
						<div class="space-y-2">
							<p class="text-xs text-slate-600 leading-relaxed">
								Kue Semprong arang, Roti Kering / Roker Mr. Jo, Kue Sempret Cap ED, dan Kue Rintak sagu murni. Renyah, gurih, dan legit khas masa lalu.
							</p>
							<div class="flex flex-wrap gap-1.5 pt-1">
								<span class="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">Teman Santai Kopi</span>
								<span class="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">Tanpa Pengawet</span>
								<span class="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">Cocok Buat Hampers</span>
							</div>
						</div>
						<button
							onclick={() => { selectedCategory = 'kue-tradisional'; document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' }); }}
							class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 shadow-sm"
						>
							<span>Pilih Aneka Kue Kering</span>
							<ArrowRight class="w-4 h-4" />
						</button>
					</div>
				</div>

			</div>
		</div>
	</section>

	<!-- ===== 4. KATALOG PRODUK DINAMIS (DENGAN FILTER CEPAT) ===== -->
	<section id="katalog" class="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Section Header -->
		<div class="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-3">
			<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-extrabold uppercase tracking-wide">
				<Award class="w-3.5 h-3.5" /> Daftar Produk Lengkap
			</span>
			<h2 class="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
				Katalog Oleh-Oleh & Kerupuk <span class="text-red-600">Aneka Rasa 99</span>
			</h2>
			<p class="text-slate-600 text-xs sm:text-sm sm:leading-relaxed">
				Pilih kategori di bawah untuk menemukan camilan dan oleh-oleh impian Anda. Pesan satuan maupun partai besar langsung dikirim dengan packing aman!
			</p>
		</div>

		<!-- Category Filter Pills -->
		<div class="flex items-center justify-center flex-wrap gap-2 mb-8 sm:mb-12">

			<button
				onclick={() => selectedCategory = 'khas-bangka'}
				class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer {selectedCategory === 'khas-bangka' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'}"
			>
				🔥 Kemplang & Getas Panggang
			</button>
			<button
				onclick={() => selectedCategory = 'kerupuk-mentah'}
				class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer {selectedCategory === 'kerupuk-mentah' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'}"
			>
				📦 Kerupuk Mentah (Grosir/Ecer)
			</button>
			<button
				onclick={() => selectedCategory = 'terasi-kopi'}
				class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer {selectedCategory === 'terasi-kopi' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'}"
			>
				🦐 Terasi & Kopi Bangka
			</button>
			<button
				onclick={() => selectedCategory = 'kue-tradisional'}
				class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer {selectedCategory === 'kue-tradisional' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'}"
			>
				🍪 Aneka Kue Tradisional
			</button>
		</div>

		<!-- Product Grid -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
			{#each filteredProducts as product (product.id)}
			<div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden group">
				<!-- Product Image Area -->
				<div class="relative bg-white aspect-[4/3] sm:aspect-square overflow-hidden p-2">
					<img
						src={product.image}
						alt="{product.name} - Aneka Rasa 99"
						class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
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
						<span>Berat: <strong>{product.weight}</strong></span>
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
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
						<button
							onclick={() => addToCart(product)}
							class="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold py-3 sm:py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
							title="Tambah ke Keranjang"
						>
							<ShoppingCart class="w-4 h-4" />
							<span>+ Keranjang</span>
						</button>

						<a
							href={productWaLink(product.name, product.price)}
							target="_blank"
							rel="noopener noreferrer"
							class="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs sm:text-sm font-extrabold py-3 sm:py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
							title="Pesan Langsung via WA"
						>
							<MessageCircle class="w-4 h-4" />
							<span>Beli Cepat</span>
						</a>
					</div>
				</div>
			</div>
			{/each}
		</div>
	</section>

	<!-- ===== 5. CERITA KAMI / OUR STORY (AUTHENTIC HERITAGE) ===== -->
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

	<!-- ===== 6. MENGAPA KAMI (4 PILAR KEUNGGULAN) ===== -->
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

	<!-- ===== 7. CARA PESAN (3 LANGKAH MUDAH) ===== -->
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
						Telusuri kemplang panggang, getas, kerupuk mentah, atau kopi yang Anda inginkan dari katalog di atas.
					</p>
				</div>

				<div class="bg-slate-50 rounded-2xl p-6 border border-slate-200 relative text-center">
					<div class="w-10 h-10 rounded-full bg-red-600 text-white font-black text-sm flex items-center justify-center mx-auto mb-4 shadow">
						2
					</div>
					<h3 class="font-black text-slate-900 text-base mb-2">Hubungi via WhatsApp</h3>
					<p class="text-xs text-slate-500 leading-relaxed">
						Kirim daftar pesanan Anda ke WhatsApp admin. Kami akan hitungkan total ongkos kirim termurah ke kota Anda.
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

	<!-- ===== 8. TESTIMONI INTERAKTIF CAROUSEL ===== -->
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

	<!-- ===== 9. LOKASI TOKO & FORM PESAN CEPAT (MINIMALIS & HUMANIS) ===== -->
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
							Bagi Anda yang berdomisili di Tangerang, Jakarta Barat, atau sekitarnya, silakan mampir langsung untuk memilih kemplang arang segar, getas, dan aneka kerupuk mentah langsung dari toples!
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
									{#each PRODUCTS as p}
									<option value={p.name}>{p.name} (Rp {formatCurrency(p.price)})</option>
									{/each}
									<option value="Paket Grosir Kerupuk Mentah">Paket Grosir Kerupuk Mentah</option>
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
									placeholder="Contoh: Kemplang MM 3 bks + Kerupuk Mentah Ikan 2 kg, sambal ditambah ya..."
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

	<!-- ===== 10. FAQ ACCORDION SECTION ===== -->
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

	<!-- ===== 11. FOOTER ===== -->
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
						<li><a href="#lini-produk" class="hover:text-white transition">3 Lini Produk</a></li>
						<li><a href="#katalog" class="hover:text-white transition">Katalog Lengkap</a></li>
						<li><a href="#cerita" class="hover:text-white transition">Cerita Toko</a></li>
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
	</footer>

</div>
