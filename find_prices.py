import re

with open('src/lib/server/seeds/tokoanekarasa99.ts', 'r', encoding='utf-8') as f:
    text = f.read()

names_to_find = [
    "Kemplang Panggang Cap MM",
    "Kericu",
    "Getas Lonceng Mas",
    "Terasi",
    "Kopi Bubuk Cap 1",
    "Kingkong",
    "Kerupuk Ikan Mentah",
    "Kerupuk Udang Mentah",
    "Kerupuk Jengkol",
    "Semprong"
]

results = []
for name in names_to_find:
    pattern = r'"name":\s*"(.*?{}.*?)",\s*"price":\s*(\d+)'.format(name)
    matches = re.findall(pattern, text, re.IGNORECASE)
    results.append(f"{name}: {matches}")

print("\n".join(results))
