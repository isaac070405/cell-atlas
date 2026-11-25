"""Build data/bcl2-compare.json (the Bcl-2 family table in Compare) from data/bcl2-family/.
Run: python3 scripts/build-bcl2-compare.py
Counts are unique PDB IDs per family member. X-ray, NMR and cryo-EM add up to the total for each member."""
import csv, json
from pathlib import Path

root = Path(__file__).parent.parent
rows = list(csv.DictReader(open(root / 'data/bcl2-family/bcl2_family_pdb_catalogue.csv', newline='', encoding='utf-8')))
summ = {r['family_member']: r for r in csv.DictReader(open(root / 'data/bcl2-family/bcl2_family_pdb_summary.csv', newline='', encoding='utf-8'))}

# member -> (id, zh-Hant class, Module B structure in catalog.json)
# structure is None for members with no Module B structure yet
MEMBERS = [('Bcl-2', '1G5M'), ('Bcl-xL', '1MAZ'), ('MCL-1', '2PQK'), ('BID', None), ('BIM', None), ('BIK', None), ('BAX', '1F16'), ('BAK', '2IMS'), ('BOK', None)]
# human accession when the catalogue has no human entry for the member (BIK has no PDB entries)
HUMAN = {'BIK': 'Q13323'}
ZH_CLASS = {'Anti-apoptotic': '抗凋亡', 'Pro-apoptotic BH3-only activator': '促凋亡 BH3-only 活化蛋白', 'Pro-apoptotic BH3-only sensitiser': '促凋亡 BH3-only 敏化蛋白', 'Pro-apoptotic pore former': '促凋亡成孔蛋白'}
NAME = {'Bcl-2': 'BCL-2', 'Bcl-xL': 'BCL-XL', 'MCL-1': 'MCL-1', 'BID': 'BID', 'BIM': 'BIM', 'BAX': 'BAX', 'BAK': 'BAK', 'BOK': 'BOK', 'BIK': 'BIK'}

out = []
for m, sid in MEMBERS:
    mine = [r for r in rows if r['family_member'] == m]
    ids = {r['pdb_id'] for r in mine}
    s = summ[m]
    assert len(ids) == int(s['n_PDB_entries']), m
    human = sorted({r['uniprot'] for r in mine if r['species'] == 'Homo sapiens'}) or ([HUMAN[m]] if m in HUMAN else [])
    assert len(human) == 1, (m, human)
    xray, nmr, em = int(s['X-ray']), int(s['NMR']), int(s['cryo-EM'])
    assert xray + nmr + em == len(ids), m
    out.append({'id': NAME[m], 'name': {'en': NAME[m], 'zh-Hant': NAME[m]},
                'class': {'en': s['BCL2_class'], 'zh-Hant': ZH_CLASS[s['BCL2_class']]},
                'uniprot': human[0], 'structure': sid, 'entries': len(ids), 'xray': xray, 'nmr': nmr, 'cryoem': em, 'peptideOnly': int(s['entries_BH3_peptide_only']),
                'bestResolution': float(s['best_resolution_A']) if s['best_resolution_A'] else None,
                'firstRelease': int(float(s['first_release'])) if s['first_release'] else None, 'lastRelease': int(float(s['last_release'])) if s['last_release'] else None})
doc = {'_schema': 'Bcl-2 family members in the Compare view. entries counts unique PDB IDs per member (UniProt accession searches, see data/bcl2-family/); xray, nmr and cryoem add up to entries; bestResolution is in Å and the release years are null when the member has no PDB entries; structure is the Module B entry in catalog.json, or null when the member has none yet; peptideOnly counts entries that hold only a BH3 peptide; uniprot is the human accession. cite is in citations.json. Rebuild with scripts/build-bcl2-compare.py.',
       'cite': 'bcl2-pdb-catalogue', 'members': out}
(root / 'data/bcl2-compare.json').write_text(json.dumps(doc, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(len(out), [m['entries'] for m in out])
