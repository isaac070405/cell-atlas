// Shared geometry helpers for the rebuilt oral cavity, tonsils and neck (anatomy-oral.js, anatomy-neck.js).
import { THREE, V, model, reg } from './anatomy-part1.js';

export const DS = THREE.DoubleSide;
export const sd = s => (s < 0 ? 'right' : 'left'), tg = s => ' (' + sd(s) + ')';
export const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const ga = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));

// remove the old placeholder meshes whose label matches, so each label appears once
export const drop = (sys, rx) => { const gone = []; model.traverse(o => { if (o.isMesh && (!sys || o.userData.sys === sys) && rx.test(o.userData.label || '')) gone.push(o); }); gone.forEach(o => o.parent.remove(o)); return gone.length; };
export const find = (sys, rx) => { let hit = null; model.traverse(o => { if (!hit && o.isMesh && (!sys || o.userData.sys === sys) && rx.test(o.userData.label || '')) hit = o; }); return hit; };
// world-space vertices of a mesh that pass a test
export const verts = (mesh, test) => { mesh.updateWorldMatrix(true, false); const p = mesh.geometry.attributes.position, out = [], v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(mesh.matrixWorld); if (!test || test(v)) out.push(v.clone()); } return out; };

// glossy mucosa: a physical material with a clearcoat and a deep-red sheen
export const PMat = (name, color, rough = 0.4, o = {}) => { const { cc = 0.5, sc = 0x8a2a30, sheen = 0.3, ...rest } = o;
  return new THREE.MeshPhysicalMaterial({ name, color, roughness: rough, metalness: 0, clearcoat: cc, clearcoatRoughness: 0.4, sheen, sheenColor: new THREE.Color(sc), sheenRoughness: 0.5, side: DS, ...rest }); };
export const TRN = op => ({ transparent: true, opacity: op, depthWrite: false });

// join indexed geometries into one (positions, optional colours, indices)
export function merge(list) {
  const P = [], I = [], C = []; let n = 0, col = list.every(g => g.attributes.color);
  list.forEach(g => { const p = g.attributes.position.array; for (let i = 0; i < p.length; i++) P.push(p[i]); if (col) { const c = g.attributes.color.array; for (let i = 0; i < c.length; i++) C.push(c[i]); }
    const ix = g.index ? g.index.array : [...Array(p.length / 3).keys()]; for (let i = 0; i < ix.length; i++) I.push(ix[i] + n); n += p.length / 3; });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); if (col) g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.setIndex(I); g.computeVertexNormals(); return g;
}
// a copy of a left-side geometry for the right side (x flipped, triangle order reversed so the faces keep pointing outward)
export function mirror(g, s) {
  if (s > 0) return g; g = g.clone(); g.scale(-1, 1, 1);
  if (g.index) { const a = g.index.array; for (let i = 0; i < a.length; i += 3) { const t = a[i + 1]; a[i + 1] = a[i + 2]; a[i + 2] = t; } g.index.needsUpdate = true; }
  else for (const k in g.attributes) { const at = g.attributes[k], n = at.itemSize; for (let i = 0; i + 2 < at.count; i += 3) for (let c = 0; c < n; c++) { const t = at.array[(i + 1) * n + c]; at.array[(i + 1) * n + c] = at.array[(i + 2) * n + c]; at.array[(i + 2) * n + c] = t; } }
  g.computeVertexNormals(); return g;
}

