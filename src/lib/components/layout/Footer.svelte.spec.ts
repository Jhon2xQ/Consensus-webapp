import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import Footer from "./Footer.svelte";

describe("Footer.svelte", () => {
  it('renders the logo with "Consensus" text', async () => {
    render(Footer);

    await expect.element(page.getByText(/^Consensus$/)).toBeInTheDocument();
  });

  it("renders the tagline description", async () => {
    render(Footer);

    await expect
      .element(page.getByText("Construyendo la infraestructura para la toma de decisiones verificable, privada y descentralizada."))
      .toBeInTheDocument();
  });

  it('renders "Producto" link column', async () => {
    render(Footer);

    await expect.element(page.getByText("Características")).toBeInTheDocument();
    await expect.element(page.getByText("Seguridad")).toBeInTheDocument();
    await expect.element(page.getByText("Documentación")).toBeInTheDocument();
  });

  it('renders "Empresa" link column', async () => {
    render(Footer);

    await expect.element(page.getByText("Sobre Nosotros")).toBeInTheDocument();
    await expect.element(page.getByText("Carreras")).toBeInTheDocument();
    await expect.element(page.getByText("Contacto")).toBeInTheDocument();
  });

  it("renders copyright text", async () => {
    render(Footer);

    await expect.element(page.getByText("© 2026 Plataforma Consensus. Todos los derechos reservados.")).toBeInTheDocument();
  });

  it("renders social media icons", async () => {
    render(Footer);

    await expect.element(page.getByLabelText("GitHub")).toBeVisible();
    await expect.element(page.getByLabelText("LinkedIn")).toBeVisible();
    await expect.element(page.getByLabelText("X")).toBeVisible();
  });
});
