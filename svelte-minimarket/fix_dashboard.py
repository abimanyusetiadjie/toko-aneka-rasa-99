import re
file_path = 'src/routes/admin/dashboard/+page.server.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix query 1
content = content.replace("query(\n\t\t\t\tSELECT \n\t\t\t\t\tCOALESCE(SUM(total_amount), 0)::float as pos_revenue,\n\t\t\t\t\tCOUNT(id)::int as pos_count\n\t\t\t\tFROM transactions\n\t\t\t\tWHERE status = 'COMPLETED' AND (channel = 'POS' OR channel IS NULL) ${rawDateFilter}\n\t\t\t)", "query(`\n\t\t\t\tSELECT \n\t\t\t\t\tCOALESCE(SUM(total_amount), 0)::float as pos_revenue,\n\t\t\t\t\tCOUNT(id)::int as pos_count\n\t\t\t\tFROM transactions\n\t\t\t\tWHERE status = 'COMPLETED' AND (channel = 'POS' OR channel IS NULL) ${rawDateFilter}\n\t\t\t`)")

# Fix query 2
content = content.replace("query(\n\t\t\t\tSELECT \n\t\t\t\t\tCOALESCE(SUM(total_amount), 0)::float as shopee_revenue,\n\t\t\t\t\tCOUNT(id)::int as shopee_count,\n\t\t\t\t\tCOUNT(CASE WHEN order_status = 'READY_TO_SHIP' THEN 1 END)::int as ready_to_ship_count\n\t\t\t\tFROM shopee_orders\n\t\t\t\tWHERE order_status != 'CANCELLED' ${shopeeFilterSql}\n\t\t\t)", "query(`\n\t\t\t\tSELECT \n\t\t\t\t\tCOALESCE(SUM(total_amount), 0)::float as shopee_revenue,\n\t\t\t\t\tCOUNT(id)::int as shopee_count,\n\t\t\t\t\tCOUNT(CASE WHEN order_status = 'READY_TO_SHIP' THEN 1 END)::int as ready_to_ship_count\n\t\t\t\tFROM shopee_orders\n\t\t\t\tWHERE order_status != 'CANCELLED' ${shopeeFilterSql}\n\t\t\t`)")

# Fix query 3
content = content.replace("query(\n\t\t\t\tSELECT \n\t\t\t\t\tCOALESCE(SUM(td.qty * td.conversion_factor * COALESCE(td.cost_price_snapshot, p.cost_price, 0)), 0)::float as total_cogs\n\t\t\t\tFROM transaction_details td\n\t\t\t\tJOIN products p ON td.product_id = p.id\n\t\t\t\tJOIN transactions t ON td.transaction_id = t.id\n\t\t\t\tWHERE t.status = 'COMPLETED' ${txFilterSql}\n\t\t\t)", "query(`\n\t\t\t\tSELECT \n\t\t\t\t\tCOALESCE(SUM(td.qty * td.conversion_factor * COALESCE(td.cost_price_snapshot, p.cost_price, 0)), 0)::float as total_cogs\n\t\t\t\tFROM transaction_details td\n\t\t\t\tJOIN products p ON td.product_id = p.id\n\t\t\t\tJOIN transactions t ON td.transaction_id = t.id\n\t\t\t\tWHERE t.status = 'COMPLETED' ${txFilterSql}\n\t\t\t`)")

# Fix query 4
content = content.replace("query(\n\t\t\t\tSELECT COALESCE(SUM(ABS(qty_base_change) * COALESCE(unit_cost_snapshot, 0)), 0)::float as shopee_cogs\n\t\t\t\tFROM stock_movements \n\t\t\t\tWHERE reference_type = 'SHOPEE_ORDER' ${rawDateFilter}\n\t\t\t)", "query(`\n\t\t\t\tSELECT COALESCE(SUM(ABS(qty_base_change) * COALESCE(unit_cost_snapshot, 0)), 0)::float as shopee_cogs\n\t\t\t\tFROM stock_movements \n\t\t\t\tWHERE reference_type = 'SHOPEE_ORDER' ${rawDateFilter}\n\t\t\t`)")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
