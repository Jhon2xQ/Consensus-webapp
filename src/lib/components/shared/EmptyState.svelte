<script lang="ts">
	import type { Component } from 'svelte';

	type Props = {
		icon?: Component;
		title?: string;
		description?: string;
		action?: import('svelte').Snippet;
	};

	let { icon: Icon, title = 'Sin datos', description, action }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
	{#if Icon}
		<Icon class="size-10 mb-3 opacity-40" />
	{/if}
	<p class="text-sm font-medium">{title}</p>
	{#if description}
		<p class="text-xs mt-1 text-center max-w-xs">{description}</p>
	{/if}
	{#if action}
		<div class="mt-4">
			{@render action()}
		</div>
	{/if}
</div>
