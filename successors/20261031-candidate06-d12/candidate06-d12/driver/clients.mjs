import configuredSourceBinding from '../app/config/run-binding.json' with {type:'json'};
import {request as httpsRequest} from 'node:https';
import {request as httpRequest} from 'node:http';
import {createRequire} from 'node:module';
import {TARGETS,CASES,B7,freeze} from './cases.mjs';
import {IDENTITY_SQL,PRIVILEGE_SQL,RELATION_SQL,CONSTRAINT_SQL,MARKER_SQL,PURE_FUNCTIONS,validateRelations} from './provider-contract.mjs';
import {serverIdentity} from './identities.mjs';
import {budget} from '../app/qualification/budget.mjs';
import {beforeDeadline,createReadOnlySdk,createRetainedReadOnlySdk} from '../app/qualification/sdk.mjs';
const sourceBinding=Object.freeze({...configuredSourceBinding});
const require=createRequire(import.meta.url);
const credentialNames=['issuedAt','incomingPerimeter','invocation','permit','permitSignature','providerBearer','providerPerimeter','cfId','cfSecret','dbPassword','issuedToken','expiresAt'];
export function captureCredentials(input){
 if(!input||Object.keys(input).some(k=>!credentialNames.includes(k)))throw Error('credential allowlist');
 const result=structuredClone(input);
 if(Object.values(result).some(v=>!['string','number'].includes(typeof v)))throw Error('credential shape');
 return freeze(result);
}
// Constructor imports perform no network I/O. Every send is one native request;
// no fetch, redirect follow, retry, credential refresh or shared agent exists.
export function createHttpClient(binding,credentials,{sendHttps=httpsRequest,sendHttp=httpRequest}={}){
 const c=captureCredentials(credentials),b=freeze(structuredClone(binding));
 const synthetic=b.synthetic===true&&b.host==='synthetic.vercel.app'&&b.projectId==='prj_SYNTHETIC'&&b.deploymentId==='dpl_SYNTHETIC'&&sendHttps!==httpsRequest;
 const sealed=b.host===sourceBinding.deploymentHost&&b.projectId===sourceBinding.projectId&&b.deploymentId===sourceBinding.deploymentId&&b.buildId===sourceBinding.buildId;
 if(!synthetic&&!sealed)throw Error('caller target authority denied; source deployment remains UNBOUND');
 if(!/^[a-z0-9-]+\.vercel\.app$/.test(b.host)||!/^dpl_[A-Za-z0-9]+$/.test(b.deploymentId)||!/^prj_[A-Za-z0-9]+$/.test(b.projectId)||b.projectId===b.purchaseProjectId||!b.purchaseProjectId||!b.buildId?.match(/^[a-f0-9]{64}$/))throw Error('isolated exact deployment binding');
 return Object.freeze({async send(caseId,context){
  const spec=CASES[caseId];if(!spec||spec.kind!=='http')throw Error('named HTTP case required');
  if(!Number.isFinite(context.deadline)||Date.now()>=context.deadline)throw Error('absolute HTTP deadline required');
  const direct=['B1','B2','B3','B4','B5','V1','V2'].includes(caseId);
  const loopback=caseId==='V1'&&b.bearerVerificationDirectLoopback===true;
  let url=direct?TARGETS.provider+TARGETS.providerPath:'https://'+b.host+'/api/internal/qualification/read-only';
  if(loopback)url='http://127.0.0.1:55443'+TARGETS.providerPath;
  if(caseId==='A5')url='https://'+b.host+'/api/internal/qualification/unsupported';
  const headers=direct?{'x-c5-provider-perimeter':c.providerPerimeter,'x-c5-run':'c5-readonly-20261029-owner-review-1','x-c5-attempt':String(context.slot),'x-c5-correlation':context.dispatchId,'x-c5-build':b.buildId,'x-c5-deployment':b.deploymentId,authorization:'Bearer '+c.providerBearer,'CF-Access-Client-Id':c.cfId,'CF-Access-Client-Secret':c.cfSecret}:{'x-c5-perimeter-secret':c.incomingPerimeter,'x-c5-invocation-secret':c.invocation,'x-c5-run':'c5-readonly-20261029-owner-review-1','x-c5-attempt':String(context.slot),'x-c5-binding':c.permit,'x-c5-binding-signature':c.permitSignature};
  if(caseId==='A1')delete headers['x-c5-invocation-secret'];
  if(caseId==='A2')headers['x-c5-perimeter-secret']='SYNTHETIC-intentionally-wrong-proof';
  if(caseId==='A3')headers['x-c5-binding-signature']='invalid';
  if(caseId==='B1')delete headers.authorization;
  if(caseId==='B2')headers.authorization='Bearer SYNTHETIC-invalid';
  if(caseId==='B3'){delete headers['CF-Access-Client-Id'];delete headers['CF-Access-Client-Secret'];}
  for(const key of Object.keys(headers))if(headers[key]===undefined)delete headers[key];
  const method=caseId==='A4'?'GET':direct?(caseId==='B4'?'POST':'GET'):'POST';
  return await new Promise((resolve,reject)=>{
   let settled=false,timer;
   const complete=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);error?reject(error):resolve(value);};
   const request=(loopback?sendHttp:sendHttps)(url,{method,headers,agent:false,timeout:5000},response=>{
    let size=0;const chunks=[];
    response.on('data',chunk=>{size+=chunk.length;if(size>65536)response.destroy(Error('response bound'));else chunks.push(Buffer.from(chunk));});
    response.once('error',e=>complete(e));response.once('end',()=>{
     try{let identity;const rawStatus=String(response.statusCode);
      if(!direct&&chunks.length&&/^application\/json(?:;|$)/i.test(response.headers?.['content-type']??'')){const body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks)));if(body.correlation!==undefined)identity=serverIdentity(body,b,context.slot);}
      if(!direct&&rawStatus==='200'&&!identity)throw Error('success missing actual identity');
      complete(null,{status:rawStatus,rawStatus,entry:direct?'provider':'app',responseIdentity:identity});
     }catch(error){complete(error);}
    });
   });
   timer=setTimeout(()=>request.destroy(Error('absolute deadline; outcome unknown')),Math.max(1,Math.min(15000,context.deadline-Date.now())));
   request.once('timeout',()=>request.destroy(Error('connection deadline')));
   request.once('error',e=>complete(e));if(Date.now()>=context.deadline){request.destroy(Error('HTTP deadline before send'));}else request.end();
  });
 }});
}
const SESSION_SQL="SELECT pg_backend_pid() AS pid, backend_start, usename AS role, datname AS database, application_name, client_addr::text AS client FROM pg_stat_activity WHERE pid=pg_backend_pid()";
const statements=freeze({'db-identity':IDENTITY_SQL,'db-privileges':PRIVILEGE_SQL,'db-relations':RELATION_SQL,'db-constraints':CONSTRAINT_SQL,'db-marker':MARKER_SQL,'db-session-identity':SESSION_SQL,'db-begin-read-write':'BEGIN READ WRITE','db-rollback':'ROLLBACK'});
export function createDbSession(credentials,{Client}={}){
 const c=captureCredentials(credentials);if(typeof c.dbPassword!=='string'||!c.dbPassword)throw Error('explicit DB credential');
 Client??=require('pg').Client; // Explicit Client; never Pool, URL, ADC or reconnect.
 const client=new Client({...TARGETS.db,password:c.dbPassword,ssl:false,keepAlive:false,application_name:'c5-candidate05-readonly',connectionTimeoutMillis:1500,statement_timeout:2000,query_timeout:2500,idle_in_transaction_session_timeout:2000,options:'-c default_transaction_read_only=on -c search_path=pg_catalog'});
 let attempted=false,connected=false,broken=false,closed=false;
 client.on('error',()=>{broken=true;});
 return Object.freeze({
  async connect(){if(attempted||closed)throw Error('connection retry forbidden');attempted=true;try{await client.connect();connected=true;return {status:'OK'};}catch(e){broken=true;if(['28P01','28000'].includes(e.code))return {status:e.code};throw Error('login outcome unknown');}},
  async statement(operation,caseId){
   if(!connected||broken||closed)throw Error('connection unavailable; reconnect forbidden');
   const sql=operation==='db-negative'?B7[caseId]:statements[operation];if(!sql)throw Error('fixed statement only');
   try{const value=await client.query({text:sql,values:operation==='db-privileges'?[PURE_FUNCTIONS]:[],query_timeout:2500});if(value.rows?.length>512)throw Error('row bound');return {status:'OK',rows:value.rows??[]};}
   catch(e){if(typeof e.code==='string'&&/^[0-9A-Z]{5}$/.test(e.code))return {status:e.code};broken=true;throw Error('statement acknowledgement unknown');}
  },
  async close(){if(!closed){closed=true;let timer;try{await Promise.race([Promise.resolve(client.end()),new Promise((_,reject)=>{timer=setTimeout(()=>{client.connection?.stream?.destroy();reject(Error('DB close unverified'));},250);})]);}finally{clearTimeout(timer);}}},
 });
}
export function createSdkSession(credentials,{retained=false,FirestoreClient,now=Date.now}={}){
 const c=captureCredentials(credentials);let promise,closed=false,inFlight=false;
 const authMetadata=freeze({issuedAt:c.issuedAt,expiresAt:c.expiresAt,authMode:'fixed-issued-token-no-refresh'});
 const closeLate=()=>{closed=true;if(promise)void promise.then(sdk=>sdk.close()).catch(()=>{});};
 return Object.freeze({async read(deadline){
  if(closed||inFlight||!Number.isFinite(deadline))throw Error('absolute SDK deadline required; no overlap');inFlight=true;
  const clock=budget(Math.max(0,Math.min(5000,deadline-Date.now())));
  try{
   clock.check();promise??=(retained?createRetainedReadOnlySdk:createReadOnlySdk)({issuedToken:c.issuedToken,issuedAt:c.issuedAt,expiresAt:c.expiresAt},{FirestoreClient,now});
   const sdk=await beforeDeadline(()=>promise,clock,closeLate);clock.check();
   try{await sdk.readCanary(clock);return {status:'200',identity:sdk.identity,authMetadata};}catch(e){if([7,16].includes(e.code))return {status:String(e.code),identity:sdk.identity,authMetadata};throw e;}
  }finally{inFlight=false;}
 },async close(){closeLate();if(promise)await beforeDeadline(async()=>{await (await promise).close();},budget(100));}});
}
// Concrete finite DB/SDK execution. The surrounding driver owns accounting and
// independent observation; every connect and statement enters count() first.
export class CaseExecutor {
 #retainedDb=null;#retainedSdk=null;#sessionIdentity=null;
 constructor({credentials,http,dbFactory=createDbSession,sdkFactory=createSdkSession,synthetic=false,permissionEvaluation}){
  this.credentials=captureCredentials(credentials);this.http=http?Object.freeze({send:http.send.bind(http)}):undefined;this.dbFactory=dbFactory;this.sdkFactory=sdkFactory;this.synthetic=synthetic;this.permissionEvaluation=permissionEvaluation;for(const key of ['credentials','http','dbFactory','sdkFactory','synthetic','permissionEvaluation'])Object.defineProperty(this,key,{writable:false,configurable:false});
 }
 supportsCase(caseId){return caseId!=='B8'||typeof this.permissionEvaluation==='function';}
 async runCase(spec,context,count){
  if(spec.kind==='http'){
   // Reserve the entire enumerated downstream ceiling before incoming send.
   // Independent observer must reconcile actual fanout (including zero-dispatch
   // branches) against this inventory; reservations are never remote-cessation proof.
   let response;
   for(const operation of spec.steps)await count(operation,async()=>{if(operation===spec.steps[0]){response=await this.http.send(spec.id,context);return {...response,reservationOnly:false};}return {status:'RESERVED',reservationOnly:true};});
   const contract=context.inputs.contracts[spec.externalContract];
   if(contract?.rawStatuses?.some(s=>!['301','302','303','307','308','401','403','404','410'].includes(s)))throw Error('unreviewed denial status');
   const raw=String(response.status);
   const status=(!spec.upstreamProof&&contract?.rawStatuses?.includes(raw))?(spec.externalContract==='preview-retirement-status'?'PREVIEW_RETIRED':'ACCESS_DENIED'):raw;
   return {status,fanoutComplete:true,reservationsOnly:true,rawStatus:raw,responseIdentity:response.responseIdentity};
  }
  if(spec.id==='B8'){
   if(typeof this.permissionEvaluation!=='function')throw Error('supported permission evaluation absent');
   return {...await count(spec.steps[0],()=>this.permissionEvaluation()),fanoutComplete:true};
  }
  if(spec.kind==='sdk'){
   this.#retainedSdk??=this.sdkFactory(this.credentials,{retained:true});
   return {...await count('firestore-get',()=>this.#retainedSdk.read(context.deadline)),fanoutComplete:true};
  }
  let db=spec.id==='V4a'?this.#retainedDb:this.dbFactory(this.credentials);
  if(!db)throw Error('retained baseline Client missing');
  let result,begin=false,negative,rollbackError,retain=false;const inventory={};
  try{
   for(const operation of spec.steps){
    if(operation==='db-rollback')continue;
    result=await count(operation,()=>operation==='db-login'?db.connect():db.statement(operation,spec.id));
    inventory[operation]=result;
    if(operation==='db-begin-read-write'){if(result.status!=='OK')throw Error('BEGIN READ WRITE must succeed');begin=true;}
    if(operation==='db-negative')negative=result;
    else if(result.status!=='OK')return {...result,...(spec.id==='V4a'?{session:this.#sessionIdentity}:{}),fanoutComplete:true};
    if(spec.id==='B6'&&operation==='db-privileges'&&result.rows.length)throw Error('excess privilege');
   }
   if(spec.id==='B6'){
    const identity=inventory['db-identity'].rows;
    if(identity.length!==1||identity[0].role!==TARGETS.db.user||identity[0].database!==TARGETS.db.database||!['127.0.0.1','127.0.0.1/32'].includes(identity[0].host)||identity[0].port!==TARGETS.db.port||identity[0].readonly!=='on')throw Error('exact DB identity mismatch');
    validateRelations(inventory['db-relations'].rows,inventory['db-constraints'].rows);
    if(inventory['db-marker'].rows.length!==1||inventory['db-marker'].rows[0].marker!=='mcvplus_c5_roq_20261029:c5-readonly-20261029')throw Error('marker mismatch');
   }
   if(spec.id==='D12'){const rows=inventory['db-session-identity'].rows;if(rows.length!==1||!Number.isInteger(rows[0].pid)||!rows[0].backend_start||rows[0].role!==TARGETS.db.user||rows[0].database!==TARGETS.db.database||rows[0].application_name!=='c5-candidate05-readonly'||rows[0].client!=='127.0.0.1')throw Error('retained session identity missing');const marker=inventory['db-marker'].rows;if(marker.length!==1||marker[0].marker!=='mcvplus_c5_roq_20261029:c5-readonly-20261029')throw Error('retained resource marker mismatch');retain=true;}
  }finally{
   if(begin){try{const cleanup=await count('db-rollback',()=>db.statement('db-rollback',spec.id));if(cleanup.status!=='OK')throw Error('rollback unverified');}catch(e){rollbackError=e;}}
   if(spec.id==='D12'&&retain){this.#retainedDb=db;this.#sessionIdentity=freeze(structuredClone(inventory['db-session-identity'].rows[0]));}
   else if(spec.id!=='V4a')await db.close();
   if(rollbackError)throw rollbackError;
  }
  return {...(negative??result),...(spec.id==='D12'||spec.id==='V4a'?{session:this.#sessionIdentity}:{}),fanoutComplete:true};
 }
 async close(){await this.#retainedDb?.close();await this.#retainedSdk?.close();}
}
