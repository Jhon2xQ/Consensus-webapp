<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import ProcessStats from './ProcessStats.svelte';
	import ProcessTimeline from './ProcessTimeline.svelte';
	import TeamsList from './TeamsList.svelte';
	import type { ElectoralProcess } from '$lib/types/electoral-process';
	import type { Team } from '$lib/types/team';
	import type { EnrollmentSummary } from '$lib/types/enrollment';

	type Props = {
		process: ElectoralProcess;
		teams: Team[];
		enrollmentSummary: EnrollmentSummary | null;
		enrollmentError: boolean;
	};

	let { process, teams, enrollmentSummary, enrollmentError }: Props = $props();
</script>

<!--
	Read-only view shown for non-interactive phases (OPEN, SEALED, COUNTING,
	CLOSED). Mirrors ProcessDetail's read-only layout: timeline at the top,
	teams on the left, voter summary on the right. No buttons, no form, no
	state — just a presentational snapshot of the process.
-->
<ProcessTimeline
	commitmentStart={process.commitmentStart}
	commitmentEnd={process.commitmentEnd}
	votingStart={process.votingStart}
	votingEnd={process.votingEnd}
/>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
	<div class="lg:col-span-2">
		<Card>
			<CardHeader>
				<CardTitle>Equipos</CardTitle>
			</CardHeader>
			<CardContent>
				<TeamsList teams={teams} />
			</CardContent>
		</Card>
	</div>
	<div class="lg:col-span-1">
		<Card>
			<CardHeader>
				<CardTitle>Resumen de votantes</CardTitle>
			</CardHeader>
			<CardContent>
				<ProcessStats summary={enrollmentSummary} error={enrollmentError} />
			</CardContent>
		</Card>
	</div>
</div>
