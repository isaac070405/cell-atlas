# Contributing to Cell Atlas

Thank you for helping. This guide covers setup, the data rules and the pull request steps.

## Set up

The site is static. No build step is needed.

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

The page fetches JSON, so opening `index.html` from disk does not work. Node 18 or later runs the checks.

## Before you open a pull request

```bash
node scripts/check-data.mjs
(cd packages/cell-3d && npm test)
```

`check-data.mjs` fails when a citation does not resolve, a citation is `pending`, or a model volume differs from the data table by more than 2 percentage points.

## Data rules

- Every number on screen needs an entry in `data/citations.json` with `source`, `detail` and a `status` of `verified` or `pending`.
- Set `verified` only after reading the cited paper or database record. The check script fails on `pending`.
- Give species, cell type and method for each value.
- Cell models are schematic. Molecular models are experimental PDB or EMDB structures. Never add AI predicted structures.
- Tour points in `data/tour-points.json` carry a `basis` of `computed` or `literature`.

## Text and language

- All interface text lives in `data/i18n.json` with an `en` and a `zh-Hant` string. Do not hard code text in `index.html` or `js/`.
- Write Traditional Chinese (繁體中文), not Simplified.
- Links between items go in `data/links.json` using the existing keys (`anat:`, `tis:`, `cell:`, `pdb:`, `spec:`, `diag:`, `ent:`).

## Code

- Use plain ES modules. Do not add a bundler.
- Colours come from `css/tokens.css`. Add a token before using a new colour, with a dark mode value.
- Keep controls keyboard reachable and labelled (see `ACCESSIBILITY.md`).
- Libraries in `vendor/` and `anatomy/vendor/` are self-hosted builds. Update them by replacing the whole build and noting the version in the README.

## Pull requests

1. Branch from `main` and keep one topic per pull request.
2. Run the checks above and state the result in the description.
3. Update the README when a change adds a feature, file or data item.
4. Report vulnerabilities through `SECURITY.md`, not in a pull request.

By contributing, you agree that your code is released under the MIT License (see `LICENSE`).
