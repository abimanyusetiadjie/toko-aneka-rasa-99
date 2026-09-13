<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Package, Truck, ClipboardCheck, History, Search } from 'lucide-svelte';
	import type { Product } from '$lib/types';

	let { data, form } = $props();

	let searchQuery = $state('');
	let selectedCategory = $state('ALL');
	let filterLowStock = $state(false);

	let showAddModal = $state(false);
	let showEditModal = $state(false);
	let showRestockModal = $state(false);
	let editItem = $state<Product | null>(null);
	let restockItem = $state<Product | null>(null);

	let filteredProducts = $derived(
		data.products.filter((p) => {
			const matchSearch =
				p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(p.barcode && p.barcode.includes(searchQuery)) ||
				(p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
			const matchCategory = selectedCategory === 'ALL' || String(p.category_id) === selectedCategory;
			const matchLowStock = !filterLowStock || p.stock < 20;
			return matchSearch && matchCategory && matchLowStock;
		})
	);

	function formatCurrency(val: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(val || 0);
	}

	function openEdit(product: Product) {
		editItem = product;
		showEditModal = true;
	}

	function openRestock(product: Product) {
		restockItem = product;
		showRestockModal = true;
	}
</script>

<div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto w-full">
	<!-- Header -->
	<header class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-4 border-b border-slate-200">
		<div>
			<div class="flex items-center gap-2 mb-1 flex-wrap">
				<span class="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">MODUL GUDANG</span>
				<span class="text-xs text-slate-500 font-mono">Master Inventory & Satuan</span>
			</div>
			<h2 class="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
				<Package class="w-6 h-6 text-blue-600" />
				Katalog Master Produk & Stok
			</h2>
			<p class="text-xs text-slate-600">Kelola master data barang, pendaftaran barcode, HPP modal, dan batas stok minimum</p>
		</div>

		<div class="flex items-center gap-2 flex-wrap">
			<a
				href="/admin/gudang/masuk"
				class="flex-1 sm:flex-initial bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
			>
				<Truck class="w-4 h-4 text-emerald-600" />
				<span>Penerimaan Masuk</span>
			</a>

			<button
				onclick={() => (showAddModal = true)}
				class="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
			>
				<Plus class="w-4 h-4" />
				<span>Tambah Produk</span>
			</button>
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

	<!-- Filter & Search Bar -->
	<div class="pos-panel p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
		<div class="flex items-center gap-2 flex-1 w-full sm:min-w-[240px]">
			<Search class="w-4 h-4 text-slate-400 shrink-0" />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Cari nama barang, barcode, atau SKU..."
				class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-600 text-slate-900"
			/>
		</div>

		<div class="flex items-center gap-2 text-xs w-full sm:w-auto">
			<select
				bind:value={selectedCategory}
				class="flex-1 sm:flex-initial bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-600 text-slate-700 font-medium"
			>
				<option value="ALL">Semua Kategori</option>
				{#each data.categories as cat}
					<option value={String(cat.id)}>{cat.name}</option>
				{/each}
			</select>

			<button
				onclick={() => (filterLowStock = !filterLowStock)}
				class="px-3 py-2 rounded-lg border font-semibold transition-colors shrink-0 {filterLowStock ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'}"
			>
				⚠️ Stok &lt;20
			</button>
		</div>
	</div>

	<!-- Product Table -->
	<div class="pos-panel bg-white overflow-hidden">
		<div class="p-3.5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-xs">
			<span class="font-bold text-slate-700">Daftar Produk ({filteredProducts.length} barang)</span>
			<span class="text-slate-500 font-mono">Total Keseluruhan: {data.products.length} SKU</span>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs border-collapse">
				<thead>
					<tr class="text-slate-500 border-b border-slate-200 bg-white text-[11px] font-mono">
						<th class="py-3 px-4">BARCODE</th>
						<th class="py-3 px-4">NAMA PRODUK</th>
						<th class="py-3 px-4">KATEGORI</th>
						<th class="py-3 px-4 text-right">HPP (MODAL)</th>
						<th class="py-3 px-4 text-right">HARGA JUAL KASIR</th>
						<th class="py-3 px-4 text-center">STOK GUDANG</th>
						<th class="py-3 px-4 text-center w-36">AKSI</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filteredProducts as p}
						<tr class="hover:bg-slate-50 transition-colors">
							<td class="py-3 px-4 font-mono">
								<span class="bg-slate-100 border border-slate-300 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold">
									{p.barcode || 'N/A'}
								</span>
							</td>
							<td class="py-3 px-4 font-bold text-slate-900">{p.name}</td>
							<td class="py-3 px-4 text-slate-600">{p.category_name || 'Umum'}</td>
							<td class="py-3 px-4 text-right font-mono text-slate-600">{formatCurrency(p.base_hpp)}</td>
							<td class="py-3 px-4 text-right font-mono font-bold text-emerald-700">
								{formatCurrency(p.selling_price || p.base_hpp * 1.25)}
							</td>
							<td class="py-3 px-4 text-center">
								<span class="px-2.5 py-0.5 rounded-full font-bold text-[11px] font-mono {p.stock < 20 ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}">
									{p.stock} {p.base_unit || 'Pcs'}
								</span>
							</td>
							<td class="py-3 px-4 text-center">
								<div class="flex items-center justify-center gap-1.5">
									<button
										onclick={() => openRestock(p)}
										class="px-2 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded text-[10px] font-bold transition-colors"
										title="Restock Masuk"
									>
										+ Stok
									</button>
									<button
										onclick={() => openEdit(p)}
										class="p-1 text-blue-600 hover:text-blue-800 transition-colors"
										title="Edit Data"
									>
										<Edit2 class="w-3.5 h-3.5" />
									</button>
									<form
										method="POST"
										action="?/delete"
										use:enhance
										onsubmit={(e) => {
											if (!confirm(`Hapus produk "${p.name}"?`)) e.preventDefault();
										}}
									>
										<input type="hidden" name="id" value={p.id} />
										<button type="submit" class="p-1 text-red-500 hover:text-red-700 transition-colors" title="Hapus">
											<Trash2 class="w-3.5 h-3.5" />
										</button>
									</form>
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="7" class="py-16 text-center text-slate-400">
								Tidak ada produk yang cocok dengan pencarian / filter.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Modal Restock -->
{#if showRestockModal && restockItem}
	<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
		<div class="pos-panel bg-white border-slate-300 w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-2xl">
			<div class="flex justify-between items-center pb-2 border-b border-slate-200">
				<h3 class="font-bold text-slate-900 text-sm">Restock Barang Masuk: {restockItem.name}</h3>
				<button onclick={() => (showRestockModal = false)} class="text-slate-400 hover:text-slate-700">✕</button>
			</div>

			<form
				method="POST"
				action="?/restock"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						showRestockModal = false;
					};
				}}
				class="space-y-3 text-xs"
			>
				<input type="hidden" name="id" value={restockItem.id} />

				<div>
					<label for="restock-qty-inv" class="block font-bold text-slate-700 mb-1">Jumlah Masuk (Pcs) *</label>
					<input id="restock-qty-inv" type="number" name="qty" required placeholder="Contoh: 50" min="1" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-emerald-600 text-slate-900 font-mono font-bold text-base" />
				</div>

				<div>
					<label for="restock-cost-inv" class="block font-bold text-slate-700 mb-1">HPP Beli Terbaru per Pcs</label>
					<input id="restock-cost-inv" type="number" name="purchase_cost" value={restockItem.base_hpp} class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900 font-mono font-bold" />
				</div>

				<div>
					<label for="restock-notes-inv" class="block font-bold text-slate-700 mb-1">Catatan / Supplier</label>
					<input id="restock-notes-inv" type="text" name="notes" placeholder="Penerimaan pasokan..." class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900" />
				</div>

				<div class="pt-3 flex justify-end gap-2">
					<button type="button" onclick={() => (showRestockModal = false)} class="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100">
						Batal
					</button>
					<button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold">
						Simpan ke Buku Besar Stok
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Modal Tambah & Edit Produk -->
{#if showAddModal}
	<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
		<div class="pos-panel bg-white border-slate-300 w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-2xl">
			<div class="flex justify-between items-center pb-2 border-b border-slate-200">
				<h3 class="font-bold text-slate-900 text-sm">Tambah Produk Baru</h3>
				<button onclick={() => (showAddModal = false)} class="text-slate-400 hover:text-slate-700">✕</button>
			</div>

			<form
				method="POST"
				action="?/create"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						showAddModal = false;
					};
				}}
				class="space-y-3 text-xs"
			>
				<div>
					<label for="create-name-inv" class="block font-bold text-slate-700 mb-1">Nama Produk *</label>
					<input id="create-name-inv" type="text" name="name" required placeholder="Contoh: Indomie Soto" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900 font-medium" />
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="create-cat-inv" class="block font-bold text-slate-700 mb-1">Kategori *</label>
						<select id="create-cat-inv" name="category_id" required class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900">
							{#each data.categories as cat}
								<option value={cat.id}>{cat.name}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="create-bar-inv" class="block font-bold text-slate-700 mb-1">Barcode (Opsional)</label>
						<input id="create-bar-inv" type="text" name="barcode" placeholder="Otomatis jika kosong" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900 font-mono" />
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="create-hpp-inv" class="block font-bold text-slate-700 mb-1">Harga Pokok (HPP Modal) *</label>
						<input id="create-hpp-inv" type="number" name="base_hpp" required placeholder="2500" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900 font-mono font-bold" />
					</div>
					<div>
						<label for="create-price-inv" class="block font-bold text-slate-700 mb-1">Harga Jual Kasir *</label>
						<input id="create-price-inv" type="number" name="selling_price" required placeholder="3500" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900 font-mono font-bold" />
					</div>
				</div>

				<div>
					<label for="create-stk-inv" class="block font-bold text-slate-700 mb-1">Stok Awal Fisik (Pcs) *</label>
					<input id="create-stk-inv" type="number" name="stock" required placeholder="100" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900 font-mono font-bold" />
				</div>

				<div class="pt-3 flex justify-end gap-2">
					<button type="button" onclick={() => (showAddModal = false)} class="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100">
						Batal
					</button>
					<button type="submit" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold">
						Simpan Produk & Ledger
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if showEditModal && editItem}
	<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
		<div class="pos-panel bg-white border-slate-300 w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-2xl">
			<div class="flex justify-between items-center pb-2 border-b border-slate-200">
				<h3 class="font-bold text-slate-900 text-sm">Edit Data Produk</h3>
				<button onclick={() => (showEditModal = false)} class="text-slate-400 hover:text-slate-700">✕</button>
			</div>

			<form
				method="POST"
				action="?/update"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						showEditModal = false;
					};
				}}
				class="space-y-3 text-xs"
			>
				<input type="hidden" name="id" value={editItem.id} />

				<div>
					<label for="edit-name-inv" class="block font-bold text-slate-700 mb-1">Nama Produk *</label>
					<input id="edit-name-inv" type="text" name="name" bind:value={editItem.name} required class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900" />
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="edit-cat-inv" class="block font-bold text-slate-700 mb-1">Kategori</label>
						<select id="edit-cat-inv" name="category_id" bind:value={editItem.category_id} required class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900">
							{#each data.categories as cat}
								<option value={cat.id}>{cat.name}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="edit-bar-inv" class="block font-bold text-slate-700 mb-1">Barcode</label>
						<input id="edit-bar-inv" type="text" name="barcode" bind:value={editItem.barcode} class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900 font-mono" />
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="edit-hpp-inv" class="block font-bold text-slate-700 mb-1">Harga Pokok (HPP)</label>
						<input id="edit-hpp-inv" type="number" name="base_hpp" bind:value={editItem.base_hpp} required class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900 font-mono font-bold" />
					</div>
					<div>
						<label for="edit-price-inv" class="block font-bold text-slate-700 mb-1">Harga Jual Kasir</label>
						<input id="edit-price-inv" type="number" name="selling_price" bind:value={editItem.selling_price} required class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900 font-mono font-bold" />
					</div>
				</div>

				<div>
					<label for="edit-stk-inv" class="block font-bold text-slate-700 mb-1">Stok Fisik Gudang (Pcs)</label>
					<input id="edit-stk-inv" type="number" name="stock" bind:value={editItem.stock} required class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-600 text-slate-900 font-mono font-bold" />
				</div>

				<div class="pt-3 flex justify-end gap-2">
					<button type="button" onclick={() => (showEditModal = false)} class="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100">
						Batal
					</button>
					<button type="submit" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold">
						Perbarui Data Produk
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
