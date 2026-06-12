<script lang="ts">
	import { Calendar, Vote } from '@lucide/svelte';

	type Props = {
		commitmentStart: string;
		commitmentEnd: string;
		votingStart: string;
		votingEnd: string;
	};

	let { commitmentStart, commitmentEnd, votingStart, votingEnd }: Props = $props();

	function formatDateTime(iso: string): string {
		return new Intl.DateTimeFormat('es-AR', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(iso));
	}
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
	<!-- Compromiso -->
	<div
		class="rounded-lg border border-brand-gray-200/60 bg-brand-gray-50/30 p-4 flex flex-col gap-2"
	>
		<div
			class="flex items-center gap-1.5 text-[11px] font-semibold text-brand-gray-400 uppercase tracking-wider"
		>
			<Calendar class="size-3.5" />
			Compromiso
		</div>
		<div class="space-y-1.5">
			<div>
				<span class="text-[11px] text-brand-gray-400 uppercase tracking-wider">Inicio</span>
				<p class="text-sm text-brand-black font-medium">{formatDateTime(commitmentStart)}</p>
			</div>
			<div>
				<span class="text-[11px] text-brand-gray-400 uppercase tracking-wider">Fin</span>
				<p class="text-sm text-brand-black font-medium">{formatDateTime(commitmentEnd)}</p>
			</div>
		</div>
	</div>

	<!-- Votación -->
	<div
		class="rounded-lg border border-brand-gray-200/60 bg-brand-gray-50/30 p-4 flex flex-col gap-2"
	>
		<div
			class="flex items-center gap-1.5 text-[11px] font-semibold text-brand-gray-400 uppercase tracking-wider"
		>
			<Vote class="size-3.5" />
			Votación
		</div>
		<div class="space-y-1.5">
			<div>
				<span class="text-[11px] text-brand-gray-400 uppercase tracking-wider">Inicio</span>
				<p class="text-sm text-brand-black font-medium">{formatDateTime(votingStart)}</p>
			</div>
			<div>
				<span class="text-[11px] text-brand-gray-400 uppercase tracking-wider">Fin</span>
				<p class="text-sm text-brand-black font-medium">{formatDateTime(votingEnd)}</p>
			</div>
		</div>
	</div>
</div>
