// One WebGL owner at a time. Module A (Three.js, stage 3) and Module B (Mol*) each claim
// the canvas before drawing; claiming disposes the previous owner and frees its context.
// Phones allow only a few live WebGL contexts, so two viewers must never coexist.
let current = null;

export function claim(owner, dispose) {
  if (current && current.owner !== owner) {
    try { current.dispose(); } catch (e) { console.warn('[gl] dispose failed', e); }
  }
  current = { owner, dispose };
}

export function release(owner) {
  if (current?.owner !== owner) return;
  try { current.dispose(); } catch (e) { console.warn('[gl] dispose failed', e); }
  current = null;
}

export const owner = () => current?.owner ?? null;
