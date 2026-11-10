import { readUrl, setState, onChange, getState, levelInfo } from './state.js';
import { loadStrings, setLang, getLang, applyStatic, html, text, esc } from './i18n.js';
import { buildRuler, renderRuler } from './ruler.js';
import { initCompare, renderCompare, renderChart, columnCells, resolve, valueText, comp } from './compare.js';
import { buildModel, crowded } from './cellmodel.js';
import { showStructure } from './molview.js';

const load = p => fetch(p).then(r => r.json());
const [catalog, { citations }, links, tours, anatomy, tissues, organelles, atoms] = await Promise.all([
  load('data/catalog.json'), load('data/citations.json'), load('data/links.json'), load('data/tour-points.json'), load('data/anatomy.json'), load('data/tissues.json'), load('data/organelles.json'), load('data/atoms.json'),
]);
const $ = id => document.getElementById(id);
// Cell types: colour is the --kind-* token, group is the domain-level class
const KINDS = [
  { id: 'animal', hex: '#C62828', group: 'eukaryote' }, { id: 'plant', hex: '#2E7D32', group: 'eukaryote' }, { id: 'fungal', hex: '#795548', group: 'eukaryote' }, { id: 'protist', hex: '#FFB300', group: 'eukaryote' },
  { id: 'bacterial', hex: '#00ACC1', group: 'prokaryote' }, { id: 'archaeal', hex: '#E64A19', group: 'prokaryote' }, { id: 'virus', hex: '#8E24AA', group: 'noncellular' },
];
const GROUPS = ['noncellular', 'prokaryote', 'eukaryote'];
const kindLegend = () => `<h4>${html('legend.title')}</h4>` + GROUPS.map(g => `<div class="kl-group"><span>${html('group.' + g)}</span>${KINDS.filter(k => k.group === g).map(k => `<span class="kl-item" style="--k:var(--kind-${k.id})"><span class="sw"></span>${html('kind.' + k.id)}</span>`).join('')}</div>`).join('');
initCompare(catalog);

// Theme: follows the system until the person picks one
const THEME = 'hb.theme';
try { const t = localStorage.getItem(THEME); if (t) document.documentElement.dataset.theme = t; } catch {}
$('theme-btn').addEventListener('click', () => {
  const dark = getComputedStyle(document.documentElement).colorScheme === 'dark';
  const next = dark ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem(THEME, next); } catch {}
});

// Language
setLang(await loadStrings());
document.querySelectorAll('[data-lang-set]').forEach(b => b.addEventListener('click', () => {
  setLang(b.dataset.langSet);
  render(getState());
}));

buildRuler();
onChange(render);

$('tour-bar').addEventListener('click', e => {
  const b = e.target.closest('button[data-tour]');
  if (b) setState({ tour: b.dataset.tour || null });
});

$('vp-queue').addEventListener('click', e => {
  const b = e.target.closest('button[data-kind]');
  if (!b) return;
  if (b.dataset.kind === 'tpart') return setState({ selection: getState().selection === b.dataset.id ? null : b.dataset.id });
  if (b.dataset.kind === 'part') return setState({ anat: getState().anat === b.dataset.id ? null : b.dataset.id });
  setState(b.dataset.kind === 'cell' ? { cell: b.dataset.id, pdb: null } : { pdb: b.dataset.id });
});
$('chart-body').addEventListener('click', e => {
  const b = e.target.closest('button[data-kind="tpart"]');
  if (b) setState({ selection: getState().selection === b.dataset.id ? null : b.dataset.id });
});
$('vp-switch').addEventListener('click', e => {
  const b = e.target.closest('button[data-view]');
  if (b) setState({ view: b.dataset.view });
});
$('vp-compare').addEventListener('click', e => {
  const m = e.target.closest('button[data-muscle]');
  if (m) {
    const s = getState();
    // Keep the muscle column selected when it was the selected cell
    const wasMuscle = catalog.muscleTypes.includes(s.cell);
    return setState({ muscle: m.dataset.muscle, ...(wasMuscle ? { cell: m.dataset.muscle } : {}) });
  }
  const c = e.target.closest('button[data-cell]');
  if (c) return setState({ cell: c.dataset.cell, pdb: null });
});
// Card and compare chips that point inside this site change state instead of reloading
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-pdb], a[data-cell], a[data-anat]');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  if (a.dataset.anat) return setState({ level: 'organ', anat: a.dataset.anat });
  setState(a.dataset.pdb ? { pdb: a.dataset.pdb } : { cell: a.dataset.cell, pdb: null });
});

