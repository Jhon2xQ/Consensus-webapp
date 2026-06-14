<script lang="ts">
  import { goto } from "$app/navigation";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Card, CardContent } from "$lib/components/ui/card/index.js";
  import { cn } from "$lib/utils.js";
  import { Calendar, Vote, Trophy, ArrowRight } from "@lucide/svelte";
  import type {
    ElectoralProcess,
    ElectoralProcessStatus,
  } from "$lib/types/electoral-process.js";
  import {
    STATUS_LABELS,
    STATUS_COLORS,
    isActiveProcess,
  } from "$lib/types/process-status.js";

  type Props = {
    processes: ElectoralProcess[];
    page: number;
    totalElements: number;
    error: string | null;
    onpagechange: (page: number) => void;
  };

  const PAGE_SIZE = 5;

  let {
    processes,
    page,
    totalElements,
    error = null,
    onpagechange = () => {},
  }: Props = $props();

  let totalPages = $derived(
    PAGE_SIZE > 0 ? Math.ceil(totalElements / PAGE_SIZE) : 0,
  );
  let isEmpty = $derived(
    processes.length === 0 && totalElements === 0 && !error,
  );
  let hasError = $derived(error !== null);
  let hasNextPage = $derived(page < totalPages);
  let hasPrevPage = $derived(page > 1);

  function getStatusLabel(estatus: ElectoralProcessStatus): string {
    return STATUS_LABELS[estatus] ?? estatus;
  }

  function getStatusStyle(estatus: ElectoralProcessStatus): string {
    return (
      STATUS_COLORS[estatus] ??
      "bg-brand-gray-200 text-brand-gray-800 border-brand-gray-300"
    );
  }

  function formatDateTime(iso: string): string {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  }

  function handlePrevPage() {
    if (hasPrevPage) onpagechange(page - 1);
  }

  function handleNextPage() {
    if (hasNextPage) onpagechange(page + 1);
  }
</script>

<!-- Header Section -->
<section class="pt-24 pb-12">
  <div class="container mx-auto px-6 lg:px-20">
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
  <div class="container mx-auto px-6 lg:px-20">
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
      <div class="flex flex-col gap-4">
        {#each processes as process (process.id)}
          {@const isOpen = isActiveProcess(process.estatus)}
          <Card
            class={cn(
              "overflow-hidden",
              isOpen && "ring-2 ring-red-200 border-red-300",
            )}
          >
            <CardContent class="p-0">
              <div
                class="grid grid-cols-1 md:grid-cols-[1.25fr_1fr_1fr_1fr_1fr]"
              >
                <!-- Column 1: Name + Scope + Description -->
                <div class="p-5 flex flex-col gap-1 items-start">
                  <h2 class="text-lg font-bold text-brand-red leading-tight">
                    {process.name}
                  </h2>
                  {#if process.description !== null}
                    <p class="text-sm text-brand-gray-800 mt-1">
                      {process.description}
                    </p>
                  {/if}
                </div>

                <!-- Column 2: Compromiso -->
                <div
                  class="p-4 m-2 rounded-lg border border-brand-gray-200/60 bg-brand-gray-50/30 flex flex-col gap-2 items-center text-center"
                >
                  <div
                    class="flex items-center gap-1.5 text-[11px] font-semibold text-brand-gray-400 uppercase tracking-wider"
                  >
                    <Calendar class="size-3.5" />
                    Compromiso
                  </div>
                  <div class="space-y-2 w-full">
                    <div>
                      <span
                        class="text-[11px] text-brand-gray-400 uppercase tracking-wider"
                        >Inicio</span
                      >
                      <p class="text-sm text-brand-black font-medium">
                        {formatDateTime(process.commitmentStart)}
                      </p>
                    </div>
                    <div>
                      <span
                        class="text-[11px] text-brand-gray-400 uppercase tracking-wider"
                        >Fin</span
                      >
                      <p class="text-sm text-brand-black font-medium">
                        {formatDateTime(process.commitmentEnd)}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Column 3: Votación -->
                <div
                  class="p-4 m-2 rounded-lg border border-brand-gray-200/60 bg-brand-gray-50/30 flex flex-col gap-2 items-center text-center"
                >
                  <div
                    class="flex items-center gap-1.5 text-[11px] font-semibold text-brand-gray-400 uppercase tracking-wider"
                  >
                    <Vote class="size-3.5" />
                    Votación
                  </div>
                  <div class="space-y-2 w-full">
                    <div>
                      <span
                        class="text-[11px] text-brand-gray-400 uppercase tracking-wider"
                        >Inicio</span
                      >
                      <p class="text-sm text-brand-black font-medium">
                        {formatDateTime(process.votingStart)}
                      </p>
                    </div>
                    <div>
                      <span
                        class="text-[11px] text-brand-gray-400 uppercase tracking-wider"
                        >Fin</span
                      >
                      <p class="text-sm text-brand-black font-medium">
                        {formatDateTime(process.votingEnd)}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Column 4: Resultados -->
                <div
                  class="p-4 m-2 rounded-lg border border-brand-gray-200/60 bg-brand-gray-50/30 flex flex-col gap-2 items-center text-center"
                >
                  <div
                    class="flex items-center gap-1.5 text-[11px] font-semibold text-brand-gray-400 uppercase tracking-wider"
                  >
                    <Trophy class="size-3.5" />
                    Resultados
                  </div>
                  <div class="space-y-2 w-full">
                    <div>
                      <span
                        class="text-[11px] text-brand-gray-400 uppercase tracking-wider"
                        >Fecha</span
                      >
                      <p class="text-sm text-brand-black font-medium">
                        {formatDateTime(process.results)}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Column 5: Estado -->
                <div
                  class="p-5 flex flex-col items-center justify-center gap-4 h-full"
                >
                  <Badge
                    variant="outline"
                    class={cn(
                      "text-xs font-semibold px-3 py-1",
                      getStatusStyle(process.estatus),
                    )}
                  >
                    {getStatusLabel(process.estatus)}
                  </Badge>
                  <Button
                    variant="default"
                    class="w-auto text-sm font-semibold gap-2 bg-brand-red hover:bg-brand-red/90 text-white"
                    onclick={() => goto(`/procesos/${process.id}`)}
                  >
                    Participar
                    <ArrowRight class="size-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        {/each}
      </div>

      <!-- Pagination Controls -->
      <div class="flex items-center justify-center mt-8 gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrevPage}
          onclick={handlePrevPage}
        >
          ← Anterior
        </Button>
        <span class="text-sm text-brand-gray-400 px-3 tabular-nums">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onclick={handleNextPage}
        >
          Siguiente →
        </Button>
      </div>
    {/if}
  </div>
</section>
