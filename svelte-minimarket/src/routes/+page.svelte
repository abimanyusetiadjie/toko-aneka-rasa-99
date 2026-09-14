<script lang="ts">
	import {
		ShoppingCart,
		LayoutDashboard,
		Package,
		Users,
		Truck,
		ClipboardCheck,
		History,
		Store,
		ArrowRight,
		ShieldCheck,
		Wifi,
		Calendar,
		Sparkles
	} from 'lucide-svelte';

	const todayStr = new Intl.DateTimeFormat('id-ID', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(new Date());
</script>

<div class="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col justify-between p-4 sm:p-6 lg:p-10 text-slate-900 bg-slate-100 selection:bg-blue-600">
	<!-- Top Bar -->
	<header class="max-w-6xl mx-auto w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 border-b border-slate-200">
		<div class="flex items-center gap-3">
			<img src="/logo.png" alt="Toko Aneka Rasa 99" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-slate-300 shadow-sm shrink-0" />
			<div>
				<h1 class="text-lg sm:text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
					<span>Toko Aneka Rasa 99</span>
					<span class="text-[10px] sm:text-xs bg-pink-100 text-pink-800 font-bold px-2 py-0.5 rounded font-mono">Store OS</span>
				</h1>
				<p class="text-[11px] sm:text-xs text-slate-500 font-mono">Pusat Kemplang, Getas & Oleh-Oleh Khas Bangka • Poris Indah Blok B 11 No.1</p>
			</div>
		</div>

		<div class="flex items-center gap-3 sm:gap-4 text-xs font-mono flex-wrap">
			<span class="text-slate-500 flex items-center gap-1.5">
				<Calendar class="w-3.5 h-3.5 text-slate-400" /> {todayStr}
			</span>
			<span class="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded font-bold">
				<span class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
				<span>Cloud Terhubung</span>
			</span>
			<a href="/logout" class="inline-flex items-center gap-1.5 text-slate-600 bg-white border border-slate-300 px-2.5 py-1 rounded font-bold hover:bg-slate-50 transition-colors">
				Logout
			</a>
		</div>
	</header>

	<!-- Main Workstations Launcher -->
	<main class="max-w-6xl mx-auto w-full my-auto py-8 space-y-6">
		<div class="space-y-1">
			<h2 class="text-2xl font-black text-slate-900 tracking-tight">
				Pusat Kendali Toko Aneka Rasa 99
			</h2>
			<p class="text-xs text-slate-600">
				Pilih modul kerja sesuai peran operasional Anda hari ini:
			</p>
		</div>

		<!-- Grid Modul Kerja -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-5">
			<!-- 1. Modul Kasir POS -->
			<div class="pos-panel bg-white p-6 flex flex-col justify-between border-t-4 border-t-emerald-600 hover:shadow-md transition-shadow">
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<div class="w-12 h-12 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
							<ShoppingCart class="w-6 h-6" />
						</div>
						<span class="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono">
							FRONT STORE
						</span>
					</div>

					<div>
						<h3 class="text-base font-bold text-slate-900">
							Terminal Kasir (POS)
						</h3>
						<p class="text-xs text-slate-600 mt-1 leading-relaxed">
							Layar transaksi kasir cepat bebas-scroll dengan pemindaian barcode fisik, tombol pecahan rupiah cepat, split payment, dan cetak struk thermal 58mm.
						</p>
					</div>

					<div class="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
						<div class="flex items-center gap-2">
							<span class="kbd-badge font-mono text-[10px]">F1-F12</span>
							<span class="font-medium">Full Keyboard Shortcut Navigasi</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="kbd-badge font-mono text-[10px]">CACHE</span>
							<span class="font-medium">Local-First Caching (Offline Ready)</span>
						</div>
					</div>
				</div>

				<div class="pt-6">
					<a
						href="/pos"
						class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-xs transition-all shadow-xs active:scale-95"
					>
						<span>Buka Terminal Kasir</span>
						<ArrowRight class="w-4 h-4" />
					</a>
				</div>
			</div>

			<!-- 2. Modul Manajemen Gudang (NEW DEDICATED) -->
			<div class="pos-panel bg-white p-6 flex flex-col justify-between border-t-4 border-t-blue-600 hover:shadow-md transition-shadow">
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<div class="w-12 h-12 rounded-lg bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700">
							<Truck class="w-6 h-6" />
						</div>
						<span class="text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-mono">
							WAREHOUSE
						</span>
					</div>

					<div>
						<h3 class="text-base font-bold text-slate-900">
							Manajemen Gudang & Stok
						</h3>
						<p class="text-xs text-slate-600 mt-1 leading-relaxed">
							Pengelolaan siklus inventori barang: penerimaan pasokan masuk, audit stock opname, kontrol shrinkage selisih, dan buku besar mutasi stok.
						</p>
					</div>

					<div class="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
						<a href="/admin/gudang/masuk" class="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
							<span class="flex items-center gap-1.5"><Truck class="w-3.5 h-3.5 text-blue-600" /> Penerimaan Barang Masuk</span>
							<span class="text-slate-400 font-mono text-[10px]">Restock PO</span>
						</a>
						<a href="/admin/gudang/opname" class="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
							<span class="flex items-center gap-1.5"><ClipboardCheck class="w-3.5 h-3.5 text-amber-600" /> Cek Kiriman & Selisih Rak</span>
							<span class="text-slate-400 font-mono text-[10px]">Audit Fisik & SJ</span>
						</a>
						<a href="/admin/gudang/mutasi" class="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
							<span class="flex items-center gap-1.5"><History class="w-3.5 h-3.5 text-purple-600" /> Buku Besar Mutasi Stok</span>
							<span class="text-slate-400 font-mono text-[10px]">Ledger Trail</span>
						</a>
					</div>
				</div>

				<div class="pt-6">
					<a
						href="/admin/inventory"
						class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-xs transition-all shadow-xs active:scale-95"
					>
						<span>Buka Master Inventory</span>
						<ArrowRight class="w-4 h-4" />
					</a>
				</div>
			</div>

			<!-- 3. Modul BI Dashboard & Promo ML -->
			<div class="pos-panel bg-white p-6 flex flex-col justify-between border-t-4 border-t-purple-600 hover:shadow-md transition-shadow">
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<div class="w-12 h-12 rounded-lg bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700">
							<LayoutDashboard class="w-6 h-6" />
						</div>
						<span class="text-[11px] font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded font-mono">
							EXECUTIVE
						</span>
					</div>

					<div>
						<h3 class="text-base font-bold text-slate-900">
							BI Analytics & Promo AI
						</h3>
						<p class="text-xs text-slate-600 mt-1 leading-relaxed">
							Analisis omzet penjualan riil, heatmap jam sibuk toko per hari, margin laba kotor kategori produk, dan CMS persetujuan bundling AI.
						</p>
					</div>

					<div class="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
						<div class="flex items-center gap-2">
							<span class="kbd-badge font-mono text-[10px]">HEATMAP</span>
							<span class="font-medium">Intensitas Jam Ramai Pengunjung</span>
						</div>
						<div class="flex items-center gap-2">
							<span class="kbd-badge font-mono text-[10px]">AI-CMS</span>
							<span class="font-medium">Manager Approval FP-Growth Promo</span>
						</div>
					</div>
				</div>

				<div class="pt-6">
					<a
						href="/admin/dashboard"
						class="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-xs transition-all shadow-xs active:scale-95"
					>
						<span>Buka Executive Dashboard</span>
						<ArrowRight class="w-4 h-4" />
					</a>
				</div>
			</div>
		</div>
	</main>

	<!-- Footer -->
	<footer class="max-w-6xl mx-auto w-full text-center pt-4 border-t border-slate-200 text-xs text-slate-500 font-mono">
		<p>SmartPOS Minimarket System • SvelteKit Fullstack & Industrial Retail Engine</p>
	</footer>
</div>
