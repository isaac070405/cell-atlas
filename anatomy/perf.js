// Adaptive pixel ratio. The stage already caps devicePixelRatio at 2; this lowers it further when the frame rate stays under 28 fps
// (4K and Retina screens, low-power phones) and raises it again after a long stretch above 55 fps.

function init() {
  const stage = document.querySelector('three-d-stage'), r = stage._renderer, loop0 = stage._loop;
  const base = r.getPixelRatio(), LEVELS = [base, 1.5, 1, 0.75].filter((v, i, a) => v <= base && a.indexOf(v) === i);
  let lv = 0, last = 0, ema = 1000 / 60, lowT = 0, highT = 0, quiet = performance.now() + 4000, lockMs = 20000, flips = 0, lastUp = 0;
  const go = (i, up) => {
    lv = i; r.setPixelRatio(LEVELS[lv]); lowT = highT = 0; quiet = performance.now() + (up ? 20000 : 6000);
    // stepping up and falling straight back means the higher ratio is too heavy for this device: wait longer each time
    if (up) lastUp = performance.now(); else if (performance.now() - lastUp < 30000 && lastUp) { flips++; lockMs = flips >= 3 ? Infinity : lockMs * 2; }
    stage.dataset.pixelRatio = LEVELS[lv]; window.__pixelRatio = LEVELS[lv];
  };
  stage.dataset.pixelRatio = base; window.__pixelRatio = base;
  stage._loop = t => {
    if (last && !document.hidden) {
      const dt = t - last;
      if (dt < 2000) {   // longer gaps are a hidden tab or a shader compile, not load
        ema += (dt - ema) * 0.1; const now = performance.now();
        if (now > quiet) {
          if (ema > 1000 / 28) { lowT = lowT || now; highT = 0; } else if (ema < 1000 / 55) { highT = highT || now; lowT = 0; } else { lowT = highT = 0; }
          if (lowT && now - lowT > 3000 && lv < LEVELS.length - 1) go(lv + 1, false);
          else if (highT && now - highT > 10000 && lv > 0 && now - quiet > lockMs - 20000) go(lv - 1, true);
        }
      }
    }
    last = t; loop0();
  };
  document.addEventListener('visibilitychange', () => { last = 0; lowT = highT = 0; });
  if (stage.isConnected) r.setAnimationLoop(stage._loop);
}

const wait = setInterval(() => {
  const s = document.querySelector('three-d-stage');
  if (s && s._renderer && s._loop) { clearInterval(wait); init(); }
}, 150);
