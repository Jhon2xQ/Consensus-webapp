<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter
	} from '$lib/components/ui/dialog';
	import { Plus } from '@lucide/svelte';
	import TeamTable from './TeamTable.svelte';
	import type { Team } from '$lib/types/team';

	type Props = {
		allTeams: Team[];
		isEditMode: boolean;
		processId: string | null;
		onadd?: (team: Team) => void;
		ondelete?: (team: Team) => void;
	};

	let {
		allTeams = $bindable([]),
		isEditMode = false,
		processId = null,
		onadd,
		ondelete
	}: Props = $props();

	let teamCount = $derived(allTeams.length);

	let showAddTeamDialog = $state(false);
	let newTeamName = $state('');
	let newTeamAvatarUrl = $state('');
	let teamSubmitting = $state(false);
	let teamFormErrors = $state<Record<string, string>>({});

	function openAddTeamDialog() {
		newTeamName = '';
		newTeamAvatarUrl = '';
		teamFormErrors = {};
		showAddTeamDialog = true;
	}

	function closeAddTeamDialog() {
		showAddTeamDialog = false;
	}

	async function handleAddTeam() {
		const e: Record<string, string> = {};
		if (!newTeamName.trim()) {
			e.name = 'El nombre del equipo es obligatorio';
		} else if (newTeamName.trim().length < 2) {
			e.name = 'El nombre debe tener al menos 2 caracteres';
		} else if (newTeamName.trim().length > 100) {
			e.name = 'El nombre no puede exceder 100 caracteres';
		}

		if (Object.keys(e).length > 0) {
			teamFormErrors = e;
			return;
		}
		teamFormErrors = {};

		if (isEditMode && processId) {
			teamSubmitting = true;
			try {
				const formData = new FormData();
				formData.append('teamName', newTeamName.trim());
				if (newTeamAvatarUrl.trim()) {
					formData.append('avatarUrl', newTeamAvatarUrl.trim());
				}

				const res = await fetch('?/agregarEquipo', {
					method: 'POST',
					body: formData
				});
				const json = await res.json();

				if (json.type === 'failure') {
					teamFormErrors = { name: json.data?.errors?.teamName ?? json.data?.errors?._form ?? 'Error al crear el equipo' };
				} else if (json.success) {
					closeAddTeamDialog();
					await invalidateAll();
				} else {
					teamFormErrors = { name: 'Error inesperado al crear el equipo' };
				}
			} catch {
				teamFormErrors = { name: 'Error de conexión al crear el equipo' };
			} finally {
				teamSubmitting = false;
			}
		} else {
			// Create mode: store locally
			const localTeam: Team = {
				id: `local-${crypto.randomUUID()}`,
				name: newTeamName.trim(),
				avatarUrl: newTeamAvatarUrl.trim() || undefined,
				electoralProcessId: ''
			};
			allTeams = [...allTeams, localTeam];
			closeAddTeamDialog();
		}
	}

	async function handleDeleteTeam(team: Team) {
		if (isEditMode && processId && !team.id.startsWith('local-')) {
			try {
				const formData = new FormData();
				formData.append('teamId', team.id);

				await fetch('?/eliminarEquipo', {
					method: 'POST',
					body: formData
				});
				await invalidateAll();
			} catch {
				// Silently fail
			}
		} else {
			allTeams = allTeams.filter((t) => t.id !== team.id);
		}
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-semibold">Equipos del Proceso</h3>
		<span class="text-sm text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
			{teamCount} equipo{teamCount !== 1 ? 's' : ''}
		</span>
	</div>

	<TeamTable teams={allTeams} onDelete={handleDeleteTeam} />

	<div>
		<Button
			type="button"
			variant="outline"
			size="sm"
			onclick={openAddTeamDialog}
		>
			<Plus class="size-4" />
			Agregar equipo
		</Button>
	</div>
</div>

<!-- Team Add Dialog -->
<Dialog bind:open={showAddTeamDialog}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Crear equipo</DialogTitle>
			<DialogDescription>
				Agregá un nuevo equipo al proceso electoral.
			</DialogDescription>
		</DialogHeader>
		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="stepper-team-name">Nombre del equipo *</Label>
				<Input
					id="stepper-team-name"
					bind:value={newTeamName}
					placeholder="Ej: Frente Nacional"
					aria-invalid={!!teamFormErrors.name}
				/>
				{#if teamFormErrors.name}
					<p class="text-sm text-destructive">{teamFormErrors.name}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for="stepper-team-avatar">URL del avatar (opcional)</Label>
				<Input
					id="stepper-team-avatar"
					bind:value={newTeamAvatarUrl}
					placeholder="https://ejemplo.com/avatar.png"
					type="url"
				/>
			</div>
		</div>
		<DialogFooter>
			<Button type="button" variant="outline" onclick={closeAddTeamDialog}>
				Cancelar
			</Button>
			<Button type="button" onclick={handleAddTeam} disabled={teamSubmitting}>
				{#if teamSubmitting}
					Creando...
				{:else}
					Crear equipo
				{/if}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
