// Keyboard shortcuts and a screen-reader announcement region. Each shortcut presses the control that already does the job,
// so behaviour matches a mouse click. Loads after camera-tools.js, which provides window.__camHome.

function init() {
  const $ = id => document.getElementById(id), live = $('live');
  const say = t => { live.textContent = ''; setTimeout(() => { live.textContent = t; }, 40); };

  // selecting a structure, in 3D or on the cut, announces its name and system
  const orig = window.__select;
  window.__select = obj => { orig(obj); const n = $('sbname').textContent, s = $('sbsys').textContent; if ($('sbar').classList.contains('open')) say(n + (s ? ', ' + s : '') + ', selected'); };

  const AXES = { 1: 'transverse', 2: 'coronal', 3: 'sagittal' };
  const typing = el => el && (el.isContentEditable || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || (el.tagName === 'INPUT' && !/^(checkbox|radio|range|button)$/.test(el.type)));
  const native = el => el && /^(BUTTON|A|SUMMARY|SELECT|INPUT|TEXTAREA)$/.test(el.tagName);   // Space already activates these
  const sel = () => $('sbar').classList.contains('open');

  addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing || typing(e.target)) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === ' ') {
      if (native(e.target) || document.body.classList.contains('exploded') || !window.__camHome) return;
      e.preventDefault(); window.__camHome(); say('Camera reset to the opening view'); return;
    }
    if (e.repeat) return;
    if (k === 'h') {
      if (!sel()) { say('Nothing selected to hide'); return; }
      $('sbhide').click(); say($('sbhide').classList.contains('on') ? $('sbname').textContent + ' hidden' : $('sbname').textContent + ' shown'); e.preventDefault();
    } else if (k === 'u') {
      // a structure hidden from the open tab comes back first, then earlier dissections undo one by one
      if (sel() && $('sbhide').classList.contains('on')) { $('sbhide').click(); say($('sbname').textContent + ' shown'); }
      else if (!$('undo').disabled) { $('undo').click(); say('Undone. ' + $('dcount').textContent); }
      else say('Nothing to undo');
      e.preventDefault();
    } else if (k === 'x') {
      const on = document.querySelector('#p-render .b.on'), next = document.querySelector('#p-render .b:not(.on)'); if (!next) return;
      next.click(); say(next.dataset.v === 'xray' ? 'X-ray on' : 'Atlas colours on'); e.preventDefault();
    } else if (AXES[k]) {
      // reopen a closed cross-section so the key always has a visible effect
      if ($('slicebox').style.display === 'none' && !document.body.classList.contains('exploded')) $('sliceopen').click();
      const a = $('axis'); a.value = AXES[k]; a.dispatchEvent(new Event('change')); say('Cross-section axis: ' + AXES[k]); e.preventDefault();
    }
  });
}

const wait = setInterval(() => {
  if (window.__select && window.__camHome && document.getElementById('sbar') && document.getElementById('live') && document.getElementById('axis')) { clearInterval(wait); init(); }
}, 150);
