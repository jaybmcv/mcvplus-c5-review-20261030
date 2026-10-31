import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {PURE_FUNCTIONS as serviceFunctions} from '../local-service/provider/readonly-db.mjs';
import {PURE_FUNCTIONS as driverFunctions} from '../driver/provider-contract.mjs';
import * as serviceConstants from '../local-service/qualification/constants.mjs';
import * as appConstants from '../app/qualification/constants.mjs';
const root=new URL('../',import.meta.url),service=new URL('../local-service/',import.meta.url);
test('disabled service bundle exact file hashes and application build binding match',()=>{
 const manifest=JSON.parse(fs.readFileSync(new URL('SOURCE-MANIFEST.json',service)));
 for(const item of manifest.files){const b=fs.readFileSync(new URL(item.path,service));assert.equal(b.length,item.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),item.sha256);}
 const binding=JSON.parse(fs.readFileSync(new URL('config/provider-binding.json',service)));
 const app=JSON.parse(fs.readFileSync(new URL('../app/config/run-binding.json',service)));
 assert.equal(binding.enabled,false);assert.equal(binding.deploymentId,'UNBOUND');assert.equal(binding.slotsDirectory,'UNPROVISIONED');assert.equal(binding.logDirectory,'UNPROVISIONED');assert.equal(binding.buildId,app.buildId);assert.equal(manifest.appBuildId,app.buildId);
});
test('provider and driver exact pure-function authority and fixed targets agree',()=>{
 assert.deepEqual([...serviceFunctions].sort(),[...driverFunctions].sort());assert.ok(serviceFunctions.includes('pg_backend_pid()'));
 for(const key of ['RUN','RESOURCE','ORIGIN','PROVIDER_PATH','DOCUMENT'])assert.equal(serviceConstants[key],appConstants[key]);
 const entry=fs.readFileSync(new URL('provider/entry.mjs',service),'utf8');assert.match(entry,/port:55442/);assert.match(entry,/listen\(55443,'127\.0\.0\.1'/);
});
test('actual provider entry rejects disabled source binding before client setup and exits collected',async()=>{
 const entry=fileURLToPath(new URL('provider/entry.mjs',service));
 const child=spawn(process.execPath,[entry],{cwd:fileURLToPath(service),windowsHide:true,env:{SystemRoot:process.env.SystemRoot,PATH:process.env.PATH,NODE_OPTIONS:'--preserve-symlinks --preserve-symlinks-main',C5_PROVIDER_ENABLED:'true',C5_READONLY_DB_PASSWORD:'SYNTHETIC-unusable-password-only'},stdio:['ignore','pipe','pipe']});
 let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);
 const outcome=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{child.kill();reject(Error('disabled entry did not exit'));},3000);child.once('error',reject);child.once('close',(code,signal)=>{clearTimeout(timer);resolve({code,signal});});});
 assert.equal(outcome.code,78);assert.equal(stdout,'');assert.equal(stderr.trim(),'{"code":"provider_startup_denied"}');assert.throws(()=>process.kill(child.pid,0),e=>e.code==='ESRCH');
 const receipt={purpose:'configuration-denied source entry only; no installed service or DB login',pid:child.pid,...outcome,collected:true,credential:'synthetic only'};
 fs.writeFileSync(new URL('evidence/PROVIDER-BUNDLE-DENIED-CHILD.json',root),JSON.stringify(receipt,null,2));
});
