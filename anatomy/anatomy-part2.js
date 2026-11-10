import { stage, THREE, V, model, SYS, G, M, mat, reg, xf, sph, box, Y, seg, tube, SK, zc, skPt, MS, mm, belly, SU, DP, __nextMcount } from './anatomy-part1.js';
import './anatomy-extras.js';
import './anatomy-alveolus.js';
import './anatomy-tooth.js';
import './anatomy-lymph.js';
import { buildHead } from './anatomy-head.js';
import { buildOral } from './anatomy-oral.js';
import { buildNeck } from './anatomy-neck.js';


// ───────── URINARY ─────────
{
const UR = 'urinary', tr = (o = 1) => o < 1 ? { transparent: true, opacity: o, depthWrite: false } : {};
const um = {
  capsule: M('renal_capsule', 0xf1e4dc, 0.4, tr(0.16)), cortex: M('renal_cortex', 0x9a4a3c, 0.55, tr(0.5)), pyramid: M('renal_medulla', 0x6a2a26, 0.6), papilla: M('renal_papilla', 0xc77a6a, 0.5),
  calyx: M('calyx', 0xeadbb0, 0.5, { side: THREE.DoubleSide }), sinusFat: M('renal_sinus_fat', 0xe8d58a, 0.8, tr(0.35)), adrenal: M('suprarenal_gland', 0xd9a24a, 0.65),
  ureter: M('ureter', 0xe6cfa6, 0.5), wall: M('bladder_wall', 0xd9a898, 0.6, tr(0.42)), muc: M('bladder_mucosa', 0xe7a9a2, 0.5, tr(0.45)), detrusor: M('detrusor', 0xb9786a, 0.6, tr(0.55)),
  trigone: M('trigone', 0xc0646a, 0.5, { side: THREE.DoubleSide }), orifice: M('ureteric_orifice', 0x7a2f32, 0.5), sph: M('sphincter', 0xb04a40, 0.55), ext: M('external_sphincter', 0xa5473b, 0.6),
  urethra: M('urethra', 0xd99a92, 0.5, tr(0.55)), urachus: M('urachus', 0xece6dc, 0.7),
};
function uTube(name, pts, rf, mt, label, R = 14, sys = UR) {
  const c = new THREE.CatmullRomCurve3(pts.map(p => p.isVector3 ? p.clone() : V(...p))), S = Math.max(12, pts.length * 12), g = new THREE.TubeGeometry(c, S, 1, R, false), pos = g.attributes.position;
  for (let i = 0; i <= S; i++) { const ct = c.getPointAt(i / S), r = typeof rf === 'function' ? rf(i / S) : rf; for (let j = 0; j <= R; j++) { const k = i * (R + 1) + j; pos.setXYZ(k, ct.x + (pos.getX(k) - ct.x) * r, ct.y + (pos.getY(k) - ct.y) * r, ct.z + (pos.getZ(k) - ct.z) * r); } }
  g.computeVertexNormals(); return reg(sys, name, new THREE.Mesh(g, mt), { label });
}
const orient = (m, p, dir, axis = Y) => { m.position.copy(p); m.quaternion.setFromUnitVectors(axis, dir.clone().normalize()); return m; };
// bladder (moderately filled), ellipsoid frame
const Bc = V(0, 0.85, 0.038), BR = V(0.034, 0.028, 0.027);
const BW = (n, k = 1) => { const d = V(...n).normalize(); return Bc.clone().add(V(d.x * BR.x * k, d.y * BR.y * k, d.z * BR.z * k)); };
const UO = s => BW([s * 0.4, -0.6, -0.69], 0.89), IUO = BW([0, -0.92, 0.39], 0.89), NECK = BW([0, -0.92, 0.39], 1.0);
for (const s of [-1, 1]) {
  const sd = s < 0 ? 'right' : 'left', n = x => `${x}_${sd}`, lb = t => `${t} (${sd})`;
  const a = 0.03, b = 0.056, c = 0.019, yk = s < 0 ? 1.05 : 1.064;
  const mk = new THREE.Matrix4().compose(V(s * 0.07, yk, -0.06), new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.2, s * 0.5, s * 0.2)), V(1, 1, 1));
  const W = p => V(p[0] * a, p[1] * b, p[2] * c).applyMatrix4(mk);
  const bean = (k, nm, mt, label) => {
    const g = new THREE.SphereGeometry(1, 72, 48), pa = g.attributes.position;
    for (let i = 0; i < pa.count; i++) { let x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i); const m = Math.max(0, -s * x), dent = 0.6 * Math.exp(-((y / 0.38) ** 2)) * m ** 4;
      x *= (1 - dent) * (1 + 0.06 * y); pa.setXYZ(i, x * a * k, y * b * k, z * c * k); }
    g.applyMatrix4(mk); g.computeVertexNormals(); const o = reg(UR, nm, new THREE.Mesh(g, mt), { label }); return o;
  };
  bean(1.035, n('renal_capsule'), um.capsule, lb('Renal capsule')).renderOrder = 2;
  bean(1, n('renal_cortex'), um.cortex, lb('Renal cortex')).renderOrder = 1;
  // medullary pyramids with papillae and minor calyces
  const S0 = [-s * 0.1, 0, 0], cups = [];
  for (let i = 0; i < 8; i++) {
    const ph = -1.2 + (2.4 * i) / 7, ps = i % 2 ? 0.42 : -0.42, d = [s * Math.cos(ph) * Math.cos(ps), Math.sin(ph), Math.cos(ph) * Math.sin(ps)];
    const B = W([d[0] * 0.8, d[1] * 0.8, d[2] * 0.8]), A = W([S0[0] + d[0] * 0.3, d[1] * 0.3, d[2] * 0.3]), ax = A.clone().sub(B), h = ax.length();
    const cg = new THREE.ConeGeometry(0.0092, h, 20, 1); cg.translate(0, h / 2, 0);
    reg(UR, n('renal_pyramid_' + i), orient(new THREE.Mesh(cg, um.pyramid), B, ax), { label: lb('Renal pyramid (medulla)') });
    sph(UR, n('renal_papilla_' + i), 0.0022, A.toArray(), um.papilla, { label: lb('Renal papilla') });
    const cup = new THREE.Mesh(new THREE.SphereGeometry(0.0042, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), um.calyx);
    reg(UR, n('minor_calyx_' + i), orient(cup, A.clone().addScaledVector(ax.clone().normalize(), -0.001), ax.clone().negate()), { label: lb('Minor calyx') });
    cups.push([A.clone().addScaledVector(ax.clone().normalize(), 0.003), ph]);
  }
  const MU = W([-s * 0.3, 0.38, -0.15]), ML = W([-s * 0.3, -0.4, -0.15]), PV = W([-s * 0.45, -0.08, -0.25]), EX = W([-s * 0.78, -0.25, -0.25]);
  cups.forEach(([p, ph], i) => { const M0 = ph > 0 ? MU : ML; uTube(n('minor_calyx_neck_' + i), [p, p.clone().lerp(M0, 0.55), M0], 0.0019, um.calyx, lb('Minor calyx'), 8); });
  uTube(n('major_calyx_upper'), [MU, MU.clone().lerp(PV, 0.5), PV], 0.0032, um.calyx, lb('Major calyx, upper'), 10);
  uTube(n('major_calyx_lower'), [ML, ML.clone().lerp(PV, 0.5), PV], 0.0032, um.calyx, lb('Major calyx, lower'), 10);
  uTube(n('renal_pelvis'), [W([-s * 0.25, 0.02, -0.2]), PV, PV.clone().lerp(EX, 0.5), EX], u => 0.0068 - 0.0035 * u, um.calyx, lb('Renal pelvis'), 16);
  sph(UR, n('renal_sinus_fat'), 1, W([-s * 0.32, 0, 0]).toArray(), um.sinusFat, { scale: [a * 0.32, b * 0.5, c * 0.6], label: lb('Renal sinus fat') }).renderOrder = 1;
  // renal vessels: vein in front, artery in the middle, pelvis behind
  const HA = W([-s * 0.62, 0.06, 0.02]), HV = W([-s * 0.66, 0.0, 0.42]);
  const RA = s < 0 ? [[0.012, yk + 0.01, -0.034], [-0.008, yk + 0.008, -0.045], [-0.03, yk + 0.004, -0.047]] : [[0.018, yk - 0.004, -0.03], [0.034, yk - 0.003, -0.036]];
  uTube(n('renal_artery'), [...RA.map(p => V(...p)), HA], 0.0028, mat.artery, lb('Renal artery'), 10, 'circulatory');
  const RV = s < 0 ? [[-0.024, yk + 0.002, -0.027], [-0.034, yk - 0.001, -0.032]] : [[-0.012, yk - 0.022, -0.026], [0.012, yk - 0.022, -0.0125], [0.036, yk - 0.018, -0.024]];
  uTube(n('renal_vein'), [...RV.map(p => V(...p)), HV], 0.0042, mat.vein, lb('Renal vein'), 10, 'circulatory');
  // intrarenal vessels: segmental divisions in the sinus, interlobar between pyramids, arcuate over the pyramid bases
  const AD = [W([-s * 0.4, 0.06, 0.14]), W([-s * 0.4, -0.02, -0.14])], VD = [W([-s * 0.42, 0.12, 0.34]), W([-s * 0.42, -0.14, 0.34])];
  AD.forEach((p, i) => uTube(n('segmental_artery_' + i), [HA, HA.clone().lerp(p, 0.5), p], u => 0.0022 - 0.0004 * u, mat.artery, lb('Segmental artery'), 8));
  VD.forEach((p, i) => uTube(n('renal_vein_tributary_' + i), [HV, HV.clone().lerp(p, 0.5), p], u => 0.0032 - 0.0008 * u, mat.vein, lb('Renal vein'), 8));
  for (let i = 0; i < 7; i++) {
    const ph = -1.2 + (2.4 * (i + 0.5)) / 7, cx = s * Math.cos(ph), cy = Math.sin(ph), at = (k, z) => W([S0[0] * (1 - k) + cx * k, cy * k, z]);
    uTube(n('interlobar_artery_' + i), [AD[i % 2], at(0.2, i % 2 ? -0.1 : 0.1), at(0.36, 0), at(0.6, 0), at(0.78, 0)], u => 0.0013 - 0.0005 * u, mat.artery, lb('Interlobar artery'), 6);
    const arc = []; for (let j = 0; j <= 6; j++) { const a = ph - 0.19 + (0.38 * j) / 6; arc.push(W([s * Math.cos(a) * 0.79, Math.sin(a) * 0.79, 0])); }
    uTube(n('arcuate_artery_' + i), arc, 0.00065, mat.artery, lb('Arcuate artery'), 6);
    uTube(n('interlobar_vein_' + i), [VD[cy > 0 ? 0 : 1], at(0.22, 0.24), at(0.38, 0.16), at(0.6, 0.14), at(0.76, 0.12)], u => 0.0014 - 0.0005 * u, mat.vein, lb('Interlobar vein'), 6);
  }
  // suprarenal glands: pyramidal on the right, crescentic on the left
  if (s < 0) { const g = new THREE.SphereGeometry(1, 48, 32), pa = g.attributes.position;
    for (let i = 0; i < pa.count; i++) { let x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i); const t = (y + 1) / 2;
      x *= 1 - 0.72 * t ** 1.2; z *= 0.34 * (1 - 0.45 * t); if (y < 0) y += 0.55 * (1 - Math.min(1, x * x)) * -y;
      pa.setXYZ(i, x * 0.015, y * 0.0125, z * 0.012); }
    const q = new THREE.Quaternion(); mk.decompose(V(), q, V()); g.applyQuaternion(q); g.translate(...W([0.12, 1.0, 0]).add(V(0, 0.008, 0)).toArray()); g.computeVertexNormals();
    reg(UR, n('suprarenal_gland'), new THREE.Mesh(g, um.adrenal), { label: lb('Suprarenal gland') }); }
  else sph(UR, n('suprarenal_gland'), 1, W([-0.5, 0.8, 0.1]).add(V(0, 0.006, 0)).toArray(), um.adrenal, { scale: [0.0055, 0.02, 0.011], rot: [-0.2, 0.5, 0.55], label: lb('Suprarenal gland') });
  // ureter: abdominal part on psoas, crossing the pelvic brim, pelvic part, oblique intramural part
  const UE = BW([s * 0.5, -0.45, -0.74], 1.0), UOr = UO(s), P = (x, y, z) => V(s * x, y, z);
  const ua = [EX, P(0.048, yk - 0.04, -0.054), P(0.044, yk - 0.085, -0.05), P(0.041, 0.945, -0.042), P(0.042, 0.9, -0.032)];
  uTube(n('ureter_abdominal'), ua, u => 0.0026 - 0.0008 * Math.exp(-((u / 0.08) ** 2)) - 0.0006 * Math.exp(-(((u - 1) / 0.08) ** 2)), um.ureter, lb('Ureter, abdominal part'), 10);
  uTube(n('ureter_pelvic'), [ua[4], P(0.048, 0.875, -0.025), P(0.044, 0.85, -0.01), P(0.03, 0.838, 0.008), UE], u => 0.0024 - 0.0006 * Math.exp(-((u / 0.1) ** 2)), um.ureter, lb('Ureter, pelvic part'), 10);
  uTube(n('ureter_intramural'), [UE, UE.clone().lerp(UOr, 0.5).add(V(0, -0.0005, 0)), UOr], 0.0017, um.ureter, lb('Ureter, intramural part'), 10);
  const ot = new THREE.Mesh(new THREE.TorusGeometry(0.0022, 0.0008, 8, 18), um.orifice);
  reg(UR, n('ureteric_orifice'), orient(ot, UOr, UOr.clone().sub(Bc), V(0, 0, 1)), { label: lb('Ureteric orifice') });
}
// bladder wall, rugose mucosa, trigone, detrusor bundles
{
  const ell = (k, f) => { const g = new THREE.SphereGeometry(1, 64, 44), pa = g.attributes.position;
    for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i), r = k * (f ? f(x, y, z) : 1); pa.setXYZ(i, Bc.x + x * BR.x * r, Bc.y + y * BR.y * r, Bc.z + z * BR.z * r); }
    g.computeVertexNormals(); return g; };
  reg(UR, 'urinary_bladder', new THREE.Mesh(ell(1), um.wall), { label: 'Urinary bladder' }).renderOrder = 2;
  const tri = [UO(-1), UO(1), IUO].map(p => p.clone().sub(Bc).divide(BR).normalize());
  const smooth = (x, y, z) => { const p = V(x, y, z); return Math.max(0, Math.min(1, (p.dot(tri[0].clone().add(tri[1]).add(tri[2]).normalize()) - 0.82) / 0.08)); };
  reg(UR, 'bladder_mucosa', new THREE.Mesh(ell(0.9, (x, y, z) => 1 + (1 - smooth(x, y, z)) * 0.035 * Math.sin(9 * Math.atan2(z, x) + 6 * y + 2 * Math.sin(5 * y)) * Math.sin(7 * y + 3 * x)), um.muc), { label: 'Bladder mucosa (rugae)' }).renderOrder = 1;
  const N = 10, pos = [], idx = [], at = (i, j) => (i * (i + 1)) / 2 + j;
  for (let i = 0; i <= N; i++) for (let j = 0; j <= i; j++) { const u = i / N, w = i ? j / i : 0, d = tri[2].clone().multiplyScalar(1 - u).addScaledVector(tri[0], u * (1 - w)).addScaledVector(tri[1], u * w).normalize();
    pos.push(Bc.x + d.x * BR.x * 0.893, Bc.y + d.y * BR.y * 0.893, Bc.z + d.z * BR.z * 0.893); }
  for (let i = 0; i < N; i++) for (let j = 0; j <= i; j++) { idx.push(at(i, j), at(i + 1, j), at(i + 1, j + 1)); if (j < i) idx.push(at(i, j), at(i + 1, j + 1), at(i, j + 1)); }
  const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); tg.setIndex(idx); tg.computeVertexNormals();
  reg(UR, 'trigone', new THREE.Mesh(tg, um.trigone), { label: 'Trigone' });
  for (let k = 0; k < 16; k++) { const th0 = (k / 16) * 2 * Math.PI, tw = (k % 2 ? 1 : -1) * (0.5 + 0.25 * Math.sin(k * 2.3)), pts = [];
    for (let i = 0; i <= 28; i++) { const u = i / 28, al = 0.1 + u * 2.5, th = th0 + tw * u + 0.08 * Math.sin(u * 9 + k); pts.push(BW([Math.sin(al) * Math.cos(th), Math.cos(al), Math.sin(al) * Math.sin(th)], 1.008)); }
    uTube('detrusor_bundle_' + k, pts, u => 0.00045 + 0.00025 * Math.sin(Math.PI * u), um.detrusor, 'Detrusor muscle', 6); }
  [0.1, -0.45].forEach((cy, k) => { const sa = Math.sqrt(1 - cy * cy), pts = []; for (let i = 0; i <= 40; i++) { const th = (i / 40) * 2 * Math.PI; pts.push(BW([sa * Math.cos(th), cy, sa * Math.sin(th)], 1.012)); }
    uTube('detrusor_circular_' + k, pts, 0.0005, um.detrusor, 'Detrusor muscle', 6); });
  const ui = new THREE.Mesh(new THREE.TorusGeometry(0.0026, 0.0008, 8, 18), um.orifice); reg(UR, 'internal_urethral_orifice', orient(ui, IUO, IUO.clone().sub(Bc), V(0, 0, 1)), { label: 'Internal urethral orifice' });
  const UPts = [IUO, NECK, V(0, 0.815, 0.0478), V(0, 0.806, 0.048), V(0, 0.796, 0.05)], uc = new THREE.CatmullRomCurve3(UPts);
  uTube('urethra_prostatic', UPts, 0.0024, um.urethra, 'Urethra, prostatic part', 12);
  uTube('urethra_membranous', [V(0, 0.796, 0.05), V(0, 0.7925, 0.051), V(0, 0.789, 0.0525)], 0.0022, um.urethra, 'Urethra, membranous part', 12);
  const is = new THREE.Mesh(new THREE.TorusGeometry(0.0042, 0.0016, 10, 24), um.sph); reg(UR, 'internal_urethral_sphincter', orient(is, uc.getPoint(0.27), uc.getTangent(0.27), V(0, 0, 1)), { label: 'Internal urethral sphincter' });
  const es = new THREE.Mesh(new THREE.TorusGeometry(0.0046, 0.0019, 10, 24), um.ext); reg(UR, 'external_urethral_sphincter', orient(es, V(0, 0.7925, 0.051), V(0, -1, 0.29), V(0, 0, 1)), { label: 'External urethral sphincter' });
  uTube('median_umbilical_ligament', [BW([0, 0.97, 0.25], 1), V(0, 0.9, 0.062), V(0, 0.94, 0.078), V(0, 0.975, 0.084)], 0.0012, um.urachus, 'Median umbilical ligament (urachus)', 6);
}
}
// ───────── REPRODUCTIVE (male) ─────────
{
const RP = 'reproductive', PI2 = Math.PI * 2, X = V(1, 0, 0);
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }, ga = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));
const TP = op => ({ transparent: true, opacity: op, depthWrite: false }), DS = { side: THREE.DoubleSide };
const PR = (name, color, rough, o = {}) => { const { sss = 0.3, sc = 0x7b1e1e, cc = 0.3, ...rest } = o; return new THREE.MeshPhysicalMaterial({ name, color, roughness: rough, metalness: 0, clearcoat: cc, clearcoatRoughness: 0.3, sheen: sss, sheenColor: new THREE.Color(sc), sheenRoughness: 0.5, ...rest }); };
const rm = {
  skin: PR('scrotal_skin', 0x80493e, 0.5, { sss: 0.4, sc: 0xb06050, cc: 0.1, ...TP(0.3), ...DS }), pskin: PR('penile_skin', 0x8a564a, 0.45, { sss: 0.4, sc: 0xb06050, cc: 0.1, ...TP(0.26) }),
  raphe: M('median_raphe', 0x5e3229, 0.6), dartos: PR('dartos_fascia', 0xb7735f, 0.55, { ...TP(0.16), ...DS }),
  esf: M('external_spermatic_fascia', 0xe3d6c4, 0.7, { ...TP(0.13), ...DS }), isf: M('internal_spermatic_fascia', 0xd9cdb8, 0.7, { ...TP(0.15), ...DS }), crem: PR('cremaster_muscle', 0xb04a3c, 0.5),
  tv: PR('tunica_vaginalis', 0xdfe6ee, 0.15, { cc: 1, ...TP(0.18), ...DS }), tvv: PR('tunica_vaginalis_visceral', 0xf4f6f8, 0.12, { cc: 1, ...TP(0.12) }),
  alb: PR('tunica_albuginea', 0xebebe6, 0.35, { sss: 0.15, sc: 0xffffff, cc: 0.6, ...TP(0.5) }), par: PR('testis_parenchyma', 0xc9866f, 0.4, { sss: 0.5, sc: 0xd07060 }), sept: M('septula_testis', 0xf2efe6, 0.5, DS),
  epi: PR('epididymis', 0xc78f7a, 0.45, { sss: 0.4 }), duct: PR('ductus_deferens', 0xeee3cc, 0.35, { cc: 0.5 }), cord: M('spermatic_cord', 0xe8dcc8, 0.7, TP(0.22)), ring: M('inguinal_ring', 0xd8cbb0, 0.6),
  sv: PR('seminal_vesicle', 0xd8b58e, 0.45), svEnv: M('seminal_vesicle_capsule', 0xd8b58e, 0.6, TP(0.25)), ej: M('ejaculatory_duct', 0xe8d9a8, 0.5), dark: M('orifice', 0x4a1a1c, 0.6),
  pros: PR('prostate_capsule', 0xa66b63, 0.42, { ...TP(0.36), ...DS }), pz: PR('prostate_peripheral_zone', 0x9a5f57, 0.42, { ...TP(0.55), ...DS }), afs: PR('anterior_fibromuscular_stroma', 0xb98a80, 0.5, { ...TP(0.5), ...DS }),
  cz: PR('prostate_central_zone', 0x8f544d, 0.42), tz: PR('prostate_transition_zone', 0xb47a6f, 0.42), crest: PR('urethral_crest', 0xd98a86, 0.3),
  ccAlb: PR('corpus_cavernosum_albuginea', 0xebebe6, 0.35, { sss: 0.15, sc: 0xffffff, ...TP(0.42) }), erect: PR('erectile_tissue', 0x692323, 0.2, { sss: 0.4, sc: 0x9a2a2a, cc: 0.5 }),
  spong: PR('corpus_spongiosum', 0x7d3434, 0.22, { sss: 0.4, cc: 0.5, ...TP(0.72) }), glans: PR('glans_penis', 0xb4636a, 0.28, { sss: 0.5, sc: 0xc04050, cc: 0.6 }), neck: PR('collum_glandis', 0x9c525a, 0.3),
  buck: M('bucks_fascia', 0xe6dccc, 0.6, TP(0.16)), mus: PR('perineal_muscle', 0xa5473b, 0.55, TP(0.55)), memb: M('perineal_membrane', 0xe3d6c0, 0.7, { ...TP(0.3), ...DS }),
  urethra: PR('spongy_urethra', 0xd99a92, 0.3), gland: PR('bulbourethral_gland', 0xd9b58e, 0.45), nerve: M('dorsal_nerve', 0xe1ad66, 0.5), fascia: M('rectoprostatic_fascia', 0xe8dcc8, 0.7, { ...TP(0.25), ...DS }),
};
const P3 = p => p.isVector3 ? p.clone() : V(...p);
function rt(name, pts, rf, mt, label, R = 12, sys = RP) {
  const c = new THREE.CatmullRomCurve3(pts.map(P3)), S = Math.max(16, pts.length * 12), g = new THREE.TubeGeometry(c, S, 1, R, false), pos = g.attributes.position;
  for (let i = 0; i <= S; i++) { const ct = c.getPointAt(i / S); for (let j = 0; j <= R; j++) { const k = i * (R + 1) + j, r = typeof rf === 'function' ? rf(i / S, j / R) : rf; pos.setXYZ(k, ct.x + (pos.getX(k) - ct.x) * r, ct.y + (pos.getY(k) - ct.y) * r, ct.z + (pos.getZ(k) - ct.z) * r); } }
  g.computeVertexNormals(); return reg(sys, name, new THREE.Mesh(g, mt), { label });
}
function ell(name, mk, ax, k, mt, label, f, seg = 40) {
  const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7)), pa = g.attributes.position;
  for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i), q = f ? f(x, y, z) : [x, y, z, 1]; pa.setXYZ(i, q[0] * ax[0] * k * q[3], q[1] * ax[1] * k * q[3], q[2] * ax[2] * k * q[3]); }
  g.applyMatrix4(mk); g.computeVertexNormals(); return reg(RP, name, new THREE.Mesh(g, mt), { label });
}
function grid(name, nu, nv, fn, mt, label) {
  const pos = [], idx = []; for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) { const p = fn(i / nu, j / nv); pos.push(p.x, p.y, p.z); }
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const a = i * (nv + 1) + j, b = a + nv + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return reg(RP, name, new THREE.Mesh(g, mt), { label });
}
const ringAt = (name, p, dir, r, t, mt, label) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, 8, 28), mt); m.position.copy(p); m.quaternion.setFromUnitVectors(V(0, 0, 1), dir.clone().normalize()); return reg(RP, name, m, { label }); };
const T4 = (p, q = new THREE.Quaternion()) => new THREE.Matrix4().compose(p, q, V(1, 1, 1));
// penile shaft centreline (flaccid, hanging); D = dorsal direction
const SC = new THREE.CatmullRomCurve3([[0, 0.802, 0.084], [0, 0.802, 0.096], [0, 0.794, 0.107], [0, 0.778, 0.112], [0, 0.758, 0.113], [0, 0.744, 0.1125]].map(p => V(...p)));
const off = (u, dx, dd) => { const T = SC.getTangentAt(u), D = new THREE.Vector3().crossVectors(T, X).normalize(); return SC.getPointAt(u).add(V(dx, 0, 0)).addScaledVector(D, dd); };
const line = (dx, dd, u0 = 0, u1 = 1, n = 16) => { const a = []; for (let i = 0; i <= n; i++) a.push(off(u0 + ((u1 - u0) * i) / n, dx, dd)); return a; };

