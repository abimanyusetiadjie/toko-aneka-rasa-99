import re
file_path = 'src/routes/admin/dashboard/+page.server.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace `query(` with `query(``` for the broken ones
content = re.sub(r'query\(\s*SELECT', r'query(`\n\t\t\t\tSELECT', content)
content = content.replace("${rawDateFilter}\n\t\t\t),", "${rawDateFilter}\n\t\t\t`),")
content = content.replace("${shopeeFilterSql}\n\t\t\t),", "${shopeeFilterSql}\n\t\t\t`),")
content = content.replace("${txFilterSql}\n\t\t\t),", "${txFilterSql}\n\t\t\t`),")
content = content.replace("${rawDateFilter}\n\t\t\t)", "${rawDateFilter}\n\t\t\t`)")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
