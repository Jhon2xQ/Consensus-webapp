<script lang="ts">
	// Hero section — landing redesign (PR 2).
	// Source markup: consensus-landing.html. No state, no props.
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
					class="rounded-consensus-lg overflow-hidden aspect-[4/3] bg-consensus-gray-100 border border-consensus-border relative"
				>
					<svg
						class="absolute inset-0 w-full h-full"
						viewBox="0 0 560 420"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						role="img"
						aria-label="Vista arquitectónica institucional"
					>
						<rect x="40" y="180" width="80" height="200" fill="var(--consensus-color-gray-200)" rx="2" />
						<rect x="50" y="190" width="60" height="180" fill="var(--consensus-color-gray-100)" rx="2" />
						<rect x="60" y="200" width="40" height="160" fill="var(--consensus-color-gray-200)" rx="2" />
						<polygon points="80,120 40,180 120,180" fill="var(--consensus-color-gray-300)" />
						<rect x="180" y="120" width="200" height="260" fill="var(--consensus-color-gray-200)" rx="3" />
						<rect x="195" y="135" width="170" height="100" fill="var(--consensus-color-gray-100)" rx="2" />
						<rect x="195" y="250" width="170" height="115" fill="var(--consensus-color-gray-200)" rx="2" />
						<circle cx="280" cy="185" r="28" fill="var(--consensus-color-gray-300)" />
						<circle cx="280" cy="185" r="18" fill="var(--consensus-color-gray-200)" />
						<rect x="210" y="265" width="140" height="8" fill="var(--consensus-color-gray-300)" rx="4" />
						<rect x="220" y="283" width="120" height="8" fill="var(--consensus-color-gray-200)" rx="4" />
						<rect x="230" y="301" width="100" height="8" fill="var(--consensus-color-gray-300)" rx="4" />
						<rect x="420" y="80" width="100" height="300" fill="var(--consensus-color-gray-200)" rx="2" />
						<rect x="430" y="90" width="80" height="90" fill="var(--consensus-color-gray-100)" rx="2" />
						<rect x="430" y="200" width="80" height="165" fill="var(--consensus-color-gray-200)" rx="2" />
						<circle cx="470" cy="135" r="22" fill="var(--consensus-color-gray-300)" />
						<line x1="20" y1="400" x2="540" y2="400" stroke="var(--consensus-color-gray-300)" stroke-width="2" />
						<circle cx="80" cy="400" r="6" fill="var(--consensus-color-gray-300)" />
						<circle cx="280" cy="400" r="6" fill="var(--consensus-color-gray-300)" />
						<circle cx="470" cy="400" r="6" fill="var(--consensus-color-gray-300)" />
						<text
							x="280"
							y="30"
							text-anchor="middle"
							font-family="Inter, sans-serif"
							font-size="11"
							fill="var(--consensus-color-gray-400)"
							letter-spacing="2"
						>
							INSTITUTIONAL ARCHITECTURE
						</text>
					</svg>
				</div>
			</div>
		</div>
	</div>
</section>
