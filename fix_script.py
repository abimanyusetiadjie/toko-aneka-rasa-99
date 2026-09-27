import sys

filepath = 'svelte-minimarket/src/routes/+page.svelte'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
in_duplicate = False
for i, line in enumerate(lines):
    if line.startswith("cript lang=\"ts\">"):
        in_duplicate = True
        new_lines.append("</script>\n")
        continue
    if in_duplicate and "</script>" in line:
        in_duplicate = False
        continue
    
    if not in_duplicate:
        new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Done fix script")
