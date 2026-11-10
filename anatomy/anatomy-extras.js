// Structures added after a review of the model against regional anatomy:
// deep fasciae, posterior abdominal wall and pelvic floor muscles, iliac, popliteal and saphenous vessels,
// knee, spine, shoulder and hip ligaments, menisci, thymus and thoracic duct.
// Fascial sleeves and vessel overlays are fitted to the meshes already in the model, so they follow its proportions.
import { THREE, V, model, SYS, G, M, mat, reg, tube, zc, belly, mm, DP } from './anatomy-part1.js';

model.updateMatrixWorld(true);
const SIDES = [-1, 1], sd = s => s < 0 ? 'right' : 'left', tag = s => ' (' + sd(s) + ')';
const sideRe = (names, s) => new RegExp('^(' + names + ').*\\(' + sd(s) + '\\)$');

// world-space vertices (flat x, y, z array) of the structures whose label matches
function wv(re, keep) {
  const out = [], v = new THREE.Vector3();
  model.traverse(o => {
    if (!o.isMesh || !o.userData.label || o.userData.sys === 'skin' || !re.test(o.userData.label)) return;
    const a = o.geometry.attributes.position; if (!a) return;
    for (let i = 0; i < a.count; i++) { v.fromBufferAttribute(a, i).applyMatrix4(o.matrixWorld); if (!keep || keep(v)) out.push(v.x, v.y, v.z); }
  });
  return out;
}
const slice = (P, y, h) => { const s = []; for (let i = 0; i < P.length; i += 3) if (Math.abs(P[i + 1] - y) < h) s.push(P[i], P[i + 1], P[i + 2]); return s; };
// centre line of a vessel at height y
function cen(re, y, h = 0.004) { const s = slice(wv(re), y, h); if (!s.length) return null; let x = 0, z = 0; const n = s.length / 3; for (let i = 0; i < s.length; i += 3) { x += s[i]; z += s[i + 2]; } return [x / n, y, z / n]; }

