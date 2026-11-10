// Layered atlas: every mesh in the model is assigned to one of 14 body layers, from skin (0) to bones and cartilage (13).
// A depth slider peels layers from the outside in, and each layer also has its own visibility toggle.
const LAYERS = [
  { name: 'Skin', note: 'Epidermis, dermis and the fat layer beneath.', color: '#e7c3a5' },
  { name: 'Superficial veins', note: 'Veins in the subcutaneous fat: external jugular, facial, forearm veins.', color: '#4a6fa5' },
  { name: 'Investing fascia', note: 'Deep fascia, aponeuroses, spermatic fasciae, Buck fascia, iliotibial tract, flexor retinaculum.', color: '#e6dccb' },
  { name: 'Superficial muscles', note: 'Muscles just under the fascia: trapezius, deltoid, pectoralis major, gluteus maximus.', color: '#b9473b' },
  { name: 'Second muscle group', note: 'Triceps brachii, gluteus medius, vastus lateralis and medialis, adductor longus, soleus, flexor digitorum superficialis.', color: '#a63d33' },
  { name: 'Intermediate muscles', note: 'Brachialis, serratus anterior, infraspinatus, teres major, piriformis, vastus intermedius, semimembranosus.', color: '#933529' },
  { name: 'Deep muscles', note: 'Supraspinatus, subscapularis, gluteus minimus, adductor magnus, tibialis posterior, thenar muscles, puborectalis.', color: '#7f2d23' },
  { name: 'Deepest muscles', note: 'Diaphragm, supinator, pronator quadratus, sphincters, trachealis, detrusor, and the wall muscle of stomach and oesophagus.', color: '#6b251d' },
  { name: 'Visceral coverings', note: 'Dura mater, pericardium, pleura, omenta and mesenteries, serosae, renal and prostate capsules, testicular tunics.', color: '#d9d2a3' },
  { name: 'Anterior organs', note: 'Heart chambers and valves, larynx, liver, gallbladder, stomach, transverse colon, caecum, bladder, testis, penis.', color: '#d79a8b' },
  { name: 'Deep organs', note: 'Brain, mouth and pharynx, trachea and lungs, oesophagus, pancreas, spleen, bowel, kidneys, prostate, urethra.', color: '#a9646a' },
  { name: 'Deep nerves and vessels', note: 'Cranial and spinal nerves, spinal cord, plexuses, great arteries, cerebral arteries, sinuses and deep veins.', color: '#d9a441' },
  { name: 'Capsules and ligaments', note: 'Cranial sutures, acromioclavicular joint, intervertebral discs, and skeletal, laryngeal and visceral ligaments.', color: '#c9c2a6' },
  { name: 'Bones and cartilage', note: 'Skull, spine, ribs, limb bones, teeth, costal cartilage and airway cartilage rings.', color: '#e6d8b8' },
];

