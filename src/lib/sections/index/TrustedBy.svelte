<script lang="ts">
	// TrustedBy section — landing redesign (PR 3).
	// Source markup: consensus-landing.html. No state, no props.

	import unsaacImg from '$lib/assets/unsaac-posgrado.png';
	import centroFederadoImg from '$lib/assets/centro-federado.png';
</script>

<section
	class="py-consensus-16 bg-consensus-gray-100 border-y border-consensus-border-soft"
>
	<div class="max-w-7xl mx-auto px-6 lg:px-8">
		<p
			class="font-mono text-[11px] font-medium tracking-[0.1em] uppercase text-consensus-muted text-center mb-consensus-8"
		>
			En colaboración con
		</p>
		<div class="flex flex-wrap justify-center items-center gap-consensus-12">
			<img
				src={unsaacImg}
				alt="Escuela de Posgrado UNSAAC"
				class="h-20 md:h-24 w-auto object-contain grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition duration-300"
			/>
			<img
				src={centroFederadoImg}
				alt="Centro Federado de Ingenieria Informatica y de Sistemas"
				class="h-20 md:h-24 w-auto object-contain grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition duration-300"
			/>
		</div>
	</div>
</section>
