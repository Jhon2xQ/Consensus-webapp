<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { Check, Mail, Trash2, Plus, AlertTriangle } from '@lucide/svelte';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter
	} from '$lib/components/ui/dialog';
	import TeamTable from './TeamTable.svelte';
	import EmptyState from '$lib/components/shared/EmptyState.svelte';
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
		enhance?: import('svelte/elements').FormEventHandler<HTMLFormElement>;
		submitting?: boolean;
	};

	let {
		process = null,
		existingTeams = [],
		existingEnrollments = [],
		errors = {},
		enhance,
		submitting = false
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
	let name = $state(process?.name ?? '');
	let description = $state(process?.description ?? '');
	let commitmentStart = $state(process?.commitmentStart ?? '');
	let commitmentEnd = $state(process?.commitmentEnd ?? '');
	let votingStart = $state(process?.votingStart ?? '');
	let votingEnd = $state(process?.votingEnd ?? '');
	let results = $state(process?.results ?? '');

	let localErrors = $state<Record<string, string>>({});

	// Sync existing data from server in edit mode
	$effect(() => {
		if (isEditMode) {
			allTeams = [...existingTeams];
			allEnrollments = [...existingEnrollments];
		}
	});

	// ── Step 2 — Teams state ──
	let allTeams = $state<Team[]>([...existingTeams]);
	let showAddTeamDialog = $state(false);
	let newTeamName = $state('');
	let newTeamAvatarUrl = $state('');
	let teamSubmitting = $state(false);
	let teamFormErrors = $state<Record<string, string>>({});

	function openAddTeamDialog() {
		newTeamName = '';
		newTeamAvatarUrl = '';
		teamFormErrors = {};
		showAddTeamDialog = true;
	}

	function closeAddTeamDialog() {
		showAddTeamDialog = false;
	}

	async function handleAddTeam() {
		const e: Record<string, string> = {};
		if (!newTeamName.trim()) {
			e.name = 'El nombre del equipo es obligatorio';
		} else if (newTeamName.trim().length < 2) {
			e.name = 'El nombre debe tener al menos 2 caracteres';
		} else if (newTeamName.trim().length > 100) {
			e.name = 'El nombre no puede exceder 100 caracteres';
		}

		if (Object.keys(e).length > 0) {
			teamFormErrors = e;
			return;
		}
		teamFormErrors = {};

		if (isEditMode && processId) {
			teamSubmitting = true;
			try {
				const formData = new FormData();
				formData.append('teamName', newTeamName.trim());
				if (newTeamAvatarUrl.trim()) {
					formData.append('avatarUrl', newTeamAvatarUrl.trim());
				}

				const res = await fetch('?/agregarEquipo', {
					method: 'POST',
					body: formData
				});
				const json = await res.json();

				if (json.type === 'failure') {
					teamFormErrors = { name: json.data?.errors?.teamName ?? json.data?.errors?._form ?? 'Error al crear el equipo' };
				} else if (json.success) {
					closeAddTeamDialog();
					await invalidateAll();
				} else {
					teamFormErrors = { name: 'Error inesperado al crear el equipo' };
				}
			} catch {
				teamFormErrors = { name: 'Error de conexión al crear el equipo' };
			} finally {
				teamSubmitting = false;
			}
		} else {
			// Create mode: store locally
			const localTeam: Team = {
				id: `local-${crypto.randomUUID()}`,
				name: newTeamName.trim(),
				avatarUrl: newTeamAvatarUrl.trim() || undefined,
				electoralProcessId: ''
			};
			allTeams = [...allTeams, localTeam];
			closeAddTeamDialog();
		}
	}

	async function handleDeleteTeam(team: Team) {
		if (isEditMode && processId && !team.id.startsWith('local-')) {
			try {
				const formData = new FormData();
				formData.append('teamId', team.id);

				await fetch('?/eliminarEquipo', {
					method: 'POST',
					body: formData
				});
				await invalidateAll();
			} catch {
				// Silently fail — the deletion on the backend is best-effort for now
			}
		} else {
			allTeams = allTeams.filter((t) => t.id !== team.id);
		}
	}

	// ── Step 3 — Enrollments state ──
	let allEnrollments = $state<Enrollment[]>([...existingEnrollments]);
	let showAddEnrollmentDialog = $state(false);
	let newEnrollmentEmail = $state('');
	let enrollmentSubmitting = $state(false);
	let enrollmentFormErrors = $state<Record<string, string>>({});

	function openAddEnrollmentDialog() {
		newEnrollmentEmail = '';
		enrollmentFormErrors = {};
		showAddEnrollmentDialog = true;
	}

	function closeAddEnrollmentDialog() {
		showAddEnrollmentDialog = false;
	}

	async function handleAddEnrollment() {
		const e: Record<string, string> = {};
		const email = newEnrollmentEmail.trim();

		if (!email) {
			e.email = 'El email es obligatorio';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			e.email = 'El email no es válido';
		}

		if (Object.keys(e).length > 0) {
			enrollmentFormErrors = e;
			return;
		}
		enrollmentFormErrors = {};

		if (isEditMode && processId) {
			enrollmentSubmitting = true;
			try {
				const formData = new FormData();
				formData.append('email', email);

				const res = await fetch('?/agregarVotante', {
					method: 'POST',
					body: formData
				});
				const json = await res.json();

				if (json.type === 'failure') {
					enrollmentFormErrors = { email: json.data?.errors?.email ?? json.data?.errors?._form ?? 'Error al registrar el votante' };
				} else if (json.success) {
					closeAddEnrollmentDialog();
					await invalidateAll();
				} else {
					enrollmentFormErrors = { email: 'Error inesperado al registrar el votante' };
				}
			} catch {
				enrollmentFormErrors = { email: 'Error de conexión al registrar el votante' };
			} finally {
				enrollmentSubmitting = false;
			}
		} else {
			// Create mode: store locally
			const localEnrollment: Enrollment = {
				id: `local-${crypto.randomUUID()}`,
				electoralProcessId: '',
				email,
				userId: null,
				commitment: null,
				hasVoted: false
			};
			allEnrollments = [...allEnrollments, localEnrollment];
			closeAddEnrollmentDialog();
		}
	}

	async function handleDeleteEnrollment(enrollment: Enrollment) {
		if (isEditMode && processId && !enrollment.id.startsWith('local-')) {
			try {
				const formData = new FormData();
				formData.append('enrollmentId', enrollment.id);

				await fetch('?/eliminarVotante', {
					method: 'POST',
					body: formData
				});
				await invalidateAll();
			} catch {
				// Silently fail
			}
		} else {
			allEnrollments = allEnrollments.filter((e) => e.id !== enrollment.id);
		}
	}

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

	// ── Derived counts ──
	let teamCount = $derived(allTeams.length);
	let enrollmentCount = $derived(allEnrollments.length);

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

	<!-- Step Content -->
	{#if currentStep === 0}
		<!-- Datos Generales -->
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
							type="date"
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
							type="date"
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
							type="date"
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
							type="date"
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
							type="date"
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
	{:else if currentStep === 1}
		<!-- Equipos -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-semibold">Equipos del Proceso</h3>
				<span class="text-sm text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
					{teamCount} equipo{teamCount !== 1 ? 's' : ''}
				</span>
			</div>

			<TeamTable teams={allTeams} onDelete={handleDeleteTeam} />

			<div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={openAddTeamDialog}
				>
					<Plus class="size-4" />
					Agregar equipo
				</Button>
			</div>
		</div>
	{:else if currentStep === 2}
		<!-- Votantes -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-semibold">Votantes Inscriptos</h3>
				<span class="text-sm text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
					{enrollmentCount} votante{enrollmentCount !== 1 ? 's' : ''}
				</span>
			</div>

			{#if allEnrollments.length === 0}
				<EmptyState
					icon={Mail}
					title="No hay inscripciones registradas"
					description="Agregá votantes para este proceso electoral."
				/>
			{:else}
				<!-- Desktop table -->
				<div class="hidden sm:block rounded-md border">
					<table class="w-full">
						<thead>
							<tr class="border-b bg-muted/50">
								<th class="h-10 px-4 text-left text-xs font-medium text-muted-foreground">Email</th>
								<th class="h-10 px-4 text-right text-xs font-medium text-muted-foreground">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{#each allEnrollments as enrollment (enrollment.id)}
								<tr class="border-b">
									<td class="p-3 px-4 text-sm font-medium">{enrollment.email}</td>
									<td class="p-3 px-4 text-right">
										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											onclick={() => handleDeleteEnrollment(enrollment)}
										>
											<Trash2 class="size-4 text-destructive" />
											<span class="sr-only">Eliminar inscripción</span>
										</Button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Mobile card list -->
				<div class="sm:hidden space-y-2">
					{#each allEnrollments as enrollment (enrollment.id)}
						<div class="flex items-center justify-between p-3 rounded-lg border bg-card">
							<p class="text-sm font-medium truncate">{enrollment.email}</p>
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								onclick={() => handleDeleteEnrollment(enrollment)}
							>
								<Trash2 class="size-4 text-destructive" />
								<span class="sr-only">Eliminar inscripción</span>
							</Button>
						</div>
					{/each}
				</div>
			{/if}

			<div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={openAddEnrollmentDialog}
				>
					<Plus class="size-4" />
					Agregar votante
				</Button>
			</div>
		</div>
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

<!-- Team Add Dialog -->
<Dialog bind:open={showAddTeamDialog}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Crear equipo</DialogTitle>
			<DialogDescription>
				Agregá un nuevo equipo al proceso electoral.
			</DialogDescription>
		</DialogHeader>
		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="stepper-team-name">Nombre del equipo *</Label>
				<Input
					id="stepper-team-name"
					bind:value={newTeamName}
					placeholder="Ej: Frente Nacional"
					aria-invalid={!!teamFormErrors.name}
				/>
				{#if teamFormErrors.name}
					<p class="text-sm text-destructive">{teamFormErrors.name}</p>
				{/if}
			</div>
			<div class="space-y-2">
				<Label for="stepper-team-avatar">URL del avatar (opcional)</Label>
				<Input
					id="stepper-team-avatar"
					bind:value={newTeamAvatarUrl}
					placeholder="https://ejemplo.com/avatar.png"
					type="url"
				/>
			</div>
		</div>
		<DialogFooter>
			<Button type="button" variant="outline" onclick={closeAddTeamDialog}>
				Cancelar
			</Button>
			<Button type="button" onclick={handleAddTeam} disabled={teamSubmitting}>
				{#if teamSubmitting}
					Creando...
				{:else}
					Crear equipo
				{/if}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>

<!-- Enrollment Add Dialog -->
<Dialog bind:open={showAddEnrollmentDialog}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Registrar votante</DialogTitle>
			<DialogDescription>
				Agregá un nuevo votante al proceso electoral.
			</DialogDescription>
		</DialogHeader>
		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="stepper-enrollment-email">Email *</Label>
				<Input
					id="stepper-enrollment-email"
					type="email"
					bind:value={newEnrollmentEmail}
					placeholder="votante@example.com"
					aria-invalid={!!enrollmentFormErrors.email}
				/>
				{#if enrollmentFormErrors.email}
					<p class="text-sm text-destructive">{enrollmentFormErrors.email}</p>
				{/if}
			</div>
		</div>
		<DialogFooter>
			<Button type="button" variant="outline" onclick={closeAddEnrollmentDialog}>
				Cancelar
			</Button>
			<Button type="button" onclick={handleAddEnrollment} disabled={enrollmentSubmitting}>
				{#if enrollmentSubmitting}
					Registrando...
				{:else}
					Registrar votante
				{/if}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>

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
