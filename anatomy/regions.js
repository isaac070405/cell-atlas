// Region views: each button under "Body parts" shows one set of structures and flies the camera to it.
// A view is a rule on a structure's label, system and position; everything else is hidden until Reset.
// Views that look into a tube or cavity cut the body in the midline and show the right half from the left.
// The older view buttons (brain, kidney, reproductive, limbs) keep their own engine in anatomy-part2.js.

const re = rx => it => rx.test(it.label);
const S = (sys, rx) => it => it.sys === sys && (!rx || rx.test(it.label));
const any = (...f) => it => f.some(g => g(it));
const Y = (y0, y1, xm = 9) => it => it.c.y >= y0 && it.c.y <= y1 && Math.abs(it.c.x) <= xm;
const and = (...f) => it => f.every(g => g(it));
const rightSide = it => it.c.x < 0.006;   // the figure's right is -x; the midline counts

const HEART_PARTS = /ventricle|atrium|atrial|valve|papillary|chordae|trabecul|Interventricular septum|Interatrial septum|Fossa ovalis|Crista terminalis|pectinati|Conus arteriosus|Aortic vestibule|annulus|Coronary sinus|auricle|Sinoatrial|Atrioventricular \(AV\)/i;
const HEART_MUSCLE = /myocardium/i;
const GREAT = /^(Ascending aorta|Descending thoracic aorta|Brachiocephalic trunk|Pulmonary trunk|Superior vena cava|Inferior vena cava|Pulmonary artery|Superior pulmonary vein|Inferior pulmonary vein|Left brachiocephalic vein|Right brachiocephalic vein|Common carotid artery|Subclavian artery|Pulmonary arteries, intrapulmonary|Pulmonary veins, intrapulmonary)/;
const LARYNX = /Thyroid cartilage|Cricoid|Arytenoid|Vocal fold|Vestibular fold|Epiglottis|Aryepiglottic|Thyrohyoid|Cricothyroid|Corniculate|Cuneiform|Hyoid bone/;
const LARYNX_MUSCLE = /cricoarytenoid|Thyroarytenoid|Vocalis|arytenoid|^Cricothyroid|Thyrohyoid|Inferior pharyngeal constrictor/;
const PHARYNX = /^(Pharynx|Nasopharynx|Oropharynx|Laryngopharynx)|Pharyngeal tonsil|Pharyngeal bursa|Tubal tonsil|Pharyngeal recess|Pharyngeal opening|Salpingopharyngeal fold|Palatine tonsil|Tonsillar|Supratonsillar|Triangular fold|Semilunar fold|Palatine aponeurosis|glossoepiglottic|Epiglottic vallecula|Soft palate|Uvula|Torus tubarius|Epiglottis|Tongue|Palatoglossal|Palatopharyngeal|Lingual tonsil|Pharyngotympanic|Hyoid bone|Arytenoid|Cricoid|Thyroid cartilage|Esophagus, cervical/;
const LYMPH = /lymph|Thoracic duct|Cisterna chyli|Peyer|tonsil|appendix|^Spleen|^Thymus|lacteal|Right lymphatic duct|Lymphatic/i;
const LYMPH_NOT = /Sinoatrial|Atrioventricular|Omental appendices|Taenia|Thymus gland/;

