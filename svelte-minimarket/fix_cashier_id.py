import re
file_path = 'src/routes/admin/dashboard/+page.server.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("LEFT JOIN users u ON t.cashier_id = u.id", "LEFT JOIN users u ON t.user_id = u.id")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done replacing cashier_id with user_id')
