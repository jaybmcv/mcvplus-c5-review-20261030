from pathlib import Path
import os,hashlib,json,sys,zipfile,datetime
r=Path(__file__).parent
excluded={'node_modules','.next','.git','__pycache__'}
def walk(folder):
 for base,dirs,files in os.walk(folder,followlinks=False):
  dirs[:]=sorted(d for d in dirs if d not in excluded and not Path(base,d).is_symlink())
  for name in sorted(files):
   p=Path(base,name)
   if p.is_symlink() or name.endswith(('.tsbuildinfo','.sqlite','.sqlite-journal')):continue
   yield p
def row(p):
 b=p.read_bytes();return {'path':p.relative_to(r).as_posix(),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
manifest=r/'FINAL-SOURCE-MANIFEST.json'
if sys.argv[1]=='source':
 dirs=[p for p in r.iterdir() if p.is_dir() and p.name not in ({'inputs','evidence','copied-candidate04'}|excluded) and not p.name.startswith('review')]
 paths=[p for folder in dirs for p in walk(folder)]
 for name in ['SETUP-PACKET.md','REPLAY-DEPENDENCY.md','CREDENTIAL-BOUNDARIES.md','seal-app.py','verify-source-build.py','build_identity.py','test-build-identity.py','run-local.py','seal-delivery.py']:
  if (r/name).is_file():paths.append(r/name)
 rows=sorted((row(p) for p in paths),key=lambda x:x['path'])
 content={'candidate':'Candidate05','baselineCommit':'0f9a6c12c05887cb090e76964e1ca5b15438ac9d','purpose':'exact disabled source/spec reviewed; not Setup or execution authorization','files':rows}
 manifest.write_text(json.dumps(content,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({'sourceFiles':len(rows),'manifestSha256':hashlib.sha256(manifest.read_bytes()).hexdigest()}))
elif sys.argv[1]=='archive':
 data=json.loads(manifest.read_text())
 for item in data['files']:
  assert row(r/item['path'])==item,'source changed after source manifest: '+item['path']
 selected={r/item['path'] for item in data['files']}
 selected.add(manifest)
 for pattern in ['*REPORT*.md','*REVIEW*.md','BUILD-RESULT.md','REVIEW-DISPOSITION.md','TASK.md']:
  selected.update(r.glob(pattern))
 for folder in ['copied-candidate04','review-source-round1','review-source-round2','review-doc-round1']:
  if (r/folder).is_dir():selected.update(walk(r/folder))
 if (r/'evidence').is_dir():
  selected.update(p for p in (r/'evidence').iterdir() if p.is_file() and p.suffix in {'.txt','.json','.jsonl','.md'} and p.name!='OTHER-PROJECT-INVENTORY.txt')
 selected={p for p in selected if p.is_file()}
 rows=sorted((row(p) for p in selected),key=lambda x:x['path'])
 payload={'candidate':'Candidate05','files':rows,'excluded':'dev junctions/node_modules/build caches/runtime synthetic databases and retained temporary dirs; raw account-bearing gcloud inventory; private correspondence/communications/prompts; originals remain local'}
 package=r/'PACKAGE-MANIFEST.json';package.write_text(json.dumps(payload,indent=2)+'\n',encoding='utf-8');selected.add(package)
 archive=r/'MCVPLUS-CANDIDATE05-INTEGRATED-20261031.zip'
 with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for p in sorted(selected,key=lambda p:p.relative_to(r).as_posix()):
   b=p.read_bytes()
   if b'-----BEGIN PRIVATE KEY-----\nM' in b or b'-----BEGIN RSA PRIVATE KEY-----\nM' in b:raise RuntimeError('private key material refused: '+str(p))
   info=zipfile.ZipInfo('candidate05/'+p.relative_to(r).as_posix(),date_time=(2026,10,31,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;z.writestr(info,b)
 with zipfile.ZipFile(archive) as z:
  for item in rows:
   assert hashlib.sha256(z.read('candidate05/'+item['path'])).hexdigest()==item['sha256']
 delivery={'archive':archive.name,'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'sourceManifestSha256':hashlib.sha256(manifest.read_bytes()).hexdigest(),'packageManifestSha256':hashlib.sha256(package.read_bytes()).hexdigest(),'sourceFiles':len(data['files']),'archiveFiles':len(selected),'archiveFilesHashVerified':len(rows),'reviewedSourceUnchanged':True}
 (r/'DELIVERY.json').write_text(json.dumps(delivery,indent=2)+'\n');print(json.dumps(delivery))
else:raise SystemExit('source or archive required')
