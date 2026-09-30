import re
file_path = 'src/routes/admin/dashboard/+page.svelte'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

state_injection = """	let metricTab = $state<'all' | 'pos' | 'shopee'>('all');
	let m = $derived(
		metricTab === 'pos' ? data.posMetrics :
		metricTab === 'shopee' ? data.shopeeMetrics :
		{
			revenue: data.totalRevenue,
			count: data.totalTransactions,
			cogs: data.totalCogs,
			profit: data.grossProfit,
			margin: data.grossProfitMargin,
			avg: data.avgBasketSize
		}
	);
	
	let trendChartContainer: HTMLDivElement;"""
content = content.replace('	let trendChartContainer: HTMLDivElement;', state_injection)

# Add tabs UI
tabs_ui = """	<!-- Segmented Control untuk Filter KPI -->
	<div class="flex justify-center mb-6">
		<div class="inline-flex bg-slate-100/80 rounded-xl p-1 border border-slate-200 shadow-inner">
			<button 
				onclick={() => metricTab = 'all'}
				class="flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all {metricTab === 'all' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'}"
			>
				🌟 Semua (Gabungan)
			</button>
			<button 
				onclick={() => metricTab = 'pos'}
				class="flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all {metricTab === 'pos' ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'}"
			>
				🏪 Kasir Fisik
			</button>
			<button 
				onclick={() => metricTab = 'shopee'}
				class="flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all {metricTab === 'shopee' ? 'bg-white text-orange-600 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'}"
			>
				🛒 Shopee Online
			</button>
		</div>
	</div>

	<!-- 2. 4 Kartu KPI Utama (Besar, Bold, Jelas & Bersih) -->"""
content = content.replace('	<!-- 2. 4 Kartu KPI Utama (Besar, Bold, Jelas & Bersih) -->', tabs_ui)

# Replace data variables in the cards
content = content.replace('{formatCurrency(data.totalRevenue)}', '{formatCurrency(m.revenue)}')
content = content.replace('{data.totalTransactions}', '{m.count}')
content = content.replace('Total dari <strong>{m.count}</strong> transaksi', 'Total dari <strong>{m.count}</strong> {metricTab === \'shopee\' ? \'pesanan\' : \'transaksi\'}')
content = content.replace('<span class="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded text-[11px]">Penjualan</span>', '<span class="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded text-[11px]">{metricTab === \'all\' ? \'Gabungan\' : (metricTab === \'pos\' ? \'Kasir\' : \'Shopee\')}</span>')

content = content.replace('{formatCurrency(data.totalCogs)}', '{formatCurrency(m.cogs)}')
content = content.replace('{formatCurrency(data.grossProfit)}', '{formatCurrency(m.profit)}')
content = content.replace('{data.grossProfitMargin}', '{m.margin}')
content = content.replace('{formatCurrency(data.avgBasketSize)}', '{formatCurrency(m.avg)}')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done patching UI')
