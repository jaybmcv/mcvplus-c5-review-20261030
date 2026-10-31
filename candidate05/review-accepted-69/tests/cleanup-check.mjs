import fs from 'node:fs';
import net from 'node:net';
const root=new URL('../evidence/',import.meta.url),inventory=JSON.parse(fs.readFileSync(new URL('OWNED-PID-INVENTORY.json',root),'utf8'));
const checks=inventory.pids.map(pid=>{try{process.kill(pid,0);return {pid,gone:false};}catch(error){return {pid,gone:error.code==='ESRCH',error:error.code};}});
const ports=[8089,4409,4509,9159,...new Set(fs.readdirSync(root).filter(x=>/^BUILT-HTTP-\d+\.json$/.test(x)).map(x=>JSON.parse(fs.readFileSync(new URL(x,root),'utf8')).port))];
const listeners=[];
for(const port of ports){const server=net.createServer();const free=await new Promise(resolve=>{server.once('error',()=>resolve(false));server.listen({host:'127.0.0.1',port,exclusive:true},()=>resolve(true));});if(free)await new Promise(resolve=>server.close(resolve));listeners.push({host:'127.0.0.1',port,free});}
const report={timestamp:new Date().toISOString(),checks,listeners,allRecordedProcessesGone:checks.every(x=>x.gone),allRecordedPortsFree:listeners.every(x=>x.free),actions:'read-only PID liveness and task-owned bind/close probes; no process kills, shared listener cleanup, deletion or global process enumeration'};
fs.writeFileSync(new URL('FINAL-CLEANUP.json',root),JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(!report.allRecordedProcessesGone||!report.allRecordedPortsFree)process.exitCode=1;
