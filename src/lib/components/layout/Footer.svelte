<script lang="ts">
	import githubIcon from '$lib/assets/github-svgrepo-com.svg?raw';
	import linkedinIcon from '$lib/assets/icons8-linkedin.svg?raw';
	import emailIcon from '$lib/assets/email-svgrepo-com.svg?raw';

	type NavLink = {
		href: string;
		label: string;
	};

	type SocialLink = {
		href: string;
		label: string;
		icon: string;
	};

	const navLinks: NavLink[] = [
		{ href: '/procesos', label: 'Procesos' },
		{ href: '/docs', label: 'Documentación' }
	];

	const socialLinks: SocialLink[] = [
		{ href: '#', label: 'GitHub', icon: githubIcon },
		{ href: '#', label: 'LinkedIn', icon: linkedinIcon },
		{ href: '#', label: 'Email', icon: emailIcon }
	];
</script>

<footer class="bg-consensus-black text-consensus-white">
	<div class="max-w-7xl mx-auto px-6 lg:px-8 py-8 md:py-10">
		<div class="flex flex-col md:flex-row justify-between items-center gap-8">
			<!-- Brand + tagline -->
			<div class="flex flex-col items-center md:items-start gap-3">
				<a href="/" class="flex items-center gap-2">
					<div
						class="w-7 h-7 bg-consensus-red rounded flex items-center justify-center text-white font-bold text-lg"
					>
						C
					</div>
					<span class="text-lg font-bold tracking-tight">Consensus</span>
				</a>
				<p class="text-sm text-consensus-white/60 text-center md:text-left max-w-sm">
					Construyendo la infraestructura para la toma de decisiones verificable, privada y
					descentralizada.
				</p>
			</div>

			<!-- Links + socials -->
			<div class="flex flex-col items-center md:items-end gap-4">
				<nav aria-label="Navegación del footer">
					<ul class="flex items-center gap-6 text-sm">
						{#each navLinks as link (link.href)}
							<li>
								<a
									href={link.href}
									class="text-consensus-white/60 hover:text-consensus-white transition-colors"
								>
									{link.label}
								</a>
							</li>
						{/each}
					</ul>
				</nav>

					<div class="flex items-center gap-4">
						{#each socialLinks as social (social.label)}
							<a
								href={social.href}
								aria-label={social.label}
								class="text-consensus-white/60 hover:text-consensus-white transition-colors [&_svg]:size-5"
							>
								<!-- Local static SVGs are inlined so fill="currentColor" inherits the parent text color. -->
								{@html social.icon}
							</a>
						{/each}
					</div>
			</div>
		</div>

		<!-- Copyright -->
		<div
			class="mt-8 pt-6 border-t border-consensus-white/10 text-sm text-consensus-white/60 text-center"
		>
			© 2026 Plataforma Consensus. Todos los derechos reservados.
		</div>
	</div>
</footer>
