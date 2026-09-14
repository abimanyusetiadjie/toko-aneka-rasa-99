<script lang="ts">
	import { enhance } from '$app/forms';
	import { 
		ClipboardCheck, 
		Truck, 
		CheckCircle2, 
		AlertCircle, 
		AlertTriangle, 
		FileText, 
		Search, 
		Copy, 
		Trash2, 
		Clock, 
		Package, 
		DollarSign, 
		ShieldCheck, 
		MessageSquare,
		RefreshCw
	} from 'lucide-svelte';

	let { data, form } = $props();

	// Tab aktif: 'shortage' (Kekurangan Kiriman) atau 'shelf' (Selisih Rak Kasir)
	let activeTab = $state<'shortage' | 'shelf'>('shortage');

	// --- TAB 1: FORM CEK KIRIMAN & KEKURANGAN ---
	let shortageInvoice = $state('');
	let shortageSupplier = $state('');
	let shortageProductId = $state('');
	let expectedQty = $state<number>(0);
	let receivedQty = $state<number>(0);
	let autoAddStock = $state(true);
	let shortageNotes = $state('');
	let shortageStatus = $state<'BELUM_DITAGIH' | 'SUDAH_DIKLAIM' | 'SELESAI'>('BELUM_DITAGIH');

	let selectedShortageProduct = $derived(data.products.find((p: any) => p.id === shortageProductId));
	let shortageDiff = $derived(expectedQty > 0 && receivedQty >= 0 ? expectedQty - receivedQty : 0);
	let shortageTotalLoss = $derived(
		selectedShortageProduct && shortageDiff > 0 
			? shortageDiff * Number(selectedShortageProduct.base_hpp || 0) 
			: 0
	);

	// Filter & Search Tab 1
	let statusFilter = $state<'ALL' | 'BELUM_DITAGIH' | 'SUDAH_DIKLAIM' | 'SELESAI'>('ALL');
	let searchQuery = $state('');

	let filteredShortages = $derived(
		data.shortages.filter((s: any) => {
			const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
			const query = searchQuery.toLowerCase().trim();
			const matchQuery = !query || 
				s.invoice_number.toLowerCase().includes(query) ||
				s.supplier_name.toLowerCase().includes(query) ||
				s.product_name.toLowerCase().includes(query) ||
				s.sku.toLowerCase().includes(query);
			return matchStatus && matchQuery;
		})
	);

	// --- TAB 2: AUDIT SELISIH RAK KASIR ---
	let shelfProductId = $state('');
	let selectedShelfProduct = $derived(data.products.find((p: any) => p.id === shelfProductId));
	let shelfActualStock = $state<number>(0);
	let shelfReason = $state('Kasir Salah Ambil Varian / Salah Kasir');
	let shelfNotes = $state('');

	let shelfDiff = $derived(selectedShelfProduct ? shelfActualStock - Number(selectedShelfProduct.stock) : 0);
	let shelfLossEstimate = $derived(
		selectedShelfProduct && shelfDiff < 0 
			? Math.abs(shelfDiff) * Number(selectedShelfProduct.base_hpp || 0) 
			: 0
	);

	$effect(() => {
		if (selectedShelfProduct) {
			shelfActualStock = Number(selectedShelfProduct.stock);
		}
	});

	// Notifikasi copy WA
	let copiedId = $state<string | null>(null);

	function copyShortageWhatsApp(s: any) {
		const text = `*KLAIM KEKURANGAN BARANG - TOKO ANEKA RASA 99*\n\n` +
			`Halo ${s.supplier_name},\n` +
			`Berikut catatan kekurangan fisik dari pengiriman:\n` +
			`• *No. Faktur/Surat Jalan*: ${s.invoice_number}\n` +
			`• *Produk*: ${s.product_name} (${s.sku})\n` +
			`• *Jumlah di Surat Jalan*: ${s.expected_qty} Pcs\n` +
			`• *Fisik yang Diterima*: ${s.received_qty} Pcs\n` +
			`• *Selisih Kekurangan*: ${s.shortage_qty} Pcs\n` +
			`• *Total Nilai*: Rp ${s.shortage_value.toLocaleString('id-ID')}\n` +
			`• *Keterangan*: ${s.notes || '-'}\n\n` +
			`Mohon dibantu konfirmasi untuk pemotongan tagihan faktur atau penggantian di pengiriman kapal berikutnya. Terima kasih! 🙏`;

		navigator.clipboard.writeText(text);
		copiedId = s.id;
		setTimeout(() => {
			if (copiedId === s.id) copiedId = null;
		}, 3000);
	}

	function formatCurrency(val: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(val || 0);
	}
