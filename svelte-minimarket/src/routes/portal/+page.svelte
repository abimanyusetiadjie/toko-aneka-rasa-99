<script lang="ts">
	import type { PageData } from './$types';
	import {
		ShoppingCart,
		Package,
		LayoutDashboard,
		ArrowRight,
		Truck,
		ClipboardCheck,
		History,
		Barcode,
		Users,
		ShoppingBag,
		LogOut,
		Calendar,
		ShieldCheck,
		Store,
		TrendingUp,
		Layers,
		Sparkles
	} from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	function formatCurrency(val: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(val || 0);
	}
</script>

<svelte:head>
	<title>Pusat Kendali Sistem | Toko Aneka Rasa 99</title>
</svelte:head>

<div class="min-h-screen bg-slate-100 flex flex-col justify-between text-slate-900 selection:bg-blue-600 selection:text-white">
	<!-- Top Navigation Bar -->
	<header class="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap justify-between items-center gap-3 shadow-xs">
		<div class="flex items-center gap-3">
			<img
				src="/logo.png"
				alt="Toko Aneka Rasa 99"
				class="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-amber-400 shadow-xs shrink-0"
			/>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight">
						Toko Aneka Rasa 99
					</h1>
					<span class="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded font-mono">
						Store OS
					</span>
				</div>
				<p class="text-[11px] text-slate-500 font-medium hidden sm:block">
					Pusat Kemplang, Getas & Oleh-Oleh Khas Bangka Belitung • Poris Indah
				</p>
			</div>
		</div>

		<!-- Status Info & Profile -->
		<div class="flex items-center gap-2.5 sm:gap-4 text-xs">
			<div class="hidden md:flex items-center gap-1.5 text-slate-500 font-mono text-[11px] bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
				<Calendar class="w-3.5 h-3.5 text-slate-400" />
				<span>{data.todayStr}</span>
			</div>

			<div class="hidden sm:inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-lg text-xs font-bold">
				<span class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
				<span>Database VPS Terhubung</span>
			</div>

			<!-- User Profile Card -->
			<div class="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
				<div class="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
					{(data.user?.full_name || 'U').charAt(0).toUpperCase()}
				</div>
				<div class="text-left">
					<span class="text-xs font-bold text-slate-800 block leading-tight">{data.user?.full_name || 'User'}</span>
					<span class="text-[9px] font-mono text-slate-500 block leading-none">{data.isOwner ? 'Pemilik (Owner)' : 'Kasir Toko'}</span>
				</div>
			</div>

			<a
				href="/logout"
				class="inline-flex items-center gap-1.5 text-slate-600 hover:text-red-700 bg-white border border-slate-300 hover:border-red-300 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs"
				title="Keluar dari akun"
			>
				<LogOut class="w-3.5 h-3.5" />
				<span class="hidden sm:inline">Logout</span>
			</a>
		</div>
	</header>

	<!-- Main Hub Workstations Container -->
	<main class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 my-auto space-y-6 sm:space-y-8">
		<!-- Section Title -->
		<div class="text-center sm:text-left space-y-1">
			<span class="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full inline-block">
				Pusat Kendali Toko & Modul Kerja
			</span>
			<h2 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
				Pilih Modul Sistem Toko Aneka Rasa 99
			</h2>
			<p class="text-xs sm:text-sm text-slate-600 max-w-2xl">
				Silakan pilih modul kerja yang ingin Anda operasikan hari ini. Seluruh sistem telah terintegrasi real-time dengan database PostgreSQL lokal di VPS.
			</p>
		</div>

		<!-- 3 Pilihan Tampilan UI (3 WORKSTATION CARDS) -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">

			<!-- KARTU 1: TERMINAL KASIR (POS) -->
			<div class="bg-white rounded-2xl border-2 border-emerald-500/80 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden relative group">
				<div class="p-6 space-y-5">
					<!-- Top Icon & Badge -->
					<div class="flex items-center justify-between">
						<div class="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-xs group-hover:scale-105 transition-transform">
							<ShoppingCart class="w-6 h-6" />
						</div>
						<span class="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
							Front Store
						</span>
					</div>

					<!-- Title & Desc -->
					<div>
						<h3 class="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
							1. Terminal Kasir (POS)
						</h3>
						<p class="text-xs text-slate-600 mt-1.5 leading-relaxed">
							Layar kasir transaksi cepat bebas-scroll dengan pemindai barcode fisik/kamera, pencarian katalog instan, tombol pecahan rupiah, QRIS dinamis, dan cetak struk thermal 58mm.
						</p>
					</div>

					<!-- Feature Bullets -->
					<div class="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-700 font-medium">
						<div class="flex items-center gap-2">
							<span class="bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded font-mono text-[10px] text-slate-700 font-bold shrink-0">F1-F12</span>
							<span>Full Keyboard Navigation & Transaksi Kilat</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold shrink-0">OFFLINE</span>
							<span>Local-First Engine (Tetap Jualan saat WiFi Putus)</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="bg-blue-50 border border-blue-200 text-blue-700 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold shrink-0">Z-REPORT</span>
							<span>Tutup Kasir Shift & Catat Pengeluaran (Petty Cash)</span>
						</div>
					</div>
				</div>

				<!-- Action Button -->
				<div class="p-6 pt-0">
					<a
						href="/pos"
						class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm transition-all shadow-md active:scale-98 cursor-pointer"
					>
						<span>Buka Terminal Kasir (POS)</span>
						<ArrowRight class="w-4 h-4" />
					</a>
				</div>
			</div>

			<!-- KARTU 2: MANAJEMEN INVENTARIS & GUDANG -->
			<div class="bg-white rounded-2xl border-2 border-blue-500/80 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden relative group">
				<div class="p-6 space-y-5">
					<!-- Top Icon & Badge -->
					<div class="flex items-center justify-between">
						<div class="w-12 h-12 rounded-xl bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700 shadow-xs group-hover:scale-105 transition-transform">
							<Package class="w-6 h-6" />
						</div>
						<span class="text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
							Warehouse & CRUD
						</span>
					</div>

					<!-- Title & Desc -->
					<div>
						<div class="flex items-center justify-between gap-1">
							<h3 class="text-lg font-black text-slate-900 group-hover:text-blue-700 transition-colors">
								2. Manajemen Inventaris
							</h3>
							<span class="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
								{data.productCount} SKU
							</span>
						</div>
						<p class="text-xs text-slate-600 mt-1.5 leading-relaxed">
							Pusat CRUD inventori: ubah harga barang, kelola HPP modal, pindah kategori barang, cetak label stiker barcode, restock pasokan barang masuk, dan audit mutasi stok.
						</p>
					</div>

					<!-- Submenu Quick Links -->
					<div class="space-y-1 pt-3 border-t border-slate-100 text-xs">
						<a
							href="/admin/inventory"
							class="flex items-center justify-between p-1.5 rounded-lg hover:bg-blue-50 text-slate-800 font-semibold transition-colors group/sub"
						>
							<span class="flex items-center gap-1.5">
								<Package class="w-3.5 h-3.5 text-blue-600" />
								<span>Katalog Produk & Kategori</span>
							</span>
							<span class="text-[10px] font-mono text-slate-400 group-hover/sub:text-blue-600">CRUD Harga</span>
						</a>
						<a
							href="/admin/barcodes"
							class="flex items-center justify-between p-1.5 rounded-lg hover:bg-blue-50 text-slate-800 font-semibold transition-colors group/sub"
						>
							<span class="flex items-center gap-1.5">
								<Barcode class="w-3.5 h-3.5 text-indigo-600" />
								<span>Cetak Label Stiker Barcode</span>
							</span>
							<span class="text-[10px] font-mono text-slate-400 group-hover/sub:text-blue-600">Label Rak</span>
						</a>
						<a
							href="/admin/gudang/masuk"
							class="flex items-center justify-between p-1.5 rounded-lg hover:bg-blue-50 text-slate-800 font-semibold transition-colors group/sub"
						>
							<span class="flex items-center gap-1.5">
								<Truck class="w-3.5 h-3.5 text-emerald-600" />
								<span>Penerimaan Barang Masuk</span>
							</span>
							<span class="text-[10px] font-mono text-slate-400 group-hover/sub:text-blue-600">Restock PO</span>
						</a>
						<a
							href="/admin/gudang/mutasi"
							class="flex items-center justify-between p-1.5 rounded-lg hover:bg-blue-50 text-slate-800 font-semibold transition-colors group/sub"
						>
							<span class="flex items-center gap-1.5">
								<History class="w-3.5 h-3.5 text-purple-600" />
								<span>Buku Besar Mutasi Stok</span>
							</span>
							<span class="text-[10px] font-mono text-slate-400 group-hover/sub:text-blue-600">Ledger Trail</span>
						</a>
					</div>
				</div>

				<!-- Action Button -->
				<div class="p-6 pt-0">
					<a
						href="/admin/inventory"
						class="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm transition-all shadow-md active:scale-98 cursor-pointer"
					>
						<span>Buka Master Inventaris</span>
						<ArrowRight class="w-4 h-4" />
					</a>
				</div>
			</div>

			<!-- KARTU 3: EXECUTIVE BI DASHBOARD & LAPORAN -->
			<div class="bg-white rounded-2xl border-2 border-purple-500/80 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden relative group">
				<div class="p-6 space-y-5">
					<!-- Top Icon & Badge -->
					<div class="flex items-center justify-between">
						<div class="w-12 h-12 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700 shadow-xs group-hover:scale-105 transition-transform">
							<LayoutDashboard class="w-6 h-6" />
						</div>
						<span class="text-[11px] font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
							Executive BI
						</span>
					</div>

					<!-- Title & Desc -->
					<div>
						<div class="flex items-center justify-between gap-1">
							<h3 class="text-lg font-black text-slate-900 group-hover:text-purple-700 transition-colors">
								3. BI Dashboard & Laporan
							</h3>
							{#if data.todaySales > 0}
								<span class="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
									{formatCurrency(data.todaySales)}
								</span>
							{/if}
						</div>
						<p class="text-xs text-slate-600 mt-1.5 leading-relaxed">
							Pusat analisis intelijen bisnis pemilik toko: omzet riil harian, margin laba kotor per kategori produk, heatmap jam ramai pengunjung, audit shift kasir, dan integrasi pesanan Shopee.
						</p>
					</div>

					<!-- Submenu Quick Links -->
					<div class="space-y-1 pt-3 border-t border-slate-100 text-xs">
						<a
							href="/admin/dashboard"
							class="flex items-center justify-between p-1.5 rounded-lg hover:bg-purple-50 text-slate-800 font-semibold transition-colors group/sub"
						>
							<span class="flex items-center gap-1.5">
								<TrendingUp class="w-3.5 h-3.5 text-purple-600" />
								<span>Grafik Omzet & Margin Laba</span>
							</span>
							<span class="text-[10px] font-mono text-slate-400 group-hover/sub:text-purple-600">Analytics</span>
						</a>
						<a
							href="/admin/pegawai"
							class="flex items-center justify-between p-1.5 rounded-lg hover:bg-purple-50 text-slate-800 font-semibold transition-colors group/sub"
						>
							<span class="flex items-center gap-1.5">
								<Users class="w-3.5 h-3.5 text-blue-600" />
								<span>Laporan Kasir & Rekap Shift</span>
							</span>
							<span class="text-[10px] font-mono text-slate-400 group-hover/sub:text-purple-600">Audit Shift</span>
						</a>
						<a
							href="/admin/shopee"
							class="flex items-center justify-between p-1.5 rounded-lg hover:bg-purple-50 text-slate-800 font-semibold transition-colors group/sub"
						>
							<span class="flex items-center gap-1.5">
								<ShoppingBag class="w-3.5 h-3.5 text-orange-600" />
								<span>Integrasi Shopee & Resi Toko</span>
							</span>
							<span class="text-[10px] font-mono text-slate-400 group-hover/sub:text-purple-600">Marketplace</span>
						</a>
					</div>
				</div>

				<!-- Action Button -->
				<div class="p-6 pt-0">
					{#if data.isOwner}
						<a
							href="/admin/dashboard"
							class="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm transition-all shadow-md active:scale-98 cursor-pointer"
						>
							<span>Buka Executive Dashboard</span>
							<ArrowRight class="w-4 h-4" />
						</a>
					{:else}
						<div class="w-full bg-slate-100 text-slate-400 font-bold py-3 px-4 rounded-xl text-center text-xs border border-slate-200">
							🔒 Khusus Akun Pemilik (Owner)
						</div>
					{/if}
				</div>
			</div>

		</div>
	</main>

	<!-- Footer -->
	<footer class="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 border-t border-slate-200 text-center flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-mono">
		<p>© 2026 Toko Aneka Rasa 99 • Store Operating System</p>
		<div class="flex items-center gap-3">
			<a href="/" class="text-blue-600 hover:underline">Halaman Depan Toko (Landing Page)</a>
			<span>•</span>
			<a href="/pos" class="text-emerald-700 hover:underline">Buka Kasir</a>
		</div>
	</footer>
</div>
