<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Pencil, Trash2, Calendar, MapPin, FileText, Plus } from '@lucide/svelte';
	import { getStatusLabel, getStatusColor, formatDate } from './process-utils';
	import TeamTable from './TeamTable.svelte';
	import type { ElectoralProcess } from '$lib/types/electoral-process';
	import type { Team } from '$lib/types/team';

	type Props = {
		process: ElectoralProcess;
		teams?: Team[];
		onDelete?: () => void;
		onCreateTeam?: () => void;
		onEditTeam?: (team: Team) => void;
		onDeleteTeam?: (team: Team) => void;
	};

	let {
		process,
		teams = [],
		onDelete,
		onCreateTeam,
		onEditTeam,
		onDeleteTeam
	}: Props = $props();
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div class="space-y-1">
			<div class="flex items-center gap-3">
				<h1 class="text-2xl font-bold tracking-tight">{process.name}</h1>
				<Badge variant="outline" class={getStatusColor(process.estatus)}>
					{getStatusLabel(process.estatus)}
				</Badge>
			</div>
			<p class="text-muted-foreground flex items-center gap-2">
				<MapPin class="size-4" />
				{process.scope}
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" href="/dashboard/procesos/{process.id}/editar">
				<Pencil class="size-4 mr-2" />
				Editar
			</Button>
			<Button variant="destructive" onclick={onDelete}>
				<Trash2 class="size-4 mr-2" />
				Eliminar
			</Button>
		</div>
	</div>

	<Tabs value="info">
		<TabsList>
			<TabsTrigger value="info">Información</TabsTrigger>
			<TabsTrigger value="equipos">Equipos ({teams.length})</TabsTrigger>
			<TabsTrigger value="inscripciones">Inscripciones</TabsTrigger>
		</TabsList>

		<TabsContent value="info" class="space-y-6 mt-6">
			<!-- Description -->
			{#if process.description}
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2 text-base">
							<FileText class="size-4" />
							Descripción
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-muted-foreground">{process.description}</p>
					</CardContent>
				</Card>
			{/if}

			<!-- Dates Card -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2 text-base">
						<Calendar class="size-4" />
						Fechas del Proceso
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						<div class="space-y-1">
							<p class="text-sm font-medium text-muted-foreground">Compromiso</p>
							<p class="text-sm">
								{formatDate(process.commitmentStart)} - {formatDate(process.commitmentEnd)}
							</p>
						</div>
						<div class="space-y-1">
							<p class="text-sm font-medium text-muted-foreground">Votación</p>
							<p class="text-sm">
								{formatDate(process.votingStart)} - {formatDate(process.votingEnd)}
							</p>
						</div>
						<div class="space-y-1">
							<p class="text-sm font-medium text-muted-foreground">Resultados</p>
							<p class="text-sm">{formatDate(process.results)}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</TabsContent>

		<TabsContent value="equipos" class="mt-6">
			<Card>
				<CardHeader>
					<div class="flex items-center justify-between">
						<CardTitle class="flex items-center gap-2 text-base">
							Equipos del proceso
						</CardTitle>
						<Button size="sm" onclick={() => onCreateTeam?.()}>
							<Plus class="size-4 mr-1" />
							Crear equipo
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<TeamTable {teams} onEdit={onEditTeam} onDelete={onDeleteTeam} />
				</CardContent>
			</Card>
		</TabsContent>

		<TabsContent value="inscripciones" class="mt-6">
			<Card>
				<CardContent class="pt-6">
					<p class="text-muted-foreground text-center py-8">
						Las inscripciones se gestionan en la
						<a href="/dashboard/procesos/{process.id}/inscripciones" class="text-primary underline">
							página de inscripciones
						</a>.
					</p>
				</CardContent>
			</Card>
		</TabsContent>
	</Tabs>
</div>
