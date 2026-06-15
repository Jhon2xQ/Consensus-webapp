<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { ChevronDown, Shield } from '@lucide/svelte';
	import { supportsPasskeys, registerPasskey } from '$lib/services/passkey.service';

	let user = $derived(page.data.user);
	let dropdownOpen = $state(false);

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
		<div class="flex items-center gap-6">
			<nav aria-label="Navegación principal" class="hidden md:flex items-center gap-6 text-sm font-medium">
				<a href="/procesos" class="hover:text-brand-red transition-colors">Procesos</a>
			</nav>
			<div class="h-6 w-px bg-brand-gray-200 hidden md:block" aria-hidden="true"></div>
			{#if user?.roles?.includes('consensus-creator')}
				<a
					href="/dashboard"
					class="hidden md:flex bg-brand-black hover:bg-brand-red text-white rounded-full px-4 py-2 text-sm font-medium transition-colors"
				>
					Dashboard
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
							<!-- Email header (FR-H-1) -->
							<div class="px-4 py-3 border-b border-brand-gray-100">
								<p class="text-sm text-brand-gray-800 truncate">
									{user.email ?? 'No disponible'}
								</p>
							</div>

							<!-- Action 1: Registrar Credencial (FR-H-2) -->
							<div class="p-2 border-b border-brand-gray-100">
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

								<!-- Firefox passkey warning (FR-H-3) — UA-only condition -->
								{#if isFirefox}
									<p class="text-[10px] text-brand-gray-400 mt-1.5 px-2">
										Firefox no soporta QR cross-device. Usá Chrome o Safari.
									</p>
								{/if}
							</div>

							<!-- Action 2: Cerrar Sesión (FR-H-2) -->
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
