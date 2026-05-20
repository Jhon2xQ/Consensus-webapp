<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter,
		DialogClose
	} from '$lib/components/ui/dialog';
	import { Plus, Pencil, Trash2 } from '@lucide/svelte';
	import { getStatusLabel, getStatusColor, formatDate } from '$lib/sections/dashboard/process-utils';
	import type { ElectoralProcess } from '$lib/types/electoral-process';

	let { data } = $props();

	let deleteTarget = $state<ElectoralProcess | null>(null);
	let showDeleteDialog = $state(false);

	function handleDeleteClick(process: ElectoralProcess) {
		deleteTarget = process;
		showDeleteDialog = true;
	}

	function closeDeleteDialog() {
		showDeleteDialog = false;
		deleteTarget = null;
	}
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Procesos Electorales</h1>
			<p class="text-muted-foreground mt-1">
				Gestiona los procesos electorales de la plataforma.
			</p>
		</div>
		<Button href="/dashboard/procesos/nuevo">
			<Plus class="size-4 mr-2" />
			Crear proceso
		</Button>
	</div>

	<!-- Process Cards — vertical stack (table of cards) -->
	{#if data.processes.length === 0}
		<div class="text-center py-16 text-muted-foreground">
			<p class="text-lg">No hay procesos electorales</p>
			<p class="text-sm mt-1">Creá tu primer proceso electoral para comenzar a gestionar votaciones.</p>
			<Button size="sm" href="/dashboard/procesos/nuevo" class="mt-4">Crear proceso</Button>
		</div>
	{:else}
		<div class="flex flex-col gap-4">
			{#each data.processes as process (process.id)}
				<Card class="flex flex-col">
					<CardHeader class="pb-3">
						<div class="flex items-start justify-between gap-2">
							<CardTitle class="text-lg">{process.name}</CardTitle>
							<Badge variant="outline" class="shrink-0 {getStatusColor(process.estatus)}">
								{getStatusLabel(process.estatus)}
							</Badge>
						</div>
					</CardHeader>
					<CardContent class="flex-1 space-y-3 pb-3">
						<div>
							<span class="text-xs font-medium text-muted-foreground">Ámbito</span>
							<p class="text-sm">{process.scope}</p>
						</div>
						<div>
							<span class="text-xs font-medium text-muted-foreground">Compromiso</span>
							<p class="text-sm">{formatDate(process.commitmentStart)} – {formatDate(process.commitmentEnd)}</p>
						</div>
						<div>
							<span class="text-xs font-medium text-muted-foreground">Votación</span>
							<p class="text-sm">{formatDate(process.votingStart)} – {formatDate(process.votingEnd)}</p>
						</div>
					</CardContent>
					<CardFooter class="flex items-center justify-end gap-2 pt-3 border-t">
						<Button
							variant="ghost"
							size="sm"
							href="/dashboard/procesos/{process.id}/editar"
						>
							<Pencil class="size-4 mr-1" />
							Editar
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onclick={() => handleDeleteClick(process)}
							class="text-destructive hover:text-destructive"
						>
							<Trash2 class="size-4 mr-1" />
							Eliminar
						</Button>
					</CardFooter>
				</Card>
			{/each}
		</div>
	{/if}
</div>

<!-- Delete Confirmation Dialog -->
<Dialog bind:open={showDeleteDialog}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Eliminar proceso</DialogTitle>
			<DialogDescription>
				¿Estás seguro de que deseas eliminar el proceso
				<strong>{deleteTarget?.name}</strong>? Esta acción no se puede deshacer.
			</DialogDescription>
		</DialogHeader>
		<DialogFooter>
			<DialogClose>
				<Button variant="outline" onclick={closeDeleteDialog}>Cancelar</Button>
			</DialogClose>
			<form method="POST" action="?/delete" onsubmit={closeDeleteDialog}>
				<input type="hidden" name="id" value={deleteTarget?.id} />
				<Button type="submit" variant="destructive">Eliminar</Button>
			</form>
		</DialogFooter>
	</DialogContent>
</Dialog>
