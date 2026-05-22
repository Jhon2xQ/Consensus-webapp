<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { UserPlus } from '@lucide/svelte';
	import { truncateCommitment } from './enrollment-utils';
	import EmptyState from '$lib/components/shared/EmptyState.svelte';
	import type { Enrollment } from '$lib/types/enrollment';

	type Props = {
		enrollments: Enrollment[];
		onCreateEnrollment?: () => void;
	};

	let { enrollments, onCreateEnrollment }: Props = $props();
</script>

{#if enrollments.length === 0}
	<EmptyState
		icon={UserPlus}
		title="No hay inscripciones registradas"
		description="Registrá la primera inscripción para este proceso electoral."
	/>
{:else}
	<!-- Desktop table -->
	<div class="hidden sm:block rounded-md border">
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Email</TableHead>
					<TableHead>Compromiso</TableHead>
					<TableHead class="text-center">Votó</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each enrollments as enrollment (enrollment.id)}
					<TableRow>
						<TableCell class="font-medium">{enrollment.email}</TableCell>
						<TableCell class="font-mono text-xs">
							{enrollment.commitment ? truncateCommitment(enrollment.commitment) : '—'}
						</TableCell>
						<TableCell class="text-center">
							{#if enrollment.hasVoted}
								<Badge variant="default" class="bg-green-600 hover:bg-green-700">Sí</Badge>
							{:else}
								<Badge variant="outline">No</Badge>
							{/if}
						</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>

	<!-- Mobile card list -->
	<div class="sm:hidden space-y-2">
		{#each enrollments as enrollment (enrollment.id)}
			<div class="flex items-center justify-between p-3 rounded-lg border bg-card">
				<div class="min-w-0 flex-1">
					<p class="text-sm font-medium">{enrollment.email}</p>
					<p class="text-xs font-mono text-muted-foreground mt-0.5 truncate">
						{enrollment.commitment ? truncateCommitment(enrollment.commitment, 30) : '—'}
					</p>
				</div>
				<div class="shrink-0 ml-3">
					{#if enrollment.hasVoted}
						<Badge variant="default" class="bg-green-600 hover:bg-green-700">Votó</Badge>
					{:else}
						<Badge variant="outline">Sin voto</Badge>
					{/if}
				</div>
			</div>
		{/each}
	</div>
{/if}
