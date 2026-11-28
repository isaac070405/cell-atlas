// Module B viewer: Mol* loaded on first use, one viewer reused for every structure.
// Structures stream as binary CIF from RCSB (the deposited coordinates, so data/tour-points.json lines up).
const BASE = new URL('../vendor/molstar/', import.meta.url).href;
let viewerP = null, shown = null, ticket = 0, domainMap = false;

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
    if (domainMap) await applyLook(viewer, true);
  }
  if (point?.select) {
    viewer.structureInteractivity({
      elements: point.select, action: ['select', 'focus'],
      focusOptions: { minRadius: point.kind === 'rrna' ? 80 : point.kind === 'trna' ? 30 : 12, extraRadius: 4 },
    });
  } else {
    viewer.structureInteractivity({ action: ['select', 'highlight'] });
    viewer.plugin.managers.camera.reset();
  }
  return true;
}


// Domain map look (Maciag 2025, Fig. 1A style): one Gaussian surface per chain in chain colours,
// white background, black outlines, no ambient occlusion so the colours stay flat.
async function applyLook(viewer, on) {
  const { plugin } = viewer, mgr = plugin.managers.structure;
  const comps = mgr.hierarchy.current.structures.flatMap(s => s.components);
  if (comps.length) {
    await mgr.component.removeRepresentations?.(comps);
    await mgr.component.addRepresentation(comps, on ? 'gaussian-surface' : 'cartoon');
    await mgr.component.updateRepresentationsTheme(comps, { color: on ? 'chain-id' : 'default' });
  }
  plugin.canvas3d?.setProps({
    renderer: { backgroundColor: 0xffffff },
    postprocessing: on
      ? { occlusion: { name: 'off', params: {} }, outline: { name: 'on', params: { scale: 1, threshold: 0.33, color: 0x000000, includeTransparent: true } } }
      : { outline: { name: 'off', params: {} } },
  });
}

// Switch the domain map look on or off for the structure on screen, and for structures loaded later.
export async function setDomainMap(el, on) {
  domainMap = on;
  if (shown) await applyLook(await getViewer(el), on);
}
