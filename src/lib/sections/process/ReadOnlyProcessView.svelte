<script lang="ts">
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
	CLOSED). Timeline first, then inline voter summary, then teams. No cards,
	no grid, no buttons — just a presentational snapshot of the process.
-->
<div class="flex flex-col gap-6">
	<ProcessTimeline
		commitmentStart={process.commitmentStart}
		commitmentEnd={process.commitmentEnd}
		votingStart={process.votingStart}
		votingEnd={process.votingEnd}
		results={process.results}
		effectiveStatus={process.estatus}
	/>

	<ProcessStats summary={enrollmentSummary} error={enrollmentError} />

	<TeamsList teams={teams} />
</div>
