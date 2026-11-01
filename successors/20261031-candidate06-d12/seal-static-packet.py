"""File hashing/text comparison only; no candidate import/compilation/test/SQL."""
from pathlib import Path
import json,hashlib,re,shutil
w=Path(__file__).parent;r=w/'candidate06-d12'
base=Path(r'D:\OpenClaw-workspace\artifacts\mcvplus-integrated-candidate05-20261031')
sha=lambda b:hashlib.sha256(b).hexdigest()
def row(p,root): 
 b=p.read_bytes();return {'path':p.relative_to(root).as_posix(),'bytes':len(b),'sha256':sha(b)}
refs=r/'provenance'/'recipe-reference';(refs/'config').mkdir(parents=True,exist_ok=True)
for name in ['config/provider-binding.json','README.md']:shutil.copyfile(r/'local-service'/name,refs/name)
service=r/'local-service'
old=json.loads((r/'provenance/CANDIDATE05-SERVICE-MANIFEST.json').read_bytes())
serviceRows=sorted([row(p,service) for p in service.rglob('*') if p.is_file() and p.name!='SOURCE-MANIFEST.json'],key=lambda x:x['path'])
(service/'SOURCE-MANIFEST.json').write_bytes((json.dumps({'candidate':'Candidate06-D12-local-service','appBuildId':old['appBuildId'],'files':serviceRows,'provenance':'Candidate05 immutable amendment inputs; exact pg_backend_pid baseline plus sole pg_stat_get_activity(integer) successor addition; disabled binding/app bytes inherited; recipe source-only NOT EXECUTED'},indent=2)+'\n').encode())
def signatures(p):
 s=p.read_bytes().decode();s=s.split('export const PURE_FUNCTIONS=Object.freeze([',1)[1].split(']);',1)[0]
 # Decode the literal quote escape only; never evaluate JavaScript.
 return [x.replace(r'\"','"') for x in re.findall(r"'([^']*)'",s)]
oldSets=[signatures(base/n) for n in ['driver/provider-contract.mjs','local-service/provider/readonly-db.mjs']]
newSets=[signatures(r/n) for n in ['driver/provider-contract.mjs','local-service/provider/readonly-db.mjs']]
sql=(r/'PROPOSED-SETUP-SQL.md').read_bytes().decode()
grants=re.findall(r'GRANT EXECUTE ON FUNCTION pg_catalog\.(.*?) TO c5_qualification_readonly;',sql)
arrays=re.findall(r'ARRAY\[(.*?)\]::text\[\]',sql,re.S)
assert len(arrays)==2,len(arrays)
sqlSets=[grants]+[re.findall(r"'([^']*)'",a) for a in arrays]
for oldset in oldSets:assert len(oldset)==len(set(oldset))==49
for newset in newSets+sqlSets:
 assert len(newset)==len(set(newset))==50
 assert set(newset)-set(oldSets[0])=={'pg_stat_get_activity(integer)'}
 assert not set(oldSets[0])-set(newset)
 assert set(newset)==set(newSets[0])
assert 'd12_dependency_currently_forbidden' not in sql
assert 'AS d12_dependency_required;' in sql
blocks=re.findall(chr(96)*3+r'sql\n(.*?)'+chr(96)*3,sql,re.S)
for i,b in enumerate(blocks):
 assert (r/'proposed-sql'/('PHASE-'+chr(65+i)+'.sql')).read_bytes()==b.encode()
 assert '\\quit 3' in b
baselineSql=(r/'provenance/ACCEPTED-SQL-REVIEW-V2.md').read_bytes().decode()
assert re.findall(chr(96)*3+r'sql\n(.*?)'+chr(96)*3,baselineSql,re.S)[0]==blocks[0]
baseline=json.loads((base/'FINAL-SOURCE-MANIFEST.json').read_bytes())
delta=[];same=[]
for f in baseline['files']:
 assert sha((base/f['path']).read_bytes())==f['sha256'],f['path']
 item=row(r/f['path'],r)
 if item['sha256']==f['sha256']:same.append(f['path'])
 else:delta.append({'path':f['path'],'beforeSha256':f['sha256'],'afterSha256':item['sha256']})
for n in ['driver/clients.mjs','driver/cases.mjs','driver/evidence.mjs']:
 assert n in same
assert all(f['path'] in same for f in baseline['files'] if f['path'].startswith(('tests/','app/')))
receipt={'candidate':'Candidate06-D12','kind':'static text and byte comparison; NOT candidate execution or tests','baselineCommit':'f7d2fe369098589364abcac9a7af7992d90042c2','baselineManifestSha256':sha((base/'FINAL-SOURCE-MANIFEST.json').read_bytes()),'baselineFilesReverified':70,'unchangedBaselinePaths':same,'changedBaselinePaths':delta,'sourceSetCounts':[len(x) for x in newSets],'sqlGrantAndArrayCounts':[len(x) for x in sqlSets],'soleAddedSignature':'pg_stat_get_activity(integer)','removedSignatures':[],'phaseAByteIdentical':True,'allThreeSqlGuardsPreserved':True,'unchangedAppAndTests':True,'candidateCodeExecuted':False,'recipeExecuted':False,'testsRun':False,'sqlParsedOrExecuted':False}
(r/'STATIC-RECEIPT.json').write_bytes((json.dumps(receipt,indent=2)+'\n').encode())
# Source/spec seal excludes itself and future review/delivery envelope.
rows=sorted([row(p,r) for p in r.rglob('*') if p.is_file() and p!=r/'FINAL-SOURCE-MANIFEST.json'],key=lambda x:x['path'])
final={'candidate':'Candidate06-D12','purpose':'source-only Option A delta; UNBUILT/UNTESTED/SQL UNEXECUTED; no S/C/V/T authority','baselineCommit':'f7d2fe369098589364abcac9a7af7992d90042c2','baselineManifestSha256':receipt['baselineManifestSha256'],'files':rows}
(r/'FINAL-SOURCE-MANIFEST.json').write_bytes((json.dumps(final,indent=2)+'\n').encode())
print(json.dumps({'files':len(rows),'manifestSha256':sha((r/'FINAL-SOURCE-MANIFEST.json').read_bytes()),'changedBaselinePaths':delta,'sourceSetCounts':receipt['sourceSetCounts'],'sqlSetCounts':receipt['sqlGrantAndArrayCounts']},indent=2))