for (const s of [-1, 1]) {
  const sd = s < 0 ? 'right' : 'left', n = x => x + '_' + sd, lb = t => t + ' (' + sd + ')';
  // testis and its coverings
  const ax = [0.012, 0.021, 0.014], mk = T4(V(s * 0.019, s < 0 ? 0.754 : 0.744, 0.072), new THREE.Quaternion().setFromEuler(new THREE.Euler(0.28, 0, -s * 0.12)));
  const W = (p, k = 1) => V(p[0] * ax[0] * k, p[1] * ax[1] * k, p[2] * ax[2] * k).applyMatrix4(mk);
  ell(n('testis_parenchyma'), mk, ax, 0.965, rm.par, lb('Testis, parenchyma (seminiferous lobules)'));
  ell(n('tunica_albuginea'), mk, ax, 1, rm.alb, lb('Tunica albuginea')).renderOrder = 2;
  ell(n('tunica_vaginalis_visceral'), mk, ax, 1.015, rm.tvv, lb('Tunica vaginalis (visceral layer)')).renderOrder = 3;
  ell(n('tunica_vaginalis_parietal'), mk, ax, 1.14, rm.tv, lb('Tunica vaginalis (parietal layer)')).renderOrder = 3;
  { const g = new THREE.SphereGeometry(1, 20, 14); g.scale(ax[0] * 0.14, ax[1] * 0.62, ax[2] * 0.14); g.translate(s * 0.12 * ax[0], 0.12 * ax[1], -0.8 * ax[2]); g.applyMatrix4(mk); reg(RP, n('mediastinum_testis'), new THREE.Mesh(g, rm.sept), { label: lb('Mediastinum testis') }); }
  for (let k = 0; k < 14; k++) { const ph = -1.9 + (3.8 * k) / 13, yk = 0.55 * Math.sin(k * 1.7), c = Math.sqrt(1 - yk * yk), st = [s * 0.12, 0.12 + 0.5 * yk, -0.78], en = [Math.sin(ph) * c * 0.965, yk * 0.965, Math.cos(ph) * c * 0.965];
    rt(n('septulum_testis_' + k), [W(st), W(st.map((v, i) => (v + en[i]) / 2)), W(en)], 0.0002, rm.sept, lb('Septula testis'), 4); }
  // epididymis: head on the upper pole, body down the posterolateral border, tail at the lower pole
  const EC = new THREE.CatmullRomCurve3([[s * 0.28, 0.98, -0.42], [s * 0.45, 0.72, -0.85], [s * 0.55, 0.3, -1.03], [s * 0.55, -0.2, -1.03], [s * 0.47, -0.62, -0.9], [s * 0.28, -0.95, -0.6]].map(p => W(p)));
  const er = u => (0.0026 + 0.0028 * ss(0.32, 0, u) + 0.0007 * ss(0.78, 1, u)) * (1 + 0.14 * ss(0.32, 0, u) * Math.abs(Math.sin(u * 70)));
  [['head', 'head (caput)', 0, 0.3], ['body', 'body (corpus)', 0.28, 0.76], ['tail', 'tail (cauda)', 0.74, 1]].forEach(([nm, l, a, b]) => { const pts = []; for (let i = 0; i <= 10; i++) pts.push(EC.getPointAt(a + ((b - a) * i) / 10));
    rt(n('epididymis_' + nm), pts, u => er(a + (b - a) * u) * (nm === 'head' ? Math.sqrt(Math.max(0.15, ss(0, 0.12, u))) : 1), rm.epi, lb('Epididymis, ' + l), 14); });
  { const reteM = PR('rete_testis', 0xe9d2b8, 0.4), stM = PR('seminiferous_tubule', 0xd9937a, 0.45, { sss: 0.3 }), efM = PR('efferent_ductule', 0xd8a088, 0.4);
    rt(n('rete_testis'), [W([s * 0.1, -0.25, -0.78]), W([s * 0.12, 0.15, -0.8]), W([s * 0.14, 0.55, -0.76])], 0.0011, reteM, lb('Rete testis'), 8);
    for (let k = 0; k < 8; k++) { const a = W([s * 0.14, 0.4 + 0.05 * k, -0.76]), b = EC.getPointAt(0.02 + 0.03 * k), pts = [];
      for (let i = 0; i <= 12; i++) { const t = i / 12, w = Math.sin(t * Math.PI) * 0.0012; pts.push(a.clone().lerp(b, t).add(V(0, w * Math.sin(t * 14 + k), w * Math.cos(t * 14 + k)))); }
      rt(n('efferent_ductule_' + k), pts, 0.00035, efM, lb('Efferent ductules'), 5); }
    for (let k = 0; k < 13; k++) { const ph = -1.9 + (3.8 * (k + 0.5)) / 13, yk = 0.55 * Math.sin((k + 0.5) * 1.7), c = Math.sqrt(1 - yk * yk), st = [s * 0.12, 0.12 + 0.5 * yk, -0.78], en = [Math.sin(ph) * c * 0.9, yk * 0.9, Math.cos(ph) * c * 0.9], pts = [];
      for (let i = 0; i <= 30; i++) { const t = i / 30, r = 0.12 + 0.8 * Math.sin(Math.PI * t), sd2 = 0.1 * (1 - 2 * t), wg = 0.04 * Math.sin(t * 40 + k);
        pts.push(W(st.map((v, j) => v + (en[j] - v) * r + (j === 1 ? sd2 + wg : j === 0 ? wg : 0)))); }
      rt(n('seminiferous_tubule_' + k), pts, 0.00028, stM, lb('Seminiferous tubules'), 5); } }
  // spermatic cord: testis to superficial ring, inguinal canal, deep ring
  const CP = [W([0, 1.1, -0.5]), V(s * 0.02, 0.786, 0.08), V(s * 0.022, 0.808, 0.087), V(s * 0.026, 0.832, 0.087), V(s * 0.04, 0.847, 0.079), V(s * 0.055, 0.86, 0.066)], CC = new THREE.CatmullRomCurve3(CP);
  const cs = (u0, u1, k, o) => { const a = []; for (let i = 0; i <= k; i++) a.push(CC.getPointAt(u0 + ((u1 - u0) * i) / k).add(o)); return a; };
  rt(n('spermatic_cord'), CP, u => 0.0055 - 0.0007 * u, rm.cord, lb('Spermatic cord'), 16).renderOrder = 4;
  ringAt(n('superficial_inguinal_ring'), CP[3], CP[4].clone().sub(CP[2]), 0.0068, 0.0009, rm.ring, lb('Superficial inguinal ring'));
  ringAt(n('deep_inguinal_ring'), CP[5], CP[5].clone().sub(CP[4]), 0.0064, 0.0009, rm.ring, lb('Deep inguinal ring'));
  const mk2 = mk.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.06 * ax[1], -0.16 * ax[2])), ax2 = [ax[0] * 1.32, ax[1] * 1.2, ax[2] * 1.42];
  ell(n('internal_spermatic_fascia'), mk2, ax2, 1, rm.isf, lb('Internal spermatic fascia')).renderOrder = 4;
  ell(n('external_spermatic_fascia'), mk2, ax2, 1.1, rm.esf, lb('External spermatic fascia')).renderOrder = 4;
  for (let k = 0; k < 7; k++) { const b = -1.05 + (2.1 * k) / 6, pts = []; for (let i = 0; i <= 30; i++) { const t = 0.4 + ((PI2 - 0.8) * i) / 30; pts.push(V(Math.sin(t) * Math.sin(b) * ax2[0] * 1.05, Math.cos(t) * ax2[1] * 1.05, Math.sin(t) * Math.cos(b) * ax2[2] * 1.05).applyMatrix4(mk2)); }
    rt(n('cremaster_loop_' + k), pts, 0.0004, rm.crem, lb('Cremaster muscle'), 5); }
  for (let k = 0; k < 3; k++) { const a0 = (k * PI2) / 3, pts = []; for (let i = 0; i <= 16; i++) { const u = 0.05 + (0.6 * i) / 16; pts.push(CC.getPointAt(u).add(V(Math.cos(a0 + 4 * u) * 0.0057, 0, Math.sin(a0 + 4 * u) * 0.0057))); }
    rt(n('cremaster_cord_' + k), pts, 0.0005, rm.crem, lb('Cremaster muscle'), 5); }
  // ductus deferens: tail of epididymis, back of the cord, deep ring, lateral pelvic wall, over the ureter, behind the bladder
  const DD = [W([s * 0.26, -0.98, -0.66]), W([s * 0.1, -0.8, -1.1]), W([s * 0.06, -0.2, -1.22]), W([s * 0.03, 0.5, -1.2]), ...cs(0.06, 1, 10, V(0, 0, -0.0026)), V(s * 0.064, 0.861, 0.045), V(s * 0.06, 0.856, 0.022), V(s * 0.048, 0.854, 0.007), V(s * 0.034, 0.853, 0.004), V(s * 0.024, 0.85, 0.006)];
  rt(n('ductus_deferens'), DD, 0.0013, rm.duct, lb('Ductus deferens'), 10);
  rt(n('testicular_artery'), [W([s * 0.1, -0.4, -0.98]), W([s * 0.12, 0.3, -1.0]), W([0, 1.0, -0.6]), ...cs(0.04, 1, 10, V(s * 0.0018, 0, 0.0016))], 0.0008, mat.artery, lb('Testicular artery'), 8);
  for (let k = 0; k < 6; k++) { const a = (k / 6) * PI2, pts = []; for (let i = 0; i <= 24; i++) { const u = 0.02 + (0.5 * i) / 24; pts.push(CC.getPointAt(u).add(V(Math.cos(a + 5 * u) * 0.0031 + 0.0007 * Math.sin(u * 60 + k), 0, Math.sin(a + 5 * u) * 0.0031))); }
    rt(n('pampiniform_plexus_' + k), pts, 0.0008, mat.vein, lb('Pampiniform venous plexus'), 6); }
  rt(n('testicular_vein_cord'), cs(0.5, 1, 8, V(-s * 0.0022, 0, 0.0012)), 0.0016, mat.vein, lb('Testicular vein'), 8);
  tube('circulatory', n('testicular_artery_abdominal'), [[s * 0.055, 0.86, 0.066], [s * 0.061, 0.872, 0.045], [s * 0.057, 0.9, 0.012], [s * 0.049, 0.95, -0.022], [s * 0.035, 1.0, -0.03], [0.015 + s * 0.0045, 1.035, -0.024]], 0.0008, mat.artery, { label: lb('Testicular artery') });
  tube('circulatory', n('testicular_vein_abdominal'), [[s * 0.056, 0.859, 0.064], [s * 0.064, 0.871, 0.044], [s * 0.06, 0.9, 0.01], [s * 0.052, 0.95, -0.021], ...(s < 0 ? [[-0.03, 0.99, -0.026], [-0.022, 1.02, -0.022]] : [[0.036, 1.0, -0.028], [0.036, 1.046, -0.026]])], 0.0014, mat.vein, { label: lb('Testicular vein') });
  tube('circulatory', n('inferior_epigastric_artery'), [[s * 0.066, 0.856, 0.056], [s * 0.05, 0.868, 0.074], [s * 0.045, 0.92, 0.09], [s * 0.04, 0.98, 0.096]], 0.0012, mat.artery, { label: lb('Inferior epigastric artery') });
  // seminal vesicle: coiled blind sac slanting down and in on the back of the bladder
  const A = V(s * 0.03, 0.84, 0.006), B = V(s * 0.012, 0.824, 0.024), d = B.clone().sub(A), L = d.length(); d.normalize();
  const e1 = new THREE.Vector3().crossVectors(d, Y).normalize(), e2 = new THREE.Vector3().crossVectors(d, e1).normalize(), sv = [];
  for (let i = 0; i <= 60; i++) { const u = i / 60; sv.push(A.clone().lerp(B, u).addScaledVector(e1, 0.0042 * Math.sin(u * Math.PI * 7)).addScaledVector(e2, 0.0018 * Math.cos(u * Math.PI * 11))); }
  rt(n('seminal_vesicle'), sv, u => 0.0021 * Math.sqrt(0.15 + 0.85 * ss(0, 0.03, u)), rm.sv, lb('Seminal vesicle'), 10);
  { const g = new THREE.SphereGeometry(1, 24, 16); g.scale(0.0072, L * 0.56, 0.0042); const m = new THREE.Mesh(g, rm.svEnv); m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(e1, d, e2.clone().negate())); m.position.copy(A.clone().lerp(B, 0.5)); reg(RP, n('seminal_vesicle_capsule'), m, { label: lb('Seminal vesicle') }).renderOrder = 3; }
  // ampulla, ejaculatory duct
  const P0 = V(s * 0.024, 0.85, 0.006), P1 = V(s * 0.007, 0.822, 0.033), E0 = V(s * 0.0055, 0.819, 0.0375), da = P1.clone().sub(P0).normalize(), f1 = new THREE.Vector3().crossVectors(da, Y).normalize(), am = [];
  for (let i = 0; i <= 30; i++) { const u = i / 30; am.push(P0.clone().lerp(P1, u).addScaledVector(f1, 0.0016 * Math.sin(u * Math.PI * 6) * Math.sin(Math.PI * u))); }
  rt(n('ampulla_ductus_deferentis'), am, u => 0.0013 + 0.0016 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15)), 0.6) * (1 + 0.2 * Math.abs(Math.sin(u * 40))), rm.duct, lb('Ampulla of ductus deferens'), 12);
  rt(n('seminal_vesicle_duct'), [B, B.clone().lerp(E0, 0.5), E0], 0.0011, rm.sv, lb('Seminal vesicle (excretory duct)'), 8);
  rt(n('ejaculatory_duct'), [P1, E0, V(s * 0.0035, 0.8135, 0.0425), V(s * 0.0011, 0.8075, 0.0466)], u => 0.0011 - 0.0004 * u, rm.ej, lb('Ejaculatory duct'), 8);
  sph(RP, n('ejaculatory_duct_opening'), 0.0003, [s * 0.0011, 0.8075, 0.0473], rm.dark, { label: lb('Ejaculatory duct opening') });
  // bulbourethral gland in the deep perineal pouch
  sph(RP, n('bulbourethral_gland'), 0.0024, [s * 0.0052, 0.7935, 0.047], rm.gland, { label: lb('Bulbourethral gland (Cowper)') });
  rt(n('bulbourethral_duct'), [[s * 0.0048, 0.792, 0.049], [s * 0.003, 0.7875, 0.056], [s * 0.0012, 0.7872, 0.064]], 0.00035, rm.gland, lb('Bulbourethral duct'), 5);
  // crus, corpus cavernosum, ischiocavernosus, dorsal neurovascular bundle
  const CR = [[s * 0.042, 0.781, 0.034], [s * 0.03, 0.787, 0.052], [s * 0.017, 0.794, 0.068], [s * 0.0075, 0.799, 0.079]].map(p => V(...p)), CRj = [...CR, off(0, s * 0.0052, 0.0032)], crf = u => 0.0032 + 0.0026 * ss(0, 1, u);
  rt(n('crus_penis'), CRj, crf, rm.ccAlb, lb('Crus of penis'), 14).renderOrder = 2;
  rt(n('crus_penis_erectile'), CRj, u => crf(u) * 0.8, rm.erect, lb('Crus of penis (erectile tissue)'), 12);
  rt(n('ischiocavernosus'), CR, u => 0.0052 + 0.0018 * u, rm.mus, lb('Ischiocavernosus'), 14).renderOrder = 3;
  const cv = line(s * 0.0052, 0.0032), cvr = u => 0.0058 * (u > 0.9 ? Math.sqrt(Math.max(0.2, (1 - u) / 0.1)) : 1);
  rt(n('corpus_cavernosum'), cv, cvr, rm.ccAlb, lb('Corpus cavernosum (tunica albuginea)'), 18).renderOrder = 2;
  rt(n('corpus_cavernosum_erectile'), cv, u => cvr(u) * 0.84, rm.erect, lb('Corpus cavernosum (erectile tissue)'), 16);
  rt(n('deep_artery_of_penis'), [CR[1], CR[2], CR[3], ...line(s * 0.0048, 0.003, 0, 0.9, 12)], 0.00055, mat.artery, lb('Deep artery of penis'), 6);
  rt(n('dorsal_artery_of_penis'), line(s * 0.0035, 0.0097, 0, 0.97), 0.0006, mat.artery, lb('Dorsal artery of penis'), 6);
  rt(n('dorsal_nerve_of_penis'), line(s * 0.0085, 0.0089, 0, 0.97), 0.0006, rm.nerve, lb('Dorsal nerve of penis'), 6);
}
// prostate: inverted cone below the bladder neck, with zones
{
  const prof = [[0.001, 0], [0.3, 0.01], [0.58, 0.12], [0.82, 0.38], [0.97, 0.68], [1, 0.86], [0.9, 0.97], [0.55, 1], [0.001, 0.985]].map(([r, t]) => new THREE.Vector2(r, t));
  const lz = (k, a0, al, mt, name, label, ro) => { const g = new THREE.LatheGeometry(prof.map(v => new THREE.Vector2(v.x * k, v.y)), 48, a0, al), h = 0.025 * (0.6 + 0.4 * k); g.scale(0.017 * k, h, 0.0105 * k); g.translate(0, 0.796 + (0.025 - h) / 2, 0.047); g.computeVertexNormals(); const m = reg(RP, name, new THREE.Mesh(g, mt), { label }); m.renderOrder = ro; return m; };
  lz(1, 0, PI2, rm.pros, 'prostate_capsule', 'Prostate, capsule', 3);
  lz(0.93, Math.PI - 2.1, 4.2, rm.pz, 'prostate_peripheral_zone', 'Prostate, peripheral zone', 2);
  lz(0.93, -0.95, 1.9, rm.afs, 'anterior_fibromuscular_stroma', 'Anterior fibromuscular stroma (prostate)', 2);
  const cg = new THREE.ConeGeometry(0.0085, 0.015, 28, 1, false); cg.rotateX(Math.PI); cg.scale(1, 1, 0.6); cg.translate(0, 0.8135, 0.0415);
  reg(RP, 'prostate_central_zone', new THREE.Mesh(cg, rm.cz), { label: 'Prostate, central zone' });
  for (const s of [-1, 1]) sph(RP, 'prostate_transition_zone_' + (s < 0 ? 'right' : 'left'), 1, [s * 0.0048, 0.8125, 0.0505], rm.tz, { scale: [0.0042, 0.0058, 0.0042], label: 'Prostate, transition zone (' + (s < 0 ? 'right' : 'left') + ' lobe)' });
  rt('urethral_crest', [V(0, 0.818, 0.0462), V(0, 0.81, 0.0458), V(0, 0.8, 0.0477)], 0.0005, rm.crest, 'Urethral crest', 5);
  sph(RP, 'seminal_colliculus', 1, [0, 0.808, 0.0462], rm.crest, { scale: [0.0016, 0.0028, 0.0012], label: 'Seminal colliculus (verumontanum)' });
  sph(RP, 'prostatic_utricle', 1, [0, 0.8088, 0.0474], rm.dark, { scale: [0.0003, 0.0009, 0.0003], label: 'Prostatic utricle' });
  for (let i = 0; i < 6; i++) sph(RP, 'prostatic_ductule_opening_' + i, 0.00022, [(i % 2 ? 1 : -1) * 0.0022, 0.811 - 0.0025 * (i >> 1), 0.0468], rm.dark, { label: 'Prostatic ductule openings' });
  grid('rectoprostatic_fascia', 10, 10, (a, b) => V((b * 2 - 1) * (0.03 - 0.01 * a), 0.846 - 0.049 * a, -0.006 + 0.038 * a + 0.004 * Math.sin(Math.PI * a)), rm.fascia, 'Rectoprostatic fascia (Denonvilliers)').renderOrder = 3;
  grid('perineal_membrane', 10, 12, (a, b) => V((b * 2 - 1) * 0.05 * (1 - a), 0.782 + 0.024 * a, 0.028 + 0.046 * a), rm.memb, 'Perineal membrane').renderOrder = 3;
}
// root and body of the penis, glans, spongy urethra
{
  sph(RP, 'bulb_of_penis', 1, [0, 0.7835, 0.054], rm.spong, { scale: [0.0085, 0.0068, 0.015], rot: [-0.25, 0, 0], label: 'Bulb of penis' });
  sph(RP, 'bulbospongiosus', 1, [0, 0.7835, 0.055], rm.mus, { scale: [0.0108, 0.0088, 0.018], rot: [-0.25, 0, 0], label: 'Bulbospongiosus' }).renderOrder = 3;
  rt('corpus_spongiosum', [V(0, 0.7865, 0.062), V(0, 0.7895, 0.071), V(0, 0.794, 0.079), ...line(0, -0.0058, 0.04, 1, 16)], u => 0.0042 + 0.0022 * ss(0.15, 0, u), rm.spong, 'Corpus spongiosum', 14).renderOrder = 1;
  grid('septum_pectiniforme', 16, 2, (a, b) => off(a * 0.95, 0, 0.0032 + (b * 2 - 1) * 0.0045), rm.sept, 'Septum pectiniforme');
  rt('deep_dorsal_vein_of_penis', line(0, 0.0099, 0, 0.97), 0.0011, mat.vein, 'Deep dorsal vein of penis', 8);
  rt('bucks_fascia', line(0, -0.001, 0, 0.985), 0.0135, rm.buck, "Buck's fascia (deep fascia of penis)", 20).renderOrder = 4;
  rt('penile_skin', line(0, -0.001, 0, 0.94), 0.0152, rm.pskin, 'Penile skin', 24).renderOrder = 5;
  rt('prepuce', [V(0, 0.757, 0.1115), V(0, 0.749, 0.1115), V(0, 0.74, 0.1115), V(0, 0.733, 0.1115)], u => 0.0152 - 0.0044 * u, rm.pskin, 'Prepuce (foreskin)', 24).renderOrder = 5;
  rt('penile_raphe', line(0, -0.0163, 0.02, 0.92), 0.00035, rm.raphe, 'Median raphe (penile)', 5);
  const g = new THREE.LatheGeometry([[0.001, -0.14], [0.6, -0.13], [0.74, -0.03], [1, 0], [1.02, 0.08], [0.93, 0.3], [0.74, 0.6], [0.44, 0.87], [0.13, 0.985], [0.001, 1]].map(([r, t]) => new THREE.Vector2(r, t)), 48);
  g.scale(0.0122, 0.024, 0.0112); g.rotateX(Math.PI); g.translate(0, 0.747, 0.1115); g.computeVertexNormals(); reg(RP, 'glans_penis', new THREE.Mesh(g, rm.glans), { label: 'Glans penis' });
  const cor = new THREE.TorusGeometry(0.0121, 0.0011, 8, 40); cor.rotateX(Math.PI / 2); cor.scale(1, 1, 0.92); cor.translate(0, 0.747, 0.1115); reg(RP, 'corona_glandis', new THREE.Mesh(cor, rm.glans), { label: 'Corona glandis' });
  const nk = new THREE.TorusGeometry(0.0078, 0.0007, 8, 36); nk.rotateX(Math.PI / 2); nk.scale(1, 1, 0.92); nk.translate(0, 0.7503, 0.1115); reg(RP, 'neck_of_glans', new THREE.Mesh(nk, rm.neck), { label: 'Neck of glans (collum)' });
  sph(RP, 'external_urethral_orifice', 1, [0, 0.7232, 0.1115], rm.dark, { scale: [0.0005, 0.0006, 0.0021], label: 'External urethral orifice (meatus)' });
  rt('urethra_spongy_bulbar', [V(0, 0.789, 0.0525), V(0, 0.7868, 0.058), V(0, 0.7878, 0.067), V(0, 0.7915, 0.076), V(0, 0.7965, 0.0835)], 0.0019, rm.urethra, 'Urethra, spongy part (bulbar)', 10);
  rt('urethra_spongy_penile', [V(0, 0.7965, 0.0835), ...line(0, -0.0058, 0.06, 1, 14)], 0.0016, rm.urethra, 'Urethra, spongy part (penile)', 10);
  rt('navicular_fossa', [off(1, 0, -0.0058), V(0, 0.735, 0.1095), V(0, 0.7238, 0.1113)], u => 0.0016 + 0.0013 * Math.sin(Math.PI * u), rm.urethra, 'Navicular fossa (urethra in the glans)', 10);
}
// scrotum with rugae and median raphe, dartos beneath
{
  const SCm = T4(V(0, 0.748, 0.072)), sax = [0.04, 0.035, 0.029];
  const shape = rug => (x, y, z) => { const h = 1 - 0.5 * ss(0.3, 1, y), bil = 1 - 0.07 * ga(x, 0, 0.14) * ss(0.1, -0.7, y), rg = rug ? 1 + 0.012 * Math.sin(48 * y + 4 * Math.sin(10 * x + 3 * z)) * (1 - 0.6 * ss(0.4, 1, y)) : 1; return [x * h, y, z * h, bil * rg]; };
  ell('scrotum', SCm, sax, 1, rm.skin, 'Scrotum (rugose skin)', shape(true), 72).renderOrder = 6;
  ell('dartos_fascia', SCm, sax, 0.965, rm.dartos, 'Dartos fascia (tunica dartos)', shape(false), 48).renderOrder = 5;
  const f = shape(true), rp = []; for (let i = 0; i <= 40; i++) { const t = 0.8 + ((PI2 - 1.85) * i) / 40, q = f(0, Math.cos(t), Math.sin(t)); rp.push(V(0, 0.748 + q[1] * sax[1] * q[3] * 1.006, 0.072 + q[2] * sax[2] * q[3] * 1.006)); }
  rt('scrotal_raphe', rp, 0.0005, rm.raphe, 'Median raphe (scrotal)', 5);
}
}

// keep abdominal organs under the diaphragm: lift the dome over them (up to the lung/heart bases), then tuck anything still above it
{
  const dia = G.respiratory.getObjectByName('diaphragm');
  const ss = (a, b, x) => { const q = Math.min(1, Math.max(0, (x - a) / (b - a))); return q * q * (3 - 2 * q); }, ga = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));
  const A = 0.158, Bz = 0.094, z0 = -0.004, rOf = (x, z) => Math.hypot(x / A, (z - z0) / Bz);
  const y0 = (x, z) => { const r = rOf(x, z), rc = Math.min(1, r), Ad = 0.0875 - 0.0075 * Math.tanh(x / 0.02); return 1.05 + 0.065 * (z - z0) / Bz / Math.max(1, r) + Ad * Math.pow(Math.max(0, 1 - rc * rc), 0.9) - 0.012 * ga(x, 0, 0.03) * ga(z, 0.03, 0.05); };
  const X0 = -0.17, Z0 = -0.11, D = 0.004, NX = 86, NZ = 56, N = NX * NZ;
  let top = new Float32Array(N).fill(-9), cap = new Float32Array(N).fill(9);
  const cell = (x, z) => { const a = Math.round((x - X0) / D), b = Math.round((z - Z0) / D); return a < 0 || b < 0 || a >= NX || b >= NZ ? -1 : b * NX + a; };
  const v = new THREE.Vector3(), lab = o => (o.name + ' ' + (o.userData.label || '')).toLowerCase();
  const each = (grp, test, fn) => { grp.updateMatrixWorld(true); const inv = grp.matrixWorld.clone().invert();
    grp.traverse(o => { if (!o.isMesh || o.isInstancedMesh || !o.geometry.attributes.position || !test(o)) return; for (let p = o; p; p = p.parent) if (p.name === 'magnified_alveolar_unit') return; fn(o, new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld)); }); };
  const abd = [];
  for (const k of ['digestive', 'urinary']) each(G[k], o => !/esophag|tongue|pharyn|hiatus/.test(lab(o)), (o, m) => {
    o.geometry.computeBoundingBox(); const c = o.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(m);
    if (c.y > 1.17 || c.y < 0.85 || rOf(c.x, c.z) > 1.05) return; abd.push([o, m]);
    const pa = o.geometry.attributes.position; for (let i = 0; i < pa.count; i++) { v.fromBufferAttribute(pa, i).applyMatrix4(m); const q = cell(v.x, v.z); if (q >= 0 && v.y > top[q]) top[q] = v.y; } });
  const capT = o => { const l = lab(o); return /lung|pericard|myocard|atri|ventric|auricle|epicardial/.test(l) && !/vein|arter|aorta|vena|sinus|trunk|bronch|alveol|pleura/.test(l); };
  for (const k of ['respiratory', 'circulatory']) each(G[k], capT, (o, m) => { const pa = o.geometry.attributes.position;
    for (let i = 0; i < pa.count; i++) { v.fromBufferAttribute(pa, i).applyMatrix4(m); const q = cell(v.x, v.z); if (q >= 0 && v.y < cap[q]) cap[q] = v.y; } });
  const filt = (g, R, red, inval) => { const o = new Float32Array(N).fill(inval);
    for (let b = 0; b < NZ; b++) for (let a = 0; a < NX; a++) { let acc = inval, s = 0, n = 0;
      for (let db = -R; db <= R; db++) for (let da = -R; da <= R; da++) { const aa = a + da, bb = b + db; if (aa < 0 || bb < 0 || aa >= NX || bb >= NZ) continue; const val = g[bb * NX + aa]; if (val === inval) continue;
        if (red === 'max') acc = acc === inval ? val : Math.max(acc, val); else if (red === 'min') acc = acc === inval ? val : Math.min(acc, val); else { s += val; n++; } }
      o[b * NX + a] = red === 'avg' ? (n ? s / n : inval) : acc; } return o; };
  top = filt(filt(filt(top, 2, 'max', -9), 1, 'avg', -9), 1, 'avg', -9); cap = filt(cap, 1, 'min', 9);
  const samp = (g, x, z) => { const fx = Math.min(NX - 1.001, Math.max(0, (x - X0) / D)), fz = Math.min(NZ - 1.001, Math.max(0, (z - Z0) / D)), a = Math.floor(fx), b = Math.floor(fz), u = fx - a, w = fz - b;
    return (g[b * NX + a] * (1 - u) + g[b * NX + a + 1] * u) * (1 - w) + (g[(b + 1) * NX + a] * (1 - u) + g[(b + 1) * NX + a + 1] * u) * w; };
  const dY = (x, z) => { const b = y0(x, z), w = 1 - ss(0.9, 1.0, rOf(x, z)); return b + w * Math.max(0, Math.min(samp(top, x, z) + 0.006, samp(cap, x, z) - 0.003) - b); };
  if (dia) { const pa = dia.geometry.attributes.position; for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), z = pa.getZ(i), y = dY(x, z); if (y > pa.getY(i)) pa.setY(i, y); }
    pa.needsUpdate = true; dia.geometry.computeVertexNormals(); dia.geometry.computeBoundingSphere(); }
  const band = 0.008;
  abd.forEach(([o, m]) => { const inv = m.clone().invert(), pa = o.geometry.attributes.position; let ch = false;
    for (let i = 0; i < pa.count; i++) { v.fromBufferAttribute(pa, i).applyMatrix4(m); const rr = rOf(v.x, v.z); if (rr >= 1.15) continue; const k = rr >= 1 ? 0.999 / rr : 1, s0 = dY(v.x * k, z0 + (v.z - z0) * k) - 0.003 - band;
      if (v.y > s0) { v.y = s0 + band * Math.tanh((v.y - s0) / band); v.applyMatrix4(inv); pa.setXYZ(i, v.x, v.y, v.z); ch = true; } }
    if (ch) { pa.needsUpdate = true; o.geometry.computeVertexNormals(); o.geometry.computeBoundingSphere(); o.geometry.computeBoundingBox(); } });
}

// ───────── NERVOUS ─────────
{
const NS = 'nervous', C0 = 1.655, A = 0.064, B = 0.052, CL = 0.08, sn = Math.sin;
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const gaus = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));
const tag = (m, sd) => { m.userData.side = sd; return m; };
const SD = s => s < 0 ? 'right' : 'left', SC = s => s < 0 ? 'R' : 'L';
const GL = (x, y, z) => [x, C0 + y, z];
function ntube(name, pts, r, mt, label, sd = 'M', R = 10) {
  const c = new THREE.CatmullRomCurve3(pts.map(p => V(...p))), S = Math.max(8, pts.length * 10);
  const g = new THREE.TubeGeometry(c, S, 1, R, false), pos = g.attributes.position, rf = typeof r === 'function' ? r : () => r;
  for (let i = 0; i <= S; i++) { const ct = c.getPointAt(i / S); for (let j = 0; j <= R; j++) { const k = i * (R + 1) + j, rr = rf(i / S, j / R); pos.setXYZ(k, ct.x + (pos.getX(k) - ct.x) * rr, ct.y + (pos.getY(k) - ct.y) * rr, ct.z + (pos.getZ(k) - ct.z) * rr); } }
  g.computeVertexNormals();
  return tag(reg(NS, name, new THREE.Mesh(g, mt), { label }), sd);
}
const ell = (name, label, c, rad, mt, sd = 'M') => tag(sph(NS, name, 1, c, mt, { scale: rad, label }), sd);
const nm = {
  nerve: M('nerve_yellow', 0xe8c452, 0.5), optic: M('optic_pathway', 0xf0dc8a, 0.5), mid: M('midbrain', 0xe0b09f, 0.6), pons: M('pons', 0xe8c1b0, 0.6), med: M('medulla', 0xd9a898, 0.6), pyr: M('pyramid', 0xefd2c3, 0.6),
  cb: M('cerebellum', 0xcda092, 0.7), vermis: M('cerebellar_vermis', 0xc58f80, 0.7), thal: M('thalamus', 0x7f99bd, 0.6), thal2: M('thalamic_nucleus', 0x93abca, 0.6), hyp: M('hypothalamus', 0x7ec0cf, 0.6),
  white: M('white_matter_tract', 0xf1ece4, 0.55), vent: M('ventricle', 0x6bb3ab, 0.4, { transparent: true, opacity: 0.82, depthWrite: false }), choroid: M('choroid_plexus', 0xd05560, 0.6),
  caud: M('caudate_nucleus', 0xd6304a, 0.55), put: M('putamen', 0x58b08c, 0.55), gp: M('globus_pallidus', 0x3a86c6, 0.55), amy: M('amygdala', 0xd8307a, 0.55), hip: M('hippocampus', 0x8a2a9a, 0.55),
  stn: M('subthalamic_nucleus', 0x9a8acb, 0.55), cap: M('internal_capsule', 0xe8d8b4, 0.6, { transparent: true, opacity: 0.6, depthWrite: false }), pin: M('pineal_gland', 0xd9a0a0, 0.55),
  pit1: M('adenohypophysis', 0xe6a0a8, 0.55), pit2: M('neurohypophysis', 0xc98f9d, 0.55), mam: M('mammillary_body', 0xe8d8c0, 0.55), sulc: M('sulcus_line', 0x8a6a60, 0.8), ins: M('insula', 0xa07aa4, 0.6, { side: THREE.DoubleSide }),
  cordW: M('spinal_cord_white_matter', 0xeadfcd, 0.55, { transparent: true, opacity: 0.55, depthWrite: false }), cordG: M('spinal_cord_grey_matter', 0x9f969b, 0.6),
  dura: M('dura_mater', 0xdfe6ee, 0.5, { transparent: true, opacity: 0.18, depthWrite: false }), gang: M('dorsal_root_ganglion', 0xd9a63a, 0.5),
};

// ── cerebral cortex: lobes, gyri, sulci ──
const lobeCol = { frontal: 0xa9d9c0, parietal: 0xe8e5b4, temporal: 0xa9c4de, occipital: 0xe9b3bf, limbic: 0xd4b6a2, insula: 0xa07aa4 };
const cortexMats = {};
const cmat = (lobe, part) => { let h = 0; for (const ch of part) h = (h * 31 + ch.charCodeAt(0)) >>> 0; const ti = h % 3, key = lobe + ti;
  if (!cortexMats[key]) { const m = M(lobe + '_lobe_' + ti, lobeCol[lobe], 0.62, { side: THREE.DoubleSide }); m.color.offsetHSL(0, 0, (ti - 1) * 0.035); cortexMats[key] = m; } return cortexMats[key]; };
function fold(x, y, z) {
  const qx = x + 0.0035 * sn(y * 430 + z * 310 + 1), qy = y + 0.0035 * sn(z * 390 + x * 280 + 2), qz = z + 0.0035 * sn(x * 350 + y * 410 + 3);
  return (sn(qx * 330 + qy * 200 + 1.1) + sn(qy * 310 - qz * 240 + 2.3) + 0.9 * sn(qz * 340 + qx * 180 - qy * 130 + 0.4) + 0.6 * sn((qx - qy + qz) * 290 + 0.9)) / 3.1;
}
function cortexPos(ux, uy, uz) {
  const u = Math.abs(ux);
  const tb = gaus(uy, -0.55, 0.38) * gaus(uz, 0.1, 0.55) * Math.min(1, u * 2);
  const cut = Math.exp(-((ux * A / 0.03) ** 2)) * sstep(-0.3, -0.8, uy);
  const f = (1 + 0.16 * tb) * (1 - 0.32 * cut), nx = (1 - 0.14 * sstep(0.2, 1, uz)) * (1 - 0.1 * sstep(-0.3, -1, uz));
  const px = ux * A * f * nx, py = uy * B * f, pz = uz * CL * f;
  const nl = Math.hypot(px / (A * A), py / (B * B), pz / (CL * CL)) || 1;
  let d = -0.0022 * Math.exp(-((fold(px, py, pz) / 0.3) ** 2));
  d -= 0.0034 * Math.exp(-(((uy - (-0.12 + (0.42 - uz) * 0.22)) / 0.07) ** 2)) * sstep(0.3, 0.55, u) * sstep(-0.7, -0.4, uz) * sstep(0.65, 0.42, uz);
  d -= 0.0022 * Math.exp(-(((uz - (-0.02 + 0.14 * (1 - uy))) / 0.045) ** 2)) * sstep(-0.15, 0.2, uy) * sstep(0.05, 0.35, u);
  return [px + px / (A * A) / nl * d, py + py / (B * B) / nl * d, pz + pz / (CL * CL) / nl * d];
}
function classify(u, v, w) {
  const vl = -0.12 + (0.42 - w) * 0.22, wc = -0.02 + 0.14 * (1 - v);
  if (w < -0.6) return [w < -0.86 ? 'Occipital pole' : 'Lateral occipital gyri', 'occipital'];
  if (v < vl) {
    if (w >= 0.5) return ['Orbital gyri', 'frontal'];
    if (w > 0.3) return ['Temporal pole', 'temporal'];
    const dd = vl - v; return [dd < 0.32 ? 'Superior temporal gyrus' : dd < 0.6 ? 'Middle temporal gyrus' : 'Inferior temporal gyrus', 'temporal'];
  }
  if (w >= wc) {
    const rel = w - wc;
    if (rel < 0.17) return ['Precentral gyrus', 'frontal'];
    if (w > 0.82) return ['Frontal pole', 'frontal'];
    if (v > 0.62) return ['Superior frontal gyrus', 'frontal'];
    if (v > 0.28) return ['Middle frontal gyrus', 'frontal'];
    return [rel < 0.4 ? 'Inferior frontal gyrus, opercular part' : rel < 0.66 ? 'Inferior frontal gyrus, triangular part' : 'Inferior frontal gyrus, orbital part', 'frontal'];
  }
  const rel = wc - w;
  if (rel < 0.17) return ['Postcentral gyrus', 'parietal'];
  if (v > 0.5) return ['Superior parietal lobule', 'parietal'];
  return [w > -0.22 ? 'Supramarginal gyrus' : 'Angular gyrus', 'parietal'];
}
function wallClass(v, w, f, dy, dz) {
  if (f < 0.36) return dy > 0 ? ['Cingulate gyrus', 'limbic'] : dz > 0.012 ? ['Subcallosal gyrus', 'limbic'] : ['Parahippocampal gyrus', 'limbic'];
  if (w < -0.58) return [v > -0.2 ? 'Cuneus' : 'Lingual gyrus', 'occipital'];
  const wc = -0.02 + 0.14 * (1 - v);
  if (v < -0.5 && w < 0.5) return ['Fusiform gyrus', 'temporal'];
  if (w >= wc) return [(w - wc < 0.13 && v > 0.35) ? 'Paracentral lobule' : 'Medial frontal gyrus', 'frontal'];
  return [(wc - w < 0.13 && v > 0.35) ? 'Paracentral lobule' : 'Precuneus', 'parietal'];
}
function fitB(g, arr) { const p = g.attributes.position, b = new THREE.Box3(), v = new THREE.Vector3(), seen = new Set(); for (const i of arr) { if (seen.has(i)) continue; seen.add(i); v.fromBufferAttribute(p, i); b.expandByPoint(v); } g.boundingBox = b; g.boundingSphere = b.getBoundingSphere(new THREE.Sphere()); }
function avgN(na, ids) { let x = 0, y = 0, z = 0; ids.forEach(i => { x += na.getX(i); y += na.getY(i); z += na.getZ(i); }); const l = Math.hypot(x, y, z) || 1; ids.forEach(i => na.setXYZ(i, x / l, y / l, z / l)); }
function mountGroups(g, groups, s) {
  groups.forEach((arr, key) => {
    const [part, lobe] = key.split('|'), gg = new THREE.BufferGeometry();
    gg.setAttribute('position', g.attributes.position); gg.setAttribute('normal', g.attributes.normal); gg.setIndex(arr); fitB(gg, arr);
    const m = new THREE.Mesh(gg, cmat(lobe, part)); m.position.set(s * 0.0012, C0, 0);
    reg(NS, 'cortex_' + part.toLowerCase().replace(/\W+/g, '_') + '_' + SD(s), m, { label: part + ' (' + lobe + ' lobe, ' + SD(s) + ')' }); tag(m, SC(s));
  });
}
const WS = 224, HS = 112;
function buildHemi(s) {
  const g = new THREE.SphereGeometry(1, WS, HS, 0, Math.PI * 2, 0, Math.PI / 2); g.rotateZ(s < 0 ? Math.PI / 2 : -Math.PI / 2);
  const pa = g.attributes.position, n = pa.count, U = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const ux = pa.getX(i), uy = pa.getY(i), uz = pa.getZ(i); U[i * 3] = ux; U[i * 3 + 1] = uy; U[i * 3 + 2] = uz; const p = cortexPos(ux, uy, uz); pa.setXYZ(i, p[0], p[1], p[2]); }
  g.computeVertexNormals(); const na = g.attributes.normal;
  for (let r = 0; r <= HS; r++) avgN(na, [r * (WS + 1), r * (WS + 1) + WS]);
  { const ids = []; for (let c = 0; c <= WS; c++) ids.push(c); avgN(na, ids); }
  const idx = g.index.array, groups = new Map();
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t], b = idx[t + 1], c = idx[t + 2];
    const k = classify(Math.abs(U[a * 3] + U[b * 3] + U[c * 3]) / 3, (U[a * 3 + 1] + U[b * 3 + 1] + U[c * 3 + 1]) / 3, (U[a * 3 + 2] + U[b * 3 + 2] + U[c * 3 + 2]) / 3), key = k[0] + '|' + k[1];
    if (!groups.has(key)) groups.set(key, []); groups.get(key).push(a, b, c);
  }
  const rim = []; for (let i = 0; i < WS; i++) { const j = HS * (WS + 1) + i; rim.push([pa.getX(j), pa.getY(j), pa.getZ(j)]); }
  return { g, groups, rim };
}
function buildWall(s, rim) {
  const K = 24, hy0 = 0, rz = 0.05, ry = 0.026, pos = new Float32Array((K + 1) * WS * 3), vw = new Float32Array((K + 1) * WS * 4);
  for (let i = 0; i < WS; i++) {
    const rp = rim[i], t = Math.atan2(rp[1] / B, rp[2] / CL), hy = hy0 + ry * sn(t), hz = rz * Math.cos(t);
    for (let k = 0; k <= K; k++) {
      const f = k / K, y = hy + (rp[1] - hy) * f, z = hz + (rp[2] - hz) * f, tp = sstep(0, 0.15, f) * sstep(1, 0.9, f);
      const x = s * 0.0022 * Math.exp(-((fold(s * 0.02, y, z) / 0.3) ** 2)) * tp, q = k * WS + i;
      pos[q * 3] = x; pos[q * 3 + 1] = y; pos[q * 3 + 2] = z; vw[q * 4] = y / B; vw[q * 4 + 1] = z / CL; vw[q * 4 + 2] = f; vw[q * 4 + 3] = y - hy0;
    }
  }
  const ids = [];
  for (let k = 0; k < K; k++) for (let i = 0; i < WS; i++) { const i2 = (i + 1) % WS, a = k * WS + i, b = k * WS + i2, c = (k + 1) * WS + i, d = (k + 1) * WS + i2; ids.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(ids); g.computeVertexNormals();
  let sx = 0; const na = g.attributes.normal; for (let i = 0; i < na.count; i++) sx += na.getX(i);
  if (Math.sign(sx) !== -s) { for (let t = 0; t < ids.length; t += 3) { const tmp = ids[t + 1]; ids[t + 1] = ids[t + 2]; ids[t + 2] = tmp; } g.setIndex(ids); g.computeVertexNormals(); }
  const idx = g.index.array, groups = new Map(), P = (a, b, c, o) => (vw[a * 4 + o] + vw[b * 4 + o] + vw[c * 4 + o]) / 3;
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t], b = idx[t + 1], c = idx[t + 2];
    const k = wallClass(P(a, b, c, 0), P(a, b, c, 1), P(a, b, c, 2), P(a, b, c, 3), (pos[a * 3 + 2] + pos[b * 3 + 2] + pos[c * 3 + 2]) / 3), key = k[0] + '|' + k[1];
    if (!groups.has(key)) groups.set(key, []); groups.get(key).push(a, b, c);
  }
  return { g, groups };
}
for (const s of [-1, 1]) { const h = buildHemi(s); mountGroups(h.g, h.groups, s); const w = buildWall(s, h.rim); mountGroups(w.g, w.groups, s); }

// insula and named sulci
for (const s of [-1, 1]) {
  const sd = SD(s);
  ell('insula_' + sd, 'Insula (insular lobe, ' + sd + ')', GL(s * 0.053, -0.002, 0.012), [0.0045, 0.011, 0.019], nm.ins, SC(s));
  const mark = (name, label, pts) => { const q = pts.map(p => { const l = Math.hypot(p[0] / (A * A), p[1] / (B * B), p[2] / (CL * CL)) || 1; return [p[0] + s * 0.0012 + p[0] / (A * A) / l * 0.0028, C0 + p[1] + p[1] / (B * B) / l * 0.0028, p[2] + p[2] / (CL * CL) / l * 0.0028]; }); ntube(name, q, 0.0004, nm.sulc, label + ' (' + sd + ')', SC(s), 6); };
  const c1 = [], c2 = [];
  for (let v = 0.92; v >= 0.02; v -= 0.06) { const w = -0.02 + 0.14 * (1 - v); c1.push(cortexPos(s * Math.sqrt(Math.max(0.0004, 1 - v * v - w * w)), v, w)); }
  for (let w = 0.46; w >= -0.55; w -= 0.07) { const v = -0.12 + (0.42 - w) * 0.22; c2.push(cortexPos(s * Math.sqrt(Math.max(0.0004, 1 - v * v - w * w)), v, w)); }
  mark('central_sulcus_' + sd, 'Central sulcus', c1); mark('lateral_sulcus_' + sd, 'Lateral sulcus (of Sylvius)', c2);
}

// ── cerebellum with folia ──
{
  const g = new THREE.SphereGeometry(1, 96, 72), pa = g.attributes.position, n = pa.count, cxv = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const ux = pa.getX(i), uy = pa.getY(i), uz = pa.getZ(i), f = 1 - 0.5 * Math.exp(-((ux / 0.25) ** 2 + ((uz - 0.9) / 0.35) ** 2 + (uy / 0.9) ** 2));
    const px = ux * 0.048 * f, py = uy * 0.024 * f, pz = uz * 0.027 * f, nl = Math.hypot(px / 0.048 ** 2, py / 0.024 ** 2, pz / 0.027 ** 2) || 1;
    const d = 0.0006 * sn(py / 0.0042 * 2 * Math.PI + 4 * Math.abs(px) / 0.048) - 0.0013 * Math.exp(-((px / 0.006) ** 2));
    pa.setXYZ(i, px + px / 0.048 ** 2 / nl * d, py + py / 0.024 ** 2 / nl * d, pz + pz / 0.027 ** 2 / nl * d); cxv[i] = px;
  }
  g.computeVertexNormals(); const na = g.attributes.normal;
  for (let r = 0; r <= 72; r++) avgN(na, [r * 97, r * 97 + 96]);
  for (const r of [0, 72]) { const ids = []; for (let c = 0; c <= 96; c++) ids.push(r * 97 + c); avgN(na, ids); }
  const idx = g.index.array, groups = { vermis: [], right: [], left: [] };
  for (let t = 0; t < idx.length; t += 3) { const a = idx[t], b = idx[t + 1], c = idx[t + 2], cx = (cxv[a] + cxv[b] + cxv[c]) / 3; groups[Math.abs(cx) < 0.0075 ? 'vermis' : cx < 0 ? 'right' : 'left'].push(a, b, c); }
  for (const k of ['vermis', 'right', 'left']) {
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', g.attributes.position); gg.setAttribute('normal', g.attributes.normal); gg.setIndex(groups[k]); fitB(gg, groups[k]);
    const m = new THREE.Mesh(gg, k === 'vermis' ? nm.vermis : nm.cb); m.position.set(0, 1.616, -0.056); m.scale.set(1.05, 1.05, 1.1);
    reg(NS, 'cerebellum_' + k, m, { label: k === 'vermis' ? 'Cerebellum, vermis' : 'Cerebellum, hemisphere (' + k + ')' }); tag(m, k === 'vermis' ? 'M' : k === 'right' ? 'R' : 'L');
  }
}

