<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "$lib/components/ui/card";
	import { PenSquare, ShieldCheck, Database, BarChart3 } from "lucide-svelte";
</script>

<section class="py-32 bg-brand-white border-t border-brand-gray-100" id="how-it-works">
	<div class="mx-auto px-6 lg:px-8">
		<div class="text-center mb-20">
			<h2 class="text-3xl md:text-5xl font-bold tracking-tight mb-6">El Flujo de Consensus</h2>
			<p class="text-lg text-brand-gray-800 max-w-2xl mx-auto">
				Un desglose intuitivo paso a paso de cómo se toman decisiones seguras.
			</p>
		</div>
		<div class="flex flex-wrap justify-center gap-8">
			<Card class="text-center bg-white shadow-sm hover:shadow-md transition-shadow gap-4 max-w-72">
				<CardHeader class="flex flex-col items-center gap-3">
					<div class="w-14 h-14 rounded-full bg-brand-red/5 text-brand-red flex items-center justify-center">
						<PenSquare class="size-7" />
					</div>
					<p class="text-xs font-bold text-brand-red uppercase tracking-widest">Paso 01</p>
          <CardTitle class="text-xl font-bold tracking-tight">Firma del Voto</CardTitle>
				</CardHeader>
				<CardContent>
					<CardDescription class="text-brand-gray-800 text-sm leading-relaxed">
						Generación de pruebas de pertenencia y firma privada utilizando el protocolo Semaphore.
					</CardDescription>
				</CardContent>
			</Card>

			<Card class="text-center bg-white shadow-sm hover:shadow-md transition-shadow gap-4 max-w-72">
				<CardHeader class="flex flex-col items-center gap-3">
					<div class="w-14 h-14 rounded-full bg-brand-red/5 text-brand-red flex items-center justify-center">
						<ShieldCheck class="size-7" />
					</div>
					<p class="text-xs font-bold text-brand-red uppercase tracking-widest">Paso 02</p>
					<CardTitle class="text-xl font-bold tracking-tight">Verificación de Identidad</CardTitle>
				</CardHeader>
				<CardContent>
					<CardDescription class="text-brand-gray-800 text-sm leading-relaxed">
						Validación criptográfica de la prueba sin revelar la identidad del votante (Protocolo Semaphore).
					</CardDescription>
				</CardContent>
			</Card>

			<Card class="text-center bg-white shadow-sm hover:shadow-md transition-shadow gap-4 max-w-72">
				<CardHeader class="flex flex-col items-center gap-3">
					<div class="w-14 h-14 rounded-full bg-brand-red/5 text-brand-red flex items-center justify-center">
						<Database class="size-7" />
					</div>
					<p class="text-xs font-bold text-brand-red uppercase tracking-widest">Paso 03</p>
					<CardTitle class="text-xl font-bold tracking-tight">Persistencia On-Chain</CardTitle>
				</CardHeader>
				<CardContent>
					<CardDescription class="text-brand-gray-800 text-sm leading-relaxed">
						Registro inmutable y seguro del voto en la blockchain, garantizando transparencia total.
					</CardDescription>
				</CardContent>
			</Card>

			<Card class="text-center bg-white shadow-sm hover:shadow-md transition-shadow gap-4 max-w-72">
				<CardHeader class="flex flex-col items-center gap-3">
					<div class="w-14 h-14 rounded-full bg-brand-red/5 text-brand-red flex items-center justify-center">
						<BarChart3 class="size-7" />
					</div>
					<p class="text-xs font-bold text-brand-red uppercase tracking-widest">Paso 04</p>
					<CardTitle class="text-xl font-bold tracking-tight">Escrutinio y Resultados</CardTitle>
				</CardHeader>
				<CardContent>
					<CardDescription class="text-brand-gray-800 text-sm leading-relaxed">
						Conteo automatizado y publicación de resultados verificables por cualquier nodo de la red.
					</CardDescription>
				</CardContent>
			</Card>
		</div>
	</div>
</section>
