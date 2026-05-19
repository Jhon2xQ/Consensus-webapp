<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { FileText, Users, UserCheck, Activity } from '@lucide/svelte';
	import { electoralProcesses, teams, enrollments } from '$lib/mock';

	let totalProcesses = $derived(electoralProcesses.length);
	let activeProcesses = $derived(
		electoralProcesses.filter((p) => p.estatus === 'COMMITMENT' || p.estatus === 'VOTING').length
	);
	let totalTeams = $derived(teams.length);
	let totalEnrollments = $derived(enrollments.length);

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
			description: 'Ciudadanos inscriptos',
			variant: 'warning'
		}
	]);

	function getVariantClasses(variant: StatCard['variant']): string {
		switch (variant) {
			case 'success':
				return 'border-green-200 bg-green-50';
			case 'warning':
				return 'border-amber-200 bg-amber-50';
			case 'info':
				return 'border-blue-200 bg-blue-50';
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
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
		<p class="text-muted-foreground mt-2">
			Resumen general de la plataforma de votación descentralizada.
		</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		{#each stats as stat, i (stat.title)}
			{@const Icon = stat.icon}
			<Card class="{getVariantClasses(stat.variant)} transition-all hover:shadow-md">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-muted-foreground">
						{stat.title}
					</CardTitle>
					<Icon class="size-5 {getIconClasses(stat.variant)}" />
				</CardHeader>
				<CardContent>
					<div class="text-3xl font-bold">{stat.value}</div>
					<p class="text-xs text-muted-foreground mt-1">
						{stat.description}
					</p>
				</CardContent>
			</Card>
		{/each}
	</div>

	<!-- Recent Activity Section -->
	<Card>
		<CardHeader>
			<CardTitle>Procesos Activos</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				{#each electoralProcesses.filter((p) => p.estatus === 'COMMITMENT' || p.estatus === 'VOTING') as process (process.id)}
					<div
						class="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
					>
						<div class="space-y-1">
							<p class="font-medium">{process.name}</p>
							<p class="text-sm text-muted-foreground">
								{process.scope}
							</p>
						</div>
						<Badge
							variant={process.estatus === 'VOTING' ? 'default' : 'secondary'}
							class={process.estatus === 'VOTING'
								? 'bg-green-100 text-green-800 hover:bg-green-100'
								: ''}
						>
							{process.estatus === 'COMMITMENT' ? 'Compromiso' : 'Votación'}
						</Badge>
					</div>
				{/each}
			</div>
		</CardContent>
	</Card>
</div>
