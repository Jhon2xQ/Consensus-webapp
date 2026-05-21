<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter,
		DialogClose
	} from '$lib/components/ui/dialog';
	import { Plus, Pencil, Trash2, CircleAlert } from '@lucide/svelte';
	import { getStatusLabel, getStatusColor, formatDate } from '$lib/sections/dashboard/process-utils';
	import type { ElectoralProcess } from '$lib/types/electoral-process';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { data } = $props();

	const SIZE_OPTIONS = [5, 10, 20] as const;

	const rawSize = $derived(Number(page.url.searchParams.get('size') ?? '5'));
	const currentSize = $derived(
		rawSize === 10 ? 10 : rawSize === 20 ? 20 : 5
	);

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

	function changeSize(size: number) {
		goto(`?size=${size}`);
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
		<div class="flex items-center gap-3">
			<!-- Size selector -->
			<div class="flex items-center gap-0.5 border rounded-lg p-1 bg-muted/50">
				{#each SIZE_OPTIONS as sizeOption (sizeOption)}
					<button
						class="px-3 py-1 text-sm rounded-md transition-colors cursor-pointer
							{currentSize === sizeOption
							? 'bg-background shadow-sm font-medium text-foreground'
							: 'text-muted-foreground hover:text-foreground'}"
						onclick={() => changeSize(sizeOption)}
					>
						{sizeOption}
					</button>
				{/each}
			</div>
			<Button href="/dashboard/procesos/nuevo">
				<Plus class="size-4 mr-2" />
				Crear proceso
			</Button>
		</div>
	</div>

	<!-- Loading skeleton -->
	{#if !data}
		<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
			{#each Array(6) as _, i (i)}
				<div class="h-24 animate-pulse bg-muted rounded-xl"></div>
			{/each}
		</div>
	{:else if data.error}
		<!-- Error state -->
		<div class="max-w-md mx-auto">
			<div class="p-6 rounded-xl border bg-card text-center space-y-4">
				<CircleAlert class="size-8 text-destructive mx-auto" />
				<p class="text-sm text-muted-foreground">{data.error}</p>
				<Button variant="outline" onclick={() => window.location.reload()}>
					Reintentar
				</Button>
			</div>
		</div>
	{:else if data.processes.length === 0}
		<!-- Empty state -->
		<div class="text-center py-16 text-muted-foreground">
			<p class="text-lg">No hay procesos electorales</p>
			<p class="text-sm mt-1">Creá tu primer proceso electoral para comenzar a gestionar votaciones.</p>
			<Button size="sm" href="/dashboard/procesos/nuevo" class="mt-4">Crear proceso</Button>
		</div>
	{:else}
		<!-- Process Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
			{#each data.processes as process (process.id)}
				<div class="p-4 rounded-xl border bg-card space-y-3">
					<!-- Row 1: name + badge + edit -->
					<div class="flex items-center justify-between gap-2">
						<span class="font-semibold truncate flex-1" title={process.name}>{process.name}</span>
						<Badge variant="outline" class="shrink-0 {getStatusColor(process.estatus)}">
							{getStatusLabel(process.estatus)}
						</Badge>
						<Button
							variant="ghost"
							size="icon-sm"
							href="/dashboard/procesos/{process.id}/editar"
						>
							<Pencil class="size-4" />
						</Button>
					</div>
					<!-- Row 2: scope · voting dates + delete -->
					<div class="flex items-center justify-between gap-2">
						<p class="text-xs text-muted-foreground truncate">
							{process.scope} · {formatDate(process.votingStart)} – {formatDate(process.votingEnd)}
						</p>
						<Button
							variant="ghost"
							size="icon-sm"
							class="text-destructive hover:text-destructive shrink-0"
							onclick={() => handleDeleteClick(process)}
						>
							<Trash2 class="size-4" />
						</Button>
					</div>
				</div>
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
