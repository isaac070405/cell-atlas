// Explode / assemble modes and the selection tab.
// Explode pulls each system into its own column (bones, muscles, nerves, arteries, veins, organs, lymphatics) for a chosen body region.
// Assemble leaves the body together. Clicking any structure opens a small tab that fades its surroundings.

const COLS = [
  { k: 'bones', name: 'Bones', color: '#e8e4dc' },
  { k: 'muscles', name: 'Muscles', color: '#e0846f' },
  { k: 'nerves', name: 'Brain & nerves', short: 'Nerves', color: '#e8c452' },
  { k: 'arteries', name: 'Arteries', color: '#ec6a70' },
  { k: 'veins', name: 'Veins', color: '#6fa0e6' },
  { k: 'organs', name: 'Organs & airway', color: '#e3b07c' },
  { k: 'lymph', name: 'Lymphatics', color: '#a8d58f' },
];
const REGIONS = [
  { k: 'body', name: 'Whole body', test: () => true },
  { k: 'torso', name: 'Torso & pelvis', test: c => Math.abs(c.x) < 0.17 && c.y > 0.74 && c.y < 1.5 },
  { k: 'head', name: 'Head & neck', test: c => c.y >= 1.5 },
  { k: 'arm', name: 'Upper extremity', test: c => Math.abs(c.x) >= 0.17 && c.y > 0.6 && c.y < 1.5 },
  { k: 'leg', name: 'Lower extremity', test: c => Math.abs(c.x) < 0.17 && c.y <= 0.74 },
];
const LYMPH = /lymph|node|spleen|thymus|tonsil|thoracic duct|cisterna/i, VEINISH = /vein|venous|sinus|plexus|vena cava/i;

