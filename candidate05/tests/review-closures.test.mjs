import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {EventEmitter} from 'node:events';
import {createReadOnlySdk,createRetainedReadOnlySdk} from '../app/qualification/sdk.mjs';
import {budget} from '../app/qualification/budget.mjs';
import {DOCUMENT} from '../app/qualification/constants.mjs';
import {createHttpClient,createSdkSession} from '../driver/clients.mjs';
import {PURE_FUNCTIONS} from '../driver/provider-contract.mjs';
import {backend,campaign,proof,options,baselines,syntheticIdentity} from './campaign-fixture.mjs';
const require=createRequire(new URL('../app/package.json',import.meta.url));

test('pinned real v1 initialize and GAX createStub exercise fixed universe/auth with an inert protobuf stub',async()=>{
 const {v1}=require('firebase-admin/firestore');assert.equal(require('firebase-admin/app').SDK_VERSION,'14.2.0');let universe=0,reads=0,closed=0,restore,failNext=false;
 class OfflineClient{constructor(options){
  const originalUniverse=options.auth.getUniverseDomain;assert.equal(typeof originalUniverse,'function');options.auth.getUniverseDomain=async()=>{universe++;return originalUniverse();};
  const actual=new v1.FirestoreClient(options),original=actual._protos.google.firestore.v1.Firestore;restore=()=>actual._protos.google.firestore.v1.Firestore=original;
  actual._protos.google.firestore.v1.Firestore=class{
   constructor(address,credentials,grpcOptions){assert.equal(address,'firestore.googleapis.com:443');assert.ok(credentials);this.transform=grpcOptions.callInvocationTransformer;}
   getDocument(...args){this.transform({});reads++;const callback=args.findLast(x=>typeof x==='function');queueMicrotask(()=>failNext?callback(Object.assign(new Error('SYNTHETIC-unavailable'),{code:14})):callback(null,{name:DOCUMENT,fields:{marker:{stringValue:'c5-readonly-20261029'}}}));return {cancel(){},on(){return this;}};}
   close(){closed++;}
  };
  return actual;
 }}
 const sdk=await createRetainedReadOnlySdk({issuedToken:'SYNTHETIC-unusable',issuedAt:Date.now(),expiresAt:Date.now()+60000},{FirestoreClient:OfflineClient});
 try{await sdk.readCanary(budget(2000));assert.equal(universe,1);assert.equal(reads,1);failNext=true;await assert.rejects(sdk.readCanary(budget(2000)),error=>error.code===14);assert.equal(reads,2,'UNAVAILABLE must not cause a hidden data-RPC retry');}finally{await sdk.close();restore?.();}
 assert.equal(closed,1);
});
test('delayed real-interface initialization cannot queue a getDocument after the absolute deadline',async()=>{
 let sends=0,closes=0;class Delayed{initialize(){return new Promise(r=>setTimeout(r,35));}getDocument(){sends++;throw Error('late send');}async close(){closes++;}}
 const sdk=await createRetainedReadOnlySdk({issuedToken:'SYNTHETIC-token',issuedAt:Date.now(),expiresAt:Date.now()+60000},{FirestoreClient:Delayed});
 await assert.rejects(sdk.readCanary(budget(5)),/deadline/);await new Promise(r=>setTimeout(r,50));assert.equal(sends,0);assert.ok(closes>=2);await sdk.close();
 const session=createSdkSession({issuedToken:'SYNTHETIC-token',issuedAt:Date.now(),expiresAt:Date.now()+60000},{retained:true,FirestoreClient:Delayed});await assert.rejects(session.read(),/absolute/);await assert.rejects(session.read(Date.now()+5),/deadline/);await new Promise(r=>setTimeout(r,50));assert.equal(sends,0);await session.close();
});
test('bounded HTTP response retains only validated actual identities and correlation',async()=>{
 const b={synthetic:true,host:'synthetic.vercel.app',deploymentId:'dpl_SYNTHETIC',projectId:'prj_SYNTHETIC',purchaseProjectId:'prj_OTHER',buildId:'a'.repeat(64)};
 const ctx={slot:1,dispatchId:'33333333-3333-4333-8333-333333333333',deadline:Date.now()+5000},identity=syntheticIdentity(ctx,{id:'A6'});
 const send=(_url,_opts,callback)=>{const req=new EventEmitter();req.end=()=>queueMicrotask(()=>{const res=new EventEmitter();res.statusCode=200;res.headers={'content-type':'application/json'};callback(res);res.emit('data',Buffer.from(JSON.stringify({...identity,secret:'SYNTHETIC-sensitive-marker',arbitrary:{private:true}})));res.emit('end');});return req;};
 const result=await createHttpClient(b,{}, {sendHttps:send}).send('A6',ctx);assert.equal(result.rawStatus,'200');assert.equal(result.responseIdentity.correlation,ctx.dispatchId);assert.equal(result.responseIdentity.processInstance,identity.processInstance);assert.ok(!JSON.stringify(result).includes('sensitive-marker'));assert.equal(result.responseIdentity.arbitrary,undefined);
});
async function revoked(group,observer=proof,b=backend()){
 const c=campaign(b,observer);await baselines(c);c.recordChange(group,{acknowledgedAt:Date.now()-1,receipt:'SYNTHETIC-admin-change'});return c;
}
test('incoming503 plus independently correlated provider401 is contained; generic503 or wrong correlation HALTs',async()=>{
 const c=await revoked('bearer');const result=await c.dispatch('D2',options);assert.equal(result.status,'503');assert.equal(result.semanticStatus,'401');assert.equal(result.state,'EXPECTED-NEGATIVE-CONTAINED');const details=JSON.parse(c.snapshot().results.find(x=>x.case_id==='D2').details);assert.equal(details.rawStatus,'503');assert.equal(details.semanticStatus,'401');assert.equal(details.upstream.correlation,details.responseIdentity.correlation);assert.equal(c.snapshot().attempts.at(-1).status,'503');c.close();
 for(const alter of [p=>({...p,upstream:undefined}),p=>({...p,upstream:{...p.upstream,correlation:'wrong'}})]){
  const d=await revoked('bearer',async info=>{const p=await proof(info);return info.caseId==='D2'?alter(p):p;});await assert.rejects(d.dispatch('D2',options),/HALTED/);d.close();
 }
});
test('Cloudflare denial uses its actual upstream contract and records downstream as not dispatched',async()=>{
 const c=await revoked('cf');const result=await c.dispatch('D5',options);assert.equal(result.status,'503');assert.equal(result.semanticStatus,'ACCESS_DENIED');const detail=JSON.parse(c.snapshot().results.find(x=>x.case_id==='D5').details);assert.equal(detail.upstream.status,'403');assert.ok(detail.actualInventory.slice(3).every(x=>!x.dispatched));assert.ok(c.snapshot().fanout.some(x=>x.state==='observed-not-dispatched'));c.close();
 const dishonest=backend('200'),run=dishonest.runCase;dishonest.runCase=async(...args)=>({...await run(...args),status:'ACCESS_DENIED'});const d=campaign(dishonest);const bad=structuredClone(options);bad.contracts['access-status'].rawStatuses=['200'];await assert.rejects(d.dispatch('B3',bad),/HALTED/);d.close();
});
test('contradictory all-undispatched and missing successful branches fail closed; valid prefix is durable',async()=>{
 for(const patch of [p=>({...p,operations:p.operations.map(x=>({...x,dispatched:false,nonDispatchReason:'not-in-branch'}))}),p=>({...p,operations:p.operations.map((x,i)=>i===1?{...x,dispatched:false,nonDispatchReason:'not-in-branch'}:x)})]){
 const c=campaign(backend(),async info=>patch(await proof(info)));await assert.rejects(c.dispatch('A6',options),/HALTED/);c.close();}
 let during;const c=campaign(backend(),async info=>{during=c.snapshot().fanout.map(x=>x.state);return proof(info);});await c.dispatch('C2',options);assert.ok(during.includes('reserved-remote'));const result=JSON.parse(c.snapshot().results[0].details);assert.deepEqual(result.actualInventory.map(x=>x.dispatched),[true,true,true,false,false,false,false,false,false,false]);c.close();
});
test('positive warm booleans cannot override an actual changed server parent identity',async()=>{
 const b=backend(),run=b.runCase;b.runCase=async(...args)=>{const result=await run(...args);if(args[0].id==='A7')result.responseIdentity={...result.responseIdentity,processInstance:'44444444-4444-4444-8444-444444444444'};return result;};
 const c=campaign(b);await c.dispatch('A6',options);await assert.rejects(c.dispatch('A7',options),/HALTED/);c.close();
});
test('D12 required backend identity function is in the exact B6 allowlist',()=>{assert.ok(PURE_FUNCTIONS.includes('pg_backend_pid()'));assert.equal(PURE_FUNCTIONS.filter(x=>x==='pg_backend_pid()').length,1);});

