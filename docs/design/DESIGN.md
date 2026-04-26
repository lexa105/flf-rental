---
name: Cinema Core
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c9ac'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9379'
  outline-variant: '#444933'
  surface-tint: '#abd600'
  primary: '#ffffff'
  on-primary: '#283500'
  primary-container: '#c3f400'
  on-primary-container: '#556d00'
  inverse-primary: '#506600'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#ffffff'
  on-tertiary: '#003912'
  tertiary-container: '#6bff87'
  on-tertiary-container: '#00752c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c3f400'
  primary-fixed-dim: '#abd600'
  on-primary-fixed: '#161e00'
  on-primary-fixed-variant: '#3c4d00'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#6bff87'
  tertiary-fixed-dim: '#4ae16d'
  on-tertiary-fixed: '#002107'
  on-tertiary-fixed-variant: '#00531d'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
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
  h3:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
  mono-data:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0em
spacing:
  base: 4px
  unit-1: 4px
  unit-2: 8px
  unit-4: 16px
  unit-6: 24px
  unit-8: 32px
  unit-12: 48px
  gutter: 16px
  margin: 24px
---

## Brand & Style

The brand identity is rooted in the precision of high-end cinematography and industrial production tools. It targets professionals who require immediate clarity and mission-critical reliability from their software. The aesthetic is "Technical Minimalism"—an evolution of professional camera OS interfaces (like RED or ARRI) that prioritizes data density without sacrificing elegance.

The UI evokes a sense of "The Dark Room," where the interface recedes to allow the vibrant lime green accents to signal action and status. It uses a high-contrast, dark-mode-only approach to reduce eye strain in studio environments while maintaining a "pro" feel through disciplined spacing and technical details.

## Colors

The palette is optimized for low-light production environments. The primary color, a vibrant lime green (#CCFF00), is used exclusively for primary actions, active status indicators, and critical data points. 

The background hierarchy uses a "Pure Black" foundation (#000000) for the deepest level, with layered surfaces utilizing #0F0F0F and #1A1A1A. A tertiary "Signal Green" (#18c051) is utilized for secondary status metrics or data visualization to provide a sophisticated technical contrast to the primary lime green. Grays are neutral-cool to avoid a "muddy" appearance.

## Typography

This design system employs a dual-font strategy. **Space Grotesk** serves as the technical backbone, used for headlines, labels, and numeric data to provide a futuristic, geometric "HUD" (Heads-Up Display) feel. **Inter** is used for all body copy and descriptions to ensure maximum legibility and a neutral, professional tone.

Numerical data should always utilize the "tabular num" OpenType feature to ensure columns of figures align perfectly in inventory lists and timecode displays.

## Layout & Spacing

The layout follows a strict 4px grid system, ensuring mathematical precision typical of engineering software. A 12-column fluid grid is used for the main dashboard, but components themselves rely on fixed internal padding to maintain a "compact" density.

Margins and gutters are kept tight (16px/24px) to maximize screen real estate for asset management. Content should be grouped into logical "modules" with clear separation provided by structural borders rather than expansive whitespace.

## Elevation & Depth

In this design system, depth is communicated through **Tonal Layering** and **Low-Contrast Outlines**. Shadows are avoided to keep the interface feeling flat and "on the glass," similar to a hardware monitor.

- **Level 0 (Canvas):** Pure Black (#000000).
- **Level 1 (Panels):** Deep Gray (#0F0F0F) with a 1px solid border of #222222.
- **Level 2 (Popovers/Modals):** Dark Gray (#1A1A1A) with a subtle 1px border of #333333.
- **Interactive States:** Hovering over a card or list item increases its border brightness or adds a subtle lime green glow (2px blur) to the border itself, rather than casting a shadow.

## Shapes

The shape language is strictly **Sharp (0px)**. To align with the precision-tooled aesthetic of cameras and lenses, all buttons, cards, and input fields utilize 90-degree corners. This evokes an industrial, hardware-inspired feel.

The only exception is for circular status pips or specific specialized icons where a round shape conveys a specific meaning (e.g., "Recording" or "Battery"). Structural UI elements must remain rectangular and hard-edged.

## Components

### Buttons
- **Primary:** Solid #CCFF00 background with black text. Sharp corners.
- **Secondary:** Transparent background with a 1px #CCFF00 border.
- **Ghost:** Transparent background with lime text. No border until hover.

### Inputs & Fields
- Backgrounds should be #0F0F0F with a bottom-only 2px border in #333333. When focused, the border becomes #CCFF00. Labels use the "label-caps" typography style positioned above the field.

### Status Chips
- High-contrast indicators. Use a "hollow" style (1px border) for inactive states and a "solid" style for active states. Example: A "RENTED" chip is solid #CCFF00 with black text. Secondary states may utilize the tertiary #18c051 for balanced feedback.

### Data Tables / Lists
- Use a 1px #222222 divider between rows. Backgrounds alternate between #000000 and #0F0F0F for high-density readability.

### Cards
- Zero-radius containers with a #1A1A1A header bar. The body of the card is #0F0F0F.

### Specialized Components
- **Asset Status Bar:** A thin, horizontal progress bar using the primary lime green to show battery levels or storage capacity.
- **Timecode Display:** Large, tabular Space Grotesk numerals with high tracking, mimicking a camera's VTR display.