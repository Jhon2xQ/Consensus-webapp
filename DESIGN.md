---
name: Decentralized Voting System
colors:
  surface: '#f7fafc'
  surface-dim: '#d7dadc'
  surface-bright: '#f7fafc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f6'
  surface-container: '#ebeef0'
  surface-container-high: '#e5e9eb'
  surface-container-highest: '#e0e3e5'
  on-surface: '#181c1e'
  on-surface-variant: '#5d3f3c'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eef1f3'
  outline: '#926f6b'
  outline-variant: '#e7bdb8'
  surface-tint: '#c00013'
  primary: '#bb0012'
  on-primary: '#ffffff'
  primary-container: '#e32225'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb4ab'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2e2e2'
  on-secondary-container: '#646464'
  tertiary: '#5a5c5c'
  on-tertiary: '#ffffff'
  tertiary-container: '#737575'
  on-tertiary-container: '#fcfcfc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000c'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c6'
  on-secondary-fixed: '#1b1b1b'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#f7fafc'
  on-background: '#181c1e'
  surface-variant: '#e0e3e5'
typography:
  display-family: 'Poppins, system-ui, sans-serif'
  body-family: 'Inter Variable, system-ui, sans-serif'
  mono-family: 'JetBrains Mono, ui-monospace, monospace'
  h1:
    fontFamily: Poppins
    fontSize: 76px
    fontWeight: '800'
    lineHeight: '1.02'
    letterSpacing: -0.03em
  h2:
    fontFamily: Poppins
    fontSize: 54px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.025em
  h3:
    fontFamily: Poppins
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter Variable
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter Variable
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.1em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
  hero-clamp:
    h1: 'clamp(42px, 6vw, 74px)'
    lead: 'clamp(16px, 2vw, 19px)'
  section-title-clamp: 'clamp(30px, 4vw, 46px)'
rounded:
  sm: 0.25rem
  md: 0.5rem
  lg: 0.75rem
  pill: 9999px
  consensus-sm: 4px
  consensus-md: 8px
  consensus-lg: 12px
  consensus-pill: 9999px
spacing:
  consensus:
    1: 4px
    2: 8px
    3: 12px
    4: 16px
    5: 20px
    6: 24px
    8: 32px
    12: 48px
    16: 64px
    20: 80px
    24: 96px
  section-y-phone: 48px
  section-y-tablet: 68px
  section-y-desktop: 96px
  container-max: 1280px
  container-gutter-phone: 16px
  container-gutter-tablet: 24px
  container-gutter-desktop: 36px
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2.5rem
  gutter: 1.5rem
motion:
  fast: 150ms
  base: 240ms
  ease-standard: cubic-bezier(0.2, 0, 0, 1)
---

## Brand & Style

The design system is engineered to evoke absolute trust, cryptographic security, and democratic clarity. Targeting a sophisticated audience of institutional stakeholders and tech-savvy citizens, the aesthetic balances the sterile reliability of a financial institution with the progressive edge of Web3 technology.

The primary style is **Modern Corporate Glassmorphism**. It utilizes high-contrast transitions between deep black technical zones and expansive white airy surfaces. Modular "blocks" of information, inspired by blockchain structures, organize complex data into digestible units. Glassmorphism is applied to interactive layers to signify transparency—a literal visual metaphor for the "open ledger" nature of the voting process. Subtle red gradients act as the "energy" of the system, guiding the eye toward critical actions and verified states.

## Colors

The palette is strictly controlled to maintain a high-tech, authoritative atmosphere.

- **White (~50%)**: Used for the primary "Canvas." It represents the neutrality and transparency of the voting platform.
- **Black (~25%)**: Used for "Deep Space" sections (navigation bars, footers, or technical data overlays) and high-contrast headlines. It provides the grounding force of security.
- **Red (~25%)**: The "Pulse" of the system. This is a vibrant, high-energy red (`#bb0012`) used for primary CTA buttons, active voting states, and critical security alerts. Hover state deepens to `#a0000f`.
- **Subtle Depth**: Soft grays (`#F5F5F5` → `#171717`) and extremely faint blue-tints (`#F7FAFC`) are utilized for borders, disabled states, and background layering to prevent visual fatigue on pure white surfaces.

