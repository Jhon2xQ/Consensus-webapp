# Consensus Webapp — AI Agent Guide

## Project

Decentralized voting platform built on blockchain and zero-knowledge proofs.

## Tech Stack

| Layer           | Tool                                                  |
| --------------- | ----------------------------------------------------- |
| Framework       | SvelteKit 2.x + Svelte 5 (runes enforced)             |
| Language        | TypeScript 6.0 (strict)                               |
| CSS             | Tailwind CSS v4 (`@tailwindcss/vite`)                 |
| UI Library      | shadcn-svelte (Vega style, neutral base)              |
| Icons           | lucide-svelte                                         |
| Fonts           | Space Grotesk (headings), Inter (body)                |
| Tests           | Vitest 4.x + vitest-browser-svelte + Playwright       |
| Build           | Vite 8                                                |
| Adapter         | @sveltejs/adapter-node (deploy behind Cloudflare CDN) |
| Package Manager | pnpm (engine-strict: true)                            |

## Commands

```bash
pnpm dev            # dev server
pnpm build          # production build
pnpm check          # svelte-check (type + lint)
pnpm test           # run all tests (unit + browser)
pnpm vitest run src/lib/components/sections/Hero.svelte.spec.ts  # run single test file
```

## Project Structure

```
src/
├── routes/
│   ├── +layout.svelte      # global layout (Header + Footer)
│   ├── +page.svelte         # landing page (Hero → HowItWorks → Technology → TrustedBy)
│   └── layout.css           # Tailwind config, CSS variables, brand tokens
├── lib/
│   ├── components/
│   │   ├── sections/        # page sections (Hero, HowItWorks, Technology, TrustedBy, Footer)
│   │   ├── layout/          # layout components (Header)
│   │   └── ui/              # shadcn-svelte primitives (button, card, badge)
│   └── utils/               # shared utilities
│   ├── assets/
│   ├── hooks/
│   └── server/
└── lib/vitest-examples/     # test examples for reference
```

## Svelte 5 Conventions (MANDATORY)

- **Runes only**: `$state`, `$derived`, `$effect`, `$props` — NO stores, NO reactive declarations (`$:`)
- **Snippets over slots**: `{#snippet}` + `{@render}` — NOT `<slot>`
- **Events**: `onclick` — NOT `on:click`
- **Each with key**: `{#each items as item (item.id)}` — ALWAYS key
- **Types over interfaces**: `type` — NOT `interface`
- **Nullish coalescing**: `??` — NOT `||` for null/undefined checks

## Component Patterns

- **Presentational sections**: Pure markup + Tailwind, minimal logic
- **shadcn components**: Import from `$lib/components/ui/{name}/index.js`
- **Brand colors**: `text-brand-red`, `bg-brand-black`, `text-brand-gray-800`, etc. (defined in `layout.css`)
- **Container**: Use `max-w-7xl mx-auto px-6 lg:px-8` for section content (consistent across all sections)
- **Responsive**: Mobile-first. Use `md:`, `lg:` breakpoints

## Testing Conventions

Two test modes configured in `vite.config.ts`:

### Pure logic (.ts files) — Node environment

```ts
import { describe, it, expect } from "vitest";
import { greet } from "./greet";

describe("greet", () => {
  it("returns a greeting", () => {
    expect(greet("Svelte")).toBe("Hello, Svelte!");
  });
});
```

### Components (.svelte files) — Browser environment

```ts
import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import Welcome from "./Welcome.svelte";

describe("Welcome.svelte", () => {
  it("renders content", async () => {
    render(Welcome, { host: "SvelteKit" });

    await expect.element(page.getByRole("heading", { level: 1 })).toHaveTextContent("Hello, SvelteKit!");
    await expect.element(page.getByText("Hello, Vitest!")).toBeInTheDocument();
  });
});
```

### Rules

- **Colocate**: Test file lives next to the file it tests (e.g. `Hero.svelte.spec.ts` next to `Hero.svelte`)
- **Locator API**: `page.getByText()`, `page.getByRole()`, `page.getByLabelText()` — NO `page.locator()`
- **Run single file**: `pnpm vitest run path/to/file.spec.ts`
- **Run all tests**: `pnpm test`
- See examples in `src/lib/vitest-examples/`

## What NOT to Do

- Don't use Svelte 4 patterns (`$:`, `on:click`, `<slot>`, stores)
- Don't add dependencies without checking if the functionality already exists
- Don't use `page.locator()` in vitest-browser tests — use `getByText`, `getByRole`, etc.
- Don't modify shadcn-svelte primitives in `ui/` unless absolutely necessary
- Don't add horizontal padding to sections that should be edge-to-edge
- Don't use `interface` — use `type`
- Don't skip tests — run them before committing changes

## Svelte MCP Tools

When writing Svelte code, use these MCP tools:

1. `list-sections` — discover available documentation
2. `get-documentation` — fetch relevant docs
3. `svelte-autofixer` — analyze code for issues before returning to user
4. `playground-link` — generate playground link (only after user confirmation)
