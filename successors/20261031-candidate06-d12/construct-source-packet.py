"""File-only packet construction/hashing; never executes candidate code."""
from pathlib import Path
import hashlib,json,shutil,re,difflib
base=Path(r'D:\OpenClaw-workspace\artifacts\mcvplus-integrated-candidate05-20261031')
work=Path(__file__).parent;out=work/'candidate06-d12';out.mkdir(exist_ok=False)
sha=lambda b:hashlib.sha256(b).hexdigest()
manifest=json.loads((base/'FINAL-SOURCE-MANIFEST.json').read_bytes())
assert sha((base/'FINAL-SOURCE-MANIFEST.json').read_bytes())=='7c2fca43299c2f70886335b33228829ba9f7fdf4472bf1f10f7c3b1a7b4d888a'
for f in manifest['files']:
 data=(base/f['path']).read_bytes();assert sha(data)==f['sha256'] and len(data)==f['bytes'],f['path']
 p=out/f['path'];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
(out/'provenance').mkdir()
for src,dst in [('FINAL-SOURCE-MANIFEST.json','CANDIDATE05-FINAL-SOURCE-MANIFEST.json'),('local-service/SOURCE-MANIFEST.json','CANDIDATE05-SERVICE-MANIFEST.json'),('prepare-provider-bundle.py','CANDIDATE05-prepare-provider-bundle.py')]:
 shutil.copyfile(base/src,out/'provenance'/dst)
shutil.copytree(base/'inputs',out/'inputs')
(out/'evidence').mkdir();shutil.copyfile(base/'evidence/APP-BUILD-BINDING.json',out/'evidence/APP-BUILD-BINDING.json')
sqlbase=Path(r'D:\OpenClaw-workspace\artifacts\mcvplus-candidate05-sql-review-v2-20261031\SUBMITTED-REVIEW-V2.md')
shutil.copyfile(sqlbase,out/'provenance/ACCEPTED-SQL-REVIEW-V2.md')
comment="// Activity-observation exception (not pure/immutable): dedicated disposable qualification cluster only.\n// pg_stat_get_activity permits cluster-wide basic and same-role fuller activity visibility; WHERE is not an ACL.\n"
for name in ['driver/provider-contract.mjs','local-service/provider/readonly-db.mjs']:
 p=out/name;s=p.read_bytes().decode()
 assert s.count('export const PURE_FUNCTIONS=Object.freeze([')==1
 s=s.replace('export const PURE_FUNCTIONS=Object.freeze([',comment+'export const PURE_FUNCTIONS=Object.freeze([',1)
 if name.startswith('driver'):s=s.replace(" 'pg_backend_pid()',"," 'pg_backend_pid()','pg_stat_get_activity(integer)',",1)
 else:s=s.replace("'pg_backend_pid()','current_database()'","'pg_backend_pid()','pg_stat_get_activity(integer)','current_database()'",1)
 p.write_bytes(s.encode())
