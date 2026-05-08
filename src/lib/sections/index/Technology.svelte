<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
</script>

<section class="py-32 bg-brand-black text-white" id="technology">
	<div class="max-w-7xl mx-auto px-6 lg:px-8">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
			<div>
				<h2 class="text-3xl md:text-5xl font-bold tracking-tight mb-6">
					Impulsado por matemáticas,<br />asegurado por Blockchain
				</h2>
				<p class="text-lg text-brand-gray-200 mb-8 leading-relaxed">
					Consensus utiliza protocolos criptográficos de vanguardia para garantizar la privacidad absoluta mientras se
					mantiene una verificabilidad perfecta.
				</p>
				<div class="space-y-8">
					<Card.Root class="bg-transparent shadow-none ring-0 p-0 flex-row gap-3">
						<Badge variant="outline" class="border-brand-red/40 text-brand-red font-bold text-base px-3 py-1 h-auto rounded-lg">ZK</Badge>
						<div>
							<h3 class="text-xl font-bold mb-2">Arquitectura de Conocimiento Cero</h3>
							<p class="text-brand-gray-400 text-sm">
								Aprovechando el protocolo Semaphore, los votantes pueden probar que tienen derecho a votar sin revelar su
								identidad o elección.
							</p>
						</div>
					</Card.Root>
					<Card.Root class="bg-transparent shadow-none ring-0 p-0 flex-row gap-3">
						<Badge variant="outline" class="border-brand-red/40 text-brand-red font-bold text-base px-3 py-1 h-auto rounded-lg">BC</Badge>
						<div>
							<h3 class="text-xl font-bold mb-2">Libro Mayor Inmutable</h3>
							<p class="text-brand-gray-400 text-sm">
								Cada voto encriptado y conteo final se registra en una cadena de bloques segura, garantizando la
								resistencia a la manipulación.
							</p>
						</div>
					</Card.Root>
				</div>
			</div>
			<div class="relative">
				<div class="aspect-square rounded-2xl overflow-hidden shadow-2xl relative border border-brand-gray-800">
					<img
						alt="Representación artística de tecnología criptográfica y matemática"
						class="w-full h-full object-cover opacity-80"
						src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMggnlY_yD95SliyK_t9HOikhWyjN5IjqoGJhEzkYkZ7IEBVcKbktqPNvTOUCJSK2TEqO38noU2zfmEp6CWBbYIMEfLwpH-uqd4qiHYGqRisJ36OiKlyDAaP6zxN7loUMUzmIIJgjlmB_3FZWfYiTBqr8Vtie24YK9tR7XnpsqUTfoWreRbokjUES27vWqnXywnhBIJVPovVG5ZuEkkGQE5Oxms8HxB7lDoon87iRrJQPHxWOR-Jmrmxd5IIWIO_yKWymTh--tp7yb"
					/>
					<div class="absolute inset-0 bg-brand-black/20 mix-blend-multiply"></div>
				</div>
			</div>
		</div>
	</div>
</section>
