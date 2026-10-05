import json
import re

# Load data
with open('data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

local_products = data['local_unmapped']
shopee_products = data['shopee_available']

mappings = []

def clean_name(name):
    # Keep numbers attached to words or separate to ensure strict size matching
    name = re.sub(r'[^\w\s]', ' ', name.lower())
    words_to_remove = ['berat', 'gram', 'gr', 'kg', 'khas', 'bangka', 'cap', 'ukuran', 'mentah', 'di', 'repack', 'kemasan', 'baru', 'asli', 'bentuk', 'super', 'yang']
    words = name.split()
    # Normalize weights like '500g' to '500'
    normalized = []
    for w in words:
        if w in words_to_remove: continue
        w = w.replace('gram', '').replace('gr', '').replace('kg', '')
        if w == '': continue
        normalized.append(w)
    return ' '.join(normalized)

def extract_numbers(name):
    return set(re.findall(r'\d+', name))

flat_shopee = []
for sp in shopee_products:
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

for lp in local_products:
    lp_clean = clean_name(lp['name'])
    lp_nums = extract_numbers(lp['name'])
    
    match = None
    best_score = 0
    
    for sp in flat_shopee:
        words_lp = set(lp_clean.split())
        words_sp = set(sp['clean'].split())
        if not words_lp or not words_sp: continue
        
        # Must have same numbers if both have numbers
        # E.g. 500g should not match 250g
        if lp_nums and sp['nums']:
            if not lp_nums.intersection(sp['nums']):
                continue # Skip if completely disjoint numbers
        
        intersection = words_lp.intersection(words_sp)
        score = len(intersection) / max(len(words_lp), len(words_sp))
        
        if score > best_score and score > 0.6: # Stricter threshold
            best_score = score
            match = sp

    if match:
        mappings.append({
            'local_id': lp['id'],
            'local_name': lp['name'],
            'shopee_item_id': match['shopee_item_id'],
            'shopee_model_id': match['shopee_model_id'],
            'shopee_name': match['shopee_name'],
            'score': best_score
        })

print(f"Mapped {len(mappings)} out of {len(local_products)}")

# Generate JS code for endpoint
js_code = """
import { json } from '@sveltejs/kit';
import { query } from '$lib/server/db';

export const GET = async () => {
	try {
		let count = 0;
"""

for m in mappings:
    shopee_model_id = m['shopee_model_id']
    js_code += f"""
		// Local: {m['local_name']} -> Shopee: {m['shopee_name']}
		await query(`UPDATE products SET shopee_item_id = $1, shopee_model_id = {shopee_model_id}, updated_at = NOW() WHERE id = $2`, [{m['shopee_item_id']}, '{m['local_id']}']);
		count++;
"""

js_code += """
		return json({ success: true, message: `Berhasil menautkan ${count} produk secara otomatis!` });
	} catch (err: any) {
		return json({ error: err.message });
	}
};
"""

with open('src/routes/api/webhooks/shopee/apply-ai-mapping/+server.ts', 'w', encoding='utf-8') as f:
    f.write(js_code)

print("Generated apply-ai-mapping endpoint")
