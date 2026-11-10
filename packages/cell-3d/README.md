# @isaac070405/cell-3d

Procedural 3D cell. Each compartment becomes capsules or an ellipsoid whose volumes sum to the published volume fraction of the cell.

## Install

GitHub Packages serves npm packages only with a token, even for public packages. Setup takes four steps, tested with npm 10 and Node 22.

1. Create a classic personal access token at https://github.com/settings/tokens with the `read:packages` scope only.
2. Store the token outside the repo, in your user-level `~/.npmrc`:

   ```
   //npm.pkg.github.com/:_authToken=YOUR_TOKEN
   ```

3. Point the `@isaac070405` scope at GitHub Packages in the host repo's `.npmrc`, which is safe to commit because it holds no token:

   ```
   @isaac070405:registry=https://npm.pkg.github.com
   ```

4. Install the package and its peer dependency:

   ```bash
   npm install @isaac070405/cell-3d three
   ```

For CI, set the token as a secret and write the auth line in a step before `npm ci`:

```bash
echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> ~/.npmrc
```

Inside GitHub Actions in the same account, `secrets.GITHUB_TOKEN` works as `NPM_TOKEN` when the job has `packages: read`.

### Check the install

```bash
node --input-type=module -e "import { buildModel } from '@isaac070405/cell-3d'; console.log(typeof buildModel)"
```

The command prints `function`.

### Troubleshooting

- `401 Unauthorized`: the token is missing, expired or lacks `read:packages`. Check `~/.npmrc`.
- `404 Not Found`: the `@isaac070405:registry` line is missing, so npm asks npmjs.org. Add it to the host repo's `.npmrc`.
- `E403`: the token owner has no access to the repository's package. Ask the owner to grant read access.

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
