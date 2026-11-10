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
for (const s of cat.structures) if (!citations[s.cite]) bad(`${s.id}: cite ${s.cite} missing`);
for (const e of links.edges) for (const k of [e.from, ...e.to]) if (!links.targets[k.split(':')[0]]) bad(`link key ${k}`);

// Organelle and atom models: citations resolve, parts unique, bond indices valid, bond length matches the covalent-radius sum
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
