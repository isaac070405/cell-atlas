// Procedural cell layout. Pure maths, no Three.js, so Node can check it.
// Each reported compartment becomes capsules (or one bulk ellipsoid) whose analytic
// volumes sum to the published fraction of the cell. Shapes and counts are schematic.
// Volumes are exact by construction; placement overlap is measured and reported.

// Cell outline: ellipsoid semi-axis ratios (x = long axis). Schematic, not measured.
export const OUTLINE = {
  hepatocyte: [1, 0.9, 0.85], enterocyte: [0.5, 0.5, 1.15], 'skeletal-myocyte': [2.6, 0.6, 0.6],
  cardiomyocyte: [1.9, 0.7, 0.7], 'smooth-myocyte': [3, 0.4, 0.4], 'plant-mesophyll': [1.2, 1.2, 0.8],
};

// Shape per compartment: aspect = capsule length / radius (0 = sphere), n(f) = count.
// bulk = one concentric ellipsoid. align = rods lie along the cell's long axis.
const SHAPE = {
  nucleus:     { aspect: 0, n: () => 1 },
  perinuclear: { aspect: 0, n: () => 3 },
  mito:        { aspect: 3, n: f => clamp(Math.round(f * 1.5), 3, 40) },
  'er-rough':  { aspect: 1.5, n: f => clamp(Math.round(f * 2), 3, 14) },
  'er-smooth': { aspect: 4, n: f => clamp(Math.round(f * 1.5), 3, 12) },
  golgi:       { aspect: 2, n: () => 4 },
  'er-smooth-golgi': { aspect: 3, n: f => clamp(Math.round(f * 1.5), 3, 10) },
  perox:       { aspect: 0, n: () => 5 },
  lyso:        { aspect: 0, n: () => 5 },
  endo:        { aspect: 0, n: () => 5 },
  sr:          { aspect: 8, n: () => 6, align: true },
  myofibril:   { aspect: 14, n: () => 12, align: true },
  'chloro-stroma': { aspect: 1.2, n: () => 8, shell: true },
  vacuole:     { bulk: true },
};
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Value used to size a compartment: the point value, or the middle of a published range
export const target = f => Array.isArray(f.value) ? (f.value[0] + f.value[1]) / 2 : f.value;
export const capsuleVolume = (r, len) => Math.PI * r * r * ((4 / 3) * r + len);

function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const hash = s => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7);

// Cell volume is fixed at 100 units, so a volume in units is a percentage.
export function buildModel(cell, comps = {}) {
  const ratio = OUTLINE[cell.id] ?? [1, 1, 1];
  const k = Math.cbrt(100 / ((4 / 3) * Math.PI * ratio[0] * ratio[1] * ratio[2]));
  const axes = ratio.map(v => v * k);
  const rand = rng(hash(cell.id));
  const items = [];

  const fs = (cell.fractions ?? []).filter(f => !f.negligible && f.org !== 'cytosol' && SHAPE[f.org]);
  // Do not draw a group row and its members twice
  const drawn = fs.filter(f => !(f.org === 'er-smooth' || f.org === 'golgi') || !fs.some(g => g.org === 'er-smooth-golgi'));
  const bulk = drawn.find(f => SHAPE[f.org].bulk);

  for (const f of drawn) {
    const sh = SHAPE[f.org], v = target(f);
    if (sh.bulk) {
      const s = Math.cbrt(v / 100);
      items.push({ org: f.org, kind: 'bulk', center: [0, 0, 0], scale: axes.map(a => a * s), volume: v });
      continue;
    }
    const n = sh.n(v), each = v / n;
    // Solve capsule radius from volume: V = pi r^3 (4/3 + aspect)
    const r = Math.cbrt(each / (Math.PI * (4 / 3 + sh.aspect)));
    for (let i = 0; i < n; i++) {
      items.push({ org: f.org, kind: 'capsule', r, len: sh.aspect * r, volume: each, align: !!sh.align, shell: !!(sh.shell && bulk),
        center: [0, 0, 0], dir: [1, 0, 0] });
    }
  }

  place(items, axes, bulk ? Math.cbrt(target(bulk) / 100) : null, rand);
  const declared = {};
  for (const it of items) declared[it.org] = (declared[it.org] ?? 0) + it.volume;
  const rest = 100 - Object.values(declared).reduce((s, v) => s + v, 0);
  return { id: cell.id, axes, items, declared, remainder: +rest.toFixed(4), comps };
}

const len3 = v => Math.hypot(v[0], v[1], v[2]);
const norm = v => { const l = len3(v) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };

