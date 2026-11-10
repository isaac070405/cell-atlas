
const stage = document.querySelector('three-d-stage');
const { THREE } = await stage.ready;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const model = new THREE.Group(); model.name = 'human_anatomy';

const SYS = [
  { k: 'skin', name: 'Skin', color: '#e7ddd2', on: true,
    blurb: 'The body surface, shown as a translucent shell so the systems beneath stay visible. Adjust it with the opacity slider.',
    parts: ['Head', 'Torso', 'Arms and hands', 'Legs and feet', 'Genitals'] },
  { k: 'fat', name: 'Subcutaneous fat', color: '#e8c96a', on: false,
    blurb: 'The hypodermis: fat and loose connective tissue between the dermis and the deep fascia over muscle. Its depth is set by region, from about 1 mm over the front of the shin and the scalp to 3 cm over the abdomen, buttocks and thighs, with more over the hips, thighs and breasts in the female body. The skin above it is about 2.5 mm thick, up to 6 mm on the back.',
    parts: ['Subcutaneous fat'] },
  { k: 'skeletal', name: 'Skeletal', color: '#e9dfc9', on: true,
    blurb: 'Supports the body, protects organs and anchors muscle. Bone is shown in ivory and cartilage (discs, costal cartilage, joint surfaces) in blue-grey. Hover any bone to name it.',
    parts: ['#Skull', 'Frontal bone', 'Parietal bone', 'Occipital bone', 'Temporal bone', 'Sphenoid bone', 'Zygomatic bone', 'Zygomatic arch', 'Maxilla', 'Nasal bone', 'Inferior nasal concha', 'Vomer', 'Hard palate', 'Pterygoid process', 'Mandible', 'Teeth', 'Hyoid', '#Sutures and landmarks', 'Coronal suture', 'Sagittal suture', 'Lambdoid suture', 'Squamous suture', 'Bregma', 'Lambda', 'Pterion', 'Asterion', 'Glabella', 'Superciliary arch', 'Orbit', 'External occipital protuberance', 'Superior nuchal line', 'Inferior nuchal line', 'Mastoid process', '#Skull base', 'Foramen magnum', 'Occipital condyle', 'Pharyngeal tubercle', 'Hypoglossal canal', 'Jugular foramen', 'Carotid canal', 'Foramen lacerum', 'Foramen ovale', 'Foramen spinosum', 'Stylomastoid foramen', 'Styloid process', 'Mandibular fossa', 'Articular tubercle', 'Choana', 'Incisive fossa', 'Greater palatine foramen', '#Axial skeleton', 'Vertebrae C1–L5', 'Intervertebral discs', 'Sacrum and coccyx', 'Ribs 1–12', 'Costal cartilage', 'Sternum', '#Shoulder and upper limb', 'Clavicle', 'Scapula', 'Glenoid cavity', 'Superior transverse ligament of scapula', 'Inferior transverse ligament of scapula', 'Acromioclavicular joint', 'Humerus', 'Radius and ulna', 'Scaphoid', 'Lunate', 'Triquetrum', 'Pisiform', 'Trapezium', 'Trapezoid', 'Capitate', 'Hamate', 'Metacarpal', 'Finger phalanx', '#Pelvis and lower limb', 'Pelvis', 'Femur', 'Patella', 'Tibia and fibula', 'Talus', 'Calcaneus', 'Navicular', 'Medial cuneiform', 'Intermediate cuneiform', 'Lateral cuneiform', 'Cuboid', 'Metatarsal', 'Toe phalanx', 'Sesamoid bones'] },
  { k: 'muscular', name: 'Muscular', color: '#a5473b', on: false,
    blurb: 'Skeletal muscle produces movement and holds posture, attaching to bone through tendons (white) and aponeuroses. Superficial muscles are the lighter red, deeper layers darker. The arm, forearm, hand, hip, thigh and leg follow anatomical atlas plates.',
    parts: ['#Head and face', 'Orbicularis oculi', 'Orbicularis oris', 'Zygomaticus major', 'Depressor anguli oris', 'Buccinator', 'Procerus', 'Masseter', 'Temporalis', 'Lateral pterygoid', 'Medial pterygoid', 'Superior rectus', 'Inferior rectus', 'Medial rectus', 'Lateral rectus', 'Superior oblique', 'Inferior oblique', 'Levator palpebrae superioris', '#Floor of mouth, tongue and pharynx', 'Digastric', 'Stylohyoid', 'Mylohyoid', 'Geniohyoid', 'Genioglossus', 'Hyoglossus', 'Styloglossus', 'Levator veli palatini', 'Tensor veli palatini', 'Palatoglossus', 'Palatopharyngeus', 'Salpingopharyngeus', 'Musculus uvulae', 'Pterygomandibular raphe', 'Superior longitudinal muscle of the tongue', 'Transverse muscle of the tongue', 'Vertical muscle of the tongue', 'Inferior longitudinal muscle of the tongue', 'Superior pharyngeal constrictor', 'Middle pharyngeal constrictor', 'Inferior pharyngeal constrictor', '#Larynx', 'Cricothyroid', 'Posterior cricoarytenoid', 'Lateral cricoarytenoid', 'Thyroarytenoid', 'Vocalis', 'Transverse arytenoid', 'Oblique arytenoid', '#Neck, trunk and shoulder', 'Platysma', 'Thyrohyoid', 'Sternothyroid', 'Splenius capitis', 'Splenius cervicis', 'Nuchal ligament', 'Semispinalis capitis', 'Rectus capitis posterior major', 'Obliquus capitis inferior', 'Rectus capitis anterior', 'Rectus capitis lateralis', 'Longus capitis', 'Longus colli', 'Scalenus anterior', 'Scalenus medius', 'Scalenus posterior', 'Sternocleidomastoid', 'Sternohyoid', 'Omohyoid', 'Levator scapulae', 'Trapezius', 'Rhomboid minor', 'Rhomboid major', 'Pectoralis major', 'Pectoralis minor', 'Subclavius', 'Serratus anterior', 'External intercostal', 'Internal intercostal', 'Latissimus dorsi', 'Teres major', 'Teres minor', 'Supraspinatus', 'Infraspinatus', 'Subscapularis', 'Erector spinae', 'Rectus abdominis', 'External oblique', 'External oblique, aponeurosis', 'Internal oblique', 'Transversus abdominis', 'Inguinal ligament', 'Thoracolumbar fascia',
      '#Arm', 'Deltoid', 'Coracobrachialis', 'Biceps brachii', 'Biceps brachii, tendon', 'Bicipital aponeurosis', 'Brachialis', 'Triceps brachii', 'Triceps brachii, tendon',
      '#Forearm and hand', 'Brachioradialis', 'Pronator teres', 'Flexor carpi radialis', 'Palmaris longus', 'Flexor carpi ulnaris', 'Flexor digitorum superficialis', 'Flexor digitorum profundus', 'Flexor pollicis longus', 'Abductor pollicis longus', 'Extensor carpi radialis longus', 'Extensor carpi radialis brevis', 'Extensor digitorum (forearm)', 'Flexor retinaculum', 'Palmar aponeurosis', 'Thenar muscles', 'Supinator', 'Pronator quadratus',
      '#Hip and thigh', 'Gluteus maximus', 'Gluteus medius', 'Gluteus minimus', 'Piriformis', 'Obturator internus', 'Gemellus superior', 'Gemellus inferior', 'Quadratus femoris', 'Tensor fasciae latae', 'Iliotibial tract', 'Rectus femoris', 'Vastus lateralis', 'Vastus medialis', 'Vastus intermedius', 'Quadriceps tendon', 'Patellar ligament', 'Sartorius', 'Gracilis', 'Pectineus', 'Adductor longus', 'Adductor brevis', 'Adductor magnus', 'Biceps femoris, long head', 'Biceps femoris, short head', 'Semitendinosus', 'Semimembranosus', 'Pes anserinus',
      '#Leg and foot', 'Gastrocnemius', 'Soleus', 'Plantaris', 'Calcaneal (Achilles) tendon', 'Tibialis anterior', 'Extensor digitorum longus', 'Extensor hallucis longus', 'Fibularis longus', 'Fibularis brevis', 'Fibularis tertius', 'Extensor digitorum brevis', 'Popliteus', 'Tibialis posterior', 'Flexor digitorum longus', 'Flexor hallucis longus'] },
  { k: 'circulatory', name: 'Circulatory', color: '#b3322b', on: true,
    blurb: 'The heart pumps blood through a closed circuit. Deoxygenated blood (blue) returns through the venae cavae to the right heart and goes to the lungs through the pulmonary trunk (purple). Oxygenated blood (red) returns through the pulmonary veins to the left heart and leaves through the aorta. Use Heart cutaway to open the four chambers and see the valves, chordae and papillary muscles.',
    parts: ["#Head and neck vessels","Superior thyroid artery","Superior laryngeal artery","Lingual artery","Facial artery","Occipital artery","Posterior auricular artery","Superficial temporal artery","Maxillary artery","Middle meningeal artery","Deep temporal arteries","Masseteric artery","Buccal artery","Inferior alveolar artery","Posterior superior alveolar artery","Infraorbital artery","Sphenopalatine artery","Facial vein","Angular vein","Supraorbital vein","Supratrochlear vein","Superior ophthalmic vein","Inferior ophthalmic vein","Cavernous sinus","Deep facial vein","Pterygoid plexus","Maxillary vein","Superficial temporal vein","Retromandibular vein","External jugular vein","Common facial vein","Lingual vein","Inferior alveolar vein","Superior thyroid vein","Middle thyroid vein","Inferior thyroid vein","#Heart","Fibrous pericardium","Epicardial fat","Myocardium","Right atrium","Right auricle","Right ventricle","Left atrium","Left auricle","Left ventricle","Interatrial septum","Interventricular septum","Fossa ovalis","Crista terminalis","Musculi pectinati","Trabeculae carneae","Papillary muscle","Chordae tendineae","Tricuspid valve","Mitral valve","Aortic valve","Pulmonary valve","Conus arteriosus","Aortic vestibule","Coronary sinus","#Coronary vessels","Right coronary artery","Left coronary artery","Left anterior descending artery","Circumflex artery","Great cardiac vein","Middle cardiac vein","#Great vessels","Ascending aorta","Aortic arch","Descending thoracic aorta","Abdominal aorta","Brachiocephalic trunk","Pulmonary trunk","Pulmonary artery","Ligamentum arteriosum","Superior pulmonary vein","Inferior pulmonary vein","Superior vena cava","Inferior vena cava","Left brachiocephalic vein","Right brachiocephalic vein","#Head, neck and limbs","Common carotid artery","Internal carotid artery","External carotid artery","Ascending pharyngeal artery","Carotid sinus","Carotid body","Vertebral artery","Subclavian artery","Subclavian vein","Internal jugular vein","#Upper limb arteries","Thyrocervical trunk","Inferior thyroid artery","Suprascapular artery","Transverse cervical artery","Dorsal scapular artery","Axillary artery","Superior thoracic artery","Thoracoacromial artery","Acromial branch","Deltoid branch","Pectoral branches","Lateral thoracic artery","Subscapular artery","Circumflex scapular artery","Thoracodorsal artery","Anterior circumflex humeral artery","Posterior circumflex humeral artery","Brachial artery","Deep artery of arm","Radial collateral artery","Middle collateral artery","Superior ulnar collateral artery","Inferior ulnar collateral artery","Radial recurrent artery","Ulnar recurrent artery","Radial artery","Ulnar artery","Common interosseous artery","Anterior interosseous artery","Posterior interosseous artery","Interosseous recurrent artery","Palmar carpal branches","Dorsal carpal network","Superficial palmar branch of radial artery","Superficial palmar arch","Deep palmar arch","Deep palmar branch of ulnar artery","Princeps pollicis artery","Radialis indicis artery","Common palmar digital artery","Proper palmar digital artery","Dorsal metacarpal artery","Dorsal digital artery","#Upper limb veins","Axillary vein","Brachial vein","Radial veins","Ulnar veins","Cephalic vein","Basilic vein","Median cubital vein","Median antebrachial vein","Dorsal venous network of hand","#Lower limb vessels","Femoral artery","Femoral vein","Azygos vein","#Cerebral vessels","Basilar artery","Anterior cerebral artery","Middle cerebral artery","Posterior cerebral artery","Anterior communicating artery","Posterior communicating artery","Superior sagittal sinus","Straight sinus","Transverse sinus","Sigmoid sinus"] },
  { k: 'respiratory', name: 'Respiratory', color: '#d89a98', on: true,
    blurb: 'Air passes the larynx, the trachea (C-shaped cartilage rings with a muscular back wall) and the bronchial tree to the alveoli, where gas exchange happens across the thin alveolar wall into the capillaries. The right lung has three lobes and the left two, with a cardiac notch. The diaphragm drives breathing, and a magnified alveolar unit can be shown beside the figure (Heart, lungs and diaphragm panel).',
    parts: ["#Nose and paranasal sinuses","Nasal septum, perpendicular plate of ethmoid","Septal cartilage","Crista galli","Superior nasal concha","Middle nasal concha","Inferior nasal concha (mucosa)","Ethmoid air cells","Ethmoid bulla","Frontal sinus","Maxillary sinus","Sphenoid sinus","#Larynx","Aryepiglottic fold","Thyroid cartilage","Cricoid cartilage","Arytenoid cartilage","Epiglottis","Vocal fold","Vestibular fold","Thyrohyoid ligament","Cricothyroid ligament","#Trachea and bronchi","Trachea","Tracheal cartilage ring","Trachealis muscle","Carina","Main bronchus","Bronchial cartilage","Superior lobar bronchus","Middle lobar bronchus","Lingular bronchus","Inferior lobar bronchus","#Lungs","Right superior lobe","Right middle lobe","Right inferior lobe","Left superior lobe","Lingula","Left inferior lobe","Pleura","Pulmonary arteries, intrapulmonary","Pulmonary veins, intrapulmonary","Alveoli","Hilar lymph node","Pulmonary ligament","#Diaphragm","Diaphragm","Central tendon","Right crus","Left crus","Medial arcuate ligament","Lateral arcuate ligament","Median arcuate ligament","Caval opening","Aortic hiatus","Esophageal hiatus","Phrenic nerve","#Single alveolar unit (magnified)","Terminal bronchiole","Ciliated epithelium","Smooth muscle","Cartilage (ends before the terminal bronchiole)","Respiratory bronchiole","Alveolar duct","Alveolar sac","Alveolus","Pore of Kohn","Pulmonary arteriole","Pulmonary venule","Pulmonary capillary network","Elastic fibres","Surfactant layer","Type I pneumocyte","Type II pneumocyte","Lamellar bodies","Basement membrane","Capillary endothelium","Alveolar macrophage","Red blood cell","Oxygen diffuses","Carbon dioxide diffuses"] },
  { k: 'digestive', name: 'Digestive', color: '#c9826f', on: false,
    blurb: "Breaks down food, absorbs nutrients and water, and eliminates waste. The mouth holds 32 permanent teeth and a tongue with papillae in front of the V-shaped sulcus terminalis and the lingual tonsil behind it. The lips and cheeks line a vestibule outside the teeth, the hard and soft palate roof the mouth, and a palatine tonsil lies in each tonsillar fossa between the faucial arches, with the pharyngeal, tubal and lingual tonsils completing Waldeyer's ring. The parotid, submandibular and sublingual glands empty into the mouth through their ducts. The oesophagus narrows at four points and changes from striated to smooth muscle down its length. The J-shaped stomach has a fundus above the cardia, an angular incisure on the lesser curvature and a thick-walled pyloric canal; its translucent wall shows three muscle layers over red, folded mucosa. The duodenum curves around the pancreatic head. The jejunum (upper left, wider, redder, tall folds, long vasa recta) gives way to the ileum (lower right, narrower, fatty mesentery, Peyer’s patches). The colon carries haustra, three taeniae and fatty appendices; the rectum follows the sacrum and bends at the puborectalis sling into the anal canal.",
    parts: ["#Lips and vestibule","Upper lip","Lower lip","Labial frenulum","Labial and buccal mucosa","Alveolar mucosa","Parotid papilla","Retromolar trigone","#Oral cavity","Central incisor","Lateral incisor","Canine","First premolar","Second premolar","First molar","Second molar","Third molar","Gingiva","Floor of the mouth","Hard palate mucosa","Median palatine raphe","Incisive papilla","Transverse palatine folds (rugae)","Soft palate","Palatine aponeurosis","Uvula","#Fauces and tonsils (Waldeyer's ring)","Palatoglossal arch","Palatopharyngeal arch","Palatine tonsil","Tonsillar crypts","Tonsillar capsule and fossa","Supratonsillar fossa","Triangular fold","Semilunar fold","Lingual tonsil","Pharyngeal tonsil","Pharyngeal bursa","Tubal tonsil","Torus tubarius","Pharyngeal opening of the auditory tube","Pharyngeal recess","Salpingopharyngeal fold","#Tongue","Tongue, oral part","Tongue, pharyngeal part","Fungiform papillae","Vallate papillae","Foliate papillae","Sulcus terminalis","Foramen cecum","Median sulcus of the tongue","Lingual septum","Median glossoepiglottic fold","Lateral glossoepiglottic fold","Epiglottic vallecula","Lingual frenulum","Plica fimbriata","Deep lingual vein","Sublingual caruncle","Sublingual fold","#Salivary glands","Parotid gland","Parotid duct","Submandibular gland","Submandibular duct","Sublingual gland","#Pharynx and oesophagus","Pharynx","Esophagus, cervical part","Esophagus, upper thoracic part","Esophagus, mid-thoracic part","Esophagus, lower thoracic part","Esophagus, abdominal part","Esophageal mucosa (longitudinal folds)","Esophagus, tunica adventitia","Esophagus, abdominal serosa","Esophagus, longitudinal muscle layer","Esophagus, circular muscle layer","Esophageal hiatus","Z-line","Lower oesophageal sphincter","#Stomach","Stomach, cardia","Stomach, fundus","Stomach, body","Stomach, pyloric antrum","Stomach, pyloric canal","Pyloric sphincter","Cardiac notch","Angular incisure","Lesser curvature","Greater curvature","Stomach serosa","Stomach, longitudinal muscle layer","Stomach, circular muscle layer","Stomach, oblique muscle layer","Gastric mucosa (rugae)","Left gastric artery","Right gastric artery","Left gastro-omental artery","Right gastro-omental artery","Short gastric arteries","Lesser omentum","Gastrosplenic ligament","Greater omentum","#Liver, biliary tree, pancreas, spleen","Liver","Gallbladder","Cystic duct","Common hepatic duct","Common bile duct","Pancreas","Uncinate process","Pancreatic duct","Accessory pancreatic duct","Spleen","#Duodenum","Duodenum, superior part (bulb)","Duodenum, descending part","Duodenum, horizontal part","Duodenum, ascending part","Duodenal mucosa","Major duodenal papilla","Minor duodenal papilla","Suspensory muscle of duodenum (ligament of Treitz)","#Jejunum and ileum","Jejunum","Jejunum mucosa (plicae circulares)","Ileum","Ileum mucosa","Peyer's patch","Ileocecal valve","Root of mesentery","Jejunal arteries (simple arcades, long vasa recta)","Ileal arteries (multi-tier arcades, short vasa recta)","Mesenteric fat","#Large intestine","Cecum","Vermiform appendix","Ascending colon","Transverse colon","Descending colon","Sigmoid colon","Taenia mesocolica","Taenia omentalis","Taenia libera","Omental appendices","Phrenicocolic ligament","#Rectum and anal canal","Rectum","Rectal mucosa","Transverse rectal fold (valves of Houston)","Anal canal","Anal columns","Pectinate line","Anal pecten","Anocutaneous line","Anal verge","Internal anal sphincter","External anal sphincter","Puborectalis","#Single tooth (magnified canine, cut lengthwise)","Enamel","Dentin","Dentinal tubules","Pulp chamber","Root canal","Cementum","Periodontal ligament","Alveolar bone","Gingiva","Cementoenamel junction","Apical foramen","Pulp nerve","Pulp artery","Pulp vein"] },
  { k: 'urinary', name: 'Urinary', color: '#8a4a3d', on: false,
    blurb: 'The kidneys filter blood and form urine, which drains from the renal papillae into the minor and major calyces and the renal pelvis, then down the ureters to the bladder. The renal cortex is shown translucent so the medullary pyramids and collecting system are visible inside. At the hilum the renal vein lies in front, the artery in the middle and the pelvis behind. Each ureter narrows at the pelviureteric junction, at the pelvic brim and where it passes obliquely through the bladder wall. The trigone, between the two ureteric orifices and the internal urethral orifice, is the smooth area of the otherwise folded bladder lining.',
    parts: ['#Kidneys', 'Renal capsule', 'Renal cortex', 'Renal pyramid (medulla)', 'Renal papilla', 'Minor calyx', 'Major calyx', 'Renal pelvis', 'Renal sinus fat',
      '#Renal vessels', 'Renal artery', 'Segmental artery', 'Interlobar artery', 'Arcuate artery', 'Renal vein', 'Interlobar vein',
      '#Suprarenal glands', 'Suprarenal gland',
      '#Ureters', 'Ureter, abdominal part', 'Ureter, pelvic part', 'Ureter, intramural part', 'Ureteric orifice',
      '#Bladder', 'Urinary bladder', 'Detrusor muscle', 'Bladder mucosa (rugae)', 'Trigone', 'Internal urethral orifice', 'Internal urethral sphincter', 'Median umbilical ligament (urachus)',
      '#Urethra', 'Urethra, prostatic part', 'Urethra, membranous part', 'External urethral sphincter'] },
  { k: 'reproductive', name: 'Reproductive', color: '#c9866f', on: false,
    blurb: "The reproductive panel supports male and female anatomy. Use the Sex control to switch model variants and view the available reproductive structures.",
    parts: ["#Scrotum and testis","Scrotum","Median raphe","Dartos fascia","External spermatic fascia","Cremaster muscle","Internal spermatic fascia","Tunica vaginalis (parietal layer)","Tunica vaginalis (visceral layer)","Tunica albuginea","Testis, parenchyma","Septula testis","Mediastinum testis","Seminiferous tubules","Rete testis","Efferent ductules","#Epididymis and spermatic cord","Epididymis, head","Epididymis, body","Epididymis, tail","Spermatic cord","Testicular artery","Pampiniform venous plexus","Testicular vein","Superficial inguinal ring","Deep inguinal ring","Inferior epigastric artery","#Ductus deferens and seminal vesicles","Ductus deferens","Ampulla of ductus deferens","Seminal vesicle","Ejaculatory duct","Rectoprostatic fascia (Denonvilliers)","#Prostate","Prostate, capsule","Prostate, peripheral zone","Prostate, central zone","Prostate, transition zone","Anterior fibromuscular stroma","Urethral crest","Seminal colliculus","Prostatic utricle","Ejaculatory duct opening","Prostatic ductule openings","#Perineum","Perineal membrane","Bulbourethral gland","Bulbourethral duct","Ischiocavernosus","Bulbospongiosus","#Penis","Crus of penis","Bulb of penis","Corpus cavernosum","Corpus spongiosum","Septum pectiniforme","Deep artery of penis","Buck's fascia","Deep dorsal vein of penis","Dorsal artery of penis","Dorsal nerve of penis","Glans penis","Corona glandis","Neck of glans","External urethral orifice","Penile skin","Prepuce (foreskin)","#Male urethra","Urethra, prostatic part","Urethra, membranous part","Urethra, spongy part (bulbar)","Urethra, spongy part (penile)","Navicular fossa"] },
  { k: 'senses', name: 'Eye and ear', color: '#7fa6b8', on: false,
    blurb: 'The eyeball sits in the orbit, moved by four recti and two obliques that arise around the optic canal; the levator palpebrae superioris lifts the upper lid and the lacrimal gland lies above and lateral. The ear runs from the auricle and external acoustic meatus to the tympanic membrane, the three ossicles in the tympanic cavity, and the cochlea and semicircular canals in the petrous temporal bone. The pharyngotympanic tube links the middle ear to the nasopharynx.',
    parts: ['#Eye', 'Sclera (eyeball)', 'Choroid', 'Retina', 'Cornea', 'Iris', 'Pupil', 'Lens', 'Suspensory ligament of lens', 'Vitreous body', 'Lacrimal gland', 'Common tendinous ring', 'Trochlea', '#Ear', 'Auricle', 'External acoustic meatus', 'Tympanic membrane', 'Tympanic cavity', 'Malleus', 'Incus', 'Stapes', 'Vestibule', 'Anterior semicircular canal', 'Posterior semicircular canal', 'Lateral semicircular canal', 'Cochlea', 'Pharyngotympanic (auditory) tube'] },
  { k: 'endocrine', name: 'Thyroid and parathyroid', color: '#d99a92', on: false,
    blurb: 'The thyroid gland wraps the front of the trachea below the larynx: two lobes joined by an isthmus over the second to fourth tracheal rings, often with a pyramidal lobe rising toward the hyoid. Four parathyroid glands sit on the back of the lobes. Blood comes from the superior thyroid artery (external carotid) and the inferior thyroid artery (thyrocervical trunk).',
    parts: ['Thyroid gland, right lobe', 'Thyroid gland, left lobe', 'Isthmus of thyroid gland', 'Pyramidal lobe', 'Parathyroid glands, superior pair', 'Parathyroid glands, inferior pair'] },
  { k: 'nervous', name: 'Nervous', color: '#e1ad66', on: false,
    blurb: 'Senses, integrates and responds. The central nervous system is the brain and spinal cord; cranial and spinal nerves form the peripheral system. The cerebral cortex is coloured by lobe: frontal (green), parietal (yellow), temporal (blue), occipital (pink), limbic (tan) and insula (purple). Use the view buttons for lateral, medial and inferior views of the brain, or the whole spine.',
    parts: ["#Face, jaw, orbit and larynx","Infraorbital nerve","Zygomatic nerve","Superior alveolar nerves","Pterygopalatine ganglion","Inferior alveolar nerve","Mental nerve","Lingual nerve","Buccal nerve","Auriculotemporal nerve","Masseteric nerve","Mylohyoid nerve","Deep temporal nerves","Frontal nerve","Lacrimal nerve","Ciliary ganglion","Short ciliary nerves","Superior laryngeal nerve","Recurrent laryngeal nerve","Ansa cervicalis","Lesser occipital nerve","Great auricular nerve","Transverse cervical nerve","Supraclavicular nerves","Cochlear root (CN VIII)","Vestibular root (CN VIII)","#Cerebrum","Cerebral cortex","Cerebral white matter","#Deep structures","Corpus callosum","Septum pellucidum","Fornix","Anterior commissure","Thalamus","Pulvinar","Lateral geniculate body","Interthalamic adhesion","Hypothalamus","Mammillary body","Subthalamic nucleus","Pineal gland","Infundibulum","Adenohypophysis","Neurohypophysis","Optic chiasm","Optic tract","Caudate nucleus","Putamen","Globus pallidus","Amygdala","Hippocampus","Internal capsule","#Ventricular system","Lateral ventricle","3rd ventricle","Interventricular foramen","Cerebral aqueduct","4th ventricle","Choroid plexus","Central canal","#Brainstem and cerebellum","Midbrain","Cerebral peduncle","Superior colliculus","Inferior colliculus","Brachium of inferior colliculus","Pons","Medulla oblongata","Pyramid","Cerebellum","#Cranial nerves","Olfactory nerve (CN I)","Optic nerve (CN II)","Oculomotor nerve (CN III)","Trochlear nerve (CN IV)","Trigeminal nerve (CN V)","Abducens nerve (CN VI)","Facial nerve (CN VII)","Vestibulocochlear nerve (CN VIII)","Glossopharyngeal nerve (CN IX)","Vagus nerve (CN X)","Accessory nerve (CN XI)","Hypoglossal nerve (CN XII)","#Spinal cord and spinal nerves","Spinal cord","Dura mater","Filum terminale","Cauda equina","Dorsal root ganglion","Spinal nerve","Intercostal nerve","#Brachial plexus and arm","Brachial plexus, C5 root","Upper trunk","Middle trunk","Lower trunk","Anterior division","Posterior division","Lateral cord","Medial cord","Posterior cord","Musculocutaneous nerve","Axillary nerve","Radial nerve","Median nerve","Ulnar nerve","Dorsal scapular nerve","Long thoracic nerve","Suprascapular nerve","Nerve to subclavius","Lateral pectoral nerve","Medial pectoral nerve","Superior subscapular nerve","Thoracodorsal nerve","Inferior subscapular nerve","Medial cutaneous nerve of arm","Medial cutaneous nerve of forearm","Intercostobrachial nerve","Posterior cutaneous nerve of arm","Inferior lateral cutaneous nerve of arm","Posterior cutaneous nerve of forearm","#Forearm and hand nerves","Superficial branch of radial nerve","Deep branch of radial nerve","Anterior interosseous nerve","Palmar branch of median nerve","Dorsal branch of ulnar nerve","Palmar branch of ulnar nerve","#Leg","Lumbosacral plexus","Femoral nerve","Saphenous nerve","Sciatic nerve","Tibial nerve","Common fibular nerve","Deep fibular nerve","Superficial fibular nerve","Medial sural cutaneous nerve","Lateral sural cutaneous nerve","Sural communicating nerve","Sural nerve"] },
];
const G = {};
for (const s of SYS) { const g = new THREE.Group(); g.name = s.k + '_system'; g.visible = s.on; G[s.k] = g; model.add(g); }

const M = (name, color, rough = 0.65, o = {}) => new THREE.MeshStandardMaterial({ name, color, roughness: rough, metalness: 0, ...o });
const mat = {
  skin: M('skin', 0xe7ddd2, 0.75, { transparent: true, opacity: 0.12, depthWrite: false }),
  bone: M('bone', 0xe6d8b8, 0.6), cartilage: M('cartilage', 0xa3bdd1, 0.5), teeth: M('teeth', 0xf4efe2, 0.4), skull: M('skull_bone', 0xe6d8b8, 0.6, { transparent: true, opacity: 0.5, depthWrite: false }),
  socket: M('socket', 0x2d2b2b, 0.9),
  muscle: M('muscle', 0xa5473b, 0.7), diaphragm: M('diaphragm', 0xc07a62, 0.7, { side: THREE.DoubleSide }),
  artery: M('artery', 0xb3322b, 0.5), vein: M('vein', 0x3f5f8f, 0.5), heart: M('heart', 0x9c2f33, 0.55),
  lung: M('lung', 0xd89a98, 0.8, { transparent: true, opacity: 0.78, depthWrite: false }), airway: M('airway', 0xe8d3c4, 0.5),
  liver: M('liver', 0x6e3a2a, 0.6), stomach: M('stomach', 0xc9826f, 0.6), gall: M('bile', 0x6b7a3a, 0.5), pancreas: M('pancreas', 0xd9b27a, 0.7),
  smallInt: M('small_intestine', 0xd9a08a, 0.55), largeInt: M('large_intestine', 0xb97a5c, 0.6),
  kidney: M('kidney', 0x8a4a3d, 0.55), bladder: M('bladder', 0xd0a89a, 0.6),
  brain: M('brain', 0xd9b3ae, 0.7), nerve: M('nerve', 0xe1ad66, 0.5),
};
const pretty = n => { n = n.replace(/_\d+$/, '').replace(/_(left|right)$/, ' ($1)').replace(/_/g, ' '); return n[0].toUpperCase() + n.slice(1); };
function reg(sys, name, m, o = {}) { m.name = name; m.userData.label = o.label || pretty(name); m.userData.sys = sys; G[sys].add(m); return m; }
function xf(m, pos, o = {}) { if (pos) m.position.set(...pos); if (o.scale) m.scale.set(...o.scale); if (o.rot) m.rotation.set(...o.rot); return m; }
const sph = (sys, name, r, pos, mt, o) => reg(sys, name, xf(new THREE.Mesh(new THREE.SphereGeometry(r, 36, 24), mt), pos, o), o);
const box = (sys, name, d, pos, mt, o) => reg(sys, name, xf(new THREE.Mesh(new THREE.BoxGeometry(...d), mt), pos, o), o);
const cap = (sys, name, r, len, pos, mt, o) => reg(sys, name, xf(new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 12, 32), mt), pos, o), o);
const Y = V(0, 1, 0);
function seg(sys, name, a, b, r1, r2, mt, o = {}) {
  const A = V(...a), B = V(...b), d = B.clone().sub(A);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, d.length(), 24, 1), mt);
  m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(Y, d.normalize());
  if (o.scale) m.scale.set(...o.scale);
  return reg(sys, name, m, o);
}
function bone(name, a, b, r1, r2, o = {}) {
  seg('skeletal', name, a, b, r1, r2, mat.bone, o);
  sph('skeletal', name + '_head', r1 * 1.45, a, mat.bone, { label: o.label || pretty(name) });
  sph('skeletal', name + '_end', r2 * 1.45, b, mat.bone, { label: o.label || pretty(name) });
}
function tube(sys, name, pts, r, mt, o = {}) {
  const c = new THREE.CatmullRomCurve3(pts.map(p => V(...p)));
  return reg(sys, name, new THREE.Mesh(new THREE.TubeGeometry(c, pts.length * 10, r, 10, false), mt), o);
}

