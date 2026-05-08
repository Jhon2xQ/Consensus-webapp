<script lang="ts">
	import { Button } from "$lib/components/ui/button";
</script>

<section class="relative min-h-screen pt-26 lg:pt20 px-6 flex flex-col justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(187,0,18,0.05)_0%,transparent_50%)]">
	<div class="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
		<div class="text-left">
			<h1 class="text-4xl md:text-7xl font-bold tracking-tighter mb-8 leading-[1.1]">
				Votación descentralizada,<br />
				<span class="text-brand-red">redefinida.</span>
			</h1>
			<p class="text-xl md:text-2xl text-brand-gray-800 mb-12 leading-relaxed">
				Gobernanza segura, transparente y verificable para organizaciones modernas. Construido sobre arquitectura de
				conocimiento cero.
			</p>
			<div class="flex flex-col sm:flex-row items-center gap-4">
				<Button
					variant="default"
					class="h-auto! rounded-full bg-brand-black hover:bg-brand-red text-lg shadow-lg px-8 py-4 w-full sm:w-auto border-0"
				>
					Iniciar Propuesta
				</Button>
				<Button
					variant="outline"
					class="h-auto! rounded-full border-brand-gray-200 text-brand-black hover:border-brand-black text-lg px-8 py-4 w-full sm:w-auto bg-brand-white"
				>
					Leer Docs
				</Button>
			</div>
		</div>
		<div class="">
			<div class="aspect-4/3 rounded-2xl shadow-2xl overflow-hidden relative">
				<img
					alt="Universidad estructurada o estatua que simboliza la toma de decisiones colectiva"
					class="w-full h-full object-cover"
					src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvHTtaSaTD0fuahAB-kvmIg3OG6ALur-NLyQYVfRXxKf0CO6M7alMgPswnzRUcB6GfjB7HL0mtYcp5WGmAKCMD1xCCxJ1Y-mYcN1vB1k9pv2eNlPtPamLkuiFH8BdA7OeuopNBZq_ZDJkdWNNQlMUreeGli-HLf6NuZvIN_p1HSQPgmi-A_Q5sPAQBQthGJ8GuBJz4v1JG5tFCXm97GwqohXvflwGTqFujBvM-qWWlguZ09KP8doK8ggDz8eqj4tAcgq8Yztxbhvo1"
				/>
			</div>
		</div>
	</div>
</section>
