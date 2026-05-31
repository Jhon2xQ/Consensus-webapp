<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import FlashToast from '$lib/components/shared/FlashToast.svelte';

	let { children } = $props();

	let isDashboard = $derived(page.url.pathname.startsWith('/dashboard'));
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Toaster richColors />
<FlashToast />
{#if !isDashboard}
	<Header />
{/if}
{@render children?.()}
{#if !isDashboard}
	<Footer />
{/if}
