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
					<!-- cryptographic circuit wireframe (consensus-landing.html) -->
					<circle
						cx="280"
						cy="210"
						r="100"
						stroke="rgba(187,0,18,0.3)"
						stroke-width="1"
						stroke-dasharray="6 4"
					/>
					<circle cx="280" cy="210" r="60" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
					<circle
						cx="280"
						cy="210"
						r="20"
						fill="rgba(187,0,18,0.2)"
						stroke="rgba(187,0,18,0.5)"
						stroke-width="1.5"
					/>
					<text
						x="280"
						y="216"
						text-anchor="middle"
						font-family="JetBrains Mono, monospace"
						font-size="11"
						fill="rgba(255,107,107,0.8)">zk</text
					>
					<!-- outer nodes -->
					<circle cx="280" cy="90" r="6" fill="rgba(255,255,255,0.3)" />
					<circle cx="380" cy="130" r="6" fill="rgba(255,255,255,0.3)" />
					<circle cx="420" cy="210" r="6" fill="rgba(255,255,255,0.3)" />
					<circle cx="380" cy="290" r="6" fill="rgba(255,255,255,0.3)" />
					<circle cx="280" cy="330" r="6" fill="rgba(255,255,255,0.3)" />
					<circle cx="180" cy="290" r="6" fill="rgba(255,255,255,0.3)" />
					<circle cx="140" cy="210" r="6" fill="rgba(255,255,255,0.3)" />
					<circle cx="180" cy="130" r="6" fill="rgba(255,255,255,0.3)" />
					<!-- connecting lines -->
					<line
						x1="280"
						y1="90"
						x2="280"
						y2="150"
						stroke="rgba(255,255,255,0.1)"
						stroke-width="1"
					/>
					<line
						x1="380"
						y1="130"
						x2="320"
						y2="170"
						stroke="rgba(255,255,255,0.1)"
						stroke-width="1"
					/>
					<line
						x1="420"
						y1="210"
						x2="350"
						y2="210"
						stroke="rgba(255,255,255,0.1)"
						stroke-width="1"
					/>
					<line
						x1="380"
						y1="290"
						x2="320"
						y2="250"
						stroke="rgba(255,255,255,0.1)"
						stroke-width="1"
					/>
					<line
						x1="280"
						y1="330"
						x2="280"
						y2="270"
						stroke="rgba(255,255,255,0.1)"
						stroke-width="1"
					/>
					<line
						x1="180"
						y1="290"
						x2="240"
						y2="250"
						stroke="rgba(255,255,255,0.1)"
						stroke-width="1"
					/>
					<line
						x1="140"
						y1="210"
						x2="210"
						y2="210"
						stroke="rgba(255,255,255,0.1)"
						stroke-width="1"
					/>
					<line
						x1="180"
						y1="130"
						x2="240"
						y2="170"
						stroke="rgba(255,255,255,0.1)"
						stroke-width="1"
					/>
					<!-- equation -->
					<text
						x="280"
						y="390"
						text-anchor="middle"
						font-family="JetBrains Mono, monospace"
						font-size="10"
						fill="rgba(255,255,255,0.25)"
						letter-spacing="1">H(identity) ∈ merkle_tree(group_root)</text
					>
					<!-- label -->
					<text
						x="280"
						y="56"
						text-anchor="middle"
						font-family="Inter, sans-serif"
						font-size="11"
						fill="rgba(255,255,255,0.3)"
						letter-spacing="2">ZERO-KNOWLEDGE CIRCUIT</text
					>
				</svg>
			</div>
		</div>
	</div>
</section>
