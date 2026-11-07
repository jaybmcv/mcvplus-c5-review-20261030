'use strict';
const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto');
function construct(){
 const m=JSON.parse(fs.readFileSync(__dirname+'/configuration-manifest.json'));
 assert.equal(m.source.sha,'6166eabb7bfbd2e5b162c6a141731172be6110e2');
 assert.equal(m.deployment.projectId,'prj_bnugVcBR13UQb0N8q43GbxC5flDP');
 assert.equal(m.deployment.gitSource.repoId,1230412804);
 const env={...m.values};
 for(const [name,[file,field]] of Object.entries(m.bindings))env[name]=JSON.parse(fs.readFileSync(file))[field];
 assert.deepEqual(JSON.parse(env.MCV_PURCHASE_TEST_UIDS),[m.selectedUid]);
 const buildEnv=Object.fromEntries(Object.entries(env).filter(([key])=>key.startsWith('NEXT_PUBLIC_')));
 for(const [name,value] of Object.entries(env)){assert(typeof value==='string'&&value.length);assert(!/OIDC|EMULATOR|VERCEL_TOKEN|GITHUB_TOKEN|GOOGLE_APPLICATION_CREDENTIALS|APPROVAL_PRIVATE|APPROVED_MANIFEST_SHA256/.test(name));}
 const body={name:'mcv-plus-purchase-test',project:m.deployment.projectId,gitSource:{type:'github',repoId:1230412804,ref:m.source.sha,sha:m.source.sha},env,build:{env:buildEnv}};
 // Omitted target means preview. Do not pass --skip-domain: installed CLI allows that only for production.
 assert(!Object.hasOwn(body,'target'));assert(!Object.hasOwn(body,'alias'));assert(!Object.hasOwn(body,'autoAssignCustomDomains'));
 const summary={mode:'construct-only; no network execution implemented',method:'POST',endpoint:'https://api.vercel.com/v13/deployments?teamId='+m.deployment.teamId,projectId:body.project,gitSource:body.gitSource,target:'preview (target omitted)',runtimeNames:Object.keys(env).sort(),buildNames:Object.keys(buildEnv).sort(),secretBuildInputs:0,operatorCredentialInputs:0,signatureInputs:0,manifestSha256:crypto.createHash('sha256').update(fs.readFileSync(__dirname+'/configuration-manifest.json')).digest('hex'),networkRequests:0};
 return {body,summary};
}
module.exports={construct};
if(require.main===module){const {summary}=construct();fs.writeFileSync(__dirname+'/wire-summary.json',JSON.stringify(summary,null,2));console.log(JSON.stringify(summary,null,2));}
