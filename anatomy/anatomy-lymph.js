// Lymphatic system: the lymph node groups of the head and neck, thorax, abdomen, pelvis and limbs, and the vessels, trunks and ducts that join them.
// Node and vessel positions follow the arteries, veins and organs already in the model (the internal jugular vein, the aorta and venae cavae,
// the mesenteric root, the iliac and femoral vessels). The thoracic duct, cisterna chyli, tonsils, spleen, thymus, Peyer's patches and appendix
// stay in the systems that hold them and are gathered with these in the lymphatic views.
import { THREE, V, model, SYS, G, M } from './anatomy-part1.js';

SYS.push({ k: 'lymphatic', name: 'Lymphatic', color: '#8fc063', on: false,
  blurb: 'Lymph drains the fluid that leaks from capillaries back to the blood. Lymph nodes (lime) filter it along collecting vessels (pale green) that join into trunks: the jugular, subclavian and bronchomediastinal trunks on each side, and the lumbar and intestinal trunks below. The right lymphatic duct drains the right head, neck, arm and chest into the right venous angle. The thoracic duct, which starts at the cisterna chyli, drains everything else into the left venous angle. The tonsils, spleen, thymus, Peyer\'s patches and appendix are lymphoid tissue held in other systems and shown together in the lymphatic views.',
  parts: ['#Head and neck nodes', 'Occipital lymph nodes', 'Post-auricular (mastoid) lymph nodes', 'Pre-auricular and parotid lymph nodes', 'Submental lymph nodes', 'Submandibular lymph nodes', 'Superficial cervical lymph nodes', 'Deep cervical lymph nodes', 'Posterior triangle (accessory) lymph nodes', 'Supraclavicular lymph nodes', 'Pretracheal and paratracheal lymph nodes',
    '#Thorax and upper limb nodes', 'Parasternal (internal thoracic) lymph nodes', 'Anterior mediastinal lymph nodes', 'Tracheobronchial lymph nodes', 'Subcarinal lymph nodes', 'Axillary lymph nodes, pectoral, central and apical groups', 'Epitrochlear lymph nodes',
    '#Abdominal and pelvic nodes', 'Para-aortic (lumbar) lymph nodes', 'Coeliac lymph nodes', 'Superior mesenteric lymph nodes', 'Inferior mesenteric lymph nodes', 'Mesenteric lymph nodes (jejunal and ileal)', 'Colic lymph nodes', 'Gastric lymph nodes', 'Hepatic lymph nodes (porta hepatis)', 'Splenic hilar lymph nodes', 'Common iliac lymph nodes', 'External iliac lymph nodes', 'Internal iliac lymph nodes',
    '#Lower limb nodes', 'Superficial inguinal lymph nodes', 'Deep inguinal lymph nodes', 'Popliteal lymph nodes',
    '#Lymphatic vessels, trunks and ducts', 'Lymphatic vessels, deep cervical chain', 'Jugular trunk', 'Subclavian trunk', 'Bronchomediastinal trunk', 'Right lymphatic duct', 'Lumbar trunk', 'Intestinal trunk', 'Lymphatic vessels, iliac and inguinal chain', 'Lymphatic vessels, mesenteric (lacteals)', 'Lymphatic vessels, collecting vessels of the arm', 'Lymphatic vessels, collecting vessels of the leg', 'Thoracic duct', 'Cisterna chyli'] });
{ const g = new THREE.Group(); g.name = 'lymphatic_system'; g.visible = false; G.lymphatic = g; model.add(g); }

const nodeM = M('lymph_node', 0x9bc968, 0.55), vesM = M('lymphatic_vessel', 0xb6e39a, 0.45), trunkM = M('lymphatic_trunk', 0x86c46a, 0.45);
let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const side = s => (s < 0 ? 'right' : 'left'), tag = s => ' (' + side(s) + ')';
const add = (label, geo, mt) => { const m = new THREE.Mesh(geo, mt); m.name = label.toLowerCase().replace(/[^a-z0-9]+/g, '_'); m.userData.label = label; m.userData.sys = 'lymphatic'; m.castShadow = false; G.lymphatic.add(m); return m; };
function mergeGeo(list) { let nv = 0; const pos = [], nor = [], idx = [];
  list.forEach(g => { const p = g.attributes.position.array, n = g.attributes.normal.array, ix = g.index.array; for (let i = 0; i < p.length; i++) { pos.push(p[i]); nor.push(n[i]); } for (let i = 0; i < ix.length; i++) idx.push(ix[i] + nv); nv += p.length / 3; g.dispose(); });
  const o = new THREE.BufferGeometry(); o.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); o.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); o.setIndex(idx); return o; }
