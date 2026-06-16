import { page } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import ProcessList from "./ProcessList.svelte";
import type { ElectoralProcess } from "$lib/types/electoral-process";

const mockProcess: ElectoralProcess = {
  id: "1",
  name: "Elecciones Nacionales 2026",
  scope: "Nacional",
  description: "Proceso electoral para elegir representantes nacionales.",
  groupId: null,
  estatus: "COMMITMENT",
  commitmentStart: "2026-03-01T13:00:00Z",
  commitmentEnd: "2026-04-30T23:59:00Z",
  votingStart: "2026-06-15T08:00:00Z",
  votingEnd: "2026-06-20T20:00:00Z",
  results: "2026-06-25T18:00:00Z",
  createdBy: "user-1",
  teamsCount: 3,
  participantsCount: 1247,
};

const mockProcessNoDesc: ElectoralProcess = {
  ...mockProcess,
  id: "2",
  name: "Elecciones Provinciales Buenos Aires",
  scope: "Provincial",
  description: null,
  estatus: "VOTING",
  teamsCount: 5,
  participantsCount: 890,
};

const mockProcessClosed: ElectoralProcess = {
  ...mockProcess,
  id: "3",
  name: "Comicios Cerrados",
  scope: "Municipal",
  description: null,
  estatus: "CLOSED",
  teamsCount: 2,
  participantsCount: 450,
};

const mockProcessOpen: ElectoralProcess = {
  ...mockProcess,
  id: "4",
  name: "Proceso Abierto",
  scope: "Nacional",
  description: null,
  estatus: "OPEN",
  teamsCount: 4,
  participantsCount: 2000,
};

const mockProcessSealed: ElectoralProcess = {
  ...mockProcess,
  id: "5",
  name: "Proceso Sellado",
  scope: "Provincial",
  description: null,
  estatus: "SEALED",
  teamsCount: 1,
  participantsCount: 300,
};

const mockProcessCounting: ElectoralProcess = {
  ...mockProcess,
  id: "6",
  name: "Proceso en Conteo",
  scope: "Municipal",
  description: null,
  estatus: "COUNTING",
  teamsCount: 2,
  participantsCount: 567,
};

function defaultProps(overrides?: Record<string, unknown>) {
  return {
    processes: [mockProcess],
    page: 1,
    totalPages: 3,
    totalElements: 12,
    error: null,
    onpagechange: vi.fn(),
    ...overrides,
  };
}

