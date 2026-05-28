<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { GitBranch, Globe, X } from "@lucide/svelte";
</script>

<footer class="bg-brand-white pt-24 pb-12 border-t border-brand-gray-100">
	<div class="max-w-7xl mx-auto px-6 lg:px-8">
		<div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
			<div class="col-span-1 md:col-span-2">
				<a href="/" class="flex items-center gap-2 mb-6">
					<div class="w-8 h-8 bg-brand-red rounded flex items-center justify-center text-white font-bold text-xl">
						C
					</div>
					<span class="text-xl font-bold tracking-tight">Consensus</span>
				</a>
				<p class="text-brand-gray-800 max-w-sm">
					Construyendo la infraestructura para la toma de decisiones verificable, privada y descentralizada.
				</p>
			</div>
			<div>
				<h4 class="font-bold mb-6">Producto</h4>
				<ul class="space-y-4 text-sm text-brand-gray-800">
					<li><Button variant="ghost" class="h-auto px-0 hover:text-brand-red">Características</Button></li>
					<li><Button variant="ghost" class="h-auto px-0 hover:text-brand-red">Seguridad</Button></li>
					<li><Button variant="ghost" class="h-auto px-0 hover:text-brand-red">Documentación</Button></li>
				</ul>
			</div>
			<div>
				<h4 class="font-bold mb-6">Empresa</h4>
				<ul class="space-y-4 text-sm text-brand-gray-800">
					<li><Button variant="ghost" class="h-auto px-0 hover:text-brand-red">Sobre Nosotros</Button></li>
					<li><Button variant="ghost" class="h-auto px-0 hover:text-brand-red">Carreras</Button></li>
					<li><Button variant="ghost" class="h-auto px-0 hover:text-brand-red">Contacto</Button></li>
				</ul>
			</div>
		</div>
		<div class="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-brand-gray-100 text-sm text-brand-gray-800">
			<p>© 2026 Plataforma Consensus. Todos los derechos reservados.</p>
			<div class="flex items-center gap-4 mt-4 md:mt-0">
				<span class="text-brand-gray-800 hover:text-brand-red transition-colors cursor-pointer" aria-label="GitHub">
					<GitBranch class="size-5" />
				</span>
				<span class="text-brand-gray-800 hover:text-brand-red transition-colors cursor-pointer" aria-label="LinkedIn">
					<Globe class="size-5" />
				</span>
				<span class="text-brand-gray-800 hover:text-brand-red transition-colors cursor-pointer" aria-label="X">
					<X class="size-5" />
				</span>
			</div>
		</div>
	</div>
</footer>
