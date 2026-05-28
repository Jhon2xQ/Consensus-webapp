<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { ChevronDown } from '@lucide/svelte';

	let user = $derived(page.data.user);
	let dropdownOpen = $state(false);

	let dropdownRef: HTMLDivElement | undefined = $state();
	let triggerRef: HTMLButtonElement | undefined = $state();

	// Close on click outside
	$effect(() => {
		if (dropdownOpen) {
			const handler = (e: MouseEvent) => {
				if (
					dropdownRef &&
					!dropdownRef.contains(e.target as Node) &&
					triggerRef &&
					!triggerRef.contains(e.target as Node)
				) {
					dropdownOpen = false;
				}
			};
			// Use a timeout to avoid the same click that opened it from closing it
			queueMicrotask(() => document.addEventListener('click', handler));
			return () => document.removeEventListener('click', handler);
		}
	});
</script>

<header class="sticky top-0 w-full bg-brand-white/90 backdrop-blur-md border-b border-brand-gray-100">
	<div class="mx-auto h-20 flex items-center justify-end">
		<div class="flex items-center gap-6">
			{#if user?.roles?.includes('consensus-creator')}
				<a
					href="/"
					class="hidden md:flex bg-brand-black hover:bg-brand-red text-white rounded-full px-4 py-2 text-sm font-medium transition-colors"
				>
					Home
				</a>
			{/if}
			{#if user}
				<div class="relative">
					<button
						bind:this={triggerRef}
						type="button"
						onclick={() => (dropdownOpen = !dropdownOpen)}
						aria-expanded={dropdownOpen}
						aria-haspopup="true"
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
								{(user.name ?? user.username ?? 'U').charAt(0).toUpperCase()}
							</div>
						{/if}
						<span class="text-sm font-medium text-brand-gray-800 hidden md:block">
							{user.name ?? user.username ?? 'Usuario'}
						</span>
						<ChevronDown
							class="size-4 text-brand-gray-500 transition-transform duration-200 {dropdownOpen
								? 'rotate-180'
								: ''}"
						/>
					</button>
					{#if dropdownOpen}
						<div
							bind:this={dropdownRef}
							class="absolute right-0 mt-2 w-56 bg-brand-white border border-brand-gray-200 rounded-lg shadow-lg z-50"
							role="menu"
						>
							<div class="px-4 py-3 border-b border-brand-gray-100">
								<p class="text-xs text-brand-gray-500 font-medium">Correo electrónico</p>
								<p class="text-sm text-brand-gray-800 truncate mt-0.5">
									{user.email ?? 'No disponible'}
								</p>
							</div>
							<div class="p-2">
								<form method="POST" action="/?/signOut" aria-label="Cerrar sesión">
									<Button
										variant="ghost"
										type="submit"
										class="w-full justify-start rounded-md text-sm"
										role="menuitem"
									>
										Cerrar Sesión
									</Button>
								</form>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<form method="POST" action="/?/signIn" aria-label="Iniciar sesión">
					<Button
						variant="default"
						type="submit"
						class="rounded-full bg-brand-black hover:bg-brand-red border-0 px-5 shadow-sm"
					>
						Iniciar Sesión
					</Button>
				</form>
			{/if}
		</div>
	</div>
</header>
