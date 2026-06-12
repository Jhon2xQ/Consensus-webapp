<script lang="ts">
	import ProcessHeader from './ProcessHeader.svelte';
	import ProcessStats from './ProcessStats.svelte';
	import ReadOnlyProcessView from './ReadOnlyProcessView.svelte';
	import CommitmentView from './CommitmentView.svelte';
	import VotingView from './VotingView.svelte';
	import type { ElectoralProcess, ElectoralProcessStatus } from '$lib/types/electoral-process';
	import type { Team } from '$lib/types/team';
	import type { EnrollmentSummary, Enrollment } from '$lib/types/enrollment';

	type Props = {
		process: ElectoralProcess;
		liveStatus?: ElectoralProcessStatus | null;
		teams: Team[];
		enrollmentSummary: EnrollmentSummary | null;
		teamsError: boolean;
		enrollmentError: boolean;
		userSub: string | null;
		userEnrollment: Enrollment | null;
		commitments: string[];
		commitmentsError: boolean;
	};

	let {
		process,
		liveStatus = null,
		teams,
		enrollmentSummary = null,
		teamsError = false,
		enrollmentError = false,
		userSub = null,
		userEnrollment = null,
		commitments,
		commitmentsError = false
	}: Props = $props();

	// Use the live status from the /state endpoint when available; fall back
	// to the snapshot from the detail load. effectiveStatus is the source of
	// truth for the badge and for view selection.
	let effectiveStatus: ElectoralProcessStatus = $derived(liveStatus ?? process.estatus);
	let isCommitmentPhase = $derived(effectiveStatus === 'COMMITMENT');
	let isVotingPhase = $derived(effectiveStatus === 'VOTING');
</script>

<section class="pt-24 pb-12">
	<div class="max-w-7xl mx-auto px-6 lg:px-8">
		<ProcessHeader
			name={process.name}
			status={effectiveStatus}
			scope={process.scope}
			description={process.description}
		/>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div class="lg:col-span-2 flex flex-col gap-6">
				<ReadOnlyProcessView
					{process}
					{teams}
					{enrollmentSummary}
					{enrollmentError}
				/>
			</div>
			<div class="lg:col-span-1">
				<ProcessStats summary={enrollmentSummary} error={enrollmentError} />
			</div>
		</div>

		{#if isCommitmentPhase}
			<CommitmentView {process} {userSub} {userEnrollment} />
		{:else if isVotingPhase}
			<VotingView
				{process}
				{teams}
				{userSub}
				{userEnrollment}
				{commitments}
				{commitmentsError}
			/>
		{/if}
	</div>
</section>
