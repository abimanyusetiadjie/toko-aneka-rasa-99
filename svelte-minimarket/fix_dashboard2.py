import re
file_path = 'src/routes/admin/dashboard/+page.server.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix query(SELECT -> query(`SELECT
content = re.sub(r'query\(\s*SELECT\s+COALESCE', r'query(`\n\t\t\t\tSELECT \n\t\t\t\t\tCOALESCE', content)
content = re.sub(r'\$\{rawDateFilter\}\s*\)', r'${rawDateFilter}\n\t\t\t`)', content)
content = re.sub(r'\$\{shopeeFilterSql\}\s*\)', r'${shopeeFilterSql}\n\t\t\t`)', content)
content = re.sub(r'\$\{txFilterSql\}\s*\)', r'${txFilterSql}\n\t\t\t`)', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
