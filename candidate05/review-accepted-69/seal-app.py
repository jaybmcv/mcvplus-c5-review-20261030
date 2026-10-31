from pathlib import Path
import hashlib,json,shutil,datetime
r=Path(__file__).parent;a=r/'app'
from build_identity import payload_entries,build_id
files=payload_entries(a)
build=build_id(files)
for name in ['run-binding.json','provider-binding.json']:
 p=a/'config'/name;b=json.loads(p.read_text(encoding='utf-8-sig'));b['buildId']=build;b['enabled']=False
 if name=='run-binding.json':b['permitPublicKey']=''
 p.write_text(json.dumps(b,indent=2)+'\n')
(a/'config/build-binding.json').write_text(json.dumps({'candidate':'Candidate05','buildId':build,'algorithm':'sha256(canonical JSON sorted path,bytes,sha256; keys sorted; separators comma/colon)','excludes':['config/build-binding.json','SOURCE-MANIFEST.json','node_modules','.next','*.tsbuildinfo'],'excludedSelfFields':{'config/run-binding.json':['buildId'],'config/provider-binding.json':['buildId']},'payloadFiles':files},indent=2)+'\n')
final=[]
for p in a.rglob('*'):
 if p.is_file() and not any(n in ['node_modules','.next'] for n in p.relative_to(a).parts) and p.name!='SOURCE-MANIFEST.json' and not p.name.endswith('.tsbuildinfo'):
  final.append({'path':p.relative_to(a).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(a/'SOURCE-MANIFEST.json').write_text(json.dumps({'buildId':build,'files':sorted(final,key=lambda x:x['path']),'devOnlyDependencyJunction':'node_modules -> read-only baseline; excluded from deliverable; no installation'},indent=2)+'\n')
baseline=Path(r'D:\OpenClaw-workspace\recovery\mcvplus-c5-eb71ec9')
t=a/'lib/server/purchases/creamery-transport.ts';original=baseline/'lib/server/purchases/creamery-transport.ts'
assert t.read_bytes()==original.read_bytes(),'ORIGINAL TRANSPORT DIFFERED'
out=Path(r'D:\OpenClaw-workspace\recovery\mcvplus-candidate05-build-20261031-r5')
for p in a.rglob('*'):
 if p.is_file() and not any(n in ['node_modules','.next'] for n in p.relative_to(a).parts):
  target=out/p.relative_to(a);target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,target)
(r/'evidence/APP-BUILD-BINDING.json').write_text(json.dumps({'buildId':build,'source':str(a),'buildCheckout':str(out),'sourceFiles':len(final),'transportSha256':hashlib.sha256(t.read_bytes()).hexdigest(),'transportByteIdentical':True},indent=2))
print(json.dumps({'buildId':build,'sourceFiles':len(final),'buildCheckout':str(out),'transportUnchanged':True}))
