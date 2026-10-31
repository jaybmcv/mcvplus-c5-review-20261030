import fs from 'node:fs';
import path from 'node:path';
import {RUN,LIMIT} from './constants.mjs';
// Dedicated OS evidence store, never a business/DB audit. Directory must be provisioned
// with protected ACLs; no reset/unlink API. One run, 48 finite immutable reservation files.
export class Slots {
  constructor(directory,run=RUN) {if(run!==RUN||!path.isAbsolute(directory))throw Error('ledger binding');this.directory=directory;}
  reserve(slot) {
    if(!Number.isInteger(slot)||slot<1||slot>LIMIT)throw Error('quota');
    const fd=fs.openSync(path.join(this.directory,String(slot).padStart(2,'0')+'.slot'),'wx',0o600);
    try {fs.writeFileSync(fd,JSON.stringify({run:RUN,slot,state:'reserved'})+'\n');fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
    // Failure/crash after create consumes this slot, including partial records. No refund/retry.
    return slot;
  }
  next() {for(let n=1;n<=LIMIT;n++){try{return this.reserve(n);}catch(e){if(e.code!=='EEXIST')throw e;}}throw Error('quota');}
}
export function boundedLog(directory,entry) {
  // Serialize only fixed allowlisted values, no arbitrary text/error/request fields.
  if(!/^[0-9a-f-]{36}$/.test(entry.correlation)||!Number.isInteger(entry.slot)||entry.slot<1||entry.slot>LIMIT||
     !['allowed','denied','unavailable'].includes(entry.code))throw Error('log schema');
  const lockFile=path.join(directory,'events.lock'),lock=fs.openSync(lockFile,'wx',0o600);
  try {
  const line=JSON.stringify({at:new Date().toISOString(),correlation:entry.correlation,slot:entry.slot,code:entry.code})+'\n';
  const file=path.join(directory,'events.0.jsonl'), cap=16384;
  if(Buffer.byteLength(line)>512)throw Error('log size');
  if(fs.existsSync(file)&&fs.statSync(file).size+Buffer.byteLength(line)>cap){
    if(fs.existsSync(path.join(directory,'events.3.jsonl')))fs.unlinkSync(path.join(directory,'events.3.jsonl'));
    for(let i=2;i>=0;i--){const from=path.join(directory,'events.'+i+'.jsonl');if(fs.existsSync(from))fs.renameSync(from,path.join(directory,'events.'+(i+1)+'.jsonl'));}
  }
  fs.appendFileSync(file,line,{mode:0o600});
  }finally{fs.closeSync(lock);fs.unlinkSync(lockFile);}
}
