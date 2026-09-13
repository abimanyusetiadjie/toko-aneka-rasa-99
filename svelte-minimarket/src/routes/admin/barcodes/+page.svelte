<script lang="ts">
	import type { PageData } from './$types';
	import { onMount, tick } from 'svelte';
	import { Printer, Search, ArrowLeft, Barcode, Copy, Check, RefreshCw } from 'lucide-svelte';
	import JsBarcode from 'jsbarcode';

	let { data } = $props<{ data: PageData }>();

	let searchQuery = $state('');
	let copiedSku = $state<string | null>(null);

	let filteredProducts = $derived(
		(data.products || []).filter((p: any) =>
			p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase())) ||
			(p.category_name && p.category_name.toLowerCase().includes(searchQuery.toLowerCase()))
		)
	);

	function formatCurrency(val: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(val || 0);
	}

	function copyToClipboard(sku: string) {
		navigator.clipboard.writeText(sku);
		copiedSku = sku;
		setTimeout(() => {
			copiedSku = null;
		}, 1500);
	}

	async function renderBarcodes() {
		await tick();
		const svgs = document.querySelectorAll<SVGSVGElement>('.barcode-svg');
		svgs.forEach((svg) => {
			const text = svg.getAttribute('data-barcode');
			if (text) {
				try {
					JsBarcode(svg, text, {
						format: 'CODE128',
						width: 1.6,
						height: 42,
						displayValue: false,
						margin: 0,
						lineColor: '#000000'
					});
				} catch (err) {
					console.error('Gagal render barcode untuk', text, err);
				}
			}
		});
	}

	$effect(() => {
		// Re-render barcodes when filteredProducts changes
		if (filteredProducts.length > 0) {
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
			}, 200);
		});
	}
</script>

<svelte:head>
	<title>Lembar Cetak Barcode - Toko Aneka Rasa 99</title>
</svelte:head>

<div class="min-h-screen bg-slate-100 p-4 md:p-8 print:p-0 print:m-0 print:bg-white text-slate-900 print:w-full">
	<!-- Action Bar (Hidden when printed) -->
	<header class="max-w-6xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs print:hidden">
		<div class="flex items-center gap-3">
			<a href="/admin/inventory" class="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors">
				<ArrowLeft class="w-4 h-4" />
			</a>
			<img src="/logo.png" alt="Toko Aneka Rasa 99" class="w-10 h-10 rounded-full object-cover border border-slate-300 shadow-xs" />
			<div>
				<h1 class="text-base font-black text-slate-900 flex items-center gap-2">
					Lembar Cetak Barcode Produk
					<span class="text-[10px] bg-pink-100 text-pink-800 font-bold px-2 py-0.5 rounded font-mono">Toko Aneka Rasa 99</span>
				</h1>
				<p class="text-xs text-slate-500 font-mono">
					{filteredProducts.length} Produk Siap Cetak • Format Stiker HVS / Label Rak
				</p>
			</div>
		</div>

		<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
			<div class="relative w-full sm:w-64">
				<Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Cari Getas, Kemplang, SKU..."
					class="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs outline-none focus:border-blue-600"
				/>
			</div>

			<button
				onclick={handlePrint}
				class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer"
			>
				<Printer class="w-4 h-4" /> <span>Cetak Label Barcode</span>
			</button>
		</div>
	</header>

	<!-- Barcode Grid Sheet -->
	<main class="max-w-6xl mx-auto print:max-w-none print:w-full">
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 print:grid-cols-3 print:gap-3">
			{#each filteredProducts as product (product.id)}
				<div class="barcode-card bg-white border border-slate-300 rounded-lg p-3 flex flex-col justify-between items-center text-center shadow-xs print:shadow-none print:border-black print:border print:rounded-none">
					<!-- Store Label Header -->
					<div class="w-full border-b border-slate-100 print:border-slate-300 pb-1 mb-1">
						<span class="text-[9px] font-black uppercase text-pink-700 print:text-black tracking-wider block font-mono">
							TOKO ANEKA RASA 99
						</span>
						<p class="text-[11px] font-bold text-slate-900 leading-tight line-clamp-2 h-7" title={product.name}>
							{product.name}
						</p>
					</div>

					<!-- Barcode SVG (Generated Offline via JsBarcode) -->
					<div class="py-1.5 flex flex-col items-center justify-center w-full">
						<svg class="barcode-svg max-w-full h-11" data-barcode={product.barcode || product.sku}></svg>
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
							class="print:hidden text-[10px] text-slate-500 hover:text-blue-600 flex items-center gap-1 font-mono px-1.5 py-0.5 rounded hover:bg-slate-100 cursor-pointer"
							title="Salin Barcode untuk input cepat"
						>
							{#if copiedSku === (product.barcode || product.sku)}
								<Check class="w-3 h-3 text-emerald-600" /> <span class="text-emerald-600 font-bold">Tersalin</span>
							{:else}
								<Copy class="w-3 h-3" /> <span>Salin</span>
							{/if}
						</button>
					</div>
				</div>
			{:else}
				<div class="col-span-full py-20 text-center text-slate-400">
					<Barcode class="w-12 h-12 mx-auto mb-2 text-slate-300" />
					<p class="text-sm font-medium">Produk tidak ditemukan.</p>
				</div>
			{/each}
		</div>
	</main>
</div>

<style>
	@media print {
		@page {
			size: A4 portrait;
			margin: 10mm;
		}

		:global(html), :global(body) {
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

		.barcode-card {
			visibility: visible !important;
			display: flex !important;
			flex-direction: column !important;
			break-inside: avoid !important;
			page-break-inside: avoid !important;
			border: 1px solid #000000 !important;
			box-shadow: none !important;
			margin-bottom: 10px !important;
			padding: 8px !important;
			background: white !important;
		}

		.barcode-card * {
			visibility: visible !important;
		}

		:global(*) {
			-webkit-print-color-adjust: exact !important;
			print-color-adjust: exact !important;
		}
	}
</style>
