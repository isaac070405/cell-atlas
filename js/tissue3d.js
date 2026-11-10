// Three.js view of one schematic tissue: orbit, click a part to pick it.
// Shapes are drawn from textbook-style reference figures, not measured data. Three.js loads from vendor/three on first use.

export async function createTissueView(host, { onPick, elements }) {
  const THREE = await import('three');
  const { OrbitControls } = await import('three/addons/OrbitControls.js');

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('role', 'img');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.7));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(3, 6, 5);
  scene.add(sun);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', draw);
  const group = new THREE.Group();
  scene.add(group);
  const ray = new THREE.Raycaster();
  let meshes = [], picked = null;

  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  function put(geom, color, part, o = {}) {
    const m = new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05, side: THREE.DoubleSide, ...o, transparent: o.opacity !== undefined && o.opacity < 1, depthWrite: !(o.opacity < 1) }));
    m.userData.part = part;
    m.userData.base = o.opacity ?? 1;
    group.add(m);
    meshes.push(m);
    return m;
  }
  const tube = (pts, r, color, part, o) => put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => V(...p))), Math.max(10, pts.length * 10), r, 8, false), color, part, o);
  const ball = (p, r, color, part, scale = [1, 1, 1], o) => { const m = put(new THREE.SphereGeometry(r, 24, 16), color, part, o); m.position.set(...p); m.scale.set(...scale); return m; };

  // Striped texture: alternating bands along a fibre, for striated muscle
  function stripes(base, band) {
    const c = document.createElement('canvas'); c.width = 128; c.height = 8;
    const g = c.getContext('2d'); g.fillStyle = base; g.fillRect(0, 0, 128, 8);
    g.fillStyle = band; for (let x = 0; x < 128; x += 16) g.fillRect(x, 0, 6, 8);
    const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.repeat.set(10, 1); t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  const BUILD = {
    // Simple columnar epithelium on a basal lamina, over connective tissue with a capillary and a nerve ending
    epithelial() {
      const cols = 5, rows = 3, pitch = 0.95, r = rng(3);
      put(new THREE.BoxGeometry(5.2, 1.5, 3.2), '#E7A99E', 'connective').position.set(0, -0.45, 0);
      put(new THREE.BoxGeometry(5.2, 0.1, 3.2), '#B7A7C9', 'basal').position.set(0, 0.35, 0);
      tube([[-2.6, -0.55, 0.3], [-1.2, -0.45, 0.2], [0.3, -0.6, 0.35], [1.6, -0.5, 0.25], [2.6, -0.55, 0.3]], 0.17, '#B23A3A', 'capillary');
      tube([[-1.9, -1.1, -0.8], [-1.6, -0.4, -0.7], [-1.45, 0.3, -0.6], [-1.3, 0.9, -0.55]], 0.035, '#E6C34A', 'nerve');
      tube([[-0.4, -1.1, 0.9], [-0.2, -0.3, 0.8], [0.0, 0.3, 0.7], [0.1, 0.8, 0.6]], 0.035, '#E6C34A', 'nerve');
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const x = (i - (cols - 1) / 2) * pitch + (j % 2) * 0.25 - 0.12, z = (j - (rows - 1) / 2) * pitch;
        put(new THREE.CylinderGeometry(0.44, 0.4, 1.5, 6), '#E8A33D', 'cell').position.set(x, 1.15, z);
        ball([x, 0.78, z], 0.3, '#8E5DB0', 'nucleus', [0.9, 1.15, 0.9]);
        const ring = put(new THREE.TorusGeometry(0.42, 0.03, 8, 24), '#3FA7A7', 'junction'); ring.rotation.x = Math.PI / 2; ring.position.set(x, 1.72, z);
        for (let k = 0; k < 12; k++) {
          const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.34;
          put(new THREE.CylinderGeometry(0.018, 0.018, 0.24, 5), '#7C8FB0', 'apical').position.set(x + Math.cos(a) * d, 1.99, z + Math.sin(a) * d);
        }
      }
    },

    // Loose connective tissue: matrix with collagen bundles, elastic and reticular fibres, resident cells, vessel and nerve
    connective() {
      const r = rng(11);
      put(new THREE.BoxGeometry(5.2, 3, 3.2), '#6B5B8C', 'matrix', { opacity: 0.16 });
      const bundle = (pts, off) => {
        const cs = [[0, 0], [0.11, 0], [-0.11, 0], [0.055, 0.095], [-0.055, 0.095], [0.055, -0.095], [-0.055, -0.095]];
        for (const [dy, dz] of cs) tube(pts.map(p => [p[0], p[1] + dy + off[0], p[2] + dz + off[1]]), 0.046, '#8C9BE8', 'collagen');
      };
      bundle([[-2.4, 0.5, -0.2], [-1, 0.9, 0.1], [0.4, 0.5, 0.4], [1.8, 0.8, 0.2]], [0, 0]);
      bundle([[-2.3, -0.7, 0.6], [-1.1, -0.4, 0.8], [0.2, -0.8, 0.5]], [0, 0]);
      bundle([[0.4, -0.2, -0.9], [1.4, -0.3, -0.7], [2.4, 0.1, -0.9]], [0, 0]);
      for (const p of [[[-2.2, 1.3, -0.6], [-1, 1.0, -0.2], [0.2, 1.3, -0.5], [1.6, 0.9, -0.8], [2.4, 1.2, -0.4]], [[-1.5, -1.2, 0.2], [-0.5, -0.8, -0.2], [0.8, -1.1, 0.1], [1.9, -0.7, 0.4]], [[0.2, 1.3, -0.5], [0.6, 0.6, -1.0], [1.2, 0.2, -1.2]]]) tube(p, 0.03, '#E0399A', 'elastic');
      for (let i = 0; i < 14; i++) {
        const pts = []; let x = -2.4 + r() * 1.2, y = (r() - 0.5) * 2.4, z = (r() - 0.5) * 2.4;
        for (let k = 0; k < 5; k++) { pts.push([x, y, z]); x += 0.5 + r() * 0.3; y += (r() - 0.5) * 0.9; z += (r() - 0.5) * 0.9; }
        tube(pts.map(p => [p[0], Math.max(-1.3, Math.min(1.3, p[1])), Math.max(-1.4, Math.min(1.4, p[2]))]), 0.012, '#4CC36A', 'reticular');
      }
      for (const [x, y, z, ry] of [[-0.7, 0.2, 0.2, 0.4], [1.6, -0.4, 0.5, -0.6], [-1.5, -0.4, -0.7, 1]]) {
        const f = ball([x, y, z], 0.5, '#E4A15C', 'fibroblast', [1, 0.2, 0.4]); f.rotation.y = ry;
        const n = ball([x, y, z], 0.14, '#C77BA8', 'fibroblast', [1.2, 0.8, 1]); n.rotation.y = ry;
      }
      ball([-1.9, 0.4, 0.9], 0.3, '#C96F5A', 'macrophage', [1, 1, 1], { opacity: 0.85 }); ball([-1.9, 0.4, 0.9], 0.11, '#E59AB8', 'macrophage');
      ball([1.8, 0.9, 0.9], 0.22, '#7B5FB5', 'plasma'); ball([1.84, 0.93, 1.0], 0.1, '#D7A8E8', 'plasma');
      for (const [x, y, z, rr] of [[0.2, -1.0, 0.8, 0.36], [0.7, -0.85, 0.5, 0.3], [0.1, -0.7, 1.15, 0.28], [0.7, -1.1, 1.05, 0.3]]) ball([x, y, z], rr, '#F3E27A', 'fat', [1, 1, 1], { opacity: 0.75 });
      tube([[-2.5, -0.2, -1.0], [-1.0, -0.1, -0.9], [0.2, 0.3, -1.1], [1.4, 0.1, -1.0]], 0.15, '#C8312E', 'capillary');
      tube([[0.6, -1.3, -0.2], [1.2, -0.8, 0.1], [1.7, -0.6, 0.0], [2.3, -0.4, 0.3]], 0.1, '#E8C93C', 'nerve');
    },

    // Three muscle types: skeletal, cardiac and smooth, fibres along x
    muscular() {
      const r = rng(5), hex = [[0, 0]];
      for (let k = 0; k < 6; k++) hex.push([Math.cos(k * Math.PI / 3) * 0.26, Math.sin(k * Math.PI / 3) * 0.26]);
      for (let k = 0; k < 12; k++) hex.push([Math.cos(k * Math.PI / 6 + 0.26) * 0.52, Math.sin(k * Math.PI / 6 + 0.26) * 0.52]);
      const tex = stripes('#E8645A', '#B93C3C'), Z = [-2.5, 0, 2.5];
      hex.forEach(([dy, dz], i) => {
        const f = put(new THREE.CylinderGeometry(0.125, 0.125, 3.4, 12), '#ffffff', 'skeletal', { map: tex });
        f.rotation.z = Math.PI / 2; f.position.set(0, dy, Z[0] + dz);
        if (i > 6 && i % 2 === 0) {
          const n = ball([(r() - 0.5) * 2.4, dy * 1.12, Z[0] + dz * 1.12], 0.07, '#7C4A9C', 'skeletal', [2, 0.7, 0.7]);
          n.position.y = dy * 1.1 + (dy >= 0 ? 0.03 : -0.03);
        }
      });
      // cardiac: branching fibres joined by dark intercalated discs
      const rows = [[-0.45, -0.5], [-0.15, 0.35], [0.2, -0.3], [0.5, 0.45]];
      const lines = rows.map(([y, z0], i) => { const pts = []; for (let k = 0; k <= 6; k++) pts.push([-1.7 + k * 0.57, y + Math.sin(k * 1.1 + i) * 0.08, Z[1] + z0 * 0.8 + Math.cos(k * 0.9 + i * 2) * 0.15]); return pts; });
      lines.forEach((pts, i) => {
        tube(pts, 0.1, '#E8645A', 'cardiac');
        for (let k = 1; k < pts.length - 1; k += 2) {
          const d = put(new THREE.CylinderGeometry(0.125, 0.125, 0.05, 12), '#7A1F2B', 'cardiac'); d.rotation.z = Math.PI / 2; d.position.set(...pts[k]);
          ball([pts[k][0] + 0.28, pts[k][1], pts[k][2]], 0.09, '#7C4A9C', 'cardiac', [1.5, 1, 1]);
        }
        if (i < lines.length - 1) tube([lines[i][2], [(lines[i][3][0] + lines[i + 1][3][0]) / 2, (lines[i][3][1] + lines[i + 1][3][1]) / 2, (lines[i][3][2] + lines[i + 1][3][2]) / 2], lines[i + 1][4]], 0.07, '#E8645A', 'cardiac');
      });
      // smooth: short spindle-shaped fibres, one central nucleus each, offset so tapered ends interlock
      const prof = []; for (let k = 0; k <= 16; k++) { const t = k / 16; prof.push(new THREE.Vector2(Math.max(0.005, 0.15 * Math.pow(Math.sin(Math.PI * t), 0.8)), (t - 0.5) * 1.7)); }
      for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
        const x = (col - 1.5) * 0.9 + (row % 2) * 0.45, y = (row - 1.5) * 0.3, z = Z[2] + ((col + row) % 2) * 0.16 - 0.08;
        const f = put(new THREE.LatheGeometry(prof, 14), '#F4A39B', 'smooth'); f.rotation.z = Math.PI / 2; f.position.set(x, y, z);
        ball([x, y, z], 0.08, '#7C4A9C', 'smooth', [2.2, 0.8, 0.8]);
      }
    },

    // One neuron with myelinated axon, a supporting oligodendrocyte and axon terminals
    nervous() {
      const r = rng(21), gold = '#E3A23A';
      ball([-2.5, 0, 0], 0.55, gold, 'soma'); ball([-2.5, 0, 0], 0.27, '#8E6FB0', 'nucleus');
      const branch = (from, dir, len, rad, depth) => {
        const to = from.clone().addScaledVector(dir, len);
        const mid = from.clone().lerp(to, 0.5).add(V((r() - 0.5) * 0.15, (r() - 0.5) * 0.15, (r() - 0.5) * 0.15));
        tube([[from.x, from.y, from.z], [mid.x, mid.y, mid.z], [to.x, to.y, to.z]], rad, gold, 'dendrite');
        if (depth > 0) for (let k = 0; k < 2; k++) branch(to, dir.clone().add(V((r() - 0.5) * 1.2, (r() - 0.5) * 1.2, (r() - 0.5) * 1.2)).normalize(), len * 0.7, rad * 0.7, depth - 1);
      };
      for (let k = 0; k < 7; k++) {
        const a = Math.PI * 0.55 + (k / 6) * Math.PI * 0.9, b = (r() - 0.5) * 1.4, dir = V(Math.cos(a), Math.sin(a) * Math.cos(b), Math.sin(a) * Math.sin(b)).normalize();
        branch(V(-2.5, 0, 0).addScaledVector(dir, 0.5), dir, 0.55, 0.06, 2);
      }
      const axon = new THREE.CatmullRomCurve3([V(-1.95, 0, 0), V(-0.6, 0.1, 0), V(1.0, -0.15, 0), V(2.4, -0.45, 0), V(3.1, -0.75, 0)]);
      put(new THREE.TubeGeometry(axon, 60, 0.065, 8, false), gold, 'axon');
      const seg = 0.17, gap = 0.035;
      for (let k = 0; k < 5; k++) {
        const t0 = 0.08 + k * 0.17, t1 = t0 + 0.14;
        const a = axon.getPointAt(t0), b = axon.getPointAt(t1), mid = a.clone().add(b).multiplyScalar(0.5), len = a.distanceTo(b);
        const m = put(new THREE.CylinderGeometry(0.17, 0.17, len, 20, 1, true), '#9AE0DC', 'myelin', { opacity: 0.85 });
        m.position.copy(mid); m.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
        for (const p of [a, b]) { const e = put(new THREE.TorusGeometry(0.17, 0.025, 8, 20), '#5BB8B2', 'myelin'); e.position.copy(p); e.quaternion.setFromUnitVectors(V(0, 0, 1), b.clone().sub(a).normalize()); }
        if (k < 4) {
          const n0 = axon.getPointAt(t1 + 0.005), n = put(new THREE.CylinderGeometry(0.085, 0.085, 0.07, 14), '#F5D36B', 'node');
          n.position.copy(n0); n.quaternion.setFromUnitVectors(V(0, 1, 0), axon.getTangentAt(t1 + 0.005));
        }
      }
      void seg; void gap;
      // oligodendrocyte: cell body with a process that wraps one myelin segment
      ball([0.55, 1.15, 0.1], 0.3, '#5FC4BF', 'oligodendrocyte', [1.3, 0.85, 1]); ball([0.55, 1.15, 0.1], 0.12, '#2E8C88', 'oligodendrocyte');
      tube([[0.7, 0.95, 0.1], [0.75, 0.6, 0.1], [0.55, 0.3, 0.05], [0.35, 0.17, 0]], 0.04, '#5FC4BF', 'oligodendrocyte');
      tube([[0.4, 1.0, 0.0], [-0.1, 0.8, 0.1], [-0.5, 0.45, 0.05], [-0.7, 0.2, 0]], 0.035, '#5FC4BF', 'oligodendrocyte');
      // axon terminals with synaptic bulbs
      const end = V(3.1, -0.75, 0);
      for (const [dx, dy, dz] of [[0.5, -0.5, 0.3], [0.7, -0.1, -0.25], [0.4, -0.9, -0.3], [0.8, -0.6, 0.0]]) {
        const to = end.clone().add(V(dx, dy, dz));
        tube([[end.x, end.y, end.z], [end.x + dx * 0.5, end.y + dy * 0.5 + 0.05, end.z + dz * 0.5], [to.x, to.y, to.z]], 0.045, gold, 'axon');
        ball([to.x, to.y, to.z], 0.13, gold, 'synapse');
      }
    },

    // Organelle models: shapes are illustrative, proportions follow textbook figures
    mito() {
      const cap = (r, len) => { const g = new THREE.CapsuleGeometry(r, len, 24, 32); g.rotateZ(Math.PI / 2); return g; };
      put(cap(1.0, 2.2), '#D98A6B', 'outer', { opacity: 0.28 });
      put(cap(0.88, 2.1), '#B0563A', 'inner', { opacity: 0.3 });
      put(cap(0.8, 2.0), '#F3E0A8', 'matrix', { opacity: 0.22 });
      put(cap(0.94, 2.15), '#EAC9B8', 'ims', { opacity: 0.12 });
      for (let k = 0; k < 7; k++) {   // cristae: thin plates across the matrix, alternately offset up and down
        const c = put(new THREE.CylinderGeometry(0.68, 0.68, 0.06, 28), '#8C3A22', 'cristae');
        c.rotation.z = Math.PI / 2; c.position.set(-1.6 + k * 0.53, (k % 2 ? 0.14 : -0.14), 0); c.scale.set(1, 1, 1);
      }
      const dna = put(new THREE.TorusGeometry(0.2, 0.04, 8, 24), '#3B4F9C', 'mtdna'); dna.position.set(0.5, -0.15, 0.2); dna.rotation.set(1, 0.4, 0);
    },

    nucleus() {
      put(new THREE.SphereGeometry(1.7, 40, 28), '#8C97C4', 'envelope', { opacity: 0.25 });
      put(new THREE.SphereGeometry(1.62, 32, 24), '#3B4F9C', 'chromatin', { opacity: 0.16 });
      const r = rng(9), pts = [];
      for (let i = 0; i < 260; i++) { const a = i / 260 * Math.PI * 30, rr = 0.5 + 0.7 * r(); pts.push(V(Math.sin(a) * rr, Math.cos(a * 1.3) * rr, Math.sin(a * 0.7 + 1) * rr)); }
      put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 400, 0.035, 5, true), '#3B4F9C', 'chromatin');
      ball([0.55, 0.2, 0.35], 0.38, '#6B3A7A', 'nucleolus');
      const gold = 2.399963;
      for (let i = 0; i < 40; i++) {   // pores spread evenly over the surface (Fibonacci sphere)
        const y = 1 - (i + 0.5) / 20, rad = Math.sqrt(Math.max(0, 1 - y * y)), th = i * gold, n = V(Math.cos(th) * rad, y, Math.sin(th) * rad);
        const t = put(new THREE.TorusGeometry(0.11, 0.035, 8, 16), '#C39A2E', 'pore');
        t.position.copy(n.clone().multiplyScalar(1.7)); t.quaternion.setFromUnitVectors(V(0, 0, 1), n);
      }
    },

    'er-rough'() {
      const r = rng(4);
      for (let k = 0; k < 5; k++) {   // stacked, slightly wavy sheets
        const g = new THREE.PlaneGeometry(3.4, 2.2, 24, 16), pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * 1.6 + k) * 0.08 + Math.cos(pos.getY(i) * 2 + k) * 0.06);
        g.computeVertexNormals();
        const m = put(g, '#6C7F3A', 'cisternae'); m.rotation.x = -Math.PI / 2; m.position.y = k * 0.38 - 0.76;
        if (k < 4) { const l = put(new THREE.BoxGeometry(3.3, 0.22, 2.1), '#D6DEB0', 'lumen', { opacity: 0.18 }); l.position.y = k * 0.38 - 0.57; }
        const ribo = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 8, 6), new THREE.MeshStandardMaterial({ color: '#2F5FA8', roughness: 0.5 }), 90), d = new THREE.Object3D();
        for (let i = 0; i < 90; i++) { d.position.set((r() - 0.5) * 3.2, k * 0.38 - 0.76 + 0.09, (r() - 0.5) * 2.0); d.updateMatrix(); ribo.setMatrixAt(i, d.matrix); }
        ribo.userData.part = 'ribosome'; ribo.userData.base = 1; group.add(ribo); meshes.push(ribo);
      }
    },

    golgi() {
      const cols = ['#E3C36A', '#D4AC45', '#C39A2E', '#A98121', '#8F6D14'], part = ['cis', 'medial', 'medial', 'medial', 'trans'];
      cols.forEach((c, k) => {   // curved stack of flattened discs, widest in the middle
        const w = 1.5 - Math.abs(k - 2) * 0.12, m = put(new THREE.SphereGeometry(1, 32, 12), c, part[k]);
        m.scale.set(w, 0.07, w * 0.65); m.position.set(0, k * 0.3 - 0.6, 0);
      });
      const r = rng(15);
      for (let i = 0; i < 14; i++) {
        const low = i < 7, a = r() * Math.PI * 2, d = 0.8 + r() * 0.5;
        ball([Math.cos(a) * d, low ? -0.95 + r() * 0.2 : 0.75 + r() * 0.5, Math.sin(a) * d * 0.7], 0.08, '#E8A33D', 'vesicles');
      }
    },

    lyso() {
      put(new THREE.SphereGeometry(1.4, 36, 24), '#7A4A8C', 'membrane', { opacity: 0.3 });
      put(new THREE.SphereGeometry(1.32, 32, 20), '#C9B0D6', 'lumen', { opacity: 0.18 });
      const r = rng(31);
      for (let i = 0; i < 70; i++) { const v = V(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(Math.cbrt(r()) * 1.1); ball(v.toArray(), 0.07, '#E8A33D', 'enzymes'); }
    },

    perox() {
      put(new THREE.SphereGeometry(1.25, 36, 24), '#3E8C8C', 'membrane', { opacity: 0.3 });
      put(new THREE.SphereGeometry(1.18, 32, 20), '#A8D5D5', 'matrix', { opacity: 0.2 });
      const c = put(new THREE.BoxGeometry(0.75, 0.75, 0.75), '#1F5C5C', 'core'); c.rotation.set(0.5, 0.6, 0.2);
      const r = rng(33);
      for (let i = 0; i < 40; i++) { const v = V(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(0.6 + r() * 0.5); ball(v.toArray(), 0.05, '#A8D5D5', 'matrix'); }
    },

    microfilament() {   // two strands of beads twisted into a double helix
      const n = 46, R = 0.34, step = 0.17, strand = off => Array.from({ length: n }, (_, k) => { const a = k * 0.55 + off; return V(Math.cos(a) * R, (k - n / 2) * step * 0.55 * 1.0, Math.sin(a) * R); });
      for (const off of [0, Math.PI]) strand(off).forEach((p, k) => ball(p.toArray(), 0.16, '#D9534F', 'actin'));
      ball([0, (n / 2) * step * 0.55 + 0.25, 0], 0.16, '#F0AD4E', 'plus'); ball([0, -(n / 2) * step * 0.55 - 0.3, 0], 0.16, '#5BC0DE', 'minus');
      group.rotation.z = Math.PI / 2;
    },

    intermediate() {    // three coiled strands twisted into a rope, with bands where units overlap
      const n = 90, len = 7;
      for (let s = 0; s < 3; s++) {
        const pts = Array.from({ length: n }, (_, k) => { const t = k / (n - 1), a = t * Math.PI * 9 + s * Math.PI * 2 / 3; return V((t - 0.5) * len, Math.cos(a) * 0.22, Math.sin(a) * 0.22); });
        tube(pts.map(p => p.toArray()), 0.09, '#8E6FB0', 'strand');
      }
      for (let k = 0; k < 6; k++) { const b = put(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 20, 1, true), '#C9B0D6', 'overlap', { opacity: 0.55 }); b.rotation.z = Math.PI / 2; b.position.x = (k - 2.5) * 1.1; }
    },

    microtubule() {     // 13 protofilaments of alternating alpha and beta tubulin
      const N = 13, rows = 14, R = 0.9, dim = 0.26, geo = new THREE.SphereGeometry(0.13, 12, 8);
      const mats = { alpha: new THREE.MeshStandardMaterial({ color: '#2E7D9A', roughness: 0.5 }), beta: new THREE.MeshStandardMaterial({ color: '#E8A33D', roughness: 0.5 }) };
      const inst = { alpha: new THREE.InstancedMesh(geo, mats.alpha, N * rows), beta: new THREE.InstancedMesh(geo, mats.beta, N * rows) }, d = new THREE.Object3D();
      let ia = 0, ib = 0;
      for (let p = 0; p < N; p++) for (let k = 0; k < rows * 2; k++) {
        const a = p / N * Math.PI * 2 + k * 0.0, y = (k - rows) * dim * 0.5 + p * 0.01;
        d.position.set(Math.cos(a) * R, y + (p / N) * dim * 1.0, Math.sin(a) * R); d.scale.set(1, 1.1, 1); d.updateMatrix();
        if (k % 2 === 0 && ia < N * rows) inst.alpha.setMatrixAt(ia++, d.matrix); else if (ib < N * rows) inst.beta.setMatrixAt(ib++, d.matrix);
      }
      for (const [k, m] of Object.entries(inst)) { m.userData.part = k; m.userData.base = 1; m.instanceMatrix.needsUpdate = true; group.add(m); meshes.push(m); }
      const l = put(new THREE.CylinderGeometry(0.62, 0.62, rows * dim, 24, 1, true), '#BFD9E6', 'lumen', { opacity: 0.2 });
      group.rotation.z = Math.PI / 2;
    },

    centrosome() {
      const cen = (pos, rotZ) => {
        const g = new THREE.Group(); g.position.set(...pos); g.rotation.z = rotZ; group.add(g);
        for (let k = 0; k < 9; k++) {
          const a = k / 9 * Math.PI * 2, t = put(new THREE.CylinderGeometry(0.07, 0.07, 1.4, 8), '#C0392B', 'centriole');
          group.remove(t); g.add(t); t.position.set(Math.cos(a) * 0.32, 0, Math.sin(a) * 0.32); t.rotation.y = a + 0.5;
        }
      };
      cen([0, 0, 0], 0); cen([0.95, -0.3, 0], Math.PI / 2);
      put(new THREE.SphereGeometry(1.5, 32, 20), '#F3C6C0', 'pcm', { opacity: 0.16 });
      const r = rng(41);
      for (let i = 0; i < 60; i++) { const v = V(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(1.15 + r() * 0.3); ball(v.toArray(), 0.05, '#E8A8A0', 'pcm'); }
      for (let k = 0; k < 9; k++) {
        const v = V(r() - 0.5, r() - 0.5, r() - 0.5).normalize(), w = v.clone().multiplyScalar(1.4), e = v.clone().multiplyScalar(3.2 + r() * 0.8);
        tube([w.toArray(), w.clone().lerp(e, 0.5).add(V(0, 0.1, 0)).toArray(), e.toArray()], 0.04, '#2E7D9A', 'mt');
      }
    },

    // Bacterial cell (E. coli): capsule envelope, nucleoid, plasmids, ribosomes, pili and flagella. Adapted from the supplied procedural model.
    ecoli() {
      const r = rng(7), R = 2, L = 4;
      const body = new THREE.CapsuleGeometry(R, L, 24, 48); body.rotateZ(Math.PI / 2);
      put(body, '#4ade80', 'envelope', { opacity: 0.35 });
      const cy = new THREE.CapsuleGeometry(R * 0.95, L * 0.95, 24, 48); cy.rotateZ(Math.PI / 2);
      put(cy, '#22c55e', 'cytoplasm', { opacity: 0.14 });
      const pts = [];
      for (let i = 0; i < 300; i++) { const a = (i / 300) * Math.PI * 24; pts.push(V((i / 300 - 0.5) * 3.2, Math.sin(a) * 0.6 + (r() - 0.5) * 0.4, Math.cos(a * 1.3) * 0.6 + (r() - 0.5) * 0.4)); }
      put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 300, 0.05, 6, true), '#f87171', 'nucleoid');
      for (let k = 0; k < 3; k++) {
        const p = put(new THREE.TorusGeometry(0.3, 0.03, 8, 24), '#facc15', 'plasmid');
        p.position.set((r() - 0.5) * 3.0, (r() - 0.5) * 1.2, (r() - 0.5) * 1.2); p.rotation.set(r() * Math.PI, r() * Math.PI, 0);
      }
      const ribo = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshStandardMaterial({ color: '#60a5fa', roughness: 0.5 }), 150), d = new THREE.Object3D();
      for (let k = 0; k < 150; k++) { d.position.set((r() - 0.5) * 3.4, (r() - 0.5) * 1.5, (r() - 0.5) * 1.5); d.updateMatrix(); ribo.setMatrixAt(k, d.matrix); }
      ribo.userData.part = 'ribosome'; ribo.userData.base = 1; group.add(ribo); meshes.push(ribo);
      const pos = body.attributes.position, nor = body.attributes.normal, up = V(0, 1, 0), n = V(0, 0, 0);
      for (let k = 0; k < 160; k++) {
        const i = Math.floor(r() * pos.count); n.fromBufferAttribute(nor, i).normalize();
        const g = new THREE.CylinderGeometry(0.02, 0.02, 0.5 * (0.8 + r() * 0.5), 5); g.translate(0, 0.25, 0);
        const m = put(g, '#16a34a', 'pilus'); m.position.set(pos.getX(i), pos.getY(i), pos.getZ(i)); m.quaternion.setFromUnitVectors(up, n);
      }
      for (let f = 0; f < 4; f++) {
        const fp = []; for (let k = 0; k <= 40; k++) { const s = k / 40; fp.push([-(R + L / 2) + 0.2 - s * 6, Math.sin(s * 14 + f * 1.6) * 0.22 * s, (f - 1.5) * 0.45 + Math.cos(s * 14 + f * 1.6) * 0.22 * s]); }
        tube(fp, 0.06, '#15803d', 'flagellum');
      }
    },

    // T4-type bacteriophage: icosahedral head with DNA, collar, contractile sheath on a tube, baseplate, spikes and six jointed tail fibres.
    // Adapted from the supplied model (static pose, original proportions).
    bacteriophage() {
      const H = put(new THREE.IcosahedronGeometry(1.6, 0), '#06b6d4', 'head', { opacity: 0.5, flatShading: true, metalness: 0.4, roughness: 0.2 });
      H.scale.set(1, 1.5, 1); H.position.y = 4.0;
      const D = put(new THREE.TorusKnotGeometry(0.7, 0.25, 120, 16, 3, 4), '#ef4444', 'dna', { wireframe: true }); D.scale.set(1, 1.2, 1); D.position.y = 4.0;
      const col = put(new THREE.CylinderGeometry(0.4, 0.5, 0.2, 6), '#38bdf8', 'collar', { flatShading: true }); col.position.y = 1.7;
      put(new THREE.CylinderGeometry(0.12, 0.12, 2.4, 8), '#94a3b8', 'tube').position.y = 1.6;
      for (let k = 0; k < 12; k++) put(new THREE.CylinderGeometry(0.35, 0.35, 0.18, 6), '#64748b', 'sheath', { metalness: 0.5 }).position.y = 1.6 - 1.1 + k * 0.2;
      const bp = put(new THREE.CylinderGeometry(0.6, 0.7, 0.25, 6), '#22d3ee', 'baseplate', { flatShading: true }); bp.position.y = 0.3;
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const sp = put(new THREE.ConeGeometry(0.06, 0.3, 4), '#475569', 'spike'); sp.position.set(Math.cos(a) * 0.55, 0.1, Math.sin(a) * 0.55); sp.rotation.x = Math.PI;
        const anchor = new THREE.Group(); anchor.position.set(Math.cos(a) * 0.5, 0.3, Math.sin(a) * 0.5); anchor.rotation.y = -a; group.add(anchor);
        const upper = new THREE.Group(); upper.rotation.z = -Math.PI / 4; anchor.add(upper);
        const ug = new THREE.CylinderGeometry(0.06, 0.04, 1.8, 4); ug.translate(0, -0.9, 0);
        upper.add(put(ug, '#0891b2', 'fiber', { flatShading: true }));
        const lower = new THREE.Group(); lower.position.set(0, -1.8, 0); lower.rotation.z = Math.PI / 2.2; upper.add(lower);
        const lg = new THREE.CylinderGeometry(0.03, 0.015, 2.2, 4); lg.translate(0, -1.1, 0);
        lower.add(put(lg, '#0891b2', 'fiber'));
      }
    },
  };


  // Atom models are data-driven: balls at 25% of the van der Waals radius, sticks between bonded atoms
  function buildAtoms(m, elements) {
    const pos = m.atoms.map(a => V(...a.xyz));
    m.atoms.forEach((a, i) => { const e = elements[a.el]; ball(pos[i].toArray(), e.vdw ? e.vdw * 0.25 : e.covalent * 0.35, e.color, a.part ?? a.el, [1, 1, 1], { roughness: 0.35 }); });
    for (const [i, j] of m.bonds) {
      const d = pos[j].clone().sub(pos[i]), g = new THREE.CylinderGeometry(0.06, 0.06, d.length(), 10);
      const c = put(g, '#b8bcc4', (m.atoms[i].el === 'H' ? m.atoms[j] : m.atoms[i]).part ?? m.atoms[i].el);
      c.position.copy(pos[i].clone().add(pos[j]).multiplyScalar(0.5)); c.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
    }
  }

  function draw() { renderer.render(scene, camera); }
  function resize() {
    const w = host.clientWidth || 600, h = host.clientHeight || 400;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); draw();
  }
  new ResizeObserver(resize).observe(host);

  function show(id, model) {
    group.traverse(o => { o.geometry?.dispose(); o.material?.map?.dispose(); o.material?.dispose?.(); });
    if (sl.scene) for (const o of [...sl.scene.children]) if (o.userData.isClone) sl.scene.remove(o);
    renderer.clippingPlanes = []; sl.pct = 50; sl.cut3d = false;
    group.clear(); group.rotation.set(0, 0, 0); meshes = []; picked = null;
    if (model?.atoms) buildAtoms(model, elements); else BUILD[id]();
    const box = new THREE.Box3().setFromObject(group), c = box.getCenter(V(0, 0, 0)), reach = box.getSize(V(0, 0, 0)).length() / 2;
    controls.target.copy(c);
    // distance that fits the model's height and width in the view, so tall models (the phage) are not cropped
    resize();
    const sz = box.getSize(V(0, 0, 0)), t = Math.tan(camera.fov * Math.PI / 360);
    const d = Math.max(sz.y / (2 * t), sz.x / (2 * t * camera.aspect)) * 1.3 + sz.z / 2;
    camera.position.copy(c).add(V(0.35, 0.28, 1).normalize().multiplyScalar(d));
    controls.minDistance = reach * 0.6; controls.maxDistance = reach * 6;
    controls.update(); renderer.domElement.setAttribute('aria-label', `${id} model, schematic`);
    resize(); cloneIntoSlice(); drawSlice();
  }

  function select(part) {
    picked = part;
    const sel = getComputedStyle(document.documentElement).getPropertyValue('--select').trim() || '#B8336A';
    for (const m of meshes) {
      const on = !part || m.userData.part === part;
      m.material.emissive.set(part && on ? sel : '#000000');
      m.material.emissiveIntensity = part && on ? 0.35 : 0;
      m.material.opacity = on ? m.userData.base : Math.min(m.userData.base, 0.2);
      m.material.transparent = m.material.opacity < 1;
      m.material.depthWrite = m.material.opacity >= 1;
    }
    draw(); drawSlice();
  }


  // ── camera views and cross-section ──
  const VIEWS = { ant: [0, 0, 1], post: [0, 0, -1], r: [-1, 0, 0], l: [1, 0, 0], sup: [0, 1, 0.02], inf: [0, -1, 0.02] };
  const AXES = { transverse: [1, 'y'], sagittal: [0, 'x'], coronal: [2, 'z'] };   // [component index, name]
  let viewDone = null;
  controls.addEventListener('start', () => viewDone?.(null));
  function setView(name, mark) {
    const d = V(...VIEWS[name]).normalize(), dist = camera.position.distanceTo(controls.target);
    camera.position.copy(controls.target).addScaledVector(d, dist); controls.update(); draw(); mark?.(name); viewDone = mark;
  }
  const sl = { axis: 'transverse', pct: 50, cut3d: false, canvas: null, r: null, scene: null, cam: null, bg: '#F5F3EC' };
  function slabPlanes(th) {
    const b = new THREE.Box3().setFromObject(group), i = AXES[sl.axis][0], lo = b.min.getComponent(i), hi = b.max.getComponent(i), pos = lo + (hi - lo) * sl.pct / 100;
    const n = V(0, 0, 0).setComponent(i, 1);
    return { n, pos, box: b, i, planes: [new THREE.Plane(n.clone(), -(pos - th)), new THREE.Plane(n.clone().negate(), pos + th)] };
  }
  function applyClip() {
    if (!group.children.length) return;
    const { n, pos } = slabPlanes(0);
    renderer.clippingPlanes = sl.cut3d ? [new THREE.Plane(n, -pos)] : [];
    draw(); drawSlice();
  }
  function attachSlice(canvas, { background } = {}) {
    sl.canvas = canvas; if (background) sl.bg = background;
    sl.r = new THREE.WebGLRenderer({ canvas, antialias: true });
    sl.r.setPixelRatio(Math.min(devicePixelRatio, 2));
    sl.scene = new THREE.Scene(); sl.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
    sl.scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 2.2)); sl.scene.add(new THREE.DirectionalLight(0xffffff, 1.2));
    cloneIntoSlice();
  }
  function cloneIntoSlice() {
    if (!sl.scene) return;
    for (const o of [...sl.scene.children]) if (o.userData.isClone) sl.scene.remove(o);
    const c = group.clone(true); c.userData.isClone = true; sl.scene.add(c);
  }
  function drawSlice() {
    if (!sl.r || !group.children.length) return;
    const b = new THREE.Box3().setFromObject(group), size = b.getSize(V(0, 0, 0)), ctr = b.getCenter(V(0, 0, 0)), i = AXES[sl.axis][0];
    const th = size.getComponent(i) * 0.012, { n, pos, planes } = slabPlanes(th);
    const w = Math.max(canvas0().clientWidth, 120), h = Math.round(w * 3 / 4);
    sl.r.setSize(w, h, false); sl.r.setClearColor(new THREE.Color(sl.bg)); sl.r.clippingPlanes = planes;
    const others = [0, 1, 2].filter(k => k !== i), half = Math.max(size.getComponent(others[0]), size.getComponent(others[1])) * 0.55 || 1;
    sl.cam.left = -half * w / h; sl.cam.right = half * w / h; sl.cam.top = half; sl.cam.bottom = -half; sl.cam.updateProjectionMatrix();
    sl.cam.up.set(0, i === 1 ? 0 : 1, i === 1 ? 1 : 0);
    sl.cam.position.copy(ctr).setComponent(i, pos + size.getComponent(i)); sl.cam.lookAt(ctr.clone().setComponent(i, pos));
    sl.scene.children.find(o => o.isDirectionalLight)?.position.copy(sl.cam.position);
    sl.r.render(sl.scene, sl.cam);
  }
  const canvas0 = () => sl.canvas;
  function setAxis(a) { sl.axis = a; applyClip(); }
  function setSlice(pct) { sl.pct = pct; applyClip(); }
  function setCut3d(on) { sl.cut3d = on; applyClip(); }
  function resetSlice() { sl.pct = 50; sl.cut3d = false; sl.axis = 'transverse'; applyClip(); }

  let down = null;
  renderer.domElement.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
    const rc = renderer.domElement.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - rc.left) / rc.width) * 2 - 1, -((e.clientY - rc.top) / rc.height) * 2 + 1), camera);
    const hits = ray.intersectObjects(meshes, false), solid = hits.find(h => h.object.userData.base === 1) ?? hits[0];
    onPick(solid ? solid.object.userData.part : null);
  });

  return { show, select, resize, redraw: draw, setView, attachSlice, setAxis, setSlice, setCut3d, resetSlice, drawSlice, get selected() { return picked; } };
}
