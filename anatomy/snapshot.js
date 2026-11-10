// Snapshot: saves the current view as a PNG, rendered up to 3x the screen size (4096 px on the long side at most),
// with a transparent background by default or a white one. Labels, outlines and the ground shadow are left out of transparent shots.

function init() {
  const stage = document.querySelector('three-d-stage'), r = stage._renderer, scene = stage._scene, cam = stage._camera, $ = id => document.getElementById(id);
  const tb = stage.shadowRoot.querySelector('.toolbar');
  const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = 'Snapshot PNG'; btn.title = 'Save this view as a high-resolution PNG';
  tb.insertBefore(btn, tb.firstChild);
  const ct = $('camtools');
  if (ct) ct.insertAdjacentHTML('beforeend', '<label class="chk"><input type="checkbox" id="snapwhite"> White background for snapshots</label>');
  const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);

  btn.onclick = () => {
    const white = !!($('snapwhite') && $('snapwhite').checked), cv = r.domElement, prev = r.getPixelRatio();
    const w = cv.clientWidth, h = cv.clientHeight, k = Math.max(1, Math.min(3, 4096 / Math.max(w, h)));
    // hide everything that is not the body: outline hulls, and for a transparent shot the ground shadow
    const hid = []; scene.children.forEach(o => { if (o.visible && ((o.isMesh && o.material && o.material.isShaderMaterial) || (!white && o === stage._ground))) { o.visible = false; hid.push(o); } });
    try {
      r.setPixelRatio(k); r.render(scene, cam);
      const out = document.createElement('canvas'); out.width = cv.width; out.height = cv.height; const g = out.getContext('2d');
      if (white) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, out.width, out.height); }
      g.drawImage(cv, 0, 0);
      out.toBlob(blob => { if (!blob) return; const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'human-anatomy-' + stamp() + '.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }, 'image/png');
    } finally { hid.forEach(o => { o.visible = true; }); r.setPixelRatio(prev); }
    const live = $('live'); if (live) { live.textContent = ''; setTimeout(() => { live.textContent = 'Snapshot saved'; }, 40); }
  };
}

const wait = setInterval(() => {
  const s = document.querySelector('three-d-stage');
  if (s && s._renderer && s.shadowRoot.querySelector('.toolbar') && document.getElementById('camtools')) { clearInterval(wait); init(); }
}, 150);
