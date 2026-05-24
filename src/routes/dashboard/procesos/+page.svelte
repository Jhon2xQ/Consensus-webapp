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
	import { Plus, Pencil, Trash2, CircleAlert, Users, UserCheck } from '@lucide/svelte';
	import {
		getStatusLabel,
		getStatusColor,
		formatDateTime
	} from '$lib/sections/dashboard/process-utils';
	import type { ElectoralProcess } from '$lib/types/electoral-process';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { data, form } = $props();

	const SIZE_OPTIONS = [5, 10, 20] as const;

	const rawSize = $derived(Number(page.url.searchParams.get('size') ?? '5'));
	const currentSize = $derived(rawSize === 10 ? 10 : rawSize === 20 ? 20 : 5);

	const successMessage = $derived(page.url.searchParams.get('success'));

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

	<!-- Form action errors -->
	{#if form?.error}
		<div class="p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm">
			{form.error}
		</div>
	{/if}

	<!-- Action success message (from redirect query param) -->
	{#if successMessage}
		<div class="p-4 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm">
			{successMessage}
		</div>
	{/if}

	<!-- Loading skeleton -->
	{#if !data}
		<div class="space-y-2">
			{#each Array(6) as _, i (i)}
				<div class="h-36 animate-pulse bg-muted rounded-lg"></div>
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
		<!-- Single-column table with card rows -->
		<div class="overflow-x-auto">
			<table class="w-full border-separate border-spacing-y-2">
				<thead>
					<tr>
						<th class="text-left px-4 py-2 text-sm font-medium text-muted-foreground">Proceso</th>
					</tr>
				</thead>
				<tbody>
					{#each data.processes as process (process.id)}
						<tr>
							<td class="border rounded-lg p-5 bg-card">
								<div class="space-y-4">
									<!-- Section 1: Name + Description -->
									<div class="space-y-1">
										<h2 class="text-lg font-bold tracking-tight" title={process.name}>
											{process.name}
										</h2>
										{#if process.description}
											<p class="text-sm text-muted-foreground line-clamp-2">
												{process.description}
											</p>
										{/if}
									</div>

									<!-- Section 2: Status Badge -->
									<div>
										<Badge class="text-sm px-4 py-1.5 font-semibold {getStatusColor(process.estatus)}">
											{getStatusLabel(process.estatus)}
										</Badge>
									</div>

									<!-- Section 3: Dates — 3-column grid -->
									<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
										<!-- Compromiso -->
										<div class="space-y-2 border rounded-md p-3 bg-muted/30">
											<p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Compromiso</p>
											<div class="space-y-1">
												<div>
													<span class="text-xs text-muted-foreground">Inicio</span>
													<p class="text-sm font-medium">{formatDateTime(process.commitmentStart)}</p>
												</div>
												<div>
													<span class="text-xs text-muted-foreground">Fin</span>
													<p class="text-sm font-medium">{formatDateTime(process.commitmentEnd)}</p>
												</div>
											</div>
										</div>

										<!-- Votación -->
										<div class="space-y-2 border rounded-md p-3 bg-muted/30">
											<p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Votación</p>
											<div class="space-y-1">
												<div>
													<span class="text-xs text-muted-foreground">Inicio</span>
													<p class="text-sm font-medium">{formatDateTime(process.votingStart)}</p>
												</div>
												<div>
													<span class="text-xs text-muted-foreground">Fin</span>
													<p class="text-sm font-medium">{formatDateTime(process.votingEnd)}</p>
												</div>
											</div>
										</div>

										<!-- Resultados -->
										<div class="space-y-2 border rounded-md p-3 bg-muted/30">
											<p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resultados</p>
											<div>
												<p class="text-sm font-medium">{formatDateTime(process.results)}</p>
											</div>
										</div>
									</div>

									<!-- Section 4: Action Buttons -->
									<div class="flex flex-wrap items-center gap-2 pt-2 border-t">
										<Button
											variant="outline"
											size="sm"
											href="/dashboard/equipos?processId={process.id}"
										>
											<Users class="size-3.5 mr-1" />
											Ver equipos
										</Button>
										<Button
											variant="outline"
											size="sm"
											href="/dashboard/votantes?processId={process.id}"
										>
											<UserCheck class="size-3.5 mr-1" />
											Ver votantes
										</Button>
										<div class="flex-1"></div>
										<Button
											variant="outline"
											size="sm"
											href="/dashboard/procesos/{process.id}/editar"
										>
											<Pencil class="size-3.5 mr-1" />
											Editar
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onclick={() => handleDeleteClick(process)}
										>
											<Trash2 class="size-3.5 mr-1" />
											Eliminar
										</Button>
									</div>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
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
			<form method="POST" action="?/delete" class="space-y-4">
				<input type="hidden" name="id" value={deleteTarget?.id ?? ''} />
				<Button type="submit" variant="destructive">Eliminar</Button>
			</form>
		</DialogFooter>
	</DialogContent>
</Dialog>
