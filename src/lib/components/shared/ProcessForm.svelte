<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';

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

	// T00:00 default for create mode: datetime-local inputs show 00:00 AM
	// Date portion uses today (HTML datetime-local requires full YYYY-MM-DDTHH:MM)
	const today = new Date().toISOString().split('T')[0];
	const defaultTime = mode === 'create' ? `${today}T00:00` : '';

	let name = $state(v.name ?? p.name ?? '');
	let description = $state(v.description ?? p.description ?? '');
	let commitmentStart = $state(v.commitmentStart ?? p.commitmentStart ?? defaultTime);
	let commitmentEnd = $state(v.commitmentEnd ?? p.commitmentEnd ?? defaultTime);
	let votingStart = $state(v.votingStart ?? p.votingStart ?? defaultTime);
	let votingEnd = $state(v.votingEnd ?? p.votingEnd ?? defaultTime);
	let results = $state(v.results ?? p.results ?? defaultTime);
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