// Layer rules follow "Anatomical Structures Reordered by Layers" (the reference list). Indices are 0-based: 0 Skin ... 13 Bones and cartilage.
// Muscles named in the list sit in the layer it gives. Unlisted muscles fall back to a depth guess further down.
const MUSCLE = [
  [2, /\bfascia\b|^(Rectus|Carotid) sheath|^(Palmar|Bicipital) aponeurosis|iliotibial|linea alba|retinaculum/i],
  [12, /pes anserinus|ligament/i],
  [3, /^(Pectoralis major|Latissimus dorsi|Trapezius|Sternocleidomastoid|Rectus abdominis|External oblique|Deltoid|Biceps brachii|Brachioradialis|Pronator teres|Flexor carpi radialis|Palmaris longus|Flexor carpi ulnaris|Extensor carpi radialis longus|Extensor digitorum \(forearm\)|Gluteus maximus|Tensor fasciae latae|Sartorius|Rectus femoris|Gracilis|Gastrocnemius|Tibialis anterior|Extensor digitorum longus|Ischiocavernosus|Bulbospongiosus)/],
  [4, /^(Flexor digitorum superficialis|Extensor carpi radialis brevis|Triceps brachii|Gluteus medius|Vastus lateralis|Vastus medialis|Pectineus|Adductor longus|Biceps femoris, long|Semitendinosus|Plantaris|Soleus|Calcaneal|Fibularis longus)/],
  [5, /^(Brachialis|Coracobrachialis|Serratus anterior|Infraspinatus|Teres major|Vastus intermedius|Quadriceps tendon|Adductor brevis|Semimembranosus|Biceps femoris, short|Piriformis|Extensor hallucis longus|Fibularis brevis|Fibularis tertius|Cremaster)/],
  [6, /^(Psoas major|Iliacus|Quadratus lumborum|Multifidus|Transversus thoracis|Supraspinatus|Subscapularis|Flexor digitorum profundus|Flexor pollicis longus|Abductor pollicis longus|Thenar|Gluteus minimus|Obturator internus|Gemellus|Quadratus femoris|Adductor magnus|Popliteus|Tibialis posterior|Flexor digitorum longus|Flexor hallucis longus|Extensor digitorum brevis|Puborectalis)/],
  [7, /^(Supinator|Pronator quadratus|Diaphragm|Pubococcygeus|Iliococcygeus)/],
  // not in the list: placed by depth
  [3, /^(Platysma|Orbicularis|Zygomaticus|Depressor anguli|Procerus|Masseter|Temporalis|Buccinator)/],
  [4, /^(Rhomboid|Levator scapulae|Splenius|Internal oblique|Teres minor|Pectoralis minor|Omohyoid|Digastric|Sternohyoid)/],
  [6, /^(Subclavius|Scalenus|Palatoglossus|Pterygomandibular|Obliquus capitis|Rectus capitis|Genioglossus|Hyoglossus|Styloglossus|Stylohyoid|Levator palpebrae|(Superior|Inferior|Lateral|Medial) (rectus|oblique)|Geniohyoid)|muscle of the tongue/],
  [7, /^(Longus|Tensor veli|Salpingopharyngeus|Musculus uvulae|Superior pharyngeal|Middle pharyngeal|Inferior pharyngeal|Palatopharyngeus|Levator veli|Cricothyroid|Lateral cricoarytenoid|Posterior cricoarytenoid|Thyroarytenoid|Vocalis|Oblique arytenoid|Transverse arytenoid|Internal intercostal|External intercostal|Transversus abdominis)/],
];
const SUPERFICIAL_VEIN = /^(Great saphenous|Small saphenous|External jugular|Median (antebrachial|cubital)|Cephalic|Basilic|Dorsal venous network|Facial vein|Superficial temporal vein|Supraorbital vein|Supratrochlear vein|Retromandibular)/;
const VESSEL = /artery|arteries|vein|veins|vessel|plexus|lymphatic|aorta|aortic arch|trunk|vena cava|sinus|carotid body/i;
const NERVE = /nerve|plexus|ganglion|sympathetic|vagus|trunk|cauda equina|ansa|filum|root|ramus|rami|spinal cord|conus medullaris/i;

const stem = l => l.replace(/\s*\((right|left)\)/g, '');

function layerOf(o) {
  const sys = o.userData.sys, label = stem(o.userData.label || o.name || '');
  switch (sys) {
    case 'skin': case 'fat': return 0;
    case 'muscular': { for (const [i, re] of MUSCLE) if (re.test(label)) return i; return 5; }
    case 'skeletal': return /suture|joint|disc|ligament|capsule|menisc|labrum/i.test(label) ? 12 : 13;
    case 'circulatory':
      if (/^(Fibrous pericardium|Epicardial fat)/.test(label)) return 8;
      if (/Papillary muscle|Musculi pectinati|Trabeculae carneae/.test(label)) return 7;
      if (/^Ligamentum arteriosum/.test(label)) return 12;
      if (/^(Thoracic duct|Cisterna chyli)/.test(label)) return 11;
      if (SUPERFICIAL_VEIN.test(label)) return 1;
      return VESSEL.test(label) ? 11 : 9; // heart chambers, valves and the conduction system stay anterior organs
    case 'respiratory':
      if (/^Diaphragm|Caval opening|Aortic hiatus|Trachealis|smooth muscle/i.test(label)) return 7;
      if (/^Pleura/.test(label)) return 8;
      if (/^(Thyrohyoid ligament|Cricothyroid ligament|Pulmonary ligament)|arcuate ligament/.test(label)) return 12;
      if (/^(Thyroid cartilage|Cricoid|Arytenoid|Epiglottis|Vocal fold|Vestibular fold)/.test(label)) return 9;
      if (/cartilage/i.test(label)) return 13;
      return 10; // trachea, bronchi, lungs, alveoli
    case 'digestive':
      if (/gastrosplenic|omentum|mesenter|taenia|omental appendic|serosa|tunica adventitia|peritone/i.test(label)) return 8;
      if (/Phrenicocolic/i.test(label)) return 12;
      if (VESSEL.test(label)) return 11;
      if (/muscle layer|sphincter|Suspensory muscle/i.test(label)) return 7;
      if (/bile duct|biliary|cystic|hepatic duct/i.test(label)) return 10;
      if (/^(Upper lip|Lower lip|Labial|Alveolar mucosa|Parotid|Submandibular|Sublingual gland)/.test(label)) return 9;   // lips, vestibule lining and the salivary glands sit with the anterior organs
      return /Liver|Gallbladder|Stomach|Gastric|curvature|Angular incisure|Cardiac notch|Transverse colon|Cecum|Caecum|Vermiform|Appendix/i.test(label) ? 9 : 10;
    case 'urinary':
      if (/Renal capsule|Renal sinus fat/.test(label)) return 8;
      if (/ligament/i.test(label)) return 12;
      if (VESSEL.test(label)) return 11;
      if (/Detrusor|sphincter/i.test(label)) return 7;
      return /^(Urinary bladder|Bladder mucosa|Trigone)/.test(label) ? 9 : 10;
    case 'reproductive':
      if (/^Scrotum|Penile skin|raphe/i.test(label)) return 0;
      if (/Dartos|spermatic fascia|Buck|Rectoprostatic|Retromammary|pectoral fascia/i.test(label)) return 2;
      if (/Ischiocavernosus|Bulbospongiosus/i.test(label)) return 3;
      if (/Cremaster/i.test(label)) return 5;
      if (/Anterior fibromuscular stroma/i.test(label)) return 7;
      if (/Perineal membrane|capsule|Tunica vaginalis|Tunica albuginea|tunica albuginea|Septula|Mediastinum testis/.test(label) && !/Seminal vesicle/.test(label)) return 8;
      if (/ligament/i.test(label)) return 12;
      if (VESSEL.test(label) || /nerve/i.test(label)) return 11;
      return /prostat|Seminal vesicle|Ductus deferens|Ampulla|Ejaculatory|Bulbourethral|urethr|colliculus|utricle/i.test(label) ? 10 : 9;
    case 'endocrine': return /^Thymus/.test(label) ? 10 : 9;
    case 'senses': return 9;
    case 'lymphatic': return /vessel|trunk|duct/i.test(label) ? 11 : 10;
    case 'nervous':
      if (/Dura mater|meninges/i.test(label)) return 8;
      if (/Choroid plexus/.test(label)) return 10;
      return NERVE.test(label) ? 11 : 10;
    default: return -1;
  }
}

