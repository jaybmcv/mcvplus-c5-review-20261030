from pathlib import Path
import shutil,json,hashlib
r=Path(__file__).parent;src=r/'inputs'/'amendment-provider';out=r/'local-service'
assert not out.exists(),'local service bundle already exists'
rows=json.loads((src/'INPUT-MANIFEST.json').read_text())['files']
for row in rows:
 p=src/row['path'];assert hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256']
 dst=out/row['path'];dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,dst)
p=out/'provider'/'readonly-db.mjs';s=p.read_text();needle="'current_database()','inet_server_addr()'"
assert needle in s,'pure function anchor missing'
s=s.replace(needle,"'pg_backend_pid()','current_database()','inet_server_addr()'",1);p.write_text(s)
build=json.loads((r/'evidence'/'APP-BUILD-BINDING.json').read_text())['buildId']
binding={'enabled':False,'candidate':'Candidate05','runId':'c5-readonly-20261029-owner-review-1','deploymentId':'UNBOUND','buildId':build,'scopes':['members:read','reservations:read'],'slotsDirectory':'UNPROVISIONED','logDirectory':'UNPROVISIONED','status':'source-only; no installed target or usable credential'}
(out/'config'/'provider-binding.json').write_text(json.dumps(binding,indent=2)+'\n')
(out/'README.md').write_text('''# Disabled conventional provider source bundle
This is source only, NOT an installer or operational stage. No dependencies installed, cluster created, secret supplied, listener or Windows service started.
Layout preserves provider/ sibling qualification/ and config/ imports. Provider target is loopback55443; DB target loopback55442/mcvplus_c5_roq_20261029. Binding enabled=false/deploymentUNBOUND/mutable directoriesUNPROVISIONED.
The pinned existing pg8.23.0 declaration/lock are retained. Later Setup must verify/copy its exact dependency inventory into protected code; source declaration is not installed-runtime acceptance. No node_modules included.
Only administrator-owned configuration can later change the binding under separately reviewed authorization. No activation, usable permit, signing key, cloud provisioning or arbitrary connection target is provided.
The exact pure function pg_catalog.pg_backend_pid() is included in both service and driver allowlists for D12 session identity; future narrowly scoped Setup grants must match. No actual GRANT is performed here.
See ../SETUP-PACKET.md for conventional services/ACL/storage/loading requirements and partial containment. Services remain uninstalled; that proposal does not authorize this entry point to run except a configuration-denied offline fixture.
''')
files=[]
for p in sorted(out.rglob('*')):
 if p.is_file():files.append({'path':p.relative_to(out).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(out/'SOURCE-MANIFEST.json').write_text(json.dumps({'candidate':'Candidate05-local-service','appBuildId':build,'files':files,'provenance':'exact input hashes plus disabled binding and exact pg_backend_pid allowlist addition'},indent=2)+'\n')
print(json.dumps({'files':len(files),'appBuildId':build,'entryDisabled':True,'installed':False}))
