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
  //   "done"     → past phase
  //   "upcoming" → future phase
  // The COMPROMISO phase transitions from active (during COMMITMENT) to
  // done from SEALED onwards (SEALED / VOTING / COUNTING / CLOSED).
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

  // Eyebrow styling: the whole eyebrow block — label, separator, and value
  // word — wears the status color (text and border). Mirrors the badge
  // treatment in ProcessList but rendered inline rather than as a pill.
  const eyebrowClass = $derived(
    cn(
      "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em]",
      "px-3 py-1.5 rounded-consensus-sm border",
      STATUS_LABEL_COLORS[effectiveStatus],
      STATUS_LABEL_COLORS[effectiveStatus].replace('text-', 'border-'),
    ),
  );

  // Phase label: always muted. The eyebrow carries the status color, so the
  // labels below stay neutral and let the eyebrow do the highlighting.
  const labelClass =
    "font-mono text-[11px] font-semibold tracking-[0.08em] uppercase text-consensus-muted";
</script>

<section>
  <!-- Eyebrow: status indicator. Renders the literal "ESTADO ACTUAL :"
       followed by the Spanish status label. The whole block wears the
       status text color and a matching border so it reads as a labeled
       pill, not plain chrome. -->
  <div class="flex justify-center mb-consensus-4">
    <h2 data-testid="timeline-status-eyebrow" class={eyebrowClass}>
      <span>ESTADO ACTUAL :</span>
      <span data-testid="timeline-status-eyebrow-value">
        {STATUS_LABELS[effectiveStatus]}
      </span>
    </h2>
  </div>

  <!-- Divider between the status eyebrow and the phase columns. Hairline
       width, full content width (max-w-7xl like the page container) so
       it visually separates the two sections without dominating them. -->
  <div
    data-testid="timeline-divider"
    aria-hidden="true"
    class="max-w-7xl mx-auto border-t border-consensus-border mb-consensus-4"
  ></div>

  <!-- Phase columns. Mobile (<640px) stacks the three phases with a
       horizontal divide-y line between them; sm+ keeps them as a 3-column
       row. Labels are plain muted text — no icons, no per-phase tints. -->
  <div
    class="grid grid-cols-1 sm:grid-cols-3 divide-y divide-consensus-border sm:divide-y-0"
  >
    <!-- Compromiso -->
    <div
      data-testid="phase-compromiso"
      data-state={compromisoState}
      class="flex flex-col gap-consensus-2 items-center text-center px-consensus-4 py-consensus-4 sm:py-consensus-2"
    >
      <span data-testid="phase-compromiso-label" class={labelClass}>
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
      <span data-testid="phase-votacion-label" class={labelClass}>
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
      <span data-testid="phase-resultados-label" class={labelClass}>
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