<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { toDatetimeLocal } from './process-utils';
	import type { ElectoralProcess } from '$lib/types/electoral-process';

	type Props = {
		process?: ElectoralProcess | null;
		errors?: Record<string, string>;
		enhance?: import('svelte/elements').FormEventHandler<HTMLFormElement>;
		submitting?: boolean;
	};

	let { process = null, errors = {}, enhance, submitting = false }: Props = $props();

	let name = $state(process?.name ?? '');
	let scope = $state(process?.scope ?? '');
	let description = $state(process?.description ?? '');
	let commitmentStart = $state(process?.commitmentStart ? toDatetimeLocal(process.commitmentStart) : '');
	let commitmentEnd = $state(process?.commitmentEnd ? toDatetimeLocal(process.commitmentEnd) : '');
	let votingStart = $state(process?.votingStart ? toDatetimeLocal(process.votingStart) : '');
	let votingEnd = $state(process?.votingEnd ? toDatetimeLocal(process.votingEnd) : '');
	let results = $state(process?.results ? toDatetimeLocal(process.results) : '');

	let localErrors = $state<Record<string, string>>({});

	function validate(): boolean {
		const e: Record<string, string> = {};

		if (!name.trim()) e.name = 'El nombre es obligatorio';
		if (!scope.trim()) e.scope = 'El ámbito es obligatorio';
		if (!commitmentStart) e.commitmentStart = 'La fecha de inicio de compromiso es obligatoria';
		if (!commitmentEnd) e.commitmentEnd = 'La fecha de fin de compromiso es obligatoria';
		if (!votingStart) e.votingStart = 'La fecha de inicio de votación es obligatoria';
		if (!votingEnd) e.votingEnd = 'La fecha de fin de votación es obligatoria';
		if (!results) e.results = 'La fecha de resultados es obligatoria';

		// Date order validation
		if (commitmentStart && commitmentEnd && commitmentStart > commitmentEnd) {
			e.commitmentEnd = 'La fecha de fin debe ser posterior al inicio del compromiso';
		}
		if (votingStart && votingEnd && votingStart > votingEnd) {
			e.votingEnd = 'La fecha de fin debe ser posterior al inicio de la votación';
		}
		if (commitmentEnd && votingStart && commitmentEnd > votingStart) {
			e.votingStart = 'La votación debe comenzar después del período de compromiso';
		}

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

<form method="POST" onsubmit={handleSubmit} class="space-y-8">
	<!-- General Info -->
	<div class="space-y-4">
		<h3 class="text-lg font-semibold">Información General</h3>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="space-y-2">
				<Label for="name">Nombre *</Label>
				<Input
					id="name"
					name="name"
					bind:value={name}
					placeholder="Ej: Elecciones Nacionales 2026"
					aria-invalid={!!allErrors.name}
				/>
				{#if allErrors.name}
					<p class="text-sm text-destructive">{allErrors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="scope">Ámbito *</Label>
				<Input
					id="scope"
					name="scope"
					bind:value={scope}
					placeholder="Ej: Nacional, Provincial, Municipal"
					aria-invalid={!!allErrors.scope}
				/>
				{#if allErrors.scope}
					<p class="text-sm text-destructive">{allErrors.scope}</p>
				{/if}
			</div>
		</div>

		<div class="space-y-2">
			<Label for="description">Descripción</Label>
			<Textarea
				id="description"
				name="description"
				bind:value={description}
				placeholder="Descripción opcional del proceso electoral"
				rows={3}
			/>
		</div>
	</div>

	<Separator />

	<!-- Dates -->
	<div class="space-y-4">
		<h3 class="text-lg font-semibold">Fechas del Proceso</h3>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="space-y-2">
				<Label for="commitmentStart">Inicio de Compromiso *</Label>
				<Input
					id="commitmentStart"
					name="commitmentStart"
					type="datetime-local"
					bind:value={commitmentStart}
					aria-invalid={!!allErrors.commitmentStart}
				/>
				{#if allErrors.commitmentStart}
					<p class="text-sm text-destructive">{allErrors.commitmentStart}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="commitmentEnd">Fin de Compromiso *</Label>
				<Input
					id="commitmentEnd"
					name="commitmentEnd"
					type="datetime-local"
					bind:value={commitmentEnd}
					aria-invalid={!!allErrors.commitmentEnd}
				/>
				{#if allErrors.commitmentEnd}
					<p class="text-sm text-destructive">{allErrors.commitmentEnd}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="votingStart">Inicio de Votación *</Label>
				<Input
					id="votingStart"
					name="votingStart"
					type="datetime-local"
					bind:value={votingStart}
					aria-invalid={!!allErrors.votingStart}
				/>
				{#if allErrors.votingStart}
					<p class="text-sm text-destructive">{allErrors.votingStart}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="votingEnd">Fin de Votación *</Label>
				<Input
					id="votingEnd"
					name="votingEnd"
					type="datetime-local"
					bind:value={votingEnd}
					aria-invalid={!!allErrors.votingEnd}
				/>
				{#if allErrors.votingEnd}
					<p class="text-sm text-destructive">{allErrors.votingEnd}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="results">Fecha de Resultados *</Label>
				<Input
					id="results"
					name="results"
					type="datetime-local"
					bind:value={results}
					aria-invalid={!!allErrors.results}
				/>
				{#if allErrors.results}
					<p class="text-sm text-destructive">{allErrors.results}</p>
				{/if}
			</div>
		</div>
	</div>

	<div class="flex items-center gap-4 pt-4">
		<Button type="submit" disabled={submitting}>
			{#if submitting}
				Guardando...
			{:else}
				{process ? 'Actualizar Proceso' : 'Crear Proceso'}
			{/if}
		</Button>
		<Button type="button" variant="outline" href="/dashboard/procesos">
			Cancelar
		</Button>
	</div>
</form>
