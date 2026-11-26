# Changelog

All notable changes to Cell Atlas are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The project has no version numbers yet, so entries are grouped by date. The `@isaac070405/cell-3d` package has its own version, currently 0.1.1.

Pull request numbers refer to https://github.com/isaac070405/cell-atlas/pull/.

## Unreleased

### Added
- Module B structure 3SN6 (human β2 adrenergic receptor with Gs, X-ray 3.2 Å, Rasmussen et al. 2011) with four preset views read from the deposited coordinates (agonist BI-167107, Asp113, the receptor and Gαs), linked both ways with the adrenergic receptor diagram (β receptor and Gs parts).
- Protein synthesis diagram (`?diagram=protein-synthesis`): transcription (initiation, elongation, termination, RNA processing, mature mRNA) in the nucleus and translation (43S complex, scanning, 80S assembly, elongation, termination) in the cytosol, with the 80S ribosome part linked to PDB 4UG0 and 4UG0 linked back. Adds 9 verified citations.
- Adrenergic receptor signalling diagram (`?diagram=adrenergic`): α1 (Gq/11, phospholipase C, IP3 and DAG, Ca²⁺ and PKC), α2 (Gi/o, adenylyl cyclase inhibition, Gβγ) and β (Gs, cAMP, PKA and EPAC), plus GRK and β-arrestin internalisation and signalling. Adds 7 verified citations.
- Module B structure 1W0E (human cytochrome P450 3A4, ligand-free, X-ray 2.8 Å, Williams et al. 2004) with heme and Cys442 tour points read from the deposited coordinates, location data shared with 1TQN (`also` in `protein-location.json`), and two citations (Williams 2004, Sevrioukova & Poulos 2013). A structure's `cite` may now be a list.
- Fourth diagram, `?diagram=respiration`: cellular respiration from glycolysis in the cytosol (glucose to two pyruvate, net 2 ATP and 2 NADH) through pyruvate entry and the pyruvate dehydrogenase complex to the eight intermediates of the TCA cycle in the matrix, with the NADH and FADH₂ node linked to the electron transport chain diagram and Complex I linking back. Adds 5 verified citations.
- Third diagram, `?diagram=apoptosis`: extrinsic (death ligand, receptor, FADD and the DISC, caspase-8) and intrinsic (stress, BH3-only proteins, BCL-2 family at the mitochondrion, MOMP, cytochrome c, apoptosome, caspase-9) apoptosis meeting at the executioner caspases. BCL-2, BCL-XL, MCL-1, BAX and BAK link to their Module B structures, and those structures link back. Adds 7 verified citations, an inhibition arrow type, and several `links` per node.
- Diagram menu above the viewport on every level, so each diagram opens in one click. Diagram labels now shrink to fit their box, arrowheads keep a fixed size, and arrows no longer cross parts in the electron transport chain.
- Second diagram, `?diagram=nutrient-absorption`: digestion and absorption of carbohydrate, protein and fat in the small intestine, from luminal enzymes and brush border enzymes through enterocyte transporters to the blood capillary (sugars and amino acids) or the lacteal (chylomicrons). It has 21 clickable parts, 8 verified citations, and a chip on the enterocyte card. The diagram legend is now set per diagram in `data/diagrams.json`.
- Diagram view (`?diagram=etc-pathway`) for the Diagram Workspace link: a clickable SVG of the electron transport chain (complexes I to IV, coenzyme Q, cytochrome c, ATP synthase, electron and proton flow) with a card and sources per part, opened from the `diag:etc-pathway` chip on PDB 5XTD. Adds `data/diagrams.json`, `js/diagram.js` and three verified citations.
- Epithelial overview model: lamina lucida, lamina densa, tight junction, adherens junction, desmosome, gap junction, hemidesmosome, stereocilia, cilia and microtubule as separate clickable parts. They replace the combined cell junction and basal lamina parts, and the apical part is now microvilli only. Connective tissue model: mast cell and mesenchymal stem cell (`data/tissues.json`, `js/tissue3d.js`). Reticular fibre and ground substance parts already existed and have longer descriptions. 13 verified review and primary papers (Scite check) are cited on 14 of these parts, and descriptions were trimmed to what the cited abstracts support.
- Tissue models for blood (plasma, red cells, five white cell types, platelets), white, brown and beige adipocytes, fibroblast and osteocyte, listed under connective tissue (`data/tissues.json`, `js/tissue3d.js`).
- BID, BIM, BIK and BOK in the Bcl-2 family table in Compare, with a new "BH3 peptide only" row. None has a Module B structure yet, so their headers are not links. BIK has no PDB entries and shows dashes for resolution and years.
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
