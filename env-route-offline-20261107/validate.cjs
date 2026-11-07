'use strict';
// Portable Node24. Mock-only VM; no network API is available inside the sandbox.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const e=JSON.parse(fs.readFileSync(__dirname+'/cli-excerpts.json')),results=[];
async function check(name,fn){await fn();results.push({name,pass:true});}
(async()=>{
const logs=[],secret='SYNTHETIC-ONLY-DO-NOT-PERSIST';
const runtime={PRIVATE_RUNTIME:secret,NEXT_PUBLIC_FIXTURE:'public-fixture'},build={NEXT_PUBLIC_FIXTURE:'public-fixture'};
const sandbox={process:{env:runtime},import_chalk:{default:{bold:x=>x}},param:x=>x};
vm.runInNewContext(e.parseEnv+e.addProcessEnv+';globalThis.parse=parseEnv;globalThis.resolve=addProcessEnv;',sandbox);
await check('name-only CLI flags resolve from child environment without value logging',async()=>{
const env=sandbox.parse(['PRIVATE_RUNTIME','NEXT_PUBLIC_FIXTURE']);
await sandbox.resolve(s=>logs.push(s),env);assert.equal(env.PRIVATE_RUNTIME,secret);assert(!logs.join('').includes(secret));});
await check('missing named environment value fails closed',async()=>{await assert.rejects(()=>sandbox.resolve(()=>{},sandbox.parse(['MISSING_FIXTURE'])));});
let captured;
const wrapper={stamp_default:()=>null,processDeployment:async x=>{captured=x;return {id:'mock'};}};
vm.runInNewContext('globalThis.create=({'+e.create+'}).create;',wrapper);
await check('actual wrapper preserves distinct runtime/build maps',async()=>{
await wrapper.create.call({_client:{agent:null}},'fixture-source',{name:'fixture',project:'prj_fixture',env:runtime,build:{env:build},target:'preview'},{id:'team_fixture'},false);
assert.equal(captured.requestBody.env.PRIVATE_RUNTIME,secret);
assert.deepEqual(Object.keys(captured.requestBody.build.env),['NEXT_PUBLIC_FIXTURE']);assert.equal(captured.requestBody.source,'cli');});
await check('extracted wrapper forwards source path and contains no shared-setting mutation request',async()=>{
assert(!/method:\s*["'](?:PATCH|PUT|DELETE)["']/.test(e.create));assert.equal(captured.path,'fixture-source');});
let sends=0,wire,reply;
const transport={import_utils:{createDebug:()=>()=>{},prepareFiles:()=>[],getApiDeploymentsUrl:()=>'/v13/deployments',fetchApi:async(url,token,opts)=>{sends++;wire={url,body:JSON.parse(opts.body)};if(reply instanceof Error)throw reply;return reply;}},import_query_string:{generateQueryString:()=>'?teamId=team_fixture'}};
vm.runInNewContext(e.postDeployment+';globalThis.post=postDeployment;',transport);
await check('actual final builder preserves env/build and omits preview target; BUILDING is only created',async()=>{
reply={ok:true,headers:new Map(),json:async()=>({id:'mock',readyState:'BUILDING'})};
const events=[];for await(const event of transport.post(new Map(),{debug:false},captured.requestBody))events.push(event);
assert.equal(sends,1);assert.equal(wire.body.env.PRIVATE_RUNTIME,secret);
assert.deepEqual(wire.body.build.env,build);assert(!Object.hasOwn(wire.body,'target'));
assert.equal(events[0].type,'created');assert.equal(events[0].payload.readyState,'BUILDING');});
await check('single extracted POST failure does not retry but raw error must not be logged',async()=>{
sends=0;reply={ok:false,status:400,json:async()=>({error:{code:'fixture_error',message:secret}})};
const events=[];for await(const event of transport.post(new Map(),{},captured.requestBody))events.push(event);
assert.equal(sends,1);assert.equal(events[0].type,'error');assert.equal(events[0].payload.message,secret);});
await check('single extracted POST network failure does not retry',async()=>{
sends=0;reply=new Error('synthetic network failure');
for await(const event of transport.post(new Map(),{},captured.requestBody))assert.equal(event.type,'error');
assert.equal(sends,1);});
await check('full upload source has missing_files recovery and two deploy call sites',async()=>{
assert(e.upload.includes('event.payload.code === "missing_files"'));
assert.equal((e.upload.match(/import_deploy\.deploy\)\(/g)||[]).length,2);});
const out={vercelRequests:0,realCredentialsRead:0,cliExecuted:false,passed:results.length,results,caveat:'Extracted functions only; not full CLI validation, live acceptance or schema conformance. Synthetic values; no request body persisted.'};
fs.writeFileSync(__dirname+'/validation-result.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out,null,2));
})().catch(()=>{console.error('Offline validation failed (details withheld)');process.exitCode=1;});
