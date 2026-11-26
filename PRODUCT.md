# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Undergraduate life-science students (confirmed). They study cell and molecular structure for coursework and revision, and check that a number has a traceable source. Teachers, researchers and the general public are not confirmed audiences.

## Product Purpose
Cell Atlas is the cell and molecule section of the Human Biology platform. It covers the scale chain from body to atom: body, system and organ (3D Anatomy Model), tissue, cell (Module A), organelle, molecule (Module B) and atom. Success means a student finds a structure, reads a sourced number and follows it to its PDB entry or citation.

## Positioning
One log-scale navigator (2 m to 0.6 Å) joins every level, and every number on screen carries a source chip with species, cell type and method. Molecular models are experimental PDB / EMDB structures, never AI predictions. Cell models are to-scale schematics.

## Operating Context
Laptop and desktop only (decided 2026-11-26): the layout holds from 1024px wide, and narrower windows scroll sideways under a notice. Phones and tablets are out of scope. Touchscreen laptops still get 44px touch targets. Static site on GitHub Pages (https://isaac070405.github.io/cell-atlas/). Three.js r187 and Mol* 5.13.1 are self-hosted in `vendor/`. Data lives in `data/*.json`. State is driven by `js/state.js`. Deep links use query parameters such as `?cell=`, `?level=`, `?pdb=` and `?view=compare`. The embedded 3D Anatomy Model in `anatomy/` is also desktop only.

## Capabilities and Constraints
- Eight levels, a compare view (including the Bcl-2 family table), Module B tour points and a protein subcellular location table.
- Language switch EN / 繁 / 雙語, remembered per browser, strings in `data/i18n.json`.
- Light and dark themes from `css/tokens.css`.
- Every number needs a source chip. Unmeasured values show a dash, never an estimate.
- Cell-type colours (animal #C62828, plant #2E7D32, fungal #795548, protist #FFB300, bacterial #00ACC1, archaeal #E96035, viral #8E24AA) and the fixed organelle colours are shared across the platform.

## Brand Commitments
Name "Cell Atlas · 細胞圖譜". Part of the Human Biology platform. Tone is academic and source-first.

## Evidence on Hand
45 citations in `data/citations.json`, PDB and EMDB entries, Human Protein Atlas data (CC BY-SA 4.0, see `THIRD_PARTY_NOTICES.md`). No testimonials, usage figures or user studies exist, so none may be invented.

## Product Principles
1. A number without a source chip does not ship.
2. Experimental structures only for molecules, with computed models labelled as computed.
3. Colour never carries meaning alone.
4. English and Traditional Chinese are equal first-class languages.
5. The text view holds every number the 3D view shows.

## Accessibility & Inclusion
Goal is WCAG 2.2 AA (not audited, see `ACCESSIBILITY.md`). Reduced-motion and system theme preferences are honoured. Known gaps: no keyboard control of the 3D canvas, no colour-blind check, contrast unmeasured in both themes.
