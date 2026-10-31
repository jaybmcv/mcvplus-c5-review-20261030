from pathlib import Path
import os,sys,json,subprocess,datetime
root=Path(__file__).parent
e=root/'evidence'
e.mkdir(exist_ok=True)
sys.stdout.reconfigure(encoding='utf-8',errors='replace')
label=sys.argv[1]
cwd=sys.argv[2]
command=sys.argv[3:]
env={k:v for k,v in os.environ.items() if k.upper() in ['SYSTEMROOT','WINDIR','COMSPEC','PATHEXT','PATH','TEMP','TMP','LOCALAPPDATA','APPDATA','USERPROFILE','PROGRAMFILES','PROGRAMFILES(X86)']}
env.update(NODE_OPTIONS='--preserve-symlinks --preserve-symlinks-main',NEXT_TELEMETRY_DISABLED='1',CI='true',METADATA_SERVER_DETECTION='none',FIREBASE_CLI_DISABLE_UPDATE_CHECK='true')
runtime=e/'runtime-tmp'
runtime.mkdir(exist_ok=True)
env.update(TMP=str(runtime),TEMP=str(runtime))
if label=='emulator-conformance':
 env['NODE_OPTIONS']+=' --import=file:///D:/OpenClaw-workspace/recovery/mcvplus-candidate05-emulator-20261031-1743/scripts/candidate05-loopback-only.mjs'
if label.startswith('emulator'):
 env['PATH']=r'D:\OpenClaw-workspace\recovery\firebase-cli-cache-rc502\_npx\7750544ccf494d8b\node_modules\.bin'+os.pathsep+env['PATH']
 env.update(GCLOUD_PROJECT='demo-mcv-purchases',FIRESTORE_EMULATOR_HOST='127.0.0.1:8089')
# Logs are append-only runs: a failure can never be overwritten by a later retry.
tag=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
log=e/(label+'-'+tag+'.txt')
record={'label':label,'cwd':cwd,'command':command,'environmentKeys':sorted(env),'explicitEnvironment':{k:env[k] for k in ['NODE_OPTIONS','GCLOUD_PROJECT','FIRESTORE_EMULATOR_HOST','TMP','TEMP','CI'] if k in env},'startedAt':tag,'log':str(log)}
with log.open('w',encoding='utf-8') as f:
 f.write(json.dumps(record)+'\n');f.flush()
 try:
  p=subprocess.Popen(command,cwd=cwd,env=env,stdout=f,stderr=subprocess.STDOUT)
  record['pid']=p.pid
  record['exitCode']=p.wait(timeout=540)
 except Exception as ex:
  record['error']=str(ex)
  record['exitCode']=1
 f.write('\nRESULT '+json.dumps(record)+'\n')
with (e/'COMMANDS.jsonl').open('a') as f:f.write(json.dumps(record)+'\n')
print(json.dumps(record))
print(log.read_text(encoding='utf-8',errors='replace')[-18000:])
sys.exit(record['exitCode'])
