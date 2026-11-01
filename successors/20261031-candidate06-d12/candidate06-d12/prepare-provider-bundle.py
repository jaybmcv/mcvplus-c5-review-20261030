"""Source construction recipe only. NOT executed for this successor.
Requires retained immutable inputs/amendment-provider and a missing output local-service.
Never installs dependencies, builds the app, opens connections or starts a service.
The prebuilt app identity is inherited unchanged, not a new build claim.
"""
from pathlib import Path
import shutil,json,hashlib
r=Path(__file__).parent;src=r/'inputs'/'amendment-provider';out=r/'local-service'
assert not out.exists(),'local service bundle already exists; no overwrite/adoption'
rows=json.loads((src/'INPUT-MANIFEST.json').read_bytes())['files']
for row in rows:
 p=src/row['path'];assert hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256']
 dst=out/row['path'];dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,dst)
p=out/'provider'/'readonly-db.mjs';s=p.read_bytes().decode('utf-8')
# Match Candidate05's Windows text-write conversion before adding the LF exception comment.
s=s.replace('\r\n','\n').replace('\n','\r\n')
needle="'current_database()','inet_server_addr()'"
assert s.count(needle)==1,'function anchor missing'
s=s.replace(needle,"'pg_backend_pid()','pg_stat_get_activity(integer)','current_database()','inet_server_addr()'",1)
comment="// Activity-observation exception (not pure/immutable): dedicated disposable qualification cluster only.\n// pg_stat_get_activity permits cluster-wide basic and same-role fuller activity visibility; WHERE is not an ACL.\n"
s=s.replace('export const PURE_FUNCTIONS=Object.freeze([',comment+'export const PURE_FUNCTIONS=Object.freeze([',1)
p.write_bytes(s.encode('utf-8'))
# Preserve the exact reviewed disabled provider binding and README, not synthesized activation.
# Provenance holds reference copies solely to make this recipe self-contained.
for name in ['config/provider-binding.json','README.md']:
 dst=out/name;dst.parent.mkdir(parents=True,exist_ok=True)
 shutil.copyfile(r/'provenance'/'recipe-reference'/name,dst)
build=json.loads((r/'evidence'/'APP-BUILD-BINDING.json').read_bytes())['buildId']
files=[]
for p in sorted(out.rglob('*'),key=lambda p:p.relative_to(out).as_posix()):
 if p.is_file():files.append({'path':p.relative_to(out).as_posix(),'bytes':len(p.read_bytes()),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(out/'SOURCE-MANIFEST.json').write_bytes((json.dumps({'candidate':'Candidate06-D12-local-service','appBuildId':build,'files':files,'provenance':'Candidate05 immutable amendment inputs; exact pg_backend_pid baseline plus sole pg_stat_get_activity(integer) successor addition; disabled binding/app bytes inherited; recipe source-only NOT EXECUTED'},indent=2)+'\n').encode())
