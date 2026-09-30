import re
file_path = 'src/routes/admin/dashboard/+page.server.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("u.name as cashier_name", "u.full_name as cashier_name")
content = content.replace("GROUP BY t.id, u.name", "GROUP BY t.id, u.full_name")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done replacing u.name with u.full_name')
