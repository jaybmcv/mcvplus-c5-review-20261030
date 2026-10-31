import {timingSafeEqual,verify} from 'node:crypto';
import {RUN,LIMIT,ORIGIN} from './constants.mjs';
export function sameSecret(a,b) {
  if(typeof a!=='string'||typeof b!=='string'||a.length<32||a.length>256||b.length<32||b.length>256)return false;
  const x=Buffer.from(a),y=Buffer.from(b); return x.length===y.length&&timingSafeEqual(x,y);
}
export function validateBinding(b,e) {
  return b?.enabled===true&&e.C5_ENABLED==='permit-only'&&b.runId===RUN&&b.attempts===LIMIT&&b.providerOrigin===ORIGIN&&
    b.firebaseProject==='mcv-plus-phase-2-test'&&b.database==='(default)'&&
    /^prj_[A-Za-z0-9]+$/.test(b.projectId)&&/^prj_[A-Za-z0-9]+$/.test(e.C5_REVIEWED_PURCHASE_PROJECT_ID)&&b.projectId!==e.C5_REVIEWED_PURCHASE_PROJECT_ID&&
    /^dpl_[A-Za-z0-9]+$/.test(b.deploymentId)&&/^[a-z0-9-]+\.vercel\.app$/.test(b.deploymentHost)&&
    /^[a-f0-9]{64}$/.test(b.buildId)&&e.VERCEL_PROJECT_ID===b.projectId&&
    e.VERCEL_DEPLOYMENT_ID===b.deploymentId&&e.VERCEL_URL===b.deploymentHost&&e.C5_BUILD_ID===b.buildId&&
    b.requires?.platformProtectionAllDeployments===true&&b.requires?.dedicatedReadOnlyIamReviewed===true&&b.requires?.providerPrivilegeReview===true;
}
export function authorize(request,b,e) {
  if(!validateBinding(b,e))return {status:404,code:'disabled'};
  if(!sameSecret(e.C5_PERIMETER_SECRET,request.headers.get('x-c5-perimeter-secret'))||
     !sameSecret(e.C5_INVOCATION_SECRET,request.headers.get('x-c5-invocation-secret'))||
     sameSecret(e.C5_PERIMETER_SECRET,e.C5_INVOCATION_SECRET))return {status:401,code:'denied'};
  const url=new URL(request.url);
  if(request.method!=='POST'||url.pathname!=='/api/internal/qualification/read-only'||url.search||url.host!==b.deploymentHost||request.body!==null)return {status:400,code:'envelope_denied'};
  const slot=request.headers.get('x-c5-attempt');
  if(request.headers.get('x-c5-run')!==RUN||!slot||!/^([1-9]|[1-3][0-9]|4[0-8])$/.test(slot))return {status:400,code:'attempt_denied'};
  return {slot:Number(slot)};
}

export function resolveBinding(request,base,env) {
  if(base.enabled!==false||base.admissionMode!=='signed-permit-v2'||base.projectId!=='PLATFORM_BOUND_BY_SIGNED_PERMIT'||env.C5_ENABLED!=='permit-only'||typeof base.permitPublicKey!=='string'||!base.permitPublicKey.startsWith('-----BEGIN PUBLIC KEY-----'))return null;
  try {
    const raw=request.headers.get('x-c5-binding'),signature=request.headers.get('x-c5-binding-signature');
    if(!raw||raw.length>4096||!signature||signature.length>128)return null;
    const bytes=Buffer.from(raw,'base64url');
    if(!verify(null,bytes,base.permitPublicKey,Buffer.from(signature,'base64url')))return null;
    const permit=JSON.parse(bytes.toString('utf8'));
    if(Object.keys(permit).sort().join(',')!=='buildId,deploymentHost,deploymentId,projectId,runId'||permit.projectId!==env.VERCEL_PROJECT_ID||permit.buildId!==base.buildId||permit.runId!==base.runId)return null;
    const b={...base,...permit,enabled:true};return validateBinding(b,env)?b:null;
  }catch{return null;}
}
