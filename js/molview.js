// Module B viewer: Mol* loaded on first use, one viewer reused for every structure.
// Structures stream as binary CIF from RCSB (the deposited coordinates, so data/tour-points.json lines up).
const BASE = new URL('../vendor/molstar/', import.meta.url).href;
let viewerP = null, shown = null, ticket = 0;

function loadAssets() {
  const css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = BASE + 'molstar.css';
  document.head.append(css);
  return new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = BASE + 'molstar.js'; s.onload = ok; s.onerror = () => fail(new Error('Mol* bundle failed to load'));
    document.head.append(s);
  });
}

function getViewer(el) {
  viewerP ??= loadAssets().then(() => window.molstar.Viewer.create(el, {
    layoutIsExpanded: false, layoutShowControls: false, layoutShowRemoteState: false, layoutShowSequence: false,
    layoutShowLog: false, layoutShowLeftPanel: false, viewportShowExpand: false, viewportShowSelectionMode: false,
    viewportShowAnimation: false, pdbProvider: 'rcsb', emdbProvider: 'rcsb',
  })).catch(e => { viewerP = null; throw e; });
  return viewerP;
}

// Show one structure and, if given, select and focus one tour point. Resolves false when a newer call replaced this one.
export async function showStructure(el, pdbId, point) {
  const mine = ++ticket;
  const viewer = await getViewer(el);
  if (mine !== ticket) return false;
  if (shown !== pdbId) {
    shown = null;
    await viewer.plugin.clear();
    await viewer.loadStructureFromUrl(`https://models.rcsb.org/${pdbId}.bcif`, 'mmcif', true);
    if (mine !== ticket) return false;
    shown = pdbId;
  }
  if (point?.select) {
    viewer.structureInteractivity({
      elements: point.select, action: ['select', 'focus'],
      focusOptions: { minRadius: point.kind === 'trna' ? 30 : 12, extraRadius: 4 },
    });
  } else {
    viewer.structureInteractivity({ action: ['select', 'highlight'] });
    viewer.plugin.managers.camera.reset();
  }
  return true;
}