// ── brainstem ──
const BSP = [[0, 1.638, 0.006], [0, 1.62, 0], [0, 1.6, -0.012], [0, 1.58, -0.028], [0, 1.56, -0.037], [0, 1.545, -0.041]];
const bsC = new THREE.CatmullRomCurve3(BSP.map(p => V(...p)));
const sub = (u0, u1, k) => { const a = []; for (let i = 0; i <= k; i++) a.push(bsC.getPointAt(u0 + (u1 - u0) * i / k).toArray()); return a; };
const rBS = u => u < 0.23 ? 0.0105 : u < 0.5 ? 0.0105 + 0.005 * sn(Math.PI * (u - 0.23) / 0.27) : 0.0105 - 0.003 * Math.min(1, (u - 0.5) / 0.45);
ntube('midbrain', sub(0, 0.24, 5), u => rBS(u * 0.24), nm.mid, 'Midbrain (brainstem)', 'M', 20);
ntube('pons', sub(0.23, 0.51, 6), u => rBS(0.23 + u * 0.28), nm.pons, 'Pons (brainstem)', 'M', 20);
ntube('medulla_oblongata', sub(0.5, 1, 6), u => rBS(0.5 + u * 0.5), nm.med, 'Medulla oblongata (brainstem)', 'M', 20);
for (const s of [-1, 1]) {
  const sd = SD(s), sc = SC(s);
  ntube('pyramid_' + sd, sub(0.52, 0.9, 5).map(p => [p[0] + s * 0.0035, p[1], p[2] + 0.0085]), 0.0028, nm.pyr, 'Pyramid (medulla, ' + sd + ')', sc);
  ntube('cerebral_peduncle_' + sd, [[s * 0.0025, 1.612, 0.007], [s * 0.009, 1.628, 0.006], [s * 0.017, 1.64, 0], [s * 0.021, 1.646, -0.006]], 0.0042, nm.mid, 'Cerebral peduncle (midbrain, ' + sd + ')', sc);
  ell('superior_colliculus_' + sd, 'Superior colliculus (quadrigeminal plate, ' + sd + ')', [s * 0.004, 1.632, -0.016], [0.0035, 0.003, 0.0035], nm.mid, sc);
  ell('inferior_colliculus_' + sd, 'Inferior colliculus (quadrigeminal plate, ' + sd + ')', [s * 0.004, 1.621, -0.0185], [0.0035, 0.003, 0.0035], nm.mid, sc);
  ntube('brachium_inferior_colliculus_' + sd, [[s * 0.006, 1.622, -0.0185], [s * 0.016, 1.63, -0.015], [s * 0.021, 1.636, -0.018]], 0.0016, nm.mid, 'Brachium of inferior colliculus (' + sd + ')', sc);
  ntube('lateral_ventricle_' + sd, [GL(s * 0.007, 0.004, 0.046), GL(s * 0.011, 0.011, 0.036), GL(s * 0.015, 0.014, 0.016), GL(s * 0.018, 0.014, -0.006), GL(s * 0.02, 0.008, -0.026), GL(s * 0.019, -0.002, -0.04), GL(s * 0.016, -0.012, -0.054)],
    u => 0.0048 + 0.002 * gaus(u, 0.62, 0.12) - 0.0036 * sstep(0.78, 1, u), nm.vent, 'Lateral ventricle (' + sd + ')', sc, 14);
  ntube('lateral_ventricle_inferior_horn_' + sd, [GL(s * 0.02, 0.006, -0.028), GL(s * 0.03, -0.012, -0.026), GL(s * 0.04, -0.026, -0.014), GL(s * 0.042, -0.033, 0.004), GL(s * 0.036, -0.036, 0.02)], u => 0.0036 - 0.0016 * u, nm.vent, 'Lateral ventricle, inferior horn (' + sd + ')', sc, 12);
  ntube('choroid_plexus_' + sd, [GL(s * 0.015, 0.0125, 0.016), GL(s * 0.017, 0.0125, -0.006), GL(s * 0.019, 0.0075, -0.026)], 0.0018, nm.choroid, 'Choroid plexus (' + sd + ')', sc);
  ell('thalamus_' + sd, 'Thalamus (diencephalon, ' + sd + ')', GL(s * 0.0125, -0.01, -0.004), [0.0105, 0.0125, 0.019], nm.thal, sc);
  ell('pulvinar_' + sd, 'Pulvinar (thalamus, ' + sd + ')', GL(s * 0.0135, -0.012, -0.021), [0.0065, 0.0065, 0.0065], nm.thal2, sc);
  ell('lateral_geniculate_body_' + sd, 'Lateral geniculate body (' + sd + ')', GL(s * 0.021, -0.026, -0.02), [0.0035, 0.0025, 0.004], nm.thal2, sc);
  ell('mammillary_body_' + sd, 'Mammillary body (hypothalamus, ' + sd + ')', GL(s * 0.0035, -0.04, -0.001), [0.0034, 0.0034, 0.0034], nm.mam, sc);
  ell('subthalamic_nucleus_' + sd, 'Subthalamic nucleus (subthalamus, ' + sd + ')', GL(s * 0.013, -0.027, -0.006), [0.004, 0.002, 0.006], nm.stn, sc);
  ntube('caudate_nucleus_' + sd, [GL(s * 0.014, 0.002, 0.036), GL(s * 0.02, 0.012, 0.02), GL(s * 0.023, 0.015, 0), GL(s * 0.025, 0.01, -0.02), GL(s * 0.034, -0.004, -0.032), GL(s * 0.04, -0.02, -0.02), GL(s * 0.042, -0.026, 0)],
    u => 0.0015 + 0.0062 * Math.pow(1 - u, 0.8), nm.caud, 'Caudate nucleus (basal ganglia, ' + sd + ')', sc, 14);
  ell('putamen_' + sd, 'Putamen (basal ganglia, ' + sd + ')', GL(s * 0.033, -0.004, 0.012), [0.0055, 0.012, 0.016], nm.put, sc);
  ell('globus_pallidus_' + sd, 'Globus pallidus (basal ganglia, ' + sd + ')', GL(s * 0.0255, -0.008, 0.008), [0.0035, 0.0075, 0.009], nm.gp, sc);
  ell('internal_capsule_' + sd, 'Internal capsule (' + sd + ')', GL(s * 0.02, 0.0, 0.004), [0.0018, 0.016, 0.018], nm.cap, sc);
  ell('amygdala_' + sd, 'Amygdala (limbic system, ' + sd + ')', GL(s * 0.036, -0.03, 0.024), [0.0055, 0.0055, 0.0055], nm.amy, sc);
  ntube('hippocampus_' + sd, [GL(s * 0.034, -0.026, 0.012), GL(s * 0.04, -0.028, -0.004), GL(s * 0.039, -0.022, -0.022), GL(s * 0.03, -0.008, -0.034), GL(s * 0.022, 0.002, -0.036)], u => 0.0042 - 0.0022 * u, nm.hip, 'Hippocampus (limbic system, ' + sd + ')', sc, 12);
  ntube('fornix_' + sd, [GL(s * 0.003, -0.016, 0.016), GL(s * 0.004, -0.006, 0.018), GL(s * 0.005, 0.004, 0.012), GL(s * 0.006, 0.008, -0.006), GL(s * 0.009, 0.003, -0.026), GL(s * 0.02, -0.008, -0.034), GL(s * 0.03, -0.022, -0.03)], 0.0018, nm.white, 'Fornix (' + sd + ')', sc);
}

// ── midline diencephalon, callosum, ventricles ──
ntube('corpus_callosum', [GL(0, -0.012, 0.046), GL(0, 0, 0.05), GL(0, 0.012, 0.04), GL(0, 0.019, 0.012), GL(0, 0.017, -0.025), GL(0, 0.006, -0.046), GL(0, -0.008, -0.046)],
  u => 0.004 + 0.0012 * gaus(u, 0.05, 0.12) + 0.0028 * gaus(u, 0.97, 0.1), nm.white, 'Corpus callosum', 'M', 14).scale.x = 3.6;
{ const sp = new THREE.Mesh(new THREE.PlaneGeometry(0.044, 0.012), M('septum_pellucidum', 0xdad6d0, 0.7, { transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false })); sp.rotation.y = Math.PI / 2; sp.position.set(0, C0 + 0.008, 0.028); tag(reg(NS, 'septum_pellucidum', sp, { label: 'Septum pellucidum' }), 'M'); }
ntube('anterior_commissure', [GL(-0.012, -0.001, 0.019), GL(0, -0.0035, 0.019), GL(0.012, -0.001, 0.019)], 0.0014, nm.white, 'Anterior commissure');
ell('interthalamic_adhesion', 'Interthalamic adhesion', GL(0, -0.012, -0.002), [0.004, 0.0035, 0.0035], nm.thal);
ell('third_ventricle', '3rd ventricle', GL(0, -0.016, 0.004), [0.0016, 0.014, 0.016], nm.vent);
ell('hypothalamus', 'Hypothalamus (diencephalon)', GL(0, -0.03, 0.012), [0.009, 0.008, 0.012], nm.hyp);
ell('pineal_gland', 'Pineal gland (epithalamus)', GL(0, -0.004, -0.03), [0.0035, 0.0035, 0.004], nm.pin);
ntube('interventricular_foramen', [GL(-0.0075, 0.004, 0.012), GL(0, 0.0, 0.012), GL(0.0075, 0.004, 0.012)], 0.0012, nm.vent, 'Interventricular foramen', 'M', 8);
ntube('cerebral_aqueduct', [[0, 1.633, -0.003], [0, 1.612, -0.012], [0, 1.601, -0.025]], 0.0012, nm.vent, 'Cerebral aqueduct', 'M', 8);
ell('fourth_ventricle', '4th ventricle', [0, 1.597, -0.031], [0.006, 0.007, 0.003], nm.vent);
ntube('infundibulum', [GL(0, -0.034, 0.012), GL(0, -0.044, 0.017), GL(0, -0.05, 0.019)], u => 0.0018 - 0.0006 * u, nm.hyp, 'Infundibulum');
ell('adenohypophysis', 'Adenohypophysis (anterior pituitary)', GL(0, -0.056, 0.021), [0.0055, 0.0035, 0.0045], nm.pit1);
ell('neurohypophysis', 'Neurohypophysis (posterior pituitary)', GL(0, -0.054, 0.0155), [0.0035, 0.003, 0.003], nm.pit2);
tag(reg(NS, 'optic_chiasm', xf(new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.003, 0.006), nm.optic), [0, 1.614, 0.025]), { label: 'Optic chiasm' }), 'M');

// ── cranial nerves (12 pairs) ──
for (const s of [-1, 1]) {
  const sd = SD(s), sc = SC(s), P = a => a.map(p => [s * p[0], p[1], p[2]]), cn = (nameK, label, pts, r, mt = nm.nerve) => ntube('cn_' + nameK + '_' + sd, P(pts), r, mt, label + ' (' + sd + ')', sc);
  ell('olfactory_bulb_' + sd, 'Olfactory nerve (CN I, ' + sd + ')', [s * 0.011, 1.615, 0.066], [0.004, 0.003, 0.008], nm.optic, sc);
  cn('i', 'Olfactory nerve (CN I)', [[0.011, 1.616, 0.06], [0.013, 1.617, 0.045], [0.015, 1.619, 0.032]], 0.0016, nm.optic);
  cn('ii', 'Optic nerve (CN II)', [[0, 1.614, 0.025], [0.016, 1.621, 0.044], [0.032, 1.634, 0.066]], 0.0024, nm.optic);
  ntube('optic_tract_' + sd, P([[0.004, 1.614, 0.021], [0.012, 1.616, 0.004], [0.019, 1.621, -0.012], [0.021, 1.627, -0.019]]), 0.002, nm.optic, 'Optic tract (' + sd + ')', sc);
  cn('iii', 'Oculomotor nerve (CN III)', [[0.003, 1.622, 0.006], [0.01, 1.617, 0.026], [0.022, 1.62, 0.05], [0.032, 1.632, 0.068]], 0.0016);
  cn('iv', 'Trochlear nerve (CN IV)', [[0.004, 1.629, -0.016], [0.012, 1.626, -0.012], [0.017, 1.62, 0.004], [0.022, 1.62, 0.03], [0.03, 1.63, 0.05], [0.035, 1.64, 0.066]], 0.001);
  cn('v', 'Trigeminal nerve (CN V)', [[0.011, 1.604, -0.003], [0.022, 1.6, 0.008], [0.028, 1.597, 0.02]], 0.0026);
  ell('trigeminal_ganglion_' + sd, 'Trigeminal nerve (CN V, ganglion, ' + sd + ')', [s * 0.029, 1.597, 0.024], [0.005, 0.002, 0.006], nm.nerve, sc);
  cn('v1', 'Trigeminal nerve (CN V, ophthalmic division V1)', [[0.03, 1.598, 0.028], [0.033, 1.612, 0.05], [0.035, 1.634, 0.07]], 0.0015);
  cn('v2', 'Trigeminal nerve (CN V, maxillary division V2)', [[0.03, 1.597, 0.028], [0.036, 1.59, 0.048], [0.04, 1.584, 0.062]], 0.0015);
  cn('v3', 'Trigeminal nerve (CN V, mandibular division V3)', [[0.03, 1.597, 0.028], [0.04, 1.58, 0.032], [0.052, 1.568, 0.026], [0.058, 1.56, 0.018]], 0.0016);
  cn('vi', 'Abducens nerve (CN VI)', [[0.003, 1.589, -0.002], [0.006, 1.598, 0.018], [0.016, 1.616, 0.042], [0.03, 1.632, 0.066]], 0.0012);
  cn('vii', 'Facial nerve (CN VII)', [[0.0125, 1.595, -0.016], [0.03, 1.59, -0.02], [0.046, 1.585, -0.014]], 0.0014);
  cn('viii', 'Vestibulocochlear nerve (CN VIII)', [[0.0125, 1.592, -0.018], [0.03, 1.588, -0.024], [0.046, 1.582, -0.02]], 0.0016);
  cn('ix', 'Glossopharyngeal nerve (CN IX)', [[0.0095, 1.58, -0.024], [0.024, 1.572, -0.026], [0.032, 1.558, -0.012], [0.026, 1.543, 0.012]], 0.0012);
  cn('xi', 'Accessory nerve (CN XI)', [[0.007, 1.5, -0.039], [0.009, 1.54, -0.036], [0.0105, 1.57, -0.028], [0.024, 1.567, -0.022], [0.036, 1.54, -0.016], [0.05, 1.5, -0.03], [0.075, 1.46, -0.06], [0.1, 1.435, -0.075]], 0.0011);
  cn('xii', 'Hypoglossal nerve (CN XII)', [[0.005, 1.576, -0.014], [0.016, 1.57, -0.012], [0.028, 1.562, 0], [0.026, 1.555, 0.02], [0.016, 1.558, 0.034], [0.006, 1.563, 0.04]], 0.0012);
  const top = [[0.0095, 1.575, -0.026], [0.024, 1.566, -0.024], [0.03, 1.545, -0.01], [0.031, 1.5, 0], [0.03, 1.455, 0.004], [0.026, 1.41, 0]];
  const low = s > 0 ? [[0.016, 1.36, -0.012], [0.014, 1.3, -0.02], [0.022, 1.22, -0.008], [0.036, 1.16, 0.01], [0.052, 1.125, 0.016]] : [[-0.014, 1.36, -0.04], [0, 1.3, -0.044], [0.016, 1.22, -0.04], [0.036, 1.16, -0.022], [0.056, 1.122, -0.01]];
  ntube('cn_x_' + sd, top.map(p => [s * p[0], p[1], p[2]]).concat(low), 0.0016, nm.nerve, 'Vagus nerve (CN X, ' + sd + ')', sc);
}

// ── spinal cord, meninges, spinal nerves ──
const canalZ = y => y >= 0.93 ? zc(y) - 0.0225 : -0.0615 - (0.93 - y) * 0.1;
{
  const pts = []; for (let y = 1.56; y >= 1.059; y -= 0.02) pts.push([0, y, canalZ(y)]);
  const rw = u => { const y = 1.56 - u * 0.5; return (0.0048 + 0.0013 * gaus(y, 1.45, 0.045) + 0.0009 * gaus(y, 1.13, 0.03)) * (0.25 + 0.75 * sstep(1.052, 1.1, y)); };
  ntube('spinal_cord', pts, rw, nm.cordW, 'Spinal cord, white matter', 'M', 24);
  ntube('spinal_cord_grey_matter', pts, (u, a) => rw(u) * 0.62 * (0.35 + 0.65 * Math.pow(Math.abs(sn(4 * Math.PI * a)), 1.4)), nm.cordG, 'Spinal cord, grey matter (butterfly)', 'M', 32);
  ntube('central_canal', pts, 0.0005, nm.vent, 'Central canal', 'M', 6);
  const dp = []; for (let y = 1.56; y >= 0.88; y -= 0.04) dp.push([0, y, canalZ(y)]);
  ntube('dura_mater', dp, 0.0078, nm.dura, 'Dura mater (spinal meninges)', 'M', 16);
  const fp = []; for (let y = 1.06; y >= 0.8; y -= 0.04) fp.push([0, y, canalZ(y)]);
  ntube('filum_terminale', fp, 0.0005, nm.white, 'Filum terminale');
}
const SPN = [];
for (let i = 0; i < 8; i++) SPN.push(['C' + (i + 1), 1.545 - i * 0.0195, 1.553 - i * 0.0235, 0.027]);
for (let i = 0; i < 12; i++) SPN.push(['T' + (i + 1), 1.38 - i * 0.017, 1.358 - i * 0.0265, 0.028]);
for (let i = 0; i < 5; i++) SPN.push(['L' + (i + 1), 1.145 - i * 0.012, 1.021 - i * 0.026, 0.027]);
for (let i = 0; i < 5; i++) SPN.push(['S' + (i + 1), 1.08 - i * 0.005, 0.912 - i * 0.022, 0.02]);
SPN.push(['Co1', 1.055, 0.815, 0.008]);
for (const s of [-1, 1]) {
  const sd = SD(s), sc = SC(s);
  SPN.forEach(([lb, ys, ye, x], i) => {
    const cauda = lb[0] === 'L' || lb[0] === 'S' || lb[0] === 'C' && lb[1] === 'o', z0 = canalZ(ys), z1 = canalZ(ye) + 0.01, ym = ys * 0.4 + ye * 0.6;
    const pts = [[s * 0.003, ys, z0], [s * (cauda ? 0.003 + 0.0004 * i : 0.011), ym, canalZ(ym) + (cauda ? 0.0 : 0.004)], [s * x * 0.75, ye + 0.004, z1 - 0.003], [s * x, ye, z1], [s * (x + 0.016), ye - 0.005, z1 + 0.005]];
    ntube('spinal_nerve_' + lb + '_' + sd, pts, cauda ? 0.0014 : 0.0019, nm.nerve, (cauda ? 'Cauda equina, spinal nerve ' : 'Spinal nerve ') + lb + ' (' + sd + ')', sc, 8);
    ell('dorsal_root_ganglion_' + lb + '_' + sd, 'Dorsal root ganglion ' + lb + ' (' + sd + ')', [s * x, ye, z1], [0.0035, 0.0022, 0.0025], nm.gang, sc);
  });
  const RXN = [0.075, 0.1, 0.125, 0.145, 0.158, 0.165, 0.165, 0.158, 0.148, 0.135];
  for (let n = 1; n <= 10; n++) {
    const rx = RXN[n - 1], yr = 1.37 - (n - 1) * 0.0265 - 0.007, yE = 1.358 - (n - 1) * 0.0265, pts = [[s * 0.03, yE, canalZ(yE) + 0.012]];
    [0.5, 1.1, 1.8, 2.5, 2.95].forEach(ph => pts.push([s * rx * sn(ph), yr - 0.0015 * ph, -0.005 - 0.65 * rx * Math.cos(ph)]));
    ntube('intercostal_nerve_T' + n + '_' + sd, pts, 0.0016, nm.nerve, 'Intercostal nerve T' + n + ' (' + sd + ')', sc, 8);
  }
}

// ── brachial plexus and arm nerves ──
const PL = [ // [name, label, pts (right side positive x), radius]
  ['root_c5', 'Brachial plexus, C5 root', [[0.028, 1.459, -0.033], [0.05, 1.452, -0.02], [0.078, 1.432, -0.004]], 0.002],
  ['root_c6', 'Brachial plexus, C6 root', [[0.028, 1.4355, -0.034], [0.05, 1.43, -0.02], [0.078, 1.432, -0.004]], 0.002],
  ['root_c7', 'Brachial plexus, C7 root', [[0.028, 1.412, -0.035], [0.052, 1.41, -0.02], [0.078, 1.408, -0.004]], 0.002],
  ['root_c8', 'Brachial plexus, C8 root', [[0.028, 1.3885, -0.036], [0.05, 1.39, -0.02], [0.078, 1.384, -0.004]], 0.002],
  ['root_t1', 'Brachial plexus, T1 root', [[0.028, 1.358, -0.036], [0.05, 1.368, -0.022], [0.078, 1.384, -0.004]], 0.002],
  ['trunk_upper', 'Upper trunk (brachial plexus)', [[0.078, 1.432, -0.004], [0.1, 1.425, -0.002], [0.118, 1.418, 0]], 0.0028],
  ['trunk_middle', 'Middle trunk (brachial plexus)', [[0.078, 1.408, -0.004], [0.1, 1.406, -0.002], [0.118, 1.404, 0]], 0.0028],
  ['trunk_lower', 'Lower trunk (brachial plexus)', [[0.078, 1.384, -0.004], [0.1, 1.386, -0.002], [0.118, 1.388, 0]], 0.0028],
  ['div_ant_upper', 'Anterior division, upper trunk (brachial plexus)', [[0.118, 1.418, 0], [0.145, 1.404, 0.008], [0.172, 1.388, 0.008]], 0.0019],
  ['div_ant_middle', 'Anterior division, middle trunk (brachial plexus)', [[0.118, 1.404, 0], [0.145, 1.396, 0.007], [0.172, 1.388, 0.008]], 0.0019],
  ['div_ant_lower', 'Anterior division, lower trunk (brachial plexus)', [[0.118, 1.388, 0], [0.145, 1.38, 0.004], [0.172, 1.372, 0.002]], 0.0019],
  ['div_post_upper', 'Posterior division, upper trunk (brachial plexus)', [[0.118, 1.418, 0], [0.145, 1.398, -0.008], [0.172, 1.381, -0.007]], 0.0019],
  ['div_post_middle', 'Posterior division, middle trunk (brachial plexus)', [[0.118, 1.404, 0], [0.145, 1.392, -0.008], [0.172, 1.381, -0.007]], 0.0019],
  ['div_post_lower', 'Posterior division, lower trunk (brachial plexus)', [[0.118, 1.388, 0], [0.145, 1.384, -0.008], [0.172, 1.381, -0.007]], 0.0019],
  ['cord_lateral', 'Lateral cord (brachial plexus)', [[0.172, 1.388, 0.008], [0.19, 1.372, 0.016], [0.2, 1.345, 0.016]], 0.0026],
  ['cord_medial', 'Medial cord (brachial plexus)', [[0.172, 1.372, 0.002], [0.186, 1.358, 0.004], [0.2, 1.34, 0.002]], 0.0026],
  ['cord_posterior', 'Posterior cord (brachial plexus)', [[0.172, 1.381, -0.007], [0.19, 1.365, -0.009], [0.2, 1.34, -0.012]], 0.0026],
  ['musculocutaneous', 'Musculocutaneous nerve', [[0.2, 1.345, 0.016], [0.208, 1.31, 0.022], [0.222, 1.22, 0.026], [0.233, 1.12, 0.024], [0.24, 1.07, 0.02], [0.255, 1.0, 0.026], [0.268, 0.93, 0.03], [0.272, 0.88, 0.03]], 0.0022],
  ['axillary', 'Axillary nerve', [[0.2, 1.34, -0.012], [0.21, 1.35, -0.03], [0.228, 1.37, -0.02], [0.236, 1.35, 0], [0.226, 1.32, 0.022]], 0.0022],
  ['radial', 'Radial nerve', [[0.2, 1.34, -0.012], [0.21, 1.3, -0.022], [0.226, 1.24, -0.026], [0.236, 1.18, -0.016], [0.246, 1.12, 0.002], [0.252, 1.08, 0.014]], 0.0028],
  ['radial_superficial', 'Superficial branch of radial nerve', [[0.252, 1.08, 0.014], [0.262, 1.0, 0.02], [0.272, 0.93, 0.016], [0.278, 0.87, 0.006], [0.285, 0.8, 0.002], [0.3, 0.76, 0.03]], 0.0019],
  ['radial_deep', 'Deep branch of radial nerve (posterior interosseous)', [[0.252, 1.08, 0.014], [0.258, 1.05, 0.003], [0.258, 1.0, -0.012], [0.262, 0.92, -0.016], [0.268, 0.87, -0.014]], 0.0018],
  ['dorsal_scapular', 'Dorsal scapular nerve', [[0.05, 1.452, -0.02], [0.055, 1.44, -0.05], [0.058, 1.38, -0.092], [0.06, 1.3, -0.1]], 0.0014],
  ['long_thoracic', 'Long thoracic nerve', [[0.045, 1.43, -0.024], [0.07, 1.4, -0.03], [0.12, 1.34, -0.025], [0.15, 1.28, -0.01], [0.16, 1.2, 0.0]], 0.0014],
  ['suprascapular', 'Suprascapular nerve', [[0.1, 1.425, -0.002], [0.115, 1.4, -0.03], [0.12, 1.37, -0.058], scapW(0.074, 0.048, 0.006), scapW(0.074, 0.046, -0.002), scapW(0.084, 0.049, -0.009), scapW(0.1, 0.04, -0.008), scapW(0.086, 0.03, -0.007), scapW(0.066, 0.016, -0.007)], 0.0017],
  ['posterior_cutaneous_arm', 'Posterior cutaneous nerve of arm (radial)', [[0.21, 1.3, -0.022], [0.208, 1.27, -0.036], [0.212, 1.22, -0.042], [0.218, 1.17, -0.04]], 0.001],
  ['inferior_lateral_cutaneous_arm', 'Inferior lateral cutaneous nerve of arm (radial)', [[0.236, 1.18, -0.016], [0.248, 1.165, -0.014], [0.258, 1.14, -0.006], [0.262, 1.11, 0.004]], 0.001],
  ['posterior_cutaneous_forearm', 'Posterior cutaneous nerve of forearm (radial)', [[0.238, 1.172, -0.014], [0.252, 1.13, -0.018], [0.26, 1.08, -0.022], [0.264, 1.02, -0.024], [0.268, 0.95, -0.022]], 0.001],
  ['nerve_to_subclavius', 'Nerve to subclavius', [[0.1, 1.425, -0.002], [0.108, 1.41, 0.028], [0.114, 1.402, 0.04]], 0.001],
  ['lateral_pectoral', 'Lateral pectoral nerve', [[0.19, 1.372, 0.016], [0.18, 1.37, 0.045], [0.16, 1.36, 0.072]], 0.0013],
  ['medial_pectoral', 'Medial pectoral nerve', [[0.186, 1.358, 0.004], [0.18, 1.345, 0.035], [0.165, 1.33, 0.066]], 0.0013],
  ['superior_subscapular', 'Superior subscapular nerve', [[0.185, 1.373, -0.008], [0.17, 1.36, -0.04], [0.15, 1.34, -0.062]], 0.0012],
  ['thoracodorsal', 'Thoracodorsal nerve', [[0.195, 1.355, -0.01], [0.18, 1.31, -0.05], [0.17, 1.24, -0.07], [0.165, 1.18, -0.078]], 0.0013],
  ['inferior_subscapular', 'Inferior subscapular nerve', [[0.198, 1.35, -0.011], [0.185, 1.32, -0.05], [0.18, 1.29, -0.07]], 0.0012],
  ['medial_cutaneous_arm', 'Medial cutaneous nerve of arm', [[0.2, 1.34, 0.002], [0.198, 1.3, -0.012], [0.205, 1.22, -0.02], [0.212, 1.14, -0.02]], 0.001],
  ['medial_cutaneous_forearm', 'Medial cutaneous nerve of forearm', [[0.2, 1.34, 0.002], [0.202, 1.3, 0.006], [0.21, 1.2, 0.01], [0.218, 1.1, 0.012], [0.225, 1.05, 0.022], [0.24, 0.95, 0.032]], 0.0011],
  ['intercostobrachial', 'Intercostobrachial nerve (lateral cutaneous branch of T2)', [[0.13, 1.335, 0.03], [0.16, 1.33, 0.02], [0.195, 1.31, 0.0], [0.205, 1.25, -0.015]], 0.0011],
  ['anterior_interosseous', 'Anterior interosseous nerve', [[0.236, 1.075, 0.014], [0.246, 1.03, 0.01], [0.254, 0.95, 0.006], [0.262, 0.88, 0.01]], 0.0014],
  ['palmar_median', 'Palmar branch of median nerve', [[0.262, 0.88, 0.028], [0.266, 0.85, 0.036], [0.268, 0.825, 0.04]], 0.0009],
  ['dorsal_ulnar', 'Dorsal branch of ulnar nerve', [[0.248, 0.92, 0.002], [0.254, 0.88, -0.01], [0.258, 0.845, -0.014], [0.255, 0.81, -0.008]], 0.0011],
  ['palmar_ulnar', 'Palmar branch of ulnar nerve', [[0.254, 0.88, 0.012], [0.258, 0.85, 0.03], [0.26, 0.835, 0.036]], 0.0009],
  ['median', 'Median nerve', [[0.2, 1.345, 0.016], [0.206, 1.325, 0.008], [0.208, 1.28, 0.012], [0.216, 1.2, 0.016], [0.226, 1.12, 0.014], [0.236, 1.075, 0.014], [0.248, 1.0, 0.02], [0.26, 0.92, 0.026], [0.268, 0.86, 0.03], [0.272, 0.835, 0.034]], 0.0029],
  ['median_medial_root', 'Median nerve, medial root', [[0.2, 1.34, 0.002], [0.206, 1.325, 0.008]], 0.002],
  ['ulnar', 'Ulnar nerve', [[0.2, 1.34, 0.002], [0.197, 1.3, -0.004], [0.2, 1.22, -0.008], [0.21, 1.14, -0.01], [0.218, 1.082, -0.016], [0.23, 1.02, -0.004], [0.244, 0.95, 0], [0.254, 0.89, 0.008], [0.258, 0.846, 0.022], [0.26, 0.83, 0.034]], 0.0028],
];
function scapW(x, y, z) { return [0.055 + 0.93937 * x - 0.3429 * z, 1.292 + y, -0.106 + 0.3429 * x + 0.93937 * z]; }
const FT = [[0.31, 0.775, 0.045], [0.292, 0.7, 0.022], [0.274, 0.685, 0.022], [0.258, 0.695, 0.022], [0.246, 0.72, 0.022]];
const dig = (from, i, nmS, lab, r) => { const t = FT[i], f = from; return [nmS, lab, [f, [(f[0] + t[0]) / 2, (f[1] + t[1]) / 2, (f[2] + t[2]) / 2 + 0.008], [t[0], t[1], t[2] + 0.006]], r]; };
PL.push(dig([0.272, 0.835, 0.034], 0, 'digital_median_thumb', 'Median nerve, digital branch to thumb', 0.0014));
PL.push(dig([0.272, 0.835, 0.034], 1, 'digital_median_index', 'Median nerve, digital branch to index finger', 0.0013));
PL.push(dig([0.272, 0.835, 0.034], 2, 'digital_median_middle', 'Median nerve, digital branch to middle finger', 0.0013));
PL.push(dig([0.268, 0.835, 0.034], 3, 'digital_median_ring', 'Median nerve, digital branch to ring finger (lateral half)', 0.0012));
PL.push(dig([0.26, 0.83, 0.034], 3, 'digital_ulnar_ring', 'Ulnar nerve, digital branch to ring finger (medial half)', 0.0012));
PL.push(dig([0.26, 0.83, 0.034], 4, 'digital_ulnar_little', 'Ulnar nerve, digital branch to little finger', 0.0013));
for (const s of [-1, 1]) { const sd = SD(s), sc = SC(s);
  PL.forEach(([name, label, pts, r]) => ntube(name + '_' + sd, pts.map(p => [s * p[0], p[1], p[2]]), r, nm.nerve, label + ' (' + sd + ')', sc, 8)); }

