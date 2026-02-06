<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
	let dark = $state(false);

	function toggleDark() {
		dark = !dark;
		document.documentElement.classList.toggle('dark', dark);
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen bg-white transition-colors dark:bg-gray-900">
	<div class="flex justify-end px-4 pt-4">
		<button
			onclick={toggleDark}
			class="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
		>
			{#if dark}Light{:else}Dark{/if}
		</button>
	</div>
	{@render children()}
</div>
