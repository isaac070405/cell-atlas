// Part search with everyday names, Latin names, clinical abbreviations and typo tolerance.
// Replaces the plain substring list in #qres. Results pin the part through window.__setPin.

// Each row: [what people type], [words to look for in part names]. Matching is on lower-case text.
const ALIASES = [
  [['collarbone', 'collar bone', 'clavicula'], ['clavicle']],
  [['shoulder blade', 'scapula bone', 'wing bone'], ['scapula']],
  [['breastbone', 'breast bone', 'chest bone'], ['sternum']],
  [['windpipe', 'wind pipe', 'trachea tube'], ['trachea']],
  [['gullet', 'food pipe', 'foodpipe', 'oesophagus'], ['esophagus', 'oesophagus']],
  [['voice box', 'voicebox'], ['larynx']],
  [['kneecap', 'knee cap'], ['patella']],
  [['shin', 'shin bone', 'shinbone'], ['tibia']],
  [['thigh bone', 'thighbone', 'thigh'], ['femur', 'femoral']],
  [['calf bone'], ['fibula']],
  [['jaw', 'jawbone', 'jaw bone', 'mandibula'], ['mandible']],
  [['cheekbone', 'cheek bone'], ['zygomatic']],
  [['tailbone', 'tail bone'], ['coccyx']],
  [['hip bone', 'hipbone', 'pelvic bone', 'os coxae'], ['hip bone', 'ilium', 'ischium', 'pubis', 'os coxae']],
  [['upper arm bone'], ['humerus']],
  [['forearm bone'], ['radius', 'ulna']],
  [['skull', 'cranium', 'head bone'], ['skull', 'cranial', 'cranium']],
  [['ribs', 'rib cage', 'ribcage', 'costae'], ['rib']],
  [['backbone', 'back bone', 'spine bone', 'vertebrae', 'spinal column'], ['vertebra']],
  [['belly', 'tummy', 'ventriculus'], ['stomach', 'gastric']],
  [['gut', 'bowel', 'intestines'], ['intestine', 'colon', 'ileum', 'jejunum', 'duodenum']],
  [['large bowel'], ['colon']],
  [['small bowel'], ['ileum', 'jejunum', 'duodenum', 'small intestine']],
  [['gallbladder', 'gall bladder'], ['gallbladder', 'cystic']],
  [['wee', 'pee', 'urinary bladder', 'vesica urinaria'], ['bladder']],
  [['kidneys', 'ren', 'renal'], ['kidney', 'renal']],
  [['liver', 'hepar'], ['liver', 'hepatic']],
  [['lungs', 'pulmo', 'lung tissue'], ['lung', 'pulmonary']],
  [['windpipe branches', 'airways', 'airway'], ['bronch', 'trachea']],
  [['heart', 'cor', 'ticker'], ['heart', 'atrium', 'ventricle', 'cardiac']],
  [['main artery', 'big artery'], ['aorta']],
  [['neck artery', 'carotid'], ['carotid']],
  [['brain', 'cerebrum', 'grey matter'], ['cortex', 'cerebr', 'brain']],
  [['little brain', 'cerebellum'], ['cerebellum']],
  [['spinal cord', 'spine cord'], ['spinal cord']],
  [['eyeball', 'eye ball'], ['sclera', 'cornea', 'retina', 'eye']],
  [['eardrum', 'ear drum'], ['tympanic']],
  [['funny bone', 'crazy bone'], ['ulnar nerve']],
  [['sciatica', 'sciatic'], ['sciatic nerve']],
  [['achilles', 'heel cord', 'heel tendon'], ['calcaneal tendon', 'achilles']],
  [['biceps', 'bicep'], ['biceps brachii']],
  [['triceps', 'tricep'], ['triceps brachii']],
  [['quads', 'quadriceps', 'front thigh'], ['quadriceps', 'rectus femoris', 'vastus']],
  [['hamstrings', 'hammy', 'back thigh'], ['biceps femoris', 'semitendinosus', 'semimembranosus']],
  [['calf', 'calves', 'calf muscle'], ['gastrocnemius', 'soleus']],
  [['glutes', 'butt', 'buttock', 'bum'], ['gluteus']],
  [['abs', 'six pack', 'sixpack', 'abdominals'], ['rectus abdominis', 'abdominis']],
  [['delts', 'delt', 'shoulder muscle'], ['deltoid']],
  [['traps', 'trap'], ['trapezius']],
  [['lats', 'lat'], ['latissimus']],
  [['pecs', 'pec', 'chest muscle'], ['pectoralis']],
  [['diaphragm', 'breathing muscle'], ['diaphragm']],
  [['sa node', 'pacemaker', 'sinus node'], ['sinoatrial']],
  [['av node'], ['atrioventricular node']],
  [['ivc', 'lower vena cava'], ['inferior vena cava']],
  [['svc', 'upper vena cava'], ['superior vena cava']],
  [['lad', 'widowmaker', 'widow maker'], ['anterior interventricular', 'left anterior descending']],
  [['rv'], ['right ventricle']],
  [['lv'], ['left ventricle']],
  [['ra'], ['right atrium']],
  [['la'], ['left atrium']],
  [['cbd', 'bile duct'], ['common bile duct']],
  [['csf', 'brain fluid'], ['ventricle', 'subarachnoid', 'cerebrospinal']],
  [['ln', 'lymph glands', 'glands in neck'], ['lymph node']],
  [['womb'], ['uterus']],
  [['ovary', 'ovaries', 'eggs'], ['ovary', 'ovarian']],
  [['prostate gland'], ['prostate']],
  [['voice', 'vocal cords', 'vocal chords'], ['vocal', 'larynx']],
  [['tonsils'], ['tonsil']],
  [['adenoids', 'adenoid'], ['pharyngeal tonsil']],
  [['waldeyer', 'waldeyers ring', "waldeyer's ring"], ['tonsil']],
  [['spit glands', 'saliva glands', 'salivary glands'], ['parotid', 'submandibular', 'sublingual']],
  [['velum'], ['soft palate']],
  [['scm', 'sternomastoid'], ['sternocleidomastoid']],
  [['scalenes'], ['scalenus']],
  [['lips', 'lip'], ['lip', 'orbicularis oris']],
  [['cheek'], ['buccal', 'buccinator']],
  [['adams apple', "adam's apple"], ['thyroid cartilage']],
  [['pinky', 'little finger'], ['fifth', 'digit v', 'finger']],
  [['thumb', 'pollex'], ['thumb', 'pollex', 'first metacarpal']],
  [['big toe', 'hallux'], ['hallux', 'big toe']],
];

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();

