// Neck, rebuilt: sternocleidomastoid with its sternal and clavicular heads, omohyoid as two bellies and a tendon, the scalenes, the prevertebral muscles
// (longus colli, longus capitis, rectus capitis anterior and lateralis), splenius cervicis and the nuchal ligament; a thyroid gland whose lobes wrap the
// trachea with a bridging isthmus, a pyramidal lobe and flat parathyroid glands; the carotid sinus and body; the cervical plexus branches; and the
// ascending pharyngeal artery. The old single-strip sternocleidomastoid and omohyoid, and the ellipsoid thyroid, are removed first.
// Runs from anatomy-part2.js after the oral cavity. Coordinates are metres, +x is the figure's left, +y up, +z forward.
import { THREE, V, M, belly, mm, tube, mat, model } from './anatomy-part1.js';
import { DS, sd, tg, ss, drop, find, verts, merge, mirror, loft, curve, ridge, grid, blob, place, add } from './anatomy-fit.js';

const MS = 'muscular', EN = 'endocrine', CS = 'circulatory', NS = 'nervous', SIDES = [-1, 1], PI = Math.PI;
const P = (s, p) => [s * p[0], p[1], p[2]];

export function buildNeck() {
  drop(MS, /^(Sternocleidomastoid|Omohyoid)/);
  drop(EN, /^(Thyroid gland|Isthmus of thyroid|Pyramidal lobe|Parathyroid)/);

  // ───────── muscles ─────────
  // attachment points sampled from the bones, with a fixed fallback if a bone is missing
  const clav = find('skeletal', /^Clavicle \(left\)/); let cv = V(0.049, 1.378, 0.074);
  if (clav) { const top = verts(clav, v => v.x > 0.044 && v.x < 0.054); if (top.length) cv = top.reduce((a, b) => (b.y > a.y ? b : a)); }
  SIDES.forEach(s => { const lb = t => t + tg(s), mu = (l, pts, r, o = {}) => belly(lb(l), pts.map(p => P(s, p)), r, { ...o, up: o.up && [s * o.up[0], o.up[1], o.up[2]] });
    const tn = (nm, l, pts, r) => tube(MS, nm + '_' + sd(s), pts.map(p => P(s, p)), r, mm.ten, { label: lb(l) });
    // sternocleidomastoid: the sternal head runs from the manubrium, the clavicular head from the medial third of the clavicle; both end on the mastoid process
    mu('Sternocleidomastoid, sternal head', [[0.0140, 1.3722, 0.0900], [0.0200, 1.4000, 0.0780], [0.0290, 1.4400, 0.0620], [0.0420, 1.4950, 0.0330], [0.0540, 1.5420, 0.0020], [0.0630, 1.5700, -0.0200], [0.0668, 1.5805, -0.0298]], 0.0054, { mt: mm.sup, peak: 0.45, w: 1.1, d: 0.8 });
    mu('Sternocleidomastoid, clavicular head', [[cv.x, cv.y + 0.0010, cv.z], [0.0470, 1.4250, 0.0600], [0.0480, 1.4700, 0.0380], [0.0545, 1.5200, 0.0150], [0.0610, 1.5600, -0.0130], [0.0668, 1.5805, -0.0298]], 0.0046, { mt: mm.sup, peak: 0.45, w: 1.3, d: 0.7 });
    // omohyoid: inferior belly from the scapula, an intermediate tendon under the sternocleidomastoid held down by a fascial sling, then the superior belly to the hyoid
    mu('Omohyoid, inferior belly', [[0.1050, 1.4020, -0.0500], [0.0850, 1.4180, -0.0200], [0.0650, 1.4350, 0.0100], [0.0485, 1.4500, 0.0340]], 0.0020, { mt: mm.mid, peak: 0.5, w: 1.6, d: 0.6, up: [0, 1, 0] });
    tn('omohyoid_tendon', 'Omohyoid, intermediate tendon', [[0.0485, 1.4500, 0.0340], [0.0440, 1.4590, 0.0375], [0.0410, 1.4670, 0.0395]], 0.0009);
    mu('Omohyoid, superior belly', [[0.0410, 1.4670, 0.0395], [0.0300, 1.4900, 0.0460], [0.0210, 1.5150, 0.0420], [0.0150, 1.5310, 0.0205]], 0.0020, { mt: mm.mid, peak: 0.5, w: 1.6, d: 0.6, up: [1, 0, 0] });
    // scalenes: from the cervical transverse processes down to the first and second ribs, with the brachial plexus and subclavian artery passing between anterior and middle
    mu('Scalenus anterior', [[0.0292, 1.4610, -0.0428], [0.0400, 1.4300, -0.0255], [0.0520, 1.4020, -0.0090], [0.0640, 1.3815, 0.0085]], 0.0042, { mt: mm.mid, peak: 0.45, w: 1.2, d: 0.9 });
    mu('Scalenus anterior (upper slip from C3)', [[0.0292, 1.5040, -0.0330], [0.0310, 1.4800, -0.0390], [0.0360, 1.4500, -0.0325]], 0.0026, { mt: mm.mid, peak: 0.45 });
    mu('Scalenus medius', [[0.0305, 1.4800, -0.0455], [0.0420, 1.4400, -0.0420], [0.0570, 1.4070, -0.0310], [0.0690, 1.3900, -0.0215]], 0.0058, { mt: mm.deep, peak: 0.45, w: 1.4, d: 0.8 });
    mu('Scalenus posterior', [[0.0310, 1.4450, -0.0600], [0.0480, 1.4100, -0.0560], [0.0650, 1.3780, -0.0500], [0.0785, 1.3555, -0.0450]], 0.0030, { mt: mm.deep, peak: 0.45, w: 1.3, d: 0.7 });
    // prevertebral muscles on the front of the cervical spine
    mu('Longus colli, vertical part', [[0.0072, 1.4300, -0.0360], [0.0076, 1.4700, -0.0265], [0.0072, 1.5000, -0.0178]], 0.0021, { mt: mm.deep, peak: 0.5, w: 1.4, d: 0.7, up: [0, 0, 1] });
    mu('Longus colli, superior oblique part', [[0.0030, 1.5435, -0.0070], [0.0120, 1.5200, -0.0195], [0.0210, 1.4900, -0.0295]], 0.0016, { mt: mm.deep, peak: 0.5, up: [0, 0, 1] });
    mu('Longus colli, inferior oblique part', [[0.0072, 1.3990, -0.0405], [0.0140, 1.4150, -0.0415], [0.0230, 1.4420, -0.0440]], 0.0016, { mt: mm.deep, peak: 0.5, up: [0, 0, 1] });
    mu('Longus capitis', [[0.0290, 1.4640, -0.0415], [0.0220, 1.5000, -0.0300], [0.0150, 1.5400, -0.0180], [0.0100, 1.5765, -0.0095]], 0.0026, { mt: mm.deep, peak: 0.4, w: 1.3, d: 0.7, up: [0, 0, 1] });
    mu('Rectus capitis anterior', [[0.0150, 1.5520, -0.0150], [0.0105, 1.5660, -0.0125], [0.0070, 1.5790, -0.0090]], 0.0014, { mt: mm.deep });
    mu('Rectus capitis lateralis', [[0.0215, 1.5490, -0.0262], [0.0235, 1.5600, -0.0205], [0.0245, 1.5710, -0.0170]], 0.0014, { mt: mm.deep });
    // deep posterior neck
    mu('Splenius cervicis', [[0.0040, 1.3500, -0.1080], [0.0120, 1.4000, -0.0850], [0.0200, 1.4500, -0.0640], [0.0260, 1.5000, -0.0480], [0.0285, 1.5120, -0.0400]], 0.0036, { mt: mm.mid, peak: 0.5, w: 1.5, d: 0.5, up: [0, 0, -1] });
  });
  // nuchal ligament: a median sheet from the external occipital protuberance to the spinous process of C7, attached to the tips of the cervical spines
  { const A = [[0, 1.6206, -0.0899], [0, 1.5800, -0.0960], [0, 1.5400, -0.0990], [0, 1.5000, -0.1000], [0, 1.4600, -0.0990], [0, 1.4155, -0.0950]], Bp = [[0, 1.6000, -0.0775], [0, 1.5469, -0.0450], [0, 1.5254, -0.0530], [0, 1.5014, -0.0721], [0, 1.4800, -0.0777], [0, 1.4600, -0.0829], [0, 1.4400, -0.0881], [0, 1.4155, -0.0944]];
    const ca = curve(A), cb = curve(Bp);
    add(MS, 'nuchal_ligament', grid(40, 4, (u, v) => { const a = ca.getPointAt(u), b = cb.getPointAt(u); const p = a.clone().lerp(b, v); p.x = (v - 0.5) * 0.0010; return p; }), mm.ten, 'Nuchal ligament (ligamentum nuchae)'); }

  // ───────── thyroid gland ─────────
  // each lobe is a crescent wrapped round the trachea (inner face on the airway, thickest in the lower third), loft(apex -> base)
  const tz = 0.0045, ta = (y) => 0.0132 - 0.0017 * ss(1.475, 1.495, y), tb = (y) => 0.0122 - 0.0014 * ss(1.475, 1.495, y);
  const rim = (y, phi) => { const a = ta(y), b = tb(y); return [a * Math.cos(phi), tz + b * Math.sin(phi)]; };
  const crescent = (phi0, phi1, yTop, yBot, thick, o = {}) => { const NV = 22, NU = 40;
    return grid(NU, NV * 2, (u, v) => { const t = u, y = yTop + (yBot - yTop) * t, f = o.f ? o.f(t) : Math.pow(Math.max(0, Math.sin(PI * Math.pow(t, 1.3))), 0.65);
      const inner = v <= 0.5, w = inner ? v * 2 : (1 - v) * 2, phi = phi0 + (phi1 - phi0) * w, pf = Math.pow(Math.max(0, Math.sin(PI * Math.pow(w, 0.85))), 0.7);
      const [x, z] = rim(y, phi), nx = Math.cos(phi) / ta(y), nz = Math.sin(phi) / tb(y), nl = Math.hypot(nx, nz), th = inner ? 0 : (thick * f + 0.0004) * pf * (1 + 0.07 * Math.sin(11 * t + 4 * phi) * Math.sin(7 * phi + 2 * t));
      return V(x + (nx / nl) * th, y, z + (nz / nl) * th); }); };
  const D = PI / 180, lobeTop = 1.4985, lobeBot = 1.4530, lobeThick = 0.0130;
  const lobePt = (t, phi, k = 1) => { const y = lobeTop + (lobeBot - lobeTop) * t, f = Math.pow(Math.sin(PI * Math.pow(t, 1.3)), 0.65), w = (phi - (-35 * D)) / ((70 * D) - (-35 * D)), pf = Math.pow(Math.max(0, Math.sin(PI * Math.pow(w, 0.85))), 0.7), [x, z] = rim(y, phi), nx = Math.cos(phi) / ta(y), nz = Math.sin(phi) / tb(y), nl = Math.hypot(nx, nz), th = ((lobeThick * f + 0.0004) * pf) * k;
    return { p: V(x + (nx / nl) * th, y, z + (nz / nl) * th), n: V(nx / nl, 0, nz / nl) }; };
  const thy = M('thyroid_gland', 0xd99a92, 0.5, { side: DS });
  SIDES.forEach(s => { const lb = t => t + tg(s);
    add(EN, 'thyroid_lobe_' + sd(s), mirror(crescent(-35 * D, 70 * D, lobeTop, lobeBot, lobeThick), s), thy, 'Thyroid gland,' + ' ' + sd(s) + ' lobe');
    // parathyroids: four flat, yellow-brown glands on the back of the lobes (two on each side)
    [['superior', 0.30, -26], ['inferior', 0.78, -20]].forEach(([nm, t, ph]) => { const { p, n } = lobePt(t, ph * D, 1.0), g = new THREE.SphereGeometry(1, 16, 12); g.scale(0.0026, 0.0019, 0.00075);
      const z = n.clone(), x = new THREE.Vector3().crossVectors(V(0, 1, 0), z).normalize(), y = new THREE.Vector3().crossVectors(z, x); g.applyMatrix4(new THREE.Matrix4().makeBasis(x, y, z)); g.translate(p.x + n.x * 0.0004, p.y, p.z + n.z * 0.0004);
      add(EN, 'parathyroid_' + nm + '_' + sd(s), mirror(g, s), M('parathyroid_gland', 0xd9a560, 0.5), 'Parathyroid glands, ' + nm + ' pair' + tg(s)); }); });
  // isthmus: a band across the front of the trachea over rings 2 to 4
  add(EN, 'thyroid_isthmus', crescent(52 * D, 128 * D, 1.4752, 1.4585, 0.0034, { f: t => Math.pow(Math.sin(PI * (0.04 + 0.92 * t)), 0.5) }), thy, 'Isthmus of thyroid gland');
  // pyramidal lobe: a thin strip rising from the isthmus (usually left of the midline) towards the hyoid, in front of the cricothyroid membrane
  add(EN, 'pyramidal_lobe', loft(curve([[0.0030, 1.4750, 0.0182], [0.0042, 1.4870, 0.0172], [0.0038, 1.4960, 0.0186], [0.0028, 1.5030, 0.0198]]), u => [0.0019 * (1 - 0.75 * u), 0.0009 * (1 - 0.6 * u)], { nu: 14, nv: 10, side: V(1, 0, 0) }), thy, 'Pyramidal lobe');

  // ───────── carotid sinus and carotid body ─────────
  SIDES.forEach(s => { const lb = t => t + tg(s);
    add(CS, 'carotid_sinus_' + sd(s), mirror(place(blob(0.0042, 0.0058, 0.0042, 0.03, 20, 20, 14), 0.0262, 1.5345, 0.0232), s), M('carotid_sinus', 0xc44a42, 0.5, { ...{ transparent: true, opacity: 0.55, depthWrite: false } }), lb('Carotid sinus (baroreceptor dilation of the internal carotid artery)'));
    add(CS, 'carotid_body_' + sd(s), mirror(place(blob(0.0016, 0.0024, 0.0016, 0.05, 21, 14, 10), 0.0247, 1.5285, 0.0232), s), M('carotid_body', 0xd9a560, 0.5), lb('Carotid body (chemoreceptor in the carotid bifurcation)'));
    add(CS, 'ascending_pharyngeal_artery_' + sd(s), mirror(ridge([[0.0285, 1.5295, 0.0252], [0.0205, 1.5450, 0.0125], [0.0185, 1.5620, 0.0050], [0.0210, 1.5780, 0.0000]], () => 0.0006), s), mat.artery, lb('Ascending pharyngeal artery')); });

  // ───────── cervical plexus: the superficial branches that wind round the back of sternocleidomastoid (Erb's point) ─────────
  { const nm = mat.nerve; SIDES.forEach(s => { const lb = t => t + tg(s), nv = (name, l, pts, r) => add(NS, name + '_' + sd(s), mirror(ridge(pts, () => r), s), nm, lb(l)), E = [0.0485, 1.5000, 0.0195];
    nv('lesser_occipital_nerve', 'Lesser occipital nerve (C2, C3)', [[0.0440, 1.5290, -0.0345], E, [0.0580, 1.5500, 0.0030], [0.0640, 1.5900, -0.0300], [0.0655, 1.6150, -0.0420]], 0.0005);
    nv('great_auricular_nerve', 'Great auricular nerve (C2, C3)', [[0.0440, 1.5055, -0.0390], E, [0.0540, 1.5300, 0.0090], [0.0680, 1.5700, -0.0070], [0.0760, 1.6050, -0.0090]], 0.0006);
    nv('transverse_cervical_nerve', 'Transverse cervical nerve (C2, C3)', [[0.0440, 1.5055, -0.0390], E, [0.0350, 1.5000, 0.0410], [0.0150, 1.5050, 0.0500]], 0.0005);
    [['medial', [0.0500, 1.4900, 0.0100], [0.0450, 1.4400, 0.0450], [0.0350, 1.3800, 0.0800]], ['intermediate', [0.0500, 1.4900, 0.0100], [0.0580, 1.4400, 0.0350], [0.0600, 1.3850, 0.0650]], ['lateral', [0.0500, 1.4900, 0.0100], [0.0700, 1.4500, 0.0200], [0.0900, 1.4050, 0.0200]]]
      .forEach(([k, ...pts]) => nv('supraclavicular_nerve_' + k, 'Supraclavicular nerves (C3, C4), ' + k + ' branch', pts, 0.0005)); }); }
  fitGut();
}

