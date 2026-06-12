<script lang="ts">
	import DashboardHeader from '$lib/sections/dashboard/DashboardHeader.svelte';

	let { children } = $props();
</script>

<div class="container mx-auto px-6 lg:px-20">
	<div class="flex min-h-screen flex-col">
		<DashboardHeader />
		<main class="flex-1">
			<div class="p-4 lg:p-6 xl:p-8">
				{@render children?.()}
			</div>
		</main>
	</div>
</div>
