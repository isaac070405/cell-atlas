// Single tooth, magnified beside the figure (hidden until its button is pressed): a lower canine cut lengthwise.
// Layers from the outside in: enamel over the crown, cementum over the root, dentin with its tubules, and the pulp (chamber and root canal)
// carrying a nerve, an artery and a vein in through the apical foramen. Around the root sit the periodontal ligament, alveolar bone
// and gingiva. Each layer is the half of a solid of revolution plus a flat cap, so the cut face shows the layers in colour.
// View it from the figure's right (-x), where the cut face points.
import { THREE, V, G, M, reg } from './anatomy-part1.js';

const SY = 'digestive', lbl = t => 'Magnified tooth: ' + t;
const B0 = [-0.44, 1.3, 0.0];
const n0 = G[SY].children.length;
const mt = (name, c, r = 0.5, o = {}) => M(name, c, r, { side: THREE.DoubleSide, ...o });
// the cut face points away from the key light, so each layer also glows a little in its own colour
const glow = (mat, k = 0.55) => { mat.emissive = mat.color.clone(); mat.emissiveIntensity = k; return mat; };
const m = {
  enamel: mt('enamel', 0xf4f0e4, 0.22, { transparent: true, opacity: 0.94 }), cementum: mt('cementum', 0xc9a56a, 0.6), dentin: mt('dentin', 0xe6cf98, 0.55), pulp: mt('pulp', 0xd04a4c, 0.5),
  pdl: mt('periodontal_ligament', 0xd9a79c, 0.6), bone: mt('alveolar_bone', 0xe6d8b8, 0.65), gum: mt('gingiva', 0xe58f93, 0.5),
  nerve: M('pulp_nerve', 0xf0c24a, 0.45), art: M('pulp_artery', 0xc9402f, 0.45), vein: M('pulp_vein', 0x3f5f8f, 0.45),
};
['enamel', 'cementum', 'dentin', 'pulp', 'pdl', 'bone', 'gum'].forEach(k => glow(m[k], k === 'enamel' ? 0.3 : 0.5));

// outer outline of the tooth, apex to cusp tip: [height, radius] in metres at about 3x life size
const OUT = [[-0.078, 0.0016], [-0.060, 0.0045], [-0.040, 0.0075], [-0.020, 0.0098], [-0.006, 0.0110], [0, 0.0108], [0.006, 0.0125], [0.014, 0.0132], [0.024, 0.0112], [0.032, 0.0078], [0.038, 0.0040], [0.042, 0]];
const lerp = (arr, y) => { for (let i = 0; i < arr.length - 1; i++) { const [y0, r0] = arr[i], [y1, r1] = arr[i + 1]; if (y >= y0 && y <= y1) return r0 + (r1 - r0) * (y - y0) / (y1 - y0); } return y < arr[0][0] ? arr[0][1] : arr[arr.length - 1][1]; };
const R = y => lerp(OUT, y);
const ys = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + (b - a) * i / n);
const enT = y => 0.0004 + 0.0026 * Math.min(1, Math.max(0, (y - 0.002) / 0.036));   // enamel thickness: thin at the neck, thick at the cusp
const ceT = y => 0.0003 + 0.0010 * Math.min(1, Math.max(0, (-y) / 0.078));            // cementum thickness: thin at the neck, thick at the apex
const pulpR = y => y > -0.004 ? Math.max(0, lerp([[-0.004, 0.0030], [0.008, 0.0058], [0.016, 0.0066], [0.026, 0.0046], [0.032, 0.0022], [0.034, 0]], y)) : lerp([[-0.078, 0.0009], [-0.05, 0.0013], [-0.02, 0.0020], [-0.004, 0.0030]], y);

// a layer given as a closed loop of [radius, height] points
function layer(name, label, mat, loop) {
  const pts = loop.map(([r, y]) => new THREE.Vector2(Math.max(0, r), y));
  const g = new THREE.LatheGeometry(pts, 40, 0, Math.PI);
  const parts = [g];
  // flat caps on the cut plane (x = 0): the loop and its mirror image in z
  for (const sgn of [1, -1]) { const sg = new THREE.ShapeGeometry(new THREE.Shape(pts.map(p => new THREE.Vector2(sgn * p.x, p.y)))); sg.rotateY(-Math.PI / 2); parts.push(sg); }
  const grp = new THREE.Group(); grp.position.set(...B0); grp.name = name;
  parts.forEach((p, i) => { const mesh = new THREE.Mesh(p, mat); reg(SY, name + (i ? '_cap' + i : ''), mesh, { label: lbl(label) }); mesh.position.set(...B0); });
}
// outline points between two heights with an offset: the outer surface, moved by f(y)
const edge = (a, b, n, f) => ys(a, b, n).map(y => [Math.max(0, R(y) + f(y)), y]);

// enamel: crown only, from the neck to the cusp
{ const outer = edge(0, 0.0418, 18, () => 0), tip = [0, 0.042], inner = edge(0, 0.0418, 18, y => -enT(y)).reverse();
  layer('enamel', 'Enamel (hardest tissue in the body, no living cells)', m.enamel, [...outer, tip, [0, 0.042 - enT(0.0418)], ...inner]); }
