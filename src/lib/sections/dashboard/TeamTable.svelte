<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Pencil, Trash2, Users } from '@lucide/svelte';
	import { getTeamInitials } from './team-utils';
	import EmptyState from '$lib/components/shared/EmptyState.svelte';
	import type { Team } from '$lib/types/team';

	type Props = {
		teams: Team[];
		onEdit?: (team: Team) => void;
		onDelete?: (team: Team) => void;
	};

	let { teams, onEdit, onDelete }: Props = $props();
</script>

{#if teams.length === 0}
	<EmptyState
		icon={Users}
		title="No hay equipos registrados"
		description="Creá el primer equipo para este proceso electoral."
	/>
{:else}
	<!-- Desktop table -->
	<div class="hidden sm:block rounded-md border">
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead class="w-12"></TableHead>
					<TableHead>Nombre</TableHead>
					<TableHead class="text-right">Acciones</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each teams as team (team.id)}
					<TableRow>
						<TableCell>
							{#if team.avatarUrl}
								<img
									src={team.avatarUrl}
									alt={team.name}
									class="size-8 rounded-full object-cover"
								/>
							{:else}
								<div
									class="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground"
								>
									{getTeamInitials(team.name)}
								</div>
							{/if}
						</TableCell>
						<TableCell class="font-medium">{team.name}</TableCell>
						<TableCell class="text-right">
							<div class="flex items-center justify-end gap-1">
								<Button
									variant="ghost"
									size="icon-sm"
									onclick={() => onEdit?.(team)}
								>
									<Pencil class="size-4" />
									<span class="sr-only">Editar equipo</span>
								</Button>
								<Button
									variant="ghost"
									size="icon-sm"
									onclick={() => onDelete?.(team)}
								>
									<Trash2 class="size-4 text-destructive" />
									<span class="sr-only">Eliminar equipo</span>
								</Button>
							</div>
						</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>

	<!-- Mobile card list -->
	<div class="sm:hidden space-y-2">
		{#each teams as team (team.id)}
			<div class="flex items-center justify-between p-3 rounded-lg border bg-card">
				<div class="flex items-center gap-3 min-w-0">
					{#if team.avatarUrl}
						<img
							src={team.avatarUrl}
							alt={team.name}
							class="size-8 rounded-full object-cover shrink-0"
						/>
					{:else}
						<div
							class="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0"
						>
							{getTeamInitials(team.name)}
						</div>
					{/if}
					<p class="text-sm font-medium truncate">{team.name}</p>
				</div>
				<div class="flex items-center gap-1 shrink-0 ml-2">
					<Button variant="ghost" size="icon-sm" onclick={() => onEdit?.(team)}>
						<Pencil class="size-4" />
						<span class="sr-only">Editar equipo</span>
					</Button>
					<Button variant="ghost" size="icon-sm" onclick={() => onDelete?.(team)}>
						<Trash2 class="size-4 text-destructive" />
						<span class="sr-only">Eliminar equipo</span>
					</Button>
				</div>
			</div>
		{/each}
	</div>
{/if}