// 3D cell: Three.js loads the first time a cell is shown
let view = null, viewFailed = false, shown = null;
const orgColours = () => Object.fromEntries(catalog.compartments.map(c => [c.id, getComputedStyle(document.documentElement).getPropertyValue(c.token).trim()]));
async function sync3d(cell, selection) {
  const vp = $('vp-cell');
  if (viewFailed) return;
  try {
    if (!view) {
      $('cell3d-note').textContent = text('cell3d.loading');
      const { createCellView } = await import('./cell3d.js');
      const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
      view = await createCellView($('cell3d'), { membraneColor: css('--org-cytosol') || undefined, selectColor: css('--select') || undefined, onPick: org => setState({ selection: org === getState().selection ? null : org }) });
      view.attachSlice($('xsec-canvas'), { background: css('--paper-raised') || undefined });
      const cutNow = () => view.setClip(+$('cut').value, $('xsec-3d').checked);
      $('cut').addEventListener('input', cutNow);
      $('xsec-3d').addEventListener('change', cutNow);
      $('cell-reset').addEventListener('click', () => { shown = null; $('cut').value = 50; $('xsec-3d').checked = true; sync3d(catalog.cells.find(c => c.id === getState().cell), getState().selection); });
    }
    if (shown !== cell.id) {
      const m = buildModel(cell);
      const warn = crowded(m);
      view.show(m, orgColours());
      $('cut').value = 50;
      view.setClip(50, $('xsec-3d').checked);
      $('xsec-legend').innerHTML = view.legend().map(l => `<li><span class="sw" style="background:${l.color}"></span><span>${html(comp(l.org)?.name ?? l.org)}</span></li>`).join('');
      $('cell3d-note').innerHTML = `${html('cell3d.hint')}${warn.length ? `<br>${html('cell3d.crowded')}` : ''}`;
      shown = cell.id;
    }
    view.select(selection && cell.fractions?.some(f => f.org === selection || comp(f.org)?.members?.includes(selection)) ? selection : null);
  } catch (err) {
    viewFailed = true;
    console.warn('3D cell unavailable', err);
    $('cell3d').hidden = true; $('cell3d-note').innerHTML = html('cell3d.nowebgl');
  }
}

// System and organ levels: the picker sets s.anat; the model shows only that system or organ.
// Tissue level: the picker sets s.anat to a tissue id and s.selection to a part of it; js/tissue3d.js draws it.
const partsFor = level => level === 'system' ? anatomy.systems : level === 'organ' ? anatomy.organs : level === 'tissue' ? tissues.tissues : level === 'organelle' ? organelles.models : level === 'atom' ? atoms.models : [];
let modelReady = false, lastShow = null;
addEventListener('message', e => {
  if (e.origin === location.origin && e.data?.type === 'embed-ready') { modelReady = true; if (lastShow) $('vp-anatomy').contentWindow.postMessage(lastShow, location.origin); }
});
$('vp-anatomy').addEventListener('load', () => { modelReady = false; });
function showInModel(s) {
  const part = partsFor(s.level).find(p => p.id === s.anat);
  // Body level: the whole body with every original panel. System or organ with nothing picked: the whole body, panels hidden.
  const msg = s.level === 'body' ? { type: 'show', systems: null, match: null, mode: 'body' }
    : !part ? { type: 'show', systems: null, match: null, mode: 'system' }
    : s.level === 'system' ? { type: 'show', systems: part.keys, match: null, mode: 'system' }
    : { type: 'show', systems: part.keys, match: part.match, mode: 'organ', frame: part.frame ?? null };
  if (JSON.stringify(msg) === JSON.stringify(lastShow)) return;
  lastShow = msg;
  if (modelReady) $('vp-anatomy').contentWindow.postMessage(msg, location.origin);
}

