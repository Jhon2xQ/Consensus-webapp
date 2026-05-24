<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { ArrowLeft, CalendarDays } from '@lucide/svelte';
	import ProcessForm from '$lib/components/shared/ProcessForm.svelte';

	let { data, form } = $props();
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex items-center gap-4">
		<Button variant="outline" size="icon" href="/dashboard/procesos">
			<ArrowLeft class="size-4" />
		</Button>
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Editar Proceso Electoral</h1>
			<p class="text-muted-foreground mt-1">
				Modifica los datos del proceso electoral "{data.process.name}".
			</p>
		</div>
	</div>

	<!-- Form Card -->
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<CalendarDays class="size-5" />
				Datos del Proceso
			</CardTitle>
		</CardHeader>
		<CardContent>
			<ProcessForm
				mode="edit"
				process={data.process}
				errors={form?.errors ?? {}}
				values={form?.values ?? {}}
			/>
		</CardContent>
	</Card>
</div>
