const vm=require('vm'),fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto');
const code=fs.readFileSync(__dirname+'/deploy-counted.cjs','utf8');
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const keys=['buildCommand','installCommand','framework','rootDirectory','nodeVersion','outputDirectory','ssoProtection','passwordProtection','trustedIps','resourceConfig','gitForkProtection','gitLFS','link'];
async function run(mode){
 let rows=Array.from({length:mode==='already-consumed'?29:24},(_,i)=>({event:'started',phase:'prerequisite',slot:i+1})),calls=[],writes={},errors=[];
 const sha='a'.repeat(40),project='prj_bnugVcBR13UQb0N8q43GbxC5flDP',team='team',url='fixture-preview.vercel.app',id='dpl_Fixture';
 const projects=[project,'prj_Cx7XNBjhxpcLwN6OCOFTtLh4VR27'].map(id=>({id,ssoProtection:id===project?{deploymentType:'all'}:undefined,env:[]}));
 const baseline={at:'historical',projects:projects.map((p,i)=>({id:p.id,label:p.id===project?'purchase':'alpha',configurationSha256:hash(Object.fromEntries(keys.map(k=>[k,p[k]??null]))),environmentSha256:hash([]),aliases:[{alias:p.id+'.vercel.app',deploymentId:'dpl_Old'}]}))};
 if(mode==='cleanup-reserved')rows[0].phase='cleanup';
 let opened=0,closed=0,unlinked=0;
 const fakeFs={openSync(){if(mode==='locked')throw Error('lock held');opened++;return 123;},closeSync(){closed++;},unlinkSync(){unlinked++;},readFileSync(path){if(path.endsWith('supplemental-requests.jsonl'))return rows.map(JSON.stringify).join('\n');if(path.endsWith('review-acceptance.json'))return JSON.stringify({manifestSha256:'digest',previewTransportAccepted:true});if(path.endsWith('ACCOUNTING-A5.json')){if(mode==='unapproved')throw Error('missing A5');return JSON.stringify({meteredTotal:48,limits:{prerequisite:28,setup:12,cleanup:8},approvalReference:'fixture'});}
 if(path.endsWith('configuration-manifest.json'))return JSON.stringify({source:{sha},deployment:{projectId:project,teamId:team}});
 if(path.endsWith('auth.json'))return JSON.stringify({token:'operator-fixture-only',expiresAt:Date.now()/1000+7200});
 if(path.endsWith('baseline.json'))return JSON.stringify(baseline);throw Error('unexpected read '+path);},
 appendFileSync(path,text){assert(path.endsWith('supplemental-requests.jsonl'));rows.push(JSON.parse(text));},writeFileSync(path,text){if(typeof path==='number')return;writes[path]=JSON.parse(text);}};
 let statusCount=0;
 const fetch=async(address,options)=>{
  const last=rows[rows.length-1];assert.equal(last.event,'started','must durably log before send');
  assert.equal(options.redirect,'manual');calls.push({address,options});
  if(mode==='redirect')return new Response(null,{status:307,headers:{Location:'https://elsewhere.invalid'}});
  if(mode==='network-failure')throw Error('fixture network loss');
  if(options.method==='POST'){
   if(mode==='create-400')return Response.json({error:{code:'bad_request',message:'Invalid request: gitSource repoId should be string',details:{token:'never-persist'}}},{status:400});
   if(mode==='create-secret')return Response.json({error:{code:'operator-fixture-only',message:'invalid operator-fixture-only env-fixture-secret build-fixture-secret https://secret.invalid sk-secret-token',details:{requestBody:'never-persist'}}},{status:400});
   if(mode==='create-long-message')return Response.json({error:{code:'bad_request',message:'invalid request '.repeat(500)}},{status:400});
   if(mode==='create-malformed')return new Response('<html>secret</html>',{status:400});
   if(mode==='create-oversized')return new Response('x'.repeat(16385),{status:400});
   if(mode==='create-stream-error')return new Response(new ReadableStream({start(c){c.error(new Error('secret-stream-error'));}}),{status:400});
   if(mode==='create-timeout')return new Response(new ReadableStream({pull(){return new Promise(()=>{});}}),{status:400});
   if(mode==='create-unknown')return Response.json({error:{code:'unknown-secret',message:'invalid foo https://secret.invalid 1234 sk_abc',extra:'secret'}},{status:400});
   return Response.json({id,url,readyState:'BUILDING'});
  }
  if(address.includes('/v13/deployments/')){statusCount++;return Response.json({id,url,readyState:statusCount<6?'BUILDING':(mode==='final-build-error'?'ERROR':'READY'),projectId:project,gitSource:{sha},target:null});}
  if(address.includes('/v9/projects/')){const p=projects.find(p=>address.includes('/'+p.id+'?'));return Response.json(p);}
  if(address.includes('/v4/aliases')){const b=baseline.projects.find(p=>address.includes('projectId='+p.id));const aliases=structuredClone(b.aliases);if(mode==='alias-drift'){aliases.push({alias:'previously-unrecorded.vercel.app',deploymentId:last.phase==='prerequisite'?'dpl_Preexisting':'dpl_Changed'});}return Response.json({aliases});}
  assert.equal(address,'https://'+url);assert(!options.headers.Authorization,'operator bearer must not reach preview');
  return new Response(null,{status:307,headers:{Location:'https://vercel.com/sso-api?url=fixture'}});
 };
 const fakeRequire=name=>{if(name==='fs')return fakeFs;if(name==='assert/strict')return assert;if(name==='crypto')return crypto;if(name==='child_process')return {execFileSync(){}};if(name==='./create-wire.cjs')return {construct:()=>({body:{fixture:true,env:{FIXTURE:'env-fixture-secret'},build:{env:{FIXTURE:'build-fixture-secret'}}},summary:{manifestSha256:'digest'}})};throw Error(name);};
 const process={argv:['node','fixture','--execute'],execPath:'node',exitCode:0};
 await vm.runInNewContext(code,{require:fakeRequire,__dirname:'/fixture',process,console:{log(){},error(x){errors.push(x)}},URL,fetch,AbortSignal,Buffer,clearTimeout,setTimeout:(f,ms)=>ms===55000?f():setTimeout(f,ms)});
 const starts=rows.filter(x=>x.event==='started'&&x.phase==='setup');
 if(mode==='normal'){assert.equal(calls.length,16);assert.equal(starts.length,12);assert.equal(process.exitCode,0);const result=Object.values(writes).pop();assert(result.protected&&result.ready&&result.activation===false);}
 else if(['unapproved','locked','already-consumed'].includes(mode)){assert.equal(calls.length,0);assert.equal(starts.length,0);assert.equal(process.exitCode,1);}
 else if(mode==='cleanup-reserved'){assert.equal(calls.length,0);assert.equal(process.exitCode,1);}
 else if(mode.startsWith('create-')){
  assert.equal(calls.length,5);assert.equal(calls.filter(c=>c.options.method==='POST').length,1,'no retry');
  assert.equal(starts.length,1);assert.equal(rows.filter(x=>x.event==='started').length,29);
  assert.equal(rows.filter(x=>x.phase==='cleanup').length,0);assert.equal(process.exitCode,1);
  const result=Object.values(writes).pop();assert.equal(result.status,'STOPPED');assert.equal(result.deployed,false);
  assert.equal(result.createError.status,400);assert.equal(result.error,'Create HTTP400; STOP no retry');
  const persisted=JSON.stringify(writes)+JSON.stringify(errors)+JSON.stringify(rows);
  for(const secret of ['operator-fixture-only','env-fixture-secret','build-fixture-secret','never-persist','secret.invalid','sk-secret-token','unknown-secret','sk_abc','secret-stream-error'])assert(!persisted.includes(secret),'leaked '+secret);
  assert(JSON.stringify(result.createError).length<800);
  if(mode==='create-400'){assert.equal(result.createError.code,'bad_request');assert(result.createError.message.includes('repoId should be string'));}
  if(mode==='create-long-message')assert.equal(result.createError.message.length,512);
  if(mode==='create-secret')assert.equal(result.createError.message,'[withheld: echoed protected value]');
  if(mode==='create-malformed'||mode==='create-stream-error'||mode==='create-timeout')assert.equal(result.createError.bodyState,'unreadable');
  if(mode==='create-oversized')assert.equal(result.createError.bodyState,'oversized');
 }
 else if(mode==='final-build-error'){assert.equal(calls.length,11);assert.equal(process.exitCode,1);assert(Object.values(writes).pop().error.includes('ERROR'));}
 else if(mode==='alias-drift'){assert.equal(process.exitCode,1);assert(Object.values(writes).pop().error.includes('alias target changed'));}
 else {assert.equal(calls.length,1);assert.equal(rows.filter(x=>x.event==='started').length-24,1);assert.equal(process.exitCode,1);}
 assert.equal(closed,opened);assert.equal(unlinked,opened,'execution lock released');
 return {case:mode,requests:calls.length,pass:true};
}
(async()=>{const results=[];for(const mode of ['normal','unapproved','locked','redirect','network-failure','final-build-error','alias-drift','already-consumed','cleanup-reserved','create-400','create-secret','create-malformed','create-oversized','create-stream-error','create-timeout','create-unknown','create-long-message'])results.push(await run(mode));fs.writeFileSync(__dirname+'/transport-fixtures-result.json',JSON.stringify({at:new Date().toISOString(),liveRequests:0,results},null,2));console.log(JSON.stringify(results));})().catch(e=>{console.error(e);process.exitCode=1});