s=sqlbase.read_bytes().decode()
s=s.replace('# C5 Candidate05 — document-only Setup and SQL review','# C5 Candidate06-D12 — source-only successor proposed Setup and SQL')
s=s.replace('**31 October 2026 · Revision 2 · PROPOSED / NOT AUTHORIZED / SQL UNEXECUTED**','**31 October 2026 · Option A successor · SOURCE CHANGE AUTHORIZED / SQL EXECUTION NOT AUTHORIZED / UNTESTED**')
a=s.index('Prepared for Wes and Henri.');b=s.index('## 2. Frozen inputs reviewed')
s=s[:a]+'''Prepared for Wes and Henri. Candidate05 and accepted Revision 2 are unchanged predecessors; their exact bytes are retained in provenance. This successor incorporates only the accepted Option A function-permission correction. No candidate execution, builds, tests, PostgreSQL parsing or SQL execution, Setup, installation, staging, provisioning, deployment, credential/IAM changes or hosted attempts are authorized or performed.

## 1. Narrow successor disposition

Candidate05 had 49 signatures and omitted the activity function required by its unchanged D12 view query. This successor adds exactly pg_catalog.pg_stat_get_activity(integer) to BOTH source sets, the Phase B grant list and BOTH Phase C inventories (50 each). No other privilege predicate or executable query changes. Static dependency alignment is not runtime compatibility proof.

The requester accepts this visibility tradeoff SOLELY for the dedicated disposable qualification cluster. EXECUTE allows direct calls with other PIDs or NULL: basic metadata across the cluster, fuller activity (including query text/client/start metadata where available) for own sessions and roles whose privileges the caller has; ordinary-role masking applies to unrelated roles. The query WHERE filter is NOT a permission boundary. The provider shares this authority. No pg_monitor, pg_read_all_stats, memberships, ownership, grant options or alternate role are added. Never apply to a shared, old-55432, Alpha or canonical cluster.

D12 query, row validation, retained Client, server backend PID/start evidence and V4a independent sameSession/noReconnect requirements remain byte-identical. Cached D12 JSON carried by V4a is not independent continuity proof; retain observer connection/backend correlation and lifecycle evidence. No extra probes/retries/slots are added. Purchases OFF; recovery DISARMED; approval pin UNSET; Alpha/canonical unchanged; all 48 attempts preserved (supplied invariant, not a fresh ledger census).

The guarded SQL below is PROPOSED ONLY. All three unconditional review-only guards remain. Missing, NULL, extra, erroneous or contradictory evidence blocks acceptance. Setup remains BLOCKED pending the separate exact S packet, prerequisites and authorization; cloud C/V and campaign T remain independent.

''' +s[b:]
s=s.replace('## 2. Frozen inputs reviewed','## 2. Frozen predecessor inputs (historical; not successor identities)')
s=s.replace('Review the three proposed SQL phases below, D12 mismatch, default privileges, global PUBLIC implications and exact 49 grants.','Review the three proposed SQL phases below, the Option A activity exception, default privileges, global PUBLIC implications and exact 50 grants.')
s=s.replace('EXECUTE exactly 49 functions','EXECUTE exactly 50 functions')
s=s.replace('D12 function gap remains.','Activity exception is explicit and restricted to the dedicated disposable cluster.')
s=s.replace('The 49-signature EXECUTE restriction is deliberately retained unchanged; no SQL claim of full D12 compatibility is made.','The exact 50-signature restriction is the frozen 49 plus only pg_stat_get_activity(integer). D12 static dependency alignment is not a live compatibility result.')
s=s.replace('-- Exact frozen 49-signature baseline.','-- Exact successor 50-signature set: frozen 49 plus pg_stat_get_activity(integer).')
anchor='GRANT EXECUTE ON FUNCTION pg_catalog.pg_backend_pid() TO c5_qualification_readonly;'
assert s.count(anchor)==1
s=s.replace(anchor,anchor+'\nGRANT EXECUTE ON FUNCTION pg_catalog.pg_stat_get_activity(integer) TO c5_qualification_readonly;')
s=s.replace('-- D12 is NOT qualified by this draft: see the unresolved function dependency.','-- D12 dependency is aligned statically; runtime qualification remains UNTESTED.')
assert s.count("  'pg_backend_pid()',")==2
s=s.replace("  'pg_backend_pid()',","  'pg_backend_pid()',\n  'pg_stat_get_activity(integer)',")
s=s.replace('-- All 49 must resolve and have EXECUTE; metadata inspection only.','-- All 50 must resolve and have EXECUTE; metadata inspection only.')
s=s.replace('-- Explicit unresolved D12 dependency. Required baseline result is FALSE.\n-- Do NOT "repair" this by granting EXECUTE or a monitoring role during Setup.','-- Required successor D12 dependency. Required result is Boolean TRUE.\n-- No other function, monitoring role or grant-on-error is permitted.')
s=s.replace('AS d12_dependency_currently_forbidden;','AS d12_dependency_required;')
s=s.replace('Required result under the frozen baseline','Required result under the successor contract')
s=s.replace('Exactly 49 distinct requested signatures; all 49 resolve','Exactly 50 distinct requested signatures; all 50 resolve')
s=s.replace('The complete set equals both decoded frozen source sets, not merely the same count.','The complete set equals both decoded successor source sets, not merely the same count. Successor minus frozen must be exactly {pg_stat_get_activity(integer)} and frozen minus successor empty; duplicates are forbidden.')
lines=s.splitlines(True)
for i,line in enumerate(lines):
 if line.startswith('| D12 forbidden-dependency baseline |'):
  lines[i]='| D12 required dependency | Exactly one Boolean TRUE for pg_catalog.pg_stat_get_activity(integer). FALSE, NULL, missing, erroneous or contradictory output blocks acceptance. TRUE establishes only catalog authority, not D12 runtime compatibility, session continuity or campaign authorization. |\n'
