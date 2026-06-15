<script lang="ts">
	import { Users, CheckCircle } from '@lucide/svelte';
	import { cn } from '$lib/utils.js';
	import type { Team } from '$lib/types/team';

	type Props = {
		teams: Team[];
		selectedTeam?: Team | null;
		disabled?: boolean;
		onSelect?: (team: Team) => void;
	};

	let { teams, selectedTeam = null, disabled = false, onSelect }: Props = $props();

	// Non-interactive when explicitly disabled, when there is no handler
	// (presentation-only mode), or when the teams collection is empty.
	let isInteractive = $derived(!disabled && onSelect !== undefined && teams.length > 0);

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((w) => w[0] ?? '')
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	function handleTeamClick(team: Team) {
		if (!isInteractive) return;
		onSelect?.(team);
	}
</script>

{#if teams.length === 0}
	<div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
		<Users class="size-10 mb-3 opacity-40" />
		<p class="text-sm font-medium">Sin equipos</p>
	</div>
{:else}
	<div class="flex flex-row flex-wrap gap-3">
		{#each teams as team (team.id)}
			<button
				type="button"
				class={cn(
					'flex items-center gap-3 p-4 rounded-lg border transition-colors text-left',
					selectedTeam?.id === team.id
						? 'border-brand-red bg-brand-red/5'
						: 'border-brand-gray-200/60 hover:border-brand-gray-300',
					!isInteractive && 'opacity-60 cursor-not-allowed'
				)}
				onclick={() => handleTeamClick(team)}
				disabled={!isInteractive}
			>
				<div
					class="size-12 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center text-base font-bold shrink-0"
				>
					{getInitials(team.name)}
				</div>
				<span class="text-sm md:text-base font-medium text-brand-black">{team.name}</span>
				{#if selectedTeam?.id === team.id}
					<CheckCircle class="size-5 text-brand-red shrink-0" />
				{/if}
			</button>
		{/each}
	</div>
{/if}
