<script lang="ts">
	import { Users, Clock, CheckCircle } from '@lucide/svelte';
	import type { EnrollmentSummary } from '$lib/types/enrollment';

	type Props = {
		summary: EnrollmentSummary | null;
		error?: boolean;
	};

	let { summary, error = false }: Props = $props();
</script>

{#if error}
	<p class="text-sm text-muted-foreground text-center py-4">No disponible</p>
{:else}
	<div class="grid grid-cols-1 gap-3">
		<!-- Participants -->
		<div
			class="flex items-center gap-3 p-4 rounded-lg border border-brand-gray-200/60 bg-brand-gray-50/30"
		>
			<Users class="size-5 text-brand-red shrink-0" />
			<div>
				<p class="text-2xl font-bold text-brand-black tabular-nums">
					{summary?.totalParticipants ?? 0}
				</p>
				<p class="text-xs text-brand-gray-400">Participantes</p>
			</div>
		</div>

		<!-- Commitments -->
		<div
			class="flex items-center gap-3 p-4 rounded-lg border border-brand-gray-200/60 bg-brand-gray-50/30"
		>
			<Clock class="size-5 text-brand-red shrink-0" />
			<div>
				<p class="text-2xl font-bold text-brand-black tabular-nums">
					{summary?.totalCommitments ?? 0}
				</p>
				<p class="text-xs text-brand-gray-400">Compromisos</p>
			</div>
		</div>

		<!-- Voted -->
		<div
			class="flex items-center gap-3 p-4 rounded-lg border border-brand-gray-200/60 bg-brand-gray-50/30"
		>
			<CheckCircle class="size-5 text-brand-red shrink-0" />
			<div>
				<p class="text-2xl font-bold text-brand-black tabular-nums">
					{summary?.totalVoted ?? 0}
				</p>
				<p class="text-xs text-brand-gray-400">Votaron</p>
			</div>
		</div>
	</div>
{/if}
