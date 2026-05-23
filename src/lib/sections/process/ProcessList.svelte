<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Card, CardHeader, CardTitle, CardContent, CardAction } from '$lib/components/ui/card/index.js';
	import { cn } from '$lib/utils.js';
	import type { ElectoralProcess, ElectoralProcessStatus } from '$lib/types/electoral-process.js';

	let { processes }: { processes: ElectoralProcess[] } = $props();

	const STATUS_LABELS: Record<ElectoralProcessStatus, string> = {
		NONE: 'Inactivo',
		COMMITMENT: 'Compromiso',
		VOTING: 'Votación',
		CLOSED: 'Cerrado',
		PAUSED: 'Pausado',
		CANCELLED: 'Cancelado',
	};

	type BadgeStyle = { variant: 'outline' | 'destructive'; class: string };

	const STATUS_STYLES: Record<ElectoralProcessStatus, BadgeStyle> = {
		NONE: { variant: 'outline', class: 'bg-brand-gray-100 text-brand-gray-400 border-brand-gray-200' },
		COMMITMENT: { variant: 'outline', class: 'bg-blue-50 text-blue-700 border-blue-200' },
		VOTING: { variant: 'outline', class: 'bg-green-50 text-green-700 border-green-200' },
		CLOSED: { variant: 'outline', class: 'bg-brand-gray-200 text-brand-gray-800 border-brand-gray-300' },
		PAUSED: { variant: 'outline', class: 'bg-amber-50 text-amber-700 border-amber-200' },
		CANCELLED: { variant: 'destructive', class: '' },
	};

	function parseLocalDate(iso: string): Date {
		if (iso.includes('T')) {
			return new Date(iso);
		}
		const [y, m, d] = iso.split('-').map(Number);
		return new Date(y, (m as number) - 1, d);
	}

	function formatDate(iso: string): string {
		return new Intl.DateTimeFormat('es-AR', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(parseLocalDate(iso));
	}

	function formatDateRange(start: string, end: string): string {
		return `${formatDate(start)} - ${formatDate(end)}`;
	}
</script>

<section class="pt-24 pb-12">
	<div class="max-w-7xl mx-auto px-6 lg:px-8">
		<h1 class="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Procesos Electorales</h1>
		<p class="text-lg md:text-xl text-brand-gray-800">
			Explorá los procesos electorales activos y su estado actual.
		</p>
	</div>
</section>

<section class="pb-24">
	<div class="max-w-7xl mx-auto px-6 lg:px-8">
		<div class="overflow-x-auto">
			<table class="w-full border-separate border-spacing-y-3">
				<tbody>
					{#each processes as process (process.id)}
						<tr>
							<td class="p-0">
								<Card>
									<CardHeader>
										<CardTitle>{process.name}</CardTitle>
										<span class="text-sm text-brand-gray-400">{process.scope}</span>
										<CardAction>
											{@const style = STATUS_STYLES[process.estatus]}
											<Badge variant={style.variant} class={cn(style.class)}>
												{STATUS_LABELS[process.estatus]}
											</Badge>
										</CardAction>
									</CardHeader>
									<CardContent>
										<span class="text-sm text-brand-gray-400">
											{formatDateRange(process.votingStart, process.votingEnd)}
										</span>
									</CardContent>
								</Card>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</section>
