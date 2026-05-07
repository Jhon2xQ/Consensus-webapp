<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
</script>

<section class="py-32 bg-brand-white border-t border-brand-gray-100" id="how-it-works">
	<div class="max-w-7xl mx-auto px-6 lg:px-8">
		<div class="text-center mb-20">
			<h2 class="text-3xl md:text-5xl font-bold tracking-tight mb-6">El Flujo de Consensus</h2>
			<p class="text-lg text-brand-gray-800 max-w-2xl mx-auto">
				Un desglose intuitivo paso a paso de cómo se toman decisiones seguras.
			</p>
		</div>
		<div class="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
			<div class="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-brand-gray-100 z-0"></div>
			<Card.Root class="relative z-10 group bg-transparent shadow-none ring-0 border-0 items-center text-center">
				<div
					class="w-24 h-24 rounded-full bg-brand-white border-2 border-brand-gray-200 flex items-center justify-center text-2xl font-bold mb-6 group-hover:border-brand-red group-hover:text-brand-red transition-colors"
				>
					1
				</div>
				<h3 class="text-xl font-bold mb-3">Propuesta</h3>
				<p class="text-brand-gray-800 text-sm leading-relaxed">Redacta y envía propuestas claras y accionables a la red.</p>
			</Card.Root>
			<Card.Root class="relative z-10 group bg-transparent shadow-none ring-0 border-0 items-center text-center">
				<div
					class="w-24 h-24 rounded-full bg-brand-white border-2 border-brand-gray-200 flex items-center justify-center text-2xl font-bold mb-6 group-hover:border-brand-red group-hover:text-brand-red transition-colors"
				>
					2
				</div>
				<h3 class="text-xl font-bold mb-3">Discusión</h3>
				<p class="text-brand-gray-800 text-sm leading-relaxed">Participa en debates estructurados y refina propuestas antes de votar.</p>
			</Card.Root>
			<Card.Root class="relative z-10 group bg-transparent shadow-none ring-0 border-0 items-center text-center">
				<div
					class="w-24 h-24 rounded-full bg-brand-white border-2 border-brand-gray-200 flex items-center justify-center text-2xl font-bold mb-6 group-hover:border-brand-red group-hover:text-brand-red transition-colors"
				>
					3
				</div>
				<h3 class="text-xl font-bold mb-3">Votación</h3>
				<p class="text-brand-gray-800 text-sm leading-relaxed">Emite votos seguros y privados utilizando pruebas de conocimiento cero.</p>
			</Card.Root>
			<Card.Root class="relative z-10 group bg-transparent shadow-none ring-0 border-0 items-center text-center">
				<div
					class="w-24 h-24 rounded-full bg-brand-white border-2 border-brand-gray-200 flex items-center justify-center text-2xl font-bold mb-6 group-hover:border-brand-red group-hover:text-brand-red transition-colors"
				>
					4
				</div>
				<h3 class="text-xl font-bold mb-3">Escrutinio</h3>
				<p class="text-brand-gray-800 text-sm leading-relaxed">Ejecución automatizada y verificable de los resultados en cadena.</p>
			</Card.Root>
		</div>
	</div>
</section>
