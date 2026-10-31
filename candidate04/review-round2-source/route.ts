// Candidate overlay, NOT installed into the app. Offline fence is deliberately false.
// No usable binding/key/permit is included. Activation requires separate review.
import {handle,bounded} from './qualification/handler.mjs';
import {resolveBinding} from './qualification/gates.mjs';
import {createReplayStore,closeReplay} from './replay.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=15;
const CANDIDATE_ENABLED=false;
const base={enabled:false,admissionMode:'signed-permit-v2',projectId:'PLATFORM_BOUND_BY_SIGNED_PERMIT',permitPublicKey:''};
export async function POST(request:Request){
 if(!CANDIDATE_ENABLED)return Response.json({code:'candidate04_disabled'},{status:404});
 const binding=resolveBinding(request,base,process.env);
 if(!binding)return Response.json({code:'disabled'},{status:404});
 if(request.signal.aborted)return Response.json({code:'cancelled'},{status:504});
 const deadline=Date.now()+15000;
 let replay;
 try {
  const initializing=createReplayStore(process.env);
  try {replay=await bounded(()=>initializing,deadline,request.signal);}
  catch(e){void initializing.then(store=>closeReplay(store)).catch(()=>{});throw e;}
  // Platform-owned structured logs, not provider-mutable runtime logs. Operator
  // must reconcile these against named attempts before another attended dispatch.
  const anomaly=async(event:unknown)=>{console.error(JSON.stringify({type:'qualification-admission-anomaly',event}));};
  return await handle(request,binding,process.env,{replay,anomaly,deadline});
 } catch {return Response.json({code:'admission_unavailable'},{status:503});}
 finally {await closeReplay(replay,event=>console.error(JSON.stringify(event)));}
}
