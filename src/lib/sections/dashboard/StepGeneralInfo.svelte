<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Separator } from '$lib/components/ui/separator';

	type Props = {
		name: string;
		description: string;
		commitmentStart: string;
		commitmentEnd: string;
		votingStart: string;
		votingEnd: string;
		results: string;
		allErrors: Record<string, string>;
	};

	let {
		name = $bindable(''),
		description = $bindable(''),
		commitmentStart = $bindable(''),
		commitmentEnd = $bindable(''),
		votingStart = $bindable(''),
		votingEnd = $bindable(''),
		results = $bindable(''),
		allErrors = {}
	}: Props = $props();
</script>

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

	<Separator />

	<h3 class="text-lg font-semibold pt-2">Fechas del Proceso</h3>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<div class="space-y-3">
			<p class="text-sm font-medium text-muted-foreground uppercase tracking-wide">Compromiso</p>
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
		</div>

		<div class="space-y-3">
			<p class="text-sm font-medium text-muted-foreground uppercase tracking-wide">Votación</p>
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
		</div>

		<div class="space-y-3">
			<p class="text-sm font-medium text-muted-foreground uppercase tracking-wide">Resultados</p>
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
</div>
