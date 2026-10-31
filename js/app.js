import { readUrl, setState, onChange, getState, levelInfo } from './state.js';
import { loadStrings, setLang, getLang, applyStatic, html, text, esc } from './i18n.js';
import { buildRuler, renderRuler } from './ruler.js';

const load = p => fetch(p).then(r => r.json());
const [catalog, { citations }, links] = await Promise.all([
  load('data/catalog.json'), load('data/citations.json'), load('data/links.json'),
]);
const $ = id => document.getElementById(id);

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

function render(s) {
  applyStatic();
  document.querySelectorAll('[data-lang-set]').forEach(b => b.setAttribute('aria-checked', b.dataset.langSet === getLang()));
  renderRuler(s);

  const lv = levelInfo(s.level);
  const cell = catalog.cells.find(c => c.id === s.cell);
  const pdb = catalog.structures.find(p => p.id === s.pdb);

  $('ro-cell').innerHTML = cell ? html(cell.name) : '–';
  $('ro-scale').textContent = lv.unit;
  $('ro-view').innerHTML = lv.module === 'B' && pdb ? `PDB ${esc(pdb.id)}` : cell && lv.module === 'A' ? html(cell.name) : html('hud.nothing');

  // Viewport: empty state for the module this level belongs to
  const A = lv.module === 'A';
  $('vp-title').innerHTML = html(A ? 'moduleA.title' : 'moduleB.title');
  $('vp-empty').innerHTML = html(A ? 'moduleA.empty' : 'moduleB.empty');
  $('vp-queue').innerHTML = (A ? catalog.cells : catalog.structures).map(item => {
    const kind = A ? 'cell' : 'pdb';
    const on = A ? item.id === s.cell : item.id === s.pdb;
    return `<li><button data-kind="${kind}" data-id="${item.id}" aria-pressed="${on}">
      ${A ? '' : `<span class="id">${item.id}</span>`}<span>${html(item.name)}</span></button></li>`;
  }).join('');

  // Panel 1: chart (no data in the shell)
  $('chart-title').innerHTML = html(A ? 'panel.chart.a' : 'panel.chart.b');
  $('chart-body').innerHTML = `<p class="muted">${html(A ? 'panel.chart.empty' : 'panel.chart.empty.b')}</p>`;

  // Panel 2: selected object card
  const item = A ? cell : pdb;
  $('card-body').innerHTML = item ? card(item, A ? 'cell' : 'pdb') : `<p class="muted">${html('panel.card.empty')}</p>`;

  // Panel 3: every source behind what is on screen
  const ids = new Set();
  if (A && cell?.data) ids.add(cell.data);
  if (!A && pdb?.cite) ids.add(pdb.cite);
  if (A && cell?.id === 'hepatocyte') ids.add('bnid-105782');
  $('sources-body').innerHTML = ids.size
    ? [...ids].map(id => source(citations[id])).join('')
    : `<li class="muted" style="list-style:none;margin-left:-1.4em">${html('status.nodata')}</li>`;
}

function card(item, kind) {
  const key = `${kind}:${kind === 'pdb' ? item.id : item.id}`;
  const out = links.edges.find(e => e.from === key)?.to ?? [];
  const chips = out.map(k => {
    const [p, id] = k.split(':');
    const t = links.targets[p];
    const url = t?.deepLink && t.url ? t.url.replace('{id}', encodeURIComponent(id)) : null;
    return url
      ? `<a class="chip" href="${url}">${esc(k)}</a>`
      : `<span class="chip" aria-disabled="true" title="${esc(text('link.soon'))}">${esc(k)}</span>`;
  }).join('');
  const rows = kind === 'pdb'
    ? `<dt>${html('card.method')}</dt><dd>${esc(item.method)}</dd>`
    : item.sizeUm ? `<dt>${html('card.size')}</dt><dd>${item.sizeUm[0]}–${item.sizeUm[1]} µm</dd>` : '';
  const status = kind === 'cell' && !item.data ? `<p class="muted" style="margin-top:8px">${html('status.nodata')}</p>` : '';
  return `<p><strong>${html(item.name)}</strong></p>
    <dl class="kv"><dt>${html('release')}</dt><dd>${item.release}</dd>${rows}</dl>${status}
    ${chips ? `<div class="chips" aria-label="${esc(text('card.links'))}">${chips}</div>` : ''}`;
}

function source(c) {
  if (!c) return '';
  return `<li><a href="${c.url}" target="_blank" rel="noopener">${esc(c.source)}</a>
    <span class="badge ${c.status}">${esc(text(`status.${c.status}`))}</span><br>
    <span>${html(c.detail)}</span><br>
    <span class="muted">${esc(c.species)}${c.method ? `, ${esc(c.method)}` : ''}</span></li>`;
}

setState(readUrl());
