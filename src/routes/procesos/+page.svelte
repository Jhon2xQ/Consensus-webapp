<script lang="ts">
	import ProcessList from '$lib/sections/process/ProcessList.svelte';
	import { electoralProcesses } from '$lib/mock/electoral-processes';
</script>

<main>
	<ProcessList processes={electoralProcesses} />
</main>
