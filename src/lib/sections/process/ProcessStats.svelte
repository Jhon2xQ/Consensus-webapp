<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { EnrollmentSummary } from '$lib/types/enrollment';

	type Props = {
		summary: EnrollmentSummary | null;
		error?: boolean;
	};

	let { summary, error = false }: Props = $props();

	const valueClass =
		'font-display font-extrabold leading-[1] tracking-[-0.03em] text-[clamp(28px,4vw,42px)] tabular-nums';
	const mutedValueClass =
		'font-display font-extrabold leading-[1] tracking-[-0.03em] text-[clamp(20px,3vw,28px)] text-consensus-muted';
</script>

{#if error}
	<p class="text-sm text-muted-foreground text-center py-4">No disponible</p>
{:else}
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-consensus-6">
		<!-- Participants -->
		<div class="flex flex-col items-center text-center gap-consensus-1">
			{#if summary !== null}
				<p class={cn(valueClass, 'text-consensus-fg')}>{summary.totalParticipants}</p>
			{:else}
				<p data-testid="stat-value-muted" data-state="muted" class={mutedValueClass}>—</p>
			{/if}
			<p class="text-sm text-consensus-muted">Participantes</p>
		</div>

		<!-- Commitments -->
		<div class="flex flex-col items-center text-center gap-consensus-1">
			{#if summary !== null}
				<p class={cn(valueClass, 'text-consensus-fg')}>{summary.totalCommitments}</p>
			{:else}
				<p data-testid="stat-value-muted" data-state="muted" class={mutedValueClass}>—</p>
			{/if}
			<p class="text-sm text-consensus-muted">Compromisos</p>
		</div>

		<!-- Voted -->
		<div class="flex flex-col items-center text-center gap-consensus-1">
			{#if summary !== null}
				<p class={cn(valueClass, 'text-consensus-fg')}>{summary.totalVoted}</p>
			{:else}
				<p data-testid="stat-value-muted" data-state="muted" class={mutedValueClass}>—</p>
			{/if}
			<p class="text-sm text-consensus-muted">Votaron</p>
		</div>
	</div>
{/if}
