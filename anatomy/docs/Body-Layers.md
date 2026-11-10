# Body Layers

`layers.html` opens the explorer on the layers panel. A depth slider peels 14 layers from the outside in, and each layer has its own toggle.

| # | Layer |
|--:|---|
| 1 | Skin |
| 2 | Superficial veins |
| 3 | Investing fascia |
| 4 | Superficial muscles |
| 5 | Second muscle group |
| 6 | Intermediate muscles |
| 7 | Deep muscles |
| 8 | Deepest muscles |
| 9 | Visceral coverings |
| 10 | Anterior organs |
| 11 | Deep organs |
| 12 | Deep nerves and vessels |
| 13 | Capsules and ligaments |
| 14 | Bones and cartilage |

`layers.js` assigns each mesh to a layer by system and label (`layerOf`), following the reference list "Anatomical Structures Reordered by Layers". Structures the list does not name are placed by depth, so new structures land in a layer by name.

---
[← Interface](Interface) · [Explode mode →](Explode-Mode)
