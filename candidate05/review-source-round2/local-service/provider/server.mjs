import {budget} from '../qualification/budget.mjs';
import http from 'node:http';
import {sameSecret} from '../qualification/gates.mjs';
import {RUN,PROVIDER_PATH,SCOPES} from '../qualification/constants.mjs';
import {Slots,boundedLog} from '../qualification/ledger.mjs';
import {startupGate,MEMBER_SQL} from './readonly-db.mjs';
export async function createProvider({db,binding,bearer,perimeter,slotsDirectory,logDirectory,testPort}) {
 if(binding.enabled!==true||binding.runId!==RUN||!/^dpl_[A-Za-z0-9]+$/.test(binding.deploymentId)||!/^[a-f0-9]{64}$/.test(binding.buildId)||
    !sameSecret(bearer,bearer)||!sameSecret(perimeter,perimeter)||sameSecret(bearer,perimeter)||
    JSON.stringify(binding.scopes)!==JSON.stringify(SCOPES))throw Error('provider disabled');
 await startupGate(db,{testPort}); // No listener until effective startup gate passes.
 const slots=new Slots(slotsDirectory);
 let busy=false;
 const server=http.createServer(async(req,res)=>{
   const clock=budget(5000);let callerClosed=false;res.once('close',()=>callerClosed=true);
   const boundedDb={async query(sql,args){if(callerClosed)throw Error('cancelled');clock.check();const result=await db.query(sql,args);clock.check();return result;}};
   let ownsBusy=false,status=401,code='denied',correlation=req.headers['x-c5-correlation'],slot=Number(req.headers['x-c5-attempt']);
   const finish=()=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','Connection':'close'});res.end(JSON.stringify({qualified:status===200}));};
   try{
     if(!sameSecret(req.headers.authorization?.replace(/^Bearer /,''),bearer)||!sameSecret(req.headers['x-c5-provider-perimeter'],perimeter))return finish();
     if(req.method!=='GET'||req.url!==PROVIDER_PATH||req.headers['content-length']&&req.headers['content-length']!=='0'||req.headers['transfer-encoding']||
       req.headers['x-c5-run']!==RUN||req.headers['x-c5-build']!==binding.buildId||req.headers['x-c5-deployment']!==binding.deploymentId||
       !/^[0-9a-f-]{36}$/.test(correlation??'')||!Number.isInteger(slot)||slot<1||slot>48){status=400;return finish();}
     if(busy){status=503;return finish();}busy=true;ownsBusy=true;
     try {slots.reserve(slot);}catch {status=409;return finish();}
     // Marker/effective grants revalidated each invocation; no long-lived privilege assertion.
     await startupGate(boundedDb,{testPort});
     const rows=(await boundedDb.query(MEMBER_SQL,['990000000000000001'])).rows;
     status=rows.length===1&&rows[0].discord_user_id==='990000000000000001'&&rows[0].status==='active'?200:503;
     code=status===200?'allowed':'unavailable';
   }catch {status=503;code='unavailable';}
   finally {if(ownsBusy)busy=false; if(/^[0-9a-f-]{36}$/.test(correlation??'')&&Number.isInteger(slot)&&slot>=1&&slot<=48) {
       try{boundedLog(logDirectory,{correlation,slot,code});}catch{status=503;}}
     if(!res.headersSent)finish();}
 });
 server.requestTimeout=5000;server.headersTimeout=5000;server.keepAliveTimeout=1;server.maxRequestsPerSocket=1;
 return server;
}