function init() {
  const A = window.__anat, THREE = A.THREE, G = A.G, model = A.model, stage = document.querySelector('three-d-stage'), $ = id => document.getElementById(id);
  const hr = window.__heartRange || [0, 0], heartSet = new Set(G.circulatory.children.slice(hr[0], hr[1]));
  const isHeart = o => { for (let p = o; p && p !== G.circulatory; p = p.parent) if (heartSet.has(p)) return true; return /pulmonary_(artery|vein)/.test(o.name) && !/intrapulmonary/i.test(o.userData.label || ''); };
  const colOf = o => {
    const s = o.userData.sys, l = o.userData.label || '';
    if (!s || s === 'skin' || s === 'fat') return null;
    if (/^Magnified/.test(l)) return null; // the enlarged lung models sit away from the body
    if (LYMPH.test(l) && !/Axillary tail/.test(l)) return 'lymph';
    if (s === 'skeletal') return 'bones';
    if (s === 'muscular') return 'muscles';
    if (s === 'nervous') return 'nerves';
    if (s === 'circulatory') return isHeart(o) ? 'organs' : VEINISH.test(l) ? 'veins' : 'arteries';
    return 'organs';
  };

  // one-time bookkeeping: world bounds and centre of every structure, measured before anything moves
  const items = [], bx = new THREE.Box3(), mat4 = new THREE.Matrix4();
  model.updateMatrixWorld(true);
  model.traverse(o => {
    if (!o.isMesh || !o.geometry) return;
    const col = colOf(o), plane = /^(sagittal|coronal|transverse)_/.test(o.name);
    if (!col && !plane && o.userData.sys !== 'skin' && o.userData.sys !== 'fat') return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    bx.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);
    items.push({ o, col, plane, c: bx.getCenter(new THREE.Vector3()), min: bx.min.clone(), max: bx.max.clone(), p0: o.position.clone(), v0: o.visible });
  });
  const m3 = new THREE.Matrix3(), dv = new THREE.Vector3();
  // a world-space shift along x, expressed in the mesh's parent space (parents may be scaled or mirrored)
  const shift = (it, dx) => { m3.setFromMatrix4(mat4.copy((it.o.parent || model).matrixWorld).invert()); dv.set(dx, 0, 0).applyMatrix3(m3); it.o.position.copy(it.p0).add(dv); };

  // ───────── UI ─────────
  const css = document.createElement('style');
  css.textContent = `
  #exbar{position:fixed;left:372px;right:16px;top:12px;z-index:5;display:flex;flex-wrap:wrap;gap:8px 14px;align-items:flex-start;pointer-events:none}
  #exbar>*{pointer-events:auto}
  #exbar .chips{display:flex;flex-wrap:wrap;gap:6px}
  #exbar .chip{font:inherit;font-size:12.5px;padding:5px 11px;border-radius:999px;border:1px solid var(--color-divider,#d8d2c4);background:rgba(255,255,255,.88);color:#3a3328;cursor:pointer}
  #exbar .chip.on{background:var(--color-accent-200,#f3d9a8);border-color:var(--color-accent-600,#a8741a)}
  #exbar .chip:disabled{opacity:.4;cursor:default}
  #exhead{display:none;flex:1 1 100%;justify-content:space-between;align-items:flex-end;color:#f2f2f2;pointer-events:none}
  #exhead h2{margin:0;font-size:28px;font-weight:700;letter-spacing:-.01em;text-transform:none;color:#f2f2f2;font-family:inherit}
  #exhead p{margin:2px 0 0;font-size:14px;color:#aab0ba}
  #exhead .hint{font-size:13px;color:#aab0ba}
  body.exploded #exhead{display:flex}
  body.exploded #exbar .chip{background:rgba(22,26,34,.9);border-color:#2a303b;color:#d6dae2}
  body.exploded #exbar .chip.on{background:#2b3345;border-color:#6d7a96;color:#fff}
  #exlabels{position:fixed;inset:0;pointer-events:none;z-index:4;overflow:hidden}
  #exlabels button{position:absolute;transform:translate(-50%,0);pointer-events:auto;font:inherit;font-size:15px;padding:9px 16px;border-radius:10px;border:1px solid #2a303b;background:#121722;box-shadow:0 2px 8px rgba(0,0,0,.45);cursor:pointer;white-space:nowrap}
  #exlabels button:hover{background:#1b2232}
  #sbar{position:fixed;left:372px;bottom:16px;width:340px;z-index:6;display:none;background:rgba(255,255,255,.96);border:1px solid var(--color-divider,#d8d2c4);border-radius:10px;padding:12px 14px;box-shadow:0 4px 18px rgba(0,0,0,.18);font-size:13px}
  #sbar.open{display:block}
  #sbar h3{margin:0 24px 2px 0;font-size:15px}
  #sbar .sys{font-size:11.5px;color:#6b6252;margin-bottom:8px}
  #sbar .x{position:absolute;right:8px;top:6px;border:0;background:none;font-size:18px;cursor:pointer;color:#6b6252}
  #sbar label{display:flex;justify-content:space-between;font-size:12px;margin-top:6px}
  #sbar .btns{display:flex;flex-direction:column;gap:6px;margin-top:10px}
  #sbar .btns .b.on{background:var(--color-accent-200,#f3d9a8)}
  `;
  document.head.appendChild(css);
  const bar = document.createElement('div'); bar.id = 'exbar';
  bar.innerHTML = `<div class="chips" id="exmode" role="group" aria-label="Anatomy mode"><button class="chip on" data-m="assemble">Assemble anatomy</button><button class="chip" data-m="explode">Explode anatomy</button></div>
    <div class="chips" id="exregion" role="group" aria-label="Body region" style="display:none">${REGIONS.map(r => `<button class="chip${r.k === 'body' ? ' on' : ''}" data-r="${r.k}">${r.name}</button>`).join('')}</div>
    <div id="exhead"><div><h2 id="extitle">Anatomy, exploded</h2><p id="exsub">Whole body</p></div><div class="hint">Click anatomy for names · choose a system below</div></div>`;
  document.body.appendChild(bar);
  const labels = document.createElement('div'); labels.id = 'exlabels'; document.body.appendChild(labels);
  const sbar = document.createElement('div'); sbar.id = 'sbar';
  sbar.innerHTML = `<button class="x" id="sbx" aria-label="Close">×</button><h3 id="sbname"></h3><div class="sys" id="sbsys"></div>
    <label for="sbalpha">Surrounding anatomy <span id="sbpct">100%</span></label>
    <input type="range" id="sbalpha" min="0" max="100" step="1" value="100" aria-label="Surrounding anatomy, filled to transparent">
    <div class="btns"><button class="b" id="sbcenter">Center selected structure</button><button class="b" id="sbonly">Show selected structure only</button><button class="b" id="sbhide">Hide selected structure</button></div>`;
  document.body.appendChild(sbar);

  // ───────── layout ─────────
  const st = { mode: 'assemble', region: 'body', solo: null }; let base = null, raf = 0, cols = [], frameBox = null, labelEls = [];
  const sysOn = () => Object.keys(G).filter(k => G[k] && G[k].isObject3D && document.querySelector(`#systems [data-k="${k}"]`));
  const restore = () => { items.forEach(it => { it.o.position.copy(it.p0); it.o.visible = it.v0; }); };

  function layout() {
    clearSel();
    restore();
    const reg = REGIONS.find(r => r.k === st.region), inReg = items.filter(it => it.col && reg.test(it.c));
    cols = COLS.filter(c => inReg.some(it => it.col === c.k)).map(c => ({ ...c, label: st.region !== 'body' && st.region !== 'head' && st.region !== 'torso' && c.k === 'nerves' ? c.short : c.name }));
    const shown = st.solo ? cols.filter(c => c.k === st.solo) : cols, n = shown.length;
    let w = 0; inReg.forEach(it => { w = Math.max(w, Math.abs(it.min.x), Math.abs(it.max.x)); }); w *= 2;
    const gap = Math.max(0.4, w * 0.9 + 0.05), xs = Object.fromEntries(shown.map((c, i) => [c.k, st.solo ? 0 : (i - (n - 1) / 2) * gap]));
    let lo = Infinity, hi = -Infinity, ylo = Infinity, yhi = -Infinity;
    items.forEach(it => {
      const on = it.col && reg.test(it.c) && xs[it.col] !== undefined;
      if (it.plane || !on) { it.o.visible = false; return; }
      it.o.visible = it.v0; shift(it, xs[it.col]);
      lo = Math.min(lo, it.min.x + xs[it.col]); hi = Math.max(hi, it.max.x + xs[it.col]); ylo = Math.min(ylo, it.min.y); yhi = Math.max(yhi, it.max.y);
    });
    model.updateMatrixWorld(true);
    frameBox = { lo, hi, ylo, yhi, xs };
    $('exsub').textContent = st.solo ? cols.find(c => c.k === st.solo).label + ' · ' + reg.name : reg.name;
    $('extitle').textContent = st.solo ? 'Anatomy, assembled' : 'Anatomy, exploded';
    buildLabels(shown, xs); frame();
  }
  function frame() {
    const cam = stage._camera, ctl = stage._controls, { lo, hi, ylo, yhi } = frameBox, cx = (lo + hi) / 2, cy = (ylo + yhi) / 2 - 0.04;
    const H = (yhi - ylo) * 1.35 + 0.12, W = (hi - lo) * 1.1 + 0.1, fov = cam.fov * Math.PI / 180, asp = (cam.aspect || 1) * Math.max(0.5, (innerWidth - 380) / innerWidth);
    const d = Math.max(H / 2 / Math.tan(fov / 2), W / 2 / (Math.tan(fov / 2) * asp)) * 1.06;
    // the sidebar covers the left 380 px, so the camera slides left to centre the figures in the free area
    const sh = (190 / innerWidth) * 2 * d * Math.tan(fov / 2) * (cam.aspect || 1);
    ctl.target.set(cx - sh, cy, 0); cam.position.set(cx - sh, cy, d); ctl.update();
  }
  function buildLabels(shown, xs) {
    labels.innerHTML = ''; labelEls = [];
    if (st.solo) { const b = document.createElement('button'); b.textContent = '← All systems'; b.style.color = '#e6e9ef'; b.onclick = () => { st.solo = null; layout(); }; labels.appendChild(b); labelEls.push({ b, x: 0 }); return; }
    shown.forEach(c => { const b = document.createElement('button'); b.textContent = c.label + ' ↗'; b.style.color = c.color; b.onclick = () => { st.solo = c.k; layout(); }; labels.appendChild(b); labelEls.push({ b, x: xs[c.k] }); });
  }
  function place() {
    if (st.mode !== 'explode') return; raf = requestAnimationFrame(place);
    const cam = stage._camera, rc = stage.getBoundingClientRect(), v = new THREE.Vector3();
    const px = labelEls.map(l => (v.set(l.x, 0, 0.05).project(cam), (v.x + 1) / 2 * rc.width)), pg = px.length > 1 ? Math.abs(px[1] - px[0]) : 200, fs = Math.max(9.5, Math.min(15, pg / 9.5));
    labelEls.forEach(l => { l.b.style.fontSize = fs + 'px'; l.b.style.padding = Math.round(fs * 0.55) + 'px ' + Math.round(fs * 0.9) + 'px'; v.set(l.x, frameBox.ylo - 0.045, 0.05).project(cam); l.b.style.left = (rc.left + (v.x + 1) / 2 * rc.width) + 'px'; l.b.style.top = (rc.top + (1 - v.y) / 2 * rc.height) + 'px'; });
  }

  function setMode(m) {
    if (m === st.mode) return;
    if (m === 'explode') {
      base = { sys: Object.fromEntries(sysOn().map(k => [k, G[k].visible])), cp: stage._camera.position.clone(), ct: stage._controls.target.clone(), slice: [$('slicebox').style.display, $('sliceopen').style.display] };
      if ($('lyreset')) $('lyreset').click();
      $('all').click(); st.mode = 'explode'; st.solo = null;
      document.body.classList.add('exploded'); stage.style.setProperty('--stage-bg', '#07090d');
      $('slicebox').style.display = 'none'; $('sliceopen').style.display = 'none'; $('exregion').style.display = 'flex';
      layout(); cancelAnimationFrame(raf); place();
    } else {
      clearSel(); restore(); st.mode = 'assemble'; cancelAnimationFrame(raf); labels.innerHTML = ''; labelEls = [];
      Object.entries(base.sys).forEach(([k, v]) => { G[k].visible = v; const cb = document.querySelector(`#systems [data-k="${k}"] input`); if (cb) cb.checked = v; });
      document.body.classList.remove('exploded'); stage.style.removeProperty('--stage-bg');
      $('slicebox').style.display = base.slice[0]; $('sliceopen').style.display = base.slice[1]; $('exregion').style.display = 'none';
      stage._camera.position.copy(base.cp); stage._controls.target.copy(base.ct); stage._controls.update();
    }
    $('exmode').querySelectorAll('.chip').forEach(b => b.classList.toggle('on', b.dataset.m === m));
  }
  $('exmode').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) setMode(b.dataset.m); });
  $('exregion').addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; st.region = b.dataset.r; st.solo = null; $('exregion').querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b)); layout(); });
  addEventListener('resize', () => { if (st.mode === 'explode') frame(); });

  // ───────── selection tab ─────────
  let sel = null; const ghosts = new Map(), lights = new Map();
  const mats = o => Array.isArray(o.material) ? o.material : [o.material];
  const ghost = (m, a) => { let g = ghosts.get(m); if (!g) { g = m.clone(); g.userData.b = m.opacity; g.transparent = true; g.depthWrite = false; ghosts.set(m, g); } g.opacity = g.userData.b * a; return g; };
  const light = m => { if (!m.emissive) return m; let g = lights.get(m); if (!g) { g = m.clone(); g.emissive.setHex(0xb06a10); g.emissiveIntensity = 0.45; lights.set(m, g); } return g; };
  const vis = o => { while (o) { if (!o.visible) return false; o = o.parent; } return true; };
  function applySel() {
    if (!sel) return; const a = sel.alpha / 100;
    sel.snap.forEach(s => {
      const o = s.o, inGroup = sel.group.has(o);
      if (inGroup) { o.visible = !sel.hidden; o.material = Array.isArray(s.m) ? s.m.map(light) : light(s.m); }
      else if (a <= 0.001) { o.visible = false; o.material = s.m; }
      else { o.visible = true; o.material = a >= 0.999 ? s.m : (Array.isArray(s.m) ? s.m.map(m => ghost(m, a)) : ghost(s.m, a)); }
    });
    $('sbpct').textContent = sel.alpha + '%'; $('sbalpha').value = sel.alpha; $('sbhide').textContent = sel.hidden ? 'Show selected structure' : 'Hide selected structure'; $('sbhide').classList.toggle('on', sel.hidden);
    $('sbonly').classList.toggle('on', !sel.hidden && sel.alpha === 30);
    if (window.requestSliceNow) window.requestSliceNow();
  }
  function clearSel() {
    if (!sel) return; const s0 = sel; sel = null;
    s0.snap.forEach(s => { s.o.material = s.m; s.o.visible = (s0.group.has(s.o) && s0.hidden) ? false : s.v; });
    if (s0.hidden && window.__removed) { window.__removed.push([...s0.group]); window.__dcount && window.__dcount(); }
    sbar.classList.remove('open');
  }
  function select(obj) {
    const label = obj.userData.label; if (!label) return;
    if (sel && sel.label === label) return; clearSel();
    const group = new Set(), snap = [];
    model.traverse(o => { if (!o.isMesh || !o.userData.sys || o.userData.sys === 'skin' && st.mode === 'explode') return; if (o.userData.label === label) group.add(o); if (vis(o) || o.userData.label === label) snap.push({ o, m: o.material, v: o.visible }); });
    sel = { label, group, snap, alpha: 100, hidden: false };
    $('sbname').textContent = label; $('sbsys').textContent = (({ skeletal: 'Skeletal', muscular: 'Muscular', circulatory: 'Circulatory', nervous: 'Nervous', respiratory: 'Respiratory', digestive: 'Digestive', urinary: 'Urinary', reproductive: 'Reproductive', endocrine: 'Endocrine', senses: 'Special senses' })[obj.userData.sys] || obj.userData.sys) + ' system';
    sbar.classList.add('open'); applySel();
  }
  window.__select = select; window.__clearSelection = clearSel;
  $('sbx').onclick = clearSel;
  $('sbalpha').addEventListener('input', e => { if (sel) { sel.alpha = +e.target.value; applySel(); } });
  $('sbonly').onclick = () => { if (sel) { sel.hidden = false; sel.alpha = 30; applySel(); } };
  $('sbhide').onclick = () => { if (sel) { sel.hidden = !sel.hidden; applySel(); } };
  $('sbcenter').onclick = () => {
    if (!sel) return; const b = new THREE.Box3(), t = new THREE.Box3(); sel.group.forEach(o => { if (o.visible || !sel.hidden) { o.updateWorldMatrix(true, false); if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); t.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); b.union(t); } });
    if (b.isEmpty()) return; const c = b.getCenter(new THREE.Vector3()), r = Math.max(0.03, b.getSize(new THREE.Vector3()).length() / 2), cam = stage._camera, ctl = stage._controls;
    const dir = cam.position.clone().sub(ctl.target).normalize(), d = Math.min(3, Math.max(0.12, r / Math.sin(cam.fov * Math.PI / 360) * 1.25));
    ctl.target.copy(c); cam.position.copy(c).addScaledVector(dir, d); ctl.update();
  };
  ['lyslider'].forEach(id => { const e = $(id); if (e) e.addEventListener('input', clearSel); });
  const sl = $('systems'); if (sl) sl.addEventListener('change', clearSel);
  window.__explode = { setMode, st, layout, items };
}

const wait = setInterval(() => {
  if (window.__anat && window.__anat.ready && document.querySelector('#systems [data-k]') && document.querySelector('three-d-stage')) { clearInterval(wait); init(); }
}, 120);