import {DatabaseSync} from 'node:sqlite';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {NamedCampaign} from '../driver/campaign.mjs';
test('result or actual-inventory persistence failure rolls back completion and retains active unknown',async()=>{
 const file=fileURLToPath(new URL('../evidence/SYNTHETIC-result-fault-'+randomUUID()+'.sqlite',import.meta.url));
 const c=new NamedCampaign(file,'SYNTHETIC-result-fault',{backend:backend(),observe:proof}),db=new DatabaseSync(file);
 db.exec("PRAGMA journal_mode=PERSIST; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000;");
 db.exec("CREATE TRIGGER reject_result BEFORE INSERT ON case_results BEGIN SELECT RAISE(ABORT,'SYNTHETIC-result-storage-fault'); END;");
 await assert.rejects(c.dispatch('A6',options),/HALTED/);const s=c.snapshot();assert.ok(s.campaign.active);assert.equal(s.attempts[0].state,'consumed-before-send');assert.equal(s.results.length,0);assert.ok(s.fanout.some(x=>x.state==='reserved-remote'));assert.ok(!s.fanout.some(x=>x.state==='observed-executed'));db.close();c.close();
});

test('invalid D12 marker closes the untrusted baseline Client instead of retaining it',async()=>{
 const {CaseExecutor}=await import('../driver/clients.mjs');const {CASES,TARGETS}=await import('../driver/cases.mjs');let closed=0;
 const executor=new CaseExecutor({synthetic:true,credentials:{dbPassword:'SYNTHETIC-only'},dbFactory:()=>({connect:async()=>({status:'OK'}),statement:async op=>({status:'OK',rows:op==='db-session-identity'?[{pid:12,backend_start:'SYNTHETIC',role:TARGETS.db.user,database:TARGETS.db.database,application_name:'c5-candidate05-readonly',client:'127.0.0.1'}]:[{marker:'wrong'}]}),close:async()=>closed++})});
 await assert.rejects(executor.runCase(CASES.D12,{},async(_op,send)=>send()),/resource marker/);assert.equal(closed,1);await assert.rejects(executor.runCase(CASES.V4a,{},async(_op,send)=>send()),/baseline Client missing/);
});
test('a nonsettling pg close is bounded and only its owned stream is destroyed',async()=>{
 const {createDbSession}=await import('../driver/clients.mjs');let destroyed=0;class Hanging extends EventEmitter{constructor(){super();this.connection={stream:{destroy:()=>destroyed++}};}end(){return new Promise(()=>{});}}
 const session=createDbSession({dbPassword:'SYNTHETIC-only'},{Client:Hanging}),started=Date.now();await assert.rejects(session.close(),/close unverified/);assert.equal(destroyed,1);assert.ok(Date.now()-started<1500);
});
