<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { validateTeamForm } from './team-utils';
	import type { Team } from '$lib/types/team';

	type Props = {
		team?: Team | null;
		errors?: Record<string, string>;
		submitting?: boolean;
		oncancel?: () => void;
	};

	let { team = null, errors = {}, submitting = false, oncancel }: Props = $props();

	// Dialog content remounts on open/close, so $state initialization from prop is safe.
	// IIFE closures capture initial values without state_referenced_locally warning.
	let name = $state((() => team?.name ?? '')());
	let avatarUrl = $state((() => team?.avatarUrl ?? '')());

	let localErrors = $state<Record<string, string>>({});

	function validate(): boolean {
		const e = validateTeamForm({ name });
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
		<Label for="team-name">Nombre del equipo *</Label>
		<Input
			id="team-name"
			name="name"
			bind:value={name}
			placeholder="Ej: Frente Nacional"
			aria-invalid={!!allErrors.name}
		/>
		{#if allErrors.name}
			<p class="text-sm text-destructive">{allErrors.name}</p>
		{/if}
	</div>

	<div class="space-y-2">
		<Label for="team-avatar">URL del avatar (opcional)</Label>
		<Input
			id="team-avatar"
			name="avatarUrl"
			bind:value={avatarUrl}
			placeholder="https://ejemplo.com/avatar.png"
			type="url"
		/>
	</div>

	<div class="flex items-center gap-3 pt-2">
		<Button type="submit" disabled={submitting}>
			{#if submitting}
				Guardando...
			{:else}
				{team ? 'Actualizar equipo' : 'Crear equipo'}
			{/if}
		</Button>
		{#if oncancel}
			<Button type="button" variant="outline" onclick={oncancel}>
				Cancelar
			</Button>
		{/if}
	</div>
</form>
