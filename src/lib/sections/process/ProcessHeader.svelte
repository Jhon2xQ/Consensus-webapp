<script lang="ts">
	import type { ElectoralProcessStatus } from '$lib/types/electoral-process';

	type Props = {
		name: string;
		status: ElectoralProcessStatus;
		scope: string | null;
		description?: string | null;
	};

	let { name, status, scope, description }: Props = $props();
</script>

<header>
	<h1 class="text-4xl md:text-5xl font-bold tracking-tighter text-brand-black">
		{name}
	</h1>
</header>