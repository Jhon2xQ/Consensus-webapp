<script lang="ts">
	import type { ElectoralProcessStatus } from '$lib/types/electoral-process';
	import { cn } from '$lib/utils.js';

	type Props = {
		commitmentStart: string;
		commitmentEnd: string;
		votingStart: string;
		votingEnd: string;
		results: string;
		effectiveStatus: ElectoralProcessStatus;
	};

	let {
		commitmentStart,
		commitmentEnd,
		votingStart,
		votingEnd,
		results,
		effectiveStatus
	}: Props = $props();

	function formatDate(iso: string): string {
		return new Intl.DateTimeFormat('es-AR', {
			dateStyle: 'medium'
		}).format(new Date(iso));
	}

	function formatTimeRange(startIso: string, endIso: string): string {
		const fmt = new Intl.DateTimeFormat('es-AR', { timeStyle: 'short' });
		return `${fmt.format(new Date(startIso))} – ${fmt.format(new Date(endIso))}`;
	}

	// State per phase for the current effectiveStatus. "active" = current,
	// "done" = past, "upcoming" = future. The COMPROMISO phase transitions
	// from active (during COMMITMENT) to done (from SEALED onwards).
	type PhaseState = 'active' | 'done' | 'upcoming';
	const compromisoState: PhaseState = $derived(
		effectiveStatus === 'COMMITMENT'
			? 'active'
			: effectiveStatus === 'SEALED' ||
				  effectiveStatus === 'VOTING' ||
				  effectiveStatus === 'COUNTING' ||
				  effectiveStatus === 'CLOSED'
				? 'done'
				: 'upcoming'
	);
	const votacionState: PhaseState = $derived(
		effectiveStatus === 'VOTING'
			? 'active'
			: effectiveStatus === 'COUNTING' || effectiveStatus === 'CLOSED'
				? 'done'
				: 'upcoming'
	);
	const resultadosState: PhaseState = $derived(
		effectiveStatus === 'COUNTING'
			? 'active'
			: effectiveStatus === 'CLOSED'
				? 'done'
				: 'upcoming'
	);

	const labelClass =
		'font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-consensus-muted';
</script>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-consensus-4 py-consensus-8">
	<!-- Compromiso -->
	<div
		data-testid="phase-compromiso"
		data-state={compromisoState}
		class="flex flex-col gap-consensus-2"
	>
		<span class={cn(labelClass, compromisoState === 'active' && 'text-consensus-red', compromisoState === 'done' && 'text-emerald-700')}>
			Compromiso
		</span>
		<span class="text-sm font-semibold text-consensus-fg">{formatDate(commitmentStart)}</span>
		<span class="text-xs text-consensus-muted font-mono">
			{formatTimeRange(commitmentStart, commitmentEnd)}
		</span>
	</div>

	<!-- Votación -->
	<div
		data-testid="phase-votacion"
		data-state={votacionState}
		class="flex flex-col gap-consensus-2"
	>
		<span class={cn(labelClass, votacionState === 'active' && 'text-consensus-red', votacionState === 'done' && 'text-emerald-700')}>
			Votación
		</span>
		<span class="text-sm font-semibold text-consensus-fg">{formatDate(votingStart)}</span>
		<span class="text-xs text-consensus-muted font-mono">
			{formatTimeRange(votingStart, votingEnd)}
		</span>
	</div>

	<!-- Resultados -->
	<div
		data-testid="phase-resultados"
		data-state={resultadosState}
		class="flex flex-col gap-consensus-2"
	>
		<span class={cn(labelClass, resultadosState === 'active' && 'text-consensus-red', resultadosState === 'done' && 'text-emerald-700')}>
			Resultados
		</span>
		<span class="text-sm font-semibold text-consensus-fg">{formatDate(results)}</span>
		<span class="text-xs text-consensus-muted font-mono">
			{new Intl.DateTimeFormat('es-AR', { timeStyle: 'short' }).format(new Date(results))}
		</span>
	</div>
</div>
