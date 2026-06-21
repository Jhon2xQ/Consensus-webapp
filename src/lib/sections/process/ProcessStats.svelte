<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { EnrollmentSummary } from '$lib/types/enrollment';

	type Variant = 'horizontal' | 'vertical';

	type Props = {
		summary: EnrollmentSummary | null;
		error?: boolean;
		variant?: Variant;
	};

	let { summary, error = false, variant = 'horizontal' }: Props = $props();

	const valueClass =
		'font-display font-extrabold leading-[1] tracking-[-0.03em] text-[clamp(28px,4vw,42px)] tabular-nums';
	const mutedValueClass =
		'font-display font-extrabold leading-[1] tracking-[-0.03em] text-[clamp(20px,3vw,28px)] text-consensus-muted';

	// Grid strategy:
	// - No `gap-*` on sm+ — `sm:divide-x` renders dividers between cells, and
	//   the per-cell `px-consensus-6` padding keeps the numbers away from the
	//   divider lines. Mixing `gap` + `divide-x` was the previous bug: with
	//   both, the dividers sat at the edge of each cell, not centered.
	// - Mobile keeps `divide-y` (stacked) and per-cell `py-consensus-4`.
	// - The vertical variant is always single-column, so only `divide-y`
	//   applies; no `sm:` overrides are needed.
	let gridClass = $derived(
		variant === 'vertical'
			? 'grid grid-cols-1 divide-y divide-consensus-border'
			: 'grid grid-cols-1 sm:grid-cols-3 sm:divide-x sm:divide-consensus-border divide-y divide-consensus-border'
	);
</script>

<!-- Bordered card wrapper. The inner grid still renders as a <div class="grid ...">
     so the existing variant tests keep resolving the same selector. -->
<div class="border border-consensus-border bg-consensus-white rounded-consensus-lg p-consensus-6">
	{#if error}
		<p class="text-sm text-muted-foreground text-center py-4">No disponible</p>
	{:else}
		<div class={gridClass}>
			<!-- Participants -->
			<div
				class="flex flex-col items-center text-center gap-consensus-1 px-consensus-6 py-consensus-4 sm:py-consensus-2"
			>
				{#if summary !== null}
					<p class={cn(valueClass, 'text-consensus-fg')}>{summary.totalParticipants}</p>
				{:else}
					<p data-testid="stat-value-muted" data-state="muted" class={mutedValueClass}>—</p>
				{/if}
				<p class="text-sm text-consensus-muted">Participantes</p>
			</div>

			<!-- Commitments -->
			<div
				class="flex flex-col items-center text-center gap-consensus-1 px-consensus-6 py-consensus-4 sm:py-consensus-2"
			>
				{#if summary !== null}
					<p class={cn(valueClass, 'text-consensus-fg')}>{summary.totalCommitments}</p>
				{:else}
					<p data-testid="stat-value-muted" data-state="muted" class={mutedValueClass}>—</p>
				{/if}
				<p class="text-sm text-consensus-muted">Compromisos</p>
			</div>

			<!-- Voted -->
			<div
				class="flex flex-col items-center text-center gap-consensus-1 px-consensus-6 py-consensus-4 sm:py-consensus-2"
			>
				{#if summary !== null}
					<p class={cn(valueClass, 'text-consensus-fg')}>{summary.totalVoted}</p>
				{:else}
					<p data-testid="stat-value-muted" data-state="muted" class={mutedValueClass}>—</p>
				{/if}
				<p class="text-sm text-consensus-muted">Votaron</p>
			</div>
		</div>
	{/if}
</div>
