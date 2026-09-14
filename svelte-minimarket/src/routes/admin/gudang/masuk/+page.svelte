<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { 
		Truck, ArrowDownLeft, CheckCircle2, AlertCircle, Plus, FileText, 
		Search, ChevronDown, Check, X, Package, Clock, ShieldCheck 
	} from 'lucide-svelte';

	let { data, form } = $props();

	let selectedProductId = $state('');
	let selectedProduct = $derived(data.products.find((p: any) => p.id === selectedProductId));
	let qty = $state<number>(50);
	let purchaseCost = $state<number>(0);

	// Searchable Dropdown state
	let isDropdownOpen = $state(false);
	let productSearchQuery = $state('');
	let dropdownRef = $state<HTMLDivElement | null>(null);

	let filteredProductsForSelect = $derived(
		data.products.filter((p: any) => {
			if (!productSearchQuery.trim()) return true;
			const q = productSearchQuery.toLowerCase();
			return (
				p.name.toLowerCase().includes(q) ||
				(p.sku && p.sku.toLowerCase().includes(q)) ||
				(p.category_name && p.category_name.toLowerCase().includes(q))
			);
		})
	);

	$effect(() => {
		if (selectedProduct) {
			purchaseCost = selectedProduct.base_hpp || 0;
		}
	});

	function selectProduct(p: any) {
		selectedProductId = p.id;
		isDropdownOpen = false;
		productSearchQuery = '';
	}

	function resetProductSelection() {
		selectedProductId = '';
		productSearchQuery = '';
		isDropdownOpen = true;
	}

	onMount(() => {
		function handleDocClick(e: MouseEvent) {
			if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
				isDropdownOpen = false;
			}
		}
		document.addEventListener('click', handleDocClick);
		return () => {
			document.removeEventListener('click', handleDocClick);
		};
	});

	function formatCurrency(val: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(val || 0);
	}
</script>