// ───────── SKIN ─────────
sph('skin', 'head', 0.1, [0, 1.635, 0], mat.skin, { scale: [0.88, 1.12, 1] });
sph('skin', 'nose', 0.018, [0, 1.62, 0.095], mat.skin, { scale: [0.8, 1.3, 1] });
sph('skin', 'ear_right', 0.022, [-0.088, 1.635, -0.005], mat.skin, { scale: [0.5, 1.2, 0.9] });
sph('skin', 'ear_left', 0.022, [0.088, 1.635, -0.005], mat.skin, { scale: [0.5, 1.2, 0.9] });
sph('skin', 'jaw', 0.05, [0, 1.562, 0.034], mat.skin, { scale: [1.45, 0.9, 1.02], label: 'Head' });
const prof = [[0.001,0.88],[0.15,0.89],[0.175,0.95],[0.17,1.02],[0.145,1.1],[0.15,1.18],[0.17,1.27],[0.18,1.36],[0.165,1.42],[0.1,1.46],[0.05,1.47],[0.001,1.475]].map(([r, y]) => new THREE.Vector2(r, y));
// torso, neck and limb skin are fitted around the finished model (see SKIN ENVELOPES)

// ───────── SKELETAL ─────────
const SK = 'skeletal';
const poly = (pts, s = 1, k = 1) => new THREE.Shape(new THREE.SplineCurve(pts.concat([pts[0]]).map(([x, y]) => new THREE.Vector2(s * x * k, y * k))).getPoints(pts.length * 10));
const plate = (name, shape, depth, mt, pos, o = {}) => {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.0014, bevelSize: 0.0014, bevelSegments: 2, curveSegments: 10 });
  g.translate(0, 0, -depth / 2); return reg(SK, name, xf(new THREE.Mesh(g, mt), pos, o), o);
};
function digit(base, start, dir, lens, r0, lab, jm = mat.bone) {
  let p = V(...start); const d = V(...dir).normalize();
  lens.forEach((L, i) => {
    const q = p.clone().addScaledVector(d, L), r1 = r0 * (1 - 0.12 * i), r2 = r1 * 0.85, label = typeof lab === 'function' ? lab(i, lens.length) : lab;
    seg(SK, `${base}_${i + 1}`, p.toArray(), q.toArray(), r1, r2, mat.bone, { label });
    sph(SK, `${base}_${i + 1}_joint`, r2 * 1.28, q.toArray(), i < lens.length - 1 ? jm : mat.bone, { label });
    p = q.clone().addScaledVector(d, 0.0015);
  });
}

// vertebral column: C1–C7, T1–T12, L1–L5 with discs, arches and processes
const zc = y => -0.055 + 0.016 * Math.cos(((y - 0.93) / 0.61) * 2 * Math.PI) + (y > 1.4 ? ((y - 1.4) / 0.14) * 0.02 : 0);
const VD = {};
{
  let y = 0.97, prev = null;
  for (let i = 0; i < 24; i++) {
    const R = i < 5 ? 'L' : i < 17 ? 'T' : 'C', n = i < 5 ? 5 - i : i < 17 ? 17 - i : 24 - i, lb = R + n;
    const gap = i < 5 ? 0.028 : i < 17 ? 0.0262 : 0.0215; if (i > 0) y += gap;
    const r = R === 'L' ? 0.0195 : R === 'T' ? 0.0128 + 0.0004 * (n - 1) : (n === 2 ? 0.0125 : 0.0112);
    const h = R === 'L' ? 0.022 : R === 'T' ? 0.019 : 0.0145, cR = R === 'L' ? 0.011 : R === 'T' ? 0.0085 : 0.0098;
    const zb = zc(y), zcan = zb - r * 0.85 - cR + 0.002;
    const tpLen = R === 'L' ? 0.032 : R === 'T' ? 0.028 : 0.016, tpBack = R === 'T' ? 0.011 : R === 'L' ? -0.006 : -0.003;
    const d = VD[lb] = { y, r, h, cR, zb, zcan, tpLen, tpBack }; const o = { label: 'Vertebra ' + lb };
    if (n === 1 && R === 'C') {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.0165, 0.0055, 10, 28), mat.bone);
      xf(ring, [0, y, zb - 0.008], { rot: [Math.PI / 2, 0, 0], scale: [1, 0.85, 1] }); reg(SK, 'atlas_C1', ring, o);
    } else {
      reg(SK, 'vertebral_body_' + lb, xf(new THREE.Mesh(new THREE.CylinderGeometry(r * 0.97, r, h, 28), mat.bone), [0, y, zb], { scale: [1, 1, 0.85] }), o);
      const lo = prev || { y: y - gap, h: 0.02, r: 0.02, zb: zc(y - gap), lb: 'S1' };
      const dh = gap - (h + lo.h) / 2 + 0.0004;
      reg(SK, 'intervertebral_disc_' + lb, xf(new THREE.Mesh(new THREE.CylinderGeometry((r + lo.r) / 2 * 1.04, (r + lo.r) / 2 * 1.04, dh, 28), mat.cartilage), [0, y - gap / 2, (zb + lo.zb) / 2], { scale: [1, 1, 0.85] }),
        { label: `Intervertebral disc ${lb}/${lo.lb}` });
    }
    const arc = new THREE.TorusGeometry(cR, 0.0042, 8, 20, Math.PI); arc.rotateZ(Math.PI); arc.rotateX(Math.PI / 2);
    reg(SK, 'lamina_' + lb, xf(new THREE.Mesh(arc, mat.bone), [0, y, zcan]), o);
    for (const s of [-1, 1]) {
      const sd = s < 0 ? 'r' : 'l';
      if (!(n === 1 && R === 'C')) seg(SK, `pedicle_${lb}_${sd}`, [s * r * 0.6, y, zb - r * 0.8], [s * cR, y, zcan], 0.0042, 0.0042, mat.bone, o);
      const tipZ = zcan - tpBack;
      seg(SK, `transverse_process_${lb}_${sd}`, [s * cR, y, zcan], [s * (cR + tpLen), y + 0.001, tipZ], 0.0045, 0.0042, mat.bone, o);
      sph(SK, `transverse_process_tip_${lb}_${sd}`, 0.0058, [s * (cR + tpLen), y + 0.001, tipZ], mat.bone, o);
      sph(SK, `articular_process_${lb}_${sd}`, 0.0046, [s * (cR + 0.002), y + h / 2 - 0.001, zcan - 0.004], mat.bone, o);
    }
    const sb = zcan - cR - 0.003;
    if (R === 'T') seg(SK, 'spinous_process_' + lb, [0, y - 0.002, sb], [0, y - 0.024, sb - 0.022], 0.0046, 0.0028, mat.bone, o);
    else if (R === 'L') seg(SK, 'spinous_process_' + lb, [0, y, sb], [0, y - 0.003, sb - 0.025], 0.006, 0.0055, mat.bone, { ...o, scale: [0.6, 1, 1] });
    else seg(SK, 'spinous_process_' + lb, [0, y - 0.001, sb], [0, y - 0.004, sb - 0.016], 0.004, 0.003, mat.bone, o);
    prev = { ...d, lb }; d.lb = lb;
  }
}
plate('sacrum', poly([[-0.042, 0], [0, 0.005], [0.042, 0], [0.033, -0.05], [0.014, -0.1], [-0.014, -0.1], [-0.033, -0.05]]), 0.024, mat.bone, [0, 0.957, -0.043], { rot: [0.35, 0, 0], label: 'Sacrum' });
seg(SK, 'coccyx', [0, 0.855, -0.066], [0, 0.825, -0.05], 0.007, 0.003, mat.bone);

// thoracic cage: 12 rib pairs with head, neck, tubercle, angle; costal cartilage; sternum
const RW = [0.07, 0.098, 0.122, 0.139, 0.148, 0.155, 0.155, 0.148, 0.136, 0.122, 0.1, 0.08];
const RD = [0.058, 0.072, 0.083, 0.09, 0.093, 0.095, 0.095, 0.093, 0.088, 0.081, 0.063, 0.045];
const RDR = [0.03, 0.04, 0.05, 0.06, 0.07, 0.085, 0.095, 0.1, 0.1, 0.095, 0.07, 0.04];
const RA1 = [2.2, 2.35, 2.35, 2.35, 2.35, 2.35, 2.35, 2.35, 2.35, 2.3, 1.7, 1.3];
const YS = [1.352, 1.322, 1.3, 1.278, 1.256, 1.234, 1.214];
const PM = [[0.034, 1.19, 0.09], [0.052, 1.168, 0.087], [0.07, 1.148, 0.082]];
for (let n = 1; n <= 12; n++) for (const s of [-1, 1]) {
  const sd = s < 0 ? 'right' : 'left', v = VD['T' + n], W = RW[n - 1], D = RD[n - 1], DR = RDR[n - 1], A1 = RA1[n - 1], zcen = -0.002;
  const pts = [[s * v.r * 0.95, v.y + 0.003, v.zb - 0.002], [s * (v.r * 0.95 + 0.012), v.y, v.zb - 0.014], [s * (v.cR + v.tpLen - 0.003), v.y - 0.004, v.zcan - v.tpBack + 0.006]];
  [0.55, 0.95, 1.35, 1.75, 2.1].filter(a => a < A1 - 0.12).concat([A1]).forEach(a => pts.push([s * W * Math.sin(a), v.y - DR * Math.pow(a / A1, 1.3), zcen - D * Math.cos(a)]));
  const rr = n === 1 ? 0.0058 : 0.0046, o = { label: `Rib ${n} (${sd})` };
  tube(SK, `rib_${n}_${sd}`, pts, rr, mat.bone, o);
  sph(SK, `rib_${n}_head_${sd}`, 0.0062, pts[0], mat.bone, o);
  sph(SK, `rib_${n}_tubercle_${sd}`, 0.0055, pts[2], mat.bone, o);
  const E = pts[pts.length - 1], co = { label: `Costal cartilage ${n} (${sd})` };
  let T = null;
  if (n <= 7) T = [s * 0.0185, YS[n - 1], 0.09]; else if (n <= 10) T = [s * PM[n - 8][0], PM[n - 8][1], PM[n - 8][2]];
  if (T) tube(SK, `costal_cartilage_${n}_${sd}`, [E, [(E[0] + T[0]) / 2, (E[1] + T[1]) / 2 + 0.007, (E[2] + T[2]) / 2 + 0.005], T], 0.0056, mat.cartilage, co);
  else sph(SK, `rib_${n}_tip_${sd}`, 0.0055, E, mat.cartilage, co);
}
plate('manubrium', poly([[-0.028, 0], [-0.01, -0.0045], [0.01, -0.0045], [0.028, 0], [0.026, -0.012], [0.017, -0.05], [-0.017, -0.05], [-0.026, -0.012]]), 0.012, mat.bone, [0, 1.372, 0.087], { label: 'Sternum (manubrium)' });
plate('sternal_body', poly([[-0.0175, 0], [0.0175, 0], [0.0185, -0.108], [-0.0185, -0.108]]), 0.011, mat.bone, [0, 1.322, 0.09], { label: 'Sternum (body)' });
sph(SK, 'xiphoid_process', 0.009, [0, 1.195, 0.09], mat.bone, { scale: [1, 2.3, 0.55], label: 'Xiphoid process' });
for (const s of [-1, 1]) sph(SK, 'clavicular_notch_' + (s < 0 ? 'right' : 'left'), 0.006, [s * 0.027, 1.366, 0.087], mat.cartilage, { label: 'Sternoclavicular joint' });

// skull: each bone tinted as in the atlas plates
const SKC = { frontal: 0xd9a48f, parietal: 0xaeb0d0, occipital: 0x86b6d8, temporal: 0xadc79e, sphenoid: 0xdcc66e, zygomatic: 0xe2a466, maxilla: 0xcfa3c6, nasal: 0xc27fb4, palatine: 0xe3a27c, vomer: 0xc96f86 };
const skm = {}, sko = {};
for (const k in SKC) SKC[k] = 0xe6d8b8;
for (const k in SKC) { skm[k] = M('skull_' + k, SKC[k], 0.6, { transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide }); sko[k] = M('skull_' + k + '_solid', SKC[k], 0.6); }
const skSut = M('suture', 0x5b4f40, 0.8);
const CC = [0, 1.642, 0], CR = [0.08, 0.0994, 0.092], sqY = y => y < -0.35 ? -0.35 + (y + 0.35) * 0.45 : y;
const skPt = (x, y, z, k = 1) => { const d = V(x, y, z).normalize(); return [CC[0] + d.x * CR[0] * k, CC[1] + sqY(d.y) * CR[1] * k, CC[2] + d.z * CR[2] * k]; };
function skRegion(x, y, z) {
  const ax = Math.abs(x);
  if (y < -0.6 && z > -0.62 && z < -0.08 && ax < 0.26) return null; // foramen magnum
  if (z > 0.42 && y < 0.14) return null; // facial skeleton built separately
  if (y < -0.5) {
    if (z < -0.1) return ax > 0.55 ? 'temporal' : 'occipital';
    if (z < 0.15) return ax > 0.45 ? 'temporal' : z < 0 ? 'occipital' : 'sphenoid';
    return ax > 0.4 ? 'sphenoid' : null;
  }
  if (z < -0.5 - 0.3 * y) return 'occipital';
  if (ax > 0.3 && z <= 0.18 && y < 0.22 - 0.5 * Math.max(0, -z - 0.15)) return 'temporal';
  if (ax > 0.4 && z > 0.15 && y < 0.12) return 'sphenoid';
  if (z > 0.2 + 0.15 * (1 - y)) return 'frontal';
  return 'parietal';
}
{
  const SKL = { frontal: 'Frontal bone', occipital: 'Occipital bone', sphenoid: 'Sphenoid bone', parietal: 'Parietal bone', temporal: 'Temporal bone' };
  const g = new THREE.SphereGeometry(1, 128, 88).toNonIndexed(), p = g.attributes.position, bk = {};
  for (let i = 0; i < p.count; i += 3) {
    const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, cy = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3, cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
    const r = skRegion(cx, cy, cz); if (!r) continue;
    const key = r === 'parietal' || r === 'temporal' ? r + '_' + (cx < 0 ? 'right' : 'left') : r, b = bk[key] || (bk[key] = { r, a: [], nn: [] });
    for (let j = 0; j < 3; j++) { const q = skPt(p.getX(i + j), p.getY(i + j), p.getZ(i + j)); b.a.push(...q); const nv = V((q[0] - CC[0]) / CR[0] ** 2, (q[1] - CC[1]) / CR[1] ** 2, (q[2] - CC[2]) / CR[2] ** 2).normalize(); b.nn.push(nv.x, nv.y, nv.z); }
  }
  for (const k in bk) { const b = bk[k], gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(b.a, 3)); gg.setAttribute('normal', new THREE.Float32BufferAttribute(b.nn, 3));
    reg(SK, 'skull_' + k, new THREE.Mesh(gg, skm[b.r]), { label: SKL[b.r] + (k.includes('_') ? ' (' + k.split('_')[1] + ')' : '') }); }
}
// sutures and craniometric points
const onSk = (y, z, s) => { const x2 = 1 - y * y - z * z; return x2 >= 0 ? [s * Math.sqrt(x2), y, z] : null; };
const sutT = (name, label, dirs) => { const pts = dirs.filter(Boolean).map(d => skPt(...d, 1.006)); tube(SK, name, pts, 0.0008, skSut, { label }); };
const range = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + (b - a) * i / n);
{
  const cor = s => range(0.12, 0.97, 12).map(y => onSk(y, 0.2 + 0.15 * (1 - y), s));
  sutT('coronal_suture', 'Coronal suture', [...cor(-1).reverse(), [0, 0.978, 0.203], ...cor(1)]);
  sutT('sagittal_suture', 'Sagittal suture', range(0.205, -0.79, 16).map(a => [0, Math.cos(a), Math.sin(a)]));
  const lam = s => range(0.7, -0.45, 12).map(y => onSk(y, -0.5 - 0.3 * y, s));
  sutT('lambdoid_suture', 'Lambdoid suture', [...lam(-1).reverse(), [0, 0.703, -0.711], ...lam(1)]);
  for (const s of [-1, 1]) {
    const sd = s < 0 ? 'right' : 'left';
    sutT('squamous_suture_' + sd, 'Squamous suture (' + sd + ')', range(0.18, -0.47, 12).map(z => onSk(0.22 - 0.5 * Math.max(0, -z - 0.15), z, s)));
    sutT('sphenosquamous_suture_' + sd, 'Sphenosquamous suture (' + sd + ')', range(0.12, -0.45, 6).map(y => onSk(y, 0.17, s)));
    sutT('occipitomastoid_suture_' + sd, 'Occipitomastoid suture (' + sd + ')', range(-0.45, -0.62, 3).map(y => onSk(y, -0.5 - 0.3 * y, s)));
  }
}
const lmk = (name, label, d, r = 0.0024, mt = skSut, o = {}) => sph(SK, name, r, skPt(...d, o.k ?? 1.008), mt, { label, scale: o.scale });
lmk('bregma', 'Bregma', [0, 0.978, 0.203]);
lmk('lambda', 'Lambda', [0, 0.703, -0.711]);
lmk('external_occipital_protuberance', 'External occipital protuberance (inion)', [0, -0.22, -1], 0.0045, sko.occipital, { k: 1.0 });
tube(SK, 'external_occipital_crest', [[0, -0.22, -0.98], [0, -0.5, -0.86], [0, -0.66, -0.66]].map(d => skPt(...d, 1.004)), 0.0012, sko.occipital, { label: 'External occipital crest' });
tube(SK, 'superior_nuchal_line', range(-0.72, 0.72, 10).map(x => skPt(x, -0.24, -Math.sqrt(Math.max(0, 1 - x * x - 0.0576)), 1.004)), 0.001, sko.occipital, { label: 'Superior nuchal line' });
tube(SK, 'inferior_nuchal_line', range(-0.6, 0.6, 10).map(x => skPt(x, -0.5, -Math.sqrt(Math.max(0, 1 - x * x - 0.25)), 1.004)), 0.0009, sko.occipital, { label: 'Inferior nuchal line' });
lmk('glabella', 'Glabella', [0, 0.16, 1], 0.004, sko.frontal, { k: 1.0 });
reg(SK, 'foramen_magnum', xf(new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.0022, 8, 32), sko.occipital), [0, 1.5745, -0.03], { rot: [Math.PI / 2, 0, 0], scale: [1.05, 1.45, 1] }), { label: 'Foramen magnum' });
sph(SK, 'basilar_part_occipital', 0.009, [0, 1.585, -0.003], sko.occipital, { scale: [1.1, 0.5, 1.6], label: 'Occipital bone, basilar part' });
sph(SK, 'pharyngeal_tubercle', 0.0022, [0, 1.58, 0.0], skSut, { label: 'Pharyngeal tubercle' });
sph(SK, 'sphenoid_body', 0.011, [0, 1.6, 0.016], sko.sphenoid, { scale: [1.2, 0.8, 1], label: 'Sphenoid bone, body' });
for (const s of [-1, 1]) {
  const sd = s < 0 ? 'right' : 'left', lb = t => t + ' (' + sd + ')', so = (nm, lab, d, r, sc) => lmk(nm + '_' + sd, lb(lab), [s * d[0], d[1], d[2]], r, mat.socket, { k: 0.995, scale: sc });
  lmk('pterion_' + sd, lb('Pterion'), [s * 0.97, 0.15, 0.18], 0.0045, skSut, { scale: [0.4, 1, 1] });
  lmk('asterion_' + sd, lb('Asterion'), [s * 0.815, -0.45, -0.365], 0.0026);
  lmk('parietal_foramen_' + sd, lb('Parietal foramen'), [s * 0.08, 0.86, -0.5], 0.0014, mat.socket);
  sph(SK, 'occipital_condyle_' + sd, 0.0062, [s * 0.017, 1.5715, -0.018], sko.occipital, { scale: [0.75, 0.6, 1.5], rot: [0, s * 0.35, 0], label: lb('Occipital condyle') });
  sph(SK, 'mastoid_process_' + sd, 0.009, [s * 0.064, 1.588, -0.03], sko.temporal, { scale: [0.75, 1.45, 0.95], label: lb('Mastoid process') });
  so('mastoid_notch', 'Mastoid notch', [0.55, -0.82, -0.33], 0.002);
  seg(SK, 'styloid_process_' + sd, [s * 0.046, 1.585, -0.008], [s * 0.042, 1.556, 0.004], 0.0018, 0.0005, sko.temporal, { label: lb('Styloid process') });
  so('stylomastoid_foramen', 'Stylomastoid foramen', [0.56, -0.82, -0.17], 0.0018);
  so('jugular_foramen', 'Jugular foramen', [0.36, -0.9, -0.16], 0.0034, [1.4, 0.5, 1]);
  so('hypoglossal_canal', 'Hypoglossal canal', [0.26, -0.92, -0.2], 0.0016);
  so('carotid_canal', 'Carotid canal', [0.38, -0.9, -0.04], 0.0026);
  so('foramen_lacerum', 'Foramen lacerum', [0.2, -0.95, 0.05], 0.0024, [1, 0.5, 1.4]);
  so('foramen_ovale', 'Foramen ovale', [0.33, -0.88, 0.12], 0.0026, [0.8, 0.5, 1.5]);
  so('foramen_spinosum', 'Foramen spinosum', [0.42, -0.86, 0.06], 0.0014);
  so('mandibular_fossa', 'Mandibular fossa', [0.66, -0.7, 0.06], 0.0055, [1, 0.5, 1]);
  lmk('articular_tubercle_' + sd, lb('Articular tubercle'), [s * 0.64, -0.72, 0.16], 0.0035, sko.temporal, { k: 0.99 });
  lmk('petrous_part_' + sd, lb('Temporal bone, petrous part'), [s * 0.44, -0.9, -0.08], 0.007, sko.temporal, { k: 0.97, scale: [1.5, 0.5, 0.8] });
  tube(SK, 'superciliary_arch_' + sd, [[0.12, 0.16], [0.3, 0.17], [0.5, 0.15]].map(([x, y]) => skPt(s * x, y, Math.sqrt(1 - x * x - y * y), 1.01)), 0.0022, sko.frontal, { label: lb('Superciliary arch') });
  lmk('supraorbital_notch_' + sd, lb('Supra-orbital notch (foramen)'), [s * 0.33, 0.135, 0.93], 0.0016, mat.socket, { k: 1.012 });
  seg(SK, 'zygomatic_process_frontal_' + sd, skPt(s * 0.66, 0.13, 0.74, 0.99), [s * 0.058, 1.63, 0.068], 0.004, 0.0035, sko.frontal, { label: lb('Zygomatic process of frontal bone') });
  sph(SK, 'orbit_' + sd, 0.017, [s * 0.034, 1.64, 0.074], mat.socket, { label: lb('Orbit') });
  sph(SK, 'zygomatic_bone_' + sd, 0.011, [s * 0.057, 1.617, 0.064], sko.zygomatic, { scale: [0.6, 1.1, 0.7], rot: [0, s * 0.7, 0], label: lb('Zygomatic bone') });
  lmk('zygomaticofacial_foramen_' + sd, lb('Zygomaticofacial foramen'), [s * 0.73, -0.25, 0.64], 0.0012, mat.socket, { k: 1.1 });
  tube(SK, 'zygomatic_arch_temporal_' + sd, [[s * 0.079, 1.625, -0.004], [s * 0.078, 1.619, 0.012], [s * 0.075, 1.614, 0.028]], 0.0042, sko.temporal, { label: lb('Zygomatic arch, zygomatic process of temporal bone') });
  tube(SK, 'zygomatic_arch_zygomatic_' + sd, [[s * 0.075, 1.614, 0.028], [s * 0.069, 1.61, 0.044], [s * 0.06, 1.608, 0.058]], 0.0042, sko.zygomatic, { label: lb('Zygomatic arch, temporal process of zygomatic bone') });
  seg(SK, 'frontal_process_maxilla_' + sd, [s * 0.014, 1.61, 0.076], [s * 0.013, 1.64, 0.084], 0.003, 0.0024, sko.maxilla, { label: lb('Maxilla, frontal process') });
  seg(SK, 'nasal_bone_' + sd, [s * 0.0035, 1.649, 0.088], [s * 0.0055, 1.627, 0.095], 0.0028, 0.0034, sko.nasal, { label: lb('Nasal bone') });
  sph(SK, 'inferior_nasal_concha_' + sd, 0.003, [s * 0.0045, 1.607, 0.078], sko.nasal, { scale: [0.6, 0.6, 1.5], label: lb('Inferior nasal concha') });
  sph(SK, 'infraorbital_foramen_' + sd, 0.0018, [s * 0.028, 1.616, 0.067], mat.socket, { label: lb('Infra-orbital foramen') });
  sph(SK, 'choana_' + sd, 0.006, [s * 0.008, 1.586, 0.006], mat.socket, { scale: [0.9, 1.2, 0.4], label: lb('Posterior nasal aperture (choana)') });
  seg(SK, 'pterygoid_medial_plate_' + sd, [s * 0.011, 1.599, 0.003], [s * 0.011, 1.578, 0.007], 0.0016, 0.0013, sko.sphenoid, { scale: [0.6, 1, 2.2], label: lb('Pterygoid process, medial plate') });
  seg(SK, 'pterygoid_lateral_plate_' + sd, [s * 0.02, 1.6, -0.002], [s * 0.023, 1.58, 0.004], 0.0016, 0.0013, sko.sphenoid, { scale: [0.6, 1, 2.6], label: lb('Pterygoid process, lateral plate') });
  sph(SK, 'pterygoid_hamulus_' + sd, 0.0014, [s * 0.011, 1.577, 0.008], sko.sphenoid, { label: lb('Pterygoid hamulus') });
  sph(SK, 'greater_palatine_foramen_' + sd, 0.0013, [s * 0.019, 1.5768, 0.017], mat.socket, { label: lb('Greater palatine foramen') });
  tube(SK, 'mandible_ramus_' + sd, [[s * 0.07, 1.612, -0.005], [s * 0.067, 1.59, -0.003], [s * 0.064, 1.568, 0.0]], 0.0068, mat.bone, { label: lb('Mandible, ramus') });
  sph(SK, 'mandibular_condyle_' + sd, 0.0085, [s * 0.07, 1.618, -0.005], mat.bone, { scale: [1.3, 0.8, 0.8], label: lb('Mandible, condylar process') });
  seg(SK, 'coronoid_process_' + sd, [s * 0.065, 1.584, 0.006], [s * 0.063, 1.609, 0.02], 0.0048, 0.0022, mat.bone, { scale: [0.6, 1, 1.2], label: lb('Mandible, coronoid process') });
  sph(SK, 'mandible_angle_' + sd, 0.0085, [s * 0.064, 1.566, -0.002], mat.bone, { scale: [0.75, 1, 1], label: lb('Mandible, angle') });
  sph(SK, 'mental_foramen_' + sd, 0.0018, [s * 0.027, 1.546, 0.0625], mat.socket, { label: lb('Mental foramen') });
  sph(SK, 'mental_tubercle_' + sd, 0.003, [s * 0.014, 1.534, 0.068], mat.bone, { label: lb('Mandible, mental tubercle') });
}
sph(SK, 'maxilla', 0.05, [0, 1.607, 0.042], sko.maxilla, { scale: [0.92, 0.6, 0.64], label: 'Maxilla' });
sph(SK, 'nasal_aperture', 0.009, [0, 1.615, 0.075], mat.socket, { scale: [1, 1.4, 0.4], label: 'Piriform (nasal) aperture' });
seg(SK, 'anterior_nasal_spine', [0, 1.603, 0.072], [0, 1.603, 0.08], 0.0014, 0.0004, sko.maxilla, { label: 'Maxilla, anterior nasal spine' });
box(SK, 'nasal_septum_vomer', [0.0018, 0.016, 0.024], [0, 1.589, 0.012], sko.vomer, { label: 'Vomer' });
plate('hard_palate_maxilla', poly([[0, -0.03], [0.018, -0.024], [0.024, -0.005], [0.024, 0.006], [-0.024, 0.006], [-0.024, -0.005], [-0.018, -0.024]]), 0.002, sko.maxilla, [0, 1.578, 0.035], { rot: [-Math.PI / 2, 0, 0], label: 'Hard palate (maxilla)' });
plate('hard_palate_palatine', poly([[-0.022, 0.006], [0.022, 0.006], [0.02, 0.018], [0.004, 0.02], [0, 0.024], [-0.004, 0.02], [-0.02, 0.018]]), 0.002, sko.palatine, [0, 1.578, 0.035], { rot: [-Math.PI / 2, 0, 0], label: 'Hard palate (palatine bone)' });
sph(SK, 'incisive_fossa', 0.0018, [0, 1.5768, 0.06], mat.socket, { label: 'Incisive fossa' });
// permanent dentition: 32 teeth on parabolic arches (Universal numbering)
const OCC = 1.562;
const ARCH = (s, up) => { const a = up ? 0.0285 : 0.0272, zf = up ? 0.057 : 0.0505; s = Math.max(0, Math.min(1, s)); return [a * Math.sin((s * Math.PI) / 2), zf - 0.04 * Math.pow(s, 1.6)]; };
{
  const enamel = new THREE.MeshPhysicalMaterial({ name: 'enamel', color: 0xffffff, vertexColors: true, roughness: 0.09, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06, sheen: 0.25, sheenColor: new THREE.Color(0xfff6e0), sheenRoughness: 0.4 });
  const cO = new THREE.Color(0xf5f3e9), cC = new THREE.Color(0xe4d8b8);
  const prep = (g, h) => { g.computeVertexNormals(); g = g.toNonIndexed(); const p = g.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) { c.copy(cO).lerp(cC, Math.min(1, Math.max(0, p.getY(i) / h)) ** 1.5); col.set([c.r, c.g, c.b], i * 3); } g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g; };
  const merge = gs => { let n = 0; gs.forEach(g => { n += g.attributes.position.count; }); const P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3); let o = 0;
    gs.forEach(g => { P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); C.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; });
    const r = new THREE.BufferGeometry(); r.setAttribute('position', new THREE.BufferAttribute(P, 3)); r.setAttribute('normal', new THREE.BufferAttribute(N, 3)); r.setAttribute('color', new THREE.BufferAttribute(C, 3)); return r; };
  const lathe = (prof, h, w, d) => { const g = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y * h)), 20); g.scale(w / 2, 1, d / 2); return g; };
  const cusp = (r, x, z, h) => { const g = new THREE.SphereGeometry(r, 12, 8); g.scale(1, 0.8, 1); g.translate(x, r * 0.35, z); return prep(g, h); };
  function crown(type, w, d, h) {
    if (type < 2) { const g = new THREE.BoxGeometry(1, 1, 1, 3, 6, 3), p = g.attributes.position; g.translate(0, 0.5, 0);
      for (let i = 0; i < p.count; i++) { const t = p.getY(i); p.setXYZ(i, p.getX(i) * w * (1 - 0.24 * t), t * h, p.getZ(i) * d * (0.3 + 0.7 * Math.min(1, t / 0.55)) * (1 - 0.12 * t)); } return prep(g, h); }
    if (type === 2) return prep(lathe([[0, 0], [0.5, 0.18], [0.85, 0.42], [1, 0.68], [0.85, 1], [0, 1]], h, w, d), h);
    const body = prep(lathe(type < 5 ? [[0, 0.06], [0.6, 0.04], [0.95, 0.2], [1, 0.6], [0.85, 1], [0, 1]] : [[0, 0.05], [0.72, 0.03], [0.97, 0.18], [1, 0.6], [0.9, 1], [0, 1]], h, w, d), h);
    if (type < 5) return merge([body, cusp(Math.min(w, d) * 0.27, 0, d * 0.2, h), cusp(Math.min(w, d) * 0.24, 0, -d * 0.2, h)]);
    const r = Math.min(w, d) * 0.23; return merge([body, ...[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => cusp(r, a * w * 0.21, b * d * 0.21, h))]);
  }
  const NM = ['Central incisor', 'Lateral incisor', 'Canine', 'First premolar', 'Second premolar', 'First molar', 'Second molar', 'Third molar'];
  const DIM = { 1: { w: [8.5, 6.5, 7.5, 7, 6.5, 10, 9, 8.5], d: [7, 6, 8, 9, 9, 11, 11, 10], h: [9.5, 8.5, 9.5, 8, 7.5, 7, 6.5, 6] }, 0: { w: [5, 5.5, 7, 7, 7, 11, 10.5, 10], d: [6, 6, 7.5, 7.5, 8, 10.5, 10, 9.5], h: [8.5, 8.5, 9.5, 8, 7.5, 7.5, 7, 6.5] } };
  for (const up of [1, 0]) {
    const NS = 400, cum = [0]; let pr = ARCH(0, up); for (let i = 1; i <= NS; i++) { const q = ARCH(i / NS, up); cum.push(cum[i - 1] + Math.hypot(q[0] - pr[0], q[1] - pr[1])); pr = q; }
    const D = DIM[up], k = cum[NS] / D.w.reduce((a, b) => a + b, 0), sAt = L => { let i = 0; while (i < NS && cum[i + 1] < L) i++; return (i + (L - cum[i]) / Math.max(1e-9, cum[i + 1] - cum[i])) / NS; };
    for (const sg of [-1, 1]) { let acc = 0; const sd = sg < 0 ? 'right' : 'left';
      for (let i = 0; i < 8; i++) {
        const w = D.w[i] * k, s = sAt((acc + D.w[i] / 2) * k), q0 = ARCH(Math.max(0, s - 0.002), up), q1 = ARCH(Math.min(1, s + 0.002), up), [x, z] = ARCH(s, up); acc += D.w[i];
        const tx = sg * (q1[0] - q0[0]), tz = q1[1] - q0[1], nx = sg > 0 ? -tz : tz, nz = sg > 0 ? tx : -tx, yaw = Math.atan2(nx, nz);
        const g = crown(i < 2 ? i : i === 2 ? 2 : i < 5 ? 3 : 5, w * 0.92, D.d[i] * 0.00072, D.h[i] * 0.00085);
        if (!up) g.rotateZ(Math.PI); g.rotateY(yaw);
        const over = i < 3 ? 0.0016 : 0.0002, num = up ? (sg < 0 ? 8 - i : 9 + i) : (sg > 0 ? 24 - i : 25 + i);
        g.translate(sg * x, up ? OCC - over : OCC + over, z);
        reg(SK, `tooth_${num}`, new THREE.Mesh(g, enamel), { label: `${NM[i]}, ${up ? 'maxillary' : 'mandibular'} (${sd}, #${num})` });
      } }
  }
}
tube(SK, 'mandible_body', [[-0.064, 1.568, 0.0], [-0.046, 1.545, 0.045], [0, 1.536, 0.068], [0.046, 1.545, 0.045], [0.064, 1.568, 0.0]], 0.0075, mat.bone, { label: 'Mandible, body' });
sph(SK, 'mental_protuberance', 0.008, [0, 1.535, 0.07], mat.bone, { scale: [1.5, 0.8, 0.6], label: 'Mandible, mental protuberance' });
tube(SK, 'hyoid', [[-0.034, 1.53, -0.02], [-0.027, 1.533, -0.004], [-0.012, 1.535, 0.012], [0, 1.535, 0.018], [0.012, 1.535, 0.012], [0.027, 1.533, -0.004], [0.034, 1.53, -0.02]], 0.0036, mat.bone, { label: 'Hyoid bone' });

