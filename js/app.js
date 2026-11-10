import { readUrl, setState, onChange, getState, levelInfo } from './state.js';
import { loadStrings, setLang, getLang, applyStatic, html, text, esc } from './i18n.js';
import { buildRuler, renderRuler } from './ruler.js';
import { initCompare, renderCompare, renderChart, columnCells, resolve, valueText, comp } from './compare.js';
import { buildModel, crowded } from './cellmodel.js';

const load = p => fetch(p).then(r => r.json());
const [catalog, { citations }, links] = await Promise.all([
  load('data/catalog.json'), load('data/citations.json'), load('data/links.json'),
]);
const $ = id => document.getElementById(id);
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

$('vp-queue').addEventListener('click', e => {
  const b = e.target.closest('button[data-kind]');
  if (!b) return;
  setState(b.dataset.kind === 'cell' ? { cell: b.dataset.id, pdb: null } : { pdb: b.dataset.id });
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
  const a = e.target.closest('a[data-pdb], a[data-cell]');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
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
      view = await createCellView($('cell3d'), { onPick: org => setState({ selection: org === getState().selection ? null : org }) });
      $('cut').addEventListener('input', e => view.setClip(+e.target.value));
      $('cell-reset').addEventListener('click', () => { shown = null; $('cut').value = 0; sync3d(catalog.cells.find(c => c.id === getState().cell), getState().selection); });
    }
    if (shown !== cell.id) {
      const m = buildModel(cell);
      const warn = crowded(m);
      view.show(m, orgColours());
      $('cut').value = 0;
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

function render(s) {
  applyStatic();
  document.querySelectorAll('[data-lang-set]').forEach(b => b.setAttribute('aria-checked', b.dataset.langSet === getLang()));
  renderRuler(s);

  const lv = levelInfo(s.level);
  const cell = catalog.cells.find(c => c.id === s.cell);
  const pdb = catalog.structures.find(p => p.id === s.pdb);
  const A = lv.module === 'A';
  const compare = A && s.view === 'compare';

  $('ro-cell').innerHTML = cell ? html(cell.name) : '–';
  $('ro-scale').textContent = lv.unit;
  $('ro-view').innerHTML = !A && pdb ? `PDB ${esc(pdb.id)}` : compare ? html('view.compare') : cell && A ? html(cell.name) : html('hud.nothing');

  // Viewport: queue or comparison for module A, queue for module B
  $('vp-title').innerHTML = html(compare ? 'compare.title' : A ? 'moduleA.title' : 'moduleB.title');
  $('vp-switch').hidden = !A;
  $('vp-switch').querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', b.dataset.view === (compare ? 'compare' : 'cells')));
  $('vp-empty').hidden = compare;
  $('vp-queue').hidden = compare;
  $('vp-compare').hidden = !compare;
  const show3d = A && !compare && !!cell?.fractions?.length;
  $('vp-cell').hidden = !show3d;
  if (show3d) sync3d(cell, s.selection);
  document.querySelector('.schematic').hidden = compare;
  if (compare) {
    $('vp-compare').innerHTML = renderCompare(s);
  } else {
    $('vp-empty').innerHTML = html(A ? 'moduleA.empty' : 'moduleB.empty');
    $('vp-queue').innerHTML = (A ? catalog.cells : catalog.structures).map(item => {
      const kind = A ? 'cell' : 'pdb';
      const on = A ? item.id === s.cell : item.id === s.pdb;
      return `<li><button data-kind="${kind}" data-id="${item.id}" aria-pressed="${on}">
        ${A ? '' : `<span class="id">${item.id}</span>`}<span>${html(item.name)}</span></button></li>`;
    }).join('');
  }

  // Panel 1: volume fractions of the selected cell
  $('chart-title').innerHTML = html(A ? 'panel.chart.a' : 'panel.chart.b');
  const chart = A && cell ? renderChart(cell) : '';
  $('chart-body').innerHTML = chart || `<p class="muted">${html(!A ? 'panel.chart.empty.b' : compare ? 'chart.select' : 'panel.chart.empty')}</p>`;

  // Panel 2: selected object card
  const item = A ? cell : pdb;
  $('card-body').innerHTML = (A && cell && s.selection ? orgCard(cell, s.selection) : '') +
    (item ? card(item, A ? 'cell' : 'pdb') : `<p class="muted">${html('panel.card.empty')}</p>`);

  // Panel 3: every source behind a number on screen
  const ids = new Set();
  if (compare) columnCells(s.muscle).forEach(c => c.data && ids.add(c.data));
  if (A && cell?.data) ids.add(cell.data);
  if (!A && pdb?.cite) ids.add(pdb.cite);
  if (A && !compare && cell?.id === 'hepatocyte') ids.add('bnid-105782');
  $('sources-body').innerHTML = ids.size
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
  const t = links.targets[p];
  const url = t?.deepLink && t.url ? t.url.replace('{id}', encodeURIComponent(id)) : null;
  return url
    ? `<a class="chip" href="${esc(url)}">${esc(k)}</a>`
    : `<span class="chip" aria-disabled="true" title="${esc(text('link.soon'))}">${esc(k)}</span>`;
}
function grouped(keys) {
  const by = new Map();
  for (const k of keys) {
    const p = k.slice(0, k.indexOf(':'));
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
  return `<div class="org-card" style="--c:var(${k.token})">
    <p><strong>${html(k.name)}</strong></p>
    <dl class="kv"><dt>${html('card.volume')}</dt><dd>${f ? esc(valueText(f)) : html('card.noorg')}</dd>
    <dt>${html('card.species')}</dt><dd>${html(cell.species)}</dd></dl>${sizes}${jump}
    ${cell.data && f ? `<p class="muted" style="font-size:12.5px;margin-top:6px">${esc(citations[cell.data]?.source ?? '')}</p>` : ''}
  </div>`;
}

function card(item, kind) {
  const key = `${kind}:${item.id}`;
  const out = links.edges.find(e => e.from === key)?.to ?? [];
  const inc = links.edges.filter(e => e.to.includes(key) && !out.includes(e.from)).map(e => e.from);
  let rows = '';
  if (kind === 'pdb') rows = `<dt>${html('card.method')}</dt><dd>${esc(item.method)}</dd>`;
  else if (item.size) rows = `<dt>${html('card.size')}</dt><dd>${html(item.size)}</dd>`;
  else if (item.sizeUm) rows = `<dt>${html('card.size')}</dt><dd>${item.sizeUm[0]}–${item.sizeUm[1]} µm</dd>`;
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
    <span class="muted">${esc(c.species)}${c.method ? `, ${esc(c.method)}` : ''}</span></li>`;
}

setState(readUrl());
