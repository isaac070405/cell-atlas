# Cell Atlas · 細胞圖譜

Cell Atlas is the cell and molecule section of the Human Biology platform. It covers the last two steps of the scale chain: body (3D Anatomy Model) → tissue (Histology) → **cell (Module A)** → **molecule (Module B)**.

Every number on screen carries a source chip with species, cell type and method. Cell models are to-scale schematics. Molecular models are experimental PDB / EMDB structures, never AI predictions.

Live site: https://isaac070405.github.io/cell-atlas/

## Current state

This repo holds the site shell (roadmap stage 0), the data views (stages 2 and 3), the Module B Mol* viewer (stage 4) and the embedded 3D Anatomy Model (stage 5):

- Log-scale navigator from 2 m to 0.6 Å with seven levels: system, organ, tissue (the 3D Anatomy Model, embedded from `anatomy/` with its controls docked in the Cell Atlas panel style; desktop only). System and organ levels list a Body item (the whole model with every panel) plus the systems and organs in `data/anatomy.json`; picking a system or organ isolates its parts, hides every panel and, for an organ, shows the model's cross-section (`?level=organ&part=heart`). The Organelle-level cell view has a cross-section panel in place of the cutting slider. Tissue level has four schematic 3D models (nervous tissue shows afferent and efferent beside the model) (`js/tissue3d.js`, `data/tissues.json`, `?level=tissue&part=nervous`). The bacterial cell (E. coli) and the virus (bacteriophage T4) are schematic models; E. coli has a periplasm range (Stock 1977) in the compare view, the phage has no data table. Selected cell buttons and the Cell band on the ruler are red for animal, green for plant, purple for bacterial cells, cell, organelle, complex, atom.
- One state controller (`js/state.js`) drives the header readout, viewer pane and three info panels.
- Language switch EN / 繁 / 雙語, remembered per browser. Strings live in `data/i18n.json`.
- Light and dark themes from `css/tokens.css`, with fixed organelle colours shared across the platform.
- Deep links `?cell=enterocyte`, `?pdb=5XTD`, `?level=organelle`.
- Module B pane with the first-release queue; the Mol* viewer loads in it (see tour points below).
- **Compare view** (`?view=compare`): hepatocyte, enterocyte, muscle (skeletal, cardiac or smooth via `&muscle=`) and plant mesophyll side by side, one row per compartment, on one 0–100% scale. Species on every column; ranges drawn as spans; unmeasured compartments shown as a dash.
- Volume-fraction chart for the selected cell, from `data/catalog.json`.
- **3D cell** (Module A): procedural Three.js cell for each of the six cells. Compartment volumes sum to the published fractions (`js/cellmodel.js`); shapes and positions are schematic. Orbit, cutting plane, click a compartment for its data card (`?cell=hepatocyte&org=mito`). Three.js r187 is self-hosted in `vendor/three/`.
- **Mol\* spike** (`spike/molstar.html`): loads 5XTD or 4UG0 as binary CIF from RCSB with Mol* 5.13.1, self-hosted in `vendor/molstar/`.
- **Module B tour points** (`data/tour-points.json`): preset views for 5XTD (FMN, Fe–S clusters, Q-site) and 4UG0 (tRNA sites), each with a source chip and a `computed` or `literature` basis. A tour bar in the Module B pane focuses each point in Mol*.
- **Organelle size and function text**: the cell card shows size ranges and function text from PubMed and SciSpace sources, 36 citations in `data/citations.json`.
- **`@isaac070405/cell-3d`** (`packages/cell-3d/`): the 3D cell model and view as an npm package, published to GitHub Packages by `.github/workflows/publish-cell-3d.yml`.
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
| `js/molview.js` | Module B: Mol* loader and tour-point focus |
| `js/tissue3d.js` | Four schematic tissue models |
| `packages/cell-3d/` | Reusable npm package `@isaac070405/cell-3d`: cell layout (`src/model.js`, pure maths) and Three.js view (`src/view.js`) |
| `js/cellmodel.js`, `js/cell3d.js` | Re-exports of the package, so site imports keep working |
| `spike/molstar.html` | Stage 1 Mol* spike page |
| `scripts/check-data.mjs` | Stage 2 and 3 gate: citations resolve, none pending, model volumes within 2 points |
| `vendor/` | Self-hosted Three.js and Mol* builds |
| `anatomy/` | Imported 3D Anatomy Model (stage 5), served at `/anatomy/`, no design system; see `anatomy/NOTICE.md` for licences |
| `.design/cell-atlas/` | Design brief, information architecture, build tasks |
| `data/catalog.json` | Cells with volume fractions, compartments, structures |
| `data/citations.json` | Shared citation registry (`verified` or `pending`) |
| `data/tour-points.json` | Module B preset views for 5XTD and 4UG0, with citations |
| `data/anatomy.json`, `data/tissues.json` | System, organ and tissue lists for the anatomy levels |
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
| 2. Data | Data tables for the four first-release cell types, cross-layer index, full links.json | "Pending check" count is zero. The 36 citations are verified; the open data items below stay open |
| 3. Module A | Procedural Three.js cell, side-by-side compare, clipping plane, organelle pick, data card | Organelle volume ratios match the data table within 2 percentage points. Passes in `node scripts/check-data.mjs`; cardiomyocyte and plant outlines are too crowded to draw without overlap |
| 4. Module B | Mol* viewer, preset tour points, mitochondrion → Complex I and rough ER → ribosome jumps | One full cell → atom → cell round trip without stutter. Viewer, tour points and jumps are built. Colouring modes and a subunit list with UniProt links are not built |
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
- [x] Enterocyte organelle volume fractions (Buschmann & Manke 1981, hamster jejunum, EM stereology)
- [x] Skeletal, cardiac and smooth muscle organelle volume fractions (Larsen 2012; Barth 1992; Gabella 1976, EM stereology)
- [x] Plant mesophyll organelle volume fractions (Winter, Robinson & Heldt 1994, spinach leaf)
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
- [x] Latest Mol* version number and bundle size: npm `latest` is 5.13.1, the version in `vendor/molstar/`; bundle size under Sources already in use

## Decisions already made

- Mol* is the only molecule viewer; `<sr-mol>` (3Dmol.js) and `<pdb-slot>` will be replaced.
- The GitHub repo is the master copy of the 3D Anatomy Model.
- Human Biology home page TOP-01 is the master ALDH2 content; Specimen Room simplifies it.
- Final integrated version is edited in Claude and deployed to GitHub Pages.

## Open questions

- None on volume fractions. All six cells cite a verified source in `data/citations.json`.

## License

Code is released under the MIT License (see `LICENSE`). PDB and EMDB structures keep the terms of their archives and are cited per entry.

## Sources already in use

- BioNumbers BNID 110373, hepatocyte compartment volumes (values checked against Alberts MBoC; edition and table number to confirm).
- BioNumbers BNID 105782, mitochondria 22% of rat hepatocyte volume, Weibel et al. 1969 (verified).
- Guo et al. (2017) *Cell* 170:1247–1257, PDB 5XTD, EMD-6773 (verified).
- Khatter et al. (2015) *Nature* 520:640–645, PDB 4UG0 (verified).

- Mol* 5.13.1 (npm, 2026-11-05): `molstar.js` 5.27 MB raw, about 1.5 MB gzipped; `molstar.css` 73 KB. Loaded only on the spike page.
