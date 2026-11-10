# Cell Atlas · 細胞圖譜

Cell Atlas is the cell and molecule section of the Human Biology platform. It covers the last two steps of the scale chain: body (3D Anatomy Model) → tissue (Histology) → **cell (Module A)** → **molecule (Module B)**.

Every number on screen carries a source chip with species, cell type and method. Cell models are to-scale schematics. Molecular models are experimental PDB / EMDB structures, never AI predictions.

Live site: https://isaac070405.github.io/cell-atlas/

## Current state

This repo holds the **site shell** (roadmap stage 0) plus the first data views:

- Log-scale navigator from 2 m to 0.6 Å with seven levels: system, organ, tissue (the 3D Anatomy Model, embedded from `anatomy/` with its controls docked in the Cell Atlas panel style; desktop only). System and organ levels list the systems and organs in `data/anatomy.json`; picking one isolates it in the model (`?level=organ&part=heart`). Tissue level has four schematic 3D models (`js/tissue3d.js`, `data/tissues.json`, `?level=tissue&part=nervous`). The bacterial cell (E. coli) and the virus (bacteriophage T4) are schematic models; E. coli has a periplasm range (Stock 1977) in the compare view, the phage has no data table. Selected cell buttons and the Cell band on the ruler are red for animal, green for plant, purple for bacterial cells, cell, organelle, complex, atom.
- One state controller (`js/state.js`) drives the header readout, viewer pane and three info panels.
- Language switch EN / 繁 / 雙語, remembered per browser. Strings live in `data/i18n.json`.
- Light and dark themes from `css/tokens.css`, with fixed organelle colours shared across the platform.
- Deep links `?cell=enterocyte`, `?pdb=5XTD`, `?level=organelle`.
- Empty Module A and Module B panes with the first-release queue.
- **Compare view** (`?view=compare`): hepatocyte, enterocyte, muscle (skeletal, cardiac or smooth via `&muscle=`) and plant mesophyll side by side, one row per compartment, on one 0–100% scale. Species on every column; ranges drawn as spans; unmeasured compartments shown as a dash.
- Volume-fraction chart for the selected cell, from `data/catalog.json`.
- **3D cell** (Module A): procedural Three.js cell for each of the six cells. Compartment volumes sum to the published fractions (`js/cellmodel.js`); shapes and positions are schematic. Orbit, cutting plane, click a compartment for its data card (`?cell=hepatocyte&org=mito`). Three.js r187 is self-hosted in `vendor/three/`.
- **Mol\* spike** (`spike/molstar.html`): loads 5XTD or 4UG0 as binary CIF from RCSB with Mol* 5.13.1, self-hosted in `vendor/molstar/`.
- Two-way links: each card lists its own `links.json` edges grouped by site, plus every item that links to it. Mitochondria and rough ER rows jump to PDB 5XTD and 4UG0.

## Files

| Path | Holds |
| --- | --- |
| `index.html` | Page layout: HUD, scale ruler, viewer, three panels |
| `css/tokens.css` | Platform colours, fonts, spacing, organelle colours |
| `js/state.js` | Scale controller and URL deep links |
| `js/i18n.js` | Language modes |
| `js/ruler.js` | Scale navigator |
| `js/compare.js` | Four-cell comparison and fraction chart |
| `js/cellmodel.js` | Procedural cell layout from the data table (pure maths) |
| `js/cell3d.js` | Three.js view: orbit, cutting plane, organelle pick |
| `spike/molstar.html` | Stage 1 Mol* spike page |
| `scripts/check-data.mjs` | Stage 2 and 3 gate: citations resolve, none pending, model volumes within 2 points |
| `vendor/` | Self-hosted Three.js and Mol* builds |
| `anatomy/` | Imported 3D Anatomy Model (stage 5), served at `/anatomy/`, no design system; see `anatomy/NOTICE.md` for licences |
| `.design/cell-atlas/` | Design brief, information architecture, build tasks |
| `data/catalog.json` | Cells with volume fractions, compartments, structures |
| `data/citations.json` | Shared citation registry (`verified` or `pending`) |
| `data/links.json` | Shared link keys `anat:` `tis:` `cell:` `pdb:` `spec:` `diag:` `ent:` |
| `data/i18n.json` | All interface text in `en` and `zh-Hant` |

## Check the data

```bash
node scripts/check-data.mjs
```

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

The page fetches JSON, so opening `index.html` straight from disk does not work.

## Roadmap

Each stage has a pass condition. The next stage starts only after it passes.

