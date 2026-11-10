// Head and neck rebuild: the pharynx split into nasopharynx, oropharynx and laryngopharynx, a nasal cavity with scrolled conchae, meatuses,
// olfactory region and vestibule, and a larynx with shaped thyroid, cricoid, arytenoid and epiglottic cartilages and true and false vocal folds.
// The old placeholder meshes for these structures are removed first, so each label appears once.
import { THREE, V, model, G, M, reg } from './anatomy-part1.js';

const RS = 'respiratory', DG = 'digestive', SK = 'skeletal', SIDES = [-1, 1];
const sd = s => (s < 0 ? 'right' : 'left'), tg = s => ' (' + sd(s) + ')';
const DS = THREE.DoubleSide;
const drop = (sys, rx) => { const gone = []; model.traverse(o => { if (o.isMesh && o.userData.sys === sys && rx.test(o.userData.label || '')) gone.push(o); }); gone.forEach(o => o.parent.remove(o)); return gone.length; };
const add = (sys, name, geo, mt, label, pos) => { const m = new THREE.Mesh(geo, mt); if (pos) m.position.set(...pos); return reg(sys, name, m, { label }); };
const tint = (base, hex, name) => { const m = base.clone(); m.name = name; m.color.setHex(hex); return m; };

// the old placeholder meshes are made later in anatomy-part2.js, so this runs from there just before the model is handed to the stage
export function buildHead() {
model.updateMatrixWorld(true);
// ───────── pharynx: three regions cut from the existing wall ─────────
{ let src = null; model.traverse(o => { if (o.isMesh && o.userData.sys === DG && o.userData.label === 'Pharynx') src = o; });
  if (src) {
    const g = src.geometry, pos = g.attributes.position, nor = g.attributes.normal, idx = g.index, n = idx ? idx.count : pos.count, w = new THREE.Vector3();
    const bands = [{ k: 'nasopharynx', label: 'Nasopharynx (behind the nose, above the soft palate; holds the pharyngeal tonsil and the auditory tube openings)', hex: 0xd7a4a6, min: 1.5685, max: 9 },
      { k: 'oropharynx', label: 'Oropharynx (behind the mouth, from the soft palate to the tip of the epiglottis; holds the palatine tonsils)', hex: 0xd98f86, min: 1.548, max: 1.5685 },
      { k: 'laryngopharynx', label: 'Laryngopharynx (hypopharynx, from the epiglottis to the cricoid cartilage; the piriform recesses lie beside the larynx)', hex: 0xc57a6c, min: -9, max: 1.548 }];
    const out = bands.map(() => ({ p: [], n: [] }));
    for (let t = 0; t < n; t += 3) { const ids = [0, 1, 2].map(i => idx ? idx.getX(t + i) : t + i); let y = 0; ids.forEach(i => { w.fromBufferAttribute(pos, i).applyMatrix4(src.matrixWorld); y += w.y / 3; });
      const b = bands.findIndex(bd => y >= bd.min && y < bd.max); if (b < 0) continue; ids.forEach(i => { out[b].p.push(pos.getX(i), pos.getY(i), pos.getZ(i)); out[b].n.push(nor.getX(i), nor.getY(i), nor.getZ(i)); }); }
    const parent = src.parent, mt = src.material;
    bands.forEach((bd, i) => { if (!out[i].p.length) return; const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(out[i].p, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(out[i].n, 3));
      const m = new THREE.Mesh(geo, tint(mt, bd.hex, bd.k)); m.material.side = DS; m.position.copy(src.position); m.quaternion.copy(src.quaternion); m.scale.copy(src.scale); reg(DG, bd.k, m, { label: bd.label }); });
    parent.remove(src);
  } }

// ───────── nasal cavity ─────────
drop(RS, /nasal concha/i); drop(SK, /^Inferior nasal concha/);
{ const A = 0.0125;   // distance of the lateral wall from the midline
  const mucosa = new THREE.MeshStandardMaterial({ name: 'nasal_mucosa', color: 0xe39a96, roughness: 0.5, side: DS, transparent: true, opacity: 0.85 });
  const boneM = M('bone', 0xe6d8b8, 0.6, { side: DS });
  const wallM = new THREE.MeshStandardMaterial({ name: 'nasal_wall', color: 0xefc1b6, roughness: 0.6, side: DS, transparent: true, opacity: 0.4, depthWrite: false });
  const meatM = new THREE.MeshStandardMaterial({ name: 'nasal_meatus', color: 0x7fb6d9, roughness: 0.4, side: DS, transparent: true, opacity: 0.5, depthWrite: false });
  // a curled plate: the polyline [a, y] (a = distance from the midline) thickened by th and extruded along z
  const scroll = (s, pts, th, z0, len) => { const L = [], R = [];
    pts.forEach(([a, y], i) => { const p = pts[Math.max(0, i - 1)], q = pts[Math.min(pts.length - 1, i + 1)], dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l; L.push(new THREE.Vector2(s * (a + nx * th / 2), y + ny * th / 2)); R.push(new THREE.Vector2(s * (a - nx * th / 2), y - ny * th / 2)); });
    const g = new THREE.ExtrudeGeometry(new THREE.Shape([...L, ...R.reverse()]), { depth: len, bevelEnabled: false, curveSegments: 4 }); g.translate(0, 0, z0); return g; };
  const prof = {
    inf: [[A, 1.5985], [0.0113, 1.5960], [0.0095, 1.5925], [0.0085, 1.5890], [0.0092, 1.5858], [0.0108, 1.5855], [0.0118, 1.5872]],
    mid: [[A, 1.6125], [0.0115, 1.6105], [0.0100, 1.6075], [0.0092, 1.6045], [0.0100, 1.6025], [0.0112, 1.6028]],
    sup: [[A, 1.6235], [0.0116, 1.6222], [0.0104, 1.6200], [0.0098, 1.6180], [0.0106, 1.6165]] };
  const vib = [];
  SIDES.forEach(s => {
    add(SK, 'inferior_concha_bone_' + sd(s), scroll(s, prof.inf, 0.0006, 0.020, 0.042), boneM, 'Inferior nasal concha' + tg(s));
    add(RS, 'inferior_concha_' + sd(s), scroll(s, prof.inf, 0.0016, 0.020, 0.042), mucosa, 'Inferior nasal concha (mucosa)' + tg(s));
    add(RS, 'middle_concha_' + sd(s), scroll(s, prof.mid, 0.0014, 0.026, 0.032), mucosa, 'Middle nasal concha' + tg(s));
    add(RS, 'superior_concha_' + sd(s), scroll(s, prof.sup, 0.0012, 0.026, 0.017), mucosa, 'Superior nasal concha' + tg(s));
    add(RS, 'lateral_nasal_wall_' + sd(s), new THREE.BoxGeometry(0.0006, 0.046, 0.074), wallM, 'Lateral nasal wall (mucosa)' + tg(s), [s * (A + 0.0013), 1.603, 0.042]);
    // meatuses lie under their conchae
    add(RS, 'superior_meatus_' + sd(s), new THREE.BoxGeometry(0.0016, 0.0040, 0.017), meatM, 'Superior meatus (posterior ethmoid cells open here)' + tg(s), [s * (A - 0.0004), 1.6130, 0.0345]);
    add(RS, 'middle_meatus_' + sd(s), new THREE.BoxGeometry(0.0016, 0.0042, 0.032), meatM, 'Middle meatus (frontal, maxillary and anterior ethmoid sinuses open here)' + tg(s), [s * (A - 0.0004), 1.6000, 0.042]);
    add(RS, 'inferior_meatus_' + sd(s), new THREE.BoxGeometry(0.0016, 0.0048, 0.042), meatM, 'Inferior meatus (nasolacrimal duct opens here)' + tg(s), [s * (A - 0.0004), 1.5835, 0.041]);
    const tor = (nm, label, r, p, mtl) => { const t = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.35, 8, 16), mtl); t.rotation.y = Math.PI / 2; reg(RS, nm + '_' + sd(s), t, { label: label + tg(s) }); t.position.set(s * (A - 0.0008), p[0], p[1]); };
    const dark = M('ostium', 0x5a2f33, 0.7, { side: DS });
    tor('nasolacrimal_opening', 'Opening of the nasolacrimal duct', 0.0008, [1.5842, 0.058], dark); tor('maxillary_ostium', 'Maxillary sinus opening (ostium)', 0.0011, [1.6015, 0.034], dark);
    add(RS, 'ethmoid_bulla_' + sd(s), new THREE.SphereGeometry(0.0027, 14, 10), M('ethmoid_bulla', 0xe7b0a8, 0.5), 'Ethmoid bulla' + tg(s), [s * 0.0112, 1.6080, 0.0405]);
    add(RS, 'sphenoethmoidal_recess_' + sd(s), new THREE.BoxGeometry(0.0016, 0.0042, 0.011), meatM, 'Sphenoethmoidal recess (sphenoid sinus opens here)' + tg(s), [s * (A - 0.0004), 1.6262, 0.0185]);
    add(RS, 'olfactory_epithelium_' + sd(s), new THREE.BoxGeometry(0.0078, 0.0006, 0.022), M('olfactory_epithelium', 0xd9b25a, 0.6), 'Olfactory region (olfactory epithelium on the roof)' + tg(s), [s * 0.0052, 1.6268, 0.048]);
    add(SK, 'cribriform_plate_' + sd(s), new THREE.BoxGeometry(0.0095, 0.0008, 0.020), boneM, 'Cribriform plate of ethmoid' + tg(s), [s * 0.0056, 1.6283, 0.048]);
    add(RS, 'nasal_floor_' + sd(s), new THREE.BoxGeometry(A - 0.0004, 0.0008, 0.074), mucosa, 'Floor of the nasal cavity (mucosa over the hard palate)' + tg(s), [s * (A / 2), 1.5810, 0.044]);
    // vestibule: the skin-lined entrance with its hairs
    const ves = new THREE.CylinderGeometry(0.0066, 0.0070, 0.013, 18, 1, true); ves.rotateX(Math.PI / 2);
    add(RS, 'nasal_vestibule_' + sd(s), ves, new THREE.MeshStandardMaterial({ name: 'nasal_vestibule', color: 0xe7c9bb, roughness: 0.6, side: DS, transparent: true, opacity: 0.55, depthWrite: false }), 'Nasal vestibule (skin-lined entrance)' + tg(s), [s * 0.0074, 1.5995, 0.0835]);
    for (let k = 0; k < 22; k++) { const a = k * 2.399963, z = 0.078 + (k % 5) * 0.002, c = V(s * 0.0074 + Math.cos(a) * 0.0063, 1.5995 + Math.sin(a) * 0.0063, z), d = V(-Math.cos(a), -Math.sin(a), 0.2).normalize().multiplyScalar(0.0030);
      const hg = new THREE.CylinderGeometry(0.00006, 0.00011, 0.003, 4, 1); hg.translate(0, 0.0015, 0); hg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize())); hg.translate(c.x, c.y, c.z); hg.deleteAttribute('uv'); vib.push(hg); }
    // nasal cartilages around the nostril
    const al = new THREE.TorusGeometry(0.0058, 0.0007, 8, 20, Math.PI * 1.2); al.rotateY(Math.PI / 2); al.rotateZ(s < 0 ? 0.4 : Math.PI - 0.4);
    add(SK, 'alar_cartilage_' + sd(s), al, M('cartilage', 0xa3bdd1, 0.5, { side: DS }), 'Greater alar cartilage' + tg(s), [s * 0.0074, 1.5995, 0.0885]);
    const lc = new THREE.PlaneGeometry(0.0125, 0.0125); lc.rotateY(Math.PI / 2 + s * 0.5);
    add(SK, 'lateral_nasal_cartilage_' + sd(s), lc, M('cartilage', 0xa3bdd1, 0.5, { side: DS }), 'Lateral nasal cartilage' + tg(s), [s * 0.0100, 1.6120, 0.0830]);
  });
  { let nv = 0; const P = [], N = [], I = []; vib.forEach(g => { const p = g.attributes.position.array, nn = g.attributes.normal.array, ix = g.index.array; for (let i = 0; i < p.length; i++) { P.push(p[i]); N.push(nn[i]); } for (let i = 0; i < ix.length; i++) I.push(ix[i] + nv); nv += p.length / 3; });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setIndex(I);
    add(RS, 'vibrissae', g, M('vibrissae', 0x4a3a30, 0.8), 'Vibrissae (nasal hairs that filter dust)'); }
}

