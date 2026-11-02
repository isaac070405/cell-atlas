// Module B: Mol* viewer. Loaded only when someone opens a structure, so the 5 MB
// library never slows the first page load. Version is pinned so the browser caches it.
import { claim, release } from './gl.js';

const MOLSTAR = 'vendor/molstar-5.13.1';
const BIG = new Set(['4UG0']);          // ribosome: 218,776 atoms, cartoon only
const phone = () => matchMedia('(max-width: 760px)').matches;

let loading = null;   // promise of window.molstar
let viewer = null;    // one Viewer, reused between structures
let shown = null;     // id currently in the viewer

export function loadMolstar() {
  if (window.molstar) return Promise.resolve(window.molstar);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = `${MOLSTAR}/molstar.css`;
    document.head.append(css);
    const js = document.createElement('script');
    js.src = `${MOLSTAR}/molstar.js`;
    js.onload = () => resolve(window.molstar);
    js.onerror = () => { loading = null; reject(new Error('Mol* failed to load')); };
    document.head.append(js);
  });
  return loading;
}

// Repo copy first (data/structures/<id>.bcif, then .cif); RCSB ModelServer as fallback.
async function source(id) {
  const lower = id.toLowerCase();
  for (const [ext, isBinary] of [['bcif', true], ['cif', false]]) {
    const url = `data/structures/${lower}.${ext}`;
    try { if ((await fetch(url, { method: 'HEAD' })).ok) return { url, isBinary, from: 'repo' }; } catch {}
  }
  return { url: `https://models.rcsb.org/v1/${lower}/full?encoding=bcif`, isBinary: true, from: 'rcsb' };
}

async function ensureViewer(el) {
  if (viewer) return viewer;
  const molstar = await loadMolstar();
  el.innerHTML = '';
  viewer = await molstar.Viewer.create(el, {
    layoutIsExpanded: false, layoutShowControls: false, layoutShowRemoteState: false,
    layoutShowSequence: false, layoutShowLog: false, layoutShowLeftPanel: false,
    viewportShowExpand: true, viewportShowSelectionMode: false, viewportShowAnimation: false,
    collapseLeftPanel: true, pdbProvider: 'rcsb', emdbProvider: 'rcsb',
  });
  shown = null;
  claim('molstar', disposeViewer);
  return viewer;
}

function disposeViewer() {
  try { viewer?.plugin.dispose(); } catch {}
  viewer = null; shown = null;
}
export const closeViewer = () => release('molstar');

// Show one structure. Returns { from, preset } or throws.
export async function showStructure(el, id) {
  const v = await ensureViewer(el);
  if (shown === id) return { from: 'cached', preset: null };
  const plugin = v.plugin;
  matchTheme(plugin);
  await plugin.clear();
  const src = await source(id);
  const data = await plugin.builders.data.download({ url: src.url, isBinary: src.isBinary, label: id }, { state: { isGhost: true } });
  const traj = await plugin.builders.structure.parseTrajectory(data, 'mmcif');
  const preset = BIG.has(id) || phone() ? 'polymer-cartoon' : 'auto';
  await plugin.builders.structure.hierarchy.applyPreset(traj, 'default', { representationPreset: preset });
  shown = id;
  return { from: src.from, preset };
}

// Canvas background follows the page paper colour, so dark mode stays dark.
function matchTheme(plugin) {
  const hex = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim().replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(hex)) return;
  plugin.canvas3d?.setProps({ renderer: { backgroundColor: parseInt(hex, 16) } });
}
export function refreshTheme() { if (viewer) matchTheme(viewer.plugin); }

// Tour stop: parts match entities by description (regex) and optionally residue numbers
// (auth_seq_id) or component ids (ligands such as FMN). Description matching avoids
// hard-coding chain letters, which differ between file formats.
export function focusStop(stop) {
  if (!viewer) return 0;
  const { Queries, StructureSelection, StructureProperties: P, QueryContext, StructureElement } = window.molstar.lib.structure;
  const s = viewer.plugin.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
  if (!s) return 0;
  const queries = stop.parts.map(part => {
    const re = part.entity ? new RegExp(part.entity, 'i') : null;
    const res = part.residues ? new Set(part.residues) : null;
    const comp = part.comp ? new Set(part.comp) : null;
    return Queries.generators.atoms({
      entityTest: re ? ctx => re.test(String(P.entity.pdbx_description(ctx.element))) : undefined,
      residueTest: res || comp ? ctx => (!res || res.has(P.residue.auth_seq_id(ctx.element)))
        && (!comp || comp.has(P.atom.label_comp_id(ctx.element))) : undefined,
    });
  });
  const query = queries.length > 1 ? Queries.combinators.merge(queries) : queries[0];
  const loci = StructureSelection.toLociWithSourceUnits(query(new QueryContext(s)));
  const n = StructureElement.Loci.size(loci);
  if (!n) return 0;
  const m = viewer.plugin.managers;
  m.interactivity.lociSelects.selectOnly({ loci });
  m.structure.focus.setFromLoci(loci);
  m.camera.focusLoci(loci);
  return n;
}

export function resetView() {
  if (!viewer) return;
  const m = viewer.plugin.managers;
  m.interactivity.lociSelects.deselectAll();
  m.structure.focus.clear();
  m.camera.reset();
}
