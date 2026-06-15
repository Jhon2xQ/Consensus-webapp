---
name: Decentralized Voting System
colors:
  primary: '#bb0012'
  primary-hover: '#a0000f'
  black: '#000000'
  white: '#ffffff'
  gray-50: '#fafafa'
  gray-100: '#f5f5f5'
  gray-200: '#e5e5e5'
  gray-300: '#d4d4d4'
  gray-400: '#a3a3a3'
  gray-500: '#737373'
  gray-600: '#525252'
  gray-700: '#404040'
  gray-800: '#262626'
  gray-900: '#171717'
  surface: '#f7f7f7'
  fg: '#111111'
  fg-2: '#3a3a3a'
  muted: '#707070'
  border: '#d9d9d9'
  border-soft: '#eeeeee'
typography:
  display-family: 'Poppins, system-ui, sans-serif'
  body-family: 'Inter Variable, system-ui, sans-serif'
  mono-family: 'JetBrains Mono, ui-monospace, monospace'
  h1:
    fontFamily: Poppins
    fontWeight: '800'
    lineHeight: '1.02'
    letterSpacing: -0.03em
    responsive: 'clamp(42px, 6vw, 74px)'
  h2:
    fontFamily: Poppins
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.025em
    responsive: 'clamp(30px, 4vw, 46px)'
  h3:
    fontFamily: Poppins
    fontSize: 20px
    fontWeight: '700'
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter Variable
    fontSize: 18px
    lineHeight: '1.55'
  body-md:
    fontFamily: Inter Variable
    fontSize: 14px
    lineHeight: '1.6'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.1em
    textTransform: uppercase
  mono-tag:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    letterSpacing: 0.05em
rounded:
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
    10: 40px
    12: 48px
    16: 64px
    20: 80px
    24: 96px
  container-max: 1280px
  container-gutter-phone: 16px
  container-gutter-tablet: 24px
  container-gutter-desktop: 36px
motion:
  fast: 150ms
  base: 240ms
  ease-standard: cubic-bezier(0.2, 0, 0, 1)
---

## Brand & Style

The design system is engineered to evoke absolute trust, cryptographic security, and democratic clarity. Targeting a sophisticated audience of institutional stakeholders and tech-savvy citizens, the aesthetic balances the sterile reliability of a financial institution with the progressive edge of Web3 technology.

The primary style is **Modern Corporate Glassmorphism**. It utilizes high-contrast transitions between deep black technical zones and expansive white airy surfaces. Modular "blocks" of information, inspired by blockchain structures, organize complex data into digestible units. Subtle red gradients act as the "energy" of the system, guiding the eye toward critical actions and verified states.

## Colors

The palette is strictly controlled. All colors are exposed as CSS custom properties under the `consensus-` namespace in `src/routes/layout.css` and mapped to Tailwind utilities via `@theme inline`.

| Token | Value | Tailwind class | Use |
|-------|-------|----------------|-----|
| `--consensus-color-red` | `#bb0012` | `bg-consensus-red`, `text-consensus-red` | Primary CTA, active states, accents |
| `--consensus-color-red-hover` | `#a0000f` | `hover:bg-consensus-red-hover` | Button hover |
| `--consensus-color-black` | `#000000` | `bg-consensus-black`, `text-consensus-black` | Dark sections, high-contrast text |
| `--consensus-color-white` | `#ffffff` | `bg-consensus-white`, `text-consensus-white` | Canvas, light sections |
| `--consensus-color-gray-100` | `#f5f5f5` | `bg-consensus-gray-100` | Card backgrounds, subtle fills |
| `--consensus-color-gray-300` | `#d4d4d4` | `text-consensus-gray-300` | Borders on hover |
| `--consensus-color-gray-400` | `#a3a3a3` | `text-consensus-gray-400` | Muted logos, inactive elements |
| `--consensus-color-gray-600` | `#525252` | `text-consensus-gray-600` | Logo hover |
| `--consensus-color-fg` | `#111111` | `text-consensus-fg` | Primary text |
| `--consensus-color-fg-2` | `#3a3a3a` | `text-consensus-fg-2` | Secondary text |
| `--consensus-color-muted` | `#707070` | `text-consensus-muted` | Labels, descriptions |
| `--consensus-color-border` | `#d9d9d9` | `border-consensus-border` | Card borders, dividers |
| `--consensus-color-border-soft` | `#eeeeee` | `border-consensus-border-soft` | Subtle dividers |

