"""Build data/protein-location.json from an HPA subcellular_location export (.numbers, .tsv or .csv).
Run: python3 scripts/build-protein-location.py path/to/subcellular_location.numbers
Needs `pip install numbers-parser` only for .numbers input."""
import csv, json, sys, re, urllib.request
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
ZH = {'Cytosol': '細胞質基質', 'Endoplasmic reticulum': '內質網', 'Mitochondria': '粒線體', 'Nucleoli': '核仁', 'Nucleoplasm': '核質', 'Plasma membrane': '細胞膜', 'Principal piece': '精子主段', 'Nuclear membrane': '核膜', 'Vesicles': '囊泡', 'Mid piece': '精子中段', 'End piece': '精子末段', 'Connecting piece': '精子連接段', 'Flagellar centriole': '鞭毛中心粒', 'Nucleoli fibrillar center': '核仁纖維中心', 'Golgi apparatus': '高基氏體', 'Acrosome': '頂體', 'Centrosome': '中心體', 'Equatorial segment': '精子赤道段', 'Nuclear bodies': '核體', 'Basal body': '基體', 'Mitotic spindle': '有絲分裂紡錘體', 'Perinuclear theca': '核周鞘', 'Nuclear speckles': '核斑點', 'Calyx': '精子頸鞘', 'Actin filaments': '肌動蛋白絲', 'Cytokinetic bridge': '胞質分裂橋', 'Microtubules': '微管', 'Primary cilium': '初級纖毛', 'Annulus': '精子環', 'Nucleoli rim': '核仁邊緣', 'Cell Junctions': '細胞連接', 'Focal adhesion sites': '焦點黏著位點',
      'Apical cell membrane': '頂端細胞膜', 'Endoplasmic reticulum membrane': '內質網膜', 'Mitochondrion': '粒線體', 'Mitochondrion inner membrane': '粒線體內膜', 'Mitochondrion membrane': '粒線體膜', 'Nucleus envelope': '核被膜', 'Nucleus membrane': '核膜', 'Nucleus, nuclear pore complex': '核孔複合體', 'Nucleus, nucleoplasm': '核質', 'Peroxisome membrane': '過氧化體膜'}
out, n = {}, {}
for sid, (pat, _) in SETS.items():
    for g, r in by.items():
        if not re.search(pat, g): continue
        split = lambda v: [x for x in (v or '').split(';') if x]
        out[g] = {'ensembl': r['Gene'], 'structure': sid, 'reliability': r['Reliability'],
                  'main': split(r['Main location']), 'additional': split(r['Additional location']),
                  'go': split(r['GO id'])}
        n[sid] = n.get(sid, 0) + 1
# Genes the HPA export lacks, filled from UniProt (reviewed human entry). Needs network access to rest.uniprot.org.
EXTRA = {'ALDH2': '1ZUM', 'NDUFS7': '5XTD', 'HMGCR': 'candidate', 'LCT': 'candidate', 'UCP1': 'candidate', 'ATP4A': 'candidate',
         'ATP5F1C': 'candidate', 'ATP5F1E': 'candidate', 'ATP5MC1': 'candidate', 'ATP5MC2': 'candidate', 'ATP5MC3': 'candidate',
         'NUP35': 'candidate', 'NUP54': 'candidate', 'NUP88': 'candidate', 'NUP93': 'candidate', 'NUP98': 'candidate', 'NUP188': 'candidate', 'NUP205': 'candidate', 'NUP214': 'candidate'}
for g, sid in EXTRA.items():
    if g in out: continue
    url = f'https://rest.uniprot.org/uniprotkb/search?query=gene_exact:{g}+AND+organism_id:9606+AND+reviewed:true&fields=accession,cc_subcellular_location&format=json&size=1'
    r = json.load(urllib.request.urlopen(url, timeout=30))['results'][0]
    locs, exp, go = [], False, []
    for c in r.get('comments', []):
        if c['commentType'] != 'SUBCELLULAR LOCATION': continue
        for l in c.get('subcellularLocations', []):
            v = l['location']
            locs.append(v['value'])
            exp = exp or any(e['evidenceCode'] == 'ECO:0000269' for e in v.get('evidences', []))
    for x in r.get('uniProtKBCrossReferences', []):
        if x['database'] == 'GO' and x['properties'][0]['value'].startswith('C:'): go.append(f"{x['properties'][0]['value'][2:]} ({x['id']})")
    out[g] = {'source': 'uniprot', 'accession': r['primaryAccession'], 'structure': sid,
              'reliability': 'Experimental' if exp else 'Annotated', 'main': locs, 'additional': [], 'go': go}
    n[sid] = n.get(sid, 0) + 1
for e in out.values(): e.setdefault('source', 'hpa')
doc = {'_schema': 'Subcellular location for genes of the structures in catalog.json. source is hpa (Human Protein Atlas, reliability Enhanced, Supported, Approved or Uncertain) or uniprot (genes missing from the HPA export, reliability Experimental when UniProt cites experimental evidence, else Annotated). main and additional are HPA location names; go lists "name (GO:id)". Rebuild with scripts/build-protein-location.py. cite is in citations.json.',
       'cite': 'hpa-subcellular', 'citeUniprot': 'uniprot-subcellular', 'locations': {k: {'en': k, 'zh-Hant': v} for k, v in ZH.items()}, 'genes': dict(sorted(out.items()))}
Path(__file__).parent.parent.joinpath('data/protein-location.json').write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
print(n, len(out))
