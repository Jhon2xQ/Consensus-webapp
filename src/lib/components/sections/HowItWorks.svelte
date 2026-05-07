<script lang="ts">
	import { PenSquare, ShieldCheck, Database, BarChart3 } from "lucide-svelte";
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
			<!-- Connecting Line -->
			<div class="hidden md:block absolute top-1/2 left-0 right-0 h-[2px] bg-brand-gray-100 -translate-y-1/2 z-0"></div>
			<!-- Step 1 -->
			<div class="relative z-10">
				<div
					class="bg-white p-8 rounded-xl border border-brand-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center h-full"
				>
					<div class="w-14 h-14 rounded-full bg-brand-red/5 text-brand-red flex items-center justify-center mb-6">
						<PenSquare class="size-7" />
					</div>
					<p class="text-xs font-bold text-brand-red uppercase tracking-widest mb-2">Paso 01</p>
					<h3 class="text-xl font-bold mb-4 tracking-tight">Firma del Voto</h3>
					<p class="text-brand-gray-800 text-sm leading-relaxed">
						Generación de pruebas de pertenencia y firma privada utilizando el protocolo Semaphore.
					</p>
				</div>
			</div>
			<!-- Step 2 -->
			<div class="relative z-10">
				<div
					class="bg-white p-8 rounded-xl border border-brand-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center h-full"
				>
					<div class="w-14 h-14 rounded-full bg-brand-red/5 text-brand-red flex items-center justify-center mb-6">
						<ShieldCheck class="size-7" />
					</div>
					<p class="text-xs font-bold text-brand-red uppercase tracking-widest mb-2">Paso 02</p>
					<h3 class="text-xl font-bold mb-4 tracking-tight">Verificación de Identidad</h3>
					<p class="text-brand-gray-800 text-sm leading-relaxed">
						Validación criptográfica de la prueba sin revelar la identidad del votante (Protocolo Semaphore).
					</p>
				</div>
			</div>
			<!-- Step 3 -->
			<div class="relative z-10">
				<div
					class="bg-white p-8 rounded-xl border border-brand-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center h-full"
				>
					<div class="w-14 h-14 rounded-full bg-brand-red/5 text-brand-red flex items-center justify-center mb-6">
						<Database class="size-7" />
					</div>
					<p class="text-xs font-bold text-brand-red uppercase tracking-widest mb-2">Paso 03</p>
					<h3 class="text-xl font-bold mb-4 tracking-tight">Persistencia On-Chain</h3>
					<p class="text-brand-gray-800 text-sm leading-relaxed">
						Registro inmutable y seguro del voto en la blockchain, garantizando transparencia total.
					</p>
				</div>
			</div>
			<!-- Step 4 -->
			<div class="relative z-10">
				<div
					class="bg-white p-8 rounded-xl border border-brand-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center h-full"
				>
					<div class="w-14 h-14 rounded-full bg-brand-red/5 text-brand-red flex items-center justify-center mb-6">
						<BarChart3 class="size-7" />
					</div>
					<p class="text-xs font-bold text-brand-red uppercase tracking-widest mb-2">Paso 04</p>
					<h3 class="text-xl font-bold mb-4 tracking-tight">Escrutinio y Resultados</h3>
					<p class="text-brand-gray-800 text-sm leading-relaxed">
						Conteo automatizado y publicación de resultados verificables por cualquier nodo de la red.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>
