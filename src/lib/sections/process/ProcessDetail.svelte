<script lang="ts">
	import ProcessHeader from './ProcessHeader.svelte';
	import ProcessTimeline from './ProcessTimeline.svelte';
	import ProcessStats from './ProcessStats.svelte';
	import TeamsList from './TeamsList.svelte';
	import CommitmentView from './CommitmentView.svelte';
	import VotingActionZone from './VotingActionZone.svelte';
	import { useVoting } from '$lib/composables/useVoting.svelte';
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

	// useVoting is hoisted to the assembler (FR-2). Snapshot-at-entry
	// semantics are preserved by passing getters to the composable: when
	// submitVote runs, it pulls the current value of each prop, so a
	// parent re-render that swaps props mid-flow still uses the values
	// that were current when the user clicked Confirmar.
	const voting = useVoting({
		userSub: () => userSub,
		processId: () => process.id,
		groupId: () => process.groupId,
		userEnrollment: () => userEnrollment,
		commitments: () => commitments,
		commitmentsError: () => commitmentsError
	});

	// TeamsList is always rendered (FR-1). It is interactive only in
	// VOTING phase and when the user has not already voted. VotingView
	// (the conditionally rendered action zone) keeps its own useVoting
	// for now — T-7 will replace it with a leaf that receives voting
	// as a prop and the two state machines will unify.
	let teamsDisabled = $derived(voting.hasVoted || voting.votingFlow !== 'idle');
	let teamsInteractive = $derived(isVotingPhase && !voting.hasVoted);
</script>

<section class="pt-24 pb-12">
	<div class="max-w-7xl mx-auto px-6 lg:px-8">
		<ProcessHeader
			name={process.name}
			status={effectiveStatus}
			scope={process.scope}
			description={process.description}
		/>

		<ProcessTimeline
			commitmentStart={process.commitmentStart}
			commitmentEnd={process.commitmentEnd}
			votingStart={process.votingStart}
			votingEnd={process.votingEnd}
			results={process.results}
			{effectiveStatus}
		/>

		<ProcessStats summary={enrollmentSummary} error={enrollmentError} />

		<TeamsList
			{teams}
			selectedTeam={voting.selectedTeam}
			disabled={teamsDisabled}
			onSelect={voting.selectTeam}
			interactive={teamsInteractive}
		/>

		{#if isCommitmentPhase}
			<CommitmentView {process} {userSub} {userEnrollment} />
		{:else if isVotingPhase}
			<VotingActionZone
				{process}
				selectedTeam={voting.selectedTeam}
				voting={{
					flow: voting.votingFlow,
					error: voting.error,
					hasVoted: voting.hasVoted,
					showConfirmDialog: voting.showConfirmDialog,
					openConfirmDialog: voting.openConfirmDialog,
					closeConfirmDialog: voting.closeConfirmDialog,
					submitVote: voting.submitVote,
					resetError: voting.resetError
				}}
			/>
		{/if}
	</div>
</section>
