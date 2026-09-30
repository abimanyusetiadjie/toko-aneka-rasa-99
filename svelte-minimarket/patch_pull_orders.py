import re
file_path = 'src/routes/admin/shopee/+page.server.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacement = r"""			let newOrdersCount = 0;
			const { createShopeeOrder } = await import('$lib/server/shopee-service');
			
			// Upsert to DB
			for (const o of detailRes.order_list) {
				// Cek apakah sudah ada
				const existing = await query(`SELECT id FROM shopee_orders WHERE order_sn = $1`, [o.order_sn]);
				if (existing.length === 0) {
					const itemList = o.item_list || [];
					const items = itemList.map((i: any) => ({
						sku: i.item_sku || '',
						name: i.item_name || '',
						qty: i.model_quantity_purchased || 0,
						price: i.model_discounted_price || 0
					}));
					
					await createShopeeOrder({
						order_sn: o.order_sn,
						buyer_username: o.buyer_username || o.buyer_user_id || 'shopee_user',
						shipping_carrier: o.shipping_carrier || 'Reguler',
						tracking_number: o.tracking_no || '',
						total_amount: o.total_amount || 0,
						items: items
					});
					
					newOrdersCount++;
				}
			}"""

content = re.sub(
    r"""			let newOrdersCount = 0;\s*// Upsert to DB\s*for \(const o of detailRes\.order_list\) \{.*newOrdersCount\+\+;\s*\}\s*\}""",
    replacement,
    content,
    count=1,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done patching pullOrders')
