<script lang="ts">
  import type { ElectoralProcessStatus } from "$lib/types/electoral-process";
  import { STATUS_LABELS } from "$lib/types/process-status";
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
  <!-- Eyebrow: status indicator. Mirrors the static eyebrow copy that lived
       here before, but now surfaces the process effectiveStatus so the user
       can read "where we are" at a glance. Style stays the same: small,
       uppercase, tracked, muted, centered. -->
  <h2
    data-testid="timeline-status-eyebrow"
    class="text-xs font-semibold uppercase tracking-[0.12em] text-consensus-muted text-center mb-consensus-4"
  >
    ESTADO : {STATUS_LABELS[effectiveStatus]}
  </h2>

  <!-- Grid: no `gap` on sm+ — `sm:divide-x` renders dividers between phase
       columns so they read as a cohesive timeline. Mobile uses `divide-y`
       so the three phases stack with horizontal dividers. Each phase
       column is `items-center text-center` so the label and merged
       date+time row align down a shared vertical axis. -->
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
        data-testid="phase-compromiso-label"
        class={cn(
          labelClass,
          compromisoState === "active" && "text-consensus-red",
          compromisoState === "done" && "text-emerald-700",
        )}
      >
        Compromiso
      </span>
      <!-- Range = two full datetime units (start, end) on a single flex row.
           Each unit stacks its date above its time so the pair reads as one
           timestamp. The en-dash sits between the two units, centered with
           the units via items-center. -->
      <div class="flex items-center gap-consensus-3">
        <div
          data-testid="phase-compromiso-start"
          class="flex flex-col items-center gap-consensus-1"
        >
          <span
            data-testid="phase-compromiso-start-date"
            class="text-sm font-semibold text-consensus-fg"
          >
            {formatDate(commitmentStart)}
          </span>
          <span
            data-testid="phase-compromiso-start-time"
            class="font-mono text-xs text-consensus-muted"
          >
            {formatTime(commitmentStart)}
          </span>
        </div>
        <span
          data-testid="phase-compromiso-separator"
          class="text-consensus-muted"
          aria-hidden="true"
        >
          –
        </span>
        <div
          data-testid="phase-compromiso-end"
          class="flex flex-col items-center gap-consensus-1"
        >
          <span
            data-testid="phase-compromiso-end-date"
            class="text-sm font-semibold text-consensus-fg"
          >
            {formatDate(commitmentEnd)}
          </span>
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
        data-testid="phase-votacion-label"
        class={cn(
          labelClass,
          votacionState === "active" && "text-consensus-red",
          votacionState === "done" && "text-emerald-700",
        )}
      >
        Votación
      </span>
      <div class="flex items-center gap-consensus-3">
        <div
          data-testid="phase-votacion-start"
          class="flex flex-col items-center gap-consensus-1"
        >
          <span
            data-testid="phase-votacion-start-date"
            class="text-sm font-semibold text-consensus-fg"
          >
            {formatDate(votingStart)}
          </span>
          <span
            data-testid="phase-votacion-start-time"
            class="font-mono text-xs text-consensus-muted"
          >
            {formatTime(votingStart)}
          </span>
        </div>
        <span
          data-testid="phase-votacion-separator"
          class="text-consensus-muted"
          aria-hidden="true"
        >
          –
        </span>
        <div
          data-testid="phase-votacion-end"
          class="flex flex-col items-center gap-consensus-1"
        >
          <span
            data-testid="phase-votacion-end-date"
            class="text-sm font-semibold text-consensus-fg"
          >
            {formatDate(votingEnd)}
          </span>
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
        data-testid="phase-resultados-label"
        class={cn(
          labelClass,
          resultadosState === "active" && "text-consensus-red",
          resultadosState === "done" && "text-emerald-700",
        )}
      >
        Resultados
      </span>
      <div class="flex flex-col gap-consensus-1">
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
  </div>
</section>