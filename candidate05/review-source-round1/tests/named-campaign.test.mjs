import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {EventEmitter} from 'node:events';
import {fileURLToPath} from 'node:url';
import {CASES,PRIMARY,RESERVED,B7,TARGETS} from '../driver/cases.mjs';
import {NamedCampaign} from '../driver/campaign.mjs';
import {CaseExecutor,createDbSession,createHttpClient,captureCredentials,createSdkSession} from '../driver/clients.mjs';
import {retainedTokenAuth,createReadOnlySdk,createRetainedReadOnlySdk} from '../app/qualification/sdk.mjs';
import {DOCUMENT,ORIGIN} from '../app/qualification/constants.mjs';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'../evidence','named-'+Date.now());fs.mkdirSync(root,{recursive:true});let serial=0;
const proof=async info=>({source:'independent-platform-and-admin',snapshots:3,ceased:true,dispatchId:info.dispatchId,receipt:'SYNTHETIC-independent',fanoutReconciled:true,unlistedDispatches:0,operations:info.transcript.map(x=>({...x,dispatched:true,ceased:true})),timingVerified:true,workerCollected:true,noLateContinuation:true,sameParent:true,sequenceIncreased:true,sameSession:true,noReconnect:true,newPlatformInstance:true,idle15Minutes:true});
const options={authorization:'SYNTHETIC-reviewed',contracts:{'access-status':{reviewedReceipt:'SYNTHETIC-policy',rawStatuses:['403']},'supported-permission-evaluation':{reviewedReceipt:'SYNTHETIC-policy'},'preview-retirement-status':{reviewedReceipt:'SYNTHETIC-policy',rawStatuses:['404']}},evidence:Object.fromEntries(['marker-mismatch',...Array.from({length:8},(_,i)=>'C'+(i+1))].map(k=>[k,true]))};
function backend(status){return {synthetic:true,async runCase(c,ctx,count){for(const step of c.steps)await count(step,async()=>({status:'OK'}));return {status:status??c.expected[0],fanoutComplete:true};}};}
function campaign(b=backend(),observer=proof,now){const file=path.join(root,'SYNTHETIC-'+(++serial)+'.sqlite');return new NamedCampaign(file,'SYNTHETIC-named-'+serial,{backend:b,observe:observer,now});}
async function baselines(c){for(const id of ['D1','D4','D7','D12'])await c.dispatch(id,options);}

