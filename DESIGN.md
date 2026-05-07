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
  h1:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h2:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
  mono-data:
    fontFamily: monospace
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2.5rem
  container-max: 1536px (Tailwind 2xl default)
  gutter: 1.5rem
---

## Brand & Style

The design system is engineered to evoke absolute trust, cryptographic security, and democratic clarity. Targeting a sophisticated audience of institutional stakeholders and tech-savvy citizens, the aesthetic balances the sterile reliability of a financial institution with the progressive edge of Web3 technology.

The primary style is **Modern Corporate Glassmorphism**. It utilizes high-contrast transitions between deep black technical zones and expansive white airy surfaces. Modular "blocks" of information, inspired by blockchain structures, organize complex data into digestible units. Glassmorphism is applied to interactive layers to signify transparency—a literal visual metaphor for the "open ledger" nature of the voting process. Subtle red gradients act as the "energy" of the system, guiding the eye toward critical actions and verified states.

## Colors

The palette is strictly controlled to maintain a high-tech, authoritative atmosphere. 

- **White (50%)**: Used for the primary "Canvas." It represents the neutrality and transparency of the voting platform.
- **Black (25%)**: Used for "Deep Space" sections (navigation bars, footers, or technical data overlays) and high-contrast headlines. It provides the grounding force of security.
- **Red (25%)**: The "Pulse" of the system. This is a vibrant, high-energy red used for primary CTA buttons, active voting states, and critical security alerts. 
- **Subtle Depth**: Soft grays (#E2E8F0) and extremely faint blue-tints (#F8FAFC) are utilized for borders, disabled states, and background layering to prevent visual fatigue on pure white surfaces.

## Typography

Typography is a mix of technical precision and human-centric readability. 

- **Headlines**: **Space Grotesk** provides a geometric, futuristic feel that mirrors engineering excellence. It should be used for large titles and key metrics.
- **Body & Interface**: **Inter** is used for all functional text to ensure maximum legibility across different screen sizes and languages. 
- **Data & Hashes**: Where wallet addresses or transaction hashes are displayed, a clean Monospace font is preferred to emphasize the blockchain context. 

Strict vertical rhythm is maintained by adhering to a 4px baseline grid.

## Layout & Spacing

The layout follows a **Fluid Modular Grid** system. Inspired by the reference image, content is organized into logical "Dashboard Cards" that can stack or expand based on screen real estate.

- **Grid**: A 12-column grid with Tailwind `container` as the max-width wrapper (responsive: 640px → 768px → 1024px → 1280px → 1536px).
- **Modules**: Information is grouped into cards with generous internal padding (24px to 32px) to allow the content to breathe.
- **Visual Rhythm**: High-level summaries (Total Votes, Time Remaining) occupy full-width hero sections, while granular details (Voter lists, Protocol specs) utilize 4-column or 6-column modules.

## Elevation & Depth

Depth is achieved through **Layered Transparency** rather than traditional heavy shadows.

- **Surface 0 (Base)**: Pure white or very light gray.
- **Surface 1 (Cards)**: White with a subtle 1px border (#E2E8F0) and a soft, expansive neutral shadow.
- **Surface 2 (Glass Overlays)**: Background-blur (12px to 20px) applied to semi-transparent white (rgba 255, 255, 255, 0.7) or black (rgba 0, 0, 0, 0.8) panels. 
- **Floating Actions**: High-contrast red elements use a soft red-tinted glow (drop-shadow) to appear as if they are emitting light, signifying their interactive importance.

## Shapes

The shape language is **Soft-Tech**. 

By using a `0.25rem` (4px) to `0.5rem` (8px) corner radius, the design system avoids the "childish" look of fully rounded pills while remaining more approachable than sharp, brutalist 90-degree angles. 

- **Primary Buttons**: Feature a slightly higher roundedness (8px) to distinguish them from structural layout containers.
- **Data Chips**: Use a "Squircle" or standard 4px radius.
- **Icons**: Linear, 2px stroke width, with slightly rounded terminals to match the font geometry of Space Grotesk.

## Components

- **Buttons**:
  - *Primary*: Solid Red to Dark-Red gradient. White text. Subtle outer glow on hover.
  - *Secondary*: White background, 1px Black border, Black text.
  - *Ghost*: Transparent background, Red text, for low-priority actions.
- **Cards**: Minimalist containers with a subtle 1px border. Header areas of cards may use a faint gray background to separate title from content.
- **Input Fields**: Large, clean fields with 1px gray borders that transition to 2px Red on focus. Labels are always "Label-Caps" style sitting above the field.
- **Progress Indicators**: Linear bars using a red-to-white gradient to show voting progress or blockchain confirmation status.
- **Voting Chips**: Small status indicators (e.g., "Verified," "On-Chain," "Pending") using a light-red background with dark red text for high legibility.
- **Modals**: Utilize the "Glassmorphism" effect with a heavy backdrop blur to keep the user focused on the secure action at hand.