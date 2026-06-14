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
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
		<!-- Participants -->
		<div class="flex flex-col items-center text-center p-6">
			<Users class="size-5 text-brand-red mb-2" />
			<p class="text-3xl font-bold text-brand-black tabular-nums">
				{summary?.totalParticipants ?? 0}
			</p>
			<p class="text-xs text-brand-gray-400">Participantes</p>
		</div>

		<!-- Commitments -->
		<div class="flex flex-col items-center text-center p-6">
			<Clock class="size-5 text-brand-red mb-2" />
			<p class="text-3xl font-bold text-brand-black tabular-nums">
				{summary?.totalCommitments ?? 0}
			</p>
			<p class="text-xs text-brand-gray-400">Compromisos</p>
		</div>

		<!-- Voted -->
		<div class="flex flex-col items-center text-center p-6">
			<CheckCircle class="size-5 text-brand-red mb-2" />
			<p class="text-3xl font-bold text-brand-black tabular-nums">
				{summary?.totalVoted ?? 0}
			</p>
			<p class="text-xs text-brand-gray-400">Votaron</p>
		</div>
	</div>
{/if}