// a bean-shaped node: an ellipsoid with a random long axis
const bean = (p, r) => { const g = new THREE.SphereGeometry(r, 12, 9); const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd() * 3, rnd() * 3, rnd() * 3));
  g.applyMatrix4(new THREE.Matrix4().compose(V(...p), q, V(1.5, 0.9, 0.9))); return g; };
const nodes = (label, pts, r = 0.0042) => add(label, mergeGeo(pts.map(p => bean(p, r * (0.8 + rnd() * 0.5)))), nodeM);
const nodesBoth = (label, pts, r) => [-1, 1].forEach(s => nodes(label + tag(s), pts.map(([x, y, z]) => [s * x, y, z]), r));
const vessel = (label, pts, r = 0.0011, mt = vesM) => add(label, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => V(...p))), Math.max(8, pts.length * 8), r, 6, false), mt);
const vesselBoth = (label, pts, r, mt) => [-1, 1].forEach(s => vessel(label + tag(s), pts.map(([x, y, z]) => [s * x, y, z]), r, mt));
const chain = (n, y0, y1, x, z, j = 0.003) => Array.from({ length: n }, (_, i) => [x + (rnd() - 0.5) * j, y0 + (y1 - y0) * i / (n - 1), z + (rnd() - 0.5) * j]);

// ───── head and neck ─────
nodesBoth('Occipital lymph nodes', [[0.026, 1.628, -0.083], [0.040, 1.618, -0.080]], 0.0034);
nodesBoth('Post-auricular (mastoid) lymph nodes', [[0.074, 1.602, -0.022], [0.073, 1.590, -0.016]], 0.0034);
nodesBoth('Pre-auricular and parotid lymph nodes', [[0.067, 1.618, 0.014], [0.064, 1.606, 0.020]], 0.0034);
nodes('Submental lymph nodes', [[0.007, 1.536, 0.052], [-0.007, 1.534, 0.050]], 0.0034);
nodesBoth('Submandibular lymph nodes', [[0.030, 1.548, 0.033], [0.036, 1.545, 0.026], [0.024, 1.550, 0.040]], 0.0036);
nodesBoth('Superficial cervical lymph nodes', [[0.055, 1.515, 0.024], [0.058, 1.500, 0.022], [0.056, 1.485, 0.020]], 0.0036);
const deepC = chain(8, 1.565, 1.435, 0.040, -0.001); nodesBoth('Deep cervical lymph nodes', deepC, 0.0046);
nodesBoth('Posterior triangle (accessory) lymph nodes', [[0.052, 1.560, -0.028], [0.056, 1.540, -0.030], [0.058, 1.520, -0.030], [0.060, 1.495, -0.028]], 0.0036);
nodesBoth('Supraclavicular lymph nodes', [[0.050, 1.436, 0.012], [0.060, 1.432, 0.010], [0.042, 1.430, 0.014]], 0.0042);
nodes('Pretracheal and paratracheal lymph nodes', [[0.0, 1.452, 0.016], [0.014, 1.425, 0.010], [-0.014, 1.424, 0.010], [0.014, 1.400, 0.010], [-0.014, 1.398, 0.010], [0.012, 1.375, 0.010], [-0.012, 1.373, 0.010]], 0.0038);