function init() {
  const A = window.__anat, G = A.G, $ = id => document.getElementById(id);
  const meshes = LAYERS.map(() => []), base = new Map();
  A.model.traverse(o => { if (!o.isMesh || !o.userData.sys) return; const k = layerOf(o); if (k < 0) return; o.userData.layer = k; meshes[k].push(o); base.set(o, o.visible); });
  const on = LAYERS.map(() => true); let touched = null;

  const apply = () => { meshes.forEach((ms, k) => ms.forEach(o => { o.visible = base.get(o) && on[k]; })); };
  const engage = () => { // the atlas shows every system, so switch them all on once and remember the previous state
    if (touched) return; touched = {}; Object.keys(G).forEach(k => { if (G[k] && G[k].isObject3D && document.querySelector(`#systems [data-k="${k}"]`)) touched[k] = G[k].visible; });
    $('all').click();
  };
  const list = $('lylist'), slider = $('lyslider'), cur = $('lycur');
  LAYERS.forEach((L, k) => {
    const r = document.createElement('label'); r.className = 'ly'; r.dataset.k = k;
    r.innerHTML = `<span class="lyn">${k + 1}</span><span class="sw" style="background:${L.color}"></span><span class="lyt"><b>${L.name}</b><small>${L.note}</small></span><input type="checkbox" checked aria-label="Show ${L.name}">`;
    r.querySelector('input').addEventListener('change', e => { engage(); on[k] = e.target.checked; apply(); sync(); });
    list.appendChild(r);
  });
  function sync() {
    list.querySelectorAll('.ly').forEach((r, k) => { r.querySelector('input').checked = on[k]; r.classList.toggle('off', !on[k]); r.querySelector('.lyt small').style.display = on[k] ? '' : 'none'; });
    const first = on.indexOf(true); cur.textContent = first < 0 ? 'All layers hidden' : 'Outermost visible: ' + LAYERS[first].name;
    slider.value = Math.max(0, first < 0 ? 13 : first);
  }
  slider.addEventListener('input', () => { engage(); const p = +slider.value; on.forEach((_, k) => { on[k] = k >= p; }); apply(); sync(); });
  $('lyall').onclick = () => { on.fill(true); apply(); sync(); };
  $('lyreset').onclick = () => {
    on.fill(true); apply(); sync();
    if (touched) { Object.entries(touched).forEach(([k, v]) => { G[k].visible = v; const cb = document.querySelector(`#systems [data-k="${k}"] input`); if (cb) cb.checked = v; }); touched = null; }
  };
  sync();
  window.__layers = { LAYERS, meshes, layerOf, counts: () => meshes.map(m => m.length) };
  if (/[?&]view=layers/.test(location.search)) { const s = $('layerssec'); s.scrollIntoView(); s.classList.add('hl'); }
}

const wait = setInterval(() => {
  if (window.__anat && window.__anat.ready && document.querySelector('#systems [data-k]') && document.getElementById('lylist')) { clearInterval(wait); init(); }
}, 100);
