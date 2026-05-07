import { render } from "vitest-browser-svelte";
import { describe, expect, test } from "vitest";
import Footer from "./Footer.svelte";

describe("Footer shadcn migration", () => {
  test("renders 8 shadcn Button elements with data-slot='button'", async () => {
    const screen = render(Footer);
    const buttons = screen.container.querySelectorAll('button[data-slot="button"]');
    expect(buttons.length).toBe(8);
  });

  test("renders no raw <button> elements without data-slot", async () => {
    const screen = render(Footer);
    const rawButtons = screen.container.querySelectorAll("button:not([data-slot])");
    expect(rawButtons.length).toBe(0);
  });

  test("renders Producto section texts", async () => {
    const screen = render(Footer);
    await expect.element(screen.getByText("Características")).toBeInTheDocument();
    await expect.element(screen.getByText("Seguridad")).toBeInTheDocument();
    await expect.element(screen.getByText("Documentación")).toBeInTheDocument();
  });

  test("renders Empresa section texts", async () => {
    const screen = render(Footer);
    await expect.element(screen.getByText("Sobre Nosotros")).toBeInTheDocument();
    await expect.element(screen.getByText("Carreras")).toBeInTheDocument();
    await expect.element(screen.getByText("Contacto")).toBeInTheDocument();
  });

  test("renders legal section texts", async () => {
    const screen = render(Footer);
    await expect.element(screen.getByText("Términos de Servicio")).toBeInTheDocument();
    await expect.element(screen.getByText("Política de Privacidad")).toBeInTheDocument();
  });
});
