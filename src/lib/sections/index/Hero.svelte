<script lang="ts">
	// Hero section — landing redesign (PR 2).
	// Source markup: consensus-landing.html. No state, no props.
	import heroImg from '$lib/assets/hero.png';
</script>

<section class="bg-consensus-white text-consensus-fg py-consensus-24">
	<div class="max-w-7xl mx-auto px-6 lg:px-8">
		<div class="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-consensus-16 lg:gap-consensus-20 items-center">
			<div>
				<span
					class="inline-flex items-center gap-consensus-2 font-mono text-[11px] font-medium tracking-[0.1em] uppercase text-consensus-muted mb-consensus-6"
				>
					<span aria-hidden="true" class="block w-6 h-px bg-consensus-red"></span>
					Plataforma de votación descentralizada
				</span>
				<h1
					class="font-display font-extrabold leading-[1.02] tracking-[-0.03em] mb-consensus-6 text-[clamp(42px,6vw,74px)]"
				>
					Votación descentralizada, <em class="not-italic text-consensus-red">redefinida</em>.
				</h1>
				<p
					class="text-[clamp(16px,2vw,19px)] text-consensus-fg-2 leading-[1.6] max-w-[520px] mb-consensus-10"
				>
					Gobernanza segura, transparente y verificable para organizaciones modernas. Construido
					sobre arquitectura de conocimiento cero.
				</p>
				<div class="flex flex-wrap gap-consensus-3">
					<a
						href="/dashboard"
						class="inline-flex items-center justify-center gap-consensus-2 px-[18px] py-[10px] rounded-consensus-md font-body text-sm font-semibold tracking-[-0.01em] whitespace-nowrap bg-consensus-red text-consensus-white hover:bg-consensus-red-hover transition-colors duration-[150ms]"
					>
						Iniciar Propuesta
					</a>
					<!-- svelte-ignore a11y_invalid_attribute -->
					<a
						href="#"
						class="inline-flex items-center justify-center gap-consensus-2 px-[18px] py-[10px] rounded-consensus-md font-body text-sm font-semibold tracking-[-0.01em] whitespace-nowrap bg-transparent text-consensus-fg border border-consensus-border hover:bg-consensus-gray-100 hover:border-consensus-gray-400 transition-all duration-[150ms]"
					>
						Leer Docs
					</a>
				</div>
			</div>
			<div>
				<div
					class="flex items-center justify-center aspect-[4/3] rounded-consensus-lg overflow-hidden"
				>
					<img
						src={heroImg}
						alt="Vista arquitectonica institucional"
						class="w-full h-full object-contain"
					/>
				</div>
			</div>
		</div>
	</div>
</section>
