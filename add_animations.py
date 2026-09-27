import sys
import os

filepath = 'svelte-minimarket/src/routes/+page.svelte'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import type { PageData } from './$types';", "import type { PageData } from './$types';\n\timport { onMount } from 'svelte';")

observer_script = """
	onMount(() => {
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-revealed');
				}
			});
		}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

		document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
	});
"""
content = content.replace("</script>", observer_script + "\n</script>")

style_block = """
<style>
	/* Scroll Reveal Animations */
	:global(.reveal-on-scroll) {
		opacity: 0;
		transform: translateY(30px);
		transition: opacity 0.8s ease-out, transform 0.8s ease-out;
		will-change: opacity, transform;
	}
	:global(.reveal-on-scroll.is-revealed) {
		opacity: 1;
		transform: translateY(0);
	}

	/* Sequential Delays for Grid items */
	:global(.delay-1) { transition-delay: 100ms; }
	:global(.delay-2) { transition-delay: 200ms; }
	:global(.delay-3) { transition-delay: 300ms; }
	:global(.delay-4) { transition-delay: 400ms; }

	/* Infinite Marquee Animation */
	@keyframes marquee {
		0% { transform: translateX(0%); }
		100% { transform: translateX(-50%); }
	}
	.animate-marquee {
		display: inline-block;
		white-space: nowrap;
		animation: marquee 25s linear infinite;
	}
	.animate-marquee:hover {
		animation-play-state: paused;
	}

	/* Shimmer Sweep Effect */
	:global(.shimmer-btn) {
		position: relative;
		overflow: hidden;
	}
	:global(.shimmer-btn::after) {
		content: "";
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: linear-gradient(
			to right,
			rgba(255, 255, 255, 0) 0%,
			rgba(255, 255, 255, 0.4) 50%,
			rgba(255, 255, 255, 0) 100%
		);
		transform: rotate(30deg) translateX(-150%);
		animation: shimmer 4.5s infinite ease-in-out;
	}
	@keyframes shimmer {
		0%, 60% { transform: rotate(30deg) translateX(-150%); }
		100% { transform: rotate(30deg) translateX(150%); }
	}

	/* Breathing Glow */
	@keyframes breathe {
		0%, 100% { transform: scale(1); opacity: 0.4; }
		50% { transform: scale(1.15); opacity: 0.7; }
	}
	.animate-breathe {
		animation: breathe 8s ease-in-out infinite;
	}
	.animate-breathe-delayed {
		animation: breathe 8s ease-in-out infinite 4s;
	}
</style>
"""

content = content + style_block

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
