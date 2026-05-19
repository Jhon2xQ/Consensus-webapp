<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import {
		FileText,
		Users,
		UserCheck,
		Activity,
		Plus,
		ArrowRight,
		TrendingUp,
		Clock
	} from '@lucide/svelte';
	import { electoralProcesses, teams, enrollments } from '$lib/mock';
	import {
		getStatusDistribution,
		getRecentProcesses,
		getActiveProcessCount,
		getVotedCount,
		getMaxStatusCount
	} from '$lib/sections/dashboard/dashboard-utils';
	import { getStatusLabel, getStatusColor } from '$lib/sections/dashboard/process-utils';
	import type { ElectoralProcessStatus } from '$lib/types/electoral-process';

	// Derived data
	let totalProcesses = $derived(electoralProcesses.length);
	let activeProcesses = $derived(getActiveProcessCount(electoralProcesses));
	let totalTeams = $derived(teams.length);
	let totalEnrollments = $derived(enrollments.length);
	let votedCount = $derived(getVotedCount(enrollments));
	let statusDist = $derived(getStatusDistribution(electoralProcesses));
	let recentProcesses = $derived(getRecentProcesses(electoralProcesses, 5));
	let maxStatusCount = $derived(getMaxStatusCount(statusDist));

	type StatCard = {
		title: string;
		value: number;
		icon: typeof FileText;
		description: string;
		variant: 'default' | 'success' | 'warning' | 'info';
	};

	let stats: StatCard[] = $derived([
		{
			title: 'Total Procesos',
			value: totalProcesses,
			icon: FileText,
			description: 'Procesos electorales registrados',
			variant: 'default'
		},
		{
			title: 'Procesos Activos',
			value: activeProcesses,
			icon: Activity,
			description: 'En fase de compromiso o votación',
			variant: 'success'
		},
		{
			title: 'Total Equipos',
			value: totalTeams,
			icon: Users,
			description: 'Equipos participantes',
			variant: 'info'
		},
		{
			title: 'Total Inscripciones',
			value: totalEnrollments,
			icon: UserCheck,
			description: `${votedCount} con voto emitido`,
			variant: 'warning'
		}
	]);

	const statusOrder: ElectoralProcessStatus[] = [
		'COMMITMENT',
		'VOTING',
		'CLOSED',
		'PAUSED',
		'NONE',
		'CANCELLED'
	];

	const statusBarColors: Record<ElectoralProcessStatus, string> = {
		NONE: 'bg-gray-300',
		COMMITMENT: 'bg-blue-500',
		VOTING: 'bg-green-500',
		CLOSED: 'bg-red-400',
		PAUSED: 'bg-amber-400',
		CANCELLED: 'bg-red-300'
	};

	function getVariantClasses(variant: StatCard['variant']): string {
		switch (variant) {
			case 'success':
				return 'border-green-200 bg-green-50/50';
			case 'warning':
				return 'border-amber-200 bg-amber-50/50';
			case 'info':
				return 'border-blue-200 bg-blue-50/50';
			default:
				return '';
		}
	}

	function getIconClasses(variant: StatCard['variant']): string {
		switch (variant) {
			case 'success':
				return 'text-green-600';
			case 'warning':
				return 'text-amber-600';
			case 'info':
				return 'text-blue-600';
			default:
				return 'text-brand-red';
		}
	}
</script>

