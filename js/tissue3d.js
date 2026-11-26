// Three.js view of one schematic tissue: orbit, click a part to pick it.
// Shapes are drawn from textbook-style reference figures, not measured data. Three.js loads from vendor/three on first use.

// Schematic model colours for tissue figures. Documented in DESIGN.md as model material colours.
const TUBULIN_BETA = '#E8A33D', RIBOSOME = '#2F5FA8', TUBULIN_ALPHA = '#2E7D9A', SURFACE_LAYER = '#E8A33D', BASAL_LAYER = '#D98E2B', MIDDLE_LAYER = '#E0B15C', RIBOSOME_NEURON = '#60a5fa';

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

  // Keyboard orbit for people without a pointer: arrows rotate 10 degrees, + and - zoom
  if (!host.hasAttribute('tabindex')) host.tabIndex = 0;
  host.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight ArrowUp ArrowDown + -');
  host.addEventListener('keydown', e => {
    const step = Math.PI / 18, turn = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    const zoom = { '+': 0.9, '=': 0.9, '-': 1.1 }[e.key];
    if (!turn && !zoom) return;
    e.preventDefault();
    const off = camera.position.clone().sub(controls.target), sph = new THREE.Spherical().setFromVector3(off);
    if (turn) { sph.theta += turn[0]; sph.phi = Math.min(Math.PI - 0.05, Math.max(0.05, sph.phi + turn[1])); }
    if (zoom) sph.radius = Math.min(controls.maxDistance, Math.max(controls.minDistance, sph.radius * zoom));
    camera.position.copy(controls.target).add(off.setFromSpherical(sph));
    controls.update();
  });
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


  // Generic epithelial sheet: hexagonal cells in a staggered grid on a basement membrane. Each layer: {part, color, r, h, y, shift}
  function epi(layers) {
    put(new THREE.BoxGeometry(5.2, 0.1, 3.2), '#B7A7C9', 'basement');
    const cols = 6, rows = 3, pitch = 0.85;
    for (const L of layers) for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const k = i * rows + j; if (L.skip?.includes(k)) continue;
      const x = (i - (cols - 1) / 2) * pitch + (j % 2) * 0.25 - 0.12 + (L.shift ?? 0), z = (j - (rows - 1) / 2) * pitch;
      const c = put(new THREE.CylinderGeometry(L.r, L.r * 0.96, L.h, 6), L.color, L.part, L.h < 0.2 ? {} : { opacity: 0.6 }); c.position.set(x, 0.05 + L.y + L.h / 2, z);
      const flat = L.h < 0.2;
      ball([x, 0.05 + L.y + (L.nuc ?? 0.5) * L.h, z], flat ? 0.17 : 0.15, '#8E5DB0', 'nucleus', flat ? [1, 0.55, 1] : [0.95, 1.15, 0.95]);
    }
  }

  // Multilocular fat cells (brown and beige): cytoplasm shell, central nucleus, small lipid droplets, mitochondria, capillary and nerve
  function fatCells(r, o) {
    const R = 0.72, up = V(0, 1, 0);
    const inside = (rad) => { for (;;) { const p = V(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1); if (p.length() <= 1) return p.multiplyScalar(rad); } };
    for (const [x, y, z] of [[-1.5, 0.7, 0], [0, 0.7, 0.2], [1.5, 0.7, -0.1], [0, -0.9, 0.3]]) {
      const c = V(x, y, z);
      ball([x, y, z], R, '#D9A66C', 'cytoplasm', [1, 1, 1], { opacity: 0.3 });
      const nuc = inside(R * 0.25);
      ball(c.clone().add(nuc).toArray(), 0.2, '#8E5DB0', 'nucleus');
      const used = [[nuc, 0.24]];
      const place = (n, rad, col, part, scale) => {
        for (let k = 0, t = 0; k < n && t < 300; t++) {
          const p = inside(R * 0.8 - rad);
          if (!used.every(([q, qr]) => q.distanceTo(p) > qr + rad * 0.9)) continue;
          used.push([p, rad]); k++;
          const m = ball(c.clone().add(p).toArray(), rad, col, part, scale ?? [1, 1, 1], part === 'droplets' ? { opacity: 0.9 } : {});
          if (scale) m.rotation.set(r() * 3, r() * 3, r() * 3);
        }
      };
      place(o.nDrop, o.dropR, '#F3D34A', 'droplets');
      place(o.nMito, 0.08, o.mito, 'mitochondria', [2, 0.8, 0.8]);
    }
    tube([[-2.5, -0.1, 0], [-0.8, -0.1, 0.1], [0.8, -0.1, 0.1], [2.5, -0.1, 0]], 0.09, '#C8312E', 'capillary');
    tube([[2.3, -1.3, 0.6], [1.7, -0.6, 0.7], [1.0, -0.1, 0.55], [0.5, 0.15, 0.55]], 0.035, '#E8C93C', 'nerve');
  }

  const BUILD = {
    // Simple columnar epithelium on a basal lamina, over connective tissue with a capillary and a nerve ending
    epithelial() {
      const cols = 5, rows = 3, pitch = 0.95, r = rng(3);
      put(new THREE.BoxGeometry(5.2, 1.5, 3.2), '#E7A99E', 'connective').position.set(0, -0.45, 0);
      // Basal lamina in two layers: dark lamina densa on the connective tissue, pale lamina lucida under the cells
      put(new THREE.BoxGeometry(5.2, 0.07, 3.2), '#6F5A92', 'densa').position.set(0, 0.33, 0);
      put(new THREE.BoxGeometry(5.2, 0.05, 3.2), '#D8CCEA', 'lucida').position.set(0, 0.385, 0);
      tube([[-2.6, -0.55, 0.3], [-1.2, -0.45, 0.2], [0.3, -0.6, 0.35], [1.6, -0.5, 0.25], [2.6, -0.55, 0.3]], 0.17, '#B23A3A', 'capillary');
      tube([[-1.9, -1.1, -0.8], [-1.6, -0.4, -0.7], [-1.45, 0.3, -0.6], [-1.3, 0.9, -0.55]], 0.035, '#E6C34A', 'nerve');
      tube([[-0.4, -1.1, 0.9], [-0.2, -0.3, 0.8], [0.0, 0.3, 0.7], [0.1, 0.8, 0.6]], 0.035, '#E6C34A', 'nerve');
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const x = (i - (cols - 1) / 2) * pitch + (j % 2) * 0.25 - 0.12, z = (j - (rows - 1) / 2) * pitch, role = (i * rows + j) % 5;
        put(new THREE.CylinderGeometry(0.44, 0.4, 1.5, 6), SURFACE_LAYER, 'cell').position.set(x, 1.15, z);
        ball([x, 0.78, z], 0.3, '#8E5DB0', 'nucleus', [0.9, 1.15, 0.9]);
        // Junctions: tight belt at the apex, adherens belt below it, then desmosome spots and gap junction dots on the sides
        const belt = (y, rad, color, part) => { const m = put(new THREE.TorusGeometry(rad, 0.03, 8, 24), color, part); m.rotation.x = Math.PI / 2; m.position.set(x, y, z); };
        belt(1.8, 0.42, '#3FA7A7', 'tight'); belt(1.66, 0.43, '#E86C5D', 'adherens');
        const side = (a, y, geom, color, part, rad = 0.43) => { const m = put(geom, color, part); m.position.set(x + Math.cos(a) * rad, y, z + Math.sin(a) * rad); m.rotation.set(0, -a, Math.PI / 2); return m; };
        for (const a of [0.4, 2.5, 4.4]) side(a, 1.28, new THREE.CylinderGeometry(0.09, 0.09, 0.04, 14), '#D9A441', 'desmosome');
        for (const a of [1.4, 3.5, 5.4]) for (const [dy, da] of [[0.9, 0], [1.0, 0.1], [0.9, 0.2]]) side(a + da, dy, new THREE.SphereGeometry(0.035, 10, 8), '#8BC34A', 'gap', 0.44);
        // Hemidesmosomes: half-discs on the basal surface, anchoring the cell to the lamina lucida
        for (const a of [0.3, 2.4, 4.5]) { const m = ball([x + Math.cos(a) * 0.27, 0.42, z + Math.sin(a) * 0.27], 0.085, '#C2569B', 'hemidesmosome', [1, 0.4, 1]); m.position.y = 0.41; }
        // Apical surface: stereocilia, cilia (with an inner microtubule core) or microvilli, by cell
        const top = 1.9;
        if (role === 0) for (let k = 0; k < 9; k++) {
          const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.32, h = 0.55 - 0.18 * (d / 0.32);
          put(new THREE.CylinderGeometry(0.03, 0.03, h, 6), '#4A8FD6', 'stereocilia').position.set(x + Math.cos(a) * d, top + h / 2, z + Math.sin(a) * d);
        } else if (role === 2) for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 2 + 0.3, d = 0.26 * (k % 2 ? 1 : 0.5), tx = x + Math.cos(a) * d, tz = z + Math.sin(a) * d, lean = 0.12;
          const pts = [[tx, top, tz], [tx + Math.cos(a) * lean * 0.4, top + 0.35, tz + Math.sin(a) * lean * 0.4], [tx + Math.cos(a) * lean, top + 0.7, tz + Math.sin(a) * lean]];
          tube(pts, 0.04, '#8EC5F0', 'cilia', { opacity: 0.55 });
          for (const [ox, oz] of [[0, 0], [0.015, 0.012], [-0.015, 0.012], [0, -0.018]]) tube(pts.map(q => [q[0] + ox, q[1], q[2] + oz]), 0.008, '#E8A33D', 'microtubule');
        } else for (let k = 0; k < 12; k++) {
          const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.34;
          put(new THREE.CylinderGeometry(0.018, 0.018, 0.24, 5), '#8EC5F0', 'apical').position.set(x + Math.cos(a) * d, 1.99, z + Math.sin(a) * d);
        }
        // Microtubules running apex to base inside the cell: drawn on the cell wall so they show through the cell
        for (const a of [1.0, 3.2]) tube([[x + Math.cos(a) * 0.2, 0.5, z + Math.sin(a) * 0.2], [x + Math.cos(a) * 0.3, 1.2, z + Math.sin(a) * 0.3], [x + Math.cos(a) * 0.2, 1.85, z + Math.sin(a) * 0.2]], 0.012, '#E8A33D', 'microtubule', { opacity: 0.9 });
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
      // Mast cell: round, granule-filled, beside the capillary
      ball([1.2, 0.0, -0.6], 0.3, '#2F8F9D', 'mast', [1, 1, 1], { opacity: 0.6 }); ball([1.2, 0.0, -0.6], 0.12, '#1F5E73', 'mast');
      for (let k = 0; k < 14; k++) { const a = r() * Math.PI * 2, b = Math.acos(2 * r() - 1), d = 0.2 + r() * 0.08; ball([1.2 + Math.sin(b) * Math.cos(a) * d, Math.cos(b) * d, -0.6 + Math.sin(b) * Math.sin(a) * d], 0.04, '#0F3F52', 'mast'); }
      // Mesenchymal stem cell: small spindle with a few short processes
      { const m = ball([-0.2, -0.1, -0.4], 0.32, '#C9A0DC', 'msc', [1, 0.3, 0.45]); m.rotation.y = -0.5; const n = ball([-0.2, -0.1, -0.4], 0.12, '#7E4FA0', 'msc', [1.1, 0.8, 1]); n.rotation.y = -0.5;
        tube([[-0.5, -0.1, -0.25], [-0.75, -0.05, -0.1]], 0.025, '#C9A0DC', 'msc'); tube([[0.1, -0.1, -0.55], [0.3, -0.05, -0.7]], 0.025, '#C9A0DC', 'msc'); }
      for (const [x, y, z, rr] of [[0.2, -1.0, 0.8, 0.36], [0.7, -0.85, 0.5, 0.3], [0.1, -0.7, 1.15, 0.28], [0.7, -1.1, 1.05, 0.3]]) ball([x, y, z], rr, '#F3E27A', 'fat', [1, 1, 1], { opacity: 0.75 });
      tube([[-2.5, -0.2, -1.0], [-1.0, -0.1, -0.9], [0.2, 0.3, -1.1], [1.4, 0.1, -1.0]], 0.15, '#C8312E', 'capillary');
      tube([[0.6, -1.3, -0.2], [1.2, -0.8, 0.1], [1.7, -0.6, 0.0], [2.3, -0.4, 0.3]], 0.1, '#E8C93C', 'nerve');
    },

    // Blood: plasma with red cells, five white cell types and platelets
    blood() {
      const r = rng(31), taken = [];
      put(new THREE.BoxGeometry(5.2, 3, 3.2), '#E8C77A', 'plasma', { opacity: 0.14 });
      const lobes = (c, pts, rad, col, part) => { pts.forEach(p => ball([c[0] + p[0], c[1] + p[1], c[2] + p[2]], rad, col, part)); for (let i = 1; i < pts.length; i++) tube([pts[i - 1], pts[i]].map(p => [c[0] + p[0], c[1] + p[1], c[2] + p[2]]), rad * 0.3, col, part); };
      const granules = (c, R, n, rad, col, part, seed) => { const g = rng(seed); for (let k = 0; k < n; k++) { const a = g() * Math.PI * 2, b = Math.acos(2 * g() - 1), d = R * (0.55 + g() * 0.4); ball([c[0] + Math.sin(b) * Math.cos(a) * d, c[1] + Math.cos(b) * d, c[2] + Math.sin(b) * Math.sin(a) * d], rad, col, part); } };
      const wbc = (c, R, col, part) => { ball(c, R, col, part, [1, 1, 1], { opacity: 0.55 }); taken.push([...c, R]); };
      let c = [-1.7, 0.35, 0.2];
      wbc(c, 0.42, '#C9B6E0', 'neutrophil'); lobes(c, [[-0.17, 0.05, 0], [0.02, -0.12, 0.06], [0.2, 0.05, -0.04]], 0.1, '#6B4C9A', 'neutrophil');
      c = [1.3, -0.35, 0.6];
      wbc(c, 0.42, '#F29B7A', 'eosinophil'); lobes(c, [[-0.1, 0.02, 0], [0.12, 0, 0.03]], 0.13, '#6B4C9A', 'eosinophil'); granules(c, 0.42, 16, 0.045, '#D8412B', 'eosinophil', 7);
      c = [0.2, 0.75, -0.9];
      wbc(c, 0.4, '#8FA0E0', 'basophil'); ball(c, 0.22, '#3D3A8C', 'basophil', [1.2, 1, 0.9]); granules(c, 0.4, 12, 0.07, '#2E2A70', 'basophil', 9);
      c = [-0.5, -0.65, 0.9];
      wbc(c, 0.32, '#7FA8E0', 'lymphocyte'); ball(c, 0.27, '#4B3A8C', 'lymphocyte');
      c = [1.9, 0.65, -0.5];
      wbc(c, 0.52, '#B59AD6', 'monocyte'); { const k = put(new THREE.TorusGeometry(0.19, 0.1, 10, 20, Math.PI * 1.4), '#6B4C9A', 'monocyte'); k.position.set(...c); k.rotation.set(0.3, 0.4, 0.5); }
      const prof = [], hh = t => 0.5 * Math.sqrt(1 - t * t) * (0.2 + 0.5 * t * t);
      for (let i = 0; i <= 10; i++) prof.push(new THREE.Vector2(i / 10 * 0.5, -hh(i / 10)));
      for (let i = 10; i >= 0; i--) prof.push(new THREE.Vector2(i / 10 * 0.5, hh(i / 10)));
      const disc = new THREE.LatheGeometry(prof, 22);
      const clear = (p, d) => taken.every(q => Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]) > d + q[3]);
      for (let n = 0, tries = 0; n < 11 && tries < 600; tries++) {
        const p = [(r() - 0.5) * 4.5, (r() - 0.5) * 2.5, (r() - 0.5) * 2.7];
        if (!clear(p, 0.55)) continue;
        taken.push([...p, 0.5]); n++;
        const m = put(disc, '#D8352F', 'rbc'); m.position.set(...p); m.rotation.set(r() * Math.PI, r() * Math.PI, r() * Math.PI);
      }
      for (let n = 0, tries = 0; n < 7 && tries < 400; tries++) {
        const p = [(r() - 0.5) * 4.6, (r() - 0.5) * 2.6, (r() - 0.5) * 2.8];
        if (!clear(p, 0.2)) continue;
        taken.push([...p, 0.12]); n++;
        const m = ball(p, 0.12, '#E48AB5', 'platelet', [1.3, 0.4, 1]); m.rotation.set(r() * 3, r() * 3, r() * 3);
      }
    },

    // White adipose tissue: unilocular cells, one lipid droplet and a flattened nucleus pushed to the rim
    'adipose-white'() {
      const r = rng(41), up = V(0, 1, 0), R = 0.72;
      for (const [x, y, z] of [[-1.55, 0.7, 0], [0, 0.7, 0.2], [1.55, 0.7, -0.1], [-0.8, -0.9, 0.5], [0.8, -0.9, 0.3]]) {
        ball([x, y, z], R, '#F6E7A8', 'cytoplasm', [1, 1, 1], { opacity: 0.3 });
        ball([x, y, z], R * 0.92, '#F3D34A', 'lipid', [1, 1, 1], { opacity: 0.85 });
        const n = V(r() - 0.5, r() * 0.8 + 0.2, r() - 0.2).normalize();
        const nu = ball(V(x, y, z).addScaledVector(n, R * 0.96).toArray(), 0.2, '#8E5DB0', 'nucleus', [1, 0.35, 1]); nu.quaternion.setFromUnitVectors(up, n);
      }
      tube([[-2.5, -0.1, 0], [-0.8, -0.1, 0.1], [0.8, -0.1, 0.1], [2.5, -0.1, 0]], 0.09, '#C8312E', 'capillary');
    },

    // Brown and beige adipocytes share one builder: droplet count and size, mitochondria count and colour differ
    'adipose-brown'() { fatCells(rng(43), { nDrop: 11, dropR: 0.12, nMito: 16, mito: '#6E3516' }); },
    'adipose-beige'() { fatCells(rng(47), { nDrop: 4, dropR: 0.2, nMito: 9, mito: '#A8683C' }); },

    // Fibroblast: spindle cell with branching processes, secretory vesicles and the collagen it releases
    fibroblast() {
      const r = rng(51);
      put(new THREE.BoxGeometry(5.2, 3, 3.2), '#6B5B8C', 'matrix', { opacity: 0.1 });
      ball([0, 0, 0], 0.5, '#E4A15C', 'body', [2.4, 0.32, 0.7]);
      ball([0.15, 0.04, 0], 0.22, '#8E5DB0', 'nucleus', [1.6, 0.75, 1]);
      for (const s of [-1, 1]) {
        tube([[s * 1.15, 0, 0], [s * 1.9, 0.12, 0.2 * s], [s * 2.5, 0.3, 0.1 * s]], 0.07, '#F0C070', 'processes');
        tube([[s * 1.9, 0.12, 0.2 * s], [s * 2.3, -0.1, 0.55], [s * 2.5, -0.2, 0.9]], 0.04, '#F0C070', 'processes');
        tube([[s * 0.6, 0.05, 0.3], [s * 0.7, 0.15, 0.8], [s * 0.9, 0.3, 1.1]], 0.04, '#F0C070', 'processes');
      }
      for (let k = 0; k < 9; k++) ball([(r() - 0.5) * 1.6, 0.14 + (r() - 0.5) * 0.1, (r() - 0.5) * 0.5 + (k % 2 ? 0.28 : -0.28)], 0.045, '#F5E56B', 'vesicles');
      const lay = (z, y, dy) => { const pts = [[-2.5, y, z], [-1, y + dy, z + 0.1], [0.6, y - dy, z - 0.1], [2.5, y, z]]; for (const o of [0, 0.1, -0.1]) tube(pts.map(p => [p[0], p[1] + o, p[2]]), 0.045, '#8C9BE8', 'collagen'); };
      lay(0.65, 0.5, 0.15); lay(-0.7, 0.35, -0.12); lay(0.2, -0.65, 0.1); lay(-0.3, 1.0, 0.1); lay(1.15, -0.3, -0.1);
    },

    // Osteocyte: cells in lacunae within concentric bone lamellae, linked by canaliculi to a central (Haversian) canal
    osteocyte() {
      const r = rng(61);
      put(new THREE.BoxGeometry(5.2, 3, 3.2), '#E9DDC3', 'matrix', { opacity: 0.18 });
      for (const rad of [0.75, 1.05, 1.35]) { const l = put(new THREE.CylinderGeometry(rad, rad, 5.2, 36, 1, true), '#D9C7A0', 'lamellae', { opacity: 0.22 }); l.rotation.z = Math.PI / 2; }
      const cn = put(new THREE.CylinderGeometry(0.42, 0.42, 5.2, 24, 1, true), '#F2B8A0', 'canal', { opacity: 0.3 }); cn.rotation.z = Math.PI / 2;
      tube([[-2.6, 0, 0.05], [0, 0.05, -0.05], [2.6, 0, 0.05]], 0.17, '#C8312E', 'canal');
      const cells = [];
      for (let k = 0; k < 9; k++) {
        const rad = k % 3 === 2 ? 1.2 : 0.9, a = k * 2.4 + 0.3, x = -2 + (k % 5) * 1 + r() * 0.4;
        const p = [x, Math.cos(a) * rad, Math.sin(a) * rad], rot = V(0, Math.cos(a), Math.sin(a)).normalize();
        cells.push(p);
        const lac = ball(p, 0.19, '#8A6F4A', 'lacuna', [1.6, 1, 1], { opacity: 0.4 });
        const oc = ball(p, 0.13, '#5B9FC4', 'osteocyte', [1.6, 0.9, 0.9]);
        for (const m of [lac, oc]) m.quaternion.setFromUnitVectors(V(0, 1, 0), rot).multiply(new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), Math.PI / 2));
        tube([p, [p[0] + 0.05, p[1] * 0.7, p[2] * 0.7], [p[0] + 0.1, p[1] * 0.46, p[2] * 0.46]], 0.025, '#3F7F9E', 'canaliculi');
      }
      for (let i = 0; i < cells.length; i++) for (let j = i + 1; j < cells.length; j++) {
        const a = cells[i], b = cells[j];
        if (Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 1.3) tube([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 * 1.05, (a[2] + b[2]) / 2 * 1.05], b], 0.02, '#3F7F9E', 'canaliculi');
      }
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
        const ribo = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 8, 6), new THREE.MeshStandardMaterial({ color: RIBOSOME, roughness: 0.5 }), 90), d = new THREE.Object3D();
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
        ball([Math.cos(a) * d, low ? -0.95 + r() * 0.2 : 0.75 + r() * 0.5, Math.sin(a) * d * 0.7], 0.08, SURFACE_LAYER, 'vesicles');
      }
    },

    lyso() {
      put(new THREE.SphereGeometry(1.4, 36, 24), '#7A4A8C', 'membrane', { opacity: 0.3 });
      put(new THREE.SphereGeometry(1.32, 32, 20), '#C9B0D6', 'lumen', { opacity: 0.18 });
      const r = rng(31);
      for (let i = 0; i < 70; i++) { const v = V(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(Math.cbrt(r()) * 1.1); ball(v.toArray(), 0.07, SURFACE_LAYER, 'enzymes'); }
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
      const mats = { alpha: new THREE.MeshStandardMaterial({ color: TUBULIN_ALPHA, roughness: 0.5 }), beta: new THREE.MeshStandardMaterial({ color: TUBULIN_BETA, roughness: 0.5 }) };
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
        tube([w.toArray(), w.clone().lerp(e, 0.5).add(V(0, 0.1, 0)).toArray(), e.toArray()], 0.04, TUBULIN_ALPHA, 'mt');
      }
    },

    // ── Epithelial subtypes: one sheet of cells on a basement membrane, built from per-layer specs ──
    'simple-squamous'() { epi([{ part: 'cell', color: SURFACE_LAYER, r: 0.5, h: 0.1, y: 0 }]); },
    'simple-cuboidal'() { epi([{ part: 'cell', color: SURFACE_LAYER, r: 0.4, h: 0.7, y: 0 }]); },
    'simple-columnar'() {
      epi([{ part: 'cell', color: SURFACE_LAYER, r: 0.38, h: 1.5, y: 0, nuc: 0.22, skip: [5, 12] }]);
      const cols = 6, rows = 3, pitch = 0.85;
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const x = (i - (cols - 1) / 2) * pitch + (j % 2) * 0.25 - 0.12, z = (j - (rows - 1) / 2) * pitch, k = i * rows + j;
        if (k === 5 || k === 12) { const g = ball([x, 1.0, z], 0.36, '#6FC3DF', 'goblet', [1, 1.5, 1]); ball([x, 0.35, z], 0.2, '#8E5DB0', 'nucleus'); continue; }
        for (let m = 0; m < 6; m++) { const a = m / 6 * Math.PI * 2; put(new THREE.CylinderGeometry(0.014, 0.014, 0.2, 5), '#8EC5F0', 'apical').position.set(x + Math.cos(a) * 0.17, 1.6, z + Math.sin(a) * 0.17); }
        put(new THREE.CylinderGeometry(0.014, 0.014, 0.2, 5), '#8EC5F0', 'apical').position.set(x, 1.6, z);
      }
    },
    'stratified-squamous'() {
      epi([{ part: 'basal', color: BASAL_LAYER, r: 0.4, h: 0.5, y: 0 }, { part: 'intermediate', color: MIDDLE_LAYER, r: 0.44, h: 0.4, y: 0.5 }, { part: 'intermediate', color: MIDDLE_LAYER, r: 0.46, h: 0.3, y: 0.9 },
        { part: 'surface', color: SURFACE_LAYER, r: 0.5, h: 0.1, y: 1.2 }, { part: 'surface', color: SURFACE_LAYER, r: 0.5, h: 0.1, y: 1.32, shift: 0.3 }]);
    },
    'stratified-cuboidal'() {
      epi([{ part: 'basal', color: BASAL_LAYER, r: 0.4, h: 0.55, y: 0 }, { part: 'surface', color: SURFACE_LAYER, r: 0.4, h: 0.55, y: 0.55, shift: 0.2 }]);
    },
    'stratified-columnar'() {
      epi([{ part: 'basal', color: BASAL_LAYER, r: 0.4, h: 0.5, y: 0 }, { part: 'surface', color: SURFACE_LAYER, r: 0.38, h: 1.1, y: 0.5, every: 1, shift: 0.2 }]);
    },
    pseudostratified() {
      const r = rng(8), cols = 6, rows = 3, pitch = 0.85;
      put(new THREE.BoxGeometry(5.2, 0.1, 3.2), '#B7A7C9', 'basement');
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const x = (i - (cols - 1) / 2) * pitch + (j % 2) * 0.25 - 0.12, z = (j - (rows - 1) / 2) * pitch, k = i * rows + j, short = k % 3 === 1, goblet = k === 5 || k === 14;
        const h = short ? 0.55 : 1.7;
        if (goblet) { ball([x, 1.15, z], 0.34, '#6FC3DF', 'goblet', [1, 1.7, 1]); ball([x, 0.4, z], 0.18, '#8E5DB0', 'nucleus'); continue; }
        const c = put(new THREE.CylinderGeometry(short ? 0.32 : 0.28, 0.3, h, 6), short ? BASAL_LAYER : SURFACE_LAYER, short ? 'basal-cell' : 'ciliated'); c.position.set(x, 0.05 + h / 2, z);
        ball([x, 0.25 + r() * (short ? 0.2 : 0.95), z], 0.17, '#8E5DB0', 'nucleus', [0.9, 1.3, 0.9]);
        if (!short) for (let m = 0; m < 7; m++) { const a = m / 7 * Math.PI * 2, d = m ? 0.17 : 0; put(new THREE.CylinderGeometry(0.012, 0.012, 0.26, 5), '#8EC5F0', 'cilia').position.set(x + Math.cos(a) * d, 1.9, z + Math.sin(a) * d); }
      }
    },
    transitional() {
      const r = rng(12);
      put(new THREE.BoxGeometry(5.2, 0.1, 3.2), '#B7A7C9', 'basement');
      const cols = 6, rows = 3, pitch = 0.85;
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const x = (i - (cols - 1) / 2) * pitch + (j % 2) * 0.25 - 0.12, z = (j - (rows - 1) / 2) * pitch;
        const b = put(new THREE.CylinderGeometry(0.3, 0.3, 0.4, 6), BASAL_LAYER, 'basal'); b.position.set(x, 0.3, z);
        ball([x, 0.3, z], 0.14, '#8E5DB0', 'nucleus');
        const m = put(new THREE.ConeGeometry(0.36, 0.7, 6), MIDDLE_LAYER, 'intermediate'); m.position.set(x, 0.85, z);
        ball([x, 0.8, z], 0.13, '#8E5DB0', 'nucleus');
      }
      for (const [x, z] of [[-1.6, -0.6], [-0.1, -0.6], [1.4, -0.6], [-0.9, 0.7], [0.6, 0.7], [2.0, 0.7]]) {
        const d = ball([x, 1.15, z], 0.68, SURFACE_LAYER, 'umbrella', [1, 0.55, 1]);
        ball([x, 1.2, z], 0.17, '#8E5DB0', 'nucleus');
      }
    },

    // ── Neuroglia ──
    astrocyte() {
      const r = rng(21);
      tube([[-3, -1.7, 0], [-1, -1.6, 0.1], [1, -1.7, -0.1], [3, -1.6, 0]], 0.28, '#C8312E', 'capillary');
      ball([0, 0.4, 0], 0.4, '#E3A23A', 'soma'); ball([0, 0.4, 0], 0.17, '#8E6FB0', 'soma');
      const feet = [[-1.0, -1.38], [0.1, -1.4], [1.1, -1.38]];
      feet.forEach(([x, y]) => { tube([[0, 0.4, 0], [x * 0.5, -0.5, 0.1 * x], [x, y + 0.15, 0.05]], 0.05, '#F0C070', 'processes'); ball([x, y, 0.05], 0.2, '#D9822B', 'endfeet', [1.5, 0.35, 1.2]); });
      for (let k = 0; k < 9; k++) {
        const a = Math.PI * (0.05 + k * 0.1) + 0.2, e = V(Math.cos(a) * 1.5, Math.sin(a) * 1.3 + 0.4, (r() - 0.5) * 1.0);
        const m = e.clone().multiplyScalar(0.55).add(V(0, 0.2, 0));
        tube([[0, 0.4, 0], m.toArray(), e.toArray()], 0.045, '#F0C070', 'processes');
        for (let b = 0; b < 2; b++) tube([e.toArray(), e.clone().add(V((r() - 0.5) * 0.6, 0.35 + r() * 0.3, (r() - 0.5) * 0.4)).toArray()], 0.025, '#F0C070', 'processes');
      }
    },
    microglia() {
      const r = rng(23);
      ball([-0.4, 0, 0], 0.26, '#6FB5E0', 'soma'); ball([-0.4, 0, 0], 0.12, '#2F6F9A', 'soma', [1.2, 0.8, 1]);
      for (let k = 0; k < 7; k++) {
        const a = k / 7 * Math.PI * 2, base = V(-0.4, 0, 0), dir = V(Math.cos(a), Math.sin(a) * 0.7, (r() - 0.5) * 0.8).normalize();
        const mid = base.clone().addScaledVector(dir, 0.7), end = mid.clone().addScaledVector(dir.clone().add(V((r() - 0.5) * 0.6, (r() - 0.5) * 0.6, 0)).normalize(), 0.7);
        tube([base.toArray(), mid.toArray(), end.toArray()], 0.035, '#9CCBEA', 'processes');
        for (let b = 0; b < 3; b++) tube([mid.toArray(), mid.clone().add(V((r() - 0.5) * 0.7, (r() - 0.5) * 0.7, (r() - 0.5) * 0.5)).toArray()], 0.02, '#9CCBEA', 'processes');
      }
      ball([1.55, -0.2, 0], 0.17, '#9CCBEA', 'processes', [1, 1, 1], { opacity: 0.5 });
      for (let k = 0; k < 5; k++) ball([1.55 + (r() - 0.5) * 0.14, -0.2 + (r() - 0.5) * 0.14, (r() - 0.5) * 0.1], 0.04, '#B0B0B0', 'debris');
    },
    ependymal() {
      put(new THREE.BoxGeometry(5.4, 1.2, 2.4), '#BFD9E6', 'lumen', { opacity: 0.2 }).position.set(0, 1.1, 0);
      const cols = 6, rows = 3, pitch = 0.85;
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const x = (i - (cols - 1) / 2) * pitch, z = (j - 1) * 0.85;
        const c = put(new THREE.CylinderGeometry(0.38, 0.36, 0.9, 6), SURFACE_LAYER, 'cells'); c.position.set(x, -0.1, z);
        ball([x, -0.3, z], 0.17, '#8E5DB0', 'nucleus');
        for (let m = 0; m < 6; m++) { const a = m / 6 * Math.PI * 2, d = m ? 0.17 : 0; put(new THREE.CylinderGeometry(0.014, 0.014, 0.5, 5), '#8EC5F0', 'cilia').position.set(x + Math.cos(a) * d, 0.6, z + Math.sin(a) * d); }
      }
    },
    oligodendrocyte() {
      ball([0, 1.5, 0], 0.32, '#5FC4BF', 'soma'); ball([0, 1.5, 0], 0.13, '#2E8C88', 'soma');
      [-1.0, 0, 1.0].forEach((z, k) => {
        tube([[-3, -0.2, z], [0, -0.2, z], [3, -0.2, z]], 0.09, '#E3A23A', 'axon');
        const my = put(new THREE.CylinderGeometry(0.26, 0.26, 1.6, 20, 1, true), '#9AE0DC', 'myelin', { opacity: 0.75 }); my.rotation.z = Math.PI / 2; my.position.set(-0.3 + k * 0.5, -0.2, z);
        tube([[0, 1.5, 0], [(k - 1) * 0.5, 0.7, z * 0.6], [-0.3 + k * 0.5, 0.2, z]], 0.04, '#3FA7A7', 'processes');
      });
    },
    satellite() {
      ball([0, 0, 0], 0.95, '#E3A23A', 'neuron'); ball([0.1, 0.1, 0.1], 0.38, '#8E6FB0', 'neuron');
      tube([[0, -0.9, 0], [0, -1.6, 0.1], [0.2, -2.4, 0.2]], 0.08, '#E3A23A', 'neuron');
      const r = rng(5), up = V(0, 1, 0);
      for (let k = 0; k < 22; k++) {
        const y = 1 - (k + 0.5) / 11, rad = Math.sqrt(Math.max(0, 1 - y * y)), th = k * 2.399963, n = V(Math.cos(th) * rad, y, Math.sin(th) * rad);
        if (n.y < -0.75) continue;
        const c = ball(n.clone().multiplyScalar(1.07).toArray(), 0.28, '#5FC4BF', 'satellite', [1, 0.22, 1]); c.quaternion.setFromUnitVectors(up, n);
      }
    },
    schwann() {
      tube([[-3.4, 0, 0], [0, 0, 0], [3.4, 0, 0]], 0.17, '#E3A23A', 'axon');
      const seg = (x, len, o) => { const m = put(new THREE.CylinderGeometry(0.5, 0.5, len, 24, 1, true), '#9AE0DC', 'myelin', o); m.rotation.z = Math.PI / 2; m.position.set(x, 0, 0); };
      seg(0, 2.6, { opacity: 0.8 }); seg(-3.0, 1.3, { opacity: 0.4 }); seg(3.0, 1.3, { opacity: 0.4 });
      ball([0, 0.55, 0], 0.5, '#5FC4BF', 'schwann', [1.5, 0.45, 0.8]); ball([0, 0.72, 0], 0.22, '#2E8C88', 'nucleus', [1.3, 0.8, 0.9]);
      for (const x of [-1.62, 1.62]) { const n = put(new THREE.TorusGeometry(0.2, 0.04, 8, 18), '#F5D36B', 'node'); n.rotation.y = Math.PI / 2; n.position.set(x, 0, 0); }
    },

    // ── Neurons ──
    sensory() {
      const gold = '#E3A23A';
      ball([0, 1.0, 0], 0.5, gold, 'soma'); ball([0, 1.0, 0], 0.22, '#8E6FB0', 'soma');
      tube([[0, 0.5, 0], [0, 0.2, 0], [0, 0, 0]], 0.07, gold, 'soma');
      tube([[0, 0, 0], [-1.5, -0.05, 0], [-3.2, 0, 0]], 0.07, '#E8B04A', 'peripheral');
      tube([[0, 0, 0], [1.5, 0.05, 0], [3.0, 0, 0]], 0.07, '#C98A2A', 'central');
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; tube([[-3.2, 0, 0], [-3.45, Math.cos(a) * 0.15, Math.sin(a) * 0.15], [-3.7, Math.cos(a) * 0.3, Math.sin(a) * 0.3]], 0.03, '#F08080', 'receptor'); ball([-3.7, Math.cos(a) * 0.3, Math.sin(a) * 0.3], 0.06, '#F08080', 'receptor'); }
      for (const [dx, dy, dz] of [[0.5, 0.4, 0.2], [0.6, -0.1, -0.3], [0.5, -0.5, 0.25]]) { tube([[3.0, 0, 0], [3.0 + dx * 0.5, dy * 0.5, dz * 0.5], [3.0 + dx, dy, dz]], 0.04, gold, 'terminals'); ball([3.0 + dx, dy, dz], 0.12, gold, 'terminals'); }
    },
    motor() {
      const r = rng(27), gold = '#E3A23A';
      ball([-2.8, 0, 0], 0.5, gold, 'soma'); ball([-2.8, 0, 0], 0.22, '#8E6FB0', 'soma');
      const branch = (from, dir, len, rad, depth) => {
        const to = from.clone().addScaledVector(dir, len), mid = from.clone().lerp(to, 0.5).add(V((r() - 0.5) * 0.15, (r() - 0.5) * 0.15, (r() - 0.5) * 0.15));
        tube([from.toArray(), mid.toArray(), to.toArray()], rad, '#F0C070', 'dendrites');
        if (depth > 0) for (let k = 0; k < 2; k++) branch(to, dir.clone().add(V((r() - 0.5) * 1.2, (r() - 0.5) * 1.2, (r() - 0.5) * 1.2)).normalize(), len * 0.7, rad * 0.7, depth - 1);
      };
      for (let k = 0; k < 6; k++) { const a = Math.PI * 0.6 + k / 5 * Math.PI * 0.8, b = (r() - 0.5) * 1.4, dir = V(Math.cos(a), Math.sin(a) * Math.cos(b), Math.sin(a) * Math.sin(b)).normalize(); branch(V(-2.8, 0, 0).addScaledVector(dir, 0.5), dir, 0.6, 0.06, 2); }
      tube([[-2.3, 0, 0], [-0.8, 0.1, 0], [0.8, -0.1, 0], [2.3, -0.3, 0]], 0.07, '#E8B04A', 'axon');
      const m = put(new THREE.CylinderGeometry(0.4, 0.4, 3.2, 16), '#E8645A', 'muscle'); m.rotation.x = Math.PI / 2; m.position.set(3.4, -0.7, 0);
      const end = V(2.3, -0.3, 0);
      for (const dz of [-0.9, -0.3, 0.3, 0.9]) { const to = V(3.2, -0.34, dz); tube([end.toArray(), [2.7, -0.3, dz * 0.5], to.toArray()], 0.04, '#D9822B', 'terminals'); ball(to.toArray(), 0.1, '#D9822B', 'terminals'); }
    },
    interneuron() {
      const r = rng(33), gold = '#E3A23A';
      ball([0, 0, 0], 0.5, gold, 'soma'); ball([0, 0, 0], 0.22, '#8E6FB0', 'soma');
      const branch = (from, dir, len, rad, depth, part, color) => {
        const to = from.clone().addScaledVector(dir, len), mid = from.clone().lerp(to, 0.5).add(V((r() - 0.5) * 0.15, (r() - 0.5) * 0.15, (r() - 0.5) * 0.15));
        tube([from.toArray(), mid.toArray(), to.toArray()], rad, color, part);
        if (depth > 0) for (let k = 0; k < 2; k++) branch(to, dir.clone().add(V((r() - 0.5) * 1.2, (r() - 0.5) * 1.2, (r() - 0.5) * 1.2)).normalize(), len * 0.7, rad * 0.7, depth - 1, part, color);
        else if (part === 'axon') ball(to.toArray(), 0.1, '#D9822B', 'terminals');
      };
      for (let k = 0; k < 7; k++) { const a = Math.PI * 0.5 + k / 6 * Math.PI, b = (r() - 0.5) * 1.4, dir = V(-Math.abs(Math.cos(a)) - 0.2, Math.sin(a) * Math.cos(b), Math.sin(a) * Math.sin(b)).normalize(); branch(V(0, 0, 0).addScaledVector(dir, 0.5), dir, 0.7, 0.06, 2, 'dendrites', '#F0C070'); }
      tube([[0.5, 0, 0], [0.9, 0.1, 0]], 0.065, '#E8B04A', 'axon');
      for (const d of [V(1, 0.5, 0.3), V(1, -0.4, 0.4), V(1, 0.1, -0.6)]) branch(V(0.9, 0.1, 0), d.normalize(), 0.7, 0.045, 1, 'axon', '#E8B04A');
    },

    // General eukaryotic cell: generalised animal cell after a textbook figure. Shapes and positions are illustrative, not to scale.
    'eukaryote-general'() {
      const r = rng(11), CX = 5, CY = 3, CZ = 4, NUC = V(1.7, 0.4, -0.4), NR = 1.5;
      ball([0, 0, 0], 1, '#E8B04A', 'membrane', [CX, CY, CZ], { opacity: 0.16 });
      ball([0, 0, 0], 1, '#F2D27A', 'cytoplasm', [CX * 0.97, CY * 0.97, CZ * 0.97], { opacity: 0.08 });
      // nucleus: envelope, chromatin, nucleolus
      ball(NUC.toArray(), NR, '#8E7BC4', 'envelope', [1, 1, 1], { opacity: 0.3 });
      ball(NUC.toArray(), NR * 0.8, '#B9A8E0', 'chromatin', [1, 1, 1], { opacity: 0.55 });
      ball(NUC.clone().add(V(0.15, 0.1, 0.2)).toArray(), 0.4, '#5B4B9A', 'nucleolus');
      const inside = (p, pad = 0) => (p.x / (CX - pad)) ** 2 + (p.y / (CY - pad)) ** 2 + (p.z / (CZ - pad)) ** 2 < 1 && p.distanceTo(NUC) > NR + 0.15;
      const spot = (pad = 0.5) => { for (;;) { const p = V((r() * 2 - 1) * CX, (r() * 2 - 1) * CY, (r() * 2 - 1) * CZ); if (inside(p, pad)) return p; } };
      const dots = (n, rad, color, part, at) => {
        const im = new THREE.InstancedMesh(new THREE.SphereGeometry(rad, 8, 6), new THREE.MeshStandardMaterial({ color, roughness: 0.5 }), n), d = new THREE.Object3D();
        for (let k = 0; k < n; k++) { d.position.copy(at()); d.updateMatrix(); im.setMatrixAt(k, d.matrix); }
        im.userData.part = part; im.userData.base = 1; group.add(im); meshes.push(im);
      };
      // rough ER: flattened sheets wrapped on the near side of the nucleus, ribosomes on the faces
      const sheetPts = [];
      for (let i = 0; i < 7; i++) {
        const rad = NR + 0.25 + i * 0.22, sh = ball(NUC.toArray(), rad, '#E27C9B', 'er-rough', [0.55, 1, 1.05], { opacity: 0.45 });
        sh.geometry.dispose(); sh.geometry = new THREE.SphereGeometry(rad, 28, 16, -Math.PI * 0.55, Math.PI * 0.65, Math.PI * 0.2, Math.PI * 0.6);
        sheetPts.push(rad);
      }
      dots(160, 0.045, '#8B1E2D', 'ribosome', () => { const rad = sheetPts[Math.floor(r() * sheetPts.length)], a = Math.PI * (-0.55 + r() * 0.65), b = Math.PI * (0.2 + r() * 0.6); return V(NUC.x - rad * Math.sin(b) * Math.cos(a) * 0.55 - 0.03, NUC.y + rad * Math.cos(b), NUC.z + rad * Math.sin(b) * Math.sin(a) * 1.05); });
      dots(70, 0.045, '#8B1E2D', 'ribosome', () => spot());
      // smooth ER: branching tubules
      for (let k = 0; k < 7; k++) { const a = V(-1.6 + r() * 0.6, -1.4 + r() * 0.5, -1.6 + r() * 2.6), b = a.clone().add(V((r() - 0.5) * 1.6, (r() - 0.5) * 1.0, (r() - 0.5) * 1.6)), c = b.clone().add(V((r() - 0.5) * 1.2, (r() - 0.5) * 0.8, (r() - 0.5) * 1.2)); tube([a.toArray(), b.toArray(), c.toArray()], 0.11, '#C2417F', 'er-smooth'); ball(c.toArray(), 0.16, '#C2417F', 'er-smooth'); }
      // Golgi: curved stack with vesicles
      const G = V(2.2, -1.7, 1.7);
      for (let i = 0; i < 5; i++) ball(G.clone().add(V(0, i * 0.17, 0)).toArray(), 0.9 - Math.abs(i - 2) * 0.1, '#E8923A', 'golgi', [1, 0.09, 0.55]);
      for (let k = 0; k < 6; k++) ball(G.clone().add(V(-1.0 + r() * 2, r() * 0.9 - 0.2, 0.7 + r() * 0.3)).toArray(), 0.1, '#F2B36B', 'golgi');
      // mitochondria: outer membrane with an inner capsule for the cristae
      for (const [pos, rot] of [[V(-3, 1.1, 1.4), 0.5], [V(-3.2, -1.2, -1.4), -0.4]]) {
        const o = put(new THREE.CapsuleGeometry(0.42, 1.1, 8, 16), '#D9534F', 'mito', { opacity: 0.55 }), i = put(new THREE.CapsuleGeometry(0.26, 0.9, 8, 16), '#F2B8A0', 'mito');
        for (const m of [o, i]) { m.position.copy(pos); m.rotation.set(0.3, 0, Math.PI / 2 + rot); }
      }
      // lysosomes, vacuole
      for (const p of [V(0.5, 2.2, 1.6), V(-1.4, 0.2, 2.7), V(3.4, 1.6, 2.0)]) ball(p.toArray(), 0.28, '#8A8F98', 'lysosome');
      ball([-0.4, 2.4, -1.6], 0.6, '#B6BCC6', 'vacuole', [1, 0.7, 1], { opacity: 0.55 });
      // centrioles: two barrels at right angles, microtubules radiating from them
      const Cn = V(-0.9, 1.4, 0.8);
      for (const rotz of [0, Math.PI / 2]) { const c = put(new THREE.CylinderGeometry(0.13, 0.13, 0.55, 12), '#E8D84A', 'centriole'); c.position.copy(Cn).add(V(rotz ? 0.18 : 0, rotz ? 0 : 0.18, 0)); c.rotation.z = rotz; }
      for (let k = 0; k < 14; k++) { const d = V(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize(), end = Cn.clone().addScaledVector(d, 1.5 + r() * 2.2); if (!inside(end, 0.2)) continue; tube([Cn.toArray(), Cn.clone().lerp(end, 0.5).add(V((r() - 0.5) * 0.3, (r() - 0.5) * 0.3, (r() - 0.5) * 0.3)).toArray(), end.toArray()], 0.03, '#B8793A', 'microtubule'); }
      // microfilaments under the membrane, intermediate filaments around the nucleus
      for (let k = 0; k < 20; k++) { const a = r() * Math.PI * 2, b = (r() - 0.5) * Math.PI * 0.8, q = (t) => V(Math.cos(a + t) * Math.cos(b) * (CX - 0.25), Math.sin(b + t * 0.4) * (CY - 0.25), Math.sin(a + t) * Math.cos(b) * (CZ - 0.25)); tube([q(0).toArray(), q(0.18).toArray(), q(0.36).toArray()], 0.025, '#4F8FD6', 'microfilament'); }
      for (let k = 0; k < 10; k++) { const d = V(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize(), a = NUC.clone().addScaledVector(d, NR + 0.2), e = NUC.clone().addScaledVector(d, NR + 1.6 + r()); if (!inside(e, 0.3)) continue; tube([a.toArray(), a.clone().lerp(e, 0.5).add(V((r() - 0.5) * 0.4, (r() - 0.5) * 0.4, (r() - 0.5) * 0.4)).toArray(), e.toArray()], 0.04, '#6F9E6A', 'intermediate'); }
      // glycogen granules in clusters
      for (let c = 0; c < 4; c++) { const ctr = spot(1), n = 14; dots(n, 0.06, '#D4A017', 'glycogen', () => ctr.clone().add(V((r() - 0.5) * 0.7, (r() - 0.5) * 0.7, (r() - 0.5) * 0.7))); }
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
      const ribo = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshStandardMaterial({ color: RIBOSOME_NEURON, roughness: 0.5 }), 150), d = new THREE.Object3D();
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
