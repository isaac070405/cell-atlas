// Camera tools: anatomical view presets, animated focus on a selected structure, and a hover outline.
// Loads after explode.js, which owns selection (window.__select). Nothing here edits the model graph.

function init() {
  const A = window.__anat, THREE = A.THREE, model = A.model, stage = document.querySelector('three-d-stage'), $ = id => document.getElementById(id);
  const cam = stage._camera, ctl = stage._controls, scene = stage._scene, dom = stage._renderer.domElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const vis = o => { while (o) { if (!o.visible) return false; o = o.parent; } return true; };
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const TAU = Math.PI * 2;

  // ───────── camera tween ─────────
  // Interpolates the orbit target linearly and the camera offset in spherical coordinates, so the camera
  // arcs around the target at a steady distance instead of cutting through the body.
  let tw = null, onDone = null;
  function stopFly() { if (!tw) return; tw = null; if (onDone) { onDone(); onDone = null; } }
  // the near plane follows the target distance, so views a few centimetres from the ear or eye are not clipped
  const nearFor = d => Math.min(0.033, Math.max(0.002, d / 25));
  function flyTo(pos, tgt, ms = 650, done) {
    stopFly();
    const nn = nearFor(pos.distanceTo(tgt)); cam.near = Math.min(cam.near, nn); cam.far = Math.max(cam.far, 20); cam.updateProjectionMatrix();
    const done0 = done; done = () => { cam.near = nn; cam.updateProjectionMatrix(); if (done0) done0(); };
    const t1 = tgt.clone(), s0 = new THREE.Spherical().setFromVector3(cam.position.clone().sub(ctl.target)), s1 = new THREE.Spherical().setFromVector3(pos.clone().sub(tgt));
    const dTheta = ((((s1.theta - s0.theta) % TAU) + 3 * Math.PI) % TAU) - Math.PI;
    if (reduce || ms <= 0) { ctl.target.copy(t1); cam.position.copy(pos); ctl.update(); if (done) done(); return; }
    tw = { t0: ctl.target.clone(), t1, s0, s1, dTheta, start: performance.now(), ms, rot: ctl.autoRotate };
    onDone = done || null; ctl.autoRotate = false;
    requestAnimationFrame(step);
  }
  const off = new THREE.Vector3(), sp = new THREE.Spherical();
  function step(now) {
    if (!tw) return;
    const k = Math.min(1, (now - tw.start) / tw.ms), e = ease(k);
    ctl.target.lerpVectors(tw.t0, tw.t1, e);
    sp.set(tw.s0.radius + (tw.s1.radius - tw.s0.radius) * e, tw.s0.phi + (tw.s1.phi - tw.s0.phi) * e, tw.s0.theta + tw.dTheta * e);
    cam.position.copy(ctl.target).add(off.setFromSpherical(sp));
    if (k < 1) { requestAnimationFrame(step); return; }
    const t = tw; tw = null; ctl.autoRotate = t.rot; const d = onDone; onDone = null; if (d) d();
  }
  // the user grabbing the scene cancels any flight in progress
  ctl.addEventListener('start', () => { const rot = tw && tw.rot; stopFly(); if (rot) ctl.autoRotate = false; markPreset(null); });

  // ───────── anatomical view presets ─────────
  // The figure faces +z and its own right is -x. Superior and inferior keep anterior at the top of the screen.
  const PR = [
    { k: 'ant', name: 'Anterior', dir: [0, 0, 1] },
    { k: 'post', name: 'Posterior', dir: [0, 0, -1] },
    { k: 'r', name: 'Right', title: 'Right lateral', dir: [-1, 0, 0] },
    { k: 'l', name: 'Left', title: 'Left lateral', dir: [1, 0, 0] },
    { k: 'sup', name: 'Superior', pole: Math.PI },
    { k: 'inf', name: 'Inferior', pole: 0 },
  ];
  const css = document.createElement('style');
  css.textContent = `
  #camtools{position:fixed;right:24px;top:24px;z-index:3;display:flex;flex-direction:column;align-items:flex-end;gap:6px;max-width:calc(100vw - 420px)}
  #camtools .row{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:4px;padding:6px;background:color-mix(in oklab,var(--color-bg) 94%,transparent);border:1px solid var(--color-divider);border-radius:var(--radius-md,4px);box-shadow:var(--shadow-sm)}
  #camtools .row .b{padding:5px 8px;font-size:11px}
  #camtools .row .b.on{background:var(--color-accent-200)}
  #camtools .chk{display:flex;gap:6px;align-items:center;font-size:12px;color:var(--color-neutral-700);cursor:pointer;background:color-mix(in oklab,var(--color-bg) 94%,transparent);padding:3px 8px;border-radius:var(--radius-md,4px)}
  #camtools .chk input{width:14px;height:14px}
  body.present #camtools,body.exploded #camtools{display:none}`;
  document.head.appendChild(css);
  const box = document.createElement('div'); box.id = 'camtools';
  box.innerHTML = `<div class="row" role="group" aria-label="Camera views">${PR.map(p => `<button class="b" data-p="${p.k}" title="${p.title || p.name} view" aria-label="${p.title || p.name} view">${p.name}</button>`).join('')}</div>
    <label class="chk"><input type="checkbox" id="camfocus" checked> Zoom to a structure when clicked</label>`;
  document.body.appendChild(box);
  const markPreset = k => box.querySelectorAll('[data-p]').forEach(b => b.classList.toggle('on', b.dataset.p === k));
  // the opening view, for the Space shortcut
  const home = { p: cam.position.clone(), t: ctl.target.clone() };
  window.__camFly = flyTo;
  window.__camHome = () => { markPreset(null); flyTo(home.p, home.t, 650); };
  // keep the current target and distance, so a preset also works while zoomed on an organ
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-p]'); if (!b) return;
    const p = PR.find(x => x.k === b.dataset.p), r = Math.max(0.05, cam.position.distanceTo(ctl.target)), t = ctl.target.clone();
    const dir = p.dir ? new THREE.Vector3(...p.dir) : new THREE.Vector3(0, p.pole === 0 ? -1 : 1, 0).add(new THREE.Vector3(0, 0, p.pole === 0 ? 0.02 : -0.02)).normalize();
    markPreset(p.k); flyTo(t.clone().addScaledVector(dir, r), t, 650);
  });
  let focusOn = true; try { focusOn = localStorage.getItem('anatomy-focus') !== '0'; } catch (e) { }
  $('camfocus').checked = focusOn;
  $('camfocus').onchange = e => { focusOn = e.target.checked; try { localStorage.setItem('anatomy-focus', focusOn ? '1' : '0'); } catch (err) { } };

  // ───────── focus on a structure ─────────
  const bb = new THREE.Box3(), tb = new THREE.Box3();
  function boxOfLabel(label) {
    bb.makeEmpty();
    model.traverse(o => { if (!o.isMesh || o.userData.label !== label || !vis(o) || !o.geometry) return;
      o.updateWorldMatrix(true, false); if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); bb.union(tb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld)); });
    return bb.isEmpty() ? null : bb;
  }
  function focusLabel(label) {
    const b = label && boxOfLabel(label); if (!b) return;
    const c = b.getCenter(new THREE.Vector3()), r = Math.max(0.03, b.getSize(new THREE.Vector3()).length() / 2);
    const cur = cam.position.distanceTo(ctl.target), dir = cam.position.clone().sub(ctl.target).normalize();
    const d = Math.min(Math.max(0.12, r / Math.sin(cam.fov * Math.PI / 360) * 1.25), Math.max(3, cur));
    // slide the target so the structure sits in the free area right of the side panel
    const pn = document.querySelector('.panel'), L = pn && getComputedStyle(pn).display !== 'none' ? pn.getBoundingClientRect().right : 0;
    const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), worldW = 2 * d * Math.tan(cam.fov * Math.PI / 360) * (cam.aspect || 1);
    const tgt = c.clone().addScaledVector(right, -(L / 2 / innerWidth) * worldW);
    markPreset(null); flyTo(tgt.clone().addScaledVector(dir, d), tgt, 700);
  }
  let lastLabel = null;
  const orig = window.__select;
  window.__select = obj => { orig(obj); lastLabel = obj.userData.label || null; if (focusOn) focusLabel(lastLabel); };
  // the existing "Center selected structure" button jumps; make it fly instead
  const cbtn = $('sbcenter'); if (cbtn) cbtn.onclick = () => focusLabel(lastLabel);

  // ───────── hover outline ─────────
  // An inverted hull: the same geometry drawn back-face only, pushed out along smoothed normals by a width
  // proportional to view depth, so the outline stays about 3 px wide at any zoom and hides behind nearer parts.
  const hullMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, clipping: true, uniforms: { uColor: { value: new THREE.Color(0xe08a00) }, uWidth: { value: 0.0035 } },
    vertexShader: `#include <clipping_planes_pars_vertex>
      uniform float uWidth;
      void main(){ vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); vec3 n = normalize(normalMatrix * normal);
        mvPosition.xyz += n * (-mvPosition.z) * uWidth; gl_Position = projectionMatrix * mvPosition;
        #include <clipping_planes_vertex>
      }`,
    fragmentShader: `#include <clipping_planes_pars_fragment>
      uniform vec3 uColor;
      void main(){
        #include <clipping_planes_fragment>
        gl_FragColor = vec4(uColor, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  // Hard-edged meshes have split vertices, so their own normals would tear the hull open. Average normals across shared positions.
  const hullGeo = new WeakMap();
  function hullGeometry(g) {
    let h = hullGeo.get(g); if (h) return h;
    const pos = g.attributes.position; if (!pos) return null;
    let nor = g.attributes.normal; if (!nor) { const t = g.clone(); t.computeVertexNormals(); nor = t.attributes.normal; }
    const n = pos.count, ids = new Map(), grp = new Uint32Array(n), q = 1e5; let m = 0;
    for (let i = 0; i < n; i++) { const key = Math.round(pos.getX(i) * q) + ',' + Math.round(pos.getY(i) * q) + ',' + Math.round(pos.getZ(i) * q); let id = ids.get(key); if (id === undefined) { id = m++; ids.set(key, id); } grp[i] = id; }
    const sum = new Float32Array(m * 3), out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const j = grp[i] * 3; sum[j] += nor.getX(i); sum[j + 1] += nor.getY(i); sum[j + 2] += nor.getZ(i); }
    for (let i = 0; i < n; i++) { const j = grp[i] * 3, l = Math.hypot(sum[j], sum[j + 1], sum[j + 2]) || 1; out[i * 3] = sum[j] / l; out[i * 3 + 1] = sum[j + 1] / l; out[i * 3 + 2] = sum[j + 2] / l; }
    h = new THREE.BufferGeometry(); h.setAttribute('position', pos); h.setAttribute('normal', new THREE.BufferAttribute(out, 3)); if (g.index) h.setIndex(g.index);
    h.boundingBox = g.boundingBox; h.boundingSphere = g.boundingSphere; hullGeo.set(g, h); return h;
  }
  let active = []; const pool = [];   // active: { src, hull }
  function hullFor(src) { const m = pool.pop() || Object.assign(new THREE.Mesh(undefined, hullMat), { matrixAutoUpdate: false, castShadow: false, receiveShadow: false, frustumCulled: false, renderOrder: 1 }); m.geometry = hullGeometry(src.geometry); return m; }
  function setOutline(label) {
    if (label === (active.label || null)) return;
    active.forEach(a => { scene.remove(a.hull); pool.push(a.hull); });
    active = []; active.label = label || null; if (!label) return;
    model.traverse(o => { if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || o.userData.label !== label || !o.geometry) return;
      const hull = hullFor(o); if (!hull.geometry) return; scene.add(hull); active.push({ src: o, hull }); });
  }
  const mats0 = o => (Array.isArray(o.material) ? o.material[0] : o.material);
  // follow the source meshes: they move when the body explodes, hide with their system, and carry the heart cut planes
  function follow() {
    requestAnimationFrame(follow);
    for (const a of active) {
      const on = vis(a.src); a.hull.visible = on; if (!on) continue;
      a.src.updateWorldMatrix(true, false); a.hull.matrix.copy(a.src.matrixWorld); a.hull.matrixWorldNeedsUpdate = true;
    }
    const first = active[0], pl = first && mats0(first.src) && mats0(first.src).clippingPlanes; if (hullMat.clippingPlanes !== (pl || null)) { hullMat.clippingPlanes = pl || null; hullMat.needsUpdate = true; }
  }
  follow();

  const ray = new THREE.Raycaster(), pt = new THREE.Vector2(); let pend = null, busy = false;
  function pick(e) {
    const rc = dom.getBoundingClientRect(); pt.set(((e.clientX - rc.left) / rc.width) * 2 - 1, -((e.clientY - rc.top) / rc.height) * 2 + 1); ray.setFromCamera(pt, cam);
    const ms = []; model.traverse(o => { if (o.isMesh && o.userData.label && vis(o)) ms.push(o); });
    const hits = ray.intersectObjects(ms, false), h = hits.find(x => x.object.userData.sys !== 'skin' && !x.object.userData.passive) || hits.find(x => x.object.userData.sys !== 'skin');
    return h ? h.object.userData.label : null;   // skin is never outlined, it would wrap the whole figure
  }
  // at most one pick per 60 ms, so outlining adds little on top of the label tooltip's own ray cast
  stage.addEventListener('pointermove', e => {
    if (e.buttons || e.pointerType === 'touch') { setOutline(null); return; }
    pend = e; if (busy) return; busy = true;
    setTimeout(() => { busy = false; if (pend) { const ev = pend; pend = null; if (!tw) setOutline(pick(ev)); } }, 60);
  });
  stage.addEventListener('pointerleave', () => { pend = null; setOutline(null); });
  stage.addEventListener('pointerdown', () => { pend = null; setOutline(null); });
}

const wait = setInterval(() => {
  if (window.__anat && window.__anat.ready && window.__select && document.getElementById('sbcenter') && document.querySelector('three-d-stage') && document.querySelector('three-d-stage')._camera) { clearInterval(wait); init(); }
}, 150);
