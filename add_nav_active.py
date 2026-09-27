import sys

filepath = 'svelte-minimarket/src/routes/+page.svelte'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("let waBubbleVisible = $state(true);", "let waBubbleVisible = $state(true);\n\tlet activeSection = $state('hero');")

new_script = """
	onMount(() => {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-revealed');
				}
			});
		}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

		document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

		const sectionObserver = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
					activeSection = entry.target.id;
				}
			});
		}, { threshold: 0.3, rootMargin: '-10% 0px -50% 0px' });
		
		document.querySelectorAll('section[id]').forEach(el => sectionObserver.observe(el));
	});
"""

start = content.find("\tonMount(() => {")
end = content.find("});\n</script>", start) + 3
if start != -1 and end != -1:
    content = content[:start] + new_script.strip() + "\n" + content[end:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
