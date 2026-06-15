<script lang="ts">
	// TrustedBy section — landing redesign (PR 3).
	// Source markup: consensus-landing.html. No state, no props.

	const logos = ['VENTURE_A', 'CAPITAL_B', 'FUND_C', 'PARTNERS_D'];
</script>

<section
	class="py-consensus-20 bg-consensus-gray-100 border-y border-consensus-border-soft"
>
	<div class="max-w-7xl mx-auto px-6 lg:px-8">
		<p
			class="font-mono text-[11px] font-medium tracking-[0.1em] uppercase text-consensus-muted text-center mb-consensus-10"
		>
			Respaldado por Líderes de la Industria
		</p>
		<div class="flex flex-wrap justify-center items-center gap-consensus-12">
			{#each logos as logo (logo)}
				<span
					class="font-display text-base font-bold text-consensus-gray-400 tracking-[-0.01em] select-none transition-colors duration-[240ms] ease-[cubic-bezier(0.2,0,0,1)] hover:text-consensus-gray-600"
				>
					{logo}
				</span>
			{/each}
		</div>
	</div>
</section>
