// Single alveolar unit, magnified beside the figure (hidden until its button is pressed).
// Follows the airway from a terminal bronchiole to an alveolar sac: terminal bronchiole (smooth muscle, ciliated epithelium, no gas exchange),
// respiratory bronchiole (first alveoli open off its wall), alveolar duct (a tube made of alveolar mouths), atrium and alveolar sac (a cluster of
// alveoli opening into one space, joined by pores of Kohn). Each alveolus is wrapped in one capillary network, blue where deoxygenated blood
// arrives from the pulmonary arteriole and red where oxygenated blood leaves to the venule. A cutaway alveolus below shows the wall,
// and a blood-air barrier inset to the right shows its layers, thickness exaggerated.
import { THREE, V, G, M, reg, xf, sph, seg } from './anatomy-part1.js';

const RS = 'respiratory', lbl = t => 'Magnified: ' + t;
const B0 = [-0.44, 1.3, 0.0], P = (x, y = 0, z = 0) => V(B0[0] + x, B0[1] + y, B0[2] + z);
const n0 = G[RS].children.length;

// small seeded random so the unit looks the same on every load
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const ep = M('epithelium', 0xeab9ad, 0.55, { side: THREE.DoubleSide, transparent: true, opacity: 0.5, depthWrite: false });
const epSolid = M('ciliated_epithelium', 0xe9b8ac, 0.6, { side: THREE.DoubleSide });
const muscle = M('smooth_muscle', 0xc9605a, 0.6);
const cartM = M('airway_plate', 0xa3bdd1, 0.5);
const wallM = M('alveolar_wall', 0xf0c3b8, 0.5, { side: THREE.DoubleSide, transparent: true, opacity: 0.42, depthWrite: false });
const capM = new THREE.MeshStandardMaterial({ name: 'pulmonary_capillary', vertexColors: true, roughness: 0.45, metalness: 0 });
const arterioleM = M('pulmonary_arteriole', 0x4b5fb0, 0.45), venuleM = M('pulmonary_venule', 0xc3342b, 0.45);
const koh = M('pore_of_Kohn', 0x4a2a2a, 0.8);

// ───── helpers ─────
const merge = list => {
  let nv = 0; const pos = [], nor = [], col = [], idx = [];
  list.forEach(g => { const p = g.attributes.position.array, n = g.attributes.normal.array, c = g.attributes.color ? g.attributes.color.array : null, ix = g.index.array;
    for (let i = 0; i < p.length; i++) { pos.push(p[i]); nor.push(n[i]); } for (let i = 0; i < p.length / 3; i++) col.push(c ? c[i * 3] : 1, c ? c[i * 3 + 1] : 1, c ? c[i * 3 + 2] : 1);
    for (let i = 0; i < ix.length; i++) idx.push(ix[i] + nv); nv += p.length / 3; g.dispose(); });
  const o = new THREE.BufferGeometry(); o.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); o.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); o.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); o.setIndex(idx); return o;
};
const blue = new THREE.Color(0x4b5fb0), red = new THREE.Color(0xd23a30);
// a tube coloured along its length from deoxygenated blue to oxygenated red
const grad = (pts, r, c0 = blue, c1 = red) => {
  const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 6, r, 6, false), n = g.attributes.position.count, rings = g.parameters.tubularSegments + 1, per = n / rings, col = new Float32Array(n * 3), c = new THREE.Color();
  for (let i = 0; i < n; i++) { c.copy(c0).lerp(c1, Math.min(1, Math.floor(i / per) / (rings - 1))); col.set([c.r, c.g, c.b], i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g;
};
// an alveolus: a thin shell, open at the mouth that faces `toward`
function alveolus(name, c, toward, r) {
  const dir = toward.clone().sub(c).normalize(), q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir), open = 0.62;
  const g = new THREE.SphereGeometry(r, 22, 14, 0, Math.PI * 2, open, Math.PI - open), m = new THREE.Mesh(g, wallM);
  m.position.copy(c); m.quaternion.copy(q); reg(RS, name, m, { label: lbl('Alveolus') });
  return { c, dir, q, r };
}
// the capillary network over an alveolus: loops across the wall away from the mouth, with a feeding point (blue) and a draining point (red)
function net(name, a, count = 22, scale = 1.05) {
  const list = [], R = a.r * scale, rot = a.q;
  const pt = (th, ph) => V(Math.sin(th) * Math.cos(ph) * R, Math.cos(th) * R, Math.sin(th) * Math.sin(ph) * R).applyQuaternion(rot).add(a.c);
  for (let k = 0; k < count; k++) {
    const th0 = 0.9 + rnd() * 1.9, ph0 = rnd() * Math.PI * 2, steps = 7, pts = []; let th = th0, ph = ph0; const dth = (rnd() - 0.5) * 0.32, dph = (0.25 + rnd() * 0.3) * (rnd() < 0.5 ? -1 : 1);
    for (let s = 0; s < steps; s++) { pts.push(pt(Math.min(2.9, Math.max(0.75, th)), ph)); th += dth + (rnd() - 0.5) * 0.18; ph += dph; }
    list.push(grad(pts, 0.00032));
  }
  reg(RS, name, new THREE.Mesh(merge(list), capM), { label: lbl('Pulmonary capillary network (blue: deoxygenated blood arriving, red: oxygenated blood leaving)') });
  return { feed: pt(2.6, 0.4), drain: pt(2.4, 3.6) };
}

