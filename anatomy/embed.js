// Embedding hook. The Cell Atlas page sends {type:'show', systems:[keys], match:[regex sources] | null}.
// Only the listed systems stay visible; with `match`, only parts whose label matches one expression stay visible. The camera then frames what is left.
// Same origin only. Tells the parent when ready so it can send the first message.

function init() {
  const A = window.__anat, THREE = A.THREE, model = A.model, G = A.G, $ = id => document.getElementById(id);
  const stage = document.querySelector('three-d-stage'), cam = stage._camera, ctl = stage._controls;
  const original = new Map();
  model.traverse(o => { if (o.isMesh && o.userData.sys) original.set(o, o.visible); });
  const box = new THREE.Box3(), tmp = new THREE.Box3();

  let frameRes = [];
  const slicebox = $('slicebox'), home = document.querySelector('.regions');
  const sliceTo = () => {
    // centre the cross-section on what is left and zoom to it
    const S = window.__slice; if (!S || box.isEmpty()) return;
    const off = new THREE.Vector3().setFromMatrixPosition(model.matrixWorld), c = box.getCenter(new THREE.Vector3()).sub(off), sz = box.getSize(new THREE.Vector3());
    S.setAxis('transverse');
    const x = Math.min(1, Math.max(0, (1.72 - c.y) / 1.69)); S.AX.transverse.x = x; $('sl').value = x;
    S.VW.x = c.x; S.VW.y = c.z + 0.015; S.zset(Math.min(12, Math.max(0.5, 0.21 / (Math.max(sz.x, sz.z, 0.04) * 0.65))));
  };

  // mode: 'body' (whole body, every panel), 'system' (only that system's parts), 'organ' (only that organ's parts); system and organ both float a cross-section and the view buttons over the stage
  function show({ systems = null, match = null, mode = 'body', frame: fr = null }) {
    frameRes = (fr || []).map(s => new RegExp(s));
    document.getElementById('lyreset').click();
    original.forEach((v, o) => { o.visible = v; });
    const res = (match || []).map(s => new RegExp(s));
    const keys = [...document.querySelectorAll('#systems [data-k]')].map(e => e.dataset.k);
    keys.forEach(k => { const on = !systems || systems.includes(k); G[k].visible = on; const cb = document.querySelector(`#systems [data-k="${k}"] input`); if (cb) cb.checked = on; });
    if (res.length) original.forEach((v, o) => { if (v && systems.includes(o.userData.sys)) o.visible = res.some(re => re.test(o.userData.label || o.name || '')); });
    if (window.__clearSelection) window.__clearSelection();
    // focus modes hide every panel and control; the cross-section and view buttons float over the stage for a system or organ
    const focus = mode !== 'body';
    document.body.classList.toggle('focus', focus);
    document.body.classList.toggle('slice', focus);
    stage.classList.toggle('focus', focus);
    if (focus) { slicebox.classList.add('floating'); document.body.appendChild(slicebox); }
    else { slicebox.classList.remove('floating'); if (home) home.before(slicebox); }
    // the cutting plane hides small parts, so it is on only for the whole body (tick the box to show it for an organ)
    const pl = $('showplane'); if (pl && pl.checked !== (mode === 'body')) pl.click();
    requestAnimationFrame(() => { frame(); if (focus) sliceTo(); else if (window.__slice) window.__slice.renderSlice(); });
  }

  function frame() {
    box.makeEmpty();
    original.forEach((v, o) => {
      if (!o.visible || !o.geometry) return;
      if (frameRes.length && !frameRes.some(re => re.test(o.userData.label || ''))) return;
      for (let p = o.parent; p; p = p.parent) if (!p.visible) return;
      o.updateWorldMatrix(true, false); if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      box.union(tmp.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld));
    });
    if (box.isEmpty() || !window.__camFly) return;
    const c = box.getCenter(new THREE.Vector3()), r = Math.max(0.05, box.getSize(new THREE.Vector3()).length() / 2);
    const d = r / Math.sin(cam.fov * Math.PI / 360) * 1.15;
    window.__camFly(c.clone().add(new THREE.Vector3(0, 0, d)), c, 700);
  }

  window.addEventListener('message', e => { if (e.origin === location.origin && e.data && e.data.type === 'show') show(e.data); });
  window.__embedShow = show;
  if (parent !== window) parent.postMessage({ type: 'embed-ready' }, location.origin);
}

const wait = setInterval(() => {
  if (window.__anat && window.__anat.ready && window.__camFly && window.__clearSelection && document.getElementById('lyreset') && document.querySelector('#systems [data-k]') && document.querySelector('three-d-stage')?._camera) { clearInterval(wait); init(); }
}, 150);
