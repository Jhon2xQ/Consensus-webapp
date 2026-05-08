<script lang="ts">
	import { Button } from "$lib/components/ui/button";
</script>

<header class="fixed top-0 w-full bg-brand-white/90 backdrop-blur-md z-50 border-b border-brand-gray-100">
	<div class="container mx-auto px-20 h-20 flex items-center justify-between">
		<a href="/" class="flex items-center gap-2 group">
			<div class="w-8 h-8 bg-brand-red rounded flex items-center justify-center text-white font-bold text-xl group-hover:bg-brand-black transition-colors">
				C
			</div>
			<span class="text-xl font-bold tracking-tight">Consensus</span>
		</a>
		<div class="flex items-center gap-6">
			<nav aria-label="Navegación principal" class="hidden md:flex gap-6 text-sm font-medium">
				<a href="#how-it-works" class="hover:text-brand-red transition-colors">Cómo Funciona</a>
				<a href="#technology" class="hover:text-brand-red transition-colors">Tecnología</a>
				<a href="/procesos" class="hover:text-brand-red transition-colors">Procesos</a>
			</nav>
			<div class="h-6 w-px bg-brand-gray-200 hidden md:block" aria-hidden="true"></div>
			<Button
				variant="default"
				class="rounded-full bg-brand-black hover:bg-brand-red border-0 px-5 shadow-sm"
			>
				Iniciar Sesión
			</Button>
			<!-- placeholder: Logto Fase 3 -->
		</div>
	</div>
</header>
