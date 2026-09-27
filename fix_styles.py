import sys
import os

filepath = 'svelte-minimarket/src/routes/+page.svelte'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

content = "".join(lines)
last_style_start = content.rfind("<style>")
last_style_end = content.rfind("</style>")

if last_style_start != -1 and last_style_start > 500:
    style_content = content[last_style_start+7:last_style_end]
    content = content[:last_style_start] + content[last_style_end+8:]
    first_style_end = content.find("</style>")
    if first_style_end != -1:
        content = content[:first_style_end] + style_content + "\n" + content[first_style_end:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Styles merged")