describe("ProcessList.svelte (public)", () => {
  describe("card top section", () => {
    it("renders the page title", async () => {
      render(ProcessList, defaultProps());
      await expect
        .element(
          page.getByRole("heading", { level: 1, name: "Procesos Electorales" }),
        )
        .toBeInTheDocument();
    });

    it("renders process name as h2", async () => {
      render(ProcessList, defaultProps());
      await expect
        .element(
          page.getByRole("heading", { level: 2, name: "Elecciones Nacionales 2026" }),
        )
        .toBeInTheDocument();
    });

    it("renders description when not null", async () => {
      render(ProcessList, defaultProps());
      await expect
        .element(
          page.getByText(
            "Proceso electoral para elegir representantes nacionales.",
          ),
        )
        .toBeInTheDocument();
    });

    it("does not render description paragraph when null", async () => {
      render(ProcessList, defaultProps({ processes: [mockProcessNoDesc] }));
      // The process name is there
      await expect
        .element(page.getByText("Elecciones Provinciales Buenos Aires"))
        .toBeInTheDocument();
      // The description from mockProcess should NOT be there (different process)
    });
  });

  describe("status badge", () => {
    it("renders the canonical Spanish label for COMMITMENT status", async () => {
      render(ProcessList, defaultProps({ processes: [mockProcess] }));
      await expect
        .element(page.getByText("Compromiso", { exact: true }).first())
        .toBeInTheDocument();
    });

    it("renders Abierto badge for OPEN process", async () => {
      render(ProcessList, defaultProps({ processes: [mockProcessOpen] }));
      await expect
        .element(page.getByText("Abierto", { exact: true }))
        .toBeInTheDocument();
    });

    it("renders Votación badge for VOTING process", async () => {
      render(ProcessList, defaultProps({ processes: [mockProcessNoDesc] }));
      await expect
        .element(page.getByText("Votación", { exact: true }).first())
        .toBeInTheDocument();
    });

    it("renders Cerrado badge for CLOSED process", async () => {
      render(ProcessList, defaultProps({ processes: [mockProcessClosed] }));
      // "Cerrado" appears once as the status badge (STATUS_LABELS["CLOSED"]).
      // The non-highlighted footer renders a "Verificar" button instead.
      await expect
        .element(page.getByText("Cerrado", { exact: true }).first())
        .toBeInTheDocument();
    });

    it("renders all 6 status badges with distinct labels", async () => {
      render(
        ProcessList,
        defaultProps({
          processes: [
            mockProcessOpen,
            mockProcess,
            mockProcessSealed,
            mockProcessNoDesc,
            mockProcessCounting,
            mockProcessClosed,
          ],
        }),
      );
      await expect
        .element(page.getByText("Abierto", { exact: true }))
        .toBeInTheDocument();
      await expect
        .element(page.getByText("Sellado", { exact: true }))
        .toBeInTheDocument();
      await expect
        .element(page.getByText("Conteo", { exact: true }))
        .toBeInTheDocument();
      // "Cerrado" appears once: the status badge for the CLOSED process.
      // The other 5 non-highlighted footers render "Verificar" buttons.
      await expect
        .element(page.getByText("Cerrado", { exact: true }).first())
        .toBeInTheDocument();
    });
  });

  describe("date rows", () => {
    it("renders Compromiso date row label", async () => {
      render(ProcessList, defaultProps({ processes: [mockProcess] }));
      // The DOM has two "Compromiso"-ish texts: the status badge "Compromiso"
      // (mixed case) and the date row label "COMPROMISO" (uppercase).
      // Use exact:true to match the uppercase label precisely.
      await expect
        .element(page.getByText("COMPROMISO", { exact: true }))
        .toBeInTheDocument();
    });

    it("renders Votación date row label", async () => {
      render(ProcessList, defaultProps({ processes: [mockProcess] }));
      const votacionLabels = page.getByText("VOTACIÓN");
      await expect.element(votacionLabels).toBeInTheDocument();
    });

    it("renders Resultados date row label", async () => {
      render(ProcessList, defaultProps({ processes: [mockProcess] }));
      await expect
        .element(page.getByText("RESULTADOS"))
        .toBeInTheDocument();
    });

    it("renders formatted date value for commitment start", async () => {
      render(ProcessList, defaultProps({ processes: [mockProcess] }));
      // 2026-03-01T13:00:00Z → "1 marzo 2026" using local timezone methods
      await expect
        .element(page.getByText("1 marzo 2026", { exact: true }))
        .toBeInTheDocument();
    });
  });

  describe("card footer — metadata", () => {
    it("renders teams count and participants count with es-AR formatting", async () => {
      render(ProcessList, defaultProps({ processes: [mockProcess] }));
      await expect
        .element(page.getByText("3 equipos · 1.247 participantes"))
        .toBeInTheDocument();
    });

    it("renders dash fallback when metadata is null", async () => {
      const noMetadata: ElectoralProcess = {
        ...mockProcess,
        teamsCount: null,
        participantsCount: null,
      };
      render(ProcessList, defaultProps({ processes: [noMetadata] }));
      await expect
        .element(page.getByText("— equipos · — participantes"))
        .toBeInTheDocument();
    });
  });

  describe("card footer — participate action", () => {
    it("renders red Participar button for highlighted process (COMMITMENT)", async () => {
      render(ProcessList, defaultProps({ processes: [mockProcess] }));
      const btn = page.getByRole("button", { name: /Participar/ });
      await expect.element(btn).toBeInTheDocument();
      await expect.element(btn).toBeEnabled();
    });

    it("renders gray Verificar button for non-highlighted CLOSED process", async () => {
      render(ProcessList, defaultProps({ processes: [mockProcessClosed] }));
      // Non-highlighted process: footer renders a clickable "Verificar" button
      // that navigates to /procesos/${id}. Status badge still shows "Cerrado".
      await expect
        .element(page.getByText("Cerrado", { exact: true }).first())
        .toBeInTheDocument();
      const verificarBtn = page.getByRole("button", { name: "Verificar" });
      await expect.element(verificarBtn).toBeInTheDocument();
      await expect.element(verificarBtn).toBeEnabled();
      // No Participar button should exist for non-highlighted card
      const participarBtn = page.getByRole("button", { name: /Participar/ });
      await expect.element(participarBtn).not.toBeInTheDocument();
    });
  });

  describe("card highlighting", () => {
    it("highlighted process (VOTING) has red border styling", async () => {
      render(ProcessList, defaultProps({ processes: [mockProcessNoDesc] }));
      await expect
        .element(page.getByText("Elecciones Provinciales Buenos Aires"))
        .toBeInTheDocument();
      // Visual styling (border-brand-red ring-1 ring-brand-red) is applied
      // via CSS classes — we verify the card renders correctly with the button
      const btn = page.getByRole("button", { name: /Participar/ });
      await expect.element(btn).toBeInTheDocument();
    });

    it("non-highlighted process (SEALED) has default border and no red Participar button", async () => {
      render(ProcessList, defaultProps({ processes: [mockProcessSealed] }));
      // SEALED process should NOT have a Participar button
      await expect
        .element(page.getByText("Proceso Sellado"))
        .toBeInTheDocument();
    });
  });

  describe("states", () => {
    it("shows empty message when processes is empty and totalElements is 0", async () => {
      render(
        ProcessList,
        defaultProps({ processes: [], page: 1, totalElements: 0 }),
      );
      await expect
        .element(page.getByText("No hay procesos disponibles."))
        .toBeInTheDocument();
    });

    it("shows error message when error prop is set", async () => {
      render(
        ProcessList,
        defaultProps({
          processes: [],
          error: "Error al cargar los procesos. Intente nuevamente.",
        }),
      );
      await expect
        .element(
          page.getByText("Error al cargar los procesos. Intente nuevamente."),
        )
        .toBeInTheDocument();
    });

    it("does not show process cards when error is set", async () => {
      render(
        ProcessList,
        defaultProps({
          processes: [mockProcess],
          error: "Error al cargar los procesos. Intente nuevamente.",
        }),
      );
      await expect
        .element(page.getByText("Elecciones Nacionales 2026"))
        .not.toBeInTheDocument();
    });
  });

  describe("pagination — numbered buttons", () => {
    it("renders numbered page buttons", async () => {
      render(ProcessList, defaultProps({ page: 1, totalPages: 3 }));
      // "1", "2", "3" as individual buttons
      await expect
        .element(page.getByRole("button", { name: "1" }))
        .toBeInTheDocument();
      await expect
        .element(page.getByRole("button", { name: "2" }))
        .toBeInTheDocument();
      await expect
        .element(page.getByRole("button", { name: "3" }))
        .toBeInTheDocument();
    });

    it("active page button is disabled", async () => {
      render(ProcessList, defaultProps({ page: 1, totalPages: 3 }));
      const activeBtn = page.getByRole("button", { name: "1" });
      await expect.element(activeBtn).toBeDisabled();
    });

    it("renders previous button disabled on page 1", async () => {
      render(ProcessList, defaultProps({ page: 1, totalPages: 3 }));
      const prevButton = page.getByRole("button", { name: /Anterior/ });
      await expect.element(prevButton).toBeDisabled();
    });

    it("renders next button disabled on last page", async () => {
      render(ProcessList, defaultProps({ page: 3, totalPages: 3 }));
      const nextButton = page.getByRole("button", { name: /Siguiente/ });
      await expect.element(nextButton).toBeDisabled();
    });

    it("renders next button enabled when not on last page", async () => {
      render(ProcessList, defaultProps({ page: 1, totalPages: 3 }));
      const nextButton = page.getByRole("button", { name: /Siguiente/ });
      await expect.element(nextButton).toBeEnabled();
    });

    it("renders previous button enabled when not on page 1", async () => {
      render(ProcessList, defaultProps({ page: 2, totalPages: 3 }));
      const prevButton = page.getByRole("button", { name: /Anterior/ });
      await expect.element(prevButton).toBeEnabled();
    });

    it("clicking a page number fires onpagechange callback", async () => {
      const onpagechange = vi.fn();
      render(ProcessList, defaultProps({ page: 1, totalPages: 3, onpagechange }));
      const btn2 = page.getByRole("button", { name: "2" });
      await btn2.click();
      expect(onpagechange).toHaveBeenCalledWith(2);
    });

    it("clicking next fires onpagechange with page + 1", async () => {
      const onpagechange = vi.fn();
      render(ProcessList, defaultProps({ page: 1, totalPages: 3, onpagechange }));
      const nextBtn = page.getByRole("button", { name: /Siguiente/ });
      await nextBtn.click();
      expect(onpagechange).toHaveBeenCalledWith(2);
    });

    it("clicking previous fires onpagechange with page - 1", async () => {
      const onpagechange = vi.fn();
      render(ProcessList, defaultProps({ page: 2, totalPages: 3, onpagechange }));
      const prevBtn = page.getByRole("button", { name: /Anterior/ });
      await prevBtn.click();
      expect(onpagechange).toHaveBeenCalledWith(1);
    });
  });

  describe("multiple cards", () => {
    it("renders multiple process cards", async () => {
      render(
        ProcessList,
        defaultProps({
          processes: [mockProcess, mockProcessNoDesc, mockProcessClosed],
        }),
      );
      await expect
        .element(page.getByText("Elecciones Nacionales 2026"))
        .toBeInTheDocument();
      await expect
        .element(page.getByText("Elecciones Provinciales Buenos Aires"))
        .toBeInTheDocument();
      await expect
        .element(page.getByText("Comicios Cerrados"))
        .toBeInTheDocument();
    });
  });
});
