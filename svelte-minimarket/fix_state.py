import re
file_path = 'src/routes/admin/dashboard/+page.svelte'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

state_injection = """	let showAllTransactions = $state(false);
	
	let metricTab = $state<'all' | 'pos' | 'shopee'>('all');
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
	);"""
content = content.replace('	let showAllTransactions = $state(false);', state_injection)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done injecting state')