// The oesophagus, the laryngopharynx and the middle and inferior constrictors were drawn as round tubes whose back wall ran 5 to 7 mm into the C2 to C6 vertebral bodies.
// Each vertex behind the front of the spine (plus a 4.5 mm prevertebral layer for longus colli and the fascia) is pushed forward onto that plane, so the back wall lies flat
// on the spine. The effect fades out above C2 (y 1.537 to 1.552) and sideways beyond the width of the vertebral body.
function fitGut() {
  const bodies = [];
  for (const k of ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'T1', 'T2', 'T3', 'T4']) { let best = null;
    model.traverse(o => { if (o.isMesh && o.userData.sys === 'skeletal' && o.userData.label === 'Vertebra ' + k) { const b = new THREE.Box3().setFromObject(o), c = b.getCenter(new THREE.Vector3()); if (Math.abs(c.x) < 0.004 && (!best || b.max.z > best.z)) best = { y: c.y, z: b.max.z }; } });
    if (best) bodies.push(best); }
  if (bodies.length < 3) return; bodies.sort((a, b) => a.y - b.y);
  const zFront = y => { if (y <= bodies[0].y) return bodies[0].z; for (let i = 1; i < bodies.length; i++) if (y <= bodies[i].y) { const a = bodies[i - 1], b = bodies[i], t = (y - a.y) / (b.y - a.y); return a.z + (b.z - a.z) * t; } return bodies[bodies.length - 1].z; };
  const targets = []; model.traverse(o => { if (!o.isMesh) return; const l = o.userData.label || '', sy = o.userData.sys;
    if ((sy === 'digestive' && /^(Laryngopharynx|Esophag)/.test(l)) || (sy === 'muscular' && /^(Middle|Inferior) pharyngeal constrictor/.test(l))) targets.push(o); });
  const v = new THREE.Vector3();
  targets.forEach(o => { o.updateWorldMatrix(true, false); const inv = new THREE.Matrix4().copy(o.matrixWorld).invert(), p = o.geometry.attributes.position; let moved = 0;
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); if (v.y < 1.30 || v.y > 1.552) continue;
      const wx = 1 - ss(0.011, 0.0135, Math.abs(v.x)), wy = 1 - ss(1.537, 1.552, v.y), zmin = zFront(v.y) + 0.0045, d = zmin - v.z; if (d <= 0) continue;
      v.z += d * wx * wy; moved++; v.applyMatrix4(inv); p.setXYZ(i, v.x, v.y, v.z); }
    if (moved) { p.needsUpdate = true; if (o.geometry.index) o.geometry.computeVertexNormals(); o.geometry.computeBoundingBox(); o.geometry.computeBoundingSphere(); } });
}
