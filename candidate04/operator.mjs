import {DatabaseSync} from 'node:sqlite';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
export const PRIMARY = Object.freeze([...Array.from({length:8},(_,i)=>'A'+(i+1)),...Array.from({length:6},(_,i)=>'B'+(i+1)),...'abcdefg'.split('').map(c=>'B7'+c),'B8',...Array.from({length:8},(_,i)=>'C'+(i+1)),...Array.from({length:12},(_,i)=>'D'+(i+1))]);
export const RESERVED = Object.freeze({V1:43,V2:44,V3:45,V4a:46,V4b:47,V5:48});
const KINDS = new Set(['http','sdk','db']);
function transaction(db, fn) { db.exec('BEGIN IMMEDIATE'); try {const v=fn();db.exec('COMMIT');return v;}catch(e){db.exec('ROLLBACK');throw e;} }
export class Campaign {
 constructor(file, runId) {
  // Deliberate offline-only fence: no operational campaign ledger or run is accepted.
  if(!path.isAbsolute(file)||!path.basename(file).startsWith('SYNTHETIC-')||!/^SYNTHETIC-[a-zA-Z0-9-]+$/.test(runId))throw Error('offline synthetic candidate only');
  this.db=new DatabaseSync(file);this.runId=runId;
  this.db.exec('PRAGMA journal_mode=PERSIST; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000;');
  this.db.exec(`CREATE TABLE IF NOT EXISTS campaign(id INTEGER PRIMARY KEY CHECK(id=1),run TEXT NOT NULL,halt TEXT,active TEXT);
CREATE TABLE IF NOT EXISTS attempts(slot INTEGER PRIMARY KEY CHECK(slot BETWEEN 1 AND 48),case_id TEXT NOT NULL,kind TEXT NOT NULL,dispatch_id TEXT UNIQUE NOT NULL,authorization TEXT NOT NULL,retry_authorization TEXT,parent INTEGER,state TEXT NOT NULL,status TEXT,receipt TEXT);
CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY,event TEXT NOT NULL,receipt TEXT NOT NULL);`);
  transaction(this.db,()=>{this.db.prepare('INSERT OR IGNORE INTO campaign(id,run) VALUES(1,?)').run(runId);if(this.db.prepare('SELECT run FROM campaign').get().run!==runId)throw Error('run mismatch');});
 }
 snapshot(){return {campaign:this.db.prepare('SELECT * FROM campaign').get(),attempts:this.db.prepare('SELECT * FROM attempts ORDER BY slot').all(),events:this.db.prepare('SELECT * FROM events ORDER BY id').all()};}
 halt(reason,receipt='operator observation') {if(typeof reason!=='string'||!reason.trim()||typeof receipt!=='string'||!receipt.trim())throw Error('nonempty halt reason and receipt required');transaction(this.db,()=>{this.db.prepare('UPDATE campaign SET halt=COALESCE(halt,?) WHERE id=1').run(reason);this.db.prepare('INSERT INTO events(event,receipt) VALUES(?,?)').run(reason,receipt);});}
 // Inspection only. Never release a crash-held active dispatch or reset/refund a slot.
 recoveryReport(){const s=this.snapshot();return {...s,resumeAllowed:false,action:s.campaign.active?'HALT; reconcile exact local/remote cessation independently; retain consumed slot':'No automatic recovery; any halted campaign remains closed'};}
 async dispatch(plan, adapters, observe) {
  if(!plan||(!PRIMARY.includes(plan.caseId)&&!Object.hasOwn(RESERVED,plan.caseId))||!KINDS.has(plan.kind)||
    !Array.isArray(plan.expected)||!plan.expected.length||plan.expected.some(x=>typeof x!=='string'||!x)||
    typeof plan.authorization!=='string'||!plan.authorization.startsWith('SYNTHETIC-')||typeof adapters[plan.kind]!=='function'||typeof observe!=='function')throw Error('invalid named dispatch');
  // Capture the authorization and adapter before the first asynchronous boundary.
  plan=Object.freeze({...plan,expected:Object.freeze([...plan.expected])});
  const dispatchAdapter=adapters[plan.kind];
  const id=randomUUID();
  const slot=transaction(this.db,()=>{
   const c=this.db.prepare('SELECT * FROM campaign').get();
   if(c.halt!==null||c.active!==null)throw Error('HALTED or active; manual reconciliation required');
   const previous=this.db.prepare('SELECT * FROM attempts WHERE case_id=? ORDER BY slot').all(plan.caseId);
   if(previous.length) {
    const p=previous.find(x=>x.slot===plan.retryOf);
    if(!p||p.state!=='complete'||!plan.retryAuthorization?.startsWith('SYNTHETIC-'))throw Error('explicit fresh retry authorization required');
   } else if(plan.retryOf!==undefined)throw Error('retry parent absent');
   const used=new Set(this.db.prepare('SELECT slot FROM attempts').all().map(x=>x.slot));
   const n=Object.hasOwn(RESERVED,plan.caseId)?(used.has(RESERVED[plan.caseId])?undefined:RESERVED[plan.caseId]):Array.from({length:42},(_,i)=>i+1).find(x=>!used.has(x));
   if(n===undefined)throw Error('eligible quota exhausted');
   this.db.prepare('INSERT INTO attempts(slot,case_id,kind,dispatch_id,authorization,retry_authorization,parent,state) VALUES(?,?,?,?,?,?,?,?)').run(n,plan.caseId,plan.kind,id,plan.authorization,plan.retryAuthorization??null,plan.retryOf??null,'consumed-before-send');
   this.db.prepare('UPDATE campaign SET active=? WHERE id=1').run(id);
   return n;
  }); // FULL synchronous COMMIT completes before any transport entry.
  try {
   const rawResult=await dispatchAdapter.call(adapters,Object.freeze({slot,caseId:plan.caseId,dispatchId:id,runId:this.runId}));
   const status=String(rawResult?.status);
   const result=Object.freeze({...rawResult,status});
   // Do not trust local completion/status alone as proof of remote cessation.
   const evidence=await observe({slot,dispatchId:id,kind:plan.kind,result});
   if(!plan.expected.includes(status)||evidence?.ceased!==true||evidence?.dispatchId!==id||typeof evidence.receipt!=='string'||!evidence.receipt)throw Error('unexpected status or cessation unproven');
   transaction(this.db,()=>{
    const state=this.db.prepare('SELECT active,halt FROM campaign').get();
    if(state.active!==id||state.halt!==null)throw Error('active identity lost or anomaly halt');
    this.db.prepare('UPDATE attempts SET state=?,status=?,receipt=? WHERE slot=?').run('complete',status,evidence.receipt,slot);
    this.db.prepare('UPDATE campaign SET active=NULL WHERE id=1').run();
   });
   return {slot,status,dispatchId:id};
  } catch {
   // Includes persistence errors and thrown/uncertain acknowledgements. Retain active.
   // Before a successful completion commit, a failed halt write leaves the active fence.
   // There is deliberately no storage read after releasing that fence.
   this.halt('uncertain-or-failed','dispatch '+id);
   throw Error('consumed; HALTED; no automatic retry or recovery');
  }
 }
 close(){this.db.close();}
}
