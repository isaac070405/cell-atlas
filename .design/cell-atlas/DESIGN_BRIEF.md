# Design Brief: Cell Atlas · 細胞圖譜

## Assumptions

Isaac asked for the remaining work to be completed without stopping between phases (2026-11-03). Decisions taken on his behalf:

- Stack stays vanilla JS ES modules, the stack already in the repo. web-artifacts-builder (React) would need a second codebase.
- The four cell types are hepatocyte, enterocyte, muscle and plant mesophyll. Muscle is one column with a switch for skeletal, cardiac and smooth, because all three have sourced data.
- The project's own `css/tokens.css` wins over the design-flow house style (see Aesthetic).
- No 3D geometry in this iteration. The comparison is a data view; the Three.js cell stays in roadmap stage 3.

## Problem

A nutrition or physiology student meets volume fractions one cell at a time, in different textbook tables, with species and method often missing. Comparing "how much of this cell is mitochondria" across a liver cell, a gut cell, a muscle cell and a leaf cell means opening four sources and normalising them by hand.

## Solution

One compare view puts the four cell types side by side on a shared 0 to 100% scale, one row per compartment. Every value shows its species and links to its source. A compartment with a molecular structure (mitochondria, rough ER) jumps to that structure in Module B, and every cell or structure lists its links to the other Human Biology sites.

## Users

- **Isaac and classmates (USYD BSc, nutrition and physiology units)**: laptop at a desk, weekly during semester, comfortable with cell biology terms in English and Chinese.
- **Visitors from the Human Biology home page**: arrive through a deep link, stay for one cell or one structure.

## Core jobs

1. Compare one compartment across the four cell types. Success = mitochondrial fraction of all four readable in one view, no scrolling at 1280 px.
2. Check where a number comes from. Success = species visible next to the value, source one click away.
3. Move from a cell to its molecule and back. Success = mitochondria row → Complex I in 1 click; back to the compare view in 1 click.
4. Leave for the related body part or specimen. Success = every link key in `links.json` for the item is listed, live links clickable, unbuilt ones visibly disabled.

## Experience Principles

1. **Honest gaps over filled tables** -- an unmeasured compartment shows "not measured", never an estimate. Ranges stay ranges (4 to 15%), drawn as a span.
2. **Provenance over brevity** -- species sits on every column header; derived values (a sum of two measured values) say so.
3. **One scale over best fit** -- all bars share the same 0 to 100% axis, so 0.5% looks small next to 79%.

## Aesthetic

Project design system: `css/tokens.css` (paper and ink, methylene-blue `--stain`, eosin `--select`, fixed `--org-*` organelle colours, JetBrains Mono labels, Source Serif 4 and Noto Serif TC text, system light or dark with a toggle).

House-style conflicts, resolved for the project system as Isaac chose in phase 1:

| House rule | Project system | Result |
|---|---|---|
| Hunter x Hunter palette | stain / select / organelle colours | n/a (project system) |
| Times New Roman + Academy Engraved | Source Serif 4, Noto Serif TC, JetBrains Mono | n/a (project system) |
| Dark mode first | follows system, toggle remembered | n/a (project system) |
| LaTeX rendering | Unicode subscripts in data | n/a, no maths in this view |
| Kanso, Ma, line icons | already followed | kept |

## Content Hierarchy

### Compare view `/?view=compare`

1. **Compartment matrix** (rows = compartments, columns = 4 cell types, bar + value per cell) -- answers job 1 directly.
2. **Column header** (cell name, species, basis "% of cell" or "% of cytoplasm") -- job 2 needs species before the number.
3. **Muscle switch** (skeletal / cardiac / smooth) inside the muscle column header.
4. **Structure jump** on rows that have a PDB entry -- job 3.
5. **Footnotes** for derived values and basis differences.

### Info panels (all views)

1. **Volume fractions** chart for the selected cell (fills the empty chart panel).
2. **Selected object** card with outgoing and incoming links grouped by site -- job 4.
3. **Sources on this screen**, one entry per citation id behind any visible number.

## Scope

- In: compare view, per-cell fraction chart, cell data in `catalog.json`, seven citations, two-way links from `links.json`, organelle → structure jumps, EN / 繁 / 雙語 strings.
- Out (this version): 3D cell, Mol* viewer, `?part=` deep link in the 3D model, organelle sizes table.

## Existing context

Vanilla ES modules, no build step, GitHub Pages. `js/state.js` holds one state object and writes the URL; `js/app.js` renders HUD, viewport queue and three panels; `js/i18n.js` renders `{en, zh-Hant}` objects; `data/*.json` hold catalog, citations, links and strings.

## Open questions

- Gabella 1976 *J Physiol* 263:199 title unread; its nucleus 2% value stays out until it is.
- No human values exist for enterocyte or smooth muscle compartments.
