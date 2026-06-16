<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Shield, Send } from '@lucide/svelte';
	import { tick } from 'svelte';
	import { verifyPasskey } from '$lib/services/passkey.service';
	import { deriveIdentity } from '$lib/services/semaphore.service';
	import type { ElectoralProcess } from '$lib/types/electoral-process';
	import type { Enrollment } from '$lib/types/enrollment';

	type Props = {
		process: ElectoralProcess;
		userSub: string | null;
		userEnrollment: Enrollment | null;
	};

	let { process, userSub, userEnrollment }: Props = $props();

	let submitting = $state<'none' | 'commitment'>('none');
	let actionError = $state<string | null>(null);
	let commitmentForm = $state<HTMLFormElement | null>(null);
	let pendingCommitment = $state('');

	// Already committed = the server has stored a commitment hash for this user.
	// When true, the action button is replaced with a disabled "enviado" badge.
	let hasCommitted = $derived(userEnrollment?.commitment != null);

	async function handleSubmitCommitment() {
		if (!userSub) {
			actionError = 'Debés estar autenticado para enviar un compromiso';
			return;
		}

		submitting = 'commitment';
		actionError = null;

		try {
			// Verify passkey — always shows modal/QR, returns credentialId fresh
			const passkeyResult = await verifyPasskey();

			// Derive identity
			const identity = await deriveIdentity(userSub, passkeyResult.credentialId, process.id);

			// Set commitment value and submit the hidden form
			pendingCommitment = identity.commitment;
			await tick();
			commitmentForm?.requestSubmit();
		} catch (err) {
			actionError = err instanceof Error ? err.message : 'Error al enviar compromiso';
		} finally {
			submitting = 'none';
		}
	}
</script>

<!--
	Hidden SvelteKit form action — triggered programmatically by the button.
	`requestSubmit()` posts to `?/update-commitment` with the derived commitment
	as a hidden field. The server-side action updates the enrollment record.
-->
<form bind:this={commitmentForm} method="POST" action="?/update-commitment" class="hidden">
	<input type="hidden" name="commitment" bind:value={pendingCommitment} />
</form>

<div class="mt-6 space-y-3">
	{#if hasCommitted}
		<Button disabled class="w-full bg-brand-red/50 text-white" variant="default">
			<Shield class="size-4 mr-2" />
			Compromiso enviado
		</Button>
	{:else}
		<Button
			onclick={handleSubmitCommitment}
			disabled={submitting !== 'none'}
			class="w-full bg-brand-red hover:bg-brand-red/90 text-white"
			variant="default"
		>
			<Send class="size-4 mr-2" />
			Enviar compromiso
		</Button>
	{/if}

	{#if submitting !== 'none'}
		<p class="text-xs text-brand-gray-400 text-center">
			Escaneá el QR que aparece en pantalla con tu móvil
		</p>
	{/if}

	{#if actionError}
		<p class="text-xs text-red-600 text-center">{actionError}</p>
	{/if}
</div>