| Stage | Work | Pass condition |
| --- | --- | --- |
| 0. Shell | HUD, scale navigator, state controller, i18n, links.json, citations.json | Live on GitHub Pages ✅ |
| 1. Technical spike | One page loads Mol* with 5XTD; test whether `<sr-mol>` and `<pdb-slot>` read 4UG0 | Displays on GitHub Pages and rotates on a phone. Built; needs a check on the live site and a phone (RCSB is unreachable from the build sandbox) |
| 2. Data | Data tables for the four first-release cell types, cross-layer index, full links.json | "Pending check" count is zero. The 30 citations are verified; the open data items below stay open |
| 3. Module A | Procedural Three.js cell, side-by-side compare, clipping plane, organelle pick, data card | Organelle volume ratios match the data table within 2 percentage points. Passes in `node scripts/check-data.mjs`; cardiomyocyte and plant outlines are too crowded to draw without overlap |
| 4. Module B | Mol* viewer, presets, colouring modes, subunit list with UniProt links; mitochondrion → Complex I and rough ER → ribosome jumps | One full cell → atom → cell round trip without stutter |
| 5. Platform integration | New section in the Human Biology home page; `?part=` deep link in the 3D model; jump buttons in Histology and Specimen Room | Body → tissue → cell → molecule chain works end to end. 3D model copied into `anatomy/`. Home page section and Histology / Specimen Room jumps dropped; only the 3D model and a `?part=` link from the cell views remain |
| 6. Polish | HUD layout, light and dark modes, three language modes, mobile, source cards | Every number on every screen has a citation |

### Releases

| Release | Cells | Structures |
| --- | --- | --- |
| 1 | Hepatocyte, enterocyte, skeletal / cardiac / smooth muscle, plant cell | 5XTD Complex I, 4UG0 80S ribosome; candidates ATP synthase, nuclear pore complex, GLUT / SGLT1 |
| 2 | Sperm and egg, neurone types | Bcl-2 family, β2 adrenergic receptor |
| Candidates | Parietal cell, intestinal L cell, brown adipocyte, bone cell, type II pneumocyte | ALDH2, GLP-1, lactase, HMG-CoA reductase, H⁺/K⁺-ATPase, UCP1 |

### Data to collect before stage 2 (18 items)

Cell data
- [ ] Enterocyte organelle volume fractions (BioNumbers; EM stereology), Isaac
- [ ] Skeletal, cardiac and smooth muscle organelle volume fractions (BioNumbers; EM stereology), Isaac
- [ ] Plant mesophyll organelle volume fractions (BioNumbers; plant cell textbook), Isaac
- [x] Hepatocyte compartment percentages checked one by one (Alberts MBoC Table 12-1, latest edition)
- [x] Organelle size ranges and function text (PubMed and SciSpace sources in place of Alberts and Lodish, which were not reachable). Open gaps: absolute vacuole size, function text for perinuclear space (tracked in #27)
- [ ] Protein subcellular location (Human Protein Atlas, subcellular)

Molecular structures
- [ ] Human ATP synthase PDB ID (RCSB PDB)
- [ ] GLUT2, GLUT5, SGLT1 PDB IDs (RCSB PDB)
- [ ] Nuclear pore complex PDB or EMDB ID (RCSB PDB, EMDB)
- [ ] Bcl-2 family and β2 adrenergic receptor PDB IDs (RCSB PDB)
- [ ] Lactase, HMG-CoA reductase, H⁺/K⁺-ATPase, UCP1 PDB IDs (RCSB PDB)
- [ ] Rubisco / photosystem II, voltage-gated sodium channel, dynein PDB IDs (RCSB PDB)
- [ ] Bacterial 50S ribosome with macrolide bound, to compare with 4UG0 (RCSB PDB)
- [x] Literature locations of 5XTD and 4UG0 tour points: Q-site, Fe–S clusters, tRNA sites (Guo 2017 Cell; Khatter 2015 Nature)

Literature
- [ ] Latest evidence on metformin and Complex I (PubMed review)
- [ ] SGLT1, GLUT5, GLUT2 apical and basolateral distribution in enterocytes (physiology textbook or review)

Technical
- [x] Whether 4UG0 has a legacy .pdb file (RCSB download page): no, legacy PDB is disabled; use BinaryCIF
- [ ] Latest Mol* version number and bundle size (molstar.org, npm)

## Decisions already made

- Mol* is the only molecule viewer; `<sr-mol>` (3Dmol.js) and `<pdb-slot>` will be replaced.
- The GitHub repo is the master copy of the 3D Anatomy Model.
- Human Biology home page TOP-01 is the master ALDH2 content; Specimen Room simplifies it.
- Final integrated version is edited in Claude and deployed to GitHub Pages.

## Open questions

- Volume fraction sources for enterocyte, muscle and plant cells (Isaac).

## License

Code is released under the MIT License (see `LICENSE`). PDB and EMDB structures keep the terms of their archives and are cited per entry.

## Sources already in use

- BioNumbers BNID 110373, hepatocyte compartment volumes (values checked against Alberts MBoC; edition and table number to confirm).
- BioNumbers BNID 105782, mitochondria 22% of rat hepatocyte volume, Weibel et al. 1969 (verified).
- Guo et al. (2017) *Cell* 170:1247–1257, PDB 5XTD, EMD-6773 (verified).
- Khatter et al. (2015) *Nature* 520:640–645, PDB 4UG0 (verified).

- Mol* 5.13.1 (npm, 2026-11-05): `molstar.js` 5.27 MB raw, about 1.5 MB gzipped; `molstar.css` 73 KB. Loaded only on the spike page.
