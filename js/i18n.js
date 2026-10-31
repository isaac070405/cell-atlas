// EN / 繁 / 雙語. Strings live in data/i18n.json so every module shares them.
let strings = {};
let mode = 'en';
const KEY = 'hb.lang';

export async function loadStrings() {
  strings = (await (await fetch('data/i18n.json')).json()).strings;
  try { mode = localStorage.getItem(KEY) || 'en'; } catch { mode = 'en'; }
  return mode;
}

export const getLang = () => mode;

export function setLang(next) {
  mode = next;
  try { localStorage.setItem(KEY, next); } catch {}
  document.documentElement.dataset.lang = next;
  document.documentElement.lang = next === 'zh-Hant' ? 'zh-Hant' : 'en';
}

// Plain text in the current mode (bilingual joins with a slash; for attributes)
export function text(keyOrObj) {
  const o = typeof keyOrObj === 'string' ? strings[keyOrObj] : keyOrObj;
  if (!o) return keyOrObj;
  if (mode === 'both') return `${o.en} / ${o['zh-Hant']}`;
  return o[mode] ?? o.en;
}

// HTML in the current mode (bilingual stacks English above Chinese)
export function html(keyOrObj) {
  const o = typeof keyOrObj === 'string' ? strings[keyOrObj] : keyOrObj;
  if (!o) return esc(keyOrObj ?? '');
  if (mode === 'both' && o.en !== o['zh-Hant']) {
    return `<span class="bi"><span>${esc(o.en)}</span><span class="t-zh" lang="zh-Hant">${esc(o['zh-Hant'])}</span></span>`;
  }
  if (mode === 'zh-Hant') return `<span class="t-zh" lang="zh-Hant">${esc(o['zh-Hant'])}</span>`;
  return esc(o.en);
}

export function applyStatic(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = html(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const [attr, key] = el.dataset.i18nAttr.split(':');
    el.setAttribute(attr, text(key));
    if (attr === 'aria-label') el.title = text(key);
  });
}

export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
