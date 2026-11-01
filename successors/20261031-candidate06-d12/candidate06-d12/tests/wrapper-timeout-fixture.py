import subprocess,sys,os,time,json
child=subprocess.Popen([sys.executable,'-c','import time;time.sleep(60)'])
print('WRAPPER_OWNED_FIXTURE '+json.dumps({'root':os.getpid(),'child':child.pid}),flush=True)
time.sleep(60)