// ───────── radial profile of a group of structures: centre and outer (or inner) radius per height and angle ─────────
function profile(P, y0, y1, ny, nb, o = {}) {
  const hy = (y1 - y0) / ny * 0.75 + 0.002, rows = [];
  for (let k = 0; k <= ny; k++) {
    const y = y0 + (y1 - y0) * k / ny, s = slice(P, y, hy); if (s.length < 9) { rows.push(null); continue; }
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (let i = 0; i < s.length; i += 3) { x0 = Math.min(x0, s[i]); x1 = Math.max(x1, s[i]); z0 = Math.min(z0, s[i + 2]); z1 = Math.max(z1, s[i + 2]); }
    const cx = o.cx ?? (x0 + x1) / 2, cz = o.cz ?? (z0 + z1) / 2, r = new Array(nb).fill(NaN);
    for (let i = 0; i < s.length; i += 3) {
      const dx = s[i] - cx, dz = s[i + 2] - cz, d = Math.hypot(dx, dz), b = Math.min(nb - 1, Math.floor(((Math.atan2(dz, dx) + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) * nb));
      r[b] = isNaN(r[b]) ? d : (o.inner ? Math.min(r[b], d) : Math.max(r[b], d));
    }
    const ok = r.map(v => !isNaN(v)); if (!ok.some(Boolean)) { rows.push(null); continue; }
    for (let b = 0; b < nb; b++) if (!ok[b]) { let l = 1, rr = 1; while (isNaN(r[(b - l + nb) % nb])) l++; while (isNaN(r[(b + rr) % nb])) rr++; const a = r[(b - l + nb) % nb], c = r[(b + rr) % nb]; r[b] = a + (c - a) * l / (l + rr); }
    rows.push({ y, cx, cz, r });
  }
  const good = rows.filter(Boolean); if (!good.length) return null;
  rows.forEach((r, i) => { if (!r) { const near = good.reduce((a, g) => Math.abs(g.y - (y0 + (y1 - y0) * i / ny)) < Math.abs(a.y - (y0 + (y1 - y0) * i / ny)) ? g : a); rows[i] = { ...near, y: y0 + (y1 - y0) * i / ny, r: near.r.slice() }; } });
  for (let pass = 0; pass < 2; pass++) { const c = rows.map(r => ({ cx: r.cx, cz: r.cz, r: r.r.slice() })); for (let i = 1; i < rows.length - 1; i++) { rows[i].cx = (c[i - 1].cx + 2 * c[i].cx + c[i + 1].cx) / 4; rows[i].cz = (c[i - 1].cz + 2 * c[i].cz + c[i + 1].cz) / 4; for (let b = 0; b < nb; b++) { const bm = (b + nb - 1) % nb, bp = (b + 1) % nb; rows[i].r[b] = (c[i - 1].r[b] + c[i + 1].r[b] + 2 * c[i].r[b] + c[i].r[bm] + c[i].r[bp]) / 6; } } }
  return { rows, nb, y0, y1 };
}
// position on the profile surface at height y and angle th (radians, 0 = +x, 90 deg = anterior), pushed out by pad
function onProfile(pf, y, th, pad) {
  const t = Math.min(pf.rows.length - 1, Math.max(0, (y - pf.y0) / (pf.y1 - pf.y0) * (pf.rows.length - 1))), i = Math.min(pf.rows.length - 2, Math.floor(t)), f = t - i, A = pf.rows[i], B = pf.rows[i + 1];
  const u = ((th % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / (2 * Math.PI) * pf.nb - 0.5, b0 = ((Math.floor(u) % pf.nb) + pf.nb) % pf.nb, b1 = (b0 + 1) % pf.nb, g = u - Math.floor(u);
  const rr = k => k.r[b0] + (k.r[b1] - k.r[b0]) * g, R = rr(A) + (rr(B) - rr(A)) * f + pad, cx = A.cx + (B.cx - A.cx) * f, cz = A.cz + (B.cz - A.cz) * f;
  return [cx + R * Math.cos(th), y, cz + R * Math.sin(th)];
}
function shellGeo(pf, pad) {
  const pos = [], idx = [], nb = pf.nb, ny = pf.rows.length;
  pf.rows.forEach(r => { for (let b = 0; b <= nb; b++) { const th = (b % nb + 0.5) / nb * 2 * Math.PI, R = r.r[b % nb] + pad; pos.push(r.cx + R * Math.cos(th), r.y, r.cz + R * Math.sin(th)); } });
  for (let i = 0; i < ny - 1; i++) for (let b = 0; b < nb; b++) { const a = i * (nb + 1) + b, c = a + nb + 1; idx.push(a, c, a + 1, c, c + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
// curved plate from a function (u, v) -> point
function plateGeo(nu, nv, f) {
  const pos = [], idx = []; for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) pos.push(...f(i / nu, j / nv));
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const a = i * (nv + 1) + j, c = a + nv + 1; idx.push(a, c, a + 1, c, c + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}

// ───────── materials ─────────
const FA = M('deep_fascia', 0xe9e1d0, 0.6, { side: THREE.DoubleSide, transparent: true, opacity: 0.2, depthWrite: false });
const LIG = M('ligament_band', 0xe9e2cf, 0.55, { side: THREE.DoubleSide });
const FIB = M('fibrocartilage', 0xb9c7d2, 0.5);
const LYM = M('lymphatic', 0xd2e5a8, 0.5);
const THY = M('thymus', 0xdcb59a, 0.65);
const addFascia = (name, label, geo) => { const m = reg('muscular', name, new THREE.Mesh(geo, FA), { label }); m.renderOrder = 3; m.userData.passive = true; return m; };
const toSys = (m, sys) => { m.userData.sys = sys; G[sys].add(m); return m; };

// ───────── investing fascia ─────────
const profiles = {};
for (const s of SIDES) {
  const reg4 = (key, names, y0, y1, ny, label, nm, pad = 0.002) => {
    const P = wv(sideRe(names, s)); if (P.length < 30) return;
    const pf = profile(P, y0, y1, ny, 28); if (!pf) return; profiles[key + s] = pf;
    if (label) addFascia(nm + '_' + sd(s), label + tag(s), shellGeo(pf, pad));
  };
  reg4('thigh', 'Vastus|Rectus femoris|Sartorius|Gracilis|Biceps femoris|Semitendinosus|Semimembranosus|Adductor|Pectineus|Tensor fasciae latae', 0.5, 0.84, 17, 'Fascia lata (thigh)', 'fascia_lata');
  reg4('leg', 'Gastrocnemius|Soleus|Tibialis anterior|Extensor digitorum longus|Extensor hallucis longus|Fibularis|Tibialis posterior|Flexor digitorum longus|Flexor hallucis longus', 0.13, 0.45, 16, 'Crural fascia (leg)', 'crural_fascia');
  reg4('arm', 'Biceps brachii|Triceps brachii|Brachialis|Coracobrachialis', 1.1, 1.3, 10, 'Brachial fascia (arm)', 'brachial_fascia');
  reg4('forearm', 'Pronator teres|Flexor carpi|Flexor digitorum|Flexor pollicis|Palmaris longus|Extensor|Brachioradialis|Supinator|Abductor pollicis', 0.87, 1.06, 9, 'Antebrachial fascia (forearm)', 'antebrachial_fascia');
  // carotid sheath wraps the common carotid artery, internal jugular vein and vagus
  const cs = wv(new RegExp('^(Common carotid|Internal jugular).*\\(' + sd(s) + '\\)$'));
  if (cs.length > 30) { const pf = profile(cs, 1.42, 1.53, 8, 16); if (pf) addFascia('carotid_sheath_' + sd(s), 'Carotid sheath' + tag(s), shellGeo(pf, 0.003)); }
}
{ // investing layer of the deep cervical fascia: a collar round the neck muscles
  const P = wv(/^(Sternocleidomastoid|Trapezius, descending|Splenius|Levator scapulae|Omohyoid|Sternohyoid|Platysma)/); const pf = profile(P, 1.435, 1.525, 8, 36);
  if (pf) addFascia('deep_cervical_fascia', 'Deep cervical fascia (investing layer)', shellGeo(pf, 0.003));
}
{ // transversalis fascia lines the inside of the abdominal wall, deep to transversus abdominis
  const P = wv(/^Transversus abdominis/); const pf = profile(P, 0.9, 1.14, 10, 36, { inner: true, cx: 0 });
  if (pf) addFascia('transversalis_fascia', 'Transversalis fascia', shellGeo(pf, -0.003));
}
{ // pretracheal fascia: a sheet in front of the trachea and thyroid; prevertebral fascia: in front of the cervical vertebral bodies
  const fr = wv(/^(Trachea|Thyroid gland|Isthmus of thyroid)/, v => Math.abs(v.x) < 0.03), ver = wv(/^Vertebra C[1-7]/, v => Math.abs(v.x) < 0.012);
  const maxZ = (P, y) => { const s = slice(P, y, 0.006); let m = -1e9; for (let i = 2; i < s.length; i += 3) m = Math.max(m, s[i]); return m < -1e8 ? null : m; };
  const zAt = (P, y, d) => maxZ(P, y) ?? maxZ(P, y + d) ?? maxZ(P, y - d) ?? 0;
  addFascia('pretracheal_fascia', 'Pretracheal fascia', plateGeo(14, 8, (u, v) => { const y = 1.405 + u * 0.09, x = (v - 0.5) * 0.056; return [x, y, zAt(fr, y, 0.01) + 0.004 - 2.2 * x * x]; }));
  addFascia('prevertebral_fascia', 'Prevertebral fascia', plateGeo(14, 8, (u, v) => { const y = 1.41 + u * 0.14, x = (v - 0.5) * 0.06; return [x, y, zAt(ver, y, 0.01) + 0.004 - 1.2 * x * x]; }));
}
for (const s of SIDES) { // rectus sheath: anterior lamina over the whole muscle, posterior lamina above the arcuate line
  const R = wv(sideRe('Rectus abdominis', s)); if (R.length < 30) continue;
  let x0 = 1e9, x1 = -1e9; for (let i = 0; i < R.length; i += 3) { x0 = Math.min(x0, R[i]); x1 = Math.max(x1, R[i]); }
  const zBin = (y, x, front) => { let m = front ? -1e9 : 1e9, found = false; for (let i = 0; i < R.length; i += 3) if (Math.abs(R[i + 1] - y) < 0.012 && Math.abs(R[i] - x) < 0.012) { m = front ? Math.max(m, R[i + 2]) : Math.min(m, R[i + 2]); found = true; } return found ? m : null; };
  const lam = (front, ya, yb, label, nm) => { const g = plateGeo(16, 6, (u, v) => { const y = ya + u * (yb - ya), x = x0 - 0.006 + v * (x1 - x0 + 0.012); const z = zBin(y, x, front) ?? zBin(y, (x0 + x1) / 2, front) ?? (front ? 0.1 : 0.08); return [x, y, z + (front ? 0.002 : -0.002)]; }); addFascia(nm + '_' + sd(s), label + tag(s), g); };
  lam(true, 0.86, 1.23, 'Rectus sheath, anterior lamina', 'rectus_sheath_anterior'); lam(false, 0.97, 1.23, 'Rectus sheath, posterior lamina', 'rectus_sheath_posterior');
}

// ───────── muscles ─────────
const bellyM = (label, s, pts, r, o) => belly(label + tag(s), pts.map(p => [s * p[0], p[1], p[2]]), r, o);
const rBody = y => y < 1.1 ? 0.0195 : y < 1.39 ? 0.0172 - 0.0044 * (y - 1.1) / 0.29 : 0.0112, rCan = y => y < 1.1 ? 0.011 : y < 1.39 ? 0.0085 : 0.0098;
for (const s of SIDES) {
  bellyM('Psoas major', s, [[0.033, 1.09, -0.072], [0.042, 1.02, -0.068], [0.058, 0.95, -0.05], [0.074, 0.9, 0.0], [0.086, 0.865, 0.042], [0.09, 0.835, 0.03], [0.094, 0.805, -0.004]], 0.0125, { peak: 0.4, mt: DP });
  bellyM('Iliacus', s, [[0.108, 0.975, -0.042], [0.101, 0.93, -0.012], [0.094, 0.895, 0.03], [0.09, 0.868, 0.042]], 0.013, { w: 1.7, d: 0.5, mt: DP, up: [1, 0, 0] });
  bellyM('Quadratus lumborum', s, [[0.082, 0.985, -0.068], [0.07, 1.05, -0.078], [0.06, 1.115, -0.082]], 0.011, { w: 1.5, d: 0.5, mt: DP });
  const mf = []; for (let y = 0.99; y <= 1.381; y += 0.065) mf.push([0.013, y, zc(y) - rBody(y) * 0.85 - rCan(y) * 2 - 0.008]);
  bellyM('Multifidus', s, mf, 0.0055, { w: 1.3, d: 0.8, k: 0.3, peak: 0.5, mt: DP });
  for (let k = 0; k < 4; k++) bellyM('Transversus thoracis', s, [[0.012, 1.222, 0.076], [0.04 + 0.014 * k, 1.335 - 0.032 * k, 0.074]], 0.0026, { w: 1.4, d: 0.5, k: 0.3, mt: DP });
}
const loft = (label, name, A, B) => { const ca = new THREE.CatmullRomCurve3(A.map(p => V(...p))), cb = new THREE.CatmullRomCurve3(B.map(p => V(...p)));
  const g = plateGeo(12, 10, (u, v) => { const a = ca.getPoint(u), b = cb.getPoint(u), p = a.clone().lerp(b, v); p.y -= 0.012 * Math.sin(v * Math.PI); return p.toArray(); });
  const m = reg('muscular', name, new THREE.Mesh(g, mm.deep), { label }); return m; };
for (const s of SIDES) { // levator ani: pubococcygeus and iliococcygeus form the pelvic floor funnel
  const X = a => a.map(p => [s * p[0], p[1], p[2]]);
  loft('Pubococcygeus' + tag(s), 'pubococcygeus_' + sd(s), X([[0.014, 0.822, 0.066], [0.03, 0.83, 0.05], [0.048, 0.836, 0.03]]), X([[0.02, 0.784, 0.01], [0.02, 0.788, -0.03], [0.006, 0.8, -0.062]]));
  loft('Iliococcygeus' + tag(s), 'iliococcygeus_' + sd(s), X([[0.07, 0.838, 0.03], [0.082, 0.84, 0.0], [0.082, 0.835, -0.03]]), X([[0.03, 0.79, 0.012], [0.028, 0.792, -0.03], [0.02, 0.804, -0.06]]));
}

// ───────── vessels: iliac, popliteal and saphenous ─────────
const artR = 0.0078, veinR = 0.0095;
for (const s of SIDES) {
  const fa = new RegExp('^Femoral artery.*\\(' + sd(s) + '\\)'), fv = new RegExp('^Femoral vein.*\\(' + sd(s) + '\\)');
  const path = (re, ys) => ys.map(y => cen(re, y)).filter(Boolean);
  const aA = path(fa, [0.908, 0.895, 0.88, 0.86, 0.84]), aV = path(fv, [0.908, 0.895, 0.88, 0.86, 0.84]);
  if (aA.length > 3) { // the model's femoral vessels already run from the aortic end through the pelvis: label that course as common and external iliac
    tube('circulatory', 'common_iliac_artery_' + sd(s), aA.slice(0, 3), artR + 0.0004, mat.artery, { label: 'Common iliac artery' + tag(s) });
    tube('circulatory', 'external_iliac_artery_' + sd(s), aA.slice(2), artR + 0.0004, mat.artery, { label: 'External iliac artery' + tag(s) });
    const b = aA[2]; tube('circulatory', 'internal_iliac_artery_' + sd(s), [b, [b[0] + s * 0.012, b[1] - 0.02, b[2] - 0.02], [b[0] + s * 0.02, b[1] - 0.045, b[2] - 0.036], [b[0] + s * 0.024, b[1] - 0.07, b[2] - 0.05]], 0.0048, mat.artery, { label: 'Internal iliac artery' + tag(s) });
  }
  if (aV.length > 3) {
    tube('circulatory', 'common_iliac_vein_' + sd(s), aV.slice(0, 3), veinR + 0.0004, mat.vein, { label: 'Common iliac vein' + tag(s) });
    tube('circulatory', 'external_iliac_vein_' + sd(s), aV.slice(2), veinR + 0.0004, mat.vein, { label: 'External iliac vein' + tag(s) });
    const b = aV[2]; tube('circulatory', 'internal_iliac_vein_' + sd(s), [b, [b[0] + s * 0.014, b[1] - 0.02, b[2] - 0.024], [b[0] + s * 0.022, b[1] - 0.045, b[2] - 0.04], [b[0] + s * 0.026, b[1] - 0.068, b[2] - 0.054]], 0.0058, mat.vein, { label: 'Internal iliac vein' + tag(s) });
  }
  // popliteal vessels run behind the knee
  tube('circulatory', 'popliteal_artery_' + sd(s), [[0.088, 0.6, 0.01], [0.09, 0.55, -0.012], [0.095, 0.5, -0.034], [0.098, 0.46, -0.04], [0.1, 0.42, -0.032], [0.1, 0.39, -0.024]].map(p => [s * p[0], p[1], p[2]]), 0.0052, mat.artery, { label: 'Popliteal artery' + tag(s) });
  tube('circulatory', 'popliteal_vein_' + sd(s), [[0.093, 0.6, 0.0], [0.094, 0.55, -0.022], [0.098, 0.5, -0.045], [0.101, 0.46, -0.052], [0.103, 0.42, -0.044], [0.103, 0.39, -0.036]].map(p => [s * p[0], p[1], p[2]]), 0.0062, mat.vein, { label: 'Popliteal vein' + tag(s) });
  // great saphenous vein: medial leg and thigh, up to the saphenofemoral junction. Small saphenous vein: back of the calf to the popliteal vein
  const th = profiles['thigh' + s], lg = profiles['leg' + s], rad = d => d * Math.PI / 180;
  if (th && lg) {
    const flip = a => s < 0 ? 180 - a : a; // angles are written for the left leg; the right leg mirrors them
    const gs = [[0.83, 135], [0.76, 145], [0.66, 155], [0.56, 168], [0.48, 178]].map(([y, a]) => onProfile(th, y, rad(flip(a)), 0.004)).concat([[0.4, 183], [0.3, 182], [0.2, 180], [0.13, 176]].map(([y, a]) => onProfile(lg, y, rad(flip(a)), 0.004)), [[s * 0.082, 0.072, 0.012]]);
    const jn = cen(fv, 0.82); if (jn) gs.unshift([jn[0] + s * 0.004, 0.815, jn[2] + 0.008]);
    tube('circulatory', 'great_saphenous_vein_' + sd(s), gs, 0.0028, mat.vein, { label: 'Great saphenous vein' + tag(s) });
    const ss = [[0.14, 262], [0.2, 266], [0.28, 268], [0.36, 270], [0.43, 270]].map(([y, a]) => onProfile(lg, y, rad(a), 0.004)); ss.unshift([s * 0.116, 0.078, -0.034]); ss.push([s * 0.103, 0.425, -0.046]);
    tube('circulatory', 'small_saphenous_vein_' + sd(s), ss, 0.0024, mat.vein, { label: 'Small saphenous vein' + tag(s) });
  }
}

// ───────── thymus and thoracic duct ─────────
for (const s of SIDES) {
  const t = reg('endocrine', 'thymus_' + sd(s), new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), THY), { label: 'Thymus' + tag(s) });
  t.position.set(s * 0.015, 1.318, 0.068); t.scale.set(0.014, 0.034, 0.0075); t.rotation.z = -s * 0.12;
}
{
  const zf = y => zc(y) + rBody(y) + 0.0035, pts = [[-0.003, 1.075], [-0.003, 1.17], [0.0, 1.27], [0.008, 1.35]].map(([x, y]) => [x, y, zf(y)]).concat([[0.02, 1.405, -0.03], [0.034, 1.424, -0.012], [0.043, 1.426, 0.0]]);
  tube('circulatory', 'thoracic_duct', pts, 0.0017, LYM, { label: 'Thoracic duct' });
  const c = reg('circulatory', 'cisterna_chyli', new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), LYM), { label: 'Cisterna chyli' }); c.position.set(-0.003, 1.07, zf(1.07)); c.scale.set(0.004, 0.012, 0.004);
}

// ───────── ligaments and menisci (skeletal system) ─────────
const lig = (label, name, s, pts, r, o = {}) => { const m = belly(label + (s === 0 ? '' : tag(s)), pts.map(p => [s === 0 ? p[0] : s * p[0], p[1], p[2]]), r, { k: 0.15, mt: LIG, ...o }); m.name = name; return toSys(m, 'skeletal'); };
for (const s of SIDES) {
  // knee: collaterals sit outside the joint, cruciates inside the intercondylar notch
  lig('Medial collateral ligament', 'mcl_' + sd(s), s, [[0.063, 0.472, -0.008], [0.072, 0.445, -0.004], [0.081, 0.41, 0.0]], 0.0058, { w: 1.8, d: 0.35, up: [1, 0, 0] });
  lig('Lateral collateral ligament', 'lcl_' + sd(s), s, [[0.134, 0.47, -0.008], [0.133, 0.455, -0.009], [0.132, 0.441, -0.01]], 0.0022);
  lig('Anterior cruciate ligament', 'acl_' + sd(s), s, [[0.104, 0.466, -0.012], [0.099, 0.456, -0.002], [0.095, 0.448, 0.01]], 0.0034, { k: 0.4 });
  lig('Posterior cruciate ligament', 'pcl_' + sd(s), s, [[0.089, 0.466, 0.0], [0.094, 0.456, -0.01], [0.098, 0.448, -0.02]], 0.0042, { k: 0.4 });
  // menisci: C-shaped fibrocartilage on the tibial plateau
  for (const [nm, cx, R, arc] of [['Medial meniscus', 0.083, 0.0165, 1.65], ['Lateral meniscus', 0.113, 0.0145, 1.85]]) {
    const g = new THREE.TorusGeometry(R, 0.0033, 8, 28, arc * Math.PI); g.scale(1, 1.15, 0.4); g.rotateX(Math.PI / 2);
    const m = new THREE.Mesh(g, FIB), towardNegX = (nm[0] === 'M') === (s > 0); // the C opens away from the joint centre line: medial menisci face the midline
    m.position.set(s * cx, 0.4515, -0.004); m.rotation.y = arc * Math.PI / 2 - (towardNegX ? Math.PI : 0);
    reg('skeletal', nm.toLowerCase().replace(' ', '_') + '_' + sd(s), m, { label: nm + tag(s) });
  }
  // spine: anterior and posterior longitudinal ligaments and the ligamentum flavum run the length of the column
  // (single midline structures are added once, below)
  // shoulder: glenoid labrum and the three glenohumeral ligaments
  const gl = wv(sideRe('Glenoid cavity', s)); if (gl.length) {
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9; for (let i = 0; i < gl.length; i += 3) { x0 = Math.min(x0, gl[i]); x1 = Math.max(x1, gl[i]); y0 = Math.min(y0, gl[i + 1]); y1 = Math.max(y1, gl[i + 1]); z0 = Math.min(z0, gl[i + 2]); z1 = Math.max(z1, gl[i + 2]); }
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2, ry = (y1 - y0) / 2 + 0.001, rz = (z1 - z0) / 2 + 0.001;
    const ring = new THREE.CatmullRomCurve3(Array.from({ length: 16 }, (_, i) => { const t = i / 16 * 2 * Math.PI; return V(cx + s * 0.001, cy + ry * Math.cos(t), cz + rz * Math.sin(t)); }), true);
    reg('skeletal', 'glenoid_labrum_' + sd(s), new THREE.Mesh(new THREE.TubeGeometry(ring, 40, 0.0017, 8, true), FIB), { label: 'Glenoid labrum' + tag(s) });
    [['Superior', 0.55], ['Middle', 0.0], ['Inferior', -0.6]].forEach(([nm, f]) => lig(nm + ' glenohumeral ligament', 'ghl_' + nm.toLowerCase() + '_' + sd(s), s, [[Math.abs(cx) + 0.002, cy + f * ry, cz + rz * 0.7], [Math.abs(cx) + 0.011, cy + f * ry * 1.05, cz + rz * 1.2 + 0.006], [Math.abs(cx) + 0.02, cy + f * ry * 1.1 - 0.004, 0.018]], 0.0022, { w: 1.6, d: 0.5 }));
  }
  // hip: the Y-shaped iliofemoral ligament from the anterior inferior iliac spine to the intertrochanteric line
  lig('Iliofemoral ligament, lateral band', 'iliofemoral_lateral_' + sd(s), s, [[0.094, 0.884, 0.048], [0.106, 0.86, 0.036], [0.114, 0.838, 0.016]], 0.0044, { w: 1.7, d: 0.4 });
  lig('Iliofemoral ligament, medial band', 'iliofemoral_medial_' + sd(s), s, [[0.092, 0.882, 0.05], [0.094, 0.85, 0.036], [0.096, 0.826, 0.02]], 0.0044, { w: 1.7, d: 0.4 });
}
{
  const ys = []; for (let y = 0.972; y <= 1.545; y += 0.03) ys.push(y);
  lig('Anterior longitudinal ligament', 'anterior_longitudinal_ligament', 0, ys.map(y => [0, y, zc(y) + rBody(y) + 0.0013]), 0.0045, { w: 1.2, d: 0.28, k: 0.1, up: [0, 0, 1] });
  lig('Posterior longitudinal ligament', 'posterior_longitudinal_ligament', 0, ys.map(y => [0, y, zc(y) - rBody(y) - 0.0013]), 0.0035, { w: 1.2, d: 0.28, k: 0.1, up: [0, 0, 1] });
  for (const s of SIDES) lig('Ligamentum flavum', 'ligamentum_flavum_' + sd(s), s, ys.map(y => [0.0055, y, zc(y) - rBody(y) * 0.85 - rCan(y) * 2 - 0.0005]), 0.0042, { w: 1.1, d: 0.3, k: 0.1, up: [0, 0, 1] });
}

// ───────── parts lists in the sidebar ─────────
const more = (k, items) => { const sy = SYS.find(x => x.k === k); if (sy && sy.parts) sy.parts.push(...items); };
more('muscular', ['#Deep fasciae', 'Fascia lata (thigh)', 'Crural fascia (leg)', 'Brachial fascia (arm)', 'Antebrachial fascia (forearm)', 'Deep cervical fascia (investing layer)', 'Pretracheal fascia', 'Prevertebral fascia', 'Carotid sheath', 'Transversalis fascia', 'Rectus sheath, anterior lamina', 'Rectus sheath, posterior lamina',
  '#Posterior abdominal wall, back and pelvic floor', 'Psoas major', 'Iliacus', 'Quadratus lumborum', 'Multifidus', 'Transversus thoracis', 'Pubococcygeus', 'Iliococcygeus']);
more('circulatory', ['#Iliac, popliteal and saphenous vessels', 'Common iliac artery', 'External iliac artery', 'Internal iliac artery', 'Common iliac vein', 'External iliac vein', 'Internal iliac vein', 'Popliteal artery', 'Popliteal vein', 'Great saphenous vein', 'Small saphenous vein', '#Lymphatic', 'Thoracic duct', 'Cisterna chyli']);
more('skeletal', ['#Joint ligaments and menisci', 'Medial collateral ligament', 'Lateral collateral ligament', 'Anterior cruciate ligament', 'Posterior cruciate ligament', 'Medial meniscus', 'Lateral meniscus', 'Anterior longitudinal ligament', 'Posterior longitudinal ligament', 'Ligamentum flavum', 'Glenoid labrum', 'Superior glenohumeral ligament', 'Middle glenohumeral ligament', 'Inferior glenohumeral ligament', 'Iliofemoral ligament, lateral band', 'Iliofemoral ligament, medial band']);
more('endocrine', ['Thymus']);
