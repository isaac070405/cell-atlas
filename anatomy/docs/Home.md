# Anatomical Planes 3D Model

Interactive three.js model of the human body. Systems can be toggled, parts searched and selected, layers peeled, regions dissected, and any plane cut as a live cross-section. Exports OBJ + MTL and GLB.

> [!NOTE]
> The model is approximate. See `known-limitations.html` for thin, approximate or missing areas.

## Contents

- [Interface](Interface): sidebar, preset views, cross-section panel
- [Body Layers](Body-Layers): 14 layers from skin to bone
- [Explode Mode](Explode-Mode): assemble and explode views, selection tab
- [Anatomy Review Additions](Anatomy-Review-Additions)
- [Modelling Notes](Modelling-Notes)

## Systems

971 parts across 13 systems, from the sidebar lists in `anatomy-part1.js`, `anatomy-part2.js` and `anatomy-extras.js`, checked against the structures built in the model. Left and right copies count once.

| System | Parts |
|---|--:|
| [Skin](System-Skin) | 8 |
| [Subcutaneous fat](System-Subcutaneous-fat) | 1 |
| [Skeletal](System-Skeletal) | 115 |
| [Muscular](System-Muscular) | 156 |
| [Circulatory](System-Circulatory) | 186 |
| [Respiratory](System-Respiratory) | 64 |
| [Digestive](System-Digestive) | 121 |
| [Urinary](System-Urinary) | 29 |
| [Reproductive (male)](System-Reproductive-male) | 67 |
| [Reproductive (female) and breast](System-Reproductive-female-and-breast) | 35 |
| [Eye and ear](System-Eye-and-ear) | 25 |
| [Endocrine (thyroid, parathyroid, thymus)](System-Endocrine-thyroid-parathyroid-thymus) | 7 |
| [Nervous](System-Nervous) | 131 |
| **Total** | **971** |
