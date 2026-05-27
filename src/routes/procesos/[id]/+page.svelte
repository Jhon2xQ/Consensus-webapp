<script lang="ts">
	import ProcessDetail from '$lib/sections/process/ProcessDetail.svelte';
	import type { ElectoralProcess } from '$lib/types/electoral-process';
	import type { Team } from '$lib/types/team';
	import type { EnrollmentSummary } from '$lib/types/enrollment';

	type PageData = {
		process: ElectoralProcess;
		teams: Team[];
		enrollmentSummary: EnrollmentSummary | null;
		teamsError: boolean;
		enrollmentError: boolean;
	};

	let { data }: { data: PageData } = $props();
</script>

<main>
	<ProcessDetail
		process={data.process}
		teams={data.teams}
		enrollmentSummary={data.enrollmentSummary}
		teamsError={data.teamsError}
		enrollmentError={data.enrollmentError}
	/>
</main>
