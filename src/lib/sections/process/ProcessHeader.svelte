<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { cn } from '$lib/utils.js';
	import { ArrowLeft, Copy, CheckCircle } from '@lucide/svelte';
	import type { ElectoralProcessStatus } from '$lib/types/electoral-process';
	import { STATUS_LABELS, STATUS_COLORS } from '$lib/types/process-status';

	type Props = {
		name: string;
		status: ElectoralProcessStatus;
		scope: string | null;
		description?: string | null;
	};

	let { name, status, scope, description }: Props = $props();

	let scopeCopied = $state(false);
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	// Clean up pending timeout on component destroy
	$effect(() => {
		return () => {
			if (timeoutId !== null) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
		};
	});

	function handleCopyScope() {
		if (!scope) return;
		navigator.clipboard.writeText(scope);
		scopeCopied = true;
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}
		timeoutId = setTimeout(() => {
			scopeCopied = false;
			timeoutId = null;
		}, 1500);
	}
</script>

<header>
	<a
		href="/procesos"
		class="inline-flex items-center gap-1.5 text-sm text-brand-gray-400 hover:text-brand-red transition-colors mb-8"
	>
		<ArrowLeft class="size-4" />
		Volver a procesos
	</a>

	<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
		<h1 class="text-4xl md:text-5xl font-bold tracking-tighter text-brand-black">
			{name}
		</h1>
		<Badge
			variant="outline"
			class={cn('text-xs font-semibold px-3 py-1 w-fit', STATUS_COLORS[status])}
		>
			{STATUS_LABELS[status]}
		</Badge>
	</div>

	{#if description != null}
		<p class="text-base md:text-lg leading-relaxed text-brand-gray-800 mb-6">
			{description}
		</p>
	{/if}

	{#if scope !== null}
		<div class="flex items-center gap-2 text-sm">
			<span class="font-medium text-brand-black shrink-0">Alcance:</span>
			<span
				class="truncate min-w-0 max-w-[200px] md:max-w-[400px] lg:max-w-[600px] text-brand-gray-400"
				title={scope}
			>
				{scope}
			</span>
			<button
				type="button"
				onclick={handleCopyScope}
				class="inline-flex items-center justify-center rounded p-1 text-brand-gray-400 hover:text-brand-red transition-colors shrink-0"
				aria-label="Copiar alcance"
			>
				{#if scopeCopied}
					<CheckCircle class="size-3.5 text-green-500" />
				{:else}
					<Copy class="size-3.5" />
				{/if}
			</button>
		</div>
	{/if}
</header>
