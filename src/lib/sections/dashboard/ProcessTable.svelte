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
	import { Eye, Pencil, Trash2, FileText } from '@lucide/svelte';
	import { getStatusLabel, getStatusColor, formatDate } from './process-utils';
	import EmptyState from '$lib/components/shared/EmptyState.svelte';
	import type { ElectoralProcess } from '$lib/types/electoral-process';

	type Props = {
		processes: ElectoralProcess[];
		onDelete?: (process: ElectoralProcess) => void;
	};

	let { processes, onDelete }: Props = $props();
</script>

{#if processes.length === 0}
	<EmptyState
		icon={FileText}
		title="No hay procesos electorales"
		description="Creá tu primer proceso electoral para comenzar a gestionar votaciones."
	>
		{#snippet action()}
			<Button size="sm" href="/dashboard/procesos/nuevo">Crear proceso</Button>
		{/snippet}
	</EmptyState>
{:else}
	<!-- Desktop table -->
	<div class="hidden md:block rounded-md border">
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Nombre</TableHead>
					<TableHead>Ámbito</TableHead>
					<TableHead>Estado</TableHead>
					<TableHead class="hidden lg:table-cell">Compromiso</TableHead>
					<TableHead class="hidden xl:table-cell">Votación</TableHead>
					<TableHead class="text-right">Acciones</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each processes as process (process.id)}
					<TableRow>
						<TableCell class="font-medium">{process.name}</TableCell>
						<TableCell>{process.scope}</TableCell>
						<TableCell>
							<Badge variant="outline" class={getStatusColor(process.estatus)}>
								{getStatusLabel(process.estatus)}
							</Badge>
						</TableCell>
						<TableCell class="hidden lg:table-cell text-sm text-muted-foreground">
							{formatDate(process.commitmentStart)} - {formatDate(process.commitmentEnd)}
						</TableCell>
						<TableCell class="hidden xl:table-cell text-sm text-muted-foreground">
							{formatDate(process.votingStart)} - {formatDate(process.votingEnd)}
						</TableCell>
						<TableCell class="text-right">
							<div class="flex items-center justify-end gap-1">
								<Button variant="ghost" size="icon-sm" href="/dashboard/procesos/{process.id}">
									<Eye class="size-4" />
									<span class="sr-only">Ver detalle</span>
								</Button>
								<Button
									variant="ghost"
									size="icon-sm"
									href="/dashboard/procesos/{process.id}/editar"
								>
									<Pencil class="size-4" />
									<span class="sr-only">Editar</span>
								</Button>
								<Button
									variant="ghost"
									size="icon-sm"
									onclick={() => onDelete?.(process)}
								>
									<Trash2 class="size-4 text-destructive" />
									<span class="sr-only">Eliminar</span>
								</Button>
							</div>
						</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>

	<!-- Mobile card list -->
	<div class="md:hidden space-y-3">
		{#each processes as process (process.id)}
			<div class="rounded-lg border bg-card p-4 space-y-3">
				<div class="flex items-start justify-between gap-2">
					<div class="min-w-0 flex-1">
						<p class="font-medium truncate">{process.name}</p>
						<p class="text-xs text-muted-foreground mt-0.5">{process.scope}</p>
					</div>
					<Badge variant="outline" class="shrink-0 {getStatusColor(process.estatus)}">
						{getStatusLabel(process.estatus)}
					</Badge>
				</div>
				<div class="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
					<div>
						<span class="font-medium text-foreground">Compromiso:</span>
						<p>{formatDate(process.commitmentStart)} - {formatDate(process.commitmentEnd)}</p>
					</div>
					<div>
						<span class="font-medium text-foreground">Votación:</span>
						<p>{formatDate(process.votingStart)} - {formatDate(process.votingEnd)}</p>
					</div>
				</div>
				<div class="flex items-center gap-2 pt-1 border-t">
					<Button variant="ghost" size="sm" href="/dashboard/procesos/{process.id}" class="flex-1">
						<Eye class="size-4 mr-1" />
						Ver
					</Button>
					<Button
						variant="ghost"
						size="sm"
						href="/dashboard/procesos/{process.id}/editar"
						class="flex-1"
					>
						<Pencil class="size-4 mr-1" />
						Editar
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onclick={() => onDelete?.(process)}
						class="text-destructive hover:text-destructive"
					>
						<Trash2 class="size-4" />
					</Button>
				</div>
			</div>
		{/each}
	</div>
{/if}
