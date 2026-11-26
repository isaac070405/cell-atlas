// Pathway diagram view: draws one entry of data/diagrams.json as inline SVG.
// Nodes are buttons (click or Enter/Space picks one); edges are arrows. Colours for parts come from the data, lines use the tokens.
import { text, html, esc, getLang } from './i18n.js';

const PAD = 6;
// SVG text for the current language mode: one line, or two lines (English over Chinese) in bilingual mode
function lines(o) {
  if (!o) return [];
  if (getLang() === 'both') return [o.en, o['zh-Hant']].filter(Boolean);
  return [text(o)].filter(Boolean);
}
// Estimated width of a line in the monospace label font; a line wider than its box is squeezed to fit with textLength
const width = (t, size) => [...t].reduce((w, c) => w + (c.charCodeAt(0) > 0x2E80 ? size : size * 0.62), 0);
const tspan = (t, x, y, size, maxW) => `<tspan x="${x}" y="${y}"${maxW && width(t, size) > maxW ? ` textLength="${Math.round(maxW)}" lengthAdjust="spacingAndGlyphs"` : ''}>${esc(t)}</tspan>`;
function label(o, x, y, cls, anchor = 'middle', gap = 15) {
  const ls = lines(o);
  return `<text class="${cls}" x="${x}" text-anchor="${anchor}">${ls.map((t, i) => `<tspan x="${x}" y="${y + i * gap}">${esc(t)}</tspan>`).join('')}</text>`;
}
const shape = n => n.kind === 'carrier'
  ? `<ellipse cx="${n.x}" cy="${n.y}" rx="${n.rx}" ry="${n.ry}" fill="${n.color}"/>`
  : `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${n.kind === 'region' ? 16 : 10}" fill="${n.color}"${n.kind === 'region' ? ' fill-opacity="0.16" stroke-opacity="0.7"' : ''}/>`;
const center = n => n.kind === 'carrier' ? [n.x, n.y] : [n.x + n.w / 2, n.y + n.h / 2];

export function drawDiagram(dg, selected) {
  const [W, H] = dg.viewBox;
  const bands = dg.bands.map(b => `<rect class="dg-band dg-band-${b.id}" x="0" y="${b.y}" width="${W}" height="${b.h}"/>`).join('');
  const edges = dg.edges.map(e => `<polyline class="dg-edge dg-${e.type}" points="${e.pts.map(p => p.join(',')).join(' ')}" marker-end="url(#dg-arrow-${e.type})"/>`).join('');
  const labels = dg.labels.map(l => label(l.text, l.x, l.y, 'dg-label', l.anchor)).join('');
  const nodes = [...dg.nodes].sort((a, b) => (b.kind === 'region') - (a.kind === 'region')).map(n => {
    const [cx, cy] = center(n), on = n.id === selected;
    const name = lines(n.name), sub = lines(n.sub);
    // A region (a whole cell) is a backdrop: its name sits at the corner given by tx, ty and it needs no centre text
    if (n.kind === 'region') return `<g class="dg-node dg-region" role="button" tabindex="0" data-node="${esc(n.id)}" aria-pressed="${on}" aria-label="${esc(name.join(' / '))}">${shape(n)}${label(n.name, n.tx, n.ty, 'dg-region-name', 'start')}</g>`;
    const maxW = (n.kind === 'carrier' ? 2 * n.rx : n.w) - 12, rows = name.length + sub.length;
    const ty = cy - (rows - 1) * 7 + 4;
    const nameSvg = `<text class="dg-name" text-anchor="middle"${n.textColor ? ` style="fill:${n.textColor}"` : ''}>${name.map((t, i) => tspan(t, cx, ty + i * 14, 12, maxW)).join('')}</text>`;
    const subSvg = sub.length ? `<text class="dg-sub" text-anchor="middle"${n.textColor ? ` style="fill:${n.textColor}"` : ''}>${sub.map((t, i) => tspan(t, cx, ty + (name.length + i) * 14, 10, maxW)).join('')}</text>` : '';
    return `<g class="dg-node" role="button" tabindex="0" data-node="${esc(n.id)}" aria-pressed="${on}" aria-label="${esc(lines(n.name).join(' / '))}">${shape(n)}${nameSvg}${subSvg}</g>`;
  }).join('');
  const marker = t => `<marker id="dg-arrow-${t}" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="dg-head dg-head-${t}"/></marker>`;
  return `<svg class="dg-svg" viewBox="0 ${-PAD} ${W} ${H + PAD * 2}" role="group" aria-label="${esc(text('diagram.label'))}: ${esc(text(dg.name))}">
    <defs>${[...new Set(dg.edges.map(e => e.type))].map(marker).join('')}</defs>${bands}${labels}${edges}${nodes}</svg>
    <ul class="dg-legend">${(dg.legend ?? []).map(l => `<li><span class="dg-key dg-key-${esc(l.type)}"></span>${html(l.label)}</li>`).join('')}</ul>`;
}
