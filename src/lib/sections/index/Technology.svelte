<script lang="ts">
	// Technology section — landing redesign (PR 3).
	// Source markup: consensus-landing.html. No state, no props.
	import technologyImg from '$lib/assets/technology.png';
</script>

<section class="py-consensus-24 bg-consensus-black text-consensus-white">
	<div class="max-w-7xl mx-auto px-6 lg:px-8">
		<div
			class="grid grid-cols-1 md:grid-cols-2 gap-consensus-16 md:gap-consensus-20 items-center"
		>
			<div class="flex flex-col gap-consensus-5">
				<header class="text-left mb-consensus-8">
					<span
						class="block font-mono text-[11px] font-medium tracking-[0.1em] uppercase text-consensus-white/50 mb-consensus-4"
					>
						Tecnología
					</span>
					<h2
						class="font-display font-bold leading-[1.1] tracking-[-0.025em] mb-consensus-4 text-[clamp(30px,4vw,46px)]"
					>
						Impulsado por matemáticas, asegurado por Blockchain.
					</h2>
					<p class="text-lg text-consensus-white/60 leading-[1.55]">
						Arquitectura de conocimiento cero y libro mayor inmutable para una gobernanza sin
						precedentes.
					</p>
				</header>
				<div class="flex flex-col gap-consensus-6 mb-consensus-8">
					<!-- ZK badge: red-tinted background with mono tag using currentColor -->
					<div
						class="inline-flex items-center gap-consensus-3 px-consensus-5 py-consensus-4 border border-consensus-red/40 rounded-consensus-md font-display text-sm font-bold tracking-[0.02em] bg-consensus-red/15 text-[#ff6b6b]"
					>
						<span
							class="font-mono text-[10px] font-medium px-[6px] py-[2px] rounded-[3px] bg-current text-consensus-black tracking-[0.05em]"
						>
							ZK
						</span>
						Arquitectura de Conocimiento Cero (Semaphore)
					</div>
					<!-- BC badge: white-tinted background with mono tag using currentColor -->
					<div
						class="inline-flex items-center gap-consensus-3 px-consensus-5 py-consensus-4 border border-consensus-white/15 rounded-consensus-md font-display text-sm font-bold tracking-[0.02em] bg-consensus-white/[0.06] text-consensus-white"
					>
						<span
							class="font-mono text-[10px] font-medium px-[6px] py-[2px] rounded-[3px] bg-current text-consensus-black tracking-[0.05em]"
						>
							BC
						</span>
						Libro Mayor Inmutable (blockchain)
					</div>
				</div>
				<p
					class="text-sm text-consensus-white/45 leading-[1.7] max-w-[420px]"
				>
					Semaphore permite generar identidades privadas vinculadas a un grupo sin revelar cuál
					miembro sos. Tus votos son contables sin ser rastreables.
				</p>
			</div>
			<div class="flex items-center justify-center aspect-[4/3] rounded-consensus-lg overflow-hidden">
				<img
					src={technologyImg}
					alt="Representacion de tecnologia ZK y blockchain"
					class="w-full h-full object-contain"
				/>
			</div>
		</div>
	</div>
</section>
