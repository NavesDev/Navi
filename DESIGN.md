---
name: Quiet Luxury Financial AI
colors:
  surface: "#131313"
  surface-dim: "#131313"
  surface-bright: "#3a3939"
  surface-container-lowest: "#0e0e0e"
  surface-container-low: "#1c1b1b"
  surface-container: "#201f1f"
  surface-container-high: "#2a2a2a"
  surface-container-highest: "#353534"
  on-surface: "#e5e2e1"
  on-surface-variant: "#d0c4bc"
  inverse-surface: "#e5e2e1"
  inverse-on-surface: "#313030"
  outline: "#998f87"
  outline-variant: "#4d453f"
  surface-tint: "#d3c4b8"
  primary: "#f1e1d4"
  on-primary: "#382f26"
  primary-container: "#d4c5b9"
  on-primary-container: "#5c5148"
  inverse-primary: "#685c53"
  secondary: "#c6c6c6"
  on-secondary: "#2f3131"
  secondary-container: "#454747"
  on-secondary-container: "#b5b5b5"
  tertiary: "#dfe4e8"
  on-tertiary: "#2c3134"
  tertiary-container: "#c3c8cc"
  on-tertiary-container: "#4e5457"
  error: "#ffb4ab"
  on-error: "#690005"
  error-container: "#93000a"
  on-error-container: "#ffdad6"
  primary-fixed: "#f0e0d3"
  primary-fixed-dim: "#d3c4b8"
  on-primary-fixed: "#221a13"
  on-primary-fixed-variant: "#4f453c"
  secondary-fixed: "#e2e2e2"
  secondary-fixed-dim: "#c6c6c6"
  on-secondary-fixed: "#1a1c1c"
  on-secondary-fixed-variant: "#454747"
  tertiary-fixed: "#dee3e7"
  tertiary-fixed-dim: "#c2c7cb"
  on-tertiary-fixed: "#171c1f"
  on-tertiary-fixed-variant: "#42474b"
  background: "#131313"
  on-background: "#e5e2e1"
  surface-variant: "#353534"
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: "400"
    lineHeight: "1.1"
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: "400"
    lineHeight: "1.2"
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: "400"
    lineHeight: "1.2"
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: "400"
    lineHeight: "1.3"
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "400"
    lineHeight: "1.6"
    letterSpacing: 0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: "1.6"
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "500"
    lineHeight: "1.4"
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "500"
    lineHeight: "1.4"
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-max-width: 1200px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
---

## Brand & Style

The design system is rooted in the "Quiet Luxury" movement, prioritizing restraint, material quality, and architectural precision over digital artifice. The target audience consists of high-net-worth individuals and sophisticated investors who value discretion and clarity over traditional "fintech" stimulation.

The aesthetic is **Modern Minimalist with a focus on High-Contrast Hairlines**. It avoids common tech tropes like vibrant neons, heavy shadows, and rounded "bubbly" interfaces. Instead, it leverages expansive whitespace (or "dark space"), meticulous typographic scales, and subtle tonal shifts to create a sense of calm authority. The interface should feel like a bespoke physical ledger or a premium concierge service—efficient, silent, and impeccably organized.

## Colors

The palette is monochromatic and warm-leaning, designed to reduce eye strain and project exclusivity.

- **Primary (Champagne):** Used sparingly for high-priority calls to action and active states. It is a muted, non-metallic gold.
- **Secondary (Silver):** Reserved for interactive utility icons and secondary text highlights.
- **Background (#0A0A0A):** A deep, near-black charcoal that serves as the canvas.
- **Surface (#1A1A1A):** A soft, warm grey used to define containers and interactive regions.
- **Borders (#2A2A2A):** Critical for the "Quiet Luxury" look; these hairlines replace shadows to provide structure.

## Typography

This design system employs a high-contrast typographic pairing to balance heritage with technology.

- **Headlines:** Use _Playfair Display_. It should always be set with slightly tighter letter-spacing in larger sizes to maintain a "printed" editorial feel. Headers should rarely be bold; the weight of the serif itself provides sufficient hierarchy.
- **Body & UI:** Use _Inter_. Chosen for its exceptional legibility in financial data contexts.
- **Labels:** Small labels and captions should use _Inter_ with a medium weight and increased letter-spacing, often in uppercase, to create a sense of structured data without visual noise.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop and a fluid model on mobile, emphasizing "Empty Space" as a luxury.

- **Rhythm:** All spacing is based on a 4px baseline.
- **Margins:** Generous outer margins (64px+) on desktop ensure the content feels centered and important.
- **Grid:** A 12-column system is used, but content typically occupies the central 8 columns for readability.
- **Hairlines:** Instead of large gaps, use 1px hairlines (`#2A2A2A`) to separate distinct sections of financial data.

## Elevation & Depth

In this design system, depth is achieved through **Tonal Layering** rather than shadows.

- **Flat Hierarchy:** There are no drop shadows. Objects do not "float" above the surface; they are "inlaid" or "stacked."
- **Layering:** The base layer is `#0A0A0A`. Interactive cards or secondary regions use `#1A1A1A`.
- **Hairline Borders:** A 1px solid border using `#2A2A2A` is the primary method for defining element boundaries.
- **State Changes:** Hover states are indicated by a subtle shift in background color (e.g., from `#1A1A1A` to `#222222`) or by changing the border color to the Primary Champagne.

## Shapes

The shape language is architectural and precise.

- **Corner Radius:** A universal 4px (`soft`) radius is applied to buttons and cards. This is just enough to remove the harshness of a true 90-degree angle while maintaining a crisp, professional silhouette.
- **Icons:** Use thin-stroke (1px or 1.5px) linear icons. Avoid filled or rounded icon sets. Icons should be the same color as the adjacent text.

## Components

- **Buttons:**
  - _Primary:_ Champagne background (`#D4C5B9`) with black text. Sharp 4px corners.
  - _Secondary:_ Ghost style—1px border (`#2A2A2A`) with silver text.
- **Input Fields:** Bottom-border only or a very subtle full outline (`#2A2A2A`). No background fill unless focused. The focus state changes the border to Primary Champagne.
- **Cards:** No shadow. 1px border. Use `#1A1A1A` background for contrast against the page.
- **Lists:** Rows separated by 1px hairlines. High vertical padding (16px-24px) to ensure financial figures have room to breathe.
- **Data Visualizations:** Charts should use thin lines (1pt). Use a single color (Primary Champagne) for data lines, with a very faint `#1A1A1A` fill below the line if necessary for area charts. No grid lines unless absolutely essential; if used, they must be `#1A1A1A`.
- **Chips/Badges:** Small, uppercase text with a 1px border. No background fill.
