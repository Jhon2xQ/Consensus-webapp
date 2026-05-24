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
	import { Badge } from '$lib/components/ui/badge';
	import { Plus, Trash2, Users } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let { data, form } = $props();

	let createOpen = $state(false);
	let deleteOpen = $state(false);
	let enrollmentToDelete = $state<{ id: string; email: string } | null>(null);

	let createEmail = $state('');

	const selectedProcessId = $derived(data.selectedProcessId ?? page.url.searchParams.get('processId'));

	function openCreate() {
		createEmail = '';
		createOpen = true;
	}

	function openDelete(enrollment: { id: string; email: string }) {
		enrollmentToDelete = enrollment;
		deleteOpen = true;
	}

	function handleProcessSelect(event: Event) {
		const target = event.target as HTMLSelectElement;
		if (target.value) {
			goto(`/dashboard/votantes?processId=${target.value}`);
		}
	}
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Votantes</h1>
			<p class="text-muted-foreground mt-1">
				Gestiona los votantes de tus procesos electorales.
			</p>
		</div>
		{#if selectedProcessId}
			<Button onclick={openCreate}>
				<Plus class="size-4" />
				Nuevo votante
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
			<p class="text-brand-gray-400 mt-2">Selecciona un proceso para ver sus votantes.</p>
		</div>
	{:else if !data.enrollments || data.enrollments.length === 0}
		<div class="flex flex-col items-center justify-center py-24 text-center">
			<Users class="size-12 text-muted-foreground/40 mb-4" />
			<h2 class="text-xl font-semibold text-brand-gray-800">0 votantes</h2>
			<p class="text-brand-gray-400 mt-2">Este proceso no tiene votantes aún.</p>
			<Button class="mt-4" onclick={openCreate}>
				<Plus class="size-4" />
				Nuevo votante
			</Button>
		</div>
	{:else}
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Users class="size-5" />
					Votantes ({data.enrollments.length})
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Email</TableHead>
							<TableHead>Estado</TableHead>
							<TableHead class="w-[80px] text-right">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each data.enrollments as enrollment (enrollment.id)}
							<TableRow>
								<TableCell class="font-medium">{enrollment.email}</TableCell>
								<TableCell>
									{#if enrollment.hasVoted}
										<Badge variant="default" class="bg-green-100 text-green-800 hover:bg-green-100">
											Votó
										</Badge>
									{:else}
										<Badge variant="secondary">
											Pendiente
										</Badge>
									{/if}
								</TableCell>
								<TableCell class="text-right">
									<div class="flex items-center justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											onclick={() => openDelete(enrollment)}
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

<!-- Create Enrollment Dialog -->
<Dialog bind:open={createOpen}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Nuevo votante</DialogTitle>
			<DialogDescription>
				Agrega un votante por email para este proceso electoral.
			</DialogDescription>
		</DialogHeader>
		<form method="POST" action="?/crear-votante" class="space-y-4">
			<input type="hidden" name="processId" value={selectedProcessId ?? ''} />
			<div class="space-y-2">
				<Label for="create-email">Email *</Label>
				<Input
					id="create-email"
					name="email"
					type="email"
					placeholder="usuario@ejemplo.com"
					bind:value={createEmail}
					required
				/>
				<p class="text-xs text-muted-foreground">Debe ser un email válido (ej. usuario@dominio.com).</p>
			</div>
			<DialogFooter>
				<DialogClose>Cancelar</DialogClose>
				<Button type="submit">Agregar votante</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>

<!-- Delete Confirmation Dialog -->
<Dialog bind:open={deleteOpen}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Eliminar votante</DialogTitle>
			<DialogDescription>
				¿Eliminar este votante? Esta acción no se puede deshacer.
			</DialogDescription>
		</DialogHeader>
		<form method="POST" action="?/eliminar-votante" class="space-y-4">
			<input type="hidden" name="enrollmentId" value={enrollmentToDelete?.id ?? ''} />
			<input type="hidden" name="processId" value={selectedProcessId ?? ''} />
			{#if enrollmentToDelete}
				<p class="text-sm text-muted-foreground">
					Estás a punto de eliminar a <strong>{enrollmentToDelete.email}</strong>.
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