for (const s of [-1, 1]) {
  const sd = s < 0 ? 'right' : 'left', n = x => `${x}_${sd}`, P = (x, y, z) => [s * x, y, z], lb = t => `${t} (${sd})`;
  // shoulder girdle
  tube(SK, n('clavicle'), [P(0.027, 1.37, 0.088), P(0.06, 1.384, 0.076), P(0.11, 1.4, 0.042), P(0.15, 1.41, 0.018), P(0.176, 1.41, 0.005)], 0.0062, mat.bone, { label: lb('Clavicle') });
  sph(SK, n('clavicle_sternal_end'), 0.0085, P(0.027, 1.37, 0.088), mat.bone, { label: lb('Clavicle') });
  const sg = new THREE.Group(); sg.name = n('scapula_group'); sg.position.set(s * 0.055, 1.292, -0.106); sg.rotation.y = -s * 0.35; sg.updateMatrixWorld(true);
  const L = p => sg.worldToLocal(V(...p)).toArray(), so = { label: lb('Scapula') };
  sg.add(plate(n('scapula_supraspinous'), poly([[-0.002, 0.03], [-0.003, 0.045], [0.002, 0.058], [0.04, 0.055], [0.068, 0.05], [0.074, 0.043], [0.08, 0.05], [0.097, 0.046], [0.092, 0.039], [0.045, 0.033]], s), 0.004, mat.bone, [0, 0, 0], { label: lb('Scapula, supraspinous fossa') }));
  sg.add(plate(n('scapula_infraspinous'), poly([[-0.002, 0.03], [0.045, 0.033], [0.092, 0.039], [0.103, 0.035], [0.098, 0.015], [0.08, -0.012], [0.058, -0.042], [0.036, -0.072], [0.024, -0.072], [0.008, -0.045], [-0.002, 0.0]], s), 0.004, mat.bone, [0, 0, 0], { label: lb('Scapula, infraspinous fossa (subscapular fossa in front)') }));
  sg.add(tube(SK, n('scapula_lateral_border'), [[s * 0.1, 0.03, 0.001], [s * 0.08, -0.012, 0.001], [s * 0.058, -0.042, 0], [s * 0.034, -0.071, 0]], 0.0032, mat.bone, { label: lb('Scapula, lateral border') }));
  sg.add(tube(SK, n('scapula_medial_border'), [[s * 0.002, 0.058, 0], [s * -0.003, 0.03, 0], [s * 0.0, -0.01, 0], [s * 0.012, -0.05, 0], [s * 0.029, -0.073, 0]], 0.0021, mat.bone, { label: lb('Scapula, medial border') }));
  sg.add(tube(SK, n('scapula_superior_border'), [[s * 0.002, 0.058, 0], [s * 0.04, 0.055, 0], [s * 0.067, 0.05, 0]], 0.0016, mat.bone, { label: lb('Scapula, superior border') }));
  sg.add(sph(SK, n('scapula_superior_angle'), 0.0034, [s * 0.002, 0.058, 0], mat.bone, { label: lb('Scapula, superior angle') }));
  sg.add(sph(SK, n('scapula_inferior_angle'), 0.0042, [s * 0.03, -0.073, 0], mat.bone, { label: lb('Scapula, inferior angle') }));
  sg.add(sph(SK, n('suprascapular_notch'), 0.0028, [s * 0.074, 0.047, 0], mat.socket, { scale: [1, 1, 1.6], label: lb('Scapula, suprascapular notch') }));
  sg.add(seg(SK, n('scapular_spine'), [s * 0.006, 0.028, -0.006], [s * 0.09, 0.042, -0.007], 0.0045, 0.0065, mat.bone, so));
  sg.add(tube(SK, n('acromion'), [L(P(0.139, 1.334, -0.083)), L(P(0.158, 1.375, -0.06)), L(P(0.172, 1.404, -0.03)), L(P(0.176, 1.41, 0.002))], 0.0055, mat.bone, so));
  sg.add(tube(SK, n('scapular_neck'), [L(P(0.1415, 1.3, -0.075)), L(P(0.158, 1.34, -0.05)), L(P(0.172, 1.372, -0.018))], 0.008, mat.bone, so));
  sg.add(seg(SK, n('coracoid_process'), L(P(0.152, 1.385, -0.035)), L(P(0.162, 1.39, 0.02)), 0.0048, 0.004, mat.bone, so));
  sg.add(sph(SK, n('glenoid_cavity'), 0.013, L(P(0.173, 1.376, -0.012)), mat.cartilage, { scale: [0.5, 1, 0.8], label: lb('Glenoid cavity') }));
  sg.add(sph(SK, n('supraglenoid_tubercle'), 0.0034, L(P(0.171, 1.392, -0.014)), mat.bone, { label: lb('Scapula, supraglenoid tubercle') }));
  sg.add(sph(SK, n('infraglenoid_tubercle'), 0.0042, L(P(0.166, 1.358, -0.018)), mat.bone, { label: lb('Scapula, infraglenoid tubercle') }));
  sg.add(sph(SK, n('spinoglenoid_notch'), 0.003, L(P(0.155, 1.36, -0.064)), mat.socket, { label: lb('Scapula, greater scapular (spinoglenoid) notch') }));
  sph(SK, n('acromioclavicular_joint'), 0.0042, P(0.176, 1.411, 0.004), mat.cartilage, { scale: [0.6, 1, 1], label: lb('Acromioclavicular joint (articular surface for clavicle)') });
  G[SK].add(sg);
  // humerus
  sph(SK, n('humeral_head'), 0.021, P(0.188, 1.388, 0), mat.bone, { label: lb('Humerus') });
  sph(SK, n('greater_tubercle'), 0.011, P(0.205, 1.377, 0.004), mat.bone, { label: lb('Humerus') });
  sph(SK, n('lesser_tubercle'), 0.007, P(0.196, 1.372, 0.017), mat.bone, { label: lb('Humerus') });
  tube(SK, n('humerus'), [P(0.2, 1.368, 0), P(0.214, 1.25, 0.002), P(0.226, 1.15, 0.001), P(0.232, 1.09, 0)], 0.0132, mat.bone, { label: lb('Humerus') });
  sph(SK, n('deltoid_tuberosity'), 0.006, P(0.222, 1.27, 0.004), mat.bone, { label: lb('Humerus') });
  sph(SK, n('humeral_condyle'), 0.016, P(0.232, 1.075, 0), mat.bone, { scale: [1.9, 0.8, 1], label: lb('Humerus') });
  sph(SK, n('medial_epicondyle'), 0.008, P(0.212, 1.082, -0.004), mat.bone, { label: lb('Humerus') });
  sph(SK, n('lateral_epicondyle'), 0.007, P(0.252, 1.082, 0), mat.bone, { label: lb('Humerus') });
  sph(SK, n('trochlea'), 0.0115, P(0.231, 1.064, 0.006), mat.cartilage, { scale: [1.5, 0.75, 1], label: lb('Elbow joint') });
  // forearm
  sph(SK, n('olecranon'), 0.012, P(0.232, 1.078, -0.013), mat.bone, { label: lb('Ulna') });
  tube(SK, n('ulna'), [P(0.234, 1.062, -0.005), P(0.242, 0.96, -0.005), P(0.255, 0.858, -0.004)], 0.0092, mat.bone, { label: lb('Ulna') });
  sph(SK, n('ulnar_head'), 0.0085, P(0.256, 0.848, -0.004), mat.bone, { label: lb('Ulna') });
  reg(SK, n('radial_head'), xf(new THREE.Mesh(new THREE.CylinderGeometry(0.0105, 0.0105, 0.006, 24), mat.bone), P(0.247, 1.066, 0.003)), { label: lb('Radius') });
  reg(SK, n('radial_head_cartilage'), xf(new THREE.Mesh(new THREE.CylinderGeometry(0.0095, 0.0095, 0.002, 24), mat.cartilage), P(0.247, 1.0705, 0.003)), { label: lb('Elbow joint') });
  tube(SK, n('radius'), [P(0.246, 1.055, 0.003), P(0.255, 0.95, 0.01), P(0.268, 0.852, 0.02)], 0.0085, mat.bone, { label: lb('Radius') });
  sph(SK, n('distal_radius'), 0.013, P(0.268, 0.845, 0.02), mat.bone, { scale: [1.2, 0.7, 0.9], label: lb('Radius') });
  // hand
  // carpals form an arch, concave to the palm (the floor of the carpal tunnel)
  [['scaphoid', 0.013, 0.006, 0.003, 0.0085], ['lunate', 0.003, 0.008, -0.001, 0.0075], ['triquetrum', -0.007, 0.005, 0.0, 0.007], ['pisiform', -0.011, 0.002, 0.01, 0.0055],
   ['trapezium', 0.017, -0.008, 0.006, 0.0075], ['trapezoid', 0.008, -0.01, 0.001, 0.0065], ['capitate', -0.002, -0.011, -0.002, 0.0085], ['hamate', -0.012, -0.009, 0.001, 0.0078]]
    .forEach(([nm, dx, dy, dz, r]) => sph(SK, n(nm), r, P(0.27 + dx, 0.828 + dy, 0.016 + dz), mat.bone, { label: lb(nm[0].toUpperCase() + nm.slice(1)) }));
  sph(SK, n('hook_of_hamate'), 0.0028, P(0.259, 0.819, 0.025), mat.bone, { scale: [1, 1, 1.4], label: lb('Hamate, hook') });
  sph(SK, n('tubercle_of_scaphoid'), 0.003, P(0.284, 0.832, 0.025), mat.bone, { label: lb('Scaphoid, tubercle') });
  sph(SK, n('tubercle_of_trapezium'), 0.003, P(0.288, 0.82, 0.026), mat.bone, { label: lb('Trapezium, tubercle') });
  reg(SK, n('wrist_joint_cartilage'), xf(new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.002, 24), mat.cartilage), P(0.268, 0.838, 0.018), { scale: [1.2, 1, 0.7] }), { label: lb('Wrist (radiocarpal) joint') });
  [['thumb', 0.288, [0.5, -0.8, 0.25], [0.04, 0.032, 0.026], 0.0062], ['index', 0.282, [0.07, -1, 0], [0.062, 0.032, 0.019, 0.016], 0.0058], ['middle', 0.272, [0, -1, 0], [0.06, 0.036, 0.022, 0.017], 0.0058],
   ['ring', 0.262, [-0.06, -1, 0], [0.054, 0.033, 0.021, 0.016], 0.0056], ['little', 0.252, [-0.14, -1, 0], [0.048, 0.025, 0.014, 0.014], 0.0052]]
    .forEach(([nm, x, d, lens, r0], k) => digit(n('hand_' + nm), P(x, 0.812, 0.018), [s * d[0], d[1], d[2]], lens, r0,
      (i, N) => i === 0 ? lb('Metacarpal ' + ['I', 'II', 'III', 'IV', 'V'][k]) : lb('Finger phalanx, ' + (N === 3 ? ['', 'proximal', 'distal'] : ['', 'proximal', 'middle', 'distal'])[i] + ', ' + nm), mat.cartilage));

  // pelvis
  const il = plate(n('ilium'), poly([[-0.035, 0], [-0.12, 0.025], [-0.135, 0.075], [-0.1, 0.125], [-0.04, 0.145], [0.03, 0.14], [0.075, 0.115], [0.085, 0.08], [0.065, 0.045], [0.04, 0.025]], s, 0.8), 0.012, mat.bone, P(0.088, 0.862, 0), { rot: [0, -s * 0.89, 0], label: lb('Pelvis (ilium)') });
  tube(SK, n('ischium'), [P(0.088, 0.862, 0), P(0.098, 0.82, -0.028), P(0.092, 0.785, -0.026)], 0.0095, mat.bone, { label: lb('Pelvis (ischium)') });
  sph(SK, n('ischial_tuberosity'), 0.0145, P(0.09, 0.783, -0.024), mat.bone, { label: lb('Pelvis (ischium)') });
  tube(SK, n('ischiopubic_ramus'), [P(0.09, 0.785, -0.024), P(0.06, 0.785, 0.02), P(0.03, 0.8, 0.062), P(0.009, 0.82, 0.076)], 0.0078, mat.bone, { label: lb('Pelvis (pubis)') });
  tube(SK, n('superior_pubic_ramus'), [P(0.088, 0.862, 0), P(0.065, 0.848, 0.04), P(0.035, 0.838, 0.068), P(0.009, 0.835, 0.076)], 0.0085, mat.bone, { label: lb('Pelvis (pubis)') });
  sph(SK, n('pubic_symphysis'), 0.0085, P(0.007, 0.828, 0.076), mat.cartilage, { scale: [1, 1.7, 1], label: 'Pubic symphysis' });
  // femur
  sph(SK, n('femoral_head'), 0.022, P(0.083, 0.862, 0), mat.bone, { label: lb('Femur') });
  seg(SK, n('femoral_neck'), P(0.083, 0.862, 0), P(0.108, 0.832, 0), 0.011, 0.013, mat.bone, { label: lb('Femur') });
  sph(SK, n('greater_trochanter'), 0.017, P(0.118, 0.826, -0.004), mat.bone, { scale: [0.8, 1.2, 1], label: lb('Femur') });
  tube(SK, n('femur'), [P(0.108, 0.82, 0), P(0.104, 0.7, 0.01), P(0.1, 0.6, 0.012), P(0.097, 0.5, 0.008)], 0.015, mat.bone, { label: lb('Femur') });
  sph(SK, n('medial_condyle'), 0.02, P(0.083, 0.468, -0.008), mat.bone, { label: lb('Femur') });
  sph(SK, n('lateral_condyle'), 0.02, P(0.113, 0.468, -0.008), mat.bone, { label: lb('Femur') });
  sph(SK, n('patella'), 0.02, P(0.098, 0.468, 0.04), mat.bone, { scale: [1, 1.1, 0.5], label: lb('Patella') });
  reg(SK, n('knee_cartilage'), xf(new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.031, 0.004, 28), mat.cartilage), P(0.098, 0.452, 0), { scale: [1.05, 1, 0.8] }), { label: lb('Knee cartilage') });
  // tibia & fibula
  reg(SK, n('tibial_plateau'), xf(new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.03, 0.01, 28), mat.bone), P(0.098, 0.444, 0), { scale: [1.05, 1, 0.8] }), { label: lb('Tibia') });
  sph(SK, n('tibial_tuberosity'), 0.008, P(0.098, 0.425, 0.024), mat.bone, { label: lb('Tibia') });
  tube(SK, n('tibia'), [P(0.099, 0.44, 0.002), P(0.099, 0.3, 0.003), P(0.1, 0.18, 0.0), P(0.1, 0.09, 0)], 0.0155, mat.bone, { label: lb('Tibia') });
  sph(SK, n('distal_tibia'), 0.019, P(0.1, 0.087, 0), mat.bone, { scale: [1.2, 0.8, 1], label: lb('Tibia') });
  sph(SK, n('medial_malleolus'), 0.011, P(0.09, 0.07, -0.002), mat.bone, { label: lb('Tibia') });
  sph(SK, n('fibular_head'), 0.01, P(0.123, 0.44, -0.01), mat.bone, { label: lb('Fibula') });
  tube(SK, n('fibula'), [P(0.122, 0.43, -0.009), P(0.121, 0.26, -0.01), P(0.119, 0.088, -0.01)], 0.0058, mat.bone, { label: lb('Fibula') });
  sph(SK, n('lateral_malleolus'), 0.011, P(0.118, 0.066, -0.01), mat.bone, { scale: [0.7, 1.4, 0.9], label: lb('Fibula') });
  // foot
  sph(SK, n('talus'), 0.021, P(0.1, 0.052, -0.004), mat.bone, { scale: [1, 0.7, 1.15], label: lb('Talus') });
  sph(SK, n('talus_head'), 0.011, P(0.095, 0.046, 0.018), mat.bone, { label: lb('Talus, head') });
  sph(SK, n('talus_posterior_process'), 0.0055, P(0.104, 0.044, -0.027), mat.bone, { scale: [1.3, 0.8, 1], label: lb('Talus, posterior process') });
  reg(SK, n('talus_cartilage'), xf(new THREE.Mesh(new THREE.CylinderGeometry(0.0155, 0.0155, 0.003, 24), mat.cartilage), P(0.1, 0.0665, -0.004)), { label: lb('Ankle cartilage') });
  sph(SK, n('calcaneus'), 0.024, P(0.104, 0.03, -0.04), mat.bone, { scale: [0.75, 0.95, 1.5], label: lb('Calcaneus') });
  sph(SK, n('sustentaculum_tali'), 0.0065, P(0.088, 0.038, -0.012), mat.bone, { scale: [1.2, 0.6, 1.4], label: lb('Calcaneus, sustentaculum tali') });
  sph(SK, n('fibular_trochlea'), 0.004, P(0.12, 0.026, -0.03), mat.bone, { label: lb('Calcaneus, fibular trochlea') });
  sph(SK, n('calcaneus_medial_tubercle'), 0.0065, P(0.097, 0.012, -0.068), mat.bone, { label: lb('Calcaneus, medial tubercle') });
  sph(SK, n('calcaneus_lateral_tubercle'), 0.005, P(0.111, 0.012, -0.066), mat.bone, { label: lb('Calcaneus, lateral tubercle') });
  sph(SK, n('navicular'), 0.013, P(0.094, 0.04, 0.03), mat.bone, { scale: [1.3, 1, 0.6], label: lb('Navicular') });
  sph(SK, n('navicular_tuberosity'), 0.005, P(0.083, 0.034, 0.03), mat.bone, { label: lb('Navicular, tuberosity') });
  sph(SK, n('cuboid'), 0.013, P(0.118, 0.028, 0.028), mat.bone, { label: lb('Cuboid') });
  ['Medial', 'Intermediate', 'Lateral'].forEach((c, i) => sph(SK, n('cuneiform_' + (i + 1)), 0.0088, P([0.092, 0.103, 0.112][i], 0.032, 0.052), mat.bone, { label: lb(c + ' cuneiform') }));
  [0.088, 0.096].forEach((x, i) => sph(SK, n('sesamoid_' + (i + 1)), 0.0034, P(x, 0.006, 0.114), mat.bone, { label: lb('Sesamoid bones (great toe)') }));
  [['hallux', [-0.04, -0.1, 1], [0.065, 0.03, 0.022], 0.0095], ['toe2', [0, -0.1, 1], [0.07, 0.026, 0.015, 0.01], 0.0072], ['toe3', [0.03, -0.1, 1], [0.066, 0.023, 0.013, 0.009], 0.007],
   ['toe4', [0.06, -0.1, 1], [0.062, 0.021, 0.012, 0.008], 0.0066], ['toe5', [0.1, -0.1, 1], [0.06, 0.018, 0.01, 0.008], 0.0062]]
    .forEach(([nm, d, lens, r0], k) => digit(n('foot_' + nm), P(0.094 + k * 0.0075, 0.02, 0.058), [s * d[0], d[1], d[2]], lens.map(l => l * 0.94), r0,
      (i, N) => i === 0 ? lb('Metatarsal ' + ['I', 'II', 'III', 'IV', 'V'][k]) : lb('Toe phalanx, ' + (N === 3 ? ['', 'proximal', 'distal'] : ['', 'proximal', 'middle', 'distal'])[i] + ', ' + ['great toe', 'second toe', 'third toe', 'fourth toe', 'little toe'][k])));
}

