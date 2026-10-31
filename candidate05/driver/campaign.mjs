import {Campaign} from './accounting.mjs';
import {CASES,freeze} from './cases.mjs';
import {semanticStatus,reconcileFanout,validateIdentities} from './evidence.mjs';
// This driver retains Candidate04's absolute-path SYNTHETIC ledger/run fence.
// There is deliberately no main(), CLI, hosted target discovery, or recovery API.
export class NamedCampaign {
 #campaign;#backend;#observe;#clock;
 constructor(file,runId,{backend,observe,now=Date.now}){
  if(backend?.synthetic!==true||typeof backend.runCase!=='function'||typeof observe!=='function')throw Error('synthetic backend and independent observer required');
  this.#campaign=new Campaign(file,runId);this.#backend=Object.freeze({runCase:backend.runCase.bind(backend),supportsCase:typeof backend.supportsCase==='function'?backend.supportsCase.bind(backend):undefined});this.#observe=observe;this.#clock=now;
  this.#campaign.db.exec(`CREATE TABLE IF NOT EXISTS fanout(dispatch_id TEXT NOT NULL,ordinal INTEGER NOT NULL,operation TEXT NOT NULL,state TEXT NOT NULL,status TEXT,PRIMARY KEY(dispatch_id,ordinal));
CREATE TABLE IF NOT EXISTS case_results(case_id TEXT PRIMARY KEY,classification TEXT NOT NULL,details TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS changes(credential TEXT PRIMARY KEY,acknowledged_at INTEGER NOT NULL,receipt TEXT NOT NULL);`);
 }
 snapshot(){return {...this.#campaign.snapshot(),fanout:this.#campaign.db.prepare('SELECT * FROM fanout ORDER BY dispatch_id,ordinal').all(),results:this.#campaign.db.prepare('SELECT * FROM case_results').all()};}
 halt(reason,receipt){this.#campaign.halt(reason,receipt);}
 recordChange(group,{acknowledgedAt,receipt}){
  if(!['bearer','cf','firebase','db','preview'].includes(group)||!Number.isSafeInteger(acknowledgedAt)||acknowledgedAt>this.#clock()||typeof receipt!=='string'||!receipt.startsWith('SYNTHETIC-'))throw Error('explicit synthetic administrative receipt required');
  const baselines={bearer:'D1',cf:'D4',firebase:'D7',db:'D12'};
  // All four baselines precede the first destructive credential change.
  if(Object.values(baselines).some(id=>!this.#campaign.db.prepare('SELECT 1 FROM case_results WHERE case_id=? AND classification=?').get(id,'PASS')))throw Error('D1 D4 D7 D12 baselines required before revocation');
  const db=this.#campaign.db;db.exec('BEGIN IMMEDIATE');
  try{const state=db.prepare('SELECT halt,active FROM campaign').get();if(state.halt!==null||state.active!==null)throw Error('HALTED or active');db.prepare('INSERT INTO changes VALUES(?,?,?)').run(group,acknowledgedAt,receipt);db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
 }
 async dispatch(caseId,{authorization,contracts={},evidence={},retryOf,retryAuthorization}={}){
  const c=CASES[caseId];if(!c)throw Error('unknown named case');
  if(this.#backend.supportsCase?.(caseId)===false)return {caseId,state:'BLOCKED',reason:'supported capability absent'};
  // Deep copy prior to any await; caller cannot mutate statuses, plan, contracts or observations.
  const inputs=freeze(structuredClone({authorization,contracts,evidence,retryOf,retryAuthorization}));
  if(c.externalContract&&!inputs.contracts[c.externalContract]?.reviewedReceipt?.startsWith('SYNTHETIC-'))return {caseId,state:'BLOCKED',reason:c.externalContract};
  if(c.requires&&inputs.evidence[c.requires]!==true)return {caseId,state:'BLOCKED',reason:'named fault/readiness capability missing'};
  const change=c.group&&!c.baseline?this.#campaign.db.prepare('SELECT * FROM changes WHERE credential=?').get(c.group):null;
  if(c.group&&!c.baseline&&!change)throw Error('acknowledged credential change required');
  if(change&&c.minute!==undefined){
   if(this.#clock()<change.acknowledged_at+c.minute*60000)throw Error('scheduled checkpoint not reached');
   const previous=this.snapshot().results.some(r=>CASES[r.case_id]?.group===c.group&&r.classification==='EXPECTED-NEGATIVE-CONTAINED');
   if(previous)return {caseId,state:'SKIPPED',reason:'evidenced denial already observed'};
  }
  let transcript=[],resultValue,classification,semantic,actualInventory,dimensions,upstream;
  const adapters={};
  adapters[c.kind]=async context=>{
   let index=0,active=false;
   // Reserve all possible downstream dispatches in one FULL synchronous transaction
   // before the first incoming connect can trigger any remote fanout.
   const db=this.#campaign.db;db.exec('BEGIN IMMEDIATE');
   try{c.steps.forEach((operation,i)=>db.prepare('INSERT INTO fanout VALUES(?,?,?,?,NULL)').run(context.dispatchId,i+1,operation,'reserved-before-send'));db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
   transcript=c.steps.map((operation,i)=>freeze({ordinal:i+1,operation,reservedAt:this.#clock()}));
   const count=async(operation,send)=>{
    if(active||operation!==c.steps[index]||typeof send!=='function')throw Error('fanout order/overlap denied');
    active=true;const ordinal=++index;
    // SQLite FULL/PERSIST commit completes before connect/query/HTTP/SDK entry.
    this.#campaign.db.prepare('UPDATE fanout SET state=? WHERE dispatch_id=? AND ordinal=?').run('consumed-before-send',context.dispatchId,ordinal);
    try{const value=await send();const status=String(value?.status??'OK'),reserved=value?.reservationOnly===true;transcript[ordinal-1]=freeze({...transcript[ordinal-1],knownSent:!reserved,knownStatus:reserved?null:status});this.#campaign.db.prepare('UPDATE fanout SET state=?,status=? WHERE dispatch_id=? AND ordinal=?').run(reserved?'reserved-remote':'acknowledged-local',reserved?null:status,context.dispatchId,ordinal);return value;}
    catch(error){this.#campaign.db.prepare('UPDATE fanout SET state=? WHERE dispatch_id=? AND ordinal=?').run('unknown',context.dispatchId,ordinal);throw error;}
    finally{active=false;}
   };
   resultValue=freeze(structuredClone(await this.#backend.runCase(c,freeze({...context,inputs,deadline:Date.now()+15000}),count)));
   if(active||!index||index>c.steps.length||resultValue?.fanoutComplete!==true)throw Error('unclosed fanout');
   if((resultValue.status==='200'||c.id.startsWith('B7')||c.id==='B6'||c.id==='D12')&&index!==c.steps.length)throw Error('required fanout/cleanup incomplete');
   return {status:String(resultValue.rawStatus??resultValue.status)};
  };
  const observe=async context=>{
   const proof=freeze(structuredClone(await this.#observe(freeze({...context,caseId,transcript:[...transcript],details:resultValue}))));
   if(proof.source!=='independent-platform-and-admin'||!Number.isInteger(proof.snapshots)||proof.snapshots<1||proof.snapshots>6||proof.localSocketCloseOnly===true||proof.ceased!==true||proof.dispatchId!==context.dispatchId||typeof proof.receipt!=='string'||!proof.receipt||proof.receipt.length>512)throw Error('independent cessation absent');
   semantic=semanticStatus(c,resultValue,proof,context,inputs.contracts);
   if(!c.expected.includes(semantic))throw Error('case semantic status mismatch');
   actualInventory=reconcileFanout(c,resultValue,semantic,proof,transcript);
   const prior=id=>{const row=this.#campaign.db.prepare('SELECT details FROM case_results WHERE case_id=?').get(id);return row?JSON.parse(row.details):null;};
   dimensions=validateIdentities(c,resultValue,proof,prior);
   if(c.negative&&(!proof.timingVerified||!proof.workerCollected||!proof.noLateContinuation))throw Error('failure timing/collection evidence missing');
   classification=['200','OK','PERMISSIONS_REVIEWED'].includes(semantic)?'PASS':'EXPECTED-NEGATIVE-CONTAINED';
   if(c.propagation&&semantic==='200'){
    const horizon=c.group==='cf'?15:75;if(this.#clock()>=change.acknowledged_at+horizon*60000)throw Error('acceptance beyond revocation horizon');
    classification='PROPAGATION-OBSERVED';
   }
   if(c.id==='A6'&&!proof.newPlatformInstance)classification='UNKNOWN/UNVERIFIED';
   if(c.id==='A8'&&!proof.idle15Minutes)throw Error('idle window absent');
   if(c.id==='C8'&&(!proof.newServiceInstance||!proof.oldOwnedWorkAbsent))throw Error('restart identity absent');
   if(proof.upstream)upstream={kind:proof.upstream.kind,status:proof.upstream.status,correlation:proof.upstream.correlation,receipt:proof.upstream.receipt};
   return proof;
  };
  // Raw incoming status stays in the authoritative attempts row. Only the
  // independently correlated upstream receipt establishes semantic revocation.
  const expected=[...c.expected,...(c.upstreamProof?['503']:[]),...(inputs.contracts[c.externalContract]?.rawStatuses??[])];
  const result=await this.#campaign.dispatch({caseId,kind:c.kind,expected,authorization:inputs.authorization,retryOf:inputs.retryOf,retryAuthorization:inputs.retryAuthorization},adapters,observe,completed=>{
   actualInventory.forEach(op=>this.#campaign.db.prepare('UPDATE fanout SET state=?,status=? WHERE dispatch_id=? AND ordinal=?').run(op.dispatched?'observed-executed':'observed-not-dispatched',op.status??null,completed.dispatchId,op.ordinal));
   const details={slot:completed.slot,dispatchId:completed.dispatchId,rawStatus:String(resultValue.rawStatus??resultValue.status),semanticStatus:semantic,responseIdentity:resultValue.responseIdentity,sdkIdentity:resultValue.identity,authMetadata:resultValue.authMetadata,session:resultValue.session,upstream,dimensions,actualInventory};
   const encoded=JSON.stringify(details);if(Buffer.byteLength(encoded)>4096)throw Error('bounded result receipt exceeded');
   this.#campaign.db.prepare('INSERT OR REPLACE INTO case_results VALUES(?,?,?)').run(caseId,classification,encoded);
  });
  return {...result,caseId,state:classification,semanticStatus:semantic};
 }
 recoveryReport(){return this.#campaign.recoveryReport();}
 close(){this.#campaign.close();}
}
