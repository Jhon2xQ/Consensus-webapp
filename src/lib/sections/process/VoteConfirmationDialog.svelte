<script lang="ts">
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogFooter
	} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';

	type Props = {
		open: boolean;
		teamName: string | null;
		onConfirm: () => void;
		onClose: () => void;
	};

	let { open, teamName, onConfirm, onClose }: Props = $props();

	// React to any close path the user can take (X button, Esc, overlay click)
	// and route it through the parent's onClose so it can clean up state.
	function handleOpenChange(next: boolean) {
		if (!next) onClose();
	}
</script>

<Dialog bind:open onOpenChange={handleOpenChange}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Confirmar voto</DialogTitle>
			<DialogDescription>
				¿Confirmás tu voto por <strong>{teamName ?? ''}</strong>? Esta acción es irreversible.
			</DialogDescription>
		</DialogHeader>
		<DialogFooter>
			<Button variant="outline" onclick={onClose}>Cancelar</Button>
			<Button variant="destructive" onclick={onConfirm}>Confirmar voto</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