// ───── conducting airway: terminal bronchiole, respiratory bronchiole, alveolar duct ─────
// terminal bronchiole: cut open lengthwise so the ciliated lining shows; smooth muscle rings outside; no cartilage and no alveoli
{ const g = new THREE.CylinderGeometry(0.0105, 0.0105, 0.07, 28, 1, true, 0.5, Math.PI * 1.6); g.rotateZ(Math.PI / 2);
  reg(RS, 'magnified_terminal_bronchiole', xf(new THREE.Mesh(g, epSolid), [B0[0] - 0.09, B0[1], B0[2]]), { label: lbl('Terminal bronchiole') });
  for (let i = 0; i < 12; i++) { const tg = new THREE.TorusGeometry(0.0114, 0.0012, 6, 22, Math.PI * 1.6); tg.rotateY(Math.PI / 2); tg.rotateX(0.5 + Math.PI * 0.8 * 0 ); reg(RS, 'magnified_muscle_' + i, xf(new THREE.Mesh(tg, muscle), [B0[0] - 0.12 + i * 0.0054, B0[1], B0[2]]), { label: lbl('Smooth muscle') }); }
  // cilia and goblet cells on the cut lining
  const cil = []; for (let k = 0; k < 160; k++) { const a = 0.5 + rnd() * Math.PI * 1.6, x = -0.123 + rnd() * 0.068, r0 = 0.0102, r1 = 0.0102 - 0.0016; const A = V(B0[0] + x, B0[1] + Math.cos(a) * r0, B0[2] + Math.sin(a) * r0), B = V(B0[0] + x + (rnd() - 0.5) * 0.0008, B0[1] + Math.cos(a) * r1, B0[2] + Math.sin(a) * r1);
    const sg = new THREE.CylinderGeometry(0.00012, 0.00022, A.distanceTo(B), 4, 1); sg.applyMatrix4(new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), B.clone().sub(A).normalize()), V(1, 1, 1))); cil.push(sg); }
  reg(RS, 'magnified_cilia', new THREE.Mesh(merge(cil.map(g => { g.deleteAttribute('uv'); return g; })), M('cilia', 0xf4e2d8, 0.5)), { label: lbl('Ciliated epithelium') });
  for (let i = 0; i < 3; i++) reg(RS, 'magnified_cartilage_' + i, xf(new THREE.Mesh(new THREE.CylinderGeometry(0.0128, 0.0128, 0.006, 14, 1, true, i * 1.2, 0.8), cartM), [B0[0] - 0.135 + i * 0.008, B0[1], B0[2]], { rot: [0, 0, Math.PI / 2] }), { label: lbl('Cartilage (ends before the terminal bronchiole)') });
}
const axisTube = (name, x0, x1, r, label) => { const g = new THREE.CylinderGeometry(r, r, x1 - x0, 24, 1, true); g.rotateZ(Math.PI / 2); reg(RS, name, xf(new THREE.Mesh(g, ep), [B0[0] + (x0 + x1) / 2, B0[1], B0[2]]), { label: lbl(label) }); };
axisTube('magnified_respiratory_bronchiole', -0.054, -0.012, 0.0085, 'Respiratory bronchiole');
axisTube('magnified_alveolar_duct', -0.012, 0.052, 0.0072, 'Alveolar duct');
const units = [];
// respiratory bronchiole: a few alveoli bud from the wall
[[-0.045, 0.4], [-0.036, 2.5], [-0.027, 4.4], [-0.02, 1.3]].forEach(([x, a], i) => { const c = P(x, Math.cos(a) * 0.0135, Math.sin(a) * 0.0135); units.push(alveolus('magnified_alveolus_rb_' + i, c, P(x), 0.0058)); });
// alveolar duct: rings of alveoli around the tube, with a knob of smooth muscle between neighbouring mouths
for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) { const a = k * (Math.PI / 3) + r * 0.5, x = -0.006 + r * 0.0155, c = P(x, Math.cos(a) * 0.0128, Math.sin(a) * 0.0128); units.push(alveolus(`magnified_alveolus_${r}_${k}`, c, P(x), 0.0062)); sph(RS, `magnified_knob_${r}_${k}`, 0.0011, P(x, Math.cos(a + 0.52) * 0.0079, Math.sin(a + 0.52) * 0.0079), muscle, { label: lbl('Smooth muscle') }); }
// atrium and alveolar sac: a cluster of alveoli that open into one space
const SAC = P(0.088), sacUnits = [];
{ sph(RS, 'magnified_atrium', 0.0075, SAC, ep, { label: lbl('Alveolar sac') });
  const N = 13; for (let k = 0; k < N; k++) { const a = k * 2.399963, b = Math.acos(1 - 2 * (k + 0.5) / N), d = V(Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a)), c = SAC.clone().addScaledVector(d, 0.0165); const u = alveolus('magnified_sac_alveolus_' + k, c, SAC, 0.0095); sacUnits.push(u); units.push(u); } }
