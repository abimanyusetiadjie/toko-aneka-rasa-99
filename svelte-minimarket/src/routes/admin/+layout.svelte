<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { REALTIME_CHANNEL_NAME } from '$lib/stores/local-catalog.svelte';
	import {
		LayoutDashboard,
		Package,
		Users,
		ShoppingCart,
		LogOut,
		Store,
		Truck,
		ClipboardCheck,
		History,
		Layers,
		Barcode,
		Menu,
		X,
		Zap,
		Wifi,
		ShoppingBag
	} from 'lucide-svelte';

	let { children, data } = $props();

	let isMobileMenuOpen = $state(false);
	let realtimeToast = $state<{ message: string; time: string } | null>(null);
	let isSseConnected = $state(false);
	let sseSource: EventSource | null = null;
	let broadcastChannel: BroadcastChannel | null = null;
	let toastTimer: any = null;

	const warehouseLinks = [
		{ href: '/admin/inventory', label: 'Katalog Produk & Satuan', icon: Package },
		{ href: '/admin/barcodes', label: 'Cetak Label Barcode (Stiker)', icon: Barcode },
		{ href: '/admin/gudang/masuk', label: 'Penerimaan Barang Masuk', icon: Truck },
		{ href: '/admin/gudang/opname', label: 'Cek Kiriman & Selisih Rak', icon: ClipboardCheck },
		{ href: '/admin/gudang/mutasi', label: 'Buku Besar Mutasi Stok', icon: History }
	];

	function closeDrawer() {
		isMobileMenuOpen = false;
	}

	function showLiveToast(msg: string) {
		realtimeToast = { message: msg, time: new Date().toLocaleTimeString('id-ID') };
		if (toastTimer) clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			realtimeToast = null;
		}, 4500);
	}

	onMount(() => {
		// 1. Sinkronisasi Instan Antar-Tab (BroadcastChannel)
		if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
			try {
				broadcastChannel = new BroadcastChannel(REALTIME_CHANNEL_NAME);
				broadcastChannel.onmessage = async (event) => {
					if (event.data?.type === 'TRANSACTION_COMPLETED') {
						await invalidateAll();
						showLiveToast(
							`Transaksi Kasir Baru (${event.data.receiptNumber || 'Selesai'}) • Stok diperbarui secara real-time!`
						);
					}
				};
			} catch {}
		}

		// 2. Sinkronisasi Lintas-Perangkat (Server-Sent Events: HP Owner <-> PC Kasir)
		if (typeof window !== 'undefined' && 'EventSource' in window) {
			try {
				sseSource = new EventSource('/api/realtime/events');
				sseSource.onopen = () => {
					isSseConnected = true;
				};

				sseSource.addEventListener('TRANSACTION_COMPLETED', async (e: MessageEvent) => {
					try {
						const data = JSON.parse(e.data);
						await invalidateAll();
						showLiveToast(
							`Transaksi Kasir Baru (${data.receiptNumber || 'Selesai'}) • Stok diperbarui secara real-time!`
						);
					} catch {}
				});

				sseSource.addEventListener('STOCK_CHANGED', async (e: MessageEvent) => {
					try {
						const data = JSON.parse(e.data || '{}');
						await invalidateAll();
						showLiveToast(data.message || `Perubahan Stok Gudang • Seluruh data telah disinkronkan real-time!`);
					} catch {
						await invalidateAll();
						showLiveToast(`Perubahan Stok Gudang • Seluruh data telah disinkronkan real-time!`);
					}
				});

				sseSource.onerror = () => {
					isSseConnected = false;
				};
			} catch {}
		}
	});

	onDestroy(() => {
		if (broadcastChannel) broadcastChannel.close();
		if (sseSource) sseSource.close();
		if (toastTimer) clearTimeout(toastTimer);
	});
</script>