// ── lumbosacral plexus and leg nerves ──
const LL = [
  ['lumbosacral_trunk', 'Lumbosacral plexus, L4–L5 roots', [[0.027, 0.943, -0.05], [0.045, 0.915, -0.058], [0.07, 0.866, -0.058]], 0.0022],
  ['sacral_roots', 'Lumbosacral plexus, S1–S3 roots', [[0.02, 0.912, -0.062], [0.045, 0.89, -0.06], [0.07, 0.866, -0.058]], 0.0022],
  ['sciatic', 'Sciatic nerve', [[0.07, 0.866, -0.058], [0.09, 0.82, -0.05], [0.1, 0.75, -0.034], [0.098, 0.6, -0.026], [0.098, 0.5, -0.02]], 0.0052],
  ['tibial', 'Tibial nerve', [[0.098, 0.5, -0.02], [0.096, 0.46, -0.026], [0.098, 0.4, -0.034], [0.1, 0.3, -0.03], [0.1, 0.2, -0.028], [0.096, 0.075, -0.02], [0.1, 0.03, 0], [0.1, 0.02, 0.05]], 0.0034],
  ['common_fibular', 'Common fibular nerve', [[0.098, 0.5, -0.02], [0.108, 0.49, -0.02], [0.124, 0.46, -0.014], [0.13, 0.44, -0.002]], 0.0026],
  ['deep_fibular', 'Deep fibular nerve', [[0.13, 0.44, -0.002], [0.126, 0.36, 0.01], [0.114, 0.3, 0.026], [0.108, 0.2, 0.032], [0.1, 0.1, 0.034], [0.1, 0.04, 0.05], [0.1, 0.025, 0.1]], 0.002],
  ['superficial_fibular', 'Superficial fibular nerve', [[0.13, 0.44, -0.002], [0.126, 0.3, 0.002], [0.122, 0.2, 0], [0.118, 0.12, 0.02], [0.112, 0.04, 0.04]], 0.002],
  ['femoral', 'Femoral nerve', [[0.027, 0.995, -0.04], [0.05, 0.98, -0.02], [0.075, 0.93, 0.02], [0.088, 0.86, 0.042], [0.09, 0.8, 0.046], [0.1, 0.7, 0.05], [0.1, 0.56, 0.046]], 0.0032],
  ['saphenous', 'Saphenous nerve', [[0.09, 0.8, 0.046], [0.082, 0.78, 0.044], [0.07, 0.6, 0.03], [0.07, 0.46, 0.015], [0.08, 0.3, 0.02], [0.08, 0.15, 0.016], [0.082, 0.04, 0.04]], 0.0018],
  ['medial_sural', 'Medial sural cutaneous nerve', [[0.097, 0.47, -0.03], [0.1, 0.42, -0.05], [0.102, 0.33, -0.06], [0.104, 0.24, -0.052]], 0.0012],
  ['lateral_sural', 'Lateral sural cutaneous nerve', [[0.115, 0.475, -0.02], [0.122, 0.42, -0.04], [0.124, 0.34, -0.05]], 0.0012],
  ['sural_communicating', 'Sural communicating nerve', [[0.121, 0.43, -0.038], [0.116, 0.34, -0.052], [0.106, 0.24, -0.052]], 0.0011],
  ['sural', 'Sural nerve', [[0.104, 0.24, -0.052], [0.11, 0.15, -0.042], [0.118, 0.085, -0.03], [0.126, 0.05, -0.014], [0.131, 0.03, 0.03], [0.129, 0.024, 0.09]], 0.0013],
];
for (const s of [-1, 1]) { const sd = SD(s), sc = SC(s); LL.forEach(([name, label, pts, r]) => ntube(name + '_' + sd, pts.map(p => [s * p[0], p[1], p[2]]), r, nm.nerve, label + ' (' + sd + ')', sc, 8)); }
// ── MNI template brain replaces the procedural cortex, sulcus lines, insula and cerebellum ──
// Source: tpl-mni_T1w (skull-stripped T1 template), surfaces built by scripts/mni_brain_to_glb.py. If the GLB is missing the procedural brain stays.
{
  let G3 = null;
  try { const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js'); const gl = await new GLTFLoader().loadAsync('assets/mni_brain.glb'); G3 = {}; gl.scene.traverse(o => { if (o.isMesh) { o.geometry.deleteAttribute('color'); if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals(); G3[o.name] = o.geometry; } }); if (!G3.cortex_left || !G3.cerebellum) G3 = null; } catch (er) { G3 = null; }
  if (G3) {
    const gone = []; G[NS].traverse(o => { if (o.isMesh && /^(cortex_|insula_|central_sulcus_|lateral_sulcus_|cerebellum_)/.test(o.name)) gone.push(o); });
    gone.forEach(o => o.parent.remove(o));
    Object.keys(cortexMats).forEach(k => delete cortexMats[k]);
    const DS2 = THREE.DoubleSide, cx = M('cerebral_cortex', 0xd9b3ae, 0.7, { side: DS2 }), wmat = M('cerebral_white_matter', 0xf1ece4, 0.55, { side: DS2 }), cb = M('cerebellum_mni', 0xcda092, 0.7, { side: DS2 });
    cortexMats.mni = cx;
    for (const s of [-1, 1]) {
      const sd = SD(s);
      const add = (key, name, label, mt, side) => { const m = new THREE.Mesh(G3[key + '_' + sd], mt); m.position.set(0, C0, 0); return tag(reg(NS, name + '_' + sd, m, { label: label + ' (' + sd + ')' }), side); };
      add('cortex', 'cortex_cerebral_cortex', 'Cerebral cortex', cx, SC(s));
      if (G3['white_matter_' + sd]) add('white_matter', 'cerebral_white_matter', 'Cerebral white matter', wmat, SC(s)).renderOrder = 0;
    }
    { const m = new THREE.Mesh(G3.cerebellum, cb); m.position.set(0, C0, 0); tag(reg(NS, 'cerebellum', m, { label: 'Cerebellum' }), 'M'); }
    window.__mniLoaded = true;
  }
}
window.__brain = { cortexMats, classify, lobeCol, C0, B, CL };
// ───────── HEAD AND NECK DETAIL: eye, ear, nose and sinuses, larynx muscles, thyroid, face vessels and nerves ─────────
{
  const NMN = nm.nerve, SE = 'senses', EN = 'endocrine', RS = 'respiratory', DG = 'digestive', CSY = 'circulatory', DS = THREE.DoubleSide;
  const HN = {
    sclera: M('sclera', 0xf3f0ea, 0.35, { transparent: true, opacity: 0.55, depthWrite: false }), cornea: M('cornea', 0xdfeef4, 0.05, { transparent: true, opacity: 0.35, depthWrite: false }),
    iris: M('iris', 0x6b4a2e, 0.6, { side: DS }), pupil: M('pupil', 0x111111, 0.8, { side: DS }), lens: M('lens', 0xd9eef0, 0.15, { transparent: true, opacity: 0.85 }),
    vit: M('vitreous_body', 0xb9c4c9, 0.2, { transparent: true, opacity: 0.45, depthWrite: false }), lacr: M('lacrimal_gland', 0xe0b8a0, 0.5),
    ear: M('auricle_cartilage', 0xe6b8a6, 0.5), oss: M('ossicle', 0xeadfc8, 0.45), lab: M('bony_labyrinth', 0xc9cbc4, 0.4), tymp: M('tympanic_membrane', 0xd9dde0, 0.4, { transparent: true, opacity: 0.75, side: DS }),
    canal: M('external_acoustic_meatus', 0xc98a7a, 0.5, { transparent: true, opacity: 0.6, depthWrite: false }), cav: M('tympanic_cavity', 0xb06a64, 0.5, { transparent: true, opacity: 0.45, depthWrite: false }), et: M('pharyngotympanic_tube', 0xc0a8a0, 0.5),
    sinus: M('paranasal_sinus', 0xf0d9d0, 0.4, { transparent: true, opacity: 0.45, depthWrite: false }), muc: M('nasal_mucosa', 0xd98a86, 0.35), sep: M('septum_bone', 0xe6d8b8, 0.6, { side: DS }), sepC: M('septal_cartilage', 0xa3bdd1, 0.5, { side: DS }),
    thy: M('thyroid_gland', 0xd99a92, 0.55), para: M('parathyroid_gland', 0xd9a560, 0.5), lymph: M('lymphoid_tissue', 0xd8a0a0, 0.6), csin: M('cavernous_sinus', 0x3d6fb0, 0.5, { transparent: true, opacity: 0.75 }), fold: M('aryepiglottic_fold', 0xd89a98, 0.5)
  };
  const mesh = (sys, name, g, mt, label, pos) => { const m = new THREE.Mesh(g, mt); if (pos) m.position.copy(pos); return reg(sys, name, m, { label }); };
  const mreg = (label, g, mt, pos) => mesh(MS, 'muscle_' + __nextMcount(), g, mt, label, pos);
  const face = (m, n) => { m.quaternion.setFromUnitVectors(V(0, 0, 1), n.clone().normalize()); return m; };
  const lumpy = (g, amp, f) => { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 + amp * Math.sin(x * f + 1.3) * Math.sin(y * f * 0.8 + 0.4) * Math.sin(z * f * 1.1 + 2.1); p.setXYZ(i, x * k, y * k, z * k); } g.computeVertexNormals(); return g; };
  // Eye meshes from feelpp/mesh.eye v1.1 (Zenodo 10.5281/zenodo.15630998, GPL-3.0-only); the spheres below are the fallback if the file is missing.
  HN.chor = M('choroid', 0x5b2b25, 0.6, { side: DS }); HN.ret = M('retina', 0xd98f7a, 0.6, { side: DS }); HN.zon = M('suspensory_ligament', 0xeadfd0, 0.5, { side: DS });
  [HN.sclera, HN.vit, HN.cornea, HN.lens].forEach(m => { m.side = DS; });
  // The sclera and vitreous shells touch the choroid, retina and ciliary body; a small depth offset stops the depth test flipping per pixel (patchy shading).
  [HN.sclera, HN.vit].forEach(m => { m.polygonOffset = true; m.polygonOffsetFactor = -6; m.polygonOffsetUnits = -12; });
  let EYE = null;
  try { const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js'); const gl = await new GLTFLoader().loadAsync('assets/eye.glb'); EYE = {}; gl.scene.traverse(o => { if (o.isMesh) { o.geometry.deleteAttribute('color'); o.geometry.deleteAttribute('normal'); o.geometry.computeVertexNormals(); EYE[o.name] = o.geometry; } }); if (!EYE.Sclera) EYE = null; } catch (er) { EYE = null; }
  for (const s of [-1, 1]) {
    const sd = s < 0 ? 'right' : 'left', T = s < 0 ? 'R' : 'L', P = p => [s * p[0], p[1], p[2]], lb = x => x + ' (' + sd + ')', n = x => x + '_' + sd;
    const art = (nm, l, pts, r = 0.0009) => tube(CSY, n(nm), pts.map(P), r, mat.artery, { label: lb(l) });
    const vn = (nm, l, pts, r = 0.0011) => tube(CSY, n(nm), pts.map(P), r, mat.vein, { label: lb(l) });
    const nv = (nm, l, pts, r = 0.0008) => ntube(n(nm), pts.map(P), r, NMN, lb(l), T, 6);
    const mus = (l, pts, r, o = {}) => belly(lb(l), pts.map(P), r, { ...o, up: o.up && [s * o.up[0], o.up[1], o.up[2]] });
    // ── eye ──
    const E = V(s * 0.033, 1.639, 0.072), R = 0.0115, on = (x, y, z, k = 1) => E.clone().add(V(s * x, y, z).normalize().multiplyScalar(R * k));
    if (EYE) {
      const EK = R / 0.0125, em = (key, name, label, mt, ro) => { const m = new THREE.Mesh(EYE[key], mt); m.position.copy(E); m.scale.set(s * EK, EK, EK); const r = reg(SE, n(name), m, { label: lb(label) }); r.renderOrder = ro; return r; };
      em('Sclera', 'sclera', 'Sclera (eyeball)', HN.sclera, 3); em('Choroid', 'choroid', 'Choroid', HN.chor, 2); em('Retina', 'retina', 'Retina', HN.ret, 2);
      em('Vitreous_humor', 'vitreous_body', 'Vitreous body', HN.vit, 2); em('Cornea', 'cornea', 'Cornea', HN.cornea, 4); em('Iris_and_ciliary_body', 'iris', 'Iris', HN.iris, 1);
      em('Lens', 'lens', 'Lens', HN.lens, 1); em('Suspensory_ligament', 'suspensory_ligament', 'Suspensory ligament of lens', HN.zon, 1);
      mesh(SE, n('pupil'), new THREE.CircleGeometry(0.00168 * EK, 24), HN.pupil, lb('Pupil'), V(E.x, E.y, E.z + 0.0099 * EK));
    } else {
    sph(SE, n('sclera'), R, E.toArray(), HN.sclera, { label: lb('Sclera (eyeball)') }).renderOrder = 3;
    sph(SE, n('vitreous_body'), R * 0.92, E.toArray(), HN.vit, { label: lb('Vitreous body') }).renderOrder = 2;
    sph(SE, n('cornea'), 0.0075, [E.x, E.y, E.z + R - 0.0053], HN.cornea, { label: lb('Cornea') }).renderOrder = 4;
    mesh(SE, n('iris'), new THREE.RingGeometry(0.0019, 0.0058, 36), HN.iris, lb('Iris'), V(E.x, E.y, E.z + 0.0098));
    mesh(SE, n('pupil'), new THREE.CircleGeometry(0.0019, 24), HN.pupil, lb('Pupil'), V(E.x, E.y, E.z + 0.0096));
    sph(SE, n('lens'), 0.0045, [E.x, E.y, E.z + 0.0083], HN.lens, { scale: [1, 1, 0.45], label: lb('Lens') });
    }
    sph(SE, n('lacrimal_gland'), 1, [s * 0.044, 1.649, 0.077], HN.lacr, { scale: [0.0045, 0.0022, 0.0035], label: lb('Lacrimal gland') });
    const AP = [0.024, 1.634, 0.05];
    mesh(SE, n('common_tendinous_ring'), new THREE.TorusGeometry(0.0028, 0.0006, 8, 20), mm.ten, lb('Common tendinous ring'), V(...P(AP)));
    [['Superior rectus', [0, 1, 0]], ['Inferior rectus', [0, -1, 0]], ['Medial rectus', [-1, 0, 0]], ['Lateral rectus', [1, 0, 0]]].forEach(([l, d]) => {
      const ins = on(d[0] * 0.77, d[1] * 0.77, 0.64), mid = E.clone().add(V(s * d[0], d[1], 0).multiplyScalar(R * 1.18)).add(V(0, 0, -0.008));
      belly(lb(l), [V(...P(AP)).add(V(s * d[0], d[1], 0).multiplyScalar(0.002)).toArray(), mid.toArray(), ins.toArray()], 0.0017, { w: 1.9, d: 0.5, mt: mm.mid, up: [s * d[0], d[1], 0] }); });
    belly(lb('Levator palpebrae superioris'), [P([0.025, 1.637, 0.05]), E.clone().add(V(0, R * 1.42, -0.004)).toArray(), [E.x, E.y + 0.0092, E.z + R + 0.0008]], 0.0013, { w: 2.2, d: 0.4, mt: mm.sup, up: [0, 1, 0] });
    const TR = P([0.021, 1.65, 0.079]);
    sph(SE, n('trochlea'), 0.0012, TR, mm.ten, { label: lb('Trochlea') });
    mus('Superior oblique', [[0.022, 1.638, 0.05], [0.02, 1.647, 0.068], [0.021, 1.649, 0.077]], 0.0013, { mt: mm.mid });
    tube(MS, n('superior_oblique_tendon'), [TR, [E.x - s * 0.002, E.y + R * 0.98, E.z + 0.002], on(0.45, 0.75, -0.48).toArray()], 0.0005, mm.ten, { label: lb('Superior oblique, tendon') });
    belly(lb('Inferior oblique'), [P([0.022, 1.627, 0.081]), [E.x, E.y - R * 1.12, E.z + 0.002], on(0.7, -0.4, -0.58).toArray()], 0.0013, { mt: mm.mid });
    mreg(lb('Orbicularis oculi'), new THREE.TorusGeometry(0.0135, 0.0024, 8, 36).scale(1, 0.85, 0.6), mm.sup, V(E.x, E.y, E.z + 0.0125));
    // nerves of the orbit
    tag(sph(NS, n('ciliary_ganglion'), 0.0012, P([0.029, 1.634, 0.056]), NMN, { label: lb('Ciliary ganglion') }), T);
    [[-0.003, 0.002], [0.003, 0], [0, -0.003]].forEach(([dx, dy], k) => nv('short_ciliary_' + k, 'Short ciliary nerves', [[0.029, 1.634, 0.056], [0.031 + dx, 1.637 + dy, 0.059], [0.033 + dx, 1.639 + dy, 0.0612]], 0.0003));
    nv('frontal_nerve', 'Frontal nerve (to supraorbital)', [[0.03, 1.635, 0.052], [0.032, 1.651, 0.066], [0.033, 1.656, 0.082], [0.034, 1.68, 0.089]]);
    nv('lacrimal_nerve', 'Lacrimal nerve', [[0.032, 1.633, 0.053], [0.041, 1.646, 0.069], [0.044, 1.648, 0.076]], 0.0005);
    // ── ear ──
    tube(SE, n('external_acoustic_meatus'), [[0.088, 1.618, -0.01], [0.078, 1.62, -0.011], [0.068, 1.618, -0.012], [0.061, 1.616, -0.012]].map(P), 0.0034, HN.canal, { label: lb('External acoustic meatus') }).renderOrder = 3;
    sph(SE, n('auricle'), 1, P([0.087, 1.632, -0.008]), HN.ear, { scale: [0.0055, 0.024, 0.016], rot: [0, s * 0.35, 0], label: lb('Auricle') });
    face(mesh(SE, n('tympanic_membrane'), new THREE.CircleGeometry(0.0042, 28), HN.tymp, lb('Tympanic membrane'), V(...P([0.0605, 1.616, -0.012]))), V(s, -0.45, 0.3));
    sph(SE, n('tympanic_cavity'), 1, P([0.0565, 1.618, -0.0115]), HN.cav, { scale: [0.0028, 0.0052, 0.0048], label: lb('Tympanic cavity') }).renderOrder = 2;
    seg(SE, n('malleus'), P([0.0598, 1.6125, -0.0118]), P([0.0578, 1.6215, -0.0118]), 0.0005, 0.0007, HN.oss, { label: lb('Malleus') }); sph(SE, n('malleus_head'), 0.0011, P([0.0577, 1.622, -0.0118]), HN.oss, { label: lb('Malleus') });
    sph(SE, n('incus'), 0.001, P([0.0565, 1.6218, -0.0134]), HN.oss, { label: lb('Incus') }); seg(SE, n('incus_long_process'), P([0.0565, 1.6215, -0.0134]), P([0.0558, 1.6165, -0.0137]), 0.0005, 0.0003, HN.oss, { label: lb('Incus') });
    seg(SE, n('stapes'), P([0.0558, 1.6165, -0.0137]), P([0.053, 1.6168, -0.0128]), 0.0004, 0.0004, HN.oss, { label: lb('Stapes') }); box(SE, n('stapes_footplate'), [0.0004, 0.0012, 0.0024], P([0.0528, 1.6168, -0.0128]), HN.oss, { label: lb('Stapes') });
    const V0 = V(...P([0.0505, 1.6168, -0.0125]));
    sph(SE, n('vestibule'), 0.0021, V0.toArray(), HN.lab, { label: lb('Vestibule') });
    [['anterior', 'Anterior semicircular canal', [0, 0.003, 0.0012], V(-s * 0.7, 0, 0.7)], ['posterior', 'Posterior semicircular canal', [s * 0.0005, 0.0022, -0.0034], V(s * 0.7, 0, 0.7)], ['lateral', 'Lateral semicircular canal', [s * 0.0032, 0, -0.0022], V(0, 1, 0)]].forEach(([k, l, o, nrm]) =>
      face(mesh(SE, n(k + '_semicircular_canal'), new THREE.TorusGeometry(0.0026, 0.00045, 8, 28), HN.lab, lb(l), V0.clone().add(V(...o))), nrm));
    { const ax = V(s * 0.55, -0.2, 0.8).normalize(), u = new THREE.Vector3().crossVectors(ax, V(0, 1, 0)).normalize(), w = new THREE.Vector3().crossVectors(ax, u), C = V(...P([0.0455, 1.612, -0.008])), pts = [];
      for (let i = 0; i <= 60; i++) { const a = (i / 60) * 2.6 * Math.PI * 2, r = 0.0034 * (1 - 0.7 * i / 60); pts.push(C.clone().addScaledVector(u, Math.cos(a) * r).addScaledVector(w, Math.sin(a) * r).addScaledVector(ax, 0.0028 * i / 60).toArray()); }
      tube(SE, n('cochlea'), pts, 0.0007, HN.lab, { label: lb('Cochlea') }); }
    nv('cochlear_root', 'Cochlear root (CN VIII)', [[0.046, 1.582, -0.02], [0.046, 1.598, -0.014], [0.0455, 1.61, -0.009]], 0.0007);
    nv('vestibular_root', 'Vestibular root (CN VIII)', [[0.046, 1.582, -0.02], [0.049, 1.6, -0.016], [0.0505, 1.615, -0.013]], 0.0007);
    tube(SE, n('pharyngotympanic_tube'), [[0.054, 1.616, -0.006], [0.04, 1.607, 0.0], [0.026, 1.597, 0.003], [0.0148, 1.586, 0.002]].map(P), 0.0013, HN.et, { label: lb('Pharyngotympanic (auditory) tube') });
    face(mesh(DG, n('torus_tubarius'), new THREE.TorusGeometry(0.0026, 0.0009, 8, 20), M('torus_tubarius', 0xd27b78, 0.4), lb('Torus tubarius'), V(...P([0.0148, 1.586, 0.002]))), V(s, 0, 0));
    // ── nose and paranasal sinuses ──
    sph(RS, n('maxillary_sinus'), 1, P([0.027, 1.607, 0.052]), HN.sinus, { scale: [0.011, 0.012, 0.015], label: lb('Maxillary sinus') }).renderOrder = 2;
    sph(RS, n('frontal_sinus'), 1, P([0.009, 1.676, 0.082]), HN.sinus, { scale: [0.008, 0.009, 0.0045], label: lb('Frontal sinus') }).renderOrder = 2;
    sph(RS, n('sphenoid_sinus'), 1, P([0.006, 1.592, 0.036]), HN.sinus, { scale: [0.0055, 0.007, 0.008], label: lb('Sphenoid sinus') }).renderOrder = 2;
    for (let i = 0; i < 9; i++) sph(RS, n('ethmoid_air_cell_' + i), 0.0024 + 0.0006 * ((i * 7) % 3) / 2, P([0.0145 + 0.0025 * (i % 2), 1.618 + 0.007 * ((i >> 1) % 3), 0.042 + 0.0085 * (i % 4)]), HN.sinus, { label: lb('Ethmoid air cells') }).renderOrder = 2;
    sph(RS, n('ethmoid_bulla'), 0.0032, P([0.014, 1.608, 0.056]), HN.sinus, { label: lb('Ethmoid bulla') }).renderOrder = 2;
    tube(RS, n('inferior_concha_mucosa'), [[0.0115, 1.587, 0.012], [0.0105, 1.589, 0.04], [0.0095, 1.591, 0.07]].map(P), 0.0027, HN.muc, { label: lb('Inferior nasal concha (mucosa)') });
    tube(RS, n('middle_concha'), [[0.0105, 1.598, 0.022], [0.0095, 1.6, 0.045], [0.009, 1.602, 0.064]].map(P), 0.0023, HN.muc, { label: lb('Middle nasal concha') });
    tube(RS, n('superior_concha'), [[0.0095, 1.607, 0.018], [0.009, 1.609, 0.032], [0.0085, 1.61, 0.044]].map(P), 0.0015, HN.muc, { label: lb('Superior nasal concha') });
    // ── larynx muscles and fold ──
    mus('Cricothyroid', [[0.004, 1.488, 0.0115], [0.011, 1.496, 0.0135], [0.016, 1.5, 0.007]], 0.0022, { w: 1.5, d: 0.5, mt: mm.mid });
    mus('Posterior cricoarytenoid', [[0.002, 1.489, -0.0128], [0.005, 1.497, -0.0124], [0.007, 1.503, -0.0108]], 0.0022, { w: 1.3, d: 0.5, mt: mm.mid, up: [0, 0, -1] });
    mus('Lateral cricoarytenoid', [[0.009, 1.492, 0.004], [0.0085, 1.497, -0.004], [0.0068, 1.4995, -0.008]], 0.0013, { mt: mm.mid });
    mus('Thyroarytenoid', [[0.0028, 1.5065, 0.016], [0.0065, 1.5065, 0.004], [0.0068, 1.5035, -0.006]], 0.0016, { mt: mm.mid });
    mus('Vocalis', [[0.003, 1.5048, 0.015], [0.0048, 1.5048, 0.004], [0.0058, 1.5048, -0.006]], 0.0008, { mt: DP });
    belly(lb('Oblique arytenoid'), [[-s * 0.006, 1.497, -0.0122], [0, 1.5015, -0.0132], [s * 0.006, 1.506, -0.0118]], 0.0009, { mt: mm.mid });
    tube(RS, n('aryepiglottic_fold'), [[0.006, 1.506, -0.009], [0.008, 1.52, 0.0], [0.006, 1.53, 0.012]].map(P), 0.0009, HN.fold, { label: lb('Aryepiglottic fold') });
    // ── thyroid and parathyroid ──
    sph(EN, n('thyroid_lobe'), 1, P([0.0158, 1.478, 0.0045]), HN.thy, { scale: [0.0045, 0.012, 0.0055], rot: [0, 0, -s * 0.12], label: 'Thyroid gland, ' + sd + ' lobe' }).geometry = lumpy(new THREE.SphereGeometry(1, 36, 24), 0.06, 9);
    sph(EN, n('parathyroid_superior'), 0.0012, P([0.0162, 1.487, -0.0012]), HN.para, { label: 'Parathyroid glands, superior pair (' + sd + ')' });
    sph(EN, n('parathyroid_inferior'), 0.0012, P([0.0165, 1.468, -0.0008]), HN.para, { label: 'Parathyroid glands, inferior pair (' + sd + ')' });
    art('superior_thyroid_artery', 'Superior thyroid artery', [[0.027, 1.53, 0.027], [0.025, 1.516, 0.024], [0.021, 1.5, 0.016], [0.017, 1.489, 0.011]]);
    art('superior_laryngeal_artery', 'Superior laryngeal artery', [[0.025, 1.518, 0.024], [0.02, 1.52, 0.022], [0.016, 1.522, 0.019]], 0.0006);
    art('cricothyroid_branch', 'Superior thyroid artery, cricothyroid branch', [[0.021, 1.502, 0.016], [0.012, 1.498, 0.0165], [0.005, 1.4975, 0.017]], 0.0004);
    vn('superior_thyroid_vein', 'Superior thyroid vein', [[0.016, 1.489, 0.012], [0.027, 1.505, 0.017], [0.036, 1.512, 0.009]], 0.0008);
    vn('middle_thyroid_vein', 'Middle thyroid vein', [[0.0195, 1.476, 0.007], [0.028, 1.478, 0.012], [0.035, 1.48, 0.013]], 0.0008);
    vn('inferior_thyroid_vein', 'Inferior thyroid vein', [[0.006, 1.466, 0.0125], [0.006, 1.43, 0.013], [0.007, 1.395, 0.018]], 0.0008);
    // ── face and jaw arteries ──
    art('lingual_artery', 'Lingual artery', [[0.03, 1.535, 0.026], [0.022, 1.534, 0.03], [0.014, 1.54, 0.04], [0.008, 1.55, 0.055]], 0.0011);
    art('facial_artery', 'Facial artery', [[0.032, 1.54, 0.025], [0.04, 1.534, 0.034], [0.05, 1.537, 0.044], [0.054, 1.548, 0.05], [0.042, 1.56, 0.068], [0.026, 1.568, 0.08], [0.02, 1.595, 0.085], [0.014, 1.625, 0.086]], 0.0011);
    art('occipital_artery', 'Occipital artery', [[0.03, 1.538, 0.024], [0.04, 1.56, -0.01], [0.05, 1.58, -0.045], [0.04, 1.61, -0.08]], 0.001);
    art('posterior_auricular_artery', 'Posterior auricular artery', [[0.05, 1.585, -0.004], [0.065, 1.6, -0.02], [0.078, 1.62, -0.022]], 0.0007);
    art('superficial_temporal_artery', 'Superficial temporal artery', [[0.058, 1.6, -0.008], [0.072, 1.615, -0.006], [0.079, 1.64, -0.004], [0.08, 1.67, 0.0], [0.076, 1.69, 0.03]], 0.0009);
    art('superficial_temporal_parietal', 'Superficial temporal artery, parietal branch', [[0.08, 1.67, 0.0], [0.08, 1.69, -0.012], [0.074, 1.71, -0.025]], 0.0007);
    art('maxillary_artery', 'Maxillary artery', [[0.058, 1.6, -0.008], [0.05, 1.602, 0.004], [0.042, 1.606, 0.018], [0.034, 1.61, 0.03]], 0.0011);
    art('middle_meningeal_artery', 'Middle meningeal artery', [[0.05, 1.602, 0.003], [0.046, 1.611, -0.001], [0.058, 1.64, 0.002], [0.066, 1.67, 0.0]], 0.0006);
    art('deep_temporal_arteries', 'Deep temporal arteries', [[0.048, 1.603, 0.007], [0.062, 1.625, 0.012], [0.07, 1.66, 0.01]], 0.0006);
    art('masseteric_artery', 'Masseteric artery', [[0.054, 1.601, -0.003], [0.066, 1.6, 0.008], [0.074, 1.59, 0.02]], 0.0005);
    art('buccal_artery', 'Buccal artery', [[0.044, 1.605, 0.015], [0.05, 1.585, 0.04], [0.048, 1.57, 0.055]], 0.0005);
    art('inferior_alveolar_artery', 'Inferior alveolar artery', [[0.052, 1.601, -0.002], [0.06, 1.588, 0.0], [0.058, 1.565, 0.01], [0.05, 1.55, 0.03], [0.035, 1.542, 0.055], [0.022, 1.538, 0.063], [0.018, 1.534, 0.072]], 0.0006);
    art('posterior_superior_alveolar_artery', 'Posterior superior alveolar artery', [[0.042, 1.606, 0.018], [0.045, 1.595, 0.035], [0.04, 1.585, 0.045]], 0.0006);
    art('infraorbital_artery', 'Infraorbital artery', [[0.034, 1.61, 0.03], [0.03, 1.62, 0.05], [0.028, 1.62, 0.062], [0.028, 1.616, 0.068], [0.02, 1.608, 0.078]], 0.0006);
    art('sphenopalatine_artery', 'Sphenopalatine artery', [[0.034, 1.61, 0.03], [0.022, 1.608, 0.03], [0.01, 1.6, 0.036]], 0.0006);
    // ── face and jaw veins ──
    vn('supraorbital_vein', 'Supraorbital vein', [[0.03, 1.665, 0.087], [0.02, 1.652, 0.087], [0.013, 1.641, 0.085]], 0.0008);
    vn('supratrochlear_vein', 'Supratrochlear vein', [[0.011, 1.678, 0.089], [0.012, 1.66, 0.088], [0.013, 1.641, 0.085]], 0.0008);
    vn('angular_vein', 'Angular vein', [[0.013, 1.641, 0.085], [0.016, 1.62, 0.085], [0.02, 1.6, 0.084]], 0.0011);
    vn('facial_vein', 'Facial vein', [[0.02, 1.6, 0.084], [0.03, 1.575, 0.076], [0.05, 1.55, 0.054], [0.055, 1.538, 0.046], [0.047, 1.528, 0.03], [0.042, 1.525, 0.016]], 0.0013);
    vn('common_facial_vein', 'Common facial vein', [[0.042, 1.525, 0.016], [0.039, 1.515, 0.01], [0.037, 1.508, 0.006]], 0.0018);
    vn('superior_ophthalmic_vein', 'Superior ophthalmic vein', [[0.013, 1.641, 0.085], [0.022, 1.649, 0.072], [0.028, 1.646, 0.056], [0.02, 1.625, 0.04], [0.012, 1.607, 0.022]], 0.0009);
    vn('inferior_ophthalmic_vein', 'Inferior ophthalmic vein', [[0.03, 1.627, 0.076], [0.028, 1.626, 0.058], [0.022, 1.614, 0.04], [0.012, 1.605, 0.022]], 0.0007);
    sph(CSY, n('cavernous_sinus'), 1, P([0.0105, 1.603, 0.02]), HN.csin, { scale: [0.0035, 0.004, 0.009], label: lb('Cavernous sinus') });
    vn('deep_facial_vein', 'Deep facial vein', [[0.04, 1.57, 0.062], [0.045, 1.585, 0.036], [0.046, 1.597, 0.016]], 0.0008);
    for (let k = 0; k < 10; k++) { const a = k * 2.4, c = [0.047 + 0.006 * Math.cos(a), 1.598 + 0.004 * Math.sin(a * 1.3), 0.01 + 0.007 * Math.sin(a)], pts = []; for (let i = 0; i <= 6; i++) { const f = i / 6 - 0.5; pts.push([c[0] + 0.006 * f, c[1] + 0.0025 * Math.sin(f * 9 + k), c[2] + 0.005 * Math.cos(f * 7 + k) * f]); } vn('pterygoid_plexus_' + k, 'Pterygoid plexus', pts, 0.0005); }
    vn('maxillary_vein', 'Maxillary vein', [[0.047, 1.598, 0.008], [0.055, 1.598, -0.006], [0.062, 1.598, -0.014]], 0.0011);
    vn('superficial_temporal_vein', 'Superficial temporal vein', [[0.081, 1.68, -0.008], [0.08, 1.645, -0.009], [0.074, 1.618, -0.013]], 0.001);
    vn('retromandibular_vein', 'Retromandibular vein', [[0.074, 1.618, -0.013], [0.062, 1.598, -0.014], [0.056, 1.575, -0.01], [0.052, 1.555, -0.004]], 0.0014);
    vn('retromandibular_anterior', 'Retromandibular vein, anterior division', [[0.052, 1.555, -0.004], [0.046, 1.535, 0.01], [0.042, 1.525, 0.016]], 0.0012);
    vn('external_jugular_vein', 'External jugular vein (from posterior division of retromandibular vein)', [[0.052, 1.555, -0.004], [0.06, 1.53, -0.012], [0.062, 1.48, -0.01], [0.058, 1.42, 0.0]], 0.0016);
    vn('lingual_vein', 'Lingual vein', [[0.012, 1.55, 0.05], [0.022, 1.534, 0.031], [0.036, 1.522, 0.012]], 0.0009);
    vn('inferior_alveolar_vein', 'Inferior alveolar vein', [[0.02, 1.539, 0.064], [0.035, 1.5435, 0.055], [0.05, 1.5515, 0.03], [0.058, 1.5665, 0.01], [0.055, 1.598, -0.004]], 0.0005);
    // ── trigeminal branches, laryngeal nerves, ansa cervicalis ──
    tag(sph(NS, n('pterygopalatine_ganglion'), 0.0019, P([0.034, 1.608, 0.03]), NMN, { label: lb('Pterygopalatine ganglion') }), T);
    nv('infraorbital_nerve', 'Infraorbital nerve', [[0.034, 1.612, 0.03], [0.031, 1.621, 0.05], [0.029, 1.621, 0.062], [0.028, 1.617, 0.068]], 0.0011);
    [[0.034, 1.607, 0.075], [0.022, 1.604, 0.079], [0.02, 1.615, 0.081], [0.033, 1.62, 0.076]].forEach((e, k) => nv('infraorbital_branch_' + k, 'Infraorbital nerve', [[0.028, 1.617, 0.068], [(0.028 + e[0]) / 2, (1.617 + e[1]) / 2 + 0.001, (0.068 + e[2]) / 2 + 0.003], e], 0.0004));
    nv('zygomatic_nerve', 'Zygomatic nerve', [[0.034, 1.612, 0.032], [0.045, 1.625, 0.05], [0.05, 1.63, 0.064]], 0.0006);
    nv('posterior_superior_alveolar_nerve', 'Superior alveolar nerves (posterior)', [[0.036, 1.61, 0.03], [0.044, 1.596, 0.04], [0.04, 1.585, 0.045]], 0.0005);
    nv('middle_superior_alveolar_nerve', 'Superior alveolar nerves (middle)', [[0.03, 1.62, 0.055], [0.033, 1.6, 0.058], [0.032, 1.585, 0.055]], 0.0005);
    nv('anterior_superior_alveolar_nerve', 'Superior alveolar nerves (anterior)', [[0.029, 1.621, 0.062], [0.022, 1.6, 0.068], [0.014, 1.585, 0.068]], 0.0005);
    nv('inferior_alveolar_nerve', 'Inferior alveolar nerve (in mandibular canal)', [[0.058, 1.56, 0.018], [0.055, 1.5555, 0.025], [0.048, 1.5495, 0.035], [0.035, 1.5435, 0.055], [0.022, 1.539, 0.064]], 0.001);
    [[0.016, 1.53, 0.074], [0.026, 1.547, 0.073], [0.012, 1.541, 0.073]].forEach((e, k) => nv('mental_branch_' + k, 'Mental nerve', [[0.022, 1.539, 0.064], [(0.022 + e[0]) / 2, (1.539 + e[1]) / 2, 0.07], e], 0.0004));
    for (let k = 0; k < 5; k++) { const f = k / 4, p = [0.054 - 0.03 * f, 1.555 - 0.015 * f, 0.026 + 0.036 * f]; nv('inferior_dental_' + k, 'Inferior alveolar nerve, inferior dental branches', [p, [p[0], p[1] + 0.006, p[2] + 0.001]], 0.0003); }
    nv('lingual_nerve', 'Lingual nerve', [[0.04, 1.58, 0.032], [0.036, 1.565, 0.038], [0.026, 1.553, 0.044], [0.012, 1.552, 0.05]], 0.0009);
    nv('buccal_nerve', 'Buccal nerve', [[0.04, 1.58, 0.032], [0.05, 1.578, 0.045], [0.052, 1.57, 0.058]], 0.0006);
    nv('auriculotemporal_nerve', 'Auriculotemporal nerve', [[0.035, 1.592, 0.026], [0.052, 1.598, -0.002], [0.068, 1.61, -0.012], [0.077, 1.64, -0.01], [0.079, 1.67, -0.006]], 0.0006);
    nv('masseteric_nerve', 'Masseteric nerve', [[0.04, 1.59, 0.03], [0.055, 1.602, 0.01], [0.072, 1.598, 0.02]], 0.0006);
    nv('mylohyoid_nerve', 'Mylohyoid nerve', [[0.055, 1.565, 0.02], [0.045, 1.545, 0.025], [0.025, 1.538, 0.04]], 0.0004);
    nv('deep_temporal_nerves', 'Deep temporal nerves', [[0.038, 1.593, 0.028], [0.055, 1.615, 0.015], [0.068, 1.65, 0.008]], 0.0005);
    nv('superior_laryngeal_nerve', 'Superior laryngeal nerve', [[0.03, 1.545, -0.01], [0.026, 1.53, 0.0]], 0.0008);
    nv('internal_laryngeal_nerve', 'Superior laryngeal nerve, internal branch (sensory)', [[0.026, 1.53, 0.0], [0.02, 1.524, 0.013], [0.015, 1.522, 0.018]], 0.0006);
    nv('external_laryngeal_nerve', 'Superior laryngeal nerve, external branch (motor to cricothyroid)', [[0.026, 1.53, 0.0], [0.021, 1.51, 0.012], [0.012, 1.497, 0.0145]], 0.0004);
    nv('recurrent_laryngeal_nerve', 'Recurrent laryngeal nerve', s > 0 ? [[0.018, 1.36, -0.01], [0.022, 1.34, 0.004], [0.012, 1.335, 0.01], [0.006, 1.345, -0.012], [0.009, 1.4, -0.011], [0.009, 1.46, -0.01], [0.006, 1.488, -0.0125]] : [[0.026, 1.41, 0.0], [0.028, 1.4, 0.016], [0.02, 1.398, 0.006], [0.012, 1.42, -0.01], [0.009, 1.46, -0.01], [0.006, 1.488, -0.0125]], 0.0006);
    nv('ansa_superior_root', 'Ansa cervicalis, superior root (C1)', [[0.026, 1.555, 0.02], [0.03, 1.52, 0.024], [0.031, 1.47, 0.022], [0.03, 1.45, 0.02]], 0.0005);
    nv('ansa_inferior_root', 'Ansa cervicalis, inferior root (C2–C3)', [[0.03, 1.45, 0.02], [0.036, 1.47, 0.0], [0.03, 1.52, -0.02], [0.02, 1.54, -0.03]], 0.0005);
    nv('ansa_branch', 'Ansa cervicalis, branch to infrahyoid muscles', [[0.031, 1.47, 0.022], [0.02, 1.45, 0.04], [0.013, 1.44, 0.058]], 0.0004);
    // ── muscles of mastication, face, floor of mouth, tongue, pharynx, neck ──
    mus('Masseter', [[0.07, 1.612, 0.042], [0.078, 1.592, 0.022], [0.076, 1.568, 0.004]], 0.0075, { w: 1.6, d: 0.45, mt: SU, up: [1, 0, 0] });
    [0.45, 0.2, -0.05, -0.3, -0.5].forEach((a, k) => belly(lb('Temporalis'), [skPt(s * 0.82, 0.36, a, 1.03), skPt(s * 0.95, 0.05, a * 0.55 + 0.1, 1.08), P([0.063, 1.609, 0.02])], 0.0045, { w: 1.6, d: 0.45, mt: mm.mid, up: [s, 0, 0] }));
    mus('Lateral pterygoid', [[0.035, 1.602, 0.026], [0.05, 1.608, 0.012], [0.066, 1.614, -0.002]], 0.004, { mt: DP });
    mus('Medial pterygoid', [[0.034, 1.598, 0.024], [0.048, 1.585, 0.012], [0.062, 1.567, 0.0]], 0.004, { w: 1.4, mt: DP });
    mus('Digastric, anterior belly', [[0.007, 1.534, 0.062], [0.015, 1.531, 0.038], [0.021, 1.531, 0.014]], 0.0025, { mt: mm.mid });
    tube(MS, n('digastric_tendon'), [[0.021, 1.531, 0.014], [0.024, 1.531, 0.008], [0.027, 1.533, 0.003]].map(P), 0.0009, mm.ten, { label: lb('Digastric, intermediate tendon') });
    mus('Digastric, posterior belly', [[0.027, 1.533, 0.003], [0.04, 1.55, -0.01], [0.055, 1.578, -0.026]], 0.003, { mt: mm.mid });
    seg(SK, n('styloid_process'), P([0.052, 1.606, -0.02]), P([0.044, 1.58, -0.01]), 0.0012, 0.0004, mat.bone, { label: lb('Styloid process') });
    mus('Stylohyoid', [[0.05, 1.598, -0.018], [0.04, 1.565, -0.006], [0.028, 1.535, 0.0]], 0.0014, { mt: mm.mid });
    for (let k = 0; k < 5; k++) { const f = k / 4; mus('Mylohyoid', [[0.012 + 0.038 * f, 1.538 + 0.012 * f, 0.06 - 0.03 * f], [0.006 + 0.012 * f, 1.535 + 0.002 * f, 0.058 - 0.03 * f], [0.0015, 1.533, 0.056 - 0.038 * f]], 0.0018, { w: 2.6, d: 0.35, mt: mm.mid, up: [0, 1, 0] }); }
    mus('Geniohyoid', [[0.003, 1.538, 0.062], [0.004, 1.537, 0.04], [0.005, 1.536, 0.02]], 0.0022, { mt: mm.mid });
    mus('Genioglossus', [[0.003, 1.541, 0.062], [0.003, 1.549, 0.05], [0.003, 1.561, 0.035]], 0.003, { w: 0.6, mt: DP });
    mus('Hyoglossus', [[0.018, 1.536, 0.008], [0.018, 1.546, 0.018], [0.016, 1.556, 0.028]], 0.0025, { mt: mm.mid });
    mus('Styloglossus', [[0.05, 1.6, -0.018], [0.035, 1.575, 0.005], [0.02, 1.558, 0.03]], 0.0017, { mt: mm.mid });
    mus('Thyrohyoid', [[0.013, 1.508, 0.0205], [0.017, 1.52, 0.021], [0.02, 1.532, 0.014]], 0.0025, { w: 1.4, d: 0.5, mt: mm.mid });
    mus('Sternothyroid', [[0.011, 1.39, 0.072], [0.012, 1.43, 0.042], [0.014, 1.47, 0.017], [0.015, 1.505, 0.0205]], 0.003, { w: 1.5, d: 0.5, mt: DP });
    mus('Levator veli palatini', [[0.03, 1.595, -0.01], [0.018, 1.585, -0.004], [0.008, 1.577, 0.0]], 0.0015, { mt: DP });
    mus('Palatopharyngeus', [[0.01, 1.572, 0.0], [0.015, 1.555, -0.006], [0.014, 1.53, -0.014]], 0.0012, { mt: mm.mid });
    mus('Zygomaticus major', [[0.058, 1.615, 0.062], [0.045, 1.59, 0.074], [0.026, 1.562, 0.08]], 0.0018, { mt: SU });
    mus('Depressor anguli oris', [[0.024, 1.553, 0.078], [0.026, 1.542, 0.072], [0.028, 1.53, 0.064]], 0.0025, { w: 1.8, d: 0.4, mt: SU });
    mus('Buccinator', [[0.026, 1.56, 0.072], [0.04, 1.562, 0.058], [0.052, 1.565, 0.04]], 0.005, { w: 1.3, d: 0.3, mt: mm.mid, up: [1, 0, 0] });
    mus('Splenius capitis', [[0.005, 1.43, -0.07], [0.02, 1.5, -0.062], [0.045, 1.57, -0.05], [0.06, 1.59, -0.035]], 0.006, { w: 1.6, d: 0.5, mt: mm.mid, up: [0, 0, -1] });
    mus('Semispinalis capitis', [[0.012, 1.43, -0.056], [0.014, 1.5, -0.054], [0.018, 1.58, -0.07]], 0.0055, { mt: DP, up: [0, 0, -1] });
    mus('Obliquus capitis inferior', [[0.004, 1.565, -0.05], [0.018, 1.571, -0.048], [0.03, 1.575, -0.044]], 0.003, { mt: DP });
    mus('Rectus capitis posterior major', [[0.003, 1.565, -0.052], [0.012, 1.585, -0.064], [0.02, 1.6, -0.075]], 0.0025, { mt: DP });
  }
  // midline
  sph(DG, 'pharyngeal_tonsil', 1, [0, 1.585, -0.012], HN.lymph, { scale: [0.008, 0.0035, 0.004], label: 'Pharyngeal tonsil (adenoid)' });
  mreg('Orbicularis oris', new THREE.TorusGeometry(0.0155, 0.003, 8, 36).scale(1, 0.55, 0.6), mm.sup, V(0, 1.556, 0.079));
  belly('Procerus', [[0, 1.648, 0.09], [0, 1.66, 0.091], [0, 1.672, 0.09]], 0.002, { w: 2, d: 0.4, mt: SU });
  belly('Transverse arytenoid', [[-0.0062, 1.5015, -0.0115], [0, 1.5015, -0.0127], [0.0062, 1.5015, -0.0115]], 0.0015, { mt: mm.mid, up: [0, 1, 0] });
  sph(EN, 'thyroid_isthmus', 1, [0, 1.468, 0.0145], HN.thy, { scale: [0.009, 0.0035, 0.0028], label: 'Isthmus of thyroid gland' });
  seg(EN, 'pyramidal_lobe', [0.002, 1.471, 0.015], [0.003, 1.492, 0.0135], 0.0016, 0.0009, HN.thy, { label: 'Pyramidal lobe' });
  [['Superior pharyngeal constrictor', 1.552, 1.583, 0.0175, -0.003], ['Middle pharyngeal constrictor', 1.528, 1.555, 0.0175, -0.011], ['Inferior pharyngeal constrictor', 1.485, 1.53, 0.0158, -0.005]].forEach(([l, y0, y1, r, zc]) => {
    const g = new THREE.CylinderGeometry(r, r, y1 - y0, 28, 4, true, Math.PI * 0.5 + 0.35, Math.PI - 0.7); g.translate(0, (y0 + y1) / 2, zc); mreg(l, g, mm.mid); });
  { const sh = pts => new THREE.ShapeGeometry(new THREE.Shape(pts.map(([z, y]) => new THREE.Vector2(z, y)))).rotateY(-Math.PI / 2);
    reg(SK, 'perpendicular_plate_ethmoid', new THREE.Mesh(sh([[0.02, 1.622], [0.058, 1.626], [0.06, 1.606], [0.035, 1.597], [0.02, 1.597]]), HN.sep), { label: 'Nasal septum, perpendicular plate of ethmoid' });
    reg(SK, 'septal_cartilage', new THREE.Mesh(sh([[0.058, 1.626], [0.084, 1.622], [0.086, 1.603], [0.06, 1.597], [0.06, 1.606]]), HN.sepC), { label: 'Septal cartilage' });
    reg(SK, 'crista_galli', new THREE.Mesh(sh([[0.052, 1.622], [0.058, 1.634], [0.064, 1.622]]), HN.sep), { label: 'Crista galli' }); }
}
}

