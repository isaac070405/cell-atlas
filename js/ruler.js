// Log-scale ruler from 40 µm to 0.6 Å. Each level is a band; clicking a band changes level.
import { LEVELS, getState, setState } from './state.js';
import { html } from './i18n.js';

const LEFT = -4.4, RIGHT = -10.2;            // log10(metres) at the ruler ends
const x = v => ((LEFT - v) / (LEFT - RIGHT)) * 1000;
const DECADES = [
  [-5, '10 µm'], [-6, '1 µm'], [-7, '100 nm'], [-8, '10 nm'], [-9, '1 nm'], [-10, '1 Å'],
];

export function buildRuler() {
  const svg = document.getElementById('ruler-svg');
  svg.setAttribute('viewBox', '0 0 1000 52');
  let s = '';
  for (const l of LEVELS) {
    s += `<rect class="band" data-level="${l.id}" x="${x(l.from) + 1}" y="0" width="${x(l.to) - x(l.from) - 2}" height="34" rx="2"/>`;
  }
  s += `<line class="base" x1="0" x2="1000" y1="40" y2="40"/>`;
  for (let d = -5; d >= -10; d--) {
    s += `<line class="tick" x1="${x(d)}" x2="${x(d)}" y1="36" y2="52"/>`;
  }
  for (let d = -4; d > -11; d--) {
    for (let m = 2; m <= 9; m++) {
      const v = d - 1 + Math.log10(m);
      if (v <= LEFT && v >= RIGHT) s += `<line class="tick-minor" x1="${x(v)}" x2="${x(v)}" y1="40" y2="45"/>`;
    }
  }
  svg.innerHTML = s;

  const labels = document.createElement('div');
  labels.className = 'ruler-ticklabels';
  labels.setAttribute('aria-hidden', 'true');
  labels.innerHTML = DECADES.map(([v, t]) => `<span style="left:${x(v) / 10}%">${t}</span>`).join('');
  svg.after(labels);

  const bands = document.getElementById('ruler-bands');
  bands.innerHTML = LEVELS.map(l => {
    const left = x(l.from) / 10, width = (x(l.to) - x(l.from)) / 10;
    return `<button role="tab" id="lvl-${l.id}" data-level="${l.id}" style="left:${left}%;width:${width}%"></button>`;
  }).join('');
  bands.addEventListener('click', e => {
    const b = e.target.closest('button[data-level]');
    if (b) setState({ level: b.dataset.level });
  });
  bands.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const i = LEVELS.findIndex(l => l.id === getState().level);
    const next = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, i + (e.key === 'ArrowRight' ? 1 : -1)))];
    setState({ level: next.id });
    document.getElementById(`lvl-${next.id}`).focus();
  });
}

export function renderRuler({ level }) {
  document.querySelectorAll('#ruler-svg .band').forEach(r => r.classList.toggle('on', r.dataset.level === level));
  document.querySelectorAll('#ruler-bands button').forEach(b => {
    const on = b.dataset.level === level;
    b.setAttribute('aria-selected', on);
    b.tabIndex = on ? 0 : -1;
    b.innerHTML = html(`level.${b.dataset.level}`);
  });
}
