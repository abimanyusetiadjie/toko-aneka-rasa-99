import re
with open('src/routes/admin/shopee/mapping/+page.svelte', 'r', encoding='utf-8') as f:
    content = f.read()

old_select = r'''												{#each data.shopeeProducts.filter((sp: any) => Number(lp.shopee_item_id) === sp.item_id || !mappedShopeeIds.includes(sp.item_id)) as sp}
													<option value={sp.item_id} selected={Number(lp.shopee_item_id) === sp.item_id}>
														{sp.item_name} {sp.item_sku ? `(SKU: ${sp.item_sku})` : ''}
													</option>
												{/each}'''

new_select = r'''												{#each data.shopeeProducts.filter((sp: any) => Number(lp.shopee_item_id) === sp.item_id || !mappedShopeeIds.includes(sp.item_id)) as sp}
													{#if sp.has_model && sp.models && sp.models.length > 0}
														{#each sp.models as mod}
															<option value="{sp.item_id}|{mod.model_id}" selected={Number(lp.shopee_item_id) === sp.item_id && Number(lp.shopee_model_id) === mod.model_id}>
																{sp.item_name} - {mod.model_name} {mod.model_sku ? `(SKU: ${mod.model_sku})` : ''}
															</option>
														{/each}
													{#else}
														<option value="{sp.item_id}" selected={Number(lp.shopee_item_id) === sp.item_id}>
															{sp.item_name} {sp.item_sku ? `(SKU: ${sp.item_sku})` : ''}
														</option>
													{/if}
												{/each}'''

content = content.replace(old_select, new_select)

with open('src/routes/admin/shopee/mapping/+page.svelte', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done mapping UI update')