// ───────── PLANES ─────────
const planes = {};
function plane(key, color, w, h, setup) {
  const g = new THREE.Group(); g.name = key + '_plane'; g.visible = false;
  const pm = new THREE.MeshStandardMaterial({ name: key + '_plane', color, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false, roughness: 0.9, metalness: 0 });
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(w, h), pm); sheet.name = key + '_sheet'; sheet.renderOrder = 3; g.add(sheet);
  const em = new THREE.MeshStandardMaterial({ name: key + '_edge', color, roughness: 0.6, metalness: 0 }), t = 0.006;
  for (const [nm, gw, gh, x, y] of [['top', w, t, 0, h / 2], ['bottom', w, t, 0, -h / 2], ['l', t, h, -w / 2, 0], ['r', t, h, w / 2, 0]]) {
    const e = new THREE.Mesh(new THREE.BoxGeometry(gw, gh, t), em); e.name = `${key}_edge_${nm}`; e.position.set(x, y, 0); g.add(e);
  }
  setup(g); model.add(g); planes[key] = g;
}
plane('sagittal', 0xc28d41, 0.7, 1.85, g => { g.rotation.y = Math.PI / 2; g.position.set(0, 0.93, 0); });
plane('coronal', 0x605d5d, 0.9, 1.85, g => { g.position.set(0, 0.93, 0); });
plane('transverse', 0x5a3b0a, 0.9, 0.7, g => { g.rotation.x = -Math.PI / 2; g.position.set(0, 1.2, 0); });


