<script lang="ts">
	import { page } from '$app/state';
	import {
		LayoutDashboard,
		FileText,
		Users,
		ClipboardCheck,
		ScrollText,
		Menu,
		X,
		PanelLeftClose,
		PanelLeftOpen
	} from '@lucide/svelte';

	type Props = {
		collapsed?: boolean;
		onToggle?: () => void;
	};

	let { collapsed = false, onToggle }: Props = $props();

	let currentPath = $derived(page.url.pathname);
	let mobileOpen = $state(false);

	type NavItem = {
		label: string;
		href: string;
		icon: typeof LayoutDashboard;
	};

	const navItems: NavItem[] = [
		{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
		{ label: 'Procesos', href: '/dashboard/procesos', icon: FileText },
		{ label: 'Equipos', href: '/dashboard/equipos', icon: Users },
		{ label: 'Compromisos', href: '/dashboard/compromisos', icon: ClipboardCheck },
		{ label: 'Sufragios', href: '/dashboard/sufragios', icon: ScrollText }
	];

	function isActive(href: string): boolean {
		if (href === '/dashboard') {
			return currentPath === '/dashboard' || currentPath === '/dashboard/';
		}
		return currentPath.startsWith(href);
	}

	function toggleMobile() {
		mobileOpen = !mobileOpen;
	}

	function closeMobile() {
		mobileOpen = false;
	}

	// Close mobile sidebar on navigation
	$effect(() => {
		if (currentPath) {
			mobileOpen = false;
		}
	});
</script>

<!-- Mobile hamburger button -->
<div class="lg:hidden fixed top-0 left-0 z-50 p-3">
	<button
		onclick={toggleMobile}
		aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
		class="shadow-md bg-brand-black border border-brand-gray-800 rounded-md p-2 flex items-center justify-center text-white"
	>
		{#if mobileOpen}
			<X class="size-5" />
		{:else}
			<Menu class="size-5" />
		{/if}
	</button>
</div>

<!-- Mobile overlay -->
{#if mobileOpen}
	<button
		type="button"
		class="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
		onclick={closeMobile}
		aria-label="Cerrar menú"
	></button>
{/if}

<!-- Sidebar -->
<aside
	class="flex flex-col h-screen bg-brand-black text-white border-r border-brand-gray-800 transition-all duration-300
		fixed lg:relative z-50
		{mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
		{collapsed ? 'lg:w-16' : 'lg:w-64'}"
>
	<!-- Collapse toggle + Mobile close -->
	<div class="flex items-center h-20 px-4 {collapsed ? 'justify-center' : 'justify-end'}">
		<button
			onclick={onToggle}
			aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
			class="hidden lg:flex items-center justify-center size-9 rounded-md text-brand-gray-400 hover:text-white hover:bg-brand-gray-900 transition-colors"
		>
			{#if collapsed}
				<PanelLeftOpen class="size-5" />
			{:else}
				<PanelLeftClose class="size-5" />
			{/if}
		</button>
		<button
			onclick={closeMobile}
			aria-label="Cerrar menú"
			class="lg:hidden flex items-center justify-center size-9 rounded-md text-brand-gray-400 hover:text-white hover:bg-brand-gray-900 transition-colors"
		>
			<X class="size-5" />
		</button>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 py-4 space-y-1 px-2" aria-label="Navegación del dashboard">
		{#each navItems as item (item.href)}
			{@const Icon = item.icon}
			<a
				href={item.href}
				class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors {isActive(
					item.href
				)
					? 'bg-brand-gray-800 text-white'
					: 'text-brand-gray-400 hover:bg-brand-gray-900 hover:text-white'}"
				aria-current={isActive(item.href) ? 'page' : undefined}
				onclick={closeMobile}
			>
				<Icon class="size-5 shrink-0" />
				{#if !collapsed}
					<span>{item.label}</span>
				{/if}
			</a>
		{/each}
	</nav>
</aside>
