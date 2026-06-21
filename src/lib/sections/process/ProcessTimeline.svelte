<script lang="ts">
  import type { ElectoralProcessStatus } from "$lib/types/electoral-process";
  import { cn } from "$lib/utils.js";

  type Props = {
    commitmentStart: string;
    commitmentEnd: string;
    votingStart: string;
    votingEnd: string;
    results: string;
    effectiveStatus: ElectoralProcessStatus;
  };

  let {
    commitmentStart,
    commitmentEnd,
    votingStart,
    votingEnd,
    results,
    effectiveStatus,
  }: Props = $props();

  function formatDate(iso: string): string {
    const date = new Date(iso);
    const parts = new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).formatToParts(date);
    // Filter out "literal" parts (locale-specific separators like "de" in es-AR)
    // and join with spaces so the output is "DD MMMM YYYY" in any locale.
    const filtered = parts.filter((p) => p.type !== "literal");
    return filtered.map((p) => p.value).join(" ");
  }

  function formatTime(iso: string): string {
    return new Intl.DateTimeFormat("es-AR", { timeStyle: "short" }).format(
      new Date(iso),
    );
  }

  // State per phase for the current effectiveStatus. "active" = current,
  // "done" = past, "upcoming" = future. The COMPROMISO phase transitions
  // from active (during COMMITMENT) to done (from SEALED onwards).
  type PhaseState = "active" | "done" | "upcoming";
  const compromisoState: PhaseState = $derived(
    effectiveStatus === "COMMITMENT"
      ? "active"
      : effectiveStatus === "SEALED" ||
          effectiveStatus === "VOTING" ||
          effectiveStatus === "COUNTING" ||
          effectiveStatus === "CLOSED"
        ? "done"
        : "upcoming",
  );
  const votacionState: PhaseState = $derived(
    effectiveStatus === "VOTING"
      ? "active"
      : effectiveStatus === "COUNTING" || effectiveStatus === "CLOSED"
        ? "done"
        : "upcoming",
  );
  const resultadosState: PhaseState = $derived(
    effectiveStatus === "COUNTING"
      ? "active"
      : effectiveStatus === "CLOSED"
        ? "done"
        : "upcoming",
  );

  const labelClass =
    "font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-consensus-muted";
</script>

<section>
  <!-- Eyebrow heading: matches the muted/small aesthetic of section
       eyebrows elsewhere on the page. Centered, tracks +0.12em, muted. -->
  <h2
    class="text-xs font-semibold uppercase tracking-[0.12em] text-consensus-muted text-center mb-consensus-4"
  >
    Línea de tiempo
  </h2>

  <!-- Grid: no `gap` on sm+ — `sm:divide-x` renders dividers between phase
       columns so they read as a cohesive timeline. Mobile uses `divide-y`
       so the three phases stack with horizontal dividers. Each phase
       column is `items-center text-center` so the label, dates row, and
       times row all align down a shared vertical axis. -->
  <div
    class="grid grid-cols-1 sm:grid-cols-3 sm:divide-x sm:divide-consensus-border divide-y divide-consensus-border"
  >
    <!-- Compromiso -->
    <div
      data-testid="phase-compromiso"
      data-state={compromisoState}
      class="flex flex-col gap-consensus-2 items-center text-center px-consensus-4 py-consensus-4 sm:py-consensus-2"
    >
      <span
        class={cn(
          labelClass,
          compromisoState === "active" && "text-consensus-red",
          compromisoState === "done" && "text-emerald-700",
        )}
      >
        Compromiso
      </span>
      <div class="flex flex-col gap-consensus-1">
        <div class="flex items-center gap-consensus-2">
          <span
            data-testid="phase-compromiso-start-date"
            class="text-sm font-semibold text-consensus-fg"
          >
            {formatDate(commitmentStart)}
          </span>
          <span
            data-testid="phase-compromiso-separator"
            class="text-consensus-muted self-center"
            aria-hidden="true"
          >
            –
          </span>
          <span
            data-testid="phase-compromiso-end-date"
            class="text-sm font-semibold text-consensus-fg"
          >
            {formatDate(commitmentEnd)}
          </span>
        </div>
        <div class="flex items-center gap-consensus-2">
          <span
            data-testid="phase-compromiso-start-time"
            class="font-mono text-xs text-consensus-muted"
          >
            {formatTime(commitmentStart)}
          </span>
          <span class="w-2 shrink-0" aria-hidden="true"></span>
          <span
            data-testid="phase-compromiso-end-time"
            class="font-mono text-xs text-consensus-muted"
          >
            {formatTime(commitmentEnd)}
          </span>
        </div>
      </div>
    </div>

    <!-- Votación -->
    <div
      data-testid="phase-votacion"
      data-state={votacionState}
      class="flex flex-col gap-consensus-2 items-center text-center px-consensus-4 py-consensus-4 sm:py-consensus-2"
    >
      <span
        class={cn(
          labelClass,
          votacionState === "active" && "text-consensus-red",
          votacionState === "done" && "text-emerald-700",
        )}
      >
        Votación
      </span>
      <div class="flex flex-col gap-consensus-1">
        <div class="flex items-center gap-consensus-2">
          <span
            data-testid="phase-votacion-start-date"
            class="text-sm font-semibold text-consensus-fg"
          >
            {formatDate(votingStart)}
          </span>
          <span
            data-testid="phase-votacion-separator"
            class="text-consensus-muted self-center"
            aria-hidden="true"
          >
            –
          </span>
          <span
            data-testid="phase-votacion-end-date"
            class="text-sm font-semibold text-consensus-fg"
          >
            {formatDate(votingEnd)}
          </span>
        </div>
        <div class="flex items-center gap-consensus-2">
          <span
            data-testid="phase-votacion-start-time"
            class="font-mono text-xs text-consensus-muted"
          >
            {formatTime(votingStart)}
          </span>
          <span class="w-2 shrink-0" aria-hidden="true"></span>
          <span
            data-testid="phase-votacion-end-time"
            class="font-mono text-xs text-consensus-muted"
          >
            {formatTime(votingEnd)}
          </span>
        </div>
      </div>
    </div>

    <!-- Resultados -->
    <div
      data-testid="phase-resultados"
      data-state={resultadosState}
      class="flex flex-col gap-consensus-2 items-center text-center px-consensus-4 py-consensus-4 sm:py-consensus-2"
    >
      <span
        class={cn(
          labelClass,
          resultadosState === "active" && "text-consensus-red",
          resultadosState === "done" && "text-emerald-700",
        )}
      >
        Resultados
      </span>
      <span
        data-testid="phase-resultados-date"
        class="text-sm font-semibold text-consensus-fg"
      >
        {formatDate(results)}
      </span>
      <span
        data-testid="phase-resultados-time"
        class="font-mono text-xs text-consensus-muted"
      >
        {formatTime(results)}
      </span>
    </div>
  </div>
</section>
