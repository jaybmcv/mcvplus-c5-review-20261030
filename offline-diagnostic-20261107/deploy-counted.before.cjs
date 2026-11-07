'use strict';
const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto'),cp=require('child_process');
const root=__dirname,setup='D:/OpenClaw-workspace/artifacts/mcvplus-preview-setup-20261101',ledger=setup+'/supplemental-requests.jsonl';
const starts=()=>fs.readFileSync(ledger,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).filter(r=>r.event==='started');
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const configKeys=['buildCommand','installCommand','framework','rootDirectory','nodeVersion','outputDirectory','ssoProtection','passwordProtection','trustedIps','resourceConfig','gitForkProtection','gitLFS','link'];
async function main(){
 const {body,summary}=require('./create-wire.cjs').construct();
 if(!process.argv.includes('--execute')){console.log(JSON.stringify({mode:'dry-run',networkRequests:0,maximumSetupRequests:12,additionalPrerequisiteReads:4,summary}));return;}
 const acceptance=JSON.parse(fs.readFileSync(root+'/review-acceptance.json'));
 assert.equal(acceptance.manifestSha256,summary.manifestSha256);assert.equal(acceptance.previewTransportAccepted,true);
 const amendment=JSON.parse(fs.readFileSync(setup+'/ACCOUNTING-A5.json'));
 assert.equal(amendment.meteredTotal,48);assert.deepEqual(amendment.limits,{prerequisite:28,setup:12,cleanup:8});assert(amendment.approvalReference);
 const m=JSON.parse(fs.readFileSync(root+'/configuration-manifest.json'));
 cp.execFileSync(process.execPath,['--conditions=react-server',root+'/verify-source-inputs.cjs'],{stdio:'pipe'});
 assert.equal(starts().length,24);assert.equal(starts().filter(r=>r.phase==='setup').length,0);
 const auth=JSON.parse(fs.readFileSync('C:/Users/HENRI/AppData/Roaming/com.vercel.cli/Data/auth.json'));assert(auth.expiresAt*1000>Date.now()+600000);
 let baseline=JSON.parse(fs.readFileSync('D:/OpenClaw-workspace/artifacts/mcvplus-protected-preview-6166eab-20261101/baseline.json'));
 const team=m.deployment.teamId;
 const append=r=>fs.appendFileSync(ledger,JSON.stringify(r)+'\n',{flush:true});
 async function request(label,url,options={},anonymous=false,phase='setup'){
  const rows=starts();assert(rows.length<40);assert(['setup','prerequisite'].includes(phase));assert(rows.filter(r=>r.phase===phase).length<(phase==='setup'?12:28));assert.equal(rows.filter(r=>r.phase==='cleanup').length,0);
  const u=new URL(url);assert.equal(u.protocol,'https:');
  if(!anonymous)assert.equal(u.hostname,'api.vercel.com');else assert.equal(u.hostname,result.url);
  const slot=rows.length+1;append({event:'started',phase,amendment:'A5',slot,label,url,method:options.method||'GET',at:new Date().toISOString()});
  try{const r=await fetch(url,{...options,headers:{...options.headers,...(!anonymous?{Authorization:'Bearer '+auth.token}:{})},redirect:'manual',signal:AbortSignal.timeout(20000)});append({event:'response',slot,status:r.status,at:new Date().toISOString()});return r;}
  catch(e){append({event:'error',slot,error:e.name,at:new Date().toISOString()});throw e;}
 }
 const result={at:new Date().toISOString(),status:'CREATING',sourceSha:m.source.sha,projectId:m.deployment.projectId,deployed:false,activation:false,runtimeAttested:false,baselineDate:baseline.at};
 const save=()=>fs.writeFileSync(root+'/deployment-result.json',JSON.stringify(result,null,2),{flush:true});
 const api=path=>'https://api.vercel.com'+path+(path.includes('?')?'&':'?')+'teamId='+team;
 try{
  // Fresh pre-create snapshots, scoped to two existing projects only.
  const fresh={at:new Date().toISOString(),projects:[]};
  assert.deepEqual(baseline.projects.map(b=>b.id).sort(),[m.deployment.projectId,'prj_Cx7XNBjhxpcLwN6OCOFTtLh4VR27'].sort());
  for(const old of baseline.projects){
   const response=await request(old.label+' fresh pre-create project snapshot',api('/v9/projects/'+old.id),{},false,'prerequisite');assert(response.ok);const p=await response.json();assert.equal(p.id,old.id);
   if(old.label==='purchase')assert.equal(p.ssoProtection?.deploymentType,'all');
   const aliases=await request(old.label+' fresh pre-create alias snapshot',api('/v4/aliases?projectId='+old.id+'&limit=100'),{},false,'prerequisite');assert(aliases.ok);const a=await aliases.json();assert(!a.pagination?.next);
   fresh.projects.push({id:old.id,label:old.label,configurationSha256:hash(Object.fromEntries(configKeys.map(k=>[k,p[k]??null]))),environmentSha256:hash(p.env||[]),aliases:(a.aliases||[]).map(x=>({alias:x.alias,deploymentId:x.deploymentId||x.deployment?.id}))});
  }
  baseline=fresh;result.baselineDate=fresh.at;fs.writeFileSync(root+'/fresh-baseline.json',JSON.stringify(fresh,null,2),{flush:true});
  // One supported deployment-create request, no upload/CLI discovery fanout.
  const r=await request('create exact protected preview',api('/v13/deployments'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  assert(r.ok,'Create HTTP'+r.status+'; STOP no retry');const d=await r.json();
  assert(/^dpl_[A-Za-z0-9]+$/.test(d.id));assert(/^[a-z0-9-]+\.vercel\.app$/.test(d.url));
  result.deploymentId=d.id;result.url=d.url;result.deployed=true;save();
  let current=d;
  for(let i=0;i<6&&current.readyState!=='READY';i++){
   if(['ERROR','CANCELED'].includes(current.readyState))throw new Error('Build '+current.readyState);
   await new Promise(resolve=>setTimeout(resolve,55000));
   const s=await request('bounded deployment status '+(i+1),api('/v13/deployments/'+d.id));assert(s.ok,'Status HTTP'+s.status);current=await s.json();
  }
  if(['ERROR','CANCELED'].includes(current.readyState))throw new Error('Build '+current.readyState);
  if(current.readyState!=='READY'){result.status='WAITING: bounded status allowance reached';save();return;}
  assert.equal(current.id,d.id);assert.equal(current.url,d.url);assert.equal(current.projectId,m.deployment.projectId);
  assert.equal(current.gitSource?.sha,m.source.sha);assert(!current.target||current.target==='preview');
  result.ready=true;result.projects=[];
  for(const b of baseline.projects){
   const p=await request(b.label+' project/config/environment readback',api('/v9/projects/'+b.id));assert(p.ok);const v=await p.json();
   assert.equal(v.id,b.id);if(b.label==='purchase')assert.equal(v.ssoProtection?.deploymentType,'all');
   const config=hash(Object.fromEntries(configKeys.map(k=>[k,v[k]??null]))),environment=hash(v.env||[]);
   result.projects.push({id:b.id,configurationMatchesFreshBaseline:config===b.configurationSha256,environmentMatchesFreshBaseline:environment===b.environmentSha256});
   assert.equal(config,b.configurationSha256,'Config drift vs fresh pre-create baseline; do not revert');assert.equal(environment,b.environmentSha256,'Env drift vs fresh pre-create baseline; do not revert');save();
  }
  result.aliases=[];
  for(const b of baseline.projects){
   const a=await request(b.label+' alias readback',api('/v4/aliases?projectId='+b.id+'&limit=100'));assert(a.ok);const v=await a.json();assert(!v.pagination?.next,'Incomplete alias list');
   const actual=(v.aliases||[]).map(x=>({alias:x.alias,deploymentId:x.deploymentId||x.deployment?.id}));
   for(const old of b.aliases)assert(actual.some(x=>x.alias===old.alias&&x.deploymentId===old.deploymentId),'Retained alias target changed; do not revert');
   result.aliases.push({projectId:b.id,preexistingAliasesUnchanged:true,newAliases:actual.filter(x=>!b.aliases.some(y=>y.alias===x.alias))});save();
  }
  const probe=await request('unique deployment anonymous protection','https://'+d.url,{},true);
  const location=probe.headers.get('location');assert([302,303,307,308].includes(probe.status)&&location,'Protection not proven');
  const redirect=new URL(location,'https://'+d.url);assert.equal(redirect.hostname,'vercel.com');assert(/sso|login/.test(redirect.pathname),'Expected Vercel login redirect');
  result.protected=true;result.status='PREVIEW VERIFIED; RUNTIME BINDINGS / PURCHASE ACTIVATION NOT VERIFIED';save();
 }catch(e){result.status='STOPPED';result.error=e.message;save();throw e;}
 console.log(JSON.stringify(result));
}
async function locked(){if(!process.argv.includes('--execute'))return main();const lockPath=setup+'/EXECUTION-A5.lock';const fd=fs.openSync(lockPath,'wx');try{fs.writeFileSync(fd,JSON.stringify({pid:process.pid,at:new Date().toISOString()}),{flush:true});return await main();}finally{fs.closeSync(fd);fs.unlinkSync(lockPath);}}
locked().catch(e=>{console.error(e.message);process.exitCode=1});
