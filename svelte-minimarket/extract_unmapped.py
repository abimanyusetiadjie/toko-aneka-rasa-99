import json
import re

with open('data.json', 'r', encoding='utf-8') as f: data = json.load(f)

def clean_name(name):
    name = re.sub(r'[^\w\s]', ' ', name.lower())
    words_to_remove = ['berat', 'gram', 'gr', 'kg', 'khas', 'bangka', 'cap', 'ukuran', 'mentah', 'di', 'repack', 'kemasan', 'baru', 'asli', 'bentuk', 'super', 'yang']
    words = name.split()
    normalized = []
    for w in words:
        if w in words_to_remove: continue
        w = w.replace('gram', '').replace('gr', '').replace('kg', '')
        if w == '': continue
        normalized.append(w)
    return ' '.join(normalized)

def extract_numbers(name): return set(re.findall(r'\d+', name))

flat_shopee = []
for sp in data['shopee_available']:
    if sp['has_model'] and sp['models']:
        for mod in sp['models']:
            flat_shopee.append({
                'shopee_item_id': sp['item_id'],
                'shopee_model_id': mod['model_id'],
                'shopee_name': f"{sp['item_name']} - {mod['model_name']}",
                'clean': clean_name(f"{sp['item_name']} {mod['model_name']}"),
                'nums': extract_numbers(f"{sp['item_name']} {mod['model_name']}")
            })
    else:
        flat_shopee.append({
            'shopee_item_id': sp['item_id'],
            'shopee_model_id': 'NULL',
            'shopee_name': sp['item_name'],
            'clean': clean_name(sp['item_name']),
            'nums': extract_numbers(sp['item_name'])
        })

mapped_ids = set()
for lp in data['local_unmapped']:
    lp_clean = clean_name(lp['name'])
    lp_nums = extract_numbers(lp['name'])
    match = None
    best_score = 0
    for sp in flat_shopee:
        words_lp = set(lp_clean.split())
        words_sp = set(sp['clean'].split())
        if not words_lp or not words_sp: continue
        if lp_nums and sp['nums']:
            if not lp_nums.intersection(sp['nums']): continue
        intersection = words_lp.intersection(words_sp)
        score = len(intersection) / max(len(words_lp), len(words_sp))
        if score > best_score and score > 0.6:
            best_score = score
            match = sp
    if match: mapped_ids.add(lp['id'])

unmapped = [lp for lp in data['local_unmapped'] if lp['id'] not in mapped_ids]
with open('unmapped.json', 'w') as f: json.dump(unmapped, f, indent=2)
with open('flat_shopee.json', 'w') as f: json.dump(flat_shopee, f, indent=2)
print(f'Remaining: {len(unmapped)}')