// ───────── MUSCULAR ─────────
const MS = 'muscular';
const mm = { sup: M('muscle_superficial', 0xc4705c, 0.6, { side: THREE.DoubleSide }), mid: M('muscle', 0xb25a48, 0.64, { side: THREE.DoubleSide }), deep: M('muscle_deep', 0x9a4a3c, 0.68, { side: THREE.DoubleSide }), ten: M('tendon', 0xece7dc, 0.5, { side: THREE.DoubleSide }) };
let mcount = 0;
function belly(label, pts, rmax, o = {}) {
  const c = new THREE.CatmullRomCurve3(pts.map(p => V(...p)), false, 'centripetal'), S = Math.max(16, pts.length * 8), R = 22, pos = [], idx = [], upH = V(...(o.up || [0, 0, 1]));
  for (let i = 0; i <= S; i++) {
    const u = i / S, p = c.getPointAt(u), T = c.getTangentAt(u); let up = upH.clone(); if (Math.abs(up.dot(T)) > 0.9) up = V(1, 0, 0);
    const N = up.addScaledVector(T, -up.dot(T)).normalize(), B = new THREE.Vector3().crossVectors(T, N);
    const pk = o.peak ?? 0.45, t = u < pk ? u / pk : (1 - u) / (1 - pk), r = rmax * Math.pow(Math.sin(t * Math.PI / 2), o.k ?? 0.65);
    for (let j = 0; j <= R; j++) { const an = (j / R) * 2 * Math.PI, rr = r * (1 + 0.045 * Math.cos(an * 9 + 1)), cx = Math.cos(an) * rr * (o.w ?? 1), cy = Math.sin(an) * rr * (o.d ?? 1);
      pos.push(p.x + B.x * cx + N.x * cy, p.y + B.y * cx + N.y * cy, p.z + B.z * cx + N.z * cy); }
  }
  for (let i = 0; i < S; i++) for (let j = 0; j < R; j++) { const q = i * (R + 1) + j, w = q + R + 1; idx.push(q, w, q + 1, w, w + 1, q + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return reg(MS, 'muscle_' + (++mcount), new THREE.Mesh(g, o.mt || mm.mid), { label });
}
function sheet(label, A, B2) {
  const ca = new THREE.CatmullRomCurve3(A.map(p => V(...p))), cb = new THREE.CatmullRomCurve3(B2.map(p => V(...p))), n = 14, pos = [], idx = [];
  for (let i = 0; i <= n; i++) pos.push(...ca.getPoint(i / n).toArray(), ...cb.getPoint(i / n).toArray());
  for (let i = 0; i < n; i++) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return reg(MS, 'sheet_' + (++mcount), new THREE.Mesh(g, mm.ten), { label });
}
const SU = mm.sup, DP = mm.deep, F = { w: 2, d: 0.4 };
const BL = [ // [label, pts, rmax, opts]  right-side coordinates, x mirrored for the left
  ['Sternocleidomastoid', [[0.018, 1.4, 0.085], [0.03, 1.46, 0.05], [0.055, 1.53, 0.0], [0.075, 1.575, -0.03]], 0.008, { mt: SU }],
  ['Teres major', [[0.09, 1.255, -0.118], [0.15, 1.29, -0.09], [0.19, 1.33, -0.03], [0.2, 1.34, 0.012]], 0.011, { peak: 0.4, mt: mm.mid }],
  ['Infraspinatus', [[0.07, 1.3, -0.122], [0.13, 1.34, -0.104], [0.19, 1.37, -0.04]], 0.013, { w: 1.6, d: 0.4, mt: mm.mid }],
  ['Supraspinatus', [[0.08, 1.37, -0.112], [0.14, 1.395, -0.075], [0.19, 1.4, -0.01]], 0.01, { mt: DP }],
  ['Subscapularis', [[0.08, 1.31, -0.095], [0.14, 1.34, -0.052], [0.19, 1.36, 0.01]], 0.012, { w: 1.8, d: 0.4, mt: DP }],
  ['Deltoid, clavicular part', [[0.1, 1.4, 0.05], [0.19, 1.39, 0.035], [0.226, 1.3, 0.02], [0.224, 1.272, 0.008]], 0.02, { w: 1.2, d: 0.6, mt: SU }],
  ['Deltoid, acromial part', [[0.176, 1.418, 0.0], [0.222, 1.375, 0.0], [0.23, 1.31, 0.0], [0.226, 1.272, 0.004]], 0.026, { w: 1, d: 0.7, mt: SU }],
  ['Deltoid, spinal part', [[0.12, 1.37, -0.095], [0.19, 1.39, -0.04], [0.226, 1.32, -0.02], [0.224, 1.272, -0.002]], 0.02, { w: 1.2, d: 0.6, mt: SU }],
  ['Coracobrachialis', [[0.162, 1.388, 0.022], [0.19, 1.32, 0.024], [0.212, 1.25, 0.018]], 0.008, { mt: mm.mid }],
  ['Biceps brachii, long head', [[0.2, 1.37, 0.026], [0.218, 1.28, 0.03], [0.225, 1.18, 0.028], [0.23, 1.12, 0.02]], 0.014, { peak: 0.5, mt: SU }],
  ['Biceps brachii, short head', [[0.162, 1.388, 0.022], [0.19, 1.33, 0.034], [0.215, 1.25, 0.038], [0.226, 1.17, 0.03], [0.23, 1.12, 0.02]], 0.0135, { peak: 0.55, mt: SU }],
  ['Brachialis', [[0.215, 1.22, 0.012], [0.226, 1.15, 0.02], [0.232, 1.1, 0.02], [0.238, 1.07, 0.012]], 0.013, { w: 1.4, d: 0.7, mt: DP }],
  ['Triceps brachii, long head', [[0.172, 1.36, -0.03], [0.205, 1.3, -0.032], [0.225, 1.2, -0.03], [0.232, 1.12, -0.02]], 0.016, { peak: 0.5, mt: SU, up: [0, 0, -1] }],
  ['Triceps brachii, lateral head', [[0.208, 1.35, -0.012], [0.228, 1.25, -0.03], [0.236, 1.15, -0.028], [0.234, 1.11, -0.02]], 0.013, { peak: 0.5, mt: SU, up: [0, 0, -1] }],
  ['Triceps brachii, medial head', [[0.215, 1.26, -0.01], [0.226, 1.18, -0.016], [0.232, 1.12, -0.012]], 0.011, { mt: DP, up: [0, 0, -1] }],
  ['Brachioradialis', [[0.246, 1.14, 0.012], [0.254, 1.07, 0.026], [0.262, 1.0, 0.026], [0.268, 0.93, 0.024]], 0.013, { peak: 0.25, mt: SU }],
  ['Pronator teres', [[0.214, 1.08, 0.006], [0.232, 1.05, 0.022], [0.25, 1.0, 0.022], [0.258, 0.97, 0.016]], 0.011, { mt: mm.mid }],
  ['Flexor carpi radialis', [[0.214, 1.078, 0.008], [0.236, 1.03, 0.024], [0.252, 0.96, 0.025], [0.262, 0.9, 0.025]], 0.009, { peak: 0.3, mt: SU }],
  ['Palmaris longus', [[0.214, 1.078, 0.004], [0.232, 1.03, 0.026], [0.246, 0.97, 0.028], [0.256, 0.92, 0.03]], 0.0065, { peak: 0.25, mt: SU }],
  ['Flexor carpi ulnaris', [[0.212, 1.078, -0.01], [0.226, 1.03, -0.006], [0.242, 0.95, -0.003], [0.252, 0.89, -0.003]], 0.011, { peak: 0.35, mt: SU }],
  ['Flexor digitorum superficialis', [[0.22, 1.07, 0.002], [0.238, 1.02, 0.012], [0.252, 0.95, 0.014], [0.262, 0.89, 0.016]], 0.013, { peak: 0.4, mt: mm.mid }],
  ['Flexor digitorum profundus', [[0.234, 1.05, 0.0], [0.25, 0.97, 0.004], [0.258, 0.9, 0.008]], 0.011, { mt: DP }],
  ['Flexor pollicis longus', [[0.254, 1.0, 0.014], [0.262, 0.93, 0.018], [0.268, 0.88, 0.02]], 0.0075, { mt: DP }],
  ['Abductor pollicis longus', [[0.248, 1.0, 0.0], [0.262, 0.93, 0.012], [0.274, 0.88, 0.02]], 0.007, { mt: mm.mid }],
  ['Extensor carpi radialis longus', [[0.25, 1.12, 0.0], [0.26, 1.05, 0.0], [0.268, 0.95, 0.004], [0.272, 0.88, 0.01]], 0.009, { peak: 0.3, mt: SU }],
  ['Extensor carpi radialis brevis', [[0.25, 1.08, -0.004], [0.26, 1.0, -0.006], [0.268, 0.92, 0.0]], 0.008, { peak: 0.3, mt: mm.mid }],
  ['Extensor digitorum (forearm)', [[0.248, 1.06, -0.018], [0.256, 0.98, -0.02], [0.262, 0.9, -0.018]], 0.01, { peak: 0.35, mt: mm.mid, up: [0, 0, -1] }],
  ['Thenar muscles', [[0.272, 0.838, 0.036], [0.284, 0.808, 0.04], [0.296, 0.776, 0.042]], 0.012, { peak: 0.5, mt: mm.mid }],
  ['Gluteus maximus', [[0.03, 0.96, -0.07], [0.07, 0.9, -0.092], [0.1, 0.84, -0.074], [0.112, 0.78, -0.044]], 0.04, { w: 1.4, d: 0.5, k: 0.4, peak: 0.45, mt: SU, up: [0, 0, -1] }],
  ['Gluteus medius', [[0.13, 1.0, -0.025], [0.145, 0.93, -0.034], [0.128, 0.85, -0.02]], 0.024, { w: 1.6, d: 0.5, k: 0.4, mt: mm.mid }],
  ['Gluteus minimus', [[0.12, 0.97, -0.012], [0.132, 0.9, -0.016], [0.122, 0.84, -0.008]], 0.018, { w: 1.5, d: 0.5, k: 0.4, mt: DP }],
  ['Piriformis', [[0.03, 0.93, -0.058], [0.07, 0.88, -0.052], [0.115, 0.83, -0.016]], 0.008, { mt: DP }],
  ['Obturator internus', [[0.075, 0.82, -0.02], [0.1, 0.815, -0.018], [0.114, 0.822, -0.012]], 0.006, { mt: DP }],
  ['Gemellus superior', [[0.095, 0.84, -0.03], [0.114, 0.826, -0.016]], 0.004, { mt: DP }],
  ['Gemellus inferior', [[0.092, 0.795, -0.03], [0.112, 0.805, -0.014]], 0.004, { mt: DP }],
  ['Quadratus femoris', [[0.092, 0.785, -0.03], [0.11, 0.792, -0.02]], 0.007, { w: 1.6, d: 0.4, mt: DP }],
  ['Tensor fasciae latae', [[0.13, 0.99, 0.052], [0.128, 0.94, 0.05], [0.124, 0.88, 0.036]], 0.011, { peak: 0.35, mt: SU }],
  ['Rectus femoris', [[0.1, 0.95, 0.052], [0.1, 0.85, 0.052], [0.099, 0.7, 0.048], [0.098, 0.55, 0.044]], 0.018, { peak: 0.45, mt: SU }],
  ['Vastus lateralis', [[0.118, 0.8, 0.012], [0.126, 0.7, 0.028], [0.126, 0.58, 0.032], [0.112, 0.5, 0.036]], 0.02, { w: 1.1, d: 0.8, peak: 0.45, mt: SU }],
  ['Vastus medialis', [[0.095, 0.77, 0.022], [0.082, 0.65, 0.038], [0.075, 0.55, 0.038], [0.083, 0.49, 0.036]], 0.019, { peak: 0.65, mt: SU }],
  ['Vastus intermedius', [[0.104, 0.78, 0.022], [0.1, 0.65, 0.032], [0.099, 0.52, 0.038]], 0.013, { mt: DP }],
  ['Sartorius', [[0.128, 0.985, 0.056], [0.115, 0.85, 0.062], [0.095, 0.7, 0.058], [0.082, 0.55, 0.036], [0.08, 0.46, 0.02]], 0.008, { w: 1.1, d: 0.6, k: 0.3, peak: 0.5, mt: SU }],
  ['Gracilis', [[0.035, 0.835, 0.06], [0.065, 0.72, 0.038], [0.07, 0.6, 0.014], [0.078, 0.47, 0.002]], 0.008, { w: 1.4, d: 0.4, k: 0.3, mt: mm.mid }],
  ['Pectineus', [[0.05, 0.85, 0.056], [0.09, 0.8, 0.028]], 0.007, { w: 1.5, mt: DP }],
  ['Adductor longus', [[0.04, 0.832, 0.066], [0.07, 0.76, 0.036], [0.09, 0.66, 0.014]], 0.013, { w: 1.2, d: 0.6, mt: mm.mid }],
  ['Adductor brevis', [[0.05, 0.836, 0.05], [0.08, 0.78, 0.022], [0.1, 0.72, 0.01]], 0.011, { mt: DP }],
  ['Adductor magnus', [[0.06, 0.8, -0.01], [0.08, 0.7, -0.012], [0.088, 0.58, -0.016], [0.088, 0.48, -0.01]], 0.02, { w: 1.5, d: 0.5, mt: mm.mid }],
  ['Biceps femoris, long head', [[0.09, 0.79, -0.034], [0.108, 0.7, -0.036], [0.115, 0.58, -0.036], [0.12, 0.5, -0.024], [0.123, 0.456, -0.012]], 0.016, { peak: 0.4, mt: SU, up: [0, 0, -1] }],
  ['Biceps femoris, short head', [[0.108, 0.62, -0.014], [0.116, 0.54, -0.022], [0.121, 0.47, -0.014]], 0.008, { mt: DP, up: [0, 0, -1] }],
  ['Semitendinosus', [[0.088, 0.79, -0.036], [0.088, 0.7, -0.034], [0.09, 0.56, -0.03], [0.088, 0.47, -0.02], [0.082, 0.43, 0.01]], 0.011, { peak: 0.3, mt: SU, up: [0, 0, -1] }],
  ['Semimembranosus', [[0.088, 0.79, -0.026], [0.086, 0.7, -0.03], [0.088, 0.56, -0.026], [0.09, 0.47, -0.016], [0.088, 0.44, -0.006]], 0.015, { peak: 0.3, mt: DP, up: [0, 0, -1] }],
  ['Gastrocnemius, medial head', [[0.088, 0.47, -0.026], [0.085, 0.4, -0.04], [0.09, 0.3, -0.034], [0.098, 0.22, -0.022]], 0.02, { peak: 0.3, mt: SU, up: [0, 0, -1] }],
  ['Gastrocnemius, lateral head', [[0.116, 0.47, -0.026], [0.118, 0.4, -0.04], [0.114, 0.3, -0.034], [0.106, 0.22, -0.022]], 0.018, { peak: 0.3, mt: SU, up: [0, 0, -1] }],
  ['Soleus', [[0.116, 0.44, -0.012], [0.108, 0.36, -0.026], [0.104, 0.26, -0.026], [0.103, 0.18, -0.024]], 0.018, { w: 1.2, peak: 0.35, mt: DP, up: [0, 0, -1] }],
  ['Plantaris', [[0.115, 0.46, -0.022], [0.112, 0.43, -0.026], [0.11, 0.4, -0.026]], 0.004, { mt: DP }],
  ['Tibialis anterior', [[0.108, 0.42, 0.026], [0.104, 0.34, 0.036], [0.1, 0.24, 0.034], [0.097, 0.16, 0.026]], 0.012, { peak: 0.4, mt: SU }],
  ['Extensor digitorum longus', [[0.12, 0.42, 0.02], [0.116, 0.34, 0.028], [0.112, 0.24, 0.03], [0.108, 0.17, 0.026]], 0.009, { peak: 0.4, mt: mm.mid }],
  ['Extensor hallucis longus', [[0.104, 0.36, 0.016], [0.102, 0.26, 0.022], [0.1, 0.18, 0.02]], 0.007, { mt: DP }],
  ['Fibularis longus', [[0.124, 0.43, -0.004], [0.122, 0.34, 0.0], [0.12, 0.24, -0.004], [0.118, 0.15, -0.012]], 0.011, { peak: 0.35, mt: SU }],
  ['Fibularis brevis', [[0.121, 0.32, -0.008], [0.119, 0.22, -0.01], [0.118, 0.14, -0.014]], 0.008, { mt: DP }],
  ['Extensor digitorum brevis', [[0.112, 0.03, 0.022], [0.108, 0.026, 0.05]], 0.007, { mt: mm.mid }],
  ['Fibularis tertius', [[0.118, 0.22, 0.018], [0.116, 0.16, 0.022], [0.114, 0.12, 0.022]], 0.0055, { mt: mm.mid }],
  ['Popliteus', [[0.121, 0.462, -0.018], [0.108, 0.445, -0.024], [0.088, 0.418, -0.02]], 0.008, { w: 1.6, d: 0.4, mt: DP, up: [0, 0, -1] }],
  ['Tibialis posterior', [[0.108, 0.42, -0.014], [0.106, 0.32, -0.018], [0.102, 0.2, -0.017], [0.098, 0.13, -0.016]], 0.0095, { peak: 0.4, mt: DP, up: [0, 0, -1] }],
  ['Flexor digitorum longus', [[0.093, 0.38, -0.014], [0.091, 0.28, -0.019], [0.092, 0.16, -0.018]], 0.0075, { peak: 0.45, mt: DP, up: [0, 0, -1] }],
  ['Flexor hallucis longus', [[0.119, 0.33, -0.019], [0.114, 0.24, -0.024], [0.106, 0.14, -0.024]], 0.0085, { peak: 0.5, mt: DP, up: [0, 0, -1] }],
  ['Supinator', [[0.253, 1.082, -0.004], [0.253, 1.06, 0.01], [0.249, 1.03, 0.013]], 0.0068, { w: 1.4, d: 0.5, mt: DP }],
  ['Pronator quadratus', [[0.255, 0.876, 0.011], [0.262, 0.873, 0.016], [0.27, 0.876, 0.019]], 0.0048, { w: 1.6, d: 0.4, mt: DP }],
];
const TD = [ // tendons and ligaments [label, pts, radius]
  ['Biceps brachii, tendon of long head', [[0.172, 1.39, 0.0], [0.19, 1.4, 0.02], [0.2, 1.37, 0.026]], 0.0032],
  ['Biceps brachii, tendon of insertion', [[0.23, 1.12, 0.02], [0.238, 1.08, 0.012], [0.246, 1.06, 0.004]], 0.0045],
  ['Triceps brachii, tendon', [[0.232, 1.12, -0.022], [0.233, 1.09, -0.016], [0.232, 1.078, -0.013]], 0.0045],
  ['Brachioradialis, tendon', [[0.268, 0.93, 0.024], [0.272, 0.89, 0.026], [0.274, 0.855, 0.024]], 0.0035],
  ['Flexor carpi radialis, tendon', [[0.262, 0.9, 0.025], [0.266, 0.86, 0.03], [0.272, 0.82, 0.034]], 0.0035],
  ['Palmaris longus, tendon', [[0.256, 0.92, 0.03], [0.262, 0.87, 0.034], [0.268, 0.838, 0.037]], 0.0032],
  ['Flexor carpi ulnaris, tendon', [[0.252, 0.89, -0.003], [0.256, 0.86, 0.0], [0.258, 0.836, 0.004]], 0.0035],
  ['Flexor pollicis longus, tendon', [[0.268, 0.88, 0.02], [0.28, 0.83, 0.036], [0.304, 0.78, 0.048], [0.33, 0.745, 0.044]], 0.0028],
  ['Abductor pollicis longus, tendon', [[0.274, 0.88, 0.02], [0.28, 0.86, 0.028], [0.29, 0.83, 0.03]], 0.0028],
  ['Quadriceps tendon', [[0.098, 0.55, 0.044], [0.098, 0.5, 0.044], [0.098, 0.485, 0.042]], 0.011],
  ['Patellar ligament', [[0.098, 0.447, 0.044], [0.098, 0.436, 0.038], [0.098, 0.425, 0.028]], 0.0075],
  ['Calcaneal (Achilles) tendon', [[0.102, 0.22, -0.022], [0.103, 0.14, -0.026], [0.104, 0.07, -0.034], [0.104, 0.04, -0.04]], 0.0075],
  ['Plantaris, tendon', [[0.11, 0.4, -0.026], [0.104, 0.25, -0.026], [0.103, 0.15, -0.028]], 0.0022],
  ['Tibialis anterior, tendon', [[0.097, 0.16, 0.026], [0.093, 0.1, 0.02], [0.092, 0.05, 0.04], [0.094, 0.03, 0.058]], 0.0045],
  ['Extensor hallucis longus, tendon', [[0.1, 0.18, 0.02], [0.098, 0.09, 0.03], [0.094, 0.04, 0.07], [0.092, 0.03, 0.115]], 0.0032],
  ['Fibularis longus, tendon', [[0.118, 0.15, -0.012], [0.12, 0.08, -0.02], [0.122, 0.04, -0.01], [0.112, 0.026, 0.03]], 0.0035],
  ['Fibularis brevis, tendon', [[0.118, 0.14, -0.014], [0.12, 0.075, -0.018], [0.126, 0.03, 0.0], [0.128, 0.026, 0.06]], 0.003],
  ['Sartorius, gracilis and semitendinosus (pes anserinus)', [[0.08, 0.46, 0.02], [0.082, 0.435, 0.02], [0.083, 0.418, 0.02]], 0.004],
  ['Tibialis posterior, tendon (behind medial malleolus to navicular tuberosity)', [[0.098, 0.13, -0.016], [0.093, 0.09, -0.017], [0.086, 0.066, -0.014], [0.082, 0.046, 0.012], [0.083, 0.034, 0.03]], 0.0034],
  ['Flexor digitorum longus, tendon', [[0.092, 0.16, -0.018], [0.089, 0.09, -0.02], [0.083, 0.06, -0.017], [0.086, 0.024, 0.0], [0.098, 0.008, 0.04]], 0.003],
  ['Flexor hallucis longus, tendon (groove on talus, under sustentaculum tali)', [[0.106, 0.14, -0.024], [0.102, 0.08, -0.03], [0.098, 0.05, -0.033], [0.09, 0.028, -0.012], [0.089, 0.01, 0.04], [0.091, 0.004, 0.1], [0.089, 0.006, 0.158]], 0.003],
  ['Fibularis tertius, tendon', [[0.114, 0.12, 0.022], [0.118, 0.06, 0.03], [0.124, 0.032, 0.05], [0.128, 0.025, 0.08]], 0.0024],
];
[[0.1015, 0.16], [0.112, 0.154], [0.122, 0.144], [0.133, 0.137]].forEach(([x, z]) => TD.push(['Flexor digitorum longus, tendon', [[0.098, 0.008, 0.04], [x - 0.004, 0.004, 0.09], [x, 0.004, z]], 0.0017]));
// finger tendons [x, tip y]
[[0.282, 0.74, 0.69], [0.272, 0.735, 0.685], [0.262, 0.74, 0.695], [0.252, 0.75, 0.715]].forEach(([x, ys, yd], i) => {
  TD.push(['Flexor digitorum superficialis, tendon', [[0.262, 0.89, 0.016], [0.266, 0.85, 0.026], [x - 0.004 + (i - 1.5) * -0.002, 0.8, 0.034], [x, ys, 0.032]], 0.0024]);
  TD.push(['Flexor digitorum profundus, tendon', [[0.258, 0.9, 0.008], [0.264, 0.85, 0.02], [x - 0.003, 0.78, 0.028], [x, yd, 0.026]], 0.0021]);
});
[[0.12, 0.02, 0.108], [0.116, 0.02, 0.1], [0.112, 0.02, 0.092], [0.108, 0.02, 0.084]].forEach(([x0, _, xe], i) => TD.push(['Extensor digitorum longus, tendon', [[0.108, 0.17, 0.026], [0.106, 0.1, 0.034], [0.096 + i * 0.01, 0.045, 0.07], [0.09 + i * 0.012, 0.022, 0.125]], 0.0022]));
const SH = [ // aponeuroses and retinacula [label, edgeA, edgeB]
  ['Bicipital aponeurosis', [[0.232, 1.105, 0.018], [0.236, 1.08, 0.015], [0.24, 1.055, 0.011]], [[0.222, 1.07, 0.02], [0.222, 1.03, 0.017], [0.23, 1.0, 0.013]]],
  ['Flexor retinaculum (transverse carpal ligament)', [[0.254, 0.858, 0.03], [0.268, 0.86, 0.037], [0.284, 0.858, 0.03]], [[0.254, 0.842, 0.03], [0.268, 0.844, 0.037], [0.284, 0.842, 0.03]]],
  ['Palmar aponeurosis', [[0.266, 0.836, 0.037], [0.268, 0.836, 0.038], [0.27, 0.836, 0.037]], [[0.25, 0.742, 0.033], [0.27, 0.738, 0.037], [0.29, 0.742, 0.033]]],
  ['Iliotibial tract', [[0.124, 0.88, 0.036], [0.125, 0.7, 0.034], [0.122, 0.55, 0.02], [0.12, 0.44, 0.012]], [[0.122, 0.86, -0.015], [0.121, 0.7, -0.02], [0.12, 0.55, -0.012], [0.118, 0.44, -0.002]]],
  ['Thoracolumbar fascia', [[0.01, 1.05, -0.088], [0.05, 1.05, -0.098], [0.09, 1.04, -0.08]], [[0.01, 0.95, -0.08], [0.05, 0.95, -0.09], [0.09, 0.95, -0.07]]],
];
for (const s of [-1, 1]) {
  const sd = s < 0 ? 'right' : 'left', P = p => [s * p[0], p[1], p[2]], lb = t => t + ' (' + sd + ')';
  BL.forEach(([l, pts, r, o]) => belly(lb(l), pts.map(P), r, { ...o, up: o.up && [s * o.up[0], o.up[1], o.up[2]] }));
  TD.forEach(([l, pts, r]) => tube(MS, 'tendon_' + (++mcount), pts.map(P), r, mm.ten, { label: lb(l) }));
  SH.forEach(([l, A, B2]) => sheet(lb(l), A.map(P), B2.map(P)));
}
{ const ar = [[0.03, 1.28, 0.115]]; for (let i = 0; i < 3; i++) box(MS, 'tendinous_intersection_' + i, [0.056, 0.004, 0.006], [0, 0, 0], mm.ten, { label: 'Rectus abdominis, tendinous intersection' }).position.set(0, 0.99 + i * 0.075, 0.098 + i * 0.002); }
box(MS, 'linea_alba', [0.006, 0.42, 0.004], [0, 1.05, 0.094], mm.ten, { label: 'Linea alba' });
// broad trunk muscles: fibred sheets wrapped on a torso surface. φ in degrees: 0 front midline, 90 side, 180 back midline; {p:[x,y,z]} pins a point to bone
{
  const TT = [[1.62, .042, .035, .05, -.005], [1.55, .048, .045, .055, 0], [1.48, .085, .055, .07, 0], [1.45, .115, .065, .085, 0], [1.40, .145, .085, .105, 0], [1.35, .16, .10, .115, -.002], [1.30, .168, .108, .12, -.002], [1.22, .172, .108, .115, -.002], [1.12, .165, .103, .105, -.002], [1.02, .152, .095, .095, -.002], [0.94, .152, .09, .09, 0], [0.86, .145, .078, .085, 0], [0.82, .13, .07, .08, 0]];
  const tt = y => { if (y >= TT[0][0]) return TT[0].slice(1); for (let i = 1; i < TT.length; i++) if (y >= TT[i][0]) { const k = (y - TT[i][0]) / (TT[i - 1][0] - TT[i][0]); return TT[i].slice(1).map((v, j) => v + (TT[i - 1][j + 1] - v) * k); } return TT[TT.length - 1].slice(1); };
  const D2R = Math.PI / 180, sp = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);
  const S = (ph, y, h) => { const [W, Df, Db, zc] = tt(y), a = ph * D2R, sn = Math.sin(a), cs = Math.cos(a), e = cs < 0 ? 0.5 : 1; return V(W * sp(sn, e) + sn * h, y, zc + (cs < 0 ? Db : Df) * sp(cs, e) + cs * h); };
  const cp = it => { if (Array.isArray(it)) return [it[0], it[1], 0, 0, 0, 0]; const [x, y, z] = it.p, [W, Df, Db, zc] = tt(y), ph = Math.atan2(x / W, (z - zc) / (z > zc ? Df : Db)) / D2R, r = V(x, y, z).sub(S(ph, y, 0)); return [ph, y, r.x, r.y, r.z, 1]; };
  const cr = (P, u) => { const n = P.length; if (n === 1) return P[0].slice(); const t = Math.min(n - 1.0001, u * (n - 1)), i = Math.floor(t), f = t - i, p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n - 1, i + 2)];
    return p1.map((_, j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * f + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * f * f + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * f * f * f)); };
  const P3 = (x, y, z) => ({ p: [x, y, z] });
  const apo = M('aponeurosis', 0xece7dc, 0.5, { side: THREE.DoubleSide, transparent: true, opacity: 0.62, depthWrite: false });
  const plat = M('platysma', 0xc4705c, 0.6, { side: THREE.DoubleSide, transparent: true, opacity: 0.55, depthWrite: false });
  const grid = (label, rows, mt) => { for (const s of [-1, 1]) { const pos = [], idx = [], nu = rows.length - 1, nv = rows[0].length - 1;
      rows.forEach(r => r.forEach(p => pos.push(s * p.x, p.y, p.z)));
      for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const a = i * (nv + 1) + j, b = a + nv + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
      const m = reg(MS, 'muscle_' + (++mcount), new THREE.Mesh(g, mt), { label: label + (s < 0 ? ' (right)' : ' (left)') }); if (mt.transparent) m.renderOrder = 3; } };
  function fan(label, O, I, o = {}) {
    const Oc = O.map(cp), Ic = I.map(cp), nu = o.nu ?? 22, nv = o.nv ?? 18, h = o.h ?? 0.006, th = o.t ?? 0.006, rows = [];
    for (let i = 0; i <= nu; i++) { const u = i / nu, A = cr(Oc, u), B = cr(Ic, u), row = [];
      for (let j = 0; j <= nv; j++) { const v = j / nv, q = A.map((a, k) => a + (B[k] - a) * v);
        const prof = Math.pow(Math.sin(Math.PI * (0.03 + 0.94 * u)), 0.55) * Math.pow(Math.sin(Math.PI * (0.03 + 0.94 * v)), 0.45) * (1 - (o.taper ?? 0.35) * v);
        const off = (1 - q[5]) * h + th * prof * (1 + 0.09 * Math.sin(u * (o.fib ?? 64)));
        row.push(S(q[0], q[1], off).add(V(q[2], q[3], q[4]))); }
      rows.push(row); }
    grid(label, rows, o.mt || mm.mid);
  }
  // trapezius
  fan('Trapezius, descending part', [P3(.035, 1.61, -.07), P3(0, 1.6, -.083), [180, 1.53], [180, 1.45]], [P3(.115, 1.41, .03), P3(.15, 1.415, .012), P3(.178, 1.418, -.01)], { h: .006, mt: SU });
  fan('Trapezius, transverse part', [[180, 1.45], [180, 1.34]], [P3(.178, 1.415, -.02), P3(.15, 1.39, -.085), P3(.105, 1.365, -.118)], { h: .01, mt: SU });
  fan('Trapezius, ascending part', [[180, 1.34], [180, 1.2], [180, 1.08]], [P3(.105, 1.365, -.118), P3(.09, 1.355, -.122)], { h: .01, t: .005, mt: SU });
  // deep back and neck
  fan('Rhomboid minor', [[180, 1.47], [180, 1.43]], [P3(.072, 1.4, -.108), P3(.07, 1.375, -.112)], { h: .003, t: .004, mt: DP, nu: 8 });
  fan('Rhomboid major', [[180, 1.42], [180, 1.31]], [P3(.07, 1.37, -.112), P3(.072, 1.23, -.108)], { h: .003, t: .004, mt: DP, nu: 12 });
  fan('Latissimus dorsi', [[180, 1.22], [180, 1.1], [180, 0.98], [160, 0.93], [130, 0.93], [112, 0.97], [105, 1.04]], [P3(.19, 1.325, .006), P3(.197, 1.33, .012), P3(.2, 1.335, .016)], { h: .006, t: .007, mt: SU, nu: 30 });
  // chest
  fan('Pectoralis major, clavicular part', [P3(.12, 1.388, .075), P3(.08, 1.385, .09), P3(.035, 1.378, .1)], [P3(.205, 1.345, .03), P3(.208, 1.338, .03)], { h: .006, t: .008, mt: SU, nu: 14 });
  fan('Pectoralis major, sternocostal part', [P3(.035, 1.378, .1), [7, 1.34], [6, 1.27], [6, 1.2], [12, 1.17]], [P3(.208, 1.338, .03), P3(.21, 1.325, .028)], { h: .006, t: .01, mt: SU, nu: 24 });
  fan('Pectoralis major, abdominal part', [[12, 1.17], [22, 1.14]], [P3(.21, 1.325, .028), P3(.211, 1.315, .026)], { h: .006, t: .007, mt: SU, nu: 10 });
  fan('Pectoralis minor', [[38, 1.3], [42, 1.26], [46, 1.22]], [P3(.158, 1.385, .035), P3(.162, 1.388, .03)], { h: 0, t: .005, mt: DP, nu: 14 });
  for (let i = 0; i < 8; i++) { const y = 1.36 - i * 0.032; fan('Serratus anterior', [[54 + i * 2, y + .008], [54 + i * 2, y - .008]], [P3(.068, 1.39 - i * .022, -.1), P3(.068, 1.39 - (i + 1) * .022, -.1)], { h: 0, t: .005, mt: mm.mid, nu: 6, nv: 16, taper: 0.5 }); }
  fan('Platysma', [[14, 1.33], [30, 1.345], [48, 1.36]], [P3(.018, 1.525, .075), P3(.045, 1.53, .062), P3(.07, 1.545, .04)], { h: .014, t: .001, mt: plat, nu: 16, taper: 0 });
  // abdominal wall
  fan('External oblique', [[56, 1.23], [62, 1.19], [70, 1.14], [80, 1.09], [92, 1.04], [104, 1.0], [112, 0.97]], [[32, 1.17], [34, 1.08], [38, 0.99], [52, 0.93], [80, 0.925], [108, 0.935]], { h: .008, t: .006, mt: SU, nu: 28 });
  fan('External oblique, aponeurosis (anterior rectus sheath)', [[32, 1.2], [32, 1.17], [34, 1.08], [38, 0.99], [52, 0.93], P3(.128, .975, .062)], [[2, 1.24], [2, 1.17], [2, 1.06], [2, 0.95], [2, 0.87], P3(.02, .842, .08)], { h: .016, t: 0, mt: apo, nu: 24, nv: 10 });
  fan('Internal oblique', [[118, 0.95], [95, 0.93], [75, 0.935], [55, 0.91], [35, 0.87]], [[105, 1.05], [90, 1.09], [70, 1.13], [45, 1.1], [30, 1.0]], { h: .002, t: .005, mt: mm.mid, nu: 24 });
  fan('Transversus abdominis', [[125, 1.12], [125, 1.02], [125, 0.93]], [[30, 1.15], [30, 1.03], [30, 0.9]], { h: -.002, t: .004, mt: DP, nu: 20 });
  fan('Rectus abdominis', [P3(.006, .838, .075), P3(.03, .842, .072)], [P3(.012, 1.235, .1), P3(.045, 1.24, .1), P3(.075, 1.22, .092)], { h: 0, t: .009, mt: SU, nu: 10, nv: 24, taper: 0 });
  // intercostals between consecutive ribs
  const ribP = (n, a, k) => { const v = VD['T' + n], A1 = RA1[n - 1]; a = Math.min(a, A1); return V(RW[n - 1] * Math.sin(a) + Math.sin(a) * k, v.y - RDR[n - 1] * Math.pow(a / A1, 1.3), -0.002 - RD[n - 1] * Math.cos(a) - Math.cos(a) * k); };
  for (let n = 1; n <= 11; n++) for (const [lab, a0, k, mt, cut] of [['External intercostal', 0.5, 0.0025, mm.mid, 0.12], ['Internal intercostal', 1.0, -0.0025, DP, 0]]) {
    const a1 = Math.min(RA1[n - 1], RA1[n]) - cut; if (a1 <= a0) continue; const rows = [];
    for (let i = 0; i <= 16; i++) { const a = a0 + (a1 - a0) * i / 16, row = []; for (let j = 0; j <= 3; j++) { const f = 0.15 + 0.7 * j / 3; row.push(ribP(n, a, k).lerp(ribP(n + 1, a, k), f)); } rows.push(row); }
    grid(lab, rows, mt); }
}
const TB = [ // extra trunk and neck bellies
  ['Levator scapulae', [[0.035, 1.58, -0.02], [0.05, 1.5, -0.045], [0.07, 1.43, -0.09], [0.075, 1.405, -0.105]], 0.008, { mt: DP }],
  ['Erector spinae, iliocostalis', [[0.05, 0.9, -0.07], [0.06, 1.05, -0.08], [0.065, 1.2, -0.09], [0.055, 1.35, -0.085]], 0.011, { w: 1.2, d: 0.6, mt: DP, up: [0, 0, -1] }],
  ['Erector spinae, longissimus', [[0.03, 0.9, -0.075], [0.035, 1.05, -0.085], [0.035, 1.2, -0.09], [0.03, 1.4, -0.075], [0.025, 1.52, -0.05]], 0.011, { w: 1.1, d: 0.6, mt: DP, up: [0, 0, -1] }],
  ['Erector spinae, spinalis', [[0.012, 1.05, -0.085], [0.012, 1.2, -0.095], [0.012, 1.35, -0.09]], 0.006, { mt: DP, up: [0, 0, -1] }],
  ['Teres minor', [[0.13, 1.31, -0.112], [0.17, 1.335, -0.08], [0.2, 1.355, -0.03]], 0.008, { mt: mm.mid, up: [0, 0, -1] }],
  ['Subclavius', [[0.03, 1.372, 0.085], [0.08, 1.383, 0.08], [0.125, 1.395, 0.06]], 0.0045, { mt: DP }],
  ['Sternohyoid', [[0.01, 1.385, 0.075], [0.012, 1.44, 0.06], [0.008, 1.5, 0.05]], 0.004, { mt: mm.mid }],
  ['Omohyoid', [[0.11, 1.405, -0.04], [0.07, 1.43, 0.02], [0.035, 1.45, 0.05], [0.015, 1.5, 0.052]], 0.003, { mt: mm.mid }],
];
for (const s of [-1, 1]) {
  const sd = s < 0 ? 'right' : 'left', P = p => [s * p[0], p[1], p[2]];
  TB.forEach(([l, pts, r, o]) => belly(l + ' (' + sd + ')', pts.map(P), r, { ...o, up: o.up && [s * o.up[0], o.up[1], o.up[2]] }));
  tube(MS, 'inguinal_ligament_' + sd, [[0.128, 0.975, 0.058], [0.08, 0.9, 0.075], [0.04, 0.86, 0.08], [0.02, 0.842, 0.078]].map(P), 0.0018, mm.ten, { label: 'Inguinal ligament (' + sd + ')' });
}

// ───────── CIRCULATORY ─────────
{
const CS = 'circulatory', RS = 'respiratory', sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }, gaus = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));
const rnd = i => { const x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); };
const HM = { clip: new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.05), mats: [] }; window.__heart = HM;
const hm = (name, color, o = {}) => { const m = M(name, color, 0.6, { side: THREE.DoubleSide, ...o }); HM.mats.push(m); return m; };
const art = mat.artery, vein = mat.vein, pArt = M('pulmonary_artery', 0x8a63c9, 0.5), pVein = M('pulmonary_vein', 0xd8554f, 0.5);
function vt(sys, name, pts, rf, mt, label, R = 14) {
  const c = new THREE.CatmullRomCurve3(pts.map(p => V(...p))), S = Math.max(10, pts.length * 12), g = new THREE.TubeGeometry(c, S, 1, R, false), pos = g.attributes.position;
  for (let i = 0; i <= S; i++) { const ct = c.getPointAt(i / S), r = typeof rf === 'function' ? rf(i / S) : rf; for (let j = 0; j <= R; j++) { const k = i * (R + 1) + j; pos.setXYZ(k, ct.x + (pos.getX(k) - ct.x) * r, ct.y + (pos.getY(k) - ct.y) * r, ct.z + (pos.getZ(k) - ct.z) * r); } }
  g.computeVertexNormals(); return reg(sys, name, new THREE.Mesh(g, mt), { label });
}
const sub = (pts, u0, u1, n = 6) => { const c = new THREE.CatmullRomCurve3(pts.map(p => V(...p))), a = []; for (let i = 0; i <= n; i++) a.push(c.getPointAt(u0 + (u1 - u0) * i / n).toArray()); return a; };
const E = (name, label, c, r, rot, mt, sys = CS) => reg(sys, name, xf(new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), mt), c, { scale: r, rot }), { label });
const TILT = [-0.25, 0, 0.42], tiltE = new THREE.Euler(...TILT);

