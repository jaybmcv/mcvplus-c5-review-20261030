import {RUN} from '../app/qualification/constants.mjs';
export const uuid=value=>typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(value);
const timestamp=value=>typeof value==='string'&&value.length<=40&&Number.isFinite(Date.parse(value));
// Only handler-owned diagnostics survive the response boundary. No headers,
// arbitrary bodies, SDK document values, credential text or provider payload.
export function serverIdentity(value,{buildId,deploymentId},slot){
 if(!value||!uuid(value.correlation)||!uuid(value.processInstance)||!timestamp(value.processInitializedAt)||!Number.isSafeInteger(value.invocationSequence)||value.invocationSequence<1||value.buildId!==buildId||value.deploymentId!==deploymentId||value.runId!==RUN||value.attempt!==slot)throw Error('unvalidated server identity');
 const out={correlation:value.correlation,processInstance:value.processInstance,processInitializedAt:value.processInitializedAt,invocationSequence:value.invocationSequence,buildId, deploymentId,runId:RUN,attempt:slot};
 if(value.workerInstance!==null&&value.workerInstance!==undefined){if(!uuid(value.workerInstance)||!timestamp(value.workerInitializedAt)||value.workerSequence!==1)throw Error('unvalidated worker identity');Object.assign(out,{workerInstance:value.workerInstance,workerInitializedAt:value.workerInitializedAt,workerSequence:1});}
 if(value.sdkIdentity!==null&&value.sdkIdentity!==undefined){if(!uuid(value.sdkIdentity.id)||!timestamp(value.sdkIdentity.initializedAt))throw Error('unvalidated SDK identity');out.sdkIdentity={id:value.sdkIdentity.id,initializedAt:value.sdkIdentity.initializedAt};}
 for(const key of ['workerCollected','cancellationAttempted'])if(typeof value[key]==='boolean')out[key]=value[key];
 return Object.freeze(out);
}
export const sameParent=(a,b)=>!!a&&!!b&&a.processInstance===b.processInstance&&a.processInitializedAt===b.processInitializedAt;
