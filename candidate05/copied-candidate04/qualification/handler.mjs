// This module has no SDK/network imports. Gates execute before child creation.
import {budget} from './budget.mjs';
import {randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import path from 'node:path';
import {authorize} from './gates.mjs';
const instance=Object.freeze({id:randomUUID(),initializedAt:new Date().toISOString()});
let sequence=0;
export const processIdentity=()=>({...instance,sequence});
// Promise deadline does not undo a possibly committed replay claim. Late settlement
// remains consumed, and is never followed by child creation.
export async function bounded(start,deadline,signal) {
 if(signal?.aborted||Date.now()>=deadline)throw Error('admission cancelled');
 let timer,abort;
 try {
  return await Promise.race([
   Promise.resolve().then(start),
   new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('admission uncertain')),Math.max(1,deadline-Date.now()));abort=()=>reject(Error('admission cancelled'));signal?.addEventListener('abort',abort,{once:true});})
  ]);
 } finally {clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
export async function handle(request,binding,env,{run=runChild,replay,anomaly,deadline=Date.now()+15000,admissionMs=2000}={}) {
  const started=performance.now();
  const gate=authorize(request,binding,env);
  if(gate.status)return Response.json({code:gate.code},{status:gate.status,headers:{'Cache-Control':'no-store'}});
  // Replay storage MUST acknowledge an immutable claim before any child creation.
  // Missing store/audit configuration and uncertain writes all fail closed.
  if(!replay || typeof replay.claim!=='function' || typeof anomaly!=='function')
    return Response.json({code:'admission_unconfigured'},{status:503});
  let claim;
  try {claim=await bounded(()=>replay.claim({runId:binding.runId,slot:gate.slot}),Math.min(deadline,Date.now()+admissionMs),request.signal);}
  catch {claim={claimed:false,code:'replay-store-unavailable'};}
  if(claim?.claimed!==true) {
    try {await bounded(()=>anomaly({event:claim?.code==='replay'?'unexpected-replay':'replay-store-unavailable',runId:binding.runId,slot:gate.slot}),deadline,request.signal);}
    catch {return Response.json({code:'audit_unavailable'},{status:503});}
    return Response.json({code:claim?.code==='replay'?'replay':'admission_unavailable'},{status:claim?.code==='replay'?409:503});
  }
  if(request.signal?.aborted||Date.now()>=deadline)return Response.json({code:'admission_cancelled'},{status:504});
  const correlation=randomUUID(),seq=++sequence;
  let result;
  try {result=await run({slot:gate.slot,correlation,binding,deadline,budgetMs:Math.max(0,deadline-Date.now())},env,request.signal);}
  catch {result={status:503,code:'unavailable',workerCollected:false};}
  // No raw child errors, SDK values, provider body, identifier or credentials leave the boundary.
  const body={code:result.code,correlation,processInstance:instance.id,processInitializedAt:instance.initializedAt,
    invocationSequence:seq,buildId:binding.buildId,deploymentId:binding.deploymentId,runId:binding.runId,
    attempt:gate.slot,sdkVersion:'14.2.0',durationMs:Math.ceil(performance.now()-started),workerCollected:result.workerCollected===true,workerInstance:result.workerInstance??null,workerInitializedAt:result.workerInitializedAt??null,workerSequence:result.workerSequence??null,sdkIdentity:result.sdkIdentity??null,cancellationAttempted:result.cancellationAttempted===true,terminationToCloseMs:result.terminationToCloseMs??null};
  return Response.json(body,{status:result.status,headers:{'Cache-Control':'no-store'}});
}
export async function runChild(job,env,signal,{entry=path.join(process.cwd(),'qualification/worker.mjs'),onSpawn=()=>{},executable=process.execPath,spawnImpl=spawn,collectionMs=750}={}) {
 const remaining=Math.min(job.budgetMs??15000,job.deadline-Date.now());
 if(signal?.aborted||remaining<=collectionMs)return {status:504,code:signal?.aborted?'cancelled':'deadline',workerCollected:false,cancellationAttempted:false};
 const childEnv={SystemRoot:process.env.SystemRoot,PATH:process.env.PATH,NODE_NO_WARNINGS:'1'};
 for(const key of ['C5_PROVIDER_PERIMETER_SECRET','C5_PROVIDER_BEARER','C5_CF_CLIENT_ID','C5_CF_CLIENT_SECRET','C5_FIREBASE_CLIENT_EMAIL','C5_FIREBASE_PRIVATE_KEY'])
  if(typeof env[key]==='string')childEnv[key]=env[key];
 const child=spawnImpl(executable,['--conditions=react-server','--experimental-strip-types',entry],
  {cwd:process.cwd(),env:childEnv,stdio:['ignore','ignore','ignore','ipc'],windowsHide:true});
 let result={status:503,code:'unavailable'},settled=false,terminal=false,terminationAt,cancellationAttempted=false,collectionTimer;
 const clock=budget(remaining);
 return await new Promise(resolve=>{
  const finish=collected=>{
   if(settled)return;settled=true;clearTimeout(timer);clearTimeout(collectionTimer);signal?.removeEventListener('abort',abort);
   resolve({...result,workerCollected:collected,cancellationAttempted,terminationToCloseMs:collected&&terminationAt!==undefined?Math.ceil(performance.now()-terminationAt):null});
  };
  const stop=()=>{
   if(settled)return;
   cancellationAttempted=true;
   if(terminationAt===undefined) {
    terminationAt=performance.now();
    collectionTimer=setTimeout(()=>{terminal=true;result={status:504,code:'collection_unverified'};finish(false);},Math.max(1,Math.min(collectionMs,clock.remaining())));
    try {if(child.exitCode===null&&!child.killed)child.kill('SIGKILL');}catch {}
   }
  };
  const abort=()=>{if(settled)return;terminal=true;result={status:504,code:'cancelled'};stop();};
  const timer=setTimeout(()=>{if(settled)return;terminal=true;result={status:504,code:'deadline'};stop();},Math.max(1,remaining-collectionMs));
  child.on('error',()=>{if(settled)return;terminal=true;result={status:503,code:'spawn_failed'};stop();});
  child.on('message',m=>{
   if(settled||terminal)return;
   if(m&&['qualified','unavailable','deadline'].includes(m.code)&&[200,503,504].includes(m.status)&&/^[a-f0-9-]{36}$/.test(m.workerInstance??'')&&m.workerSequence===1){
    result={status:clock.remaining()>0?m.status:504,code:clock.remaining()>0?m.code:'deadline',workerInstance:m.workerInstance,workerInitializedAt:m.workerInitializedAt,workerSequence:1,sdkIdentity:m.sdkIdentity&&/^[a-f0-9-]{36}$/.test(m.sdkIdentity.id??'')?{id:m.sdkIdentity.id,initializedAt:m.sdkIdentity.initializedAt}:null};stop();
   }
  });
  child.once('close',()=>finish(true));
  signal?.addEventListener('abort',abort,{once:true});
  try {onSpawn(child);}catch {terminal=true;result={status:503,code:'identity_probe_failed'};stop();return;}
  if(signal?.aborted)abort();
  else if(clock.remaining()<=collectionMs){terminal=true;result={status:504,code:'deadline'};stop();}
  else try {child.send({...job,budgetMs:clock.remaining()},error=>{if(error&&!settled){terminal=true;result={status:503,code:'ipc_uncertain'};stop();}});}catch {terminal=true;result={status:503,code:'ipc_uncertain'};stop();}
 });
}
