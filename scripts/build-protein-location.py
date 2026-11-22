"""Build data/protein-location.json from an HPA subcellular_location export (.numbers, .tsv or .csv).
Run: python3 scripts/build-protein-location.py path/to/subcellular_location.numbers
Needs `pip install numbers-parser` only for .numbers input."""
import csv, json, sys, re
from pathlib import Path

src = Path(sys.argv[1])
if src.suffix == '.numbers':
    from numbers_parser import Document
    rows = Document(str(src)).sheets[0].tables[0].rows(values_only=True)
else:
    with open(src, newline='', encoding='utf-8') as f:
        rows = list(csv.reader(f, delimiter='\t' if src.suffix == '.tsv' else ','))
head = list(rows[0]); by = {r[1]: dict(zip(head, r)) for r in rows[1:] if isinstance(r[1], str) and r[1]}

# Genes per structure shown in Module B. Prefix rules pick whole families present in the table.
SETS = {
    '5XTD': (r'^NDUF(A|B|C|S|V|AB)\d+$|^MT-ND\d+L?$', 'Complex I subunits'),
    '4UG0': (r'^RP[LS]\d+[AXY]?\d*$|^RPLP[012]$|^RACK1$', '80S ribosome proteins'),
    '1TQN': (r'^CYP3A4$', 'CYP3A4'),
    '1ZUM': (r'^ALDH2$', 'ALDH2'),
    'candidate': (r'^ATP5(F1[A-E]|PB|MC[123]|PD|PF|PO|F1)$|^ATP5[A-Z0-9]+$|^SLC2A[25]$|^SLC5A1$|^BCL2$|^BCL2L1$|^MCL1$|^BAX$|^ADRB2$|^LCT$|^HMGCR$|^ATP4[AB]$|^UCP1$|^NUP(62|85|93|98|107|133|153|155|160|205|214)$|^DYNC1H1$|^SCN[0-9]+A$', 'Candidate structures'),
}
ZH = {'Cytosol': '細胞質基質', 'Endoplasmic reticulum': '內質網', 'Mitochondria': '粒線體', 'Nucleoli': '核仁', 'Nucleoplasm': '核質', 'Plasma membrane': '細胞膜', 'Principal piece': '精子主段', 'Nuclear membrane': '核膜', 'Vesicles': '囊泡', 'Mid piece': '精子中段', 'End piece': '精子末段', 'Connecting piece': '精子連接段', 'Flagellar centriole': '鞭毛中心粒', 'Nucleoli fibrillar center': '核仁纖維中心', 'Golgi apparatus': '高基氏體', 'Acrosome': '頂體', 'Centrosome': '中心體', 'Equatorial segment': '精子赤道段', 'Nuclear bodies': '核體', 'Basal body': '基體', 'Mitotic spindle': '有絲分裂紡錘體', 'Perinuclear theca': '核周鞘', 'Nuclear speckles': '核斑點', 'Calyx': '精子頸鞘', 'Actin filaments': '肌動蛋白絲', 'Cytokinetic bridge': '胞質分裂橋', 'Microtubules': '微管', 'Primary cilium': '初級纖毛', 'Annulus': '精子環', 'Nucleoli rim': '核仁邊緣', 'Cell Junctions': '細胞連接', 'Focal adhesion sites': '焦點黏著位點'}
out, n = {}, {}
for sid, (pat, _) in SETS.items():
    for g, r in by.items():
        if not re.search(pat, g): continue
        split = lambda v: [x for x in (v or '').split(';') if x]
        out[g] = {'ensembl': r['Gene'], 'structure': sid, 'reliability': r['Reliability'],
                  'main': split(r['Main location']), 'additional': split(r['Additional location']),
                  'go': split(r['GO id'])}
        n[sid] = n.get(sid, 0) + 1
doc = {'_schema': 'Human Protein Atlas subcellular location, trimmed to genes of the structures in catalog.json. reliability is the HPA grade: Enhanced, Supported, Approved or Uncertain. main and additional are HPA location names; go lists "name (GO:id)". Rebuild with scripts/build-protein-location.py. cite is in citations.json.',
       'cite': 'hpa-subcellular', 'locations': {k: {'en': k, 'zh-Hant': v} for k, v in ZH.items()}, 'genes': dict(sorted(out.items()))}
Path(__file__).parent.parent.joinpath('data/protein-location.json').write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
print(n, len(out))