**Note**: shadcn-svelte primitives (`--background`, `--primary`, etc.) remain unchanged. The `consensus-` namespace coexists without collision.

## Typography

**All three families are self-hosted via `@fontsource`** (zero CDN requests).

- **Display & Headings**: **Poppins** (weights 600/700/800). Geometric, futuristic. Used for h1, h2, h3, step numbers, and card titles.
- **Body & Interface**: **Inter Variable** (weights 100–900). Maximum legibility. Applied to `<html>` via `@apply font-body`.
- **Labels & Data**: **JetBrains Mono** (weights 400/500). Used for eyebrows, mono tags, date labels, and technical data.

### Font token mapping (Tailwind v4 `@theme inline`)

| Token | Family | Tailwind class |
|-------|--------|----------------|
| `--font-display` | `'Poppins', system-ui, sans-serif` | `font-display` |
| `--font-body` | `'Inter Variable', system-ui, sans-serif` | `font-body` |
| `--font-mono` | `'JetBrains Mono', ui-monospace, monospace` | `font-mono` |

### Actual usage patterns (from index)

**Eyebrow / mono label** (section eyebrows, date labels):
```
font-mono text-[11px] font-medium tracking-[0.1em] uppercase text-consensus-muted
```

**h1** (Hero):
```
font-display font-extrabold leading-[1.02] tracking-[-0.03em] text-[clamp(42px,6vw,74px)]
```

**h2** (section titles):
```
font-display font-bold leading-[1.1] tracking-[-0.025em] text-[clamp(30px,4vw,46px)]
```

**h3** (card titles):
```
font-display text-xl font-bold tracking-[-0.015em]
```

**Lead paragraph** (Hero):
```
text-[clamp(16px,2vw,19px)] text-consensus-fg-2 leading-[1.6]
```

**Body text** (descriptions):
```
text-sm text-consensus-muted leading-[1.6]
```

**Mono tag** (ZK/BC pills):
```
font-mono text-[10px] font-medium px-[6px] py-[2px] rounded-[3px] bg-current
```

## Layout & Spacing

### Container

