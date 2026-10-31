// This module has no SDK/network imports. Gates execute before child creation.
import {budget} from './budget.mjs';
import {randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import path from 'node:path';
import {authorize} from './gates.mjs';
const instance=Object.freeze({id:randomUUID(),initializedAt:new Date().toISOString()});
let sequence=0;
export const processIdentity=()=>({...instance,sequence});
export async function handle(request,binding,env,{run=runChild}={}) {
  const started=performance.now(),deadline=Date.now()+15000;
  const gate=authorize(request,binding,env);
  if(gate.status)return Response.json({code:gate.code},{status:gate.status,headers:{'Cache-Control':'no-store'}});
  const correlation=randomUUID(),seq=++sequence;
  let result;
  try {result=await run({slot:gate.slot,correlation,binding,deadline,budgetMs:Math.max(0,15000-(performance.now()-started))},env,request.signal);}
  catch {result={status:503,code:'unavailable',workerCollected:false};}
  // No raw child errors, SDK values, provider body, identifier or credentials leave the boundary.
  const body={code:result.code,correlation,processInstance:instance.id,processInitializedAt:instance.initializedAt,
    invocationSequence:seq,buildId:binding.buildId,deploymentId:binding.deploymentId,runId:binding.runId,
    attempt:gate.slot,sdkVersion:'14.2.0',durationMs:Math.ceil(performance.now()-started),workerCollected:result.workerCollected===true,workerInstance:result.workerInstance??null,workerInitializedAt:result.workerInitializedAt??null,workerSequence:result.workerSequence??null,sdkIdentity:result.sdkIdentity??null,cancellationAttempted:result.cancellationAttempted===true,terminationToCloseMs:result.terminationToCloseMs??null};
  return Response.json(body,{status:result.status,headers:{'Cache-Control':'no-store'}});
}
export async function runChild(job,env,signal,{entry=path.join(process.cwd(),'qualification/worker.mjs'),onSpawn=()=>{},fixtureEnv={},executable=process.execPath}={}) {
  // Deliberate allowlist: no ADC, proxy settings, inherited NODE_OPTIONS or shared credentials.
  const childEnv={SystemRoot:process.env.SystemRoot,PATH:process.env.PATH,NODE_NO_WARNINGS:'1'};
  for(const key of ['C5_PROVIDER_PERIMETER_SECRET','C5_PROVIDER_BEARER','C5_CF_CLIENT_ID','C5_CF_CLIENT_SECRET','C5_FIREBASE_CLIENT_EMAIL','C5_FIREBASE_PRIVATE_KEY'])
    if(typeof env[key]==='string')childEnv[key]=env[key];
  const child=spawn(executable,['--conditions=react-server','--experimental-strip-types',entry],
    {cwd:process.cwd(),env:{...childEnv,...fixtureEnv},stdio:['ignore','ignore','ignore','ipc'],windowsHide:true});
  // ChildProcess object keeps the OS process identity; never enumerate/kill by name/port.
  let result={status:503,code:'unavailable'},closed=false,terminationAt,cancellationAttempted=false;const clock=budget(job.budgetMs??Math.max(0,job.deadline-Date.now()));
  return await new Promise(resolve=>{
    const finish=()=>{if(closed)return;closed=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);resolve({...result,workerCollected:true,cancellationAttempted,terminationToCloseMs:terminationAt===undefined?null:Math.ceil(performance.now()-terminationAt)});};
    const stop=()=>{cancellationAttempted=true;if(child.exitCode===null&&!child.killed){terminationAt=performance.now();child.kill('SIGKILL');}};
    const abort=()=>{result={status:504,code:'cancelled'};stop();};
    const timer=setTimeout(()=>{result={status:504,code:'deadline'};stop();},Math.max(1,clock.remaining()-750));
    child.on('error',()=>{result={status:503,code:'spawn_failed'};stop();});
    child.on('message',m=>{
      if(m&&['qualified','unavailable','deadline'].includes(m.code)&&[200,503,504].includes(m.status)&&/^[a-f0-9-]{36}$/.test(m.workerInstance??'')&&m.workerSequence===1){
        result={status:clock.remaining()>0?m.status:504,code:clock.remaining()>0?m.code:'deadline',workerInstance:m.workerInstance,workerInitializedAt:m.workerInitializedAt,workerSequence:1,sdkIdentity:m.sdkIdentity&&/^[a-f0-9-]{36}$/.test(m.sdkIdentity.id??'')?{id:m.sdkIdentity.id,initializedAt:m.sdkIdentity.initializedAt}:null};stop();}
    });
    child.once('close',finish);
    signal?.addEventListener('abort',abort,{once:true});
    try{onSpawn(child);}catch{result={status:503,code:'identity_probe_failed'};stop();return;}
    if(signal?.aborted)abort();else if(clock.remaining()<=0)abort();else child.send({...job,budgetMs:clock.remaining()},error=>{if(error)stop();});
  });
}
