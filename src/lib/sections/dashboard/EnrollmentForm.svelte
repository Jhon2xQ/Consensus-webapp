<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { validateEnrollmentForm } from './enrollment-utils';

	type Props = {
		errors?: Record<string, string>;
		submitting?: boolean;
		oncancel?: () => void;
	};

	let { errors = {}, submitting = false, oncancel }: Props = $props();

	let userId = $state('');
	let commitment = $state('');

	let localErrors = $state<Record<string, string>>({});

	function validate(): boolean {
		const e = validateEnrollmentForm({ userId, commitment });
		localErrors = e;
		return Object.keys(e).length === 0;
	}

	function handleSubmit(event: Event) {
		if (!validate()) {
			event.preventDefault();
		}
	}

	let allErrors = $derived({ ...errors, ...localErrors });
</script>

<form method="POST" onsubmit={handleSubmit} class="space-y-4">
	<div class="space-y-2">
		<Label for="enrollment-userid">ID de usuario *</Label>
		<Input
			id="enrollment-userid"
			name="userId"
			bind:value={userId}
			placeholder="Ej: user-101"
			aria-invalid={!!allErrors.userId}
		/>
		{#if allErrors.userId}
			<p class="text-sm text-destructive">{allErrors.userId}</p>
		{/if}
	</div>

	<div class="space-y-2">
		<Label for="enrollment-commitment">Compromiso criptográfico *</Label>
		<Input
			id="enrollment-commitment"
			name="commitment"
			bind:value={commitment}
			placeholder="0x..."
			class="font-mono text-xs"
			aria-invalid={!!allErrors.commitment}
		/>
		{#if allErrors.commitment}
			<p class="text-sm text-destructive">{allErrors.commitment}</p>
		{/if}
	</div>

	<div class="flex items-center gap-3 pt-2">
		<Button type="submit" disabled={submitting}>
			{#if submitting}
				Registrando...
			{:else}
				Registrar inscripción
			{/if}
		</Button>
		{#if oncancel}
			<Button type="button" variant="outline" onclick={oncancel}>
				Cancelar
			</Button>
		{/if}
	</div>
</form>
