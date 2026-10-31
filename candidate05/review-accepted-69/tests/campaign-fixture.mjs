import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {CASES,TARGETS} from '../driver/cases.mjs';
import {NamedCampaign} from '../driver/campaign.mjs';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'../evidence','named-'+Date.now()+'-'+process.pid);fs.mkdirSync(root,{recursive:true});let serial=0;
export const syntheticIdentity=(ctx,c)=>({correlation:ctx.dispatchId,processInstance:'11111111-1111-4111-8111-111111111111',processInitializedAt:'2026-10-31T00:00:00.000Z',invocationSequence:({A6:1,A7:2,A8:3,D1:10,D4:11,D2:12,D3:13,D5:14,D6:15})[c.id]??20,buildId:'a'.repeat(64),deploymentId:'dpl_SYNTHETIC',runId:'c5-readonly-20261029-owner-review-1',attempt:ctx.slot});
export const sdkIdentity={id:'22222222-2222-4222-8222-222222222222',initializedAt:'2026-10-31T00:00:00.000Z'};
export const dbIdentity={pid:123,backend_start:'SYNTHETIC-start',role:TARGETS.db.user,database:TARGETS.db.database,application_name:'c5-candidate05-readonly',client:'127.0.0.1'};
export const proof=async info=>{
 const c=CASES[info.caseId],raw=info.details.rawStatus??info.details.status;
 const upstream=c.upstreamProof&&raw==='503'?{source:'correlated-upstream-log',kind:c.upstreamProof,status:c.upstreamProof==='provider-bearer'?'401':'403',correlation:info.details.responseIdentity.correlation,dispatchId:info.dispatchId,slot:info.slot,receipt:'SYNTHETIC-upstream'}:undefined;
 return {source:'independent-platform-and-admin',snapshots:3,ceased:true,dispatchId:info.dispatchId,receipt:'SYNTHETIC-independent',fanoutReconciled:true,unlistedDispatches:0,serverCorrelation:info.details.responseIdentity?.correlation,upstream,
 operations:info.transcript.map((x,i)=>{const dispatched=!(c.negative||c.upstreamProof==='cloudflare'&&raw==='503')||i<3;return {...x,dispatched,ceased:true,status:x.knownSent?x.knownStatus:x.operation==='provider-https'&&upstream?upstream.status:'OK',...(!dispatched?{nonDispatchReason:'prior-denial'}:{})};}),
 timingVerified:true,workerCollected:true,noLateContinuation:true,sameParent:true,sequenceIncreased:true,sameSession:true,noReconnect:true,newPlatformInstance:true,idle15Minutes:true,sameRetainedClient:true,noTokenRefresh:true,newServiceInstance:true,oldOwnedWorkAbsent:true,observedAt:Date.now()};
};
export const options={authorization:'SYNTHETIC-reviewed',contracts:{'access-status':{reviewedReceipt:'SYNTHETIC-policy',rawStatuses:['403']},'supported-permission-evaluation':{reviewedReceipt:'SYNTHETIC-policy'},'preview-retirement-status':{reviewedReceipt:'SYNTHETIC-policy',rawStatuses:['404']}},evidence:Object.fromEntries(['marker-mismatch',...Array.from({length:8},(_,i)=>'C'+(i+1))].map(k=>[k,true]))};
export function backend(status){return {synthetic:true,async runCase(c,ctx,count){const selected=(typeof status==='function'?status(c):status)??(c.upstreamProof?'503':c.expected[0]),raw=selected==='ACCESS_DENIED'?'403':selected==='PREVIEW_RETIRED'?'404':selected,reported=selected==='ACCESS_DENIED'||selected==='PREVIEW_RETIRED'?selected:raw;for(const [i,step]of c.steps.entries())await count(step,async()=>({status:c.kind==='http'?(i===0?raw:'RESERVED'):c.kind==='sdk'?raw:(step==='db-negative'||c.id==='V4a'||c.id==='V4b')?raw:'OK',reservationOnly:c.kind==='http'&&i>0}));return {status:reported,rawStatus:raw,fanoutComplete:true,...(c.kind==='http'&&(raw==='200'||c.upstreamProof||c.negative)?{responseIdentity:syntheticIdentity(ctx,c)}:{}),...(c.kind==='sdk'?{identity:sdkIdentity,authMetadata:{issuedAt:0,expiresAt:3600000,authMode:'fixed-issued-token-no-refresh'}}:{}),...(['D12','V4a'].includes(c.id)?{session:dbIdentity}:{})};}};}
export function campaign(b=backend(),observer=proof,now){const file=path.join(root,'SYNTHETIC-'+(++serial)+'.sqlite');return new NamedCampaign(file,'SYNTHETIC-named-'+serial,{backend:b,observe:observer,now});}
export async function baselines(c){for(const id of ['D1','D4','D7','D12'])await c.dispatch(id,options);}

