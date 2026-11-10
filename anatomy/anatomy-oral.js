// Oral cavity and tonsils, rebuilt: lips and the vestibule of the mouth, the hard and soft palate with their muscles, the faucial arches with a crypted
// palatine tonsil in each fossa, the rest of Waldeyer's ring (pharyngeal tonsil, tubal tonsils), the salivary glands and the floor of the mouth, and
// the tongue's intrinsic muscles and folds. The old placeholder palate, arches and tonsils are removed first, so each label appears once.
// Runs from anatomy-part2.js after the pharynx, larynx and tongue exist. Coordinates are metres, +x is the figure's left, +y up, +z forward.
import { THREE, V, M, belly, mm, tube } from './anatomy-part1.js';
import { DS, sd, tg, ss, ga, drop, find, verts, cutOut, PMat, TRN, merge, mirror, loft, curve, ridge, grid, blob, place, add } from './anatomy-fit.js';

const DG = 'digestive', MS = 'muscular', SIDES = [-1, 1], OCC = 1.562, PI = Math.PI;
const P = (s, p) => [s * p[0], p[1], p[2]];

export function buildOral() {
  // ───────── remove the old placeholders ─────────
  drop(DG, /^(Soft palate|Uvula|Palatoglossal arch|Palatopharyngeal arch|Palatine tonsil|Hard palate mucosa|Transverse palatine folds|Pharyngeal tonsil|Torus tubarius)/);
  drop(MS, /^(Levator veli palatini|Palatopharyngeus)/);

  // the mucosa palette
  const mc = {
    palate: PMat('palatal_mucosa', 0xd98a88, 0.3, { cc: 0.6 }), pale: PMat('mucosa_pale', 0xe8b0aa, 0.35, { cc: 0.6 }), raphe: PMat('palatine_raphe', 0xe9b9b2, 0.4),
    soft: PMat('soft_palate', 0xffffff, 0.3, { vertexColors: true, cc: 0.6 }), uvula: PMat('uvula', 0xc9605f, 0.3, { cc: 0.6 }), arch: PMat('faucial_arch', 0xcc5a5f, 0.28, { cc: 0.6, sc: 0x7b1e1e }),
    tonsil: PMat('palatine_tonsil', 0xb8686f, 0.4, { cc: 0.3, sc: 0x7a2a30 }), crypt: M('tonsillar_crypt', 0x5e2229, 0.7, { emissive: 0x2a0d12 }), cap: PMat('tonsillar_capsule', 0xe9d6cf, 0.5, { cc: 0.2, ...TRN(0.35) }),
    lymph: PMat('lymphoid_pad', 0xd29aa2, 0.45, { cc: 0.3 }), dark: M('mucosal_pit', 0xa4525a, 0.6, { side: DS, emissive: 0x4a1a22 }), gum: PMat('alveolar_mucosa', 0xc9565c, 0.3, { cc: 0.7, sc: 0x7b1e1e }),
    wall: PMat('labial_buccal_mucosa', 0xe29a95, 0.35, { cc: 0.5, ...TRN(0.42) }), lip: PMat('vermilion', 0xc9565c, 0.28, { cc: 0.8, sc: 0x9e2a32 }),
    gland: M('salivary_gland', 0xe5c497, 0.55, { side: DS }), sub: M('submandibular_gland', 0xe0b985, 0.55, { side: DS }), duct: M('salivary_duct', 0xf0e2a8, 0.4),
    floor: PMat('floor_of_mouth_mucosa', 0xd3727a, 0.28, { cc: 0.7 }), muscle: mm.mid, deep: mm.deep, ten: mm.ten, fold: PMat('mucosal_fold', 0xd07a80, 0.3, { cc: 0.6 }),
  };

  // ───────── the oropharynx opens at the faucial isthmus ─────────
  // the pharynx wall was one closed tube; the front is cut away between the palatoglossal arches so the mouth opens into it and the tongue root forms its front wall
  { const op = find(DG, /^Oropharynx/), yT = 1.5750, wA = 0.0105, k = 0.52;   // half-width 10.5 mm under the soft palate, widening downward along the arches
    if (op) cutOut(op, [{ n: V(0, 0, -1), d: -0.0 }, { n: V(0, 1, 0), d: 1.5695 }, { n: V(0, -1, 0), d: -1.5465 }, { n: V(1, 0, k), d: wA + k * yT }, { n: V(-1, 0, k), d: wA + k * yT }]); }

  // ───────── the tongue frame (same curve as the tongue mesh in anatomy-part1.js) ─────────
  const TC = new THREE.CatmullRomCurve3([[0, 1.5565, 0.047], [0, 1.5652, 0.034], [0, 1.5668, 0.022], [0, 1.5608, 0.014], [0, 1.5505, 0.0165]].map(p => V(...p))), X = V(1, 0, 0);
  const uS = th => 0.62 - 0.13 * Math.abs(Math.sin(th));
  const tS = (u, th, k = 1) => { const p = TC.getPointAt(u), t = TC.getTangentAt(u), I = new THREE.Vector3().crossVectors(X, t).normalize(), B = new THREE.Vector3().crossVectors(t, I).normalize();
    const w = 0.0205 * Math.sqrt(ss(0, 0.24, u)) * (1 - 0.15 * ss(0.8, 1, u)), h = 0.0085 * Math.sqrt(ss(0, 0.18, u)), c = Math.cos(th), tw = Math.atan2(Math.sin(th), c);
    const r = k * (1 - 0.09 * ga(tw, 0, 0.12) * (u < 0.6 ? 1 : 0) - 0.07 * ga(u, uS(th), 0.012) * Math.max(0, c));
    return p.clone().addScaledVector(I, c * h * (c < 0 ? 0.6 : 1) * r).addScaledVector(B, Math.sin(th) * w * r); };
  const tongueLine = (u0, u1, th, k = 1, n = 14) => Array.from({ length: n + 1 }, (_, i) => tS(u0 + ((u1 - u0) * i) / n, th, k));
  const tongueArc = (u, t0, t1, k = 1, n = 14) => Array.from({ length: n + 1 }, (_, i) => tS(u, t0 + ((t1 - t0) * i) / n, k));

  // ───────── hard palate: arched mucosa with a median raphe, incisive papilla and rugae ─────────
  const archX = z => { if (z >= 0.057) return 0; if (z < 0.017) return 0.0285 - 0.0010 * Math.min(1, (0.017 - z) / 0.007); const s = Math.pow((0.057 - z) / 0.04, 1 / 1.6); return 0.0285 * Math.sin((s * PI) / 2); };
  const wP = z => Math.max(0.0015, archX(z) - 0.0030);
  const roof = 1.5751, vault = (x, z) => roof - 0.0058 * Math.pow(Math.min(1, Math.abs(x) / wP(z)), 2.2);
  { const g = grid(48, 28, (u, v) => { const z = 0.0555 - 0.0455 * u, w = wP(z), x = (2 * v - 1) * w; return V(x, vault(x, z), z); });
    add(DG, 'hard_palate_mucosa', g, mc.palate, 'Hard palate mucosa');
    const rp = []; for (let k = 0; k <= 16; k++) { const z = 0.0505 - 0.0388 * k / 16; rp.push([0, vault(0, z) + 0.0002, z]); }
    add(DG, 'median_palatine_raphe', ridge(rp, u => 0.00045 * (0.7 + 0.3 * Math.sin(PI * u)), { flat: 0.6 }), mc.raphe, 'Median palatine raphe');
    add(DG, 'incisive_papilla', place(blob(0.0015, 0.0007, 0.0021, 0.04, 2, 20, 14), 0, vault(0, 0.0512) + 0.0002, 0.0512), mc.pale, 'Incisive papilla');
    const rg = []; [0.0475, 0.0432, 0.0388, 0.0344].forEach((z0, k) => SIDES.forEach(s => { const pts = []; for (let j = 0; j <= 9; j++) { const x = 0.0018 + (0.0098 - k * 0.0006) * j / 9, z = z0 + 0.0014 * (j / 9) - 0.0007 * Math.sin(PI * j / 9) + 0.0003 * Math.sin(1.3 * j + k);
        pts.push([s * x, vault(x, z) + 0.0001, z]); } rg.push(ridge(pts, u => 0.0006 * (0.55 + 0.45 * Math.sin(PI * (0.1 + 0.8 * u))), { flat: 0.7, nv: 8 })); }));
    add(DG, 'palatine_rugae', merge(rg), mc.pale, 'Transverse palatine folds (rugae)'); }

  // ───────── soft palate: a muscular curtain from the hard palate to the uvula ─────────
  const spPath = curve([[0, 1.5766, 0.0108], [0, 1.5752, 0.0055], [0, 1.5718, 0.0010], [0, 1.5675, -0.0028], [0, 1.5655, -0.0045]]);
  { const e = u => Math.sqrt(Math.max(0, 1 - Math.pow(u, 10)));
    add(DG, 'soft_palate', loft(spPath, u => [(0.0190 - 0.0085 * u) * e(u), 0.0028 * (1 - 0.55 * u) * e(u)], { nu: 36, nv: 28, col: (u, a) => (Math.sin(a) > 0 ? (u < 0.3 ? 0xdd8a88 : 0xc9605f) : 0xdba3a0) }), mc.soft, 'Soft palate (velum)');
    // the aponeurosis: the flat tendon sheet that forms the front third of the velum, on its upper face
    add(DG, 'palatine_aponeurosis', grid(10, 14, (u, v) => { const p = spPath.getPointAt(0.30 * u), x = (2 * v - 1) * (0.0188 - 0.0085 * 0.30 * u) * 0.92; return V(x, p.y + 0.0027 * (1 - 0.55 * 0.3 * u) + 0.0003, p.z); }), M('palatine_aponeurosis', 0xece7dc, 0.5, { side: DS, ...TRN(0.8) }), 'Palatine aponeurosis', 2);
    // the uvula, hanging from the middle of the free edge
    const uv = curve([[0, 1.5664, -0.0038], [0, 1.5640, -0.0052], [0, 1.5600, -0.0068], [0, 1.5566, -0.0076]]);
    add(DG, 'uvula', loft(uv, u => { const k = Math.sqrt(Math.max(0, 1 - Math.pow(u, 6))); return [(0.0032 - 0.0016 * u) * k, (0.0027 - 0.0012 * u) * k]; }, { nu: 16, nv: 16, side: V(1, 0, 0) }), mc.uvula, 'Uvula'); }
  // musculus uvulae: two strands along the upper face of the midline, ending inside the uvula
  { const mu = []; SIDES.forEach(s => mu.push(ridge([[s * 0.0009, 1.5778, 0.0105], [s * 0.0009, 1.5762, 0.0050], [s * 0.0008, 1.5728, 0.0008], [s * 0.0007, 1.5680, -0.0030], [s * 0.0005, 1.5640, -0.0053]], u => 0.0006 * Math.sin(PI * (0.1 + 0.8 * u)) + 0.0001)));
    add(MS, 'musculus_uvulae', merge(mu), mc.muscle, 'Musculus uvulae'); }

  // ───────── muscles of the palate and pharyngeal isthmus ─────────
  SIDES.forEach(s => { const lb = t => t + tg(s), mu = (l, pts, r, o = {}) => belly(lb(l), pts.map(p => P(s, p)), r, { ...o, up: o.up && [s * o.up[0], o.up[1], o.up[2]] });
    mu('Levator veli palatini', [[0.0305, 1.5925, -0.0040], [0.0235, 1.5880, -0.0030], [0.0160, 1.5800, -0.0015], [0.0095, 1.5742, 0.0005], [0.0020, 1.5739, 0.0003]], 0.0017, { mt: mc.deep, peak: 0.4 });
    mu('Tensor veli palatini', [[0.0150, 1.5898, 0.0070], [0.0138, 1.5840, 0.0080], [0.0128, 1.5792, 0.0084]], 0.0013, { mt: mc.deep, peak: 0.45 });
    tube(MS, 'tensor_veli_palatini_tendon_' + sd(s), [[0.0128, 1.5788, 0.0083], [0.0112, 1.5770, 0.0082], [0.0098, 1.5762, 0.0086], [0.0075, 1.5762, 0.0094], [0.0035, 1.5764, 0.0100]].map(p => P(s, p)), 0.0005, mc.ten, { label: lb('Tensor veli palatini, tendon (hooks round the pterygoid hamulus)') });
    mu('Palatoglossus', [[0.0085, 1.5740, 0.0075], [0.0125, 1.5718, 0.0088], [0.0158, 1.5675, 0.0098], [0.0185, 1.5620, 0.0112], [0.0200, 1.5578, 0.0130]], 0.0012, { mt: mc.muscle, peak: 0.4 });
    mu('Palatopharyngeus', [[0.0085, 1.5742, 0.0060], [0.0110, 1.5715, 0.0000], [0.0138, 1.5640, -0.0045], [0.0145, 1.5540, -0.0092], [0.0138, 1.5420, -0.0130], [0.0128, 1.5340, -0.0155]], 0.0019, { mt: mc.muscle, w: 1.5, d: 0.5, up: [1, 0, 0], peak: 0.35 });
    mu('Salpingopharyngeus', [[0.0138, 1.5810, -0.0010], [0.0142, 1.5700, -0.0075], [0.0140, 1.5600, -0.0110]], 0.0009, { mt: mc.muscle });
    // pterygomandibular raphe: the tendon between the hamulus and the mandible that joins buccinator to the superior pharyngeal constrictor
    tube(MS, 'pterygomandibular_raphe_' + sd(s), [[0.0112, 1.5775, 0.0084], [0.0185, 1.5668, 0.0100], [0.0262, 1.5580, 0.0112]].map(p => P(s, p)), 0.0006, mc.ten, { label: lb('Pterygomandibular raphe') });
  });

  // ───────── the faucial arches, the tonsil and its fossa ─────────
  SIDES.forEach(s => { const lb = t => t + tg(s);
    // palatoglossal arch (front pillar) and palatopharyngeal arch (back pillar): mucosal folds that cover the two muscles
    add(DG, 'palatoglossal_arch_' + sd(s), mirror(ridge([[0.0112, 1.5748, 0.0090], [0.0142, 1.5718, 0.0095], [0.0168, 1.5668, 0.0102], [0.0192, 1.5610, 0.0116], [0.0203, 1.5565, 0.0132]], u => 0.0011 + 0.0008 * Math.sqrt(Math.sin(PI * (0.04 + 0.92 * u))), { flat: 0.8 }), s), mc.arch, lb('Palatoglossal arch (anterior pillar of the fauces)'));
    add(DG, 'palatopharyngeal_arch_' + sd(s), mirror(ridge([[0.0100, 1.5738, -0.0008], [0.0128, 1.5690, -0.0030], [0.0148, 1.5610, -0.0050], [0.0152, 1.5520, -0.0085], [0.0148, 1.5430, -0.0118]], u => 0.0013 + 0.0009 * Math.sqrt(Math.sin(PI * (0.04 + 0.92 * u))), { flat: 0.8 }), s), mc.arch, lb('Palatopharyngeal arch (posterior pillar of the fauces)'));
    // palatine tonsil: a lumpy almond lying in the tonsillar fossa between the pillars, its medial face pitted with crypts
    const C = [0.0118, 1.5600, 0.0018], R = [0.0043, 0.0100, 0.0066];
    add(DG, 'palatine_tonsil_' + sd(s), mirror(place(blob(R[0], R[1], R[2], 0.16, 3 + s, 44, 30), ...C), s), mc.tonsil, lb('Palatine tonsil'));
    const cr = []; for (let k = 0; k < 15; k++) { const y = -0.78 + 1.56 * ((k * 0.618) % 1), a = (-0.9 + 1.8 * ((k * 0.377 + 0.11) % 1)), r = Math.sqrt(Math.max(0.05, 1 - y * y)), d = V(-Math.cos(a) * r, y, Math.sin(a) * r).normalize();
      cr.push(place(new THREE.SphereGeometry(0.00052 + 0.00018 * (k % 3), 10, 8), C[0] + d.x * R[0] * 0.97, C[1] + d.y * R[1] * 0.97, C[2] + d.z * R[2] * 0.97)); }
    add(DG, 'tonsillar_crypts_' + sd(s), mirror(merge(cr), s), mc.crypt, lb('Tonsillar crypts (deep clefts in the medial surface)'));
    // the capsule and fossa: the thin fibrous shell on the lateral side that lies against the superior pharyngeal constrictor
    const cap = new THREE.SphereGeometry(1, 28, 18, PI / 2, PI); cap.scale(R[0] * 1.10, R[1] * 1.06, R[2] * 1.08); cap.translate(...C);
    add(DG, 'tonsillar_capsule_' + sd(s), mirror(cap, s), mc.cap, lb('Tonsillar capsule and fossa (the bed of the tonsil)'), 2);
    add(DG, 'supratonsillar_fossa_' + sd(s), mirror(place(blob(0.0009, 0.0034, 0.0036, 0.05, 4, 16, 12), 0.0110, 1.5703, 0.0030), s), mc.dark, lb('Supratonsillar fossa (intratonsillar cleft)'));
    const tri = (name, label, pts) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3)); g.setIndex([0, 1, 2]); g.computeVertexNormals(); add(DG, name + '_' + sd(s), mirror(g, s), mc.fold, label); };
    tri('triangular_fold', lb('Triangular fold (plica triangularis)'), [[0.0185, 1.5600, 0.0112], [0.0128, 1.5524, 0.0074], [0.0183, 1.5532, 0.0108]]);
    tri('semilunar_fold', lb('Semilunar fold (plica semilunaris)'), [[0.0120, 1.5704, 0.0092], [0.0158, 1.5690, 0.0098], [0.0128, 1.5655, 0.0072]]);
  });

  // ───────── nasopharynx: pharyngeal tonsil, tubal opening and tonsils, recesses ─────────
  { const wz = -0.0140, yb = 1.5688, ridgeAt = (x, y) => Math.cos(9 * Math.atan2(x, Math.max(0.0008, y - yb)));
    const g = grid(26, 30, (u, v) => { const y = 1.5700 + 0.0098 * u, x = (2 * v - 1) * 0.0078, m = Math.pow(Math.max(0, 1 - (x / 0.0078) ** 2), 0.6) * Math.pow(Math.max(0, 1 - ((y - 1.5750) / 0.0055) ** 2), 0.6);
      return V(x, y, wz - 0.0030 * m * (0.74 + 0.26 * ridgeAt(x, y))); });
    add(DG, 'pharyngeal_tonsil', g, mc.lymph, 'Pharyngeal tonsil (adenoid; in the roof and back wall of the nasopharynx)');
    add(DG, 'pharyngeal_bursa', place(blob(0.0005, 0.0028, 0.0012, 0.03, 5, 14, 10), 0, 1.5716, wz - 0.0002), mc.dark, 'Pharyngeal bursa (midline pit in the adenoid)'); }
  SIDES.forEach(s => { const lb = t => t + tg(s);
    add(DG, 'torus_tubarius_' + sd(s), mirror(ridge([[0.0150, 1.5895, 0.0048], [0.0143, 1.5860, 0.0030], [0.0139, 1.5830, 0.0004], [0.0138, 1.5812, -0.0014]], u => 0.0021 * (0.55 + 0.45 * Math.sin(PI * (0.1 + 0.8 * u))), { flat: 0.9 }), s), mc.arch, lb('Torus tubarius (cartilage cushion of the auditory tube)'));
    add(DG, 'tubal_opening_' + sd(s), mirror(place(blob(0.0006, 0.0030, 0.0019, 0.03, 6, 14, 10), 0.0140, 1.5858, 0.0036), s), mc.dark, lb('Pharyngeal opening of the auditory tube'));
    add(DG, 'tubal_tonsil_' + sd(s), mirror(place(blob(0.0017, 0.0028, 0.0021, 0.15, 7 + s, 20, 14), 0.0137, 1.5840, -0.0044), s), mc.lymph, lb('Tubal tonsil (lymphoid tissue behind the torus tubarius)'));
    add(DG, 'pharyngeal_recess_' + sd(s), mirror(place(blob(0.0011, 0.0030, 0.0030, 0.03, 8, 14, 10), 0.0150, 1.5842, -0.0090), s), mc.dark, lb('Pharyngeal recess (fossa of Rosenmüller)'));
    add(DG, 'salpingopharyngeal_fold_' + sd(s), mirror(ridge([[0.0139, 1.5810, -0.0010], [0.0142, 1.5700, -0.0072], [0.0141, 1.5600, -0.0108]], u => 0.0009 * (0.5 + 0.5 * Math.sin(PI * (0.1 + 0.8 * u)))), s), mc.arch, lb('Salpingopharyngeal fold')); });

  // the old orbicularis oris ring sat 5 mm below the incisal edges; raise it to the mouth slit
  { const oo = find(MS, /^Orbicularis oris/); if (oo) oo.position.y += 0.0055; }
  // ───────── lips, vestibule and cheek lining ─────────
  const archAt = (s, up, off) => { const a = up ? 0.0285 : 0.0272, zf = up ? 0.057 : 0.0505; let x, z, nx, nz;
    if (s <= 1) { x = a * Math.sin((s * PI) / 2); z = zf - 0.04 * Math.pow(s, 1.6); const dx = (a * PI / 2) * Math.cos((s * PI) / 2), dz = -0.064 * Math.pow(s, 0.6), l = Math.hypot(dx, dz) || 1; nx = -dz / l; nz = dx / l; }
    else { x = a; z = zf - 0.04 - 0.04 * (s - 1); nx = 1; nz = 0; }
    return [x + nx * off, z + nz * off]; };
  const offW = s => 0.0085 + 0.0055 * Math.pow(1 - Math.min(1, s), 2);
  const lerp = (a, b, t) => a + (b - a) * t;
  { const yU = OCC + 0.0125, yL = OCC - 0.0120, T = 1.3, tt = u => (2 * u - 1) * T;
    add(DG, 'labial_buccal_mucosa', grid(70, 12, (u, v) => { const t = tt(u), s = Math.abs(t), sg = t < 0 ? -1 : 1, o = offW(s), [x1, z1] = archAt(s, 1, o), [x2, z2] = archAt(s, 0, o); return V(sg * lerp(x1, x2, v), lerp(yU, yL, v), lerp(z1, z2, v)); }), mc.wall, 'Labial and buccal mucosa (lining of the lips and cheeks, outer wall of the vestibule)', 3);
    [[1, OCC + 0.0072, yU], [0, OCC - 0.0078, yL]].forEach(([up, y0, y1]) => add(DG, up ? 'alveolar_mucosa_maxillary' : 'alveolar_mucosa_mandibular', grid(70, 8, (u, v) => { const t = tt(u), s = Math.abs(t), sg = t < 0 ? -1 : 1, o = lerp(0.0036, offW(s), v * v), [x, z] = archAt(s, up, o); return V(sg * x, lerp(y0, y1, v), z); }), mc.gum, up ? 'Alveolar mucosa (maxillary, to the vestibular fornix)' : 'Alveolar mucosa (mandibular, to the vestibular fornix)'));
    // lips: the red zone (vermilion) of each lip over the orbicularis oris
    const lipPath = (zc, yc, sag) => curve(Array.from({ length: 13 }, (_, i) => { const x = -0.0185 + 0.037 * i / 12, q = (x / 0.0185) ** 2; return [x, yc + sag * q, zc - 0.0105 * q]; }));
    const lipSec = (w, h) => u => { const k = Math.pow(Math.sin(PI * (0.03 + 0.94 * u)), 0.45); return [w * k, h * k]; };
    add(DG, 'upper_lip', loft(lipPath(0.0745, 1.5645, -0.0018), lipSec(0.0034, 0.0030), { nu: 40, nv: 18, side: V(0, 1, 0) }), mc.lip, 'Upper lip (vermilion zone)');
    add(DG, 'lower_lip', loft(lipPath(0.0715, 1.5565, 0.0016), lipSec(0.0042, 0.0030), { nu: 40, nv: 18, side: V(0, 1, 0) }), mc.lip, 'Lower lip (vermilion zone)');
    add(DG, 'upper_labial_frenulum', place(new THREE.BoxGeometry(0.0006, 0.0034, 0.0115), 0, 1.5727, 0.0655, -0.309), mc.fold, 'Labial frenulum (upper)');
    add(DG, 'lower_labial_frenulum', place(new THREE.BoxGeometry(0.0006, 0.0040, 0.0113), 0, 1.5521, 0.0592, 0.38), mc.fold, 'Labial frenulum (lower)'); }
  SIDES.forEach(s => { const lb = t => t + tg(s);
    add(DG, 'retromolar_trigone_' + sd(s), mirror(place(blob(0.0034, 0.0013, 0.0050, 0.08, 9, 20, 14), 0.0262, 1.5556, 0.0078), s), mc.gum, lb('Retromolar trigone (pad behind the last lower molar)'));
    const [px, pz] = archAt(0.823, 1, offW(0.823) - 0.0010);
    add(DG, 'parotid_papilla_' + sd(s), mirror(place(blob(0.0012, 0.0010, 0.0013, 0.03, 10, 14, 10), px, OCC + 0.0068, pz), s), mc.pale, lb('Parotid papilla (opening of the parotid duct, opposite the upper second molar)')); });

  // ───────── floor of the mouth, sublingual folds and the salivary glands ─────────
  { const T = 1.25, tt = u => (2 * u - 1) * T;
    add(DG, 'floor_of_mouth', grid(60, 8, (u, v) => { const t = tt(u), s = Math.abs(t), sg = t < 0 ? -1 : 1, [x, z] = archAt(Math.min(s, 1.0), 0, -lerp(0.0040, 0.0090, v)); return V(sg * x, lerp(1.5532, 1.5478, Math.pow(v, 0.7)), z - (s > 1 ? 0.04 * (s - 1) : 0)); }), mc.floor, 'Floor of the mouth (mucosa under the tongue)', 1); }
  SIDES.forEach(s => { const lb = t => t + tg(s);
    // sublingual gland: the almond under the floor mucosa beside the genioglossus
    add(DG, 'sublingual_gland_' + sd(s), mirror(place(blob(0.0040, 0.0034, 0.0125, 0.10, 11, 30, 20), 0.0140, 1.5470, 0.0315, 0, -0.55, 0), s), mc.gland, lb('Sublingual gland'));
    add(DG, 'sublingual_fold_' + sd(s), mirror(ridge([[0.0038, 1.5490, 0.0364], [0.0085, 1.5498, 0.0320], [0.0130, 1.5504, 0.0272], [0.0178, 1.5516, 0.0214]], u => 0.0011 * (0.8 + 0.2 * Math.sin(PI * u)), { flat: 0.8 }), s), mc.fold, lb('Sublingual fold (plica sublingualis, over the sublingual gland)'));
    // submandibular gland: a superficial part below the mylohyoid and a deep part that wraps its back edge, with the duct running forward to the caruncle
    add(DG, 'submandibular_gland_' + sd(s), mirror(place(blob(0.0100, 0.0062, 0.0125, 0.12, 12, 36, 24), 0.0420, 1.5400, 0.0160, 0.15, 0, 0), s), mc.sub, lb('Submandibular gland, superficial part'));
    add(DG, 'submandibular_gland_deep_' + sd(s), mirror(place(blob(0.0052, 0.0040, 0.0085, 0.08, 13, 28, 18), 0.0325, 1.5472, 0.0185), s), mc.sub, lb('Submandibular gland, deep part'));
    add(DG, 'submandibular_duct_' + sd(s), mirror(ridge([[0.0300, 1.5470, 0.0215], [0.0255, 1.5493, 0.0262], [0.0190, 1.5498, 0.0312], [0.0120, 1.5492, 0.0345], [0.0062, 1.5486, 0.0360], [0.0034, 1.5483, 0.0364]], () => 0.0007), s), mc.duct, lb('Submandibular duct (Wharton)'));
    // parotid gland: a superficial part over the masseter and a deep part behind the ramus, with the duct crossing the masseter to open in the cheek
    add(DG, 'parotid_gland_' + sd(s), mirror(place(blob(0.0030, 0.0205, 0.0130, 0.12, 14, 36, 24), 0.0775, 1.5880, -0.0050), s), mc.gland, lb('Parotid gland, superficial part'));
    add(DG, 'parotid_gland_deep_' + sd(s), mirror(place(blob(0.0085, 0.0150, 0.0040, 0.10, 15, 28, 20), 0.0640, 1.5880, -0.0152), s), mc.gland, lb('Parotid gland, deep part (behind the mandibular ramus)'));
    const [dx, dz] = archAt(0.823, 1, offW(0.823) - 0.0010);
    add(DG, 'parotid_duct_' + sd(s), mirror(ridge([[0.0785, 1.5800, 0.0030], [0.0800, 1.5762, 0.0160], [0.0790, 1.5720, 0.0270], [0.0680, 1.5690, 0.0345], [0.0500, 1.5676, 0.0350], [dx + 0.004, OCC + 0.0068, dz + 0.004], [dx, OCC + 0.0068, dz]], () => 0.0007), s), mc.duct, lb('Parotid duct (Stensen)')); });

  // ───────── tongue: folds, grooves, vallecula, papillae and the intrinsic muscles ─────────
  { const epi = find('respiratory', /^Epiglottis/); let E0 = V(0, 1.5330, 0.0110), tipY = 1.5398, el = V(0.0068, 1.5340, 0.0085);
    if (epi) { const ev = verts(epi); tipY = Math.max(...ev.map(v => v.y)); const band = ev.filter(v => Math.abs(v.x) < 0.0012 && v.y > tipY - 0.0130 && v.y < tipY - 0.0085); if (band.length) E0 = band.reduce((a, b) => (b.z > a.z ? b : a));
      const lat = ev.filter(v => v.x > 0.0055 && v.y > tipY - 0.0075 && v.y < tipY - 0.0035); if (lat.length) el = lat.reduce((a, b) => (b.z > a.z ? b : a)); }
    const R0 = tS(1, 0, 0.99);
    add(DG, 'median_glossoepiglottic_fold', ridge([R0, R0.clone().lerp(E0, 0.5).add(V(0, 0.0004, 0.0004)), E0], () => 0.0008, { flat: 0.6 }), mc.fold, 'Median glossoepiglottic fold');
    SIDES.forEach(s => { const L0 = tS(1, s * 1.15, 0.99), Em = V(s * el.x, el.y, el.z);
      add(DG, 'lateral_glossoepiglottic_fold_' + sd(s), ridge([L0, L0.clone().lerp(Em, 0.5).add(V(0, 0.0005, 0.0003)), Em], () => 0.0007, { flat: 0.6 }), mc.fold, 'Lateral glossoepiglottic fold' + tg(s));
      const c = R0.clone().lerp(L0, 0.5).lerp(E0.clone().lerp(Em, 0.5), 0.5);
      add(DG, 'epiglottic_vallecula_' + sd(s), place(blob(0.0026, 0.0022, 0.0020, 0.05, 16, 14, 10), c.x, c.y, c.z), mc.dark, 'Epiglottic vallecula' + tg(s)); }); }
  add(DG, 'median_sulcus_tongue', ridge(tongueLine(0.06, 0.60, 0, 1.004, 20), () => 0.00032, { nv: 6 }), mc.dark, 'Median sulcus of the tongue');
  { const fol = []; SIDES.forEach(s => [0.50, 0.52, 0.54, 0.56, 0.58].forEach(u => fol.push(ridge(tongueArc(u, s * 1.30, s * 1.85, 1.004, 6), () => 0.00042, { nv: 6, nu: 10 }))));
    add(DG, 'foliate_papillae', merge(fol), mc.fold, 'Foliate papillae (vertical folds on the back of the tongue edge)'); }
  SIDES.forEach(s => add(DG, 'plica_fimbriata_' + sd(s), ridge(tongueLine(0.14, 0.50, PI + s * 0.78, 1.01, 14), u => 0.0005 * (0.6 + 0.4 * Math.sin(PI * u)), { nv: 8 }), mc.fold, 'Plica fimbriata (fringed fold under the tongue)' + tg(s)));
  // intrinsic muscles lie inside the tongue surface: a superficial longitudinal layer, a transverse and a vertical set, and the inferior longitudinal band
  { const sl = [], tr = [], vt = [], il = [], rd = (pts, r) => ridge(pts, () => r, { nv: 6, nu: Math.max(8, pts.length * 3) });
    [-0.55, -0.28, 0, 0.28, 0.55].forEach(th => sl.push(rd(tongueLine(0.05, 0.60, th, 0.80, 14), 0.00075)));
    for (let u = 0.12; u <= 0.58; u += 0.07) tr.push(rd(tongueArc(u, -1.15, 1.15, 0.62, 14), 0.00055));
    SIDES.forEach(s => { for (let u = 0.10; u <= 0.56; u += 0.06) [0.55, 0.95].forEach(th => vt.push(rd([tS(u, s * th, 0.88), tS(u, s * th, 0.55), tS(u, PI - s * th * 0.8, 0.88)], 0.00045)));
      il.push(rd(tongueLine(0.10, 0.62, PI + s * 0.80, 0.45, 14), 0.0011)); });
    add(MS, 'tongue_superior_longitudinal', merge(sl), mm.mid, 'Superior longitudinal muscle of the tongue (intrinsic)');
    add(MS, 'tongue_transverse', merge(tr), mm.deep, 'Transverse muscle of the tongue (intrinsic)');
    add(MS, 'tongue_vertical', merge(vt), mm.mid, 'Vertical muscle of the tongue (intrinsic)');
    add(MS, 'tongue_inferior_longitudinal', merge(il), mm.deep, 'Inferior longitudinal muscle of the tongue (intrinsic)');
    const sep = grid(14, 10, (u, v) => { const p = TC.getPointAt(0.04 + 0.58 * u), t = TC.getTangentAt(u), I = new THREE.Vector3().crossVectors(X, TC.getTangentAt(0.04 + 0.58 * u)).normalize(), h = 0.0085 * Math.sqrt(ss(0, 0.18, 0.04 + 0.58 * u)); return p.clone().addScaledVector(I, h * (0.85 - 1.55 * v)).add(V(-0.0003, 0, 0)); });
    add(DG, 'lingual_septum', sep, M('lingual_septum', 0xece7dc, 0.5, { side: DS, ...TRN(0.7) }), 'Lingual septum (fibrous midline of the tongue)', 2); }
}