// ───── thorax and upper limb ─────
nodesBoth('Parasternal (internal thoracic) lymph nodes', [1.36, 1.31, 1.26, 1.21].map(y => [0.020, y, 0.062]), 0.0034);
nodes('Anterior mediastinal lymph nodes', [[0.012, 1.345, 0.032], [-0.012, 1.342, 0.032], [0.010, 1.325, 0.036]], 0.0038);
nodes('Tracheobronchial lymph nodes', [[-0.020, 1.320, 0.002], [-0.026, 1.300, -0.004], [0.020, 1.318, 0.002], [0.026, 1.298, -0.004]], 0.0044);
nodes('Subcarinal lymph nodes', [[0, 1.298, -0.002], [0.006, 1.292, -0.006]], 0.0052);
nodesBoth('Axillary lymph nodes, pectoral, central and apical groups', [[0.168, 1.348, 0.030], [0.176, 1.360, 0.012], [0.160, 1.338, -0.004], [0.182, 1.372, 0.024], [0.165, 1.322, 0.018], [0.188, 1.385, 0.010]], 0.0048);
nodesBoth('Epitrochlear lymph nodes', [[0.222, 1.085, 0.020]], 0.0036);

// ───── abdomen and pelvis ─────
nodes('Para-aortic (lumbar) lymph nodes', [...chain(9, 1.17, 0.93, 0.036, -0.030), ...chain(9, 1.17, 0.93, -0.018, -0.030)], 0.0046);
nodes('Coeliac lymph nodes', [[0.004, 1.098, -0.012], [0.014, 1.092, -0.016], [-0.008, 1.095, -0.010]], 0.0044);
nodes('Superior mesenteric lymph nodes', [[0.007, 1.020, -0.002], [0.012, 1.000, 0.000], [0.003, 0.995, 0.002]], 0.0044);
nodes('Inferior mesenteric lymph nodes', [[0.020, 0.935, -0.014], [0.025, 0.920, -0.012]], 0.0040);
{ const mes = [], R0 = V(0.007, 1.0, 0.003), J = V(0.045, 0.962, 0.022), I1 = V(0.0, 0.914, 0.03), I2 = V(0.04, 0.91, 0.03);
  for (let i = 0; i < 8; i++) { const t = 0.35 + 0.65 * (i + 1) / 8; mes.push(R0.clone().lerp(J, t).add(V((rnd() - 0.5) * 0.012, (rnd() - 0.5) * 0.012, (rnd() - 0.5) * 0.01)).toArray()); }
  for (let i = 0; i < 8; i++) { const t = 0.35 + 0.65 * (i + 1) / 8; mes.push(R0.clone().lerp(i % 2 ? I1 : I2, t).add(V((rnd() - 0.5) * 0.012, (rnd() - 0.5) * 0.012, (rnd() - 0.5) * 0.01)).toArray()); }
  nodes('Mesenteric lymph nodes (jejunal and ileal)', mes, 0.0036);
  // lacteals: fine vessels from the bowel wall to those nodes
  const lac = mes.map(p => { const a = V(...p), b = a.clone().add(V((rnd() - 0.5) * 0.03, (rnd() - 0.5) * 0.02, 0.014 + rnd() * 0.01)); return new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, a.clone().lerp(b, 0.5).add(V(0.002, 0.002, 0)), b]), 6, 0.0006, 5, false); });
  add('Lymphatic vessels, mesenteric (lacteals)', mergeGeo(lac), vesM); }
nodes('Colic lymph nodes', [[-0.095, 0.96, 0.012], [-0.100, 0.93, 0.014], [-0.092, 0.905, 0.014], [-0.040, 1.0, 0.045], [0.0, 1.005, 0.050], [0.045, 1.0, 0.045], [0.098, 0.97, 0.0], [0.100, 0.94, 0.002], [0.090, 0.915, 0.0], [0.050, 0.905, 0.010], [0.030, 0.89, 0.015]], 0.0040);
nodes('Gastric lymph nodes', [[0.060, 1.092, 0.036], [0.075, 1.060, 0.052]], 0.0040);
nodes('Hepatic lymph nodes (porta hepatis)', [[-0.030, 1.050, 0.008], [-0.022, 1.040, 0.012]], 0.0040);
nodes('Splenic hilar lymph nodes', [[0.108, 1.065, -0.026], [0.112, 1.045, -0.030]], 0.0040);
nodesBoth('Common iliac lymph nodes', [[0.020, 0.905, -0.016], [0.030, 0.890, -0.020]], 0.0044);
nodesBoth('External iliac lymph nodes', [[0.052, 0.868, 0.002], [0.056, 0.848, 0.008], [0.058, 0.826, 0.014]], 0.0044);
nodesBoth('Internal iliac lymph nodes', [[0.040, 0.846, -0.030], [0.036, 0.832, -0.034]], 0.0042);

