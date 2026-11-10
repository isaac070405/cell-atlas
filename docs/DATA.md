# Data files

All site data is JSON in `data/`. The site fetches the files at load, and `node scripts/check-data.mjs` checks them. Interface text is separate and lives in `data/i18n.json`.

Names and long text use an object with `en` and `zh-Hant` keys. Write Traditional Chinese.

## `catalog.json`

| Key | Holds |
| --- | --- |
| `compartments` | One entry per organelle: `id`, colour `token` (a CSS variable from `css/tokens.css`), `name`, and `sizes[]` with a `cite` and a `text` |
| `compareRows`, `compareColumns`, `muscleTypes` | Layout of the compare view |
| `cells` | Six cells: `id`, `kind` (`animal`, `plant`, `bacterial`, `virus`), `name`, `release`, `species`, `basis`, `data` (a citation id), `fractions[]` |
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

## `tour-points.json`

Preset views for Module B, keyed by PDB ID. Each point has `id`, `label`, `kind`, `comp`, `chain`, `subunit`, `xyz` (Å in the deposited frame, model 1), `basis` and `select` (a Mol* locus). `basis` is `computed` (read from deposited coordinates) or `literature` (stated in the cited paper). Each structure carries a `cite`.

## `anatomy.json` and `tissues.json`

`anatomy.json` classifies the 3D Anatomy Model levels: `systems[]` with the model's system `keys` (`null` shows the whole body) and `match` patterns tested against part labels. `tissues.json` holds four schematic tissues. They carry no measured values and follow textbook figures.

## Adding a value

1. Add or find the source in `citations.json`, read it, and set `verified`.
2. Add the value with its `cite`, species and method.
3. Add `en` and `zh-Hant` text.
4. Run `node scripts/check-data.mjs`.
