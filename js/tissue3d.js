// Three.js view of one schematic tissue: orbit, click a part to pick it.
// Shapes are drawn from textbook-style reference figures, not measured data. Three.js loads from vendor/three on first use.

export async function createTissueView(host, { onPick }) {
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
  };

  function draw() { renderer.render(scene, camera); }
  function resize() {
    const w = host.clientWidth || 600, h = host.clientHeight || 400;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); draw();
  }
  new ResizeObserver(resize).observe(host);

  function show(id) {
    group.traverse(o => { o.geometry?.dispose(); o.material?.map?.dispose(); o.material?.dispose?.(); });
    group.clear(); meshes = []; picked = null;
    BUILD[id]();
    const box = new THREE.Box3().setFromObject(group), c = box.getCenter(V(0, 0, 0)), reach = box.getSize(V(0, 0, 0)).length() / 2;
    controls.target.copy(c);
    camera.position.copy(c).add(V(reach * 0.8, reach * 0.65, reach * 1.75));
    controls.minDistance = reach * 0.6; controls.maxDistance = reach * 6;
    controls.update(); renderer.domElement.setAttribute('aria-label', `${id} tissue, schematic`);
    resize();
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
    draw();
  }

  let down = null;
  renderer.domElement.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
    const rc = renderer.domElement.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - rc.left) / rc.width) * 2 - 1, -((e.clientY - rc.top) / rc.height) * 2 + 1), camera);
    const hits = ray.intersectObjects(meshes, false), solid = hits.find(h => h.object.userData.base === 1) ?? hits[0];
    onPick(solid ? solid.object.userData.part : null);
  });

  return { show, select, resize, redraw: draw, get selected() { return picked; } };
}