// Tissue view: schematic models drawn in js/tissue3d.js from textbook-style figures. No measured values.
const tissueOf = s => ['tissue', 'organelle', 'atom'].includes(s.level) ? partsFor(s.level).find(t => t.id === s.anat) ?? null : null;
// Schematic cells (no volume data, e.g. the bacterial cell) use the same viewer, parts list and card as tissues
const schematicOf = (s, cell) => levelInfo(s.level).module === 'A' && s.view !== 'compare' && cell?.schematic ? tissues.cellModels.find(m => m.id === cell.id) : null;
const modelOf = (s, cell) => tissueOf(s) ?? schematicOf(s, cell);
let tview = null, tshown = null, tfailed = false;
async function syncTissue(t, sel) {
  if (tfailed) return;
  try {
    if (!tview) {
      const { createTissueView } = await import('./tissue3d.js');
      tview = await createTissueView($('tissue3d'), { elements: atoms.elements, onPick: part => setState({ selection: part === getState().selection ? null : part }) });
    }
    const key = `${getState().level}:${t.id}`;
    wireTissueTools();
    if (tshown !== key) { tview.show(t.id, t); tshown = key; $('txsec-cut').value = 50; $('txsec-3d').checked = false; }
    tview.select(t.parts.some(p => p.id === sel) ? sel : null);
  } catch (err) {
    tfailed = true; console.warn('3D tissue unavailable', err);
    $('tissue3d').hidden = true; $('tissue-note').innerHTML = html('cell3d.nowebgl');
  }
}
// Directional terminology shown beside the model (nervous tissue: afferent and efferent)
function renderDirections(sm) {
  const d = sm?.directions, el = $('tissue-dir');
  el.hidden = !d;
  if (!d) return;
  el.innerHTML = `<h4>${html(d.title)}</h4>${d.items.map(i => `<div class="dir-row"><span class="dir-arrow" aria-hidden="true">${i.arrow}</span><div><strong>${html(i.name)}</strong><br><span class="muted">${html(i.text)}</span></div></div>`).join('')}<p class="muted dir-note">${html(d.note)}</p>`;
}
// Organelle and atom models: part card plus sizes and function from the catalog compartment, links to structures
const modelCites = (m, level) => level === 'atom' ? m.cites : (() => { const k = comp(m.compartment); return [...(k?.sizes ?? []).map(z => z.cite), k?.function?.cite].filter(Boolean); })();
function modelCard(m, sel, level) {
  const p = m.parts.find(x => x.id === sel);
  const link = p?.link ? `<div class="chips"><span class="link-site">${html('model.opensite')}</span>${linkChip(p.link)}</div>` : '';
  const mlink = !p && m.link ? `<div class="chips"><span class="link-site">${html('model.link')}</span>${linkChip(m.link)}</div>` : '';
  if (p) return `<p><strong>${html(p.name)}</strong></p><p>${html(p.text)}</p>${link}<p class="muted" style="font-size:12.5px">${html(m.name)}</p>`;
  const k = level === 'organelle' ? comp(m.compartment) : null;
  const sizes = (k?.sizes ?? []).map(z => `<dl class="kv"><dt>${html('card.sizeref')}</dt><dd>${html(z.text)}</dd></dl><p class="muted" style="font-size:12.5px;margin-top:2px">${esc([citations[z.cite]?.species, citations[z.cite]?.cellType, citations[z.cite]?.source].filter(Boolean).join(', '))}</p>`).join('');
  const fn = k?.function && citations[k.function.cite];
  const fnBlock = fn ? `<dl class="kv"><dt>${html('card.function')}</dt><dd>${html(fn.detail)}</dd></dl>` : '';
  return `<p><strong>${html(m.name)}</strong></p><p>${html(m.summary)}</p>${sizes}${fnBlock}${mlink}<p class="muted" style="font-size:12.5px">${html('model.pick')}</p>`;
}
// Tissue level: view buttons and cross-section around the tissue viewer
const VIEW_KEYS = ['ant', 'post', 'r', 'l', 'sup', 'inf'], AXIS_KEYS = ['transverse', 'sagittal', 'coronal'];
let tviewWired = false;
function wireTissueTools() {
  if (tviewWired || !tview) return;
  tviewWired = true;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const mark = name => $('tissue-views').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === name));
  $('tissue-views').addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (b) { tview.setView(b.dataset.v, mark); mark(b.dataset.v); } });
  tview.attachSlice($('txsec-canvas'), { background: css('--paper-raised') || undefined });
  const ends = () => { $('txsec-ends').innerHTML = html('tview.ends.' + $('txsec-axis').value); };
  $('txsec-axis').addEventListener('change', () => { tview.setAxis($('txsec-axis').value); ends(); });
  $('txsec-cut').addEventListener('input', () => tview.setSlice(+$('txsec-cut').value));
  $('txsec-3d').addEventListener('change', () => tview.setCut3d($('txsec-3d').checked));
  $('txsec-reset').addEventListener('click', () => { $('txsec-cut').value = 50; $('txsec-3d').checked = false; $('txsec-axis').value = 'transverse'; tview.resetSlice(); ends(); mark(null); });
}
function renderTissueTools(on) {
  $('tissue-views').hidden = !on; $('tissue-xsec').hidden = !on;
  if (!on) return;
  $('tissue-views').innerHTML = VIEW_KEYS.map(k => `<button data-v="${k}" aria-pressed="false">${html('tview.' + k)}</button>`).join('');
  const cur = $('txsec-axis').value || 'transverse';
  $('txsec-axis').innerHTML = AXIS_KEYS.map(k => `<option value="${k}"${k === cur ? ' selected' : ''}>${text('tview.ax.' + k)}</option>`).join('');
  $('txsec-ends').innerHTML = html('tview.ends.' + cur);
}
const tissueParts = (t, sel) => `<ul class="queue parts">${t.parts.map(p => `<li><button data-kind="tpart" data-id="${p.id}" aria-pressed="${p.id === sel}"><span class="sw" style="background:${p.color}"></span><span>${html(p.name)}</span></button></li>`).join('')}</ul>`;
function tissueCard(t, sel) {
  const p = t.parts.find(x => x.id === sel);
  return p ? `<p><strong>${html(p.name)}</strong></p><p>${html(p.text)}</p><p class="muted" style="font-size:12.5px">${html(t.name)}</p>`
    : `<p><strong>${html(t.name)}</strong></p><p>${html(t.summary)}</p><p class="muted" style="font-size:12.5px">${html('tissue.pick')}</p>`;
}

