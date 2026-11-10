# Modelling Notes

- Organ sizes run about 60–80% of textbook measurements so neighbouring structures fit without overlap.
- Vessels that join major trunks (renal, testicular, gut arteries) belong to Circulatory so connections stay intact when systems are hidden.
- Translucent walls (kidney cortex, stomach, bladder, prostate, scrotum) expose internal structure; subsurface effects are approximated with sheen and clearcoat.
- Fine surface textures (gastric pits, filiform papillae, skin micro-rugae) are omitted because textures don't survive OBJ export.
- A small disclaimer under the page lede links to `known-limitations.html`, which lists the areas that are approximate, thin or missing.
- Reproductive system has male and female variants, switched with the Sex control; penis shown flaccid.
- The female body mesh (`uploads/Female_Muscular_BaseMesh`) is not in the repository. Without it the generic body surface stays on, minus the male genitalia, and the female structures still show.
- The menstrual cycle slider (day 1 to 28) changes endometrial thickness, the dominant follicle on the right ovary, the released oocyte on day 14 and the corpus luteum in the luteal phase.

---
[← Anatomy review additions](Anatomy-Review-Additions) · [Home](Home)

## Eye meshes

The eyeball (sclera, choroid, retina, vitreous body, cornea, iris and ciliary body, lens, suspensory ligament) uses meshes from feelpp/mesh.eye v1.1 (Zenodo 10.5281/zenodo.15630998, GPL-3.0-only; Chabannes, Prud'homme, Saigre, Sala, Szopos, Trophime). They load from `assets/eye.glb`, scaled to the sclera radius of the model, and the left eye is mirrored for the right. Solid names were matched from geometry (`scripts/eye_names.json`). The two retinal vessels in the source are not shown.

## Brain from the MNI template

The cerebral cortex, cerebral white matter and cerebellum come from the skull-stripped T1 MNI template (`tpl-mni_T1w`). `scripts/mni_brain_to_glb.py` thresholds grey and white matter with multi-Otsu, cuts the cerebellum and brainstem with landmark planes and an ellipsoid fitted by eye to this template, and writes `assets/mni_brain.glb`, fitted to the model's head size. The cerebellum edges and the cut below the temporal lobes are approximate, because the template has no atlas labels. Lobes, gyri and sulcus lines are gone, since they cannot be cut from an unlabelled volume. The brainstem, deep nuclei and ventricles are still the procedural parts. If the GLB is missing, the procedural cortex is used.

The brain axial series now shows the template's own 1 mm T1 slices (`assets/mni_brain_t1.bin`, 3.5 MB, with `mni_brain_t1.json` for the voxel to metre mapping), lined up with the 3D brain. It has no structure labels or lobe colours, and the Atlas button is hidden, because the template carries no labels. If the volume or the brain GLB is missing, the old procedural series is used.