// a closed tube of elliptical cross-section along a path; sec(u) gives [semi-axis along the side vector, semi-axis along the normal, offset along side, offset along normal]
export function loft(path, sec, o = {}) {
  const nu = o.nu ?? 40, nv = o.nv ?? 20, side = o.side || V(1, 0, 0), pos = [], idx = [], col = [], c = new THREE.Color();
  for (let i = 0; i <= nu; i++) { const u = i / nu, p = path.getPointAt(u), T = path.getTangentAt(u).normalize();
    const sv = Math.abs(side.dot(T)) > 0.95 ? V(0, 1, 0) : side, S = sv.clone().addScaledVector(T, -sv.dot(T)).normalize(), N = new THREE.Vector3().crossVectors(T, S).normalize(), [w, h, dx = 0, dn = 0] = sec(u);
    for (let j = 0; j <= nv; j++) { const a = (j / nv) * Math.PI * 2, q = p.clone().addScaledVector(S, w * Math.cos(a) + dx).addScaledVector(N, h * Math.sin(a) + dn); pos.push(q.x, q.y, q.z);
      if (o.col) { c.setHex(o.col(u, a)); col.push(c.r, c.g, c.b); } } }
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const a = i * (nv + 1) + j, b = a + nv + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); if (o.col) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
export const curve = pts => new THREE.CatmullRomCurve3(pts.map(p => (p.isVector3 ? p.clone() : V(...p))), false, 'centripetal');
// a fold or cord: a tube whose radius changes along its length, r(u) in metres
export const ridge = (pts, r, o = {}) => loft(curve(pts), u => { const k = r(u); return [k, k * (o.flat ?? 1)]; }, { nu: o.nu ?? Math.max(12, pts.length * 8), nv: o.nv ?? 10, side: o.side });
// a surface over a parameter grid, fn(u, v) -> Vector3
export function grid(nu, nv, fn, col) {
  const pos = [], idx = [], cl = [], c = new THREE.Color();
  for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) { const p = fn(i / nu, j / nv); pos.push(p.x, p.y, p.z); if (col) { c.setHex(col(i / nu, j / nv)); cl.push(c.r, c.g, c.b); } }
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const a = i * (nv + 1) + j, b = a + nv + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); if (col) g.setAttribute('color', new THREE.Float32BufferAttribute(cl, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
// a lumpy ellipsoid for glands and lymphoid tissue: radii in metres, lump depth as a fraction of the radius
export function blob(rx, ry, rz, amp = 0.1, seed = 1, ws = 40, hs = 28) {
  const g = new THREE.SphereGeometry(1, ws, hs), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = Math.sin(5.1 * x + 1.7 * seed) * Math.sin(4.3 * y + 2.9 * seed) + Math.sin(6.7 * z + 0.9 * seed) * Math.sin(3.7 * x + 4.1 * seed) + 0.6 * Math.sin(9.3 * y + 5.1 * z + seed);
    const k = 1 + amp * n * 0.45; p.setXYZ(i, x * k * rx, y * k * ry, z * k * rz); }
  g.computeVertexNormals(); return g;
}
export const place = (g, x, y, z, rx = 0, ry = 0, rz = 0) => { if (rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz))); g.translate(x, y, z); return g; };
export const add = (sys, name, geo, mt, label, ro) => { const m = new THREE.Mesh(geo, mt); const r = reg(sys, name, m, { label }); if (ro) r.renderOrder = ro; return r; };

// remove the part of a mesh that lies inside a convex region (all planes n·p <= d), cutting triangles along the planes so the new edge is straight
export function cutOut(mesh, planes) {
  const g = mesh.geometry, ix = g.index, pos = g.attributes.position, nor = g.attributes.normal, n = ix ? ix.count : pos.count, keep = [];
  mesh.updateWorldMatrix(true, false); const inv = new THREE.Matrix4().copy(mesh.matrixWorld).invert(), mw = mesh.matrixWorld;
  const vtx = i => { const p = new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(mw), q = new THREE.Vector3().fromBufferAttribute(nor, i); return { p, q }; };
  const side = (v, pl) => pl.n.dot(v.p) - pl.d, lerpV = (a, b, t) => ({ p: a.p.clone().lerp(b.p, t), q: a.q.clone().lerp(b.q, t).normalize() });
  const emit = poly => { for (let i = 1; i < poly.length - 1; i++) [poly[0], poly[i], poly[i + 1]].forEach(v => keep.push(v)); };
  // split a polygon by a plane into the part with side > 0 (outside) and the part with side <= 0 (inside)
  const split = (poly, pl) => { const out = [], inn = [];
    for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length], sa = side(a, pl), sb = side(b, pl);
      (sa > 0 ? out : inn).push(a);
      if ((sa > 0) !== (sb > 0)) { const m = lerpV(a, b, sa / (sa - sb)); out.push(m); inn.push(m); } }
    return [out, inn]; };
  for (let t = 0; t < n; t += 3) { let poly = [0, 1, 2].map(k => vtx(ix ? ix.getX(t + k) : t + k));
    for (const pl of planes) { if (poly.length < 3) break; const [o, i] = split(poly, pl); if (o.length >= 3) emit(o); poly = i; } }
  const P = [], N = []; keep.forEach(v => { const l = v.p.clone().applyMatrix4(inv); P.push(l.x, l.y, l.z); N.push(v.q.x, v.q.y, v.q.z); });
  const ng = new THREE.BufferGeometry(); ng.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); ng.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); mesh.geometry = ng;
}