// Levenshtein distance with an early exit once it passes `max`
function lev(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]; let best = i;
    for (let j = 1; j <= b.length; j++) { const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); cur.push(v); if (v < best) best = v; }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

function init() {
  const T = window.__tree, $ = id => document.getElementById(id), box = $('qres'), inp = $('q');
  let rows = null;   // { label, low, words, sys }
  const build = () => { rows = []; for (const [label, v] of T.labels()) { const low = norm(label); rows.push({ label, low, words: low.split(' '), sys: v.sys }); } };
  const aliasKeys = ALIASES.map(([keys, tg]) => ({ keys: keys.map(norm), tg: tg.map(norm) }));

  function search(raw) {
    if (!rows) build();
    const q = norm(raw); if (!q) return [];
    const qw = q.split(' '), res = new Map();
    const add = (r, score, note) => { const o = res.get(r.label); if (!o || score > o.score) res.set(r.label, { r, score, note }); };
    // names a typed phrase stands for: an alias row matches when the whole phrase, or its first 3+ letters, fits one of its keys
    const targets = [];
    for (const a of aliasKeys) { const k = a.keys.find(k => k === q || (q.length >= 3 && k.startsWith(q))); if (k) targets.push({ tg: a.tg, key: k }); }
    for (const r of rows) {
      if (r.low === q) add(r, 100);
      else if (r.low.startsWith(q)) add(r, 90);
      else if (r.words.some(w => w.startsWith(q))) add(r, 80);
      else if (r.low.includes(q)) add(r, 70);
      // a phrase that is exactly an alias outranks incidental word matches ("belly" finds the stomach before the digastric belly); names that start with the target rank first
      for (const t of targets) { const hit = t.tg.filter(w => r.low.includes(w)); if (hit.length) add(r, (t.key === q ? 85 : 65) + (hit.some(w => r.words.some(x => x.startsWith(w))) ? 3 : 0), t.key); }
      // typos (words of 4+ letters only, short ones would match too much): every typed word must be within 1 edit (up to 5 letters) or 2 edits of some word in the name, or start it
      if (!res.has(r.label) && qw.every(w => w.length >= 4)) {
        let d = 0, ok = true;
        for (const w of qw) { const max = w.length <= 5 ? 1 : 2; let best = max + 1;
          for (const x of r.words) { if (x.startsWith(w)) { best = 0; break; } const e = lev(w, x.slice(0, w.length + 1), max); if (e < best) best = e; }
          if (best > max) { ok = false; break; } d += best; }
        if (ok) add(r, 50 - d * 8);
      }
    }
    return [...res.values()].sort((a, b) => b.score - a.score || a.r.label.length - b.r.label.length || a.r.label.localeCompare(b.r.label)).slice(0, 8);
  }

  function render() {
    box.innerHTML = ''; const raw = inp.value.trim(); if (!raw) return;
    const hits = search(raw);
    if (!hits.length) { box.innerHTML = '<div style="font-size:12px;color:var(--color-neutral-700);padding:4px">No match. Try a common name, a Latin name or fewer letters.</div>'; return; }
    hits.forEach(h => {
      const b = document.createElement('button'); b.className = 'res'; b.innerHTML = '<span></span><small></small>';
      b.firstChild.textContent = h.r.label; b.lastChild.textContent = T.SYSNAME[h.r.sys] + (h.note ? ' · ' + h.note : h.score < 60 ? ' · close match' : '');
      b.onclick = () => window.__setPin(h.r.label); box.appendChild(b);
    });
  }
  inp.addEventListener('input', render);
  window.__search = { search, ALIASES };
  render();
}

const wait = setInterval(() => {
  if (window.__tree && window.__setPin && document.getElementById('q') && document.getElementById('qres')) { clearInterval(wait); init(); }
}, 150);
