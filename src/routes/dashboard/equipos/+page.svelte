<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter,
		DialogClose
	} from '$lib/components/ui/dialog';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Plus, Pencil, Trash2, Users } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';

	let { data, form } = $props();

	$effect(() => {
		const err = form?.errors?._form;
		if (err) toast.error(err);
	});

	let createOpen = $state(false);
	let editOpen = $state(false);
	let deleteOpen = $state(false);
	let editingTeam = $state<{ id: string; name: string; avatarUrl?: string | null } | null>(null);
	let teamToDelete = $state<{ id: string; name: string } | null>(null);

	let createName = $state('');
	let createAvatarUrl = $state('');

	let editName = $state('');
	let editAvatarUrl = $state('');

	const selectedProcessId = $derived(data.selectedProcessId ?? page.url.searchParams.get('processId'));

	function openCreate() {
		createName = '';
		createAvatarUrl = '';
		createOpen = true;
	}

	function openEdit(team: { id: string; name: string; avatarUrl?: string | null }) {
		editingTeam = team;
		editName = team.name;
		editAvatarUrl = team.avatarUrl ?? '';
		editOpen = true;
	}

	function openDelete(team: { id: string; name: string }) {
		teamToDelete = team;
		deleteOpen = true;
	}

	function handleProcessSelect(event: Event) {
		const target = event.target as HTMLSelectElement;
		if (target.value) {
			goto(`/dashboard/equipos?processId=${target.value}`);
		}
	}
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Equipos</h1>
			<p class="text-muted-foreground mt-1">
				Gestiona los equipos de tus procesos electorales.
			</p>
		</div>
		{#if selectedProcessId}
			<Button onclick={openCreate}>
				<Plus class="size-4" />
				Nuevo equipo
			</Button>
		{/if}
	</div>

	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<Users class="size-5" />
				Seleccionar Proceso
			</CardTitle>
		</CardHeader>
		<CardContent>
			<select
				class="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-md border px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] focus-visible:ring-3 w-full outline-none"
				onchange={handleProcessSelect}
			>
				<option value="">{selectedProcessId ? 'Cambiar proceso...' : 'Selecciona un proceso electoral'}</option>
				{#each data.processes ?? [] as process (process.id)}
					<option value={process.id} selected={process.id === selectedProcessId}>{process.name}</option>
				{/each}
			</select>
		</CardContent>
	</Card>

	{#if !selectedProcessId}
		<div class="flex flex-col items-center justify-center py-24 text-center">
			<Users class="size-12 text-muted-foreground/40 mb-4" />
			<h2 class="text-xl font-semibold text-brand-gray-800">Selecciona un proceso</h2>
			<p class="text-brand-gray-400 mt-2">Selecciona un proceso para ver sus equipos.</p>
		</div>
	{:else if !data.teams || data.teams.length === 0}
		<div class="flex flex-col items-center justify-center py-24 text-center">
			<Users class="size-12 text-muted-foreground/40 mb-4" />
			<h2 class="text-xl font-semibold text-brand-gray-800">0 equipos</h2>
			<p class="text-brand-gray-400 mt-2">Este proceso no tiene equipos aún.</p>
			<Button class="mt-4" onclick={openCreate}>
				<Plus class="size-4" />
				Nuevo equipo
			</Button>
		</div>
	{:else}
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Users class="size-5" />
					Equipos ({data.teams.length})
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Nombre</TableHead>
							<TableHead>Avatar</TableHead>
							<TableHead class="w-30 text-right">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each data.teams as team (team.id)}
							<TableRow>
								<TableCell class="font-medium">{team.name}</TableCell>
								<TableCell>
									{#if team.avatarUrl}
										<img
											src={team.avatarUrl}
											alt={team.name}
											class="size-10 rounded-full object-cover"
										/>
									{:else}
										<div class="size-10 rounded-full bg-muted flex items-center justify-center">
											<Users class="size-5 text-muted-foreground" />
										</div>
									{/if}
								</TableCell>
								<TableCell class="text-right">
									<div class="flex items-center justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											onclick={() => openEdit(team)}
											title="Editar"
										>
											<Pencil class="size-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onclick={() => openDelete(team)}
											title="Eliminar"
										>
											<Trash2 class="size-4 text-destructive" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	{/if}
</div>

<!-- Create Team Dialog -->
<Dialog bind:open={createOpen}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Nuevo equipo</DialogTitle>
			<DialogDescription>
				Crea un nuevo equipo para este proceso electoral.
			</DialogDescription>
		</DialogHeader>
		<form method="POST" action="?/crear-equipo" class="space-y-4">
			<input type="hidden" name="processId" value={selectedProcessId ?? ''} />
			<div class="space-y-2">
				<Label for="create-name">Nombre *</Label>
				<Input id="create-name" name="name" placeholder="Nombre del equipo" bind:value={createName} required />
			</div>
			<div class="space-y-2">
				<Label for="create-avatar">Avatar URL (opcional)</Label>
				<Input id="create-avatar" name="avatarUrl" placeholder="https://..." bind:value={createAvatarUrl} />
			</div>
			<DialogFooter>
				<DialogClose>Cancelar</DialogClose>
				<Button type="submit">Crear equipo</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>

<!-- Edit Team Dialog -->
<Dialog bind:open={editOpen}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Editar equipo</DialogTitle>
			<DialogDescription>
				Modifica los datos del equipo.
			</DialogDescription>
		</DialogHeader>
		<form method="POST" action="?/editar-equipo" class="space-y-4">
			<input type="hidden" name="teamId" value={editingTeam?.id ?? ''} />
			<input type="hidden" name="processId" value={selectedProcessId ?? ''} />
			<div class="space-y-2">
				<Label for="edit-name">Nombre *</Label>
				<Input id="edit-name" name="name" placeholder="Nombre del equipo" bind:value={editName} required />
			</div>
			<div class="space-y-2">
				<Label for="edit-avatar">Avatar URL (opcional)</Label>
				<Input id="edit-avatar" name="avatarUrl" placeholder="https://..." bind:value={editAvatarUrl} />
			</div>
			<DialogFooter>
				<DialogClose>Cancelar</DialogClose>
				<Button type="submit">Guardar cambios</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>

<!-- Delete Confirmation Dialog -->
<Dialog bind:open={deleteOpen}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Eliminar equipo</DialogTitle>
			<DialogDescription>
				¿Eliminar este equipo? Esta acción no se puede deshacer.
			</DialogDescription>
		</DialogHeader>
		<form method="POST" action="?/eliminar-equipo" class="space-y-4">
			<input type="hidden" name="teamId" value={teamToDelete?.id ?? ''} />
			<input type="hidden" name="processId" value={selectedProcessId ?? ''} />
			{#if teamToDelete}
				<p class="text-sm text-muted-foreground">
					Estás a punto de eliminar <strong>{teamToDelete.name}</strong>.
				</p>
			{/if}
			<DialogFooter>
				<DialogClose>Cancelar</DialogClose>
				<Button type="submit" variant="destructive">
					<Trash2 class="size-4" />
					Eliminar
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
