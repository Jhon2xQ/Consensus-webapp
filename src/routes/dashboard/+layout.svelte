<script lang="ts">
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import DashboardHeader from '$lib/sections/dashboard/DashboardHeader.svelte';

	let { children } = $props();

	let sidebarCollapsed = $state(true);

	function toggleSidebar() {
		sidebarCollapsed = !sidebarCollapsed;
	}
</script>

<div class="container mx-auto px-6 lg:px-20">
	<div class="flex h-screen overflow-hidden">
		<Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
		<main class="flex-1 h-screen overflow-y-auto scrollbar-hide">
			<DashboardHeader />
			<div class="p-4 lg:p-6 xl:p-8">
				{@render children?.()}
			</div>
		</main>
	</div>
</div>
