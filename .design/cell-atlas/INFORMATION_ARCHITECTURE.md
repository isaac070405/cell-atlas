# Information Architecture: Cell Atlas

Based on: .design/cell-atlas/DESIGN_BRIEF.md

## Sitemap

One page, `index.html`. Views are URL states, so every view is a shareable deep link.

- Cell level `/` (queue of six cells)
  - Compare view `/?view=compare`
    - Muscle type `/?view=compare&muscle=cardiomyocyte`
  - One cell selected `/?cell=enterocyte`
- Complex level `/?level=complex` (queue of two structures)
  - One structure `/?pdb=5XTD`

## Navigation

- **Primary**: the scale ruler (cell, organelle, complex, atom). Unchanged.
- **Contextual**: a two-button switch in the Module A viewport header, "Cells" / "Compare". Shown only at module A levels.
- **Global**: language switch and theme toggle in the HUD. Unchanged.

## URL patterns

| Pattern | Purpose | Notes |
|---|---|---|
| `?view=compare` | four-column matrix | dropped from the URL when leaving module A |
| `&muscle=<id>` | muscle column type | `skeletal-myocyte` (default), `cardiomyocyte`, `smooth-myocyte` |
| `?cell=<id>` | selected cell | drives the chart panel and card; kept in compare view |
| `?pdb=<id>` | selected structure | switches to module B |

## Page structure

### Compare view
Layout: viewport frame holds the matrix; panels below are unchanged.
Blocks: header row (4 column heads with species and basis), compartment rows, footnotes.
States: populated (all six cells have data); a cell with no fractions shows "Data source not found yet" in its column.

### Selected object card
Blocks: name, release, size, then "Links" grouped by site label. Each group lists keys; live deep links are anchors, unbuilt ones are dashed chips. Incoming edges (other items that point here) are listed under "Linked from".

## User flows

### Compare mitochondria
1. Cell level → 2. "Compare" → 3. read the mitochondria row. Clicks: 1 (target 1).

### Check a source
1. In compare view, click a column head → cell selected, sources panel lists its citation → 2. click the source. Clicks: 2.

### Cell to molecule and back
1. Mitochondria row "Complex I" chip → `?pdb=5XTD` → 2. card "Linked from" chip `cell:hepatocyte` → `?cell=hepatocyte`, or ruler "Cell" → compare view restored from `view` state. Clicks: 1 each way.

## Content model

| Entity | Fields | Relations |
|---|---|---|
| Cell | id, name, release, sizeUm?, species, basis, fractions[], cite | fractions[].org → Compartment |
| Fraction | org, value or [lo, hi], cite, note?, derived? | cite → Citation |
| Compartment | id, name, token (`--org-*`), structure? | structure → Structure |
| Structure | id, name, method, cite | edges in links.json |
| Citation | source, detail, species, method, url, status | — |
| Edge | from, to[] | keys `prefix:id`, prefixes in links.targets |
