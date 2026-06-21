<script lang="ts">
  import type { ElectoralProcessStatus } from "$lib/types/electoral-process";
  import { STATUS_LABELS, STATUS_LABEL_COLORS } from "$lib/types/process-status";
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

  // Per-phase visual state:
  //   "active"   → current phase for the effectiveStatus
  //   "done"     → past phase (and reached at least once during the process)
  //   "upcoming" → future phase
  // COMPROMISO transitions active (during COMMITMENT) to done (SEALED/VOTING/
  // COUNTING) and back to a non-done read in the terminal CLOSED state (all
  // phases collapse to the "pending dot" affordance).
  type PhaseState = "active" | "done" | "upcoming";
  const compromisoState: PhaseState = $derived(
    effectiveStatus === "COMMITMENT"
      ? "active"
      : effectiveStatus === "VOTING" || effectiveStatus === "COUNTING"
        ? "done"
        : "upcoming",
  );
  const votacionState: PhaseState = $derived(
    effectiveStatus === "VOTING"
      ? "active"
      : effectiveStatus === "COUNTING"
        ? "done"
        : "upcoming",
  );
  const resultadosState: PhaseState = $derived(
    effectiveStatus === "COUNTING" ? "active" : "upcoming",
  );

  // Per-phase icon. A phase shows a CHECK inside a circle when it was reached
  // and passed successfully (done). Otherwise it shows a DOT inside a circle
  // (active OR upcoming OR terminal CLOSED — anything that hasn't fully
  // completed shows the pending marker). This collapses the CLOSED state to
  // all-dots by design, per product spec.
  function iconKind(state: PhaseState): "check" | "dot" {
    return state === "done" ? "check" : "dot";
  }

  const compromisoIcon = $derived(iconKind(compromisoState));
  const votacionIcon = $derived(iconKind(votacionState));
  const resultadosIcon = $derived(iconKind(resultadosState));

  // Phase label color rule: a label is tinted IFF that phase is the active
  // one for the current effectiveStatus. The status word in the eyebrow and
  // the active phase label share STATUS_LABEL_COLORS so the page reads as a
  // single highlighted step.
  const labelClass =
    "font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-consensus-muted";

  // Per-icon container styling. Both check and dot use the same neutral
  // muted color so the icon reads as a passive state marker (done vs
  // pending). Per product spec, no status color is applied to the icons —
  // the eyebrow status word is the single source of color for the timeline.
  function iconRingClass(): string {
    return "border-consensus-border text-consensus-muted";
  }

  const compromisoIconClass = $derived(iconRingClass());
  const votacionIconClass = $derived(iconRingClass());
  const resultadosIconClass = $derived(iconRingClass());
</script>

<section>
  <!-- Eyebrow: status indicator. "ESTADO :" stays muted; the status word
       itself picks up the status text color from STATUS_LABEL_COLORS, so
       the eyebrow reads as a labeled highlight rather than a uniform
       muted string. -->
  <h2
    data-testid="timeline-status-eyebrow"
    class="text-xs font-semibold uppercase tracking-[0.12em] text-consensus-muted text-center mb-consensus-4"
  >
    ESTADO : <span
      data-testid="timeline-status-eyebrow-value"
      class={STATUS_LABEL_COLORS[effectiveStatus]}
    >
      {STATUS_LABELS[effectiveStatus]}
    </span>
  </h2>

  <!-- Phase columns. Each phase shows a small circle next to its label:
       a check inside the circle means the phase was completed (done); a
       dot inside means it's pending (active / upcoming / terminal CLOSED).
       Mobile (<640px) stacks the three phases with a horizontal divide-y
       line between them; sm+ keeps them as a 3-column row. -->
  <div
    class="grid grid-cols-1 sm:grid-cols-3 divide-y divide-consensus-border sm:divide-y-0"
  >
    <!-- Compromiso -->
    <div
      data-testid="phase-compromiso"
      data-state={compromisoState}
      class="flex flex-col gap-consensus-2 items-center text-center px-consensus-4 py-consensus-4 sm:py-consensus-2"
    >
      <span class="flex items-center gap-consensus-2">
        <span
          data-testid="phase-compromiso-label"
          class={cn(
            labelClass,
            compromisoState === "active" && STATUS_LABEL_COLORS[effectiveStatus],
          )}
        >
          Compromiso
        </span>
        <span
          data-testid="phase-compromiso-icon"
          data-icon={compromisoIcon}
          aria-hidden="true"
          class={cn(
            "inline-flex items-center justify-center size-4 rounded-full border-2",
            compromisoIconClass,
          )}
        >
          {#if compromisoIcon === "check"}
            <svg
              data-testid="phase-compromiso-icon-check"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="size-3"
            >
              <polyline points="2.5 6.2 4.8 8.5 9.5 3.8" />
            </svg>
          {:else}
            <span
              data-testid="phase-compromiso-icon-dot"
              class="block size-1.5 rounded-full bg-current"
            ></span>
          {/if}
        </span>
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
      <span class="flex items-center gap-consensus-2">
        <span
          data-testid="phase-votacion-label"
          class={cn(
            labelClass,
            votacionState === "active" && STATUS_LABEL_COLORS[effectiveStatus],
          )}
        >
          Votación
        </span>
        <span
          data-testid="phase-votacion-icon"
          data-icon={votacionIcon}
          aria-hidden="true"
          class={cn(
            "inline-flex items-center justify-center size-4 rounded-full border-2",
            votacionIconClass,
          )}
        >
          {#if votacionIcon === "check"}
            <svg
              data-testid="phase-votacion-icon-check"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="size-3"
            >
              <polyline points="2.5 6.2 4.8 8.5 9.5 3.8" />
            </svg>
          {:else}
            <span
              data-testid="phase-votacion-icon-dot"
              class="block size-1.5 rounded-full bg-current"
            ></span>
          {/if}
        </span>
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
      <span class="flex items-center gap-consensus-2">
        <span
          data-testid="phase-resultados-label"
          class={cn(
            labelClass,
            resultadosState === "active" && STATUS_LABEL_COLORS[effectiveStatus],
          )}
        >
          Resultados
        </span>
        <span
          data-testid="phase-resultados-icon"
          data-icon={resultadosIcon}
          aria-hidden="true"
          class={cn(
            "inline-flex items-center justify-center size-4 rounded-full border-2",
            resultadosIconClass,
          )}
        >
          {#if resultadosIcon === "check"}
            <svg
              data-testid="phase-resultados-icon-check"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="size-3"
            >
              <polyline points="2.5 6.2 4.8 8.5 9.5 3.8" />
            </svg>
          {:else}
            <span
              data-testid="phase-resultados-icon-dot"
              class="block size-1.5 rounded-full bg-current"
            ></span>
          {/if}
        </span>
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