// Module B viewer: Mol* loaded on first use, one viewer reused for every structure.
// Structures stream as binary CIF from RCSB (the deposited coordinates, so data/tour-points.json lines up).
const BASE = new URL('../vendor/molstar/', import.meta.url).href;
let viewerP = null, shown = null, ticket = 0, domainMap = false, eligible = true, looked = false, domains = null;

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
export async function showStructure(el, pdbId, point, ranges, large = true) {
  domains = ranges?.length ? ranges : null;
  eligible = large;
  const mine = ++ticket;
  const viewer = await getViewer(el);
  if (mine !== ticket) return false;
  if (shown !== pdbId) {
    shown = null;
    await viewer.plugin.clear();
    await viewer.loadStructureFromUrl(`https://models.rcsb.org/${pdbId}.bcif`, 'mmcif', true);
    if (mine !== ticket) return false;
    shown = pdbId;
    if ((domainMap && eligible) || looked) await applyLook(viewer, domainMap && eligible);
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


// Domain map look (Maciag 2025, Fig. 1A style), for large proteins only (data/catalog.json `domainMap: false` opts a small protein out): Gaussian surface, white background, black outlines, flat colours.
// With domain ranges (data/tour-points.json `domains`) each range is one surface in its colour and the rest is grey.
// Without them each chain gets its chain colour.
const hex = c => parseInt(c.replace('#', ''), 16);
const GREY = 0x9AA0A6;
const inRange = d => `(and (= atom.auth_asym_id ${d.chain}) (>= atom.auth_seq_id ${d.first}) (<= atom.auth_seq_id ${d.last}))`;
const select = test => ({ language: 'mol-script', expression: `(sel.atom.atom-groups :residue-test ${test})` });

async function addSurface(plugin, structRef, label, script, color) {
  const { StateTransforms } = window.molstar.lib.plugin;
  const b = plugin.state.data.build();
  b.to(structRef).apply(StateTransforms.Model.StructureSelectionFromScript, { script, label }, { tags: ['domain-map'] })
    .apply(StateTransforms.Representation.StructureRepresentation3D, {
      type: { name: 'gaussian-surface', params: {} },
      colorTheme: color == null ? { name: 'chain-id', params: {} } : { name: 'uniform', params: { value: color } },
      sizeTheme: { name: 'physical', params: {} },
    });
  await b.commit();
}

async function clearDomainParts(plugin) {
  const tagged = plugin.state.data.selectQ(q => q.root.subtree().filter(c => c.transform.tags?.includes('domain-map')));
  if (!tagged.length) return;
  const b = plugin.state.data.build();
  tagged.forEach(c => b.delete(c.transform.ref));
  await b.commit();
}

async function applyLook(viewer, on) {
  looked = on;
  const { plugin } = viewer, mgr = plugin.managers.structure;
  await clearDomainParts(plugin);
  const structure = mgr.hierarchy.current.structures[0];
  if (structure) {
    const comps = structure.components.filter(c => !c.cell.transform.tags?.includes('domain-map'));
    if (on) {
      await mgr.component.removeRepresentations?.(comps);
      const ref = structure.cell.transform.ref;
      if (domains?.length) {
        for (const d of domains) await addSurface(plugin, ref, d.label.en, select(inRange(d)), hex(d.color));
        await addSurface(plugin, ref, 'Other residues', select(`(not (or ${domains.map(inRange).join(' ')}))`), GREY);
      } else {
        await addSurface(plugin, ref, 'Chains', select('(= 1 1)'), null);
      }
    } else {
      await mgr.component.addRepresentation(comps, 'cartoon');
    }
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
  if (shown && eligible) await applyLook(await getViewer(el), on);
}
