<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { ChevronDown, Shield, ShieldCheck, ShieldAlert } from '@lucide/svelte';
	import { supportsPasskeys, registerPasskey, verifyPasskey } from '$lib/services/passkey.service';
	import {
		getPasskeyStatus,
		setCredentialId,
		setStatus,
		setError,
		isPasskeyVerified
	} from '$lib/services/passkey-state.svelte';

	let user = $derived(page.data.user);
	let dropdownOpen = $state(false);

	let dropdownRef: HTMLDivElement | undefined = $state();
	let triggerRef: HTMLButtonElement | undefined = $state();

	// Passkey reactive state
	let passkeyStatus = $derived(getPasskeyStatus());
	let passkeyVerified = $derived(isPasskeyVerified());
	let registering = $state(false);
	let verifying = $state(false);

	// Firefox detection
	const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.includes('Firefox');

	async function handleRegisterPasskey() {
		if (!user?.sub || !user?.name) return;
		registering = true;
		try {
			const result = await registerPasskey(user.sub, user.name);
			setCredentialId(result.credentialId);
			setStatus('registered');
		} catch {
			setError('Error al registrar dispositivo');
		} finally {
			registering = false;
		}
	}

	async function handleVerifyPasskey() {
		verifying = true;
		try {
			await verifyPasskey();
			setStatus('verified');
		} catch {
			setError('Error al verificar dispositivo');
		} finally {
			verifying = false;
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

<header class="fixed top-0 w-full bg-brand-white/90 backdrop-blur-md z-50 border-b border-brand-gray-100">
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
							<div class="px-4 py-3 border-b border-brand-gray-100">
								<p class="text-xs text-brand-gray-500 font-medium">Correo electrónico</p>
								<p class="text-sm text-brand-gray-800 truncate mt-0.5">
									{user.email ?? 'No disponible'}
								</p>
							</div>

							<!-- Passkey section -->
							<div class="px-4 py-3 border-b border-brand-gray-100">
								<p class="text-xs text-brand-gray-500 font-medium mb-2">Dispositivo</p>

								{#if !supportsPasskeys()}
									<p class="text-xs text-brand-gray-400 flex items-center gap-1.5">
										<ShieldAlert class="size-3.5" />
										Navegador no compatible
									</p>
									{#if isFirefox}
										<p class="text-[10px] text-brand-gray-400 mt-1">
											Firefox no soporta QR cross-device. Usá Chrome o Safari.
										</p>
									{/if}
								{:else if passkeyStatus === 'none' || passkeyStatus === 'error'}
									<button
										onclick={handleRegisterPasskey}
										disabled={registering}
										class="text-xs text-brand-black flex items-center gap-1.5 hover:text-brand-red transition-colors disabled:opacity-50"
									>
										<Shield class="size-3.5" />
										{registering ? 'Registrando...' : 'Registrar credencial'}
									</button>
								{:else if passkeyStatus === 'registered'}
									<button
										onclick={handleVerifyPasskey}
										disabled={verifying}
										class="text-xs text-brand-black flex items-center gap-1.5 hover:text-brand-red transition-colors disabled:opacity-50"
									>
										<Shield class="size-3.5" />
										{verifying ? 'Verificando...' : 'Verificar dispositivo'}
									</button>
								{:else if passkeyVerified}
									<p class="text-xs text-green-600 flex items-center gap-1.5">
										<ShieldCheck class="size-3.5" />
										Dispositivo verificado
									</p>
								{/if}
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
