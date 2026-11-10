// Anatomical tree: system > group > part, with a breadcrumb for the current selection.
// Choosing a part pins it in 3D. Selecting anything in 3D, on the cut or by search opens the matching branch and scrolls to it.

function init() {
  const T = window.__tree, $ = id => document.getElementById(id), root = $('tree'), crumb = $('crumb');
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const css = document.createElement('style');
  css.textContent = `
  #tree{max-height:280px;overflow:auto;border:1px solid var(--color-divider);border-radius:var(--radius-md,4px);padding:4px 8px}
  #tree details{margin:0} #tree details>summary{font-size:12px;letter-spacing:.08em;padding:4px 0;color:var(--color-text)}
  #tree details>summary::after{content:"+"} #tree details[open]>summary::after{content:"–"}
  #tree .grp{margin-left:10px;border-left:1px solid var(--color-divider);padding-left:8px}
  #tree .grp>details>summary{font-size:11.5px;letter-spacing:.04em;text-transform:none;font-weight:600;color:var(--color-neutral-700)}
  #tree ul{list-style:none;margin:0 0 4px;padding:0 0 0 4px} #tree li{margin:0}
  #tree .pi{font-size:12.5px;padding:2px 0} #tree .pi.on{color:var(--color-accent-700);font-weight:600;border-bottom-color:var(--color-accent-500)}
  #tree li span{font-size:12.5px;color:var(--color-neutral-700)}
  #crumb{font-size:12px;line-height:1.4;color:var(--color-neutral-700);margin:0 0 6px;min-height:17px}
  #crumb b{color:var(--color-text);font-weight:600}`;
  document.head.appendChild(css);

  const built = new Map();   // system key -> { parts, groups, el }
  let low = null;
  const labelsLow = () => { if (!low) { low = []; for (const [label, v] of T.labels()) low.push([label, label.toLowerCase(), v.sys]); } return low; };
  // groups: '#Heading' rows start a group, parts before the first heading sit in an unnamed one
  const groupsOf = parts => { const g = []; let cur = null; parts.forEach((p, i) => { if (p[0] === '#') { cur = { h: p.slice(1), items: [] }; g.push(cur); } else { if (!cur) { cur = { h: null, items: [] }; g.push(cur); } cur.items.push({ p, i }); } }); return g; };
  // a part is clickable when some structure of that system matches its name, as in the Parts list
  const live = (sk, p) => labelsLow().some(([k, , sy]) => sy === sk && T.partMatches(p, k));

  function fill(s, det) {
    const prev = built.get(s.k); if (prev && prev.parts === s.parts) return prev;
    const g = groupsOf(s.parts), body = det.querySelector('.grp'); body.innerHTML = '';
    g.forEach((gr, gi) => {
      const items = gr.items.map(it => live(s.k, it.p) ? `<li><button class="pi" data-s="${s.k}" data-i="${it.i}">${esc(it.p)}</button></li>` : `<li><span>${esc(it.p)}</span></li>`).join('');
      if (gr.h === null) body.insertAdjacentHTML('beforeend', `<ul>${items}</ul>`);
      else body.insertAdjacentHTML('beforeend', `<details data-g="${gi}"><summary>${esc(gr.h)} · ${gr.items.length}</summary><ul>${items}</ul></details>`);
    });
    const rec = { parts: s.parts, groups: g }; built.set(s.k, rec); return rec;
  }

  T.SYS.forEach(s => {
    const n = s.parts.filter(p => p[0] !== '#').length; if (!n) return;
    const d = document.createElement('details'); d.dataset.k = s.k;
    d.innerHTML = `<summary><span class="sn">${esc(s.name)}</span> · ${n}</summary><div class="grp"></div>`;
    d.addEventListener('toggle', () => { if (d.open) fill(s, d); });
    root.appendChild(d);
  });
  root.addEventListener('click', e => { const b = e.target.closest('.pi'); if (!b) return; const s = T.SYS.find(x => x.k === b.dataset.s); T.pick(s.k, s.parts[+b.dataset.i]); });

  // find the part, group and system that hold a label, then open and mark that branch
  function reveal(label, sysK) {
    const s = T.SYS.find(x => x.k === sysK); if (!s || !label) return;
    const d = root.querySelector(`details[data-k="${s.k}"]`); if (!d) return;
    d.open = true; const rec = fill(s, d);
    let hit = null;
    for (const gr of rec.groups) { for (const it of gr.items) if (T.partMatches(it.p, label) && (!hit || label.startsWith(it.p.split(' (')[0]))) hit = { gr, it }; }
    root.querySelectorAll('.pi.on').forEach(b => b.classList.remove('on'));
    if (!hit) { crumb.innerHTML = `<b>${esc(s.name)}</b> › ${esc(label)}`; d.scrollIntoView({ block: 'nearest' }); return; }
    const btn = d.querySelector(`.pi[data-i="${hit.it.i}"]`);
    if (hit.gr.h !== null) { const gd = btn && btn.closest('details'); if (gd) gd.open = true; }
    if (btn) { btn.classList.add('on'); btn.scrollIntoView({ block: 'nearest' }); }
    crumb.innerHTML = `<b>${esc(s.name)}</b>${hit.gr.h ? ' › ' + esc(hit.gr.h) : ''} › ${esc(hit.it.p)}`;
  }
  window.__onPin = (label, sk) => reveal(label, sk);
  const sel0 = window.__select;
  window.__select = obj => { sel0(obj); if (obj.userData.label) reveal(obj.userData.label, obj.userData.sys); };
  window.__treeReveal = reveal;
}

const wait = setInterval(() => {
  if (window.__tree && window.__select && document.getElementById('tree') && document.getElementById('crumb')) { clearInterval(wait); init(); }
}, 150);
