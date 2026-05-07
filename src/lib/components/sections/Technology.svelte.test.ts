import { render } from "vitest-browser-svelte";
import { describe, expect, test } from "vitest";
import Technology from "./Technology.svelte";

describe("Technology shadcn Card + Badge migration", () => {
	test("renders 2 shadcn Card elements with data-slot='card'", async () => {
		const screen = render(Technology);
		const cards = screen.container.querySelectorAll('[data-slot="card"]');
		expect(cards.length).toBe(2);
	});

	test("renders 2 shadcn Badge elements with data-slot='badge'", async () => {
		const screen = render(Technology);
		const badges = screen.container.querySelectorAll('[data-slot="badge"]');
		expect(badges.length).toBe(2);
	});

	test("renders ZK and BC text", async () => {
		const screen = render(Technology);
		await expect.element(screen.getByText("ZK")).toBeInTheDocument();
		await expect.element(screen.getByText("BC")).toBeInTheDocument();
	});

	test("renders feature titles", async () => {
		const screen = render(Technology);
		await expect.element(
			screen.getByText("Arquitectura de Conocimiento Cero")
		).toBeInTheDocument();
		await expect.element(
			screen.getByText("Libro Mayor Inmutable")
		).toBeInTheDocument();
	});

	test("Cards have transparent background overrides", async () => {
		const screen = render(Technology);
		const cards = screen.container.querySelectorAll('[data-slot="card"]');
		cards.forEach((card) => {
			expect(card.className).toContain("bg-transparent");
			expect(card.className).toContain("shadow-none");
		});
	});
});
