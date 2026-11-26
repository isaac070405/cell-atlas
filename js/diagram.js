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
function label(o, x, y, cls, anchor = 'middle', gap = 15) {
  const ls = lines(o);
  return `<text class="${cls}" x="${x}" text-anchor="${anchor}">${ls.map((t, i) => `<tspan x="${x}" y="${y + i * gap}">${esc(t)}</tspan>`).join('')}</text>`;
}
const shape = n => n.kind === 'carrier'
  ? `<ellipse cx="${n.x}" cy="${n.y}" rx="${n.rx}" ry="${n.ry}" fill="${n.color}"/>`
  : `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="10" fill="${n.color}"/>`;
const center = n => n.kind === 'carrier' ? [n.x, n.y] : [n.x + n.w / 2, n.y + n.h / 2];

export function drawDiagram(dg, selected) {
  const [W, H] = dg.viewBox;
  const bands = dg.bands.map(b => `<rect class="dg-band dg-band-${b.id}" x="0" y="${b.y}" width="${W}" height="${b.h}"/>`).join('');
  const edges = dg.edges.map(e => `<polyline class="dg-edge dg-${e.type}" points="${e.pts.map(p => p.join(',')).join(' ')}" marker-end="url(#dg-arrow-${e.type})"/>`).join('');
  const labels = dg.labels.map(l => label(l.text, l.x, l.y, 'dg-label', l.anchor)).join('');
  const nodes = dg.nodes.map(n => {
    const [cx, cy] = center(n), on = n.id === selected;
    const name = lines(n.name), sub = lines(n.sub);
    const ty = n.kind === 'carrier' ? cy - ((name.length + sub.length) - 1) * 6 + 4 : cy - (name.length + sub.length - 1) * 8;
    const nameSvg = `<text class="dg-name" text-anchor="middle">${name.map((t, i) => `<tspan x="${cx}" y="${ty + i * 15}">${esc(t)}</tspan>`).join('')}</text>`;
    const subSvg = sub.length ? `<text class="dg-sub" text-anchor="middle">${sub.map((t, i) => `<tspan x="${cx}" y="${ty + (name.length + i) * 15}">${esc(t)}</tspan>`).join('')}</text>` : '';
    return `<g class="dg-node" role="button" tabindex="0" data-node="${esc(n.id)}" aria-pressed="${on}" aria-label="${esc(lines(n.name).join(' / '))}">${shape(n)}${nameSvg}${subSvg}</g>`;
  }).join('');
  const marker = t => `<marker id="dg-arrow-${t}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="dg-head dg-head-${t}"/></marker>`;
  return `<svg class="dg-svg" viewBox="0 ${-PAD} ${W} ${H + PAD * 2}" role="group" aria-label="${esc(text('diagram.label'))}: ${esc(text(dg.name))}">
    <defs>${['electron', 'proton', 'flow'].map(marker).join('')}</defs>${bands}${labels}${edges}${nodes}</svg>
    <ul class="dg-legend"><li><span class="dg-key dg-key-electron"></span>${html('diagram.legend.electron')}</li><li><span class="dg-key dg-key-proton"></span>${html('diagram.legend.proton')}</li></ul>`;
}
