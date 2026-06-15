import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const LAYOUT_CSS_PATH = resolve(process.cwd(), 'src/routes/layout.css');

function readLayoutCss(): string {
	return readFileSync(LAYOUT_CSS_PATH, 'utf8');
}

/**
 * Body of a named at-rule block. Selector MUST include the trailing `{` so
 * we don't false-match prose mentions of the rule inside comments.
 */
function extractBlock(css: string, selector: string): string {
	const start = css.indexOf(selector);
	if (start === -1) return '';
	const open = start + selector.length - 1;
	if (css[open] !== '{') return '';
	let depth = 1;
	let i = open + 1;
	for (; i < css.length && depth > 0; i++) {
		const ch = css[i];
		if (ch === '{') depth++;
		else if (ch === '}') depth--;
	}
	return css.slice(open + 1, i - 1);
}

const rootBody = () => extractBlock(readLayoutCss(), ':root {');
const themeBody = () => extractBlock(readLayoutCss(), '@theme inline {');

describe('layout.css — landing visual system foundation (PR 1)', () => {
	// NOTE: The SDD spec called for `@fontsource-variable/poppins`, but
	// fontsource does not publish a variable build of Poppins. The next two
	// tests assert the real, attainable package name.
	describe('FR-VS-1 self-hosted font @import declarations', () => {
		it('imports @fontsource/poppins (display font, non-variable)', () => {
			const css = readLayoutCss();
			expect(css).toMatch(/@import\s+["']@fontsource\/poppins(?:\/[^"']+)?["']\s*;/);
		});

		it('imports @fontsource/jetbrains-mono (mono font)', () => {
			const css = readLayoutCss();
			expect(css).toMatch(
				/@import\s+["']@fontsource\/jetbrains-mono(?:\/[^"']+)?["']\s*;/
			);
		});

		it('keeps @fontsource-variable/inter for body text', () => {
			const css = readLayoutCss();
			expect(css).toMatch(/@import\s+["']@fontsource-variable\/inter["']\s*;/);
		});

		it('removes the old @fontsource-variable/space-grotesk import', () => {
			const css = readLayoutCss();
			expect(css).not.toMatch(/@import\s+["']@fontsource-variable\/space-grotesk["']\s*;/);
		});

		it('loads the exact weights the spec calls for (Poppins 600/700/800, JetBrains Mono 400/500)', () => {
			const css = readLayoutCss();
			for (const w of [600, 700, 800]) {
				expect(css).toContain(`@fontsource/poppins/${w}.css`);
			}
			for (const w of [400, 500]) {
				expect(css).toContain(`@fontsource/jetbrains-mono/${w}.css`);
			}
		});
	});

	// NOTE: Spec said `'Poppins Variable'`, but fontsource's non-variable build
	// registers the family as plain `'Poppins'`. Inter and JetBrains Mono keep
	// their original family names from the spec.
	describe('FR-VS-4 Tailwind @theme inline font mapping', () => {
		it('maps --font-display to Poppins', () => {
			expect(themeBody()).toMatch(/--font-display:\s*['"]Poppins['"]/);
		});

		it('maps --font-body to Inter Variable', () => {
			expect(themeBody()).toMatch(/--font-body:\s*['"]Inter Variable['"]/);
		});

		it('maps --font-mono to JetBrains Mono', () => {
			expect(themeBody()).toMatch(/--font-mono:\s*['"]JetBrains Mono['"]/);
		});

		// Strip comments first so a docstring explaining WHY Space Grotesk was
		// replaced doesn't trip the assertion.
		it('removes Space Grotesk from every font-family value in @theme inline', () => {
			const body = themeBody().replace(/\/\*[\s\S]*?\*\//g, '');
			expect(body).not.toMatch(/--font-(?:heading|sans|body|display|mono):[^;]*Space Grotesk/);
		});
	});

	describe('FR-VS-2 consensus- prefixed CSS custom properties under :root', () => {
		it('defines a consensus- color palette (red, black, white, gray-50..900)', () => {
			const body = rootBody();
			for (const name of [
				'--consensus-color-red',
				'--consensus-color-black',
				'--consensus-color-white',
				'--consensus-color-gray-50',
				'--consensus-color-gray-900'
			]) {
				expect(body).toContain(name);
			}
		});

		it('defines a consensus- spacing scale (1, 2, 4, 6, 8, 12, 16, 20, 24)', () => {
			const body = rootBody();
			for (const n of [1, 2, 4, 6, 8, 12, 16, 20, 24]) {
				expect(body).toContain(`--consensus-space-${n}:`);
			}
		});

		it('defines consensus- radius tokens (sm, md, lg, pill)', () => {
			const body = rootBody();
			for (const name of [
				'--consensus-radius-sm',
				'--consensus-radius-md',
				'--consensus-radius-lg',
				'--consensus-radius-pill'
			]) {
				expect(body).toContain(name);
			}
		});

		it('defines consensus- motion tokens (fast, base) and ease-standard', () => {
			const body = rootBody();
			expect(body).toMatch(/--consensus-motion-fast:\s*150ms/);
			expect(body).toMatch(/--consensus-motion-base:\s*240ms/);
			expect(body).toContain('--consensus-ease-standard:');
		});

		it('defines a consensus- container max-width (1280px / max-w-7xl)', () => {
			const body = rootBody();
			expect(body).toMatch(/--consensus-container-max:\s*1280px/);
		});
	});

	describe('shadcn + base layer wiring', () => {
		it('preserves shadcn --primary / --background / --foreground (no override)', () => {
			const css = readLayoutCss();
			expect(css).toMatch(/--primary:\s*oklch/);
			expect(css).toMatch(/--background:\s*oklch/);
			expect(css).toMatch(/--foreground:\s*oklch/);
		});

		it('applies the new body font to <html> via @apply font-body', () => {
			const css = readLayoutCss();
			expect(css).toMatch(/html\s*\{[^}]*@apply\s+font-body/);
		});

		it('every --font-* mapping in @theme inline has a system fallback', () => {
			const body = themeBody();
			for (const token of ['--font-display', '--font-body', '--font-mono']) {
				const line = new RegExp(`${token}:\\s*[^;]+;`);
				expect(body).toMatch(line);
				const value = body.match(line)![0];
				// Comma-separated fallback list, e.g. 'Poppins, system-ui, sans-serif'.
				expect(value.split(',').length).toBeGreaterThanOrEqual(2);
			}
		});
	});
});
