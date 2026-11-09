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

for (const c of cat.cells) {
  if (c.data && !citations[c.data]) bad(`${c.id}: data cite ${c.data} missing`);
  if (!c.fractions?.length) bad(`${c.id}: no fractions`);
  const sum = (c.fractions ?? []).filter(f => !f.negligible).reduce((s, f) => s + target(f), 0);
  if (sum > 100.5) bad(`${c.id}: fractions sum to ${sum.toFixed(1)}%`);
}
for (const s of cat.structures) if (!citations[s.cite]) bad(`${s.id}: cite ${s.cite} missing`);
for (const e of links.edges) for (const k of [e.from, ...e.to]) if (!links.targets[k.split(':')[0]]) bad(`link key ${k}`);

console.log('\nstage 3: model volume vs data (percentage points)');
for (const cell of cat.cells) {
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
