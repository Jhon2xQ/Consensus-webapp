<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import { toDatetimeLocal } from '$lib/sections/dashboard/process-utils';

	type Props = {
		mode: 'create' | 'edit';
		process?: Record<string, string> | null;
		errors?: Record<string, string>;
		values?: Record<string, string>;
		submitting?: boolean;
	};

	let {
		mode,
		process = null,
		errors = {},
		values: rawValues = {},
		submitting = false
	}: Props = $props();

	// Snapshot initial form data: values takes priority over process.
	// We snap props to locals first to avoid Svelte 5 state_referenced_locally
	// warnings — these are initializers, not reactive bindings.
	const v = rawValues ?? {};
	const p = (process ?? {}) as Record<string, string>;

	// In edit mode, convert ISO dates from process prop to datetime-local format.
	// Values from a previous fail() are already datetime-local — skip conversion.
	const resolveDate = (key: string): string => {
		if (v[key]) return v[key];
		const iso = p[key];
		if (!iso) return '';
		return mode === 'edit' ? toDatetimeLocal(iso) : iso;
	};

	let name = $state(v.name ?? p.name ?? '');
	let description = $state(v.description ?? p.description ?? '');
	let commitmentStart = $state(resolveDate('commitmentStart'));
	let commitmentEnd = $state(resolveDate('commitmentEnd'));
	let votingStart = $state(resolveDate('votingStart'));
	let votingEnd = $state(resolveDate('votingEnd'));
	let results = $state(resolveDate('results'));

	// Force time to 00:00 when user picks a date (create mode convenience)
	function forceMidnight(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.value) {
			input.value = input.value.split('T')[0] + 'T00:00';
		}
	}
</script>

<form method="POST" class="space-y-6">
	<h3 class="text-lg font-semibold">Información General</h3>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<div class="space-y-2">
			<Label for="name">Nombre *</Label>
			<Input
				id="name"
				bind:value={name}
				placeholder="Ej: Elecciones Nacionales 2026"
				aria-invalid={!!errors.name}
			/>
			{#if errors.name}
				<p class="text-sm text-destructive">{errors.name}</p>
			{/if}
			<input type="hidden" name="name" value={name} />
		</div>
	</div>

	<div class="space-y-2">
		<Label for="description">Descripción</Label>
		<Textarea
			id="description"
			bind:value={description}
			placeholder="Descripción opcional del proceso electoral"
			rows={3}
		/>
		<input type="hidden" name="description" value={description} />
	</div>

	<Separator />

	<h3 class="text-lg font-semibold pt-2">Fechas del Proceso</h3>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<div class="space-y-3">
			<p class="text-sm font-medium text-muted-foreground uppercase tracking-wide">Compromiso</p>
			<div class="space-y-2">
				<Label for="commitmentStart">Inicio de Compromiso *</Label>
				<Input
					id="commitmentStart"
					type="datetime-local"
					bind:value={commitmentStart}
					oninput={forceMidnight}
					aria-invalid={!!errors.commitmentStart}
				/>
				{#if errors.commitmentStart}
					<p class="text-sm text-destructive">{errors.commitmentStart}</p>
				{/if}
				<input type="hidden" name="commitmentStart" value={commitmentStart} />
			</div>
			<div class="space-y-2">
				<Label for="commitmentEnd">Fin de Compromiso *</Label>
				<Input
					id="commitmentEnd"
					type="datetime-local"
					bind:value={commitmentEnd}
					oninput={forceMidnight}
					aria-invalid={!!errors.commitmentEnd}
				/>
				{#if errors.commitmentEnd}
					<p class="text-sm text-destructive">{errors.commitmentEnd}</p>
				{/if}
				<input type="hidden" name="commitmentEnd" value={commitmentEnd} />
			</div>
		</div>

		<div class="space-y-3">
			<p class="text-sm font-medium text-muted-foreground uppercase tracking-wide">Votación</p>
			<div class="space-y-2">
				<Label for="votingStart">Inicio de Votación *</Label>
				<Input
					id="votingStart"
					type="datetime-local"
					bind:value={votingStart}
					oninput={forceMidnight}
					aria-invalid={!!errors.votingStart}
				/>
				{#if errors.votingStart}
					<p class="text-sm text-destructive">{errors.votingStart}</p>
				{/if}
				<input type="hidden" name="votingStart" value={votingStart} />
			</div>
			<div class="space-y-2">
				<Label for="votingEnd">Fin de Votación *</Label>
				<Input
					id="votingEnd"
					type="datetime-local"
					bind:value={votingEnd}
					oninput={forceMidnight}
					aria-invalid={!!errors.votingEnd}
				/>
				{#if errors.votingEnd}
					<p class="text-sm text-destructive">{errors.votingEnd}</p>
				{/if}
				<input type="hidden" name="votingEnd" value={votingEnd} />
			</div>
		</div>

		<div class="space-y-3">
			<p class="text-sm font-medium text-muted-foreground uppercase tracking-wide">Resultados</p>
			<div class="space-y-2">
				<Label for="results">Fecha de Resultados *</Label>
				<Input
					id="results"
					type="datetime-local"
					bind:value={results}
					oninput={forceMidnight}
					aria-invalid={!!errors.results}
				/>
				{#if errors.results}
					<p class="text-sm text-destructive">{errors.results}</p>
				{/if}
				<input type="hidden" name="results" value={results} />
			</div>
		</div>
	</div>

	<div class="pt-4">
		<Button type="submit" disabled={submitting}>
			{mode === 'create' ? 'Crear Proceso' : 'Guardar Cambios'}
		</Button>
	</div>
</form>
