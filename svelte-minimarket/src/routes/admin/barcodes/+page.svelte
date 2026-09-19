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
	let isStandardizing = $state(false);

	// Pilihan Ukuran Kertas Label
	type LabelSize = '40x20' | '38x18' | '35x15' | 'a4';
	let labelSize = $state<LabelSize>('40x20');

	// Mode Printer: 'roll' (Thermal Roll 1 per 1) atau 'sheet' (Lembaran A4 Grid)
	let printMode = $state<'roll' | 'sheet'>('roll');

	// Ambil daftar kategori unik dari data produk
	let categories = $derived([
		'ALL',
		...Array.from(new Set((data.products || []).map((p: any) => p.category_name).filter(Boolean)))
	]);

	let filteredProducts = $derived(
		(data.products || []).filter((p: any) => {
			const q = searchQuery.toLowerCase();
			const matchQuery =
				!q ||
				p.name.toLowerCase().includes(q) ||
				p.sku.toLowerCase().includes(q) ||
				(p.barcode && p.barcode.toLowerCase().includes(q)) ||
				(p.category_name && p.category_name.toLowerCase().includes(q));

			const matchCat = selectedCategory === 'ALL' || p.category_name === selectedCategory;
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

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		copiedSku = text;
		setTimeout(() => {
			copiedSku = null;
		}, 1500);
	}

	// Konfigurasi barcode berdasarkan ukuran stiker
	function getSizeConfig(size: LabelSize) {
		switch (size) {
			case '35x15':
				return { width: 1.1, height: 19, margin: 2 };
			case '38x18':
				return { width: 1.25, height: 23, margin: 3 };
			case '40x20':
				return { width: 1.35, height: 26, margin: 3 };
			case 'a4':
			default:
				return { width: 1.6, height: 38, margin: 6 };
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
						displayValue: false, // Ditampilkan via teks HTML di bawahnya agar tajam & tidak gepeng
						margin: cfg.margin,
						lineColor: '#000000',
						background: '#ffffff'
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
	{#if labelSize === '40x20'}
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
						{filteredProducts.length} Produk • Format Standar Ritel Siap Scan
					</p>
				</div>
			</div>

			<!-- Tombol Standardisasi Barcode (EAN-13 Toko) -->
			<div class="flex items-center gap-2 w-full md:w-auto">
				<form
					method="POST"
					action="?/standardize"
					use:enhance={() => {
						isStandardizing = true;
						return async ({ update }) => {
							await update();
							isStandardizing = false;
							renderBarcodes();
						};
					}}
					class="w-full md:w-auto"
				>
					<button
						type="submit"
						disabled={isStandardizing}
						class="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
						title="Ubah barcode teks panjang menjadi format angka 13-digit standar (899...) yang sangat mudah dibaca scanner"
					>
						<Sparkles class="w-3.5 h-3.5 text-slate-900" />
						<span>{isStandardizing ? 'Memproses...' : 'Standardisasi ke 13-Digit (899...)'}</span>
					</button>
				</form>

				<button
					onclick={handlePrint}
					class="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer"
				>
					<Printer class="w-4 h-4" /> <span>Cetak Label ({labelSize}mm)</span>
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
					<div class="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
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

				<div class="relative w-full sm:w-56">
					<Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Cari nama, barcode, SKU..."
						class="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-red-600"
					/>
				</div>
			</div>
		</div>

		<!-- Info Tips Scanning -->
		<div class="bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex items-center justify-between gap-2 text-xs text-amber-900">
			<div class="flex items-center gap-2">
				<span class="font-bold">💡 Tips Barcode Scanner:</span>
				<span>Barcode dengan garis hitam tajam & margin putih samping kini sudah aktif. Sangat disarankan klik tombol <b>"Standardisasi ke 13-Digit"</b> jika barcode Anda masih menggunakan huruf panjang.</span>
			</div>
		</div>
	</header>

	<!-- Barcode Preview & Print Sheet -->
	<main class="max-w-7xl mx-auto print:max-w-none print:w-full">
		{#if labelSize === '40x20'}
			<!-- ========================================================================= -->
			<!-- LAYOUT UKURAN 40 x 20 mm -->
			<!-- ========================================================================= -->
			<div class="{printMode === 'roll' ? 'flex flex-wrap gap-2 print:block' : 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 print:grid-cols-5 print:gap-1.5'} justify-center">
				{#each filteredProducts as product (product.id)}
					<div class="barcode-card-40x20 bg-white border border-slate-300 rounded print:rounded-none p-1 flex flex-col justify-between items-center text-center shadow-xs print:shadow-none print:border-black print:border {printMode === 'roll' ? 'print:break-after-page' : 'print:break-inside-avoid'}">
						<!-- Header Toko & Nama Produk -->
						<div class="w-full border-b border-slate-200 print:border-black/40 pb-0.5 mb-0.5">
							<span class="text-[6.5px] font-black uppercase text-red-700 print:text-black tracking-wider block font-mono leading-none">
								TOKO ANEKA RASA 99
							</span>
							<p class="text-[7.5px] font-bold text-slate-900 leading-none truncate mt-0.5" title={product.name}>
								{product.name}
							</p>
						</div>

						<!-- Barcode SVG & Nomor -->
						<div class="flex flex-col items-center justify-center w-full py-0.5 my-auto">
							<svg class="barcode-svg max-w-full" data-barcode={product.barcode || product.sku}></svg>
							<span class="font-mono text-[7px] font-black tracking-wider text-slate-900 leading-none mt-0.5">
								{product.barcode || product.sku}
							</span>
						</div>

						<!-- Footer Harga & Satuan -->
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
					<div class="barcode-card-38x18 bg-white border border-slate-300 rounded print:rounded-none p-1 flex flex-col justify-between items-center text-center shadow-xs print:shadow-none print:border-black print:border {printMode === 'roll' ? 'print:break-after-page' : 'print:break-inside-avoid'}">
						<!-- Header Toko & Nama Produk -->
						<div class="w-full border-b border-slate-200 print:border-black/40 pb-0.5 mb-0.5">
							<span class="text-[6px] font-black uppercase text-red-700 print:text-black tracking-wider block font-mono leading-none">
								TOKO ANEKA RASA 99
							</span>
							<p class="text-[7px] font-bold text-slate-900 leading-none truncate mt-0.5" title={product.name}>
								{product.name}
							</p>
						</div>

						<!-- Barcode SVG & Nomor -->
						<div class="flex flex-col items-center justify-center w-full py-0.5 my-auto">
							<svg class="barcode-svg max-w-full" data-barcode={product.barcode || product.sku}></svg>
							<span class="font-mono text-[6.5px] font-black tracking-wider text-slate-900 leading-none mt-0.5">
								{product.barcode || product.sku}
							</span>
						</div>

						<!-- Footer Harga & Satuan -->
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
					<div class="barcode-card-35x15 bg-white border border-slate-300 rounded print:rounded-none p-0.5 flex flex-col justify-between items-center text-center shadow-xs print:shadow-none print:border-black print:border {printMode === 'roll' ? 'print:break-after-page' : 'print:break-inside-avoid'}">
						<!-- Header Toko & Nama Produk -->
						<div class="w-full border-b border-slate-200 print:border-black/40 pb-0.5 mb-0.5">
							<span class="text-[5.5px] font-black uppercase text-red-700 print:text-black tracking-wider block font-mono leading-none">
								ANEKA RASA 99
							</span>
							<p class="text-[6.5px] font-bold text-slate-900 leading-none truncate mt-0.5" title={product.name}>
								{product.name}
							</p>
						</div>

						<!-- Barcode SVG & Nomor -->
						<div class="flex flex-col items-center justify-center w-full py-0.5 my-auto">
							<svg class="barcode-svg max-w-full" data-barcode={product.barcode || product.sku}></svg>
							<span class="font-mono text-[6px] font-black tracking-wider text-slate-900 leading-none mt-0.5">
								{product.barcode || product.sku}
							</span>
						</div>

						<!-- Footer Harga & Satuan -->
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
					<div class="barcode-card-a4 bg-white border border-slate-300 rounded-lg p-3 flex flex-col justify-between items-center text-center shadow-xs print:shadow-none print:border-black print:border print:rounded-none print:break-inside-avoid">
						<!-- Store Label Header -->
						<div class="w-full border-b border-slate-100 print:border-slate-300 pb-1 mb-1">
							<span class="text-[9px] font-black uppercase text-red-700 print:text-black tracking-wider block font-mono">
								TOKO ANEKA RASA 99
							</span>
							<p class="text-[11px] font-bold text-slate-900 leading-tight line-clamp-2 h-7" title={product.name}>
								{product.name}
							</p>
						</div>

						<!-- Barcode SVG & Nomor -->
						<div class="py-1.5 flex flex-col items-center justify-center w-full">
							<svg class="barcode-svg max-w-full" data-barcode={product.barcode || product.sku}></svg>
							<span class="font-mono text-[10px] font-black tracking-widest text-slate-900 mt-1 block">
								{product.barcode || product.sku}
							</span>
						</div>

						<!-- Price & Unit Footer -->
						<div class="w-full border-t border-slate-100 print:border-slate-300 pt-1 mt-1 flex justify-between items-center">
							<span class="font-mono text-xs font-black text-slate-900">
								{formatCurrency(product.selling_price || product.price)}
							</span>
							<span class="text-[10px] font-mono text-slate-500 uppercase font-semibold">
								/{product.base_unit || 'PCS'}
							</span>
							<button
								onclick={() => copyToClipboard(product.barcode || product.sku)}
								class="print:hidden text-[10px] text-slate-500 hover:text-red-600 flex items-center gap-1 font-mono px-1.5 py-0.5 rounded hover:bg-slate-100 cursor-pointer"
								title="Salin Barcode"
							>
								{#if copiedSku === (product.barcode || product.sku)}
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
	/* Dimensi On-Screen Preview & Print */
	.barcode-card-40x20 {
		width: 40mm;
		height: 20mm;
		min-width: 40mm;
		max-width: 40mm;
		min-height: 20mm;
		max-height: 20mm;
		box-sizing: border-box;
		overflow: hidden;
	}

	.barcode-card-38x18 {
		width: 38mm;
		height: 18mm;
		min-width: 38mm;
		max-width: 38mm;
		min-height: 18mm;
		max-height: 18mm;
		box-sizing: border-box;
		overflow: hidden;
	}

	.barcode-card-35x15 {
		width: 35mm;
		height: 15mm;
		min-width: 35mm;
		max-width: 35mm;
		min-height: 15mm;
		max-height: 15mm;
		box-sizing: border-box;
		overflow: hidden;
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
	}
</style>

