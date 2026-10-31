import {asBudget} from './budget.mjs';
import {randomUUID} from 'node:crypto';
import {DOCUMENT} from './constants.mjs';
// Issued token only. No OAuth client, ADC, key, token exchange or refresh.
// google-gax options.auth injection has no network implementation.
export function retainedTokenAuth({issuedToken,expiresAt},now=Date.now,allowExpired=false) {
 if(typeof issuedToken!=='string'||!issuedToken||issuedToken.length>8192||/[\r\n]/.test(issuedToken)||!Number.isFinite(expiresAt)||expiresAt-now()>3600000)throw Error('issued token required');
 const token=issuedToken,expiration=expiresAt;
 const headers=async()=>{if(!allowExpired&&now()+1000>=expiration)throw Error('issued token expired; refresh forbidden');return new Headers({authorization:'Bearer '+token});};
 const client=Object.freeze({getRequestHeaders:headers,refreshAccessToken:async()=>{throw Error('refresh forbidden');},getAccessToken:async()=>{await headers();return {token};}});
 return {getClient:async()=>{await headers();return client;},getProjectId:async()=> 'mcv-plus-phase-2-test'};
}
export const createReadOnlySdk=(token,dependencies)=>createSdk(token,dependencies,1);
export const createRetainedReadOnlySdk=(token,dependencies)=>createSdk(token,dependencies,6);
async function createSdk(token,{FirestoreClient,now=Date.now}={},maxReads) {
 if(maxReads>1&&(!Number.isFinite(token.issuedAt)||token.issuedAt>now()||token.expiresAt-token.issuedAt>3600000||token.expiresAt<=token.issuedAt))throw Error('retained token issuance/lifetime metadata required');
 const auth=retainedTokenAuth(token,now,maxReads>1);
 if(!FirestoreClient){
  const {SDK_VERSION}=await import('firebase-admin/app');if(SDK_VERSION!=='14.2.0')throw Error('SDK version');
  const {v1}=await import('firebase-admin/firestore');FirestoreClient=v1.FirestoreClient;
 }
 const client=new FirestoreClient({projectId:'mcv-plus-phase-2-test',servicePath:'firestore.googleapis.com',port:443,universeDomain:'googleapis.com',auth,
  'grpc.enable_retries':0,'grpc.initial_reconnect_backoff_ms':10000,'grpc.max_reconnect_backoff_ms':10000});
 let reads=0,closed=false;
 const identity=Object.freeze({id:randomUUID(),initializedAt:new Date(now()).toISOString()});
 return Object.freeze({identity,
  async readCanary(deadline) {
   const clock=asBudget(deadline);clock.check();if(reads>=maxReads||closed)throw Error('read budget exhausted');reads++;
   await auth.getClient();clock.check();
   const [document]=await client.getDocument({name:DOCUMENT,mask:{fieldPaths:['marker']}},{timeout:Math.max(1,Math.min(5000,clock.remaining())),retry:null});
   if(document.name!==DOCUMENT||document.fields?.marker?.stringValue!=='c5-readonly-20261029')throw Error('canary mismatch');return true;
  },
  async close(){if(!closed){closed=true;await client.close();}}
 });
}
