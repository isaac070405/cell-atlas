---
name: Cell Atlas
description: A sourced scale chain from body to atom, set like a lab notebook.
colors:
  paper: "#ECE9DF"
  paper-raised: "#F5F3EC"
  ink: "#1D232B"
  ink-soft: "#5A6270"
  rule: "#C9C4B6"
  control-edge: "#7F848C"
  control-edge-dark: "#777F89"
  stain: "#24489A"
  select: "#B8336A"
  ok: "#2F6B4F"
  warn: "#8A5A12"
  paper-dark: "#141A21"
  paper-raised-dark: "#1B232C"
  ink-dark: "#E3E1D9"
  ink-soft-dark: "#98A0AC"
  rule-dark: "#2E3946"
  stain-dark: "#7F9FE6"
  select-dark: "#E77AA4"
  kind-animal: "#C62828"
  kind-plant: "#2E7D32"
  kind-fungal: "#795548"
  kind-protist: "#FFB300"
  kind-bacterial: "#00ACC1"
  kind-archaeal: "#E96035"
  kind-virus: "#8E24AA"
  kind-on-light: "#FFFFFF"
  model-basal-layer: "#D98E2B"
  model-middle-layer: "#E0B15C"
  model-surface-layer: "#E8A33D"
  model-ribosome: "#2F5FA8"
  model-ribosome-free: "#60A5FA"
  model-tubulin-alpha: "#2E7D9A"
  org-nucleus: "#3B4F9C"
  org-mito: "#B0563A"
  org-er-rough: "#6C7F3A"
  org-golgi: "#C39A2E"
  org-lyso: "#7A4A8C"
  org-perox: "#3E8C8C"
typography:
  title:
    fontFamily: "Source Serif 4, Noto Serif TC, Georgia, serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Source Serif 4, Noto Serif TC, Georgia, serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.6
  body:
    fontFamily: "Source Serif 4, Noto Serif TC, Georgia, serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Source Serif 4, Noto Serif TC, Georgia, serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  body-panel:
    fontFamily: "Source Serif 4, Noto Serif TC, Georgia, serif"
    fontSize: "15px"
    lineHeight: 1.6
  body-mobile:
    fontFamily: "Source Serif 4, Noto Serif TC, Georgia, serif"
    fontSize: "16px"
    lineHeight: 1.6
  title-mobile:
    fontFamily: "Source Serif 4, Noto Serif TC, Georgia, serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.1
  caption:
    fontFamily: "Source Serif 4, Noto Serif TC, Georgia, serif"
    fontSize: "13px"
    lineHeight: 1.5
  label-sm:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "11px"
    lineHeight: 1.3
  label-xs:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "10px"
    lineHeight: 1
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  base: "3px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "24px"
  s6: "32px"
  s7: "48px"
components:
  segmented-button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.base}"
    padding: "6px 10px"
  segmented-button-active:
    backgroundColor: "{colors.stain}"
    textColor: "{colors.paper}"
  queue-item:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
    padding: "8px 12px"
  chip:
    textColor: "{colors.stain}"
    typography: "{typography.label}"
    rounded: "{rounded.base}"
    padding: "4px 6px"
  badge-verified:
    textColor: "{colors.ok}"
    rounded: "{rounded.base}"
    padding: "2px 5px"
  badge-pending:
    textColor: "{colors.warn}"
    rounded: "{rounded.base}"
    padding: "2px 5px"
---

# Design System: Cell Atlas

## Overview

**Creative North Star: "The Lab Notebook"**

