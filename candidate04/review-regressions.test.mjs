import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Campaign} from './operator.mjs';
import {handle,runChild,bounded} from './qualification/handler.mjs';
import {closeReplay} from './replay.mjs';
import {RUN,ORIGIN} from './qualification/constants.mjs';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'synthetic','regressions-'+Date.now());fs.mkdirSync(root,{recursive:true});
let n=0;
function journal(){return new Campaign(path.join(root,'SYNTHETIC-'+(++n)+'.sqlite'),'SYNTHETIC-review-'+n);}
const plan=()=>({caseId:'A1',kind:'http',expected:['200'],authorization:'SYNTHETIC-approved'});
const observed=async({dispatchId})=>({dispatchId,ceased:true,receipt:'SYNTHETIC-evidence'});
test('empty halt rejected; preexisting empty halt is terminal, not falsy',async()=>{
 const c=journal();assert.throws(()=>c.halt(''),/nonempty/);c.db.exec("UPDATE campaign SET halt=''");await assert.rejects(c.dispatch(plan(),{http:async()=>({status:'200'})},observed),/HALTED/);c.halt('later anomaly');assert.equal(c.snapshot().campaign.halt,'');c.close();
});
test('expected outcomes, transport kind and returned status are captured, not mutable',async()=>{
 const c=journal(),p=plan();let release;const raw={status:'503'};
 const promise=c.dispatch(p,{http:async()=>{await new Promise(r=>release=r);return raw;}},async info=>{raw.status='200';assert.equal(info.kind,'http');assert.equal(info.result.status,'503');assert.throws(()=>info.result.status='200');return observed(info);});
 p.expected.push('503');p.kind='db';release();await assert.rejects(promise,/HALTED/);assert.equal(c.snapshot().attempts[0].kind,'http');c.close();
});
test('halt during observation retains active; completion has no post-release DB read',async()=>{
 const c=journal();await assert.rejects(c.dispatch(plan(),{http:async()=>({status:'200'})},async o=>{c.halt('unexpected ingress');return observed(o);}),/HALTED/);assert.ok(c.snapshot().campaign.active);c.close();
 const d=journal();let committed=false;const exec=d.db.exec.bind(d.db),prepare=d.db.prepare.bind(d.db);
 d.db.exec=function(sql){const v=exec(sql);if(sql==='COMMIT'&&d.snapshot().attempts.some(x=>x.state==='complete'))committed=true;return v;};
 d.db.prepare=function(sql){if(committed)throw Error('post-completion read forbidden');return prepare(sql);};
 await d.dispatch(plan(),{http:async()=>({status:'200'})},observed);d.db.prepare=prepare;assert.equal(d.snapshot().campaign.active,null);d.close();
});
function boundary(signal){
 const b={enabled:true,runId:RUN,attempts:48,providerOrigin:ORIGIN,firebaseProject:'mcv-plus-phase-2-test',database:'(default)',projectId:'prj_SYNTHETIC',deploymentId:'dpl_SYNTHETIC',deploymentHost:'synthetic.vercel.app',buildId:'a'.repeat(64),requires:{platformProtectionAllDeployments:true,dedicatedReadOnlyIamReviewed:true,providerPrivilegeReview:true}};
 const e={C5_ENABLED:'permit-only',C5_REVIEWED_PURCHASE_PROJECT_ID:'prj_OTHER',VERCEL_PROJECT_ID:b.projectId,VERCEL_DEPLOYMENT_ID:b.deploymentId,VERCEL_URL:b.deploymentHost,C5_BUILD_ID:b.buildId,C5_PERIMETER_SECRET:'p'.repeat(32),C5_INVOCATION_SECRET:'i'.repeat(32)};
 const r=new Request('https://synthetic.vercel.app/api/internal/qualification/read-only',{method:'POST',signal,headers:{'x-c5-perimeter-secret':e.C5_PERIMETER_SECRET,'x-c5-invocation-secret':e.C5_INVOCATION_SECRET,'x-c5-attempt':'1','x-c5-run':RUN}});
 return {b,e,r};
}
test('late/uncertain/aborted replay claim never creates worker; late claim not refunded',async()=>{
 let children=0,claims=0;const {b,e,r}=boundary();const run=async()=>{children++;return {status:200};};
 const response=await handle(r,b,e,{run,replay:{claim:async()=>{await new Promise(x=>setTimeout(x,35));claims++;return {claimed:true};}},anomaly:async()=>{},admissionMs:10});
 assert.equal(response.status,503);await new Promise(x=>setTimeout(x,45));assert.equal(claims,1);assert.equal(children,0);
 const a=new AbortController();a.abort();const q=boundary(a.signal);
 await handle(q.r,q.b,q.e,{run,replay:{claim:async()=>{claims++;return {claimed:true};}},anomaly:async()=>{}});
 assert.equal(claims,1);assert.equal(children,0);
 await assert.rejects(bounded(()=>new Promise(()=>{}),Date.now()+10),/uncertain/);
});
function fakeChild({closeOnKill=true}={}){
 const c=new EventEmitter();c.exitCode=null;c.killed=false;c.sent=0;c.kill=()=>{c.killed=true;if(closeOnKill)queueMicrotask(()=>c.emit('close'));return closeOnKill;};c.send=()=>c.sent++;return c;
}
const job=()=>({slot:1,deadline:Date.now()+500,budgetMs:500});
const valid={status:200,code:'qualified',workerInstance:'a'.repeat(36),workerSequence:1};
test('pre-aborted and expired jobs never spawn',async()=>{
 const a=new AbortController();a.abort();let spawned=0;const spawnImpl=()=>{spawned++;return fakeChild();};
 assert.equal((await runChild(job(),{},a.signal,{spawnImpl,collectionMs:20})).status,504);
 assert.equal((await runChild({...job(),deadline:Date.now()-1},{},undefined,{spawnImpl,collectionMs:20})).status,504);assert.equal(spawned,0);
});
test('abort remains terminal despite queued success; replay credentials excluded from child',async()=>{
 const a=new AbortController(),c=fakeChild();let captured;
 const p=runChild(job(),{C5_FIREBASE_PRIVATE_KEY:'SYNTHETIC-reader',C5_REPLAY_PRIVATE_KEY:'SYNTHETIC-writer'},a.signal,{spawnImpl:(_e,_a,options)=>{captured=options.env;return c;},collectionMs:20});
 a.abort();c.emit('message',valid);const result=await p;assert.equal(result.status,504);assert.equal(result.code,'cancelled');assert.equal(result.workerCollected,true);assert.equal(captured.C5_REPLAY_PRIVATE_KEY,undefined);assert.equal(captured.C5_FIREBASE_PRIVATE_KEY,'SYNTHETIC-reader');
});
test('failed collection bounded and unverified; delayed success cannot override deadline',async()=>{
 const c=fakeChild({closeOnKill:false}),start=Date.now();
 const result=await runChild({...job(),budgetMs:50},{},undefined,{spawnImpl:()=>c,collectionMs:15});
 assert.equal(result.status,504);assert.equal(result.workerCollected,false);assert.equal(result.code,'collection_unverified');assert.ok(Date.now()-start<1000);
 c.emit('message',valid);c.emit('close'); // fake only; no real child/process remains.
});
test('cleanup rejection and nonsettlement cannot discard response or hang',async()=>{
 let notices=0;await closeReplay({close:async()=>{throw Error('fixture');}},()=>notices++,10);
 await closeReplay({close:()=>new Promise(()=>{})},()=>notices++,10);assert.equal(notices,2);
});
test('synthetic retry authorization provenance persists',async()=>{
 const c=journal();await c.dispatch(plan(),{http:async()=>({status:'200'})},observed);
 await c.dispatch({...plan(),retryOf:1,retryAuthorization:'SYNTHETIC-explicit-retry'},{http:async()=>({status:'200'})},observed);
 const attempts=c.snapshot().attempts;assert.equal(attempts[1].authorization,'SYNTHETIC-approved');assert.equal(attempts[1].retry_authorization,'SYNTHETIC-explicit-retry');c.close();
});

test('captured adapter retains method receiver without mutable plan dependency',async()=>{
 const c=journal(),transport={status:'200',async http(){return {status:this.status};}};
 await c.dispatch(plan(),transport,observed);assert.equal(c.snapshot().attempts[0].status,'200');c.close();
});
