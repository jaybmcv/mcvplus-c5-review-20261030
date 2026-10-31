// Meanings: PARENT-HISTORICAL-CAMPAIGN.txt 121-150, superseded by
// PARENT-AUTHORITATIVE-AMENDMENT.txt section 5. No inferred extra cases.
import {PRIMARY,RESERVED} from './accounting.mjs';
export function freeze(value){if(value&&typeof value==='object'){for(const v of Object.values(value))freeze(v);Object.freeze(value);}return value;}
const cases={};
const define=(id,label,kind,expected,steps,extra={})=>cases[id]=freeze({id,label,kind,expected,steps,...extra});
const app=['incoming-https','replay-create','provider-https','provider-identity','provider-privileges','provider-relations','provider-constraints','provider-marker','provider-member','firestore-get'];
const provider=['provider-https','provider-identity','provider-privileges','provider-relations','provider-constraints','provider-marker','provider-member'];
for(const [id,label,status] of [
 ['A1','no invocation secret','401'],['A2','wrong incoming perimeter proof','401'],['A3','invalid signed permit','404'],['A4','wrong method at exact route','405'],['A5','unsupported path','404']
])define(id,label,'http',[status],['incoming-https']);
for(const [id,label]of [['A6','first invocation; cold requires independent new-instance evidence'],['A7','warm parent identity and increasing sequence'],['A8','15-minute idle; identity recorded, cold unverified']])define(id,label,'http',['200'],app,{identity:id});
define('B1','missing bearer','http',['401'],['provider-https']);
define('B2','wrong bearer','http',['401'],['provider-https']);
define('B3','missing Cloudflare proof','http',['ACCESS_DENIED'],['provider-https'],{externalContract:'access-status'});
define('B4','wrong provider method/query','http',['400'],['provider-https']);
define('B5','marker mismatch; readiness denied','http',['503'],provider.slice(0,-1),{requires:'marker-mismatch'});
define('B6','actual-role effective privilege inventory','db',['OK'],['db-login','db-identity','db-privileges','db-relations','db-constraints','db-marker']);
export const B7=freeze({
 B7a:"INSERT INTO public.throwaway_write_probe(id) VALUES (1)",
 B7b:"UPDATE public.throwaway_write_probe SET id=2 WHERE id=1",
 B7c:"DELETE FROM public.throwaway_write_probe WHERE id=1",
 B7d:"TRUNCATE public.throwaway_write_probe",
 B7e:"CREATE TABLE public.denied(id integer)",
 B7f:"CREATE TEMP TABLE denied(id integer)",
 B7g:"SELECT nextval('public.throwaway_sequence')"
});
for(const [id,sql]of Object.entries(B7))define(id,sql,'db',['42501'],['db-login','db-begin-read-write','db-negative','db-rollback'],{sql});
define('B8','supported effective Firebase permission evaluation only','sdk',['PERMISSIONS_REVIEWED'],['firebase-permission-evaluation'],{externalContract:'supported-permission-evaluation'});
for(const [id,label]of [
 ['C1','provider unavailable before call'],['C2','delayed provider headers'],['C3','delayed provider body'],['C4','transient disconnect; no retry'],['C5','client abort'],['C6','delayed credential/SDK initialization'],['C7','dedicated provider crash/hang']
])define(id,label,'http',['503','504'],app,{requires:id,negative:true});
define('C8','dedicated restart diagnostic availability only','http',['200'],app,{requires:'C8'});
define('D1','bearer warm baseline','http',['200'],app,{group:'bearer',baseline:true});
define('D2','old bearer at 0m','http',['401'],['incoming-https','replay-create','provider-https'],{group:'bearer',minute:0,upstreamProof:'provider-bearer'});
define('D3','old bearer at 15m if still needed','http',['401'],['incoming-https','replay-create','provider-https'],{group:'bearer',minute:15,upstreamProof:'provider-bearer'});
define('D4','Cloudflare baseline','http',['200'],app,{group:'cf',baseline:true});
define('D5','old Cloudflare token at 0m','http',['ACCESS_DENIED','200'],app,{group:'cf',minute:0,upstreamProof:'cloudflare',externalContract:'access-status',propagation:true});
define('D6','old Cloudflare token at 15m if needed','http',['ACCESS_DENIED'],['incoming-https','replay-create','provider-https'],{group:'cf',minute:15,upstreamProof:'cloudflare',externalContract:'access-status'});
define('D7','retained external SDK/issued-token baseline','sdk',['200'],['firestore-get'],{group:'firebase',baseline:true,retain:true});
for(const [id,minute]of [['D8',0],['D9',15],['D10',60],['D11',75]])define(id,'same retained issued token at '+minute+'m','sdk',minute<75?['200','7','16']:['7','16'],['firestore-get'],{group:'firebase',minute,propagation:minute<75,retain:true});
define('D12','existing DB Client baseline with session identity','db',['OK'],['db-login','db-session-identity','db-marker'],{group:'db',baseline:true,retain:true});
define('V1','final old bearer rejection; direct provider loopback allowed','http',['401'],['provider-https'],{group:'bearer',reserved:43});
define('V2','final old Cloudflare token rejection','http',['ACCESS_DENIED'],['provider-https'],{group:'cf',reserved:44,externalContract:'access-status'});
define('V3','final retained Firebase token rejection','sdk',['7','16'],['firestore-get'],{group:'firebase',reserved:45,retain:true});
define('V4a','same non-reconnecting DB Client post-revoke statement','db',['42501'],['db-marker'],{group:'db',reserved:46,retain:true});
define('V4b','fresh old-password DB login must deny','db',['28P01','28000'],['db-login'],{group:'db',reserved:47});
define('V5','old incoming credentials after combined preview retirement','http',['PREVIEW_RETIRED'],['incoming-https'],{group:'preview',reserved:48,externalContract:'preview-retirement-status'});
if(PRIMARY.length!==42||Object.keys(cases).length!==48||[...PRIMARY,...Object.keys(RESERVED)].some(id=>!cases[id]))throw Error('authoritative mapping mismatch');
export const CASES=freeze(cases);
export const TARGETS=freeze({provider:'https://c5-roq-20261029.marscatsvoyage.com',providerPath:'/v1/members/resolve?discordUserId=990000000000000001',db:{host:'127.0.0.1',port:55442,database:'mcvplus_c5_roq_20261029',user:'c5_qualification_readonly'},document:'projects/mcv-plus-phase-2-test/databases/(default)/documents/c5Qualification/readOnlyCanary'});
export {PRIMARY,RESERVED};
