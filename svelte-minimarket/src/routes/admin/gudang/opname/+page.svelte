<script lang="ts">
	import { enhance } from '$app/forms';
	import { ClipboardCheck, CheckCircle2, AlertCircle, AlertTriangle, FileText, ArrowRight } from 'lucide-svelte';

	let { data, form } = $props();

	let selectedProductId = $state('');
	let selectedProduct = $derived(data.products.find((p) => p.id === selectedProductId));
	let actualStock = $state<number>(0);
	let reason = $state('Barang Rusak / Expired');

	let difference = $derived(selectedProduct ? actualStock - selectedProduct.stock : 0);
	let lossEstimate = $derived(selectedProduct && difference < 0 ? Math.abs(difference) * selectedProduct.base_hpp : 0);

	$effect(() => {
		if (selectedProduct) {
			actualStock = selectedProduct.stock;
		}
	});

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
				<span class="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">MODUL GUDANG</span>
				<span class="text-xs text-slate-500 font-mono">Stock Audit & Shrinkage Control</span>
			</div>
			<h2 class="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
				<ClipboardCheck class="w-6 h-6 text-amber-600 shrink-0" />
				<span>Stock Opname & Selisih Fisik</span>
			</h2>
			<p class="text-xs text-slate-600">Audit stok fisik berkala di rak gudang, catat selisih barang rusak/hilang, dan lakukan rekonsiliasi</p>
		</div>
	</header>

	<!-- Flash Message -->
	{#if form?.message}
		<div class="p-3.5 rounded-lg text-xs font-semibold flex items-center gap-2 {form.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}">
			{#if form.success}
				<CheckCircle2 class="w-4 h-4 text-emerald-600" />
			{:else}
				<AlertCircle class="w-4 h-4 text-red-600" />
			{/if}
			<span>{form.message}</span>
		</div>
	{/if}

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Left: Form Stock Opname -->
		<div class="pos-panel p-4 sm:p-5 bg-white space-y-4">
			<div class="pb-3 border-b border-slate-100 flex items-center gap-2">
				<ClipboardCheck class="w-4 h-4 text-amber-600" />
				<h3 class="text-sm font-bold text-slate-900">Form Audit Stock Opname</h3>
			</div>

			<form method="POST" action="?/adjustStock" use:enhance class="space-y-3 text-xs">
				<div>
					<label for="so-product" class="block font-bold text-slate-700 mb-1">Pilih Produk Untuk Di-audit *</label>
					<select
						id="so-product"
						name="product_id"
						bind:value={selectedProductId}
						required
						class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-600 font-medium text-slate-900"
					>
						<option value="" disabled>-- Pilih Produk --</option>
						{#each data.products as p}
							<option value={p.id}>{p.name} (Sistem: {p.stock} Pcs)</option>
						{/each}
					</select>
				</div>

				{#if selectedProduct}
					<div class="p-3 bg-slate-50 border border-slate-200 rounded space-y-1.5 font-mono text-[11px]">
						<div class="flex justify-between text-slate-600"><span>Stok di Sistem:</span><b class="text-slate-900">{selectedProduct.stock} Pcs</b></div>
						<div class="flex justify-between text-slate-600"><span>HPP Modal:</span><b>{formatCurrency(selectedProduct.base_hpp)}</b></div>
					</div>
				{/if}

				<div>
					<label for="so-actual" class="block font-bold text-slate-700 mb-1">Stok Fisik Aktual Hasil Hitung *</label>
					<input
						id="so-actual"
						type="number"
						name="actual_stock"
						bind:value={actualStock}
						min="0"
						required
						class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-600 text-slate-900 font-mono font-bold text-lg"
					/>
				</div>

				{#if selectedProduct}
					<div class="p-3 rounded-lg border space-y-1 {difference < 0 ? 'bg-red-50 border-red-200 text-red-800' : difference > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-700'}">
						<div class="flex justify-between font-mono font-bold text-xs">
							<span>Status Selisih:</span>
							<span>{difference > 0 ? `+${difference} Pcs (Lebih Fisik)` : difference < 0 ? `${difference} Pcs (Kurang Fisik)` : 'Sesuai (0 Pcs)'}</span>
						</div>
						{#if lossEstimate > 0}
							<div class="flex justify-between font-mono text-[11px] text-red-700 pt-1 border-t border-red-200">
								<span>Estimasi Kerugian:</span>
								<b>- {formatCurrency(lossEstimate)}</b>
							</div>
						{/if}
					</div>
				{/if}

				<div>
					<label for="so-reason" class="block font-bold text-slate-700 mb-1">Alasan Penyesuaian</label>
					<select
						id="so-reason"
						name="reason"
						bind:value={reason}
						class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none focus:border-amber-600 text-slate-900 text-xs"
					>
						<option value="Barang Rusak / Bocor">Barang Rusak / Bocor</option>
						<option value="Barang Kadaluarsa / Expired">Barang Kadaluarsa / Expired</option>
						<option value="Selisih Hilang (Shrinkage Toko)">Selisih Hilang (Shrinkage Toko)</option>
						<option value="Koreksi Salah Hitung Penerimaan">Koreksi Salah Hitung Penerimaan</option>
						<option value="Sampel / Tester Toko">Sampel / Tester Toko</option>
					</select>
				</div>

				<div>
					<label for="so-notes" class="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
					<input id="so-notes" type="text" name="notes" placeholder="Hasil audit rak A3..." class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none focus:border-amber-600 text-slate-900" />
				</div>

				<button
					type="submit"
					class="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-lg shadow-sm transition-all text-xs flex items-center justify-center gap-1.5 pt-2"
				>
					<CheckCircle2 class="w-4 h-4" />
					<span>Simpan Hasil Opname & Rekonsiliasi</span>
				</button>
			</form>
		</div>

		<!-- Right: Riwayat Stock Opname -->
		<div class="lg:col-span-2 pos-panel p-5 bg-white space-y-4">
			<div class="pb-3 border-b border-slate-100 flex justify-between items-center">
				<h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
					<FileText class="w-4 h-4 text-slate-500" />
					Riwayat Audit Stock Opname Terakhir
				</h3>
				<span class="text-xs text-slate-500">{data.adjustments.length} Penyesuaian</span>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs border-collapse">
					<thead>
						<tr class="text-slate-500 border-b border-slate-200 bg-slate-50 text-[11px] font-mono">
							<th class="py-2.5 px-3">TANGGAL</th>
							<th class="py-2.5 px-3">PRODUK</th>
							<th class="py-2.5 px-3 text-right">SELISIH</th>
							<th class="py-2.5 px-3 text-right">STOK FISIK AKHIR</th>
							<th class="py-2.5 px-3">ALASAN & KETERANGAN</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each data.adjustments as a}
							<tr class="hover:bg-slate-50 transition-colors">
								<td class="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
									{new Date(a.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
								</td>
								<td class="py-2.5 px-3 font-semibold text-slate-900">{a.product_name}</td>
								<td class="py-2.5 px-3 text-right font-mono font-bold {a.qty_base_change < 0 ? 'text-red-600' : 'text-emerald-600'}">
									{a.qty_base_change > 0 ? `+${a.qty_base_change}` : a.qty_base_change} Pcs
								</td>
								<td class="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">{a.balance_after} Pcs</td>
								<td class="py-2.5 px-3 text-slate-600 text-[11px]">{a.notes || '-'}</td>
							</tr>
						{:else}
							<tr>
								<td colspan="5" class="py-12 text-center text-slate-400">
									Belum ada riwayat stock opname tersimpan.
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
