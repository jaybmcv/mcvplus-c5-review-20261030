const vm=require('vm'),fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto');
const code=fs.readFileSync(__dirname+'/deploy-counted.cjs','utf8');
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const keys=['buildCommand','installCommand','framework','rootDirectory','nodeVersion','outputDirectory','ssoProtection','passwordProtection','trustedIps','resourceConfig','gitForkProtection','gitLFS','link'];
async function run(mode){
 let rows=Array.from({length:24},(_,i)=>({event:'started',phase:'prerequisite',slot:i+1})),calls=[],writes={},errors=[];
 const sha='a'.repeat(40),project='prj_bnugVcBR13UQb0N8q43GbxC5flDP',team='team',url='fixture-preview.vercel.app',id='dpl_Fixture';
 const projects=[project,'prj_Cx7XNBjhxpcLwN6OCOFTtLh4VR27'].map(id=>({id,ssoProtection:id===project?{deploymentType:'all'}:undefined,env:[]}));
 const baseline={at:'historical',projects:projects.map((p,i)=>({id:p.id,label:p.id===project?'purchase':'alpha',configurationSha256:hash(Object.fromEntries(keys.map(k=>[k,p[k]??null]))),environmentSha256:hash([]),aliases:[{alias:p.id+'.vercel.app',deploymentId:'dpl_Old'}]}))};
 const fakeFs={openSync(){if(mode==='locked')throw Error('lock held');return 123;},closeSync(){},unlinkSync(){},readFileSync(path){if(path.endsWith('supplemental-requests.jsonl'))return rows.map(JSON.stringify).join('\n');if(path.endsWith('review-acceptance.json'))return JSON.stringify({manifestSha256:'digest',previewTransportAccepted:true});if(path.endsWith('ACCOUNTING-A5.json')){if(mode==='unapproved')throw Error('missing A5');return JSON.stringify({meteredTotal:48,limits:{prerequisite:28,setup:12,cleanup:8},approvalReference:'fixture'});}
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
  if(options.method==='POST')return Response.json({id,url,readyState:'BUILDING'});
  if(address.includes('/v13/deployments/')){statusCount++;return Response.json({id,url,readyState:statusCount<6?'BUILDING':(mode==='final-build-error'?'ERROR':'READY'),projectId:project,gitSource:{sha},target:null});}
  if(address.includes('/v9/projects/')){const p=projects.find(p=>address.includes('/'+p.id+'?'));return Response.json(p);}
  if(address.includes('/v4/aliases')){const b=baseline.projects.find(p=>address.includes('projectId='+p.id));const aliases=structuredClone(b.aliases);if(mode==='alias-drift'){aliases.push({alias:'previously-unrecorded.vercel.app',deploymentId:last.phase==='prerequisite'?'dpl_Preexisting':'dpl_Changed'});}return Response.json({aliases});}
  assert.equal(address,'https://'+url);assert(!options.headers.Authorization,'operator bearer must not reach preview');
  return new Response(null,{status:307,headers:{Location:'https://vercel.com/sso-api?url=fixture'}});
 };
 const fakeRequire=name=>{if(name==='fs')return fakeFs;if(name==='assert/strict')return assert;if(name==='crypto')return crypto;if(name==='child_process')return {execFileSync(){}};if(name==='./create-wire.cjs')return {construct:()=>({body:{fixture:true},summary:{manifestSha256:'digest'}})};throw Error(name);};
 const process={argv:['node','fixture','--execute'],execPath:'node',exitCode:0};
 await vm.runInNewContext(code,{require:fakeRequire,__dirname:'/fixture',process,console:{log(){},error(x){errors.push(x)}},URL,fetch,AbortSignal,setTimeout:(f)=>{f();}});
 const starts=rows.filter(x=>x.event==='started'&&x.phase==='setup');
 if(mode==='normal'){assert.equal(calls.length,16);assert.equal(starts.length,12);assert.equal(process.exitCode,0);const result=Object.values(writes).pop();assert(result.protected&&result.ready&&result.activation===false);}
 else if(mode==='unapproved'||mode==='locked'){assert.equal(calls.length,0);assert.equal(starts.length,0);assert.equal(process.exitCode,1);}
 else if(mode==='final-build-error'){assert.equal(calls.length,11);assert.equal(process.exitCode,1);assert(Object.values(writes).pop().error.includes('ERROR'));}
 else if(mode==='alias-drift'){assert.equal(process.exitCode,1);assert(Object.values(writes).pop().error.includes('alias target changed'));}
 else {assert.equal(calls.length,1);assert.equal(rows.filter(x=>x.event==='started').length-24,1);assert.equal(process.exitCode,1);}
 return {case:mode,requests:calls.length,pass:true};
}
(async()=>{const results=[];for(const mode of ['normal','unapproved','locked','redirect','network-failure','final-build-error','alias-drift'])results.push(await run(mode));fs.writeFileSync(__dirname+'/transport-fixtures-result.json',JSON.stringify({at:new Date().toISOString(),liveRequests:0,results},null,2));console.log(JSON.stringify(results));})().catch(e=>{console.error(e);process.exitCode=1});
