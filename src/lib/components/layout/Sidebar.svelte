<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import {
		LayoutDashboard,
		FileText,
		Users,
		UserCheck,
		LogOut,
		ChevronLeft,
		ChevronRight,
		Menu,
		X
	} from '@lucide/svelte';

	type Props = {
		user?: {
			name?: string | null;
			username?: string | null;
			picture?: string | null;
		} | null;
		collapsed?: boolean;
		onToggle?: () => void;
	};

	let { user = null, collapsed = false, onToggle }: Props = $props();

	let currentPath = $derived(page.url.pathname);
	let mobileOpen = $state(false);

	type NavItem = {
		label: string;
		href: string;
		icon: typeof LayoutDashboard;
	};

	const navItems: NavItem[] = [
		{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
		{ label: 'Procesos', href: '/dashboard/procesos', icon: FileText }
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
	<Button
		variant="outline"
		size="icon"
		onclick={toggleMobile}
		aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
		class="shadow-md bg-background"
	>
		{#if mobileOpen}
			<X class="size-5" />
		{:else}
			<Menu class="size-5" />
		{/if}
	</Button>
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
	class="flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300
		fixed lg:relative z-50
		{mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
		{collapsed ? 'lg:w-16' : 'lg:w-64'}
		w-64"
>
	<!-- Logo & Toggle -->
	<div class="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
		{#if !collapsed}
			<a href="/dashboard" class="flex items-center gap-2 group" onclick={closeMobile}>
				<div
					class="w-8 h-8 bg-brand-red rounded flex items-center justify-center text-white font-bold text-xl group-hover:bg-brand-black transition-colors"
				>
					C
				</div>
				<span class="text-lg font-bold tracking-tight">Consensus</span>
			</a>
		{/if}
		<Button
			variant="ghost"
			size="icon"
			onclick={onToggle}
			aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
			class="ml-auto text-sidebar-foreground hover:bg-sidebar-accent hidden lg:flex"
		>
			{#if collapsed}
				<ChevronRight class="size-4" />
			{:else}
				<ChevronLeft class="size-4" />
			{/if}
		</Button>
		<!-- Mobile close button -->
		<Button
			variant="ghost"
			size="icon"
			onclick={closeMobile}
			aria-label="Cerrar menú"
			class="ml-auto text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
		>
			<X class="size-4" />
		</Button>
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
					? 'bg-sidebar-accent text-sidebar-accent-foreground'
					: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}"
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

	<!-- User Section -->
	<div class="border-t border-sidebar-border p-4">
		{#if user}
			<div class="flex items-center gap-3">
				{#if user.picture}
					<img
						src={user.picture}
						alt="Avatar de {user.name ?? user.username ?? 'Usuario'}"
						class="w-8 h-8 rounded-full object-cover shrink-0"
					/>
				{:else}
					<div
						class="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-medium shrink-0"
					>
						{(user.name ?? user.username ?? 'U').charAt(0).toUpperCase()}
					</div>
				{/if}
				{#if !collapsed}
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium truncate">
							{user.name ?? user.username ?? 'Usuario'}
						</p>
					</div>
				{/if}
			</div>
		{/if}
		<form method="POST" action="/?/signOut" class="mt-3">
			<Button
				variant="ghost"
				type="submit"
				class="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
			>
				<LogOut class="size-4 shrink-0" />
				{#if !collapsed}
					<span class="ml-2">Cerrar Sesión</span>
				{/if}
			</Button>
		</form>
	</div>
</aside>
