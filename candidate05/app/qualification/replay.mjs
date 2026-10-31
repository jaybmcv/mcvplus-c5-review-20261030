import configuredTarget from '../config/replay-binding.json' with {type:'json'};
import {createHash} from 'node:crypto';
import {RUN} from './constants.mjs';
import {retainedTokenAuth} from './sdk.mjs';
const target=Object.freeze({...configuredTarget});
// Supported Firestore atomic createDocument; no transaction read / update / delete / TTL.
// A separate replay database and dedicated create-only identity are REQUIRED.
// Failure/timeout/unknown ack => NO worker. The claim is never removed/refunded.
export function replayStore(client,{projectId,databaseId,qualificationProject,qualificationDatabase='(default)'}) {
 if(!client||typeof client.createDocument!=='function'||!/^[-a-z0-9]+$/.test(projectId??'')||!/^[-a-z0-9()]+$/.test(databaseId??'')||
  !qualificationProject||(projectId===qualificationProject&&databaseId===qualificationDatabase))throw Error('separate replay database required');
 return Object.freeze({
  async claim({runId,slot}) {
   if(typeof runId!=='string'||!runId||!Number.isInteger(slot)||slot<1||slot>48)throw Error('invalid replay key');
   // Deliberately excludes build/deployment: replacement deployments cannot reset this run.
   const documentId=createHash('sha256').update(JSON.stringify([runId,slot])).digest('hex');
   try {
    await client.createDocument({parent:'projects/'+projectId+'/databases/'+databaseId+'/documents',collectionId:'qualificationReplay',documentId,
     document:{fields:{runId:{stringValue:runId},slot:{integerValue:String(slot)}}}},{retry:null,timeout:2000});
    return {claimed:true};
   }catch(e){return {claimed:false,code:e.code===6?'replay':'replay-store-unavailable'};}
  }
 });
}
export function captureReplayEnvironment(input){
 const names=['C5_REPLAY_PROJECT','C5_REPLAY_DATABASE','C5_REPLAY_CLIENT_EMAIL','C5_REPLAY_ISSUED_TOKEN','C5_REPLAY_TOKEN_EXPIRES_AT','C5_FIREBASE_CLIENT_EMAIL','C5_FIRESTORE_ISSUED_TOKEN'];
 return Object.freeze(Object.fromEntries(names.map(name=>[name,input[name]])));
}
export async function createReplayStore(input) {
 const env=captureReplayEnvironment(input);
 if(target.enabled!==true||target.runId!==RUN||target.qualificationProject!=='mcv-plus-phase-2-test'||target.qualificationDatabase!=='(default)'||!/^[-a-z0-9]+$/.test(target.projectId)||!/^[-a-z0-9()]+$/.test(target.databaseId)||env.C5_REPLAY_PROJECT!==target.projectId||env.C5_REPLAY_DATABASE!==target.databaseId)throw Error('immutable replay target unbound or mismatch');

 if(Object.values(env).some(value=>typeof value!=='string'||!value))throw Error('explicit replay credential inventory missing');
 if(env.C5_REPLAY_CLIENT_EMAIL===env.C5_FIREBASE_CLIENT_EMAIL||env.C5_REPLAY_ISSUED_TOKEN===env.C5_FIRESTORE_ISSUED_TOKEN)throw Error('replay writer must differ from qualification reader');
 // Explicit non-refreshing issued token, no key/ADC; replay authority never enters child environment.
 const {v1}=await import('firebase-admin/firestore');
 const auth=retainedTokenAuth({issuedToken:env.C5_REPLAY_ISSUED_TOKEN,expiresAt:Number(env.C5_REPLAY_TOKEN_EXPIRES_AT)},Date.now,false,target.projectId);
 const client=new v1.FirestoreClient({projectId:target.projectId,servicePath:'firestore.googleapis.com',port:443,auth,'grpc.enable_retries':0});
 try {const store=replayStore(client,{projectId:target.projectId,databaseId:target.databaseId,qualificationProject:target.qualificationProject,qualificationDatabase:target.qualificationDatabase});return {...store,claim:key=>{if(key.runId!==target.runId)throw Error('immutable replay run mismatch');return store.claim(key);},close:()=>client.close()};}
 catch(e){await client.close();throw e;}
}

// Bounded resource cleanup must not replace the already prepared response.
export async function closeReplay(store,onFailure=()=>{},milliseconds=100) {
 if(!store)return;
 let timer;
 try {
  await Promise.race([Promise.resolve().then(()=>store.close()),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('cleanup uncertain')),milliseconds);})]);
 }catch {try{onFailure({type:'replay_cleanup_unverified'});}catch {}}
 finally {clearTimeout(timer);}
}
