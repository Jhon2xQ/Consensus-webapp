<script lang="ts">
	// Technology section — landing redesign (PR 3).
	// Source markup: consensus-landing.html. No state, no props.
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
			<div
				class="rounded-consensus-lg overflow-hidden aspect-[4/3] bg-consensus-white/[0.04] border border-consensus-white/10 relative"
			>
				<svg
					class="absolute inset-0 w-full h-full"
					viewBox="0 0 560 420"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					role="img"
					aria-label="Circuito criptográfico de conocimiento cero"
				>
					<!-- Outer ring -->
					<circle cx="280" cy="210" r="180" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
					<circle cx="280" cy="210" r="130" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
					<circle cx="280" cy="210" r="80" fill="none" stroke="rgba(187,0,18,0.3)" stroke-width="1.5" />

					<!-- Center node -->
					<circle cx="280" cy="210" r="24" fill="rgba(187,0,18,0.15)" stroke="#bb0012" stroke-width="2" />
					<text x="280" y="215" text-anchor="middle" fill="#bb0012" font-family="monospace" font-size="14" font-weight="600">zk</text>

					<!-- Outer nodes (8 points) -->
					<!-- Top -->
					<circle cx="280" cy="30" r="6" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
					<line x1="280" y1="36" x2="280" y2="130" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
					<!-- Top-right -->
					<circle cx="407" cy="83" r="6" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
					<line x1="401" y1="89" x2="310" y2="170" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
					<!-- Right -->
					<circle cx="460" cy="210" r="6" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
					<line x1="454" y1="210" x2="304" y2="210" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
					<!-- Bottom-right -->
					<circle cx="407" cy="337" r="6" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
					<line x1="401" y1="331" x2="310" y2="250" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
					<!-- Bottom -->
					<circle cx="280" cy="390" r="6" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
					<line x1="280" y1="384" x2="280" y2="290" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
					<!-- Bottom-left -->
					<circle cx="153" cy="337" r="6" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
					<line x1="159" y1="331" x2="250" y2="250" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
					<!-- Left -->
					<circle cx="100" cy="210" r="6" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
					<line x1="106" y1="210" x2="256" y2="210" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
					<!-- Top-left -->
					<circle cx="153" cy="83" r="6" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
					<line x1="159" y1="89" x2="250" y2="170" stroke="rgba(255,255,255,0.1)" stroke-width="1" />

					<!-- Connection lines from outer nodes to center -->
					<line x1="280" y1="36" x2="280" y2="186" stroke="rgba(187,0,18,0.2)" stroke-width="1" />
					<line x1="401" y1="89" x2="304" y2="190" stroke="rgba(187,0,18,0.2)" stroke-width="1" />
					<line x1="454" y1="210" x2="304" y2="210" stroke="rgba(187,0,18,0.2)" stroke-width="1" />
					<line x1="401" y1="331" x2="304" y2="230" stroke="rgba(187,0,18,0.2)" stroke-width="1" />
					<line x1="280" y1="384" x2="280" y2="234" stroke="rgba(187,0,18,0.2)" stroke-width="1" />
					<line x1="159" y1="331" x2="256" y2="230" stroke="rgba(187,0,18,0.2)" stroke-width="1" />
					<line x1="106" y1="210" x2="256" y2="210" stroke="rgba(187,0,18,0.2)" stroke-width="1" />
					<line x1="159" y1="89" x2="256" y2="190" stroke="rgba(187,0,18,0.2)" stroke-width="1" />
				</svg>
			</div>
		</div>
	</div>
</section>