test('authoritative revised mapping: 42+6, exact B7 operations, schedules and fixed new target',()=>{
 assert.equal(PRIMARY.length,42);assert.equal(Object.keys(CASES).length,48);assert.deepEqual(RESERVED,{V1:43,V2:44,V3:45,V4a:46,V4b:47,V5:48});
 assert.equal(CASES.D9.minute,15);assert.equal(CASES.D10.minute,60);assert.equal(CASES.D11.minute,75);assert.equal(CASES.D12.steps[0],'db-login');
 assert.equal(TARGETS.provider,ORIGIN);assert.equal(TARGETS.db.port,55442);assert.equal(TARGETS.db.database,'mcvplus_c5_roq_20261029');
 assert.deepEqual(Object.keys(B7),['B7a','B7b','B7c','B7d','B7e','B7f','B7g']);assert.match(B7.B7g,/nextval\('public.throwaway_sequence'\)/);
 for(const id of Object.keys(B7))assert.deepEqual(CASES[id].steps,['db-login','db-begin-read-write','db-negative','db-rollback']);
 assert.throws(()=>CASES.A1.expected.push('200'));assert.throws(()=>TARGETS.db.port=5432);
});
test('all 48 named cases dispatch in synthetic scope with fixed reserved slots',async()=>{
 let clock=10_000_000;const c=campaign(backend(),proof,()=>clock);
 await baselines(c);for(const group of ['bearer','cf','firebase','db','preview'])c.recordChange(group,{acknowledgedAt:clock,receipt:'SYNTHETIC-change'});clock+=75*60000;
 for(const id of [...PRIMARY,...Object.keys(RESERVED)])if(!['D1','D4','D7','D12'].includes(id))await c.dispatch(id,options);
 // Evidenced denial skips later propagation checkpoints rather than spending them.
 const s=c.snapshot();assert.ok(s.attempts.length>=42&&s.attempts.length<=48);for(const [id,slot]of Object.entries(RESERVED))assert.equal(s.attempts.find(x=>x.case_id===id).slot,slot);
 assert.equal(s.campaign.active,null);c.close();
});
test('unsupported Access/permission contracts and fault capabilities remain BLOCKED without spending',async()=>{
 const c=campaign();for(const id of ['B3','B8','V5','C2'])assert.equal((await c.dispatch(id,{authorization:'SYNTHETIC-reviewed'})).state,'BLOCKED');assert.equal(c.snapshot().attempts.length,0);c.close();
});
test('B7 seven separate slots; login BEGIN one negative ROLLBACK all counted before entry',async()=>{
 let c;const logs=[];const exec=new CaseExecutor({synthetic:true,credentials:{dbPassword:'SYNTHETIC-only'},dbFactory:()=>({async connect(){logs.push('login');assert.equal(c.snapshot().attempts.at(-1).state,'consumed-before-send');assert.equal(c.snapshot().fanout.filter(x=>x.dispatch_id===c.snapshot().attempts.at(-1).dispatch_id).length,4);return {status:'OK'};},async statement(op,id){logs.push(op);return {status:op==='db-negative'?'42501':'OK'};},async close(){logs.push('close');}})});
 c=campaign(exec);for(const id of Object.keys(B7))assert.equal((await c.dispatch(id,options)).state,'EXPECTED-NEGATIVE-CONTAINED');
 assert.equal(c.snapshot().attempts.length,7);assert.equal(c.snapshot().fanout.length,28);assert.equal(logs.filter(x=>x==='db-rollback').length,7);c.close();
});
test('B7 unexpected success still rolls back and durably HALTs without refund',async()=>{
 const log=[];const exec=new CaseExecutor({synthetic:true,credentials:{dbPassword:'SYNTHETIC-only'},dbFactory:()=>({connect:async()=>({status:'OK'}),statement:async op=>{log.push(op);return {status:'OK'};},close:async()=>log.push('close')})});
 const c=campaign(exec);await assert.rejects(c.dispatch('B7a',options),/HALTED/);assert.deepEqual(log,['db-begin-read-write','db-negative','db-rollback','close']);assert.ok(c.snapshot().campaign.active);c.close();
});
test('B7 cleanup error remains unknown, consumed and halted',async()=>{
 const exec=new CaseExecutor({synthetic:true,credentials:{dbPassword:'SYNTHETIC-only'},dbFactory:()=>({connect:async()=>({status:'OK'}),statement:async op=>({status:op==='db-rollback'?'08006':op==='db-negative'?'42501':'OK'}),close:async()=>{}})});
 const c=campaign(exec);await assert.rejects(c.dispatch('B7b',options),/HALTED/);assert.equal(c.snapshot().fanout.length,4);assert.equal(c.recoveryReport().resumeAllowed,false);c.close();
});
test('B7 omitted rollback cannot be reported complete',async()=>{
 const c=campaign({synthetic:true,async runCase(s,ctx,count){for(const op of s.steps.slice(0,-1))await count(op,async()=>({status:'OK'}));return {status:'42501',fanoutComplete:true};}});await assert.rejects(c.dispatch('B7c',options),/HALTED/);c.close();
});
test('local socket/child exit cannot substitute for independent cessation',async()=>{
 for(const patch of [{source:'local-socket-close'},{localSocketCloseOnly:true},{ceased:false},{fanoutReconciled:false},{unlistedDispatches:1},{snapshots:7}]){
 const c=campaign(backend(),async info=>({...await proof(info),...patch}));await assert.rejects(c.dispatch('A1',options),/HALTED/);assert.ok(c.snapshot().campaign.active);c.close();}
});
test('mutable input and backend replacement cannot change expected status or contract',async()=>{
 let release;const b=backend('503');const saved=b.runCase;b.runCase=async(...args)=>{await new Promise(r=>release=r);return saved(...args);};const c=campaign(b);const input=structuredClone(options);const pending=c.dispatch('A1',input);input.authorization='altered';b.runCase=backend('401').runCase;release();await assert.rejects(pending,/HALTED/);assert.equal(c.snapshot().attempts[0].authorization,'SYNTHETIC-reviewed');c.close();
});
test('propagation success is observed, not revocation pass; horizon success halts',async()=>{
 let status;let clock=5_000_000;const b=backend();const original=b.runCase;b.runCase=async(c,ctx,count)=>{const r=await original(c,ctx,count);return {...r,status:status??r.status};};const c=campaign(b,proof,()=>clock);await baselines(c);c.recordChange('cf',{acknowledgedAt:clock,receipt:'SYNTHETIC-change'});status='200';assert.equal((await c.dispatch('D5',options)).state,'PROPAGATION-OBSERVED');clock+=15*60000;await assert.rejects(c.dispatch('D6',options),/HALTED/);c.close();
});
test('revocation baselines and checkpoint timing are mandatory and denial skips future checkpoints',async()=>{
 let clock=1_000_000;const c=campaign(backend(),proof,()=>clock);assert.throws(()=>c.recordChange('db',{acknowledgedAt:clock,receipt:'SYNTHETIC-change'}),/baselines/);await baselines(c);c.recordChange('bearer',{acknowledgedAt:clock,receipt:'SYNTHETIC-change'});await assert.rejects(c.dispatch('D3',options),/checkpoint/);await c.dispatch('D2',options);clock+=15*60000;assert.equal((await c.dispatch('D3',options)).state,'SKIPPED');c.close();
});
test('pg Client is bounded, fixed-target and one-connect only; query authority refused',async()=>{
 let configuration,connects=0,queries=[];class Fake extends EventEmitter{constructor(o){super();configuration=o;}async connect(){connects++;}async query(q){queries.push(q);return {rows:[]};}async end(){}}
 const credentials={dbPassword:'SYNTHETIC-only'},s=createDbSession(credentials,{Client:Fake});credentials.dbPassword='mutated';await s.connect();await assert.rejects(s.connect(),/retry forbidden/);await assert.rejects(s.statement('DROP DATABASE anything'),/fixed/);await s.statement('db-begin-read-write');await s.statement('db-negative','B7g');await s.statement('db-rollback');await s.close();
 assert.equal(connects,1);assert.equal(configuration.password,'SYNTHETIC-only');assert.equal(configuration.host,'127.0.0.1');assert.equal(configuration.port,55442);assert.equal(configuration.keepAlive,false);assert.equal(configuration.connectionTimeoutMillis,1500);assert.deepEqual(queries.map(q=>q.text),['BEGIN READ WRITE',B7.B7g,'ROLLBACK']);
});
test('failed pg connect cannot reconnect and old-password login reports only expected SQLSTATE',async()=>{
 let attempts=0;class Fake extends EventEmitter{async connect(){attempts++;throw {code:'28P01'};}async end(){}}
 const s=createDbSession({dbPassword:'SYNTHETIC-only'},{Client:Fake});assert.equal((await s.connect()).status,'28P01');await assert.rejects(s.connect(),/retry forbidden/);assert.equal(attempts,1);await s.close();
});
test('SDK retains issued token without refresh and refuses expiry despite caller mutation',async()=>{
 let now=1000;const input={issuedToken:'SYNTHETIC-token',expiresAt:10000};const auth=retainedTokenAuth(input,()=>now);input.issuedToken='changed';input.expiresAt=999999;const client=await auth.getClient();assert.equal((await client.getRequestHeaders()).get('authorization'),'Bearer SYNTHETIC-token');await assert.rejects(client.refreshAccessToken(),/forbidden/);now=9500;await assert.rejects(auth.getClient(),/refresh forbidden/);
});
test('fresh v1 client per worker, retry:null and no transparent retries; retained probe reuses exact client',async()=>{
 const instances=[];class Fake{constructor(options){this.options=options;instances.push(this);this.calls=0;}async getDocument(request,options){this.calls++;assert.equal(options.retry,null);assert.equal(request.name,DOCUMENT);return [{name:DOCUMENT,fields:{marker:{stringValue:'c5-readonly-20261029'}}}];}async close(){this.closed=true;}}
 const token={issuedToken:'SYNTHETIC-token',issuedAt:Date.now(),expiresAt:Date.now()+60000};const a=await createReadOnlySdk(token,{FirestoreClient:Fake}),b=await createReadOnlySdk(token,{FirestoreClient:Fake});const deadline={remaining:()=>5000,check:()=>{}};await a.readCanary(deadline);await assert.rejects(a.readCanary(deadline),/budget/);await b.readCanary(deadline);assert.notEqual(a.identity.id,b.identity.id);assert.equal(instances[0].options['grpc.enable_retries'],0);await a.close();await b.close();
 const retained=await createRetainedReadOnlySdk(token,{FirestoreClient:Fake});for(let i=0;i<6;i++)await retained.readCanary(deadline);await assert.rejects(retained.readCanary(deadline),/budget/);assert.equal(instances[2].calls,6);await retained.close();
});
test('HTTPS redirect is an outcome, zero follow-ups/resends; credential allowlist and binding enforced',async()=>{
 let sends=0;const urls=[];const send=(url,opts,callback)=>{sends++;urls.push(url);assert.equal(opts.agent,false);const req=new EventEmitter();req.end=()=>queueMicrotask(()=>{const res=new EventEmitter();res.statusCode=302;callback(res);res.emit('end');});req.destroy=()=>{};return req;};
 const binding={host:'synthetic.vercel.app',deploymentId:'dpl_SYNTHETIC',projectId:'prj_SYNTHETIC',purchaseProjectId:'prj_OTHER',buildId:'a'.repeat(64)},http=createHttpClient(binding,{}, {sendHttps:send});assert.equal((await http.send('A1',{slot:1,dispatchId:'SYNTHETIC'})).status,'302');assert.equal(sends,1);assert.equal(urls[0],'https://synthetic.vercel.app/api/internal/qualification/read-only');await assert.rejects(http.send('arbitrary-url',{}),/named/);assert.throws(()=>captureCredentials({GOOGLE_APPLICATION_CREDENTIALS:'bad'}),/allowlist/);
});
test('C failure with exact status still needs independent timing and no late continuation',async()=>{
 const c=campaign(backend('504'),async info=>({...await proof(info),noLateContinuation:false}));await assert.rejects(c.dispatch('C2',options),/HALTED/);c.close();
});
test('cold remains UNVERIFIED without platform evidence; warm sequence mismatch HALTs',async()=>{
 const c=campaign(backend(),async info=>({...await proof(info),newPlatformInstance:false}));assert.equal((await c.dispatch('A6',options)).state,'UNKNOWN/UNVERIFIED');c.close();const d=campaign(backend(),async info=>({...await proof(info),sameParent:false}));await assert.rejects(d.dispatch('A7',options),/HALTED/);d.close();
});
