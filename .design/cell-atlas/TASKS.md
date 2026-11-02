# Build Tasks: Cell Atlas

Generated from: .design/cell-atlas/DESIGN_BRIEF.md
Date: 2026-11-03
Tokens: `css/tokens.css` (project system; phase 4 only adds missing organelle colours)

## Foundation

- [x] **Organelle tokens**: add `--org-endo`, `--org-sr`, `--org-myofibril`, `--org-vacuole`, `--org-perinuclear` to `css/tokens.css`, with dark-mode values. Done = every compartment in `catalog.json` maps to a token. _New: 5 tokens_
- [x] **Cell data**: add `species`, `basis`, `fractions[]` to all six cells and a `compartments` list in `data/catalog.json`; add 7 citations to `data/citations.json`. Done = every fraction's `cite` resolves to a citation. _Reuses: citations.json schema_
- [x] **View state**: add `view` and `muscle` to `js/state.js`, read and written in the URL. Done = `?view=compare&muscle=cardiomyocyte` survives a reload. _Reuses: readUrl / writeUrl_

## Compare view

- [x] **Matrix**: `js/compare.js` renders the four-column matrix with shared 0 to 100% bars, range spans, "not measured" dashes. Done = mitochondria row shows 22, 11.7, 4 to 15 and 0.5 at 1280 px without scrolling. _New: compare.js_
- [x] **Column heads and muscle switch**: name, species, basis; segmented switch in the muscle head. Done = switching to smooth muscle updates the column and URL.
- [x] **Structure jumps**: chips on mitochondria and rough ER rows open `?pdb=5XTD` / `?pdb=4UG0`. Done = one click reaches module B.

## Panels

- [x] **Fraction chart**: chart panel draws the selected cell's fractions as rows of bars. Done = `?cell=enterocyte` shows 7 rows with values.
- [x] **Two-way links card**: outgoing links grouped by site label, plus "Linked from". Done = `?pdb=5XTD` card lists hepatocyte under Cell Atlas · Module A, and `?cell=hepatocyte` lists 5XTD under Linked from.
- [x] **Sources panel**: one entry per citation behind visible numbers (all columns in compare view). Done = compare view lists 4 sources with the default muscle.

## Polish

- [x] **Strings**: all new text in `data/i18n.json`, EN / 繁 / 雙語. Done = no raw keys in any mode.
- [x] **Responsive and states**: matrix scrolls inside its frame at 375 px; both themes checked by screenshot. Done = no page-level horizontal scroll at 375 px.
- [x] **README**: update Current state and files table. Done = README names compare view and `?view=compare`.
