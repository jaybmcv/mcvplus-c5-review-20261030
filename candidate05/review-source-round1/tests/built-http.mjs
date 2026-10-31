import {createServer,connect} from 'node:net';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const artifact='D:/OpenClaw-workspace/artifacts/mcvplus-integrated-candidate05-20261031/evidence';
const guard='D:/OpenClaw-workspace/recovery/mcvplus-candidate05-emulator-20261031-1743/scripts/candidate05-loopback-only.mjs';
const allocation=createServer();await new Promise(r=>allocation.listen(0,'127.0.0.1',r));const port=allocation.address().port;await new Promise(r=>allocation.close(r));
const receipt={startedAt:new Date().toISOString(),port,checks:[]};
const child=spawn(process.execPath,['--import',guard,'node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p',String(port)],{cwd:process.cwd(),windowsHide:true,env:{SystemRoot:process.env.SystemRoot,PATH:process.env.PATH,NODE_OPTIONS:'--preserve-symlinks --preserve-symlinks-main',NEXT_TELEMETRY_DISABLED:'1',NODE_ENV:'production',C5_ENABLED:'permit-only'},stdio:['ignore','pipe','pipe']});
receipt.pid=child.pid;let output='';child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>output+=b);let closed=false;const completion=new Promise(resolve=>child.once('close',(code,signal)=>{closed=true;resolve({code,signal});}));
try{
 let ready=false;for(let i=0;i<80&&!closed;i++){try{if((await fetch('http://127.0.0.1:'+port+'/api/internal/qualification/read-only')).status===405){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}assert.ok(ready,'owned built server readiness');
 const url='http://127.0.0.1:'+port;
 for(const method of ['GET','HEAD','OPTIONS','PUT','DELETE']){assert.equal((await fetch(url+'/api/internal/qualification/read-only',{method})).status,405);receipt.checks.push(method+' 405');}
 const disabled=await fetch(url+'/api/internal/qualification/read-only',{method:'POST',headers:{'x-c5-binding':'SYNTHETIC-unusable','x-c5-binding-signature':'SYNTHETIC-unusable','x-c5-perimeter-secret':'SYNTHETIC-unusable','x-c5-invocation-secret':'SYNTHETIC-unusable'}});assert.equal(disabled.status,404);assert.deepEqual(await disabled.json(),{code:'candidate05_disabled'});receipt.checks.push('POST source fence 404 despite runtime permit-only and synthetic headers');
 for(const route of ['/','/api/purchases','/api/purchases/checkout','/api/internal/purchases/worker','/api/internal/qualification/other','/api/internal/qualification/read-only/extra']){assert.equal((await fetch(url+route,{method:'POST'})).status,404);receipt.checks.push('excluded '+route);}
 receipt.status='PASS';
}catch(error){receipt.status='FAIL';receipt.error=String(error.stack);process.exitCode=1;}
finally{
 if(!closed)child.kill('SIGKILL');receipt.childClose=await completion;
 try{process.kill(child.pid,0);receipt.processGone=false;}catch(error){receipt.processGone=error.code==='ESRCH';}
 receipt.listenerGone=await new Promise(resolve=>{const probe=connect({port,host:'127.0.0.1'});probe.once('connect',()=>{probe.destroy();resolve(false);});probe.once('error',()=>resolve(true));});
 if(!receipt.processGone||!receipt.listenerGone)process.exitCode=1;
 receipt.completedAt=new Date().toISOString();const tag=Date.now();fs.writeFileSync(artifact+'/BUILT-HTTP-'+tag+'.json',JSON.stringify(receipt,null,2));fs.writeFileSync(artifact+'/BUILT-HTTP-SERVER-'+tag+'.txt',output);console.log(JSON.stringify(receipt));
}
