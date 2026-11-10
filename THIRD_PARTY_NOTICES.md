# Third-party notices

The root `LICENSE` (MIT) covers the code and data written for this repository. The items below keep their own terms.

## Libraries copied into the repository

| Item | Path | Version | Licence | Source |
| --- | --- | --- | --- | --- |
| Three.js | `vendor/three/` | r187 | MIT | https://github.com/mrdoob/three.js |
| Three.js (for the anatomy model) | `anatomy/vendor/three/` | r184 | MIT | https://github.com/mrdoob/three.js |
| Mol* | `vendor/molstar/` | 5.13.1 | MIT | https://github.com/molstar/molstar |

The Three.js licence text is in `vendor/three/LICENSE` and `anatomy/vendor/three/LICENSE`.

## Models and data in `anatomy/`

| Item | Path | Terms |
| --- | --- | --- |
| Brain mesh and volume, derived from the MNI T1 template | `anatomy/assets/mni_brain*` | Licence not confirmed. The file name `tpl-mni_T1w` does not say which MNI release was used. TemplateFlow's MNI152NLin2009cAsym metadata says "See LICENSE file", so the terms sit in that repository's LICENSE file. |

Removed: `anatomy/assets/eye.glb`, derived from feelpp/mesh.eye v1.1 (GPL-3.0-only). The page draws the procedural eye instead. The file stays in git history before the commit that removed it.

See `anatomy/NOTICE.md` for the origin of the rest of the 3D Anatomy Model, which is copied from https://github.com/isaac070405/3D-Anatomy-Model.

## Structure data loaded at view time

Experimental structures (PDB and EMDB entries such as 5XTD and 4UG0) load from RCSB when a page is viewed. The archives' own terms apply, and each entry is cited in `data/citations.json`.

## Open items

- Find an eye mesh under a compatible licence (CC0, CC BY or MIT) and add it as `anatomy/assets/eye.glb`. The loader picks it up with no code change.
- Confirm which MNI template release `mni_brain*` came from, read its LICENSE file, and record the notice it requires.
