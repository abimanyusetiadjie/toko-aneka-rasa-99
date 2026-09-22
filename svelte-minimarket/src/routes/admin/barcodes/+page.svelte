<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { onMount, tick } from 'svelte';
	import { enhance } from '$app/forms';
	import {
		Printer,
		Search,
		ArrowLeft,
		Barcode,
		Copy,
		Check,
		Sparkles,
		Layers,
		CheckCircle2,
		AlertCircle,
		Sliders
	} from 'lucide-svelte';
	import JsBarcode from 'jsbarcode';

	let { data, form } = $props<{ data: PageData; form?: ActionData }>();

	let searchQuery = $state('');
	let selectedCategory = $state('ALL');
	let copiedSku = $state<string | null>(null);

	// Pilihan Ukuran Kertas Label (Default: 33x15 mm Standar Zenpert 4T520)
	type LabelSize = '33x15' | '40x20' | '38x18' | '35x15' | 'a4';
	let labelSize = $state<LabelSize>('33x15');

	// Mode Printer: 'roll' (Thermal Roll 1 per 1) atau 'sheet' (Lembaran A4 Grid)
	let printMode = $state<'roll' | 'sheet'>('roll');

	// Ambil daftar kategori unik dari data produk
	let categories = $derived([
		'ALL',
		...Array.from(new Set((data.products || []).map((p: any) => p.category_name).filter(Boolean)))
	]);

	let filteredProducts = $derived(
		(data.products || []).filter((p: any) => {
			const q = (searchQuery || '').trim().toLowerCase();
			const pName = String(p.name || '').toLowerCase();
			const pSku = String(p.sku || '').toLowerCase();
			const pBar = String(p.barcode || '').toLowerCase();
			const pCat = String(p.category_name || '').toLowerCase();

			const matchQuery =
				!q ||
				pName.includes(q) ||
				pSku.includes(q) ||
				pBar.includes(q) ||
				pCat.includes(q);

			// PENTING: Jika ada query pencarian (q aktif), cari ke SELURUH produk (abaikan dropdown kategori)
			// agar pencarian barcode / SKU / nama langsung muncul seketika!
			const matchCat = q ? true : (selectedCategory === 'ALL' || pCat === selectedCategory.toLowerCase());
			return matchQuery && matchCat;
		})
	);

	function formatCurrency(val: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(val || 0);
	}

	function formatNumberOnly(val: number): string {
		return new Intl.NumberFormat('id-ID').format(val || 0);
	}

	/**
	 * Logika Barcode 6-Digit Klaster Bersih (KK-XXXX):
	 * - Garis barcode Code 128C: Angka murni 6 digit (contoh "700830")
	 * - Teks bawah: Tepat 6 digit angka bersih, rata tengah, tidak terlipat/wrap!
	 */
	function getBarcodeData(product: any) {
		const rawBarcode = (product.barcode || '').trim();
		const rawSku = (product.sku || '').trim();

		// Gunakan barcode resmi langsung dari database
		const finalCode = rawBarcode || rawSku || '000000';

		return {
			encodedValue: finalCode,
			displayText: finalCode
		};
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		copiedSku = text;
		setTimeout(() => {
			copiedSku = null;
		}, 1500);
	}

	// Konfigurasi barcode berdasarkan ukuran stiker agar pas dan tidak terpotong
	function getSizeConfig(size: LabelSize) {
		switch (size) {
			case '33x15':
				// Zenpert 4T520 (203 DPI) - Code 128C 6-digit murni (contoh: 700830)
				// Margin 0 di SVG karena quiet zone 3mm ditangani oleh padding kontainer
				return { width: 1.25, height: 32, margin: 0 };
			case '35x15':
				return { width: 1.05, height: 14, margin: 1 };
			case '38x18':
				return { width: 1.15, height: 16, margin: 1 };
			case '40x20':
				return { width: 1.25, height: 18, margin: 1 };
			case 'a4':
			default:
				return { width: 1.6, height: 36, margin: 4 };
		}
	}

	async function renderBarcodes() {
		await tick();
		const svgs = document.querySelectorAll<SVGSVGElement>('.barcode-svg');
		const cfg = getSizeConfig(labelSize);

		svgs.forEach((svg) => {
			const text = svg.getAttribute('data-barcode');
			if (text) {
				try {
					JsBarcode(svg, text, {
						format: 'CODE128',
						width: cfg.width,
						height: cfg.height,
						displayValue: false, // Nilai teks ditampilkan via HTML bottom agar crisp & rapi
						margin: cfg.margin,
						lineColor: '#000000',
						background: 'transparent'
					});
				} catch (err) {
					console.error('Gagal render barcode untuk', text, err);
				}
			}
		});
	}

	$effect(() => {
		// Re-render barcode saat produk difilter atau ukuran kertas berubah
		if (filteredProducts.length >= 0 || labelSize) {
			renderBarcodes();
		}
	});

	onMount(() => {
		renderBarcodes();
	});

	function handlePrint() {
		renderBarcodes().then(() => {
			setTimeout(() => {
				window.print();
			}, 250);
		});
	}