// pores of Kohn: small openings in the shared walls of neighbouring sac alveoli
for (let i = 0; i < sacUnits.length; i++) for (let j = i + 1; j < sacUnits.length; j++) { if (sacUnits[i].c.distanceTo(sacUnits[j].c) < 0.0185 && rnd() < 0.55) { const m = sacUnits[i].c.clone().add(sacUnits[j].c).multiplyScalar(0.5); const tg = new THREE.TorusGeometry(0.0013, 0.00035, 6, 14); const mesh = new THREE.Mesh(tg, koh); mesh.position.copy(m); mesh.lookAt(sacUnits[j].c); reg(RS, `magnified_pore_${i}_${j}`, mesh, { label: lbl('Pore of Kohn') }); } }

// pulmonary arteriole (deoxygenated, blue) and venule (oxygenated, red) run beside the airway and feed every capillary network
const art = [], ven = [];
{ const aP = (x, off) => P(x, off * 0.5, off); const A = [-0.12, -0.08, -0.04, 0, 0.04, 0.07].map(x => aP(x, 0.0235)), Vn = [-0.12, -0.08, -0.04, 0, 0.04, 0.07].map(x => aP(x, -0.0235));
  reg(RS, 'magnified_arteriole', new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(A), 40, 0.0026, 10), arterioleM), { label: lbl('Pulmonary arteriole (deoxygenated blood arriving)') });
  reg(RS, 'magnified_venule', new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Vn), 40, 0.0026, 10), venuleM), { label: lbl('Pulmonary venule (oxygenated blood leaving)') });
  units.forEach((u, i) => { const { feed, drain } = net('magnified_capillaries_' + i, u, i < 28 ? 16 : 20);
    const near = pts => pts.reduce((b, p) => p.distanceTo(feed) < b.distanceTo(feed) ? p : b);
    art.push([near(A), feed]); ven.push([near(Vn), drain]); });
  art.forEach(([a, b], i) => reg(RS, 'magnified_feed_' + i, new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, a.clone().lerp(b, 0.5).add(V(0, 0.002, 0)), b]), 8, 0.0007, 6), arterioleM), { label: lbl('Pulmonary arteriole (deoxygenated blood arriving)') }));
  ven.forEach(([a, b], i) => reg(RS, 'magnified_drain_' + i, new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([b, b.clone().lerp(a, 0.5).add(V(0, -0.002, 0)), a]), 8, 0.0007, 6), venuleM), { label: lbl('Pulmonary venule (oxygenated blood leaving)') })); }
