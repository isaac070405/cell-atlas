// Three.js view of one procedural cell: orbit, cutting plane, click to pick a compartment.
// Three.js is a peer dependency. It loads on first call, or pass { THREE, OrbitControls } to supply your own copy.
// Colours come from options, so the view reads no page CSS.

export async function createCellView(host, {
  onPick = () => {}, membraneColor = '#A9A393', selectColor = '#B8336A', fallbackColor = '#A9A393',
  THREE: three, OrbitControls: orbit,
} = {}) {
  const THREE = three ?? await import('three');
  const OrbitControls = orbit ?? (await import('three/addons/controls/OrbitControls.js')).OrbitControls;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.localClippingEnabled = true;
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('role', 'img');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.7));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(3, 5, 4);
  scene.add(sun);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.addEventListener('change', draw);

  const plane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 1e3);
  const group = new THREE.Group();
  scene.add(group);
  const ray = new THREE.Raycaster();
  let model = null, picked = null, meshes = [], membrane = null, colors = {};

  const token = org => colors[org] ?? fallbackColor;

  function draw() { renderer.render(scene, camera); }

  function resize() {
    const w = host.clientWidth || 600, h = host.clientHeight || 400;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    draw();
  }
  new ResizeObserver(resize).observe(host);

  function clear() {
    group.traverse(o => { o.geometry?.dispose(); o.material?.dispose?.(); });
    group.clear();
    meshes = [];
  }

  function show(m, orgColours = {}) {
    model = m; colors = orgColours; picked = null;
    clear();
    const [a, b, c] = m.axes;
    // Cell membrane
    membrane = new THREE.Mesh(
      new THREE.SphereGeometry(1, 48, 32),
      new THREE.MeshStandardMaterial({ color: membraneColor, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false, clippingPlanes: [plane] }));
    membrane.scale.set(a, b, c);
    group.add(membrane);

    const up = new THREE.Vector3(0, 1, 0);
    for (const it of m.items) {
      const mat = new THREE.MeshStandardMaterial({ color: token(it.org), roughness: 0.55, metalness: 0.05, side: THREE.DoubleSide, clippingPlanes: [plane],
        transparent: it.kind === 'bulk', opacity: it.kind === 'bulk' ? 0.55 : 1 });
      let mesh;
      if (it.kind === 'bulk') {
        mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), mat);
        mesh.scale.set(...it.scale);
        mesh.renderOrder = -1;
      } else {
        mesh = new THREE.Mesh(it.len > 1e-6 ? new THREE.CapsuleGeometry(it.r, it.len, 6, 14) : new THREE.SphereGeometry(it.r, 20, 14), mat);
        mesh.quaternion.setFromUnitVectors(up, new THREE.Vector3(...it.dir).normalize());
        mesh.position.set(...it.center);
      }
      mesh.userData.org = it.org;
      mesh.userData.base = mat.opacity;
      group.add(mesh);
      meshes.push(mesh);
    }
    const reach = Math.max(a, b, c);
    controls.target.set(0, 0, 0);
    camera.position.set(reach * 1.2, reach * 0.8, reach * 1.9);
    controls.minDistance = reach * 0.8;
    controls.maxDistance = reach * 8;
    controls.update();
    setClip(slicePct);
    renderer.domElement.setAttribute('aria-label', `${m.id}: ${m.items.length} compartments`);
    resize();
  }

  // 0 = whole cell, 100 = cut all the way through along the long axis.
  // cut3d false leaves the 3D cell whole while the cross-section still follows pct.
  let slicePct = 0;
  function setClip(pct, cut3d = true) {
    const reach = model ? model.axes[0] : 1;
    slicePct = pct;
    plane.constant = cut3d ? reach * (1 - 2 * pct / 100) : 1e3;
    draw();
    drawSlice();
  }

  // Cross-section map: the cell clipped at the cut position and seen from the cut side with flat colours. The hollow shells show their
  // inside faces, so each cut compartment reads as a filled shape. Drawn into the given canvas.
  let sliceR = null, sliceScene = null, sliceCam = null, sliceBg = '#F5F3EC';
  function attachSlice(canvas, { background = '#F5F3EC' } = {}) {
    sliceBg = background;
    sliceR = new THREE.WebGLRenderer({ canvas, antialias: true });
    sliceR.setPixelRatio(2);
    sliceR.localClippingEnabled = true;
    sliceScene = new THREE.Scene();
    sliceCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    drawSlice();
  }
  function drawSlice() {
    if (!sliceR || !model) return;
    const cv = sliceR.domElement, w = cv.clientWidth || 240, h = cv.clientHeight || 180;
    sliceR.setSize(w, h, false);
    sliceR.setClearColor(sliceBg, 1);
    sliceScene.clear();
    const x0 = model.axes[0] * (1 - 2 * slicePct / 100), cut = new THREE.Plane(new THREE.Vector3(-1, 0, 0), x0);
    const flat = {}, mk = color => new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, clippingPlanes: [cut] });
    const add = (geom, color, order, place) => { const mesh = new THREE.Mesh(geom, flat[color + order] ??= mk(color)); mesh.renderOrder = order; place(mesh); sliceScene.add(mesh); };
    const [a, b, c] = model.axes, up = new THREE.Vector3(0, 1, 0);
    add(new THREE.SphereGeometry(1, 40, 28), membraneColor, -3, m => m.scale.set(a, b, c));
    for (const it of model.items) {
      if (it.kind === 'bulk') add(new THREE.SphereGeometry(1, 32, 24), token(it.org), -2, m => m.scale.set(...it.scale));
      else add(it.len > 1e-6 ? new THREE.CapsuleGeometry(it.r, it.len, 6, 12) : new THREE.SphereGeometry(it.r, 16, 12), token(it.org), 0, m => {
        m.quaternion.setFromUnitVectors(up, new THREE.Vector3(...it.dir).normalize()); m.position.set(...it.center); });
    }
    const half = Math.max(b, c) * 1.15;
    sliceCam.left = -half * (w / h); sliceCam.right = half * (w / h); sliceCam.top = half; sliceCam.bottom = -half;
    sliceCam.near = 0; sliceCam.far = a * 2.2;
    sliceCam.up.set(0, 1, 0); sliceCam.position.set(x0 + 1e-3 * a, 0, 0); sliceCam.lookAt(x0 - 1, 0, 0); sliceCam.updateProjectionMatrix();
    sliceR.render(sliceScene, sliceCam);
    sliceScene.traverse(o => o.geometry?.dispose());
    Object.values(flat).forEach(m => m.dispose());
  }
  // Compartments present in the current model with their colours, for a legend
  const legend = () => [...new Set((model?.items ?? []).map(it => it.org))].map(org => ({ org, color: token(org) }));

  function select(org) {
    picked = org;
    for (const m of meshes) {
      const on = !org || m.userData.org === org;
      m.material.emissive.set(org && on ? selectColor : '#000000');
      m.material.emissiveIntensity = org && on ? 0.35 : 0;
      m.material.opacity = on ? m.userData.base : Math.min(m.userData.base, 0.25);
      m.material.transparent = m.material.opacity < 1;
    }
    membrane.material.opacity = org ? 0.08 : 0.16;
    draw();
  }

  // A click picks; a drag only orbits
  let down = null;
  renderer.domElement.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
    const r = renderer.domElement.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    // Organelles first; the vacuole is only picked when nothing else is under the pointer
    const hits = ray.intersectObjects(meshes, false).filter(h => plane.distanceToPoint(h.point) >= 0);
    const solid = hits.find(h => h.object.userData.base === 1) ?? hits[0];
    onPick(solid ? solid.object.userData.org : null);
  });

  return { show, setClip, select, resize, redraw: draw, attachSlice, drawSlice, legend, get selected() { return picked; } };
}
