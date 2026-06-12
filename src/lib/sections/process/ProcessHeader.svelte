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

<section class="pt-24 pb-12">
	<div class="max-w-7xl mx-auto px-6 lg:px-8">
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
			<p class="text-sm text-brand-gray-800 leading-relaxed">
				{description}
			</p>
		{/if}

		{#if scope !== null}
			<div class="flex items-center gap-2 text-sm">
				<span class="font-medium text-brand-black">Alcance:</span>
				<span
					class="inline-flex items-center gap-1.5 rounded-md border border-brand-gray-200 bg-brand-gray-50 px-2.5 py-0.5 text-xs font-medium text-brand-gray-700"
				>
					{scope}
					<button
						type="button"
						onclick={handleCopyScope}
						class="inline-flex items-center justify-center rounded p-0.5 text-brand-gray-400 hover:text-brand-red transition-colors"
						aria-label="Copiar alcance"
					>
						{#if scopeCopied}
							<CheckCircle class="size-3.5 text-green-500" />
						{:else}
							<Copy class="size-3.5" />
						{/if}
					</button>
				</span>
			</div>
		{/if}
	</div>
</section>
