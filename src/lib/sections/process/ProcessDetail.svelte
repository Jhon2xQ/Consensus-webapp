<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { cn } from '$lib/utils.js';
	import {
		ArrowLeft,
		Calendar,
		Vote,
		Users,
		Clock,
		CheckCircle
	} from 'lucide-svelte';
	import type { ElectoralProcess, ElectoralProcessStatus } from '$lib/types/electoral-process';
	import type { Team } from '$lib/types/team';
	import type { EnrollmentSummary } from '$lib/types/enrollment';

	type Props = {
		process: ElectoralProcess;
		teams: Team[];
		enrollmentSummary: EnrollmentSummary | null;
		teamsError: boolean;
		enrollmentError: boolean;
	};

	let {
		process,
		teams,
		enrollmentSummary = null,
		teamsError = false,
		enrollmentError = false
	}: Props = $props();

	// ── Status helpers (inline, matching ProcessList pattern) ──
	function getStatusLabel(estatus: ElectoralProcessStatus): string {
		const labels: Record<ElectoralProcessStatus, string> = {
			NONE: 'Sin estado',
			COMMITMENT: 'Compromiso',
			VOTING: 'Votación',
			CLOSED: 'Cerrado'
		};
		return labels[estatus] ?? estatus;
	}

	function getStatusColor(estatus: ElectoralProcessStatus): string {
		const colors: Record<ElectoralProcessStatus, string> = {
			NONE: 'bg-gray-100 text-gray-600 border-gray-200',
			COMMITMENT: 'bg-blue-50 text-blue-700 border-blue-200',
			VOTING: 'bg-green-50 text-green-700 border-green-200',
			CLOSED: 'bg-red-50 text-red-700 border-red-200'
		};
		return colors[estatus] ?? colors.NONE;
	}

	// ── Date formatting (inline) ──
	function formatDateTime(iso: string): string {
		return new Intl.DateTimeFormat('es-AR', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(iso));
	}

	// ── Team initials ──
	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((w) => w[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<section class="pt-24 pb-12">
	<div class="max-w-7xl mx-auto px-6 lg:px-8">
		<!-- Back link -->
		<a href="/procesos" class="inline-flex items-center gap-1.5 text-sm text-brand-gray-400 hover:text-brand-red transition-colors mb-8">
			<ArrowLeft class="size-4" />
			Volver a procesos
		</a>

		<!-- Header: Name + Status Badge -->
		<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
			<h1 class="text-4xl md:text-5xl font-bold tracking-tighter text-brand-black">
				{process.name}
			</h1>
			<Badge
				variant="outline"
				class={cn('text-xs font-semibold px-3 py-1 w-fit', getStatusColor(process.estatus))}
			>
				{getStatusLabel(process.estatus)}
			</Badge>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Left column: Process Info + Teams -->
			<div class="lg:col-span-2 flex flex-col gap-6">
				<!-- Process Info Card -->
				<Card>
					<CardHeader>
						<CardTitle>Información del proceso</CardTitle>
					</CardHeader>
					<CardContent class="flex flex-col gap-4">
						{#if process.description !== null}
							<p class="text-sm text-brand-gray-800 leading-relaxed">
								{process.description}
							</p>
						{/if}

						<div class="flex items-center gap-2 text-sm">
							<span class="font-medium text-brand-black">Alcance:</span>
							<span class="text-brand-gray-600">{process.scope}</span>
						</div>

						<!-- Timeline: 2×2 grid -->
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
							<!-- Compromiso -->
							<div class="rounded-lg border border-brand-gray-200/60 bg-brand-gray-50/30 p-4 flex flex-col gap-2">
								<div class="flex items-center gap-1.5 text-[11px] font-semibold text-brand-gray-400 uppercase tracking-wider">
									<Calendar class="size-3.5" />
									Compromiso
								</div>
								<div class="space-y-1.5">
									<div>
										<span class="text-[11px] text-brand-gray-400 uppercase tracking-wider">Inicio</span>
										<p class="text-sm text-brand-black font-medium">{formatDateTime(process.commitmentStart)}</p>
									</div>
									<div>
										<span class="text-[11px] text-brand-gray-400 uppercase tracking-wider">Fin</span>
										<p class="text-sm text-brand-black font-medium">{formatDateTime(process.commitmentEnd)}</p>
									</div>
								</div>
							</div>

							<!-- Votación -->
							<div class="rounded-lg border border-brand-gray-200/60 bg-brand-gray-50/30 p-4 flex flex-col gap-2">
								<div class="flex items-center gap-1.5 text-[11px] font-semibold text-brand-gray-400 uppercase tracking-wider">
									<Vote class="size-3.5" />
									Votación
								</div>
								<div class="space-y-1.5">
									<div>
										<span class="text-[11px] text-brand-gray-400 uppercase tracking-wider">Inicio</span>
										<p class="text-sm text-brand-black font-medium">{formatDateTime(process.votingStart)}</p>
									</div>
									<div>
										<span class="text-[11px] text-brand-gray-400 uppercase tracking-wider">Fin</span>
										<p class="text-sm text-brand-black font-medium">{formatDateTime(process.votingEnd)}</p>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<!-- Teams Card -->
				<Card>
					<CardHeader>
						<CardTitle>Equipos</CardTitle>
					</CardHeader>
					<CardContent>
						{#if teamsError || teams.length === 0}
							<div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
								<Users class="size-10 mb-3 opacity-40" />
								<p class="text-sm font-medium">Sin equipos</p>
							</div>
						{:else}
							<div class="flex flex-col gap-3">
								{#each teams as team (team.id)}
									<div class="flex items-center gap-3 p-3 rounded-lg border border-brand-gray-200/60">
										<!-- Avatar placeholder (initials circle) -->
										<div class="size-9 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center text-xs font-bold shrink-0">
											{getInitials(team.name)}
										</div>
										<span class="text-sm font-medium text-brand-black">{team.name}</span>
									</div>
								{/each}
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>

			<!-- Right column: Voter Summary -->
			<div class="lg:col-span-1">
				<Card>
					<CardHeader>
						<CardTitle>Resumen de votantes</CardTitle>
					</CardHeader>
					<CardContent>
						{#if enrollmentError}
							<p class="text-sm text-muted-foreground text-center py-4">No disponible</p>
						{:else}
							<div class="grid grid-cols-1 gap-3">
								<!-- Participants -->
								<div class="flex items-center gap-3 p-4 rounded-lg border border-brand-gray-200/60 bg-brand-gray-50/30">
									<Users class="size-5 text-brand-red shrink-0" />
									<div>
										<p class="text-2xl font-bold text-brand-black tabular-nums">
											{enrollmentSummary?.totalParticipants ?? 0}
										</p>
										<p class="text-xs text-brand-gray-400">Participantes</p>
									</div>
								</div>

								<!-- Commitments -->
								<div class="flex items-center gap-3 p-4 rounded-lg border border-brand-gray-200/60 bg-brand-gray-50/30">
									<Clock class="size-5 text-brand-red shrink-0" />
									<div>
										<p class="text-2xl font-bold text-brand-black tabular-nums">
											{enrollmentSummary?.totalCommitments ?? 0}
										</p>
										<p class="text-xs text-brand-gray-400">Compromisos</p>
									</div>
								</div>

								<!-- Voted -->
								<div class="flex items-center gap-3 p-4 rounded-lg border border-brand-gray-200/60 bg-brand-gray-50/30">
									<CheckCircle class="size-5 text-brand-red shrink-0" />
									<div>
										<p class="text-2xl font-bold text-brand-black tabular-nums">
											{enrollmentSummary?.totalVoted ?? 0}
										</p>
										<p class="text-xs text-brand-gray-400">Votaron</p>
									</div>
								</div>
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
</section>
