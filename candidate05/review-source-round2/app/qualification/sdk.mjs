import {asBudget} from './budget.mjs';
import {randomUUID} from 'node:crypto';
import {DOCUMENT} from './constants.mjs';
// The pinned GAX auth interface is static: no ADC, key, exchange or refresh.
export function retainedTokenAuth({issuedToken,expiresAt},now=Date.now,allowExpired=false,projectId='mcv-plus-phase-2-test') {
 if(typeof issuedToken!=='string'||!issuedToken||issuedToken.length>8192||/[\r\n]/.test(issuedToken)||!Number.isFinite(expiresAt)||expiresAt-now()>3600000)throw Error('issued token required');
 const token=issuedToken,expiration=expiresAt;
 const headers=async()=>{if(!allowExpired&&now()+1000>=expiration)throw Error('issued token expired; refresh forbidden');return new Headers({authorization:'Bearer '+token});};
 const client=Object.freeze({getRequestHeaders:headers,refreshAccessToken:async()=>{throw Error('refresh forbidden');},getAccessToken:async()=>{await headers();return {token};}});
 return {getClient:async()=>{await headers();return client;},getProjectId:async()=>projectId,getUniverseDomain:async()=> 'googleapis.com'};
}
// Timeout never queues the next stage. Late initialization is only closed.
export async function beforeDeadline(start,clock,onTimeout=()=>{}) {
 clock.check();let timer;
 try{return await Promise.race([Promise.resolve().then(()=>{clock.check();return start();}),new Promise((_,reject)=>{timer=setTimeout(()=>{try{onTimeout();}catch{}reject(Error('absolute SDK deadline'));},Math.max(1,clock.remaining()));})]);}
 finally{clearTimeout(timer);}
}
export const createReadOnlySdk=(token,dependencies)=>createSdk(token,dependencies,1);
export const createRetainedReadOnlySdk=(token,dependencies)=>createSdk(token,dependencies,6);
async function createSdk(token,{FirestoreClient,now=Date.now}={},maxReads) {
 if(maxReads>1&&(!Number.isFinite(token.issuedAt)||token.issuedAt>now()||token.expiresAt-token.issuedAt>3600000||token.expiresAt<=token.issuedAt))throw Error('retained token issuance/lifetime metadata required');
 if(process.env.GOOGLE_API_USE_CLIENT_CERTIFICATE==='true'||process.env.GOOGLE_API_USE_MTLS_ENDPOINT==='always')throw Error('ambient mTLS configuration forbidden');
 const auth=retainedTokenAuth(token,now,maxReads>1);
 if(!FirestoreClient){const {SDK_VERSION}=await import('firebase-admin/app');if(SDK_VERSION!=='14.2.0')throw Error('SDK version');const {v1}=await import('firebase-admin/firestore');FirestoreClient=v1.FirestoreClient;}
 let reads=0,closed=false,activeClock=null,initialization,closing,inFlight=false;
 const client=new FirestoreClient({projectId:'mcv-plus-phase-2-test',servicePath:'firestore.googleapis.com',port:443,universeDomain:'googleapis.com',auth,
  'grpc.enable_retries':0,'grpc.initial_reconnect_backoff_ms':10000,'grpc.max_reconnect_backoff_ms':10000,
  'grpc.callInvocationTransformer':properties=>{if(closed||!activeClock)throw Error('SDK send outside active deadline');activeClock.check();return properties;}});
 const stop=()=>{closed=true;closing??=Promise.resolve(client.close());void closing.catch(()=>{});};
 const identity=Object.freeze({id:randomUUID(),initializedAt:new Date(now()).toISOString()});
 return Object.freeze({identity,
  async readCanary(deadline) {
   const clock=asBudget(deadline);clock.check();if(reads>=maxReads||closed||inFlight)throw Error('read budget exhausted or overlapping');reads++;inFlight=true;activeClock=clock;
   try{
    if(typeof client.initialize!=='function')throw Error('explicit SDK initialize required');
    initialization??=Promise.resolve().then(()=>client.initialize());
    void initialization.then(()=>{if(closed){const late=Promise.resolve(client.close());void late.catch(()=>{});closing=Promise.all([closing??Promise.resolve(),late]);void closing.catch(()=>{});}},()=>{});
    await beforeDeadline(()=>initialization,clock,stop);clock.check();
    await beforeDeadline(()=>auth.getClient(),clock,stop);clock.check();
    const timeout=Math.max(1,Math.min(5000,clock.remaining()));
    const [document]=await beforeDeadline(()=>{clock.check();return client.getDocument({name:DOCUMENT,mask:{fieldPaths:['marker']}},{timeout,retry:null});},clock,stop);
    clock.check();if(document.name!==DOCUMENT||document.fields?.marker?.stringValue!=='c5-readonly-20261029')throw Error('canary mismatch');return true;
   }catch(error){if(clock.remaining()<=0)stop();throw error;}finally{inFlight=false;activeClock=null;}
  },
  async close(){stop();let timer;try{await Promise.race([closing,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('SDK close unverified')),100);})]);}finally{clearTimeout(timer);}}
 });
}
