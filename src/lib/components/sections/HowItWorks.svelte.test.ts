import { render } from "vitest-browser-svelte";
import { describe, expect, test } from "vitest";
import HowItWorks from "./HowItWorks.svelte";

describe("HowItWorks shadcn Card migration", () => {
	test("renders 4 shadcn Card elements with data-slot='card'", async () => {
		const screen = render(HowItWorks);
		const cards = screen.container.querySelectorAll('[data-slot="card"]');
		expect(cards.length).toBe(4);
	});

	test("renders step numbers 1-4", async () => {
		const screen = render(HowItWorks);
		await expect.element(screen.getByText("1")).toBeInTheDocument();
		await expect.element(screen.getByText("2")).toBeInTheDocument();
		await expect.element(screen.getByText("3")).toBeInTheDocument();
		await expect.element(screen.getByText("4")).toBeInTheDocument();
	});

	test("renders step titles", async () => {
		const screen = render(HowItWorks);
		await expect.element(screen.getByRole("heading", { name: "Propuesta" })).toBeInTheDocument();
		await expect.element(screen.getByRole("heading", { name: "Discusión" })).toBeInTheDocument();
		await expect.element(screen.getByRole("heading", { name: "Votación" })).toBeInTheDocument();
		await expect.element(screen.getByRole("heading", { name: "Escrutinio" })).toBeInTheDocument();
	});

	test("Cards have transparent background override classes", async () => {
		const screen = render(HowItWorks);
		const cards = screen.container.querySelectorAll('[data-slot="card"]');
		cards.forEach((card) => {
			expect(card.className).toContain("bg-transparent");
			expect(card.className).toContain("shadow-none");
		});
	});
});