const VIEWS = {
  // ───── head ─────
  eye: { name: 'Eye (right)', dir: [-0.55, 0.12, 1], test: any(and(S('senses', /Sclera|Choroid|Retina|Vitreous|Cornea|Iris|Lens|Suspensory ligament of lens|Pupil|Lacrimal gland|Common tendinous ring|Trochlea/), rightSide), and(S('muscular', /rectus|oblique|Levator palpebrae/i), rightSide, Y(1.62, 1.68)), and(S('nervous', /Optic nerve|\(CN II\)|Oculomotor|Trochlear|Abducens/), rightSide, Y(1.6, 1.69))) },
  earouter: { name: 'Outer ear (right)', dir: [-1, 0.08, 0.1], test: and(S('senses', /Auricle|External acoustic meatus|Tympanic membrane/), rightSide) },
  earmiddle: { name: 'Middle ear (right)', dir: [-1, 0.15, 0.2], test: and(S('senses', /Tympanic|Malleus|Incus|Stapes|Pharyngotympanic/), rightSide) },
  earinner: { name: 'Inner ear (right)', dir: [-1, 0.2, 0.3], test: any(and(S('senses', /Vestibule|semicircular|Cochlea/), rightSide), and(S('nervous', /Vestibulocochlear/), rightSide)) },
  earall: { name: 'Whole ear (right)', dir: [-1, 0.15, 0.2], test: any(and(S('senses', /Auricle|External acoustic|Tympanic|Malleus|Incus|Stapes|Vestibule|semicircular|Cochlea|Pharyngotympanic/), rightSide), and(S('nervous', /Vestibulocochlear|Facial nerve \(CN VII\)/), rightSide, Y(1.58, 1.64))) },
  nasal: { name: 'Nasal cavity (right half, septum omitted)', cut: true, dir: [1, 0.05, 0.12],
    test: any(S('respiratory', /nasal|meatus|Vibrissae|Olfactory|Ethmoid|sinus|Sphenoethmoidal|ostium|Opening of the nasolacrimal|Septal cartilage/i), and(S('skeletal', /Nasal bone|Inferior nasal concha|Hard palate|Piriform|Posterior nasal aperture|anterior nasal spine|Crista galli|Cribriform|Sphenoid bone, body|alar cartilage|nasal cartilage|Septal cartilage/), Y(1.54, 1.72)), re(/Hard palate mucosa|Soft palate|Uvula|Pharyngeal tonsil|Torus tubarius|Pharyngotympanic/)) },
  oral: { name: 'Oral cavity (right half)', cut: true, dir: [1, 0.12, 0.25], test: any(and(Y(1.5, 1.62), S('digestive', /Gingiva|palate|Palatoglossal|Palatopharyngeal|Palatine|Uvula|Tongue|Sulcus terminalis|Foramen cecum|papilla|Lingual|Sublingual|Submandibular|(Upper|Lower) lip|Labial|Alveolar|Floor of the mouth|Retromolar|Median sulcus|Foliate|Plica|Tonsillar|Supratonsillar|Triangular fold|Semilunar fold|glossoepiglottic|Epiglottic vallecula|Incisive|Median palatine|Transverse palatine/i)), S('muscular', /Genioglossus|Hyoglossus|Mylohyoid|Geniohyoid|tongue|Palatoglossus|Palatopharyngeus|Tensor veli|Levator veli|Musculus uvulae|Pterygomandibular|Orbicularis oris/), and(S('skeletal', /Mandible|Maxilla|Hard palate|Hyoid/), Y(1.5, 1.6))) },
  teeth: { name: 'Teeth', dir: [0, 0.28, 1], test: any(S('skeletal', /incisor|Canine|premolar|molar/i), S('digestive', /^Gingiva/), and(S('skeletal', /Mandible|Maxilla/), Y(1.5, 1.6))) },
  salivary: { name: 'Salivary glands and ducts', dir: [0.85, 0.1, 0.55], test: any(S('digestive', /Parotid|Submandibular|Sublingual (gland|fold)|Sublingual caruncle/), S('skeletal', /^Mandible|Hyoid bone/), S('muscular', /Masseter|Mylohyoid/)) },
  oralall: { name: 'Oral cavity with teeth (right half)', cut: true, dir: [1, 0.12, 0.25], test: any(and(Y(1.5, 1.62), S('digestive', /Gingiva|palate|Palatoglossal|Palatopharyngeal|Palatine|Uvula|Tongue|Sulcus terminalis|Foramen cecum|papilla|Lingual|Sublingual|Submandibular|(Upper|Lower) lip|Labial|Alveolar|Floor of the mouth|Retromolar|Median sulcus|Foliate|Plica|Tonsillar|Supratonsillar|Triangular fold|Semilunar fold|glossoepiglottic|Epiglottic vallecula|Incisive|Median palatine|Transverse palatine/i)), S('skeletal', /incisor|Canine|premolar|molar/i), S('muscular', /Genioglossus|Hyoglossus|Mylohyoid|Geniohyoid|tongue|Palatoglossus|Palatopharyngeus|Tensor veli|Levator veli|Musculus uvulae|Pterygomandibular|Orbicularis oris/), and(S('skeletal', /Mandible|Maxilla|Hard palate|Hyoid/), Y(1.5, 1.6))) },
  tooth: { name: 'Single tooth (magnified, cut lengthwise)', dir: [-1, 0.06, 0.16], test: re(/^Magnified tooth/), group: 'toothG', pad: 1.15 },
  skull: { name: 'Skull and teeth', dir: [0.55, 0.15, 1], test: and(S('skeletal'), Y(1.52, 1.8), it => !/Vertebra|disc|Clavicle/.test(it.label)) },
  // ───── neck ─────
  neck: { name: 'Neck: organs, vessels and nerves', dir: [0.2, 0.1, 1], skin: true, test: any(
    and(S('respiratory', /Thyroid cartilage|Cricoid|Arytenoid|Vocal|Vestibular|Epiglottis|Aryepiglottic|Thyrohyoid|Cricothyroid|Trachea|Tracheal|Trachealis/), Y(1.38, 1.6)),
    and(S('endocrine', /Thyroid|Parathyroid|Pyramidal|Isthmus/)), and(S('digestive', /^Pharynx|Esophagus, cervical/), Y(1.38, 1.6)),
    and(S('circulatory'), Y(1.4, 1.6, 0.115), it => !/sinus|Basilar|alveolar|Maxillary|Facial|Lingual|Masseteric|Buccal|Infraorbital|Sphenopalatine|Occipital|auricular|Pterygoid|ophthalmic|temporal/i.test(it.label)),
    and(S('nervous', /Spinal nerve C|Vagus|Phrenic|Accessory|Hypoglossal|Recurrent laryngeal|laryngeal nerve|Ansa|Sympathetic|occipital nerve|Great auricular|Transverse cervical|Supraclavicular nerve/), Y(1.38, 1.62, 0.12)),
    and(S('skeletal', /Vertebra C|Hyoid|disc C/)), S('lymphatic', /cervical|Submandibular|Submental|Supraclavicular|Occipital|Preauricular|jugular/i)) },
  neckmuscle: { name: 'Neck muscles', dir: [0.15, 0.1, 1], skin: false, test: any(and(S('muscular'), Y(1.4, 1.66, 0.13), it => !/Masseter|pterygoid|Zygomaticus|Depressor|Buccinator|Digastric|Mylohyoid|Geniohyoid|Genioglossus|Hyoglossus|Styloglossus|Stylohyoid|Temporalis|fascia|sheath|Splenius capitis|Semispinalis|Rectus capitis posterior|Obliquus capitis|Rhomboid|arytenoid|Vocalis|Tensor veli|Levator veli|Palato|Salpingo|Musculus uvulae|Pterygomandibular|tongue|Orbicularis|Nuchal/.test(it.label)), S('skeletal', /Hyoid|Vertebra C|^Mandible|Clavicle/) ) },
  neckdeep: { name: 'Deep neck: scalenes and prevertebral muscles', dir: [0.3, 0.1, 1], skin: false, test: any(S('muscular', /Scalenus|Longus|Rectus capitis (anterior|lateralis)|Splenius cervicis|Levator scapulae|Omohyoid/), S('skeletal', /Vertebra C|Intervertebral disc C|Rib 1|Rib 2|Clavicle|Hyoid|Occipital bone, basilar/)) },
  thyroid: { name: 'Thyroid and parathyroid glands', dir: [0.1, 0.1, 1], test: any(S('endocrine'), and(S('respiratory', /Trachea|Tracheal|Thyroid cartilage|Cricoid/), Y(1.4, 1.54)), and(S('circulatory', /Common carotid|Superior thyroid|Inferior thyroid|Thyrocervical|Carotid/), Y(1.4, 1.54, 0.06)), and(S('nervous', /Recurrent laryngeal|Vagus/), Y(1.4, 1.54, 0.06)), S('digestive', /Esophagus, cervical/), S('muscular', /Sternothyroid|Sternohyoid/)) },
  // ───── heart ─────
  greatvessels: { name: 'Great vessels', dir: [0, 0.1, 1], test: any(and(S('circulatory'), re(GREAT)), and(S('circulatory'), re(HEART_MUSCLE)), S('respiratory', /^Trachea \(|^Main bronchus|^Carina/)) },
  chambers: { name: 'Heart: chambers and valves (cut open)', dir: [0.1, 0.1, 1], hcut: true, test: and(S('circulatory'), any(re(HEART_PARTS), re(HEART_MUSCLE), re(/^(Ascending aorta|Pulmonary trunk)/))) },
  coronary: { name: 'Coronary arteries and veins', dir: [0.05, 0.1, 1], test: and(S('circulatory'), any(re(/coronary|cardiac vein|Great cardiac|Middle cardiac|Small cardiac|Coronary sinus|interventricular artery|circumflex/i), re(HEART_MUSCLE), re(/^Ascending aorta|^Pulmonary trunk/))) },
  // ───── airway tubes ─────
  trachea: { name: 'Trachea', dir: [0, 0.05, 1], test: any(S('respiratory', /^Trachea|Tracheal|Trachealis|^Carina/), S('digestive', /Esophagus, (cervical|upper thoracic)/), S('endocrine', /Thyroid gland|Isthmus/)) },
  bronchus: { name: 'Main bronchi', dir: [0, 0.2, 1], test: S('respiratory', /^Trachea \(|Tracheal cartilage ring|^Carina|^Main bronchus|Bronchial cartilage/) },
  bronchi: { name: 'Bronchial tree', dir: [0, 0.1, 1], test: S('respiratory', /bronchus|bronchi|^Carina|^Trachea \(/i) },
  larynx: { name: 'Larynx (muscles and nerves omitted)', dir: [0.55, 0.22, 1], test: any(S('respiratory', LARYNX), S('respiratory', /Corniculate|process of the arytenoid|Laryngeal ventricle/), S('skeletal', /Hyoid bone/), and(S('respiratory', /Trachea|Tracheal/), Y(1.44, 1.5))) },
  pharynx: { name: 'Pharynx (right half): nasopharynx, oropharynx, laryngopharynx', cut: true, dir: [1, 0.05, 0.1], test: and(it => it.sys !== 'muscular', re(PHARYNX)) },
  oropharynx: { name: 'Oropharynx (right half)', cut: true, dir: [1, 0.05, 0.12], test: any(re(/^(Oropharynx|Soft palate|Palatine aponeurosis|Uvula|Palatine tonsil|Tonsillar|Supratonsillar|Triangular fold|Semilunar fold|Palatoglossal|Palatopharyngeal|Lingual tonsil|Tongue, pharyngeal|Epiglottis|Sulcus terminalis|Foramen cecum|Vallate|Median glossoepiglottic|Lateral glossoepiglottic|Epiglottic vallecula)/), S('muscular', /Palatoglossus|Palatopharyngeus/), S('skeletal', /^Hyoid bone/)) },
  nasopharynx: { name: 'Nasopharynx (right half)', cut: true, dir: [1, 0.05, 0.12], test: any(re(/^(Nasopharynx|Pharyngeal tonsil|Pharyngeal bursa|Tubal tonsil|Pharyngeal recess|Pharyngeal opening|Salpingopharyngeal fold|Soft palate|Palatine aponeurosis|Uvula|Torus tubarius|Pharyngotympanic|Hard palate mucosa)/), S('muscular', /Levator veli|Tensor veli|Musculus uvulae|Salpingopharyngeus/), S('respiratory', /Inferior nasal concha|Middle nasal concha|Sphenoid sinus/), and(S('skeletal', /Posterior nasal aperture|Sphenoid bone|Occipital bone, basilar|Pharyngeal tubercle|Vomer/), Y(1.56, 1.64))) },
  // ───── digestive ─────
  oesophagus: { name: 'Oesophagus', dir: [0, 0.05, 1], test: any(S('digestive', /^(Esophag|Esophageal|Z-line|Lower oesophageal|Stomach, cardia)/), S('circulatory', /Esophageal artery|Azygos/), S('respiratory', /^Diaphragm \(/)) },
  stomach: { name: 'Stomach', dir: [0, 0.1, 1], test: any(and(S('digestive', /^Stomach|Gastric|Pylor|curvature|Angular incisure|Cardiac notch|Z-line|Lower oesophageal|Gastrosplenic|^Esophagus, abdominal|Duodenum, superior|Lesser omentum|gastro/i), Y(0.9, 1.2)), and(S('circulatory', /gastric|gastro-omental|gastroepiploic/i), it => !/epigastric/.test(it.label))) },
  smallint: { name: 'Small intestine', dir: [0, 0.1, 1], test: any(S('digestive', /Duoden|Jejun|Ileum|Ileal|Ileocecal|Peyer|Mesenteric fat|Root of mesentery|Suspensory muscle of duodenum/), S('circulatory', /Jejunal|Ileal|Superior mesenteric/)) },
  largeint: { name: 'Large intestine', dir: [0, 0.1, 1], test: any(and(Y(0.7, 1.1), S('digestive', /^Cecum|Cecum \(|appendix|colon|Taenia|Omental appendices|^Rectum|Rectal|Transverse rectal|^Anal|Pectinate|Anocutaneous|sphincter, .*part|Internal anal|External anal|Puborectalis|Phrenicocolic|Ileocecal|Greater omentum/i)), S('circulatory', /Inferior mesenteric/)) },
  liver: { name: 'Liver, gallbladder and bile ducts', dir: [0, 0.1, 1], test: any(S('digestive', /^Liver|Gallbladder|Cystic duct|hepatic duct|Common bile duct|Major duodenal papilla|Duodenum, (superior|descending)|Lesser omentum/), S('circulatory', /Hepatic|portal|cystic/i)) },
  pancreas: { name: 'Pancreas and pancreatic ducts', dir: [0, 0.1, 1], test: any(S('digestive', /Pancrea|Uncinate|Common bile duct|duodenal papilla|^Duodenum|^Spleen/), S('circulatory', /Splenic|pancreat|Superior mesenteric/i)) },
  digestall: { name: 'Digestive system', dir: [0, 0.1, 1], test: and(S('digestive'), Y(0.7, 1.45)) },
  // ───── tonsils and lymphatic ─────
  tonsils: { name: 'Tonsils: Waldeyer\'s ring (right half)', cut: true, dir: [1, 0.05, 0.12], test: any(re(/tonsil|Tonsillar|Supratonsillar|Triangular fold|Semilunar fold|Pharyngeal bursa|Torus tubarius|Pharyngeal recess|Pharyngeal opening|Salpingopharyngeal fold/i), re(/^(Pharynx|Oropharynx|Nasopharynx|Soft palate|Palatine aponeurosis|Uvula|Tongue, pharyngeal|Palatoglossal|Palatopharyngeal|Epiglottis)/), S('muscular', /Palatoglossus|Palatopharyngeus|Salpingopharyngeus/)) },
  lymphatic: { name: 'Lymphatic system', dir: [0, 0.05, 1], skin: true, test: any(and(any(re(LYMPH), S('lymphatic')), it => !LYMPH_NOT.test(it.label))) },
  cervnodes: { name: 'Cervical lymph nodes', dir: [0.2, 0.1, 1], skin: true, test: any(S('lymphatic', /cervical|Submandibular|Submental|Supraclavicular|Occipital|Preauricular|jugular|Retropharyngeal|Parotid/i), and(S('circulatory', /Internal jugular vein/), Y(1.4, 1.62)), re(/Palatine tonsil|Pharyngeal tonsil/), and(S('skeletal', /Hyoid|^Mandible/))) },
  peyer: { name: "Peyer's patches (small intestine)", dir: [0, 0.1, 1], test: any(S('digestive', /Peyer|^Ileum/), S('circulatory', /Ileal/)) },
  appendix: { name: 'Appendix and caecum', dir: [-0.3, 0.1, 1], test: and(Y(0.7, 1.1), S('digestive', /appendix|^Cecum|Ileocecal|^Ascending colon|^Ileum|Taenia.*cecum/i)) },
  cisterna: { name: 'Cisterna chyli and thoracic duct', dir: [0, 0.05, 1], skin: true, test: any(re(/Cisterna chyli|Thoracic duct|Right lymphatic duct|lumbar trunk|intestinal trunk/i), and(S('circulatory', /Abdominal aorta|Descending thoracic aorta|Inferior vena cava|Azygos/)), and(S('skeletal', /Vertebra (T|L)\d/), Y(0.9, 1.4))) },
  nodes: { name: 'Lymph nodes', dir: [0, 0.05, 1], skin: true, test: any(and(any(re(/lymph node|Lymph node/i), S('lymphatic')), it => !/vessel|trunk|duct|Cisterna/i.test(it.label) || /node/i.test(it.label))) },
  lymphvessels: { name: 'Lymphatic vessels', dir: [0, 0.05, 1], skin: true, test: any(re(/lymphatic vessel|lymphatic duct|Thoracic duct|Cisterna|lymphatic trunk|lymph vessel|Lymphatic trunk/i), S('lymphatic', /vessel|trunk|duct|collecting/i)) },
};

function init() {
  const A = window.__anat, THREE = A.THREE, model = A.model, G = A.G, stage = document.querySelector('three-d-stage'), $ = id => document.getElementById(id);
  const SYS = window.__tree.SYS, cam = stage._camera, ctl = stage._controls, rend = stage._renderer;
  const isVis = o => { while (o) { if (!o.visible) return false; o = o.parent; } return true; };
  model.updateMatrixWorld(true);
  const items = [], bb = new THREE.Box3();
  model.traverse(o => { if (!o.isMesh || !o.geometry) return; bb.setFromObject(o); if (bb.isEmpty()) return; items.push({ o, label: o.userData.label || '', sys: o.userData.sys || '', name: o.name, c: bb.getCenter(new THREE.Vector3()) }); });
  const cutPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);   // keeps x <= 0, the figure's right half
  let saved = null, current = null; const note = $('viewnote');

  function restore() {
    if (!saved) return;
    saved.sys.forEach((on, k) => { G[k].visible = on; const cb = document.querySelector(`#systems [data-k="${k}"] input`); if (cb) cb.checked = on; });
    saved.mesh.forEach((v, o) => { o.visible = v; });
    if (saved.hcut !== undefined && $('hcut').checked !== saved.hcut) { $('hcut').checked = saved.hcut; $('hcut').onchange && $('hcut').onchange(); }
    if (saved.group) saved.group.visible = false;
    saved = null; rend.clippingPlanes = [];
  }
  function reset(flyHome) {
    restore(); current = null; note.style.display = 'none';
    document.querySelectorAll('[data-r]').forEach(b => b.classList.remove('on'));
    if ($('alvshow').checked) { $('alvshow').checked = false; $('alvshow').onchange({ target: $('alvshow') }); }
    plane(false);
    $('alvbtn').setAttribute('aria-pressed', 'false');
    if (flyHome && window.__camHome) window.__camHome();
  }
  // the large cutting-plane slab would hide a magnified page, so it is switched off while one is open
  let planeWas = null;
  function plane(off) { const sp = $('showplane'); if (!sp) return; if (off && planeWas === null) { planeWas = sp.checked; if (sp.checked) { sp.checked = false; sp.dispatchEvent(new Event('change')); } } else if (!off && planeWas !== null) { if (sp.checked !== planeWas) { sp.checked = planeWas; sp.dispatchEvent(new Event('change')); } planeWas = null; } }
  function say(t) { const l = $('live'); if (l) { l.textContent = ''; setTimeout(() => { l.textContent = t; }, 40); } }

  function show(key) {
    const v = VIEWS[key]; if (!v) return;
    if (window.__expSet) window.__expSet(0);
    $('oldreset').click();                       // end any view of the older engine first
    if (saved) restore();
    if ($('alvshow').checked) { $('alvshow').checked = false; $('alvshow').onchange({ target: $('alvshow') }); }
    const grp = v.group ? A.G[v.group] || (window.__groups && window.__groups[v.group]) : null;
    saved = { sys: new Map(SYS.map(s => [s.k, G[s.k].visible])), mesh: new Map(), hcut: v.hcut ? $('hcut').checked : undefined, group: grp || null };
    const on = new Set(), box = new THREE.Box3(), tmp = new THREE.Box3(); let n = 0;
    if (grp) grp.visible = true;
    items.forEach(it => {
      if (it.sys === 'skin') return;
      const want = !!v.test(it);
      if (it.o.visible !== want) { saved.mesh.set(it.o, it.o.visible); it.o.visible = want; }
      if (want) on.add(it.sys);
    });
    SYS.forEach(s => { const k = s.k, vis = on.has(k) || (k === 'skin' && v.skin); G[k].visible = !!vis; const cb = document.querySelector(`#systems [data-k="${k}"] input`); if (cb) cb.checked = !!vis; });
    items.forEach(it => { if (it.sys !== 'skin' && it.o.visible && isVis(it.o)) { it.o.updateWorldMatrix(true, false); if (!it.o.geometry.boundingBox) it.o.geometry.computeBoundingBox(); box.union(tmp.copy(it.o.geometry.boundingBox).applyMatrix4(it.o.matrixWorld)); n++; } });
    if (v.hcut && !$('hcut').checked) { $('hcut').checked = true; $('hcut').onchange && $('hcut').onchange(); }
    rend.clippingPlanes = v.cut ? [cutPlane] : [];
    if (!n) { say(v.name + ' has no structures in this model yet'); note.style.display = 'block'; note.textContent = v.name + ': no structures found for this view.'; return; }
    plane(!!v.group); current = key; frame(box, v);
    note.style.display = 'block'; note.textContent = 'Showing: ' + v.name + '. Choose Reset to bring everything back.';
    document.querySelectorAll('[data-r]').forEach(b => b.classList.toggle('on', b.dataset.r === key));
    say('Showing ' + v.name);
    if (matchMedia('(max-width: 900px)').matches && window.__drawer) window.__drawer(false);
  }

  function frame(box, v) {
    const c = box.getCenter(new THREE.Vector3()), r = Math.max(0.012, box.getSize(new THREE.Vector3()).length() / 2);
    const dir = new THREE.Vector3(...v.dir).normalize(), d = r / Math.sin(cam.fov * Math.PI / 360) * (v.pad || 1.1);
    // slide the target so the structure sits in the free area right of the side panel
    const pn = document.querySelector('.panel'), L = pn && getComputedStyle(pn).display !== 'none' && getComputedStyle(pn).visibility !== 'hidden' ? pn.getBoundingClientRect().right : 0;
    cam.updateMatrixWorld(true);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir));
    const worldW = 2 * d * Math.tan(cam.fov * Math.PI / 360) * (cam.aspect || 1), tgt = c.clone().addScaledVector(right, -(L / 2 / innerWidth) * worldW);
    const go = window.__camFly; if (go) go(tgt.clone().addScaledVector(dir, d), tgt, 750); else { ctl.target.copy(tgt); cam.position.copy(tgt).addScaledVector(dir, d); ctl.update(); }
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-r]'); if (b) {
      const k = b.dataset.r;
      if (k === 'reset') { reset(true); $('oldreset').click(); return; }
      if (k === 'alveolus') { const cb = $('alvshow'), on = !cb.checked; if (on) { if (saved) restore(); document.querySelectorAll('[data-r]').forEach(x => x.classList.remove('on')); $('oldreset').click(); }
        cb.checked = on; cb.onchange({ target: cb }); plane(on); if (on && window.__alvG) { const bx = new THREE.Box3().setFromObject(window.__alvG); frame(bx, { dir: [0.04, 0.16, 1], pad: 0.95 }); } b.setAttribute('aria-pressed', on); b.classList.toggle('on', on); note.style.display = on ? 'block' : 'none'; note.textContent = 'Showing: single alveolar unit (magnified). Press the button again or Reset to leave it.'; return; }
      if (current === k) { reset(true); return; }   // pressing the active view again leaves it
      show(k); return;
    }
    // an older view button takes over: drop this engine's view without moving the camera
    if (e.target.closest('.vb .b[data-v]:not([data-v=reset])') && (saved || current)) reset(false);
  }, true);

  window.__regions = { VIEWS, show, reset, items };
}

const wait = setInterval(() => {
  if (window.__anat && window.__anat.ready && window.__tree && window.__camFly && document.getElementById('oldreset') && document.getElementById('alvshow') && document.getElementById('systems') && document.querySelector('#systems [data-k]')) { clearInterval(wait); init(); }
}, 150);
