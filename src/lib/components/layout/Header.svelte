<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Separator } from '$lib/components/ui/separator';
	import { ChevronDown, LogOut, Menu, Shield } from '@lucide/svelte';
	import { supportsPasskeys, registerPasskey } from '$lib/services/passkey.service';

	let user = $derived(page.data.user);
	let dropdownOpen = $state(false);
	let sheetOpen = $state(false);

	let dropdownRef: HTMLDivElement | undefined = $state();
	let triggerRef: HTMLButtonElement | undefined = $state();

	// Passkey registration state
	let registering = $state(false);
	const passkeysSupported = $derived(supportsPasskeys());

	// Firefox detection — module-level constant (per D-9 in design.md).
	// The warning surfaces whenever the user is on Firefox, regardless of
	// WebAuthn support, because the issue is about cross-device QR (Firefox
	// limitation), not WebAuthn availability.
	const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.includes('Firefox');

	async function handleRegisterPasskey() {
		if (!user?.sub || !user?.name) return;
		if (!passkeysSupported) return;
		registering = true;
		try {
			await registerPasskey(user.sub, user.name);
		} catch {
			// WebAuthn shows its own errors — no need to surface them here
		} finally {
			registering = false;
		}
	}

	// Close sheet on route change
	afterNavigate(() => {
		sheetOpen = false;
	});

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

<header
	class="sticky top-0 w-full bg-brand-white/90 backdrop-blur-md z-50 border-b border-brand-gray-100"
