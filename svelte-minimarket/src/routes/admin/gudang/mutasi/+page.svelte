<script lang="ts">
	import { History, Filter, ArrowDownLeft, ArrowUpRight, Search, ShoppingBag, Truck, Package, RotateCcw, X } from 'lucide-svelte';

	let { data } = $props();

	let searchQuery = $state(data.searchQuery || '');

	function formatCurrency(val: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(val || 0);
	}

	function getBadgeInfo(type: string): { label: string; color: string } {
		switch (type) {
			case 'SALE':
				return { label: 'Kasir Toko', color: 'bg-rose-50 text-rose-700 border-rose-200' };
			case 'RESTOCK':
				return { label: 'Restock Masuk', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
			case 'INITIAL':
				return { label: 'Stok Awal', color: 'bg-slate-100 text-slate-700 border-slate-200' };
			case 'SHOPEE_ORDER':
				return { label: 'Pesanan Shopee', color: 'bg-orange-50 text-orange-700 border-orange-200' };
			case 'SHOPEE_CANCEL':
				return { label: 'Batal Shopee', color: 'bg-amber-50 text-amber-800 border-amber-200' };
			case 'ADJUSTMENT':
				return { label: 'Koreksi Stok', color: 'bg-amber-50 text-amber-700 border-amber-200' };
			case 'VOID':
				return { label: 'Void Kasir', color: 'bg-sky-50 text-sky-700 border-sky-200' };
			default:
				return { label: type, color: 'bg-slate-100 text-slate-700 border-slate-200' };
		}
	}
</script>

<svelte:head>
	<title>Buku Besar Mutasi Stok - Toko Aneka Rasa 99</title>
</svelte:head>

<div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
	<!-- Header -->
	<header class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pb-4 border-b border-slate-200">
		<div>
			<div class="flex items-center gap-2 mb-1 flex-wrap">
				<span class="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">Gudang & Inventori</span>
				<span class="text-xs text-slate-500">Audit Trail Mutasi Stok</span>
			</div>
			<h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
				<History class="w-6 h-6 text-purple-600 shrink-0" />
				<span>Riwayat Mutasi Stok</span>
			</h1>
			<p class="text-xs text-slate-500 mt-0.5">Catatan lengkap setiap pergerakan stok: transaksi kasir, Shopee, restock barang masuk, dan koreksi manual.</p>
		</div>

		<div class="flex items-center gap-2">
			<a
				href="/admin/inventory"
				class="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
			>
				← Kembali ke Inventori
			</a>
		</div>
	</header>

	<!-- Filter & Search Bar -->
	<div class="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
		<!-- Tabs Kategori Mutasi -->
		<div class="bg-slate-100/80 p-1 rounded-xl flex items-center gap-1 overflow-x-auto custom-scrollbar">
			<a
				href="/admin/gudang/mutasi{searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}"
				class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 {data.filterType === 'ALL'
					? 'bg-white text-slate-900 font-semibold shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				Semua Mutasi
			</a>
			<a
				href="/admin/gudang/mutasi?type=SALE{searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}"
				class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 {data.filterType === 'SALE'
					? 'bg-white text-rose-700 font-semibold shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				Kasir Toko (SALE)
			</a>
			<a
				href="/admin/gudang/mutasi?type=SHOPEE{searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}"
				class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 {data.filterType === 'SHOPEE'
					? 'bg-white text-orange-700 font-semibold shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				Shopee
			</a>
			<a
				href="/admin/gudang/mutasi?type=RESTOCK{searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}"
				class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 {data.filterType === 'RESTOCK'
					? 'bg-white text-emerald-700 font-semibold shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				Restock Masuk
			</a>
			<a
				href="/admin/gudang/mutasi?type=ADJUSTMENT{searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}"
				class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 {data.filterType === 'ADJUSTMENT'
					? 'bg-white text-amber-700 font-semibold shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				Koreksi Stok
			</a>
			<a
				href="/admin/gudang/mutasi?type=VOID{searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}"
				class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 {data.filterType === 'VOID'
					? 'bg-white text-sky-700 font-semibold shadow-xs'
					: 'text-slate-600 hover:text-slate-900'}"
			>
				Void / Batal
			</a>
		</div>

		<!-- Pencarian Riwayat -->
		<form method="GET" class="relative w-full md:w-64">
			{#if data.filterType !== 'ALL'}
				<input type="hidden" name="type" value={data.filterType} />
			{/if}
			<Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
			<input
				type="text"
				name="q"
				bind:value={searchQuery}
				placeholder="Cari produk / nota / catatan..."
				class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-1.5 text-xs outline-none focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all text-slate-900"
			/>
			{#if searchQuery}
				<a
					href="/admin/gudang/mutasi{data.filterType !== 'ALL' ? `?type=${data.filterType}` : ''}"
					class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
				>
					<X class="w-3.5 h-3.5" />
				</a>
			{/if}
		</form>
	</div>

	<!-- Tabel Riwayat Mutasi Stok -->
	<div class="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs border-collapse">
				<thead>
					<tr class="text-slate-500 border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold">
						<th class="py-3 px-4">WAKTU</th>
						<th class="py-3 px-4">NAMA PRODUK</th>
						<th class="py-3 px-4">TIPE MUTASI</th>
						<th class="py-3 px-4 text-right">PERUBAHAN</th>
						<th class="py-3 px-4 text-right">STOK AKHIR</th>
						{#if data.isOwner}
							<th class="py-3 px-4 text-right">HPP MODAL</th>
						{/if}
						<th class="py-3 px-4">KETERANGAN / AUDIT TRAIL</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each data.movements as m}
						{@const badge = getBadgeInfo(m.reference_type)}
						<tr class="hover:bg-slate-50/60 transition-colors">
							<td class="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
								{new Date(m.created_at).toLocaleString('id-ID', {
									day: 'numeric',
									month: 'short',
									year: 'numeric',
									hour: '2-digit',
									minute: '2-digit'
								})}
							</td>
							<td class="py-3 px-4">
								<div class="font-bold text-slate-900">{m.product_name}</div>
								{#if m.sku}
									<div class="text-[10px] text-slate-400 font-mono">{m.sku}</div>
								{/if}
							</td>
							<td class="py-3 px-4 whitespace-nowrap">
								<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border {badge.color}">
									{badge.label}
								</span>
							</td>
							<td class="py-3 px-4 text-right font-bold whitespace-nowrap {m.qty_base_change > 0 ? 'text-emerald-600' : 'text-rose-600'}">
								{m.qty_base_change > 0 ? `+${m.qty_base_change}` : m.qty_base_change} Pcs
							</td>
							<td class="py-3 px-4 text-right font-semibold text-slate-800 whitespace-nowrap">
								{m.balance_after} Pcs
							</td>
							{#if data.isOwner}
								<td class="py-3 px-4 text-right text-slate-600 whitespace-nowrap">
									{formatCurrency(m.unit_cost_snapshot)}
								</td>
							{/if}
							<td class="py-3 px-4 text-slate-600 text-xs">
								{m.notes || '-'}
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan={data.isOwner ? 7 : 6} class="py-16 text-center text-slate-400">
								<div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
									<History class="w-6 h-6" />
								</div>
								<p class="font-bold text-slate-700">Tidak ada riwayat mutasi</p>
								<p class="text-xs text-slate-400 mt-0.5">Belum ada catatan mutasi stok yang sesuai dengan filter ini.</p>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Footer info -->
		<div class="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500">
			<span>Menampilkan {data.movements.length} mutasi terbaru</span>
			<span>Audit Trail Double-Entry Otomatis</span>
		</div>
	</div>
</div>