// ── heart: walls, blood volumes, septa ──
const h0 = G[CS].children.length;
const wLV = hm('myocardium_left_ventricle', 0xc86f60, { }), wRV = hm('myocardium_right_ventricle', 0xcf7e70), wAt = hm('myocardium_atrium', 0xd88f84), wAur = hm('auricle', 0xb06a8c);
const bR = hm('blood_deoxygenated', 0x4d86d1), bL = hm('blood_oxygenated', 0xd0403c), sep = hm('septum', 0xc27468), valveM = hm('valve_leaflet', 0xe9e6e1), chM = hm('chordae_tendineae', 0xf0eeea), pap = hm('papillary_muscle', 0xb85f52), fat = hm('epicardial_fat', 0xe8c26a, { transparent: true, opacity: 0.9 });
const peri = hm('pericardium', 0xf2e6dc, { transparent: true, opacity: 0.16, depthWrite: false });
E('pericardium', 'Fibrous pericardium', [0.026, 1.235, 0.035], [0.064, 0.1, 0.06], TILT, peri);
E('myocardium_lv', 'Left ventricle (myocardium)', [0.04, 1.214, 0.038], [0.033, 0.065, 0.036], TILT, wLV);
E('lv_blood', 'Left ventricle (cavity)', [0.04, 1.214, 0.038], [0.0225, 0.056, 0.026], TILT, bL);
E('myocardium_rv', 'Right ventricle (myocardium)', [-0.01, 1.224, 0.066], [0.031, 0.052, 0.023], TILT, wRV);
E('rv_blood', 'Right ventricle (cavity)', [-0.01, 1.224, 0.066], [0.025, 0.046, 0.017], TILT, bR);
E('myocardium_ra', 'Right atrium (myocardium)', [-0.027, 1.262, 0.04], [0.024, 0.032, 0.026], [0, 0, 0], wAt);
E('ra_blood', 'Right atrium (cavity)', [-0.027, 1.262, 0.04], [0.021, 0.029, 0.023], [0, 0, 0], bR);
E('myocardium_la', 'Left atrium (myocardium)', [0.012, 1.292, 0.0], [0.036, 0.02, 0.022], [0, 0, 0], wAt);
E('la_blood', 'Left atrium (cavity)', [0.012, 1.292, 0.0], [0.033, 0.017, 0.019], [0, 0, 0], bL);
E('right_auricle', 'Right auricle', [-0.006, 1.3, 0.066], [0.016, 0.011, 0.008], [0, 0.6, -0.3], wAur);
E('left_auricle', 'Left auricle', [0.052, 1.284, 0.04], [0.013, 0.01, 0.008], [0, -0.5, 0.4], wAur);
E('interventricular_septum', 'Interventricular septum', [0.018, 1.22, 0.052], [0.004, 0.05, 0.028], TILT, sep);
E('interatrial_septum', 'Interatrial septum', [-0.007, 1.277, 0.022], [0.0025, 0.02, 0.018], [0, 0.6, 0], sep);
E('fossa_ovalis', 'Fossa ovalis (valve of foramen ovale)', [-0.0075, 1.268, 0.026], [0.0016, 0.007, 0.006], [0, 0.6, 0], hm('fossa_ovalis', 0xe9c9bf));
vt(CS, 'conus_arteriosus', [[-0.004, 1.262, 0.072], [0.004, 1.274, 0.073], [0.012, 1.286, 0.07]], 0.0105, bR, 'Conus arteriosus (right ventricular outflow)');
vt(CS, 'aortic_vestibule', [[0.02, 1.256, 0.032], [0.012, 1.272, 0.036], [0.006, 1.286, 0.04]], 0.009, bL, 'Aortic vestibule (left ventricular outflow)');
// trabeculae carneae
for (const [nme, c, r, mt] of [['rv', [-0.01, 1.224, 0.066], [0.025, 0.046, 0.017], bR], ['lv', [0.04, 1.214, 0.038], [0.0225, 0.056, 0.026], bL]]) for (let i = 0; i < 10; i++) {
  const a = rnd(i * 3 + (nme === 'rv' ? 1 : 50)) * 6.28, b = Math.acos(2 * rnd(i * 5 + 7) - 1), p = new THREE.Vector3(Math.sin(b) * Math.cos(a) * r[0] * 0.97, Math.cos(b) * r[1] * 0.8, Math.sin(b) * Math.sin(a) * r[2] * 0.97).applyEuler(tiltE).add(V(...c));
  E('trabecula_' + nme + '_' + i, 'Trabeculae carneae (' + (nme === 'rv' ? 'right' : 'left') + ' ventricle)', p.toArray(), [0.0032, 0.0032, 0.0075], [rnd(i) * 3, rnd(i + 9) * 3, 0], hm('trabeculae', nme === 'rv' ? 0x5b8fd6 : 0xde5a54));
}
// crista terminalis and pectinate muscles
vt(CS, 'crista_terminalis', [[-0.038, 1.292, 0.022], [-0.046, 1.268, 0.036], [-0.044, 1.24, 0.05]], 0.0017, hm('crista', 0x6a97d6), 'Crista terminalis (right atrium)', 8);
for (let i = 0; i < 6; i++) { const y = 1.285 - i * 0.008; seg(CS, 'musculus_pectinatus_' + i, [-0.045 + 0.002 * i, y - 0.004, 0.034 + i * 0.002], [-0.036, y - 0.004, 0.056], 0.0011, 0.0011, hm('pectinate', 0x6a97d6), { label: 'Musculi pectinati (right atrium)' }); }
// valves
const perp = n => { let t = new THREE.Vector3().crossVectors(n, V(0, 0, 1)); if (t.lengthSq() < 1e-4) t = V(1, 0, 0); t.normalize(); return [t, new THREE.Vector3().crossVectors(n, t).normalize()]; };
function avValve(name, label, c, n, r, k) {
  const N = V(...n).normalize(), q = new THREE.Quaternion().setFromUnitVectors(V(0, -1, 0), N), L = (2 * Math.PI / k) * 0.84;
  for (let i = 0; i < k; i++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.3, 0.017, 20, 1, true, i * 2 * Math.PI / k, L), valveM); m.quaternion.copy(q); m.position.copy(V(...c)).addScaledVector(N, 0.0085); reg(CS, name + '_' + i, m, { label }); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.0016, 8, 28), hm('valve_annulus', 0xd9b8a8)); ring.quaternion.setFromUnitVectors(V(0, 0, 1), N); ring.position.set(...c); reg(CS, name + '_annulus', ring, { label: label + ' (annulus)' });
  return V(...c).addScaledVector(N, 0.016);
}
function slValve(name, label, c, n, r) {
  const N = V(...n).normalize(), [t1, t2] = perp(N), q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), N.clone().negate());
  for (let i = 0; i < 3; i++) { const a = i * 2.094, m = new THREE.Mesh(new THREE.SphereGeometry(r * 0.55, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), valveM); m.quaternion.copy(q); m.position.copy(V(...c)).addScaledVector(t1, Math.cos(a) * r * 0.5).addScaledVector(t2, Math.sin(a) * r * 0.5); reg(CS, name + '_' + i, m, { label: label + ' (semilunar cusp)' }); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.0016, 8, 28), hm('valve_annulus', 0xd9b8a8)); ring.quaternion.setFromUnitVectors(V(0, 0, 1), N); ring.position.set(...c); reg(CS, name + '_annulus', ring, { label: label + ' (annulus)' });
}
function chordae(name, low, n, r, tips, label) {
  const N = V(...n).normalize(), [t1, t2] = perp(N);
  for (let i = 0; i < 10; i++) { const a = i * 0.628, s = V(...low).addScaledVector(t1, Math.cos(a) * r * 0.35).addScaledVector(t2, Math.sin(a) * r * 0.35), tp = tips[Math.cos(a) > 0 ? 0 : 1 % tips.length] || tips[0]; seg(CS, name + '_' + i, s.toArray(), [tp[0] + (rnd(i) - 0.5) * 0.003, tp[1] + (rnd(i + 3) - 0.5) * 0.002, tp[2] + (rnd(i + 5) - 0.5) * 0.003], 0.00035, 0.00035, chM, { label }); }
}
const tLow = avValve('tricuspid_leaflet', 'Tricuspid valve (leaflet)', [-0.018, 1.246, 0.052], [0.4, -0.78, 0.5], 0.0125, 3);
const mLow = avValve('mitral_leaflet', 'Mitral valve (leaflet)', [0.034, 1.262, 0.026], [0.408, -0.885, 0.226], 0.012, 2);
slValve('aortic_valve', 'Aortic valve', [0.006, 1.286, 0.04], [-0.2, 0.93, 0.1], 0.0095);
slValve('pulmonary_valve', 'Pulmonary valve', [0.012, 1.286, 0.07], [0.1, 0.88, -0.3], 0.01);
const papTips = { lvA: [0.052, 1.222, 0.044], lvP: [0.05, 1.218, 0.02], rvA: [0.0, 1.21, 0.07], rvP: [-0.012, 1.205, 0.052] };
seg(CS, 'papillary_lv_anterior', [0.058, 1.196, 0.05], papTips.lvA, 0.0045, 0.0028, pap, { label: 'Anterior papillary muscle (left ventricle)' });
seg(CS, 'papillary_lv_posterior', [0.06, 1.194, 0.016], papTips.lvP, 0.0045, 0.0028, pap, { label: 'Posterior papillary muscle (left ventricle)' });
seg(CS, 'papillary_rv_anterior', [0.012, 1.188, 0.078], papTips.rvA, 0.0045, 0.0028, pap, { label: 'Anterior papillary muscle (right ventricle)' });
seg(CS, 'papillary_rv_posterior', [-0.018, 1.192, 0.056], papTips.rvP, 0.004, 0.0026, pap, { label: 'Posterior papillary muscle (right ventricle)' });
chordae('chordae_mitral', mLow.toArray(), [0.408, -0.885, 0.226], 0.012, [papTips.lvA, papTips.lvP], 'Chordae tendineae (mitral valve)');
chordae('chordae_tricuspid', tLow.toArray(), [0.4, -0.78, 0.5], 0.0125, [papTips.rvA, papTips.rvP], 'Chordae tendineae (tricuspid valve)');
// coronary arteries and veins
const cA = (n, l, pts, r) => vt(CS, n, pts, r, art, l, 8), cV = (n, l, pts, r) => vt(CS, n, pts, r, vein, l, 8);
cA('lad', 'Left anterior descending artery', [[0.02, 1.292, 0.07], [0.022, 1.265, 0.088], [0.03, 1.23, 0.092], [0.042, 1.195, 0.086], [0.056, 1.168, 0.072]], 0.0016);
cA('left_main', 'Left coronary artery (left main)', [[0.012, 1.288, 0.046], [0.016, 1.292, 0.06], [0.02, 1.292, 0.07]], 0.002);
cA('circumflex', 'Circumflex artery', [[0.02, 1.292, 0.06], [0.045, 1.29, 0.045], [0.062, 1.27, 0.03], [0.068, 1.24, 0.012], [0.064, 1.2, -0.002]], 0.0014);
cA('rca', 'Right coronary artery', [[0.002, 1.29, 0.055], [-0.012, 1.285, 0.07], [-0.03, 1.262, 0.068], [-0.042, 1.235, 0.06], [-0.035, 1.2, 0.045], [-0.012, 1.17, 0.03]], 0.0016);
cV('great_cardiac_vein', 'Great cardiac vein', [[0.056, 1.17, 0.076], [0.04, 1.2, 0.09], [0.028, 1.232, 0.095], [0.024, 1.268, 0.09], [0.034, 1.29, 0.06], [0.06, 1.274, 0.026], [0.05, 1.256, -0.004]], 0.0017);
cV('middle_cardiac_vein', 'Middle cardiac vein', [[0.03, 1.165, 0.02], [0.02, 1.2, -0.004], [0.012, 1.25, -0.006]], 0.0013);
vt(CS, 'coronary_sinus', [[0.05, 1.256, -0.004], [0.02, 1.26, -0.008], [-0.01, 1.248, 0.008], [-0.02, 1.236, 0.03]], 0.004, vein, 'Coronary sinus (opening into right atrium)', 10);
for (const [i, p, r] of [[0, [-0.03, 1.255, 0.072], [0.012, 0.02, 0.006]], [1, [-0.004, 1.292, 0.078], [0.016, 0.008, 0.006]], [2, [0.03, 1.232, 0.094], [0.008, 0.026, 0.005]], [3, [0.056, 1.284, 0.05], [0.014, 0.01, 0.008]], [4, [-0.04, 1.218, 0.058], [0.008, 0.022, 0.006]], [5, [0.062, 1.24, 0.02], [0.006, 0.026, 0.008]]]) E('epicardial_fat_' + i, 'Epicardial fat', p, r, TILT, fat);
// cardiac conduction system (pacemaker and conducting cells)
{ const cm = hm('conduction_system', 0xf0c24a, { emissive: 0x6b4a00, emissiveIntensity: 0.25 });
  sph(CS, 'sinoatrial_node', 0.0042, [-0.022, 1.291, 0.05], cm, { scale: [1, 1.7, 0.7], label: 'Sinoatrial (SA) node, primary pacemaker' });
  vt(CS, 'internodal_tracts', [[-0.022, 1.287, 0.05], [-0.018, 1.27, 0.042], [-0.01, 1.256, 0.034], [-0.005, 1.25, 0.03]], 0.0011, cm, 'Internodal pathways', 6);
  sph(CS, 'atrioventricular_node', 0.0036, [-0.005, 1.25, 0.03], cm, { scale: [1.5, 1, 0.8], label: 'Atrioventricular (AV) node' });
  vt(CS, 'bundle_of_his', [[-0.005, 1.25, 0.03], [0.002, 1.24, 0.036], [0.008, 1.232, 0.04]], 0.0016, cm, 'Atrioventricular bundle (bundle of His)', 8);
  vt(CS, 'right_bundle_branch', [[0.008, 1.232, 0.04], [0.016, 1.215, 0.05], [0.028, 1.195, 0.058], [0.04, 1.178, 0.064]], 0.0011, cm, 'Right bundle branch', 6);
  vt(CS, 'left_bundle_branch', [[0.008, 1.232, 0.04], [0.02, 1.222, 0.036], [0.034, 1.2, 0.042], [0.046, 1.18, 0.052]], 0.0013, cm, 'Left bundle branch', 6);
  const PK = [[0.04, 1.178, 0.064, 0.05, 1.19, 0.08], [0.04, 1.178, 0.064, 0.03, 1.2, 0.075], [0.046, 1.18, 0.052, 0.062, 1.19, 0.04], [0.046, 1.18, 0.052, 0.058, 1.21, 0.058], [0.043, 1.176, 0.058, 0.052, 1.172, 0.07]];
  PK.forEach(([a, b, c, d, e, f], i) => vt(CS, 'purkinje_fibres_' + i, [[a, b, c], [(a + d) / 2, (b + e) / 2 - 0.004, (c + f) / 2], [d, e, f]], 0.0007, cm, 'Purkinje fibres', 5)); }
// great vessels
const AP = [[0.006, 1.288, 0.042], [0.004, 1.33, 0.044], [0.01, 1.37, 0.036], [0.026, 1.388, 0.012], [0.038, 1.375, -0.018], [0.036, 1.34, -0.03], [0.03, 1.28, -0.032], [0.026, 1.2, -0.03], [0.02, 1.12, -0.03], [0.014, 1.05, -0.03], [0.005, 0.96, -0.025], [0, 0.9, -0.02]];
const aR = u => 0.0125 - 0.0045 * sstep(0.3, 1, u) + 0.004 * gaus(u, 0.01, 0.025);
[['ascending_aorta', 'Ascending aorta', 0, 0.14], ['aortic_arch', 'Aortic arch', 0.14, 0.25], ['thoracic_aorta', 'Descending thoracic aorta', 0.25, 0.55], ['abdominal_aorta', 'Abdominal aorta', 0.55, 1]].forEach(([n, l, a, b]) => vt(CS, n, sub(AP, a, b, 8), v => aR(a + (b - a) * v), art, l));
vt(CS, 'brachiocephalic_trunk', [[0.012, 1.386, 0.03], [0.002, 1.405, 0.026], [-0.008, 1.42, 0.022]], 0.0065, art, 'Brachiocephalic trunk', 10);
vt(CS, 'pulmonary_trunk', [[0.012, 1.286, 0.07], [0.016, 1.31, 0.06], [0.02, 1.335, 0.04], [0.022, 1.345, 0.018]], 0.0105, pArt, 'Pulmonary trunk');
vt(CS, 'ligamentum_arteriosum', [[0.024, 1.345, 0.016], [0.028, 1.358, 0.01], [0.03, 1.372, 0.004]], 0.0012, hm('ligamentum_arteriosum', 0xf0eeea), 'Ligamentum arteriosum', 6);
vt(CS, 'svc', [[-0.024, 1.405, 0.03], [-0.026, 1.37, 0.036], [-0.027, 1.33, 0.04], [-0.026, 1.295, 0.044]], 0.0085, vein, 'Superior vena cava');
vt(CS, 'ivc', [[0, 0.9, -0.022], [-0.012, 1.0, -0.03], [-0.022, 1.1, -0.026], [-0.026, 1.14, -0.01], [-0.025, 1.17, 0.012], [-0.022, 1.215, 0.03], [-0.02, 1.238, 0.04]], 0.0115, vein, 'Inferior vena cava');
window.__heartRange = [h0, G[CS].children.length];
for (const s of [-1, 1]) {
  const sd = s < 0 ? 'right' : 'left', P = a => a.map(p => [s * p[0], p[1], p[2]]), nl = n => n + '_' + sd, lb = t => t + ' (' + sd + ')';
  vt(CS, nl('pulmonary_artery'), s < 0 ? [[0.022, 1.345, 0.018], [0, 1.345, 0.01], [-0.03, 1.33, 0.004], [-0.05, 1.304, -0.008]] : [[0.022, 1.345, 0.018], [0.04, 1.345, 0.01], [0.055, 1.33, 0], [0.05, 1.304, -0.012]], 0.0075, pArt, lb('Pulmonary artery'), 12);
  vt(CS, nl('sup_pulmonary_vein'), s < 0 ? [[-0.05, 1.275, -0.006], [-0.025, 1.285, -0.002], [-0.01, 1.29, 0]] : [[0.05, 1.275, -0.008], [0.035, 1.285, -0.004], [0.03, 1.29, 0]], 0.0062, pVein, lb('Superior pulmonary vein'), 10);
  vt(CS, nl('inf_pulmonary_vein'), s < 0 ? [[-0.05, 1.261, -0.012], [-0.03, 1.268, -0.008], [-0.012, 1.28, -0.004]] : [[0.05, 1.261, -0.014], [0.04, 1.272, -0.008], [0.032, 1.28, -0.004]], 0.0062, pVein, lb('Inferior pulmonary vein'), 10);
  const CCA = s < 0 ? [[-0.008, 1.42, 0.022], [-0.016, 1.46, 0.02], [-0.022, 1.5, 0.022], [-0.026, 1.527, 0.026]] : [[0.022, 1.39, 0.022], [0.024, 1.43, 0.022], [0.026, 1.48, 0.024], [0.026, 1.527, 0.026]];
  vt(CS, nl('common_carotid'), CCA, 0.0045, art, lb('Common carotid artery'), 10);
  vt(CS, nl('internal_carotid'), P([[0.026, 1.527, 0.026], [0.026, 1.55, 0.018], [0.026, 1.568, 0.01], [0.022, 1.585, 0.022], [0.016, 1.605, 0.032], [0.012, 1.615, 0.03]]), 0.0035, art, lb('Internal carotid artery'), 8);
  vt(CS, nl('external_carotid'), P([[0.026, 1.527, 0.026], [0.034, 1.55, 0.024], [0.048, 1.575, 0.002], [0.058, 1.6, -0.008]]), 0.0025, art, lb('External carotid artery'), 8);
  vt(CS, nl('subclavian_artery'), s < 0 ? [[-0.008, 1.42, 0.022], [-0.04, 1.43, 0.012], [-0.09, 1.425, 0.012], [-0.15, 1.42, 0.012]] : [[0.034, 1.384, 0.002], [0.05, 1.41, 0], [0.1, 1.426, 0.01], [0.15, 1.42, 0.012]], 0.005, art, lb('Subclavian artery'), 10);
  {
    // upper limb vessels (left-side coords, mirrored by P). W: scapula-local -> world (left)
    const W = (x, y, z) => [0.055 + 0.93937 * x - 0.3429 * z, 1.292 + y, -0.106 + 0.3429 * x + 0.93937 * z];
    const A = (n, l, pts, r) => vt(CS, nl(n), P(pts), r, art, lb(l), 8);
    const avg = (a, b) => a.map((c, i) => (c + b[i]) / 2), off = (pts, d) => pts.map(p => p.map((c, i) => c + d[i]));
    const tg = [G.muscular, G.skeletal]; tg.forEach(g => g.updateMatrixWorld(true));
    const ray = new THREE.Raycaster(), AX = [[0.14, 1.44, -0.01], [0.205, 1.33, 0], [0.232, 1.075, 0], [0.268, 0.845, 0.012], [0.272, 0.74, 0.016]].map(p => V(s * p[0], p[1], p[2]));
    const surf = p => { const q = V(...p); let best = null, bd = 1e9;
      for (let i = 0; i < AX.length - 1; i++) { const c = new THREE.Line3(AX[i], AX[i + 1]).closestPointToPoint(q, true, V(0, 0, 0)), d = c.distanceTo(q); if (d < bd) { bd = d; best = c; } }
      const dir = q.clone().sub(best).normalize(), o = G.muscular.localToWorld(best.clone().addScaledVector(dir, 0.12)), wd = dir.clone().transformDirection(G.muscular.matrixWorld).negate();
      ray.set(o, wd); const h = ray.intersectObjects(tg, true)[0]; if (!h) return p;
      return G.muscular.worldToLocal(h.point.clone()).addScaledVector(dir, 0.0035).toArray(); };
    const Vn = (n, l, pts, r) => vt(CS, nl(n), P(pts).map((p, i) => pts[i][3] ? surf(p) : p), r, vein, lb(l), 8);
    // subclavian branches and scapular anastomosis
    A('thyrocervical_trunk', 'Thyrocervical trunk', [[0.064, 1.418, 0.003], [0.065, 1.438, 0.005], [0.066, 1.452, 0.004]], 0.0026);
    A('inferior_thyroid', 'Inferior thyroid artery', [[0.066, 1.452, 0.004], [0.05, 1.46, 0.002], [0.035, 1.47, 0.006], [0.024, 1.476, 0.012]], 0.0014);
    A('suprascapular_artery', 'Suprascapular artery', [[0.066, 1.452, 0.004], [0.085, 1.45, 0.004], [0.105, 1.44, -0.002], [0.118, 1.41, -0.03], [0.122, 1.378, -0.058], W(0.073, 0.06, 0.003), W(0.074, 0.056, -0.005), W(0.083, 0.054, -0.013), W(0.103, 0.044, -0.012), W(0.09, 0.026, -0.011), W(0.07, 0.01, -0.01), W(0.05, -0.004, -0.01)], 0.0018);
    A('transverse_cervical', 'Transverse cervical artery', [[0.066, 1.452, 0.004], [0.08, 1.462, -0.008], [0.095, 1.462, -0.03], [0.1, 1.452, -0.055], [0.098, 1.43, -0.08], [0.092, 1.4, -0.1]], 0.0016);
    A('dorsal_scapular', 'Dorsal scapular artery (deep branch of transverse cervical artery)', [[0.095, 1.462, -0.03], [0.078, 1.45, -0.06], [0.062, 1.42, -0.088], W(-0.004, 0.065, -0.008), W(-0.008, 0.03, -0.008), W(-0.004, -0.01, -0.008), W(0.008, -0.05, -0.008), W(0.026, -0.078, -0.008)], 0.0016);
    A('dorsal_scapular_br1', 'Dorsal scapular artery (deep branch of transverse cervical artery)', [W(-0.006, 0, -0.008), W(0.015, -0.02, -0.008), W(0.035, -0.03, -0.008)], 0.0009);
    A('dorsal_scapular_br2', 'Dorsal scapular artery (deep branch of transverse cervical artery)', [W(0.004, -0.04, -0.008), W(0.025, -0.05, -0.008), W(0.04, -0.06, -0.008)], 0.0009);
    const lig = M('scapular_ligament', 0xeeeae2, 0.6);
    vt('skeletal', nl('sup_transverse_scapular_lig'), P([W(0.066, 0.05, 0), W(0.074, 0.0515, 0.001), W(0.082, 0.05, 0)]), 0.0011, lig, lb('Superior transverse ligament of scapula'), 6);
    vt('skeletal', nl('inf_transverse_scapular_lig'), P([W(0.092, 0.048, -0.015), W(0.1, 0.043, -0.018), W(0.108, 0.036, -0.013)]), 0.001, lig, lb('Inferior transverse ligament of scapula (spinoglenoid ligament)'), 6);
    // axillary artery and branches
    A('axillary_artery', 'Axillary artery', [[0.15, 1.42, 0.012], [0.165, 1.396, 0.012], [0.18, 1.37, 0.014], [0.196, 1.34, 0.012], [0.204, 1.31, 0.02]], 0.0055);
    A('superior_thoracic', 'Superior thoracic artery', [[0.157, 1.41, 0.012], [0.145, 1.395, 0.03], [0.13, 1.38, 0.05]], 0.0012);
    A('thoracoacromial', 'Thoracoacromial artery', [[0.165, 1.396, 0.012], [0.166, 1.4, 0.022], [0.166, 1.402, 0.03]], 0.002);
    A('acromial_branch', 'Acromial branch (thoracoacromial artery)', [[0.166, 1.402, 0.03], [0.178, 1.406, 0.028], [0.19, 1.406, 0.02], [0.2, 1.41, 0.008]], 0.0012);
    A('deltoid_branch', 'Deltoid branch (thoracoacromial artery)', [[0.166, 1.402, 0.03], [0.174, 1.392, 0.033], [0.186, 1.372, 0.033], [0.2, 1.345, 0.03]], 0.0012);
    A('pectoral_branch_1', 'Pectoral branches (thoracoacromial artery)', [[0.166, 1.402, 0.03], [0.155, 1.395, 0.042], [0.14, 1.38, 0.058], [0.125, 1.36, 0.068]], 0.0013);
    A('pectoral_branch_2', 'Pectoral branches (thoracoacromial artery)', [[0.155, 1.395, 0.042], [0.148, 1.37, 0.05], [0.14, 1.34, 0.06]], 0.001);
    A('lateral_thoracic', 'Lateral thoracic artery', [[0.18, 1.37, 0.014], [0.17, 1.35, 0.022], [0.162, 1.3, 0.03], [0.156, 1.24, 0.036]], 0.0014);
    A('subscapular_artery', 'Subscapular artery', [[0.196, 1.34, 0.012], [0.186, 1.325, 0.0], [0.178, 1.31, -0.02], [0.165, 1.3, -0.04]], 0.003);
    A('circumflex_scapular', 'Circumflex scapular artery', [[0.165, 1.3, -0.04], [0.157, 1.305, -0.058], W(0.092, 0.012, -0.006), W(0.075, 0.004, -0.008), W(0.055, -0.006, -0.008), W(0.03, -0.016, -0.008)], 0.0018);
    A('circumflex_scapular_br', 'Circumflex scapular artery', [W(0.075, 0.004, -0.008), W(0.06, -0.025, -0.008), W(0.045, -0.045, -0.008)], 0.001);
    A('thoracodorsal_artery', 'Thoracodorsal artery', [[0.165, 1.3, -0.04], [0.168, 1.27, -0.056], [0.164, 1.23, -0.068], [0.158, 1.18, -0.076]], 0.002);
    A('ant_circumflex_humeral', 'Anterior circumflex humeral artery', [[0.204, 1.315, 0.018], [0.212, 1.322, 0.016], [0.219, 1.33, 0.01], [0.222, 1.336, 0.0]], 0.0013);
    A('post_circumflex_humeral', 'Posterior circumflex humeral artery', [[0.2, 1.322, 0.016], [0.19, 1.318, -0.006], [0.198, 1.326, -0.02], [0.214, 1.335, -0.02], [0.226, 1.342, -0.006]], 0.0018);
    // brachial artery and branches
    const BR = [[0.204, 1.31, 0.02], [0.21, 1.26, 0.022], [0.214, 1.2, 0.025], [0.224, 1.14, 0.025], [0.232, 1.09, 0.026], [0.237, 1.058, 0.027]];
    A('brachial_artery', 'Brachial artery', BR, 0.0052);
    A('deep_artery_arm', 'Deep artery of arm (profunda brachii)', [[0.208, 1.285, 0.022], [0.196, 1.268, 0.004], [0.204, 1.25, -0.016], [0.222, 1.22, -0.022], [0.23, 1.19, -0.026]], 0.0032);
    A('middle_collateral', 'Middle collateral artery', [[0.23, 1.19, -0.026], [0.234, 1.16, -0.026], [0.238, 1.12, -0.024], [0.242, 1.095, -0.02]], 0.0016);
    A('radial_collateral', 'Radial collateral artery', [[0.23, 1.19, -0.026], [0.242, 1.168, -0.008], [0.251, 1.14, 0.0], [0.256, 1.115, 0.01]], 0.0018);
    A('superior_ulnar_collateral', 'Superior ulnar collateral artery', [[0.212, 1.25, 0.022], [0.206, 1.22, 0.008], [0.206, 1.18, -0.002], [0.213, 1.14, -0.006], [0.216, 1.095, -0.012]], 0.0018);
    A('inferior_ulnar_collateral', 'Inferior ulnar collateral artery', [[0.23, 1.1, 0.026], [0.222, 1.1, 0.02], [0.214, 1.095, 0.012], [0.208, 1.088, 0.004], [0.206, 1.09, -0.006]], 0.0015);
    // forearm
    const RA = [[0.237, 1.058, 0.027], [0.244, 1.02, 0.026], [0.25, 0.98, 0.024], [0.257, 0.93, 0.025], [0.264, 0.89, 0.028], [0.272, 0.862, 0.031], [0.282, 0.85, 0.03], [0.294, 0.84, 0.022], [0.296, 0.828, 0.01], [0.29, 0.814, 0.002], [0.29, 0.804, 0.006], [0.29, 0.798, 0.014]];
    const UA = [[0.237, 1.058, 0.027], [0.234, 1.035, 0.022], [0.234, 1.0, 0.018], [0.24, 0.95, 0.018], [0.248, 0.9, 0.02], [0.256, 0.866, 0.026], [0.262, 0.848, 0.033], [0.264, 0.832, 0.036]];
    A('radial_artery', 'Radial artery', RA, 0.0038);
    A('ulnar_artery', 'Ulnar artery', UA, 0.0042);
    A('radial_recurrent', 'Radial recurrent artery', [[0.242, 1.04, 0.026], [0.252, 1.05, 0.026], [0.258, 1.075, 0.02], [0.258, 1.1, 0.014], [0.256, 1.115, 0.01]], 0.0016);
    A('ulnar_recurrent_ant', 'Ulnar recurrent artery (anterior branch)', [[0.234, 1.035, 0.022], [0.226, 1.045, 0.02], [0.218, 1.07, 0.012], [0.214, 1.095, 0.012]], 0.0015);
    A('ulnar_recurrent_post', 'Ulnar recurrent artery (posterior branch)', [[0.233, 1.04, 0.02], [0.224, 1.048, 0.006], [0.216, 1.068, -0.012], [0.216, 1.095, -0.012]], 0.0015);
    A('common_interosseous', 'Common interosseous artery', [[0.234, 1.035, 0.022], [0.238, 1.025, 0.016], [0.242, 1.02, 0.012]], 0.0026);
    A('anterior_interosseous', 'Anterior interosseous artery', [[0.242, 1.02, 0.012], [0.237, 0.995, 0.01], [0.2394, 0.95, 0.0104], [0.2475, 0.88, 0.0137], [0.252, 0.866, 0.012]], 0.0016);
    A('posterior_interosseous', 'Posterior interosseous artery', [[0.242, 1.02, 0.012], [0.246, 1.012, 0.0], [0.252, 1.0, -0.009], [0.2576, 0.95, -0.0054], [0.2684, 0.88, 0.0005], [0.27, 0.845, 0.0], [0.27, 0.832, 0.001]], 0.0016);
    A('interosseous_recurrent', 'Interosseous recurrent artery', [[0.252, 1.0, -0.009], [0.252, 1.03, -0.016], [0.25, 1.06, -0.02], [0.246, 1.085, -0.018]], 0.0012);
    A('palmar_carpal', 'Palmar carpal branches', [[0.27, 0.866, 0.03], [0.264, 0.858, 0.03], [0.258, 0.862, 0.026]], 0.0009);
    // hand
    A('superficial_palmar_branch', 'Superficial palmar branch of radial artery', [[0.276, 0.856, 0.031], [0.284, 0.84, 0.034], [0.288, 0.822, 0.034], [0.29, 0.808, 0.032]], 0.0014);
    A('superficial_palmar_arch', 'Superficial palmar arch', [[0.264, 0.832, 0.036], [0.263, 0.815, 0.036], [0.266, 0.8, 0.035], [0.274, 0.793, 0.034], [0.283, 0.797, 0.034], [0.29, 0.808, 0.032]], 0.0024);
    A('deep_palmar_arch', 'Deep palmar arch', [[0.29, 0.798, 0.014], [0.285, 0.796, 0.025], [0.274, 0.797, 0.027], [0.264, 0.799, 0.026], [0.256, 0.802, 0.024]], 0.0022);
    A('deep_palmar_branch_ulnar', 'Deep palmar branch of ulnar artery', [[0.264, 0.826, 0.036], [0.259, 0.812, 0.031], [0.256, 0.802, 0.024]], 0.0016);
    const FG = [[0.288, [0.5, -0.8, 0.25], [0.04, 0.032, 0.026]], [0.282, [0.07, -1, 0], [0.062, 0.032, 0.019, 0.016]], [0.272, [0, -1, 0], [0.06, 0.036, 0.022, 0.017]], [0.262, [-0.06, -1, 0], [0.054, 0.033, 0.021, 0.016]], [0.252, [-0.14, -1, 0], [0.048, 0.025, 0.014, 0.014]]];
    const fp = (k, t, o, dz) => { const [x, d] = FG[k], l = Math.hypot(...d), u = d.map(c => c / l), pl = Math.hypot(u[0], u[1]), q = [-u[1] / pl, u[0] / pl]; return [x + u[0] * t + q[0] * o, 0.812 + u[1] * t + q[1] * o, 0.018 + u[2] * t + dz]; };
    const fl = k => FG[k][2].reduce((a, b) => a + b, 0), f0 = k => FG[k][2][0];
    const side = (k, sg, dz, t0, t1, n = 5) => Array.from({ length: n }, (_, i) => fp(k, t0 + (t1 - t0) * i / (n - 1), sg * 0.005, dz));
    for (let k = 1; k <= 3; k++) {
      const web = avg(fp(k, f0(k) + 0.004, -0.005, 0.008), fp(k + 1, f0(k + 1) + 0.004, 0.005, 0.008));
      A('common_palmar_digital_' + k, 'Common palmar digital artery', [[web[0], 0.794 + (k === 3 ? 0.004 : 0), 0.035], [web[0], 0.772, 0.032], web], 0.0016);
      A('proper_palmar_digital_' + k + 'a', 'Proper palmar digital artery', [web, ...side(k, -1, 0.005, f0(k) + 0.012, fl(k) - 0.004)], 0.0011);
      A('proper_palmar_digital_' + k + 'b', 'Proper palmar digital artery', [web, ...side(k + 1, 1, 0.005, f0(k + 1) + 0.012, fl(k + 1) - 0.004)], 0.0011);
      const a = avg(fp(k, 0.02, -0.005, -0.009), fp(k + 1, 0.02, 0.005, -0.009)), w = avg(fp(k, f0(k), -0.005, -0.009), fp(k + 1, f0(k + 1), 0.005, -0.009));
      A('dorsal_metacarpal_' + k, 'Dorsal metacarpal artery', [[(FG[k][0] + FG[k + 1][0]) / 2, 0.829, 0.002], a, w], 0.0012);
      A('dorsal_digital_' + k + 'a', 'Dorsal digital artery', [w, ...side(k, -1, -0.005, f0(k) + 0.008, f0(k) + FG[k][2][1] + 0.01, 4)], 0.0009);
      A('dorsal_digital_' + k + 'b', 'Dorsal digital artery', [w, ...side(k + 1, 1, -0.005, f0(k + 1) + 0.008, f0(k + 1) + FG[k + 1][2][1] + 0.01, 4)], 0.0009);
    }
    A('radialis_indicis', 'Radialis indicis artery', [[0.286, 0.797, 0.026], [0.289, 0.776, 0.028], ...side(1, 1, 0.005, f0(1) + 0.004, fl(1) - 0.004)], 0.0012);
    A('proper_palmar_digital_little', 'Proper palmar digital artery', [[0.263, 0.81, 0.036], [0.255, 0.79, 0.03], ...side(4, -1, 0.005, f0(4) + 0.004, fl(4) - 0.004)], 0.0011);
    A('princeps_pollicis', 'Princeps pollicis artery', [[0.288, 0.798, 0.022], fp(0, 0.012, 0, 0.009), fp(0, 0.03, 0, 0.009)], 0.0014);
    for (const g of [1, -1]) A('proper_palmar_digital_thumb' + (g > 0 ? 'a' : 'b'), 'Proper palmar digital artery', [fp(0, 0.03, 0, 0.009), ...side(0, g, 0.005, 0.042, fl(0) - 0.004)], 0.0011);
    A('dorsal_carpal_network', 'Dorsal carpal network', [[0.296, 0.828, 0.01], [0.292, 0.826, 0.004], [0.282, 0.829, 0.002], [0.27, 0.83, 0.001], [0.26, 0.828, 0.003], [0.252, 0.832, 0.008]], 0.0012);
    A('ulnar_dorsal_carpal', 'Ulnar artery, dorsal carpal branch', [[0.256, 0.866, 0.026], [0.251, 0.858, 0.016], [0.248, 0.845, 0.008], [0.252, 0.832, 0.008]], 0.0013);
    A('radial_dorsal_carpal', 'Radial artery, dorsal carpal branch', [[0.296, 0.83, 0.012], [0.292, 0.826, 0.004]], 0.0013);
    A('dorsal_metacarpal_0', 'Dorsal metacarpal artery', [[0.29, 0.814, 0.003], fp(1, 0.02, 0.006, -0.009), fp(1, f0(1), 0.005, -0.009), ...side(1, 1, -0.005, f0(1) + 0.008, f0(1) + 0.04, 4)], 0.001);
    A('dorsal_digital_thumb', 'Dorsal digital artery', [[0.29, 0.814, 0.003], fp(0, 0.02, -0.005, -0.009), ...side(0, -1, -0.005, 0.045, 0.07, 3)], 0.0009);
    // veins: deep (venae comitantes) and superficial (projected onto the muscle surface)
    Vn('axillary_vein', 'Axillary vein', [[0.15, 1.416, 0.0], [0.158, 1.402, 0.022], [0.172, 1.372, 0.022], [0.184, 1.345, 0.02], [0.194, 1.31, 0.016]], 0.0055);
    Vn('brachial_vein', 'Brachial vein', [[0.194, 1.31, 0.016], ...off(BR.slice(1), [-0.006, 0, -0.001])], 0.0022);
    Vn('brachial_vein_2', 'Brachial vein', [[0.194, 1.31, 0.016], ...off(BR.slice(1), [0.005, 0, -0.004])], 0.0022);
    Vn('radial_veins', 'Radial veins', off(RA.slice(0, 7), [0.004, 0, -0.003]), 0.0016);
    Vn('ulnar_veins', 'Ulnar veins', off(UA.slice(0, 7), [-0.004, 0, -0.003]), 0.0016);
    Vn('cephalic_vein', 'Cephalic vein', [[0.296, 0.8, 0.0, 1], [0.296, 0.82, 0.006, 1], [0.29, 0.86, 0.02, 1], [0.282, 0.92, 0.03, 1], [0.27, 0.98, 0.035, 1], [0.262, 1.03, 0.035, 1], [0.256, 1.08, 0.035, 1], [0.248, 1.14, 0.035, 1], [0.24, 1.2, 0.04, 1], [0.228, 1.27, 0.045, 1], [0.205, 1.34, 0.05, 1], [0.185, 1.385, 0.045], [0.17, 1.398, 0.032], [0.158, 1.402, 0.022]], 0.0025);
    Vn('basilic_vein', 'Basilic vein', [[0.25, 0.8, 0.0, 1], [0.248, 0.83, 0.0, 1], [0.238, 0.9, 0.012, 1], [0.232, 0.96, 0.02, 1], [0.226, 1.02, 0.02, 1], [0.218, 1.08, 0.018, 1], [0.21, 1.13, 0.018, 1], [0.204, 1.18, 0.014], [0.2, 1.24, 0.012], [0.196, 1.29, 0.012], [0.194, 1.31, 0.016]], 0.0026);
    Vn('median_cubital_vein', 'Median cubital vein', [[0.262, 1.025, 0.035, 1], [0.25, 1.05, 0.035, 1], [0.236, 1.07, 0.03, 1], [0.222, 1.085, 0.022, 1]], 0.002);
    Vn('median_antebrachial_vein', 'Median antebrachial vein', [[0.27, 0.85, 0.035, 1], [0.262, 0.91, 0.04, 1], [0.254, 0.97, 0.04, 1], [0.246, 1.03, 0.038, 1], [0.24, 1.05, 0.035, 1]], 0.0016);
    Vn('dorsal_venous_network_hand', 'Dorsal venous network of hand', [[0.296, 0.8, 0.0, 1], [0.285, 0.786, -0.004, 1], [0.272, 0.782, -0.004, 1], [0.26, 0.786, -0.004, 1], [0.25, 0.8, 0.0, 1]], 0.0016);
  }
  vt(CS, nl('subclavian_vein'), P([[0.032, 1.43, 0.016], [0.1, 1.423, 0.006], [0.15, 1.416, 0]]), 0.0055, vein, lb('Subclavian vein'), 8);
  vt(CS, nl('internal_jugular'), P([[0.032, 1.43, 0.016], [0.038, 1.5, 0.006], [0.03, 1.545, -0.01], [0.026, 1.565, -0.022]]), 0.0065, vein, lb('Internal jugular vein'), 10);
  vt(CS, nl('vertebral_artery'), P([[0.05, 1.42, 0.005], [0.03, 1.43, -0.02], [0.022, 1.5, -0.04], [0.02, 1.545, -0.045], [0.012, 1.565, -0.04], [0.006, 1.585, -0.012], [0, 1.592, -0.004]]), 0.0025, art, lb('Vertebral artery'), 8);
  vt(CS, nl('pca'), P([[0, 1.619, 0.012], [0.008, 1.621, 0.006], [0.016, 1.624, -0.004], [0.022, 1.63, -0.016]]), 0.0016, art, lb('Posterior cerebral artery'), 6);
  vt(CS, nl('pcom'), P([[0.012, 1.622, 0.016], [0.012, 1.622, 0.026]]), 0.0011, art, lb('Posterior communicating artery'), 6);
  vt(CS, nl('mca'), P([[0.012, 1.615, 0.03], [0.026, 1.62, 0.034], [0.042, 1.628, 0.03]]), 0.002, art, lb('Middle cerebral artery'), 6);
  vt(CS, nl('aca'), P([[0.012, 1.615, 0.03], [0.006, 1.622, 0.04], [0.004, 1.64, 0.05], [0.004, 1.665, 0.045]]), 0.0016, art, lb('Anterior cerebral artery'), 6);
  vt(CS, nl('transverse_sinus'), P([[0, 1.67, -0.086], [0.02, 1.646, -0.088], [0.04, 1.625, -0.078]]), 0.003, vein, lb('Transverse sinus'), 8);
  vt(CS, nl('sigmoid_sinus'), P([[0.04, 1.625, -0.078], [0.046, 1.595, -0.05], [0.036, 1.57, -0.03], [0.026, 1.565, -0.022]]), 0.003, vein, lb('Sigmoid sinus'), 8);
}
vt(CS, 'left_brachiocephalic_vein', [[0.04, 1.43, 0.016], [0.03, 1.422, 0.026], [0.01, 1.414, 0.034], [-0.012, 1.41, 0.034], [-0.024, 1.405, 0.03]], 0.0065, vein, 'Left brachiocephalic vein', 10);
vt(CS, 'right_brachiocephalic_vein', [[-0.032, 1.43, 0.018], [-0.028, 1.41, 0.026], [-0.024, 1.4, 0.03]], 0.0065, vein, 'Right brachiocephalic vein', 10);
vt(CS, 'femoral_artery_right', [[0, 0.9, -0.02], [-0.04, 0.87, 0], [-0.085, 0.8, 0.022], [-0.092, 0.6, 0.022], [-0.098, 0.45, 0.002], [-0.1, 0.25, 0.002], [-0.1, 0.08, 0.012]], 0.007, art, 'Femoral artery (right)', 8);
vt(CS, 'femoral_artery_left', [[0, 0.9, -0.02], [0.04, 0.87, 0], [0.085, 0.8, 0.022], [0.092, 0.6, 0.022], [0.098, 0.45, 0.002], [0.1, 0.25, 0.002], [0.1, 0.08, 0.012]], 0.007, art, 'Femoral artery (left)', 8);
vt(CS, 'femoral_vein_right', [[0, 0.9, -0.025], [-0.035, 0.87, -0.012], [-0.074, 0.8, 0.008], [-0.082, 0.6, 0.008], [-0.088, 0.45, -0.012], [-0.09, 0.25, -0.012], [-0.092, 0.08, 0]], 0.0085, vein, 'Femoral vein (right)', 8);
vt(CS, 'femoral_vein_left', [[0, 0.9, -0.025], [0.035, 0.87, -0.012], [0.074, 0.8, 0.008], [0.082, 0.6, 0.008], [0.088, 0.45, -0.012], [0.09, 0.25, -0.012], [0.092, 0.08, 0]], 0.0085, vein, 'Femoral vein (left)', 8);
vt(CS, 'basilar_artery', [[0, 1.592, -0.004], [0, 1.605, 0.004], [0, 1.618, 0.01]], 0.003, art, 'Basilar artery', 8);
vt(CS, 'acom', [[-0.006, 1.622, 0.04], [0.006, 1.622, 0.04]], 0.0012, art, 'Anterior communicating artery', 6);
vt(CS, 'superior_sagittal_sinus', [[0, 1.712, 0.074], [0, 1.716, 0.04], [0, 1.716, 0], [0, 1.712, -0.04], [0, 1.7, -0.07], [0, 1.682, -0.086]], 0.003, vein, 'Superior sagittal sinus', 8);
vt(CS, 'straight_sinus', [[0, 1.655, -0.03], [0, 1.664, -0.06], [0, 1.67, -0.086]], 0.0025, vein, 'Straight sinus', 8);

