<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
</script>

<section class="relative pt-24 pb-32 overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(187,0,18,0.05)_0%,transparent_50%)]">
	<div class="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
		<div class="text-left">
			<Badge
				variant="outline"
				class="bg-brand-red/10 text-brand-red border-brand-red/20 px-3 py-1 rounded-full font-semibold uppercase tracking-wider mb-8 gap-2"
			>
				<span class="relative flex h-2 w-2">
					<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
					<span class="relative inline-flex rounded-full h-2 w-2 bg-brand-red"></span>
				</span>
				Procesos Activos: 1,204
			</Badge>
			<h1 class="text-5xl md:text-6xl font-bold tracking-tighter mb-8 leading-[1.1]">
				Votación descentralizada,<br />
				<span class="text-brand-red">redefinida.</span>
			</h1>
			<p class="text-lg md:text-xl text-brand-gray-800 mb-12 leading-relaxed">
				Gobernanza segura, transparente y verificable para organizaciones modernas. Construido sobre arquitectura de
				conocimiento cero.
			</p>
			<div class="flex flex-col sm:flex-row items-center gap-4">
				<Button
					variant="default"
					class="!h-auto rounded-full bg-brand-black hover:bg-brand-red text-lg shadow-lg px-8 py-4 w-full sm:w-auto border-0"
				>
					Iniciar Propuesta
				</Button>
				<Button
					variant="outline"
					class="!h-auto rounded-full border-brand-gray-200 text-brand-black hover:border-brand-black text-lg px-8 py-4 w-full sm:w-auto bg-brand-white"
				>
					Leer Docs
				</Button>
			</div>
		</div>
		<div class="relative">
			<div class="aspect-[4/3] rounded-2xl shadow-2xl overflow-hidden relative">
				<img
					alt="Universidad estructurada o estatua que simboliza la toma de decisiones colectiva"
					class="w-full h-full object-cover"
					src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvHTtaSaTD0fuahAB-kvmIg3OG6ALur-NLyQYVfRXxKf0CO6M7alMgPswnzRUcB6GfjB7HL0mtYcp5WGmAKCMD1xCCxJ1Y-mYcN1vB1k9pv2eNlPtPamLkuiFH8BdA7OeuopNBZq_ZDJkdWNNQlMUreeGli-HLf6NuZvIN_p1HSQPgmi-A_Q5sPAQBQthGJ8GuBJz4v1JG5tFCXm97GwqohXvflwGTqFujBvM-qWWlguZ09KP8doK8ggDz8eqj4tAcgq8Yztxbhvo1"
				/>
			</div>
		</div>
	</div>
</section>