<div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
	<!-- Header -->
	<header class="flex justify-between items-center pb-4 border-b border-slate-200">
		<div>
			<div class="flex items-center gap-2 mb-1 flex-wrap">
				<span class="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">MODUL GUDANG</span>
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
		<div class="p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 {form.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}">
			{#if form.success}
				<CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
			{:else}
				<AlertCircle class="w-4 h-4 text-red-600 shrink-0" />
			{/if}
			<span>{form.message}</span>
		</div>
	{/if}

	<!-- Rebalanced Layout: Form Input (7 cols - Luas & Nyaman) vs Riwayat (5 cols - Rapi & Compact) -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
		<!-- Left: Form Input Penerimaan (7 Kolom Lebih Luas) -->
		<div class="lg:col-span-7 pos-panel p-5 sm:p-6 bg-white space-y-5 rounded-2xl border border-slate-200 shadow-xs">
			<div class="pb-3 border-b border-slate-100 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
						<Plus class="w-4 h-4" />
					</div>
					<div>
						<h3 class="text-sm font-bold text-slate-900">Form Input Penerimaan Barang</h3>
						<p class="text-[11px] text-slate-500">Pilih produk dan masukkan kuantiti fisik barang masuk</p>
					</div>
				</div>
				<span class="text-[11px] font-mono font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
					{data.products.length} Produk Siap Input
				</span>
			</div>

			<form method="POST" action="?/receiveStock" use:enhance class="space-y-4 text-xs">
				<!-- Searchable Dropdown (Dropdown + Cari Sekaligus) -->
				<div class="relative" bind:this={dropdownRef}>
					<label class="block font-bold text-slate-800 mb-1.5 text-xs flex items-center justify-between">
						<span class="flex items-center gap-1.5">
							<Package class="w-4 h-4 text-blue-600" />
							Pilih Produk Yang Diterima <span class="text-red-500">*</span>
						</span>
						<span class="text-[10px] text-slate-500 font-normal">Ketik untuk mencari dari {data.products.length} produk</span>
					</label>

					<!-- Hidden Input for Form Submission -->
					<input type="hidden" name="product_id" value={selectedProductId} required />

					{#if selectedProduct && !isDropdownOpen}
						<!-- Kartu Produk Terpilih -->
						<div class="p-3.5 bg-blue-50/70 border-2 border-blue-300 rounded-xl flex items-center justify-between gap-3 transition-all shadow-xs">
							<div class="flex items-center gap-3 min-w-0">
								<div class="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
									<Check class="w-4 h-4" />
								</div>
								<div class="min-w-0">
									<p class="font-black text-slate-900 text-xs sm:text-sm truncate">{selectedProduct.name}</p>
									<div class="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-slate-600 flex-wrap">
										<span class="bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-800 font-semibold">{selectedProduct.sku}</span>
										<span class="text-slate-400">•</span>
										<span>Stok Gudang Sekarang: <b class="text-blue-700 font-bold">{selectedProduct.stock} Pcs</b></span>
									</div>
								</div>
							</div>
							<button
								type="button"
								onclick={() => { isDropdownOpen = true; productSearchQuery = ''; }}
								class="px-3 py-1.5 bg-white hover:bg-slate-100 border border-blue-300 rounded-lg text-xs font-bold text-blue-700 shrink-0 shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
							>
								<span>Ganti Produk</span>
								<ChevronDown class="w-3.5 h-3.5" />
							</button>
						</div>
					{:else}
						<!-- Input Pencarian + Trigger Dropdown -->
						<div class="relative">
							<div class="flex items-center border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl bg-slate-50 overflow-hidden transition-all shadow-xs">
								<div class="pl-3.5 text-slate-400">
									<Search class="w-4 h-4" />
								</div>
								<input
									type="text"
									bind:value={productSearchQuery}
									onfocus={() => (isDropdownOpen = true)}
									placeholder="Ketik nama kerupuk, getas, kemplang, atau kode SKU..."
									class="w-full bg-transparent px-3 py-3 text-xs sm:text-sm text-slate-900 outline-none font-medium placeholder:text-slate-400"
								/>
								{#if productSearchQuery}
									<button
										type="button"
										onclick={() => (productSearchQuery = '')}
										class="p-1.5 text-slate-400 hover:text-slate-700 mr-1 cursor-pointer"
									>
										<X class="w-4 h-4" />
									</button>
								{/if}
								<button
									type="button"
									onclick={() => (isDropdownOpen = !isDropdownOpen)}
									class="px-3.5 py-3 border-l border-slate-200 text-slate-500 hover:bg-slate-200/60 transition-colors cursor-pointer"
								>
									<ChevronDown class="w-4 h-4 transition-transform {isDropdownOpen ? 'rotate-180' : ''}" />
								</button>
							</div>

							<!-- Menu Daftar Produk Dropdown -->
							{#if isDropdownOpen}
								<div class="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden max-h-72 flex flex-col animate-in fade-in zoom-in-95 duration-100">
									<div class="p-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
										<span>Ditemukan {filteredProductsForSelect.length} dari {data.products.length} produk</span>
										{#if selectedProduct}
											<span class="text-blue-600 font-bold">Terpilih: {selectedProduct.sku}</span>
										{/if}
									</div>

									<div class="overflow-y-auto divide-y divide-slate-100 p-1">
										{#each filteredProductsForSelect as p}
											<button
												type="button"
												onclick={() => selectProduct(p)}
												class="w-full text-left p-2.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-between gap-3 text-xs group cursor-pointer {selectedProductId === p.id ? 'bg-blue-50/80 border border-blue-200' : ''}"
											>
												<div class="min-w-0 flex-1">
													<p class="font-bold text-slate-900 group-hover:text-blue-700 leading-snug">{p.name}</p>
													<div class="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-500 flex-wrap">
														<span class="bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-800 px-1.5 py-0.5 rounded font-semibold text-slate-700">{p.sku}</span>
														<span>•</span>
														<span>Stok: <b class="text-slate-800 font-bold">{p.stock} Pcs</b></span>
														{#if data.isOwner && p.base_hpp}
															<span>•</span>
															<span>HPP: {formatCurrency(p.base_hpp)}</span>
														{/if}
													</div>
												</div>
												{#if selectedProductId === p.id}
													<div class="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
														<Check class="w-3 h-3" />
													</div>
												{/if}
											</button>
										{:else}
											<div class="p-6 text-center text-slate-400 text-xs">
												Tidak ada produk yang cocok dengan kata kunci "{productSearchQuery}".
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/if}
				</div>

				<!-- Detail Ringkasan Produk Terpilih -->
				{#if selectedProduct}
					<div class="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
						<div>
							<span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">KODE SKU</span>
							<span class="font-mono font-bold text-slate-900">{selectedProduct.sku}</span>
						</div>
						<div>
							<span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">STOK GUDANG SEKARANG</span>
							<span class="font-mono font-bold text-blue-700">{selectedProduct.stock} Pcs</span>
						</div>
						{#if data.isOwner}
							<div>
								<span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">HPP TERAKHIR</span>
								<span class="font-mono font-bold text-emerald-700">{formatCurrency(selectedProduct.base_hpp)}</span>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Informasi Supplier & Faktur -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label for="p-supplier" class="block font-bold text-slate-700 mb-1.5">Nama Supplier / Pabrik</label>
						<input
							id="p-supplier"
							type="text"
							name="supplier_name"
							placeholder="Contoh: MM Pangkalpinang / Pabrik Bangka"
							class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-600 text-slate-900 font-medium"
						/>
					</div>
					<div>
						<label for="p-invoice" class="block font-bold text-slate-700 mb-1.5">No. Faktur / Surat Jalan</label>
						<input
							id="p-invoice"
							type="text"
							name="invoice_number"
							placeholder="Contoh: SJ-BKA-2026-001"
							class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-600 text-slate-900 font-mono"
						/>
					</div>
				</div>

				<!-- Kuantiti & HPP (Hanya Owner) -->
				{#if data.isOwner}
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div>
							<label for="p-qty" class="block font-bold text-slate-700 mb-1.5">Jumlah Masuk (Pcs) *</label>
							<input
								id="p-qty"
								type="number"
								name="qty"
								bind:value={qty}
								min="1"
								required
								class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-600 text-slate-900 font-mono font-bold text-base"
							/>
						</div>
						<div>
							<label for="p-cost" class="block font-bold text-slate-700 mb-1.5">HPP Beli Baru / Pcs</label>
							<input
								id="p-cost"
								type="number"
								name="purchase_cost"
								bind:value={purchaseCost}
								min="0"
								class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-600 text-slate-900 font-mono font-bold text-base"
							/>
						</div>
					</div>
				{:else}
					<div>
						<label for="p-qty" class="block font-bold text-slate-700 mb-1.5">Jumlah Masuk (Pcs) *</label>
						<input
							id="p-qty"
							type="number"
							name="qty"
							bind:value={qty}
							min="1"
							required
							class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-emerald-600 text-slate-900 font-mono font-bold text-base"
						/>
					</div>
				{/if}

				<div>
					<label for="p-notes" class="block font-bold text-slate-700 mb-1.5">Catatan Tambahan</label>
					<input
						id="p-notes"
						type="text"
						name="notes"
						placeholder="Contoh: Penerimaan kapal ekspedisi laut batch pagi..."
						class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:border-blue-600 text-slate-900"
					/>
				</div>

				<button
					type="submit"
					disabled={!selectedProductId}
					class="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-sm transition-all text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
				>
					<CheckCircle2 class="w-4 h-4" />
					<span>Konfirmasi Penerimaan Barang Masuk</span>
				</button>
			</form>
		</div>

		<!-- Right: Riwayat Penerimaan Barang (5 Kolom Compact & Rapi) -->
		<div class="lg:col-span-5 pos-panel p-4 sm:p-5 bg-white space-y-4 rounded-2xl border border-slate-200 shadow-xs">
			<div class="pb-3 border-b border-slate-100 flex justify-between items-center">
				<div class="flex items-center gap-2">
					<div class="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
						<FileText class="w-4 h-4" />
					</div>
					<div>
						<h3 class="text-sm font-bold text-slate-900">Riwayat Penerimaan</h3>
						<p class="text-[11px] text-slate-500">Mutasi barang masuk terakhir</p>
					</div>
				</div>
				<span class="text-[10px] text-slate-500 font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded">
					{data.receipts.length} Mutasi
				</span>
			</div>

			<!-- List Card Riwayat Masuk (Compact & Responsif) -->
			<div class="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
				{#each data.receipts as r}
					<div class="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all space-y-1.5 shadow-2xs">
						<div class="flex items-center justify-between text-[11px] text-slate-500 font-mono">
							<span class="flex items-center gap-1">
								<Clock class="w-3 h-3 text-slate-400" />
								{new Date(r.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
							</span>
							<span class="px-2 py-0.5 rounded-full font-black text-emerald-700 bg-emerald-100 border border-emerald-200">
								+{r.qty_base_change} Pcs
							</span>
						</div>

						<div>
							<h4 class="font-bold text-xs text-slate-900 leading-snug">{r.product_name}</h4>
							<span class="font-mono text-[10px] text-slate-500">{r.sku}</span>
						</div>

						<div class="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono">
							<span class="text-slate-600">Sisa Stok: <b class="text-slate-900 font-bold">{r.balance_after} Pcs</b></span>
							{#if data.isOwner && r.unit_cost_snapshot}
								<span class="text-slate-600">HPP: <b class="text-emerald-700 font-bold">{formatCurrency(r.unit_cost_snapshot)}</b></span>
							{/if}
						</div>

						{#if r.notes}
							<p class="text-[10px] text-slate-500 bg-white p-1.5 rounded border border-slate-200/50 truncate" title={r.notes}>
								{r.notes}
							</p>
						{/if}
					</div>
				{:else}
					<div class="py-16 text-center text-slate-400 text-xs">
						Belum ada riwayat penerimaan barang masuk tersimpan.
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

