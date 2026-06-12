<script lang="ts">
	import { page } from '$app/state';
	import {
		LayoutDashboard,
		FileText,
		Users,
		ScrollText,
		Menu,
		LogOut,
		User,
		ChevronDown
	} from '@lucide/svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';

	let user = $derived(page.data.user);
	let currentPath = $derived(page.url.pathname);

	const navItems = [
		{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
		{ label: 'Procesos', href: '/dashboard/procesos', icon: FileText },
		{ label: 'Equipos', href: '/dashboard/equipos', icon: Users },
		{ label: 'Votantes', href: '/dashboard/votantes', icon: Users },
		{ label: 'Sufragios', href: '/dashboard/sufragios', icon: ScrollText }
	];

	function isActive(href: string): boolean {
		if (href === '/dashboard') {
			return currentPath === '/dashboard' || currentPath === '/dashboard/';
		}
		return currentPath === href || currentPath.startsWith(href + '/');
	}

	function getInitials(name: string | undefined, username: string | undefined): string {
		return (name ?? username ?? 'U').charAt(0).toUpperCase();
	}
</script>

<header class="sticky top-0 w-full bg-brand-white/90 backdrop-blur-md border-b border-brand-gray-100">
	<div class="mx-auto h-20 flex items-center justify-between px-4 lg:px-6">
		<!-- Brand -->
		<a href="/" class="hidden md:block text-lg font-bold text-brand-black tracking-tight">
			Consensus
		</a>

		<!-- Desktop nav -->
		<nav aria-label="Navegación del dashboard" class="hidden md:flex items-center gap-1">
			{#each navItems as item (item.href)}
				{@const Icon = item.icon}
				<a
					href={item.href}
					class="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
						{isActive(item.href)
							? 'bg-brand-gray-100 text-brand-black'
							: 'text-brand-gray-500 hover:bg-brand-gray-50 hover:text-brand-black'}"
					aria-current={isActive(item.href) ? 'page' : undefined}
				>
					<Icon class="size-4" />
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>

		<!-- Right group -->
		<div class="flex items-center gap-3 ml-auto">
			{#if user?.roles?.includes('consensus-creator')}
				<a
					href="/"
					class="hidden md:flex bg-brand-black hover:bg-brand-red text-white rounded-full px-4 py-2 text-sm font-medium transition-colors"
				>
					Home
				</a>
			{/if}

			{#if user}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						aria-label="Menú de usuario"
						class="flex items-center gap-2 cursor-pointer rounded-full hover:bg-brand-gray-50 transition-colors px-3 py-1.5"
					>
						{#if user.picture}
							<img
								src={user.picture}
								alt="Avatar de {user.name ?? user.username ?? 'Usuario'}"
								class="w-8 h-8 rounded-full object-cover"
							/>
						{:else}
							<div
								class="w-8 h-8 rounded-full bg-brand-gray-200 flex items-center justify-center text-sm font-medium text-brand-gray-600"
							>
								{getInitials(user.name, user.username)}
							</div>
						{/if}
						<span class="text-sm font-medium text-brand-gray-800 hidden md:block">
							{user.name ?? user.username ?? 'Usuario'}
						</span>
						<ChevronDown class="size-4 text-brand-gray-500" />
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56" align="end">
						<DropdownMenu.Label class="font-normal">
								<div class="flex flex-col space-y-1">
									<p class="text-sm font-medium text-brand-gray-900">{user.name ?? user.username ?? 'Usuario'}</p>
									<p class="text-xs text-brand-gray-500">{user.email ?? 'No disponible'}</p>
								</div>
						</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Item>
							<form method="POST" action="/?/signOut" class="w-full" aria-label="Cerrar sesión">
								<Button
									variant="ghost"
									type="submit"
									class="w-full justify-start rounded-md text-sm"
								>
									Cerrar Sesión
								</Button>
							</form>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>

				<!-- Mobile nav trigger -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						aria-label="Abrir menú de navegación"
						class="md:hidden flex items-center justify-center size-9 rounded-md border border-brand-gray-200 hover:bg-brand-gray-50 transition-colors"
					>
						<Menu class="size-5" />
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56" align="end">
						{#each navItems as item (item.href)}
							{@const Icon = item.icon}
							<DropdownMenu.Item>
								<a
									href={item.href}
									class="flex items-center gap-2 px-2 py-1.5 text-sm {isActive(item.href) ? 'font-semibold' : ''}"
									aria-current={isActive(item.href) ? 'page' : undefined}
								>
									<Icon class="size-4" />
									<span>{item.label}</span>
								</a>
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{:else}
				<form method="POST" action="/?/signIn" aria-label="Iniciar sesión">
					<Button variant="default" type="submit" class="rounded-full bg-brand-black hover:bg-brand-red border-0 px-5 shadow-sm">
						Iniciar Sesión
					</Button>
				</form>
			{/if}
		</div>
	</div>
</header>
