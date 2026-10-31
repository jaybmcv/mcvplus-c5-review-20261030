import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fork} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {Campaign,PRIMARY,RESERVED} from './operator.mjs';
import {adapters} from './adapters.mjs';
import {replayStore} from './replay.mjs';
import {handle} from './qualification/handler.mjs';
import {RUN,ORIGIN} from './qualification/constants.mjs';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'synthetic',String(Date.now()));
fs.mkdirSync(root,{recursive:true});
let n=0;
function journal(){const run='SYNTHETIC-case-'+(++n),file=path.join(root,'SYNTHETIC-'+n+'.sqlite');return {run,file,c:new Campaign(file,run)};}
const plan=(caseId='A1',kind='http',expected=['200'])=>({caseId,kind,expected,authorization:'SYNTHETIC-approved'});
const observed=async({dispatchId})=>({dispatchId,ceased:true,receipt:'SYNTHETIC-independent-receipt'});
const ok={http:async()=>({status:'200'})};
function child(file,run,mode){return new Promise((resolve,reject)=>{const p=fork(new URL('./fixture-child.mjs',import.meta.url),[file,run,mode],{stdio:['ignore','pipe','pipe','ipc']});let message,err='';p.on('message',m=>message=m);p.stderr.on('data',x=>err+=x);p.on('error',reject);p.on('exit',code=>resolve({code,message,err}));});}
test('42 primary identities and six fixed reserved slots; primary exhaustion preserves reserved',async()=>{
 assert.equal(PRIMARY.length,42);assert.equal(new Set(PRIMARY).size,42);
 const {c}=journal();for(const id of PRIMARY)await c.dispatch(plan(id),ok,observed);
 await assert.rejects(c.dispatch({...plan('A1'),retryOf:1,retryAuthorization:'SYNTHETIC-explicit'},ok,observed),/quota/);
 for(const [id,slot]of Object.entries(RESERVED))assert.equal((await c.dispatch(plan(id),ok,observed)).slot,slot);
 assert.equal(c.snapshot().attempts.length,48);c.close();
});
test('same-process contention makes only one send and holds active through observation',async()=>{
 const {c}=journal();let release,entered=0;
 const first=c.dispatch(plan(),{http:async()=>{entered++;await new Promise(r=>release=r);return {status:'200'};}},observed);
 await assert.rejects(c.dispatch(plan('A2'),ok,observed),/active/);assert.equal(entered,1);release();await first;c.close();
});
test('independent-process contention cannot dispatch while active',async()=>{
 const {c,file,run}=journal();let release;
 const first=c.dispatch(plan(),{http:async()=>{await new Promise(r=>release=r);return {status:'200'};}},observed);
 const result=await child(file,run,'contend');assert.equal(result.code,0,result.err);assert.equal(result.message,'blocked');release();await first;c.close();
});
test('consumption and active state survive process death before acknowledgement',async()=>{
 const {c,file,run}=journal();c.close();
 const r=await child(file,run,'crash');assert.equal(r.code,23,r.err);
 const reopened=new Campaign(file,run);assert.equal(reopened.snapshot().attempts.length,1);assert.equal(reopened.snapshot().attempts[0].state,'consumed-before-send');
 await assert.rejects(reopened.dispatch(plan('A2'),ok,observed),/active/);assert.equal(reopened.recoveryReport().resumeAllowed,false);reopened.close();
});
test('expected denials consumed; explicit retry fresh slot; no retry/refund on uncertain error',async()=>{
 const {c}=journal();let sends=0;
 const denied={http:async()=>{sends++;return {status:'401'};}};
 await c.dispatch(plan('A1','http',['401']),denied,observed);
 await assert.rejects(c.dispatch(plan('A1'),ok,observed),/retry/);
 assert.equal((await c.dispatch({...plan('A1'),retryOf:1,retryAuthorization:'SYNTHETIC-retry'},ok,observed)).slot,2);
 await assert.rejects(c.dispatch(plan('A2'),{http:async()=>{sends++;throw Error('ack lost');}},observed),/HALTED/);
 await assert.rejects(c.dispatch(plan('A3'),ok,observed),/HALTED/);
 assert.equal(sends,2);assert.equal(c.snapshot().attempts.length,3);c.close();
});
test('unexpected HTTP status and missing or mismatched cessation fail closed',async()=>{
 for(const observe of [observed,async()=>({ceased:true,dispatchId:'wrong',receipt:'no'}),async({dispatchId})=>({dispatchId,ceased:false,receipt:'no'})]){
 const {c}=journal();await assert.rejects(c.dispatch(plan(),{http:async()=>({status:observe===observed?'503':'200'})},observe),/HALTED/);assert.ok(c.snapshot().campaign.halt);c.close();}
});
test('durability failure before send prevents transport; failure after send retains active',async()=>{
 const a=journal();a.c.db.exec("CREATE TRIGGER reject_insert BEFORE INSERT ON attempts BEGIN SELECT RAISE(ABORT,'disk fixture'); END;");
 let sends=0;await assert.rejects(a.c.dispatch(plan(),{http:async()=>{sends++;return {status:'200'};}},observed));assert.equal(sends,0);a.c.close();
 const b=journal();b.c.db.exec("CREATE TRIGGER reject_finish BEFORE UPDATE ON attempts BEGIN SELECT RAISE(ABORT,'disk fixture'); END;");
 await assert.rejects(b.c.dispatch(plan(),ok,observed),/HALTED/);assert.ok(b.c.snapshot().campaign.active);assert.equal(b.c.snapshot().attempts.length,1);b.c.close();
});
test('HTTP, SDK and DB all use same journal; SDK retry:null, SQLSTATE outcome',async()=>{
 const {c}=journal();let sdkCalls=0,dbCalls=0;
 const a=adapters({http:async()=>({status:'403'}),sdk:{getDocument:async(_q,o)=>{sdkCalls++;assert.equal(o.retry,null);return [{}];}},db:{query:async()=>{dbCalls++;throw {code:'42501'};}},document:{name:'SYNTHETIC'},statement:'SYNTHETIC-NOT-SQL'});
 await c.dispatch(plan('A1','http',['403']),a,observed);
 await c.dispatch(plan('A2','sdk',['200']),a,observed);
 await c.dispatch(plan('B7a','db',['42501']),a,observed);
 assert.equal(sdkCalls,1);assert.equal(dbCalls,1);assert.equal(c.snapshot().attempts.length,3);c.close();
});
test('operator anomaly halt persists and cannot be cleared by success',async()=>{
 const {c}=journal();await assert.rejects(c.dispatch(plan(),ok,async o=>{c.halt('unexpected-ingress','SYNTHETIC-ingress-receipt');return observed(o);}),/HALTED/);
 await assert.rejects(c.dispatch(plan('A2'),ok,observed),/HALTED/);assert.equal(c.recoveryReport().resumeAllowed,false);c.close();
});
test('replay create atomic across callers, run+slot not deployment, error/unknown ack no refund',async()=>{
 const keys=new Set();let calls=0;
 const client={createDocument:async(q,o)=>{calls++;assert.equal(o.retry,null);if(keys.has(q.documentId))throw {code:6};keys.add(q.documentId);return [{}];}};
 const store=replayStore(client,{projectId:'synthetic-project',databaseId:'replay',qualificationProject:'synthetic-project'});
 const results=await Promise.all(Array.from({length:12},()=>store.claim({runId:'SYNTHETIC-replay',slot:1})));assert.equal(results.filter(x=>x.claimed).length,1);
 assert.equal((await store.claim({runId:'SYNTHETIC-replay',slot:1,build:'changed'})).code,'replay');assert.equal(calls,13);
 const broken=replayStore({createDocument:async()=>{throw {code:4};}},{projectId:'synthetic-project',databaseId:'replay',qualificationProject:'synthetic-project'});
 assert.equal((await broken.claim({runId:'SYNTHETIC',slot:2})).claimed,false);
 assert.throws(()=>replayStore(client,{projectId:'synthetic-project',databaseId:'(default)',qualificationProject:'synthetic-project'}),/separate/);
});
function boundary(){
 const b={enabled:true,runId:RUN,attempts:48,providerOrigin:ORIGIN,firebaseProject:'mcv-plus-phase-2-test',database:'(default)',projectId:'prj_SYNTHETIC',deploymentId:'dpl_SYNTHETIC',deploymentHost:'synthetic.vercel.app',buildId:'a'.repeat(64),requires:{platformProtectionAllDeployments:true,dedicatedReadOnlyIamReviewed:true,providerPrivilegeReview:true}};
 const e={C5_ENABLED:'permit-only',C5_REVIEWED_PURCHASE_PROJECT_ID:'prj_OTHER',VERCEL_PROJECT_ID:b.projectId,VERCEL_DEPLOYMENT_ID:b.deploymentId,VERCEL_URL:b.deploymentHost,C5_BUILD_ID:b.buildId,C5_PERIMETER_SECRET:'p'.repeat(32),C5_INVOCATION_SECRET:'i'.repeat(32)};
 const request=()=>new Request('https://synthetic.vercel.app/api/internal/qualification/read-only',{method:'POST',headers:{'x-c5-perimeter-secret':e.C5_PERIMETER_SECRET,'x-c5-invocation-secret':e.C5_INVOCATION_SECRET,'x-c5-attempt':'1','x-c5-run':RUN}});
 return {b,e,request};
}
test('hosted boundary replay/failure/unconfigured reject before child, claimed slot never refunded',async()=>{
 const {b,e,request}=boundary();let children=0,events=0;
 const run=async()=>{children++;return {status:200,code:'qualified',workerCollected:true};},anomaly=async()=>events++;
 assert.equal((await handle(request(),b,e,{run})).status,503);
 for(const replay of [{claim:async()=>({claimed:false,code:'replay'})},{claim:async()=>{throw Error('lost ack');}}]){
 const response=await handle(request(),b,e,{run,replay,anomaly});assert.ok([409,503].includes(response.status));}
 assert.equal(children,0);assert.equal(events,2);
 let claimed=false;const replay={claim:async()=>claimed?{claimed:false,code:'replay'}:(claimed=true,{claimed:true})};
 assert.equal((await handle(request(),b,e,{run,replay,anomaly})).status,200);
 assert.equal((await handle(request(),b,e,{run,replay,anomaly})).status,409);assert.equal(children,1);
});
test('malformed/unauthenticated gate never calls replay or creates worker',async()=>{
 const {b,e}=boundary();let touches=0;
 const r=await handle(new Request('https://synthetic.vercel.app/no'),b,e,{run:async()=>touches++,replay:{claim:async()=>touches++},anomaly:async()=>{}});
 assert.equal(r.status,401);assert.equal(touches,0);
});
