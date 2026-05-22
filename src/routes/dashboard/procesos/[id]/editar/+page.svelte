<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ArrowLeft, CalendarDays } from '@lucide/svelte';
	import ProcessStepper from '$lib/sections/dashboard/ProcessStepper.svelte';

	let { data, form } = $props();

	let isSubmitting = $state(false);

	function handleSubmit() {
		isSubmitting = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			isSubmitting = false;
		};
	}
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex items-center gap-4">
		<Button variant="outline" size="icon" href="/dashboard/procesos/{data.process.id}">
			<ArrowLeft class="size-4" />
		</Button>
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Editar Proceso Electoral</h1>
			<p class="text-muted-foreground mt-1">
				Modifica los datos del proceso electoral "{data.process.name}".
			</p>
		</div>
	</div>

	<!-- Stepper Card -->
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<CalendarDays class="size-5" />
				Datos del Proceso
			</CardTitle>
		</CardHeader>
		<CardContent>
			<form method="POST" use:enhance={handleSubmit}>
				<ProcessStepper
					process={data.process}
					existingTeams={data.teams}
					existingEnrollments={data.enrollments}
					errors={form?.errors ?? {}}
					submitting={isSubmitting}
				/>
			</form>
		</CardContent>
	</Card>
</div>