</script>

<svelte:head>
	<title>Lembar Cetak Barcode ({labelSize}mm) - Toko Aneka Rasa 99</title>
	<!-- Dynamic @page size untuk printer thermal label sesuai ukuran yang dipilih -->
	{#if labelSize === '33x15'}
		<style>
			@page {
				size: 33mm 15mm;
				margin: 0;
			}
		</style>
	{:else if labelSize === '40x20'}
		<style>
			@page {
				size: 40mm 20mm;
				margin: 0;
			}
		</style>
	{:else if labelSize === '38x18'}
		<style>
			@page {
				size: 38mm 18mm;
				margin: 0;
			}
		</style>
	{:else if labelSize === '35x15'}
		<style>
			@page {
				size: 35mm 15mm;
				margin: 0;
			}
		</style>
	{:else}
		<style>
			@page {
				size: A4 portrait;
				margin: 8mm;
			}
		</style>
	{/if}
</svelte:head>

<div class="min-h-screen bg-slate-100 p-3 sm:p-6 print:p-0 print:m-0 print:bg-white text-slate-900 print:w-full">
	<!-- Action Bar (Hidden when printed) -->
	<header class="max-w-7xl mx-auto mb-5 space-y-3 print:hidden">
		<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
			<div class="flex items-center gap-3">
				<a href="/admin/inventory" class="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors">
					<ArrowLeft class="w-4 h-4" />
				</a>
				<img src="/logo.png" alt="Toko Aneka Rasa 99" class="w-10 h-10 rounded-full object-cover border border-slate-300 shadow-xs" />
				<div>
					<h1 class="text-base font-black text-slate-900 flex items-center gap-2">
						Lembar Cetak Label Barcode Produk
						<span class="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded font-mono">Toko Aneka Rasa 99</span>
					</h1>
					<p class="text-xs text-slate-500 font-mono">
						{filteredProducts.length} Produk • Format 6-Digit Klaster Bersih (Zenpert 4T520)
					</p>
				</div>
			</div>

			<div class="flex items-center gap-2 w-full md:w-auto flex-wrap">
				<form method="POST" action="?/convertAll" use:enhance class="inline">
					<button
						type="submit"
						class="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
						title="Konversi seluruh produk ke barcode 6 digit klaster (KK-XXXX)"
					>
						<Sparkles class="w-4 h-4" /> <span>Konversi ke 6-Digit</span>
					</button>
				</form>
				<button
					onclick={handlePrint}
					class="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
				>
					<Printer class="w-4 h-4" /> <span>Cetak Label Barcode ({labelSize}mm)</span>
				</button>
			</div>
		</div>

		<!-- Feedback Flash Message -->
		{#if form?.message}
			<div class="p-3 rounded-lg text-xs font-semibold flex items-center gap-2 {form.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}">
				{#if form.success}
					<CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
				{:else}
					<AlertCircle class="w-4 h-4 text-red-600 shrink-0" />
				{/if}
				<span>{form.message}</span>
			</div>
		{/if}

		<!-- Pengaturan Format Label & Filter -->
		<div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
			<div class="flex flex-wrap items-center gap-3">
				<!-- Pilihan Ukuran Label -->
				<div class="flex items-center gap-1.5">
					<Sliders class="w-3.5 h-3.5 text-slate-500" />
					<span class="font-bold text-slate-700">Ukuran Kertas:</span>
					<div class="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50 flex-wrap gap-0.5">
						<button
							type="button"
							onclick={() => { labelSize = '33x15'; printMode = 'roll'; }}
							class="px-2.5 py-1 rounded-md font-bold text-[11px] transition-all cursor-pointer {labelSize === '33x15' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
						>
							⭐ 33 × 15 mm (Zenpert 4T520)
						</button>
						<button
							type="button"
							onclick={() => { labelSize = '40x20'; printMode = 'roll'; }}
							class="px-2.5 py-1 rounded-md font-bold text-[11px] transition-all cursor-pointer {labelSize === '40x20' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
						>
							40 × 20 mm
						</button>
						<button
							type="button"
							onclick={() => { labelSize = '38x18'; printMode = 'roll'; }}
							class="px-2.5 py-1 rounded-md font-bold text-[11px] transition-all cursor-pointer {labelSize === '38x18' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
						>
							38 × 18 mm
						</button>
						<button
							type="button"
							onclick={() => { labelSize = '35x15'; printMode = 'roll'; }}
							class="px-2.5 py-1 rounded-md font-bold text-[11px] transition-all cursor-pointer {labelSize === '35x15' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
						>
							35 × 15 mm
						</button>
						<button
							type="button"
							onclick={() => { labelSize = 'a4'; printMode = 'sheet'; }}
							class="px-2.5 py-1 rounded-md font-bold text-[11px] transition-all cursor-pointer {labelSize === 'a4' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}"
						>
							A4 Grid (Lembaran)
						</button>
					</div>
				</div>

				<!-- Mode Layout Printer -->
				<div class="flex items-center gap-1.5 border-l border-slate-200 pl-3">
					<Layers class="w-3.5 h-3.5 text-slate-500" />
					<span class="font-bold text-slate-700">Tipe Printer:</span>
					<select
						bind:value={printMode}
						class="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 font-semibold outline-none focus:border-red-600"
					>
						<option value="roll">Thermal Roll (1 Stiker per Halaman)</option>
						<option value="sheet">Kertas Lembaran (Banyak Baris & Kolom)</option>
					</select>
				</div>
			</div>

			<!-- Filter Kategori & Search -->
			<div class="flex items-center gap-2 w-full sm:w-auto">
				<select
					bind:value={selectedCategory}
					class="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold outline-none focus:border-red-600"
				>
					{#each categories as cat}
						<option value={cat}>{cat === 'ALL' ? 'Semua Kategori' : cat}</option>
					{/each}
				</select>

				<div class="relative w-full sm:w-64">
					<Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Cari nama, barcode (200314 / 700314), SKU..."
						onkeydown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
						class="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-8 py-1.5 text-xs outline-none focus:border-red-600 font-mono"
					/>
					{#if searchQuery}
						<button
							type="button"
							onclick={() => (searchQuery = '')}
							class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold p-1 cursor-pointer"
							title="Bersihkan Pencarian"
						>
							✕
						</button>
					{/if}
				</div>
			</div>
		</div>

		<!-- Info Tips Scanning Khusus Zenpert 4T520 & 33x15mm -->
		{#if labelSize === '33x15'}
			<div class="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-emerald-950">
				<div class="flex items-center gap-2">
					<Sparkles class="w-4 h-4 text-emerald-600 shrink-0" />
					<span><b>Standar Ritel 10/10 (Zenpert 4T520 - 33×15 mm):</b> Header 1 baris (Arial Bold 7pt) → Barcode Full Angka 6-Digit Tinggi 9.5 mm (Code 128C, Batang Tebal Maksimal, Quiet Zone 3 mm) → Kode 6-Digit Rata Tengah (Tanpa Harga, Bebas Ubah Harga Tanpa Ganti Stiker). 1x Beep Instan!</span>
				</div>
			</div>
		{:else}
			<div class="bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex items-center justify-between gap-2 text-xs text-amber-900">
				<div class="flex items-center gap-2">
					<span class="font-bold">💡 Informasi Label Barcode:</span>
					<span>Pilih ukuran kertas di atas lalu klik tombol <b>Cetak Label Barcode</b>.</span>
				</div>
			</div>
		{/if}
	</header>

	<!-- Barcode Preview & Print Sheet -->
	<main class="max-w-7xl mx-auto print:max-w-none print:w-full">
		{#if labelSize === '33x15'}
			<!-- ========================================================================= -->
			<!-- LAYOUT UKURAN 33 x 15 mm (STANDAR MINIMARKET ZENPERT 4T520) -->
			<!-- STRUKTUR: ANEKA RASA 99 (atas) -> BARCODE (tengah 9.5mm) -> KODE 6-DIGIT (bawah) -->
			<!-- ========================================================================= -->
			<div class="{printMode === 'roll' ? 'flex flex-wrap gap-4 justify-center print:block' : 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 print:grid-cols-6 print:gap-1'}">
				{#each filteredProducts as product (product.id)}
					{@const bData = getBarcodeData(product)}
					<div class="flex flex-col items-center bg-slate-50/70 p-2 rounded-lg border border-slate-200 print:bg-transparent print:p-0 print:border-none {printMode === 'roll' ? 'print:break-after-page' : 'print:break-inside-avoid'}">
						
						<!-- Info Nama Produk & Kategori (Hanya Tampil di Layar Monitor, Otomatis Hilang Saat Print) -->
						<div class="print:hidden w-[33mm] text-center mb-1.5 px-0.5">
							<p class="text-[10px] font-bold text-slate-900 truncate leading-tight" title={product.name}>
								{product.name}
							</p>
							<p class="text-[9px] font-mono text-slate-500 truncate leading-tight">
								{product.category_name || 'Umum'} • {product.sku}
							</p>
						</div>

						<!-- Kartu Fisik Label Stiker 33x15 mm (Standar Zenpert 4T520) -->
						<div class="barcode-card-33x15 bg-white border border-slate-300 rounded print:rounded-none flex flex-col justify-between items-center text-center shadow-xs print:shadow-none print:border-none">
							<!-- Header Toko: Arial Bold 7pt, 1 baris bersih rapi tanpa wrap -->
							<div class="header-33x15 w-full text-center">
								<span class="store-title-33x15">
									ANEKA RASA 99
								</span>
							</div>

							<!-- Barcode: Tinggi 9.5 mm, Quiet Zone 3mm kiri & kanan, Type Code 128C 6-Digit -->
							<div class="barcode-container-33x15 w-full flex items-center justify-center">
								<svg 
									class="barcode-svg" 
									data-barcode={bData.encodedValue}
								></svg>
							</div>

							<!-- Bawah: 6 Digit Nomor Produk Rata Tengah (Font 7pt Bold) Tanpa Harga -->
							<div class="footer-33x15 w-full text-center">
								<span class="code-33x15">
									{bData.displayText}
								</span>
							</div>
						</div>
					</div>
				{/each}
			</div>

		{:else if labelSize === '40x20'}
			<!-- ========================================================================= -->
			<!-- LAYOUT UKURAN 40 x 20 mm -->
			<!-- ========================================================================= -->
			<div class="{printMode === 'roll' ? 'flex flex-wrap gap-2 print:block' : 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 print:grid-cols-5 print:gap-1.5'} justify-center">
				{#each filteredProducts as product (product.id)}
					{@const bData = getBarcodeData(product)}
					<div class="barcode-card-40x20 bg-white border border-slate-300 rounded print:rounded-none p-1 flex flex-col justify-between items-center text-center shadow-xs print:shadow-none print:border-black print:border {printMode === 'roll' ? 'print:break-after-page' : 'print:break-inside-avoid'}">
						<div class="w-full border-b border-slate-200 print:border-black/40 pb-0.5 mb-0.5">
							<span class="text-[6.5px] font-black uppercase text-red-700 print:text-black tracking-wider block font-mono leading-none">
								TOKO ANEKA RASA 99
							</span>
							<p class="text-[7.5px] font-bold text-slate-900 leading-none truncate mt-0.5" title={product.name}>
								{product.name}
							</p>
						</div>

						<div class="flex flex-col items-center justify-center w-full py-0.5 my-auto">
							<svg class="barcode-svg max-w-full" data-barcode={bData.encodedValue}></svg>
							<span class="font-mono text-[7px] font-black tracking-wider text-slate-900 leading-none mt-0.5">
								{bData.displayText}
							</span>
						</div>

						<div class="w-full border-t border-slate-200 print:border-black/40 pt-0.5 mt-0.5 flex justify-between items-center px-0.5 leading-none">
							<span class="font-mono text-[8px] font-black text-slate-900">
								{formatCurrency(product.selling_price || product.price)}
							</span>
							<span class="text-[6.5px] font-mono text-slate-600 font-bold">
								/{product.base_unit || 'PCS'}
							</span>
						</div>
					</div>
				{/each}
			</div>

		{:else if labelSize === '38x18'}
			<!-- ========================================================================= -->
			<!-- LAYOUT UKURAN 38 x 18 mm -->
			<!-- ========================================================================= -->
			<div class="{printMode === 'roll' ? 'flex flex-wrap gap-2 print:block' : 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 print:grid-cols-5 print:gap-1'} justify-center">
				{#each filteredProducts as product (product.id)}
					{@const bData = getBarcodeData(product)}
					<div class="barcode-card-38x18 bg-white border border-slate-300 rounded print:rounded-none p-1 flex flex-col justify-between items-center text-center shadow-xs print:shadow-none print:border-black print:border {printMode === 'roll' ? 'print:break-after-page' : 'print:break-inside-avoid'}">
						<div class="w-full border-b border-slate-200 print:border-black/40 pb-0.5 mb-0.5">
							<span class="text-[6px] font-black uppercase text-red-700 print:text-black tracking-wider block font-mono leading-none">
								TOKO ANEKA RASA 99
							</span>
							<p class="text-[7px] font-bold text-slate-900 leading-none truncate mt-0.5" title={product.name}>
								{product.name}
							</p>
						</div>

						<div class="flex flex-col items-center justify-center w-full py-0.5 my-auto">
							<svg class="barcode-svg max-w-full" data-barcode={bData.encodedValue}></svg>
							<span class="font-mono text-[6.5px] font-black tracking-wider text-slate-900 leading-none mt-0.5">
								{bData.displayText}
							</span>
						</div>

						<div class="w-full border-t border-slate-200 print:border-black/40 pt-0.5 mt-0.5 flex justify-between items-center px-0.5 leading-none">
							<span class="font-mono text-[7.5px] font-black text-slate-900">
								{formatCurrency(product.selling_price || product.price)}
							</span>
							<span class="text-[6px] font-mono text-slate-600 font-bold">
								/{product.base_unit || 'PCS'}
							</span>
						</div>
					</div>
				{/each}
			</div>

		{:else if labelSize === '35x15'}
			<!-- ========================================================================= -->
			<!-- LAYOUT UKURAN 35 x 15 mm -->
			<!-- ========================================================================= -->
			<div class="{printMode === 'roll' ? 'flex flex-wrap gap-2 print:block' : 'grid grid-cols-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-1.5 print:grid-cols-6 print:gap-1'} justify-center">
				{#each filteredProducts as product (product.id)}
					{@const bData = getBarcodeData(product)}
					<div class="barcode-card-35x15 bg-white border border-slate-300 rounded print:rounded-none p-0.5 flex flex-col justify-between items-center text-center shadow-xs print:shadow-none print:border-black print:border {printMode === 'roll' ? 'print:break-after-page' : 'print:break-inside-avoid'}">
						<div class="w-full border-b border-slate-200 print:border-black/40 pb-0.5 mb-0.5">
							<span class="text-[5.5px] font-black uppercase text-red-700 print:text-black tracking-wider block font-mono leading-none">
								ANEKA RASA 99
							</span>
							<p class="text-[6.5px] font-bold text-slate-900 leading-none truncate mt-0.5" title={product.name}>
								{product.name}
							</p>
						</div>

						<div class="flex flex-col items-center justify-center w-full py-0.5 my-auto">
							<svg class="barcode-svg max-w-full" data-barcode={bData.encodedValue}></svg>
							<span class="font-mono text-[6px] font-black tracking-wider text-slate-900 leading-none mt-0.5">
								{bData.displayText}
							</span>
						</div>

						<div class="w-full border-t border-slate-200 print:border-black/40 pt-0.5 mt-0.5 flex justify-between items-center px-0.5 leading-none">
							<span class="font-mono text-[7px] font-black text-slate-900">
								{formatCurrency(product.selling_price || product.price)}
							</span>
							<span class="text-[5.5px] font-mono text-slate-600 font-bold">
								/{product.base_unit || 'PCS'}
							</span>
						</div>
					</div>
				{/each}
			</div>

		{:else}
			<!-- ========================================================================= -->
			<!-- LAYOUT A4 GRID (KERTAS LEMBARAN HVS / TOM & JERRY) -->
			<!-- ========================================================================= -->
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 print:grid-cols-3 print:gap-3">
				{#each filteredProducts as product (product.id)}
					{@const bData = getBarcodeData(product)}
					<div class="barcode-card-a4 bg-white border border-slate-300 rounded-lg p-3 flex flex-col justify-between items-center text-center shadow-xs print:shadow-none print:border-black print:border print:rounded-none print:break-inside-avoid">
						<div class="w-full border-b border-slate-100 print:border-slate-300 pb-1 mb-1">
							<span class="text-[9px] font-black uppercase text-red-700 print:text-black tracking-wider block font-mono">
								TOKO ANEKA RASA 99
							</span>
							<p class="text-[11px] font-bold text-slate-900 leading-tight line-clamp-2 h-7" title={product.name}>
								{product.name}
							</p>
						</div>

						<div class="py-1.5 flex flex-col items-center justify-center w-full">
							<svg class="barcode-svg max-w-full" data-barcode={bData.encodedValue}></svg>
							<span class="font-mono text-[10px] font-black tracking-widest text-slate-900 mt-1 block">
								{bData.displayText}
							</span>
						</div>

						<div class="w-full border-t border-slate-100 print:border-slate-300 pt-1 mt-1 flex justify-between items-center">
							<span class="font-mono text-xs font-black text-slate-900">
								{formatCurrency(product.selling_price || product.price)}
							</span>
							<span class="text-[10px] font-mono text-slate-500 uppercase font-semibold">
								/{product.base_unit || 'PCS'}
							</span>
							<button
								onclick={() => copyToClipboard(bData.displayText)}
								class="print:hidden text-[10px] text-slate-500 hover:text-red-600 flex items-center gap-1 font-mono px-1.5 py-0.5 rounded hover:bg-slate-100 cursor-pointer"
								title="Salin Barcode"
							>
								{#if copiedSku === bData.displayText}
									<Check class="w-3 h-3 text-emerald-600" /> <span class="text-emerald-600 font-bold">Tersalin</span>
								{:else}
									<Copy class="w-3 h-3" /> <span>Salin</span>
								{/if}
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		{#if filteredProducts.length === 0}
			<div class="py-20 text-center text-slate-400">
				<Barcode class="w-12 h-12 mx-auto mb-2 text-slate-300" />
				<p class="text-sm font-medium">Tidak ada produk yang cocok dengan pencarian.</p>
			</div>
		{/if}
	</main>
</div>

<style>
	/* Dimensi On-Screen Preview & Print untuk 33x15mm */
	.barcode-card-33x15 {
		width: 33mm;
		height: 15mm;
		max-height: 15mm;
		padding: 0.8mm 3mm 0.6mm 3mm;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		overflow: hidden;
		background: #ffffff;
		font-family: Arial, Helvetica, sans-serif;
	}

	.header-33x15 {
		padding-top: 0;
		line-height: 1;
		width: 100%;
		white-space: nowrap;
	}

	.store-title-33x15 {
		font-family: Arial, Helvetica, sans-serif;
		font-size: 7pt;
		font-weight: 800;
		color: #dc2626;
		letter-spacing: 0.2px;
		display: block;
		line-height: 1;
		margin: 0;
		white-space: nowrap;
	}

	.barcode-container-33x15 {
		height: 9.5mm;
		max-height: 9.5mm;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.barcode-container-33x15 svg {
		height: 9.5mm !important;
		max-height: 9.5mm !important;
		width: auto;
		max-width: 100%;
		display: block;
	}

	.footer-33x15 {
		width: 100%;
		text-align: center;
		line-height: 1;
		white-space: nowrap;
	}

	.code-33x15 {
		font-family: Arial, 'Courier New', monospace;
		font-size: 7pt;
		font-weight: 800;
		color: #000000;
		line-height: 1;
		letter-spacing: 1.5px;
		display: inline-block;
	}

	/* Dimensi On-Screen Preview & Print Ukuran Lainnya */
	.barcode-card-40x20 {
		width: 40mm;
		min-height: 20mm;
		box-sizing: border-box;
	}

	.barcode-card-38x18 {
		width: 38mm;
		min-height: 18mm;
		box-sizing: border-box;
	}

	.barcode-card-35x15 {
		width: 35mm;
		min-height: 15mm;
		box-sizing: border-box;
	}

	@media print {
		:global(html),
		:global(body) {
			visibility: visible !important;
			background: white !important;
			color: black !important;
			margin: 0 !important;
			padding: 0 !important;
			height: auto !important;
			overflow: visible !important;
		}

		:global(body *) {
			visibility: visible !important;
		}

		.print\:break-after-page {
			page-break-after: always !important;
			break-after: page !important;
			margin: 0 auto !important;
		}

		.print\:break-inside-avoid {
			break-inside: avoid !important;
			page-break-inside: avoid !important;
		}

		:global(*) {
			-webkit-print-color-adjust: exact !important;
			print-color-adjust: exact !important;
		}

		.barcode-card-33x15 {
			width: 33mm !important;
			height: 15mm !important;
			max-height: 15mm !important;
			padding: 0.8mm 3mm 0.6mm 3mm !important;
			box-sizing: border-box !important;
			border: none !important;
			box-shadow: none !important;
			page-break-after: always !important;
			break-after: page !important;
			margin: 0 auto !important;
		}

		.store-title-33x15 {
			font-family: Arial, sans-serif !important;
			font-size: 7pt !important;
			font-weight: 800 !important;
			color: #dc2626 !important;
			-webkit-print-color-adjust: exact !important;
			print-color-adjust: exact !important;
		}

		.code-33x15 {
			font-family: Arial, monospace !important;
			font-size: 7pt !important;
			font-weight: 800 !important;
			color: #000000 !important;
			letter-spacing: 1.5px !important;
		}
	}
</style>
