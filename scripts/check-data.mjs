// Stage 2 and 3 gate. Run: node scripts/check-data.mjs
// 1. Every fraction cites a registered source; counts "pending" citations (stage 2 pass = 0).
// 2. Every link edge uses a known site prefix.
// 3. Model volumes match the data table within 2 percentage points (stage 3 pass).
import { readFileSync } from 'node:fs';
import { buildModel, renderedShare, crowded, target } from '../js/cellmodel.js';

const read = p => JSON.parse(readFileSync(new URL(`../data/${p}`, import.meta.url)));
const cat = read('catalog.json'), { citations } = read('citations.json'), links = read('links.json');
let fail = 0;
const bad = m => { fail++; console.log('FAIL', m); };

const pending = Object.entries(citations).filter(([, c]) => c.status !== 'verified');
console.log(`citations: ${Object.keys(citations).length}, pending: ${pending.length}`);
pending.forEach(([id]) => bad(`citation ${id} is pending`));

for (const c of cat.cells.filter(c => !c.schematic || c.fractions)) {
  if (c.data && !citations[c.data]) bad(`${c.id}: data cite ${c.data} missing`);
  if (!c.fractions?.length) bad(`${c.id}: no fractions`);
  const sum = (c.fractions ?? []).filter(f => !f.negligible && !f.text).reduce((s, f) => s + target(f), 0);
  if (sum > 100.5) bad(`${c.id}: fractions sum to ${sum.toFixed(1)}%`);
}
for (const s of cat.structures) for (const k of [].concat(s.cite)) if (!citations[k]) bad(`${s.id}: cite ${k} missing`);
for (const e of links.edges) for (const k of [e.from, ...e.to]) if (!links.targets[k.split(':')[0]]) bad(`link key ${k}`);

// Organelle and atom models: citations resolve, parts unique, bond indices valid, bond length matches the covalent-radius sum
const tis = read('tissues.json');
for (const t of tis.tissues) {
  if (!t.category) bad(`tissue ${t.id}: no category`);
  if (new Set(t.parts.map(p => p.id)).size !== t.parts.length) bad(`tissue ${t.id}: duplicate part id`);
  for (const p of t.parts) for (const c of p.cite ?? []) if (!citations[c]) bad(`tissue ${t.id} ${p.id}: cite ${c} missing`);
  for (const [k, v] of Object.entries(t.aliases ?? {})) if (!t.parts.some(p => p.id === v)) bad(`tissue ${t.id}: alias ${k} -> ${v} not a part`);
}
for (const e of links.edges) for (const k of [e.from, ...e.to]) if (k.startsWith('tis:') && !tis.tissues.some(t => t.id === k.slice(4) || t.aliases?.[k.slice(4)])) bad(`link ${k}: no tissue model`);

