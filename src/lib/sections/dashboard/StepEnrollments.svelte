<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter
	} from '$lib/components/ui/dialog';
	import { Mail, Plus, Trash2 } from '@lucide/svelte';
	import EmptyState from '$lib/components/shared/EmptyState.svelte';
	import type { Enrollment } from '$lib/types/enrollment';

	type Props = {
		allEnrollments: Enrollment[];
		isEditMode: boolean;
		processId: string | null;
		onadd?: (enrollment: Enrollment) => void;
		ondelete?: (enrollment: Enrollment) => void;
	};

	let {
		allEnrollments = $bindable([]),
		isEditMode = false,
		processId = null,
		onadd,
		ondelete
	}: Props = $props();

	let enrollmentCount = $derived(allEnrollments.length);

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
</script>

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
