import {asBudget} from './budget.mjs';
import {PROVIDER_PATH} from './constants.mjs';
export async function executeReadOnly({transport,initializeSdk,deadline}){
 const clock=asBudget(deadline),check=()=>clock.check();check();
 const response=await transport({method:'GET',path:PROVIDER_PATH,beforeSend:async()=>check});
 if(response.status!==200||response.body?.qualified!==true)throw Error('provider denied');check();
 let sdk;try{sdk=await initializeSdk();check();if(await sdk.readCanary(clock)!==true)throw Error('canary denied');check();return true;}
 finally{await sdk?.close();}
}