s=''.join(lines)
s=s.replace('and 49 function EXECUTE grants','and 50 function EXECUTE grants')
s=s.replace('D12 remains incompatible, operational confinement remains unverified','D12 is statically aligned but runtime-unverified, operational confinement remains unverified')
a=s.index("2. Resolve D12's view/function dependency");b=s.index('\n3. Check PUBLIC',a)
s=s[:a]+'''2. Review the exact Option A sole addition in both source sets, Phase B and both Phase C arrays. Requester visibility acceptance is restricted to the dedicated disposable cluster; the function is not own-session-only. Preserve D12/retained-Client/independent continuity byte-exactly and all strict predicates. No other role family, live grant, replacement query or silent fallback.''' +s[b:]
s=s.replace('do not execute SQL to resolve that question under this document-only task.','do not execute SQL to resolve that question under this source-only task.')
s=s.replace('D12 mismatch has an explicit disposition. If unresolved, omit all database provisioning','the D12 Option A source/SQL disposition and exact successor manifest have been independently accepted. If unresolved, omit all database provisioning')
s=s.replace("Ask Henri's independent SQL reviewer to review this exact draft, especially the D12 dependency and private-cluster PUBLIC routine revocations.","Obtain independent static review of this exact successor, especially the sole D12 activity addition and unchanged private-cluster PUBLIC routine revocations.")
s=s.replace('Do not implement a new checker, expand tests, change Candidate05, execute SQL or provision resources in response to this document.','Do not implement a new checker, expand or execute tests, change Candidate05, execute SQL or provision resources in response to this document. Source-only acceptance conveys no S/C/V/T permission.')
(out/'PROPOSED-SETUP-SQL.md').write_bytes(s.encode())
blocks=re.findall(chr(96)*3+r'sql\n(.*?)'+chr(96)*3,s,re.S);assert len(blocks)==3,len(blocks)
(out/'proposed-sql').mkdir()
for i,block in enumerate(blocks):
 assert '\\quit 3' in block
 (out/'proposed-sql'/('PHASE-'+chr(65+i)+'.sql')).write_bytes(block.encode())
for name in ['SETUP-PACKET.md','local-service/README.md']:
 p=out/name;old=p.read_bytes()
 header='> Candidate06-D12 source-only successor. Current authority: root README.md, PROPOSED-SETUP-SQL.md and REMAINING-WORK.md.\n> Sole added activity signature: pg_catalog.pg_stat_get_activity(integer), both sets 49 -> 50.\n> Dedicated disposable cluster only; not pure/immutable or own-session-only. No execution/Setup authority.\n> Historical Candidate05 text below is retained context, not a successor manifest or fresh runtime receipt.\n\n'
 p.write_bytes(header.encode()+old)
delta=[]
for f in manifest['files']:
 data=(out/f['path']).read_bytes()
 if sha(data)!=f['sha256']:
  delta.append({'path':f['path'],'beforeSha256':f['sha256'],'afterSha256':sha(data)})
  if f['path'].endswith(('.mjs','.md')):
   (out/'provenance'/(f['path'].replace('/','__')+'.diff')).write_text(''.join(difflib.unified_diff((base/f['path']).read_bytes().decode().splitlines(True),data.decode().splitlines(True),fromfile='Candidate05/'+f['path'],tofile='Candidate06-D12/'+f['path'])),encoding='utf-8')
for f in manifest['files']:assert sha((base/f['path']).read_bytes())==f['sha256']
(work/'CONSTRUCTION-RECEIPT.json').write_text(json.dumps({'candidate':'Candidate06-D12','sourceOnly':True,'baselineFilesVerified':70,'baselineManifestSha256':sha((base/'FINAL-SOURCE-MANIFEST.json').read_bytes()),'initialChangedFiles':delta,'candidateCodeExecuted':False,'testsRun':False,'sqlExecuted':False},indent=2)+'\n')
print(json.dumps({'root':str(out),'baselineVerified':70,'initialChangedFiles':delta},indent=2))