function render(s) {
  applyStatic();
  document.querySelectorAll('[data-lang-set]').forEach(b => b.setAttribute('aria-checked', b.dataset.langSet === getLang()));
  renderRuler(s);

  const lv = levelInfo(s.level);
  const cell = catalog.cells.find(c => c.id === s.cell);
  const pdb = catalog.structures.find(p => p.id === s.pdb);
  const A = lv.module === 'A';
  const C = lv.module === 'C';
  const T = lv.module === 'T';
  const O = lv.module === 'O';
  const M = lv.module === 'M';
  const B = lv.module === 'B';
  const P = T || O || M;  // schematic part models
  const compare = A && s.view === 'compare';

  // Cell kind sets the colour of the Cell band: animal red, plant green, bacterial purple
  if (cell && lv.id === 'cell') document.documentElement.dataset.kind = cell.kind ?? 'animal'; else delete document.documentElement.dataset.kind;
  $('ro-cell').innerHTML = cell ? html(cell.name) : '–';
  $('ro-scale').textContent = lv.unit;
  $('ro-view').innerHTML = P ? (tissueOf(s) ? html(tissueOf(s).name) : html('hud.nothing')) : C ? (partsFor(s.level).find(p => p.id === s.anat) ? html(partsFor(s.level).find(p => p.id === s.anat).name) : html('hud.anatomy')) : !A && pdb ? `PDB ${esc(pdb.id)}` : compare ? html('view.compare') : cell && A ? html(cell.name) : html('hud.nothing');

  // Viewport: queue or comparison for module A, queue for module B
  $('vp-title').innerHTML = html(compare ? 'compare.title' : A ? 'moduleA.title' : C ? 'moduleC.title' : T ? 'moduleT.title' : O ? 'moduleO.title' : M ? 'moduleM.title' : 'moduleB.title');
  $('vp-switch').hidden = !A;
  $('vp-switch').querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', b.dataset.view === (compare ? 'compare' : 'cells')));
  const points = B && pdb ? tours.structures[pdb.id]?.points ?? [] : [];
  const point = points.find(p => p.id === s.tour);
  const showMol = B && !!pdb;
  $('vp-empty').hidden = compare || showMol || C;
  document.body.classList.toggle('level-c', C);
  const fr = $('vp-anatomy');
  fr.hidden = !C;
  if (C) {
    if (!fr.getAttribute('src')) fr.src = 'anatomy/index.html';
    showInModel(s);
  }
  $('vp-mol').hidden = !showMol;
  const sm = modelOf(s, cell);
  // Tissue level with no tissue picked: hide the three empty panels
  document.body.classList.toggle('bare', P && !sm);
  $('tissue-note').innerHTML = html(O ? 'organelle.note' : M ? 'atom.note' : 'tissue.note');
  $('vp-tissue').hidden = !sm;
  renderDirections(sm);
  renderTissueTools(T && !!sm);
  if (sm) syncTissue(sm, s.selection);
  $('vp-queue').hidden = compare;
  $('kind-legend').hidden = !A;
  if (A) $('kind-legend').innerHTML = kindLegend();
  $('vp-compare').hidden = !compare;
  const show3d = A && !compare && !cell?.schematic && !!cell?.fractions?.length;
  $('vp-cell').hidden = !show3d;
  if (show3d) sync3d(cell, s.selection);
  document.querySelector('.schematic').hidden = compare || showMol || C || P || !!sm;
  if (showMol) {
    $('tour-bar').innerHTML = [{ id: '', label: { en: text('tour.whole') } }, ...points].map(p =>
      `<li><button data-tour="${esc(p.id)}" aria-pressed="${(p.id || null) === (s.tour || null) || (!p.id && !point)}">${p.id ? html(p.label) : html('tour.whole')}</button></li>`).join('');
    sync3dMol(pdb.id, point);
  }
  if (compare) {
    $('vp-compare').innerHTML = renderCompare(s);
  } else {
    $('vp-empty').innerHTML = html(A ? 'moduleA.empty' : C ? 'moduleC.empty' : T ? 'moduleT.empty' : O ? 'moduleO.empty' : M ? 'moduleM.empty' : 'moduleB.empty');
    $('vp-queue').innerHTML = C || P ? partsFor(s.level).map(p => `<li><button data-kind="part" data-id="${p.id}" aria-pressed="${p.id === s.anat}"><span>${html(p.name)}</span></button></li>`).join('') : (A ? catalog.cells : catalog.structures).map(item => {
      const kind = A ? 'cell' : 'pdb';
      const on = A ? item.id === s.cell : item.id === s.pdb;
      return `<li><button data-kind="${kind}" data-id="${item.id}" aria-pressed="${on}"${A ? ` style="--k:var(--kind-${item.kind ?? 'animal'})"` : ''}>
        ${A ? '' : `<span class="id">${item.id}</span>`}<span>${html(item.name)}</span></button></li>`;
    }).join('');
  }

  // Panel 1: volume fractions of the selected cell
  $('chart-title').innerHTML = html(M ? 'panel.chart.m' : sm ? 'panel.chart.t' : A ? 'panel.chart.a' : C ? 'panel.chart.c' : T ? 'panel.chart.t' : 'panel.chart.b');
  const chart = sm ? tissueParts(sm, s.selection) : A && cell ? renderChart(cell) : '';
  $('chart-body').innerHTML = chart || `<p class="muted">${html(C ? 'panel.chart.empty.c' : T ? 'panel.chart.empty.t' : O ? 'panel.chart.empty.o' : M ? 'panel.chart.empty.m' : !A ? 'panel.chart.empty.b' : compare ? 'chart.select' : 'panel.chart.empty')}</p>`;

  // Panel 2: selected object card
  const item = C || P ? null : A ? cell : pdb;
  $('card-body').innerHTML = sm ? (O || M ? modelCard(sm, s.selection, s.level) : tissueCard(sm, s.selection)) : (A && cell && s.selection ? orgCard(cell, s.selection) : '') + (point ? tourCard(point) : '') +
    (item ? card(item, A ? 'cell' : 'pdb') : `<p class="muted">${html('panel.card.empty')}</p>`);

  // Panel 3: every source behind a number on screen
  const ids = new Set();
  if (compare) columnCells(s.muscle).forEach(c => c.data && ids.add(c.data));
  if (A && cell?.data) ids.add(cell.data);
  if (B && pdb?.cite) ids.add(pdb.cite);
  if (A && !compare && cell?.id === 'hepatocyte') ids.add('bnid-105782');
  if (O || M) (sm ? modelCites(sm, s.level) : []).forEach(id => ids.add(id));
  $('sources-body').innerHTML = sm && !(O || M) ? `<li class="muted" style="list-style:none;margin-left:-1.4em">${html('tissue.source')}</li>` : ids.size
    ? [...ids].map(id => source(citations[id])).join('')
    : `<li class="muted" style="list-style:none;margin-left:-1.4em">${html('status.nodata')}</li>`;
}