// ───────── SKIN ENVELOPES ─────────
// The skin of the neck, torso and limbs is shrink-wrapped around every structure beneath it, so no muscle, bone or nerve breaks the surface.
{
  model.updateMatrixWorld(true);
  const inv = model.matrixWorld.clone().invert(), mw = new THREE.Matrix4(), v = new THREE.Vector3(), pts = [];
  for (const k of ['skeletal', 'muscular', 'circulatory', 'nervous', 'respiratory', 'digestive', 'urinary']) G[k].traverse(o => {
    if (!o.isMesh || !o.geometry.attributes.position) return;
    for (let p = o; p; p = p.parent) if (p.name === 'magnified_alveolar_unit') return;
    mw.multiplyMatrices(inv, o.matrixWorld); const pa = o.geometry.attributes.position, st = Math.max(1, Math.ceil(pa.count / 2500));
    for (let i = 0; i < pa.count; i += st) { v.fromBufferAttribute(pa, i).applyMatrix4(mw); if (Math.abs(v.x) < 0.36 && v.y > -0.01) pts.push(v.x, v.y, v.z); }
  });
  function envelope(name, label, axis, sel, o = {}) {
    const A = axis.map(p => V(...p)), cum = [0]; for (let i = 1; i < A.length; i++) cum.push(cum[i - 1] + A[i].distanceTo(A[i - 1]));
    const Lt = cum[cum.length - 1], NS = Math.max(4, Math.round(Lt / (o.ds || 0.012))), NA = 28, R = new Float32Array((NS + 1) * NA), ref = V(...(o.ref || [0, 0, 1]));
    const at = s => { let i = 1; while (i < A.length - 1 && cum[i] < s) i++; return A[i - 1].clone().lerp(A[i], Math.min(1, Math.max(0, (s - cum[i - 1]) / (cum[i] - cum[i - 1])))); };
    const frames = []; for (let i = 0; i <= NS; i++) { const s = i / NS * Lt, T = at(Math.min(Lt, s + 0.02)).sub(at(Math.max(0, s - 0.02))).normalize(), N = ref.clone().addScaledVector(T, -ref.dot(T)).normalize(); frames.push({ C: at(s), T, N, B: new THREE.Vector3().crossVectors(T, N) }); }
    const q = new THREE.Vector3(), d = new THREE.Vector3(), ab = new THREE.Vector3();
    for (let i = 0; i < pts.length; i += 3) {
      q.set(pts[i], pts[i + 1], pts[i + 2]); if (!sel(q)) continue;
      let bs = 0, bd = 1e9;
      for (let j = 1; j < A.length; j++) { ab.copy(A[j]).sub(A[j - 1]); const l2 = ab.lengthSq(), k = Math.min(1, Math.max(0, d.copy(q).sub(A[j - 1]).dot(ab) / l2)); const dd = d.copy(A[j - 1]).addScaledVector(ab, k).distanceToSquared(q); if (dd < bd) { bd = dd; bs = cum[j - 1] + k * Math.sqrt(l2); } }
      const si = Math.round(bs / Lt * NS), f = frames[si]; d.copy(q).sub(f.C); const x = d.dot(f.N), y = d.dot(f.B), r = Math.hypot(x, y);
      const id = si * NA + ((Math.round(Math.atan2(y, x) / (2 * Math.PI) * NA) % NA) + NA) % NA; if (r > R[id]) R[id] = r;
    }
    const g2 = (Rr, i, j) => Rr[Math.min(NS, Math.max(0, i)) * NA + ((j % NA) + NA) % NA];
    for (let it = 0; it < 4; it++) { const Rn = R.slice(); for (let i = 0; i <= NS; i++) for (let j = 0; j < NA; j++) { if (R[i * NA + j] > 0) continue; let s = 0, c = 0; for (const [di, dj] of [[0, 1], [0, -1], [1, 0], [-1, 0], [0, 2], [0, -2]]) { const w = g2(R, i + di, j + dj); if (w > 0) { s += w; c++; } } if (c) Rn[i * NA + j] = s / c; } R.set(Rn); }
    for (let k = 0; k < R.length; k++) R[k] = Math.max(R[k], o.min || 0.012);
    // dilate with a gentle falloff so lone peaks become broad bumps, blur, then never drop below the true extent
    const R0 = R.slice(), fall = o.fall ?? 0.0035;
    { const Rd = R.slice(); for (let i = 0; i <= NS; i++) for (let j = 0; j < NA; j++) { let m = 0; for (let di = -2; di <= 2; di++) for (let dj = -3; dj <= 3; dj++) m = Math.max(m, g2(R0, i + di, j + dj) - fall * Math.hypot(di, dj)); Rd[i * NA + j] = m; } R.set(Rd); }
    for (let it = 0; it < (o.smooth ?? 5); it++) { const Rn = R.slice(); for (let i = 0; i <= NS; i++) for (let j = 0; j < NA; j++) Rn[i * NA + j] = (2 * g2(R, i, j) + g2(R, i, j - 1) + g2(R, i, j + 1) + g2(R, i - 1, j) + g2(R, i + 1, j)) / 6; R.set(Rn); }
    for (let k = 0; k < R.length; k++) R[k] = Math.max(R[k], R0[k]);
    const mg = o.margin ?? 0.004, rings = []; for (let i = 0; i <= NS; i++) rings.push([i, 1, 0]);
    if (o.capStart) rings.unshift([0, 0.3, -0.012], [0, 0.7, -0.007]);
    if (o.capEnd) rings.push(o.endFull ? [NS, 0.85, 0.006] : [NS, 0.7, 0.007], o.endFull ? [NS, 0.45, 0.011] : [NS, 0.3, 0.012]);
    const pos = [], idx = [];
    rings.forEach(([i, k, off]) => { const f = frames[i]; for (let j = 0; j <= NA; j++) { const a = j / NA * 2 * Math.PI, r = (R[i * NA + j % NA] + mg) * k, cx = Math.cos(a) * r, cy = Math.sin(a) * r;
      pos.push(f.C.x + f.T.x * off + cx * f.N.x + cy * f.B.x, f.C.y + f.T.y * off + cx * f.N.y + cy * f.B.y, f.C.z + f.T.z * off + cx * f.N.z + cy * f.B.z); } });
    for (let i = 0; i < rings.length - 1; i++) for (let j = 0; j < NA; j++) { const a = i * (NA + 1) + j, b = a + 1, c = a + NA + 1; idx.push(a, b, c, b, c + 1, c); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    reg('skin', name, new THREE.Mesh(g, mat.skin), { label });
  }
  const bnd = y => y > 1.36 ? 0.2 : y < 1.0 ? 0.21 : 0.19, arm = (q, s) => s * q.x > bnd(q.y) && q.y > 0.6;
  envelope('torso', 'Torso', [[0, 0.8, -0.012], [0, 1.475, -0.012]], q => q.y >= 0.8 && q.y <= 1.475 && Math.abs(q.x) <= bnd(q.y), { min: 0.05, capStart: true });
  envelope('neck', 'Neck', [[0, 1.44, -0.01], [0, 1.55, 0.0]], q => q.y > 1.44 && q.y < 1.535 && Math.abs(q.x) < 0.09, { min: 0.04 });
  for (const s of [-1, 1]) {
    const sd = s < 0 ? 'right' : 'left';
    envelope('shoulder_' + sd, 'Torso', [[s * 0.07, 1.455, -0.01], [s * 0.13, 1.445, -0.008], [s * 0.19, 1.42, -0.004]],
      q => s * q.x > 0.09 && s * q.x < 0.2 && q.y > 1.39 && q.y < 1.5 && Math.hypot(q.y - 1.44, q.z + 0.008) < 0.09, { min: 0.02, ds: 0.01, margin: 0.003 });
    envelope('arm_' + sd, 'Arms and hands (' + sd + ')', [[s * 0.14, 1.44, -0.01], [s * 0.205, 1.33, 0], [s * 0.232, 1.075, 0], [s * 0.268, 0.845, 0.012], [s * 0.275, 0.655, 0.02]], q => s * q.x > 0.17 && q.y > 0.6 && !(q.y < 1.0 && s * q.x < 0.21), { min: 0.008, capStart: true, capEnd: true, endFull: true, fall: 0.002 });
    envelope('leg_' + sd, 'Legs and feet (' + sd + ')', [[s * 0.09, 0.9, -0.01], [s * 0.1, 0.46, 0], [s * 0.1, 0.07, -0.012]],
      q => s * q.x > 0 && q.y < 0.87 && q.y > 0.05 && !arm(q, s) && !(q.y < 0.09 && (q.z > 0.02 || q.z < -0.05)) && !(q.y > 0.8 && Math.abs(q.x) > 0.21), { min: 0.02, margin: 0.006 });
    envelope('foot_' + sd, 'Legs and feet (' + sd + ')', [[s * 0.104, 0.035, -0.075], [s * 0.1, 0.03, 0.0], [s * 0.108, 0.018, 0.17]],
      q => s * q.x > 0 && q.y < 0.095 && s * q.x < 0.2, { min: 0.006, ref: [0, 1, 0], capStart: true, capEnd: true, ds: 0.01 });
  }
  // external genitalia: skin shells offset outward from the reproductive surfaces, so they read as skin even when the reproductive system is hidden
  const skinInv = G.skin.matrixWorld.clone().invert();
  for (const [src, nm, d] of [['scrotum', 'scrotum_skin', 0.0012], ['penile_skin', 'penis_shaft_skin', 0.0009], ['glans_penis', 'penis_glans_skin', 0.0016]]) {
    const o = G.reproductive.getObjectByName(src); if (!o) continue;
    const g = o.geometry.clone(); g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(skinInv, o.matrixWorld)); g.computeVertexNormals();
    const p = g.attributes.position, n = g.attributes.normal; for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + n.getX(i) * d, p.getY(i) + n.getY(i) * d, p.getZ(i) + n.getZ(i) * d);
    g.computeVertexNormals(); reg('skin', nm, new THREE.Mesh(g, mat.skin), { label: 'Genitals' });
  }
}
// ───────── SEX: the uploaded male and female body meshes are the skin. Each is retargeted onto the skeleton's joints, then fitted to the structures beneath. ─────────
const SEXG = { male: new THREE.Group(), female: new THREE.Group() };
SEXG.male.name = 'skin_male'; SEXG.female.name = 'skin_female'; SEXG.female.visible = false;
G.skin.children.slice().forEach(o => SEXG.male.add(o)); G.skin.add(SEXG.male, SEXG.female);
const reproM = new THREE.Group(); reproM.name = 'reproductive_male'; G.reproductive.children.slice().forEach(o => reproM.add(o)); G.reproductive.add(reproM);
const reproF = new THREE.Group(); reproF.name = 'reproductive_female'; reproF.visible = false; G.reproductive.add(reproF);
const FATG = { male: new THREE.Group(), female: new THREE.Group() }; FATG.male.name = 'fat_male'; FATG.female.name = 'fat_female'; FATG.female.visible = false; G.fat.add(FATG.male, FATG.female);
{
  const F = (name, mesh, label) => { const m = reg('reproductive', name, mesh, { label }); reproF.add(m); return m; };
  const moveF = (...names) => names.forEach(name => { const m = G.reproductive.getObjectByName(name); if (m) reproF.add(m); });
  const FM = {
    soft: M('female_reproductive_soft', 0xc98a87, 0.5, { transparent: true, opacity: 0.92 }),
    inner: M('female_reproductive_inner', 0xb56f71, 0.45, { transparent: true, opacity: 0.85 }),
    duct: M('female_reproductive_duct', 0xe7cfba, 0.42),
    vessel: M('female_reproductive_vessel', 0xc36f77, 0.45),
    breast: M('female_breast', 0xd3a08f, 0.58, { transparent: true, opacity: 0.42, depthWrite: false, side: THREE.DoubleSide }),
    breastCore: M('female_breast_core', 0xc47b6b, 0.55, { transparent: true, opacity: 0.88, depthWrite: false, side: THREE.DoubleSide }),
    areola: M('female_areola', 0x8c4e44, 0.45),
    nipple: M('female_nipple', 0x6f3b35, 0.42),
    ligament: M('female_cooper_ligament', 0xeadccf, 0.72, { transparent: true, opacity: 0.45, depthWrite: false }),
    wall: M('female_uterine_wall', 0xc98a87, 0.5, { transparent: true, opacity: 0.28, depthWrite: false }),
    endo: M('female_endometrium', 0xb04a55, 0.45, { transparent: true, opacity: 0.88 }),
    follicle: M('female_graafian_follicle', 0xe9d4a8, 0.3, { transparent: true, opacity: 0.8 }),
    luteum: M('female_corpus_luteum', 0xe3b23c, 0.5),
    oocyte: M('female_oocyte', 0xfff4d6, 0.25),
    acini: M('female_acini', 0xe0a07a, 0.5),
    fibrous: M('female_breast_fibrous', 0xe4d3c0, 0.7, { transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide }),
    node: M('female_lymph_node', 0x8fae83, 0.55),
    gland: M('female_montgomery_gland', 0xa9645a, 0.5),
  };
  // merges many small spheres into one geometry, so a breast holds 16 lobes of acini without hundreds of draw calls
  const sphereCluster = (pts, r) => {
    const pos = [], idx = []; let base = 0;
    pts.forEach(p => {
      const g = new THREE.SphereGeometry(r, 8, 6), a = g.attributes.position;
      for (let i = 0; i < a.count; i++) pos.push(a.getX(i) + p[0], a.getY(i) + p[1], a.getZ(i) + p[2]);
      g.index.array.forEach(k => idx.push(k + base)); base += a.count; g.dispose();
    });
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setIndex(idx); out.computeVertexNormals();
    return out;
  };
  const tubeF = (name, pts, r, mt, label) => {
    const c = new THREE.CatmullRomCurve3(pts.map(p => p.isVector3 ? p.clone() : V(...p)));
    const g = new THREE.TubeGeometry(c, Math.max(24, pts.length * 14), r, 12, false);
    g.computeVertexNormals();
    return F(name, new THREE.Mesh(g, mt), label);
  };
  const hollowEllipsoid = (rx, ry, rz, sc = 1) => {
    const g = new THREE.SphereGeometry(1, 38, 26);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const k = 1 + 0.12 * Math.exp(-((y - 0.25) ** 2) / 0.14) + 0.08 * Math.exp(-(z ** 2) / 0.5);
      p.setXYZ(i, x * rx * k * sc, y * ry * sc, z * rz * sc);
    }
    g.computeVertexNormals();
    return g;
  };
  // uterus, cervix and vagina
  const uc = V(0, 0.845, 0.018);
  {
    const g = new THREE.SphereGeometry(1, 48, 30), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const taper = 0.78 + 0.42 * Math.max(0, y + 0.2);
      const antPost = 1 + 0.08 * Math.sin((y + 1) * Math.PI);
      p.setXYZ(i, uc.x + x * 0.022 * taper, uc.y + y * 0.03, uc.z + z * 0.018 * antPost);
    }
    g.computeVertexNormals();
    F('uterus', new THREE.Mesh(g, FM.wall), 'Uterus (womb)');
  }
  F('endometrium', new THREE.Mesh(hollowEllipsoid(0.013, 0.02, 0.009, 1), FM.endo), 'Endometrium').position.copy(uc).add(V(0, -0.002, 0.001));
  F('myometrium', new THREE.Mesh(hollowEllipsoid(0.016, 0.024, 0.012, 1), FM.wall), 'Myometrium').position.copy(uc);
  F('perimetrium', new THREE.Mesh(hollowEllipsoid(0.019, 0.027, 0.014, 1), FM.wall), 'Perimetrium').position.copy(uc).setZ(uc.z - 0.001);
  const cervix = new THREE.CylinderGeometry(0.008, 0.006, 0.019, 28, 1);
  cervix.rotateX(Math.PI / 2); cervix.translate(0, 0.807, 0.033);
  F('cervix', new THREE.Mesh(cervix, FM.soft), 'Cervix');
  tubeF('cervical_canal', [[0, 0.817, 0.027], [0, 0.809, 0.032], [0, 0.802, 0.037]], 0.0014, FM.inner, 'Cervical canal');
  tubeF('vagina', [[0, 0.801, 0.039], [0, 0.79, 0.047], [0, 0.772, 0.058], [0, 0.748, 0.067]], 0.0082, FM.soft, 'Vagina');
  sph('reproductive', 'vaginal_opening', 1, [0, 0.736, 0.072], FM.inner, { scale: [0.004, 0.0026, 0.006], label: 'Vaginal opening' });
  moveF('vaginal_opening');
  // ovaries and uterine tubes
  for (const s of [-1, 1]) {
    const sd = s < 0 ? 'right' : 'left';
    const ov = new THREE.SphereGeometry(1, 30, 22);
    ov.scale(0.0095, 0.012, 0.008);
    ov.translate(s * 0.055, 0.842, 0.016);
    F('ovary_' + sd, new THREE.Mesh(ov, FM.soft), 'Ovary (' + sd + ')');
    tubeF('fallopian_tube_' + sd, [[s * 0.017, 0.858, 0.016], [s * 0.03, 0.86, 0.012], [s * 0.044, 0.852, 0.011], [s * 0.054, 0.844, 0.014]], 0.0022, FM.duct, 'Fallopian tube (' + sd + ')');
    const fim = new THREE.ConeGeometry(0.0048, 0.007, 14, 1, true);
    fim.rotateZ(-s * Math.PI / 2); fim.translate(s * 0.059, 0.844, 0.015);
    F('fimbriae_' + sd, new THREE.Mesh(fim, FM.duct), 'Fimbriae (' + sd + ')');
    for (let i = 0; i < 4; i++) sph('reproductive', 'ovarian_follicle_' + sd + '_' + i, 0.0018 + i * 0.00025, [s * (0.052 + 0.002 * Math.sin(i * 1.8)), 0.839 + 0.003 * i, 0.015 + 0.002 * Math.cos(i * 2.1)], FM.inner, { label: 'Ovarian follicle (' + sd + ')' });
    tube('reproductive', 'ovarian_vessel_' + sd, [[s * 0.062, 0.878, 0.008], [s * 0.058, 0.861, 0.012], [s * 0.056, 0.848, 0.014]], 0.0012, FM.vessel, { label: 'Ovarian vessels (' + sd + ')' });
    moveF('ovarian_follicle_' + sd + '_0', 'ovarian_follicle_' + sd + '_1', 'ovarian_follicle_' + sd + '_2', 'ovarian_follicle_' + sd + '_3', 'ovarian_vessel_' + sd);
    // the cycle shows on the right ovary: the dominant follicle matures and ruptures, then becomes the corpus luteum
    if (s < 0) {
      const ovc = [s * 0.055, 0.842, 0.016];
      F('graafian_follicle', new THREE.Mesh(new THREE.SphereGeometry(1, 26, 18), FM.follicle), 'Dominant (Graafian) follicle').position.set(ovc[0] + s * 0.003, ovc[1] + 0.002, ovc[2] + 0.004);
      F('corpus_luteum', new THREE.Mesh(new THREE.SphereGeometry(1, 22, 16), FM.luteum), 'Corpus luteum').position.set(ovc[0] + s * 0.003, ovc[1] + 0.002, ovc[2] + 0.004);
      F('oocyte', new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), FM.oocyte), 'Released oocyte').position.set(s * 0.058, 0.846, 0.017);
    }
  }
  // external genitalia
  F('labia_majora', new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), FM.soft), 'Labia majora').position.set(0, 0.744, 0.074);
  const lm = G.reproductive.getObjectByName('labia_majora'); lm.scale.set(0.018, 0.009, 0.011); lm.renderOrder = 2;
  F('labia_minora', new THREE.Mesh(new THREE.SphereGeometry(1, 26, 18), FM.inner), 'Labia minora').position.set(0, 0.744, 0.076);
  G.reproductive.getObjectByName('labia_minora').scale.set(0.011, 0.006, 0.007);
  sph('reproductive', 'clitoris', 1, [0, 0.752, 0.079], FM.inner, { scale: [0.0032, 0.0028, 0.0032], label: 'Clitoris' });
  sph('reproductive', 'urethral_opening_female', 1, [0, 0.7465, 0.078], FM.inner, { scale: [0.0016, 0.0012, 0.0016], label: 'Urethral opening (female)' });
  moveF('clitoris', 'urethral_opening_female');
  // bilateral breasts
  const PI2 = Math.PI * 2;
  for (const s of [-1, 1]) {
    const sd = s < 0 ? 'right' : 'left';
    const center = V(s * 0.092, 1.278, 0.108);
    const outer = new THREE.SphereGeometry(1, 34, 24);
    const op = outer.attributes.position;
    for (let i = 0; i < op.count; i++) {
      const x = op.getX(i), y = op.getY(i), z = op.getZ(i);
      const drop = 1 + 0.22 * Math.max(0, -y);
      op.setXYZ(i, center.x + x * 0.042 * drop, center.y + y * 0.048, center.z + z * 0.036 * (1 + 0.3 * Math.max(0, z)));
    }
    outer.computeVertexNormals();
    F('breast_adipose_' + sd, new THREE.Mesh(outer, FM.breast), 'Breast adipose tissue (' + sd + ')');
    sph('reproductive', 'nipple_' + sd, 1, [center.x, center.y - 0.008, center.z + 0.04], FM.nipple, { scale: [0.0042, 0.0042, 0.0055], label: 'Nipple (' + sd + ')' });
    sph('reproductive', 'areola_' + sd, 1, [center.x, center.y - 0.0085, center.z + 0.035], FM.areola, { scale: [0.014, 0.014, 0.0022], label: 'Areola (' + sd + ')' });
    // 16 radial lobes (the text range is 15 to 20): each has a lactiferous duct from the nipple, a lobule, and a cluster of acini
    const nip = [center.x, center.y - 0.008, center.z + 0.036], NL = 16;
    for (let i = 0; i < NL; i++) {
      const th = (i / NL) * PI2 + 0.2, ca = Math.cos(th), sa = Math.sin(th), rr = 0.026 + 0.004 * Math.sin(i * 2.3);
      const lob = [center.x + rr * ca, nip[1] + rr * sa * 1.05, center.z - 0.006 + 0.004 * Math.cos(i * 1.9)];
      const mid = [nip[0] + (lob[0] - nip[0]) * 0.35, nip[1] + (lob[1] - nip[1]) * 0.35, center.z + 0.014];
      tubeF('lactiferous_duct_' + sd + '_' + i, [nip, mid, lob], 0.0009, FM.duct, 'Lactiferous ducts (' + sd + ')');
      const lobule = F('breast_lobe_' + sd + '_' + i, new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), FM.breastCore), 'Breast lobe and lobule (' + sd + ')');
      lobule.position.set(...lob); lobule.scale.set(0.0058, 0.0058, 0.004); lobule.lookAt(nip[0], nip[1], nip[2]);
      const ac = [];
      for (let k = 0; k < 7; k++) { const a = k * 2.399, rd = 0.0045 * Math.sqrt((k + 1) / 7); ac.push([lob[0] + rd * Math.cos(a), lob[1] + rd * Math.sin(a), lob[2] - 0.0035 - 0.001 * (k % 3)]); }
      F('breast_acini_' + sd + '_' + i, new THREE.Mesh(sphereCluster(ac, 0.0017), FM.acini), 'Acini (milk-producing alveoli) (' + sd + ')');
    }
    // fibrous connective tissue envelope, retromammary space and the chest-wall relations
    const stroma = new THREE.SphereGeometry(1, 30, 20), sp = stroma.attributes.position;
    for (let i = 0; i < sp.count; i++) { const x = sp.getX(i), y = sp.getY(i), z = sp.getZ(i), dr = 1 + 0.22 * Math.max(0, -y); sp.setXYZ(i, center.x + x * 0.034 * dr, center.y + y * 0.04, center.z + z * 0.03 * (1 + 0.3 * Math.max(0, z))); }
    stroma.computeVertexNormals();
    F('breast_fibrous_tissue_' + sd, new THREE.Mesh(stroma, FM.fibrous), 'Fibrous connective tissue (breast, ' + sd + ')');
    F('retromammary_space_' + sd, new THREE.Mesh(new THREE.CircleGeometry(0.044, 36), FM.fibrous), 'Retromammary space and pectoral fascia (' + sd + ')').position.set(center.x, center.y, center.z - 0.036);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * PI2 + 0.3, mg = F('montgomery_gland_' + sd + '_' + i, new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), FM.gland), "Montgomery's glands (" + sd + ')'); mg.position.set(center.x + 0.0105 * Math.cos(a), center.y - 0.0085 + 0.0105 * Math.sin(a), center.z + 0.0362); mg.scale.setScalar(0.0013); }
    tubeF('internal_thoracic_branch_' + sd, [[s * 0.03, center.y + 0.05, center.z - 0.04], [s * 0.05, center.y + 0.015, center.z - 0.034], [center.x - s * 0.02, center.y - 0.004, center.z - 0.02]], 0.0013, FM.vessel, 'Internal thoracic artery branches (' + sd + ')');
    tubeF('lateral_thoracic_branch_' + sd, [[center.x + s * 0.09, center.y + 0.07, center.z - 0.05], [center.x + s * 0.052, center.y + 0.032, center.z - 0.02], [center.x + s * 0.016, center.y + 0.002, center.z + 0.004]], 0.0013, FM.vessel, 'Lateral thoracic artery branches (' + sd + ')');
    tubeF('intercostal_nerve_' + sd, [[center.x + s * 0.06, center.y - 0.03, center.z - 0.07], [center.x + s * 0.035, center.y - 0.012, center.z - 0.034], [center.x + s * 0.005, center.y - 0.006, center.z + 0.02]], 0.0011, mat.nerve, 'Intercostal nerve branches (' + sd + ')');
    for (let i = 0; i < 5; i++) {
      const t = i / 4, nd = F('axillary_node_' + sd + '_' + i, new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), FM.node), 'Axillary lymph nodes (' + sd + ')');
      nd.position.set(center.x + s * (0.066 + 0.026 * t), center.y + 0.062 + 0.02 * t, center.z - 0.032 - 0.02 * t + 0.004 * Math.sin(i * 2));
      nd.scale.set(0.0052, 0.0034, 0.0034);
    }
    for (let i = 0; i < 5; i++) tube('reproductive', 'cooper_ligament_' + sd + '_' + i, [[center.x + s * (0.002 * i - 0.004), center.y + 0.024 - 0.01 * i, center.z - 0.002], [center.x + s * (0.008 * i - 0.016), center.y + 0.004 - 0.012 * i, center.z + 0.02]], 0.0009, FM.ligament, { label: "Cooper's ligaments (" + sd + ')' });
    tube('reproductive', 'axillary_tail_' + sd, [[center.x + s * 0.02, center.y + 0.01, center.z + 0.014], [center.x + s * 0.034, center.y + 0.032, center.z - 0.004], [center.x + s * 0.054, center.y + 0.05, center.z - 0.02]], 0.006, FM.breastCore, { label: 'Axillary tail of breast (' + sd + ')' });
    tube('reproductive', 'breast_lymphatic_' + sd, [[center.x + s * 0.034, center.y + 0.032, center.z - 0.004], [center.x + s * 0.064, center.y + 0.06, center.z - 0.03], [center.x + s * 0.09, center.y + 0.08, center.z - 0.05]], 0.0012, FM.vessel, { label: 'Breast lymphatic vessel (' + sd + ')' });
    moveF(
      'nipple_' + sd,
      'areola_' + sd,
      'cooper_ligament_' + sd + '_0',
      'cooper_ligament_' + sd + '_1',
      'cooper_ligament_' + sd + '_2',
      'cooper_ligament_' + sd + '_3',
      'cooper_ligament_' + sd + '_4',
      'axillary_tail_' + sd,
      'breast_lymphatic_' + sd
    );
  }
  // menstrual cycle: day 1 to 28 drives endometrial thickness, the dominant follicle, ovulation and the corpus luteum
  const endoM = reproF.getObjectByName('endometrium'), folM = reproF.getObjectByName('graafian_follicle'), cl = reproF.getObjectByName('corpus_luteum'), ooc = reproF.getObjectByName('oocyte');
  const lerp = (a, b, t) => a + (b - a) * Math.min(1, Math.max(0, t));
  window.__cycle = day => {
    day = Math.min(28, Math.max(1, Math.round(day)));
    const menses = day <= 5, foll = day > 5 && day < 14, ovul = day === 14, lut = day > 14;
    const phase = menses ? 'Menstruation' : foll ? 'Follicular phase' : ovul ? 'Ovulation' : 'Luteal phase';
    // endometrium: shed over days 1-5, regrows (proliferative) to day 14, thickest and secretory in the luteal phase
    const k = menses ? lerp(0.5, 0.3, (day - 1) / 4) : day < 14 ? lerp(0.3, 0.75, (day - 5) / 9) : lerp(0.8, 1, (day - 14) / 8);
    endoM.scale.set(k, 1, k); FM.endo.color.setHex(menses ? 0xc03a3f : lut ? 0xd2706a : 0xb04a55);
    // follicle: small early, dominant from about day 7, 20 mm at ovulation, then ruptured
    const fr = day < 14 ? lerp(0.0022, 0.0085, (day - 5) / 9) : 0.0085;
    folM.visible = !lut; folM.scale.setScalar(Math.max(0.001, fr));
    cl.visible = lut; cl.scale.setScalar(day < 22 ? lerp(0.0045, 0.0065, (day - 15) / 7) : lerp(0.0065, 0.0025, (day - 22) / 6));
    FM.luteum.color.setHex(day < 22 ? 0xe3b23c : 0xc99a4a);
    // the oocyte leaves the follicle on day 14 and sits at the fimbriae for the next day
    ooc.visible = ovul; ooc.scale.setScalar(0.0014);
    const hormone = menses ? 'Estrogen and progesterone are low, so the uterine lining sheds through the vagina.' : foll ? 'FSH matures a follicle that secretes estrogen, and the uterine lining thickens.' : ovul ? 'A surge in luteinizing hormone (LH) releases the mature egg into the fallopian tube.' : 'The corpus luteum secretes progesterone. If fertilization does not happen, the lining sheds at the end of the cycle.';
    return { day, phase, hormone };
  };
  window.__cycle(1);
}
let femaleOK = false;
{
  model.updateMatrixWorld(true);
  const mb = new THREE.Box3().setFromObject(SEXG.male), GEN = new Set(['scrotum_skin', 'penis_shaft_skin', 'penis_glans_skin']);
  // occupancy grid of every structure under the skin (5 mm voxels), tagged by body region
  const VX = 0.005, X0 = -0.8, Y0 = -0.05, Z0 = -0.35, NX = 320, NY = 400, NZ = 140, OCC = new Uint8Array(NX * NY * NZ);
  const regOf = (x, y) => { const ax = Math.abs(x), bd = y > 1.36 ? 0.2 : y < 1.0 ? 0.21 : 0.19; if (ax > bd && y > 0.6) return x > 0 ? 2 : 3; if (y < 0.8) return x > 0 ? 4 : 5; return 1; };
  const mark = (x, y, z) => { const i = Math.floor((x - X0) / VX), j = Math.floor((y - Y0) / VX), k = Math.floor((z - Z0) / VX); if (i < 0 || j < 0 || k < 0 || i >= NX || j >= NY || k >= NZ) return; OCC[(j * NZ + k) * NX + i] = regOf(x, y); };
  const occ = (x, y, z) => { const i = Math.floor((x - X0) / VX), j = Math.floor((y - Y0) / VX), k = Math.floor((z - Z0) / VX); return (i < 0 || j < 0 || k < 0 || i >= NX || j >= NY || k >= NZ) ? 0 : OCC[(j * NZ + k) * NX + i]; };
  const skipP = new Set(Object.values(planes)), t3 = V(0, 0, 0);
  model.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh || skipP.has(o)) return;
    for (let p = o; p; p = p.parent) if (p === G.skin || p === G.reproductive || p === window.__alvG) return;
    if (/^Magnified/.test(o.userData.label || '')) return;
    const pos = o.geometry.attributes.position; if (!pos) return;
    const n = pos.count, W = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { t3.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld); W[i * 3] = t3.x; W[i * 3 + 1] = t3.y; W[i * 3 + 2] = t3.z; mark(t3.x, t3.y, t3.z); }
    const ix = o.geometry.index, tc = ix ? ix.count / 3 : Math.floor(n / 3);
    for (let t = 0; t < tc; t++) {
      const A = (ix ? ix.getX(t * 3) : t * 3) * 3, B = (ix ? ix.getX(t * 3 + 1) : t * 3 + 1) * 3, C = (ix ? ix.getX(t * 3 + 2) : t * 3 + 2) * 3;
      const e = Math.max(Math.hypot(W[A] - W[B], W[A + 1] - W[B + 1], W[A + 2] - W[B + 2]), Math.hypot(W[A] - W[C], W[A + 1] - W[C + 1], W[A + 2] - W[C + 2]), Math.hypot(W[B] - W[C], W[B + 1] - W[C + 1], W[B + 2] - W[C + 2]));
      if (e <= VX) continue; const K = Math.min(60, Math.ceil(e / VX));
      for (let u = 0; u <= K; u++) for (let v = 0; v <= K - u; v++) { const p = u / K, q = v / K, r = 1 - p - q; mark(W[A] * r + W[B] * p + W[C] * q, W[A + 1] * r + W[B + 1] * p + W[C + 1] * q, W[A + 2] * r + W[B + 2] * p + W[C + 2] * q); }
    }
  });
  // joint targets on the skeleton (left side; mirrored for the right)
  const TG = { clavicle: [[0.025, 1.4, 0.03], [0.188, 1.388, 0]], upper_arm: [[0.188, 1.388, 0], [0.232, 1.075, 0]], forearm: [[0.232, 1.075, 0], [0.262, 0.847, 0.008]],
    hand: [[0.262, 0.847, 0.008], [0.272, 0.752, 0.012]], thigh: [[0.083, 0.862, 0], [0.098, 0.46, 0]], shin: [[0.098, 0.46, 0], [0.1, 0.06, -0.004]], foot: [[0.1, 0.06, -0.004], [0.1, 0.013, 0.122]] };
  const clean = s => s.replace(/[.\s]/g, '');
  let loader = null;
  const fatMat = M('subcutaneous_fat', 0xe8c96a, 0.7, { transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide });
  // tuck any muscle surface that still reaches the fitted skin back under it (dermis depth below the skin), matching limb muscles to limb skin only
  const coverMuscles = skinMeshes => {
    const C = 0.01, H = new Map(), SP = [], SN = [], SR = [], key = (a, b, c) => a + ',' + b + ',' + c, w3 = V(0, 0, 0), n3 = V(0, 0, 0), nm3 = new THREE.Matrix3();
    const partR = (lab, x) => lab === 'Arms and hands' ? (x > 0 ? 2 : 3) : lab === 'Legs and feet' ? (x > 0 ? 4 : 5) : 1;
    skinMeshes.forEach(m => { m.updateMatrixWorld(true); nm3.getNormalMatrix(m.matrixWorld); const p = m.geometry.attributes.position, nn = m.geometry.attributes.normal, ix = m.geometry.index, used = new Uint8Array(p.count);
      if (ix) for (let i = 0; i < ix.count; i++) used[ix.getX(i)] = 1; else used.fill(1);
      for (let i = 0; i < p.count; i++) { if (!used[i]) continue; w3.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld); n3.fromBufferAttribute(nn, i).applyMatrix3(nm3).normalize();
        const id = SR.length; SP.push(w3.x, w3.y, w3.z); SN.push(n3.x, n3.y, n3.z); SR.push(partR(m.userData.label, w3.x));
        const k = key(Math.floor(w3.x / C), Math.floor(w3.y / C), Math.floor(w3.z / C)); let a = H.get(k); if (!a) H.set(k, a = []); a.push(id); } });
    const okR = (sr, mr) => sr === 1 || sr === mr;
    const near = (x, y, z, mr) => { const cx = Math.floor(x / C), cy = Math.floor(y / C), cz = Math.floor(z / C); let best = -1, bd = Infinity, found = -1;
      for (let r = 0; r <= 5; r++) { if (found >= 0 && r > found + 1) break;
        for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) for (let k = -r; k <= r; k++) { if (Math.max(Math.abs(i), Math.abs(j), Math.abs(k)) !== r) continue; const a = H.get(key(cx + i, cy + j, cz + k)); if (!a) continue;
          for (const id of a) { if (!okR(SR[id], mr)) continue; const d = (SP[id * 3] - x) ** 2 + (SP[id * 3 + 1] - y) ** 2 + (SP[id * 3 + 2] - z) ** 2; if (d < bd) { bd = d; best = id; if (found < 0) found = r; } } } }
      return best; };
    const seen = new Set(), inv = new THREE.Matrix4(), MG = 0.003; let moved = 0;
    G.muscular.updateMatrixWorld(true);
    G.muscular.traverse(o => { if (!o.isMesh || o.isInstancedMesh) return;
      if (!o.userData.ownGeo) { if (seen.has(o.geometry)) o.geometry = o.geometry.clone(); o.userData.ownGeo = 1; } seen.add(o.geometry);
      o.geometry.computeBoundingBox(); const ctr = o.geometry.boundingBox.getCenter(V(0, 0, 0)).applyMatrix4(o.matrixWorld), mr = regOf(ctr.x, ctr.y);
      const p = o.geometry.attributes.position; inv.copy(o.matrixWorld).invert(); let ch = false;
      for (let i = 0; i < p.count; i++) { w3.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); const b = near(w3.x, w3.y, w3.z, mr); if (b < 0) continue;
        const nx = SN[b * 3], ny = SN[b * 3 + 1], nz = SN[b * 3 + 2], sd = (w3.x - SP[b * 3]) * nx + (w3.y - SP[b * 3 + 1]) * ny + (w3.z - SP[b * 3 + 2]) * nz;
        if (sd <= -MG || sd > 0.08) continue; const k = sd + MG; w3.x -= nx * k; w3.y -= ny * k; w3.z -= nz * k; w3.applyMatrix4(inv); p.setXYZ(i, w3.x, w3.y, w3.z); ch = true; }
      if (ch) { p.needsUpdate = true; o.geometry.computeVertexNormals(); o.geometry.computeBoundingSphere(); o.geometry.computeBoundingBox(); moved++; } });
    return moved; };
  const fitBody = async (url, label) => {
    if (!loader) { const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js'); loader = new GLTFLoader(); }
    const root = (await loader.loadAsync(url)).scene; let sk = null; root.traverse(o => { if (o.isSkinnedMesh && !sk) sk = o; });
    root.updateMatrixWorld(true);
    const fb = new THREE.Box3().setFromObject(root), k = (mb.max.y - mb.min.y) / (fb.max.y - fb.min.y);
    root.scale.setScalar(k); root.position.set(0, mb.min.y - fb.min.y * k, 0); root.updateMatrixWorld(true);
    const bones = sk.skeleton.bones, NB = bones.length, BW = bones.map(b => b.getWorldPosition(V(0, 0, 0)));
    const src = sk.geometry, N = src.attributes.position.count, P = new Float32Array(N * 3), dom = new Int16Array(N), sI = src.attributes.skinIndex, sW = src.attributes.skinWeight;
    for (let i = 0; i < N; i++) { sk.getVertexPosition(i, t3); t3.applyMatrix4(sk.matrixWorld); P.set([t3.x, t3.y, t3.z], i * 3);
      let bw = -1; for (let c = 0; c < 4; c++) { const w = sW.getComponent(i, c); if (w > bw) { bw = w; dom[i] = sI.getComponent(i, c); } } }
    // per-bone transform: segment-to-segment mapping for limbs, translation for the head, identity for the trunk; fingers and toes inherit
    const XF = new Array(NB).fill(null), base = n => clean(n).replace(/[LR]$/, '');
    bones.forEach((b, i) => { const nm = base(b.name), tg = TG[nm]; if (!tg) return; const s = Math.sign(BW[i].x) || 1;
      const ch = b.children.find(c => c.isBone && /forearm|hand|middle_01|upper_arm|shin|foot|toe/.test(c.name) && !/thumb/.test(c.name)) || b.children.find(c => c.isBone); if (!ch) return;
      const H = BW[i], T = BW[bones.indexOf(ch)], H2 = V(s * tg[0][0], tg[0][1], tg[0][2]), T2 = V(s * tg[1][0], tg[1][1], tg[1][2]);
      const u = T.clone().sub(H), L = u.length(); u.normalize(); const u2 = T2.clone().sub(H2), L2 = u2.length(); u2.normalize();
      XF[i] = { H, u, H2, sc: L2 / L, q: new THREE.Quaternion().setFromUnitVectors(u, u2) }; });
    const hi = bones.findIndex(b => base(b.name) === 'head');
    if (hi >= 0) { const hb = new THREE.Box3(); for (let i = 0; i < N; i++) if (dom[i] === hi) hb.expandByPoint(t3.fromArray(P, i * 3));
      const c = hb.getCenter(V(0, 0, 0)); XF[hi] = { tr: V(0, 1.642, 0.004).sub(c) }; }
    const isTrunk = b => /^(root|pelvis|spine_0\d|chest|neck)$/.test(base(b.name));
    bones.forEach((b, i) => { if (XF[i] || isTrunk(b)) return; for (let p = b.parent; p && p.isBone; p = p.parent) { const j = bones.indexOf(p); if (XF[j]) { XF[i] = XF[j]; return; } if (isTrunk(p)) return; } });
    const app = (X, p, out) => { if (!X) return out.copy(p); if (X.tr) return out.copy(p).add(X.tr); const d = p.clone().sub(X.H), al = d.dot(X.u), pe = d.addScaledVector(X.u, -al);
      return out.copy(X.u).multiplyScalar(al * X.sc).add(pe).applyQuaternion(X.q).add(X.H2); };
    const Q = new Float32Array(N * 3), acc = V(0, 0, 0), tmp = V(0, 0, 0);
    for (let i = 0; i < N; i++) { t3.fromArray(P, i * 3); acc.set(0, 0, 0); let ws = 0;
      for (let c = 0; c < 4; c++) { const w = sW.getComponent(i, c); if (w <= 0) continue; app(XF[sI.getComponent(i, c)], t3, tmp); acc.addScaledVector(tmp, w); ws += w; }
      if (ws > 0) acc.multiplyScalar(1 / ws); else acc.copy(t3); Q.set([acc.x, acc.y, acc.z], i * 3); }
    // weld UV-seam duplicates so every step moves them together
    const key = new Map(), wid = new Int32Array(N); let U = 0; for (let i = 0; i < N; i++) { const kk = Math.round(P[i * 3] * 2e4) + ',' + Math.round(P[i * 3 + 1] * 2e4) + ',' + Math.round(P[i * 3 + 2] * 2e4); let w = key.get(kk); if (w === undefined) { w = U++; key.set(kk, w); } wid[i] = w; }
    const nb = Array.from({ length: U }, () => []), ixa = src.index.array; for (let t = 0; t < ixa.length; t += 3) for (let e = 0; e < 3; e++) { const p = wid[ixa[t + e]], q = wid[ixa[t + (e + 1) % 3]]; if (p !== q) { nb[p].push(q); nb[q].push(p); } }
    const lap = (F, it, k = 0.6, lock) => { for (let n = 0; n < it; n++) { const F2 = new Float32Array(F); for (let w = 0; w < U; w++) { if (lock && lock[w]) continue; const Lw = nb[w]; if (!Lw.length) continue; let a = 0, b = 0, c = 0; for (const q of Lw) { a += F[q * 3]; b += F[q * 3 + 1]; c += F[q * 3 + 2]; } const m = Lw.length;
      F2[w * 3] = F[w * 3] * (1 - k) + k * a / m; F2[w * 3 + 1] = F[w * 3 + 1] * (1 - k) + k * b / m; F2[w * 3 + 2] = F[w * 3 + 2] * (1 - k) + k * c / m; } F = F2; } return F; };
    const lap1 = (F, it, k = 0.6) => { for (let n = 0; n < it; n++) { const F2 = new Float32Array(F); for (let w = 0; w < U; w++) { const Lw = nb[w]; if (!Lw.length) continue; let a = 0; for (const q of Lw) a += F[q]; F2[w] = F[w] * (1 - k) + k * a / Lw.length; } F = F2; } return F; };
    const P0 = new Float32Array(U * 3), PU = new Float32Array(U * 3), RG = new Uint8Array(U), HAND = new Uint8Array(U);
    const regB = i => { const b = bones[i], nm = base(b.name), s = BW[i].x > 0; if (/upper_arm|forearm|hand|index|middle|ring|pinky|thumb/.test(nm)) return s ? 2 : 3; if (/thigh|shin|foot|toe/.test(nm)) return s ? 4 : 5; return 1; };
    for (let i = 0; i < N; i++) { const w = wid[i]; for (let c = 0; c < 3; c++) { P0[w * 3 + c] = P[i * 3 + c]; PU[w * 3 + c] = Q[i * 3 + c]; } RG[w] = regB(dom[i]); if (/^(hand|index|middle|ring|pinky|thumb)/.test(base(bones[dom[i]].name))) HAND[w] = 1; }
    // smooth the retarget offset field: rigid and rotated regions are left as they are, while creases at the elbow, knee and neck blends relax
    { let OF = new Float32Array(U * 3); for (let j = 0; j < U * 3; j++) OF[j] = PU[j] - P0[j]; OF = lap(OF, 60, 0.6); for (let j = 0; j < U * 3; j++) PU[j] = P0[j] + OF[j]; }
    const g = new THREE.BufferGeometry(), GP = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const w = wid[i]; GP[i * 3] = PU[w * 3]; GP[i * 3 + 1] = PU[w * 3 + 1]; GP[i * 3 + 2] = PU[w * 3 + 2]; }
    g.setAttribute('position', new THREE.BufferAttribute(GP, 3)); g.setIndex(src.index); g.computeVertexNormals();
    const NR = new Float32Array(U * 3), nrm = g.attributes.normal; for (let i = 0; i < N; i++) { const w = wid[i]; NR[w * 3] += nrm.getX(i); NR[w * 3 + 1] += nrm.getY(i); NR[w * 3 + 2] += nrm.getZ(i); }
    { let NS = lap(NR, 6, 0.5); for (let w = 0; w < U; w++) { const l = Math.hypot(NS[w * 3], NS[w * 3 + 1], NS[w * 3 + 2]) || 1; for (let c = 0; c < 3; c++) NR[w * 3 + c] = NS[w * 3 + c] / l; } }
    // layered fit. Each skin point must sit above the outermost structure beneath it by dermis + hypodermis, within a regional band
    // (dermis 2.5 mm, 6 mm on the back; hypodermis from ~1 mm over the shin and scalp to 3-4 cm over abdomen, buttocks, thighs and female breasts).
    const FEM = label.startsWith('female'), DB = new Array(U); for (let i = 0; i < N; i++) DB[wid[i]] = base(bones[dom[i]].name);
    const band = w => { const nm = DB[w], y = PU[w * 3 + 1], nz = NR[w * 3 + 2], f = FEM;
      if (nm === 'head') return y > 1.66 || nz < -0.2 ? [0.004, 0.002, 0.006] : [0.002, 0.002, 0.012];
      if (nm === 'neck') return [0.0025, 0.003, 0.015];
      if (/^(foot|toe)/.test(nm)) return [0.003, 0.002, 0.008];
      if (nm === 'upper_arm') return [0.0025, 0.004, f ? 0.025 : 0.02];
      if (nm === 'forearm') return [0.0025, 0.003, 0.012];
      if (nm === 'thigh') return [0.0025, 0.006, f ? 0.04 : 0.03];
      if (nm === 'shin') return nz > 0.6 ? [0.0025, 0.001, 0.004] : [0.0025, 0.004, 0.015];
      if (nz < -0.3) return y < 0.95 ? [0.004, 0.008, f ? 0.045 : 0.035] : [0.006, 0.004, 0.02];
      if (y > 0.82 && y < 1.15) return [0.0025, 0.006, f ? 0.04 : 0.03];
      if (f && y >= 1.15 && y < 1.38 && nz > 0.2) return [0.0025, 0.004, 0.08];
      return [0.0025, 0.004, 0.02]; };
    const STEP = VX * 0.6, GAP = 0.015, OUTR = 0.04;
    const ok = (r, vr) => r !== 0 && (vr === 2 || vr === 3 ? r === vr : r !== 2 && r !== 3 && (vr === 1 || r === vr || r === 1));
    const depth = (w, X) => { const nx = NR[w * 3], ny = NR[w * 3 + 1], nz = NR[w * 3 + 2], px = X[w * 3], py = X[w * 3 + 1], pz = X[w * 3 + 2], vr = RG[w];
      const hit = t => ok(occ(px + nx * t, py + ny * t, pz + nz * t), vr) && ok(occ(px + nx * (t - STEP), py + ny * (t - STEP), pz + nz * (t - STEP)), vr) && ok(occ(px + nx * (t - 2 * STEP), py + ny * (t - 2 * STEP), pz + nz * (t - 2 * STEP)), vr);
      let last = null, empty = 0; for (let t = -0.012; t <= OUTR; t += STEP) { if (hit(t)) { last = t; empty = 0; } else if (t > 0 && (empty += STEP) > GAP) break; }
      if (last !== null) return -last;
      for (let t = -0.012; t >= -0.08; t -= STEP) if (hit(t)) return -t; return null; };
    const R4 = 0.04, SG = 0.016, hmap = new Map(), ck = (x, y, z) => x + ',' + y + ',' + z;
    for (let w = 0; w < U; w++) { const k = ck(Math.floor(PU[w * 3] / R4), Math.floor(PU[w * 3 + 1] / R4), Math.floor(PU[w * 3 + 2] / R4)); let a = hmap.get(k); if (!a) hmap.set(k, a = []); a.push(w); }
    const gauss = (F, W) => { const O = new Float32Array(U); for (let w = 0; w < U; w++) { if (HAND[w]) continue; const x = PU[w * 3], y = PU[w * 3 + 1], z = PU[w * 3 + 2], cx = Math.floor(x / R4), cy = Math.floor(y / R4), cz = Math.floor(z / R4); let sw = 0, sv = 0;
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) { const a = hmap.get(ck(cx + i, cy + j, cz + k)); if (!a) continue;
        for (const q of a) { if (!W[q]) continue; const dx = PU[q * 3] - x, dy = PU[q * 3 + 1] - y, dz = PU[q * 3 + 2] - z, d2 = dx * dx + dy * dy + dz * dz; if (d2 > R4 * R4) continue;
          if (NR[q * 3] * NR[w * 3] + NR[q * 3 + 1] * NR[w * 3 + 1] + NR[q * 3 + 2] * NR[w * 3 + 2] < 0.3) continue; const kw = Math.exp(-d2 / (2 * SG * SG)) * W[q]; sw += kw; sv += kw * F[q]; } }
      O[w] = sw > 0 ? sv / sw : 0; } return O; };
    // push-out only: the uploaded surface is never pulled in (extra depth is hypodermis, which the fat layer fills). Minimum depths are blended smoothly across regions.
    let LO = new Float32Array(U); for (let w = 0; w < U; w++) { const b = band(w); LO[w] = b[0] + b[1]; } LO = lap1(LO, 30, 0.6);
    let X = Float32Array.from(PU); const TOT = new Float32Array(U);
    for (let pass = 0; pass < 2; pass++) { const raw = new Float32Array(U), W = new Float32Array(U);
      for (let w = 0; w < U; w++) { if (HAND[w]) continue; const d = depth(w, X); W[w] = 1; if (d !== null && d < LO[w]) { raw[w] = LO[w] - d; W[w] = 3; } }
      const S = gauss(raw, W); for (let w = 0; w < U; w++) { const s = Math.max(0, Math.min(S[w], 0.03 - TOT[w])); TOT[w] += s; for (let c = 0; c < 3; c++) X[w * 3 + c] += NR[w * 3 + c] * s; } }
    // apply the push as one broad, low-frequency field (head, neck and hands keep the sculpted shape) so no cuffs, collars or creases form at its edges
    // the shared internals are male-proportioned, so the female surface keeps its sculpted shape (no push) and the internals show through the translucent skin where they exceed it
    { if (FEM) TOT.fill(0); for (let w = 0; w < U; w++) if (HAND[w] || DB[w] === 'head' || DB[w] === 'neck') TOT[w] = 0;
      let T2 = TOT; for (let k = 0; k < 3; k++) { const Wn = Float32Array.from(T2, () => 1); T2 = gauss(T2, Wn); } T2 = lap1(T2, 120, 0.6);
      for (let w = 0; w < U; w++) { if (HAND[w]) T2[w] = 0; for (let c = 0; c < 3; c++) X[w * 3 + c] = PU[w * 3 + c] + NR[w * 3 + c] * T2[w]; } }
    let DER = new Float32Array(U); for (let w = 0; w < U; w++) DER[w] = band(w)[0]; DER = lap1(DER, 12, 0.6);
    // Taubin smoothing (shrink-free) to take out any remaining ripples
    for (let it = 0; it < 20; it++) for (const f of [0.5, -0.53]) { const Y = new Float32Array(X); for (let w = 0; w < U; w++) { const Lw = nb[w]; if (!Lw.length) continue; let ax = 0, ay = 0, az = 0; for (const q of Lw) { ax += X[q * 3]; ay += X[q * 3 + 1]; az += X[q * 3 + 2]; } const n = Lw.length;
      Y[w * 3] += f * (ax / n - X[w * 3]); Y[w * 3 + 1] += f * (ay / n - X[w * 3 + 1]); Y[w * 3 + 2] += f * (az / n - X[w * 3 + 2]); } X = Y; }
    for (let i = 0; i < N; i++) { const w = wid[i]; GP[i * 3] = X[w * 3]; GP[i * 3 + 1] = X[w * 3 + 1]; GP[i * 3 + 2] = X[w * 3 + 2]; }
    g.attributes.position.needsUpdate = true; g.computeVertexNormals(); if (src.attributes.uv) g.setAttribute('uv', src.attributes.uv);
    // weld normals across UV seams so no seam lines show
    { const nn = g.attributes.normal, S = new Float32Array(U * 3); for (let i = 0; i < N; i++) { const w = wid[i]; S[w * 3] += nn.getX(i); S[w * 3 + 1] += nn.getY(i); S[w * 3 + 2] += nn.getZ(i); }
      for (let i = 0; i < N; i++) { const w = wid[i], l = Math.hypot(S[w * 3], S[w * 3 + 1], S[w * 3 + 2]) || 1; nn.setXYZ(i, S[w * 3] / l, S[w * 3 + 1] / l, S[w * 3 + 2] / l); } nn.needsUpdate = true; }
    // split by region so the skin's parts list (head, torso, arms, legs) still works
    const part = i => { const nm = base(bones[dom[i]].name); return nm === 'head' || nm === 'neck' ? 'Head' : /upper_arm|forearm|hand|index|middle|ring|pinky|thumb/.test(nm) ? 'Arms and hands' : /thigh|shin|foot|toe/.test(nm) ? 'Legs and feet' : 'Torso'; };
    const groups = {}; for (let t = 0; t < ixa.length; t += 3) { const p = part(ixa[t]); (groups[p] = groups[p] || []).push(ixa[t], ixa[t + 1], ixa[t + 2]); }
    const skin = Object.entries(groups).map(([p, ids]) => { const gg = new THREE.BufferGeometry(); for (const an of ['position', 'normal', 'uv']) if (g.attributes[an]) gg.setAttribute(an, g.attributes[an]); gg.setIndex(ids);
      return reg('skin', label + '_' + p.toLowerCase().replace(/\W+/g, '_'), new THREE.Mesh(gg, mat.skin), { label: p }); });
    // hypodermis: the fat layer's outer surface lies one dermis-thickness beneath the skin; its deep surface is the fascia over muscle and bone
    const nn = g.attributes.normal, FP = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const w = wid[i]; FP[i * 3] = GP[i * 3] - nn.getX(i) * DER[w]; FP[i * 3 + 1] = GP[i * 3 + 1] - nn.getY(i) * DER[w]; FP[i * 3 + 2] = GP[i * 3 + 2] - nn.getZ(i) * DER[w]; }
    const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(FP, 3)); fg.setAttribute('normal', nn.clone()); fg.setIndex(src.index);
    const fat = [reg('fat', label + '_subcutaneous_fat', new THREE.Mesh(fg, fatMat), { label: 'Subcutaneous fat' })];
    return { skin, fat };
  };
  // openings: oral fissure, nostrils and external acoustic meatus stay uncovered; the auricle gets a skin cover with the meatus left open
  const punch = (m, test) => { const g = m.geometry, ix = g.index.array, p = g.attributes.position, n = g.attributes.normal, keep = [], c = V(0, 0, 0), nr = V(0, 0, 0), a = V(0, 0, 0); let cut = 0;
    for (let t = 0; t < ix.length; t += 3) { c.set(0, 0, 0); nr.set(0, 0, 0); for (let k = 0; k < 3; k++) { c.add(a.fromBufferAttribute(p, ix[t + k])); nr.add(a.fromBufferAttribute(n, ix[t + k])); } c.multiplyScalar(1 / 3); nr.normalize();
      if (test(c, nr)) cut++; else keep.push(ix[t], ix[t + 1], ix[t + 2]); } g.setIndex(keep); return cut; };
  const lining = (name, label, pts, r, grp) => { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(q => V(...q))), 12, r, 14, false), liningMat); grp.add(reg('skin', name, m, { label })); };
  const liningMat = M('skin_lining', 0xc98f80, 0.6, { side: THREE.DoubleSide });
  const openings = (meshes, grp, tag) => { const head = meshes.find(m => m.userData.label === 'Head'); if (!head) return;
    const p = head.geometry.attributes.position, ix = head.geometry.index.array, used = new Uint8Array(p.count); for (const i of ix) used[i] = 1;
    const front = (x0, x1, y0, y1) => { let best = null; for (let i = 0; i < p.count; i++) { if (!used[i]) continue; const x = p.getX(i), y = p.getY(i), z = p.getZ(i); if (x < x0 || x > x1 || y < y0 || y > y1) continue; if (!best || z > best.z) best = V(x, y, z); } return best; };
    const T = front(-0.012, 0.012, 1.585, 1.64), Mo = front(-0.008, 0.008, 1.548, 1.564);
    if (Mo) { punch(head, (c, n) => (c.x / 0.019) ** 2 + ((c.y - Mo.y) / 0.0032) ** 2 < 1 && c.z > Mo.z - 0.014 && n.z > 0.2);
      const L = Math.max(0.01, Mo.z + 0.002 - 0.075), og = new THREE.CylinderGeometry(1, 1, L, 24, 1, true); og.rotateX(Math.PI / 2); og.scale(0.0175, 0.0034, 1); og.translate(0, Mo.y, Mo.z + 0.002 - L / 2);
      grp.add(reg('skin', tag + '_oral_vestibule', new THREE.Mesh(og, liningMat), { label: 'Oral fissure and vestibule (opening)' })); }
    // nostrils: centred on the underside of the actual nose (downward-facing triangles below the tip), one per side
    if (T) { const ni = head.geometry.index.array, c = V(0, 0, 0), a = V(0, 0, 0), nr = V(0, 0, 0), nn = head.geometry.attributes.normal, acc = { '-1': [], '1': [] };
      for (let t = 0; t < ni.length; t += 3) { c.set(0, 0, 0); nr.set(0, 0, 0); for (let k = 0; k < 3; k++) { c.add(a.fromBufferAttribute(p, ni[t + k])); nr.add(a.fromBufferAttribute(nn, ni[t + k])); } c.multiplyScalar(1 / 3); nr.normalize();
        if (Math.abs(c.x) < 0.016 && Math.abs(c.x) > 0.0015 && c.z > T.z - 0.025 && c.y < T.y + 0.002 && c.y > T.y - 0.03 && nr.y < -0.3) acc[Math.sign(c.x)].push(c.clone()); }
      for (const s of [-1, 1]) { let C;
        if (acc[s].length) { const top = acc[s].sort((u, v) => v.z - u.z).slice(0, Math.max(3, Math.ceil(acc[s].length * 0.5))); C = top.reduce((u, v) => u.add(v), V(0, 0, 0)).multiplyScalar(1 / top.length); }
        else C = V(s * 0.0065, T.y - 0.014, T.z - 0.012);
        punch(head, (q, n) => q.distanceTo(C) < 0.0048 && n.y < 0.2);
        lining(tag + '_nostril_' + (s < 0 ? 'right' : 'left'), 'Nostril (naris)', [[C.x, C.y - 0.0015, C.z], [C.x * 0.9, C.y + 0.006, C.z - 0.007], [C.x * 0.6, C.y + 0.011, C.z - 0.02]], 0.0034, grp); } }
    for (const s of [-1, 1]) { const sd = s < 0 ? 'right' : 'left', ey = 1.618, ez = -0.01;
      let HX = 0; for (let i = 0; i < p.count; i++) { if (!used[i]) continue; const x = s * p.getX(i); if (x > 0.04 && (p.getY(i) - ey) ** 2 + (p.getZ(i) - ez) ** 2 < 0.01 ** 2) HX = Math.max(HX, x); } if (!HX) HX = 0.075;
      punch(head, (c, n) => s * c.x > HX - 0.012 && (c.y - ey) ** 2 + (c.z - ez) ** 2 < 0.006 ** 2 && s * n.x > 0.1);
      const au = []; G.senses.traverse(o => { if (o.isMesh && /^Auricle/.test(o.userData.label || '') && Math.sign(o.getWorldPosition(V(0, 0, 0)).x) === s) au.push(o); });
      au.forEach(o => { o.updateMatrixWorld(true); const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld); if (!g.index) g.setIndex([...Array(g.attributes.position.count).keys()]); g.computeVertexNormals();
        const ps = g.attributes.position, ns = g.attributes.normal; for (let i = 0; i < ps.count; i++) ps.setXYZ(i, ps.getX(i) + ns.getX(i) * 0.0012, ps.getY(i) + ns.getY(i) * 0.0012, ps.getZ(i) + ns.getZ(i) * 0.0012); g.computeVertexNormals();
        const m = reg('skin', tag + '_auricle_skin_' + sd, new THREE.Mesh(g, mat.skin), { label: 'Head' }); punch(m, c => (c.y - ey) ** 2 + (c.z - ez) ** 2 < 0.0038 ** 2); grp.add(m); });
      const xi = Math.min(HX - 0.006, 0.07); lining(tag + '_meatus_' + sd, 'External acoustic meatus (opening)', [[s * 0.096, ey, ez], [s * (0.096 + xi) / 2, ey + 0.001, ez - 0.0005], [s * xi, ey + 0.002, ez - 0.001]], 0.0036, grp); } };
  try { const ms = await fitBody('uploads/Male_Muscular_BaseMesh/Male/Male_Muscular_BaseMesh.glb', 'male_body');
    SEXG.male.children.slice().forEach(o => { if (!GEN.has(o.name)) SEXG.male.remove(o); }); ms.skin.forEach(m => SEXG.male.add(m)); coverMuscles(ms.skin); coverMuscles(ms.skin); ms.fat.forEach(m => FATG.male.add(m)); openings(ms.skin, SEXG.male, 'male');
  } catch (e) { console.warn('Male body could not be loaded; keeping the built skin', e); }
  try { const fs = await fitBody('uploads/Female_Muscular_BaseMesh/Female/Female_Muscular_BaseMesh.glb', 'female_body'); fs.skin.forEach(m => SEXG.female.add(m)); fs.fat.forEach(m => FATG.female.add(m)); openings(fs.skin, SEXG.female, 'female'); femaleOK = true;
  } catch (e) { console.warn('Female body could not be loaded', e); }
}
buildHead();
buildOral();
buildNeck();
window.__anat = { G, SEXG, model, THREE, ready: true };
stage.setObject(model);
const vis = o => { while (o) { if (!o.visible) return false; o = o.parent; } return true; };
model.traverse(o => { if (o.isMesh) { o.castShadow = o.userData.sys === 'skin'; o.receiveShadow = false; } });
for (const k in mat) if (mat[k].transparent) { /* transparent materials draw after opaques */ }

