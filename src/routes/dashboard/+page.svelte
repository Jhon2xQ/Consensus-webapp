<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import {
		FileText,
		Activity,
		TrendingUp
	} from '@lucide/svelte';
	import { electoralProcesses } from '$lib/mock';
	import {
		getStatusDistribution,
		getActiveProcessCount,
		getMaxStatusCount
	} from '$lib/sections/dashboard/dashboard-utils';
	import { getStatusLabel } from '$lib/sections/dashboard/process-utils';
	import type { ElectoralProcessStatus } from '$lib/types/electoral-process';

	// Derived data
	let totalProcesses = $derived(electoralProcesses.length);
	let activeProcesses = $derived(getActiveProcessCount(electoralProcesses));
	let statusDist = $derived(getStatusDistribution(electoralProcesses));
	let maxStatusCount = $derived(getMaxStatusCount(statusDist));

	type StatCard = {
		title: string;
		value: number;
		icon: typeof FileText;
		description: string;
		variant: 'default' | 'success';
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
			description: 'Procesos aún sin cerrar',
			variant: 'success'
		}
	]);

	const statusOrder: ElectoralProcessStatus[] = [
		'OPEN',
		'COMMITMENT',
		'SEALED',
		'VOTING',
		'COUNTING',
		'CLOSED'
	];

	const statusBarColors: Record<ElectoralProcessStatus, string> = {
		OPEN: 'bg-amber-500',
		COMMITMENT: 'bg-blue-500',
		SEALED: 'bg-purple-500',
		VOTING: 'bg-green-500',
		COUNTING: 'bg-orange-500',
		CLOSED: 'bg-red-400'
	};

	function getVariantClasses(variant: StatCard['variant']): string {
		switch (variant) {
			case 'success':
				return 'border-green-200 bg-green-50/50';
			default:
				return '';
		}
	}

	function getIconClasses(variant: StatCard['variant']): string {
		switch (variant) {
			case 'success':
				return 'text-green-600';
			default:
				return 'text-brand-red';
		}
	}
</script>

<div class="space-y-8">
	<!-- Page Header -->
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
		<p class="text-muted-foreground mt-1">
			Resumen general de la plataforma de votación descentralizada.
		</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
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

	<!-- Status Distribution -->
	<Card>
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
</div>