All landing colors are also exposed as CSS custom properties under the `consensus-` namespace in `src/routes/layout.css` (e.g. `--consensus-color-red`, `--consensus-color-gray-100`, `--consensus-color-border-soft`). shadcn-svelte primitives keep their original `--background`, `--primary`, etc. so the design system and the component library coexist without collision.

## Typography

Typography is a mix of technical precision and human-centric readability. **All three families are self-hosted via `@fontsource`** (zero CDN requests).

- **Display & Headings**: **Poppins** (weights 600/700/800). Geometric, futuristic, mirrors engineering excellence. Used for h1, h2, h3 and key metrics. Loaded as per-weight static files from `@fontsource/poppins/600.css`, `700.css`, `800.css` because fontsource does not publish a variable build of Poppins.
- **Body & Interface**: **Inter Variable** (weights 100–900 via variable axis). Maximum legibility across screen sizes and languages. Loaded as `@fontsource-variable/inter`.
- **Data, Equations & Labels**: **JetBrains Mono** (weights 400/500). Communicates the blockchain context, used for ZK/BC tag pills, section eyebrows, the equation text `H(identity) ∈ merkle_tree(group_root)`, and any mono data. Loaded as `@fontsource/jetbrains-mono/400.css`, `500.css`.

### Font token mapping (Tailwind v4 `@theme inline`)

| Token | Family | Tailwind class |
|-------|--------|----------------|
| `--font-display` | `'Poppins', system-ui, sans-serif` | `font-display` |
| `--font-body` | `'Inter Variable', system-ui, sans-serif` | `font-body` |
| `--font-mono` | `'JetBrains Mono', ui-monospace, monospace` | `font-mono` |

`<html>` applies `@apply font-body` (replaces the old `font-sans` Space Grotesk alias). Component overrides use `font-display` for headings and `font-mono` for technical labels.

### Hero responsive scale

The Hero `h1` uses `clamp(42px, 6vw, 74px)` so it stays legible at 1024–1920px without breaking layouts. The lead paragraph uses `clamp(16px, 2vw, 19px)`. Section titles (h2) use `clamp(30px, 4vw, 46px)`.

### Strict vertical rhythm

4px baseline grid is maintained by aligning every block to the `--consensus-space-*` scale (1 = 4px, 2 = 8px, 3 = 12px, …, 24 = 96px).

## Layout & Spacing

The layout follows a **Fluid Modular Grid** system. Inspired by the reference HTML, content is organized into logical "Dashboard Cards" that can stack or expand based on screen real estate.

