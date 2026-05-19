<script lang="ts">
	import { enhance } from '$app/forms';
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
	import { ArrowLeft } from '@lucide/svelte';
	import ProcessDetail from '$lib/sections/dashboard/ProcessDetail.svelte';
	import TeamForm from '$lib/sections/dashboard/TeamForm.svelte';
	import type { Team } from '$lib/types/team';

	let { data, form } = $props();

	// Process delete dialog
	let showDeleteDialog = $state(false);

	function handleDeleteClick() {
		showDeleteDialog = true;
	}

	function closeDeleteDialog() {
		showDeleteDialog = false;
	}

	// Team create dialog
	let showCreateTeamDialog = $state(false);
	let createTeamSubmitting = $state(false);

	function openCreateTeamDialog() {
		showCreateTeamDialog = true;
	}

	function closeCreateTeamDialog() {
		showCreateTeamDialog = false;
	}

	// Team edit dialog
	let showEditTeamDialog = $state(false);
	let editingTeam = $state<Team | null>(null);
	let editTeamSubmitting = $state(false);

	function openEditTeamDialog(team: Team) {
		editingTeam = team;
		showEditTeamDialog = true;
	}

	function closeEditTeamDialog() {
		showEditTeamDialog = false;
		editingTeam = null;
	}

	// Team delete dialog
	let showDeleteTeamDialog = $state(false);
	let deletingTeam = $state<Team | null>(null);

	function openDeleteTeamDialog(team: Team) {
		deletingTeam = team;
		showDeleteTeamDialog = true;
	}

	function closeDeleteTeamDialog() {
		showDeleteTeamDialog = false;
		deletingTeam = null;
	}

	// Form enhance handlers
	function handleCreateTeamSubmit() {
		createTeamSubmitting = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			createTeamSubmitting = false;
			closeCreateTeamDialog();
		};
	}

	function handleEditTeamSubmit() {
		editTeamSubmitting = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			editTeamSubmitting = false;
			closeEditTeamDialog();
		};
	}

	function handleDeleteTeamSubmit() {
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			closeDeleteTeamDialog();
		};
	}
</script>

<div class="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-6">
	<!-- Back navigation -->
	<div>
		<Button variant="outline" size="icon" href="/dashboard/procesos">
			<ArrowLeft class="size-4" />
		</Button>
	</div>

	<!-- Process detail -->
	<ProcessDetail
		process={data.process}
		teams={data.teams}
		onDelete={handleDeleteClick}
		onCreateTeam={openCreateTeamDialog}
		onEditTeam={openEditTeamDialog}
		onDeleteTeam={openDeleteTeamDialog}
	/>
</div>

<!-- Process Delete Confirmation Dialog -->
<Dialog bind:open={showDeleteDialog}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Eliminar proceso</DialogTitle>
			<DialogDescription>
				¿Estás seguro de que deseas eliminar el proceso
				<strong>{data.process.name}</strong>? Esta acción no se puede deshacer.
			</DialogDescription>
		</DialogHeader>
		<DialogFooter>
			<DialogClose>
				<Button variant="outline" onclick={closeDeleteDialog}>Cancelar</Button>
			</DialogClose>
			<form method="POST" action="?/delete" onsubmit={closeDeleteDialog}>
				<input type="hidden" name="id" value={data.process.id} />
				<Button type="submit" variant="destructive">Eliminar</Button>
			</form>
		</DialogFooter>
	</DialogContent>
</Dialog>

<!-- Team Create Dialog -->
<Dialog bind:open={showCreateTeamDialog}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Crear equipo</DialogTitle>
			<DialogDescription>
				Agregá un nuevo equipo al proceso electoral "{data.process.name}".
			</DialogDescription>
		</DialogHeader>
		<form method="POST" action="?/createTeam" use:enhance={handleCreateTeamSubmit}>
			<TeamForm
				errors={form?.action === 'createTeam' ? form.errors ?? {} : {}}
				submitting={createTeamSubmitting}
				oncancel={closeCreateTeamDialog}
			/>
		</form>
	</DialogContent>
</Dialog>

<!-- Team Edit Dialog -->
<Dialog bind:open={showEditTeamDialog}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Editar equipo</DialogTitle>
			<DialogDescription>
				Modificá los datos del equipo "{editingTeam?.name}".
			</DialogDescription>
		</DialogHeader>
		<form method="POST" action="?/updateTeam" use:enhance={handleEditTeamSubmit}>
			<input type="hidden" name="teamId" value={editingTeam?.id ?? ''} />
			<TeamForm
				team={editingTeam}
				errors={form?.action === 'updateTeam' ? form.errors ?? {} : {}}
				submitting={editTeamSubmitting}
				oncancel={closeEditTeamDialog}
			/>
		</form>
	</DialogContent>
</Dialog>

<!-- Team Delete Confirmation Dialog -->
<Dialog bind:open={showDeleteTeamDialog}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Eliminar equipo</DialogTitle>
			<DialogDescription>
				¿Estás seguro de que deseas eliminar el equipo
				<strong>{deletingTeam?.name}</strong>? Esta acción no se puede deshacer.
			</DialogDescription>
		</DialogHeader>
		<DialogFooter>
			<DialogClose>
				<Button variant="outline" onclick={closeDeleteTeamDialog}>Cancelar</Button>
			</DialogClose>
			<form method="POST" action="?/deleteTeam" onsubmit={closeDeleteTeamDialog}>
				<input type="hidden" name="teamId" value={deletingTeam?.id ?? ''} />
				<Button type="submit" variant="destructive">Eliminar</Button>
			</form>
		</DialogFooter>
	</DialogContent>
</Dialog>
