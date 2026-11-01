from pathlib import Path
import hashlib,json,subprocess,os,datetime
r=Path(__file__).parent;a=r/'app';build=Path(r'D:\OpenClaw-workspace\recovery\mcvplus-candidate05-build-20261031-r6');b=json.loads((a/'config/build-binding.json').read_text())
checks=[]
for entry in json.loads((a/'SOURCE-MANIFEST.json').read_text())['files']:
 for name,base in [('source',a),('built input',build)]:
  p=base/entry['path'];checks.append({'check':name+' '+entry['path'],'pass':p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest()==entry['sha256']})
from build_identity import payload_entries
checks.append({'check':'actual immutable configuration included in payload identity','pass':payload_entries(a)==b['payloadFiles']})
canonical=json.dumps(b['payloadFiles'],sort_keys=True,separators=(',',':')).encode()
checks.append({'check':'canonical content build binding','pass':hashlib.sha256(canonical).hexdigest()==b['buildId']})
checks.append({'check':'Next BUILD_ID equals sealed content identity','pass':(build/'.next/BUILD_ID').read_text().strip()==b['buildId']})
checks.append({'check':'permanent fence and empty public key','pass':'const CANDIDATE_ENABLED=false' in (a/'app/api/internal/qualification/read-only/route.ts').read_text() and json.loads((a/'config/run-binding.json').read_text())['permitPublicKey']==''})
transport='lib/server/purchases/creamery-transport.ts'
checks.append({'check':'original transport exact bytes','pass':(a/transport).read_bytes()==(Path(r'D:\OpenClaw-workspace\recovery\mcvplus-c5-eb71ec9')/transport).read_bytes()})
for entry in json.loads((r/'evidence/COPIED-SOURCE-MANIFEST.json').read_text()):
 if entry['path'].startswith('copied-candidate04'):
  checks.append({'check':'unmodified copied Candidate04 '+entry['path'],'pass':hashlib.sha256((r/entry['path']).read_bytes()).hexdigest()==entry['sha256']})
app_paths=json.loads((build/'.next/server/app-paths-manifest.json').read_text())
checks.append({'check':'only qualification application route','pass':list(app_paths)==['/api/internal/qualification/read-only/route']})
trace_file=build/'.next/server/app/api/internal/qualification/read-only/route.js.nft.json'
trace=json.loads(trace_file.read_text())['files']
for required in ['qualification/worker.mjs','qualification/handler.mjs','qualification/replay.mjs','qualification/sdk.mjs','lib/server/purchases/creamery-transport.ts']:
 checks.append({'check':'traced '+required,'pass':any(p.replace('\\','/').endswith(required) for p in trace)})
for forbidden in ['purchases/composition','purchases/application','purchases/api-production','app/api/purchases','purchases/worker.ts','purchases/recovery.ts']:
 checks.append({'check':'no traced '+forbidden,'pass':not any(forbidden in p.replace('\\','/') for p in trace)})
syntax=[]
for p in sorted((r/'driver').glob('*.mjs'))+sorted((a/'qualification').glob('*.mjs'))+sorted((r/'tests').glob('*.mjs')):
 result=subprocess.run([r'C:\Users\HENRI\AppData\Roaming\npm\node.exe','--check',str(p)],capture_output=True,text=True,encoding='utf-8')
 syntax.append({'path':str(p.relative_to(r)),'exitCode':result.returncode,'output':result.stdout+result.stderr})
checks.append({'check':'all syntax checks','pass':all(x['exitCode']==0 for x in syntax)})
report={'timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),'buildId':b['buildId'],'checks':checks,'syntax':syntax,'appFiles':len(json.loads((a/'SOURCE-MANIFEST.json').read_text())['files']),'traceFiles':len(trace),'appPaths':app_paths}
(r/'evidence/SOURCE-AND-BUILD-VERIFICATION.json').write_text(json.dumps(report,indent=2))
print(json.dumps({'checks':len(checks),'passed':sum(c['pass'] for c in checks),'syntaxChecks':len(syntax),'traceFiles':len(trace),'buildId':b['buildId'],'failures':[x for x in checks if not x['pass']]}))
if not all(c['pass'] for c in checks):raise SystemExit(1)
