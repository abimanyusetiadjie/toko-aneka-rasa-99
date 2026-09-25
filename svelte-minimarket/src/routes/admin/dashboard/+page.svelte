<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		TrendingUp,
		ShoppingBag,
		Layers,
		CheckCircle2,
		AlertCircle,
		DollarSign,
		Percent,
		Store,
		Truck,
		ArrowUpRight,
		FileSpreadsheet,
		FileText,
		Calendar,
		ArrowDownRight,
		Package,
		AlertTriangle,
		X,
		Download,
		Printer,
		Activity,
		CreditCard,
		Award,
		Clock,
		ArrowRight,
		ExternalLink
	} from 'lucide-svelte';

	let { data } = $props();

	let isPdfModalOpen = $state(false);
	let txFilter = $state<'ALL' | 'POS' | 'SHOPEE'>('ALL');
	let showAllTransactions = $state(false);
	let lastUpdated = $state('');

	let trendChartContainer: HTMLDivElement | undefined = $state();
	let paymentChartContainer: HTMLDivElement | undefined = $state();
	let trendChart: any = null;
	let paymentChart: any = null;
	let ApexChartsModule: any = null;

	onMount(async () => {
		const now = new Date();
		const options: Intl.DateTimeFormatOptions = {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		};
		lastUpdated = now.toLocaleDateString('id-ID', options) + ' WIB';

		try {
			const mod = await import('apexcharts');
			ApexChartsModule = mod.default;
			renderCharts();
		} catch (err) {
			console.error('Gagal memuat ApexCharts:', err);
		}
	});

	let filteredTransactions = $derived(
		(data.recentTransactions || []).filter((tx: any) => {
			if (txFilter === 'POS') return tx.channel !== 'SHOPEE';
			if (txFilter === 'SHOPEE') return tx.channel === 'SHOPEE';
			return true;
		})
	);

	let displayedTransactions = $derived(
		showAllTransactions ? filteredTransactions : filteredTransactions.slice(0, 8)
	);

	onDestroy(() => {
		if (trendChart) {
			trendChart.destroy();
			trendChart = null;
		}
		if (paymentChart) {
			paymentChart.destroy();
			paymentChart = null;
		}
	});

	$effect(() => {
		if (ApexChartsModule && (data.dailyTrend || data.paymentMethods)) {
			updateCharts();
		}
	});

	function renderCharts() {
		if (!ApexChartsModule) return;

		// 1. Trend Penjualan Harian (Area / Smooth Line Chart)
		if (trendChartContainer) {
			if (trendChart) trendChart.destroy();

			const categories = (data.dailyTrend || []).map((d: any) => d.label);
			const posSeries = (data.dailyTrend || []).map((d: any) => d.pos);
			const shopeeSeries = (data.dailyTrend || []).map((d: any) => d.shopee);
			const hasShopee = shopeeSeries.some((v: number) => v > 0);

			const series = [
				{ name: 'Kasir Toko', data: posSeries }
			];
			if (hasShopee) {
				series.push({ name: 'Shopee', data: shopeeSeries });
			}

			const options = {
				chart: {
					type: 'area',
					height: 300,
					toolbar: { show: false },
					fontFamily: 'inherit',
					animations: { enabled: true, easing: 'easeinout', speed: 600 }
				},
				colors: ['#2563EB', '#EA580C'],
				dataLabels: { enabled: false },
				stroke: { curve: 'smooth', width: [2.5, 2.5] },
				fill: {
					type: 'gradient',
					gradient: {
						shadeIntensity: 1,
						opacityFrom: 0.35,
						opacityTo: 0.05,
						stops: [0, 90, 100]
					}
				},
				series,
				xaxis: {
					categories,
					labels: {
						style: { colors: '#64748B', fontSize: '11px', fontFamily: 'monospace' }
					},
					axisBorder: { show: false },
					axisTicks: { show: false }
				},
				yaxis: {
					labels: {
						style: { colors: '#64748B', fontSize: '11px', fontFamily: 'monospace' },
						formatter: (val: number) => {
							if (val >= 1000000) return 'Rp ' + (val / 1000000).toFixed(1) + 'jt';
							if (val >= 1000) return 'Rp ' + (val / 1000).toFixed(0) + 'rb';
							return 'Rp ' + val;
						}
					}
				},
				tooltip: {
					theme: 'light',
					y: {
						formatter: (val: number) => formatCurrency(val)
					}
				},
				grid: {
					borderColor: '#F1F5F9',
					strokeDashArray: 4
				},
				legend: {
					position: 'top',
					horizontalAlign: 'right',
					fontSize: '11px',
					fontWeight: 600,
					labels: { colors: '#334155' },
					markers: { radius: 12 }
				}
			};

			trendChart = new ApexChartsModule(trendChartContainer, options);
			trendChart.render();
		}

		// 2. Komposisi Metode Pembayaran (Donut Chart)
		if (paymentChartContainer) {
			if (paymentChart) paymentChart.destroy();

			const labels = (data.paymentMethods || []).map((p: any) => p.label);
			const series = (data.paymentMethods || []).map((p: any) => p.amount);
			const colors = (data.paymentMethods || []).map((p: any) => p.color);

			const options = {
				chart: {
					type: 'donut',
					height: 310,
					fontFamily: 'inherit',
					animations: { enabled: true, speed: 600 }
				},
				series: series.length > 0 ? series : [1],
				labels: labels.length > 0 ? labels : ['Belum Ada Pembayaran'],
				colors: colors.length > 0 ? colors : ['#94A3B8'],
				plotOptions: {
					pie: {
						donut: {
							size: '68%',
							labels: {
								show: true,
								name: {
									show: true,
									fontSize: '12px',
									fontWeight: 600,
									color: '#64748B'
								},
								value: {
									show: true,
									fontSize: '16px',
									fontWeight: 800,
									fontFamily: 'monospace',
									color: '#0F172A',
									formatter: (val: number) => formatCurrency(Number(val))
								},
								total: {
									show: true,
									showAlways: true,
									label: 'Total Kas Masuk',
									fontSize: '10px',
									fontWeight: 700,
									color: '#64748B',
									formatter: (w: any) => {
										const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
										return formatCurrency(total);
									}
								}
							}
						}
					}
				},
				dataLabels: { enabled: false },
				legend: {
					position: 'bottom',
					fontSize: '11px',
					fontWeight: 600,
					labels: { colors: '#334155' },
					markers: { radius: 12 }
				},
				tooltip: {
					theme: 'light',
					y: {
						formatter: (val: number) => formatCurrency(val)
					}
				}
			};

			paymentChart = new ApexChartsModule(paymentChartContainer, options);
			paymentChart.render();
		}
	}

	function updateCharts() {
		if (trendChart && data.dailyTrend) {
			const categories = data.dailyTrend.map((d: any) => d.label);
			const posSeries = data.dailyTrend.map((d: any) => d.pos);
			const shopeeSeries = data.dailyTrend.map((d: any) => d.shopee);
			const hasShopee = shopeeSeries.some((v: number) => v > 0);

			const series = [
				{ name: 'Kasir Toko', data: posSeries }
			];
			if (hasShopee) {
				series.push({ name: 'Shopee', data: shopeeSeries });
			}

			trendChart.updateOptions({
				xaxis: { categories }
			});
			trendChart.updateSeries(series);
		}

		if (paymentChart && data.paymentMethods) {
			const labels = data.paymentMethods.map((p: any) => p.label);
			const series = data.paymentMethods.map((p: any) => p.amount);
			const colors = data.paymentMethods.map((p: any) => p.color);
			paymentChart.updateOptions({
				labels,
				colors
			});
			paymentChart.updateSeries(series.length > 0 ? series : [1]);
		}
	}

	function formatCurrency(val: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(val || 0);
	}

	function getPeriodLabel(p: string): string {
		if (p === 'daily') return 'Hari Ini';
		if (p === 'weekly') return '7 Hari Terakhir';
		if (p === 'monthly') return 'Bulan Ini';
		if (p === 'custom') {
			const f = data.dateFrom || '';
			const t = data.dateTo || '';
			if (f && t && f !== t) return `${f} s/d ${t}`;
			if (f) return f;
			return 'Tanggal Khusus';
		}
		return 'Semua Waktu';
	}

	let showDatePicker = $state(false);
	let customFrom = $state(data.dateFrom || new Date().toISOString().slice(0, 10));
	let customTo = $state(data.dateTo || new Date().toISOString().slice(0, 10));

	function applyCustomDate() {
		if (customFrom) {
			const to = customTo || customFrom;
			window.location.href = `?period=custom&from=${customFrom}&to=${to}`;
		}
	}

	function exportToExcel() {
		const periodLabel = getPeriodLabel(data.period);
		const printDate = new Date().toLocaleString('id-ID');
		const ownerName = data.user?.full_name || 'Hendra Wijaya (Owner)';

		const tableHtml = `
		<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
		<head>
			<meta charset="utf-8">
			<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Laporan Penjualan</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
			<style>
				body { font-family: Calibri, Arial, sans-serif; }
				.header-title { font-size: 16pt; font-weight: bold; color: #1e3a8a; }
				.header-sub { font-size: 10pt; color: #475569; }
				.kpi-table { border-collapse: collapse; margin-bottom: 20px; }
				.kpi-table td { padding: 6px 12px; border: 1px solid #cbd5e1; }
				.kpi-header { background-color: #f1f5f9; font-weight: bold; }
				.kpi-value { font-weight: bold; font-family: Consolas, monospace; }
				.data-table { border-collapse: collapse; width: 100%; margin-top: 15px; }
				.data-table th { background-color: #2563eb; color: #ffffff; font-weight: bold; padding: 8px 10px; border: 1px solid #1d4ed8; text-align: left; }
				.data-table td { padding: 6px 10px; border: 1px solid #e2e8f0; font-size: 10pt; }
				.text-right { text-align: right; }
				.text-center { text-align: center; }
				.currency { font-family: Consolas, monospace; text-align: right; }
				.total-row { background-color: #f8fafc; font-weight: bold; border-top: 2px solid #0f172a; }
			</style>
		</head>
		<body>
			<table>
				<tr><td colspan="10" class="header-title">TOKO ANEKA RASA 99 PANGKALPINANG</td></tr>
				<tr><td colspan="10" class="header-sub">Pusat Oleh-Oleh Khas Bangka & Minimarket Modern</td></tr>
				<tr><td colspan="10" class="header-sub">Jl. Jend. Sudirman No. 99, Pangkalpinang, Bangka Belitung | Telp: (0717) 432199</td></tr>
				<tr><td colspan="10"></td></tr>
				<tr><td colspan="10" style="font-size: 13pt; font-weight: bold; color: #0f172a;">LAPORAN REKAPITULASI PENJUALAN & LABA BERSIH</td></tr>
				<tr><td colspan="10">Periode Laporan: <b>${periodLabel}</b> | Waktu Unduh: <b>${printDate}</b> | Pemilik: <b>${ownerName}</b></td></tr>
				<tr><td colspan="10"></td></tr>
			</table>

			<table class="kpi-table">
				<tr class="kpi-header">
					<td>Total Omset Kotor</td>
					<td>Total Modal HPP</td>
					<td>Total Laba Bersih</td>
					<td>Gross Profit Margin (%)</td>
					<td>Total Transaksi</td>
					<td>Rata-rata Basket Size</td>
				</tr>
				<tr>
					<td class="kpi-value">${formatCurrency(data.totalRevenue)}</td>
					<td class="kpi-value">${formatCurrency(data.totalCogs)}</td>
					<td class="kpi-value" style="color: #059669;">${formatCurrency(data.grossProfit)}</td>
					<td class="kpi-value">${data.grossProfitMargin}%</td>
					<td class="kpi-value text-center">${data.totalTransactions} Transaksi</td>
					<td class="kpi-value">${formatCurrency(data.avgBasketSize)}</td>
				</tr>
			</table>

			<table class="kpi-table">
				<tr class="kpi-header">
					<td>Saluran Penjualan</td>
					<td>Omset (Rp)</td>
					<td>Jumlah Transaksi</td>
					<td>Kontribusi Omset (%)</td>
				</tr>
				<tr>
					<td><b>Kasir Offline Toko (POS)</b></td>
					<td class="currency">${formatCurrency(data.posRevenue)}</td>
					<td class="text-center">${data.posCount}</td>
					<td class="text-center">${data.channelBreakdown.posPercent}%</td>
				</tr>
				<tr>
					<td><b>Marketplace Shopee Online</b></td>
					<td class="currency">${formatCurrency(data.shopeeRevenue)}</td>
					<td class="text-center">${data.shopeeCount}</td>
					<td class="text-center">${data.channelBreakdown.shopeePercent}%</td>
				</tr>
			</table>

			<table class="data-table">
				<thead>
					<tr>
						<th class="text-center" style="width: 40px;">No</th>
						<th>Tanggal & Waktu</th>
						<th>No. Struk / Order ID</th>
						<th>Saluran</th>
						<th>Metode Bayar</th>
						<th>Kasir</th>
						<th class="text-center">Total Qty</th>
						<th class="text-right">Omset (Rp)</th>
						<th class="text-right">Modal HPP (Rp)</th>
						<th class="text-right">Laba Bersih (Rp)</th>
					</tr>
				</thead>
				<tbody>
					${data.recentTransactions.map((tx: any, idx: number) => `
						<tr>
							<td class="text-center">${idx + 1}</td>
							<td>${new Date(tx.created_at).toLocaleString('id-ID')}</td>
							<td style="font-family: Consolas, monospace;">${tx.receipt_number}</td>
							<td>${tx.channel === 'SHOPEE' ? 'Shopee Marketplace' : 'Kasir Offline (POS)'}</td>
							<td>${tx.payment_method}</td>
							<td>${tx.cashier_name}</td>
							<td class="text-center">${tx.total_qty || 1}</td>
							<td class="currency">${Number(tx.total_amount).toLocaleString('id-ID')}</td>
							<td class="currency">${Number(tx.cogs || 0).toLocaleString('id-ID')}</td>
							<td class="currency" style="color: #059669; font-weight: bold;">${Number(tx.gross_profit || 0).toLocaleString('id-ID')}</td>
						</tr>
					`).join('')}
					<tr class="total-row">
						<td colspan="6" class="text-right"><b>TOTAL KESELURUHAN:</b></td>
						<td class="text-center"><b>${data.recentTransactions.reduce((acc: number, t: any) => acc + (t.total_qty || 1), 0)}</b></td>
						<td class="currency"><b>${data.totalRevenue.toLocaleString('id-ID')}</b></td>
						<td class="currency"><b>${data.totalCogs.toLocaleString('id-ID')}</b></td>
						<td class="currency" style="color: #059669;"><b>${data.grossProfit.toLocaleString('id-ID')}</b></td>
					</tr>
				</tbody>
			</table>

			<br><br>
			<table>
				<tr><td colspan="7"></td><td colspan="3" class="text-center">Pangkalpinang, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
				<tr><td colspan="7"></td><td colspan="3" class="text-center">Mengetahui & Menyetujui,</td></tr>
				<tr><td colspan="7"></td><td colspan="3" class="text-center"><b>Pemilik Toko (Owner)</b></td></tr>
				<tr><td colspan="10" style="height: 50px;"></td></tr>
				<tr><td colspan="7"></td><td colspan="3" class="text-center"><b>( ${ownerName} )</b></td></tr>
			</table>
		</body>
		</html>
		`;

		const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `Laporan_Penjualan_AnekaRasa99_${data.period}_${Date.now()}.xls`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

<div class="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
	<!-- 1. Header & Filter Periode -->
	<header class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
		<div>
			<div class="flex items-center gap-2 mb-1 flex-wrap">
				<span class="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
					Ringkasan Bisnis
				</span>
				{#if lastUpdated}
					<span class="text-xs text-slate-500 flex items-center gap-1 font-sans">
						<Clock class="w-3.5 h-3.5 text-slate-400" />
						Update terakhir: {lastUpdated}
					</span>
				{/if}
			</div>
			<h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Performa Toko</h2>
			<p class="text-xs sm:text-sm text-slate-600 mt-0.5">Pantau omzet, modal barang, dan keuntungan bersih toko Anda dalam sekejap.</p>
		</div>

		<!-- Tombol Aksi & Ekspor -->
		<div class="flex items-center gap-2 flex-wrap">
			<button
				onclick={exportToExcel}
				class="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
				title="Unduh data dalam format Excel (.xls)"
			>
				<FileSpreadsheet class="w-4 h-4 text-emerald-100" />
				<span>Unduh Excel</span>
			</button>

			<button
				onclick={() => (isPdfModalOpen = true)}
				class="bg-red-600 hover:bg-red-700 active:scale-95 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
				title="Buka pratinjau laporan PDF siap cetak"
			>
				<FileText class="w-4 h-4 text-red-100" />
				<span>Ekspor PDF</span>
			</button>
		</div>
	</header>

	<!-- Filter Periode -->
	<div class="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
			<div class="flex items-center gap-3 flex-wrap">
				<div class="flex items-center gap-1.5">
					<Calendar class="w-4 h-4 text-blue-600 shrink-0" />
					<span class="text-xs font-bold text-slate-700">Periode:</span>
				</div>
				<div class="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-bold gap-0.5">
					<a
						href="?period=daily"
						class="px-3 py-1.5 rounded-md transition-all {data.period === 'daily'
							? 'bg-blue-600 text-white shadow-sm'
							: 'text-slate-600 hover:text-slate-900 hover:bg-white'}"
					>
						Hari Ini
					</a>
					<a
						href="?period=weekly"
						class="px-3 py-1.5 rounded-md transition-all {data.period === 'weekly'
							? 'bg-blue-600 text-white shadow-sm'
							: 'text-slate-600 hover:text-slate-900 hover:bg-white'}"
					>
						7 Hari
					</a>
					<a
						href="?period=monthly"
						class="px-3 py-1.5 rounded-md transition-all {data.period === 'monthly'
							? 'bg-blue-600 text-white shadow-sm'
							: 'text-slate-600 hover:text-slate-900 hover:bg-white'}"
					>
						1 Bulan
					</a>
					<a
						href="?period=all"
						class="px-3 py-1.5 rounded-md transition-all {data.period === 'all'
							? 'bg-blue-600 text-white shadow-sm'
							: 'text-slate-600 hover:text-slate-900 hover:bg-white'}"
					>
						Semua
					</a>
				</div>
				<button
					type="button"
					onclick={() => (showDatePicker = !showDatePicker)}
					class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer {data.period === 'custom'
						? 'bg-blue-600 text-white border-blue-600 shadow-sm'
						: 'bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-700'}"
				>
					<Calendar class="w-3.5 h-3.5" />
					{#if data.period === 'custom'}
						{getPeriodLabel('custom')}
					{:else}
						Pilih Tanggal
					{/if}
				</button>
			</div>

			<div class="text-xs text-slate-500 flex items-center gap-2 px-1 shrink-0">
				<span class="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
				<span>Menampilkan: <strong class="text-slate-700">{getPeriodLabel(data.period)}</strong></span>
			</div>
		</div>

		<!-- Custom Date Picker Panel -->
		{#if showDatePicker}
			<div class="flex flex-col sm:flex-row items-end gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-in fade-in slide-in-from-top-1 duration-150">
				<div class="flex-1 w-full sm:w-auto">
					<label for="dash-date-from" class="block text-[11px] font-bold text-slate-700 mb-1">Dari Tanggal:</label>
					<div class="relative cursor-pointer">
						<input
							id="dash-date-from"
							type="date"
							bind:value={customFrom}
							onclick={(e) => { try { e.currentTarget.showPicker() } catch(err){} }}
							onkeydown={(e) => e.preventDefault()}
							class="w-full pl-9 pr-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors"
						/>
						<Calendar class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
					</div>
				</div>
				<div class="flex-1 w-full sm:w-auto">
					<label for="dash-date-to" class="block text-[11px] font-bold text-slate-700 mb-1">Sampai Tanggal:</label>
					<div class="relative cursor-pointer">
						<input
							id="dash-date-to"
							type="date"
							bind:value={customTo}
							onclick={(e) => { try { e.currentTarget.showPicker() } catch(err){} }}
							onkeydown={(e) => e.preventDefault()}
							class="w-full pl-9 pr-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors"
						/>
						<Calendar class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
					</div>
				</div>
				<button
					type="button"
					onclick={applyCustomDate}
					class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
				>
					<ArrowRight class="w-3.5 h-3.5" /> Tampilkan Data
				</button>
			</div>
		{/if}
	</div>

	<!-- Error Message Alert -->
	{#if data?.error}
		<div class="p-3.5 rounded-lg text-xs font-semibold flex items-center gap-2 bg-red-50 border border-red-200 text-red-800">
			<AlertCircle class="w-4 h-4 text-red-600 shrink-0" />
			<span>{data.error}</span>
		</div>
	{/if}

	<!-- 2. 4 Kartu KPI Utama (Besar, Bold, Jelas & Bersih) -->
	<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<!-- 1. Omzet -->
		<div class="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
			<div class="absolute top-0 left-0 right-0 h-1 bg-blue-600"></div>
			<div>
				<div class="flex items-center justify-between text-slate-500 mb-2">
					<span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Omzet</span>
					<div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
						<DollarSign class="w-4 h-4" />
					</div>
				</div>
				<div class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
					{formatCurrency(data.totalRevenue)}
				</div>
			</div>
			<div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
				<span>Total dari <strong>{data.totalTransactions}</strong> transaksi</span>
				<span class="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded text-[11px]">Penjualan</span>
			</div>
		</div>

		<!-- 2. Modal Barang -->
		<div class="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
			<div class="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
			<div>
				<div class="flex items-center justify-between text-slate-500 mb-2">
					<span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Modal Barang</span>
					<div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
						<Package class="w-4 h-4" />
					</div>
				</div>
				<div class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
					{formatCurrency(data.totalCogs)}
				</div>
			</div>
			<div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
				<span>Uang modal buat stok</span>
				<span class="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded text-[11px]">HPP</span>
			</div>
		</div>

		<!-- 3. Keuntungan Bersih -->
		<div class="bg-white rounded-xl border border-emerald-200 p-4 sm:p-5 shadow-xs relative overflow-hidden flex flex-col justify-between bg-gradient-to-b from-emerald-50/20 to-white">
			<div class="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
			<div>
				<div class="flex items-center justify-between text-slate-500 mb-2">
					<span class="text-xs font-bold text-emerald-800 uppercase tracking-wider">Keuntungan Bersih</span>
					<div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
						<TrendingUp class="w-4 h-4" />
					</div>
				</div>
				<div class="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight font-mono">
					{formatCurrency(data.grossProfit)}
				</div>
			</div>
			<div class="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs">
				<span class="text-slate-600">Margin Keuntungan:</span>
				<span class="font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-mono">
					{data.grossProfitMargin}%
				</span>
			</div>
		</div>

		<!-- 4. Rata-rata Belanja -->
		<div class="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
			<div class="absolute top-0 left-0 right-0 h-1 bg-purple-600"></div>
			<div>
				<div class="flex items-center justify-between text-slate-500 mb-2">
					<span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Rata-rata Belanja</span>
					<div class="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
						<ShoppingBag class="w-4 h-4" />
					</div>
				</div>
				<div class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
					{formatCurrency(data.avgBasketSize)}
				</div>
			</div>
			<div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
				<span>Rata-rata per transaksi</span>
				<span class="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded text-[11px]">Per Struk</span>
			</div>
		</div>
	</section>

	<!-- 3. Penjualan Offline vs Online (Omnichannel) -->
	<section class="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs space-y-4">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
			<div>
				<div class="flex items-center gap-2">
					<h3 class="text-base sm:text-lg font-black text-slate-900">Penjualan Offline vs Online</h3>
					<span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
						<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
						Data Terkini
					</span>
				</div>
				<p class="text-xs text-slate-500 mt-0.5">Perbandingan omzet kasir toko fisik dan marketplace online Shopee</p>
			</div>

			{#if data.shopeeReadyToShip > 0}
				<a
					href="/admin/shopee"
					class="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto"
				>
					<Truck class="w-3.5 h-3.5 text-orange-600" />
					<span>{data.shopeeReadyToShip} Pesanan Shopee Perlu Dikirim</span>
					<ArrowRight class="w-3.5 h-3.5" />
				</a>
			{/if}
		</div>

		<!-- 2 Card Saluran Penjualan -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<!-- Toko Fisik (Kasir) -->
			<div class="p-4 rounded-xl bg-blue-50/50 border border-blue-200 flex flex-col justify-between">
				<div>
					<div class="flex items-center justify-between mb-1.5">
						<span class="text-xs font-bold text-blue-900 flex items-center gap-1.5">
							<Store class="w-4 h-4 text-blue-600" />
							Kasir Toko Fisik
						</span>
						<span class="text-xs font-black font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
							{data.channelBreakdown?.posPercent || 0}%
						</span>
					</div>
					<div class="text-2xl font-black text-slate-900 font-mono mt-2">
						{formatCurrency(data.posRevenue || 0)}
					</div>
				</div>
				<p class="text-xs text-slate-500 mt-3 pt-2.5 border-t border-blue-100 flex items-center justify-between">
					<span>{data.posCount || 0} transaksi di kasir</span>
					<span class="text-blue-700 font-bold">Penjualan Langsung</span>
				</p>
			</div>

			<!-- Marketplace Shopee -->
			<div class="p-4 rounded-xl bg-orange-50/50 border border-orange-200 flex flex-col justify-between">
				<div>
					<div class="flex items-center justify-between mb-1.5">
						<span class="text-xs font-bold text-orange-900 flex items-center gap-1.5">
							<ShoppingBag class="w-4 h-4 text-orange-600" />
							Shopee Marketplace
						</span>
						<span class="text-xs font-black font-mono bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
							{data.channelBreakdown?.shopeePercent || 0}%
						</span>
					</div>
					<div class="text-2xl font-black text-orange-700 font-mono mt-2">
						{formatCurrency(data.shopeeRevenue || 0)}
					</div>
				</div>
				<div class="text-xs text-slate-500 mt-3 pt-2.5 border-t border-orange-100 flex items-center justify-between">
					{#if (data.shopeeCount || 0) > 0}
						<span>{data.shopeeCount} pesanan online</span>
						<a href="/admin/shopee" class="text-orange-700 hover:underline font-bold flex items-center gap-1">
							Buka Pesanan &rarr;
						</a>
					{:else}
						<span class="text-orange-800 font-medium italic">Belum ada penjualan Shopee di periode ini</span>
						<a href="/admin/shopee" class="text-orange-700 hover:underline font-bold text-[11px]">
							Cek Integrasi &rarr;
						</a>
					{/if}
				</div>
			</div>
		</div>

		<!-- Progress Bar Tebal Kontras -->
		<div class="space-y-1.5 pt-1">
			<div class="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden flex p-0.5 border border-slate-200">
				<div
					class="bg-blue-600 h-full rounded-l-full transition-all duration-500"
					style="width: {data.channelBreakdown?.posPercent || 100}%"
					title="Kasir Toko: {data.channelBreakdown?.posPercent || 100}%"
				></div>
				<div
					class="bg-orange-500 h-full rounded-r-full transition-all duration-500"
					style="width: {data.channelBreakdown?.shopeePercent || 0}%"
					title="Shopee: {data.channelBreakdown?.shopeePercent || 0}%"
				></div>
			</div>
			<div class="flex justify-between text-xs text-slate-600 font-medium px-1">
				<span class="flex items-center gap-1.5">
					<span class="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
					Kasir Toko: <strong>{data.channelBreakdown?.posPercent || 0}%</strong>
				</span>
				<span class="flex items-center gap-1.5">
					<span class="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
					Shopee: <strong>{data.channelBreakdown?.shopeePercent || 0}%</strong>
				</span>
			</div>
		</div>
	</section>

	<!-- 4. Dua Kolom Grafik: Tren Penjualan Harian & Komposisi Pembayaran -->
	<section class="grid grid-cols-1 lg:grid-cols-2 gap-5">
		<!-- Tren Penjualan Harian -->
		<div class="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-100">
				<div>
					<h3 class="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
						<Activity class="w-4 h-4 text-blue-600" />
						Tren Penjualan Harian
					</h3>
					<p class="text-xs text-slate-500">Pergerakan omzet harian dari kasir toko dan online</p>
				</div>
				<div class="flex items-center gap-3 text-xs self-start sm:self-auto font-medium">
					<span class="flex items-center gap-1 text-slate-600">
						<span class="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
						Kasir Toko
					</span>
					<span class="flex items-center gap-1 text-slate-600">
						<span class="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
						Shopee
					</span>
				</div>
			</div>
			<div class="w-full overflow-hidden">
				<div bind:this={trendChartContainer} class="-ml-2 min-h-[300px]"></div>
			</div>
		</div>

		<!-- Komposisi Pembayaran -->
		<div class="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-100">
				<div>
					<h3 class="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
						<CreditCard class="w-4 h-4 text-purple-600" />
						Komposisi Pembayaran
					</h3>
					<p class="text-xs text-slate-500">Metode bayar yang paling sering dipakai pembeli</p>
				</div>
			</div>
			<div class="w-full overflow-hidden">
				<div bind:this={paymentChartContainer} class="min-h-[300px] flex items-center justify-center"></div>
			</div>
		</div>
	</section>

	<!-- 5. Dua Kolom: Top 5 Produk & Stok yang Perlu Diperhatikan -->
	<section class="grid grid-cols-1 lg:grid-cols-2 gap-5">
		<!-- Top 5 Produk Terlaris -->
		<div class="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
			<div class="flex items-center justify-between pb-2 border-b border-slate-100">
				<div>
					<h3 class="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
						<Award class="w-4 h-4 text-amber-500" />
						Top 5 Produk Terlaris
					</h3>
					<p class="text-xs text-slate-500">Produk yang paling banyak menghasilkan penjualan</p>
				</div>
				<span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
					Paling Dicari
				</span>
			</div>

			<div class="space-y-2.5">
				{#each (data.topProducts || []).slice(0, 5) as p, idx}
					<div class="p-3 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100 flex items-center justify-between gap-3">
						<div class="flex items-center gap-3 min-w-0">
							<!-- Ranking badge besar -->
							<div class="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 {idx === 0 ? 'bg-amber-400 text-amber-950 shadow-xs' : idx === 1 ? 'bg-slate-300 text-slate-800' : idx === 2 ? 'bg-amber-700/20 text-amber-900' : 'bg-slate-200 text-slate-700'}">
								#{idx + 1}
							</div>
							<div class="min-w-0">
								<p class="text-xs sm:text-sm font-bold text-slate-900 truncate">{p.product_name || p.name || 'Produk'}</p>
								<p class="text-xs text-slate-500 mt-0.5">
									Terjual <strong>{p.qty_sold || 0} unit</strong> • Omzet {formatCurrency(p.total_sales)}
								</p>
							</div>
						</div>
						<div class="text-right shrink-0">
							<span class="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
								{formatCurrency(p.total_sales)}
							</span>
						</div>
					</div>
				{:else}
					<div class="py-8 text-center text-slate-400 text-xs">
						Belum ada transaksi penjualan pada periode ini.
					</div>
				{/each}
			</div>
		</div>

		<!-- Stok yang Perlu Diperhatikan (Slow Moving) -->
		<div class="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
			<div class="flex items-center justify-between pb-2 border-b border-slate-100">
				<div>
					<h3 class="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
						<AlertTriangle class="w-4 h-4 text-amber-500" />
						Stok yang Perlu Diperhatikan
					</h3>
					<p class="text-xs text-slate-500">Stok banyak di gudang tapi belum laku di periode ini</p>
				</div>
				<span class="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
					Perlu Aksi
				</span>
			</div>

			<div class="space-y-2.5">
				{#each (data.slowMovingProducts || []).slice(0, 5) as p}
					<div class="p-3 rounded-lg bg-amber-50/50 hover:bg-amber-50 transition-colors border border-amber-200/60 flex items-center justify-between gap-3">
						<div class="min-w-0">
							<p class="text-xs sm:text-sm font-bold text-slate-900 truncate">{p.product_name || p.name || 'Produk'}</p>
							<div class="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
								<span>Harga: {formatCurrency(p.price || 0)}</span>
								<span>•</span>
								<span class="text-amber-800 font-semibold">Saran: Buat promo bundling</span>
							</div>
						</div>
						<div class="text-right shrink-0 flex flex-col items-end gap-1">
							<span class="px-2 py-0.5 rounded font-mono font-bold text-xs bg-amber-100 text-amber-900 border border-amber-300">
								{p.stock} pcs tertahan
							</span>
							<a
								href="/admin/inventory"
								class="text-[11px] text-blue-600 hover:text-blue-800 hover:underline font-bold flex items-center gap-0.5"
							>
								Lihat di Inventori &rarr;
							</a>
						</div>
					</div>
				{:else}
					<div class="py-8 text-center text-slate-400 text-xs">
						Semua stok produk bergerak aktif pada periode ini.
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- 6. Tabel Transaksi Terkini -->
	<section class="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
			<div>
				<h3 class="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
					<FileSpreadsheet class="w-4 h-4 text-blue-600" />
					Transaksi Terkini
				</h3>
				<p class="text-xs text-slate-500">Daftar transaksi penjualan terbaru beserta modal dan keuntungan bersihnya</p>
			</div>

			<!-- Filter Cepat Tab: Semua | Kasir Toko | Shopee -->
			<div class="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-bold gap-1 self-start sm:self-auto">
				<button
					onclick={() => (txFilter = 'ALL')}
					class="px-3 py-1 rounded-md transition-all cursor-pointer {txFilter === 'ALL'
						? 'bg-white text-slate-900 shadow-xs'
						: 'text-slate-600 hover:text-slate-900'}"
				>
					Semua ({data.recentTransactions.length})
				</button>
				<button
					onclick={() => (txFilter = 'POS')}
					class="px-3 py-1 rounded-md transition-all cursor-pointer {txFilter === 'POS'
						? 'bg-white text-blue-700 shadow-xs'
						: 'text-slate-600 hover:text-slate-900'}"
				>
					Kasir Toko ({data.recentTransactions.filter((t: any) => t.channel !== 'SHOPEE').length})
				</button>
				<button
					onclick={() => (txFilter = 'SHOPEE')}
					class="px-3 py-1 rounded-md transition-all cursor-pointer {txFilter === 'SHOPEE'
						? 'bg-white text-orange-700 shadow-xs'
						: 'text-slate-600 hover:text-slate-900'}"
				>
					Shopee ({data.recentTransactions.filter((t: any) => t.channel === 'SHOPEE').length})
				</button>
			</div>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs border-collapse">
				<thead>
					<tr class="text-slate-500 border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold">
						<th class="py-2.5 px-3">WAKTU</th>
						<th class="py-2.5 px-3">NO. STRUK / PESANAN</th>
						<th class="py-2.5 px-3 text-center">SALURAN</th>
						<th class="py-2.5 px-3 text-center">METODE BAYAR</th>
						<th class="py-2.5 px-3">KASIR</th>
						<th class="py-2.5 px-3 text-right">TOTAL (OMZET)</th>
						<th class="py-2.5 px-3 text-right">MODAL BARANG</th>
						<th class="py-2.5 px-3 text-right text-emerald-700 font-bold">KEUNTUNGAN</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each displayedTransactions as tx}
						<tr class="even:bg-slate-50/50 hover:bg-blue-50/40 transition-colors">
							<td class="py-2.5 px-3 text-slate-600 text-[11px] font-mono">
								{new Date(tx.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })} {new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
							</td>
							<td class="py-2.5 px-3 font-bold font-mono text-slate-900">{tx.receipt_number}</td>
							<td class="py-2.5 px-3 text-center">
								<span class="px-2 py-0.5 rounded text-[10px] font-bold {tx.channel === 'SHOPEE' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}">
									{tx.channel === 'SHOPEE' ? 'Shopee' : 'Kasir Toko'}
								</span>
							</td>
							<td class="py-2.5 px-3 text-center text-slate-600">{tx.payment_method}</td>
							<td class="py-2.5 px-3 text-slate-600 truncate max-w-[120px]">{tx.cashier_name}</td>
							<td class="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">{formatCurrency(tx.total_amount)}</td>
							<td class="py-2.5 px-3 text-right text-slate-500 font-mono">{formatCurrency(tx.cogs || 0)}</td>
							<td class="py-2.5 px-3 text-right font-bold text-emerald-700 font-mono">{formatCurrency(tx.gross_profit || 0)}</td>
						</tr>
					{:else}
						<tr>
							<td colspan="8" class="py-8 text-center text-slate-400">
								Tidak ada transaksi yang cocok pada filter ini.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if filteredTransactions.length > 8}
			<div class="text-center pt-2 border-t border-slate-100">
				<button
					onclick={() => (showAllTransactions = !showAllTransactions)}
					class="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline py-1 px-3 rounded cursor-pointer"
				>
					{showAllTransactions ? 'Tampilkan Lebih Sedikit' : `Lihat Semua (${filteredTransactions.length} Transaksi)`}
				</button>
			</div>
		{/if}
	</section>
</div>

<!-- Modal Pratinjau Dokumen Laporan Resmi A4 (Siap Cetak / Simpan PDF) -->
{#if isPdfModalOpen}
	<div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 overflow-y-auto flex items-start justify-center p-2 sm:p-6 print:p-0 print:bg-white print:static">
		<div class="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-300 print:border-none print:shadow-none print:max-w-none print:w-full my-4 print:my-0">
			
			<!-- Modal Floating Control Toolbar (Sembunyi saat dicetak) -->
			<div class="p-3.5 sm:p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 print:hidden sticky top-0 z-10 shadow-md">
				<div class="flex items-center gap-2.5">
					<div class="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
						<FileText class="w-4 h-4" />
					</div>
					<div>
						<h3 class="font-bold text-xs sm:text-sm">Dokumen Laporan Rekapitulasi Resmi (A4)</h3>
						<p class="text-[10px] sm:text-[11px] text-slate-400 font-mono">Format rapi siap cetak langsung atau simpan sebagai PDF</p>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<button
						onclick={exportToExcel}
						class="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
					>
						<FileSpreadsheet class="w-3.5 h-3.5" />
						<span class="hidden sm:inline">Unduh Excel</span>
					</button>

					<button
						onclick={() => window.print()}
						class="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
					>
						<Printer class="w-3.5 h-3.5" />
						<span>Cetak / Simpan PDF</span>
					</button>

					<button
						onclick={() => (isPdfModalOpen = false)}
						class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
						aria-label="Tutup"
					>
						<X class="w-5 h-5" />
					</button>
				</div>
			</div>

			<!-- Lembar Dokumen Resmi Cetak (Official Printable Sheet) -->
			<div id="official-printable-report" class="p-6 sm:p-10 bg-white text-slate-900 space-y-6 text-xs print:p-2">
				<!-- Kop Surat Toko Resmi -->
				<div class="border-b-4 border-double border-slate-900 pb-4 flex items-center justify-between gap-4">
					<div class="flex items-center gap-4">
						<img src="/logo.png" alt="Logo Toko Aneka Rasa 99" class="w-16 h-16 rounded-full object-cover border-2 border-slate-300 shrink-0" />
						<div>
							<h1 class="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">TOKO ANEKA RASA 99</h1>
							<p class="text-xs font-bold text-slate-700">Pusat Oleh-Oleh Khas Bangka & Minimarket Modern</p>
							<p class="text-[11px] text-slate-500 font-sans mt-0.5">
								Jl. Jend. Sudirman No. 99, Pangkalpinang, Bangka Belitung • Telp: (0717) 432199 / 0812-3456-7890
							</p>
						</div>
					</div>
					<div class="text-right font-mono text-[10px] text-slate-500 hidden sm:block">
						<span class="block font-bold text-slate-800 text-xs">DOKUMEN RESMI</span>
						<span>No: RPT-AR99-{new Date().toISOString().slice(0, 10).replace(/-/g, '')}</span>
					</div>
				</div>

				<!-- Judul & Metadata Laporan -->
				<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
					<div>
						<h2 class="text-sm font-black text-slate-900 uppercase tracking-wide">
							LAPORAN REKAPITULASI PENJUALAN & LABA BERSIH
						</h2>
						<p class="text-xs text-slate-600 mt-0.5">
							Periode Laporan: <strong class="text-blue-800 font-bold">{getPeriodLabel(data.period)}</strong>
						</p>
					</div>
					<div class="text-left sm:text-right font-mono text-[11px] text-slate-600">
						<div>Waktu Cetak: <strong>{new Date().toLocaleString('id-ID')} WIB</strong></div>
						<div>Penanggung Jawab: <strong>{data.user?.full_name || 'Hendra Wijaya (Owner)'}</strong></div>
					</div>
				</div>

				<!-- 1. Ringkasan Eksekutif KPI Finansial -->
				<div>
					<h3 class="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
						1. RINGKASAN FINANSIAL & KEUNTUNGAN TOKO
					</h3>
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
						<div class="p-3 bg-slate-50 border border-slate-300 rounded-lg">
							<span class="text-[10px] font-bold text-slate-500 uppercase block">Total Omset Kotor</span>
							<span class="text-base font-black font-mono text-slate-900">{formatCurrency(data.totalRevenue)}</span>
							<span class="text-[10px] text-slate-500 block mt-0.5">{data.totalTransactions} Total Transaksi</span>
						</div>

						<div class="p-3 bg-slate-50 border border-slate-300 rounded-lg">
							<span class="text-[10px] font-bold text-slate-500 uppercase block">Total Modal Pokok (HPP)</span>
							<span class="text-base font-black font-mono text-slate-800">{formatCurrency(data.totalCogs)}</span>
							<span class="text-[10px] text-slate-500 block mt-0.5">Modal Belanja Supplier</span>
						</div>

						<div class="p-3 bg-emerald-50 border border-emerald-300 rounded-lg">
							<span class="text-[10px] font-bold text-emerald-800 uppercase block">Laba Bersih Kotor</span>
							<span class="text-base font-black font-mono text-emerald-700">{formatCurrency(data.grossProfit)}</span>
							<span class="text-[10px] font-bold text-emerald-800 block mt-0.5">Cuan Bersih Penjualan</span>
						</div>

						<div class="p-3 bg-blue-50 border border-blue-300 rounded-lg">
							<span class="text-[10px] font-bold text-blue-800 uppercase block">Gross Profit Margin (GPM)</span>
							<span class="text-base font-black font-mono text-blue-700">{data.grossProfitMargin}%</span>
							<span class="text-[10px] text-blue-800 block mt-0.5">Basket: {formatCurrency(data.avgBasketSize)}</span>
						</div>
					</div>
				</div>

				<!-- 2. Komparasi Saluran Penjualan Omnichannel -->
				<div>
					<h3 class="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
						2. KONTRIBUSI SALURAN PENJUALAN (OMNICHANNEL)
					</h3>
					<table class="w-full border-collapse border border-slate-300 text-xs">
						<thead>
							<tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
								<th class="p-2 text-left border-r border-slate-300">Saluran Penjualan</th>
								<th class="p-2 text-center border-r border-slate-300">Jumlah Transaksi</th>
								<th class="p-2 text-right border-r border-slate-300">Total Omset (Rp)</th>
								<th class="p-2 text-center">Persentase Kontribusi</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-slate-200">
							<tr>
								<td class="p-2 font-bold text-slate-900 border-r border-slate-300">Toko Fisik Offline (Kasir POS)</td>
								<td class="p-2 text-center border-r border-slate-300">{data.posCount} Struk</td>
								<td class="p-2 text-right font-mono font-bold text-slate-900 border-r border-slate-300">{formatCurrency(data.posRevenue)}</td>
								<td class="p-2 text-center font-bold text-blue-700">{data.channelBreakdown.posPercent}%</td>
							</tr>
							<tr>
								<td class="p-2 font-bold text-orange-800 border-r border-slate-300">Marketplace Online (Shopee)</td>
								<td class="p-2 text-center border-r border-slate-300">{data.shopeeCount} Pesanan</td>
								<td class="p-2 text-right font-mono font-bold text-orange-700 border-r border-slate-300">{formatCurrency(data.shopeeRevenue)}</td>
								<td class="p-2 text-center font-bold text-orange-700">{data.channelBreakdown.shopeePercent}%</td>
							</tr>
							<tr class="bg-slate-100 font-black">
								<td class="p-2 border-r border-slate-300">TOTAL GABUNGAN</td>
								<td class="p-2 text-center border-r border-slate-300">{data.totalTransactions} Transaksi</td>
								<td class="p-2 text-right font-mono border-r border-slate-300">{formatCurrency(data.totalRevenue)}</td>
								<td class="p-2 text-center">100%</td>
							</tr>
						</tbody>
					</table>
				</div>

				<!-- 3. Rincian Daftar Transaksi -->
				<div>
					<h3 class="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
						3. RINCIAN DAFTAR TRANSAKSI
					</h3>
					<div class="overflow-x-auto">
						<table class="w-full border-collapse border border-slate-300 text-[11px]">
							<thead>
								<tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
									<th class="p-1.5 text-center border-r border-slate-300 w-8">No</th>
									<th class="p-1.5 text-left border-r border-slate-300">Waktu</th>
									<th class="p-1.5 text-left border-r border-slate-300">No. Struk / Ref</th>
									<th class="p-1.5 text-center border-r border-slate-300">Saluran</th>
									<th class="p-1.5 text-center border-r border-slate-300">Metode</th>
									<th class="p-1.5 text-center border-r border-slate-300">Kasir</th>
									<th class="p-1.5 text-right border-r border-slate-300">Omset (Rp)</th>
									<th class="p-1.5 text-right border-r border-slate-300">HPP (Rp)</th>
									<th class="p-1.5 text-right">Laba (Rp)</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-200 font-mono">
								{#each data.recentTransactions as tx, idx}
									<tr class="hover:bg-slate-50">
										<td class="p-1.5 text-center text-slate-500 border-r border-slate-200">{idx + 1}</td>
										<td class="p-1.5 text-slate-700 font-sans border-r border-slate-200">
											{new Date(tx.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })} {new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
										</td>
										<td class="p-1.5 font-bold text-slate-900 border-r border-slate-200">{tx.receipt_number}</td>
										<td class="p-1.5 text-center font-sans text-[10px] border-r border-slate-200">
											<span class="px-1.5 py-0.2 rounded font-bold {tx.channel === 'SHOPEE' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}">
												{tx.channel === 'SHOPEE' ? 'Shopee' : 'POS'}
											</span>
										</td>
										<td class="p-1.5 text-center font-sans text-slate-600 border-r border-slate-200">{tx.payment_method}</td>
										<td class="p-1.5 text-center font-sans text-slate-600 border-r border-slate-200 truncate max-w-[90px]">{tx.cashier_name.split(' ')[0]}</td>
										<td class="p-1.5 text-right text-slate-900 font-bold border-r border-slate-200">{Number(tx.total_amount).toLocaleString('id-ID')}</td>
										<td class="p-1.5 text-right text-slate-500 border-r border-slate-200">{Number(tx.cogs || 0).toLocaleString('id-ID')}</td>
										<td class="p-1.5 text-right text-emerald-700 font-bold">{Number(tx.gross_profit || 0).toLocaleString('id-ID')}</td>
									</tr>
								{/each}
								<tr class="bg-slate-100 font-black border-t-2 border-slate-400 text-xs">
									<td colspan="6" class="p-2 text-right font-sans border-r border-slate-300">TOTAL KESELURUHAN:</td>
									<td class="p-2 text-right text-slate-950 border-r border-slate-300">{Number(data.totalRevenue).toLocaleString('id-ID')}</td>
									<td class="p-2 text-right text-slate-700 border-r border-slate-300">{Number(data.totalCogs).toLocaleString('id-ID')}</td>
									<td class="p-2 text-right text-emerald-700">{Number(data.grossProfit).toLocaleString('id-ID')}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<!-- 4. Riwayat Tutup Kasir (Z-Report Shift) -->
				<div class="mt-6 mb-8">
					<h3 class="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
						4. RIWAYAT TUTUP KASIR (Z-REPORT SHIFT)
					</h3>
					{#if data.recentShifts && data.recentShifts.length > 0}
						<div class="overflow-x-auto">
							<table class="w-full border-collapse border border-slate-300 text-[11px]">
								<thead>
									<tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
										<th class="p-1.5 text-center border-r border-slate-300 w-8">No</th>
										<th class="p-1.5 text-left border-r border-slate-300">Tutup Shift</th>
										<th class="p-1.5 text-left border-r border-slate-300">Kasir</th>
										<th class="p-1.5 text-right border-r border-slate-300">Penjualan Kasir</th>
										<th class="p-1.5 text-right border-r border-slate-300">Pengeluaran</th>
										<th class="p-1.5 text-right border-r border-slate-300">Wajib Laci</th>
										<th class="p-1.5 text-right border-r border-slate-300">Fisik Dihitung</th>
										<th class="p-1.5 text-right">Selisih Kas</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-slate-200 font-mono">
									{#each data.recentShifts as shift, idx}
										<tr class="hover:bg-slate-50">
											<td class="p-1.5 text-center text-slate-500 border-r border-slate-200">{idx + 1}</td>
											<td class="p-1.5 text-slate-700 font-sans border-r border-slate-200">
												{new Date(shift.closed_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })} {new Date(shift.closed_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
											</td>
											<td class="p-1.5 text-left font-sans text-slate-600 border-r border-slate-200 truncate max-w-[90px]">{shift.cashier_name.split(' ')[0]}</td>
											<td class="p-1.5 text-right text-slate-900 border-r border-slate-200">{Number(shift.total_cash_sales).toLocaleString('id-ID')}</td>
											<td class="p-1.5 text-right text-red-700 border-r border-slate-200">{Number(shift.total_expenses).toLocaleString('id-ID')}</td>
											<td class="p-1.5 text-right text-blue-800 font-bold border-r border-slate-200">{Number(shift.expected_drawer_cash).toLocaleString('id-ID')}</td>
											<td class="p-1.5 text-right text-slate-900 font-bold border-r border-slate-200">
												{#if shift.actual_physical_cash !== null}
													{Number(shift.actual_physical_cash).toLocaleString('id-ID')}
												{:else}
													<span class="text-slate-400 italic text-[10px]">Belum Dihitung</span>
												{/if}
											</td>
											<td class="p-1.5 text-right font-bold {Number(shift.cash_difference) < 0 ? 'text-red-600' : (Number(shift.cash_difference) > 0 ? 'text-emerald-600' : 'text-slate-500')}">
												{#if shift.cash_difference !== null}
													{Number(shift.cash_difference) > 0 ? '+' : ''}{Number(shift.cash_difference).toLocaleString('id-ID')}
												{:else}
													-
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<div class="p-4 text-center border border-slate-300 bg-slate-50 rounded-lg text-slate-500 italic text-xs">
							Belum ada riwayat tutup kasir yang diarsipkan.
						</div>
					{/if}
				</div>

				<!-- Lembar Pengesahan Resmi -->
				<div class="pt-6 border-t border-slate-200 flex justify-end">
					<div class="text-center font-sans w-56 space-y-1">
						<p class="text-[11px] text-slate-500">Pangkalpinang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
						<p class="text-xs font-bold text-slate-800">Mengetahui & Menyetujui,</p>
						<p class="text-[11px] text-slate-600 font-semibold">Pemilik Toko (Owner)</p>
						<div class="h-14 flex items-center justify-center">
							<span class="text-[10px] text-slate-300 italic border border-dashed border-slate-300 px-3 py-1 rounded">
								(Tanda Tangan & Cap Toko)
							</span>
						</div>
						<p class="text-xs font-black text-slate-900 border-t border-slate-900 pt-1">
							{data.user?.full_name || 'Hendra Wijaya (Owner)'}
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	@media print {
		:global(body) {
			background: white !important;
			color: black !important;
		}
		:global(header), :global(aside), :global(nav), :global(.print\:hidden) {
			display: none !important;
		}
		#official-printable-report {
			padding: 0 !important;
			margin: 0 !important;
			width: 100% !important;
			max-width: 100% !important;
		}
	}
</style>