>
	<div class="container mx-auto px-6 lg:px-20 h-20 flex items-center justify-between">
		<a href="/" class="flex items-center gap-2 group">
			<div
				class="w-8 h-8 bg-brand-red rounded flex items-center justify-center text-white font-bold text-xl group-hover:bg-brand-black transition-colors"
			>
				C
			</div>
			<span class="text-xl font-bold tracking-tight">Consensus</span>
		</a>
		<div class="flex items-center gap-6 self-stretch">
			<nav aria-label="Navegación principal" class="hidden md:flex items-center gap-6 text-sm font-medium">
				<a href="/procesos" class="hover:text-brand-red transition-colors">Procesos</a>
			</nav>
			<div class="h-6 w-px bg-brand-gray-200 hidden md:block" aria-hidden="true"></div>
			{#if user}
				<div class="relative hidden md:flex self-stretch">
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
							class="absolute right-0 top-full mt-1 w-auto min-w-[200px] bg-brand-white border border-brand-gray-200 rounded-lg shadow-lg z-50"
							role="menu"
						>
							<!-- Email header (FR-H-1) -->
							<div class="px-4 py-3 border-b border-brand-gray-100">
								<p class="text-sm text-brand-gray-800">
									{user.email ?? 'No disponible'}
								</p>
							</div>

							{#if user?.roles?.includes('consensus-creator')}
								<div class="p-2 border-b border-brand-gray-100">
									<a
										href="/dashboard"
										class="flex items-center gap-2 w-full px-2 py-1.5 rounded-md bg-brand-black hover:bg-brand-red text-white text-sm font-medium transition-colors"
										role="menuitem"
									>
										Dashboard
									</a>
								</div>
							{/if}

							<!-- Action: Registrar Credencial (FR-H-2) -->
							<div class="p-2 border-b border-brand-gray-100">
								{#if !isFirefox}
									<button
										type="button"
										role="menuitem"
										onclick={handleRegisterPasskey}
										disabled={!passkeysSupported || registering}
										class="text-sm text-brand-black flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-brand-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<Shield class="size-4" />
										{registering ? 'Registrando...' : 'Registrar Credencial'}
									</button>
								{/if}

								<!-- Firefox passkey warning (FR-H-3) — UA-only condition -->
								{#if isFirefox}
									<p class="text-[10px] text-brand-gray-400 px-2">
										Firefox no soporta QR cross-device. Usá Chrome o Safari.
									</p>
								{/if}
							</div>

							<!-- Action: Cerrar Sesión (FR-H-2) -->
							<div class="p-2">
								<form method="POST" action="/?/signOut" aria-label="Cerrar sesión">
									<button
										type="submit"
										class="text-sm text-red-600 hover:text-red-700 flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-brand-gray-50 transition-colors"
										role="menuitem"
									>
										<LogOut class="size-4" />
										Cerrar Sesión
									</button>
								</form>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<form method="POST" action="/?/signIn" aria-label="Iniciar sesión" class="hidden md:flex">
					<Button
						variant="default"
						type="submit"
						class="rounded-full bg-brand-black hover:bg-brand-red border-0 px-5 shadow-sm"
					>
						Iniciar Sesión
					</Button>
				</form>
			{/if}

			<!-- Mobile hamburger + Sheet -->
			<Sheet.Root bind:open={sheetOpen}>
				<Sheet.Trigger
					aria-label="Abrir menú de navegación"
					class="md:hidden flex items-center justify-center size-9 rounded-md border border-brand-gray-200 hover:bg-brand-gray-50 transition-colors"
				>
					<Menu class="size-5" />
				</Sheet.Trigger>

				<Sheet.Content side="right" class="w-full max-w-sm p-0 gap-0">
					<Sheet.Header class="border-b border-brand-gray-100 px-4 py-3">
						<Sheet.Title class="text-base">Menú</Sheet.Title>
					</Sheet.Header>

					<!-- Auth section -->
					<div class="p-4 border-b border-brand-gray-100">
						{#if user}
							<div class="flex flex-col items-center gap-2 mb-3">
								{#if user.picture}
									<img
										src={user.picture}
										alt="Avatar de {user.name ?? user.username ?? 'Usuario'}"
										class="w-10 h-10 rounded-full object-cover"
									/>
								{:else}
									<div
										class="w-10 h-10 rounded-full bg-brand-gray-200 flex items-center justify-center text-sm font-medium text-brand-gray-600"
									>
										{(user.name ?? user.username ?? 'U').charAt(0).toUpperCase()}
									</div>
								{/if}
								<p class="text-sm font-medium text-brand-gray-900">
									{user.name ?? user.username ?? 'Usuario'}
								</p>
								<p class="text-xs text-brand-gray-500">
									{user.email ?? 'No disponible'}
								</p>
							</div>

							<div class="flex flex-col items-center gap-2">
								{#if user?.roles?.includes('consensus-creator')}
									<a
										href="/dashboard"
										class="bg-brand-black hover:bg-brand-red text-white rounded-full px-4 py-2 text-sm font-medium transition-colors text-center w-full"
									>
										Dashboard
									</a>
								{/if}
								{#if !isFirefox}
									<button
										type="button"
										onclick={handleRegisterPasskey}
										disabled={!passkeysSupported || registering}
										class="text-sm text-brand-black flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-brand-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<Shield class="size-4" />
										{registering ? 'Registrando...' : 'Registrar Credencial'}
									</button>
								{/if}
								{#if isFirefox}
									<p class="text-[10px] text-brand-gray-400 px-3">
										Firefox no soporta QR cross-device. Usá Chrome o Safari.
									</p>
								{/if}
								<form method="POST" action="/?/signOut" aria-label="Cerrar sesión" class="w-full">
									<button
										type="submit"
										class="text-sm text-red-600 hover:text-red-700 flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-brand-gray-50 transition-colors"
									>
										<LogOut class="size-4" />
										Cerrar Sesión
									</button>
								</form>
							</div>
						{:else}
							<form method="POST" action="/?/signIn" aria-label="Iniciar sesión">
								<Button
									variant="default"
									type="submit"
									class="w-full rounded-full bg-brand-black hover:bg-brand-red border-0 shadow-sm"
								>
									Iniciar Sesión
								</Button>
							</form>
						{/if}
					</div>

					<Separator class="bg-brand-gray-100" />

					<!-- Navigation section -->
					<nav aria-label="Navegación principal" class="p-4 flex flex-col gap-1 text-sm font-medium">
						<a href="/procesos" class="px-3 py-2 rounded-md hover:bg-brand-gray-50 transition-colors">
							Procesos
						</a>
					</nav>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</div>
</header>