<div class="flex flex-col lg:flex-row min-h-screen lg:h-screen w-full max-w-full overflow-x-hidden bg-slate-100 text-slate-900 selection:bg-blue-600 print:h-auto print:w-auto print:overflow-visible print:block print:bg-white">
	<!-- Mobile Sticky Top Bar (Hanya tampil di HP & Tablet < 1024px) -->
	<header class="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs print:hidden">
		<div class="flex items-center gap-2.5">
			<button
				onclick={() => (isMobileMenuOpen = true)}
				class="p-2 -ml-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
				aria-label="Buka Menu"
			>
				<Menu class="w-5 h-5" />
			</button>
			<img src="/logo.png" alt="Toko Aneka Rasa 99" class="w-7 h-7 rounded-full object-cover border border-slate-300" />
			<div>
				<h1 class="font-extrabold text-xs tracking-tight text-slate-900 leading-tight">Aneka Rasa 99</h1>
				<p class="text-[9px] text-slate-500 font-mono">Control Center</p>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<span class="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border {isSseConnected ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-blue-700 bg-blue-50 border-blue-200'}">
				<span class="w-1.5 h-1.5 rounded-full {isSseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}"></span>
				Live
			</span>
			<a
				href="/pos"
				class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-2xs"
			>
				<ShoppingCart class="w-3.5 h-3.5 text-emerald-600" />
				<span class="text-[11px]">Kasir</span>
			</a>
		</div>
	</header>

	<!-- Mobile Drawer Backdrop Overlay -->
	{#if isMobileMenuOpen}
		<div
			onclick={closeDrawer}
			class="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-200"
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Escape' && closeDrawer()}
		></div>
	{/if}

	<!-- Left Sidebar (Desktop Static & Mobile Slide-Over Drawer) -->
	<aside
		class="bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm print:hidden
		lg:w-64 lg:static lg:z-20 lg:h-full
		{isMobileMenuOpen
			? 'fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 shadow-2xl flex translate-x-0 transition-transform duration-300 ease-out'
			: 'hidden lg:flex'}"
	>
		<!-- Drawer Header -->
		<div class="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
			<div class="flex items-center gap-3">
				<img src="/logo.png" alt="Toko Aneka Rasa 99" class="w-9 h-9 rounded-full object-cover border border-slate-300 shadow-xs" />
				<div>
					<h2 class="font-extrabold text-sm tracking-tight text-slate-900">Aneka Rasa 99</h2>
					<p class="text-[10px] text-slate-500 font-mono">Control Center & Gudang</p>
				</div>
			</div>
			<!-- Close button on Mobile Drawer -->
			<button
				onclick={closeDrawer}
				class="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
				aria-label="Tutup Menu"
			>
				<X class="w-5 h-5" />
			</button>
		</div>

		<!-- Nav Links -->
		<nav class="flex-1 p-3 space-y-4 overflow-y-auto custom-scrollbar">
			<!-- Executive Section (Khusus Owner) -->
			{#if data?.user?.role_id === 1}
				<div class="space-y-1">
					<span class="px-3 text-[10px] font-extrabold tracking-wider text-purple-700 uppercase font-mono flex items-center justify-between">
						<span>EKSEKUTIF</span>
						<span class="bg-purple-100 text-purple-800 text-[9px] px-1.5 py-0.2 rounded font-bold">Khusus Owner</span>
					</span>
					<a
						href="/admin/dashboard"
						onclick={closeDrawer}
						class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all {$page.url.pathname.startsWith('/admin/dashboard')
							? 'bg-blue-600 text-white shadow-sm'
							: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}"
					>
						<LayoutDashboard class="w-4 h-4" />
						<span>BI Dashboard & Laporan</span>
					</a>
				</div>
			{/if}

			<!-- Warehouse Section -->
			<div class="space-y-1">
				<span class="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase font-mono block">
					MANAJEMEN GUDANG
				</span>
				{#each warehouseLinks as item}
					{@const active = $page.url.pathname === item.href}
					<a
						href={item.href}
						onclick={closeDrawer}
						class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all {active
							? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-xs'
							: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}"
					>
						<item.icon class="w-4 h-4 {active ? 'text-blue-600' : 'text-slate-400'}" />
						<span>{item.label}</span>
					</a>
				{/each}
			</div>

			<!-- Marketplace Section (Shopee) -->
			<div class="space-y-1">
				<span class="px-3 text-[10px] font-extrabold tracking-wider text-orange-600 uppercase font-mono flex items-center justify-between">
					<span>MARKETPLACE ONLINE</span>
					<span class="bg-orange-100 text-orange-800 text-[9px] px-1.5 py-0.2 rounded font-bold">Shopee</span>
				</span>
				<a
					href="/admin/shopee"
					onclick={closeDrawer}
					class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all {$page.url.pathname.startsWith('/admin/shopee')
						? 'bg-orange-50 text-orange-700 font-bold border border-orange-200 shadow-xs'
						: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}"
				>
					<ShoppingBag class="w-4 h-4 {$page.url.pathname.startsWith('/admin/shopee') ? 'text-orange-600' : 'text-slate-400'}" />
					<span>Pesanan Shopee & Resi</span>
				</a>
			</div>

			<!-- Staff Section -->
			<div class="space-y-1">
				<span class="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase font-mono block">
					OPERASIONAL TOKO
				</span>
				<a
					href="/admin/pegawai"
					onclick={closeDrawer}
					class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all {$page.url.pathname.startsWith('/admin/pegawai')
						? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
						: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}"
				>
					<Users class="w-4 h-4 {$page.url.pathname.startsWith('/admin/pegawai') ? 'text-blue-600' : 'text-slate-400'}" />
					<span>Pegawai & Shift Kasir</span>
				</a>
			</div>

			<div class="pt-2 border-t border-slate-200">
				<a
					href="/pos"
					class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 transition-all shadow-xs"
				>
					<ShoppingCart class="w-4 h-4 text-emerald-600" />
					<span>Buka Terminal Kasir</span>
				</a>
			</div>
		</nav>

		<!-- Admin Profile Bottom -->
		<div class="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
			<div class="flex items-center gap-2">
				<div class="w-7 h-7 rounded bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700 font-bold text-xs">
					{(data?.user?.full_name || 'U').charAt(0).toUpperCase()}
				</div>
				<div class="min-w-0">
					<span class="font-bold text-slate-900 block text-xs truncate max-w-[120px]">{data?.user?.full_name || 'Pengguna'}</span>
					<span class="text-[10px] text-slate-500 font-mono block">{data?.user?.role_id === 1 ? 'Pemilik (Owner)' : 'Kasir Toko'}</span>
				</div>
			</div>
			<a href="/logout" class="text-slate-400 hover:text-slate-700 p-1" title="Keluar">
				<LogOut class="w-3.5 h-3.5" />
			</a>
		</div>
	</aside>

	<!-- Main Admin Content Area -->
	<main class="flex-1 flex flex-col overflow-y-auto min-w-0 bg-slate-100 print:overflow-visible print:h-auto print:block print:bg-white relative">
		<!-- Real-Time Floating Notification Toast -->
		{#if realtimeToast}
			<div class="fixed top-4 right-4 z-50 max-w-sm bg-slate-900 text-white p-3.5 rounded-xl shadow-2xl border border-emerald-500/60 flex items-center gap-3 animate-pulse transition-all">
				<div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
					<Zap class="w-4 h-4" />
				</div>
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-1.5">
						<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
						<p class="text-xs font-bold text-emerald-400">Live Sync Update</p>
						<span class="text-[9px] text-slate-400 font-mono ml-auto">{realtimeToast.time}</span>
					</div>
					<p class="text-[11px] text-slate-200 mt-0.5 leading-snug">{realtimeToast.message}</p>
				</div>
				<button onclick={() => (realtimeToast = null)} class="text-slate-400 hover:text-white text-xs p-1">✕</button>
			</div>
		{/if}

		{@render children()}
	</main>
</div>
