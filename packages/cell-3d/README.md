# @isaac070405/cell-3d

Procedural 3D cell. Each compartment becomes capsules or an ellipsoid whose volumes sum to the published volume fraction of the cell.

## Install

Add to the host repo's `.npmrc`, then install:

```
@isaac070405:registry=https://npm.pkg.github.com
```

```bash
npm install @isaac070405/cell-3d three
```

GitHub Packages needs a token with `read:packages` even for reading (`//npm.pkg.github.com/:_authToken=...`).

## Use

```js
import { buildModel, createCellView } from '@isaac070405/cell-3d';

const catalog = await (await fetch('/data/catalog.json')).json();
const cell = catalog.cells.find(c => c.id === 'hepatocyte');

const view = await createCellView(document.getElementById('host'), {
  onPick: org => view.select(org),
  membraneColor: '#A9A393',
  selectColor: '#B8336A',
});
view.show(buildModel(cell), { nucleus: '#4C6EF5', mito: '#E8590C' }); // org id to colour
view.setClip(40); // 0 = whole cell, 100 = cut through
view.attachSlice(document.getElementById('slice')); // cross-section map in a canvas, follows setClip
view.setClip(40, false); // move the cross-section without cutting the 3D cell
view.legend(); // [{ org, color }] for the compartments in the model
```

`buildModel` is pure maths and runs in Node. A `cell` is `{ id, fractions: [{ org, value }] }` where `value` is a percent or a `[lo, hi]` range.

## Options for `createCellView`

| Option | Default | Effect |
| --- | --- | --- |
| `onPick(org)` | no-op | Called on click with the compartment id, or `null` |
| `membraneColor` | `#A9A393` | Cell outline colour |
| `selectColor` | `#B8336A` | Highlight for the selected compartment |
| `fallbackColor` | `#A9A393` | Colour for a compartment missing from the map |
| `THREE`, `OrbitControls` | imported | Supply your own Three.js copy |

The view needs WebGL and a browser. Compartment ids: nucleus, perinuclear, mito, er-rough, er-smooth, golgi, perox, lyso, endo, sr, myofibril, chloro-stroma, vacuole.
