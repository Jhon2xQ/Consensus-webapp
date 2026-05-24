<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { Check, AlertTriangle } from '@lucide/svelte';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter
	} from '$lib/components/ui/dialog';
	import { toDatetimeLocal, normalizeDatetime } from './process-utils';
	import StepGeneralInfo from './StepGeneralInfo.svelte';
	import StepTeams from './StepTeams.svelte';
	import StepEnrollments from './StepEnrollments.svelte';
	import type { ElectoralProcess } from '$lib/types/electoral-process';
	import type { Team } from '$lib/types/team';
	import type { Enrollment } from '$lib/types/enrollment';

	type Step = {
		label: string;
	};

	type Props = {
		process?: ElectoralProcess | null;
		existingTeams?: Team[];
		existingEnrollments?: Enrollment[];
		errors?: Record<string, string>;
		submitting?: boolean;
		values?: Record<string, string>;
	};

	let {
		process = null,
		existingTeams = [],
		existingEnrollments = [],
		errors = {},
		submitting = false,
		values = {}
	}: Props = $props();

	const steps: Step[] = [
		{ label: 'Datos generales' },
		{ label: 'Equipos' },
		{ label: 'Votantes' }
	];

	let currentStep = $state(0);
	let processId = $derived(process?.id ?? null);
	let isEditMode = $derived(processId !== null);

	// ── Step 1 form state ──
	let name = $state('');
	let description = $state('');
	let commitmentStart = $state('');
	let commitmentEnd = $state('');
	let votingStart = $state('');
	let votingEnd = $state('');
	let results = $state('');

	let localErrors = $state<Record<string, string>>({});

	// Sync process data and existing teams/enrollments from server in edit mode
	$effect(() => {
		// Sync from values prop (takes priority — data recovery on failed submission)
		if (values && Object.keys(values).length > 0) {
			name = values.name ?? '';
			description = values.description ?? '';
			commitmentStart = normalizeDatetime(values.commitmentStart ?? '');
			commitmentEnd = normalizeDatetime(values.commitmentEnd ?? '');
			votingStart = normalizeDatetime(values.votingStart ?? '');
			votingEnd = normalizeDatetime(values.votingEnd ?? '');
			results = normalizeDatetime(values.results ?? '');
		} else if (process) {
			name = process.name ?? '';
			description = process.description ?? '';
			commitmentStart = process.commitmentStart ? normalizeDatetime(toDatetimeLocal(process.commitmentStart)) : '';
			commitmentEnd = process.commitmentEnd ? normalizeDatetime(toDatetimeLocal(process.commitmentEnd)) : '';
			votingStart = process.votingStart ? normalizeDatetime(toDatetimeLocal(process.votingStart)) : '';
			votingEnd = process.votingEnd ? normalizeDatetime(toDatetimeLocal(process.votingEnd)) : '';
			results = process.results ? normalizeDatetime(toDatetimeLocal(process.results)) : '';
		}
		if (isEditMode) {
			allTeams = [...existingTeams];
			allEnrollments = [...existingEnrollments];
		}
	});

	// ── Step 2 & 3 state (data lives here, rendering delegated) ──
	let allTeams = $state<Team[]>([]);
	let allEnrollments = $state<Enrollment[]>([]);

	// ── Navigation ──
	let allErrors = $derived({ ...errors, ...localErrors });

	function validateStep1(): boolean {
		const e: Record<string, string> = {};

		if (!name.trim()) e.name = 'El nombre es obligatorio';
		if (!commitmentStart) e.commitmentStart = 'La fecha de inicio de compromiso es obligatoria';
		if (!commitmentEnd) e.commitmentEnd = 'La fecha de fin de compromiso es obligatoria';
		if (!votingStart) e.votingStart = 'La fecha de inicio de votación es obligatoria';
		if (!votingEnd) e.votingEnd = 'La fecha de fin de votación es obligatoria';
		if (!results) e.results = 'La fecha de resultados es obligatoria';

		if (commitmentStart && commitmentEnd && commitmentStart >= commitmentEnd) {
			e.commitmentEnd = 'La fecha de fin debe ser posterior al inicio del compromiso';
		}
		if (votingStart && votingEnd && votingStart >= votingEnd) {
			e.votingEnd = 'La fecha de fin debe ser posterior al inicio de la votación';
		}
		if (commitmentEnd && votingStart && commitmentEnd >= votingStart) {
			e.votingStart = 'La votación debe comenzar después del período de compromiso';
		}
		if (votingEnd && results && votingEnd >= results) {
			e.results = 'La fecha de resultados debe ser posterior al fin de la votación';
		}

		localErrors = e;
		return Object.keys(e).length === 0;
	}

	// ── Full validation for submission ──
	let formError = $state('');

	function validateAllSteps(): boolean {
		// Clear previous errors
		localErrors = {};
		formError = '';

		// Step 1: field validation (always)
		if (!validateStep1()) {
			currentStep = 0;
			return false;
		}

		// Step 2: teams validation (create mode only)
		if (!isEditMode && allTeams.length === 0) {
			formError = 'Debe agregar al menos un equipo al proceso electoral';
			currentStep = 1;
			return false;
		}

		// Step 3: enrollments validation (create mode only)
		if (!isEditMode && allEnrollments.length === 0) {
			formError = 'Debe agregar al menos un votante al proceso electoral';
			currentStep = 2;
			return false;
		}

		return true;
	}

	function goNext() {
		if (currentStep === 0 && !validateStep1()) return;
		if (currentStep < steps.length - 1) {
			currentStep++;
		}
	}

	function goPrevious() {
		if (currentStep > 0) {
			currentStep--;
		}
	}

	// ── Serialized data for form submission ──
	let serializedTeams = $derived(JSON.stringify(allTeams));
	let serializedEnrollments = $derived(JSON.stringify(allEnrollments));

	// ── Confirmation dialog state ──
	let showConfirmDialog = $state(false);
	let confirmTitle = $state('');
	let confirmDescription = $state('');
	let confirmAction = $state<'discard' | 'delete' | 'none'>('none');
	let confirmSubmitting = $state(false);
	let confirmError = $state('');

	function openCancelDialog() {
		confirmError = '';
		confirmSubmitting = false;

		if (isEditMode) {
			confirmTitle = '¿Cancelar la edición?';
			confirmDescription =
				'Elegí una opción para continuar. Podés descartar los cambios o eliminar el proceso completo.';
			confirmAction = 'none';
		} else {
			confirmTitle = '¿Cancelar la creación del proceso?';
			confirmDescription = 'Se perderán todos los datos ingresados.';
			confirmAction = 'discard';
		}
		showConfirmDialog = true;
	}

	function closeConfirmDialog() {
		showConfirmDialog = false;
	}

	function handleDiscard() {
		window.location.href = '/dashboard/procesos';
	}

	async function handleDeleteProcess() {
		if (!processId) return;
		confirmSubmitting = true;
		confirmError = '';

		try {
			const res = await fetch('?/eliminar', {
				method: 'POST',
				redirect: 'manual'
			});

			if (res.status === 303) {
				const location = res.headers.get('Location');
				if (location) {
					window.location.href = location;
				} else {
					window.location.href = '/dashboard/procesos?success=Proceso+eliminado+exitosamente';
				}
			} else {
				try {
					const json = await res.json();
					confirmError = json.data?.errors?._form ?? json.message ?? 'Error al eliminar el proceso';
				} catch {
					confirmError = 'Error al eliminar el proceso';
				}
				confirmSubmitting = false;
			}
		} catch {
			confirmError = 'Error de conexión al eliminar el proceso';
			confirmSubmitting = false;
		}
	}

	// ── Submit handler ──
	function handleSubmitClick(e: MouseEvent) {
		if (!validateAllSteps()) {
			e.preventDefault();
		}
	}