</script>

<div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
	<!-- Top Breadcrumb & Header -->
	<header class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
		<div>
			<div class="flex items-center gap-2 mb-1 flex-wrap">
				<span class="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">MODUL GUDANG</span>
				<span class="text-xs text-slate-500 font-mono">Toko Aneka Rasa 99 • Oleh-oleh Khas Bangka</span>
			</div>
			<h2 class="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
				<ClipboardCheck class="w-6 h-6 text-amber-600 shrink-0" />
				<span>Cek Barang Datang, Catat Kekurangan & Selisih Rak</span>
			</h2>
			<p class="text-xs sm:text-sm text-slate-600 mt-0.5">
				Rekap fisik kiriman ekspedisi kapal/supplier Bangka agar klaim tidak lupa saat bayar faktur, serta audit selisih rak vs kasir.
			</p>
		</div>

		<!-- Tab Switch Buttons -->
		<div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
			<button
				type="button"
				onclick={() => (activeTab = 'shortage')}
				class="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all {activeTab === 'shortage' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}"
			>
				<Truck class="w-4 h-4" />
				<span>1. Kekurangan Kiriman Ekspedisi</span>
				{#if data.summary.totalPendingCount > 0}
					<span class="bg-red-500 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">
						{data.summary.totalPendingCount}
					</span>
				{/if}
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'shelf')}
				class="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all {activeTab === 'shelf' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}"
			>
				<Package class="w-4 h-4" />
				<span>2. Selisih Rak Kasir & Afkir</span>
			</button>
		</div>
	</header>

	<!-- Flash Message Notification -->
	{#if form?.message}
		<div class="p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm {form.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}">
			{#if form.success}
				<CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
			{:else}
				<AlertCircle class="w-4 h-4 text-red-600 shrink-0" />
			{/if}
			<span>{form.message}</span>
		</div>
	{/if}

	<!-- Quick KPI Metric Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<!-- Card 1: Belum Ditagih -->
		<div class="pos-panel p-4 bg-white border border-red-200 rounded-xl relative overflow-hidden">
			<div class="flex items-center justify-between">
				<span class="text-xs font-bold text-red-700 uppercase tracking-wider">Kekurangan Belum Ditagih</span>
				<div class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
					<AlertTriangle class="w-4 h-4" />
				</div>
			</div>
			<div class="mt-2 flex items-baseline gap-2">
				<span class="text-2xl font-black text-slate-900 font-mono">{data.summary.totalPendingCount}</span>
				<span class="text-xs text-slate-500 font-medium">kiriman ({data.summary.totalPendingPcs} pcs)</span>
			</div>
			<p class="text-xs font-bold text-red-600 mt-1">
				{formatCurrency(data.summary.totalPendingValue)} <span class="text-[11px] font-normal text-slate-500">harus dipotong faktur</span>
			</p>
		</div>

		<!-- Card 2: Sedang Diajukan -->
		<div class="pos-panel p-4 bg-white border border-blue-200 rounded-xl relative overflow-hidden">
			<div class="flex items-center justify-between">
				<span class="text-xs font-bold text-blue-700 uppercase tracking-wider">Sedang Diajukan Klaim</span>
				<div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
					<Clock class="w-4 h-4" />
				</div>
			</div>
			<div class="mt-2 flex items-baseline gap-2">
				<span class="text-2xl font-black text-slate-900 font-mono">{data.summary.totalSubmittedCount}</span>
				<span class="text-xs text-slate-500 font-medium">kiriman</span>
			</div>
			<p class="text-[11px] text-slate-500 mt-1">
				Menunggu konfirmasi supplier / ekspedisi
			</p>
		</div>

		<!-- Card 3: Selesai Terpotong -->
		<div class="pos-panel p-4 bg-white border border-emerald-200 rounded-xl relative overflow-hidden">
			<div class="flex items-center justify-between">
				<span class="text-xs font-bold text-emerald-700 uppercase tracking-wider">Klaim Selesai / Terpotong</span>
				<div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
					<ShieldCheck class="w-4 h-4" />
				</div>
			</div>
			<div class="mt-2 flex items-baseline gap-2">
				<span class="text-2xl font-black text-slate-900 font-mono">{data.summary.totalResolvedCount}</span>
				<span class="text-xs text-slate-500 font-medium">kiriman</span>
			</div>
			<p class="text-[11px] text-slate-500 mt-1">
				Tagihan sudah beres & kompensasi masuk
			</p>
		</div>
	</div>

	<!-- ========================================================================= -->
	<!-- TAB 1: CEK BARANG MASUK & CATAT KEKURANGAN EKSPEDISI / SUPPLIER          -->
	<!-- ========================================================================= -->
	{#if activeTab === 'shortage'}
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
			<!-- Form Input Kekurangan Barang Masuk -->
			<div class="lg:col-span-5 pos-panel p-5 bg-white space-y-4 rounded-xl border border-slate-200">
				<div class="pb-3 border-b border-slate-100 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Truck class="w-4 h-4 text-amber-600" />
						<h3 class="text-sm font-bold text-slate-900">Form Catat Kekurangan Barang Datang</h3>
					</div>
					<span class="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">Anti Lupa Klaim</span>
				</div>

				<form method="POST" action="?/recordShortage" use:enhance class="space-y-3.5 text-xs">
					<!-- No Surat Jalan & Supplier -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div>
							<label for="shortage-invoice" class="block font-bold text-slate-700 mb-1">
								No. Surat Jalan / Faktur *
							</label>
							<input
								id="shortage-invoice"
								type="text"
								name="invoice_number"
								bind:value={shortageInvoice}
								placeholder="SJ-BKA-202609-01"
								required
								class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-600 text-slate-900 font-mono font-medium"
							/>
						</div>

						<div>
							<label for="shortage-supplier" class="block font-bold text-slate-700 mb-1">
								Ekspedisi / Nama Supplier
							</label>
							<input
								id="shortage-supplier"
								type="text"
								name="supplier_name"
								bind:value={shortageSupplier}
								placeholder="Ekspedisi Laut Bangka..."
								class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-600 text-slate-900"
							/>
						</div>
					</div>

					<!-- Pilih Produk -->
					<div>
						<label for="shortage-prod" class="block font-bold text-slate-700 mb-1">
							Pilih Produk yang Diperiksa *
						</label>
						<select
							id="shortage-prod"
							name="product_id"
							bind:value={shortageProductId}
							required
							class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-600 font-medium text-slate-900"
						>
							<option value="" disabled>-- Pilih Produk Khas Bangka --</option>
							{#each data.products as p}
								<option value={p.id}>{p.name} (Stok Saat Ini: {p.stock} Pcs)</option>
							{/each}
						</select>
					</div>

					<!-- Hitungan: Surat Jalan vs Diterima -->
					<div class="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
						<div>
							<label for="expected-qty" class="block font-bold text-slate-700 mb-1">
								Qty di Surat Jalan *
							</label>
							<input
								id="expected-qty"
								type="number"
								name="expected_qty"
								bind:value={expectedQty}
								min="1"
								required
								placeholder="50"
								class="w-full bg-white border border-slate-300 rounded-lg p-2 outline-none focus:border-amber-600 font-mono font-bold text-slate-900 text-base"
							/>
							<span class="text-[10px] text-slate-500">Jumlah di kertas</span>
						</div>

						<div>
							<label for="received-qty" class="block font-bold text-slate-700 mb-1">
								Fisik Diterima Riil *
							</label>
							<input
								id="received-qty"
								type="number"
								name="received_qty"
								bind:value={receivedQty}
								min="0"
								required
								placeholder="46"
								class="w-full bg-white border border-slate-300 rounded-lg p-2 outline-none focus:border-amber-600 font-mono font-bold text-slate-900 text-base"
							/>
							<span class="text-[10px] text-slate-500">Hasil hitung fisik</span>
						</div>
					</div>

					<!-- Live Kalkulator Kekurangan -->
					{#if selectedShortageProduct && expectedQty > 0}
						<div class="p-3 rounded-lg border space-y-1.5 {shortageDiff > 0 ? 'bg-red-50 border-red-200 text-red-900' : shortageDiff === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}">
							<div class="flex justify-between font-mono font-bold text-xs">
								<span>Status Selisih:</span>
								<span>
									{#if shortageDiff > 0}
										⚠️ KURANG {shortageDiff} Pcs
									{:else if shortageDiff === 0}
										✅ Pas ({expectedQty} Pcs)
									{:else}
										Lebih +{Math.abs(shortageDiff)} Pcs
									{/if}
								</span>
							</div>

							{#if shortageDiff > 0}
								<div class="flex justify-between font-mono text-xs pt-1 border-t border-red-200 text-red-700 font-bold">
									<span>Estimasi Nilai Klaim (HPP):</span>
									<span>{formatCurrency(shortageTotalLoss)}</span>
								</div>
								<p class="text-[10px] text-red-600 leading-tight">
									Harus dipotong dari tagihan invoice supplier agar modal toko tidak rugi.
								</p>
							{/if}
						</div>
					{/if}

					<!-- Checkbox Opsi Auto Restock -->
					<div class="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
						<input
							type="checkbox"
							id="auto-add-stock"
							name="auto_add_stock"
							bind:checked={autoAddStock}
							class="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
						/>
						<label for="auto-add-stock" class="text-slate-700 cursor-pointer text-xs">
							<span class="font-bold text-slate-900 block">Langsung tambahkan fisik riil ({receivedQty || 0} Pcs) ke stok toko</span>
							<span class="text-[11px] text-slate-500">Stok di kasir langsung bertambah sesuai barang yang benar-benar ada di gudang.</span>
						</label>
					</div>

					<!-- Status Klaim Awal -->
					<div>
						<label for="shortage-status" class="block font-bold text-slate-700 mb-1">Status Catatan Klaim</label>
						<select
							id="shortage-status"
							name="status"
							bind:value={shortageStatus}
							class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-600 text-slate-900 font-medium"
						>
							<option value="BELUM_DITAGIH">🟡 Belum Ditagih / Belum Diklaim (Perlu Potong Faktur)</option>
							<option value="SUDAH_DIKLAIM">🔵 Sudah Diajukan / Dikirim via WA ke Ekspedisi</option>
							<option value="SELESAI">🟢 Selesai (Sudah Dipotong Tagihan / Diganti)</option>
						</select>
					</div>

					<!-- Catatan -->
					<div>
						<label for="shortage-notes" class="block font-bold text-slate-700 mb-1">Keterangan / Catatan Fisik</label>
						<textarea
							id="shortage-notes"
							name="notes"
							bind:value={shortageNotes}
							rows="2"
							placeholder="Contoh: Kardus nomor 3 remuk di ekspedisi kapal, isi kurang 4 bungkus..."
							class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-600 text-slate-900"
						></textarea>
					</div>

					<button
						type="submit"
						class="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl shadow-sm transition-all text-xs flex items-center justify-center gap-2 mt-2"
					>
						<CheckCircle2 class="w-4 h-4" />
						<span>Simpan Rekap Kekurangan Kiriman</span>
					</button>
				</form>
			</div>

			<!-- Tabel Daftar Kekurangan Barang Datang -->
			<div class="lg:col-span-7 pos-panel p-5 bg-white space-y-4 rounded-xl border border-slate-200">
				<!-- Header Tabel & Filter -->
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
					<div>
						<h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
							<FileText class="w-4 h-4 text-slate-600" />
							<span>Daftar Kekurangan Kiriman & Status Klaim</span>
						</h3>
						<span class="text-xs text-slate-500">Tercatat {data.shortages.length} riwayat kiriman</span>
					</div>

					<!-- Filter Status Tab -->
					<div class="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 text-[11px] overflow-x-auto">
						<button
							type="button"
							onclick={() => (statusFilter = 'ALL')}
							class="px-2 py-1 rounded font-medium transition-colors {statusFilter === 'ALL' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600'}"
						>
							Semua
						</button>
						<button
							type="button"
							onclick={() => (statusFilter = 'BELUM_DITAGIH')}
							class="px-2 py-1 rounded font-medium transition-colors {statusFilter === 'BELUM_DITAGIH' ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-600'}"
						>
							Belum Ditagih
						</button>
						<button
							type="button"
							onclick={() => (statusFilter = 'SUDAH_DIKLAIM')}
							class="px-2 py-1 rounded font-medium transition-colors {statusFilter === 'SUDAH_DIKLAIM' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'}"
						>
							Diajukan
						</button>
						<button
							type="button"
							onclick={() => (statusFilter = 'SELESAI')}
							class="px-2 py-1 rounded font-medium transition-colors {statusFilter === 'SELESAI' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'}"
						>
							Selesai
						</button>
					</div>
				</div>

				<!-- Search Input -->
				<div class="relative">
					<Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Cari nomor surat jalan, supplier, atau nama produk..."
						class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-amber-500 text-slate-800"
					/>
				</div>

				<!-- List Cards / Table -->
				<div class="space-y-3 max-h-[600px] overflow-y-auto pr-1">
					{#each filteredShortages as s}
						<div class="p-4 rounded-xl border transition-all {s.status === 'BELUM_DITAGIH' ? 'bg-red-50/40 border-red-200' : s.status === 'SUDAH_DIKLAIM' ? 'bg-blue-50/30 border-blue-200' : 'bg-slate-50/70 border-slate-200'}">
							<!-- Top Line: Invoice & Status -->
							<div class="flex flex-wrap items-center justify-between gap-2">
								<div class="flex items-center gap-2">
									<span class="font-mono font-bold text-xs text-slate-900">{s.invoice_number}</span>
									<span class="text-[11px] text-slate-500">• {s.supplier_name}</span>
								</div>

								<!-- Status Badge -->
								{#if s.status === 'BELUM_DITAGIH'}
									<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
										<span class="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
										Belum Ditagih (Potong Faktur)
									</span>
								{:else if s.status === 'SUDAH_DIKLAIM'}
									<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
										<Clock class="w-3 h-3 text-blue-600" />
										Sudah Dikirim ke Supplier
									</span>
								{:else}
									<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
										<CheckCircle2 class="w-3 h-3 text-emerald-600" />
										Selesai / Terpotong
									</span>
								{/if}
							</div>

							<!-- Mid Line: Product & Qty Discrepancy -->
							<div class="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/80 p-2.5 rounded-lg border border-slate-200/60">
								<div>
									<h4 class="font-bold text-xs text-slate-900">{s.product_name}</h4>
									<span class="font-mono text-[10px] text-slate-500">SKU: {s.sku}</span>
								</div>

								<div class="flex items-center gap-4 text-xs font-mono">
									<div class="text-right">
										<div class="text-[10px] text-slate-500">SJ vs Diterima</div>
										<span class="text-slate-700 font-semibold">{s.expected_qty} ➔ {s.received_qty} pcs</span>
									</div>
									<div class="text-right">
										<div class="text-[10px] text-red-600 font-bold">Kekurangan</div>
										<span class="font-black text-red-600 text-sm">-{s.shortage_qty} Pcs</span>
									</div>
									<div class="text-right">
										<div class="text-[10px] text-slate-500">Nilai Kerugian</div>
										<span class="font-bold text-slate-900">{formatCurrency(s.shortage_value)}</span>
									</div>
								</div>
							</div>

							<!-- Notes -->
							{#if s.notes}
								<p class="text-[11px] text-slate-600 mt-2 bg-slate-100/70 p-2 rounded border border-slate-200/40">
									<b class="text-slate-700">Catatan:</b> {s.notes}
								</p>
							{/if}

							<!-- Action Buttons -->
							<div class="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
								<span class="text-[10px] text-slate-400 font-mono">
									{new Date(s.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
								</span>

								<div class="flex items-center gap-1.5 flex-wrap">
									<!-- Tombol Salin WA -->
									<button
										type="button"
										onclick={() => copyShortageWhatsApp(s)}
										class="px-2.5 py-1 rounded bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-300 hover:border-emerald-300 font-medium text-[11px] flex items-center gap-1 transition-all"
										title="Salin rincian klaim untuk dikirim via WhatsApp ke supplier"
									>
										{#if copiedId === s.id}
											<CheckCircle2 class="w-3 h-3 text-emerald-600" />
											<span class="text-emerald-700 font-bold">Tersalin!</span>
										{:else}
											<MessageSquare class="w-3 h-3 text-emerald-600" />
											<span>Salin Teks WA</span>
										{/if}
									</button>

									<!-- Tombol Ubah Status Klaim -->
									<form method="POST" action="?/updateShortageStatus" use:enhance class="inline-flex items-center gap-1">
										<input type="hidden" name="shortage_id" value={s.id} />
										
										{#if s.status === 'BELUM_DITAGIH'}
											<button
												type="submit"
												name="status"
												value="SUDAH_DIKLAIM"
												class="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-colors"
											>
												Tandai Sudah Diklaim
											</button>
											<button
												type="submit"
												name="status"
												value="SELESAI"
												class="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
											>
												Tandai Terpotong / Selesai
											</button>
										{:else if s.status === 'SUDAH_DIKLAIM'}
											<button
												type="submit"
												name="status"
												value="SELESAI"
												class="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
											>
												Tandai Terpotong / Selesai
											</button>
										{:else}
											<button
												type="submit"
												name="status"
												value="BELUM_DITAGIH"
												class="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-[11px] transition-colors"
											>
												Kembalikan ke Belum Ditagih
											</button>
										{/if}
									</form>

									<!-- Hapus -->
									<form method="POST" action="?/deleteShortage" use:enhance class="inline">
										<input type="hidden" name="shortage_id" value={s.id} />
										<button
											type="submit"
											onclick={(e) => { if(!confirm('Hapus catatan kekurangan ini?')) e.preventDefault(); }}
											class="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
											title="Hapus Catatan"
										>
											<Trash2 class="w-3.5 h-3.5" />
										</button>
									</form>
								</div>
							</div>
						</div>
					{:else}
						<div class="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
							<Truck class="w-8 h-8 text-slate-300 mx-auto mb-2" />
							<p class="text-xs font-semibold">Tidak ada catatan kekurangan kiriman yang cocok.</p>
							<p class="text-[11px] text-slate-400 mt-0.5">Semua kiriman barang tercatat lengkap atau filter tidak menemukan hasil.</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- ========================================================================= -->
	<!-- TAB 2: AUDIT SELISIH RAK KASIR & AFKIR BARANG RUSAK                      -->
	<!-- ========================================================================= -->
	{#if activeTab === 'shelf'}
		<!-- Info Khusus Toko Khas Bangka -->
		<div class="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3">
			<div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
				<ShieldCheck class="w-4 h-4" />
			</div>
			<div class="text-xs text-amber-900 space-y-1">
				<h4 class="font-bold text-amber-950">Aturan Khusus Toko Aneka Rasa 99 (Krupuk & Keripik Mentah Bangka):</h4>
				<p class="leading-relaxed">
					Keripik mentah yang remuk atau patah di dalam ball/bungkus <b>TETAP LAKU & JANGAN DIBUANG/DIAFKIR</b>. Pelanggan toko memahami bahwa produk dikirim langsung dari pulau Bangka dan keripik mentah remuk tetap mekar sempurna saat digoreng di rumah.
				</p>
				<p class="text-amber-800 font-semibold text-[11px]">
					👉 Opsi <b>Afkir Rusak</b> hanya digunakan jika kemasan bocor parah terkena air, minyak tumpah, atau bau tengik.
				</p>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
			<!-- Form Audit Stok Rak -->
			<div class="lg:col-span-5 pos-panel p-5 bg-white space-y-4 rounded-xl border border-slate-200">
				<div class="pb-3 border-b border-slate-100 flex items-center gap-2">
					<ClipboardCheck class="w-4 h-4 text-amber-600" />
					<h3 class="text-sm font-bold text-slate-900">Form Audit Selisih Rak Kasir</h3>
				</div>

				<form method="POST" action="?/adjustStock" use:enhance class="space-y-3.5 text-xs">
					<div>
						<label for="so-product" class="block font-bold text-slate-700 mb-1">Pilih Produk di Rak *</label>
						<select
							id="so-product"
							name="product_id"
							bind:value={shelfProductId}
							required
							class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-600 font-medium text-slate-900"
						>
							<option value="" disabled>-- Pilih Produk --</option>
							{#each data.products as p}
								<option value={p.id}>{p.name} (Stok Sistem: {p.stock} Pcs)</option>
							{/each}
						</select>
					</div>

					{#if selectedShelfProduct}
						<div class="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 font-mono text-[11px]">
							<div class="flex justify-between text-slate-600">
								<span>Stok di Sistem:</span>
								<b class="text-slate-900">{selectedShelfProduct.stock} Pcs</b>
							</div>
							<div class="flex justify-between text-slate-600">
								<span>HPP Modal:</span>
								<b>{formatCurrency(Number(selectedShelfProduct.base_hpp || 0))}</b>
							</div>
						</div>
					{/if}

					<div>
						<label for="so-actual" class="block font-bold text-slate-700 mb-1">Stok Fisik Aktual di Rak *</label>
						<input
							id="so-actual"
							type="number"
							name="actual_stock"
							bind:value={shelfActualStock}
							min="0"
							required
							class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-600 text-slate-900 font-mono font-bold text-lg"
						/>
						<span class="text-[10px] text-slate-500">Hitung total barang fisik yang tersisa di rak toko</span>
					</div>

					{#if selectedShelfProduct}
						<div class="p-3 rounded-lg border space-y-1 {shelfDiff < 0 ? 'bg-red-50 border-red-200 text-red-800' : shelfDiff > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-700'}">
							<div class="flex justify-between font-mono font-bold text-xs">
								<span>Status Selisih Rak:</span>
								<span>
									{shelfDiff > 0 ? `+${shelfDiff} Pcs (Lebih Fisik)` : shelfDiff < 0 ? `${shelfDiff} Pcs (Kurang Fisik)` : 'Sesuai (0 Pcs)'}
								</span>
							</div>
							{#if shelfLossEstimate > 0}
								<div class="flex justify-between font-mono text-[11px] text-red-700 pt-1 border-t border-red-200">
									<span>Estimasi Nilai Selisih:</span>
									<b>- {formatCurrency(shelfLossEstimate)}</b>
								</div>
							{/if}
						</div>
					{/if}

					<div>
						<label for="so-reason" class="block font-bold text-slate-700 mb-1">Alasan Penyesuaian</label>
						<select
							id="so-reason"
							name="reason"
							bind:value={shelfReason}
							class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-600 text-slate-900 text-xs font-medium"
						>
							<option value="Kasir Salah Ambil Varian / Salah Kasir">Kasir Salah Ambil Varian / Salah Input Kasir</option>
							<option value="Selisih Hitungan Rak Harian">Selisih Hitungan Rak Harian</option>
							<option value="Rusak Parah / Kemasan Sobek Kena Air (Afkir)">Rusak Parah / Kemasan Sobek Kena Air (Afkir)</option>
							<option value="Kedaluwarsa / Bau Tengik">Kedaluwarsa / Bau Tengik</option>
							<option value="Sampel / Tester Pembeli">Sampel / Tester Pembeli</option>
						</select>
					</div>

					<div>
						<label for="so-notes" class="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
						<input
							id="so-notes"
							type="text"
							name="notes"
							bind:value={shelfNotes}
							placeholder="Hasil cek rak depan kasir..."
							class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none focus:border-amber-600 text-slate-900"
						/>
					</div>

					<button
						type="submit"
						class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-sm transition-all text-xs flex items-center justify-center gap-1.5"
					>
						<CheckCircle2 class="w-4 h-4 text-emerald-400" />
						<span>Simpan Penyesuaian Stok Rak</span>
					</button>
				</form>
			</div>

			<!-- Tabel Riwayat Penyesuaian Rak -->
			<div class="lg:col-span-7 pos-panel p-5 bg-white space-y-4 rounded-xl border border-slate-200">
				<div class="pb-3 border-b border-slate-100 flex justify-between items-center">
					<h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
						<FileText class="w-4 h-4 text-slate-500" />
						Riwayat Audit Rak Terakhir
					</h3>
					<span class="text-xs text-slate-500 font-mono">{data.adjustments.length} Mutasi Audit</span>
				</div>

				<div class="overflow-x-auto">
					<table class="w-full text-left text-xs border-collapse">
						<thead>
							<tr class="text-slate-500 border-b border-slate-200 bg-slate-50 text-[11px] font-mono">
								<th class="py-2.5 px-3">TANGGAL</th>
								<th class="py-2.5 px-3">PRODUK</th>
								<th class="py-2.5 px-3 text-right">SELISIH</th>
								<th class="py-2.5 px-3 text-right">STOK AKHIR</th>
								<th class="py-2.5 px-3">KETERANGAN</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-100">
							{#each data.adjustments as a}
								<tr class="hover:bg-slate-50 transition-colors">
									<td class="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
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
										Belum ada riwayat audit rak tersimpan.
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}
</div>