// ── phrenic nerves and sympathetic trunks (nervous) ──
{
  const nv = M('thoracic_nerve', 0xe8c452, 0.5);
  tube('nervous', 'phrenic_nerve_right', [[-0.03, 1.5, -0.034], [-0.03, 1.461, -0.036], [-0.0405, 1.43, -0.024], [-0.0525, 1.402, -0.006], [-0.055, 1.36, 0.026], [-0.058, 1.3, 0.04], [-0.06, 1.26, 0.04], [-0.068, 1.18, 0.03], [-0.07, 1.14, 0.02]], 0.0013, nv, { label: 'Phrenic nerve (C3–C5, right)' });
  tube('nervous', 'phrenic_nerve_left', [[0.03, 1.5, -0.034], [0.03, 1.461, -0.036], [0.0405, 1.43, -0.024], [0.0525, 1.402, -0.006], [0.06, 1.36, 0.026], [0.07, 1.34, 0.04], [0.082, 1.26, 0.045], [0.088, 1.19, 0.04], [0.086, 1.14, 0.03]], 0.0013, nv, { label: 'Phrenic nerve (C3–C5, left)' });
  for (const s of [-1, 1]) { const sd = s < 0 ? 'right' : 'left', ys = [1.56, 1.5, 1.4]; for (let i = 0; i < 12; i++) ys.push(1.372 - i * 0.0265 - 0.01); ys.push(1.045, 1.02);
    const pts = ys.map(y => [s * 0.027, y, zc(y) - 0.008]); tube('nervous', 'sympathetic_trunk_' + sd, pts, 0.0011, nv, { label: 'Sympathetic trunk (' + sd + ')' });
    ys.forEach((y, i) => sph('nervous', 'sympathetic_ganglion_' + i + '_' + sd, 0.0034, [s * 0.027, y, zc(y) - 0.008], M('sympathetic_ganglion', 0xd9a63a, 0.5), { scale: [1, 1.4, 1], label: 'Sympathetic ganglion (' + sd + ')' })); }
}

// ───────── RESPIRATORY ─────────
// larynx
{
  const cartM = M('laryngeal_cartilage', 0xa3bdd1, 0.5, { side: THREE.DoubleSide, transparent: true, opacity: 0.8 }), solid = M('airway_cartilage', 0xa3bdd1, 0.5, { side: THREE.DoubleSide });
  for (const s of [-1, 1]) {
    const sd = s < 0 ? 'right' : 'left', pos = [], idx = [], N = 6;
    for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) { const u = i / N, v = j / N; pos.push(s * (0.002 + 0.019 * u), 1.526 - 0.03 * v - 0.004 * (1 - u) * (1 - v), 0.022 - 0.026 * u); }
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const a = i * (N + 1) + j, b = a + 1, c = a + N + 1, d = c + 1; idx.push(a, b, c, b, d, c); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    reg(RS, 'thyroid_lamina_' + sd, new THREE.Mesh(g, cartM), { label: 'Thyroid cartilage (' + sd + ' lamina)' });
    tube(RS, 'thyroid_sup_horn_' + sd, [[s * 0.019, 1.526, -0.002], [s * 0.021, 1.536, -0.006]], 0.0016, solid, { label: 'Thyroid cartilage (superior horn, ' + sd + ')' });
    reg(RS, 'arytenoid_' + sd, xf(new THREE.Mesh(new THREE.ConeGeometry(0.0035, 0.011, 10), solid), [s * 0.006, 1.5, -0.0085], { rot: [0, 0, -s * 0.2] }), { label: 'Arytenoid cartilage (' + sd + ')' });
    tube(RS, 'vocal_fold_' + sd, [[s * 0.0022, 1.505, 0.016], [s * 0.004, 1.505, 0.005], [s * 0.0055, 1.505, -0.0065]], 0.0012, M('vocal_fold', 0xf4efe6, 0.5), { label: 'Vocal fold (' + sd + ')' });
    tube(RS, 'vestibular_fold_' + sd, [[s * 0.0035, 1.514, 0.015], [s * 0.0055, 1.514, 0.004], [s * 0.0065, 1.514, -0.006]], 0.0012, M('vestibular_fold', 0xd89a98, 0.5), { label: 'Vestibular fold (' + sd + ')' });
  }
  const rg = new THREE.TorusGeometry(0.0105, 0.0022, 8, 28); rg.rotateX(Math.PI / 2);
  reg(RS, 'cricoid_arch', xf(new THREE.Mesh(rg, solid), [0, 1.489, 0.0]), { label: 'Cricoid cartilage' });
  reg(RS, 'cricoid_lamina', xf(new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.022, 0.003), solid), [0, 1.496, -0.0105]), { label: 'Cricoid cartilage (lamina)' });
  reg(RS, 'epiglottis', xf(new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), solid), [0, 1.534, 0.014], { scale: [0.009, 0.014, 0.0015], rot: [-0.25, 0, 0] }), { label: 'Epiglottis' });
  const pl = (nm, lb, w, h, c, rx, op) => reg(RS, nm, xf(new THREE.Mesh(new THREE.PlaneGeometry(w, h), M(nm, 0xe8eef3, 0.7, { transparent: true, opacity: op, side: THREE.DoubleSide, depthWrite: false })), c, { rot: [rx, 0, 0] }), { label: lb });
  pl('thyrohyoid_membrane', 'Thyrohyoid ligament (membrane)', 0.04, 0.012, [0, 1.531, 0.022], -0.1, 0.35); pl('cricothyroid_ligament', 'Cricothyroid ligament', 0.014, 0.005, [0, 1.4985, 0.0195], -0.05, 0.5);
}
// trachea
{
  const TP = [[0, 1.485, 0.004], [0, 1.45, 0.002], [0, 1.4, -0.002], [0, 1.35, -0.006], [0, 1.31, -0.008]], tc = new THREE.CatmullRomCurve3(TP.map(p => V(...p)));
  vt(RS, 'trachea', TP, 0.0105, M('tracheal_wall', 0xe8d3c4, 0.5, { transparent: true, opacity: 0.3, depthWrite: false }), 'Trachea (annular ligaments, membranous wall)', 18);
  const arc = 1.7 * Math.PI, ringG = new THREE.TorusGeometry(0.0108, 0.0016, 8, 24, arc); ringG.rotateZ(-0.35 * Math.PI); ringG.rotateX(Math.PI / 2);
  const cm = M('tracheal_cartilage', 0xa3bdd1, 0.5);
  for (let i = 0; i < 20; i++) reg(RS, 'tracheal_ring_' + i, xf(new THREE.Mesh(ringG, cm), tc.getPointAt(0.02 + i * 0.049).toArray()), { label: 'Tracheal cartilage ring (C-shaped)' });
  tube(RS, 'trachealis', TP.map(p => [p[0], p[1], p[2] - 0.0098]), 0.0028, M('trachealis_muscle', 0xb35a4a, 0.6), { label: 'Trachealis muscle (posterior wall)' });
  sph(RS, 'carina', 0.0045, [0, 1.311, -0.008], M('carina', 0xe8d3c4, 0.5), { label: 'Carina' });
  const lm = M('airway', 0xe8d6c6, 0.5);
  for (const s of [-1, 1]) { const sd = s < 0 ? 'right' : 'left', pts = s < 0 ? [[0, 1.31, -0.008], [-0.02, 1.298, -0.01], [-0.048, 1.285, -0.012]] : [[0, 1.31, -0.008], [0.03, 1.298, -0.01], [0.05, 1.282, -0.013]], rr = s < 0 ? 0.0078 : 0.0068, bc = new THREE.CatmullRomCurve3(pts.map(p => V(...p)));
    tube(RS, 'main_bronchus_' + sd, pts, rr, M('bronchial_wall', 0xd9d6d3, 0.5), { label: 'Main bronchus (' + sd + ')' });
    const bg = new THREE.TorusGeometry(rr * 1.02, 0.0012, 6, 18, 1.7 * Math.PI); bg.rotateZ(-0.35 * Math.PI);
    for (let i = 0; i < 5; i++) { const u = 0.12 + i * 0.19, p = bc.getPointAt(u), t = bc.getTangentAt(u), m = new THREE.Mesh(bg, cm); m.position.copy(p); m.quaternion.setFromUnitVectors(V(0, 0, 1), t); reg(RS, 'bronchial_ring_' + sd + '_' + i, m, { label: 'Bronchial cartilage (' + sd + ')' }); } }
}
// lungs, bronchial tree, pulmonary vessels, alveoli
const lungMats = []; window.__lungMats = lungMats;
const lm2 = (n, c) => { const m = M(n, c, 0.8, { transparent: true, opacity: 0.82, depthWrite: false, side: THREE.DoubleSide }); lungMats.push(m); return m; };
const LM = { rs: lm2('right_superior_lobe', 0xd49a98), rm: lm2('right_middle_lobe', 0xdca6a2), ri: lm2('right_inferior_lobe', 0xcf918f), ls: lm2('left_superior_lobe', 0xd69b99), ll: lm2('lingula', 0xdca6a2), li: lm2('left_inferior_lobe', 0xd09290) };
const LN = { rs: 'Right superior lobe', rm: 'Right middle lobe', ri: 'Right inferior lobe', ls: 'Left superior lobe', ll: 'Lingula (left superior lobe)', li: 'Left inferior lobe' };
function fitG(g, arr) { const p = g.attributes.position, b = new THREE.Box3(), v = new THREE.Vector3(); for (const i of arr) { v.fromBufferAttribute(p, i); b.expandByPoint(v); } g.boundingBox = b; g.boundingSphere = b.getBoundingSphere(new THREE.Sphere()); }
const cylG = (a, b, r1, r2) => { const d = b.clone().sub(a), len = d.length(), g = new THREE.CylinderGeometry(r2, r1, len, 6, 1, true); g.applyMatrix4(new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(Y, d.normalize()), V(1, 1, 1))); return g; };
const merge = list => { let nv = 0; const pos = [], nor = [], idx = []; list.forEach(g => { const p = g.attributes.position.array, n = g.attributes.normal.array, ix = g.index.array; for (let i = 0; i < p.length; i++) { pos.push(p[i]); nor.push(n[i]); } for (let i = 0; i < ix.length; i++) idx.push(ix[i] + nv); nv += p.length / 3; g.dispose(); }); const o = new THREE.BufferGeometry(); o.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); o.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); o.setIndex(idx); return o; };
const airM = M('bronchial_tree', 0xd9d4cf, 0.5), nodeM = M('hilar_lymph_node', 0x2a2a2a, 0.6), alvM = M('alveoli', 0xe8b0ae, 0.6, { transparent: true, opacity: 0.9 });
// inner rib-cage envelope at each height: half-width and depth from the rib arcs, used to keep the lungs inside the ribs
const cageL = []; for (let n = 1; n <= 12; n++) cageL.push([VD['T' + n].y - RDR[n - 1] * Math.pow(Math.min(1, 1.5708 / RA1[n - 1]), 1.3), RW[n - 1], RD[n - 1]]);
cageL.sort((a, b) => b[0] - a[0]);
const cageAt = y => {
  if (y >= cageL[0][0]) { const k = Math.min(1, (y - cageL[0][0]) / 0.05); return [cageL[0][1] * (1 - 0.3 * k), cageL[0][2] * (1 - 0.25 * k)]; }
  for (let i = 1; i < cageL.length; i++) if (y >= cageL[i][0]) { const k = (y - cageL[i][0]) / (cageL[i - 1][0] - cageL[i][0]); return [cageL[i][1] + (cageL[i - 1][1] - cageL[i][1]) * k, cageL[i][2] + (cageL[i - 1][2] - cageL[i][2]) * k]; }
  return [cageL[11][1], cageL[11][2]];
};
const inCage = (x, y, z) => { const [cw, cd] = cageAt(y), ex = x / (cw - 0.011), ez = (z + 0.002) / (cd - 0.01), rr = Math.hypot(ex, ez); return rr > 1 ? [x / rr, (z + 0.002) / rr - 0.002] : [x, z]; };
for (const s of [-1, 1]) {
  const sd = s < 0 ? 'right' : 'left', cx = s * 0.092, cy = 1.27, cz = -0.012, rx = 0.056, ry = 0.118, rz = 0.088;
  // lung surface
  const g = new THREE.SphereGeometry(1, 80, 60), pa = g.attributes.position, n = pa.count, U = new Float32Array(n * 3), HC = s > 0 ? [0.035, 1.22, 0.04, 0.045, 0.075, 0.06, 0.03] : [-0.03, 1.26, 0.04, 0.035, 0.06, 0.05, 0.012];
  for (let i = 0; i < n; i++) {
    const ux = pa.getX(i), uy = pa.getY(i), uz = pa.getZ(i); U[i * 3] = ux; U[i * 3 + 1] = uy; U[i * 3 + 2] = uz;
    const top = sstep(0.5, 1, uy); let px = ux * rx * (1 - 0.35 * top), py = uy * ry, pz = uz * rz * (1 - 0.3 * top);
    py += 0.03 * sstep(-0.5, -1, uy) * (1 - Math.min(1, Math.hypot(ux, uz)));
    let med = -s * px; if (med > 0.02) med = 0.02 + (med - 0.02) * 0.25; px = -s * med;
    let wx = cx + px, wy = cy + py, wz = cz + pz;
    [wx, wz] = inCage(wx, wy, wz);
    if (-s * ux > 0) { const d2 = ((wy - HC[1]) / HC[4]) ** 2 + ((wz - HC[2]) / HC[5]) ** 2 + ((wx - HC[0]) / (HC[3] * 1.6)) ** 2; wx += s * HC[6] * Math.exp(-d2) * sstep(0, 0.6, -s * ux); }
    const f = uy + 0.91 * uz + 0.087, gr = 0.004 * Math.exp(-((f / 0.06) ** 2)) + (s < 0 ? 0.004 * Math.exp(-((uy / 0.05) ** 2)) * sstep(0, 0.2, f) * sstep(-0.1, 0.3, uz) : 0);
    const nl = Math.hypot(ux / rx, uy / ry, uz / rz) || 1, nn = [ux / rx / nl, uy / ry / nl, uz / rz / nl], nz = 0.0006 * Math.sin(wx * 900 + wy * 700) * Math.sin(wz * 800 + wy * 500);
    pa.setXYZ(i, wx - (gr - nz) * nn[0], wy - (gr - nz) * nn[1], wz - (gr - nz) * nn[2]);
  }
  g.computeVertexNormals(); const na = g.attributes.normal;
  for (let r = 0; r <= 60; r++) { const a = r * 81, b = a + 80; let x = na.getX(a) + na.getX(b), y = na.getY(a) + na.getY(b), z = na.getZ(a) + na.getZ(b); const l = Math.hypot(x, y, z) || 1; na.setXYZ(a, x / l, y / l, z / l); na.setXYZ(b, x / l, y / l, z / l); }
  const ix = g.index.array, grp = {};
  for (let t = 0; t < ix.length; t += 3) {
    const a = ix[t], b = ix[t + 1], c = ix[t + 2], uy = (U[a * 3 + 1] + U[b * 3 + 1] + U[c * 3 + 1]) / 3, uz = (U[a * 3 + 2] + U[b * 3 + 2] + U[c * 3 + 2]) / 3, f = uy + 0.91 * uz + 0.087;
    let k; if (f < 0) k = s < 0 ? 'ri' : 'li'; else if (s < 0) k = (uy < 0 && uz > -0.15) ? 'rm' : 'rs'; else k = (uy < -0.28 && uz > 0.15) ? 'll' : 'ls';
    (grp[k] = grp[k] || []).push(a, b, c);
  }
  for (const k in grp) { const gg = new THREE.BufferGeometry(); gg.setAttribute('position', g.attributes.position); gg.setAttribute('normal', g.attributes.normal); gg.setIndex(grp[k]); fitG(gg, grp[k]); reg(RS, 'lung_' + k, new THREE.Mesh(gg, LM[k]), { label: LN[k] }); }
  // pleura
  { const pg = g.clone(), pp = pg.attributes.position; for (let i = 0; i < pp.count; i++) pp.setXYZ(i, pp.getX(i) + na.getX(i) * 0.003, pp.getY(i) + na.getY(i) * 0.003, pp.getZ(i) + na.getZ(i) * 0.003);
    reg(RS, 'pleura_' + sd, new THREE.Mesh(pg, M('pleura', 0xbfd4e4, 0.4, { transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide })), { label: 'Pleura (parietal, ' + sd + ')' }); }
  // bronchial tree
  const H = V(s * 0.05, 1.283, -0.012), inside = p => { const [cw, cd] = cageAt(p.y); return ((p.x - cx) / (rx * 0.86)) ** 2 + ((p.y - cy) / (ry * 0.9)) ** 2 + ((p.z - cz) / (rz * 0.86)) ** 2 < 1 && Math.hypot(p.x / (cw - 0.02), (p.z + 0.002) / (cd - 0.018)) < 1; };
  const lists = { sup: [], mid: [], inf: [] }, aL = [], vL = [], terms = [];
  const grow = (key, st, dir, len, r, depth, id) => {
    let L = len, en = st.clone().addScaledVector(dir, L); while (!inside(en) && L > 0.004) { L *= 0.7; en = st.clone().addScaledVector(dir, L); }
    lists[key].push(cylG(st, en, r, r * 0.8));
    const side = new THREE.Vector3().crossVectors(dir, V(0, 0, 1)); if (side.lengthSq() < 1e-4) side.set(1, 0, 0); side.normalize(); const off = side.multiplyScalar(r * 2.2);
    aL.push(cylG(st.clone().add(off), en.clone().add(off), r * 0.62, r * 0.5)); vL.push(cylG(st.clone().sub(off), en.clone().sub(off), r * 0.62, r * 0.5));
    if (depth === 0 || L < 0.006) { terms.push(en); return; }
    const a1 = 0.42 + 0.25 * rnd(id), a2 = 0.5 + 0.25 * rnd(id + 1), pp = new THREE.Vector3().crossVectors(dir, depth % 2 ? V(0, 0, 1) : V(1, 0, 0)); if (pp.lengthSq() < 1e-4) pp.set(0, 1, 0); pp.normalize();
    grow(key, en, dir.clone().multiplyScalar(Math.cos(a1)).addScaledVector(pp, Math.sin(a1)).normalize(), L * 0.78, r * 0.72, depth - 1, id * 2 + 1);
    grow(key, en, dir.clone().multiplyScalar(Math.cos(a2)).addScaledVector(pp, -Math.sin(a2)).normalize(), L * 0.74, r * 0.72, depth - 1, id * 2 + 2);
  };
  grow('sup', H, V(s * 0.45, 0.85, 0.15).normalize(), 0.045, 0.0045, 4, 10 + s); grow('mid', H, V(s * 0.6, -0.25, 0.6).normalize(), 0.04, 0.0042, 4, 200 + s); grow('inf', H, V(s * 0.4, -0.85, -0.25).normalize(), 0.07, 0.005, 4, 400 + s);
  const names = { sup: 'Superior lobar bronchus', mid: s < 0 ? 'Middle lobar bronchus' : 'Lingular bronchus', inf: 'Inferior lobar bronchus' };
  for (const k in lists) reg(RS, 'lobar_bronchus_' + k + '_' + sd, new THREE.Mesh(merge(lists[k]), airM), { label: names[k] + ' and segmental bronchi (' + sd + ')' });
  reg(CS, 'intrapulm_arteries_' + sd, new THREE.Mesh(merge(aL), pArt), { label: 'Pulmonary arteries, intrapulmonary (' + sd + ')' });
  reg(CS, 'intrapulm_veins_' + sd, new THREE.Mesh(merge(vL), pVein), { label: 'Pulmonary veins, intrapulmonary (' + sd + ')' });
  const al = []; terms.forEach((t, i) => { for (let j = 0; j < 6; j++) { const sg = new THREE.SphereGeometry(0.0022, 8, 6); sg.translate(t.x + (rnd(i * 7 + j) - 0.5) * 0.0065, t.y + (rnd(i * 7 + j + 3) - 0.5) * 0.0065, t.z + (rnd(i * 7 + j + 5) - 0.5) * 0.0065); al.push(sg); } });
  reg(RS, 'alveoli_' + sd, new THREE.Mesh(merge(al), alvM), { label: 'Alveoli (alveolar sacs, ' + sd + ')' });
  [[0.012, 0.012], [0.0, 0.016], [-0.012, 0.012], [-0.01, -0.006]].forEach((o, i) => sph(RS, 'hilar_node_' + sd + '_' + i, 0.003, [s * 0.047 + s * o[0] * 0.2, 1.283 + o[0], -0.012 + o[1] - 0.012], nodeM, { label: 'Hilar lymph node (' + sd + ')' }));
  reg(RS, 'pulmonary_ligament_' + sd, xf(new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.04), M('pulmonary_ligament', 0xe8d6cc, 0.6, { transparent: true, opacity: 0.5, side: THREE.DoubleSide })), [s * 0.05, 1.235, -0.012], { rot: [0, Math.PI / 2, 0] }), { label: 'Pulmonary ligament (' + sd + ')' });
}
// diaphragm
{
  const NR = 30, NP = 72, A = 0.158, Bz = 0.094, z0 = -0.004, pos = [], col = [], idx = [], cm = new THREE.Color(0xb4503f), ct = new THREE.Color(0xe8e6e2), c2 = new THREE.Color();
  const holes = [[-0.026, -0.01, 0.0145], [0.034, -0.006, 0.0135], [0.02, -0.032, 0.0125]];
  for (let i = 0; i <= NR; i++) for (let j = 0; j <= NP; j++) {
    const r = i / NR, ph = j / NP * 2 * Math.PI, x = A * r * Math.cos(ph), z = z0 + Bz * r * Math.sin(ph), Ad = 0.0875 - 0.0075 * Math.tanh(x / 0.02);
    const y = 1.05 + 0.065 * Math.sin(ph) * r + Ad * Math.pow(1 - r * r, 0.9) - 0.012 * gaus(x, 0, 0.03) * gaus(z, 0.03, 0.05), t = 1 - sstep(0.5, 1.05, Math.hypot((x - 0) / 0.08, (z - 0.03) / 0.058));
    pos.push(x, y, z); c2.copy(cm).lerp(ct, t); col.push(c2.r, c2.g, c2.b);
  }
  for (let i = 0; i < NR; i++) for (let j = 0; j < NP; j++) { const a = i * (NP + 1) + j, b = a + 1, c = a + NP + 1, d = c + 1, cx = (pos[a * 3] + pos[d * 3]) / 2, cz = (pos[a * 3 + 2] + pos[d * 3 + 2]) / 2; if (holes.some(h => Math.hypot(cx - h[0], cz - h[1]) < h[2])) continue; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
  reg(RS, 'diaphragm', new THREE.Mesh(g, M('diaphragm_muscle', 0xffffff, 0.7, { vertexColors: true, side: THREE.DoubleSide })), { label: 'Diaphragm (muscular part and central tendon)' });
  const rm = M('diaphragm_crus', 0xb4503f, 0.65), lig = M('arcuate_ligament', 0xe8dcb0, 0.6);
  for (const s of [-1, 1]) { const sd = s < 0 ? 'right' : 'left';
    tube(RS, 'crus_' + sd, [[s * 0.008, 0.95, -0.058], [s * 0.012, 1.0, -0.05], [s * 0.016, 1.05, -0.042], [s * 0.014, 1.09, -0.03]], s < 0 ? 0.0095 : 0.0075, rm, { label: 'Diaphragm, ' + sd + ' crus' });
    tube(RS, 'medial_arcuate_' + sd, [[s * 0.016, 1.0, -0.055], [s * 0.04, 1.02, -0.06], [s * 0.06, 1.02, -0.055], [s * 0.07, 0.99, -0.05]], 0.0016, lig, { label: 'Medial arcuate ligament (' + sd + ')' });
    tube(RS, 'lateral_arcuate_' + sd, [[s * 0.07, 0.99, -0.05], [s * 0.1, 1.0, -0.06], [s * 0.13, 1.02, -0.05], [s * 0.15, 1.04, -0.03]], 0.0016, lig, { label: 'Lateral arcuate ligament (' + sd + ')' }); }
  tube(RS, 'median_arcuate', [[-0.012, 1.03, -0.05], [0, 1.04, -0.044], [0.012, 1.03, -0.05]], 0.0016, lig, { label: 'Median arcuate ligament' });
  for (const [nme, lb, h, c] of [['caval', 'Caval opening (T8)', holes[0], 0x3f6fb5], ['aortic', 'Aortic hiatus (T12)', holes[2], 0xc9402f]]) { const gg = new THREE.TorusGeometry(h[2], 0.0022, 8, 28); gg.rotateX(Math.PI / 2); reg(RS, nme + '_ring', xf(new THREE.Mesh(gg, M(nme + '_ring', c, 0.5)), [h[0], 1.068 + (nme === 'caval' ? 0.07 : 0.0), h[1]]), { label: lb }); }
}
// the magnified alveolar unit is built in anatomy-alveolus.js
}

