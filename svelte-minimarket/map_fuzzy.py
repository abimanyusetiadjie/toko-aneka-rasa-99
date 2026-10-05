import json
import re
from difflib import SequenceMatcher

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

# First pass: Strict mapping from before
mapped_local_ids = set()
mappings = []

for lp in data['local_unmapped']:
    lp_clean = clean_name(lp['name'])
    lp_nums = extract_numbers(lp['name'])
    match = None
    best_score = 0
    for sp in flat_shopee:
        words_lp = set(lp_clean.split())
        words_sp = set(sp['clean'].split())
        if not words_lp or not words_sp: continue
        if lp_nums and sp['nums'] and not lp_nums.intersection(sp['nums']):
            continue
        intersection = words_lp.intersection(words_sp)
        score = len(intersection) / max(len(words_lp), len(words_sp))
        if score > best_score and score > 0.6:
            best_score = score
            match = sp
    if match:
        mapped_local_ids.add(lp['id'])

# Second pass: Fuzzy matching with Difflib for the remaining!
remaining_mappings = []
for lp in data['local_unmapped']:
    if lp['id'] in mapped_local_ids: continue
    
    lp_clean = clean_name(lp['name'])
    lp_nums = extract_numbers(lp['name'])
    
    best_match = None
    best_ratio = 0
    
    for sp in flat_shopee:
        ratio = SequenceMatcher(None, lp_clean, sp['clean']).ratio()
        
        # Penalize if numbers mismatch and both have numbers
        if lp_nums and sp['nums'] and not lp_nums.intersection(sp['nums']):
            ratio -= 0.3
            
        if ratio > best_ratio and ratio > 0.5: # 50% similar
            best_ratio = ratio
            best_match = sp
            
    if best_match:
        remaining_mappings.append({
            'local_id': lp['id'],
            'local_name': lp['name'],
            'shopee_item_id': best_match['shopee_item_id'],
            'shopee_model_id': best_match['shopee_model_id'],
            'shopee_name': best_match['shopee_name'],
            'ratio': best_ratio
        })

print(f"Mapped {len(remaining_mappings)} additional products using difflib.")

# Generate SQL query JS
js_code = """
import { json } from '@sveltejs/kit';
import { query } from '$lib/server/db';

export const GET = async () => {
	try {
		let count = 0;
"""

for m in remaining_mappings:
    shopee_model_id = m['shopee_model_id']
    js_code += f"""
		// Local: {m['local_name']} -> Shopee: {m['shopee_name']}
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = {shopee_model_id}, updated_at = NOW() WHERE id = $2`, [{m['shopee_item_id']}, '{m['local_id']}']);
		count++;
"""

js_code += """
		return json({ success: true, message: `Berhasil menautkan sisa ${count} produk tambahan!` });
	} catch (err: any) {
		return json({ error: err.message });
	}
};
"""

with open('src/routes/api/webhooks/shopee/apply-ai-mapping-2/+server.ts', 'w', encoding='utf-8') as f:
    f.write(js_code)
