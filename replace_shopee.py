import sys

filepath = 'svelte-minimarket/src/routes/+page.svelte'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Shopee logo
old_shopee = '<img src="https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg" alt="Shopee Logo" class="w-4 h-4 object-contain brightness-0 invert" />'
new_shopee = '<img src="/shopee-icon.png" alt="Shopee Logo" class="w-5 h-5 object-contain rounded-sm" />'
content = content.replace(old_shopee, new_shopee)

# Also ensure WhatsApp icon is same size
old_wa = '<svg class="w-4 h-4 fill-current shrink-0"'
new_wa = '<svg class="w-5 h-5 fill-current shrink-0"'
content = content.replace(old_wa, new_wa)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
