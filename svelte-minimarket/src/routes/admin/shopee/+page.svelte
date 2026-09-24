<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import {
		ShoppingBag,
		Truck,
		Package,
		CheckCircle2,
		XCircle,
		Clock,
		Search,
		Zap,
		ExternalLink,
		Copy,
		Check,
		Printer,
		ChevronRight,
		RefreshCw,
		AlertCircle
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
				dateStyle: 'medium',
				timeStyle: 'short'
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
		}, 1500);
	}

	function openResiModal(order: any) {
		selectedOrderForResi = order;
		trackingNumberInput = order.tracking_number || `${order.shipping_carrier?.startsWith('SPX') ? 'SPXID' : 'JT'}${Math.floor(1000000000 + Math.random() * 9000000000)}`;
		showResiModal = true;
	}

	function openPrintModal(order: any) {
		selectedOrderForPrint = order;
		showPrintModal = true;
	}

	let filteredOrders = $derived(
		(data.orders || []).filter((o: any) => {
			const matchStatus = activeFilter === 'ALL' || o.order_status === activeFilter;
			const matchSearch =
				!searchQuery.trim() ||
				o.order_sn.toLowerCase().includes(searchQuery.toLowerCase()) ||
				o.buyer_username.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(o.tracking_number && o.tracking_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
				(o.shipping_carrier && o.shipping_carrier.toLowerCase().includes(searchQuery.toLowerCase()));
			return matchStatus && matchSearch;
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
	<title>Pesanan Shopee & Resi - Toko Aneka Rasa 99</title>
</svelte:head>

<div class="space-y-5 p-3 md:p-6 max-w-7xl mx-auto">
	<!-- Top Alert jika ada notifikasi aksi -->
	{#if form?.message}
		<div
			class="p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between shadow-xs transition-all {form.success
				? 'bg-emerald-50 border-emerald-300 text-emerald-800'
				: 'bg-rose-50 border-rose-300 text-rose-800'}"
		>
			<div class="flex items-center gap-2">
				{#if form.success}
					<CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
				{:else}
					<AlertCircle class="w-4 h-4 text-rose-600 shrink-0" />
				{/if}
				<span>{form.message}</span>
			</div>
		</div>
	{/if}

	<!-- Header Panel -->
	<header class="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
		<div class="flex items-center gap-3">
			<div class="w-11 h-11 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm shrink-0">
				<ShoppingBag class="w-6 h-6" />
			</div>
			<div>
				<div class="flex items-center gap-2 flex-wrap">
					<h1 class="text-base md:text-lg font-black text-slate-900">Manajemen Pesanan Shopee</h1>
					<span class="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded font-mono flex items-center gap-1">
						<span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
						Shopee Toko Aneka Rasa 99
					</span>
				</div>
				<p class="text-xs text-slate-500 font-mono mt-0.5">
					Orderan otomatis potong stok gudang, catat buku besar mutasi, dan rekap omset online.
				</p>
			</div>
		</div>

		<!-- Action: Simulasi Order Shopee Baru -->
		<form method="POST" action="?/simulate" use:enhance={() => {
			isSimulating = true;
			return async ({ update }) => {
				await update();
				isSimulating = false;
			};
		}}>
			<button
				type="submit"
				disabled={isSimulating}
				class="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
				title="Simulasikan pembeli Shopee memesan produk khas Bangka"
			>
				<Zap class="w-4 h-4 {isSimulating ? 'animate-spin' : ''}" />
				<span>{isSimulating ? 'Memproses Order...' : '⚡ Simulasikan Pesanan Shopee Baru'}</span>
			</button>
		</form>
	</header>

	{#if (data as any)?.authSuccess}
		<div class="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between gap-3 shadow-xs">
			<div class="flex items-center gap-3">
				<CheckCircle2 class="w-6 h-6 text-emerald-600 shrink-0" />
				<div>
					<p class="font-bold text-sm">🎉 Otorisasi Shopee Berhasil!</p>
					<p class="text-xs text-emerald-700">Toko Shopee Anda telah resmi terhubung dengan <strong>Shop ID: {(data as any).authSuccess.shopId}</strong>.</p>
				</div>
			</div>
			<span class="bg-emerald-600 text-white font-mono text-xs px-3 py-1 rounded-lg font-bold">TERHUBUNG LIVE</span>
		</div>
	{/if}

	<!-- Shopee Open Platform 2-Way Realtime Sync Banner -->
	<div class="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 rounded-xl p-3.5 shadow-2xs text-xs">
		<div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
			<div class="flex items-center gap-2.5">
				<div class="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
					2W
				</div>
				<div>
					<div class="flex items-center gap-2 flex-wrap">
						<span class="font-bold text-slate-900">Shopee Open Platform 2-Way Real-Time Sync</span>
						<span class="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
							<span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span> Terhubung Aktif
						</span>
					</div>
					<p class="text-[11px] text-slate-600 mt-0.5">
						Toko tidak perlu lagi buka aplikasi Shopee Seller. Pesanan masuk otomatis memotong stok gudang, dan penjualan kasir toko otomatis menyelaraskan etalase Shopee.
					</p>
				</div>
			</div>

			<div class="flex items-center gap-2 font-mono text-[10px] shrink-0 self-end md:self-center">
				<span class="bg-white px-2.5 py-1 rounded border border-orange-200 text-slate-700 font-bold">
					Shop ID: {data.connectionStatus?.shopId || '99281729'}
				</span>
				<span class="bg-white px-2.5 py-1 rounded border border-orange-200 text-slate-700 font-bold">
					HMAC-SHA256 API v2
				</span>
			</div>
		</div>
	</div>

	<!-- KPI Metrics Grid -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
		<!-- Perlu Dikirim -->
		<div class="bg-white border-2 {data.stats?.ready_to_ship > 0 ? 'border-orange-400 bg-orange-50/20' : 'border-slate-200'} rounded-xl p-3.5 shadow-xs">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-mono font-bold text-slate-500 uppercase">Perlu Dikirim</span>
				<div class="p-1.5 bg-orange-100 text-orange-700 rounded-lg">
					<Package class="w-4 h-4" />
				</div>
			</div>
			<p class="text-2xl font-black text-slate-900 mt-2">{data.stats?.ready_to_ship || 0}</p>
			<p class="text-[10px] text-orange-700 font-semibold mt-1">Harus segera dipacking toko</p>
		</div>

		<!-- Sedang Dikirim -->
		<div class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-mono font-bold text-slate-500 uppercase">Sedang Dikirim</span>
				<div class="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
					<Truck class="w-4 h-4" />
				</div>
			</div>
			<p class="text-2xl font-black text-slate-900 mt-2">{data.stats?.shipped || 0}</p>
			<p class="text-[10px] text-slate-500 font-mono mt-1">Dalam perjalanan kurir</p>
		</div>

		<!-- Selesai -->
		<div class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-mono font-bold text-slate-500 uppercase">Pesanan Selesai</span>
				<div class="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
					<CheckCircle2 class="w-4 h-4" />
				</div>
			</div>
			<p class="text-2xl font-black text-slate-900 mt-2">{data.stats?.completed || 0}</p>
			<p class="text-[10px] text-emerald-700 font-semibold mt-1">Dana siap ditarik</p>
		</div>

		<!-- Total Omset Shopee -->
		<div class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
			<div class="flex items-center justify-between">
				<span class="text-[10px] font-mono font-bold text-slate-500 uppercase">Total Omset Shopee</span>
				<div class="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
					<ShoppingBag class="w-4 h-4" />
				</div>
			</div>
			<p class="text-xl md:text-2xl font-black text-purple-700 font-mono mt-2">
				{formatCurrency(data.stats?.total_revenue || 0)}
			</p>
			<p class="text-[10px] text-slate-500 font-mono mt-1">
				Estimasi Bersih: {formatCurrency(data.stats?.total_escrow || 0)}
			</p>
		</div>
	</div>

	<!-- Controls & Filter Bar -->
	<div class="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
		<!-- Status Tabs -->
		<div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
			<button
				onclick={() => (activeFilter = 'ALL')}
				class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer {activeFilter === 'ALL'
					? 'bg-slate-900 text-white shadow-xs'
					: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
			>
				Semua ({data.orders?.length || 0})
			</button>
			<button
				onclick={() => (activeFilter = 'READY_TO_SHIP')}
				class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer {activeFilter === 'READY_TO_SHIP'
					? 'bg-orange-500 text-white shadow-xs'
					: 'bg-orange-50 text-orange-700 hover:bg-orange-100'}"
			>
				Perlu Dikirim ({data.stats?.ready_to_ship || 0})
			</button>
			<button
				onclick={() => (activeFilter = 'SHIPPED')}
				class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer {activeFilter === 'SHIPPED'
					? 'bg-blue-600 text-white shadow-xs'
					: 'bg-blue-50 text-blue-700 hover:bg-blue-100'}"
			>
				Sedang Dikirim ({data.stats?.shipped || 0})
			</button>
			<button
				onclick={() => (activeFilter = 'COMPLETED')}
				class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer {activeFilter === 'COMPLETED'
					? 'bg-emerald-600 text-white shadow-xs'
					: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}"
			>
				Selesai ({data.stats?.completed || 0})
			</button>
			<button
				onclick={() => (activeFilter = 'CANCELLED')}
				class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer {activeFilter === 'CANCELLED'
					? 'bg-rose-600 text-white shadow-xs'
					: 'bg-rose-50 text-rose-700 hover:bg-rose-100'}"
			>
				Dibatalkan ({data.stats?.cancelled || 0})
			</button>
		</div>

		<!-- Search Input -->
		<div class="relative w-full md:w-64">
			<Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Cari No. Pesanan, Resi, Pembeli..."
				class="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:border-orange-500 text-slate-900"
			/>
		</div>
	</div>

	<!-- Orders List -->
	{#if filteredOrders.length === 0}
		<div class="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
			<Package class="w-12 h-12 mx-auto mb-2 text-slate-300" />
			<p class="text-sm font-semibold text-slate-600">Tidak ada pesanan Shopee di kategori ini.</p>
			<p class="text-xs text-slate-400 mt-1 font-mono">Gunakan tombol "Simulasikan Pesanan Shopee Baru" untuk membuat pesanan demo.</p>
		</div>
	{:else}
		<div class="space-y-3.5">
			{#each filteredOrders as order (order.id)}
				{@const items = parseOrderItems(order.items)}
				<div class="bg-white border border-slate-200 hover:border-orange-300 rounded-xl p-4 md:p-5 shadow-xs transition-all flex flex-col space-y-3">
					<!-- Order Header -->
					<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
						<div class="flex items-center gap-2.5 flex-wrap">
							<!-- Status Badge -->
							{#if order.order_status === 'READY_TO_SHIP'}
								<span class="bg-orange-100 text-orange-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
									<span class="w-1.5 h-1.5 rounded-full bg-orange-600"></span> Perlu Dikirim
								</span>
							{:else if order.order_status === 'SHIPPED'}
								<span class="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
									<Truck class="w-3 h-3" /> Sedang Dikirim
								</span>
							{:else if order.order_status === 'COMPLETED'}
								<span class="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
									<CheckCircle2 class="w-3 h-3" /> Selesai
								</span>
							{:else}
								<span class="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
									<XCircle class="w-3 h-3" /> Dibatalkan
								</span>
							{/if}

							<!-- Order SN with Copy -->
							<div class="flex items-center gap-1 font-mono text-xs font-bold text-slate-900">
								<span>No: #{order.order_sn}</span>
								<button
									onclick={() => copyToClipboard(order.order_sn)}
									class="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
									title="Salin No. Pesanan"
								>
									{#if copiedSn === order.order_sn}
										<Check class="w-3 h-3 text-emerald-600" />
									{:else}
										<Copy class="w-3 h-3" />
									{/if}
								</button>
							</div>

							<!-- Stock Deducted Badge -->
							{#if order.stock_deducted && order.order_status !== 'CANCELLED'}
								<span class="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-1.5 py-0.5 rounded font-mono">
									✅ Stok Gudang Terpotong
								</span>
							{:else if order.order_status === 'CANCELLED'}
								<span class="text-[9px] bg-slate-100 text-slate-600 border border-slate-200 font-bold px-1.5 py-0.5 rounded font-mono">
									🔄 Stok Dikembalikan
								</span>
							{/if}
						</div>

						<!-- Buyer & Timestamp -->
						<div class="flex items-center gap-3 text-xs text-slate-500 font-mono">
							<span>Pembeli: <strong class="text-slate-800">@{order.buyer_username}</strong></span>
							<span>•</span>
							<span>{formatDate(order.shopee_created_at || order.created_at)}</span>
						</div>
					</div>

					<!-- Order Content: Items & Shipping -->
					<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
						<!-- Product Items Column (8 cols) -->
						<div class="md:col-span-8 space-y-1.5">
							{#each items as itm}
								<div class="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-none">
									<div class="flex items-center gap-2 min-w-0 pr-2">
										<div class="w-6 h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-mono shrink-0">
											{itm.qty}x
										</div>
										<span class="font-bold text-slate-900 truncate" title={itm.name}>{itm.name}</span>
										<span class="text-[10px] text-slate-400 font-mono hidden sm:inline">({itm.sku})</span>
									</div>
									<div class="text-right shrink-0 font-mono">
										<span class="font-bold text-slate-900">{formatCurrency(itm.subtotal || itm.price * itm.qty)}</span>
									</div>
								</div>
							{/each}
						</div>

						<!-- Shipping & Carrier Column (4 cols) -->
						<div class="md:col-span-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
							<div class="flex items-center justify-between text-[11px]">
								<span class="text-slate-500 font-mono">Kurir Ekspedisi:</span>
								<span class="font-bold font-mono px-1.5 py-0.5 rounded {order.shipping_carrier?.includes('SPX') ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}">
									{order.shipping_carrier || 'SPX Express'}
								</span>
							</div>
							<div class="flex items-center justify-between text-[11px]">
								<span class="text-slate-500 font-mono">No. Resi:</span>
								<div class="flex items-center gap-1 font-mono font-bold text-slate-800">
									<span>{order.tracking_number || 'Belum dibuat'}</span>
									{#if order.tracking_number}
										<button onclick={() => copyToClipboard(order.tracking_number)} class="text-slate-400 hover:text-slate-700" title="Salin Resi">
											<Copy class="w-2.5 h-2.5" />
										</button>
									{/if}
								</div>
							</div>
							<div class="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
								<span class="text-slate-600 font-bold">Total Pembayaran:</span>
								<span class="font-bold font-mono text-emerald-700 text-sm">{formatCurrency(order.total_amount)}</span>
							</div>
						</div>
					</div>

					<!-- Order Footer Actions -->
					<div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
						<div class="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
							<span>Toko Aneka Rasa 99</span>
							<span>•</span>
							<span>Est. Cair: <strong>{formatCurrency(order.shopee_escrow_amount || order.total_amount * 0.94)}</strong></span>
						</div>

						<div class="flex items-center gap-2 flex-wrap">
							<!-- Cetak Label Resi -->
							<button
								onclick={() => openPrintModal(order)}
								class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
								title="Cetak Resi Pengiriman Thermal Stiker"
							>
								<Printer class="w-3.5 h-3.5" /> <span>Cetak Resi</span>
							</button>

							<!-- Aksi Berdasarkan Status -->
							{#if order.order_status === 'READY_TO_SHIP'}
								<button
									onclick={() => openResiModal(order)}
									class="bg-orange-600 hover:bg-orange-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
								>
									<Truck class="w-3.5 h-3.5" /> <span>Input Resi & Kirim</span>
								</button>
								<form method="POST" action="?/updateStatus" use:enhance>
									<input type="hidden" name="order_sn" value={order.order_sn} />
									<input type="hidden" name="status" value="CANCELLED" />
									<button
										type="submit"
										class="text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer"
										title="Batalkan dan kembalikan stok ke gudang"
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
										class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
									>
										<CheckCircle2 class="w-3.5 h-3.5" /> <span>Tandai Selesai</span>
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
	<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-xl border border-slate-300 w-full max-w-md p-5 space-y-4 shadow-2xl">
			<div class="flex justify-between items-center pb-2 border-b border-slate-200">
				<h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
					<Truck class="w-4 h-4 text-orange-600" />
					Konfirmasi Kirim Pesanan Shopee
				</h3>
				<button onclick={() => (showResiModal = false)} class="text-slate-400 hover:text-slate-700 text-base cursor-pointer">✕</button>
			</div>

			<div class="text-xs space-y-2 text-slate-600">
				<p>Nomor Pesanan: <strong class="text-slate-900 font-mono">#{selectedOrderForResi.order_sn}</strong></p>
				<p>Pembeli: <strong class="text-slate-900">@{selectedOrderForResi.buyer_username}</strong></p>
				<p>Ekspedisi: <strong class="text-slate-900 font-mono">{selectedOrderForResi.shipping_carrier}</strong></p>
			</div>

			<form method="POST" action="?/updateStatus" use:enhance={() => {
				showResiModal = false;
				return async ({ update }) => {
					await update();
				};
			}} class="space-y-3">
				<input type="hidden" name="order_sn" value={selectedOrderForResi.order_sn} />
				<input type="hidden" name="status" value="SHIPPED" />

				<div>
					<label class="block text-xs font-bold text-slate-700 mb-1" for="tracking_number_input">
						Nomor Resi / AWB:
					</label>
					<input
						id="tracking_number_input"
						name="tracking_number"
						type="text"
						bind:value={trackingNumberInput}
						required
						placeholder="Contoh: SPXID0291029102"
						class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-orange-500 font-bold"
					/>
				</div>

				<div class="flex justify-end gap-2 pt-2 border-t border-slate-200">
					<button
						type="button"
						onclick={() => (showResiModal = false)}
						class="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
					>
						Batal
					</button>
					<button
						type="submit"
						class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs cursor-pointer"
					>
						Kirim Pesanan
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Modal Cetak Label Pengiriman Shopee (Thermal Stiker 100x150mm) -->
{#if showPrintModal && selectedOrderForPrint}
	{@const pItems = parseOrderItems(selectedOrderForPrint.items)}
	<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
		<div class="bg-white rounded-xl border border-slate-300 w-full max-w-sm max-h-[95vh] overflow-y-auto p-5 space-y-4 shadow-2xl print:p-0 print:border-none print:shadow-none">
			<div class="flex justify-between items-center pb-2 border-b border-slate-200 print:hidden">
				<h3 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
					<Printer class="w-4 h-4 text-orange-600" />
					Label Pengiriman Shopee
				</h3>
				<button onclick={() => (showPrintModal = false)} class="text-slate-400 hover:text-slate-700 text-base cursor-pointer">✕</button>
			</div>

			<!-- Thermal Label Shipping Card -->
			<div class="border-2 border-dashed border-slate-300 p-4 rounded-lg bg-white text-slate-900 font-mono text-xs space-y-2.5">
				<div class="flex justify-between items-center border-b-2 border-black pb-2">
					<span class="text-lg font-black tracking-wider text-orange-600">Shopee</span>
					<span class="text-xs font-black uppercase bg-black text-white px-2 py-0.5">{selectedOrderForPrint.shipping_carrier || 'SPX Express'}</span>
				</div>

				<div class="text-center py-1">
					<p class="text-[10px] text-slate-500">NO. RESI / AIRWAY BILL</p>
					<p class="text-base font-black tracking-widest">{selectedOrderForPrint.tracking_number || 'SPXID9928172910'}</p>
				</div>

				<div class="border-t border-b border-slate-200 py-2 space-y-1 text-[11px]">
					<div class="flex justify-between">
						<span class="text-slate-500">Pengirim:</span>
						<span class="font-bold">Toko Aneka Rasa 99</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-500">Penerima:</span>
						<span class="font-bold">@{selectedOrderForPrint.buyer_username}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-slate-500">No. Order:</span>
						<span class="font-bold">#{selectedOrderForPrint.order_sn}</span>
					</div>
				</div>

				<!-- Items Brief -->
				<div>
					<p class="text-[10px] text-slate-500 font-bold mb-1">DAFTAR ISI PAKET:</p>
					{#each pItems as itm}
						<p class="text-[10px] truncate leading-tight">• {itm.name} (x{itm.qty})</p>
					{/each}
				</div>

				<div class="border-t border-black pt-2 flex justify-between items-center font-bold">
					<span>TOTAL:</span>
					<span class="text-sm">{formatCurrency(selectedOrderForPrint.total_amount)}</span>
				</div>
			</div>

			<div class="flex justify-end gap-2 pt-2 border-t border-slate-200 print:hidden">
				<button
					type="button"
					onclick={() => (showPrintModal = false)}
					class="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
				>
					Tutup
				</button>
				<button
					type="button"
					onclick={() => window.print()}
					class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
				>
					<Printer class="w-3.5 h-3.5" /> Cetak Label Stiker
				</button>
			</div>
		</div>
	</div>
{/if}
