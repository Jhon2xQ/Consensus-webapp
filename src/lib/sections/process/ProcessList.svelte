<script lang="ts">
  import { goto } from "$app/navigation";
  import { cn } from "$lib/utils.js";
  import type { ElectoralProcess, ElectoralProcessStatus } from "$lib/types/electoral-process.js";
  import {
    STATUS_LABELS,
    STATUS_COLORS,
    isHighlightedProcess,
  } from "$lib/types/process-status.js";

  type Props = {
    processes: ElectoralProcess[];
    page: number;
    totalPages: number;
    totalElements: number;
    error: string | null;
    onpagechange: (page: number) => void;
  };

  let {
    processes,
    page,
    totalPages,
    totalElements,
    error = null,
    onpagechange = () => {},
  }: Props = $props();

  let isEmpty = $derived(
    processes.length === 0 && totalElements === 0 && !error,
  );
  let hasError = $derived(error !== null);
  let hasNextPage = $derived(page < totalPages);
  let hasPrevPage = $derived(page > 1);
  let pageNumbers = $derived(
    Array.from({ length: totalPages }, (_, i) => i + 1),
  );

  function getStatusLabel(estatus: ElectoralProcessStatus): string {
    return STATUS_LABELS[estatus] ?? estatus;
  }

  function getStatusStyle(estatus: ElectoralProcessStatus): string {
    return (
      STATUS_COLORS[estatus] ??
      "bg-brand-gray-200 text-brand-gray-800 border-brand-gray-300"
    );
  }

  function formatDate(iso: string): string {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "America/Argentina/Buenos_Aires",
    }).format(new Date(iso));
  }

  function formatTime(iso: string): string {
    return new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Argentina/Buenos_Aires",
    }).format(new Date(iso));
  }

  function formatMetadata(count: number | null | undefined): string {
    if (count == null) return "—";
    return new Intl.NumberFormat("es-AR").format(count);
  }
</script>

<!-- Header Section -->
<section class="pt-24 pb-8">
  <div class="max-w-7xl mx-auto px-6 lg:px-8">
    <h1 class="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
      Procesos Electorales
    </h1>
    <p class="text-lg md:text-xl text-brand-gray-800">
      Explorá los procesos electorales activos y su estado actual.
    </p>
  </div>
</section>

<!-- Content Section -->
<section class="pb-24">
  <div class="max-w-7xl mx-auto px-6 lg:px-8">
    {#if hasError}
      <!-- Error State -->
      <div class="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p class="text-red-700 text-sm font-medium">{error}</p>
      </div>
    {:else if isEmpty}
      <!-- Empty State -->
      <div class="text-center py-12">
        <p class="text-muted-foreground text-sm">
          No hay procesos disponibles.
        </p>
      </div>
    {:else}
      <!-- Process Cards -->
      <ul class="flex flex-col gap-4">
        {#each processes as process (process.id)}
          {@const highlighted = isHighlightedProcess(process.estatus)}
          <li
            class={cn(
              "border rounded-xl p-6 flex flex-col gap-5 transition-shadow hover:shadow-md",
              highlighted
                ? "border-brand-red ring-1 ring-brand-red"
                : "border-brand-gray-200",
            )}
          >
            <!-- Top: Name + Description | Status Badge -->
            <div class="flex items-start justify-between gap-4">
              <div class="flex flex-col gap-1 min-w-0">
                <h2 class="text-lg font-bold text-brand-red leading-tight">
                  {process.name}
                </h2>
                {#if process.description !== null}
                  <p class="text-sm text-brand-gray-800 mt-1 line-clamp-2">
                    {process.description}
                  </p>
                {/if}
              </div>
              <span
                class={cn(
                  "shrink-0 text-xs font-semibold px-3 py-1 border rounded-md",
                  getStatusStyle(process.estatus),
                )}
              >
                {getStatusLabel(process.estatus)}
              </span>
            </div>

            <!-- Dates Section -->
            <div class="flex flex-col gap-3">
              <!-- Compromiso -->
              <div class="flex items-baseline gap-3">
                <span class="text-[11px] font-medium text-brand-gray-400 uppercase tracking-wider shrink-0 w-[90px]">COMPROMISO</span>
                <span class="text-sm font-medium text-brand-black">{formatDate(process.commitmentStart)}</span>
                <span class="text-xs text-brand-gray-400">{formatTime(process.commitmentStart)} – {formatDate(process.commitmentEnd)} {formatTime(process.commitmentEnd)}</span>
              </div>
              <!-- Votación -->
              <div class="flex items-baseline gap-3">
                <span class="text-[11px] font-medium text-brand-gray-400 uppercase tracking-wider shrink-0 w-[90px]">VOTACIÓN</span>
                <span class="text-sm font-medium text-brand-black">{formatDate(process.votingStart)}</span>
                <span class="text-xs text-brand-gray-400">{formatTime(process.votingStart)} – {formatDate(process.votingEnd)} {formatTime(process.votingEnd)}</span>
              </div>
              <!-- Resultados -->
              <div class="flex items-baseline gap-3">
                <span class="text-[11px] font-medium text-brand-gray-400 uppercase tracking-wider shrink-0 w-[90px]">RESULTADOS</span>
                <span class="text-sm font-medium text-brand-black">{formatDate(process.results)}</span>
                <span class="text-xs text-brand-gray-400">{formatTime(process.results)}</span>
              </div>
            </div>

            <!-- Footer: Metadata | Action -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-brand-gray-400">
                {formatMetadata(process.teamsCount)} equipos · {formatMetadata(process.participantsCount)} participantes
              </span>
              {#if highlighted}
                <button
                  class="bg-brand-red hover:bg-brand-red/90 text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors"
                  onclick={() => goto(`/procesos/${process.id}`)}
                >
                  Participar
                </button>
              {:else}
                <button
                  class="bg-brand-gray-100 hover:bg-brand-gray-200 text-brand-gray-400 text-sm font-semibold px-4 py-2 rounded-md transition-colors"
                  onclick={() => goto(`/procesos/${process.id}`)}
                >
                  Verificar
                </button>
              {/if}
            </div>
          </li>
        {/each}
      </ul>

      <!-- Pagination Controls — numbered buttons -->
      <nav class="flex items-center justify-center gap-2 pt-8 pb-12">
        <button
          class="min-w-9 h-9 px-3 rounded-md text-sm font-medium text-brand-gray-800 border border-brand-gray-200 bg-white transition-colors hover:bg-brand-gray-100 disabled:opacity-35 disabled:pointer-events-none"
          disabled={!hasPrevPage}
          onclick={() => onpagechange(page - 1)}
        >
          ← Anterior
        </button>
        {#each pageNumbers as n (n)}
          <button
            class={cn(
              "min-w-9 h-9 px-3 rounded-md text-sm font-medium border transition-colors disabled:pointer-events-none",
              n === page
                ? "bg-black text-white border-black"
                : "text-brand-gray-800 border-brand-gray-200 bg-white hover:bg-brand-gray-100",
            )}
            disabled={n === page}
            onclick={() => onpagechange(n)}
          >
            {n}
          </button>
        {/each}
        <button
          class="min-w-9 h-9 px-3 rounded-md text-sm font-medium text-brand-gray-800 border border-brand-gray-200 bg-white transition-colors hover:bg-brand-gray-100 disabled:opacity-35 disabled:pointer-events-none"
          disabled={!hasNextPage}
          onclick={() => onpagechange(page + 1)}
        >
          Siguiente →
        </button>
      </nav>
    {/if}
  </div>
</section>
