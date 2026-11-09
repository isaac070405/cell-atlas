// Four-cell comparison and the per-cell fraction chart.
// Both draw on one 0–100% scale so a 0.5% compartment looks small next to 79%.
import { html, text, esc } from './i18n.js';

let cat;
export const initCompare = catalog => { cat = catalog; };

export const comp = id => cat.compartments.find(c => c.id === id);
export const cellById = id => cat.cells.find(c => c.id === id);
export const columnCells = muscle => cat.compareColumns.map(id => cellById(id === 'muscle' ? muscle : id));

// What a cell says about one compartment. A grouped row (Smooth ER + Golgi) falls back
// to the sum of its members only when every member was measured.
export function resolve(cell, orgId) {
  const f = cell.fractions?.find(x => x.org === orgId);
  if (f) return f;
  const members = comp(orgId)?.members;
  if (!members) return null;
  const parts = members.map(m => cell.fractions?.find(x => x.org === m && typeof x.value === 'number'));
  if (parts.some(p => !p)) return null;
  return { org: orgId, value: +parts.reduce((s, p) => s + p.value, 0).toFixed(1), derived: true };
}

const fmt = n => String(n);
export function valueText(f) {
  if (!f) return '—';
  if (f.negligible) return text('compare.negligible');
  const v = Array.isArray(f.value) ? `${fmt(f.value[0])}–${fmt(f.value[1])}%` : `${fmt(f.value)}%`;
  return `${f.approx ? '≈ ' : ''}${v}${f.derived ? ' *' : ''}`;
}

// One bar: a filled run for a point value, a hollow span with end caps for a range.
export function bar(f, orgId) {
  const colour = `var(${comp(orgId)?.token ?? '--org-cytosol'})`;
  let mark = '';
  if (f && !f.negligible) {
    if (Array.isArray(f.value)) {
      const [lo, hi] = f.value;
      mark = `<span class="bar-range" style="left:${lo}%;width:${hi - lo}%;--c:${colour}"></span>`;
    } else {
      mark = `<span class="bar-fill" style="width:${f.value}%;--c:${colour}"></span>`;
    }
  }
  return `<span class="bar-track" aria-hidden="true">${mark}</span>`;
}

const swatch = orgId => `<span class="swatch" style="--c:var(${comp(orgId).token})" aria-hidden="true"></span>`;

export function renderCompare(s) {
  const cells = columnCells(s.muscle);
  const head = cells.map((c, i) => {
    const isMuscle = cat.compareColumns[i] === 'muscle';
    const on = c.id === s.cell;
    const sw = isMuscle ? `<div class="seg seg-sm" role="radiogroup" aria-label="${esc(text('compare.muscle'))}">${
      cat.muscleTypes.map(m => `<button role="radio" data-muscle="${m}" aria-checked="${m === s.muscle}">${html(`muscle.${m}`)}</button>`).join('')
    }</div>` : '';
    return `<th scope="col" class="${on ? 'on' : ''}">
      <button class="col-head" data-cell="${c.id}" aria-pressed="${on}" title="${esc(text('compare.select'))}">${html(c.name)}</button>
      <span class="col-species">${html(c.species)}</span>${sw}</th>`;
  }).join('');

  const rows = cat.compareRows
    .filter(r => cells.some(c => resolve(c, r)))
    .map(r => {
      const k = comp(r);
      const jump = k.structure
        ? ` <a class="chip chip-jump" href="?pdb=${k.structure}" data-pdb="${k.structure}" title="${esc(text('compare.jump'))}">${k.structure}</a>` : '';
      const tds = cells.map(c => {
        const f = resolve(c, r);
        return `<td class="${f ? '' : 'nm'}">${bar(f, r)}<span class="val" ${f ? '' : `title="${esc(text('compare.notmeasured'))}"`}>${esc(valueText(f))}</span></td>`;
      }).join('');
      return `<tr><th scope="row"><span class="row-label">${swatch(r)}<span>${html(k.name)}${jump}</span></span></th>${tds}</tr>`;
    }).join('');

  return `<p class="compare-lede">${html('compare.lede')}</p>
    <div class="compare-scroll"><table class="compare">
      <thead><tr><th scope="col" class="corner">${html('compare.compartment')}</th>${head}</tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <p class="compare-foot">${html('compare.footnote')}</p>`;
}

// Chart panel: every measured compartment of one cell, largest first.
export function renderChart(cell) {
  const fs = (cell.fractions ?? []).slice().sort((a, b) => num(b) - num(a));
  if (!fs.length) return '';
  return `<p class="chart-basis muted">${html(cell.species)} · ${html('chart.note.basis')}</p>
    <ul class="chart">${fs.map(f => `<li>
      <span class="chart-name">${swatch(f.org)}${html(f.note ?? comp(f.org).name)}</span>
      ${bar(f, f.org)}<span class="val">${esc(valueText(f))}</span></li>`).join('')}</ul>`;
}
const num = f => f.negligible ? -1 : Array.isArray(f.value) ? f.value[1] : f.value;