// ───────── UI ─────────
const $ = id => document.getElementById(id);
const list = $('systems'); let sel = 'skeletal'; var index = null;
function showInfo() {
  const s = SYS.find(x => x.k === sel);
  if (!index) buildIndex();
  const keys = [...index.keys()], low = keys.map(k => k.toLowerCase()), n = s.parts.filter(p => p[0] !== '#').length;
  const items = s.parts.map((p, i) => { if (p[0] === '#') return '<h4 class="ph">' + p.slice(1) + '</h4>'; const q = p.toLowerCase().split(' (')[0].split(': ')[0]; const m = keys.filter((k, j) => k.startsWith(p.split(' (')[0]) || low[j].includes(q) || (q.includes(' and ') && q.split(' and ').some(w => w.length > 3 && low[j].includes(w))) ); return m.length ? '<li><button class="pi" data-i="' + i + '">' + p + '</button></li>' : '<li><span>' + p + '</span></li>'; }).join('');
  $('info').innerHTML = '<h3>' + s.name + '</h3><p>' + s.blurb + '</p><div class="ptitle">Parts · ' + n + '</div><ul class="plist">' + items + '</ul><div class="btns"><button class="b" id="solo">Show only this system</button></div>';
  $('info').querySelectorAll('.pi').forEach(b => { b.onclick = () => { const p = s.parts[+b.dataset.i], q = p.toLowerCase().split(' (')[0].split(': ')[0]; const m = keys.filter((k, j) => k.startsWith(p.split(' (')[0]) || low[j].includes(q) || (q.includes(' and ') && q.split(' and ').some(w => w.length > 3 && low[j].includes(w)))).filter(k => index.get(k).sys === s.k); const hit = m.find(k => index.get(k).meshes.some(x => vis(x))) || m[0]; if (hit) setPin(s.k === 'nervous' && m.length > 1 ? m : hit, p); }; });
  $('solo').onclick = () => { SYS.forEach(x => setSys(x.k, x.k === sel || (x.k === 'skin'))); };
  list.querySelectorAll('.sys').forEach(r => r.classList.toggle('sel', r.dataset.k === sel));
}
function setSys(k, on) { G[k].visible = on; list.querySelector(`[data-k="${k}"] input`).checked = on; }
SYS.forEach(s => {
  const r = document.createElement('div'); r.className = 'sys'; r.dataset.k = s.k;
  r.innerHTML = `<span class="sw" style="background:${s.color}"></span><span class="sname">${s.name}</span><input type="checkbox" ${s.on ? 'checked' : ''} aria-label="Show ${s.name}">`;
  r.addEventListener('click', e => { if (e.target.tagName !== 'INPUT') { sel = s.k; showInfo(); } });
  r.querySelector('input').addEventListener('change', e => { G[s.k].visible = e.target.checked; sel = s.k; showInfo(); });
  list.appendChild(r);
});
$('all').onclick = () => SYS.forEach(s => setSys(s.k, true));
$('none').onclick = () => SYS.forEach(s => setSys(s.k, false));
showInfo();
{ // surface roughness: raises material roughness, damps clearcoat and adds a fine world-space grain to the shading normal
  const RU = { uGrain: { value: 0 } }, mats = new Set();
  model.traverse(o => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m && m.isMeshStandardMaterial && mats.add(m)); });
  const GL = 'uniform float uGrain; varying vec3 vRW;\nfloat rh(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}\nfloat rv(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(rh(i),rh(i+vec3(1,0,0)),f.x),mix(rh(i+vec3(0,1,0)),rh(i+vec3(1,1,0)),f.x),f.y),mix(mix(rh(i+vec3(0,0,1)),rh(i+vec3(1,0,1)),f.x),mix(rh(i+vec3(0,1,1)),rh(i+vec3(1,1,1)),f.x),f.y),f.z);}\nvec3 rg(vec3 p){return vec3(rv(p),rv(p+17.3),rv(p+31.7))-0.5;}\n';
  mats.forEach(m => { m.userData.r0 = m.roughness; if (m.isMeshPhysicalMaterial) m.userData.cc0 = m.clearcoat;
    const prev = m.onBeforeCompile;
    m.onBeforeCompile = (sh, r) => { if (prev) prev.call(m, sh, r); sh.uniforms.uGrain = RU.uGrain;
      sh.vertexShader = 'varying vec3 vRW;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\nvRW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = GL + sh.fragmentShader.replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\nnormal = normalize(normal + uGrain * (rg(vRW * 900.0) * 0.65 + rg(vRW * 2600.0) * 0.35));'); };
    const key = m.customProgramCacheKey ? m.customProgramCacheKey.bind(m) : () => ''; m.customProgramCacheKey = () => key() + '|grain'; m.needsUpdate = true; });
  const setRough = k => { RU.uGrain.value = k * 0.45; mats.forEach(m => { m.roughness = Math.min(1, m.userData.r0 + (1 - m.userData.r0) * k * 0.7); if (m.userData.cc0 !== undefined) m.clearcoat = m.userData.cc0 * (1 - k * 0.75); }); };
  setRough(0.55); $('rough').addEventListener('input', e => setRough(+e.target.value));
}
const lifeU = { value: 0 }, lifeEnv = (() => {
  const es = new THREE.Scene(), pm = new THREE.PMREMGenerator(stage._renderer);
  es.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.MeshBasicMaterial({ color: 0x3a3632, side: THREE.BackSide })));
  const pan = (w, h, pos, c) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(5), side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(0, 0, 0); es.add(m); };
  pan(6, 3, [0, 8, 2], 0xfff6ea); pan(3, 4, [7, 3, 5], 0xffffff); pan(2, 4, [-7, 2, -3], 0xe8eeff); pan(8, 1, [0, -6, 4], 0x7a6a60);
  const t = pm.fromScene(es, 0.04).texture; pm.dispose(); return t; })();
{ // life-like tissue: fresh colours, procedural fibre / pitting / mottling, wet environment reflections
  const LC = { bone: 0xdccaa3, skull_bone: 0xdccaa3, cartilage: 0xd3dcdc, muscle: 0x8a2621, diaphragm: 0x973427, artery: 0xa8241f, vein: 0x4b4a72, heart: 0x7e2422,
    lung: 0xd69796, airway: 0xe6cfc0, liver: 0x5c1d16, stomach: 0xd29886, bile: 0x4a6a2a, pancreas: 0xe2bb8c, small_intestine: 0xd9a491, large_intestine: 0xc89279,
    kidney: 0x6a271f, bladder: 0xd8ab9a, brain: 0xd9b8a8, nerve: 0xefe2c2 };
  const cat = n => /skin/.test(n) ? 6 : /lung|alveol/.test(n) ? 4 : /brain|cerebr|cortex|gyr/.test(n) ? 7 : /bone|skull|vertebr|marrow/.test(n) ? 2
    : /muscle|diaphragm|heart|myo|tongue|sphincter|detrusor/.test(n) ? 1 : /arter|vein|vena|aorta|nerve|vessel|duct|ureter|urethra|tendon|ligament/.test(n) ? 5
    : /liver|kidney|spleen|stomach|intestin|colon|pancrea|bladder|gland|prostat|test|ovar|uter|thyroid|bile/.test(n) ? 3 : 0;
  const mats = new Set();
  model.traverse(o => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m && m.isMeshStandardMaterial && !/_plane|_edge/.test(m.name) && mats.add(m)); });
  const F = 'vec3 Lf = vec3(vLO.x * 600.0, vLO.y * 25.0, vLO.z * 600.0);\n';
  const COL = '\nif (uLife > 0.5) { float n1 = rv(vRW * 60.0), n2 = rv(vRW * 240.0);\n' + F +
    '#if TISSUE == 1\n diffuseColor.rgb *= 0.74 + 0.22 * rv(Lf) + 0.14 * rv(Lf * 0.3 + 5.0); diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.5, 1.25, 1.2), smoothstep(0.72, 0.95, n1) * 0.3);\n' +
    '#elif TISSUE == 2\n diffuseColor.rgb *= (0.9 + 0.14 * n1) * (1.0 - 0.2 * smoothstep(0.62, 0.8, rv(vRW * 1800.0))); diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.02, 0.95, 0.84), n2 * 0.5);\n' +
    '#elif TISSUE == 3\n diffuseColor.rgb *= 0.8 + 0.22 * rv(vRW * 140.0) + 0.12 * rv(vRW * 520.0);\n' +
    '#elif TISSUE == 4\n diffuseColor.rgb *= 0.84 + 0.26 * rv(vRW * 160.0); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.2, 0.14, 0.15), smoothstep(0.8, 0.9, rv(vRW * 900.0)) * 0.45);\n' +
    '#elif TISSUE == 5\n diffuseColor.rgb *= 0.86 + 0.22 * rv(vec3(vLO.x * 900.0, vLO.y * 40.0, vLO.z * 900.0));\n' +
    '#elif TISSUE == 6\n diffuseColor.rgb *= 0.95 + 0.07 * n1 - 0.06 * smoothstep(0.7, 0.85, rv(vRW * 3000.0)); diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.06, 0.9, 0.88), rv(vRW * 25.0) * 0.45);\n' +
    '#elif TISSUE == 7\n diffuseColor.rgb *= 0.8 + 0.25 * smoothstep(0.0, 0.35, abs(rv(vRW * 180.0) - 0.5) * 2.0);\n' +
    '#else\n diffuseColor.rgb *= 0.9 + 0.14 * n1;\n#endif\n}\n';
  const NRM = '\nif (uLife > 0.5) {\n' + F +
    '#if TISSUE == 1\n normal = normalize(normal + 0.28 * (vec3(rv(Lf), rv(Lf + 7.0), rv(Lf + 13.0)) - 0.5));\n' +
    '#elif TISSUE == 2\n normal = normalize(normal + 0.35 * rg(vRW * 1800.0));\n' +
    '#elif TISSUE == 6\n normal = normalize(normal + 0.16 * rg(vRW * 3000.0));\n' +
    '#elif TISSUE == 7\n normal = normalize(normal + 0.3 * rg(vRW * 180.0));\n' +
    '#else\n normal = normalize(normal + 0.12 * rg(vRW * 300.0));\n#endif\n}\n';
  mats.forEach(m => { const t = cat(m.name); if (LC[m.name] !== undefined) m.userData.lc = LC[m.name];
    const prev = m.onBeforeCompile;
    m.onBeforeCompile = (sh, r) => { if (prev) prev.call(m, sh, r); sh.uniforms.uLife = lifeU;
      sh.vertexShader = 'varying vec3 vLO;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\nvLO = transformed;');
      sh.fragmentShader = '#define TISSUE ' + t + '\nuniform float uLife; varying vec3 vLO;\n' + sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>' + COL).replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>' + NRM); };
    const key = m.customProgramCacheKey.bind(m); m.customProgramCacheKey = () => key() + '|life' + t; m.needsUpdate = true; });
}
{ // tweaks: rendering style, lighting mood, presentation
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "render": "atlas",
    "present": "off"
  }/*EDITMODE-END*/;
  const tw = { ...TWEAK_DEFAULTS }, box = $('tweaks'), mats = new Set();
  model.traverse(o => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m && mats.add(m)); });
  mats.forEach(m => m.userData.base = { c: m.color ? m.color.getHex() : null, tr: m.transparent, op: m.opacity, dw: m.depthWrite, vc: m.vertexColors, side: m.side });
  const applyRender = v => { lifeU.value = v === 'life' ? 1 : 0; sc.environment = v === 'life' ? lifeEnv : null; sc.environmentIntensity = 0.55;
    mat.skin.color.setHex(v === 'life' ? (mat.skin.userData.tone ?? 0xc8927a) : (mat.skin.userData.tone ?? mat.skin.userData.base.c)); mats.forEach(m => { const b = m.userData.base; if (m === mat.skin) return;
    if (m.color && b.c !== null) m.color.setHex(v === 'clay' ? 0xd8d1c4 : v === 'life' && m.userData.lc !== undefined ? m.userData.lc : b.c);
    m.vertexColors = v === 'clay' ? false : b.vc;
    if (v === 'xray') { m.transparent = true; m.opacity = Math.min(b.op, 0.2); m.depthWrite = false; m.side = THREE.DoubleSide; }
    else { m.transparent = b.tr; m.opacity = b.op; m.depthWrite = b.dw; m.side = b.side; }
    m.needsUpdate = true; }); };
  const sc = stage._scene, hemi = sc.children.find(o => o.isHemisphereLight), dirs = sc.children.filter(o => o.isDirectionalLight), key = stage._key || dirs[0], fill = dirs.find(d => d !== key);
  const L0 = { hs: hemi.color.getHex(), hg: hemi.groundColor.getHex(), hi: hemi.intensity, kc: key.color.getHex(), ki: key.intensity, fc: fill && fill.color.getHex(), fi: fill && fill.intensity, ex: stage._renderer.toneMappingExposure };
  const MOODS = { studio: null, theatre: { bg: '#1c1d1f', hs: 0x8a93a6, hg: 0x241c18, hi: 0.35, kc: 0xffd2a0, ki: 3.4, fc: 0x7f9cc4, fi: 0.9, ex: 1.0 }, clinical: { bg: '#e8edf1', hs: 0xf4f8ff, hg: 0xc9d3dc, hi: 1.35, kc: 0xf2f7ff, ki: 1.7, fc: 0xe6f0ff, fi: 0.7, ex: 1.05 } };
  const applyLight = v => { const m = MOODS[v] || { bg: '', ...L0 };
    if (m.bg) stage.style.setProperty('--stage-bg', m.bg); else stage.style.removeProperty('--stage-bg');
    hemi.color.setHex(m.hs); hemi.groundColor.setHex(m.hg); hemi.intensity = m.hi; key.color.setHex(m.kc); key.intensity = m.ki;
    if (fill) { fill.color.setHex(m.fc); fill.intensity = m.fi; } stage._renderer.toneMappingExposure = m.ex;
    if (stage._ground) stage._ground.visible = v !== 'theatre'; };
  const applyPresent = v => { document.body.classList.toggle('present', v === 'on'); stage._controls.autoRotate = v === 'on'; stage._controls.autoRotateSpeed = 0.8; };
  const apply = () => { applyRender(tw.render); applyPresent(tw.present);
    [['tw-render', 'render'], ['tw-present', 'present'], ['p-render', 'render'], ['p-present', 'present']].forEach(([id, k]) => $(id).querySelectorAll('.b').forEach(b => b.classList.toggle('on', b.dataset.v === tw[k]))); };
  const set = (k, v) => { tw[k] = v; apply(); window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*'); };
  [['tw-render', 'render'], ['tw-present', 'present'], ['p-render', 'render'], ['p-present', 'present']].forEach(([id, k]) => $(id).addEventListener('click', e => { const b = e.target.closest('.b'); if (b) set(k, b.dataset.v); }));
  window.addEventListener('message', e => { const ty = e.data && e.data.type; if (ty === '__activate_edit_mode') box.style.display = 'block'; else if (ty === '__deactivate_edit_mode') box.style.display = 'none'; });
  $('twx').onclick = () => { box.style.display = 'none'; window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); };
  window.parent.postMessage({ type: '__edit_mode_available' }, '*');
  apply();
}
$('skinop').addEventListener('input', e => { const v = +e.target.value; mat.skin.opacity = v; mat.skin.transparent = v < 0.99; mat.skin.depthWrite = v >= 0.99; mat.skin.needsUpdate = true; });
// hover labels
const ray = new THREE.Raycaster(), tip = $('tip'), pt = new THREE.Vector2();
stage.addEventListener('pointermove', e => {
  if (e.buttons) { tip.style.display = 'none'; return; }
  const cv = stage._renderer.domElement, rc = cv.getBoundingClientRect();
  pt.set(((e.clientX - rc.left) / rc.width) * 2 - 1, -((e.clientY - rc.top) / rc.height) * 2 + 1);
  ray.setFromCamera(pt, stage._camera);
  const meshes = []; model.traverse(o => { if (o.isMesh && o.userData.label && vis(o)) meshes.push(o); });
  const hits = ray.intersectObjects(meshes, false);
  const h = hits.find(x => x.object.userData.sys !== 'skin' && !x.object.userData.passive) || hits.find(x => x.object.userData.sys !== 'skin') || hits[0];
  if (!h) { tip.style.display = 'none'; return; }
  tip.textContent = h.object.userData.label; tip.style.display = 'block';
  tip.style.left = e.clientX + 14 + 'px'; tip.style.top = e.clientY + 14 + 'px';
});
stage.addEventListener('pointerleave', () => { tip.style.display = 'none'; });

// ───────── brain and spine views ─────────
{
const BR = window.__brain, nerv = []; let sv = null;
model.traverse(o => { if (o.isMesh && o.userData.side) nerv.push(o); });
const camTo = (pos, tgt) => { try { stage._camera.position.set(...pos); stage._controls.target.set(...tgt); stage._controls.update(); } catch (e) { } };
const LIMB = ['skeletal', 'muscular', 'circulatory', 'nervous'];
const REG = {
  kidneys: { keep: ['urinary', 'circulatory'], cam: [0, 1.05, 0.42], tgt: [0, 1.03, -0.05], sel: 'urinary' },
  kidneysback: { keep: ['urinary', 'circulatory', 'skeletal'], cam: [0, 1.06, -0.5], tgt: [0, 1.03, -0.05], sel: 'urinary' },
  cycle: { keep: ['reproductive'], cam: [0.04, 0.85, 0.3], tgt: [0, 0.83, 0.02], sel: 'reproductive' },
  breast: { keep: ['reproductive', 'skeletal', 'muscular', 'circulatory', 'nervous'], cam: [0, 1.28, 0.6], tgt: [0, 1.27, 0.08], sel: 'reproductive' },
  breastside: { keep: ['reproductive', 'skeletal', 'muscular', 'circulatory', 'nervous'], cam: [0.62, 1.28, 0.1], tgt: [0.09, 1.27, 0.08], sel: 'reproductive' },
  repro: { keep: ['reproductive', 'urinary', 'skeletal'], cam: [0.07, 0.86, 0.4], tgt: [0, 0.8, 0.06], sel: 'reproductive' },
  reproside: { keep: ['reproductive', 'urinary', 'skeletal'], cam: [0.36, 0.82, 0.07], tgt: [0, 0.81, 0.05], sel: 'reproductive' },
  pelvis: { keep: ['urinary', 'skeletal'], cam: [0.06, 0.97, 0.36], tgt: [0, 0.85, 0.03], sel: 'urinary' },
  arm: { keep: LIMB, cam: [0.52, 1.28, 0.44], tgt: [0.21, 1.22, 0], sel: 'muscular' },
  hand: { keep: LIMB, cam: [0.5, 0.86, 0.36], tgt: [0.24, 0.8, 0.02], sel: 'muscular' },
  thigh: { keep: LIMB, cam: [0.46, 0.74, 0.56], tgt: [0.1, 0.67, 0], sel: 'muscular' },
  foot: { keep: LIMB, cam: [0.42, 0.28, 0.52], tgt: [0.1, 0.18, 0.03], sel: 'muscular' },
};
// each view keeps only its own region and frames it in the middle of the screen
const BOX = { cycle: [[-0.1, 0.72, -0.05], [0.1, 0.9, 0.1]], breast: [[-0.2, 1.17, -0.12], [0.2, 1.4, 0.16]], breastside: [[-0.02, 1.17, -0.12], [0.2, 1.4, 0.16]], kidneys: [[-0.15, 0.88, -0.15], [0.15, 1.2, 0.1]], kidneysback: [[-0.15, 0.88, -0.15], [0.15, 1.2, 0.1]], repro: [[-0.12, 0.7, -0.1], [0.12, 0.95, 0.15]], reproside: [[-0.12, 0.7, -0.1], [0.12, 0.95, 0.15]],
  pelvis: [[-0.16, 0.76, -0.12], [0.16, 1.0, 0.12]], arm: [[0.12, 1.0, -0.12], [0.33, 1.5, 0.1]], hand: [[0.2, 0.6, -0.08], [0.42, 0.9, 0.1]], thigh: [[0.0, 0.42, -0.12], [0.22, 0.95, 0.12]],
  foot: [[0.02, -0.02, -0.1], [0.22, 0.48, 0.2]], thorax: [[-0.2, 1.08, -0.15], [0.2, 1.45, 0.15]], lateral: [[-0.1, 1.53, -0.12], [0.1, 1.76, 0.12]], medial: [[-0.1, 1.53, -0.12], [0.1, 1.76, 0.12]],
  inferior: [[-0.1, 1.53, -0.12], [0.1, 1.76, 0.12]], spine: [[-0.08, 0.75, -0.13], [0.08, 1.6, 0.0]] };
const CAMS = { heart: [[0.02, 1.27, 0.5], [0.02, 1.24, 0.04]], thorax: [[0, 1.25, 0.95], [0, 1.22, 0]], spine: [[0.55, 1.3, 0.95], [0.02, 1.2, -0.02]], inferior: [[0.05, 1.2, 0.3], [0, 1.642, -0.01]], lateral: [[0.5, 1.65, -0.005], [0, 1.642, -0.01]], medial: [[0.5, 1.65, -0.005], [0, 1.642, -0.01]] };
const regionHid = [], cen = new Map(), cb = new THREE.Box3();
const centerOf = o => { let c = cen.get(o); if (!c) { cb.setFromObject(o); c = cb.isEmpty() ? null : cb.getCenter(V(0, 0, 0)); cen.set(o, c); } return c; };
const HEARTBOX = [[-0.08, 1.15, -0.06], [0.12, 1.4, 0.14]];
const frame = (keep, cp, ct, B) => { const bx = new THREE.Box3(); keep.forEach(k => G[k].traverse(o => { if (o.isMesh && vis(o)) bx.expandByObject(o); }));
  if (B) bx.intersect(new THREE.Box3(V(...B[0]), V(...B[1]))); if (bx.isEmpty()) { camTo(cp, ct); return; }
  // free screen area between the side panels
  const W = innerWidth, vis2 = el => el && getComputedStyle(el).display !== 'none' ? el.getBoundingClientRect() : null, pl = vis2(document.querySelector('.panel')), sb = vis2($('slicebox'));
  const L0 = pl ? pl.right : 0, R0 = sb ? sb.left : W, fw = Math.max(200, R0 - L0), fc = (L0 + R0) / 2;
  const c = bx.getCenter(V(0, 0, 0)), r = bx.getSize(V(0, 0, 0)).length() / 2, cam = stage._camera, dir = V(...cp).sub(V(...ct)).normalize(), fov = (cam.fov || 40) * Math.PI / 180, asp = (cam.aspect || 1) * fw / W;
  const d = r / Math.sin(Math.min(fov, 2 * Math.atan(Math.tan(fov / 2) * asp)) / 2) * 1.05;
  const right = new THREE.Vector3().crossVectors(dir.clone().negate(), V(0, 1, 0)); if (right.lengthSq() < 1e-6) right.set(1, 0, 0); right.normalize();
  const worldW = 2 * d * Math.tan(fov / 2) * (cam.aspect || 1), sh = -((fc - W / 2) / W) * worldW, tg = c.clone().addScaledVector(right, sh);
  camTo(tg.clone().addScaledVector(dir, d).toArray(), tg.toArray()); };
const heartHid = regionHid, VSEL = '.vb:not(#p-render):not(#p-present) .b[data-v]';
function setView(k) {
  regionHid.forEach(o => { o.visible = true; }); regionHid.length = 0;
  if (k !== 'reset' && $('alvshow').checked) { $('alvshow').checked = false; $('alvshow').onchange({ target: $('alvshow') }); }
  if (k !== 'reset' && k !== 'heart' && !REG[k] && !CAMS[k]) return;
  const bs = document.querySelectorAll(VSEL); bs.forEach(b => b.classList.toggle('on', b.dataset.v === k));
  if (k === 'reset') { if (sv) { SYS.forEach(s => setSys(s.k, sv[s.k])); sv = null; } nerv.forEach(o => { o.visible = true; }); requestSlice(); return; }
  if (!sv) { sv = {}; SYS.forEach(s => { sv[s.k] = G[s.k].visible; }); }
  nerv.forEach(o => { o.visible = true; });
  const RG = REG[k], keep = RG ? RG.keep : k === 'heart' ? ['circulatory'] : k === 'thorax' ? ['circulatory', 'respiratory'] : ['nervous'];
  SYS.forEach(s => setSys(s.k, keep.includes(s.k)));
  const hide = o => { if (o.visible) { o.visible = false; regionHid.push(o); } };
  if (k === 'heart') { const [a, b] = window.__heartRange || [0, 0];
    G.circulatory.children.forEach((o, i) => { const hrt = (i >= a && i < b && !/abdominal_aorta|brachiocephalic/.test(o.name)) || /pulmonary_(artery|vein)/.test(o.name); if (!hrt) hide(o); }); }
  const B = BOX[k]; if (B) { const lo = V(...B[0]), hi = V(...B[1]);
    keep.forEach(sk => G[sk].traverse(o => { if (!o.isMesh || !vis(o)) return; const c = centerOf(o); if (!c || c.x < lo.x || c.y < lo.y || c.z < lo.z || c.x > hi.x || c.y > hi.y || c.z > hi.z) hide(o); })); }
  if (k === 'medial') nerv.forEach(o => { if (o.userData.side === 'L') o.visible = false; });
  const [cp, ct] = RG ? [RG.cam, RG.tgt] : CAMS[k]; frame(keep, cp, ct, k === 'heart' ? HEARTBOX : B);
  sel = RG ? RG.sel : (k === 'heart' || k === 'thorax') ? 'circulatory' : 'nervous'; showInfo(); requestSlice();
}
document.querySelectorAll(VSEL).forEach(b => { b.onclick = () => setView(b.dataset.v); });
{ const HM = window.__heart; try { stage._renderer.localClippingEnabled = true; } catch (e) { }
  const ap = () => { const on = $('hcut').checked; HM.clip.constant = +$('hdepth').value; HM.mats.forEach(m => { m.clippingPlanes = on ? [HM.clip] : null; m.needsUpdate = true; }); };
  $('hcut').onchange = ap; $('hdepth').addEventListener('input', ap);
  let alvSv = null;
  $('alvshow').onchange = e => { const on = e.target.checked, A = window.__alvG, cam = stage._camera, ctl = stage._controls;
    if (on && !alvSv) {
      alvSv = { sys: Object.fromEntries(SYS.map(s => [s.k, G[s.k].visible])), hid: [], cp: cam.position.clone(), ct: ctl.target.clone() };
      SYS.forEach(s => setSys(s.k, s.k === 'respiratory'));
      G.respiratory.children.forEach(o => { if (o !== A && o.visible) { o.visible = false; alvSv.hid.push(o); } });
      A.visible = true; const bx = new THREE.Box3().setFromObject(A), c = bx.getCenter(V(0, 0, 0)), r = bx.getSize(V(0, 0, 0)).length();
      cam.position.set(c.x + r * 0.35, c.y + r * 0.2, c.z + r * 1.3); ctl.target.copy(c); ctl.update(); sel = 'respiratory'; showInfo();
    } else if (!on) { A.visible = false;
      if (alvSv) { alvSv.hid.forEach(o => { o.visible = true; }); SYS.forEach(s => setSys(s.k, alvSv.sys[s.k])); cam.position.copy(alvSv.cp); ctl.target.copy(alvSv.ct); ctl.update(); alvSv = null; } }
    requestSlice(); };
  $('lungop').addEventListener('input', e => { const v = +e.target.value; window.__lungMats.forEach(m => { m.opacity = v; m.transparent = v < 0.99; m.depthWrite = v >= 0.99; m.needsUpdate = true; }); }); }
$('cortexop').addEventListener('input', e => { const v = +e.target.value; Object.values(BR.cortexMats).forEach(m => { m.transparent = v < 0.99; m.opacity = v; m.depthWrite = v >= 0.99; m.needsUpdate = true; }); });
}