// Pathway diagrams: node ids unique, citations resolve, link keys use a known site prefix, edges stay inside the viewBox
const dgs = read('diagrams.json');
for (const d of dgs.diagrams) {
  const ids = d.nodes.map(n => n.id);
  if (new Set(ids).size !== ids.length) bad(`diagram ${d.id}: duplicate node id`);
  for (const c of [...(d.cite ?? []), ...d.nodes.flatMap(n => n.cite ?? [])]) if (!citations[c]) bad(`diagram ${d.id}: cite ${c} missing`);
  for (const n of d.nodes) for (const l of n.links ?? (n.link ? [n.link] : [])) if (!links.targets[l.split(':')[0]]) bad(`diagram ${d.id} ${n.id}: link ${l}`);
  for (const e of d.edges) for (const [x, y] of e.pts) if (x < 0 || y < 0 || x > d.viewBox[0] || y > d.viewBox[1]) bad(`diagram ${d.id}: edge point ${x},${y} outside the viewBox`);
}
// A diagram link pdb:ID#tour must name a tour point of that structure
const tp = read('tour-points.json').structures;
// Domain ranges: known citation, ordered ranges, hex colours, no overlap within a chain
for (const [id, st] of Object.entries(tp)) {
  if (!st.domains) continue;
  if (!citations[st.domains.cite]) bad(`${id}: domains cite ${st.domains.cite} missing`);
  const it = st.domains.items;
  for (const d of it) {
    if (!(d.first <= d.last) || !/^#[0-9A-Fa-f]{6}$/.test(d.color) || !d.chain) bad(`${id}: domain ${d.id} range, colour or chain`);
    for (const o of it) if (o !== d && o.chain === d.chain && d.first <= o.last && o.first <= d.last) bad(`${id}: domains ${d.id} and ${o.id} overlap`);
  }
}
for (const d of dgs.diagrams) for (const n of d.nodes) for (const l of n.links ?? (n.link ? [n.link] : [])) {
  const m = l.match(/^pdb:([^#]+)#(.+)$/);
  if (m && !tp[m[1]]?.points.some(p => p.id === m[2])) bad(`diagram ${d.id} ${n.id}: ${l} has no such tour point`);
}
for (const e of links.edges) for (const k of [e.from, ...e.to]) if (k.startsWith('diag:') && !dgs.diagrams.some(d => d.id === k.slice(5))) bad(`link ${k}: no diagram`);
console.log(`diagrams: ${dgs.diagrams.length}`);
const loc = read('protein-location.json');
if (!citations[loc.cite]) bad(`protein-location: cite ${loc.cite} missing`);
for (const [g, e] of Object.entries(loc.genes)) if (!citations[loc.citeUniprot]) bad(`protein-location: cite ${loc.citeUniprot} missing`);
for (const [g, e] of Object.entries(loc.genes)) if (!['Enhanced', 'Supported', 'Approved', 'Uncertain', 'Experimental', 'Annotated'].includes(e.reliability) || !e.main.length && !e.additional.length) bad(`protein-location ${g}: reliability or location`);
console.log(`protein locations: ${Object.keys(loc.genes).length}`);
const fam = read('bcl2-compare.json');
if (!citations[fam.cite]) bad(`bcl2-compare: cite ${fam.cite} missing`);
for (const m of fam.members) {
  if (m.structure && !cat.structures.some(s => s.id === m.structure)) bad(`bcl2-compare ${m.id}: structure ${m.structure} not in catalog`);
  if (m.peptideOnly > m.entries) bad(`bcl2-compare ${m.id}: peptideOnly above entries`);
  if (m.xray + m.nmr + m.cryoem !== m.entries) bad(`bcl2-compare ${m.id}: methods ${m.xray + m.nmr + m.cryoem} vs entries ${m.entries}`);
  if (m.firstRelease > m.lastRelease) bad(`bcl2-compare ${m.id}: release years`);
}
console.log(`bcl2 compare members: ${fam.members.length}`);
console.log(`tissue models: ${tis.tissues.length}`);
const orgs = read('organelles.json'), atoms = read('atoms.json');
for (const m of orgs.models) {
  if (m.compartment && !cat.compartments.some(c => c.id === m.compartment)) bad(`organelle ${m.id}: compartment ${m.compartment} missing`);
  if (new Set(m.parts.map(p => p.id)).size !== m.parts.length) bad(`organelle ${m.id}: duplicate part id`);
}
for (const m of atoms.models) {
  for (const c of m.cites) if (!citations[c]) bad(`atom ${m.id}: cite ${c} missing`);
  const ids = new Set(m.parts.map(p => p.id));
  m.atoms.forEach(a => { if (!ids.has(a.part ?? a.el) || !atoms.elements[a.el]) bad(`atom ${m.id}: ${a.part ?? a.el} has no part or element`); });
  for (const [i, j] of m.bonds) {
    const a = m.atoms[i], b = m.atoms[j];
    if (!a || !b) { bad(`atom ${m.id}: bond ${i}-${j}`); continue; }
    if (m.geometry === 'computed') continue;   // computed conformers are not radius sums
    const len = Math.hypot(...a.xyz.map((v, k) => v - b.xyz[k])), want = atoms.elements[a.el].covalent + atoms.elements[b.el].covalent;
    if (Math.abs(len - want) > 0.01) bad(`atom ${m.id}: bond ${a.el}-${b.el} ${len.toFixed(3)} vs ${want.toFixed(3)}`);
  }
}
console.log(`organelle models: ${orgs.models.length}, atom models: ${atoms.models.length}`);

console.log('\nstage 3: model volume vs data (percentage points)');
for (const cell of cat.cells.filter(c => !c.schematic)) {  // schematic cells draw their own model
  const m = buildModel(cell);
  const share = renderedShare(m);
  const cr = crowded(m);
  console.log(`${cell.id}  remainder ${m.remainder}%${cr.length ? `  crowded: ${cr.join(', ')}` : ''}`);
  for (const f of cell.fractions.filter(f => !f.negligible && m.declared[f.org] != null)) {
    const want = target(f), got = m.declared[f.org], diff = Math.abs(want - got);
    const lo = Array.isArray(f.value) ? f.value[0] : want, hi = Array.isArray(f.value) ? f.value[1] : want;
    console.log(`  ${f.org.padEnd(16)} data ${String(want).padStart(5)}  model ${got.toFixed(2).padStart(6)}  drawn ${String(share[f.org] ?? 0).padStart(6)}  ${diff <= 2 && got >= lo - 2 && got <= hi + 2 ? 'ok' : 'FAIL'}`);
    if (diff > 2) bad(`${cell.id} ${f.org}: ${got.toFixed(2)} vs ${want}`);
  }
}
console.log(fail ? `\n${fail} failure(s)` : '\nall checks pass');
process.exit(fail ? 1 : 0);
