# Data files

All site data is JSON in `data/`. The site fetches the files at load, and `node scripts/check-data.mjs` checks them. Interface text is separate and lives in `data/i18n.json`.

Names and long text use an object with `en` and `zh-Hant` keys. Write Traditional Chinese.

## `catalog.json`

| Key | Holds |
| --- | --- |
| `compartments` | One entry per organelle: `id`, colour `token` (a CSS variable from `css/tokens.css`), `name`, and `sizes[]` with a `cite` and a `text` |
| `compareRows`, `compareColumns`, `muscleTypes` | Layout of the compare view |
| `cells` | Eight cells (six with volume fractions, plus E. coli and bacteriophage T4 as schematic models): `id`, `kind` (`animal`, `plant`, `bacterial`, `virus`), `name`, `release`, `species`, `basis`, `data` (a citation id), `fractions[]` |
| `structures` | Molecular structures: `id` (PDB ID), `name`, `method`, `from`, `release`, `cite` |

Rules for `fractions[]`:
- `value` is a percentage, or a range `[low, high]`.
- `basis: "cell"` means the denominator is whole cell volume.
- `approx` marks a value the paper gives as "about".
- `negligible` marks a compartment too small to report.
- Every cell points to a citation, and `check-data.mjs` fails if a model volume differs from the table by more than 2 percentage points.

## `citations.json`

One object per source, keyed by id (for example `guo-2017`). Fields: `source`, `detail` (`en`, `zh-Hant`), `species`, `method`, `year`, `url`, `status`.

`status` is `verified` or `pending`. Set `verified` only after reading the source. The check script fails on `pending`. Every number on screen must resolve to an id here.

## `links.json`

`targets` maps a prefix to a label and a URL template where `{id}` is the part after the colon. Prefixes: `anat`, `tis`, `cell`, `pdb`, `spec`, `diag`, `ent`. `edges` lists one-way links such as `cell:hepatocyte` to `pdb:5XTD`. The site shows the reverse direction under "Linked from".

## `protein-location.json`

Human Protein Atlas subcellular location for the genes of the Module B structures. `genes` is keyed by gene symbol. Each entry has `source` (`hpa` or `uniprot`), `structure` (PDB ID, or `candidate`), `reliability` (HPA: Enhanced, Supported, Approved, Uncertain; UniProt: Experimental, Annotated), `ensembl` or `accession`, `main[]`, `additional[]` and `go[]`. Rebuild with `python3 scripts/build-protein-location.py <export>`. 19 genes missing from the export (ALDH2, HMGCR, LCT, UCP1, ATP4A, NDUFS7, ATP5 and NUP subunits) come from UniProt, so the build needs network access to rest.uniprot.org. UniProt location names differ from HPA names. CC BY-SA 4.0, see `THIRD_PARTY_NOTICES.md`.

## `tour-points.json`

Preset views for Module B (5XTD, 4UG0, 1TQN, 1ZUM), keyed by PDB ID. Each point has `id`, `label`, `kind`, `comp`, `chain`, `subunit`, `xyz` (Å in the deposited frame, model 1), `basis` and `select` (a Mol* locus). `basis` is `computed` (read from deposited coordinates) or `literature` (stated in the cited paper). Each structure carries a `cite`.

## `organelles.json` and `atoms.json`

`organelles.json` holds 10 schematic organelle models (mitochondrion, nucleus, rough ER, Golgi apparatus, lysosome, peroxisome, microfilament, intermediate filament, microtubule, centrosome). Each has clickable parts whose sizes and function text point to a compartment in `catalog.json`. `atoms.json` holds 10 ball-and-stick models and the element radii table (Cordero 2008 covalent, Bondi 1964 van der Waals). Computed conformers (ETKDG, MMFF94) are marked as such and are not experimental structures.

## `anatomy.json` and `tissues.json`

`anatomy.json` classifies the 3D Anatomy Model levels: `systems[]` with the model's system `keys` (`null` shows the whole body) and `match` patterns tested against part labels. `tissues.json` holds 21 schematic tissue models (epithelial, connective, muscular, nervous, neuroglia and neurons) and the `cellModels` for E. coli and bacteriophage T4. They carry no measured values and follow textbook figures.

## Adding a value

1. Add or find the source in `citations.json`, read it, and set `verified`.
2. Add the value with its `cite`, species and method.
3. Add `en` and `zh-Hant` text.
4. Run `node scripts/check-data.mjs`.
