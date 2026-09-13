<script lang="ts">
	import { History, Filter, ArrowDownLeft, ArrowUpRight, FileSpreadsheet } from 'lucide-svelte';

	let { data } = $props();

	function formatCurrency(val: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(val || 0);
	}
</script>

<div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto w-full">
	<!-- Header -->
	<header class="flex justify-between items-center pb-4 border-b border-slate-200">
		<div>
			<div class="flex items-center gap-2 mb-1 flex-wrap">
				<span class="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">MODUL GUDANG</span>
				<span class="text-xs text-slate-500 font-mono">Double-Entry Stock Ledger</span>
			</div>
			<h2 class="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
				<History class="w-6 h-6 text-purple-600 shrink-0" />
				<span>Buku Besar Mutasi Stok</span>
			</h2>
			<p class="text-xs text-slate-600">Audit trail lengkap seluruh riwayat mutasi keluar-masuk, penjualan kasir, restock, dan opname</p>
		</div>
	</header>

	<!-- Filter Bar -->
	<div class="pos-panel p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
		<div class="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
			<div class="flex items-center gap-2">
				<Filter class="w-4 h-4 text-slate-400" />
				<span class="text-xs font-bold text-slate-700">Filter:</span>
			</div>
			<div class="flex flex-wrap gap-1.5 text-xs">
				<a
					href="/admin/gudang/mutasi"
					class="px-2.5 py-1 rounded font-semibold transition-colors {data.filterType === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
				>
					Semua Mutasi
				</a>
				<a
					href="/admin/gudang/mutasi?type=SALE"
					class="px-2.5 py-1 rounded font-semibold transition-colors {data.filterType === 'SALE' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}"
				>
					Penjualan Kasir (SALE)
				</a>
				<a
					href="/admin/gudang/mutasi?type=RESTOCK"
					class="px-2.5 py-1 rounded font-semibold transition-colors {data.filterType === 'RESTOCK' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}"
				>
					Restock Masuk (RESTOCK)
				</a>
				<a
					href="/admin/gudang/mutasi?type=ADJUSTMENT"
					class="px-2.5 py-1 rounded font-semibold transition-colors {data.filterType === 'ADJUSTMENT' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}"
				>
					Stock Opname (ADJUSTMENT)
				</a>
			</div>
		</div>

		<span class="text-xs text-slate-500 font-mono">Menampilkan {data.movements.length} transaksi</span>
	</div>

	<!-- Stock Ledger Table -->
	<div class="pos-panel bg-white overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs border-collapse">
				<thead>
					<tr class="text-slate-500 border-b border-slate-200 bg-slate-50 text-[11px] font-mono">
						<th class="py-3 px-4">WAKTU MUTASI</th>
						<th class="py-3 px-4">NAMA BARANG</th>
						<th class="py-3 px-4">TIPE MUTASI</th>
						<th class="py-3 px-4 text-right">PERUBAHAN QTY</th>
						<th class="py-3 px-4 text-right">SISA STOK AKHIR</th>
						<th class="py-3 px-4 text-right">HPP MODAL</th>
						<th class="py-3 px-4">KETERANGAN & AUDIT TRAIL</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each data.movements as m}
						<tr class="hover:bg-slate-50 transition-colors">
							<td class="py-3 px-4 text-slate-500 font-mono text-[11px]">
								{new Date(m.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
							</td>
							<td class="py-3 px-4 font-bold text-slate-900">{m.product_name}</td>
							<td class="py-3 px-4">
								<span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono {m.reference_type === 'RESTOCK' || m.reference_type === 'INITIAL' ? 'bg-emerald-100 text-emerald-800' : m.reference_type === 'SALE' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}">
									{m.reference_type}
								</span>
							</td>
							<td class="py-3 px-4 text-right font-mono font-black {m.qty_base_change > 0 ? 'text-emerald-600' : 'text-red-600'}">
								{m.qty_base_change > 0 ? `+${m.qty_base_change}` : m.qty_base_change} Pcs
							</td>
							<td class="py-3 px-4 text-right font-mono font-bold text-slate-800">{m.balance_after} Pcs</td>
							<td class="py-3 px-4 text-right font-mono text-slate-600">{formatCurrency(m.unit_cost_snapshot)}</td>
							<td class="py-3 px-4 text-slate-600 text-[11px]">{m.notes || '-'}</td>
						</tr>
					{:else}
						<tr>
							<td colspan="7" class="py-16 text-center text-slate-400">
								Tidak ada catatan mutasi yang sesuai filter.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
