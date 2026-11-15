// Traditional Chinese (繁體中文) labels for the embedded model. Every structure name, group heading, system and layer has a Chinese name.
// The Cell Atlas page sets the language (en, zh-Hant or both) and sends {type:'lang', lang} when it changes. English shows English only, both shows the Chinese name after it, zh-Hant shows Chinese only.
// Add or fix a term by editing the TERMS list below: one "English name|中文名" per line. Names that are not listed are built from their parts,
// so "Biceps brachii, long head (left)" becomes 左肱二頭肌，長頭. A name with no match shows in English only.
(function () {
  const TERMS = `
Head|頭部
Torso|軀幹
Arms and hands|上肢及手
Legs and feet|下肢及足
Genitals|外生殖器
Subcutaneous fat|皮下脂肪
Skull|顱骨
Frontal bone|額骨
Parietal bone|頂骨
Occipital bone|枕骨
Temporal bone|顳骨
Sphenoid bone|蝶骨
Zygomatic bone|顴骨
Zygomatic arch|顴弓
Maxilla|上頜骨
Nasal bone|鼻骨
Inferior nasal concha|下鼻甲
Vomer|犁骨
Hard palate|硬顎
Pterygoid process|翼突
Mandible|下頜骨
Teeth|牙齒
Hyoid|舌骨
Sutures and landmarks|骨縫及標誌
Coronal suture|冠狀縫
Sagittal suture|矢狀縫
Lambdoid suture|人字縫
Squamous suture|鱗縫
Bregma|前囟點
Lambda|人字點
Pterion|翼點
Asterion|星點
Glabella|眉間
Superciliary arch|眉弓
Orbit|眼眶
External occipital protuberance|枕外隆凸
Superior nuchal line|上項線
Inferior nuchal line|下項線
Mastoid process|乳突
Skull base|顱底
Foramen magnum|枕骨大孔
Occipital condyle|枕髁
Pharyngeal tubercle|咽結節
Hypoglossal canal|舌下神經管
Jugular foramen|頸靜脈孔
Carotid canal|頸動脈管
Foramen lacerum|破裂孔
Foramen ovale|卵圓孔
Foramen spinosum|棘孔
Stylomastoid foramen|莖乳孔
Styloid process|莖突
Mandibular fossa|下頜窩
Articular tubercle|關節結節
Choana|後鼻孔
Incisive fossa|切牙窩
Greater palatine foramen|腭大孔
Axial skeleton|中軸骨骼
Vertebrae C1–L5|椎骨 C1–L5
Intervertebral discs|椎間盤
Sacrum and coccyx|骶骨及尾骨
Ribs 1–12|肋骨 1–12
Costal cartilage|肋軟骨
Sternum|胸骨
Shoulder and upper limb|肩及上肢
Clavicle|鎖骨
Scapula|肩胛骨
Glenoid cavity|關節盂
Superior transverse ligament of scapula|肩胛上橫韌帶
Inferior transverse ligament of scapula|肩胛下橫韌帶
Acromioclavicular joint|肩鎖關節
Humerus|肱骨
Radius and ulna|橈骨及尺骨
Scaphoid|舟骨
Lunate|月骨
Triquetrum|三角骨
Pisiform|豆狀骨
Trapezium|大多角骨
Trapezoid|小多角骨
Capitate|頭狀骨
Hamate|鈎骨
Metacarpal|掌骨
Finger phalanx|指骨
Pelvis and lower limb|骨盆及下肢
Pelvis|骨盆
Femur|股骨
Patella|髕骨
Tibia and fibula|脛骨及腓骨
Talus|距骨
Calcaneus|跟骨
Navicular|足舟骨
Medial cuneiform|內側楔骨
Intermediate cuneiform|中間楔骨
Lateral cuneiform|外側楔骨
Cuboid|骰骨
Metatarsal|蹠骨
Toe phalanx|趾骨
Sesamoid bones|籽骨
Joint ligaments and menisci|關節韌帶及半月板
Medial collateral ligament|內側副韌帶
Lateral collateral ligament|外側副韌帶
Anterior cruciate ligament|前十字韌帶
Posterior cruciate ligament|後十字韌帶
Medial meniscus|內側半月板
Lateral meniscus|外側半月板
Anterior longitudinal ligament|前縱韌帶
Posterior longitudinal ligament|後縱韌帶
Ligamentum flavum|黃韌帶
Glenoid labrum|盂唇
Superior glenohumeral ligament|盂肱上韌帶
Middle glenohumeral ligament|盂肱中韌帶
Inferior glenohumeral ligament|盂肱下韌帶
Iliofemoral ligament, lateral band|髂股韌帶外側束
Iliofemoral ligament, medial band|髂股韌帶內側束
Head and face|頭面部
Orbicularis oculi|眼輪匝肌
Orbicularis oris|口輪匝肌
Zygomaticus major|顴大肌
Depressor anguli oris|降口角肌
Buccinator|頰肌
Procerus|降眉間肌
Masseter|咬肌
Temporalis|顳肌
Lateral pterygoid|翼外肌
Medial pterygoid|翼內肌
Superior rectus|上直肌
Inferior rectus|下直肌
Medial rectus|內直肌
Lateral rectus|外直肌
Superior oblique|上斜肌
Inferior oblique|下斜肌
Levator palpebrae superioris|提上瞼肌
Floor of mouth, tongue and pharynx|口底、舌及咽
Digastric|二腹肌
Stylohyoid|莖突舌骨肌
Mylohyoid|下頜舌骨肌
Geniohyoid|頦舌骨肌
Genioglossus|頦舌肌
Hyoglossus|舌骨舌肌
Styloglossus|莖突舌肌
Levator veli palatini|提腭帆肌
Tensor veli palatini|張腭帆肌
Palatoglossus|腭舌肌
Palatopharyngeus|腭咽肌
Salpingopharyngeus|咽鼓管咽肌
Musculus uvulae|腭垂肌
Pterygomandibular raphe|翼下頜縫
Superior longitudinal muscle of the tongue|舌上縱肌
Transverse muscle of the tongue|舌橫肌
Vertical muscle of the tongue|舌垂直肌
Inferior longitudinal muscle of the tongue|舌下縱肌
Superior pharyngeal constrictor|咽上縮肌
Middle pharyngeal constrictor|咽中縮肌
Inferior pharyngeal constrictor|咽下縮肌
Larynx|喉
Cricothyroid|環甲肌
Posterior cricoarytenoid|環杓後肌
Lateral cricoarytenoid|環杓側肌
Thyroarytenoid|甲杓肌
Vocalis|聲帶肌
Transverse arytenoid|杓橫肌
Oblique arytenoid|杓斜肌
Neck, trunk and shoulder|頸、軀幹及肩
Platysma|頸闊肌
Thyrohyoid|甲狀舌骨肌
Sternothyroid|胸骨甲狀肌
Splenius capitis|頭夾肌
Splenius cervicis|頸夾肌
Nuchal ligament|項韌帶
Semispinalis capitis|頭半棘肌
Rectus capitis posterior major|頭後大直肌
Obliquus capitis inferior|頭下斜肌
Rectus capitis anterior|頭前直肌
Rectus capitis lateralis|頭外側直肌
Longus capitis|頭長肌
Longus colli|頸長肌
Scalenus anterior|前斜角肌
Scalenus medius|中斜角肌
Scalenus posterior|後斜角肌
Sternocleidomastoid|胸鎖乳突肌
Sternohyoid|胸骨舌骨肌
Omohyoid|肩胛舌骨肌
Levator scapulae|肩胛提肌
Trapezius|斜方肌
Rhomboid minor|小菱形肌
Rhomboid major|大菱形肌
Pectoralis major|胸大肌
Pectoralis minor|胸小肌
Subclavius|鎖骨下肌
Serratus anterior|前鋸肌
External intercostal|肋間外肌
Internal intercostal|肋間內肌
Latissimus dorsi|背闊肌
Teres major|大圓肌
Teres minor|小圓肌
Supraspinatus|棘上肌
Infraspinatus|棘下肌
Subscapularis|肩胛下肌
Erector spinae|豎脊肌
Rectus abdominis|腹直肌
External oblique|腹外斜肌
External oblique, aponeurosis|腹外斜肌腱膜
Internal oblique|腹內斜肌
Transversus abdominis|腹橫肌
Inguinal ligament|腹股溝韌帶
Thoracolumbar fascia|胸腰筋膜
Arm|上臂
Deltoid|三角肌
Coracobrachialis|喙肱肌
Biceps brachii|肱二頭肌
Biceps brachii, tendon|肱二頭肌腱
Bicipital aponeurosis|肱二頭肌腱膜
Brachialis|肱肌
Triceps brachii|肱三頭肌
Triceps brachii, tendon|肱三頭肌腱
Forearm and hand|前臂及手
Brachioradialis|肱橈肌
Pronator teres|旋前圓肌
Flexor carpi radialis|橈側腕屈肌
Palmaris longus|掌長肌
Flexor carpi ulnaris|尺側腕屈肌
Flexor digitorum superficialis|指淺屈肌
Flexor digitorum profundus|指深屈肌
Flexor pollicis longus|拇長屈肌
Abductor pollicis longus|拇長展肌
Extensor carpi radialis longus|橈側腕長伸肌
Extensor carpi radialis brevis|橈側腕短伸肌
Extensor digitorum (forearm)|指伸肌（前臂）
Flexor retinaculum|屈肌支持帶
Palmar aponeurosis|掌腱膜
Thenar muscles|大魚際肌
Supinator|旋後肌
Pronator quadratus|旋前方肌
Hip and thigh|髖及大腿
Gluteus maximus|臀大肌
Gluteus medius|臀中肌
Gluteus minimus|臀小肌
Piriformis|梨狀肌
Obturator internus|閉孔內肌
Gemellus superior|上孖肌
Gemellus inferior|下孖肌
Quadratus femoris|股方肌
Tensor fasciae latae|闊筋膜張肌
Iliotibial tract|髂脛束
Rectus femoris|股直肌
Vastus lateralis|股外側肌
Vastus medialis|股內側肌
Vastus intermedius|股中間肌
Quadriceps tendon|股四頭肌腱
Patellar ligament|髕韌帶
Sartorius|縫匠肌
Gracilis|股薄肌
Pectineus|恥骨肌
Adductor longus|長收肌
Adductor brevis|短收肌
Adductor magnus|大收肌
Biceps femoris, long head|股二頭肌長頭
Biceps femoris, short head|股二頭肌短頭
Semitendinosus|半腱肌
Semimembranosus|半膜肌
Pes anserinus|鵝足
Leg and foot|小腿及足
Gastrocnemius|腓腸肌
Soleus|比目魚肌
Plantaris|蹠肌
Calcaneal (Achilles) tendon|跟腱（阿基里斯腱）
Tibialis anterior|脛骨前肌
Extensor digitorum longus|趾長伸肌
Extensor hallucis longus|拇長伸肌
Fibularis longus|腓骨長肌
Fibularis brevis|腓骨短肌
Fibularis tertius|第三腓骨肌
Extensor digitorum brevis|趾短伸肌
Popliteus|膕肌
Tibialis posterior|脛骨後肌
Flexor digitorum longus|趾長屈肌
Flexor hallucis longus|拇長屈肌（足）
Deep fasciae|深筋膜
Fascia lata (thigh)|闊筋膜（大腿）
Crural fascia (leg)|小腿筋膜
Brachial fascia (arm)|臂筋膜（上臂）
Antebrachial fascia (forearm)|前臂筋膜
Deep cervical fascia (investing layer)|頸深筋膜（淺層）
Pretracheal fascia|氣管前筋膜
Prevertebral fascia|椎前筋膜
Carotid sheath|頸動脈鞘
Transversalis fascia|腹橫筋膜
Rectus sheath, anterior lamina|腹直肌鞘前層
Rectus sheath, posterior lamina|腹直肌鞘後層
Posterior abdominal wall, back and pelvic floor|腹後壁、背部及盆底
Psoas major|腰大肌
Iliacus|髂肌
Quadratus lumborum|腰方肌
Multifidus|多裂肌
Transversus thoracis|胸橫肌
Pubococcygeus|恥骨尾骨肌
Iliococcygeus|髂骨尾骨肌
Head and neck vessels|頭頸部血管
Superior thyroid artery|甲狀腺上動脈
Superior laryngeal artery|喉上動脈
Lingual artery|舌動脈
Facial artery|面動脈
Occipital artery|枕動脈
Posterior auricular artery|耳後動脈
Superficial temporal artery|顳淺動脈
Maxillary artery|上頜動脈
Middle meningeal artery|腦膜中動脈
Deep temporal arteries|顳深動脈
Masseteric artery|咬肌動脈
Buccal artery|頰動脈
Inferior alveolar artery|下牙槽動脈
Posterior superior alveolar artery|上牙槽後動脈
Infraorbital artery|眶下動脈
Sphenopalatine artery|蝶腭動脈
Facial vein|面靜脈
Angular vein|內眥靜脈
Supraorbital vein|眶上靜脈
Supratrochlear vein|滑車上靜脈
Superior ophthalmic vein|眼上靜脈
Inferior ophthalmic vein|眼下靜脈
Cavernous sinus|海綿竇
Deep facial vein|面深靜脈
Pterygoid plexus|翼靜脈叢
Maxillary vein|上頜靜脈
Superficial temporal vein|顳淺靜脈
Retromandibular vein|下頜後靜脈
External jugular vein|頸外靜脈
Common facial vein|面總靜脈
Lingual vein|舌靜脈
Inferior alveolar vein|下牙槽靜脈
Superior thyroid vein|甲狀腺上靜脈
Middle thyroid vein|甲狀腺中靜脈
Inferior thyroid vein|甲狀腺下靜脈
Heart|心臟
Fibrous pericardium|纖維心包
Epicardial fat|心外膜脂肪
Myocardium|心肌
Right atrium|右心房
Right auricle|右心耳
Right ventricle|右心室
Left atrium|左心房
Left auricle|左心耳
Left ventricle|左心室
Interatrial septum|房間隔
Interventricular septum|室間隔
Fossa ovalis|卵圓窩
Crista terminalis|界嵴
Musculi pectinati|梳狀肌
Trabeculae carneae|肉柱
Papillary muscle|乳頭肌
Chordae tendineae|腱索
Tricuspid valve|三尖瓣
Mitral valve|二尖瓣
Aortic valve|主動脈瓣
Pulmonary valve|肺動脈瓣
Conus arteriosus|動脈圓錐
Aortic vestibule|主動脈前庭
Coronary sinus|冠狀竇
Coronary vessels|冠狀血管
Right coronary artery|右冠狀動脈
Left coronary artery|左冠狀動脈
Left anterior descending artery|左前降支
Circumflex artery|迴旋支
Great cardiac vein|心大靜脈
Middle cardiac vein|心中靜脈
Great vessels|大血管
Ascending aorta|升主動脈
Aortic arch|主動脈弓
Descending thoracic aorta|胸降主動脈
Abdominal aorta|腹主動脈
Brachiocephalic trunk|頭臂幹
Pulmonary trunk|肺動脈幹
Pulmonary artery|肺動脈
Ligamentum arteriosum|動脈韌帶
Superior pulmonary vein|上肺靜脈
Inferior pulmonary vein|下肺靜脈
Superior vena cava|上腔靜脈
Inferior vena cava|下腔靜脈
Left brachiocephalic vein|左頭臂靜脈
Right brachiocephalic vein|右頭臂靜脈
Head, neck and limbs|頭、頸及四肢
Common carotid artery|頸總動脈
Internal carotid artery|頸內動脈
External carotid artery|頸外動脈
Ascending pharyngeal artery|咽升動脈
Carotid sinus|頸動脈竇
Carotid body|頸動脈體
Vertebral artery|椎動脈
Subclavian artery|鎖骨下動脈
Subclavian vein|鎖骨下靜脈
Internal jugular vein|頸內靜脈
Upper limb arteries|上肢動脈
Thyrocervical trunk|甲狀頸幹
Inferior thyroid artery|甲狀腺下動脈
Suprascapular artery|肩胛上動脈
Transverse cervical artery|頸橫動脈
Dorsal scapular artery|肩胛背動脈
Axillary artery|腋動脈
Superior thoracic artery|胸上動脈
Thoracoacromial artery|胸肩峰動脈
Acromial branch|肩峰支
Deltoid branch|三角肌支
Pectoral branches|胸肌支
Lateral thoracic artery|胸外側動脈
Subscapular artery|肩胛下動脈
Circumflex scapular artery|旋肩胛動脈
Thoracodorsal artery|胸背動脈
Anterior circumflex humeral artery|旋肱前動脈
Posterior circumflex humeral artery|旋肱後動脈
Brachial artery|肱動脈
Deep artery of arm|肱深動脈
Radial collateral artery|橈側副動脈
Middle collateral artery|中副動脈
Superior ulnar collateral artery|尺側上副動脈
Inferior ulnar collateral artery|尺側下副動脈
Radial recurrent artery|橈側返動脈
Ulnar recurrent artery|尺側返動脈
Radial artery|橈動脈
Ulnar artery|尺動脈
Common interosseous artery|骨間總動脈
Anterior interosseous artery|骨間前動脈
Posterior interosseous artery|骨間後動脈
Interosseous recurrent artery|骨間返動脈
Palmar carpal branches|腕掌側支
Dorsal carpal network|腕背網
Superficial palmar branch of radial artery|橈動脈掌淺支
Superficial palmar arch|掌淺弓
Deep palmar arch|掌深弓
Deep palmar branch of ulnar artery|尺動脈掌深支
Princeps pollicis artery|拇主要動脈
Radialis indicis artery|示指橈側動脈
Common palmar digital artery|指掌側總動脈
Proper palmar digital artery|指掌側固有動脈
Dorsal metacarpal artery|掌背動脈
Dorsal digital artery|指背動脈
Upper limb veins|上肢靜脈
Axillary vein|腋靜脈
Brachial vein|肱靜脈
Radial veins|橈靜脈
Ulnar veins|尺靜脈
Cephalic vein|頭靜脈
Basilic vein|貴要靜脈
Median cubital vein|肘正中靜脈
Median antebrachial vein|前臂正中靜脈
Dorsal venous network of hand|手背靜脈網
Lower limb vessels|下肢血管
Femoral artery|股動脈
Femoral vein|股靜脈
Azygos vein|奇靜脈
Cerebral vessels|腦血管
Basilar artery|基底動脈
Anterior cerebral artery|大腦前動脈
Middle cerebral artery|大腦中動脈
Posterior cerebral artery|大腦後動脈
Anterior communicating artery|前交通動脈
Posterior communicating artery|後交通動脈
Superior sagittal sinus|上矢狀竇
Straight sinus|直竇
Transverse sinus|橫竇
Sigmoid sinus|乙狀竇
Iliac, popliteal and saphenous vessels|髂、膕及隱靜脈血管
Common iliac artery|髂總動脈
External iliac artery|髂外動脈
Internal iliac artery|髂內動脈
Common iliac vein|髂總靜脈
External iliac vein|髂外靜脈
Internal iliac vein|髂內靜脈
Popliteal artery|膕動脈
Popliteal vein|膕靜脈
Great saphenous vein|大隱靜脈
Small saphenous vein|小隱靜脈
Lymphatic|淋巴
Thoracic duct|胸導管
Cisterna chyli|乳糜池
Nose and paranasal sinuses|鼻及鼻竇
Nasal septum, perpendicular plate of ethmoid|鼻中隔（篩骨垂直板）
Septal cartilage|鼻中隔軟骨
Crista galli|雞冠
Superior nasal concha|上鼻甲
Middle nasal concha|中鼻甲
Inferior nasal concha (mucosa)|下鼻甲（黏膜）
Ethmoid air cells|篩竇氣房
Ethmoid bulla|篩泡
Frontal sinus|額竇
Maxillary sinus|上頜竇
Sphenoid sinus|蝶竇
Aryepiglottic fold|杓會厭襞
Thyroid cartilage|甲狀軟骨
Cricoid cartilage|環狀軟骨
Arytenoid cartilage|杓狀軟骨
Epiglottis|會厭
Vocal fold|聲襞（聲帶）
Vestibular fold|前庭襞
Thyrohyoid ligament|甲狀舌骨韌帶
Cricothyroid ligament|環甲韌帶
Trachea and bronchi|氣管及支氣管
Trachea|氣管
Tracheal cartilage ring|氣管軟骨環
Trachealis muscle|氣管肌
Carina|氣管隆嵴
Main bronchus|主支氣管
Bronchial cartilage|支氣管軟骨
Superior lobar bronchus|上葉支氣管
Middle lobar bronchus|中葉支氣管
Lingular bronchus|舌段支氣管
Inferior lobar bronchus|下葉支氣管
Lungs|肺
Right superior lobe|右上葉
Right middle lobe|右中葉
Right inferior lobe|右下葉
Left superior lobe|左上葉
Lingula|舌葉
Left inferior lobe|左下葉
Pleura|胸膜
Pulmonary arteries, intrapulmonary|肺內肺動脈
Pulmonary veins, intrapulmonary|肺內肺靜脈
Alveoli|肺泡
Hilar lymph node|肺門淋巴結
Pulmonary ligament|肺韌帶
Diaphragm|橫膈膜
Central tendon|中心腱
Right crus|右膈腳
Left crus|左膈腳
Medial arcuate ligament|內側弓狀韌帶
Lateral arcuate ligament|外側弓狀韌帶
Median arcuate ligament|正中弓狀韌帶
Caval opening|腔靜脈孔
Aortic hiatus|主動脈裂孔
Esophageal hiatus|食道裂孔
Phrenic nerve|膈神經
Single alveolar unit (magnified)|單一肺泡單位（放大）
Terminal bronchiole|終末細支氣管
Ciliated epithelium|纖毛上皮
Smooth muscle|平滑肌
Cartilage (ends before the terminal bronchiole)|軟骨（止於終末細支氣管前）
Respiratory bronchiole|呼吸性細支氣管
Alveolar duct|肺泡管
Alveolar sac|肺泡囊
Alveolus|肺泡
Pore of Kohn|肺泡孔（科恩孔）
Pulmonary arteriole|肺小動脈
Pulmonary venule|肺小靜脈
Pulmonary capillary network|肺微血管網
Elastic fibres|彈性纖維
Surfactant layer|表面活性物質層
Type I pneumocyte|第一型肺泡細胞
Type II pneumocyte|第二型肺泡細胞
Lamellar bodies|板層小體
Basement membrane|基底膜
Capillary endothelium|微血管內皮
Alveolar macrophage|肺泡巨噬細胞
Red blood cell|紅血球
Oxygen diffuses|氧氣擴散
Carbon dioxide diffuses|二氧化碳擴散
Lips and vestibule|唇及口腔前庭
Upper lip|上唇
Lower lip|下唇
Labial frenulum|唇繫帶
Labial and buccal mucosa|唇及頰黏膜
Alveolar mucosa|牙槽黏膜
Parotid papilla|腮腺乳頭
Retromolar trigone|磨牙後三角
Oral cavity|口腔
Central incisor|中切牙
Lateral incisor|側切牙
Canine|犬齒
First premolar|第一前磨牙
Second premolar|第二前磨牙
First molar|第一磨牙
Second molar|第二磨牙
Third molar|第三磨牙（智齒）
Gingiva|牙齦
Floor of the mouth|口底
Hard palate mucosa|硬顎黏膜
Median palatine raphe|腭正中縫
Incisive papilla|切牙乳頭
Transverse palatine folds (rugae)|腭橫襞（腭皺）
Soft palate|軟顎
Palatine aponeurosis|腭腱膜
Uvula|懸雍垂
Fauces and tonsils (Waldeyer's ring)|咽峽及扁桃體（咽淋巴環）
Palatoglossal arch|腭舌弓
Palatopharyngeal arch|腭咽弓
Palatine tonsil|腭扁桃體
Tonsillar crypts|扁桃體隱窩
Tonsillar capsule and fossa|扁桃體被膜及窩
Supratonsillar fossa|扁桃體上窩
Triangular fold|三角襞
Semilunar fold|半月襞
Lingual tonsil|舌扁桃體
Pharyngeal tonsil|咽扁桃體（腺樣體）
Pharyngeal bursa|咽囊
Tubal tonsil|咽鼓管扁桃體
Torus tubarius|咽鼓管圓枕
Pharyngeal opening of the auditory tube|咽鼓管咽口
Pharyngeal recess|咽隱窩
Salpingopharyngeal fold|咽鼓管咽襞
Tongue|舌
Tongue, oral part|舌口腔部
Tongue, pharyngeal part|舌咽部
Fungiform papillae|菌狀乳頭
Vallate papillae|輪廓乳頭
Foliate papillae|葉狀乳頭
Sulcus terminalis|界溝
Foramen cecum|盲孔
Median sulcus of the tongue|舌正中溝
Lingual septum|舌中隔
Median glossoepiglottic fold|舌會厭正中襞
Lateral glossoepiglottic fold|舌會厭外側襞
Epiglottic vallecula|會厭谷
Lingual frenulum|舌繫帶
Plica fimbriata|傘襞
Deep lingual vein|舌深靜脈
Sublingual caruncle|舌下肉阜
Sublingual fold|舌下襞
Salivary glands|唾液腺
Parotid gland|腮腺
Parotid duct|腮腺管
Submandibular gland|下頜下腺
Submandibular duct|下頜下腺管
Sublingual gland|舌下腺
Pharynx and oesophagus|咽及食道
Pharynx|咽
Esophagus, cervical part|食道頸段
Esophagus, upper thoracic part|食道胸上段
Esophagus, mid-thoracic part|食道胸中段
Esophagus, lower thoracic part|食道胸下段
Esophagus, abdominal part|食道腹段
Esophageal mucosa (longitudinal folds)|食道黏膜（縱襞）
Esophagus, tunica adventitia|食道外膜
Esophagus, abdominal serosa|食道腹段漿膜
Esophagus, longitudinal muscle layer|食道縱行肌層
Esophagus, circular muscle layer|食道環行肌層
Z-line|Z線（食道胃交界線）
Lower oesophageal sphincter|下食道括約肌
Stomach|胃
Stomach, cardia|胃賁門
Stomach, fundus|胃底
Stomach, body|胃體
Stomach, pyloric antrum|胃幽門竇
Stomach, pyloric canal|胃幽門管
Pyloric sphincter|幽門括約肌
Cardiac notch|賁門切跡
Angular incisure|角切跡
Lesser curvature|胃小彎
Greater curvature|胃大彎
Stomach serosa|胃漿膜
Stomach, longitudinal muscle layer|胃縱行肌層
Stomach, circular muscle layer|胃環行肌層
Stomach, oblique muscle layer|胃斜行肌層
Gastric mucosa (rugae)|胃黏膜（胃皺襞）
Left gastric artery|胃左動脈
Right gastric artery|胃右動脈
Left gastro-omental artery|胃網膜左動脈
Right gastro-omental artery|胃網膜右動脈
Short gastric arteries|胃短動脈
Lesser omentum|小網膜
Gastrosplenic ligament|胃脾韌帶
Greater omentum|大網膜
Liver, biliary tree, pancreas, spleen|肝、膽道、胰及脾
Liver|肝臟
Gallbladder|膽囊
Cystic duct|膽囊管
Common hepatic duct|肝總管
Common bile duct|膽總管
Pancreas|胰臟
Uncinate process|鈎突
Pancreatic duct|胰管
Accessory pancreatic duct|副胰管
Spleen|脾臟
Duodenum|十二指腸
Duodenum, superior part (bulb)|十二指腸上部（球部）
Duodenum, descending part|十二指腸降部
Duodenum, horizontal part|十二指腸水平部
Duodenum, ascending part|十二指腸升部
Duodenal mucosa|十二指腸黏膜
Major duodenal papilla|十二指腸大乳頭
Minor duodenal papilla|十二指腸小乳頭
Suspensory muscle of duodenum (ligament of Treitz)|十二指腸懸肌（特賴茨韌帶）
Jejunum and ileum|空腸及迴腸
Jejunum|空腸
Jejunum mucosa (plicae circulares)|空腸黏膜（環狀襞）
Ileum|迴腸
Ileum mucosa|迴腸黏膜
Peyer's patch|培氏斑（集合淋巴小結）
Ileocecal valve|迴盲瓣
Root of mesentery|腸繫膜根
Jejunal arteries (simple arcades, long vasa recta)|空腸動脈（單層動脈弓，長直血管）
Ileal arteries (multi-tier arcades, short vasa recta)|迴腸動脈（多層動脈弓，短直血管）
Mesenteric fat|腸繫膜脂肪
Large intestine|大腸
Cecum|盲腸
Vermiform appendix|闌尾
Ascending colon|升結腸
Transverse colon|橫結腸
Descending colon|降結腸
Sigmoid colon|乙狀結腸
Taenia mesocolica|結腸系膜帶
Taenia omentalis|結腸網膜帶
Taenia libera|結腸獨立帶
Omental appendices|腸脂垂
Phrenicocolic ligament|膈結腸韌帶
Rectum and anal canal|直腸及肛管
Rectum|直腸
Rectal mucosa|直腸黏膜
Transverse rectal fold (valves of Houston)|直腸橫襞（霍斯頓瓣）
Anal canal|肛管
Anal columns|肛柱
Pectinate line|齒狀線
Anal pecten|肛梳
Anocutaneous line|肛皮線
Anal verge|肛緣
Internal anal sphincter|肛門內括約肌
External anal sphincter|肛門外括約肌
Puborectalis|恥骨直腸肌
Single tooth (magnified canine, cut lengthwise)|單顆牙齒（放大犬齒縱切）
Enamel|牙釉質
Dentin|牙本質
Dentinal tubules|牙本質小管
Pulp chamber|牙髓腔
Root canal|根管
Cementum|牙骨質
Periodontal ligament|牙周韌帶
Alveolar bone|牙槽骨
Cementoenamel junction|牙骨質釉質交界
Apical foramen|根尖孔
Pulp nerve|牙髓神經
Pulp artery|牙髓動脈
Pulp vein|牙髓靜脈
Kidneys|腎臟
Renal capsule|腎被膜
Renal cortex|腎皮質
Renal pyramid (medulla)|腎錐體（髓質）
Renal papilla|腎乳頭
Minor calyx|腎小盞
Major calyx|腎大盞
Renal pelvis|腎盂
Renal sinus fat|腎竇脂肪
Renal vessels|腎血管
Renal artery|腎動脈
Segmental artery|段動脈
Interlobar artery|葉間動脈
Arcuate artery|弓狀動脈
Renal vein|腎靜脈
Interlobar vein|葉間靜脈
Suprarenal glands|腎上腺
Suprarenal gland|腎上腺
Ureters|輸尿管
Ureter, abdominal part|輸尿管腹段
Ureter, pelvic part|輸尿管盆段
Ureter, intramural part|輸尿管壁內段
Ureteric orifice|輸尿管口
Bladder|膀胱
Urinary bladder|膀胱
Detrusor muscle|逼尿肌
Bladder mucosa (rugae)|膀胱黏膜（皺襞）
Trigone|膀胱三角
Internal urethral orifice|尿道內口
Internal urethral sphincter|尿道內括約肌
Median umbilical ligament (urachus)|臍正中韌帶（臍尿管）
Urethra|尿道
Urethra, prostatic part|尿道前列腺部
Urethra, membranous part|尿道膜部
External urethral sphincter|尿道外括約肌
Scrotum and testis|陰囊及睪丸
Scrotum|陰囊
Median raphe|正中縫
Dartos fascia|肉膜
External spermatic fascia|精索外筋膜
Cremaster muscle|提睪肌
Internal spermatic fascia|精索內筋膜
Tunica vaginalis (parietal layer)|鞘膜（壁層）
Tunica vaginalis (visceral layer)|鞘膜（臟層）
Tunica albuginea|白膜
Testis, parenchyma|睪丸實質
Septula testis|睪丸小隔
Mediastinum testis|睪丸縱隔
Seminiferous tubules|曲細精管
Rete testis|睪丸網
Efferent ductules|輸出小管
Epididymis and spermatic cord|副睪及精索
Epididymis, head|副睪頭
Epididymis, body|副睪體
Epididymis, tail|副睪尾
Spermatic cord|精索
Testicular artery|睪丸動脈
Pampiniform venous plexus|蔓狀靜脈叢
Testicular vein|睪丸靜脈
Superficial inguinal ring|腹股溝淺環
Deep inguinal ring|腹股溝深環
Inferior epigastric artery|腹壁下動脈
Ductus deferens and seminal vesicles|輸精管及精囊
Ductus deferens|輸精管
Ampulla of ductus deferens|輸精管壺腹
Seminal vesicle|精囊
Ejaculatory duct|射精管
Rectoprostatic fascia (Denonvilliers)|直腸前列腺筋膜（德農維利埃筋膜）
Prostate|前列腺
Prostate, capsule|前列腺被膜
Prostate, peripheral zone|前列腺周邊區
Prostate, central zone|前列腺中央區
Prostate, transition zone|前列腺移行區
Anterior fibromuscular stroma|前纖維肌基質
Urethral crest|尿道嵴
Seminal colliculus|精阜
Prostatic utricle|前列腺小囊
Ejaculatory duct opening|射精管開口
Prostatic ductule openings|前列腺小管開口
Perineum|會陰
Perineal membrane|會陰膜
Bulbourethral gland|尿道球腺
Bulbourethral duct|尿道球腺管
Ischiocavernosus|坐骨海綿體肌
Bulbospongiosus|球海綿體肌
Penis|陰莖
Crus of penis|陰莖腳
Bulb of penis|陰莖球
Corpus cavernosum|陰莖海綿體
Corpus spongiosum|尿道海綿體
Septum pectiniforme|梳狀中隔
Deep artery of penis|陰莖深動脈
Buck's fascia|陰莖深筋膜（巴克筋膜）
Deep dorsal vein of penis|陰莖背深靜脈
Dorsal artery of penis|陰莖背動脈
Dorsal nerve of penis|陰莖背神經
Glans penis|龜頭
Corona glandis|冠狀溝
Neck of glans|龜頭頸
External urethral orifice|尿道外口
Penile skin|陰莖皮膚
Prepuce (foreskin)|包皮
Male urethra|男性尿道
Urethra, spongy part (bulbar)|尿道海綿體部（球部）
Urethra, spongy part (penile)|尿道海綿體部（陰莖部）
Navicular fossa|舟狀窩
Eye|眼
Sclera (eyeball)|鞏膜（眼球）
Choroid|脈絡膜
Retina|視網膜
Cornea|角膜
Iris|虹膜
Pupil|瞳孔
Lens|晶狀體
Suspensory ligament of lens|晶狀體懸韌帶
Vitreous body|玻璃體
Lacrimal gland|淚腺
Common tendinous ring|總腱環
Trochlea|滑車
Ear|耳
Auricle|耳廓
External acoustic meatus|外耳道
Tympanic membrane|鼓膜
Tympanic cavity|鼓室
Malleus|錘骨
Incus|砧骨
Stapes|鐙骨
Vestibule|前庭
Anterior semicircular canal|前半規管
Posterior semicircular canal|後半規管
Lateral semicircular canal|外側半規管
Cochlea|耳蝸
Pharyngotympanic (auditory) tube|咽鼓管（耳咽管）
Thyroid gland, right lobe|甲狀腺右葉
Thyroid gland, left lobe|甲狀腺左葉
Isthmus of thyroid gland|甲狀腺峽部
Pyramidal lobe|錐狀葉
Parathyroid glands, superior pair|上副甲狀腺
Parathyroid glands, inferior pair|下副甲狀腺
Thymus|胸腺
Face, jaw, orbit and larynx|面、頜、眼眶及喉
Infraorbital nerve|眶下神經
Zygomatic nerve|顴神經
Superior alveolar nerves|上牙槽神經
Pterygopalatine ganglion|翼腭神經節
Inferior alveolar nerve|下牙槽神經
Mental nerve|頦神經
Lingual nerve|舌神經
Buccal nerve|頰神經
Auriculotemporal nerve|耳顳神經
Masseteric nerve|咬肌神經
Mylohyoid nerve|下頜舌骨肌神經
Deep temporal nerves|顳深神經
Frontal nerve|額神經
Lacrimal nerve|淚腺神經
Ciliary ganglion|睫狀神經節
Short ciliary nerves|睫狀短神經
Superior laryngeal nerve|喉上神經
Recurrent laryngeal nerve|喉返神經
Ansa cervicalis|頸襻
Lesser occipital nerve|枕小神經
Great auricular nerve|耳大神經
Transverse cervical nerve|頸橫神經
Supraclavicular nerves|鎖骨上神經
Cochlear root (CN VIII)|蝸神經根（第八對腦神經）
Vestibular root (CN VIII)|前庭神經根（第八對腦神經）
Cerebrum|大腦
Cerebral cortex|大腦皮質
Cerebral white matter|大腦白質
Deep structures|深部結構
Corpus callosum|胼胝體
Septum pellucidum|透明隔
Fornix|穹窿
Anterior commissure|前連合
Thalamus|丘腦
Pulvinar|丘腦枕
Lateral geniculate body|外側膝狀體
Interthalamic adhesion|丘腦間聯合
Hypothalamus|下丘腦
Mammillary body|乳頭體
Subthalamic nucleus|丘腦底核
Pineal gland|松果體
Infundibulum|漏斗
Adenohypophysis|腺垂體
Neurohypophysis|神經垂體
Optic chiasm|視交叉
Optic tract|視束
Caudate nucleus|尾狀核
Putamen|殼核
Globus pallidus|蒼白球
Amygdala|杏仁核
Hippocampus|海馬體
Internal capsule|內囊
Ventricular system|腦室系統
Lateral ventricle|側腦室
3rd ventricle|第三腦室
Interventricular foramen|室間孔
Cerebral aqueduct|中腦導水管
4th ventricle|第四腦室
Choroid plexus|脈絡叢
Central canal|中央管
Brainstem and cerebellum|腦幹及小腦
Midbrain|中腦
Cerebral peduncle|大腦腳
Superior colliculus|上丘
Inferior colliculus|下丘
Brachium of inferior colliculus|下丘臂
Pons|腦橋
Medulla oblongata|延髓
Pyramid|錐體
Cerebellum|小腦
Cranial nerves|腦神經
Olfactory nerve (CN I)|嗅神經（第一對腦神經）
Optic nerve (CN II)|視神經（第二對腦神經）
Oculomotor nerve (CN III)|動眼神經（第三對腦神經）
Trochlear nerve (CN IV)|滑車神經（第四對腦神經）
Trigeminal nerve (CN V)|三叉神經（第五對腦神經）
Abducens nerve (CN VI)|外展神經（第六對腦神經）
Facial nerve (CN VII)|面神經（第七對腦神經）
Vestibulocochlear nerve (CN VIII)|前庭蝸神經（第八對腦神經）
Glossopharyngeal nerve (CN IX)|舌咽神經（第九對腦神經）
Vagus nerve (CN X)|迷走神經（第十對腦神經）
Accessory nerve (CN XI)|副神經（第十一對腦神經）
Hypoglossal nerve (CN XII)|舌下神經（第十二對腦神經）
Spinal cord and spinal nerves|脊髓及脊神經
Spinal cord|脊髓
Dura mater|硬腦膜
Filum terminale|終絲
Cauda equina|馬尾
Dorsal root ganglion|背根神經節
Spinal nerve|脊神經
Intercostal nerve|肋間神經
Brachial plexus and arm|臂叢及上臂
Brachial plexus, C5 root|臂叢（C5 神經根）
Upper trunk|上幹
Middle trunk|中幹
Lower trunk|下幹
Anterior division|前股
Posterior division|後股
Lateral cord|外側束
Medial cord|內側束
Posterior cord|後束
Musculocutaneous nerve|肌皮神經
Axillary nerve|腋神經
Radial nerve|橈神經
Median nerve|正中神經
Ulnar nerve|尺神經
Dorsal scapular nerve|肩胛背神經
Long thoracic nerve|胸長神經
Suprascapular nerve|肩胛上神經
Nerve to subclavius|鎖骨下肌神經
Lateral pectoral nerve|胸外側神經
Medial pectoral nerve|胸內側神經
Superior subscapular nerve|肩胛下上神經
Thoracodorsal nerve|胸背神經
Inferior subscapular nerve|肩胛下下神經
Medial cutaneous nerve of arm|臂內側皮神經
Medial cutaneous nerve of forearm|前臂內側皮神經
Intercostobrachial nerve|肋間臂神經
Posterior cutaneous nerve of arm|臂後皮神經
Inferior lateral cutaneous nerve of arm|臂下外側皮神經
Posterior cutaneous nerve of forearm|前臂後皮神經
Forearm and hand nerves|前臂及手的神經
Superficial branch of radial nerve|橈神經淺支
Deep branch of radial nerve|橈神經深支
Anterior interosseous nerve|骨間前神經
Palmar branch of median nerve|正中神經掌支
Dorsal branch of ulnar nerve|尺神經背支
Palmar branch of ulnar nerve|尺神經掌支
Leg|下肢
Lumbosacral plexus|腰骶叢
Femoral nerve|股神經
Saphenous nerve|隱神經
Sciatic nerve|坐骨神經
Tibial nerve|脛神經
Common fibular nerve|腓總神經
Deep fibular nerve|腓深神經
Superficial fibular nerve|腓淺神經
Medial sural cutaneous nerve|腓腸內側皮神經
Lateral sural cutaneous nerve|腓腸外側皮神經
Sural communicating nerve|腓腸交通神經
Sural nerve|腓腸神經
Head and neck nodes|頭頸部淋巴結
Occipital lymph nodes|枕淋巴結
Post-auricular (mastoid) lymph nodes|耳後（乳突）淋巴結
Pre-auricular and parotid lymph nodes|耳前及腮腺淋巴結
Submental lymph nodes|頦下淋巴結
Submandibular lymph nodes|下頜下淋巴結
Superficial cervical lymph nodes|頸淺淋巴結
Deep cervical lymph nodes|頸深淋巴結
Posterior triangle (accessory) lymph nodes|頸後三角（副神經）淋巴結
Supraclavicular lymph nodes|鎖骨上淋巴結
Pretracheal and paratracheal lymph nodes|氣管前及氣管旁淋巴結
Thorax and upper limb nodes|胸部及上肢淋巴結
Parasternal (internal thoracic) lymph nodes|胸骨旁（胸廓內）淋巴結
Anterior mediastinal lymph nodes|縱隔前淋巴結
Tracheobronchial lymph nodes|氣管支氣管淋巴結
Subcarinal lymph nodes|隆嵴下淋巴結
Axillary lymph nodes, pectoral, central and apical groups|腋淋巴結（胸肌群、中央群及尖群）
Epitrochlear lymph nodes|滑車上淋巴結
Abdominal and pelvic nodes|腹部及盆腔淋巴結
Para-aortic (lumbar) lymph nodes|主動脈旁（腰）淋巴結
Coeliac lymph nodes|腹腔淋巴結
Superior mesenteric lymph nodes|腸繫膜上淋巴結
Inferior mesenteric lymph nodes|腸繫膜下淋巴結
Mesenteric lymph nodes (jejunal and ileal)|腸繫膜淋巴結（空腸及迴腸）
Colic lymph nodes|結腸淋巴結
Gastric lymph nodes|胃淋巴結
Hepatic lymph nodes (porta hepatis)|肝淋巴結（肝門）
Splenic hilar lymph nodes|脾門淋巴結
Common iliac lymph nodes|髂總淋巴結
External iliac lymph nodes|髂外淋巴結
Internal iliac lymph nodes|髂內淋巴結
Lower limb nodes|下肢淋巴結
Superficial inguinal lymph nodes|腹股溝淺淋巴結
Deep inguinal lymph nodes|腹股溝深淋巴結
Popliteal lymph nodes|膕淋巴結
Lymphatic vessels, trunks and ducts|淋巴管、淋巴幹及淋巴導管
Lymphatic vessels, deep cervical chain|淋巴管（頸深鏈）
Jugular trunk|頸幹
Subclavian trunk|鎖骨下幹
Bronchomediastinal trunk|支氣管縱隔幹
Right lymphatic duct|右淋巴導管
Lumbar trunk|腰幹
Intestinal trunk|腸幹
Lymphatic vessels, iliac and inguinal chain|淋巴管（髂及腹股溝鏈）
Lymphatic vessels, mesenteric (lacteals)|淋巴管（腸繫膜，乳糜管）
Lymphatic vessels, collecting vessels of the arm|淋巴管（上肢收集管）
Lymphatic vessels, collecting vessels of the leg|淋巴管（下肢收集管）
Vertebra|椎骨
Intervertebral disc|椎間盤
Rib|肋骨
Sacrum|骶骨
Coccyx|尾骨
Magnified|放大
Magnified tooth|放大牙齒
Xiphoid process|劍突
Sternoclavicular joint|胸鎖關節
Sphenosquamous suture|蝶鱗縫
Occipitomastoid suture|枕乳縫
External occipital crest|枕外嵴
basilar part|基底部
body|體
petrous part|岩部
Occipital bone|枕骨
Parietal foramen|頂孔
Mastoid notch|乳突切跡
Supra-orbital notch (foramen)|眶上切跡（孔）
Zygomatic process of frontal bone|額骨顴突
Zygomaticofacial foramen|顴面孔
zygomatic process of temporal bone|顳骨顴突
temporal process of zygomatic bone|顴骨顳突
frontal process|額突
Infra-orbital foramen|眶下孔
Posterior nasal aperture (choana)|後鼻孔
medial plate|內側板
lateral plate|外側板
Pterygoid hamulus|翼鈎
ramus|下頜支
condylar process|髁突
coronoid process|冠突
angle|角
Mental foramen|頦孔
mental tubercle|頦結節
mental protuberance|頦隆凸
Piriform (nasal) aperture|梨狀孔（鼻前孔）
anterior nasal spine|前鼻棘
maxillary|上頜
mandibular|下頜
Hyoid bone|舌骨
supraspinous fossa|岡上窩
infraspinous fossa (subscapular fossa in front)|岡下窩（前方為肩胛下窩）
lateral border|外側緣
medial border|內側緣
superior border|上緣
superior angle|上角
inferior angle|下角
suprascapular notch|肩胛上切跡
supraglenoid tubercle|盂上結節
infraglenoid tubercle|盂下結節
greater scapular (spinoglenoid) notch|肩胛大切跡（岡盂切跡）
Elbow joint|肘關節
Ulna|尺骨
Radius|橈骨
Hamate, hook|鈎骨鈎
hook|鈎
tubercle|結節
Wrist (radiocarpal) joint|腕（橈腕）關節
Metacarpal I|第一掌骨
Metacarpal II|第二掌骨
Metacarpal III|第三掌骨
Metacarpal IV|第四掌骨
Metacarpal V|第五掌骨
proximal|近節
middle|中節
distal|遠節
thumb|拇指
index|食指
ring|無名指
little|小指
great toe|大趾
second toe|第二趾
third toe|第三趾
fourth toe|第四趾
little toe|小趾
Pubic symphysis|恥骨聯合
Knee cartilage|膝關節軟骨
Tibia|脛骨
Fibula|腓骨
Ankle cartilage|踝關節軟骨
posterior process|後突
sustentaculum tali|載距突
fibular trochlea|腓骨滑車
medial tubercle|內側結節
lateral tubercle|外側結節
tuberosity|粗隆
Metatarsal I|第一蹠骨
Metatarsal II|第二蹠骨
Metatarsal III|第三蹠骨
Metatarsal IV|第四蹠骨
Metatarsal V|第五蹠骨
Cribriform plate of ethmoid|篩骨篩板
Greater alar cartilage|鼻翼大軟骨
Lateral nasal cartilage|鼻外側軟骨
clavicular part|鎖骨部
acromial part|肩峰部
spinal part|脊柱部
long head|長頭
short head|短頭
lateral head|外側頭
medial head|內側頭
tendon|肌腱
tendon of long head|長頭腱
tendon of insertion|止點腱
Sartorius, gracilis and semitendinosus (pes anserinus)|縫匠肌、股薄肌及半腱肌（鵝足）
tendon (behind medial malleolus to navicular tuberosity)|肌腱（經內踝後方至舟骨粗隆）
tendon (groove on talus, under sustentaculum tali)|肌腱（經距骨溝及載距突下方）
tendon (hooks round the pterygoid hamulus)|肌腱（繞過翼鈎）
tendinous intersection|腱劃
Linea alba|白線
descending part|降部
transverse part|橫部
ascending part|升部
sternocostal part|胸肋部
abdominal part|腹部
iliocostalis|髂肋肌
longissimus|最長肌
spinalis|棘肌
anterior belly|前腹
posterior belly|後腹
inferior belly|下腹
superior belly|上腹
intermediate tendon|中間腱
sternal head|胸骨頭
clavicular head|鎖骨頭
vertical part|垂直部
superior oblique part|上斜部
inferior oblique part|下斜部
Anterior papillary muscle|前乳頭肌
Posterior papillary muscle|後乳頭肌
left ventricle|左心室
right ventricle|右心室
Sinoatrial (SA) node, primary pacemaker|竇房結（主要起搏點）
Internodal pathways|結間束
Atrioventricular (AV) node|房室結
Atrioventricular bundle (bundle of His)|房室束（希氏束）
Bundle branch|束支
Purkinje fibres|浦肯野纖維
dorsal carpal branch|腕背支
Esophageal artery (from aorta)|食道動脈（源自主動脈）
Celiac trunk|腹腔幹
Splenic artery|脾動脈
Hepatic artery|肝動脈
Superior mesenteric artery|腸繫膜上動脈
Superior mesenteric vein|腸繫膜上靜脈
Splenic vein|脾靜脈
Portal vein|門靜脈
Ileocolic artery|迴結腸動脈
Appendicular artery|闌尾動脈
Middle colic artery|中結腸動脈
Colic artery|結腸動脈
Inferior mesenteric artery|腸繫膜下動脈
Sigmoid arteries|乙狀結腸動脈
Superior rectal artery|直腸上動脈
cricothyroid branch|環甲支
parietal branch|頂支
Superior lobar bronchus and segmental bronchi|上葉支氣管及肺段支氣管
Middle lobar bronchus and segmental bronchi|中葉支氣管及肺段支氣管
Inferior lobar bronchus and segmental bronchi|下葉支氣管及肺段支氣管
Lingular bronchus and segmental bronchi|舌段支氣管及肺段支氣管
Lateral nasal wall (mucosa)|鼻腔外側壁（黏膜）
Superior meatus (posterior ethmoid cells open here)|上鼻道（後篩竇開口於此）
Middle meatus (frontal, maxillary and anterior ethmoid sinuses open here)|中鼻道（額竇、上頜竇及前篩竇開口於此）
Inferior meatus (nasolacrimal duct opens here)|下鼻道（鼻淚管開口於此）
Opening of the nasolacrimal duct|鼻淚管開口
Maxillary sinus opening (ostium)|上頜竇開口
Sphenoethmoidal recess (sphenoid sinus opens here)|蝶篩隱窩（蝶竇開口於此）
Olfactory region (olfactory epithelium on the roof)|嗅區（頂部的嗅上皮）
Floor of the nasal cavity (mucosa over the hard palate)|鼻腔底（硬顎上的黏膜）
Nasal vestibule (skin-lined entrance)|鼻前庭（皮膚覆蓋的入口）
Vibrissae (nasal hairs that filter dust)|鼻毛（過濾塵埃）
Vocal process of the arytenoid|杓狀軟骨聲帶突
Muscular process of the arytenoid|杓狀軟骨肌突
Corniculate cartilage|小角軟骨
Laryngeal ventricle|喉室
Vallate (circumvallate) papillae|輪廓乳頭
Lower oesophageal (gastro-oesophageal) sphincter|下食道（胃食道）括約肌
Gastric mucosa (rugae; Magenstrasse along the lesser curvature)|胃黏膜（胃皺襞；沿胃小彎的胃道）
Gastro-omental (gastroepiploic) artery|胃網膜動脈
Gastro-omental (gastroepiploic) veins|胃網膜靜脈
hooding fold|罩襞
longitudinal fold|縱襞
Transverse rectal fold (valve of Houston, upper)|直腸橫襞（霍斯頓瓣，上）
Transverse rectal fold (valve of Houston, middle)|直腸橫襞（霍斯頓瓣，中）
Transverse rectal fold (valve of Houston, lower)|直腸橫襞（霍斯頓瓣，下）
Pectinate (dentate) line with anal valves and crypts|齒狀線（連肛瓣及肛隱窩）
Anal verge and perianal skin|肛緣及肛周皮膚
deep part (voluntary)|深部（隨意肌）
superficial part (voluntary)|淺部（隨意肌）
subcutaneous part (voluntary)|皮下部（隨意肌）
Nasopharynx (behind the nose, above the soft palate; holds the pharyngeal tonsil and the auditory tube openings)|鼻咽（位於鼻後、軟顎之上，含咽扁桃體及咽鼓管開口）
Oropharynx (behind the mouth, from the soft palate to the tip of the epiglottis; holds the palatine tonsils)|口咽（位於口後，由軟顎至會厭尖，含腭扁桃體）
Laryngopharynx (hypopharynx, from the epiglottis to the cricoid cartilage; the piriform recesses lie beside the larynx)|喉咽（下咽，由會厭至環狀軟骨，梨狀隱窩位於喉兩側）
superficial part|淺部
deep part|深部
deep part (behind the mandibular ramus)|深部（位於下頜支後方）
upper|上
lower|下
Uterus (womb)|子宮
Endometrium|子宮內膜
Myometrium|子宮肌層
Perimetrium|子宮外膜
Cervix|子宮頸
Cervical canal|子宮頸管
Vagina|陰道
Vaginal opening|陰道口
Ovary|卵巢
Fallopian tube|輸卵管
Fimbriae|輸卵管傘
Ovarian follicle|卵巢濾泡
Ovarian vessels|卵巢血管
Dominant (Graafian) follicle|優勢（格拉夫）濾泡
Corpus luteum|黃體
Released oocyte|排出的卵母細胞
Labia majora|大陰唇
Labia minora|小陰唇
Clitoris|陰蒂
Urethral opening (female)|尿道口（女性）
Breast adipose tissue|乳房脂肪組織
Lactiferous ducts|輸乳管
Breast lobe and lobule|乳腺葉及小葉
Acini (milk-producing alveoli)|腺泡（分泌乳汁的肺泡）
Fibrous connective tissue (breast, right)|纖維結締組織（右乳）
Fibrous connective tissue (breast, left)|纖維結締組織（左乳）
Retromammary space and pectoral fascia|乳房後間隙及胸筋膜
Montgomery's glands|蒙哥馬利腺
Internal thoracic artery branches|胸廓內動脈分支
Lateral thoracic artery branches|胸外側動脈分支
Intercostal nerve branches|肋間神經分支
Axillary lymph nodes|腋淋巴結
Nipple|乳頭
Areola|乳暈
Cooper's ligaments|庫珀韌帶（乳房懸韌帶）
Axillary tail of breast|乳房腋尾
Breast lymphatic vessel|乳房淋巴管
Sympathetic trunk|交感神經幹
Sympathetic ganglion|交感神經節
inferior horn|下角
Olfactory nerve (CN I)|嗅神經（第一對腦神經）
ganglion|神經節
ophthalmic division V1|眼支（V1）
maxillary division V2|上頜支（V2）
mandibular division V3|下頜支（V3）
Trigeminal nerve (CN V, ganglion)|三叉神經節
Spinal cord, white matter|脊髓白質
Spinal cord, grey matter (butterfly)|脊髓灰質（蝶形）
white matter|白質
grey matter (butterfly)|灰質（蝶形）
Cauda equina, spinal nerve Co1|馬尾（尾神經 Co1）
Dorsal root ganglion Co1|背根神經節 Co1
root|神經根
medial root|內側根
digital branch to thumb|拇指指支
digital branch to index finger|食指指支
digital branch to middle finger|中指指支
digital branch to ring finger (lateral half)|無名指指支（外側半）
digital branch to ring finger (medial half)|無名指指支（內側半）
digital branch to little finger|小指指支
L4–L5 roots|L4–L5 神經根
S1–S3 roots|S1–S3 神經根
inferior dental branches|下牙支
internal branch (sensory)|內支（感覺）
external branch (motor to cricothyroid)|外支（運動，支配環甲肌）
superior root (C1)|上根（C1）
inferior root (C2–C3)|下根（C2–C3）
branch to infrahyoid muscles|舌骨下肌群支
collecting vessels of the leg, deep|下肢深層收集管
Lymphatic vessels, collecting vessels of the leg, deep|淋巴管（下肢深層收集管）
Trigeminal nerve (CN V, ophthalmic division V1)|三叉神經眼支（V1）
Trigeminal nerve (CN V, maxillary division V2)|三叉神經上頜支（V2）
Trigeminal nerve (CN V, mandibular division V3)|三叉神經下頜支（V3）
Trigeminal nerve (CN V, ganglion)|三叉神經節（第五對腦神經）
Brachial plexus|臂叢
Magnified: Oxygen diffuses from the alveolus into the blood|放大：氧氣由肺泡擴散入血液
Magnified: Carbon dioxide diffuses from the blood into the alveolus|放大：二氧化碳由血液擴散入肺泡
Magnified tooth: Gingiva (gum), with the gingival sulcus at the neck|放大：牙齦（連牙頸處齦溝）
Skin|皮膚
Skeletal|骨骼系統
Muscular|肌肉系統
Circulatory|循環系統
Respiratory|呼吸系統
Digestive|消化系統
Urinary|泌尿系統
Reproductive|生殖系統
Eye and ear|眼及耳
Thyroid and parathyroid|甲狀腺及副甲狀腺
Nervous|神經系統
Lymphatic|淋巴系統
Endocrine|內分泌系統
Special senses|特殊感覺
Superficial veins|淺靜脈
Investing fascia|包被筋膜
Superficial muscles|淺層肌肉
Second muscle group|第二肌群
Intermediate muscles|中層肌肉
Deep muscles|深層肌肉
Deepest muscles|最深層肌肉
Visceral coverings|內臟被覆
Anterior organs|前部器官
Deep organs|深部器官
Deep nerves and vessels|深部神經及血管
Capsules and ligaments|被膜及韌帶
Bones and cartilage|骨骼及軟骨
`;

  const exact = new Map(), low = new Map();
  TERMS.split('\n').forEach(l => {
    l = l.trim(); const i = l.indexOf('|'); if (i < 1) return;
    const e = l.slice(0, i).trim(), z = l.slice(i + 1).trim(); exact.set(e, z); low.set(e.toLowerCase(), z);
  });
  const get = s => exact.get(s) || low.get(s.toLowerCase());
  const SIDE = { left: '左', right: '右' };

  function tr(s) {
    s = s.trim(); if (!s) return null;
    let z = get(s); if (z) return z;
    let m;
    // "Magnified: X" and "Magnified tooth: X"
    m = s.match(/^Magnified(?: tooth)?:\s+(.+)$/); if (m) { const b = tr(m[1]); if (b) return '放大：' + b; }
    // nerve roots such as "C6 root"
    m = s.match(/^([CTLS]\d+)\s+root$/); if (m) return m[1] + ' 神經根';
    // tooth position: "Canine, maxillary (right, #13)"
    m = s.match(/^(.+?)\s+\((left|right),\s*#(\d+)\)$/i); if (m) { const b = tr(m[1]); if (b) return SIDE[m[2].toLowerCase()] + b + ' #' + m[3]; }
    // side inside the parentheses: "Vagus nerve (CN X, left)"
    m = s.match(/^(.+?)\s+\((.+?),\s*(left|right)\)$/i); if (m) { const b = tr(m[1] + ' (' + m[2] + ')') || tr(m[1]); if (b) return SIDE[m[3].toLowerCase()] + b; }
    // numbers and codes at the end: "Rib 1", "Vertebra L5", "Intervertebral disc L5/S1"
    m = s.match(/^(.*?)\s+((?:[CTLS]\d+(?:\/[CTLS]\d+)?)|\d+(?:[–-]\d+)?)$/); if (m) { const b = tr(m[1]); if (b) return b + ' ' + m[2]; }
    // side markers: "Left X", "X (left)", "X, left"
    m = s.match(/^(Left|Right)\s+(.+)$/i); if (m) { const b = tr(m[2]); if (b) return SIDE[m[1].toLowerCase()] + b; }
    m = s.match(/^(.+?),?\s+\((left|right)\)$/i) || s.match(/^(.+?),\s+(left|right)$/i); if (m) { const b = tr(m[1]); if (b) return SIDE[m[2].toLowerCase()] + b; }
    // trailing parenthetical: "X (Y)" keeps X alone when Y has no entry
    m = s.match(/^(.+?)\s+\((.+)\)$/); if (m) { const b = tr(m[1]), q = tr(m[2]); if (b && q) return b + '（' + q + '）'; if (b) return b; }
    // "Base, qualifier"
    const i = s.indexOf(', ');
    if (i > 0) { const b = tr(s.slice(0, i)), q = tr(s.slice(i + 2)); if (b && q) return b + '，' + q; }
    return null;
  }

  const cache = new Map();
  const zh = en => { if (!en) return null; if (!cache.has(en)) cache.set(en, tr(en)); return cache.get(en); };

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const MODES = ['en', 'zh-Hant', 'both'];

  // the page's own language mode: the parent sets it on <html data-lang>, same origin
  const setMode = m => { if (!MODES.includes(m)) m = 'en'; document.documentElement.dataset.lang = m; };
  let first = 'en'; try { if (parent !== window) first = parent.document.documentElement.dataset.lang || 'en'; } catch (e) { }
  setMode(first);
  addEventListener('message', e => { if (e.origin === location.origin && e.data && e.data.type === 'lang') setMode(e.data.lang); });

  const FONT = '"Noto Sans HK","PingFang HK","Microsoft JhengHei","Noto Sans TC",sans-serif';
  const style = document.createElement('style');
  style.textContent = `
  .zh{display:none;font-family:${FONT};font-weight:400;letter-spacing:.02em}
  html[data-lang="both"] .zh{display:inline;margin-left:.4em;font-size:.94em;color:var(--color-neutral-700,#6b6458)}
  html[data-lang="zh-Hant"] .zh{display:inline}
  html[data-lang="zh-Hant"] .en:has(+ .zh){display:none}`;
  document.head.appendChild(style);

  window.__zh = {
    zh,
    // html for a name in the current mode; `shown` is the English text when it differs from the key (for example "Skeletal system")
    html: (en, shown) => {
      const z = zh(en), e = shown == null ? en : shown;
      return z ? '<span class="en">' + esc(e) + '</span><span class="zh" lang="zh-Hant">' + esc(z) + '</span>' : esc(e);
    },
  };
})();
