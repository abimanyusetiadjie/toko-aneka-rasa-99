<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import {
		ShoppingBag,
		Truck,
		Package,
		CheckCircle2,
		XCircle,
		Search,
		Zap,
		Copy,
		Check,
		Printer,
		AlertCircle,
		ArrowRight,
		Store,
		X,
		ExternalLink
	} from 'lucide-svelte';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();

	let activeFilter = $state<'ALL' | 'READY_TO_SHIP' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'>('ALL');
	let searchQuery = $state('');
	let copiedSn = $state<string | null>(null);
	let isSimulating = $state(false);

	// Modal Input Resi
	let showResiModal = $state(false);
	let selectedOrderForResi = $state<any>(null);
	let trackingNumberInput = $state('');

	// Modal Cetak Label Pengiriman (Thermal A6 / Stiker Resi)
	let showPrintModal = $state(false);
	let selectedOrderForPrint = $state<any>(null);

	function formatCurrency(val: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(val || 0);
	}

	function formatDate(dateStr: string): string {
		try {
			const d = new Date(dateStr);
			return d.toLocaleString('id-ID', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return dateStr;
		}
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		copiedSn = text;
		setTimeout(() => {
			copiedSn = null;
		}, 1800);
	}

	function openResiModal(order: any) {
		selectedOrderForResi = order;
		trackingNumberInput =
			order.tracking_number ||
			`${order.shipping_carrier?.startsWith('SPX') ? 'SPXID' : 'JT'}${Math.floor(1000000000 + Math.random() * 9000000000)}`;
		showResiModal = true;
	}

	function openPrintModal(order: any) {
		selectedOrderForPrint = order;
		showPrintModal = true;
	}

	let filteredOrders = $derived(
		(data.orders || []).filter((o: any) => {
			const matchStatus = activeFilter === 'ALL' || o.order_status === activeFilter;
			const q = searchQuery.toLowerCase().trim();
			if (!q) return matchStatus;

			const matchSn = o.order_sn?.toLowerCase().includes(q);
			const matchBuyer = o.buyer_username?.toLowerCase().includes(q);
			const matchResi = o.tracking_number?.toLowerCase().includes(q);
			const matchCarrier = o.shipping_carrier?.toLowerCase().includes(q);

			// Search inside items
			const items = parseOrderItems(o.items);
			const matchItem = items.some(
				(it: any) => it.name?.toLowerCase().includes(q) || it.sku?.toLowerCase().includes(q)
			);

			return matchStatus && (matchSn || matchBuyer || matchResi || matchCarrier || matchItem);
		})
	);

	function parseOrderItems(items: any): any[] {
		if (Array.isArray(items)) return items;
		try {
			return JSON.parse(items || '[]');
		} catch {
			return [];
		}
	}
</script>

<svelte:head>
	<title>Pesanan Shopee - Toko Aneka Rasa 99</title>
</svelte:head>

<div class="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
	<!-- Top Alert jika ada notifikasi aksi -->
	{#if form?.message}
		<div
			class="p-4 rounded-2xl border text-sm font-medium flex items-center justify-between shadow-xs transition-all {form.success
				? 'bg-emerald-50 border-emerald-200 text-emerald-900'
				: 'bg-rose-50 border-rose-200 text-rose-900'}"
		>
			<div class="flex items-center gap-3">
				{#if form.success}
					<CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0" />
				{:else}
					<AlertCircle class="w-5 h-5 text-rose-600 shrink-0" />
				{/if}
				<span>{form.message}</span>
			</div>
		</div>
	{/if}

	<!-- Header Bersih & Minimalis -->
	<header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<div class="flex items-center gap-2.5">
				<h1 class="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Pesanan Shopee</h1>
				<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
					<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
					Tersinkronisasi
				</span>
			</div>
			<p class="text-sm text-slate-500 mt-1">
				Kelola pesanan online Toko Aneka Rasa 99, cetak resi pengiriman, dan stok otomatis terpotong.
			</p>
		</div>

		<!-- Action: Otorisasi & Simulasi Order Shopee -->
		<div class="flex items-center gap-2 self-start sm:self-center flex-wrap">
			{#if (data as any)?.authUrl}
				<a
					href={(data as any).authUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-2xs transition-colors cursor-pointer"
					title="Buka Halaman Otorisasi Resmi Shopee Open Platform Seller Centre"
				>
					<ExternalLink class="w-3.5 h-3.5" />
					<span>Hubungkan / Otorisasi Shopee</span>
				</a>
			{/if}

			<form
				method="POST"
				action="?/simulate"
				use:enhance={() => {
					isSimulating = true;
					return async ({ update }) => {
						await update();
						isSimulating = false;
					};
				}}
			>
				<button
					type="submit"
					disabled={isSimulating}
					class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
					title="Simulasikan pembeli Shopee membeli produk untuk uji alur order & stok"
				>
					<Zap class="w-3.5 h-3.5 text-orange-600 {isSimulating ? 'animate-spin' : ''}" />
					<span>{isSimulating ? 'Membuat Pesanan...' : 'Simulasi Pesanan Demo'}</span>
				</button>
			</form>
		</div>
	</header>

	<!-- Otorisasi Shopee Berhasil (Bila diarahkan dari live Shopee) -->
	{#if (data as any)?.authSuccess}
		<div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
			<div class="flex items-center gap-3">
				<div class="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
					<CheckCircle2 class="w-5 h-5" />
				</div>
				<div>
					<p class="font-bold text-sm">Toko Shopee Berhasil Terhubung!</p>
					<p class="text-xs text-emerald-800 mt-0.5">
						Otorisasi akun toko selesai (Shop ID: <strong>{(data as any).authSuccess.shopId}</strong>). Pesanan dan stok kini tersinkronisasi otomatis.
					</p>
				</div>
			</div>
			<span class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white shrink-0 self-start sm:self-auto">
				Toko Live Aktif
			</span>
		</div>
	{/if}

	<!-- Status Ringkasan Toko Shopee (Minimalis, tanpa jargon teknis) -->
	<div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
		<div class="flex items-center gap-3">
			<div class="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
				<ShoppingBag class="w-4 h-4" />
			</div>
			<div>
				<div class="flex items-center gap-2">
					<span class="font-bold text-slate-900 text-sm">Shopee • Toko Aneka Rasa 99</span>
					<span class="text-[11px] text-slate-500 font-medium">(Shop ID: {data.connectionStatus?.shopId || '1075726207'})</span>
				</div>
				<p class="text-slate-500 text-xs mt-0.5">
					Pesanan Shopee otomatis memotong inventori gudang. Kasir offline dan online berbagi kuota stok real-time.
				</p>
			</div>
		</div>

		<div class="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
			<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold {data.connectionStatus?.mode === 'PRODUCTION_LIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}">
				<span class="w-1.5 h-1.5 rounded-full {data.connectionStatus?.mode === 'PRODUCTION_LIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}"></span>
				{data.connectionStatus?.mode === 'PRODUCTION_LIVE' ? 'Shopee Live Terkoneksi' : 'Terhubung (API Siap)'}
			</span>
			<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
				<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
				Webhook Otomatis Aktif
			</span>
		</div>
	</div>

	<!-- 4 Kartu KPI Utama (Minimalis & Human-friendly) -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
		<!-- 1. Perlu Dikirim -->
		<div
			class="bg-white border rounded-2xl p-4 shadow-xs transition-all {data.stats?.ready_to_ship > 0
				? 'border-orange-300 bg-orange-50/20'
				: 'border-slate-200/80'}"
		>
			<div class="flex items-center justify-between">
				<span class="text-xs font-semibold text-slate-500">Perlu Dikirim</span>
				<div class="w-8 h-8 rounded-xl bg-orange-100/80 text-orange-600 flex items-center justify-center">
					<Package class="w-4 h-4" />
				</div>
			</div>
			<p class="text-2xl font-bold text-slate-900 tracking-tight mt-2.5">{data.stats?.ready_to_ship || 0}</p>
			<p class="text-xs font-medium {data.stats?.ready_to_ship > 0 ? 'text-orange-700 font-semibold' : 'text-slate-400'} mt-1">
				{data.stats?.ready_to_ship > 0 ? 'Harus segera dipacking' : 'Semua paket sudah terkirim'}
			</p>
		</div>

		<!-- 2. Sedang Dikirim -->
		<div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
			<div class="flex items-center justify-between">
				<span class="text-xs font-semibold text-slate-500">Dalam Pengiriman</span>
				<div class="w-8 h-8 rounded-xl bg-sky-100/80 text-sky-600 flex items-center justify-center">
					<Truck class="w-4 h-4" />
				</div>
			</div>
			<p class="text-2xl font-bold text-slate-900 tracking-tight mt-2.5">{data.stats?.shipped || 0}</p>
			<p class="text-xs text-slate-500 font-medium mt-1">Dalam perjalanan kurir</p>
		</div>

		<!-- 3. Selesai -->
		<div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
			<div class="flex items-center justify-between">
				<span class="text-xs font-semibold text-slate-500">Pesanan Selesai</span>
				<div class="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center">
					<CheckCircle2 class="w-4 h-4" />
				</div>
			</div>
			<p class="text-2xl font-bold text-slate-900 tracking-tight mt-2.5">{data.stats?.completed || 0}</p>
			<p class="text-xs text-emerald-700 font-medium mt-1">Transaksi sukses & dana cair</p>
		</div>

		<!-- 4. Total Omset Shopee -->
		<div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
			<div class="flex items-center justify-between">
				<span class="text-xs font-semibold text-slate-500">Total Omset Shopee</span>
				<div class="w-8 h-8 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center">
					<ShoppingBag class="w-4 h-4" />
				</div>
			</div>
			<p class="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mt-2.5">
				{formatCurrency(data.stats?.total_revenue || 0)}
			</p>
			<p class="text-xs text-slate-500 font-medium mt-1">
				Est. Bersih: <span class="font-semibold text-purple-700">{formatCurrency(data.stats?.total_escrow || 0)}</span>
			</p>
		</div>
	</div>

	<!-- Kontrol Filter & Pencarian (Segmented Minimalis) -->
	<div class="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
		<!-- Status Tabs (Segmented Control Bar) -->
		<div class="bg-slate-100/80 p-1 rounded-xl flex items-center gap-1 overflow-x-auto custom-scrollbar">
			<button
				onclick={() => (activeFilter = 'ALL')}
				class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer {activeFilter === 'ALL'
					? 'bg-white text-slate-900 font-semibold shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				Semua ({data.orders?.length || 0})
			</button>

			<button
				onclick={() => (activeFilter = 'READY_TO_SHIP')}
				class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 {activeFilter === 'READY_TO_SHIP'
					? 'bg-white text-orange-700 font-semibold shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				<span>Perlu Dikirim</span>
				{#if data.stats?.ready_to_ship > 0}
					<span class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
						{data.stats.ready_to_ship}
					</span>
				{/if}
			</button>

			<button
				onclick={() => (activeFilter = 'SHIPPED')}
				class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer {activeFilter === 'SHIPPED'
					? 'bg-white text-sky-700 font-semibold shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				Sedang Dikirim ({data.stats?.shipped || 0})
			</button>

			<button
				onclick={() => (activeFilter = 'COMPLETED')}
				class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer {activeFilter === 'COMPLETED'
					? 'bg-white text-emerald-700 font-semibold shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				Selesai ({data.stats?.completed || 0})
			</button>

			<button
				onclick={() => (activeFilter = 'CANCELLED')}
				class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer {activeFilter === 'CANCELLED'
					? 'bg-white text-rose-700 font-semibold shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				Dibatalkan ({data.stats?.cancelled || 0})
			</button>
		</div>

		<!-- Kotak Pencarian -->
		<div class="relative w-full md:w-72">
			<Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Cari no. pesanan, resi, pembeli..."
				class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all text-slate-900"
			/>
			{#if searchQuery}
				<button
					onclick={() => (searchQuery = '')}
					class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
					title="Hapus pencarian"
				>
					<X class="w-3.5 h-3.5" />
				</button>
			{/if}
		</div>
	</div>

	<!-- Daftar Pesanan Shopee -->
	{#if filteredOrders.length === 0}
		<div class="bg-white border border-slate-200/80 rounded-2xl p-12 text-center">
			<div class="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
				<Package class="w-7 h-7" />
			</div>
			<p class="text-sm font-bold text-slate-800">Tidak ada pesanan di kategori ini</p>
			<p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">
				{searchQuery
					? `Tidak ditemukan pesanan dengan kata kunci "${searchQuery}". Coba gunakan nomor pesanan atau nama lain.`
					: 'Belum ada pesanan Shopee pada filter status ini. Pesanan baru akan otomatis muncul di sini.'}
			</p>
			{#if !searchQuery}
				<form
					method="POST"
					action="?/simulate"
					use:enhance={() => {
						isSimulating = true;
						return async ({ update }) => {
							await update();
							isSimulating = false;
						};
					}}
					class="mt-4"
				>
					<button
						type="submit"
						disabled={isSimulating}
						class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
					>
						<Zap class="w-3.5 h-3.5" />
						<span>Buat Pesanan Demo</span>
					</button>
				</form>
			{/if}
		</div>
	{:else}
		<div class="space-y-4">
			{#each filteredOrders as order (order.id)}
				{@const items = parseOrderItems(order.items)}
				<div class="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-4 md:p-5 shadow-xs transition-all space-y-4">
					<!-- Kartu Bar Atas: Status, Nomor Pesanan, Info Pembeli -->
					<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
						<div class="flex items-center gap-2.5 flex-wrap">
							<!-- Status Badge -->
							{#if order.order_status === 'READY_TO_SHIP'}
								<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
									<span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
									Perlu Dikirim
								</span>
							{:else if order.order_status === 'SHIPPED'}
								<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
									<Truck class="w-3.5 h-3.5 text-sky-600" />
									Sedang Dikirim
								</span>
							{:else if order.order_status === 'COMPLETED'}
								<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
									<CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
									Selesai
								</span>
							{:else}
								<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
									<XCircle class="w-3.5 h-3.5 text-rose-600" />
									Dibatalkan
								</span>
							{/if}

							<!-- Nomor Pesanan dengan Quick Copy -->
							<div class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/80">
								<span>#{order.order_sn}</span>
								<button
									onclick={() => copyToClipboard(order.order_sn)}
									class="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer transition-colors"
									title="Salin Nomor Pesanan"
								>
									{#if copiedSn === order.order_sn}
										<Check class="w-3.5 h-3.5 text-emerald-600" />
									{:else}
										<Copy class="w-3.5 h-3.5" />
									{/if}
								</button>
							</div>

							<!-- Status Potong Stok Gudang -->
							{#if order.stock_deducted && order.order_status !== 'CANCELLED'}
								<span class="text-[11px] bg-slate-50 text-slate-600 border border-slate-200 font-medium px-2 py-0.5 rounded-md">
									Stok Terpotong Otomatis
								</span>
							{:else if order.order_status === 'CANCELLED'}
								<span class="text-[11px] bg-slate-100 text-slate-500 border border-slate-200 font-medium px-2 py-0.5 rounded-md">
									Stok Dikembalikan
								</span>
							{/if}
						</div>

						<!-- Info Pembeli & Tanggal -->
						<div class="flex items-center gap-2 text-xs text-slate-500">
							<span>Pembeli: <strong class="text-slate-800 font-semibold">@{order.buyer_username}</strong></span>
							<span>•</span>
							<span>{formatDate(order.shopee_created_at || order.created_at)}</span>
						</div>
					</div>

					<!-- Kartu Konten: Produk & Ekspedisi -->
					<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
						<!-- Kolom Produk (8 cols) -->
						<div class="md:col-span-8 space-y-2">
							{#each items as itm}
								<div class="flex items-center justify-between text-xs py-1">
									<div class="flex items-center gap-2.5 min-w-0 pr-2">
										<div class="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-[11px] font-bold shrink-0">
											{itm.qty}x
										</div>
										<span class="font-medium text-slate-900 truncate" title={itm.name}>{itm.name}</span>
										{#if itm.sku}
											<span class="text-[11px] text-slate-400 hidden sm:inline">({itm.sku})</span>
										{/if}
									</div>
									<div class="text-right shrink-0">
										<span class="font-semibold text-slate-800">{formatCurrency(itm.subtotal || itm.price * itm.qty)}</span>
									</div>
								</div>
							{/each}
						</div>

						<!-- Kolom Ekspedisi & Tagihan (4 cols) -->
						<div class="md:col-span-4 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60 text-xs space-y-2">
							<div class="flex items-center justify-between text-[11px]">
								<span class="text-slate-500">Kurir Pengiriman:</span>
								<span class="font-semibold px-2 py-0.5 rounded-md {order.shipping_carrier?.includes('SPX') ? 'bg-orange-100 text-orange-800' : 'bg-slate-200 text-slate-800'}">
									{order.shipping_carrier || 'SPX Express'}
								</span>
							</div>

							<div class="flex items-center justify-between text-[11px]">
								<span class="text-slate-500">No. Resi / AWB:</span>
								<div class="flex items-center gap-1 font-semibold text-slate-900">
									<span>{order.tracking_number || 'Belum diinput'}</span>
									{#if order.tracking_number}
										<button
											onclick={() => copyToClipboard(order.tracking_number)}
											class="text-slate-400 hover:text-slate-700 cursor-pointer"
											title="Salin Nomor Resi"
										>
											<Copy class="w-3 h-3" />
										</button>
									{/if}
								</div>
							</div>

							<div class="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
								<span class="text-slate-600 font-medium">Total Pesanan:</span>
								<span class="font-bold text-slate-900 text-sm">{formatCurrency(order.total_amount)}</span>
							</div>
						</div>
					</div>

					<!-- Kartu Bar Bawah: Info Dana Toko & Aksi Tombol -->
					<div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
						<div class="text-xs text-slate-500">
							Est. Dana Bersih Toko: <strong class="text-emerald-700 font-bold">{formatCurrency(order.shopee_escrow_amount || order.total_amount * 0.94)}</strong>
						</div>

						<div class="flex items-center gap-2 flex-wrap">
							<!-- Cetak Resi -->
							<button
								type="button"
								onclick={() => openPrintModal(order)}
								class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
								title="Cetak label pengiriman thermal A6"
							>
								<Printer class="w-3.5 h-3.5 text-slate-600" />
								<span>Cetak Label A6</span>
							</button>

							<!-- Aksi Sesuai Status -->
							{#if order.order_status === 'READY_TO_SHIP'}
								<button
									type="button"
									onclick={() => openResiModal(order)}
									class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-xs transition-colors cursor-pointer"
								>
									<Truck class="w-3.5 h-3.5" />
									<span>Input Resi & Kirim</span>
								</button>

								<form method="POST" action="?/updateStatus" use:enhance>
									<input type="hidden" name="order_sn" value={order.order_sn} />
									<input type="hidden" name="status" value="CANCELLED" />
									<button
										type="submit"
										onclick={(e) => {
											if (!confirm(`Yakin ingin membatalkan pesanan #${order.order_sn}? Stok akan dikembalikan ke gudang.`)) {
												e.preventDefault();
											}
										}}
										class="px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
										title="Batalkan pesanan dan kembalikan stok"
									>
										Batalkan
									</button>
								</form>
							{:else if order.order_status === 'SHIPPED'}
								<form method="POST" action="?/updateStatus" use:enhance>
									<input type="hidden" name="order_sn" value={order.order_sn} />
									<input type="hidden" name="status" value="COMPLETED" />
									<button
										type="submit"
										class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
									>
										<CheckCircle2 class="w-3.5 h-3.5" />
										<span>Tandai Selesai</span>
									</button>
								</form>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Modal Input Resi / Kirim Pesanan -->
{#if showResiModal && selectedOrderForResi}
	<div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 shadow-xl">
			<div class="flex justify-between items-center pb-3 border-b border-slate-100">
				<h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
					<Truck class="w-4 h-4 text-orange-600" />
					Konfirmasi Pengiriman Pesanan
				</h3>
				<button
					onclick={() => (showResiModal = false)}
					class="text-slate-400 hover:text-slate-600 text-lg cursor-pointer p-1"
				>
					✕
				</button>
			</div>

			<div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1.5 text-slate-600">
				<div class="flex justify-between">
					<span>No. Pesanan:</span>
					<strong class="text-slate-900 font-semibold">#{selectedOrderForResi.order_sn}</strong>
				</div>
				<div class="flex justify-between">
					<span>Pembeli:</span>
					<strong class="text-slate-900 font-semibold">@{selectedOrderForResi.buyer_username}</strong>
				</div>
				<div class="flex justify-between">
					<span>Kurir:</span>
					<strong class="text-slate-900 font-semibold">{selectedOrderForResi.shipping_carrier || 'SPX Express'}</strong>
				</div>
			</div>

			<form
				method="POST"
				action="?/updateStatus"
				use:enhance={() => {
					showResiModal = false;
					return async ({ update }) => {
						await update();
					};
				}}
				class="space-y-4"
			>
				<input type="hidden" name="order_sn" value={selectedOrderForResi.order_sn} />
				<input type="hidden" name="status" value="SHIPPED" />

				<div>
					<label class="block text-xs font-semibold text-slate-700 mb-1.5" for="tracking_number_input">
						Nomor Resi / AWB:
					</label>
					<input
						id="tracking_number_input"
						name="tracking_number"
						type="text"
						bind:value={trackingNumberInput}
						required
						placeholder="Contoh: SPXID0291029102"
						class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all text-slate-900"
					/>
					<p class="text-[11px] text-slate-500 mt-1">Nomor resi dari kurir ekspedisi untuk pelacakan pembeli di Shopee.</p>
				</div>

				<div class="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
					<button
						type="button"
						onclick={() => (showResiModal = false)}
						class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
					>
						Batal
					</button>
					<button
						type="submit"
						class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
					>
						Kirim Pesanan
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Modal Cetak Label Pengiriman Shopee (Thermal Stiker 100x150mm / A6) -->
{#if showPrintModal && selectedOrderForPrint}
	{@const pItems = parseOrderItems(selectedOrderForPrint.items)}
	<div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 print:p-0 print:bg-white">
		<div class="bg-white rounded-2xl border border-slate-200 w-full max-w-sm max-h-[92vh] overflow-y-auto p-5 space-y-4 shadow-xl print:p-0 print:border-none print:shadow-none print:max-w-full">
			<div class="flex justify-between items-center pb-2.5 border-b border-slate-100 print:hidden">
				<h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
					<Printer class="w-4 h-4 text-orange-600" />
					Label Pengiriman Shopee (A6)
				</h3>
				<button
					onclick={() => (showPrintModal = false)}
					class="text-slate-400 hover:text-slate-600 text-lg cursor-pointer p-1"
				>
					✕
				</button>
			</div>

			<!-- Kartu Label Thermal Siap Cetak -->
			<div class="border-2 border-dashed border-slate-300 p-4 rounded-xl bg-white text-slate-900 text-xs space-y-3 print:border-none print:p-0">
				<!-- Header Label Shopee & Kurir -->
				<div class="flex justify-between items-center border-b-2 border-slate-900 pb-2.5">
					<span class="text-xl font-black tracking-tight text-orange-600">Shopee</span>
					<span class="text-xs font-bold uppercase bg-slate-900 text-white px-2.5 py-1 rounded">
						{selectedOrderForPrint.shipping_carrier || 'SPX Express'}
					</span>
				</div>

				<!-- Barcode & Nomor Resi -->
				<div class="text-center py-2 bg-slate-50 rounded-lg border border-slate-200">
					<!-- Visual Barcode Lines -->
					<div class="flex justify-center items-end h-10 gap-[2px] mb-1 px-4 overflow-hidden" aria-hidden="true">
						<div class="w-1 h-full bg-slate-900"></div>
						<div class="w-0.5 h-full bg-slate-900"></div>
						<div class="w-1.5 h-full bg-slate-900"></div>
						<div class="w-0.5 h-full bg-slate-900"></div>
						<div class="w-1 h-full bg-slate-900"></div>
						<div class="w-2 h-full bg-slate-900"></div>
						<div class="w-0.5 h-full bg-slate-900"></div>
						<div class="w-1 h-full bg-slate-900"></div>
						<div class="w-1.5 h-full bg-slate-900"></div>
						<div class="w-0.5 h-full bg-slate-900"></div>
						<div class="w-1 h-full bg-slate-900"></div>
						<div class="w-2 h-full bg-slate-900"></div>
						<div class="w-1 h-full bg-slate-900"></div>
						<div class="w-0.5 h-full bg-slate-900"></div>
						<div class="w-1.5 h-full bg-slate-900"></div>
						<div class="w-1 h-full bg-slate-900"></div>
						<div class="w-2 h-full bg-slate-900"></div>
					</div>
					<p class="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">No. Resi / AWB</p>
					<p class="text-sm font-bold tracking-widest text-slate-900">
						{selectedOrderForPrint.tracking_number || 'SPXID9928172910'}
					</p>
				</div>

				<!-- Detail Alamat & Pesanan -->
				<div class="border-y border-slate-200 py-2.5 space-y-1.5 text-xs">
					<div class="flex justify-between">
						<span class="text-slate-500">Pengirim:</span>
						<span class="font-bold text-slate-900">Toko Aneka Rasa 99</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-500">Penerima:</span>
						<span class="font-bold text-slate-900">@{selectedOrderForPrint.buyer_username}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-500">No. Order:</span>
						<span class="font-semibold text-slate-900">#{selectedOrderForPrint.order_sn}</span>
					</div>
				</div>

				<!-- Daftar Isi Paket -->
				<div>
					<p class="text-[11px] font-bold text-slate-700 mb-1">DAFTAR ISI PAKET:</p>
					<div class="space-y-1">
						{#each pItems as itm}
							<div class="flex justify-between text-[11px] text-slate-800">
								<span class="truncate pr-2">• {itm.name}</span>
								<span class="font-bold shrink-0">x{itm.qty}</span>
							</div>
						{/each}
					</div>
				</div>

				<!-- Total Pembayaran -->
				<div class="border-t-2 border-slate-900 pt-2 flex justify-between items-center font-bold">
					<span class="text-xs uppercase text-slate-700">Total Tagihan:</span>
					<span class="text-sm text-slate-900">{formatCurrency(selectedOrderForPrint.total_amount)}</span>
				</div>
			</div>

			<!-- Tombol Modal Print -->
			<div class="flex justify-end gap-2.5 pt-3 border-t border-slate-100 print:hidden">
				<button
					type="button"
					onclick={() => (showPrintModal = false)}
					class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
				>
					Tutup
				</button>
				<button
					type="button"
					onclick={() => window.print()}
					class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
				>
					<Printer class="w-3.5 h-3.5" />
					<span>Cetak Label Thermal</span>
				</button>
			</div>
		</div>
	</div>
{/if}
