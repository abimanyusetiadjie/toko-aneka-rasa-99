import re
file_path = 'src/routes/api/pos/transactions/+server.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacement = r"""				try {
					broadcastRealtimeEvent({
						type: 'STOCK_CHANGED',
						data: {
							items: preparedDetails.map(d => ({
								productId: d.productId,
								qty: d.qty,
								baseQty: d.baseQty,
								newBalance: d.currentStock - d.baseQty
							})),
							timestamp: new Date().toISOString(),
							message: `Penjualan Kasir No: ${receiptNumber}`
						}
					});
					
					// SHOOPEE SYNC (Realtime POS Postgres)
					syncShopeeStock(preparedDetails.map(d => ({
						product_id: d.productId,
						newStock: Math.max(0, d.currentStock - d.baseQty)
					}))).catch(e => console.error('[Shopee POS Sync Postgres Error]', e));
				} catch {}"""

content = re.sub(
    r"				try \{\s*broadcastRealtimeEvent\(\{\s*type: 'STOCK_CHANGED'.*?\}\);\s*\} catch \{\}",
    replacement,
    content,
    count=1,
    flags=re.DOTALL
)

replacement2 = r"""	// Broadcast realtime events
	try {
		broadcastRealtimeEvent({
			type: 'STOCK_CHANGED',
			data: {
				items: preparedDetails.map(d => ({
					productId: d.productId,
					qty: d.qty,
					baseQty: d.baseQty,
					newBalance: Math.max(0, d.currentStock - d.baseQty)
				})),
				timestamp: new Date().toISOString(),
				message: `Penjualan Kasir No: ${receiptNumber}`
			}
		});
		
		// SHOPEE SYNC (Realtime POS In-Memory)
		syncShopeeStock(preparedDetails.map(d => ({
			product_id: d.productId,
			newStock: Math.max(0, d.currentStock - d.baseQty)
		}))).catch(e => console.error('[Shopee POS Sync In-Memory Error]', e));
	} catch {}"""

content = re.sub(
    r"	// Broadcast realtime events\s*try \{\s*broadcastRealtimeEvent\(\{\s*type: 'STOCK_CHANGED'.*?\}\);\s*\} catch \{\}",
    replacement2,
    content,
    count=1,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done patching POS transactions')