- **Grid**: A 12-column grid. The landing container is `max-w-7xl` (**1280px**, NOT the HTML's 1180px — see product decision) with responsive gutters: 16px (phone) → 24px (tablet ≥ 768px) → 36px (desktop ≥ 1024px). Tailwind: `max-w-7xl mx-auto px-6 lg:px-8`.
- **Section vertical rhythm**: `--consensus-section-y-phone: 48px` / `--consensus-section-y-tablet: 68px` / `--consensus-section-y-desktop: 96px`.
- **Modules**: Information is grouped into cards with generous internal padding (`--consensus-space-8` = 32px) to allow the content to breathe.
- **Visual Rhythm**: High-level summaries (Total Votes, Time Remaining) occupy full-width hero sections, while granular details (Voter lists, Protocol specs) utilize 4-column or 6-column modules.

## Elevation & Depth

Depth is achieved through **Layered Transparency** rather than traditional heavy shadows.

- **Surface 0 (Base)**: Pure white or very light gray.
- **Surface 1 (Cards)**: White with a subtle 1px border (`--consensus-color-border` = `#d9d9d9`) and a soft, expansive neutral shadow on hover (`0 8px 32px rgba(0,0,0,0.06)`).
- **Surface 2 (Glass Overlays)**: `backdrop-blur` 12–20px applied to semi-transparent white (rgba 255,255,255,0.7) or black (rgba 0,0,0,0.8) panels. Wrapped in `@supports (backdrop-filter)` with a solid `bg-white/90` fallback for `prefers-reduced-transparency`.
- **Floating Actions**: High-contrast red elements use a soft red-tinted glow (drop-shadow) to appear as if they are emitting light, signifying their interactive importance.

## Shapes

The shape language is **Soft-Tech**.

Using `--consensus-radius-sm` (4px) through `--consensus-radius-lg` (12px) — or `--consensus-radius-pill` (9999px) for fully rounded pills — the design system avoids the "childish" look of fully rounded pills while remaining more approachable than sharp, brutalist 90-degree angles.

- **Primary Buttons**: Slightly higher roundedness (`--consensus-radius-md` = 8px) to distinguish them from structural layout containers.
- **Data Chips & Tags**: Squircle / standard 4px radius.
- **Icons**: Linear, 2px stroke width, with slightly rounded terminals to match the font geometry of Poppins.

## Motion

Two canonical durations drive every transition in the landing:

| Token | Value | Use |
|-------|-------|-----|
| `--consensus-motion-fast` | `150ms` | Hover, focus, color change |
| `--consensus-motion-base` | `240ms` | Border, shadow, transform |

Both run on `--consensus-ease-standard: cubic-bezier(0.2, 0, 0, 1)`. Wrapped in `@media (prefers-reduced-motion: no-preference)` so users with reduced-motion preferences get instant transitions.

## Components

- **Buttons**:
  - *Primary*: Solid Red (`--consensus-color-red`) with white text. Hover deepens to `--consensus-color-red-hover` (`#a0000f`).
  - *Secondary*: White background, 1px `--consensus-color-border` border, black text.
  - *Dashboard pill*: `--consensus-color-red` text on white background with `rgba(187,0,18,0.35)` border; fills red on hover.
  - *Ghost*: Transparent background, red text, for low-priority actions.
- **Cards**: Minimalist containers with a subtle 1px border. Header areas of cards may use a faint gray background to separate title from content.
- **Input Fields**: Large, clean fields with 1px gray borders that transition to 2px Red on focus. Labels are always "Label-Caps" style (JetBrains Mono, 12px, 0.1em tracking) sitting above the field.
- **Progress Indicators**: Linear bars using a red-to-white gradient to show voting progress or blockchain confirmation status.
- **Voting Chips**: Small status indicators (e.g., "Verified," "On-Chain," "Pending") using a light-red background with dark red text for high legibility.
- **Modals**: Utilize the "Glassmorphism" effect with a heavy backdrop blur to keep the user focused on the secure action at hand.

## Landing-only sections

The landing page composition (Hero → HowItWorks → Technology → TrustedBy → Footer) reuses the brand palette, typography, and radius scale defined above. Section-level overrides:

- **Hero**: 2-column grid (1.15fr 1fr) at `lg+`, 1-column below. 64px gap (mobile) → 80px (desktop). Inline SVG wireframe replaces any external image.
- **HowItWorks**: 4-card grid `repeat(auto-fit, minmax(240px, 1fr))`. Each card: number badge (01–04) in `text-brand-red`, 44×44 icon container with `bg-brand-red/6`, h3 title, description.
- **Technology**: Dark section (`bg-brand-black text-white`). Two badges (ZK red-tinted, BC neutral) with JetBrains Mono tags. Inline SVG wireframe with the equation `H(identity) ∈ merkle_tree(group_root)`.
- **TrustedBy**: Mono label "Respaldado por Líderes de la Industria", 4 logo spans, `text-gray-400 → text-gray-600` hover transition (240ms).
