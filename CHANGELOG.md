# Changelog

All notable changes to Cell Atlas are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The project has no version numbers yet, so entries are grouped by date. The `@isaac070405/cell-3d` package has its own version, 0.1.0.

Pull request numbers refer to https://github.com/isaac070405/cell-atlas/pull/.

## Unreleased

### Changed
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
