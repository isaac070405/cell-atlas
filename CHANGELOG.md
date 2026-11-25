# Changelog

All notable changes to Cell Atlas are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The project has no version numbers yet, so entries are grouped by date. The `@isaac070405/cell-3d` package has its own version, currently 0.1.1.

Pull request numbers refer to https://github.com/isaac070405/cell-atlas/pull/.

## Unreleased

### Added
- BID, BIM, BIK, BOK and BIT1 (PTRH2, a non-member control) in the Bcl-2 family table in Compare, with a new "BH3 peptide only" row. None has a Module B structure yet, so their headers are not links. BIK has no PDB entries and shows dashes for resolution and years.
- Bcl-2 family table in the Compare view (`?view=compare&cmp=bcl2`): BCL-2, BCL-XL, MCL-1, BAX and BAK with PDB entries by method, best resolution and release years, linked to their Module B structures (`data/bcl2-compare.json`, `scripts/build-bcl2-compare.py`). A Cells / Bcl-2 family switch sits at the top of Compare.
- Collagen types I to III and elastin: Module B structure 1CAG (collagen-like triple helix peptide, 1.85 Å, with a tour point on the Gly→Ala substitution), location entries for COL1A1, COL1A2, COL2A1, COL3A1 and ELN (UniProt P15502, 164 genes), and cited text on the collagen and elastic fibre parts of the connective tissue model. Tissue parts can now carry a `cite` list, shown in the Sources panel when the part is selected. Sources: Shoulders & Raines 2009, Samad & Sikarwar 2016, Moroy et al. 2005, Bella et al. 1994.
- Module B structure 2PQK (human MCL-1 with a Bim BH3 peptide, 2.0 Å) with a verified citation (Fire et al. 2010), one tour point (the Bim BH3 peptide, centroid read from the deposited coordinates), links to hepatocyte, cardiomyocyte and skeletal myocyte, and the MCL1 location entry moved from `candidate` to 2PQK.
- General eukaryotic cell (`eukaryote-general`): a schematic animal cell drawn after a textbook figure, with 17 clickable parts. It has no measured volume fractions and no source chip (`data/tissues.json`, `js/tissue3d.js`).
- Protein subcellular location for the Bcl-2 structures: BCL2, BCL2L1 and BAX (HPA) now point to 1G5M, 1MAZ and 1F16, and BAK1 (UniProt, experimental evidence: mitochondrion outer membrane) is added for 2IMS, making 159 genes.
- Module B structures for the Bcl-2 family: 1MAZ (human BCL-XL, 2.2 Å), 1G5M (human BCL-2, NMR), 2IMS (human BAK, 1.48 Å) and 1F16 (human BAX, NMR), each with a verified citation and links to hepatocyte, cardiomyocyte and skeletal myocyte. The mitochondrion outer membrane part links to 2IMS. Each has one tour point read from the deposited coordinates: BCL-XL and BCL-2 loop ends, the BAK zinc ion and BAX helix α9. The full PDB catalogue is in `data/bcl2-family/`.
- Human Protein Atlas subcellular location for 158 genes of the Module B structures, with 19 genes missing from the HPA export filled from UniProt (`data/protein-location.json`, `scripts/build-protein-location.py`) (#59, #60).
- Cell type colour legend, view buttons and cross-section for the system and tissue levels, and epithelial, neuroglia and neuron tissue models (#49, #50, #51).
- Traditional Chinese names for the embedded 3D Anatomy Model: all 2,348 structure labels, group headings, systems and the 14 layers follow the EN / 繁 / 雙語 switch, and the search box accepts Chinese (`anatomy/zh-hant.js`).
- Tissue models: eight epithelial subtypes, six neuroglia and three neuron types; the tissue picker is grouped by type and connective tissue parts are grouped as ground substance, fibres and cells.
- Organelle level: schematic 3D models of mitochondrion, nucleus, rough ER and Golgi apparatus, with parts, cited sizes and links to PDB 5XTD and 4UG0.
- Atom level: ball-and-stick water, ammonia and methane with element radii (Cordero 2008, Bondi 1964).
- Module B structures 1TQN (human cytochrome P450 3A4, 2.05 Å) and 1ZUM (human ALDH2*2, 2.10 Å) with tour points read from the deposited coordinates.
- Organelle models: lysosome, peroxisome, microfilament, intermediate filament, microtubule, centrosome.
- Atom models: ATP, ADP, NADH, xanthine, purine, pyrimidine (computed conformers) and a [4Fe-4S] cluster; NADH and the cluster link to PDB 5XTD.
- `scripts/check-data.mjs` checks the new models.

### Changed
- The "Histology" link target is now "Tissue" and `tis:` links open the Tissue level.
- Anatomy sex and skin tone preferences are whitelisted and stored as literals (#56, #58).
- README, `docs/DATA.md` and the wiki pages in `anatomy/docs/` now match the current data (45 citations, 21 tissues, eight levels).
- Removed `anatomy/assets/eye.glb` (GPL-3.0-only, incompatible with the MIT licence); the procedural eye is drawn instead.
- Added the Three.js MIT licence text to `vendor/three/LICENSE`.

### Added
- Issue forms for bug reports, data or citation errors and feature requests, plus `config.yml` that turns blank issues off (#40).
- `CITATION.cff`, `SUPPORT.md`, `CHANGELOG.md` and a LICENSE badge in the README (#40).
- `THIRD_PARTY_NOTICES.md`, `docs/DATA.md`, `.editorconfig`, `.github/CODEOWNERS` and `.github/dependabot.yml` (#40).

## 2026-11-11

### Added
- `CODE_OF_CONDUCT.md`, adapted from Contributor Covenant 2.1, and a pull request template (#39).
- `CONTRIBUTING.md` with setup, checks, data rules and pull request steps (#37).
- `SECURITY.md` and `ACCESSIBILITY.md` (#35).
- Body group, focus mode for the system and organ levels, heart parts, a cell cross-section, and afferent and efferent pathways in the embedded 3D Anatomy Model (#38).
- Stage 5: the 3D Anatomy Model in `anatomy/`, system, organ and tissue levels, the E. coli cell and the bacteriophage T4 virus (#30).
- `@isaac070405/cell-3d` npm package with a publish workflow, extracted from the site code (#33).
- Module B tour points for 5XTD and 4UG0, wired into the preset views (#22, #25).
- Organelle size ranges and function text with citations, including rat hepatocyte mitochondria, peroxisome and nucleus sizes, a second lysosome size, perinuclear space width and cytosol function text (#24, #28, #29, #31).

### Changed
- README current state, roadmap status and files table now match the built features (#34, #35).
- Volume-fraction data items ticked in the README, and the Mol* version item recorded as 5.13.1 (#35, #37).
- Nucleus function source replaced (#29).

### Fixed
- Hepatocyte citation record: year, data source name and table number flag (#21, #23).
- The 3D Anatomy Model no longer requests body meshes that are not in the repository (#36).
- Formatting of the `LICENSE` file (#32).

## 2026-11-10

### Added
- Stages 1 to 3: Mol* spike page, `scripts/check-data.mjs` data gate, and the procedural 3D cell with cutting plane and organelle picking (#20).

## 2026-11-03

### Added
- Four-cell compare view, volume-fraction chart and two-way links (#19).

## 2026-11-01

### Added
- Site shell: log-scale navigator, state controller, English / Traditional Chinese / bilingual switch, shared data files and the roadmap.
- MIT license section in the README and the first GitHub Pages build.
