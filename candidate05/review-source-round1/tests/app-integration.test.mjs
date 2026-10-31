import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runChild} from '../app/qualification/handler.mjs';
import {retainedTokenAuth,createReadOnlySdk} from '../app/qualification/sdk.mjs';
import {createDbSession} from '../driver/clients.mjs';
const receipts=[];
test('worker module import registers no IPC handlers or network initialization',async()=>{
 const before=process.listenerCount('message');const module=await import('../app/qualification/worker.mjs');assert.equal(typeof module.runWorker,'function');assert.equal(process.listenerCount('message'),before);
});
test('actual fresh worker children fail configuration before network and are collected',async()=>{
 for(let i=0;i<2;i++){
  const result=await runChild({slot:i+1,correlation:'SYNTHETIC',binding:{runId:'SYNTHETIC'},deadline:Date.now()+2500,budgetMs:2500},{C5_REPLAY_PRIVATE_KEY:'SYNTHETIC-must-not-enter-worker'},undefined,{entry:'D:/OpenClaw-workspace/recovery/mcvplus-candidate05-build-20261031-r2/qualification/worker.mjs',onSpawn:child=>receipts.push({pid:child.pid})});
  receipts.at(-1).result=result;assert.equal(result.status,503);assert.equal(result.code,'unavailable');assert.equal(result.workerCollected,true);assert.ok(result.workerInstance);assert.equal(result.sdkIdentity,null);
 }
 assert.notEqual(receipts[0].result.workerInstance,receipts[1].result.workerInstance);
 for(const r of receipts)assert.throws(()=>process.kill(r.pid,0),e=>e.code==='ESRCH');
 fs.writeFileSync(new URL('../evidence/ACTUAL-WORKER-IDENTITIES.json',import.meta.url),JSON.stringify({purpose:'configuration-denied children only; no SDK/data-plane calls',receipts},null,2));
});
test('installed firebase-admin14.2 v1 accepts static auth facade without network initialization',async()=>{
 const token={issuedToken:'SYNTHETIC-unusable-token',expiresAt:Date.now()+60000};const a=await createReadOnlySdk(token),b=await createReadOnlySdk(token);assert.notEqual(a.identity.id,b.identity.id);await a.close();await b.close();
});
test('installed explicit pg Client can be constructed and ended without connecting',async()=>{
 const client=createDbSession({dbPassword:'SYNTHETIC-unusable-password'});await client.close();await assert.rejects(client.connect(),/retry forbidden/);
});