// cementum: root only, from the apex to the neck
layer('cementum', 'Cementum (bone-like cover of the root, anchors the periodontal fibres)', m.cementum, [...edge(-0.078, 0, 16, () => 0), ...edge(-0.078, 0, 16, y => -ceT(y)).reverse()]);
// dentin: outer boundary under the enamel and cementum, inner boundary at the pulp
{ const outerRoot = edge(-0.078, 0, 16, y => -ceT(y)), outerCrown = edge(0.0015, 0.0418, 16, y => -enT(y)), pulp = ys(-0.0785, 0.0342, 30).map(y => [pulpR(y), y]).reverse();
  layer('dentin', 'Dentin (living, tubular tissue that forms most of the tooth)', m.dentin, [...outerRoot, ...outerCrown, [0, 0.042 - enT(0.0418)], [0, 0.0342], ...pulp]); }
// pulp: chamber in the crown and canal in the root
layer('pulp_chamber', 'Pulp chamber (nerves, vessels and odontoblasts)', m.pulp, [...ys(-0.004, 0.0342, 18).map(y => [pulpR(y), y]), [0, 0.0342], [0, -0.004]]);
layer('root_canal', 'Root canal (carries the neurovascular bundle to the apex)', m.pulp, [...ys(-0.0785, -0.004, 14).map(y => [pulpR(y), y]), [0, -0.004], [0, -0.0785]]);
// periodontal ligament, alveolar bone and gingiva around the root
const pdlOut = y => R(y) + 0.00065;
{ layer('periodontal_ligament', 'Periodontal ligament (collagen fibres that hold the root in its socket)', m.pdl, [...ys(-0.0035, -0.0795, 18).map(y => [y < -0.0745 ? Math.max(0, pdlOut(-0.0745) * (1 - (-0.0745 - y) / 0.005)) : pdlOut(y), y]), [0, -0.0795], [0, -0.0785], ...ys(-0.0785, -0.0035, 16).map(y => [R(y), y])]);
  const crest = -0.0035;
  layer('alveolar_bone', 'Alveolar bone (the socket of the jaw)', m.bone, [[0.0195, crest - 0.0005], [0.0195, -0.0925], [0, -0.0925], [0, -0.0795], ...ys(-0.0745, crest, 14).map(y => [pdlOut(y), y])]);
  layer('gingiva', 'Gingiva (gum), with the gingival sulcus at the neck', m.gum, [[R(crest) + 0.00065, crest], [0.0195, crest - 0.0005], [0.0188, 0.0016], [0.0152, 0.0050], [R(0.0045) + 0.0006, 0.0046], [R(0.002) + 0.0005, 0.0018], [R(0) + 0.00065, 0]]); }

// dentinal tubules: fine lines across the dentin from the pulp to the enamel and cementum, drawn on the cut face
{ const pos = []; let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k < 150; k++) { const y = -0.07 + rnd() * 0.106, r0 = pulpR(y) + 0.0002, r1 = (y > 0 ? R(y) - enT(y) : R(y) - ceT(y)) - 0.0003; if (r1 - r0 < 0.0006) continue; const tilt = y > 0 ? 0.004 : -0.002;
    for (const sg of [1, -1]) pos.push(B0[0] + 0.00025, B0[1] + y, B0[2] + sg * r0, B0[0] + 0.00025, B0[1] + y + tilt, B0[2] + sg * r1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const ln = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x9a7a3c })); ln.name = 'dentinal_tubules'; ln.userData.label = lbl('Dentinal tubules (fluid-filled channels that carry pain signals)'); ln.userData.sys = SY; G[SY].add(ln); }

// apical foramen and the neurovascular bundle that passes through it
{ const tube = (name, label, mat, off, r, y0, y1) => { const pts = []; for (let i = 0; i <= 12; i++) { const y = y0 + (y1 - y0) * i / 12; pts.push(V(B0[0] + 0.0001, B0[1] + y, B0[2] + off * Math.min(1, pulpR(Math.min(y, 0.03)) / 0.003 + 0.2) * 0.45)); }
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, r, 8, false), mat); reg(SY, name, mesh, { label: lbl(label) }); };
  tube('pulp_nerve', 'Pulp nerve (sensory branch of the inferior alveolar nerve)', m.nerve, 0, 0.00034, -0.094, 0.030);
  tube('pulp_artery', 'Pulp artery (arteriole from the inferior alveolar artery)', m.art, 0.0016, 0.00028, -0.094, 0.026);
  tube('pulp_vein', 'Pulp vein (venule draining the pulp)', m.vein, -0.0016, 0.00028, -0.094, 0.026);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.0018, 0.00045, 8, 18), M('apical_foramen', 0x6a4a3a, 0.7)); ring.rotation.x = Math.PI / 2; ring.position.set(B0[0], B0[1] - 0.0788, B0[2]); reg(SY, 'apical_foramen', ring, { label: lbl('Apical foramen (opening at the root tip)') });
  const cej = new THREE.Mesh(new THREE.TorusGeometry(R(0) + 0.0003, 0.00055, 8, 24, Math.PI), M('cementoenamel_junction', 0x3f7f5f, 0.5)); cej.rotation.x = Math.PI / 2; cej.rotation.z = Math.PI / 2; cej.position.set(B0[0], B0[1], B0[2]); reg(SY, 'cementoenamel_junction', cej, { label: lbl('Cementoenamel junction (neck of the tooth)') }); }

const toothG = new THREE.Group(); toothG.name = 'magnified_tooth'; toothG.visible = false;
G[SY].children.slice(n0).forEach(o => toothG.add(o)); G[SY].add(toothG);
window.__groups = Object.assign(window.__groups || {}, { toothG });
