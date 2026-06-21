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

  // Stepper geometry — Tailwind v4 arbitrary values. On sm+ the connector is
  // a horizontal hairline; on mobile it stays vertical. Dots live on the
  // connector at the column centers (sm+). Mobile falls back to divide-y
  // for separation and the dots/connector are `hidden sm:flex/sm:block`.

  // Stepper progress: a segment between two adjacent dots fills with the
  // status color when the LEFT phase is done OR the RIGHT phase has been
  // reached (active or done). Otherwise it stays the default border color.
  const compVotFilled = $derived(
    compromisoState === "done" || votacionState !== "upcoming",
  );
  const votResFilled = $derived(
    votacionState === "done" || resultadosState !== "upcoming",
  );

  // Per-dot bg class. Active/done dots wear the status color; upcoming dots
  // sit in the neutral border. text-color tokens are safe to use for `bg-*`
  // in this app because the Tailwind config maps both the text and bg
  // variants to the same CSS variable.
  const compromisoDotClass = $derived(
    compromisoState === "active" || compromisoState === "done"
      ? STATUS_LABEL_COLORS[effectiveStatus]
      : "bg-consensus-border",
  );
  const votacionDotClass = $derived(
    votacionState === "active" || votacionState === "done"
      ? STATUS_LABEL_COLORS[effectiveStatus]
      : "bg-consensus-border",
  );
  const resultadosDotClass = $derived(
    resultadosState === "active" || resultadosState === "done"
      ? STATUS_LABEL_COLORS[effectiveStatus]
      : "bg-consensus-border",
  );

  // Phase label color rule (post-refactor): a label is tinted ONLY when its
  // phase is the active one for the current effectiveStatus. All other
  // phases (upcoming OR done) read as muted gray.
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

  <!-- Stepper grid. On sm+ this renders as a 3-column horizontal stepper
       with an absolute connector line running through three dots (one per
       column). On mobile (<640px) it stacks the three phases with a
       horizontal `divide-y` line between them, and the connector/dots are
       hidden — `divide-y` does the visual separation work on small screens.

       Manual visual check for the sm+ connector: confirm the hairline runs
       flush with the dot centers and the progress overlays color the
       correct segments (vitest-browser-svelte uses a fixed viewport that
       may not exercise the sm breakpoint). -->
  <div
    data-testid="timeline-stepper"
    class="relative grid grid-cols-1 sm:grid-cols-3 divide-y divide-consensus-border sm:divide-y-0"
  >
    <!-- Base connector hairline. Vertical on mobile (column = phase),
         horizontal across the row on sm+. -->
    <div
      data-testid="timeline-stepper-connector"
      aria-hidden="true"
      class="hidden sm:block absolute left-0 right-0 top-2 h-px bg-consensus-border"
    ></div>

    <!-- Progress overlay: Compromiso → Votación segment. Sits on top of the
         base connector, between the two dots (column centers at 1/6 and
         1/2 in a 3-column grid). -->
    <div
      aria-hidden="true"
      class="hidden sm:block absolute top-2 left-[16.6667%] right-1/2 h-px {compVotFilled
        ? STATUS_LABEL_COLORS[effectiveStatus].replace('text-', 'bg-')
        : 'bg-consensus-border'}"
    ></div>

    <!-- Progress overlay: Votación → Resultados segment. -->
    <div
      aria-hidden="true"
      class="hidden sm:block absolute top-2 left-1/2 right-[16.6667%] h-px {votResFilled
        ? STATUS_LABEL_COLORS[effectiveStatus].replace('text-', 'bg-')
        : 'bg-consensus-border'}"
    ></div>

    <!-- Compromiso -->
    <div
      data-testid="phase-compromiso"
      data-state={compromisoState}
      class="flex flex-col gap-consensus-2 items-center text-center px-consensus-4 py-consensus-4 sm:py-consensus-2"
    >
      <span
        data-testid="phase-compromiso-dot"
        aria-hidden="true"
        class={cn(
          "hidden sm:inline-block size-2.5 rounded-full ring-2 ring-consensus-white z-10",
          compromisoDotClass,
        )}
      ></span>
      <span
        data-testid="phase-compromiso-label"
        class={cn(
          labelClass,
          compromisoState === "active" && STATUS_LABEL_COLORS[effectiveStatus],
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
        data-testid="phase-votacion-dot"
        aria-hidden="true"
        class={cn(
          "hidden sm:inline-block size-2.5 rounded-full ring-2 ring-consensus-white z-10",
          votacionDotClass,
        )}
      ></span>
      <span
        data-testid="phase-votacion-label"
        class={cn(
          labelClass,
          votacionState === "active" && STATUS_LABEL_COLORS[effectiveStatus],
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
        data-testid="phase-resultados-dot"
        aria-hidden="true"
        class={cn(
          "hidden sm:inline-block size-2.5 rounded-full ring-2 ring-consensus-white z-10",
          resultadosDotClass,
        )}
      ></span>
      <span
        data-testid="phase-resultados-label"
        class={cn(
          labelClass,
          resultadosState === "active" && STATUS_LABEL_COLORS[effectiveStatus],
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
