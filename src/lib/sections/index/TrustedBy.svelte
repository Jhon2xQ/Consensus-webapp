<script lang="ts">
	const logos = ['VENTURE_A', 'CAPITAL_B', 'FUND_C', 'PARTNERS_D'];
</script>

<section class="py-24 bg-brand-gray-50 border-y border-brand-gray-100">
	<div class="max-w-7xl mx-auto px-6 lg:px-8 text-center">
		<p class="text-sm font-semibold uppercase tracking-widest text-brand-gray-800 mb-12">
			Respaldado por Líderes de la Industria
		</p>
		<div class="flex flex-wrap justify-center items-center gap-12 md:gap-24">
			{#each logos as logo (logo)}
				<div
					class="text-2xl font-black tracking-tighter grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
				>
					{logo}
				</div>
			{/each}
		</div>
	</div>
</section>
