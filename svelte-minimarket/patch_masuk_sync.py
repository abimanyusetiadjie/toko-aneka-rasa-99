import re
file_path = 'src/routes/admin/gudang/masuk/+page.server.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'syncShopeeStock' not in content:
    content = content.replace("import { broadcastRealtimeEvent } from '$lib/server/realtime-hub';", "import { broadcastRealtimeEvent } from '$lib/server/realtime-hub';\nimport { syncShopeeStock } from '$lib/server/shopee-service';")

replacement = r"""			await query(
				`INSERT INTO stock_movements (
					id, store_id, product_id, reference_type, qty_base_change, balance_after, unit_cost_snapshot, notes
				) VALUES ($1, '11111111-1111-1111-1111-111111111111', $2, 'RESTOCK', $3, $4, $5, $6)`,
				[crypto.randomUUID(), product_id, qty, newBalance, unitCost, movementNote]
			);

			syncShopeeStock([{ product_id, newStock: newBalance }]).catch(e => console.error('[Shopee Sync Masuk Error]', e));

			broadcastRealtimeEvent({"""

content = re.sub(
    r"			await query\(\s*`INSERT INTO stock_movements \(\s*id, store_id, product_id, reference_type, qty_base_change, balance_after, unit_cost_snapshot, notes\s*\) VALUES \(\$1, '11111111-1111-1111-1111-111111111111', \$2, 'RESTOCK', \$3, \$4, \$5, \$6\)`,\s*\[crypto\.randomUUID\(\), product_id, qty, newBalance, unitCost, movementNote\]\s*\);\s*broadcastRealtimeEvent\(\{",
    replacement,
    content,
    count=1,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done patching gudang masuk')