// Links in both directions. Outgoing edges come from the item's own row in links.json;
// incoming edges are every other row that lists this item.
function linkChip(k) {
  const i = k.indexOf(':');
  const p = k.slice(0, i), id = k.slice(i + 1);
  if (p === 'pdb') return `<a class="chip" href="?pdb=${encodeURIComponent(id)}" data-pdb="${esc(id)}">${esc(k)}</a>`;
  if (p === 'cell') return `<a class="chip" href="?cell=${encodeURIComponent(id)}" data-cell="${esc(id)}">${esc(k)}</a>`;
  if (p === 'anat') {   // organs and systems built into the in-site 3D Anatomy Model open at the Organ level
    const organ = anatomy.organs.find(o => o.id === id.toLowerCase());
    if (organ) return `<a class="chip" href="?level=organ&part=${organ.id}" data-anat="${organ.id}">${esc(k)}</a>`;
  }
  const t = links.targets[p];
  const url = t?.deepLink && t.url ? t.url.replace('{id}', encodeURIComponent(id)) : null;
  return url
    ? `<a class="chip" href="${esc(url)}">${esc(k)}</a>`
    : `<span class="chip" aria-disabled="true" title="${esc(text('link.soon'))}">${esc(k)}</span>`;
}
const HIDDEN_LINKS = ['ent', 'spec'];  // Human Biology entries and the Specimen Room are not linked yet
function grouped(keys) {
  const by = new Map();
  for (const k of keys) {
    const p = k.slice(0, k.indexOf(':'));
    if (HIDDEN_LINKS.includes(p)) continue;
    if (!by.has(p)) by.set(p, []);
    by.get(p).push(k);
  }
  return [...by].map(([p, ks]) => `<div class="link-group"><span class="link-site">${esc(links.targets[p]?.label ?? p)}</span>
    <div class="chips">${ks.map(linkChip).join('')}</div></div>`).join('');
}

