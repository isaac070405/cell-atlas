// Notes: double-click a surface to pin a text note there. A note is stored as a point in the local space of the mesh it sits on,
// so it follows the mesh when the body is exploded, and it is hidden while that mesh is hidden. Notes persist in localStorage.

function init() {
  const A = window.__anat, THREE = A.THREE, model = A.model, stage = document.querySelector('three-d-stage'), cam = stage._camera, dom = stage._renderer.domElement;
  const vis = o => { while (o) { if (!o.visible) return false; o = o.parent; } return true; };
  const css = document.createElement('style');
  css.textContent = `
  #notes{position:fixed;inset:0;pointer-events:none;z-index:3;overflow:hidden}
  .note-pin{position:absolute;display:flex;align-items:center;gap:0;pointer-events:none;will-change:transform}
  .note-pin .dot{width:12px;height:12px;border-radius:50%;background:var(--color-accent-600,#a8741a);border:2px solid #fff;box-shadow:0 0 0 1px var(--color-accent-700,#7a5210);margin-left:-6px;flex:none}
  .note-pin .tag{pointer-events:auto;display:flex;align-items:center;margin-left:6px;background:var(--color-bg,#fff);border:1px solid var(--color-accent-500,#c28a2c);border-radius:var(--radius-md,4px);box-shadow:var(--shadow-sm);padding:1px 2px 1px 6px}
  .note-pin input{font:inherit;font-size:13px;border:0;background:transparent;color:var(--color-text);width:var(--w,9ch);min-width:6ch;max-width:26ch;padding:3px 2px;outline:none}
  .note-pin button{font:inherit;font-size:14px;line-height:1;border:0;background:transparent;color:var(--color-accent-700);cursor:pointer;padding:2px 5px}
  .note-pin button:hover{background:var(--color-accent-100)}`;
  document.head.appendChild(css);
  const layer = document.createElement('div'); layer.id = 'notes'; layer.setAttribute('aria-label', 'Notes on the model'); document.body.appendChild(layer);

  const pins = [];   // { mesh, local, text, el, input }
  const labelled = () => { const m = new Map(); model.traverse(o => { if (o.isMesh && o.userData.label) { if (!m.has(o.userData.label)) m.set(o.userData.label, []); m.get(o.userData.label).push(o); } }); return m; };
  const save = () => { try { localStorage.setItem('anatomy-notes', JSON.stringify(pins.filter(p => p.text).map(p => { const same = labelled().get(p.mesh.userData.label); return { l: p.mesh.userData.label, i: same.indexOf(p.mesh), p: p.local.toArray().map(v => +v.toFixed(5)), t: p.text }; }))); } catch (e) { } };

  function add(mesh, local, text, edit) {
    const el = document.createElement('div'); el.className = 'note-pin';
    el.innerHTML = '<i class="dot"></i><span class="tag"><input type="text" maxlength="80" placeholder="Type a note" aria-label="Note"><button aria-label="Delete note" title="Delete note">×</button></span>';
    const input = el.querySelector('input'), pin = { mesh, local, text: text || '', el, input };
    const fit = () => el.style.setProperty('--w', Math.max(9, input.value.length + 1) + 'ch');
    input.value = pin.text; fit();
    input.addEventListener('input', fit);
    const commit = () => { pin.text = input.value.trim(); if (!pin.text) kill(pin); else save(); };
    input.addEventListener('blur', commit);
    input.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter' || e.key === 'Escape') input.blur(); });   // typing must not trigger the single-key shortcuts
    el.querySelector('button').onclick = () => kill(pin);
    layer.appendChild(el); pins.push(pin); if (edit) input.focus();
    return pin;
  }
  function kill(p) { const i = pins.indexOf(p); if (i >= 0) pins.splice(i, 1); p.el.remove(); save(); }

  // place every note each frame
  const v = new THREE.Vector3();
  (function place() {
    requestAnimationFrame(place); if (!pins.length) return;
    const rc = dom.getBoundingClientRect(); cam.updateMatrixWorld(); // the camera's inverse matrix is only refreshed on render, which can lag a frame behind
    for (const p of pins) {
      if (!vis(p.mesh)) { p.el.style.display = 'none'; continue; }
      v.copy(p.local); p.mesh.localToWorld(v); v.project(cam);
      if (v.z > 1 || v.z < -1) { p.el.style.display = 'none'; continue; }
      p.el.style.display = 'flex'; p.el.style.transform = `translate(${rc.left + (v.x * 0.5 + 0.5) * rc.width}px,${rc.top + (-v.y * 0.5 + 0.5) * rc.height}px) translateY(-50%)`;
    }
  })();

  // The first click of a double-click selects and starts the camera flying, so the hit is measured at that first click, before the view moves.
  const ray = new THREE.Raycaster(), pt = new THREE.Vector2(); let first = null, down = null;
  function pick(e) {
    const rc = dom.getBoundingClientRect(); pt.set(((e.clientX - rc.left) / rc.width) * 2 - 1, -((e.clientY - rc.top) / rc.height) * 2 + 1); ray.setFromCamera(pt, cam);
    const ms = []; model.traverse(o => { if (o.isMesh && !o.isInstancedMesh && o.userData.label && vis(o)) ms.push(o); });
    const hs = ray.intersectObjects(ms, false); return hs.find(x => x.object.userData.sys !== 'skin' && !x.object.userData.passive) || hs.find(x => x.object.userData.sys !== 'skin') || hs[0] || null;
  }
  stage.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
  stage.addEventListener('pointerup', e => {
    if (e.button !== 0 || !down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) { down = null; return; } down = null;
    const h = pick(e); first = h ? { mesh: h.object, local: h.object.worldToLocal(h.point.clone()), x: e.clientX, y: e.clientY, t: performance.now() } : null;
  }, true);
  stage.addEventListener('dblclick', e => {
    if (!first || performance.now() - first.t > 700 || Math.hypot(e.clientX - first.x, e.clientY - first.y) > 12) return;
    const f = first; first = null; add(f.mesh, f.local, '', true);
  });

  // restore saved notes
  try {
    const saved = JSON.parse(localStorage.getItem('anatomy-notes') || '[]'), by = labelled();
    saved.forEach(s => { const m = (by.get(s.l) || [])[s.i]; if (m) add(m, new THREE.Vector3(...s.p), s.t, false); });
  } catch (e) { }
  window.__notes = { pins, add, clear: () => pins.slice().forEach(kill) };
}

const wait = setInterval(() => {
  const s = document.querySelector('three-d-stage');
  if (window.__anat && window.__anat.ready && window.__select && s && s._camera && s._renderer) { clearInterval(wait); init(); }
}, 150);