// ───────── larynx ─────────
drop(RS, /^(Thyroid cartilage|Cricoid cartilage|Arytenoid cartilage|Epiglottis$|Vocal fold|Vestibular fold|Aryepiglottic fold)/);
{ const cartM = M('laryngeal_cartilage', 0xa9c3d6, 0.35, { side: DS }), hyaline = M('thyroid_cartilage', 0xb4cbd9, 0.35, { side: DS, transparent: true, opacity: 0.92 });
  const fold = (c, name) => new THREE.MeshStandardMaterial({ name, color: c, roughness: 0.45, side: DS });
  // thyroid cartilage: two laminae that meet at the laryngeal prominence, with superior and inferior horns
  SIDES.forEach(s => {
    const sh = new THREE.Shape([[0, 0.0010], [0, 0.0290], [0.0100, 0.0300], [0.0215, 0.0285], [0.0255, 0.0375], [0.0268, 0.0285], [0.0272, 0.0070], [0.0262, -0.0035], [0.0245, 0.0030], [0.0140, 0.0020]].map(([u, v]) => new THREE.Vector2(u, v)));
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.0013, bevelEnabled: false }); g.translate(0, 0, -0.00065);
    const h = V(s * 0.0193, 0, -0.025).normalize(), up = V(0, 1, 0), n = new THREE.Vector3().crossVectors(h, up), mx = new THREE.Matrix4().makeBasis(h, up, n); mx.setPosition(s * 0.0010, 1.4965, 0.0215); g.applyMatrix4(mx);
    add(RS, 'thyroid_lamina_' + sd(s), g, hyaline, 'Thyroid cartilage (' + sd(s) + ' lamina, with superior and inferior horns)');
    // arytenoid cartilage: a pyramid on the cricoid lamina with a vocal process (forward) and a muscular process (sideways)
    const ar = new THREE.ConeGeometry(0.0044, 0.0118, 3); ar.translate(0, 0.0059, 0); ar.rotateZ(-s * 0.18); ar.rotateX(-0.12); ar.translate(s * 0.0062, 1.5050, -0.0100);
    add(RS, 'arytenoid_' + sd(s), ar, cartM, 'Arytenoid cartilage' + tg(s));
    const vp = new THREE.ConeGeometry(0.0012, 0.0062, 6); vp.rotateX(Math.PI / 2); vp.translate(s * 0.0044, 1.5058, -0.0055);
    add(RS, 'vocal_process_' + sd(s), vp, cartM, 'Vocal process of the arytenoid' + tg(s));
    const mp = new THREE.ConeGeometry(0.0012, 0.0050, 6); mp.rotateZ(s * -Math.PI / 2); mp.translate(s * 0.0100, 1.5056, -0.0100);
    add(RS, 'muscular_process_' + sd(s), mp, cartM, 'Muscular process of the arytenoid' + tg(s));
    add(RS, 'corniculate_' + sd(s), new THREE.ConeGeometry(0.0013, 0.0034, 6), cartM, 'Corniculate cartilage' + tg(s), [s * 0.0052, 1.5185, -0.0107]);
    // true vocal fold: a wedge from the thyroid angle to the vocal process, with a pale free edge
    const vf = new THREE.ExtrudeGeometry(new THREE.Shape([[s * 0.0090, 1.5020], [s * 0.0090, 1.5090], [s * 0.0030, 1.5060], [s * 0.0016, 1.5040], [s * 0.0030, 1.5030]].map(([x, y]) => new THREE.Vector2(x, y))), { depth: 0.0225, bevelEnabled: false }); vf.translate(0, 0, -0.0070);
    add(RS, 'vocal_fold_' + sd(s), vf, fold(0xf1e3dd, 'vocal_fold'), 'Vocal fold (true vocal cord)' + tg(s));
    const vv = new THREE.ExtrudeGeometry(new THREE.Shape([[s * 0.0090, 1.5105], [s * 0.0090, 1.5180], [s * 0.0050, 1.5170], [s * 0.0042, 1.5130]].map(([x, y]) => new THREE.Vector2(x, y))), { depth: 0.0178, bevelEnabled: false }); vv.translate(0, 0, -0.0030);
    add(RS, 'vestibular_fold_' + sd(s), vv, fold(0xd98b86, 'vestibular_fold'), 'Vestibular fold (false vocal cord)' + tg(s));
    const ve = new THREE.SphereGeometry(1, 14, 10); ve.scale(0.0032, 0.0019, 0.0092); ve.translate(s * 0.0078, 1.5095, 0.0060);
    add(RS, 'laryngeal_ventricle_' + sd(s), ve, new THREE.MeshStandardMaterial({ name: 'laryngeal_ventricle', color: 0x5a2f33, roughness: 0.7, transparent: true, opacity: 0.6, depthWrite: false }), 'Laryngeal ventricle' + tg(s));
    // aryepiglottic fold: a sheet from the arytenoid apex to the side of the epiglottis
    const sheet = new THREE.BufferGeometry(); sheet.setAttribute('position', new THREE.Float32BufferAttribute([s * 0.0050, 1.5165, -0.0105, s * 0.0072, 1.5395, 0.0100, s * 0.0044, 1.5200, 0.0160, s * 0.0050, 1.5165, -0.0105, s * 0.0044, 1.5200, 0.0160, s * 0.0030, 1.5170, 0.0100], 3)); sheet.computeVertexNormals();
    add(RS, 'aryepiglottic_fold_' + sd(s), sheet, fold(0xe39a96, 'aryepiglottic_fold'), 'Aryepiglottic fold' + tg(s));
  });
  // cricoid cartilage: a signet ring, narrow in front (arch) and tall behind (lamina)
  { const N = 48, ro = 0.0108, ri = 0.0092, y0 = 1.4835, P = [], I = [], hAt = f => 0.0055 + 0.0160 * Math.pow(0.5 - 0.5 * Math.cos(f), 1.6);
    for (let k = 0; k <= N; k++) { const f = k / N * Math.PI * 2, c = Math.cos(f), sn = Math.sin(f), h = hAt(f); [[ro, 0], [ro, h], [ri, 0], [ri, h]].forEach(([r, hh]) => P.push(r * sn, y0 + hh, r * c)); }
    for (let k = 0; k < N; k++) { const a = k * 4, b = (k + 1) * 4; [[0, 1], [2, 3], [1, 3], [0, 2]].forEach(([i, j]) => I.push(a + i, a + j, b + i, a + j, b + j, b + i)); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals();
    add(RS, 'cricoid_ring', g, cartM, 'Cricoid cartilage (signet ring: arch in front, lamina behind)'); }
  // epiglottis: a leaf of elastic cartilage on a stalk, leaning back over the laryngeal inlet
  { const sh = new THREE.Shape([[-0.0004, 0], [0.0004, 0], [0.0030, 0.0100], [0.0075, 0.0220], [0.0072, 0.0300], [0.0040, 0.0345], [0, 0.0355], [-0.0040, 0.0345], [-0.0072, 0.0300], [-0.0075, 0.0220], [-0.0030, 0.0100]].map(([x, y]) => new THREE.Vector2(x, y)));
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.0007, bevelEnabled: false, curveSegments: 6 }); g.translate(0, 0, -0.00035);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), x = p.getX(i); p.setZ(i, p.getZ(i) + 0.00022 * (x * 1000) ** 2 * 0.25 * (y / 0.0355) - 0.0000); }   // curl the sides forward, more toward the tip
    g.computeVertexNormals(); g.rotateX(-0.42); g.translate(0, 1.5072, 0.0170);
    add(RS, 'epiglottis', g, M('epiglottis', 0xb7cbbd, 0.4, { side: DS }), 'Epiglottis (leaf of elastic cartilage)'); }
}
}