// Card for a picked compartment: its share of this cell, the source, and a jump to its structure
function orgCard(cell, orgId) {
  const k = comp(orgId), f = k && resolve(cell, orgId);
  if (!k) return '';
  const jump = k.structure ? `<div class="chips"><span class="link-site">${html('card.structure')}</span>${linkChip(`pdb:${k.structure}`)}</div>` : '';
  const sizes = (k.sizes ?? []).map(z => {
    const c = citations[z.cite] ?? {};
    return `<dl class="kv"><dt>${html('card.sizeref')}</dt><dd>${html(z.text)}</dd></dl>
    <p class="muted" style="font-size:12.5px;margin-top:2px">${esc([c.species, c.cellType, c.source].filter(Boolean).join(', '))}</p>`;
  }).join('');
  const fn = k.function && citations[k.function.cite];
  const fnBlock = fn ? `<dl class="kv"><dt>${html('card.function')}</dt><dd>${html(fn.detail)}</dd></dl>
    <p class="muted" style="font-size:12.5px;margin-top:2px">${esc(fn.source)}</p>` : '';
  return `<div class="org-card" style="--c:var(${k.token})">
    <p><strong>${html(k.name)}</strong></p>
    <dl class="kv"><dt>${html('card.volume')}</dt><dd>${f ? esc(valueText(f)) : html('card.noorg')}</dd>
    <dt>${html('card.species')}</dt><dd>${html(cell.species)}</dd></dl>${fnBlock}${sizes}${jump}
    ${cell.data && f ? `<p class="muted" style="font-size:12.5px;margin-top:6px">${esc(citations[cell.data]?.source ?? '')}</p>` : ''}
  </div>`;
}

