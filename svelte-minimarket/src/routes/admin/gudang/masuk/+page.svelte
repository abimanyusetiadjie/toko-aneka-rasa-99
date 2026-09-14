<script lang="ts">
	import { enhance } from '$app/forms';
	import { Truck, ArrowDownLeft, CheckCircle2, AlertCircle, Plus, FileText, Calendar } from 'lucide-svelte';

	let { data, form } = $props();

	let selectedProductId = $state('');
	let selectedProduct = $derived(data.products.find((p) => p.id === selectedProductId));
	let qty = $state<number>(50);
	let purchaseCost = $state<number>(0);

	$effect(() => {
		if (selectedProduct) {
			purchaseCost = selectedProduct.base_hpp;
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
				<span class="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">MODUL GUDANG</span>
				<span class="text-xs text-slate-500 font-mono">Purchase Order & Inbound</span>
			</div>
			<h2 class="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
				<Truck class="w-6 h-6 text-blue-600 shrink-0" />
				<span>Penerimaan Barang Masuk</span>
			</h2>
			<p class="text-xs text-slate-600">Catat penerimaan pasokan distributor, perbarui HPP modal, dan sinkronkan stok gudang</p>
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
		<!-- Left: Form Penerimaan Barang -->
		<div class="pos-panel p-4 sm:p-5 bg-white space-y-4">
			<div class="pb-3 border-b border-slate-100 flex items-center gap-2">
				<Plus class="w-4 h-4 text-blue-600" />
				<h3 class="text-sm font-bold text-slate-900">Form Input Penerimaan</h3>
			</div>

			<form method="POST" action="?/receiveStock" use:enhance class="space-y-3 text-xs">
				<div>
					<label for="p-select" class="block font-bold text-slate-700 mb-1">Pilih Produk Yang Diterima *</label>
					<select
						id="p-select"
						name="product_id"
						bind:value={selectedProductId}
						required
						class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 font-medium text-slate-900"
					>
						<option value="" disabled>-- Pilih Produk --</option>
						{#each data.products as p}
							<option value={p.id}>{p.name} (Stok Saat Ini: {p.stock} Pcs)</option>
						{/each}
					</select>
				</div>

				{#if selectedProduct}
					<div class="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-700 space-y-1 font-mono text-[11px]">
						<div class="flex justify-between"><span>SKU:</span><b>{selectedProduct.sku}</b></div>
						<div class="flex justify-between"><span>Stok Gudang Sekarang:</span><b class="text-blue-600">{selectedProduct.stock} Pcs</b></div>
						{#if data.isOwner}
							<div class="flex justify-between"><span>HPP Terakhir:</span><b>{formatCurrency(selectedProduct.base_hpp)}</b></div>
						{/if}
					</div>
				{/if}

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
					<div>
						<label for="p-supplier" class="block font-bold text-slate-700 mb-1">Nama Supplier</label>
						<input id="p-supplier" type="text" name="supplier_name" placeholder="PT. Indofood..." class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none focus:border-blue-600 text-slate-900" />
					</div>
					<div>
						<label for="p-invoice" class="block font-bold text-slate-700 mb-1">No. Faktur / Surat Jalan</label>
						<input id="p-invoice" type="text" name="invoice_number" placeholder="SJ-2026-001" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none focus:border-blue-600 text-slate-900 font-mono" />
					</div>
				</div>

				{#if data.isOwner}
					<div class="grid grid-cols-2 gap-2">
						<div>
							<label for="p-qty" class="block font-bold text-slate-700 mb-1">Jumlah Masuk (Pcs) *</label>
							<input id="p-qty" type="number" name="qty" bind:value={qty} min="1" required class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none focus:border-emerald-600 text-slate-900 font-mono font-bold text-sm" />
						</div>
						<div>
							<label for="p-cost" class="block font-bold text-slate-700 mb-1">HPP Beli Baru / Pcs</label>
							<input id="p-cost" type="number" name="purchase_cost" bind:value={purchaseCost} min="0" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none focus:border-blue-600 text-slate-900 font-mono font-bold" />
						</div>
					</div>
				{:else}
					<div>
						<label for="p-qty" class="block font-bold text-slate-700 mb-1">Jumlah Masuk (Pcs) *</label>
						<input id="p-qty" type="number" name="qty" bind:value={qty} min="1" required class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none focus:border-emerald-600 text-slate-900 font-mono font-bold text-sm" />
					</div>
				{/if}

				<div>
					<label for="p-notes" class="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
					<input id="p-notes" type="text" name="notes" placeholder="Penerimaan batch pagi..." class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none focus:border-blue-600 text-slate-900" />
				</div>

				<button
					type="submit"
					class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg shadow-sm transition-all text-xs flex items-center justify-center gap-1.5 pt-2"
				>
					<CheckCircle2 class="w-4 h-4" />
					<span>Konfirmasi Penerimaan Barang Masuk</span>
				</button>
			</form>
		</div>

		<!-- Right: Riwayat Penerimaan Barang -->
		<div class="lg:col-span-2 pos-panel p-5 bg-white space-y-4">
			<div class="pb-3 border-b border-slate-100 flex justify-between items-center">
				<h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
					<FileText class="w-4 h-4 text-slate-500" />
					Riwayat Penerimaan Barang Masuk Terbaru
				</h3>
				<span class="text-xs text-slate-500">{data.receipts.length} Mutasi Tercatat</span>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs border-collapse">
					<thead>
						<tr class="text-slate-500 border-b border-slate-200 bg-slate-50 text-[11px] font-mono">
							<th class="py-2.5 px-3">TANGGAL</th>
							<th class="py-2.5 px-3">PRODUK</th>
							<th class="py-2.5 px-3 text-right">JUMLAH MASUK</th>
							<th class="py-2.5 px-3 text-right">STOK AKHIR</th>
							{#if data.isOwner}
								<th class="py-2.5 px-3 text-right">HPP MODAL</th>
							{/if}
							<th class="py-2.5 px-3">KETERANGAN / FAKTUR</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each data.receipts as r}
							<tr class="hover:bg-slate-50 transition-colors">
								<td class="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
									{new Date(r.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
								</td>
								<td class="py-2.5 px-3 font-semibold text-slate-900">{r.product_name}</td>
								<td class="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
									+{r.qty_base_change} Pcs
								</td>
								<td class="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">{r.balance_after} Pcs</td>
								{#if data.isOwner}
									<td class="py-2.5 px-3 text-right font-mono text-slate-600">{formatCurrency(r.unit_cost_snapshot)}</td>
								{/if}
								<td class="py-2.5 px-3 text-slate-600 text-[11px]">{r.notes || '-'}</td>
							</tr>
						{:else}
							<tr>
								<td colspan={data.isOwner ? 6 : 5} class="py-12 text-center text-slate-400">
									Belum ada riwayat penerimaan barang masuk tersimpan.
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
