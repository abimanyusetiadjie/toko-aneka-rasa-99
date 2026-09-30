import re
file_path = 'src/routes/api/webhooks/shopee/+server.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("await query(SELECT id, order_status FROM shopee_orders WHERE order_sn = , [orderSn]);", "await query(`SELECT id, order_status FROM shopee_orders WHERE order_sn = $1`, [orderSn]);")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
