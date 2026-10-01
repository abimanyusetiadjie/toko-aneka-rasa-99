import re

with open('src/routes/admin/shopee/mapping/+page.svelte', 'r', encoding='utf-8') as f:
    content = f.read()

start_tag = '<select\n\t\t\t\t\t\t\t\t\t\t\t\tname="shopee_item_id"'

# Use a simpler regex
old_select = r'<select\s+name="shopee_item_id".*?</select>'

new_select = '''<select
												name=\"shopee_mapping\"
												class=\"block w-full min-w-[350px] max-w-xl rounded-lg border-0 py-1.5 pl-3 pr-8 text-slate-900 ring-1 ring-inset {lp.shopee_item_id ? 'ring-emerald-300 bg-emerald-50' : 'ring-slate-300 bg-white'} focus:ring-2 focus:ring-orange-600 sm:text-sm sm:leading-6\"
												onchange={() => document.getElementById(`btn-${lp.id}`)?.click()}
											>
												<option value=\"\">-- Belum Ditautkan (Tidak Sync) --</option>
												{#each data.shopeeProducts as sp}
													{#if sp.has_model && sp.models && sp.models.length > 0}
														<optgroup label={sp.item_name}>
															{#each sp.models as mod}
																<option value="{sp.item_id}|{mod.model_id}" selected={Number(lp.shopee_item_id) === sp.item_id && Number(lp.shopee_model_id) === mod.model_id}>
																	Varian: {mod.model_name} (SKU: {mod.model_sku || '-'})
																</option>
															{/each}
														</optgroup>
													{#else}
														<option value="{sp.item_id}|0" selected={Number(lp.shopee_item_id) === sp.item_id && (!lp.shopee_model_id || lp.shopee_model_id === 0)}>
															Shopee: {sp.item_name.substring(0, 70)}{sp.item_name.length > 70 ? '...' : ''} (SKU: {sp.item_sku || '-'})
														</option>
													{/if}
												{/each}
											</select>'''

content = re.sub(old_select, new_select, content, flags=re.DOTALL)

with open('src/routes/admin/shopee/mapping/+page.svelte', 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched successfully')
