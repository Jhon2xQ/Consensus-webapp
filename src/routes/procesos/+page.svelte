<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ProcessList from '$lib/sections/process/ProcessList.svelte';
	import type { ElectoralProcess } from '$lib/types/electoral-process';

	type PageData = {
		processes: ElectoralProcess[];
		page: number;
		totalPages: number;
		totalElements: number;
		error: string | null;
	};

	let { data }: { data: PageData } = $props();

	function handlePageChange(newPage: number) {
		const params = new URLSearchParams(page.url.searchParams);
		params.set('page', String(newPage));
		goto(`?${params.toString()}`);
	}
</script>

<main>
	<ProcessList
		processes={data.processes}
		page={data.page}
		totalElements={data.totalElements}
		error={data.error}
		onpagechange={handlePageChange}
	/>
</main>