// ───── lower limb ─────
nodesBoth('Superficial inguinal lymph nodes', [[0.066, 0.795, 0.044], [0.075, 0.790, 0.040], [0.058, 0.788, 0.046], [0.062, 0.770, 0.044], [0.066, 0.752, 0.044]], 0.0046);
nodesBoth('Deep inguinal lymph nodes', [[0.050, 0.772, 0.014]], 0.0042);
nodesBoth('Popliteal lymph nodes', [[0.098, 0.500, -0.040], [0.096, 0.470, -0.040]], 0.0040);

// ───── vessels, trunks and ducts ─────
const jug = s => [...deepC.map(([x, y, z]) => [s * x, y, z])];
[-1, 1].forEach(s => {
  vessel('Lymphatic vessels, deep cervical chain' + tag(s), jug(s));
  vessel('Jugular trunk' + tag(s), [[s * 0.040, 1.435, -0.001], [s * 0.044, 1.428, 0.004], [s * (s < 0 ? 0.052 : 0.036), 1.422, 0.008]], 0.0016, trunkM);
  vessel('Subclavian trunk' + tag(s), [[s * 0.188, 1.385, 0.010], [s * 0.130, 1.405, 0.012], [s * 0.075, 1.418, 0.010], [s * (s < 0 ? 0.058 : 0.040), 1.421, 0.009]], 0.0016, trunkM);
  vessel('Bronchomediastinal trunk' + tag(s), [[s * 0.026, 1.298, -0.004], [s * 0.020, 1.330, 0.004], [s * 0.014, 1.375, 0.010], [s * 0.016, 1.415, 0.010], [s * (s < 0 ? 0.052 : 0.038), 1.424, 0.009]], 0.0016, trunkM);
  vessel('Lymphatic vessels, collecting vessels of the arm' + tag(s), [[s * 0.260, 0.80, 0.026], [s * 0.240, 0.95, 0.024], [s * 0.222, 1.085, 0.020], [s * 0.205, 1.22, 0.024], [s * 0.178, 1.352, 0.020]]);
  vessel('Lymphatic vessels, collecting vessels of the leg' + tag(s), [[s * 0.088, 0.08, 0.040], [s * 0.092, 0.27, 0.040], [s * 0.092, 0.47, 0.040], [s * 0.078, 0.62, 0.044], [s * 0.066, 0.77, 0.044]]);
  vessel('Lymphatic vessels, collecting vessels of the leg, deep' + tag(s), [[s * 0.098, 0.470, -0.040], [s * 0.082, 0.62, 0.0], [s * 0.052, 0.772, 0.014]]);
  vessel('Lymphatic vessels, iliac and inguinal chain' + tag(s), [[s * 0.066, 0.78, 0.044], [s * 0.056, 0.83, 0.012], [s * 0.054, 0.866, 0.004], [s * 0.034, 0.896, -0.014], [s * (s < 0 ? 0.018 : 0.036), 0.93, -0.030]]);
  vessel('Lumbar trunk' + tag(s), [[s * (s < 0 ? 0.018 : 0.036), 0.93, -0.030], [s * (s < 0 ? 0.017 : 0.032), 1.0, -0.031], [s * 0.012, 1.050, -0.031], [-0.003, 1.070, -0.030]], 0.0018, trunkM);
});
vessel('Right lymphatic duct', [[-0.058, 1.418, 0.010], [-0.054, 1.424, 0.011], [-0.050, 1.429, 0.012]], 0.0020, trunkM);
vessel('Intestinal trunk', [[0.007, 1.020, -0.002], [0.002, 1.045, -0.018], [-0.003, 1.068, -0.029]], 0.0018, trunkM);
