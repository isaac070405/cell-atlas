// Scale controller: the only place that knows which level is shown and what is selected.
// Viewers and panels read state and listen for "change"; they never write each other.

export const LEVELS = [
  // log10(metres) range covered by each level on the ruler
  { id: 'cell',      module: 'A', unit: 'µm', from: -4.4, to: -5 },
  { id: 'organelle', module: 'A', unit: 'µm', from: -5,   to: -7 },
  { id: 'complex',   module: 'B', unit: 'nm', from: -7,   to: -9 },
  { id: 'atom',      module: 'B', unit: 'Å',  from: -9,   to: -10.2 },
];

const bus = new EventTarget();
export const MUSCLES = ['skeletal-myocyte', 'cardiomyocyte', 'smooth-myocyte'];
const state = { level: 'cell', cell: null, pdb: null, selection: null, lang: 'en', view: 'cells', muscle: MUSCLES[0] };

export const getState = () => ({ ...state });
export const levelInfo = (id = state.level) => LEVELS.find(l => l.id === id);
export const onChange = fn => bus.addEventListener('change', e => fn(e.detail));

export function setState(patch) {
  Object.assign(state, patch);
  // Picking a structure means Module B; picking a cell means Module A.
  if ('pdb' in patch && patch.pdb && levelInfo().module !== 'B') state.level = 'complex';
  if ('cell' in patch && patch.cell && !('level' in patch) && levelInfo().module !== 'A') state.level = 'cell';
  writeUrl();
  bus.dispatchEvent(new CustomEvent('change', { detail: getState() }));
}

// Deep links: ?cell=enterocyte, ?pdb=5XTD, ?level=organelle (same keys as links.json),
// ?view=compare and &muscle=cardiomyocyte for the four-cell comparison
export function readUrl() {
  const q = new URLSearchParams(location.search);
  const patch = {};
  if (q.get('cell')) patch.cell = q.get('cell');
  if (q.get('pdb')) patch.pdb = q.get('pdb').toUpperCase();
  if (LEVELS.some(l => l.id === q.get('level'))) patch.level = q.get('level');
  if (q.get('view') === 'compare') patch.view = 'compare';
  if (MUSCLES.includes(q.get('muscle'))) patch.muscle = q.get('muscle');
  return patch;
}

function writeUrl() {
  const q = new URLSearchParams();
  if (state.cell) q.set('cell', state.cell);
  if (state.pdb) q.set('pdb', state.pdb);
  if (state.level !== 'cell') q.set('level', state.level);
  if (state.view === 'compare' && levelInfo().module === 'A') {
    q.set('view', 'compare');
    if (state.muscle !== MUSCLES[0]) q.set('muscle', state.muscle);
  }
  const s = q.toString();
  history.replaceState(null, '', s ? `?${s}` : location.pathname);
}