</script>

<div class="space-y-6">
	<!-- Step Indicator -->
	<nav aria-label="Progreso" role="progressbar" class="w-full">
		<ol class="flex items-center justify-center gap-0">
			{#each steps as step, index (step.label)}
				<li class="flex items-center">
					<div
						class="flex items-center gap-2"
						class:opacity-50={index > currentStep}
					>
						<div
							class="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors"
							class:bg-primary={index <= currentStep}
							class:text-primary-foreground={index <= currentStep}
							class:bg-muted={index > currentStep}
							class:text-muted-foreground={index > currentStep}
						>
							{#if index < currentStep}
								<Check class="size-4" />
							{:else}
								{index + 1}
							{/if}
						</div>
						<span
							class="text-sm font-medium transition-colors hidden sm:inline"
							class:text-foreground={index <= currentStep}
							class:text-muted-foreground={index > currentStep}
						>
							{step.label}
						</span>
					</div>
					{#if index < steps.length - 1}
						<div
							class="mx-3 h-px w-8 sm:w-16 transition-colors"
							class:bg-primary={index < currentStep}
							class:bg-border={index >= currentStep}
						></div>
					{/if}
				</li>
			{/each}
		</ol>
	</nav>

	<Separator />

	<!-- Step Content — delegated to step components -->
	{#if currentStep === 0}
		<StepGeneralInfo
			bind:name
			bind:description
			bind:commitmentStart
			bind:commitmentEnd
			bind:votingStart
			bind:votingEnd
			bind:results
			{allErrors}
		/>
	{:else if currentStep === 1}
		<StepTeams bind:allTeams {isEditMode} {processId} />
	{:else if currentStep === 2}
		<StepEnrollments bind:allEnrollments {isEditMode} {processId} />
	{/if}

	<Separator />

	<!-- Form-level error display -->
	{#if errors._form}
		<div class="rounded-md bg-destructive/10 p-3 flex items-center gap-2">
			<AlertTriangle class="size-4 text-destructive shrink-0" />
			<p class="text-sm text-destructive">{errors._form}</p>
		</div>
	{/if}

	<!-- Form-level validation error (client-side) -->
	{#if formError}
		<div class="rounded-md bg-destructive/10 p-3 flex items-center gap-2">
			<AlertTriangle class="size-4 text-destructive shrink-0" />
			<p class="text-sm text-destructive">{formError}</p>
		</div>
	{/if}

	<!-- Hidden fields for step 1 data preservation across all steps -->
	<input type="hidden" name="name" value={name} />
	<input type="hidden" name="description" value={description} />
	<input type="hidden" name="commitmentStart" value={commitmentStart} />
	<input type="hidden" name="commitmentEnd" value={commitmentEnd} />
	<input type="hidden" name="votingStart" value={votingStart} />
	<input type="hidden" name="votingEnd" value={votingEnd} />
	<input type="hidden" name="results" value={results} />

	<!-- Hidden fields for create-mode submission -->
	{#if !isEditMode}
		<input type="hidden" name="_action" value="finalizar" />
		<input type="hidden" name="_teams" value={serializedTeams} />
		<input type="hidden" name="_enrollments" value={serializedEnrollments} />
	{/if}

	<!-- Navigation / Action Footer -->
	<div class="flex items-center justify-between pt-2 gap-3">
		<div>
			<Button
				type="button"
				variant="ghost"
				class="text-destructive/90 hover:text-destructive"
				onclick={openCancelDialog}
			>
				Cancelar
			</Button>
		</div>

		<div class="flex items-center gap-3">
			{#if currentStep > 0}
				<Button type="button" variant="outline" onclick={goPrevious}>
					Anterior
				</Button>
			{/if}

			{#if currentStep < steps.length - 1}
				<Button type="button" onclick={goNext}>
					Siguiente
				</Button>
			{/if}

			<Button
				type="submit"
				disabled={submitting}
				onclick={handleSubmitClick}
			>
				{#if submitting}
					Guardando...
				{:else if isEditMode}
					Guardar cambios
				{:else}
					Finalizar
				{/if}
			</Button>
		</div>
	</div>
</div>

<!-- Cancel / Delete Confirmation Dialog -->
<Dialog bind:open={showConfirmDialog}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>{confirmTitle}</DialogTitle>
			<DialogDescription>
				{confirmDescription}
			</DialogDescription>
		</DialogHeader>

		{#if confirmError}
			<div class="rounded-md bg-destructive/10 p-3 flex items-center gap-2">
				<AlertTriangle class="size-4 text-destructive shrink-0" />
				<p class="text-sm text-destructive">{confirmError}</p>
			</div>
		{/if}

		<DialogFooter>
			<Button type="button" variant="outline" onclick={closeConfirmDialog}>
				Volver
			</Button>

			{#if isEditMode}
				<Button
					type="button"
					variant="ghost"
					class="text-destructive/90 hover:text-destructive hover:bg-destructive/10"
					onclick={handleDiscard}
				>
					Descartar cambios
				</Button>
				<Button
					type="button"
					variant="destructive"
					onclick={handleDeleteProcess}
					disabled={confirmSubmitting}
				>
					{#if confirmSubmitting}
						Eliminando...
					{:else}
						Eliminar proceso
					{/if}
				</Button>
			{:else}
				<Button
					type="button"
					variant="destructive"
					onclick={handleDiscard}
				>
					Cancelar creación
				</Button>
			{/if}
		</DialogFooter>
	</DialogContent>
</Dialog>
