import {CASES} from './cases.mjs';
import {sameParent} from './identities.mjs';
export function semanticStatus(spec,result,proof,context,contracts){
 const raw=String(result.rawStatus??result.status);
 if(!spec.upstreamProof){
  if(['access-status','preview-retirement-status'].includes(spec.externalContract)){
   const allowed=contracts[spec.externalContract]?.rawStatuses,denials=spec.externalContract==='access-status'?['301','302','303','307','308','401','403']:['301','302','303','307','308','401','403','404','410'];
   if(!Array.isArray(allowed)||!allowed.length||allowed.some(status=>!denials.includes(status))||!allowed.includes(raw))throw Error('raw response is not an approved denial');
   return spec.externalContract==='access-status'?'ACCESS_DENIED':'PREVIEW_RETIRED';
  }
  return raw;
 }
 if(raw==='200'&&spec.propagation)return '200';
 const u=proof.upstream,id=result.responseIdentity;
 if(raw!=='503'||!id||proof.serverCorrelation!==id.correlation||u?.source!=='correlated-upstream-log'||u.kind!==spec.upstreamProof||u.correlation!==id.correlation||u.dispatchId!==context.dispatchId||u.slot!==context.slot||typeof u.receipt!=='string'||!u.receipt||u.receipt.length>512)throw Error('generic incoming failure is not upstream denial');
 if(spec.upstreamProof==='provider-bearer'){if(u.status!=='401')throw Error('bearer verifier did not deny');return '401';}
 const allowed=contracts['access-status']?.rawStatuses;
 if(!Array.isArray(allowed)||!allowed.length||allowed.some(s=>!['301','302','303','307','308','401','403'].includes(s))||!allowed.includes(u.status))throw Error('unbound Access denial contract');
 return 'ACCESS_DENIED';
}
export function reconcileFanout(spec,result,semantic,proof,transcript){
 if(!proof.fanoutReconciled||proof.unlistedDispatches!==0)throw Error('fanout not independently reconciled');
 const operations=proof.operations;
 if(!Array.isArray(operations)||operations.length!==transcript.length)throw Error('fanout length mismatch');
 const reasons=['prior-denial','budget-expired','cancelled-before-send','init-failed','not-in-branch'];
 const denyAccess=spec.upstreamProof==='cloudflare'&&semantic==='ACCESS_DENIED';
 const success=semantic==='200'||semantic==='OK'||semantic==='PERMISSIONS_REVIEWED';
 const allRequired=success||spec.kind!=='http'||spec.id==='B5'||spec.upstreamProof==='provider-bearer';
 let absent=false;
 return operations.map((op,i)=>{
  const local=transcript[i];
  if(op.ordinal!==local.ordinal||op.operation!==local.operation||typeof op.dispatched!=='boolean'||op.ceased!==true)throw Error('fanout identity/cessation mismatch');
  if(spec.kind==='http'&&i===0&&op.status!==String(result.rawStatus??result.status))throw Error('incoming status contradicts actual send');
  if(local.knownSent&&(!op.dispatched||op.status!==local.knownStatus))throw Error('independent evidence contradicts acknowledged local send');
  const outcomeOrdinal=spec.id.startsWith('B7')?2:transcript.length-1;
  if(spec.kind!=='http'&&i===outcomeOrdinal&&op.status!==String(result.status))throw Error('workload status contradicts actual fanout');
  if(allRequired&&!op.dispatched)throw Error('required branch missing dispatch');
  if(spec.upstreamProof&&String(result.rawStatus??result.status)==='503'&&op.operation==='provider-https'&&op.status!==proof.upstream.status)throw Error('upstream receipt contradicts actual fanout status');
  if(denyAccess){const required=['incoming-https','replay-create','provider-https'].includes(op.operation);if(op.dispatched!==required)throw Error('Access denial has contradictory downstream work');}
  if(spec.negative&&op.operation==='firestore-get'&&op.dispatched)throw Error('provider fault cannot claim SDK success/work');
  if(!op.dispatched){absent=true;if(!reasons.includes(op.nonDispatchReason))throw Error('undispatched branch requires independent reason');}
  else if(absent&&spec.kind==='http')throw Error('non-prefix HTTP fanout');
  if(op.status!==undefined&&(typeof op.status!=='string'||op.status.length>32))throw Error('bounded status required');
  return {ordinal:op.ordinal,operation:op.operation,dispatched:op.dispatched,ceased:true,...(op.status?{status:op.status}:{}),...(!op.dispatched?{nonDispatchReason:op.nonDispatchReason}:{})};
 });
}
const semanticRejection=status=>['7','16'].includes(String(status));
export function validateIdentities(spec,result,proof,prior){
 const dimensions={};const identity=result.responseIdentity;
 if(identity&&proof.serverCorrelation!==identity.correlation)throw Error('actual server correlation not independently matched');
 if(spec.id==='A7'){
  const previous=prior('A6')?.responseIdentity;
  if(!identity||!sameParent(identity,previous)||identity.invocationSequence<=previous.invocationSequence||!proof.sameParent||!proof.sequenceIncreased)throw Error('actual warm identity not proven');
 }
 if(['D2','D3','D5','D6'].includes(spec.id)){
  const previous=prior(spec.group==='bearer'?'D1':'D4')?.responseIdentity;
  dimensions.warm=sameParent(identity,previous)&&identity.invocationSequence>previous.invocationSequence&&proof.sameParent===true?'PASS':'UNVERIFIED';
 }
 if(spec.group==='firebase'&&!spec.baseline){const baseline=prior('D7'),previous=baseline?.sdkIdentity;if(!previous||result.identity?.id!==previous.id||result.identity?.initializedAt!==previous.initializedAt||proof.sameRetainedClient!==true||proof.noTokenRefresh!==true)throw Error('retained SDK identity changed or refresh unverified');
  if(JSON.stringify(result.authMetadata)!==JSON.stringify(baseline?.authMetadata))throw Error('issued-token lifetime metadata changed');
  dimensions.tokenRejectionTiming=semanticRejection(result.status)&&Number.isFinite(proof.observedAt)&&Number.isFinite(result.authMetadata?.expiresAt)?(proof.observedAt<result.authMetadata.expiresAt?'before-expiry':'after-expiry'):'UNVERIFIED';
 }
 if(spec.id==='V4a'){if(!proof.sameSession||!proof.noReconnect||JSON.stringify(result.session)!==JSON.stringify(prior('D12')?.session))throw Error('retained DB session unverified');}
 return dimensions;
}
