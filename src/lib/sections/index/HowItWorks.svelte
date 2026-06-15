<script lang="ts">
	import {
		PenSquare,
		ShieldCheck,
		Database,
		BarChart3,
		type Icon as IconType
	} from '@lucide/svelte';

	type Step = {
		id: string;
		label: string;
		title: string;
		description: string;
		Icon: typeof IconType;
	};

	// Per product decision (sdd/landing-redesign/product-assumptions) the step
	// labels keep the project wording 'Paso 01..04' instead of the bare '01..04'
	// used in consensus-landing.html. Card body copy follows the HTML.
	const steps: Step[] = [
		{
			id: 'firma',
			label: 'Paso 01',
			title: 'Firma del Voto',
			description:
				'Generación de pruebas de pertenencia y firma privada mediante Semaphore, sin exponer tu identidad.',
			Icon: PenSquare
		},
		{
			id: 'verificacion',
			label: 'Paso 02',
			title: 'Verificación de Identidad',
			description:
				'Validación criptográfica sin revelar identidad. Solo el voto es público, nunca el votante.',
			Icon: ShieldCheck
		},
		{
			id: 'persistencia',
			label: 'Paso 03',
			title: 'Persistencia On-Chain',
			description:
				'Registro inmutable en blockchain. Cada compromiso y voto queda sellado permanentemente.',
			Icon: Database
		},
		{
			id: 'escrutinio',
			label: 'Paso 04',
			title: 'Escrutinio y Resultados',
			description:
				'Conteo automatizado con resultados verificables por cualquier persona, en cualquier momento.',
			Icon: BarChart3
		}
	];
</script>

<section class="py-consensus-24 bg-consensus-white">
	<div class="max-w-7xl mx-auto px-6 lg:px-8">
		<header class="text-center max-w-[600px] mx-auto mb-consensus-16">
			<span
				class="block font-mono text-[11px] font-medium tracking-[0.1em] uppercase text-consensus-muted mb-consensus-4"
			>
				Proceso
			</span>
			<h2
				class="font-display font-bold leading-[1.1] tracking-[-0.025em] mb-consensus-4 text-[clamp(30px,4vw,46px)]"
			>
				El Flujo de Consensus
			</h2>
			<p class="text-lg text-consensus-muted leading-[1.55]">
				Un desglose intuitivo paso a paso de cómo se toman decisiones seguras.
			</p>
		</header>
		<div class="grid gap-consensus-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
			{#each steps as step (step.id)}
				<article
					class="p-consensus-8 border border-consensus-border rounded-consensus-lg bg-consensus-white transition-[border-color,box-shadow] duration-[240ms] ease-[cubic-bezier(0.2,0,0,1)] hover:border-consensus-gray-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
				>
					<span
						class="block font-display text-[11px] font-bold tracking-[0.05em] text-consensus-red mb-consensus-5"
					>
						{step.label}
					</span>
					<div
						class="w-11 h-11 rounded-consensus-md bg-consensus-red/[0.06] flex items-center justify-center mb-consensus-5 [&_svg]:w-[22px] [&_svg]:h-[22px] [&_svg]:text-consensus-red"
						aria-hidden="true"
					>
						<step.Icon />
					</div>
					<h3
						class="font-display text-xl font-bold tracking-[-0.015em] mb-consensus-2 text-consensus-fg"
					>
						{step.title}
					</h3>
					<p class="text-sm text-consensus-muted leading-[1.6]">
						{step.description}
					</p>
				</article>
			{/each}
		</div>
	</div>
</section>
