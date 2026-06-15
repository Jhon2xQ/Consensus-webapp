<script lang="ts">
	import { Calendar, Vote, BarChart3 } from '@lucide/svelte';

	type Props = {
		commitmentStart: string;
		commitmentEnd: string;
		votingStart: string;
		votingEnd: string;
		results: string;
	};

	let { commitmentStart, commitmentEnd, votingStart, votingEnd, results }: Props = $props();

	function formatDateTime(iso: string): string {
		return new Intl.DateTimeFormat('es-AR', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(iso));
	}
</script>

<div
	class="flex flex-col md:flex-row md:divide-x md:divide-brand-gray-200 rounded-lg border border-brand-gray-200/60 bg-brand-gray-50/30 p-4"
>
	<!-- Compromiso -->
	<div class="flex-1 flex items-start gap-3 p-3">
		<Calendar class="size-4 text-brand-red shrink-0 mt-1" />
		<div class="flex flex-col min-w-0">
			<span class="text-xs font-semibold text-brand-gray-400 uppercase tracking-wider">
				Compromiso
			</span>
			<p class="text-sm text-brand-black font-medium">Inicio: {formatDateTime(commitmentStart)}</p>
			<p class="text-sm text-brand-black font-medium">Fin: {formatDateTime(commitmentEnd)}</p>
		</div>
	</div>

	<!-- Votación -->
	<div class="flex-1 flex items-start gap-3 p-3">
		<Vote class="size-4 text-brand-red shrink-0 mt-1" />
		<div class="flex flex-col min-w-0">
			<span class="text-xs font-semibold text-brand-gray-400 uppercase tracking-wider">
				Votación
			</span>
			<p class="text-sm text-brand-black font-medium">Inicio: {formatDateTime(votingStart)}</p>
			<p class="text-sm text-brand-black font-medium">Fin: {formatDateTime(votingEnd)}</p>
		</div>
	</div>

	<!-- Resultados -->
	<div class="flex-1 flex items-start gap-3 p-3">
		<BarChart3 class="size-4 text-brand-red shrink-0 mt-1" />
		<div class="flex flex-col min-w-0">
			<span class="text-xs font-semibold text-brand-gray-400 uppercase tracking-wider">
				Resultados
			</span>
			<p class="text-sm text-brand-black font-medium">Fecha: {formatDateTime(results)}</p>
		</div>
	</div>
</div>