// elastic fibres in the septa and around the duct mouths
{ const els = []; for (let k = 0; k < 40; k++) { const x = -0.01 + rnd() * 0.06, a = rnd() * 6.28, a2 = a + 0.9 + rnd() * 0.6; els.push(grad([P(x, Math.cos(a) * 0.0085, Math.sin(a) * 0.0085), P(x + 0.004, Math.cos(a) * 0.0105, Math.sin(a) * 0.0105), P(x + 0.007, Math.cos(a2) * 0.0085, Math.sin(a2) * 0.0085)], 0.00018, new THREE.Color(0xe6c34a), new THREE.Color(0xe6c34a))); }
  reg(RS, 'magnified_elastic', new THREE.Mesh(merge(els), capM), { label: lbl('Elastic fibres') }); }

// ───── cutaway alveolus: the wall in detail ─────
const WC = P(0.088, -0.095), WR = 0.034;
{ const flip = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI, 0, 0));   // open side up
  const half = (r, mt, name, l) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 36, 20, 0, Math.PI * 2, 0, Math.PI / 2), mt); m.position.copy(WC); m.quaternion.copy(flip); reg(RS, name, m, { label: lbl(l) }); };
  half(WR, M('surfactant', 0xcfe8f2, 0.12, { side: THREE.DoubleSide, transparent: true, opacity: 0.35, depthWrite: false, clearcoat: 1 }), 'magnified_surfactant', 'Surfactant layer (lines the lumen, lowers surface tension)');
  half(WR * 1.04, M('type_I_pneumocyte', 0xefc2b6, 0.55, { side: THREE.DoubleSide, transparent: true, opacity: 0.55, depthWrite: false }), 'magnified_type1', 'Type I pneumocyte (thin squamous cell that covers about 95% of the wall)');
  half(WR * 1.075, M('basement_membrane', 0xe7cf72, 0.5, { side: THREE.DoubleSide, transparent: true, opacity: 0.45, depthWrite: false }), 'magnified_basement', 'Basement membrane (fused epithelial and endothelial layers)');
  // capillary network on the outside of the wall (lower hemisphere only, which is the one that exists)
  const a = { c: WC, q: flip, r: WR * 1.08 }; net('magnified_wall_capillaries', a, 56, 1.02);
  // type II pneumocytes: cuboidal cells at the corners of the wall, with lamellar bodies that make surfactant
  [[0.5, 0.3], [0.9, 2.4], [0.7, 4.3], [1.15, 5.4]].forEach(([th, ph], i) => { const d = V(Math.sin(th) * Math.cos(ph), -Math.cos(th), Math.sin(th) * Math.sin(ph)), c = WC.clone().addScaledVector(d, WR * 0.99);
    const m = xf(new THREE.Mesh(new THREE.SphereGeometry(0.0062, 18, 12), M('type_II_pneumocyte', 0x9a6fb0, 0.55)), c.toArray(), { scale: [1, 0.8, 1] }); reg(RS, 'magnified_type2_' + i, m, { label: lbl('Type II pneumocyte (cuboidal, makes surfactant)') });
    for (let k = 0; k < 5; k++) sph(RS, `magnified_lamellar_${i}_${k}`, 0.0011, c.clone().add(V((rnd() - 0.5) * 0.007, (rnd() - 0.3) * 0.005, (rnd() - 0.5) * 0.007)), M('lamellar_body', 0xe6d4f0, 0.4), { label: lbl('Lamellar bodies (stored surfactant)') }); });
  // alveolar macrophage with pseudopods, sitting on the wall
  const mc = WC.clone().add(V(0.012, -WR * 0.93, 0.012)); sph(RS, 'magnified_macrophage', 0.0078, mc.toArray(), M('alveolar_macrophage', 0x8fb04a, 0.6), { label: lbl('Alveolar macrophage (clears dust and microbes)') });
  for (let k = 0; k < 11; k++) { const aa = k * 2.399963, bb = Math.acos(1 - 2 * (k + 0.5) / 11), d = V(Math.sin(bb) * Math.cos(aa), Math.cos(bb), Math.sin(bb) * Math.sin(aa)); seg(RS, 'macrophage_spike_' + k, mc.clone().addScaledVector(d, 0.0072).toArray(), mc.clone().addScaledVector(d, 0.0108).toArray(), 0.0013, 0.0004, M('alveolar_macrophage', 0x8fb04a, 0.6), { label: lbl('Alveolar macrophage (clears dust and microbes)') }); }
}

