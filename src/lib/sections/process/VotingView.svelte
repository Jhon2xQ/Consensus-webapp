<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Vote, Loader2 } from '@lucide/svelte';
	import { useVoting } from '$lib/composables/useVoting.svelte';
	import { VOTING_STAGE_MESSAGE } from '$lib/types/proof';
	import TeamsList from './TeamsList.svelte';
	import VoteConfirmationDialog from './VoteConfirmationDialog.svelte';
	import type { ElectoralProcess } from '$lib/types/electoral-process';
	import type { Team } from '$lib/types/team';
	import type { Enrollment } from '$lib/types/enrollment';

	type Props = {
		process: ElectoralProcess;
		teams: Team[];
		userSub: string | null;
		userEnrollment: Enrollment | null;
		commitments: string[];
		commitmentsError: boolean;
	};

	let {
		process,
		teams,
		userSub,
		userEnrollment,
		commitments,
		commitmentsError
	}: Props = $props();

	// Getter functions keep the composable's snapshot-at-entry semantics intact:
	// when submitVote runs, it pulls the current value of each prop, so a
	// parent re-render that swaps props mid-flow still uses the values that
	// were current when the user clicked Confirmar.
	const voting = useVoting({
		userSub: () => userSub,
		processId: () => process.id,
		groupId: () => process.groupId,
		userEnrollment: () => userEnrollment,
		commitments: () => commitments,
		commitmentsError: () => commitmentsError
	});

	// Close the confirmation dialog before kicking off the flow — mirrors the
	// original `confirmVote()` in ProcessDetail.svelte, which set
	// `showVoteDialog = false` before starting the vote. Without this, the
	// dialog overlay would block the "Reintentar" button on error.
	function handleConfirmVote() {
		voting.closeConfirmDialog();
		voting.submitVote();
	}
</script>

<TeamsList
	teams={teams}
	selectedTeam={voting.selectedTeam}
	disabled={voting.hasVoted || voting.votingFlow !== 'idle'}
	onSelect={voting.selectTeam}
/>

<VoteConfirmationDialog
	open={voting.showConfirmDialog}
	teamName={voting.selectedTeam?.name ?? null}
	onConfirm={handleConfirmVote}
	onClose={voting.closeConfirmDialog}
/>

<div class="mt-6 space-y-3">
	{#if voting.hasVoted}
		<Button disabled class="w-full" variant="default">
			<Vote class="size-4 mr-2" />
			Ya votaste
		</Button>
	{:else if voting.votingFlow === 'idle'}
		<Button
			onclick={voting.selectedTeam ? voting.openConfirmDialog : undefined}
			disabled={!voting.selectedTeam || !process.groupId}
			class="w-full bg-brand-red hover:bg-brand-red/90 text-white"
			variant="default"
		>
			{#if !process.groupId}
				El grupo on-chain no está configurado
			{:else if voting.selectedTeam}
				Votar por {voting.selectedTeam.name}
			{:else}
				Elegí un equipo para votar
			{/if}
		</Button>
	{:else}
		<!-- Verifying / building / submitting / success states -->
		<Button disabled class="w-full" variant="default">
			<Loader2 class="size-4 mr-2 animate-spin" />
			{VOTING_STAGE_MESSAGE[voting.votingFlow]}
		</Button>
	{/if}

	{#if voting.votingFlow === 'error' && voting.error}
		<div class="flex flex-col gap-2">
			<p class="text-xs text-red-600 text-center">{voting.error}</p>
			<Button onclick={voting.resetError} class="w-full" variant="outline">
				Reintentar
			</Button>
		</div>
	{/if}
</div>
