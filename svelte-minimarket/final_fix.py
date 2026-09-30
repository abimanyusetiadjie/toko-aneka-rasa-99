import re
file_path = 'src/routes/admin/dashboard/+page.server.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I will find 'Promise.all([' and ']);' right before 'const posData'
start_idx = content.find('Promise.all([')
end_idx = content.find(']);', start_idx) + 3

correct_queries = r"""Promise.all([
			// 1. POS Offline Revenue & Count
			query(`
				SELECT 
					COALESCE(SUM(total_amount), 0)::float as pos_revenue,
					COUNT(id)::int as pos_count
				FROM transactions
				WHERE status = 'COMPLETED' AND (channel = 'POS' OR channel IS NULL) ${rawDateFilter}
			`),
			// 2. Shopee Marketplace Revenue & Count
			query(`
				SELECT 
					COALESCE(SUM(total_amount), 0)::float as shopee_revenue,
					COUNT(id)::int as shopee_count,
					COUNT(CASE WHEN order_status = 'READY_TO_SHIP' THEN 1 END)::int as ready_to_ship_count
				FROM shopee_orders
				WHERE order_status != 'CANCELLED' ${shopeeFilterSql}
			`),
			// 3. POS COGS (Cost of Goods Sold)
			query(`
				SELECT 
					COALESCE(SUM(td.qty * td.conversion_factor * COALESCE(td.cost_price_snapshot, p.cost_price, 0)), 0)::float as total_cogs
				FROM transaction_details td
				JOIN products p ON td.product_id = p.id
				JOIN transactions t ON td.transaction_id = t.id
				WHERE t.status = 'COMPLETED' ${txFilterSql}
			`),
			// 4. Shopee COGS (Cost of Goods Sold via stock movements)
			query(`
				SELECT COALESCE(SUM(ABS(qty_base_change) * COALESCE(unit_cost_snapshot, 0)), 0)::float as shopee_cogs
				FROM stock_movements 
				WHERE reference_type = 'SHOPEE_ORDER' ${rawDateFilter}
			`),
			// 5. Rincian Transaksi untuk Live Ledger & Ekspor Laporan
			query(`
				SELECT 
					t.id,
					t.receipt_number,
					t.created_at,
					COALESCE(t.channel, 'POS') as channel,
					COALESCE(t.payment_method, 'CASH') as payment_method,
					t.total_amount,
					u.name as cashier_name,
					COALESCE(SUM(td.qty * td.conversion_factor * COALESCE(td.cost_price_snapshot, p.cost_price, 0)), 0)::float as cogs
				FROM transactions t
				LEFT JOIN users u ON t.cashier_id = u.id
				LEFT JOIN transaction_details td ON td.transaction_id = t.id
				LEFT JOIN products p ON td.product_id = p.id
				WHERE t.status = 'COMPLETED' ${txFilterSql}
				GROUP BY t.id, u.name
				ORDER BY t.created_at DESC
				LIMIT 50
			`),
			// 6. Top 5 Best Sellers
			query(`
				SELECT 
					p.name as product_name,
					c.name as category_name,
					COALESCE(SUM(td.qty), 0)::int as qty_sold,
					COALESCE(SUM(td.subtotal), 0)::float as total_sales
				FROM transaction_details td
				JOIN products p ON td.product_id = p.id
				JOIN categories c ON p.category_id = c.id
				JOIN transactions t ON td.transaction_id = t.id
				WHERE t.status = 'COMPLETED' ${txFilterSql}
				GROUP BY p.name, c.name
				ORDER BY total_sales DESC
				LIMIT 5
			`),
			// 7. Slow Moving / Dead Stock Alert (Tepat 5 produk)
			query(`
				SELECT 
					p.name as product_name,
					p.stock,
					MAX(t.created_at) as last_sold_at,
					COALESCE(SUM(td.qty), 0)::int as qty_sold_period
				FROM products p
				LEFT JOIN transaction_details td ON p.id = td.product_id
				LEFT JOIN transactions t ON td.transaction_id = t.id AND t.status = 'COMPLETED' ${txFilterSql}
				WHERE p.is_active = true
				GROUP BY p.id, p.name, p.stock
				ORDER BY qty_sold_period ASC, p.stock DESC
				LIMIT 5
			`),
			// 8. Trend Penjualan Harian POS Offline
			query(`
				SELECT 
					DATE_TRUNC('day', created_at)::date as date_str,
					COALESCE(SUM(total_amount), 0)::float as revenue
				FROM transactions
				WHERE status = 'COMPLETED' AND (channel = 'POS' OR channel IS NULL) ${rawDateFilter}
				GROUP BY date_str
				ORDER BY date_str ASC
			`),
			// 9. Trend Penjualan Harian Shopee Online
			query(`
				SELECT 
					DATE_TRUNC('day', created_at)::date as date_str,
					COALESCE(SUM(total_amount), 0)::float as revenue
				FROM shopee_orders
				WHERE order_status != 'CANCELLED' ${shopeeFilterSql}
				GROUP BY date_str
				ORDER BY date_str ASC
			`),
			// 10. Komposisi Metode Pembayaran (Cash, QRIS, dsb)
			query(`
				SELECT 
					COALESCE(t.payment_method, 'CASH') as method,
					COALESCE(SUM(t.total_amount), 0)::float as total_amount,
					COUNT(t.id)::int as tx_count
				FROM transactions t
				WHERE t.status = 'COMPLETED' ${txFilterSql}
				GROUP BY COALESCE(t.payment_method, 'CASH')
			`)
		]);"""

new_content = content[:start_idx] + correct_queries + content[end_idx:]
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