// ───── blood-air barrier inset (thickness exaggerated) ─────
{ const X = 0.185, W = 0.034, D = 0.026, layers = [
    ['Surfactant layer (lines the lumen, lowers surface tension)', 0xcfe8f2, 0.0013, 0.4], ['Type I pneumocyte (thin squamous cell that covers about 95% of the wall)', 0xefc2b6, 0.0024, 1], ['Basement membrane (fused epithelial and endothelial layers)', 0xe7cf72, 0.0016, 1], ['Capillary endothelium', 0xd98f8a, 0.0024, 1]], base = -0.1;
  let y = base; layers.forEach(([l, c, t, op], i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(W, t, D), M('barrier_' + i, c, 0.5, op < 1 ? { transparent: true, opacity: op, depthWrite: false } : {})); m.position.set(B0[0] + X, B0[1] + y - t / 2, B0[2]); reg(RS, 'magnified_barrier_' + i, m, { label: lbl(l) }); y -= t; });
  // the capillary lumen: a half-pipe below the endothelium with red blood cells in single file
  const lum = new THREE.Mesh(new THREE.CylinderGeometry(0.0062, 0.0062, D, 20, 1, true, Math.PI, Math.PI), M('capillary_lumen', 0xd98f8a, 0.5, { side: THREE.DoubleSide, transparent: true, opacity: 0.55, depthWrite: false }));
  lum.rotation.x = Math.PI / 2; lum.position.set(B0[0] + X, B0[1] + y, B0[2]); reg(RS, 'magnified_barrier_lumen', lum, { label: lbl('Capillary endothelium') });
  for (let k = 0; k < 3; k++) { const rg = new THREE.Mesh(new THREE.TorusGeometry(0.0034, 0.0017, 10, 20), M('red_blood_cell', 0xc0272d, 0.45)); rg.rotation.y = 0.6; rg.position.set(B0[0] + X + (k - 1) * 0.0105, B0[1] + y - 0.0032, B0[2] + (k - 1) * 0.001); reg(RS, 'magnified_barrier_rbc_' + k, rg, { label: lbl('Red blood cell (oxygen binds haemoglobin)') }); }
  // gas arrows: oxygen in, carbon dioxide out
  const arrow = (xo, dir, c, l) => { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.0006, 0.0006, 0.012, 8), M('gas_arrow', c, 0.4)); const h = new THREE.Mesh(new THREE.ConeGeometry(0.0017, 0.0035, 10), M('gas_arrow', c, 0.4)); s.position.set(B0[0] + X + xo, B0[1] + base + 0.012, B0[2]); h.position.set(B0[0] + X + xo, B0[1] + base + 0.012 + (dir > 0 ? -0.0073 : 0.0073), B0[2]); if (dir > 0) h.rotation.z = Math.PI; reg(RS, 'magnified_gas_shaft_' + xo, s, { label: lbl(l) }); reg(RS, 'magnified_gas_head_' + xo, h, { label: lbl(l) }); };
  arrow(-0.009, 1, 0x2f7fd0, 'Oxygen diffuses from the alveolus into the blood'); arrow(0.009, -1, 0x7d7d7d, 'Carbon dioxide diffuses from the blood into the alveolus'); }

const alvG = new THREE.Group(); alvG.name = 'magnified_alveolar_unit'; alvG.visible = false; G[RS].children.slice(n0).forEach(o => alvG.add(o)); G[RS].add(alvG); window.__alvG = alvG;
