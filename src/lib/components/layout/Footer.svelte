<script lang="ts">
	import { GitBranch, Globe, X } from '@lucide/svelte';

	const productLinks = [
		{ label: 'Características', href: '#' },
		{ label: 'Seguridad', href: '#' },
		{ label: 'Documentación', href: '#' },
	];

	const companyLinks = [
		{ label: 'Sobre Nosotros', href: '#' },
		{ label: 'Carreras', href: '#' },
		{ label: 'Contacto', href: '#' },
	];

	const socials = [
		{ label: 'GitHub', href: '#', Icon: GitBranch },
		{ label: 'LinkedIn', href: '#', Icon: Globe },
		{ label: 'X', href: '#', Icon: X },
	];
</script>

<footer class="bg-brand-white pt-24 pb-12 border-t border-brand-gray-100">
	<div class="max-w-7xl mx-auto px-6 lg:px-8">
		<!-- 4-column grid (md+): brand 1.5fr | Producto | Empresa | (4th empty — Legal REMOVED per FR-F-5).
		     On mobile all 4 columns stack (grid-cols-1). -->
		<div class="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 mb-16">
			<!-- Brand column (FR-F-2) -->
			<div class="md:col-span-1">
				<a href="/" class="flex items-center gap-2 mb-6">
					<div
						class="w-8 h-8 bg-brand-red rounded flex items-center justify-center text-white font-bold text-xl"
					>
						C
					</div>
					<span class="text-xl font-bold tracking-tight">Consensus</span>
				</a>
				<p class="text-brand-gray-800 max-w-sm">
					Construyendo la infraestructura para la toma de decisiones verificable, privada y
					descentralizada.
				</p>
			</div>

			<!-- Producto (FR-F-3) -->
			<div>
				<h4 class="font-bold mb-6">Producto</h4>
				<ul class="space-y-4 text-sm text-brand-gray-800">
					{#each productLinks as link (link.label)}
						<li>
							<a
								href={link.href}
								class="hover:text-brand-red transition-colors"
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Empresa (FR-F-4) -->
			<div>
				<h4 class="font-bold mb-6">Empresa</h4>
				<ul class="space-y-4 text-sm text-brand-gray-800">
					{#each companyLinks as link (link.label)}
						<li>
							<a
								href={link.href}
								class="hover:text-brand-red transition-colors"
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- 4th column intentionally empty: Legal column removed (FR-F-5) -->
			<div aria-hidden="true"></div>
		</div>

		<!-- Copyright + social anchors (FR-F-6) -->
		<div
			class="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-brand-gray-100 text-sm text-brand-gray-800"
		>
			<p>© 2026 Plataforma Consensus. Todos los derechos reservados.</p>
			<div class="flex items-center gap-4 mt-4 md:mt-0">
				{#each socials as social (social.label)}
					<a
						href={social.href}
						aria-label={social.label}
						class="text-brand-gray-800 hover:text-brand-red transition-colors"
					>
						<social.Icon class="size-5" />
					</a>
				{/each}
			</div>
		</div>
	</div>
</footer>
