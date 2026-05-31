<script lang="ts">
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';

	let lastUrl = $state('');

	$effect(() => {
		const currentUrl = page.url.href;
		if (currentUrl !== lastUrl) {
			const success = page.url.searchParams.get('success');
			if (success) {
				toast.success(decodeURIComponent(success));
				const newUrl = new URL(page.url);
				newUrl.searchParams.delete('success');
				history.replaceState(null, '', newUrl.toString());
			}
			lastUrl = currentUrl;
		}
	});
</script>
