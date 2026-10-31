import {createHash} from 'node:crypto';
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
export async function createReplayStore(env) {
 const names=['C5_REPLAY_PROJECT','C5_REPLAY_DATABASE','C5_REPLAY_CLIENT_EMAIL','C5_REPLAY_PRIVATE_KEY','C5_FIREBASE_CLIENT_EMAIL','C5_FIREBASE_PRIVATE_KEY'];
 if(names.some(k=>typeof env[k]!=='string'||!env[k]))throw Error('explicit replay credential inventory missing');
 if(env.C5_REPLAY_CLIENT_EMAIL===env.C5_FIREBASE_CLIENT_EMAIL||env.C5_REPLAY_PRIVATE_KEY===env.C5_FIREBASE_PRIVATE_KEY)throw Error('replay writer must differ from qualification reader');
 // Explicit credentials, no ADC; the client/key never goes into the child environment.
 const {v1}=await import('firebase-admin/firestore');
 const client=new v1.FirestoreClient({projectId:env.C5_REPLAY_PROJECT,credentials:{client_email:env.C5_REPLAY_CLIENT_EMAIL,private_key:env.C5_REPLAY_PRIVATE_KEY}});
 try {const store=replayStore(client,{projectId:env.C5_REPLAY_PROJECT,databaseId:env.C5_REPLAY_DATABASE,qualificationProject:'mcv-plus-phase-2-test'});return {...store,close:()=>client.close()};}
 catch(e){await client.close();throw e;}
}
