<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Vote, Loader2 } from '@lucide/svelte';
	import { VOTING_STAGE_MESSAGE } from '$lib/types/proof';
	import VoteConfirmationDialog from './VoteConfirmationDialog.svelte';
	import type { ElectoralProcess } from '$lib/types/electoral-process';
	import type { Team } from '$lib/types/team';
	import type { VotingStage } from '$lib/types/proof';

	type Props = {
		process: ElectoralProcess;
		selectedTeam: Team | null;
		voting: {
			flow: VotingStage;
			error: string | null;
			hasVoted: boolean;
			showConfirmDialog: boolean;
			openConfirmDialog: () => void;
			closeConfirmDialog: () => void;
			submitVote: () => Promise<void>;
			resetError: () => void;
		};
	};

	let { process, selectedTeam, voting }: Props = $props();

	// Close the confirmation dialog before kicking off the flow — mirrors the
	// original `confirmVote()` in ProcessDetail.svelte, which set
	// `showVoteDialog = false` before starting the vote. Without this, the
	// dialog overlay would block the "Reintentar" button on error.
	function handleConfirmVote() {
		voting.closeConfirmDialog();
		voting.submitVote();
	}
</script>

<!--
	T-7: VotingActionZone is a leaf. It receives the full voting state and
	callbacks as a prop from ProcessDetail (the assembler). No useVoting
	here — the composable lives in the parent.
-->
<VoteConfirmationDialog
	open={voting.showConfirmDialog}
	teamName={selectedTeam?.name ?? null}
	onConfirm={handleConfirmVote}
	onClose={voting.closeConfirmDialog}
/>

<div class="mt-6 space-y-3">
	{#if voting.hasVoted}
		<Button disabled class="w-full" variant="default">
			<Vote class="size-4 mr-2" />
			Ya votaste
		</Button>
	{:else if voting.flow === 'idle'}
		<Button
			onclick={selectedTeam ? voting.openConfirmDialog : undefined}
			disabled={!selectedTeam || !process.groupId}
			class="w-full bg-brand-red hover:bg-brand-red/90 text-white"
			variant="default"
		>
			{#if !process.groupId}
				El grupo on-chain no está configurado
			{:else if selectedTeam}
				Votar por {selectedTeam.name}
			{:else}
				Elegí un equipo para votar
			{/if}
		</Button>
	{:else}
		<!-- Verifying / building / submitting / success states -->
		<Button disabled class="w-full" variant="default">
			<Loader2 class="size-4 mr-2 animate-spin" />
			{VOTING_STAGE_MESSAGE[voting.flow]}
		</Button>
	{/if}

	{#if voting.flow === 'error' && voting.error}
		<div class="flex flex-col gap-2">
			<p class="text-xs text-red-600 text-center">{voting.error}</p>
			<Button onclick={voting.resetError} class="w-full" variant="outline">
				Reintentar
			</Button>
		</div>
	{/if}
</div>