<div class="space-y-8">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
			<p class="text-muted-foreground mt-1">
				Resumen general de la plataforma de votación descentralizada.
			</p>
		</div>
		<div class="flex items-center gap-3">
			<Button variant="outline" href="/dashboard/procesos">
				Ver todos
				<ArrowRight class="size-4 ml-2" />
			</Button>
			<Button href="/dashboard/procesos/nuevo">
				<Plus class="size-4 mr-2" />
				Crear proceso
			</Button>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
		{#each stats as stat (stat.title)}
			{@const Icon = stat.icon}
			<Card class="transition-all hover:shadow-md {getVariantClasses(stat.variant)}">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-muted-foreground">
						{stat.title}
					</CardTitle>
					<div class="rounded-md p-1.5 {getVariantClasses(stat.variant)}">
						<Icon class="size-4 {getIconClasses(stat.variant)}" />
					</div>
				</CardHeader>
				<CardContent>
					<div class="text-3xl font-bold tracking-tight">{stat.value}</div>
					<p class="text-xs text-muted-foreground mt-1">
						{stat.description}
					</p>
				</CardContent>
			</Card>
		{/each}
	</div>

	<!-- Middle Row: Status Distribution + Quick Actions -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Status Distribution -->
		<Card class="lg:col-span-2">
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-base">
					<TrendingUp class="size-4" />
					Distribución por Estado
				</CardTitle>
			</CardHeader>
			<CardContent>
				{#if totalProcesses === 0}
					<p class="text-sm text-muted-foreground text-center py-8">
						No hay procesos registrados aún.
					</p>
				{:else}
					<div class="space-y-3">
						{#each statusOrder as status (status)}
							{#if statusDist[status] > 0}
								<div class="flex items-center gap-3">
									<span class="text-xs font-medium w-24 shrink-0 text-muted-foreground">
										{getStatusLabel(status)}
									</span>
									<div class="flex-1 h-6 bg-muted rounded-full overflow-hidden">
										<div
											class="h-full rounded-full transition-all duration-500 {statusBarColors[status]}"
											style:width="{(statusDist[status] / maxStatusCount) * 100}%"
										></div>
									</div>
									<span class="text-sm font-semibold w-8 text-right">
										{statusDist[status]}
									</span>
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Quick Actions Card -->
		<Card>
			<CardHeader>
				<CardTitle class="text-base">Acciones Rápidas</CardTitle>
			</CardHeader>
			<CardContent class="space-y-3">
				<Button variant="outline" class="w-full justify-start" href="/dashboard/procesos/nuevo">
					<Plus class="size-4 mr-2" />
					Nuevo Proceso Electoral
				</Button>
				<Button variant="outline" class="w-full justify-start" href="/dashboard/procesos">
					<FileText class="size-4 mr-2" />
					Ver Procesos
				</Button>
				<Separator />
				<div class="pt-1">
					<div class="flex items-center justify-between text-sm">
						<span class="text-muted-foreground">Votos emitidos</span>
						<span class="font-semibold">{votedCount} / {totalEnrollments}</span>
					</div>
					<div class="mt-2 h-2 bg-muted rounded-full overflow-hidden">
						<div
							class="h-full bg-brand-red rounded-full transition-all duration-500"
							style:width="{totalEnrollments > 0 ? (votedCount / totalEnrollments) * 100 : 0}%"
						></div>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Recent Activity -->
	<Card>
		<CardHeader class="flex flex-row items-center justify-between">
			<CardTitle class="flex items-center gap-2 text-base">
				<Clock class="size-4" />
				Actividad Reciente
			</CardTitle>
			<Button variant="ghost" size="sm" href="/dashboard/procesos">
				Ver todos
				<ArrowRight class="size-4 ml-1" />
			</Button>
		</CardHeader>
		<CardContent>
			{#if recentProcesses.length === 0}
				<p class="text-sm text-muted-foreground text-center py-8">
					No hay procesos registrados aún. Creá el primero para comenzar.
				</p>
			{:else}
				<div class="space-y-2">
					{#each recentProcesses as process (process.id)}
						<a
							href="/dashboard/procesos/{process.id}"
							class="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
						>
							<div class="min-w-0 flex-1">
								<p class="font-medium truncate group-hover:text-brand-red transition-colors">
									{process.name}
								</p>
								<p class="text-xs text-muted-foreground mt-0.5">
									{process.scope}
								</p>
							</div>
							<div class="flex items-center gap-3 shrink-0 ml-4">
								<Badge variant="outline" class={getStatusColor(process.estatus)}>
									{getStatusLabel(process.estatus)}
								</Badge>
								<ArrowRight
									class="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
								/>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>
</div>