// ───────── DIGESTIVE ─────────
{
const DG = 'digestive', PI2 = Math.PI * 2;
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }, ga = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));
const TR = op => ({ transparent: true, opacity: op, depthWrite: false });
const PM = (name, color, rough, o = {}) => { const { cc = 0.6, sss = 0.35, sc = 0x7b1e1e, ...rest } = o;
  return new THREE.MeshPhysicalMaterial({ name, color, roughness: rough, metalness: 0, clearcoat: cc, clearcoatRoughness: 0.25, sheen: sss, sheenColor: new THREE.Color(sc), sheenRoughness: 0.5, ...rest }); };
const lerp3 = (a, b, t) => V(...a).lerp(V(...b), t);
const dm = {
  gut: PM('pharynx', 0xd27b78, 0.22), liver: M('liver', 0x9a4038, 0.5), gall: M('gallbladder', 0x1f7a52, 0.4), bile: M('bile_duct', 0x2f8a5d, 0.5),
  pancreas: M('pancreas', 0xe0a0a4, 0.65, { transparent: true, opacity: 0.6, depthWrite: false }), spleen: M('spleen', 0x7a4a6a, 0.55),
  colon: PM('colon_serosa', 0xc4837b, 0.27, { sss: 0.35, sc: 0x8a3a30 }), taenia: PM('taenia_coli', 0xd6a396, 0.4, { cc: 0.3 }), fat: PM('epiploic_fat', 0xd8b85a, 0.45, { cc: 0.3, sss: 0.2, sc: 0xa07020 }),
  omentum: M('greater_omentum', 0xe8d58a, 0.8, { transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide }),
  sheet: M('peritoneal_ligament', 0xe8d9b5, 0.8, { transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide }),
  sph: PM('sphincter', 0xb04a40, 0.4), art: mat.artery, vein: mat.vein,
};
function varTube(name, pts, rf, mt, o = {}, R = 18) {
  const c = new THREE.CatmullRomCurve3(pts.map(p => p.isVector3 ? p.clone() : V(...p))), S = pts.length * 12;
  const g = new THREE.TubeGeometry(c, S, 1, R, false), pos = g.attributes.position;
  for (let i = 0; i <= S; i++) { const ct = c.getPointAt(i / S); for (let j = 0; j <= R; j++) { const k = i * (R + 1) + j, r = rf(i / S, j / R); pos.setXYZ(k, ct.x + (pos.getX(k) - ct.x) * r, ct.y + (pos.getY(k) - ct.y) * r, ct.z + (pos.getZ(k) - ct.z) * r); } }
  g.computeVertexNormals(); return reg(DG, name, new THREE.Mesh(g, mt), o);
}
function gridSurf(name, nu, nv, fn, mt, label, ro, colFn) {
  const pos = [], idx = [], col = [], c = new THREE.Color();
  for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) { const p = fn(i / nu, j / nv); pos.push(p.x, p.y, p.z); if (colFn) { c.setHex(colFn(i / nu, j / nv)); col.push(c.r, c.g, c.b); } }
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const a = i * (nv + 1) + j, b = a + nv + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); if (colFn) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx); g.computeVertexNormals(); const m = reg(DG, name, new THREE.Mesh(g, mt), { label }); if (ro) m.renderOrder = ro; return m;
}
const ring = (name, pts, r, mt, label) => reg(DG, name, new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), pts.length * 2, r, 6, true), mt), { label });
const vtube = (name, pts, r, mt, label, sys = DG) => tube(sys, name, pts.map(p => p.isVector3 ? p.toArray() : p), r, mt, { label });
const sheet = (name, A, B, mt, label) => { const g = new THREE.BufferGeometry(), pos = [], idx = [];
  for (let i = 0; i < A.length; i++) { pos.push(...A[i].toArray(), ...B[i].toArray()); if (i < A.length - 1) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2); }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return reg(DG, name, new THREE.Mesh(g, mt), { label }); };
const basisMesh = (name, geo, mt, pos, X, Yv, Z, label) => { const m = new THREE.Mesh(geo, mt); m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Yv, Z)); m.position.copy(pos); return reg(DG, name, m, { label }); };

// ── oral cavity: gingiva, palate, fauces, tonsils (teeth are in the skeleton) ──
{
  const gm = PM('gingiva', 0xd97076, 0.22, { cc: 0.8, sss: 0.45, sc: 0xc24d58 });
  for (const up of [1, 0]) { const pts = []; for (let k = -20; k <= 20; k++) { const s = Math.abs(k) / 20, [x, z] = ARCH(s, up); pts.push([Math.sign(k) * x, up ? OCC + 0.0072 : OCC - 0.0078, z]); }
    tube(DG, up ? 'gingiva_maxillary' : 'gingiva_mandibular', pts, 0.0027, gm, { label: up ? 'Gingiva (maxillary)' : 'Gingiva (mandibular)' }); }
  const pal = PM('palatal_mucosa', 0xd97076, 0.22, { cc: 0.8, sss: 0.45, sc: 0xc24d58 });
  sph(DG, 'hard_palate_mucosa', 1, [0, 1.5756, 0.034], pal, { scale: [0.021, 0.0011, 0.023], label: 'Hard palate mucosa' });
  [0.052, 0.048, 0.044, 0.04].forEach((z, i) => { const pts = []; for (let k = 0; k <= 8; k++) { const x = -0.011 + (0.022 * k) / 8; pts.push([x, 1.5747, z - 0.0035 * (x / 0.011) ** 2 + 0.0008 * Math.sin(k * 1.9 + i)]); }
    tube(DG, 'palatine_ruga_' + i, pts, 0.00065, pal, { label: 'Transverse palatine folds (rugae)' }); });
  const sp = PM('soft_palate', 0xc24d58, 0.2, { cc: 0.8, sss: 0.5, side: THREE.DoubleSide });
  gridSurf('soft_palate', 12, 12, (u, v) => { const w = 0.019 - 0.011 * u, x = (2 * v - 1) * w; return V(x, 1.5765 - 0.0105 * u + 0.004 * (x / 0.019) ** 2 * u, 0.012 - 0.0165 * u); }, sp, 'Soft palate');
  reg(DG, 'uvula', xf(new THREE.Mesh(new THREE.CapsuleGeometry(0.0021, 0.0042, 6, 12), sp), [0, 1.5625, -0.0052], { rot: [0.25, 0, 0] }), { label: 'Uvula' });
  for (const s of [-1, 1]) { const sd = s < 0 ? 'right' : 'left', lb = t => t + ' (' + sd + ')';
    tube(DG, 'palatoglossal_arch_' + sd, [[s * 0.015, 1.5745, 0.008], [s * 0.019, 1.568, 0.009], [s * 0.019, 1.561, 0.013]], 0.0012, sp, { label: lb('Palatoglossal arch') });
    tube(DG, 'palatopharyngeal_arch_' + sd, [[s * 0.012, 1.5725, -0.001], [s * 0.017, 1.562, -0.004], [s * 0.016, 1.548, -0.009]], 0.0012, sp, { label: lb('Palatopharyngeal arch') });
    sph(DG, 'palatine_tonsil_' + sd, 1, [s * 0.0175, 1.5655, 0.0035], PM('palatine_tonsil', 0xa84a55, 0.35, { sss: 0.5 }), { scale: [0.0028, 0.0058, 0.0038], label: lb('Palatine tonsil') }); }
}
// ── tongue: oral (anterior two-thirds) and pharyngeal (posterior third) parts ──
{
  const TC = new THREE.CatmullRomCurve3([[0, 1.5565, 0.047], [0, 1.5652, 0.034], [0, 1.5668, 0.022], [0, 1.5608, 0.014], [0, 1.5505, 0.0165]].map(p => V(...p))), X = V(1, 0, 0);
  const tF = u => { const p = TC.getPointAt(u), t = TC.getTangentAt(u), I = new THREE.Vector3().crossVectors(X, t).normalize(), B = new THREE.Vector3().crossVectors(t, I).normalize(); return { p, I, B }; };
  const uS = th => 0.62 - 0.13 * Math.abs(Math.sin(th));
  const tS = (u, th, k = 1) => { const f = tF(u), w = 0.0205 * Math.sqrt(ss(0, 0.24, u)) * (1 - 0.15 * ss(0.8, 1, u)), h = 0.0085 * Math.sqrt(ss(0, 0.18, u)), c = Math.cos(th), tw = Math.atan2(Math.sin(th), c);
    let r = k * (1 - 0.09 * ga(tw, 0, 0.12) * (u < 0.6 ? 1 : 0) - 0.07 * ga(u, uS(th), 0.012) * Math.max(0, c));
    return f.p.clone().addScaledVector(f.I, c * h * (c < 0 ? 0.6 : 1) * r).addScaledVector(f.B, Math.sin(th) * w * r); };
  const tm = new THREE.MeshPhysicalMaterial({ name: 'tongue', color: 0xffffff, vertexColors: true, side: THREE.DoubleSide, roughness: 0.38, metalness: 0, clearcoat: 0.45, clearcoatRoughness: 0.35, sheen: 0.45, sheenColor: new THREE.Color(0x9e2a32), sheenRoughness: 0.5 });
  const col = part => (u, v) => { const c = Math.cos(v * PI2); return c < -0.25 ? 0xd27b88 : part ? 0x9e3c45 : 0xc8666d; };
  gridSurf('tongue_oral_part', 60, 48, (a, b) => tS(0.001 + a * 0.63, b * PI2), tm, 'Tongue, oral part (anterior two-thirds)', 0, col(0));
  gridSurf('tongue_pharyngeal_part', 30, 48, (a, b) => tS(0.62 + a * 0.38, b * PI2), tm, 'Tongue, pharyngeal part (posterior third)', 0, col(1));
  const pts = []; for (let k = 0; k <= 16; k++) { const th = -1.05 + (2.1 * k) / 16; pts.push(tS(uS(th), th, 1.002).toArray()); }
  tube(DG, 'sulcus_terminalis', pts, 0.00045, M('sulcus_terminalis', 0x7a2a32, 0.5), { label: 'Sulcus terminalis' });
  sph(DG, 'foramen_cecum', 0.0009, tS(0.62, 0, 0.99).toArray(), M('foramen_cecum', 0x4a1a20, 0.6), { label: 'Foramen cecum' });
  const vp = PM('vallate_papilla', 0xd98d8d, 0.3, { cc: 0.4 }), fp = PM('fungiform_papilla', 0xd84b5a, 0.3, { cc: 0.5 }), lt = PM('lingual_tonsil', 0x8e3440, 0.35);
  for (let i = 0; i < 9; i++) { const th = (i - 4) * 0.21; sph(DG, 'vallate_papilla_' + i, 0.0012, tS(uS(th) - 0.03, th, 1.0).toArray(), vp, { scale: [1, 0.55, 1], label: 'Vallate (circumvallate) papillae' }); }
  for (let i = 0; i < 34; i++) { const u = 0.07 + 0.47 * ((i * 0.618) % 1), th = -0.95 + 1.9 * ((i * 0.377 + 0.13) % 1); sph(DG, 'fungiform_papilla_' + i, 0.00062, tS(u, th, 1.0).toArray(), fp, { label: 'Fungiform papillae' }); }
  for (let i = 0; i < 24; i++) { const u = 0.68 + 0.28 * ((i * 0.618) % 1), th = -0.85 + 1.7 * ((i * 0.41 + 0.2) % 1); sph(DG, 'lingual_tonsil_' + i, 0.0016, tS(u, th, 0.98).toArray(), lt, { label: 'Lingual tonsil (lymphoid nodules)' }); }
  const fq = tS(0.3, Math.PI, 1.0); sph(DG, 'lingual_frenulum', 1, [0, (fq.y + 1.5475) / 2, fq.z - 0.002], PM('lingual_frenulum', 0xd27b88, 0.15, TR(0.85)), { scale: [0.0006, Math.max(0.002, (fq.y - 1.5475) / 2 + 0.001), 0.007], label: 'Lingual frenulum' });
  for (const s of [-1, 1]) { const sd = s < 0 ? 'right' : 'left', vp2 = []; for (let k = 0; k <= 10; k++) vp2.push(tS(0.08 + 0.38 * k / 10, Math.PI + s * 0.42, 1.01).toArray());
    tube(DG, 'deep_lingual_vein_' + sd, vp2, 0.00055, M('deep_lingual_vein', 0x6a5f9a, 0.3), { label: 'Deep lingual vein (' + sd + ')' });
    sph(DG, 'sublingual_caruncle_' + sd, 0.0011, [s * 0.003, 1.5482, 0.036], PM('sublingual_caruncle', 0xd27b88, 0.15), { label: 'Sublingual caruncle (' + sd + ')' }); }
}
varTube('pharynx', [[0, 1.575, 0.0], [0, 1.545, -0.012], [0, 1.52, -0.012]], () => 0.0155, dm.gut, { label: 'Pharynx' });

// ── oesophagus: four constrictions, muscle transition by thirds, longitudinal mucosal folds, Z-line ──
{
  const P0 = [[0, 1.505, -0.014], [0, 1.46, -0.02], [0, 1.4, -0.024], [0.004, 1.36, -0.027], [0.01, 1.3, -0.03], [0.016, 1.24, -0.026], [0.024, 1.18, -0.012], [0.034, 1.14, -0.006], [0.05, 1.118, 0.003], [0.062, 1.11, 0.005]];
  const c = new THREE.CatmullRomCurve3(P0.map(p => V(...p))), gs = ga;
  const rf = y => 0.0095 - 0.0017 * gs(y, 1.505, 0.012) - 0.0011 * gs(y, 1.355, 0.014) - 0.0011 * gs(y, 1.29, 0.014) - 0.0013 * gs(y, 1.14, 0.012) + 0.0022 * gs(y, 1.113, 0.012);
  const N = 400, ys = []; for (let i = 0; i <= N; i++) ys.push(c.getPoint(i / N).y);
  const tAt = y => { for (let i = 0; i < N; i++) if (ys[i] >= y && ys[i + 1] < y) return (i + (ys[i] - y) / (ys[i] - ys[i + 1])) / N; return 1; };
  const B = [0, tAt(1.372), tAt(1.31), tAt(1.21), tAt(1.136), 1];
  const wall = (col, nm) => PM(nm, col, 0.5, { cc: 0.2, ...TR(0.78) });
  const stri = wall(0xa5473b, 'esophagus_striated_muscle'), mixd = wall(0xb5675a, 'esophagus_mixed_muscle'), smth = wall(0xc98476, 'esophagus_smooth_muscle');
  [['cervical', 'cervical part (striated muscle)', stri], ['upper_thoracic', 'upper thoracic part (striated muscle)', stri], ['mid_thoracic', 'mid-thoracic part (mixed muscle)', mixd], ['lower_thoracic', 'lower thoracic part (smooth muscle)', smth], ['abdominal', 'abdominal part (smooth muscle)', smth]].forEach(([k, lbl, mt], i) => {
    const t0 = B[i], t1 = Math.min(1, B[i + 1] + 0.004), pts = [];
    for (let j = 0; j <= 7; j++) pts.push(c.getPoint(t0 + ((t1 - t0) * j) / 7).toArray());
    varTube('esophagus_' + k, pts, u => rf(c.getPoint(t0 + (t1 - t0) * u).y), mt, { label: 'Esophagus, ' + lbl }).renderOrder = 1;
  });
  const all = []; for (let j = 0; j <= 30; j++) all.push(c.getPoint(j / 30).toArray());
  varTube('esophageal_mucosa', all, (u, a) => rf(c.getPoint(u).y) * 0.48 * (1 + 0.32 * Math.abs(Math.cos(a * Math.PI * 7))), PM('esophageal_mucosa', 0xe89a9a, 0.18, { cc: 0.8, sss: 0.3, sc: 0xd06070 }), { label: 'Esophageal mucosa (longitudinal folds)' }, 42);
  varTube('esophageal_adventitia', all, u => rf(c.getPoint(u).y) * 1.2, PM('esophageal_adventitia', 0xba8779, 0.62, { cc: 0, sss: 0.1, ...TR(0.22) }), { label: 'Esophagus, tunica adventitia' }).renderOrder = 2;
  const ab = []; for (let j = 0; j <= 6; j++) ab.push(c.getPoint(B[4] + ((1 - B[4]) * j) / 6).toArray());
  varTube('esophageal_abdominal_serosa', ab, u => rf(c.getPoint(B[4] + (1 - B[4]) * u).y) * 1.26, PM('esophageal_serosa', 0xc99484, 0.22, { cc: 0.8, ...TR(0.25) }), { label: 'Esophagus, abdominal serosa (visceral peritoneum)' }).renderOrder = 2;
  const fr = c.computeFrenetFrames(60, false), fm = M('longitudinal_muscle', 0x8f3a30, 0.6);
  for (let k = 0; k < 8; k++) {
    const th = (k / 8) * PI2, pts = [];
    for (let i = 0; i <= 60; i++) { const p = c.getPoint(i / 60), r = rf(p.y); pts.push(p.clone().addScaledVector(fr.normals[i], Math.cos(th) * r).addScaledVector(fr.binormals[i], Math.sin(th) * r).toArray()); }
    tube(DG, 'longitudinal_muscle_' + k, pts, 0.0007, fm, { label: 'Esophagus, longitudinal muscle layer' });
  }
  const rm = M('circular_muscle', 0xb5564a, 0.6), Zv = V(0, 0, 1), nR = Math.round(c.getLength() / 0.012);
  for (let i = 0; i < nR; i++) {
    const u = (i + 0.5) / nR, p = c.getPointAt(u), m = new THREE.Mesh(new THREE.TorusGeometry(rf(p.y) * 0.97, 0.0007, 6, 28), rm);
    m.position.copy(p); m.quaternion.setFromUnitVectors(Zv, c.getTangentAt(u)); reg(DG, 'circular_muscle_' + i, m, { label: 'Esophagus, circular muscle layer' });
  }
  { const t = tAt(1.1125), p = c.getPoint(t), j = Math.round(t * 60), tg = c.getTangent(t), r = rf(p.y) * 0.5, zz = [];
    for (let k = 0; k < 24; k++) { const th = (k / 24) * PI2; zz.push(p.clone().addScaledVector(fr.normals[j], Math.cos(th) * r).addScaledVector(fr.binormals[j], Math.sin(th) * r).addScaledVector(tg, k % 2 ? 0.0016 : -0.0016)); }
    ring('z_line', zz, 0.00045, M('z_line', 0xf2e4d8, 0.4), 'Z-line (oesophagogastric mucosal junction)'); }
  const hg = new THREE.TorusGeometry(0.0125, 0.0035, 8, 28); hg.rotateX(Math.PI / 2);
  reg(DG, 'esophageal_hiatus', xf(new THREE.Mesh(hg, mat.diaphragm), [0.034, 1.138, -0.006]), { label: 'Esophageal hiatus (diaphragm)' });
  [1.3, 1.24, 1.19].forEach((y, i) => { const p = c.getPoint(tAt(y)); tube('circulatory', 'esophageal_artery_' + (i + 1), [[0.03 + i * 0.002, y, -0.03], [(0.03 + p.x) / 2, y, -0.028], p.toArray()], 0.0025, mat.artery, { label: 'Esophageal artery (from aorta)' }); });
  tube('circulatory', 'azygos_vein', [[-0.018, 0.99, -0.04], [-0.02, 1.1, -0.045], [-0.02, 1.25, -0.045], [-0.02, 1.36, -0.035], [-0.022, 1.41, -0.005], [-0.02, 1.43, 0.01]], 0.0042, mat.vein, { label: 'Azygos vein (esophageal drainage)' });
  const le = new THREE.Mesh(new THREE.TorusGeometry(0.0112, 0.0026, 10, 24), dm.sph); le.position.set(0.058, 1.112, 0.004); le.quaternion.setFromUnitVectors(Zv, V(0.8, -0.55, 0.2).normalize()); reg(DG, 'lower_esophageal_sphincter', le, { label: 'Lower oesophageal (gastro-oesophageal) sphincter' });
}

// ── stomach: J-shaped, flattened front-to-back; fundus above the cardia, angular incisure, pyloric canal ──
const SCv = new THREE.CatmullRomCurve3([[0.09, 1.152, -0.008], [0.092, 1.122, -0.004], [0.094, 1.095, 0.012], [0.086, 1.055, 0.032], [0.066, 1.02, 0.046], [0.036, 1.003, 0.054], [0.012, 1.01, 0.054], [-0.004, 1.022, 0.05], [-0.012, 1.03, 0.047]].map(p => V(...p))), Cn = V(0.04, 1.06, 0.035);
const stoF = u => { u = Math.min(0.9999, Math.max(0.0001, u)); const p = SCv.getPointAt(u), t = SCv.getTangentAt(u), I = Cn.clone().sub(p); I.addScaledVector(t, -I.dot(t)).normalize(); return { p, t, I, B: new THREE.Vector3().crossVectors(t, I).normalize() }; };
const sR = u => { let r; if (u < 0.13) r = 0.03 * Math.sqrt(Math.max(0, 1 - (1 - u / 0.13) ** 2)); else if (u < 0.55) r = 0.03 - 0.004 * ss(0.13, 0.55, u); else if (u < 0.86) r = 0.026 - 0.009 * ss(0.55, 0.86, u); else r = 0.017 - 0.0085 * ss(0.86, 0.97, u); return r - 0.0012 * ga(u, 0.985, 0.008); };
const SS = (u, th, k = 1) => { const f = stoF(u), r = sR(u) * k * (1 - 0.38 * ga(u, 0.6, 0.05) * Math.max(0, Math.cos(th)) ** 3); return f.p.clone().addScaledVector(f.I, Math.cos(th) * r).addScaledVector(f.B, Math.sin(th) * r * 0.74); };
{
  const stoW = PM('stomach_muscularis', 0xc87a6e, 0.25, { sss: 0.35, ...TR(0.5), side: THREE.DoubleSide });
  [['stomach_fundus', 'Stomach, fundus', 0.002, 0.15], ['stomach_body', 'Stomach, body (corpus)', 0.15, 0.6], ['stomach_pyloric_antrum', 'Stomach, pyloric antrum', 0.6, 0.86], ['stomach_pyloric_canal', 'Stomach, pyloric canal', 0.86, 1]].forEach(([n, l, u0, u1]) =>
    gridSurf(n, Math.ceil((u1 - u0) * 140), 48, (a, b) => SS(u0 + (u1 - u0) * a, b * PI2), stoW, l, 1));
  varTube('stomach_cardia', [[0.055, 1.1125, 0.004], [0.062, 1.11, 0.005], [0.071, 1.108, 0.006]], u => 0.0095 + 0.0065 * u, stoW, { label: 'Stomach, cardia' }).renderOrder = 1;
  gridSurf('stomach_serosa', 140, 48, (a, b) => SS(0.002 + 0.996 * a, b * PI2, 1.05), PM('stomach_serosa', 0xd68d81, 0.2, { cc: 0.9, ...TR(0.2), side: THREE.DoubleSide }), 'Stomach serosa (visceral peritoneum)', 2);
  gridSurf('gastric_mucosa', 170, 96, (a, b) => { const u = 0.003 + 0.994 * a, th = b * PI2, tw = Math.atan2(Math.sin(th), Math.cos(th)), lc = ga(tw, 0, 0.45);
      const f1 = Math.abs(Math.sin(tw * 14)), f2 = Math.abs(Math.sin(th * 9 + 1.8 * Math.sin(u * 30 + th * 2))), fade = (1 - ss(0.82, 0.96, u)) * ss(0.02, 0.12, u);
      return SS(u, th, (0.9 - 0.2 * ss(0.6, 0.9, u) - 0.13 * ss(0.9, 1, u)) * (0.95 + 0.1 * (lc * f1 + (1 - lc) * f2) * fade)); },
    PM('gastric_mucosa', 0xc94e4e, 0.15, { cc: 0.9, sss: 0.55, sc: 0xff5a6a }), 'Gastric mucosa (rugae; Magenstrasse along the lesser curvature)');
  const line = (th, k, u0, u1, n = 40) => { const a = []; for (let i = 0; i <= n; i++) a.push(SS(u0 + ((u1 - u0) * i) / n, th, k).toArray()); return a; };
  const lm = M('stomach_longitudinal_muscle', 0xb86a5c, 0.6), cm = M('stomach_circular_muscle', 0xa95a4e, 0.6), om = M('stomach_oblique_muscle', 0x96483e, 0.6);
  [0.12, -0.12, 0.28, -0.28, Math.PI + 0.12, Math.PI - 0.12, Math.PI + 0.28, Math.PI - 0.28, Math.PI / 2, -Math.PI / 2].forEach((th, k) => tube(DG, 'stomach_longitudinal_muscle_' + k, line(th, 1.006, 0.09, 0.995, 60), 0.0007, lm, { label: 'Stomach, longitudinal muscle layer (outer, along the curvatures)' }));
  for (let i = 0; i < 30; i++) { const u = 0.1 + (0.89 * i) / 29, pts = []; for (let j = 0; j < 40; j++) pts.push(SS(u, (j / 40) * PI2, 0.998));
    ring('stomach_circular_muscle_' + i, pts, 0.0006 + 0.0011 * ss(0.75, 1, u), cm, 'Stomach, circular muscle layer (middle)'); }
  for (let j = 0; j < 4; j++) { const th = 0.75 + 0.18 * j, top = 0.03, end = 0.55 - 0.06 * j;
    tube(DG, 'stomach_oblique_muscle_' + j, [...line(th, 0.985, end, top, 24), ...line(-th, 0.985, top, end, 24).slice(1)], 0.0007, om, { label: 'Stomach, oblique muscle layer (inner sling)' }); }
  { const pts = []; for (let j = 0; j < 36; j++) pts.push(SS(0.985, (j / 36) * PI2, 0.92)); ring('pyloric_sphincter', pts, 0.0033, dm.sph, 'Pyloric sphincter'); }
  tube(DG, 'lesser_curvature', line(0, 1.012, 0.13, 0.99), 0.0005, M('curvature_line', 0xf0d8cc, 0.5), { label: 'Lesser curvature' });
  tube(DG, 'greater_curvature', line(Math.PI, 1.012, 0.02, 0.99), 0.0005, M('curvature_line', 0xf0d8cc, 0.5), { label: 'Greater curvature' });
  tube(DG, 'angular_incisure', line(0, 1.02, 0.56, 0.64, 10), 0.0011, M('incisure', 0x8f3a30, 0.5), { label: 'Angular incisure (incisura angularis)' });
  tube(DG, 'cardiac_notch', [[0.06, 1.124, 0.0], [0.065, 1.118, 0.001], [0.07, 1.113, 0.003]], 0.0011, M('incisure', 0x8f3a30, 0.5), { label: 'Cardiac notch (incisura cardiaca)' });
  // vessels along the curvatures
  tube(DG, 'left_gastric_artery_curv', line(0, 1.1, 0.12, 0.6, 20), 0.002, dm.art, { label: 'Left gastric artery (lesser curvature)' });
  tube(DG, 'right_gastric_artery', line(0, 1.1, 0.6, 0.97, 16), 0.0018, dm.art, { label: 'Right gastric artery (lesser curvature)' });
  tube(DG, 'left_gastroepiploic_artery', line(Math.PI, 1.1, 0.2, 0.62, 20), 0.002, dm.art, { label: 'Left gastro-omental (gastroepiploic) artery' });
  tube(DG, 'right_gastroepiploic_artery', line(Math.PI, 1.1, 0.62, 0.98, 16), 0.002, dm.art, { label: 'Right gastro-omental (gastroepiploic) artery' });
  tube(DG, 'gastroepiploic_veins', line(Math.PI + 0.18, 1.1, 0.2, 0.98, 30), 0.0021, dm.vein, { label: 'Gastro-omental (gastroepiploic) veins' });
  for (let j = 0; j < 3; j++) tube(DG, 'short_gastric_artery_' + j, [[0.11, 1.096 - 0.012 * j, -0.03], SS(0.05 + 0.04 * j, Math.PI - 0.5, 1.25).toArray(), SS(0.05 + 0.04 * j, Math.PI - 0.5, 1.04).toArray()], 0.0011, dm.art, { label: 'Short gastric arteries' });
  // peritoneal ligaments
  const A = [], H = []; for (let i = 0; i < 7; i++) { A.push(SS(0.06 + 0.05 * i, Math.PI - 0.3, 1.03)); H.push(V(0.108, 1.106 - 0.011 * i, -0.028)); }
  sheet('gastrosplenic_ligament', A, H, dm.sheet, 'Gastrosplenic ligament (short gastric and left gastro-omental vessels)');
  const A2 = [], H2 = []; for (let i = 0; i < 9; i++) { const t = i / 8; A2.push(SS(0.14 + 0.83 * t, 0, 1.02)); H2.push(lerp3([0.03, 1.086, 0.022], [-0.032, 1.062, 0.03], t)); }
  A2.push(V(-0.03, 1.042, 0.04)); H2.push(V(-0.038, 1.064, 0.031));
  sheet('lesser_omentum', A2, H2, dm.sheet, 'Lesser omentum (hepatogastric and hepatoduodenal ligaments)');
  tube('circulatory', 'celiac_trunk', [[0.021, 1.12, -0.026], [0.026, 1.113, -0.02], [0.03, 1.108, -0.008]], 0.0035, mat.artery, { label: 'Celiac trunk' });
  tube('circulatory', 'left_gastric_artery', [[0.03, 1.108, -0.008], [0.05, 1.112, 0.0], SS(0.12, 0, 1.1).toArray()], 0.0026, mat.artery, { label: 'Left gastric artery' });
  tube('circulatory', 'splenic_artery', [[0.03, 1.108, -0.008], [0.05, 1.075, -0.03], [0.09, 1.082, -0.045], [0.123, 1.078, -0.04]], 0.0028, mat.artery, { label: 'Splenic artery' });
  tube('circulatory', 'common_hepatic_artery', [[0.03, 1.108, -0.008], [0.0, 1.075, 0.0], [-0.03, 1.062, 0.02], [-0.04, 1.062, 0.03]], 0.0028, mat.artery, { label: 'Hepatic artery' });
}