// ───────── EXPLORER: search, peel, dissect, slice ─────────
const SYSNAME = Object.fromEntries(SYS.map(s => [s.k, s.name]));
let sq = false; const requestSlice = () => { if (sq) return; sq = true; requestAnimationFrame(() => { sq = false; renderSlice(); }); };
{
  const row = list.querySelector('[data-k="reproductive"]'), note = $('sexnote');
  const reproSys = SYS.find(x => x.k === 'reproductive');
  const reproMaleInfo = { name: reproSys.name, blurb: reproSys.blurb, parts: [...reproSys.parts] };
  const reproFemaleInfo = {
    name: 'Reproductive (female and breast)',
    blurb: 'Female reproductive organs include the ovaries, fallopian tubes, uterus, cervix and vagina, with the vulva externally. Move the menstrual cycle slider (day 1 to 28) to see the lining thicken, a follicle mature, ovulation and the corpus luteum. The breast model has 16 radial lobes, each with a lactiferous duct, a lobule and acini, set in fat and fibrous tissue held by the suspensory ligaments of Cooper, with the nipple-areola complex, axillary tail, lymph nodes, vessels and nerves.',
    parts: ['#Female reproductive system', 'Ovary', 'Ovarian follicle', 'Dominant (Graafian) follicle', 'Released oocyte', 'Corpus luteum', 'Fallopian tube', 'Fimbriae', 'Uterus (womb)', 'Perimetrium', 'Myometrium', 'Endometrium', 'Cervix', 'Cervical canal', 'Vagina',
      '#Vulva (external)', 'Labia majora', 'Labia minora', 'Clitoris', 'Urethral opening (female)', 'Vaginal opening',
      '#Breast: glandular', 'Breast lobe and lobule', 'Acini (milk-producing alveoli)', 'Lactiferous ducts',
      '#Breast: supportive', 'Breast adipose tissue', 'Fibrous connective tissue (breast)', "Cooper's ligaments", 'Retromammary space and pectoral fascia',
      '#Breast: surface', 'Nipple', 'Areola', "Montgomery's glands", 'Axillary tail of breast',
      '#Breast: vessels, nerves, lymph', 'Axillary lymph nodes', 'Breast lymphatic vessel', 'Internal thoracic artery branches', 'Lateral thoracic artery branches', 'Intercostal nerve branches']
  };
  const applyReproInfo = inf => {
    reproSys.name = inf.name; reproSys.blurb = inf.blurb; reproSys.parts = inf.parts;
    if (row) {
      const nm = row.querySelector('.sname'); if (nm) nm.textContent = inf.name;
      const cb = row.querySelector('input'); if (cb) cb.setAttribute('aria-label', 'Show ' + inf.name);
    }
  };
  const setSex = v => {
    // without the female body mesh the built skin stays on (minus the male genitalia), so the female structures still show
    const maleSkin = v === 'male' || !femaleOK;
    SEXG.male.visible = FATG.male.visible = maleSkin; SEXG.female.visible = FATG.female.visible = v === 'female' && femaleOK; reproM.visible = v === 'male'; reproF.visible = v === 'female';
    SEXG.male.children.forEach(o => { if (/^(scrotum|penis)/.test(o.name)) o.visible = v === 'male'; });
    applyReproInfo(v === 'female' ? reproFemaleInfo : reproMaleInfo);
    note.style.display = v === 'female' ? 'block' : 'none';
    note.textContent = femaleOK ? 'Female body surface is shown with dedicated female reproductive and breast structures.' : 'The female body mesh is not loaded, so the generic body surface is shown with the female reproductive and breast structures. Peel the skin layer to see them.';
    document.querySelectorAll('[data-v="breast"],[data-v="breastside"],[data-v="cycle"]').forEach(b => { b.style.display = v === 'female' ? '' : 'none'; });
    $('cyclebox').style.display = v === 'female' ? 'block' : 'none';
    $('p-sex').querySelectorAll('.b').forEach(b => { const on = b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    try { localStorage.setItem('anatomy-sex', v); } catch (e) {}
    if (sel === 'reproductive') showInfo();
    requestSlice();
  };
  const cycleUi = () => { const r = window.__cycle(+$('cycleday').value); $('cycledayn').textContent = r.day; $('cyclephase').textContent = r.phase; $('cyclenote').textContent = r.hormone; requestSlice(); };
  $('cycleday').addEventListener('input', () => { const cb = document.querySelector('.vb .b[data-v="cycle"]'); if (cb && !cb.classList.contains('on')) cb.click(); cycleUi(); }); cycleUi();
  $('p-sex').addEventListener('click', e => { const b = e.target.closest('.b'); if (b && !b.disabled) setSex(b.dataset.v); });
  let s0 = 'male'; try { s0 = localStorage.getItem('anatomy-sex') || 'male'; } catch (e) {}
  setSex(s0);
}
{
  const setTone = v => { const hex = v === 'plate' ? null : parseInt(v, 16); mat.skin.userData.tone = hex ?? undefined;
    mat.skin.color.setHex(hex ?? (mat.skin.userData.base ? mat.skin.userData.base.c : 0xe7ddd2));
    $('p-tone').querySelectorAll('.t').forEach(b => { const on = b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    try { localStorage.setItem('anatomy-skin-tone', v); } catch (e) {} };
  $('p-tone').addEventListener('click', e => { const b = e.target.closest('.t'); if (b) setTone(b.dataset.v); });
  let t0 = 'plate'; try { t0 = localStorage.getItem('anatomy-skin-tone') || 'plate'; } catch (e) {} setTone(t0);
}

// find a part + pin with leader line
function buildIndex() { index = new Map(); model.traverse(o => { if (o.isMesh && o.userData.label && o.userData.sys !== 'skin') { const l = o.userData.label; if (!index.has(l)) index.set(l, { sys: o.userData.sys, meshes: [] }); index.get(l).meshes.push(o); } }); }
const pin = { c: null, on: false };
function setPin(label, text) {
  const es = [].concat(label).map(l => index.get(l)).filter(Boolean); if (!es.length) return;
  es.forEach(e => { setSys(e.sys, true); e.meshes.forEach(m => { m.visible = true; }); });
  if ([].concat(label).some(l => l.startsWith('Magnified')) && window.__alvG) { if (!$('alvshow').checked) { $('alvshow').checked = true; $('alvshow').onchange({ target: $('alvshow') }); } }
  const b = new THREE.Box3(); es.forEach(e => e.meshes.forEach(m => b.expandByObject(m))); pin.c = b.getCenter(new THREE.Vector3());
  $('pintxt').textContent = text || [].concat(label)[0]; pin.on = true; sel = es[0].sys; showInfo(); requestSlice(); trackPin();
  if (window.__onPin) window.__onPin([].concat(label)[0], es[0].sys);
}
function clearPin() { pin.on = false; ['pinsvg'].forEach(i => $(i).style.display = 'none'); $('pinlbl').style.display = 'none'; }
function trackPin() {
  if (!pin.on) return;
  const v = pin.c.clone().project(stage._camera), rc = stage._renderer.domElement.getBoundingClientRect();
  if (v.z > 1) { $('pinsvg').style.display = 'none'; $('pinlbl').style.display = 'none'; }
  else {
    const x = rc.left + (v.x * 0.5 + 0.5) * rc.width, y = rc.top + (-v.y * 0.5 + 0.5) * rc.height, lx = x + 70, ly = y - 56;
    $('pinsvg').style.display = 'block'; const l = $('pinline'); l.setAttribute('x1', x); l.setAttribute('y1', y); l.setAttribute('x2', lx); l.setAttribute('y2', ly + 14);
    const d = $('pindot'); d.setAttribute('cx', x); d.setAttribute('cy', y);
    const lb = $('pinlbl'); lb.style.display = 'flex'; lb.style.left = lx + 'px'; lb.style.top = ly + 'px';
  }
  requestAnimationFrame(trackPin);
}
$('pinx').onclick = clearPin;
$('q').addEventListener('input', e => {
  if (window.__search) return;   // search.js takes over the results list
  if (!index) buildIndex();
  const q = e.target.value.trim().toLowerCase(), box = $('qres'); box.innerHTML = '';
  if (!q) return;
  const hits = [...index.keys()].filter(k => k.toLowerCase().includes(q)).sort((a, b) => (a.toLowerCase().startsWith(q) ? 0 : 1) - (b.toLowerCase().startsWith(q) ? 0 : 1) || a.localeCompare(b)).slice(0, 7);
  if (!hits.length) { box.innerHTML = '<div style="font-size:12px;color:var(--color-neutral-700);padding:4px">No match</div>'; return; }
  hits.forEach(k => { const b = document.createElement('button'); b.className = 'res'; b.innerHTML = '<span></span><small></small>'; b.firstChild.textContent = k; b.lastChild.textContent = SYSNAME[index.get(k).sys]; b.onclick = () => { setPin(k); }; box.appendChild(b); });
});
// hooks for search.js and tree.js: the system and part lists, the part-name matcher the Parts list uses, and pinning
window.__setPin = setPin;
window.__tree = {
  SYS, SYSNAME,
  partMatches: (p, k) => { const q = p.toLowerCase().split(' (')[0].split(': ')[0], l = k.toLowerCase(); return k.startsWith(p.split(' (')[0]) || l.includes(q) || (q.includes(' and ') && q.split(' and ').some(w => w.length > 3 && l.includes(w))); },
  labels: () => { if (!index) buildIndex(); return index; },
  pick(sk, p) { if (!index) buildIndex(); const keys = [...index.keys()], q = p.toLowerCase().split(' (')[0].split(': ')[0];
    const m = keys.filter(k => this.partMatches(p, k)).filter(k => index.get(k).sys === sk), hit = m.find(k => index.get(k).meshes.some(x => vis(x))) || m[0];
    if (hit) setPin(sk === 'nervous' && m.length > 1 ? m : hit, p); return !!hit; },
};
$('q').addEventListener('keydown', e => { if (e.key === 'Enter') { const f = $('qres').querySelector('.res'); if (f) f.click(); } });

// peel layers
const LAYERS = [['skin', 'fat'], ['muscular'], ['circulatory', 'respiratory', 'digestive', 'urinary', 'nervous', 'senses', 'endocrine', 'reproductive']], saved = {}; let peel = 0;
$('peel').addEventListener('input', e => {
  const p = +e.target.value;
  if (p > peel) for (let i = peel; i < p && i < 3; i++) LAYERS[i].forEach(k => { saved[k] = G[k].visible; setSys(k, false); });
  else for (let i = p; i < peel && i < 3; i++) LAYERS[i].forEach(k => setSys(k, saved[k] ?? true));
  peel = p;
});

// dissect: click to lift a part away
const removed = [];
function dcount() { const n = removed.filter(r => r.some(m => !m.visible)).length; $('dcount').textContent = n ? n + ' removed · last: ' + removed[removed.length - 1][0].userData.label : 'Nothing removed'; $('undo').disabled = !removed.length; }
$('undo').onclick = () => { const r = removed.pop(); if (r) r.forEach(m => { m.visible = true; }); dcount(); requestSlice(); };
$('restore').onclick = () => { removed.splice(0).forEach(r => r.forEach(m => { m.visible = true; })); dcount(); requestSlice(); };
dcount(); window.__removed = removed; window.__dcount = dcount;
let down = null;
stage.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
stage.addEventListener('pointerup', e => {
  if (!down || e.button !== 0) return;
  const d = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = performance.now() - down.t; down = null;
  if (d > 5 || dt > 500) return;
  const rc = stage._renderer.domElement.getBoundingClientRect();
  pt.set(((e.clientX - rc.left) / rc.width) * 2 - 1, -((e.clientY - rc.top) / rc.height) * 2 + 1); ray.setFromCamera(pt, stage._camera);
  const ms = []; model.traverse(o => { if (o.isMesh && o.userData.label && vis(o) && o.userData.sys !== 'skin') ms.push(o); });
  const hs = ray.intersectObjects(ms, false), h = (e.altKey ? hs[0] : hs.find(x => !x.object.userData.passive)) || hs[0]; if (!h) return; // fascial sleeves are see-through: pick the structure behind them (Alt picks the sleeve)
  if (window.__select) { window.__select(h.object); tip.style.display = 'none'; return; }
  const lab = h.object.userData.label, grp = ms.filter(m => m.userData.label === lab);
  grp.forEach(m => { m.visible = false; }); removed.push(grp); tip.style.display = 'none'; dcount(); requestSlice();
});

// cross-section: ortho slab render of the cut, flat-coloured by structure
const sc = $('slice'), r2 = new THREE.WebGLRenderer({ canvas: sc, antialias: true }); r2.setPixelRatio(2); r2.setSize(274, 200, false); r2.setClearColor(0xf7f6f3, 1); r2.localClippingEnabled = true;
const clip = new THREE.Plane(), bms = {}, planeOf = { transverse: 'transverse', coronal: 'coronal', sagittal: 'sagittal' };
const bmat = hex => bms[hex] || (bms[hex] = new THREE.MeshBasicMaterial({ color: hex, side: THREE.DoubleSide, clippingPlanes: [clip] }));
const AX = {
  transverse: { v: x => 1.72 - x * 1.69, ends: ['Superior', 'Inferior'], x: 0.28 },
  coronal: { v: x => 0.12 - x * 0.24, ends: ['Anterior', 'Posterior'], x: 0.5 },
  sagittal: { v: x => -0.3 + x * 0.6, ends: ['Right lateral', 'Left lateral'], x: 0.5 },
};
let axis = 'transverse';
const LEG = [['Fat', '#e8c96a'], ['Bone', '#e6d8b8'], ['Muscle', '#a5473b'], ['Artery', '#b3322b'], ['Vein', '#3f5f8f'], ['Lung', '#d89a98'], ['Digestive', '#d68d81'], ['Kidney', '#9a4a3c'], ['Reproductive', '#c9866f'], ['Nerve', '#e8c452'], ['Brain and cord', '#d9b3ae'], ['Selected', '#e8801a']];
$('legend').innerHTML = LEG.map(([n, c]) => '<span><i style="background:' + c + '"></i>' + n + '</span>').join('');
const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 0.008);
let sliceOpen = true;
const SZ = { w: 274, h: 200 }, VW = { z: 1, x: 0, y: 0, hh: 0.3 };
const zset = z => { VW.z = Math.min(12, Math.max(0.5, z)); $('zlab').textContent = Math.round(VW.z * 100) + '%'; renderSlice(); };
$('zin').onclick = () => zset(VW.z * 1.4); $('zout').onclick = () => zset(VW.z / 1.4);
$('zfit').onclick = () => { VW.x = 0; VW.y = 0; zset(1); };
$('slice').addEventListener('wheel', e => { e.preventDefault(); e.stopPropagation(); zset(VW.z * (e.deltaY < 0 ? 1.15 : 1 / 1.15)); }, { passive: false });
{ let dr = null; const cv = $('slice');
  cv.addEventListener('pointerdown', e => { dr = [e.clientX, e.clientY]; cv.setPointerCapture(e.pointerId); e.stopPropagation(); });
  cv.addEventListener('pointermove', e => { if (!dr) return; const k = (2 * VW.hh) / SZ.h; VW.x -= (e.clientX - dr[0]) * k; VW.y += (e.clientY - dr[1]) * k; dr = [e.clientX, e.clientY]; renderSlice(); });
  ['pointerup', 'pointercancel'].forEach(ev => cv.addEventListener(ev, () => { dr = null; })); }
$('slicemin').onclick = () => { const m = $('slicebox').classList.toggle('min'); $('slicemin').textContent = m ? '+' : '−'; $('slicemin').title = m ? 'Expand' : 'Minimise'; $('slicemin').setAttribute('aria-label', m ? 'Expand cross-section' : 'Minimise cross-section'); if (!m) renderSlice(); };
const fitBig = () => { const b = $('slicebox').classList.contains('big'); SZ.w = b ? Math.max(274, Math.min(900, innerWidth - 420, Math.round((innerHeight - 290) * 1.37))) : 274;
  if (b && SZ.w < 380) SZ.w = Math.max(274, Math.min(innerWidth - 420, 520)); SZ.h = Math.round(SZ.w * 200 / 274);
  r2.setSize(SZ.w, SZ.h, false); $('slice').style.width = SZ.w + 'px'; $('slice').style.height = SZ.h + 'px'; $('slicebox').style.width = (SZ.w + 26) + 'px'; };
addEventListener('resize', () => { if ($('slicebox').classList.contains('big')) { fitBig(); renderSlice(); } });
$('slicebig').onclick = () => { const b = $('slicebox').classList.toggle('big'); fitBig(); $('slicebig').title = b ? 'Make smaller' : 'Enlarge'; renderSlice(); };
$('sliceclose').onclick = () => { sliceOpen = false; $('slicebox').style.display = 'none'; $('sliceopen').style.display = 'block'; Object.values(planes).forEach(p => { p.visible = false; }); };
$('sliceopen').onclick = () => { sliceOpen = true; $('slicebox').style.display = 'block'; $('sliceopen').style.display = 'none'; renderSlice(); };
function renderSlice() {
  if (!sliceOpen) return;
  const A = AX[axis], v = A.v(A.x); model.updateMatrixWorld(true);
  const off = new THREE.Vector3().setFromMatrixPosition(model.matrixWorld), asp = SZ.w / SZ.h;
  let n, c, up, hh;
  if (axis === 'transverse') { n = V(0, 1, 0); c = V(0, v, -0.015); up = V(0, 0, 1); hh = 0.21; }
  else if (axis === 'coronal') { n = V(0, 0, -1); c = V(0, 0.86, v); up = V(0, 1, 0); hh = 0.93; }
  else { n = V(1, 0, 0); c = V(v, 0.86, -0.02); up = V(0, 1, 0); hh = 0.93; }
  c.add(off); clip.setFromNormalAndCoplanarPoint(n, c); hh /= VW.z; VW.hh = hh;
  const rt = new THREE.Vector3().crossVectors(n, up).normalize(); c.addScaledVector(rt, VW.x).addScaledVector(up, VW.y);
  cam.left = -hh * asp; cam.right = hh * asp; cam.top = hh; cam.bottom = -hh; cam.up.copy(up); cam.position.copy(c); cam.lookAt(c.clone().add(n)); cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
  const scene = stage._scene, hid = [], swap = [], bg = scene.background, skinV = G.skin.visible;
  scene.children.forEach(o => { if (o !== model && o.visible) { o.visible = false; hid.push(o); } });
  Object.values(planes).forEach(p => { if (p.visible) { p.visible = false; hid.push(p); } });
  G.skin.visible = false; scene.background = null;
  // the structure selected in the 3D view (its tab is open) is drawn in amber on the cut as well
  const selTab = $('sbar'), selLab = selTab && selTab.classList.contains('open') ? $('sbname').textContent : '';
  model.traverse(o => { if (o.isMesh) { swap.push([o, o.material]); o.material = bmat(selLab && o.userData.label === selLab ? 0xe8801a : o.material.color.getHex()); } });
  r2.render(scene, cam);
  swap.forEach(([o, m]) => { o.material = m; }); hid.forEach(o => { o.visible = true; }); G.skin.visible = skinV; scene.background = bg;
  Object.entries(planes).forEach(([k, p]) => { p.visible = $('showplane').checked && k === axis; });
  if (axis === 'transverse') planes.transverse.position.y = v; else if (axis === 'coronal') planes.coronal.position.z = v; else planes.sagittal.position.x = v;
}
function setAxis(a) { axis = a; VW.x = 0; VW.y = 0; VW.z = 1; $('zlab').textContent = '100%'; $('sl').value = AX[a].x; const e = AX[a].ends; $('slends').innerHTML = '<span>' + e[0] + '</span><span>' + e[1] + '</span>'; renderSlice(); }
$('axis').onchange = e => setAxis(e.target.value);
$('sl').addEventListener('input', e => { AX[axis].x = +e.target.value; renderSlice(); });
$('showplane').onchange = () => renderSlice();
// click a coloured region of the cut to select that structure in the 3D view.
// The slice camera looks along the cut normal and sees 8 mm past the plane, so a ray from the click, limited to that depth, finds the surface drawn there.
window.requestSliceNow = requestSlice;
{ const cv = $('slice'), rs = new THREE.Raycaster(), dbl = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), nd = new THREE.Vector2(); let dn = null;
  cv.addEventListener('pointerdown', e => { dn = [e.clientX, e.clientY, performance.now()]; });
  cv.addEventListener('pointerup', e => {
    if (!dn || e.button !== 0) return; const d = Math.hypot(e.clientX - dn[0], e.clientY - dn[1]), dt = performance.now() - dn[2]; dn = null; if (d > 5 || dt > 600) return;
    const rc = cv.getBoundingClientRect(), cx = ((e.clientX - rc.left) / rc.width) * 2 - 1, cy = -((e.clientY - rc.top) / rc.height) * 2 + 1;
    model.updateMatrixWorld(true); cam.updateMatrixWorld(true); rs.near = 0; rs.far = 0.0085;
    // only meshes whose bounding sphere reaches into the 8 mm slab can be on screen
    const nrm = cam.getWorldDirection(new THREE.Vector3()), sph = new THREE.Sphere(), dv = new THREE.Vector3(), ms = [], old = [];
    model.traverse(o => { if (!o.isMesh || o.isInstancedMesh || o.userData.sys === 'skin' || !vis(o)) return;
      const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); sph.copy(g.boundingSphere).applyMatrix4(o.matrixWorld);
      const dd = dv.copy(sph.center).sub(cam.position).dot(nrm); if (dd + sph.radius >= 0 && dd - sph.radius <= 0.0085) { ms.push(o); old.push(o.material); o.material = dbl; } });
    // walls of a cut tube are edge-on and about a pixel wide, so look at rings of points around the click, nearest ring first
    let hit = null;
    for (const [r, k] of [[0, 1], [2, 8], [4, 8], [6, 10], [9, 12]]) {
      for (let i = 0; i < k && !hit; i++) {
        const a = (i / k) * Math.PI * 2; nd.set(cx + Math.cos(a) * r * 2 / rc.width, cy + Math.sin(a) * r * 2 / rc.height); rs.setFromCamera(nd, cam);
        const h = rs.intersectObjects(ms, false).find(x => x.object.userData.label); if (h) hit = h;
      }
      if (hit) break;
    }
    ms.forEach((o, i) => { o.material = old[i]; });
    if (!hit || !window.__select) return;
    window.__select(hit.object); requestSlice();
  }); }
['change', 'click'].forEach(ev => document.addEventListener(ev, () => requestSlice()));
setAxis('transverse'); setTimeout(requestSlice, 400);

// ───────── brain axial series ─────────
{
const BRN = window.__brain, C0 = BRN.C0, B = BRN.B, CL = BRN.CL, S = 3000, X0 = -0.085, Z1 = 0.105, W = Math.round(0.17 * S), H = Math.round(0.21 * S);
const DEEP = /^(thalamus|pulvinar|lateral_geniculate|caudate|putamen|globus|internal_capsule|amygdala|hippocampus|fornix|corpus_callosum|lateral_ventricle|third_ventricle|choroid|hypothalamus|mammillary|subthalamic|interthalamic|pineal|midbrain|pons|medulla|cerebral_peduncle|superior_colliculus|inferior_colliculus|cerebral_aqueduct|fourth_ventricle|cerebellum|anterior_commissure|brachium|spinal_cord|central_canal)/;
const cortex = [], deep = [];
model.updateMatrixWorld(true);
model.traverse(o => { if (!o.isMesh) return; if (o.name.indexOf('cortex_') === 0) cortex.push(o); else if (DEEP.test(o.name)) deep.push(o); });
const inten = n => /spinal_cord_grey/.test(n) ? 0x8a8a8a : /spinal_cord/.test(n) ? 0xd0d0d0 : /ventricle|aqueduct|central_canal/.test(n) ? 0x161616 : /callosum|fornix|capsule|commissure/.test(n) ? 0xeaeaea : /midbrain|pons|medulla|peduncle|colliculus|brachium/.test(n) ? 0xc4c4c4 : /cerebellum/.test(n) ? 0xa6a6a6 : 0x929292;
const r3c = document.createElement('canvas'); r3c.width = W; r3c.height = H;
const r3 = new THREE.WebGLRenderer({ canvas: r3c, antialias: true, alpha: true }); r3.setPixelRatio(1); r3.setSize(W, H, false); r3.setClearColor(0x000000, 0); r3.localClippingEnabled = true;
const clipP = new THREE.Plane(), sc3 = new THREE.Scene(), cam3 = new THREE.OrthographicCamera(X0, X0 + 0.17, Z1, Z1 - 0.21, 0.01, 0.3); cam3.up.set(0, 0, 1);
const bm3 = {}, bmat3 = hex => bm3[hex] || (bm3[hex] = new THREE.MeshBasicMaterial({ color: hex, side: THREE.DoubleSide, clippingPlanes: [clipP] }));
const dbb = deep.map(m => new THREE.Box3().setFromObject(m));
const clones = deep.map(m => { const c = new THREE.Mesh(m.geometry, bmat3(0x888888)); c.matrixAutoUpdate = false; c.matrix.copy(m.matrixWorld); c.frustumCulled = false; sc3.add(c); return c; });
const $$ = id => document.getElementById(id), cv = $$('bxcv'), ctx = cv.getContext('2d'), svg = $$('bxsvg'); cv.width = W; cv.height = H;
const off = document.createElement('canvas'); off.width = W; off.height = H; const octx = off.getContext('2d', { willReadFrequently: true });
const dcv = document.createElement('canvas'); dcv.width = W; dcv.height = H; const dctx = dcv.getContext('2d', { willReadFrequently: true });
const N = W * H, bar = new Uint8Array(N), outM = new Uint8Array(N), dist = new Int16Array(N), q = new Int32Array(N), lobeGrid = new Uint8Array(N);
const LOBES = ['', 'frontal', 'parietal', 'temporal', 'occipital', 'limbic', 'insula'];
const LN = { frontal: 'Frontal lobe', parietal: 'Parietal lobe', temporal: 'Temporal lobe', occipital: 'Occipital lobe', limbic: 'Limbic lobe', insula: 'Insula' };
const rgb = hex => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255], cl = (x, a, b) => Math.min(b, Math.max(a, x));
const px = x => (x - X0) * S, py = z => (Z1 - z) * S;
let mode = 'mri', isOpen = false, saved = null, anchors = [], level = 0.728;
// Real template slices: assets/mni_brain_t1.bin (uint8 volume) and .json (shape, metres per voxel, centre voxel) come from scripts/mni_brain_to_glb.py.
let VOL = null;
if (window.__mniLoaded) { try {
  const rj = await fetch('assets/mni_brain_t1.json'), rb = await fetch('assets/mni_brain_t1.bin'); if (!rj.ok || !rb.ok) throw new Error('template volume not found');
  const meta = await rj.json(), buf = await rb.arrayBuffer(); if (buf.byteLength !== meta.shape[0] * meta.shape[1] * meta.shape[2]) throw new Error('template volume has the wrong size');
  VOL = { ...meta, data: new Uint8Array(buf) }; } catch (er) { VOL = null; } }
if (VOL) {
  const [nx, ny, nz] = VOL.shape, cnt = new Int32Array(nz); for (let i = 0; i < nx * ny; i++) for (let l = 0; l < nz; l++) if (VOL.data[i * nz + l] > 8) cnt[l]++;
  let z0 = 0, z1 = nz - 1; while (z0 < nz - 1 && cnt[z0] < 50) z0++; while (z1 > 0 && cnt[z1] < 50) z1--; VOL.z0 = z0 + 1; VOL.z1 = z1 - 1;
  level = (VOL.centre[2] - VOL.z0) / (VOL.z1 - VOL.z0); $$('bxsl').value = level; $$('bxatlas').style.display = 'none'; const key = document.querySelector('#brainbox .bxkey'); if (key) key.innerHTML = '<span>MNI template T1, 1 mm slices</span><span style="margin-left:auto">Anterior up · patient\'s right on the left</span>'; }
function updateMNI() {
  const h = C0 + (VOL.z0 + level * (VOL.z1 - VOL.z0) - VOL.centre[2]) * VOL.voxel_m[2], dy = h - C0, [nx, ny, nz] = VOL.shape, [cx, cy, cz] = VOL.centre, [kx, ky, kz] = VOL.voxel_m, d = VOL.data;
  if (planes.transverse) { planes.transverse.visible = true; planes.transverse.position.y = h; }
  const l = cz + dy / kz, l0 = Math.floor(l), fl = l - l0, img = ctx.createImageData(W, H), o = img.data, inZ = l0 >= 0 && l0 + 1 < nz;
  for (let y = 0; y < H; y++) {
    const j = cy + (Z1 - (y + 0.5) / S) / ky, j0 = Math.floor(j), fj = j - j0;
    for (let x = 0; x < W; x++) {
      const p = (y * W + x) * 4; let v = 0;
      if (inZ && j0 >= 0 && j0 + 1 < ny) {
        const i = cx - (X0 + (x + 0.5) / S) / kx, i0 = Math.floor(i), fi = i - i0;
        if (i0 >= 0 && i0 + 1 < nx) {
          const at = (a, b) => { const q = (a * ny + b) * nz + l0; return d[q] * (1 - fl) + d[q + 1] * fl; };
          v = (at(i0, j0) * (1 - fi) + at(i0 + 1, j0) * fi) * (1 - fj) + (at(i0, j0 + 1) * (1 - fi) + at(i0 + 1, j0 + 1) * fi) * fj;
        }
      }
      o[p] = o[p + 1] = o[p + 2] = v; o[p + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0); anchors = []; lobeGrid.fill(0);
  svg.innerHTML = '<g font-size="13" font-weight="600" fill="#c8c8c8" text-anchor="middle"><text x="340" y="16">A</text><text x="340" y="466">P</text><text x="162" y="240">R</text><text x="518" y="240">L</text></g>';
  $$('bxclock').textContent = (dy >= 0 ? '+' : '−') + Math.abs(dy * 1000).toFixed(0) + ' mm from mid-brain · level ' + h.toFixed(3) + ' m';
}

function sliceSegs(h) {
  const segs = [];
  cortex.forEach((m, mi) => {
    const g = m.geometry, bb = g.boundingBox, hl = h - m.position.y; if (hl < bb.min.y || hl > bb.max.y) return;
    const ar = g.attributes.position.array, ix = g.index.array, ox = m.position.x;
    for (let t = 0; t < ix.length; t += 3) {
      const a = ix[t] * 3, b = ix[t + 1] * 3, c = ix[t + 2] * 3, ya = ar[a + 1] - hl, yb = ar[b + 1] - hl, yc = ar[c + 1] - hl, sa = ya > 0, sb = yb > 0, sc = yc > 0;
      if (sa === sb && sb === sc) continue;
      let k = 0, x1 = 0, z1 = 0, x2 = 0, z2 = 0, f, x, z;
      if (sa !== sb) { f = ya / (ya - yb); x = ar[a] + (ar[b] - ar[a]) * f; z = ar[a + 2] + (ar[b + 2] - ar[a + 2]) * f; x1 = x; z1 = z; k = 1; }
      if (sb !== sc) { f = yb / (yb - yc); x = ar[b] + (ar[c] - ar[b]) * f; z = ar[b + 2] + (ar[c + 2] - ar[b + 2]) * f; if (k) { x2 = x; z2 = z; k = 2; } else { x1 = x; z1 = z; k = 1; } }
      if (k < 2 && sc !== sa) { f = yc / (yc - ya); x = ar[c] + (ar[a] - ar[c]) * f; z = ar[c + 2] + (ar[a + 2] - ar[c + 2]) * f; x2 = x; z2 = z; k = 2; }
      if (k === 2) segs.push(mi, x1 + ox, z1, x2 + ox, z2);
    }
  });
  return segs;
}

function update() {
  if (VOL) return updateMNI();
  const h = 1.5 + level * 0.213, dy = h - C0, segs = sliceSegs(h);
  if (planes.transverse) { planes.transverse.visible = true; planes.transverse.position.y = h; }
  octx.clearRect(0, 0, W, H); octx.strokeStyle = '#000'; octx.lineWidth = 2.4; octx.lineCap = 'round'; octx.beginPath();
  for (let i = 0; i < segs.length; i += 5) { octx.moveTo(px(segs[i + 1]), py(segs[i + 2])); octx.lineTo(px(segs[i + 3]), py(segs[i + 4])); }
  if (Math.abs(dy) < 0.026) { const zh = 0.05 * Math.sqrt(1 - (dy / 0.026) ** 2); for (const sx of [-0.0012, 0.0012]) { octx.moveTo(px(sx), py(-zh)); octx.lineTo(px(sx), py(zh)); } }
  octx.stroke();
  const im = octx.getImageData(0, 0, W, H).data; for (let i = 0; i < N; i++) bar[i] = im[i * 4 + 3] > 60 ? 1 : 0;
  outM.fill(0); let qh = 0, qt = 0; const push = i => { if (!bar[i] && !outM[i]) { outM[i] = 1; q[qt++] = i; } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); } for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (qh < qt) { const i = q[qh++], x = i % W; if (x > 0) push(i - 1); if (x < W - 1) push(i + 1); if (i >= W) push(i - W); if (i < N - W) push(i + W); }
  dist.fill(-1); qh = 0; qt = 0;
  for (let i = 0; i < N; i++) if (outM[i]) { const x = i % W; if ((x > 0 && !outM[i - 1]) || (x < W - 1 && !outM[i + 1]) || (i >= W && !outM[i - W]) || (i < N - W && !outM[i + W])) { dist[i] = 0; q[qt++] = i; } }
  const lim = 9, nb = (i, d) => { if (!outM[i] && dist[i] < 0) { dist[i] = d; q[qt++] = i; } };
  while (qh < qt) { const i = q[qh++], d = dist[i]; if (d >= lim) continue; const x = i % W; if (x > 0) nb(i - 1, d + 1); if (x < W - 1) nb(i + 1, d + 1); if (i >= W) nb(i - W, d + 1); if (i < N - W) nb(i + W, d + 1); }
  clipP.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, h, 0)); cam3.position.set(0, h - 0.05, 0); cam3.lookAt(0, h, 0); cam3.updateMatrixWorld();
  deep.forEach((m, i) => { const c = clones[i], bb = dbb[i]; c.visible = bb.min.y <= h && bb.max.y >= h; c.material = bmat3(mode === 'mri' ? inten(m.name) : m.material.color.getHex()); });
  r3.render(sc3, cam3); dctx.clearRect(0, 0, W, H); dctx.drawImage(r3c, 0, 0); const dd = dctx.getImageData(0, 0, W, H).data;
  let x0 = W, x1 = 0, y0 = H, y1 = 0;
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) { const i = y * W + x; if (!outM[i] || dd[i * 4 + 3] > 128) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
  const has = x1 > x0, small = (x1 - x0) < 0.1 * S, ccx = small ? px(0) : (x0 + x1) / 2, ccy = small ? py(-0.005) : (y0 + y1) / 2, rx = small ? 0.064 * S : (x1 - x0) / 2 * 1.04 + 6, ry = small ? 0.086 * S : (y1 - y0) / 2 * 1.04 + 6;
  const ell = (x, y, ex) => ((x - ccx) / (rx + ex)) ** 2 + ((y - ccy) / (ry + ex)) ** 2;
  const rowLobe = new Uint8Array(H), v = cl(dy / B, -1, 1);
  for (let y = 0; y < H; y++) { const z = Z1 - (y + 0.5) / S; rowLobe[y] = LOBES.indexOf(BRN.classify(0, v, cl(z / CL, -1, 1))[1]); }
  const img = ctx.createImageData(W, H), o = img.data, mri = mode === 'mri', cs = new Float64Array(14), cn = new Float64Array(7);
  const lc = LOBES.map(l => l ? rgb(BRN.lobeCol[l]) : [0, 0, 0]);
  for (let y = 0; y < H; y++) {
    const z = Z1 - (y + 0.5) / S, w = cl(z / CL, -1, 1), vl = -0.12 + (0.42 - w) * 0.22;
    for (let x = 0; x < W; x++) {
      const i = y * W + x, p = i * 4, xm = X0 + (x + 0.5) / S, isDeep = dd[p + 3] > 128; let r, g, b; lobeGrid[i] = 0;
      if (!outM[i]) {
        let L = rowLobe[y]; const ax = Math.abs(xm);
        if (ax > 0.049 && ax < 0.062 && w > -0.1 && w < 0.4 && Math.abs(v - vl) < 0.22) L = 6;
        else if (ax < 0.014 && (z / 0.058) ** 2 + (dy / 0.034) ** 2 < 1) L = 5;
        const rib = dist[i] >= 0 && dist[i] <= 8;
        if (!isDeep) { lobeGrid[i] = L; cs[L * 2] += x; cs[L * 2 + 1] += y; cn[L]++; }
        if (mri) { const t = rib ? 0x7a : 0xd2, c = lc[L], a = isDeep ? 0 : 0.38; r = t * (1 - a) + c[0] * a; g = t * (1 - a) + c[1] * a; b = t * (1 - a) + c[2] * a; }
        else { const c = lc[L], k = rib ? 0 : 0.55; r = c[0] + (255 - c[0]) * k; g = c[1] + (255 - c[1]) * k; b = c[2] + (255 - c[2]) * k; }
      } else if (has && ell(x, y, 0) <= 1) { if (mri) r = g = b = 0x1c; else { r = 0xf6; g = 0xf3; b = 0xee; } }
      else if (has && ell(x, y, 16) <= 1) { if (mri) r = g = b = 0xe6; else { r = 0xe8; g = 0xdc; b = 0xc0; } }
      else if (has && mri && ell(x, y, 30) <= 1) r = g = b = 0x66;
      else if (mri) r = g = b = 0; else { r = 0xf6; g = 0xf3; b = 0xee; }
      if (isDeep) { r = dd[p]; g = dd[p + 1]; b = dd[p + 2]; }
      o[p] = r; o[p + 1] = g; o[p + 2] = b; o[p + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  if (!mri) { ctx.strokeStyle = 'rgba(90,60,52,0.55)'; ctx.lineWidth = 1; ctx.beginPath(); for (let i = 0; i < segs.length; i += 5) { ctx.moveTo(px(segs[i + 1]), py(segs[i + 2])); ctx.lineTo(px(segs[i + 3]), py(segs[i + 4])); } ctx.stroke(); }
  const left = [], right = [], per = new Map();
  for (let i = 0; i < segs.length; i += 5) { const mi = segs[i], mx = (segs[i + 1] + segs[i + 3]) / 2, mz = (segs[i + 2] + segs[i + 4]) / 2, e = per.get(mi) || { n: 0, x: 0, z: 0 }; e.n++; if (e.n === 1 || Math.abs(mx) > Math.abs(e.x)) { e.x = mx; e.z = mz; } per.set(mi, e); }
  const seen = new Set(), lobeOf = m => BRN.lobeCol[(m.userData.label.match(/\((\w+) lobe/) || [])[1]];
  [...per.entries()].sort((a, b) => b[1].n - a[1].n).forEach(([mi, e]) => {
    const m = cortex[mi], nme = m.userData.label.split(' (')[0], side = m.userData.side; if (e.n < 8 || seen.has(nme + side)) return; seen.add(nme + side);
    if (side === 'R' && Math.abs(e.x) > 0.02 && left.length < 11) left.push({ name: nme, x: px(e.x), y: py(e.z), col: lobeOf(m) });
    else if (side === 'L' && Math.abs(e.x) < 0.02 && right.length < 4) right.push({ name: nme, x: px(e.x), y: py(e.z), col: lobeOf(m) });
  });
  const dseen = new Set(), pos = new THREE.Vector3();
  deep.forEach((m, i) => { if (!clones[i].visible || m.userData.side === 'R') return; const nme = m.userData.label.split(' (')[0]; if (dseen.has(nme)) return;
    const pa = m.geometry.attributes.position; let sx = 0, sz = 0, n = 0; for (let k = 0; k < pa.count; k++) { pos.fromBufferAttribute(pa, k).applyMatrix4(m.matrixWorld); if (Math.abs(pos.y - h) < 0.002) { sx += pos.x; sz += pos.z; n++; } }
    if (n < 3) return; dseen.add(nme); right.push({ name: nme, x: px(sx / n), y: py(sz / n), col: m.material.color.getHex() }); });
  for (let l = 1; l < 7; l++) if (cn[l] > 500) right.push({ name: LN[LOBES[l]], x: cs[l * 2] / cn[l], y: cs[l * 2 + 1] / cn[l], col: BRN.lobeCol[LOBES[l]], lobe: true });
  const place = (arr, cap) => { arr = arr.slice(0, cap).sort((a, b) => a.y - b.y); let prev = 8; arr.forEach(a => { a.ly = Math.max(a.y * 470 / H, prev + 19); prev = a.ly; }); for (let i = arr.length - 1; i >= 0; i--) { const mx = i === arr.length - 1 ? 462 : arr[i + 1].ly - 19; if (arr[i].ly > mx) arr[i].ly = mx; } return arr; };
  const L2 = place(left, 11), R2 = place(right, 15), hex = c => '#' + (c || 0xcccccc).toString(16).padStart(6, '0'); anchors = [];
  let s = '';
  L2.forEach(a => { const ax = 150 + a.x * 380 / W, ay = a.y * 470 / H; s += '<line x1="' + ax + '" y1="' + ay + '" x2="144" y2="' + a.ly + '" stroke="currentColor" stroke-width="1" opacity=".55"/><circle cx="' + ax + '" cy="' + ay + '" r="3" fill="' + hex(a.col) + '" stroke="currentColor"/><text x="140" y="' + (a.ly + 4) + '" text-anchor="end">' + a.name + '</text>'; anchors.push({ n: a.name, x: ax - 150, y: ay }); });
  R2.forEach(a => { const ax = 150 + a.x * 380 / W, ay = a.y * 470 / H; s += '<line x1="' + ax + '" y1="' + ay + '" x2="536" y2="' + a.ly + '" stroke="currentColor" stroke-width="1" opacity=".55"/><circle cx="' + ax + '" cy="' + ay + '" r="3" fill="' + hex(a.col) + '" stroke="currentColor"/><text x="540" y="' + (a.ly + 4) + '"' + (a.lobe ? ' font-weight="600"' : '') + '>' + a.name + '</text>'; anchors.push({ n: a.name, x: ax - 150, y: ay }); });
  svg.innerHTML = s;
  $$('bxclock').textContent = (dy >= 0 ? '+' : '−') + Math.abs(dy * 1000).toFixed(0) + ' mm from mid-brain · level ' + h.toFixed(3) + ' m';
}
let raf = 0; const sched = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; update(); }); };
$$('bxsl').addEventListener('input', e => { level = +e.target.value; sched(); });
const setMode = m => { mode = m; $$('bxmri').classList.toggle('on', m === 'mri'); $$('bxatlas').classList.toggle('on', m === 'atlas'); sched(); };
$$('bxmri').onclick = () => setMode('mri'); $$('bxatlas').onclick = () => setMode('atlas');
function openBox() {
  if (isOpen) return; isOpen = true; saved = { so: sliceOpen, py: planes.transverse.position.y };
  sliceOpen = false; $$('slicebox').style.display = 'none'; $$('sliceopen').style.display = 'none'; Object.values(planes).forEach(p => { p.visible = false; });
  $$('brainbox').style.display = 'block'; $$('bxsl').value = level; update();
}
function closeBox() {
  if (!isOpen) return; isOpen = false; $$('brainbox').style.display = 'none'; planes.transverse.visible = false; planes.transverse.position.y = saved.py;
  sliceOpen = saved.so; $$(sliceOpen ? 'slicebox' : 'sliceopen').style.display = 'block'; if (sliceOpen) renderSlice();
}
$$('axialopen').onclick = openBox; $$('bxclose').onclick = closeBox;
cv.addEventListener('pointermove', e => {
  const rc = cv.getBoundingClientRect(), cx = e.clientX - rc.left, cy = e.clientY - rc.top; let best = null, bd = 14;
  anchors.forEach(a => { const d = Math.hypot(a.x - cx, a.y - cy); if (d < bd) { bd = d; best = a.n; } });
  if (!best) { const gx = Math.floor(cx / 380 * W), gy = Math.floor(cy / 470 * H), L = (gx >= 0 && gx < W && gy >= 0 && gy < H) ? lobeGrid[gy * W + gx] : 0; if (L) best = LN[LOBES[L]]; }
  if (best) { tip.textContent = best; tip.style.display = 'block'; tip.style.left = e.clientX + 14 + 'px'; tip.style.top = e.clientY + 14 + 'px'; } else tip.style.display = 'none';
});
cv.addEventListener('pointerleave', () => { tip.style.display = 'none'; });
}

// ───────── anatomical directions overlay ─────────
{
  const DG = new THREE.Group(); DG.name = 'direction_arrows'; DG.visible = false; stage._scene.add(DG);
  const AC = 0x3f6489;
  const label = (txt, pos) => { const c = document.createElement('canvas'), x = c.getContext('2d'), f = '600 44px "Barlow Condensed", sans-serif'; x.font = f;
    const w = Math.ceil(x.measureText(txt).width) + 28, hh = 64; c.width = w; c.height = hh; x.font = f;
    x.fillStyle = 'rgba(242,242,243,0.94)'; x.fillRect(0, 0, w, hh); x.strokeStyle = '#5980a6'; x.lineWidth = 2; x.strokeRect(1, 1, w - 2, hh - 2);
    x.fillStyle = '#1d1f20'; x.textBaseline = 'middle'; x.fillText(txt, 14, hh / 2 + 2);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); s.scale.set(0.034 * w / hh, 0.034, 1); s.position.copy(pos); s.renderOrder = 1001; DG.add(s); };
  const AM = new THREE.MeshBasicMaterial({ color: AC, depthTest: false, transparent: true });
  const arrow = (o, d, len, txt, lo = 0.03) => { const D = V(...d).normalize(), O = V(...o), a = new THREE.Group(), hl = 0.035, q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), D);
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, len - hl, 12), AM); sh.position.copy(O).addScaledVector(D, (len - hl) / 2); sh.quaternion.copy(q);
    const hd = new THREE.Mesh(new THREE.ConeGeometry(0.014, hl, 16), AM); hd.position.copy(O).addScaledVector(D, len - hl / 2); hd.quaternion.copy(q);
    [sh, hd].forEach(m => { m.renderOrder = 1000; a.add(m); }); DG.add(a);
    label(txt, O.clone().addScaledVector(D, len + lo)); };
  const pair = (mid, d, len, plus, minus, lo) => { arrow(mid, d, len, plus, lo); arrow(mid, d.map(c => -c), len, minus, lo); };
  const build = () => {
    pair([-0.62, 0.95, 0], [0, 1, 0], 0.72, 'Superior · Cranial', 'Inferior · Caudal', 0.04);
    pair([0, 1.2, 0], [0, 0, 1], 0.42, 'Anterior · Ventral', 'Posterior · Dorsal', 0.05);
    pair([0.28, 0.55, 0.12], [1, 0, 0], 0.15, 'Lateral', 'Medial', 0.05);
    pair([0.31, 1.08, 0.05], [0.09, -0.996, 0], 0.22, 'Distal', 'Proximal', 0.025);
    { const ml = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 1.85, 8), new THREE.MeshBasicMaterial({ color: 0x1d1f20, depthTest: false, transparent: true, opacity: 0.85 }));
      model.updateMatrixWorld(true); const mo = new THREE.Vector3().setFromMatrixPosition(model.matrixWorld); ml.position.set(mo.x, 0.93 + mo.y, mo.z); ml.renderOrder = 999; DG.add(ml); label('Midline (median axis)', V(mo.x, 1.9 + mo.y, mo.z)); }
    pair([-0.13, 0.95, 0.2], [0, 0, 1], 0.12, 'Superficial', 'Deep', 0.04);
    arrow([-0.37, 0.86, 0.06], [-0.12, 0.99, 0], 0.42, 'Afferent (toward CNS)', 0.03);
    arrow([-0.44, 1.28, 0.06], [-0.12, -0.99, 0], 0.42, 'Efferent (away from CNS)', 0.03);
  };
  let built = false, saved = null;
  $('dirshow').addEventListener('change', async e => { const on = e.target.checked, cam = stage._camera, ctl = stage._controls;
    if (on && !built) { try { await document.fonts.load('600 44px "Barlow Condensed"'); } catch (er) { } build(); built = true; }
    DG.visible = on; $('dirlist').style.display = on ? 'block' : 'none';
    if (on) { saved = { p: cam.position.clone(), t: ctl.target.clone() }; cam.position.set(1.35, 1.25, 2.1); ctl.target.set(0, 0.92, 0); ctl.update(); }
    else if (saved) { cam.position.copy(saved.p); ctl.target.copy(saved.t); ctl.update(); saved = null; }
  });
}
