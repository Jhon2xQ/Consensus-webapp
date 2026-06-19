<script lang="ts">
  // Technology section — landing redesign (PR 3).
  // Source markup: consensus-landing.html. No state, no props.
  import technologyImg from "$lib/assets/technology.png";
</script>

<section class="py-consensus-24 bg-consensus-black text-consensus-white">
  <div class="max-w-7xl mx-auto px-6 lg:px-8">
    <div
      class="grid grid-cols-1 md:grid-cols-2 gap-consensus-16 md:gap-consensus-20 items-center"
    >
      <div class="flex flex-col gap-consensus-5">
        <header class="text-left mb-consensus-8">
          <span
            class="block font-mono text-[11px] font-medium tracking-widest uppercase text-consensus-white/50 mb-consensus-4"
          >
            Tecnología
          </span>
          <h2
            class="font-display font-bold leading-[1.1] tracking-widest mb-consensus-4 text-[clamp(30px,4vw,46px)]"
          >
            Impulsado por matemáticas, asegurado por Blockchain.
          </h2>
          <p class="text-lg text-consensus-white/60 leading-[1.55]">
            Arquitectura de conocimiento cero y libro mayor inmutable para una
            gobernanza sin precedentes.
          </p>
        </header>
        <p class="text-sm text-consensus-white/45 leading-[1.7] max-w-105">
          Semaphore permite generar identidades privadas vinculadas a un grupo
          sin revelar cuál miembro sos. Tus votos son contables sin ser
          rastreables.
        </p>
      </div>
      <div
        class="flex items-center justify-center aspect-4/3 rounded-consensus-lg overflow-hidden"
      >
        <img
          src={technologyImg}
          alt="Representacion de tecnologia ZK y blockchain"
          class="w-full h-full object-contain"
        />
      </div>
    </div>
  </div>
</section>
