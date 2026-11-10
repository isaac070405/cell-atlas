// Exploded-view slider: moves every structure away from the body's midline in proportion to its distance from it.
// Skin and fat stay put. Uses the structure list that explode.js measured before anything moved (window.__explode.items).

function init() {
  const X = window.__explode, A = window.__anat, THREE = A.THREE, model = A.model, $ = id => document.getElementById(id);
  // world-space gain per axis at 100%: sideways spread is the largest, depth is amplified because the body is shallow
  const CY = 0.95, K = { x: 1.6, y: 0.4, z: 4 };
  model.updateMatrixWorld(true);
  const m4 = new THREE.Matrix4(), m3s = new Map(), v = new THREE.Vector3();
  const inv = p => { let m = m3s.get(p); if (!m) { m = new THREE.Matrix3().setFromMatrix4(m4.copy((p || model).matrixWorld).invert()); m3s.set(p, m); } return m; };
  // each structure's full-scale offset, already converted into its parent's space (parents can be scaled or mirrored)
  const S = X.items.filter(it => it.col && !it.plane).map(it => ({ o: it.o, p0: it.p0, m: inv(it.o.parent), d: new THREE.Vector3(it.c.x * K.x, (it.c.y - CY) * K.y, it.c.z * K.z) }));

  let moved = false, raf = 0, amount = 0;
  function apply() {
    raf = 0; const f = amount / 100;
    if (!f && !moved) return;
    for (const s of S) { v.copy(s.d).multiplyScalar(f).applyMatrix3(s.m); s.o.position.copy(s.p0).add(v); }
    moved = f > 0; if (window.requestSliceNow) window.requestSliceNow();
  }
  const sl = $('expsl'), note = $('expnote'), n = $('expn'), msg = note.textContent;
  const set = a => { amount = a; sl.value = a; n.textContent = a + '%'; if (!raf) raf = requestAnimationFrame(apply); };
  sl.addEventListener('input', () => set(+sl.value));
  // the brain, heart and limb views pick parts by their resting positions, so they start from the assembled body
  document.addEventListener('click', e => { if (amount && e.target.closest('.vb .b[data-v]')) { set(0); apply(); } }, true);
  // Explode anatomy mode lays the figures out itself and restores every position, so the slider stands down while it is on
  const sync = () => { const on = document.body.classList.contains('exploded'); if (on && amount) { amount = 0; moved = false; sl.value = 0; n.textContent = '0%'; }
    sl.disabled = on; note.textContent = on ? 'Not available in Explode anatomy mode.' : msg; };
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] }); sync();
  window.__expSet = set;
}

const wait = setInterval(() => {
  if (window.__anat && window.__explode && window.__explode.items && $('expsl')) { clearInterval(wait); init(); }
}, 150);
function $(id) { return document.getElementById(id); }
