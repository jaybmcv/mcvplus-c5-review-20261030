import {randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {budget} from './budget.mjs';
import {createPurchaseTransport} from '../lib/server/purchases/creamery-transport.ts';
import {createReadOnlySdk} from './sdk.mjs';
import {nativeHttp} from './native-http.mjs';
import {executeReadOnly} from './execute.mjs';
import {ORIGIN,PROVIDER_PATH} from './constants.mjs';
export async function runWorker(job,input=process.env){
  const env=Object.freeze(Object.fromEntries(['C5_PROVIDER_PERIMETER_SECRET','C5_PROVIDER_BEARER','C5_CF_CLIENT_ID','C5_CF_CLIENT_SECRET','C5_FIRESTORE_ISSUED_TOKEN','C5_FIRESTORE_TOKEN_EXPIRES_AT'].map(name=>[name,input[name]])));
  job=Object.freeze({...structuredClone(job),binding:Object.freeze(structuredClone(job.binding))});
  const workerIdentity={workerInstance:randomUUID(),workerInitializedAt:new Date().toISOString(),workerSequence:1};
  let native,sdkIdentity=null;const clock=budget(job.budgetMs??Math.max(0,job.deadline-Date.now()));
  const watchdog=setTimeout(()=>process.exit(124),Math.max(1,clock.remaining()-100));
  try {
    if(clock.remaining()<=0||!env.C5_PROVIDER_BEARER||!env.C5_CF_CLIENT_ID||!env.C5_CF_CLIENT_SECRET||!env.C5_PROVIDER_PERIMETER_SECRET||
      !env.C5_FIRESTORE_ISSUED_TOKEN||!env.C5_FIRESTORE_TOKEN_EXPIRES_AT)throw Error('configuration');
    native=nativeHttp({deadline:clock,origin:ORIGIN,headers:{'x-c5-provider-perimeter':env.C5_PROVIDER_PERIMETER_SECRET,'x-c5-run':job.binding.runId,'x-c5-attempt':String(job.slot),
      'x-c5-correlation':job.correlation,'x-c5-build':job.binding.buildId,'x-c5-deployment':job.binding.deploymentId}});
    const transport=createPurchaseTransport(ORIGIN,{http:native.send,credentials:async()=>({bearer:env.C5_PROVIDER_BEARER,
      gatewayHeaders:{'CF-Access-Client-Id':env.C5_CF_CLIENT_ID,'CF-Access-Client-Secret':env.C5_CF_CLIENT_SECRET}})});
    await executeReadOnly({transport,deadline:clock,initializeSdk:async()=>{const sdk=await createReadOnlySdk({issuedToken:env.C5_FIRESTORE_ISSUED_TOKEN,expiresAt:Number(env.C5_FIRESTORE_TOKEN_EXPIRES_AT)});sdkIdentity=sdk.identity;return sdk;}});
    native.close();return {status:200,code:'qualified',...workerIdentity,sdkIdentity};
  }catch {native?.close();return {status:clock.remaining()<=0?504:503,code:clock.remaining()<=0?'deadline':'unavailable',...workerIdentity,sdkIdentity};}
  finally{clearTimeout(watchdog);}
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 let received=false;
 process.once('disconnect',()=>process.exit(0));
 process.on('message',async job=>{if(received)process.exit(78);received=true;const result=await runWorker(job);process.send?.(result);});
}