The page reads like a bench notebook: warm specimen paper, ink-black serif text, and monospace marginalia for every label, unit and source. Structure is drawn with hairline rules, not boxes. Two stain colours do all the work: methylene blue (#24489A) for structure, links and the active level, and eosin (#B8336A) for the single selection highlight.

The scale ruler is the one bold element, a ruled 2 m to 0.6 Å axis whose selected band fills solid blue. Everything else stays quiet so that a number and its source chip are the loudest content in any panel. English and Traditional Chinese share one type system, with Chinese set one step smaller and softer beneath English in bilingual mode.

The system rejects a glossy sci-fi dashboard (neon glow, glassmorphism, dark HUD chrome), cartoon biology (mascots, bubbly gradients, decorative icons) and generic SaaS cards (large radii, drop shadows, pastel headers).

**Key Characteristics:**
- Warm paper ground, ink text, hairline rules.
- Monospace labels, serif reading text.
- One bold element: the scale ruler.
- Flat surfaces, 3px corners, no shadows at rest.
- Dark theme swaps the same roles to a blue-black ground.

## Colors

A restrained paper and ink palette with two stain accents, plus fixed categorical colours for cell kinds and organelles.

### Primary
- **Methylene Blue** (#24489A, dark #7F9FE6): structure, links, chips, the active level band and the active segmented button.

### Secondary
- **Eosin Pink** (#B8336A, dark #E77AA4): the one selection highlight and the focus outline (2px).

### Neutral
- **Specimen Paper** (#ECE9DF, dark #141A21): page ground.
- **Raised Paper** (#F5F3EC, dark #1B232C): viewport frame and skip link.
- **Ink** (#1D232B, dark #E3E1D9): body text and ruler ticks.
- **Soft Ink** (#5A6270, dark #98A0AC): labels, units, secondary text.
- **Rule Grey** (#C9C4B6, dark #2E3946): hairlines, dividers, grid lines.
- **Control Edge** (soft ink at 75% over paper: #7F848C light 3.1:1, #777F89 dark 4.3:1): borders of buttons and segmented controls, `--edge`.

### Status
- **Verified Green** (#2F6B4F, dark #6FBF96) and **Pending Amber** (#8A5A12, dark #D9A75A): source badges, always outlined and paired with text.

### Categorical (fixed across the platform)
- **Cell kinds:** animal #C62828, plant #2E7D32, fungal #795548, protist #FFB300, bacterial #00ACC1, archaeal #E96035, viral #8E24AA. Lighter tones in dark mode.
- **Organelles:** 17 fixed tokens (`--org-*`), identical on every page and in both themes. Frontmatter lists the six most used; the rest live in `css/tokens.css`.

### Model materials
- **Tissue figure colours** (`js/tissue3d.js`): epithelial basal #D98E2B, middle #E0B15C and surface #E8A33D layers, ribosomes #2F5FA8 and #60A5FA, alpha tubulin #2E7D9A (beta tubulin reuses the surface amber). They colour 3D schematic materials only and never appear in the interface chrome.

### Named Rules
**The Two Stains Rule.** Blue means structure and the active level. Pink means the current selection. No third accent is added.

**The Fixed Palette Rule.** Cell-kind and organelle colours never change per page, and never carry meaning without a text label. Text on a kind fill uses `--kind-on-*`: white on animal, plant, viral and fungal, ink on bacterial, archaeal and protist.

## Typography

**Reading Font:** Source Serif 4 (with Noto Serif TC, Georgia, serif)
**Label Font:** JetBrains Mono (with ui-monospace, monospace)
**Chinese Font:** Noto Serif TC (line-height 1.75 in zh-Hant mode)

**Character:** A textbook serif for explanation and a lab-instrument monospace for every measurement, id and unit.

### Hierarchy
- **Title** (600, 30px, 1.1, -0.01em): the HUD title; 24px under 760px.
- **Headline** (600, 22px): viewport titles.
- **Body** (400, 17px, 1.6): reading text; panel body 15px; max line length 60 to 72ch.
- **Body small** (400, 14 to 15px): panel text (15px), key-value rows, source lists, compare table (14px). **Caption** (13px): link-site names. **Body mobile** (16px) and **Title mobile** (24px) apply under 760px.
- **Label** (500, 12 to 13px, mono; 11px small, 10px for mobile ruler ticks): HUD readouts, panel headings, ruler bands, ids, chips.

### Named Rules
**The Mono Is Data Rule.** Anything measured, identified or sourced (values, units, PDB ids, chips) sets in the monospace.

## Layout

A three-row page: HUD, scale ruler, then stage. The stage is a viewport over three info panels (columns 1fr 1fr 1.2fr) divided by hairlines. Spacing uses a 4px base scale (4, 8, 12, 16, 24, 32, 48). On coarse pointers, controls are 44px tall, chips 36px, and 3D canvases shorter so the page still scrolls. Under 760px the ruler pins to the bottom edge, the HUD readout drops to its own row, and panels become a horizontal scroll-snap strip at 86% width.

## Elevation & Depth

Flat by default. Depth comes from hairline rules, a raised-paper tone on the viewport frame and a faint 40px grid inside it. The only shadow-like device is an inset 3px bar (eosin, or the cell-kind colour) on the pressed queue button, and a 2px inset underline on the active compare column.

### Named Rules
**The Flat Rule.** No drop shadows. State shows as an inset bar or a border colour change, plus an underline on the pressed label so colour is not the only cue.

## Shapes

One corner radius, 3px, on buttons, chips, badges and segmented controls. Borders are 1px rule grey. Dashed borders mark a disabled or unlinked chip.

## Components

### Segmented control (language, view)
- **Shape:** 1px control-edge border, 3px radius, buttons divided by a control-edge hairline.
- **Active:** methylene blue fill with paper text.

### Queue buttons (cell, organelle, tissue pickers)
- **Style:** paper fill, 1px control-edge border (soft ink at 75% over paper, 3:1), 8px 12px padding, mono id in blue.
- **Hover:** border turns methylene blue. **Pressed:** border and inset 3px bar in eosin (cell-kind colour for cells).

### Chips and source chips
- **Style:** mono 12px, blue text, 1px rule border, 3px radius, 6px 8px padding (about 26px tall). Disabled chips grey with a dashed border.

### Badges
- **Style:** mono 11px, outlined in currentColor, green for verified, amber for pending.

### Scale ruler
- **Style:** under 760px band labels clip with an ellipsis so narrow levels (Body, System) never overprint their neighbours. SVG axis with ink ticks, mono tick labels, blue bands at 8% opacity that rise to 90% when selected (0.25s).

### Compare table
- **Style:** hairline row dividers at 55% rule colour, mono corner header, eosin inset underline on the active column. Unmeasured cells show a dash.

## Do's and Don'ts

### Do:
- **Do** put a source chip beside every number.
- **Do** use the fixed organelle and cell-kind colours with a text label.
- **Do** keep a 2px eosin focus outline with 2px offset on every focusable control.
- **Do** honour `prefers-color-scheme`, `data-theme` and `prefers-reduced-motion`.
- **Do** set English above Chinese at 0.88em in soft ink for bilingual text.

### Don't:
- **Don't** add drop shadows, glow, glassmorphism or gradient fills.
- **Don't** use radii above 3px or pill shapes.
- **Don't** use decorative icons, mascots or cartoon cell art.
- **Don't** introduce a third accent beside methylene blue and eosin.
- **Don't** show an estimate where a value is unmeasured; use a dash.
