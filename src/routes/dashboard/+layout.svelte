<script lang="ts">
	import { page } from '$app/state';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';

	let { children } = $props();

	let user = $derived(page.data.user);
	let sidebarCollapsed = $state(false);

	function toggleSidebar() {
		sidebarCollapsed = !sidebarCollapsed;
	}
</script>

<div class="flex h-screen overflow-hidden bg-background">
	<Sidebar {user} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
	<main class="flex-1 overflow-y-auto">
		<!-- Mobile top padding for hamburger button -->
		<div class="p-4 pt-16 lg:p-6 lg:pt-6 xl:p-8">
			{@render children?.()}
		</div>
	</main>
</div>