function place(items, axes, bulkS, rand) {
  const movers = items.filter(i => i.kind === 'capsule');
  const rho = bulkS ? (1 + bulkS) / 2 : null;
  const minAxis = Math.min(...axes);
  for (const it of movers) {
    const u = norm([rand() - 0.5, rand() - 0.5, rand() - 0.5]);
    it.dir = it.align ? [1, 0, 0] : u;
    const rad = rho ?? Math.cbrt(rand()) * 0.9;
    it.center = [u[0] * rad * axes[0], u[1] * rad * axes[1], u[2] * rad * axes[2]];
  }
  // The nucleus sits near the middle
  for (const it of movers) if (it.org === 'nucleus') it.center = [0, 0, 0];

  for (let iter = 0; iter < 400; iter++) {
    for (let i = 0; i < movers.length; i++) {
      for (let j = i + 1; j < movers.length; j++) {
        const a = movers[i], b = movers[j];
        const sep = segDist(a, b);
        const need = a.r + b.r;
        if (sep.d < need) {
          const push = (need - sep.d) * 0.5;
          const dirv = sep.d > 1e-6 ? norm(sep.v) : norm([rand() - 0.5, rand() - 0.5, rand() - 0.5]);
          const wa = a.org === 'nucleus' ? 0 : 1, wb = b.org === 'nucleus' ? 0 : 1;
          const t = wa + wb || 1;
          for (let c = 0; c < 3; c++) { a.center[c] -= dirv[c] * push * 2 * wa / t; b.center[c] += dirv[c] * push * 2 * wb / t; }
        }
      }
    }
    for (const it of movers) {
      // Keep each item inside the outline, and on the shell next to a bulk vacuole
      const half = it.len / 2 * (it.align ? 1 : 0.6) + it.r;
      let uc = norm3(it.center, axes);
      const umax = Math.max(0.12, 1 - half / minAxis);
      const umin = rho ? rho * 0.85 : 0;
      if (uc.l > umax || uc.l < umin) {
        const s = clamp(uc.l, umin, umax) / (uc.l || 1);
        it.center = it.center.map((c, ix) => (uc.l ? c * s : (ix === 0 ? umin * axes[0] : 0)));
      }
    }
  }
}
const norm3 = (c, axes) => ({ l: Math.hypot(c[0] / axes[0], c[1] / axes[1], c[2] / axes[2]) });

// Distance between the core segments of two capsules (their centres when len = 0)
function ends(it) {
  const h = it.len / 2;
  return [[it.center[0] - it.dir[0] * h, it.center[1] - it.dir[1] * h, it.center[2] - it.dir[2] * h],
          [it.center[0] + it.dir[0] * h, it.center[1] + it.dir[1] * h, it.center[2] + it.dir[2] * h]];
}
function segDist(A, B) {
  const [p1, q1] = ends(A), [p2, q2] = ends(B);
  const d1 = q1.map((v, i) => v - p1[i]), d2 = q2.map((v, i) => v - p2[i]), r = p1.map((v, i) => v - p2[i]);
  const dot = (x, y) => x[0] * y[0] + x[1] * y[1] + x[2] * y[2];
  const a = dot(d1, d1), e = dot(d2, d2), f = dot(d2, r);
  let s, t;
  if (a < 1e-9 && e < 1e-9) { s = t = 0; }
  else if (a < 1e-9) { s = 0; t = clamp(f / e, 0, 1); }
  else {
    const c = dot(d1, r);
    if (e < 1e-9) { t = 0; s = clamp(-c / a, 0, 1); }
    else {
      const b = dot(d1, d2), den = a * e - b * b;
      s = den > 1e-9 ? clamp((b * f - c * e) / den, 0, 1) : 0;
      t = (b * s + f) / e;
      if (t < 0) { t = 0; s = clamp(-c / a, 0, 1); } else if (t > 1) { t = 1; s = clamp((b - c) / a, 0, 1); }
    }
  }
  const c1 = p1.map((v, i) => v + d1[i] * s), c2 = p2.map((v, i) => v + d2[i] * t);
  const v = c2.map((x, i) => x - c1[i]);
  return { d: len3(v), v };
}

// Monte Carlo: share of the cell covered by each compartment when overlaps count once.
// Informational: packing a schematic at published densities leaves some overlap.
export function renderedShare(model, samples = 40000, seed = 1) {
  const rand = rng(seed), [a, b, c] = model.axes, hit = {};
  let inside = 0;
  for (let n = 0; n < samples; n++) {
    const p = [(rand() * 2 - 1) * a, (rand() * 2 - 1) * b, (rand() * 2 - 1) * c];
    if ((p[0] / a) ** 2 + (p[1] / b) ** 2 + (p[2] / c) ** 2 > 1) continue;
    inside++;
    // A point inside several compartments counts for the smallest one, so bulk fills never hide organelles
    const hits = model.items.filter(it => contains(it, p)).sort((x, y) => x.volume - y.volume);
    if (hits.length) hit[hits[0].org] = (hit[hits[0].org] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(hit).map(([k, v]) => [k, +(100 * v / inside).toFixed(2)]));
}
function contains(it, p) {
  if (it.kind === 'bulk') return (p[0] / it.scale[0]) ** 2 + (p[1] / it.scale[1]) ** 2 + (p[2] / it.scale[2]) ** 2 <= 1;
  const [p1, q1] = ends(it), d = q1.map((v, i) => v - p1[i]), l2 = d[0] * d[0] + d[1] * d[1] + d[2] * d[2];
  const t = l2 ? clamp(((p[0] - p1[0]) * d[0] + (p[1] - p1[1]) * d[1] + (p[2] - p1[2]) * d[2]) / l2, 0, 1) : 0;
  return Math.hypot(p[0] - (p1[0] + d[0] * t), p[1] - (p1[1] + d[1] * t), p[2] - (p1[2] + d[2] * t)) <= it.r;
}

// Compartments whose drawn share differs from the data by more than 2 points: the outline is too crowded
export function crowded(model) {
  const share = renderedShare(model, 20000);
  return Object.keys(model.declared).filter(o => Math.abs((share[o] ?? 0) - model.declared[o]) > 2);
}