// Preset view: show the structure in Mol* and select and focus the point, once per change
let molKey = null;
async function sync3dMol(id, point) {
  const key = `${id}|${point?.id ?? ''}`;
  if (key === molKey) return;
  molKey = key;
  $('mol-note').innerHTML = html('mol.loading');
  try {
    if (await showStructure($('mol'), id, point)) $('mol-note').textContent = '';
  } catch (err) {
    molKey = null;
    console.warn('Mol* unavailable', err);
    $('mol-note').innerHTML = html('mol.failed');
  }
}

function tourCard(p) {
  const rows = `<dt>${html('card.tour.subunit')}</dt><dd>${esc(p.subunit ?? p.id)}</dd>
    <dt>${html('card.tour.chain')}</dt><dd>${esc(p.chain)}${p.authChain || p.subunitAuthChain ? ` (auth ${esc(p.authChain ?? p.subunitAuthChain)})` : ''}</dd>
    <dt>${html('card.tour.pos')}</dt><dd>${p.xyz.join(', ')}</dd>`;
  return `<div class="org-card" style="--c:var(--select)">
    <p><strong>${html(p.label)}</strong></p>
    <dl class="kv">${rows}</dl>
    <p class="muted" style="font-size:12.5px">${html('card.tour.basis.' + p.basis)}.${p.support ? ' ' + esc(p.support) : ''}${p.names ? ' ' + html('card.tour.names') : ''}${p.note ? ' ' + esc(p.note) : ''}</p>
  </div>`;
}

function card(item, kind) {
  const key = `${kind}:${item.id}`;
  const shown = k => !HIDDEN_LINKS.includes(k.slice(0, k.indexOf(':')));
  const out = (links.edges.find(e => e.from === key)?.to ?? []).filter(shown);
  const inc = links.edges.filter(e => e.to.includes(key) && !out.includes(e.from)).map(e => e.from).filter(shown);
  let rows = '';
  if (kind === 'pdb') rows = `<dt>${html('card.method')}</dt><dd>${esc(item.method)}</dd>`;
  else if (item.size) rows = `<dt>${html('card.size')}</dt><dd>${html(item.size)}</dd>`;
  else if (item.sizeUm) rows = `<dt>${html('card.size')}</dt><dd>${item.sizeUm[0]}–${item.sizeUm[1]} µm</dd>`;
  if (kind === 'cell' && item.kind) rows += `<dt>${html('card.kind')}</dt><dd>${html('kind.' + item.kind)}</dd><dt>${html('card.group')}</dt><dd>${html('group.' + (KINDS.find(k => k.id === item.kind)?.group ?? 'eukaryote'))}</dd>`;
  if (kind === 'cell' && item.species) rows += `<dt>${html('card.species')}</dt><dd>${html(item.species)}</dd>`;
  const status = kind === 'cell' && !item.data ? `<p class="muted" style="margin-top:8px">${html('status.nodata')}</p>` : '';
  const linkBlock = out.length || inc.length
    ? `${out.length ? `<h4 class="card-sub">${html('card.links')}</h4>${grouped(out)}` : ''}
       ${inc.length ? `<h4 class="card-sub">${html('card.linkedfrom')}</h4>${grouped(inc)}` : ''}`
    : `<p class="muted" style="margin-top:8px">${html('card.links.none')}</p>`;
  return `<p><strong>${html(item.name)}</strong></p>
    <dl class="kv"><dt>${html('release')}</dt><dd>${item.release}</dd>${rows}</dl>${status}${linkBlock}`;
}

function source(c) {
  if (!c) return '';
  return `<li><a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.source)}</a>
    <span class="badge ${c.status}">${esc(text(`status.${c.status}`))}</span><br>
    <span>${html(c.detail)}</span><br>
    <span class="muted">${esc([c.species === 'n/a' ? '' : c.species, c.method].filter(Boolean).join(', '))}</span></li>`;
}

setState(readUrl());
