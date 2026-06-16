<script lang="ts">
	import { Users, Check } from '@lucide/svelte';
	import { cn } from '$lib/utils.js';
	import { deterministicVoteCount } from '$lib/utils/team-vote-count';
	import type { Team } from '$lib/types/team';

	type Props = {
		teams: Team[];
		selectedTeam?: Team | null;
		disabled?: boolean;
		onSelect?: (team: Team) => void;
		/**
		 * Explicit interactivity flag. When `false`, all cards are disabled
		 * (overrides `onSelect`-presence). When `true`, cards are clickable
		 * when `disabled` is also false. When undefined, falls back to the
		 * legacy behavior: clickable when `onSelect` is provided.
		 */
		interactive?: boolean;
		/**
		 * Vote-count strategy. Receives the team and returns the count to
		 * display. Default: deterministic mock (MOCK — replace with API
		 * data once the endpoint lands).
		 */
		voteCount?: (team: Team) => number;
	};

	let {
		teams,
		selectedTeam = null,
		disabled = false,
		onSelect,
		interactive,
		voteCount = (t: Team) => deterministicVoteCount(t.id)
	}: Props = $props();

	// Non-interactive when explicitly disabled, when there is no handler
	// (presentation-only mode), or when the teams collection is empty.
	// The `interactive` prop is an explicit override: `false` forces
	// disabled; `true` requires `!disabled` and at least one team.
	let isInteractive = $derived(
		(interactive ?? (onSelect !== undefined)) && !disabled && teams.length > 0
	);

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
	<div
		class="grid gap-consensus-4"
		style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));"
	>
		{#each teams as team (team.id)}
			{@const isSelected = selectedTeam?.id === team.id}
			<button
				type="button"
				data-testid="team-card-{team.id}"
				data-state={isSelected ? 'selected' : 'unselected'}
				class={cn(
					'flex flex-col items-center text-center p-consensus-6 border rounded-consensus-lg gap-consensus-3 relative transition-colors duration-[150ms]',
					isSelected
						? 'border-consensus-red bg-consensus-red/[0.08]'
						: 'border-consensus-border bg-consensus-white hover:border-consensus-gray-300',
					!isInteractive && 'opacity-60 cursor-not-allowed'
				)}
				onclick={() => handleTeamClick(team)}
				disabled={!isInteractive}
				aria-pressed={isSelected}
			>
				<!-- Check circle (top-right) -->
				<div
					data-testid="team-check-{team.id}"
					aria-hidden="true"
					class={cn(
						'absolute top-consensus-3 right-consensus-3 size-5 rounded-full border-2 flex items-center justify-center transition-colors duration-[150ms]',
						isSelected
							? 'bg-consensus-red border-consensus-red text-consensus-white'
							: 'border-consensus-border text-transparent'
					)}
				>
					<Check class="size-3" strokeWidth={3} />
				</div>

				<!-- Avatar -->
				<div
					data-testid="team-avatar"
					class="w-14 h-14 rounded-full flex items-center justify-center font-display font-bold text-[18px] bg-brand-red/10 text-brand-red shrink-0 mt-consensus-2"
				>
					{getInitials(team.name)}
				</div>

				<!-- Name -->
				<h3
					class="font-display text-base font-bold tracking-[-0.01em] text-consensus-fg leading-tight"
				>
					{team.name}
				</h3>

				<!-- Vote count section -->
				<div
					class="flex flex-col items-center gap-1 pt-consensus-3 border-t border-consensus-border-soft w-full mt-consensus-2"
				>
					<span
						data-testid="team-vote-count-{team.id}"
						class={cn(
							'font-display text-[28px] font-extrabold tracking-[-0.02em] leading-[1] tabular-nums',
							isSelected ? 'text-consensus-red' : 'text-consensus-fg'
						)}
					>
						{voteCount(team)}
					</span>
					<span
						class="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-consensus-muted"
					>
						votos emitidos
					</span>
				</div>
			</button>
		{/each}
	</div>
{/if}
