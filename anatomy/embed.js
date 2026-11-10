// Embedding hook. The Cell Atlas page sends {type:'show', systems:[keys], match:[regex sources] | null}.
// Only the listed systems stay visible; with `match`, only parts whose label matches one expression stay visible. The camera then frames what is left.
// Same origin only. Tells the parent when ready so it can send the first message.

function init() {
  const A = window.__anat, THREE = A.THREE, model = A.model, G = A.G, $ = id => document.getElementById(id);
  const stage = document.querySelector('three-d-stage'), cam = stage._camera, ctl = stage._controls;
  const original = new Map();
  model.traverse(o => { if (o.isMesh && o.userData.sys) original.set(o, o.visible); });
  const box = new THREE.Box3(), tmp = new THREE.Box3();

  function show({ systems = null, match = null }) {
    document.getElementById('lyreset').click();
    original.forEach((v, o) => { o.visible = v; });
    const res = (match || []).map(s => new RegExp(s));
    const keys = [...document.querySelectorAll('#systems [data-k]')].map(e => e.dataset.k);
    keys.forEach(k => { const on = !systems || systems.includes(k); G[k].visible = on; const cb = document.querySelector(`#systems [data-k="${k}"] input`); if (cb) cb.checked = on; });
    if (res.length) original.forEach((v, o) => { if (v && systems.includes(o.userData.sys)) o.visible = res.some(re => re.test(o.userData.label || o.name || '')); });
    if (window.__clearSelection) window.__clearSelection();
    // the cutting plane hides small parts, so it stays off while one system or organ is isolated
    const pl = $('showplane'); if (pl && pl.checked === !!systems) pl.click();
    frame();
  }

  function frame() {
    box.makeEmpty();
    original.forEach((v, o) => {
      if (!o.visible || !o.geometry) return;
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