All sections use the same container pattern:
```
max-w-7xl mx-auto px-6 lg:px-8
```
- `max-w-7xl` = 1280px (product decision, NOT the HTML's 1180px)
- `px-6` = 24px on mobile
- `lg:px-8` = 32px on desktop (≥1024px)

### Spacing tokens

All spacing uses the `consensus-*` scale (4px baseline grid). Tailwind classes: `gap-consensus-*`, `p-consensus-*`, `mb-consensus-*`, `py-consensus-*`, etc.

| Token | Value | Tailwind |
|-------|-------|----------|
| `consensus-1` | 4px | `gap-consensus-1` |
| `consensus-2` | 8px | `gap-consensus-2` |
| `consensus-3` | 12px | `gap-consensus-3` |
| `consensus-4` | 16px | `gap-consensus-4` |
| `consensus-5` | 20px | `gap-consensus-5` |
| `consensus-6` | 24px | `gap-consensus-6` |
| `consensus-8` | 32px | `gap-consensus-8` |
| `consensus-10` | 40px | `gap-consensus-10` |
| `consensus-12` | 48px | `gap-consensus-12` |
| `consensus-16` | 64px | `gap-consensus-16` |
| `consensus-20` | 80px | `gap-consensus-20` |
| `consensus-24` | 96px | `py-consensus-24` |

### Section vertical rhythm

- Phone: 48px (`py-consensus-12`)
- Tablet: 68px
- Desktop: 96px (`py-consensus-24`)

### Grid patterns

- **Hero**: `grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-consensus-16 lg:gap-consensus-20`
- **HowItWorks cards**: `grid gap-consensus-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]`
- **Technology**: `grid grid-cols-1 md:grid-cols-2 gap-consensus-16 md:gap-consensus-20`

## Elevation & Depth

- **Surface 0 (Base)**: Pure white (`consensus-white`).
- **Surface 1 (Cards)**: White with 1px `consensus-border` border. On hover: border lightens + shadow `0 8px 32px rgba(0,0,0,0.06)`.
- **Dark sections**: `bg-consensus-black` with white text and subtle opacity variations for hierarchy.

## Shapes

Using `--consensus-radius-*` scale:

| Token | Value | Use |
|-------|-------|-----|
| `consensus-sm` | 4px | Mono tags, small chips |
| `consensus-md` | 8px | Buttons, icon containers, badges |
| `consensus-lg` | 12px | Cards, image containers |
| `consensus-pill` | 9999px | Fully rounded pills |

## Motion

| Token | Value | Tailwind | Use |
|-------|-------|----------|-----|
| `consensus-motion-fast` | 150ms | `duration-[150ms]` | Hover, focus, color change |
| `consensus-motion-base` | 240ms | `duration-[240ms]` | Border, shadow, transform |
| `consensus-ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | `ease-[cubic-bezier(0.2,0,0,1)]` | All transitions |

All transitions use: `transition-colors duration-[150ms]` (fast) or `transition-[border-color,box-shadow] duration-[240ms] ease-[cubic-bezier(0.2,0,0,1)]` (base).

## Components (actual patterns from index)

### Buttons

**Primary** (Hero "Iniciar Propuesta"):
```
inline-flex items-center justify-center gap-consensus-2
px-[18px] py-[10px] rounded-consensus-md
font-body text-sm font-semibold tracking-[-0.01em]
bg-consensus-red text-consensus-white
hover:bg-consensus-red-hover
transition-colors duration-[150ms]
```

**Secondary** (Hero "Leer Docs"):
```
inline-flex items-center justify-center gap-consensus-2
px-[18px] py-[10px] rounded-consensus-md
font-body text-sm font-semibold tracking-[-0.01em]
bg-transparent text-consensus-fg border border-consensus-border
hover:bg-consensus-gray-100 hover:border-consensus-gray-400
transition-all duration-[150ms]
```

### Cards (HowItWorks)

```
p-consensus-8 border border-consensus-border rounded-consensus-lg bg-consensus-white
transition-[border-color,box-shadow] duration-[240ms] ease-[cubic-bezier(0.2,0,0,1)]
hover:border-consensus-gray-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)]
```

### Mono tag pills (Technology ZK/BC badges)

Outer: `inline-flex items-center gap-consensus-3 px-consensus-5 py-consensus-4 border rounded-consensus-md font-display text-sm font-bold tracking-[0.02em]`

Inner tag: `font-mono text-[10px] font-medium px-[6px] py-[2px] rounded-[3px] bg-current text-consensus-black tracking-[0.05em]`

### Eyebrow labels (section eyebrows)

```
block font-mono text-[11px] font-medium tracking-[0.1em] uppercase text-consensus-muted
```

Often preceded by a decorative line:
```
<span aria-hidden="true" class="block w-6 h-px bg-consensus-red"></span>
```

## Landing sections (reference implementation)

The landing page (Hero → HowItWorks → Technology → TrustedBy) is the **source of truth** for all design patterns.

- **Hero**: 2-column grid at `lg+`, 1-column below. Inline SVG wireframe. Eyebrow with red line prefix.
- **HowItWorks**: 4-card auto-fit grid. Step numbers in `font-display text-[11px] font-bold text-consensus-red`. 44×44 icon containers with `bg-consensus-red/[0.06]`.
- **Technology**: Dark section. Two badge pills (ZK red-tinted, BC neutral). Inline SVG circuit wireframe.
- **TrustedBy**: Gray background with subtle border. Mono label. Logo spans with `text-consensus-gray-400 → hover:text-consensus-gray-600` transition (240ms).
