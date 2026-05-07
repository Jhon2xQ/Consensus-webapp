import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const CSS_PATH = "src/routes/layout.css";

function readLayoutCss(): string {
	return readFileSync(CSS_PATH, "utf-8");
}

describe("layout.css font configuration", () => {
	test('removes Inter font import', () => {
		const css = readLayoutCss();
		expect(css).not.toContain('@import "@fontsource-variable/inter"');
	});

	test('sets --font-sans to Space Grotesk', () => {
		const css = readLayoutCss();
		expect(css).toContain("--font-sans: 'Space Grotesk Variable', sans-serif");
	});

	test('keeps --font-heading as Space Grotesk', () => {
		const css = readLayoutCss();
		expect(css).toContain("--font-heading: 'Space Grotesk Variable', sans-serif");
	});

	test('keeps Space Grotesk @import', () => {
		const css = readLayoutCss();
		expect(css).toContain('@import "@fontsource-variable/space-grotesk"');
	});
});
