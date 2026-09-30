import re
file_path = 'src/routes/admin/dashboard/+page.server.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Rincian Transaksi query
query_5_old = """					COALESCE(t.payment_method, 'CASH') as payment_method,
					t.total_amount,
					u.full_name as cashier_name,
					COALESCE(SUM(td.qty * td.conversion_factor * COALESCE(td.cost_price_snapshot, p.cost_price, 0)), 0)::float as cogs"""
query_5_new = """					COALESCE(t.payment_method, 'CASH') as payment_method,
					t.total_amount,
					u.full_name as cashier_name,
					COALESCE(SUM(td.qty * td.conversion_factor * COALESCE(td.cost_price_snapshot, p.cost_price, 0)), 0)::float as cogs,
					(t.total_amount - COALESCE(SUM(td.qty * td.conversion_factor * COALESCE(td.cost_price_snapshot, p.cost_price, 0)), 0))::float as gross_profit"""

content = content.replace(query_5_old, query_5_new)

# Fix Slow Moving Stock query
query_7_old = """					p.name as product_name,
					p.stock,
					MAX(t.created_at) as last_sold_at,"""
query_7_new = """					p.name as product_name,
					p.stock,
					COALESCE(p.price, 0)::float as price,
					MAX(t.created_at) as last_sold_at,"""

content = content.replace(query_7_old, query_7_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done modifying dashboard queries for profit and price')
