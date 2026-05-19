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
		ChevronRight
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

	type NavItem = {
		label: string;
		href: string;
		icon: typeof LayoutDashboard;
	};

	const navItems: NavItem[] = [
		{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
		{ label: 'Procesos', href: '/dashboard/procesos', icon: FileText },
		{ label: 'Equipos', href: '/dashboard/equipos', icon: Users },
		{ label: 'Inscripciones', href: '/dashboard/inscripciones', icon: UserCheck }
	];

	function isActive(href: string): boolean {
		if (href === '/dashboard') {
			return currentPath === '/dashboard' || currentPath === '/dashboard/';
		}
		return currentPath.startsWith(href);
	}
</script>

<aside
	class="flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 {collapsed
		? 'w-16'
		: 'w-64'}"
>
	<!-- Logo & Toggle -->
	<div class="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
		{#if !collapsed}
			<a href="/dashboard" class="flex items-center gap-2 group">
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
			class="ml-auto text-sidebar-foreground hover:bg-sidebar-accent"
		>
			{#if collapsed}
				<ChevronRight class="size-4" />
			{:else}
				<ChevronLeft class="size-4" />
			{/if}
		</Button>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 py-4 space-y-1 px-2" aria-label="Navegación del dashboard">
		{#each navItems as item (item.href)}
			{@const Icon = item.icon}
			<a
				href={item.href}
				class="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors {isActive(
					item.href
				)
					? 'bg-sidebar-accent text-sidebar-accent-foreground'
					: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}"
				aria-current={isActive(item.href) ? 'page' : undefined}
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