// ── liver, biliary tree, pancreas, spleen ──
sph(DG, 'liver_right_lobe', 0.075, [-0.07, 1.075, 0.025], dm.liver, { scale: [1.15, 0.62, 0.8], rot: [0, 0, 0.12], label: 'Liver' });
sph(DG, 'liver_left_lobe', 0.05, [0.02, 1.097, 0.045], dm.liver, { scale: [1.5, 0.5, 0.7], rot: [0, 0, -0.15], label: 'Liver' });
sph(DG, 'liver_caudate_lobe', 0.02, [-0.015, 1.07, -0.02], dm.liver, { label: 'Liver' });
sph(DG, 'gallbladder', 0.013, [-0.052, 1.028, 0.066], dm.gall, { scale: [0.8, 1.6, 0.8], rot: [0, 0, 0.2] });
const Dp = [[-0.012, 1.03, 0.047], [-0.03, 1.04, 0.036], [-0.046, 1.032, 0.016], [-0.052, 1.005, 0.002], [-0.05, 0.978, -0.004], [-0.03, 0.966, 0.004], [-0.005, 0.965, 0.005], [0.016, 0.969, 0.0], [0.03, 0.985, -0.008], [0.036, 1.004, -0.012]];
const Dc = new THREE.CatmullRomCurve3(Dp.map(p => V(...p))), Dl = Dc.getLength(), DCt = V(-0.03, 1.0, 0.01);
const papilla = (u, k, up = 0) => { const p = Dc.getPointAt(u), d = DCt.clone().sub(p).setY(0).normalize().add(V(0, up, -0.35)).normalize(); return p.addScaledVector(d, 0.0135 * k); };
const MAJ = papilla(0.34, 0.78), MIN = papilla(0.27, 0.8, 0.2).add(V(0, 0, 0.005));
tube(DG, 'cystic_duct', [[-0.05, 1.047, 0.06], [-0.047, 1.052, 0.05], [-0.044, 1.055, 0.04]], 0.0022, dm.bile, { label: 'Cystic duct' });
tube(DG, 'common_hepatic_duct', [[-0.038, 1.068, 0.03], [-0.041, 1.062, 0.035], [-0.044, 1.055, 0.04]], 0.0026, dm.bile, { label: 'Common hepatic duct' });
tube(DG, 'common_bile_duct', [[-0.044, 1.055, 0.04], [-0.04, 1.048, 0.022], [-0.04, 1.026, 0.006], MAJ.clone().add(V(0.004, 0.006, -0.004)).toArray(), MAJ.toArray()], 0.0028, dm.bile, { label: 'Common bile duct' });
varTube('pancreas', [[-0.028, 0.996, 0.002], [-0.026, 1.008, 0.0], [-0.012, 1.018, -0.012], [0.01, 1.03, -0.028], [0.05, 1.05, -0.04], [0.095, 1.07, -0.045]], u => 0.0135 * (1 - 0.45 * ss(0.2, 0.6, u)), dm.pancreas, { label: 'Pancreas (head, neck, body, tail)' });
varTube('uncinate_process', [[-0.03, 0.992, 0.0], [-0.02, 0.986, -0.004], [-0.008, 0.986, -0.008]], u => 0.0065 * (1 - 0.4 * u), dm.pancreas, { label: 'Uncinate process (pancreas)' });
const pdm = M('pancreatic_duct', 0xf3e3b8, 0.5);
tube(DG, 'pancreatic_duct', [[0.09, 1.068, -0.045], [0.05, 1.049, -0.04], [0.01, 1.029, -0.028], [-0.012, 1.016, -0.012], [-0.03, 1.004, -0.003], MAJ.toArray()], 0.0018, pdm, { label: 'Pancreatic duct (of Wirsung)' });
tube(DG, 'accessory_pancreatic_duct', [[-0.012, 1.016, -0.012], [-0.028, 1.018, 0.002], MIN.toArray()], 0.0011, pdm, { label: 'Accessory pancreatic duct (of Santorini)' });
sph(DG, 'spleen', 0.04, [0.123, 1.075, -0.04], dm.spleen, { scale: [0.45, 1, 0.65], rot: [0, 0, 0.2] });

// ── duodenum: C-loop around the pancreatic head ──
{
  const duoMt = PM('duodenum', 0xd18e82, 0.25, { sss: 0.35, ...TR(0.6) }), cuts = [0, 0.2, 0.48, 0.8, 1], rf = t => 0.0135 + 0.0025 * ga(t, 0.08, 0.08);
  [['duodenum_superior', 'Duodenum, superior part (bulb)'], ['duodenum_descending', 'Duodenum, descending part'], ['duodenum_horizontal', 'Duodenum, horizontal part'], ['duodenum_ascending', 'Duodenum, ascending part']].forEach(([n, l], i) => {
    const t0 = cuts[i], t1 = Math.min(1, cuts[i + 1] + 0.004), pts = []; for (let j = 0; j <= 8; j++) pts.push(Dc.getPointAt(t0 + ((t1 - t0) * j) / 8).toArray());
    varTube(n, pts, u => rf(t0 + (t1 - t0) * u), duoMt, { label: l }).renderOrder = 1; });
  varTube('duodenal_mucosa', Dp, (u, a) => rf(u) * 0.78 * (1 + ss(0.1, 0.16, u) * 0.15 * Math.abs(Math.sin(u * Dl / 0.005 * Math.PI))), PM('duodenal_mucosa', 0xdb6c62, 0.18, { cc: 0.85, sss: 0.45 }), { label: 'Duodenal mucosa (smooth bulb, plicae circulares beyond)' }, 24);
  const pap = PM('papilla', 0xf3c8b0, 0.3);
  sph(DG, 'major_duodenal_papilla', 0.0028, MAJ.toArray(), pap, { label: 'Major duodenal papilla (ampulla of Vater)' });
  sph(DG, 'papilla_hood_fold', 1, MAJ.clone().add(V(0, 0.0036, 0)).toArray(), pap, { scale: [0.0035, 0.001, 0.0028], label: 'Major duodenal papilla, hooding fold' });
  sph(DG, 'longitudinal_duodenal_fold', 1, MAJ.clone().add(V(0, -0.0055, 0)).toArray(), pap, { scale: [0.001, 0.0045, 0.0012], label: 'Major duodenal papilla, longitudinal fold' });
  sph(DG, 'minor_duodenal_papilla', 0.0017, MIN.toArray(), pap, { label: 'Minor duodenal papilla' });
  tube(DG, 'suspensory_muscle_of_duodenum', [[0.036, 1.008, -0.014], [0.03, 1.05, -0.024], [0.022, 1.09, -0.03], [0.018, 1.11, -0.032]], 0.0013, M('treitz', 0xb86a5c, 0.6), { label: 'Suspensory muscle of duodenum (ligament of Treitz)' });
}
tube('circulatory', 'superior_mesenteric_artery', [[0.012, 1.085, -0.026], [0.008, 1.03, -0.018], [0.005, 0.99, 0.0], [0.004, 0.965, 0.024], [0.002, 0.94, 0.032]], 0.004, mat.artery, { label: 'Superior mesenteric artery' });
tube('circulatory', 'superior_mesenteric_vein', [[-0.008, 0.94, 0.032], [-0.009, 0.965, 0.024], [-0.01, 0.99, 0.004], [-0.008, 1.0, -0.012]], 0.0048, mat.vein, { label: 'Superior mesenteric vein' });
tube('circulatory', 'splenic_vein', [[0.12, 1.07, -0.048], [0.09, 1.065, -0.05], [0.05, 1.045, -0.048], [0.01, 1.025, -0.036], [-0.008, 1.0, -0.012]], 0.0035, mat.vein, { label: 'Splenic vein' });
tube('circulatory', 'portal_vein', [[-0.008, 1.0, -0.012], [-0.02, 1.03, 0.0], [-0.032, 1.055, 0.025], [-0.04, 1.065, 0.032]], 0.0058, mat.vein, { label: 'Portal vein' });

// ── jejunum (upper left, wide, dense tall folds) and ileum (lower right, narrow, low folds, Peyer's patches) ──
const ICJ = V(-0.062, 0.903, 0.03);
{
  const J0 = V(0.036, 1.004, -0.012), gJ = t => V(0.045 + 0.042 * Math.sin(PI2 * 3.1 * t + 0.4), 0.946 + 0.024 * Math.sin(PI2 * 2.2 * t + 1.2), 0.03 + 0.022 * Math.sin(PI2 * 4.3 * t + 0.2));
  const gI = t => V(-0.022 + 0.045 * Math.sin(PI2 * 3.4 * t + 1.0), 0.905 + 0.03 * Math.sin(PI2 * 2.6 * t + 0.3) - 0.01 * t, 0.03 + 0.024 * Math.sin(PI2 * 5.1 * t + 0.9));
  const PJ = []; for (let k = 0; k <= 110; k++) { const t = k / 110; PJ.push(J0.clone().lerp(gJ(t), ss(0, 0.07, t))); }
  const JE = PJ[PJ.length - 1], PI_ = []; for (let k = 0; k <= 150; k++) { const t = (k / 150) * 0.92; PI_.push(JE.clone().lerp(gI(t), ss(0, 0.09, t))); }
  PI_.push(V(-0.045, 0.9, 0.03), ICJ.clone());
  const mk = (nm, label, P, r0, r1, wallMt, mucMt, k, sp) => { const c = new THREE.CatmullRomCurve3(P), Ln = c.getLength(), rf = u => r0 + (r1 - r0) * u;
    varTube(nm + '_wall', P, rf, wallMt, { label }).renderOrder = 1;
    varTube(nm + '_mucosa', P, (u, a) => rf(u) * 0.76 * (1 + k(u) * Math.abs(Math.sin(u * Ln / sp * Math.PI))), mucMt, { label: label + ' mucosa (plicae circulares)' }, 20); return c; };
  const cj = mk('jejunum', 'Jejunum', PJ, 0.0118, 0.0106, PM('jejunum', 0xc95a54, 0.22, { sss: 0.4, ...TR(0.6) }), PM('jejunal_mucosa', 0xc74640, 0.15, { cc: 0.9, sss: 0.45 }), () => 0.24, 0.0055);
  const ci = mk('ileum', 'Ileum', PI_, 0.0095, 0.0082, PM('ileum', 0xd88a82, 0.26, { sss: 0.3, ...TR(0.6) }), PM('ileal_mucosa', 0xe07b75, 0.17, { cc: 0.85, sss: 0.35 }), u => 0.09 * (1 - ss(0.5, 0.9, u)), 0.009);
  const fr = ci.computeFrenetFrames(160, false), pm = PM('peyers_patch', 0xe9d7a8, 0.5, { cc: 0.3 });
  for (let i = 0; i < 8; i++) { const j = Math.round(160 * (0.6 + i * 0.045)), u = j / 160, p = ci.getPointAt(u), N2 = fr.normals[j], T2 = fr.tangents[j], B2 = fr.binormals[j], r = 0.0095 - 0.0013 * u;
    basisMesh('peyers_patch_' + i, new THREE.SphereGeometry(1, 16, 10).scale(0.0035, 0.0011, 0.011), pm, p.clone().addScaledVector(N2, -r * 0.9), B2, N2, T2, "Peyer's patch (aggregated lymphoid follicles)"); }
  const ivm = PM('ileocecal_valve', 0xc97b6e, 0.3);
  [['superior', 0.0021], ['inferior', -0.0021]].forEach(([n, dy]) => sph(DG, 'ileocecal_valve_' + n, 1, ICJ.clone().add(V(-0.004, dy, 0)).toArray(), ivm, { scale: [0.0024, 0.0017, 0.0072], label: 'Ileocecal valve (' + n + ' lip)' }));
  tube(DG, 'root_of_mesentery', [[0.034, 1.0, -0.016], [0.0, 0.96, -0.012], [-0.035, 0.93, -0.012], [-0.062, 0.9, -0.012]], 0.0028, PM('mesentery_root', 0xe8d9b5, 0.5, TR(0.6)), { label: 'Root of mesentery' });
  const JT = V(0.004, 0.958, 0.028), AR = PM('mesenteric_arcade', 0xb3322b, 0.4, { cc: 0.3 }), fat = PM('mesenteric_fat', 0xe2c478, 0.45, { cc: 0.3, sss: 0.2, sc: 0xa07020 });
  const aJ = []; for (let i = 0; i < 9; i++) { const g = cj.getPointAt(0.06 + 0.11 * i), a = JT.clone().lerp(g, 0.72); aJ.push(a);
    vtube('jejunal_artery_' + i, [JT, JT.clone().lerp(a, 0.5), a], 0.0011, AR, 'Jejunal arteries (simple arcades, long vasa recta)');
    vtube('jejunal_vasa_recta_' + i, [a, a.clone().lerp(g, 0.5), g], 0.00055, AR, 'Jejunal arteries (simple arcades, long vasa recta)'); }
  for (let i = 0; i < 8; i++) vtube('jejunal_arcade_' + i, [aJ[i], aJ[i].clone().lerp(aJ[i + 1], 0.5).add(V(0, 0.004, 0)), aJ[i + 1]], 0.0007, AR, 'Jejunal arteries (simple arcades, long vasa recta)');
  const IC = new THREE.CatmullRomCurve3([[0.002, 0.94, 0.032], [-0.02, 0.925, 0.032], [-0.045, 0.91, 0.03], [-0.06, 0.903, 0.026]].map(p => V(...p)));
  vtube('ileocolic_artery', IC.getPoints(12), 0.0026, mat.artery, 'Ileocolic artery', 'circulatory');
  const a1 = [], a2 = []; for (let i = 0; i < 11; i++) { const g = ci.getPointAt(0.05 + 0.088 * i), T = IC.getPointAt(i / 10), p1 = T.clone().lerp(g, 0.5), p2 = T.clone().lerp(g, 0.8); a1.push(p1); a2.push(p2);
    vtube('ileal_artery_' + i, [T, p1, p2], 0.0009, AR, 'Ileal arteries (multi-tier arcades, short vasa recta)');
    vtube('ileal_vasa_recta_' + i, [p2, g], 0.0005, AR, 'Ileal arteries (multi-tier arcades, short vasa recta)');
    for (let f = 0; f < 3; f++) sph(DG, 'mesenteric_fat_' + i + '_' + f, 0.0034 - 0.0006 * f, p2.clone().lerp(g, 0.35 + 0.22 * f).add(V(0.002 * (f - 1), 0.0015 * f, 0)).toArray(), fat, { label: 'Mesenteric fat (ileum)' }); }
  for (let i = 0; i < 10; i++) { vtube('ileal_arcade1_' + i, [a1[i], a1[i].clone().lerp(a1[i + 1], 0.5), a1[i + 1]], 0.0006, AR, 'Ileal arteries (multi-tier arcades, short vasa recta)');
    vtube('ileal_arcade2_' + i, [a2[i], a2[i].clone().lerp(a2[i + 1], 0.5), a2[i + 1]], 0.0005, AR, 'Ileal arteries (multi-tier arcades, short vasa recta)'); }
}

// ── large intestine: haustra, three taeniae coli, omental appendices; caliber narrows from cecum to sigmoid ──
const CE = V(-0.086, 0.893, 0.03), APXB = V(-0.074, 0.876, 0.012);
sph(DG, 'cecum', 0.026, CE.toArray(), dm.colon, { scale: [1, 0.95, 0.92], label: 'Cecum' });
varTube('appendix', [APXB, V(-0.084, 0.868, 0.0), V(-0.096, 0.872, -0.008), V(-0.104, 0.89, -0.01), V(-0.106, 0.912, -0.006), V(-0.1, 0.93, -0.002)], u => 0.0034 * (1 - 0.25 * ss(0.85, 1, u)), dm.colon, { label: 'Vermiform appendix (retrocecal position)' });
tube('circulatory', 'appendicular_artery', [[-0.058, 0.902, 0.024], [-0.075, 0.885, 0.006], [-0.098, 0.885, -0.008]], 0.0012, mat.artery, { label: 'Appendicular artery' });
const TN = ['Taenia mesocolica', 'Taenia omentalis', 'Taenia libera'], TA = [0, PI2 / 3, (2 * PI2) / 3];
function colonS(name, pts, r0, r1, label, every) {
  const c = new THREE.CatmullRomCurve3(pts.map(p => V(...p))), L = c.getLength(), NU = Math.max(40, Math.round(L / 0.0015)), fr = c.computeFrenetFrames(NU, false), R = u => r0 + (r1 - r0) * u;
  const tw = th => { let m = 0; for (const a of TA) { const d = Math.atan2(Math.sin(th - a), Math.cos(th - a)); m = Math.max(m, Math.exp(-((d / 0.3) ** 2))); } return m; };
  const hs = u => Math.pow(Math.abs(Math.sin((Math.PI * u * L) / 0.016)), 0.6);
  const P = (i, th, k) => { const u = i / NU, r = R(u) * k; return c.getPointAt(u).addScaledVector(fr.normals[i], Math.cos(th) * r).addScaledVector(fr.binormals[i], Math.sin(th) * r); };
  gridSurf(name, NU, 40, (a, b) => { const i = Math.round(a * NU), th = b * PI2; return P(i, th, 0.88 + 0.26 * hs(i / NU) * (1 - tw(th))); }, dm.colon, label);
  TA.forEach((a, k) => { const q = []; for (let i = 0; i <= NU; i += 3) q.push(P(i, a, 0.9).toArray()); tube(DG, name + '_taenia_' + k, q, 0.0019, dm.taenia, { label: TN[k] + ' (' + label.toLowerCase() + ')' }); });
  const n = Math.round(L / every); for (let j = 0; j < n; j++) { const i = Math.round(((j + 0.5) / n) * NU), a = TA[1 + (j % 2)] + (j % 3 - 1) * 0.25, p = P(i, a, 1.0), d = p.clone().sub(c.getPointAt(i / NU)).normalize();
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.0026, 12, 8), dm.fat); m.scale.set(1, 1.9, 1); orientUp(m, p.addScaledVector(d, 0.0035), d); reg(DG, name + '_omental_appendix_' + j, m, { label: 'Omental appendices (appendices epiploicae)' }); }
  return { c, P, NU };
}
function orientUp(m, p, d) { m.position.copy(p); m.quaternion.setFromUnitVectors(Y, d); }
const asc = colonS('ascending_colon', [[-0.09, 0.905, 0.028], [-0.096, 0.94, 0.024], [-0.1, 0.975, 0.02], [-0.1, 1.0, 0.022], [-0.098, 1.012, 0.028]], 0.02, 0.019, 'Ascending colon', 0.03);
colonS('transverse_colon', [[-0.098, 1.012, 0.028], [-0.085, 1.01, 0.05], [-0.06, 0.985, 0.068], [-0.03, 0.962, 0.078], [0.005, 0.955, 0.082], [0.04, 0.964, 0.078], [0.07, 0.985, 0.064], [0.095, 1.012, 0.04], [0.112, 1.03, 0.005], [0.118, 1.042, -0.018]], 0.019, 0.017, 'Transverse colon', 0.016);
colonS('descending_colon', [[0.118, 1.042, -0.018], [0.122, 1.0, -0.024], [0.12, 0.95, -0.016], [0.112, 0.91, -0.004], [0.096, 0.888, 0.01]], 0.016, 0.015, 'Descending colon', 0.026);
colonS('sigmoid_colon', [[0.096, 0.888, 0.01], [0.072, 0.892, 0.034], [0.042, 0.9, 0.042], [0.018, 0.888, 0.024], [0.006, 0.896, -0.008], [0, 0.905, -0.03]], 0.014, 0.0135, 'Sigmoid colon', 0.013);
TA.forEach((a, k) => { const s0 = asc.P(0, a, 0.9), mid = s0.clone().add(APXB).multiplyScalar(0.5), d = mid.clone().sub(CE).normalize(); tube(DG, 'cecal_taenia_' + k, [s0.toArray(), CE.clone().addScaledVector(d, 0.0262).toArray(), APXB.toArray()], 0.0018, dm.taenia, { label: TN[k] + ' (cecum, converging on the appendix)' }); });
tube(DG, 'phrenicocolic_ligament', [[0.12, 1.048, -0.02], [0.128, 1.065, -0.022], [0.134, 1.082, -0.022]], 0.0016, dm.sheet, { label: 'Phrenicocolic ligament' });
tube('circulatory', 'middle_colic_artery', [[0.005, 0.99, 0.002], [0.004, 0.975, 0.04], [0.005, 0.96, 0.064]], 0.0018, mat.artery, { label: 'Middle colic artery' });
tube('circulatory', 'right_colic_artery', [[0.003, 0.95, 0.03], [-0.04, 0.955, 0.03], [-0.08, 0.96, 0.024]], 0.0017, mat.artery, { label: 'Right colic artery' });
tube('circulatory', 'inferior_mesenteric_artery', [[0.004, 0.945, -0.02], [0.02, 0.93, -0.012], [0.03, 0.915, -0.01]], 0.0025, mat.artery, { label: 'Inferior mesenteric artery' });
tube('circulatory', 'left_colic_artery', [[0.03, 0.915, -0.01], [0.07, 0.94, -0.016], [0.105, 0.97, -0.018]], 0.0016, mat.artery, { label: 'Left colic artery' });
tube('circulatory', 'sigmoid_arteries', [[0.03, 0.915, -0.01], [0.045, 0.9, 0.02], [0.045, 0.896, 0.03]], 0.0014, mat.artery, { label: 'Sigmoid arteries' });
tube('circulatory', 'superior_rectal_artery', [[0.03, 0.915, -0.01], [0.012, 0.905, -0.035], [0.004, 0.88, -0.05]], 0.0016, mat.artery, { label: 'Superior rectal artery' });

// ── rectum (sacral and perineal flexures, lateral curves, valves of Houston) and anal canal ──
{
  const RP = [[0, 0.905, -0.03], [-0.006, 0.89, -0.04], [0.007, 0.87, -0.045], [-0.004, 0.85, -0.041], [0, 0.835, -0.034], [0, 0.822, -0.028]].map(p => V(...p));
  const rc = new THREE.CatmullRomCurve3(RP), Rr = u => 0.013 + 0.008 * ga(u, 0.66, 0.2) - 0.003 * ss(0.85, 1, u);
  varTube('rectum', RP, Rr, PM('rectal_wall', 0x9e5a54, 0.6, { cc: 0.1, ...TR(0.5) }), { label: 'Rectum (ampulla below)' }).renderOrder = 1;
  varTube('rectal_mucosa', RP, u => Rr(u) * 0.86, PM('rectal_mucosa', 0xd66b63, 0.14, { cc: 0.9, sss: 0.35 }), { label: 'Rectal mucosa' });
  [[0.3, 1, 'upper'], [0.5, -1, 'middle'], [0.72, 1, 'lower']].forEach(([u, sd, n]) => { const p = rc.getPointAt(u), T = rc.getTangentAt(u), side = V(sd, 0, 0).addScaledVector(T, -T.x * sd).normalize(), Xb = new THREE.Vector3().crossVectors(side, T).normalize(), r = Rr(u) * 0.84;
    basisMesh('transverse_rectal_fold_' + n, new THREE.CircleGeometry(r * (n === 'middle' ? 0.85 : 0.72), 20, 0, Math.PI), PM('houston_valve', 0xc85a54, 0.2, { side: THREE.DoubleSide }), p.clone().addScaledVector(side, r * 0.25), Xb, side, T, 'Transverse rectal fold (valve of Houston, ' + n + ')'); });
  const AP = [[0, 0.822, -0.028], [0, 0.806, -0.036], [0, 0.79, -0.046]].map(p => V(...p)), ac = new THREE.CatmullRomCurve3(AP), afr = ac.computeFrenetFrames(40, false), AR0 = 0.0095;
  const aP = (u, th, k) => { const i = Math.round(u * 40); return ac.getPointAt(u).addScaledVector(afr.normals[i], Math.cos(th) * AR0 * k).addScaledVector(afr.binormals[i], Math.sin(th) * AR0 * k); };
  varTube('anal_canal', AP, () => AR0, PM('anal_canal_wall', 0x9e5a54, 0.6, { cc: 0.1, ...TR(0.55) }), { label: 'Anal canal' }).renderOrder = 1;
  const colM = PM('anal_column', 0xb85c66, 0.15, { cc: 0.8 });
  for (let k = 0; k < 8; k++) { const th = (k / 8) * PI2, q = []; for (let i = 0; i <= 8; i++) q.push(aP(0.02 + (0.46 * i) / 8, th, 0.74).toArray()); tube(DG, 'anal_column_' + k, q, 0.0011, colM, { label: 'Anal columns (of Morgagni)' }); }
  { const q = []; for (let k = 0; k < 16; k++) q.push(aP(0.5 + (k % 2 ? 0.035 : -0.0), (k / 16) * PI2, 0.8)); ring('pectinate_line', q, 0.0005, M('pectinate_line', 0xf0e2d6, 0.4), 'Pectinate (dentate) line with anal valves and crypts'); }
  varTube('anal_pecten', [aP(0.53, 0, 0), aP(0.66, 0, 0), aP(0.8, 0, 0)], () => AR0 * 0.78, PM('anal_pecten', 0xc98a92, 0.2, { cc: 0.6 }), { label: 'Anal pecten (smooth zone below the pectinate line)' });
  { const q = []; for (let k = 0; k < 24; k++) q.push(aP(0.82, (k / 24) * PI2, 0.8)); ring('anocutaneous_line', q, 0.00045, M('white_line', 0xede4dc, 0.4), "Anocutaneous line (Hilton's white line)"); }
  const vg = new THREE.Mesh(new THREE.TorusGeometry(0.0105, 0.0038, 10, 28), PM('perianal_skin', 0xa8685c, 0.45, { cc: 0.2, sss: 0.2 })); vg.position.copy(ac.getPointAt(1)); vg.quaternion.setFromUnitVectors(V(0, 0, 1), ac.getTangentAt(1)); reg(DG, 'anal_verge', vg, { label: 'Anal verge and perianal skin' });
  const iasP = []; for (let i = 0; i <= 6; i++) iasP.push(ac.getPointAt((0.66 * i) / 6));
  varTube('internal_anal_sphincter', iasP, () => AR0 * 1.18, PM('internal_anal_sphincter', 0xc0675a, 0.4, TR(0.7)), { label: 'Internal anal sphincter (involuntary)' }).renderOrder = 2;
  [['deep', 0.35, 0.0135], ['superficial', 0.65, 0.013], ['subcutaneous', 0.97, 0.0122]].forEach(([n, u, r]) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.0027, 10, 28), PM('external_anal_sphincter', 0xa5473b, 0.5, { cc: 0.2 })); m.position.copy(ac.getPointAt(u)); m.quaternion.setFromUnitVectors(V(0, 0, 1), ac.getTangentAt(u)); reg(DG, 'external_anal_sphincter_' + n, m, { label: 'External anal sphincter, ' + n + ' part (voluntary)' }); });
  tube(DG, 'puborectalis', [[0.01, 0.82, 0.066], [0.017, 0.818, 0.02], [0.014, 0.818, -0.036], [0, 0.818, -0.044], [-0.014, 0.818, -0.036], [-0.017, 0.818, 0.02], [-0.01, 0.82, 0.066]], 0.0028, PM('puborectalis', 0xa5473b, 0.5, { cc: 0.2 }), { label: 'Puborectalis (levator ani sling at the perineal flexure)' });
}
// greater omentum: apron hanging from the greater curvature over the transverse colon and small intestine
{
  const top = a => a < 0.75 ? SS(0.25 + 0.73 * (a / 0.75), Math.PI, 1.03) : SS(0.98, Math.PI, 1.03).lerp(V(-0.1, 1.0, 0.045), (a - 0.75) / 0.25);
  gridSurf('greater_omentum', 30, 12, (a, v) => { const t = top(a), bz = 0.105 - 0.025 * (t.x / 0.1) ** 2; return V(t.x, t.y + (0.875 - t.y) * v, t.z + (bz - t.z) * v + 0.028 * Math.sin(Math.PI * v)); }, dm.omentum, 'Greater omentum (gastrocolic ligament)', 1);
}
}
const __nextMcount = () => ++mcount;
export { stage, THREE, V, model, SYS, G, M, mat, reg, xf, sph, box, Y, seg, tube, SK, zc, skPt, MS, mm, belly, SU, DP, __nextMcount };
