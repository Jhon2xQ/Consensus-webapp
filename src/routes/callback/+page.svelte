<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';

	let error = $derived(page.url.searchParams.get('error'));
</script>

<svelte:head>
	<title>Autenticando — Consensus</title>
</svelte:head>

<div class="flex min-h-[60vh] items-center justify-center">
	{#if error}
		<div class="text-center">
			<p class="text-brand-red mb-4">Error de autenticación</p>
			<a href="/">
				<Button variant="outline">Volver al inicio</Button>
			</a>
		</div>
	{:else}
		<div class="text-center">
			<div class="inline-block w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin mb-4" role="status" aria-label="Autenticando"></div>
			<p class="text-brand-gray-800">Autenticando…</p>
		</div>
	{/if}
</div>
