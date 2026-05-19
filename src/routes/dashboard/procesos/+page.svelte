<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter,
		DialogClose
	} from '$lib/components/ui/dialog';
	import { Plus } from '@lucide/svelte';
	import ProcessTable from '$lib/sections/dashboard/ProcessTable.svelte';
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

	<!-- Process Table -->
	<ProcessTable processes={data.processes} onDelete={handleDeleteClick} />
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
