<script lang="ts">
	import ProcessDetail from '$lib/sections/process/ProcessDetail.svelte';
	import type { ElectoralProcess, ElectoralProcessStatus } from '$lib/types/electoral-process';
	import type { Team } from '$lib/types/team';
	import type { EnrollmentSummary, Enrollment } from '$lib/types/enrollment';
	import { toast } from 'svelte-sonner';

	type PageData = {
		process: ElectoralProcess;
		liveState: ElectoralProcessStatus;
		teams: Team[];
		enrollmentSummary: EnrollmentSummary | null;
		teamsError: boolean;
		enrollmentError: boolean;
		userSub: string | null;
		userEnrollment: Enrollment | null;
	};

	let { data, form }: { data: PageData; form?: { error?: string } | null } = $props();

	$effect(() => {
		if (form?.error) toast.error(form.error);
	});
</script>

<main>
	<ProcessDetail
		process={data.process}
		liveStatus={data.liveState}
		teams={data.teams}
		enrollmentSummary={data.enrollmentSummary}
		teamsError={data.teamsError}
		enrollmentError={data.enrollmentError}
		userSub={data.userSub}
		userEnrollment={data.userEnrollment}
	/>
</main>
