<script lang="ts">
	import '../app.css';
	import { navigating } from '$app/stores';
	let { children } = $props();
</script>

{#if $navigating}
	<div class="fixed top-0 left-0 right-0 h-1 bg-amber-100 z-[9999] pointer-events-none overflow-hidden">
		<div class="h-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 w-full animate-top-progress"></div>
	</div>
{/if}

{@render children()}
