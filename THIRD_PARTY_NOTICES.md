# Third-party notices

The root `LICENSE` (MIT) covers the code and data written for this repository. The items below keep their own terms.

## Libraries copied into the repository

| Item | Path | Version | Licence | Source |
| --- | --- | --- | --- | --- |
| Three.js | `vendor/three/` | r187 | MIT | https://github.com/mrdoob/three.js |
| Three.js (for the anatomy model) | `anatomy/vendor/three/` | r184 | MIT | https://github.com/mrdoob/three.js |
| Mol* | `vendor/molstar/` | 5.13.1 | MIT | https://github.com/molstar/molstar |

The Three.js licence text is in `anatomy/vendor/three/LICENSE`. `vendor/three/` has no licence file of its own.

## Models and data in `anatomy/`

| Item | Path | Terms |
| --- | --- | --- |
| Eye mesh, derived from feelpp/mesh.eye v1.1 (Zenodo 10.5281/zenodo.15630998) | `anatomy/assets/eye.glb` | GPL-3.0-only. Not covered by the MIT licence. |
| Brain mesh and volume, derived from the MNI T1 template | `anatomy/assets/mni_brain*` | Licence not checked. |

See `anatomy/NOTICE.md` for the origin of the rest of the 3D Anatomy Model, which is copied from https://github.com/isaac070405/3D-Anatomy-Model.

## Structure data loaded at view time

Experimental structures (PDB and EMDB entries such as 5XTD and 4UG0) load from RCSB when a page is viewed. The archives' own terms apply, and each entry is cited in `data/citations.json`.

## Open items

- Decide whether `eye.glb` can stay in an MIT repository, or replace it with a file under a compatible licence.
- Check the MNI template licence.
- Add the Three.js licence text to `vendor/three/`.
