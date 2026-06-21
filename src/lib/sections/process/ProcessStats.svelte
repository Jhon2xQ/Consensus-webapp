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
	// - `sm+` (fila): SOLO divisores verticales (`sm:divide-x`). Se apaga `divide-y`
	//   con `sm:divide-y-0` para que no aparezca la línea debajo de cada stat.
	// - Mobile (columna): SOLO divisor horizontal (`divide-y`).
	// - No usamos `gap-*` junto con `divide-x`: ambos juntos desplazan el divisor
	//   al borde de cada celda. El padding `px-consensus-6` mantiene los números
	//   lejos del divisor.
	let gridClass = $derived(
		variant === 'vertical'
			? 'grid grid-cols-1 divide-y divide-consensus-border'
			: 'grid grid-cols-1 divide-y divide-consensus-border sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:divide-consensus-border'
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
