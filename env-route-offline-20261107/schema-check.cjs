'use strict';
const fs=require('fs'),crypto=require('crypto'),assert=require('assert/strict');
const Ajv=require('C:/Users/HENRI/AppData/Roaming/npm/node_modules/vercel/node_modules/ajv');
const bytes=fs.readFileSync(__dirname+'/../offline-diagnostic-20261107/deployment-api-schema.json');
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'b02dd782a9eef520dad3df0ba0cdeede522b2dc9a83e9d074fe5f6622a318d7b');
const cached=JSON.parse(bytes),schema=cached.relevant.find(x=>x.operationId==='createDeployment').requestBody.content['application/json'].schema;
const validate=new Ajv({allErrors:true,strict:false,validateSchema:false}).compile(schema);
const env={PRIVATE_RUNTIME:'synthetic',NEXT_PUBLIC_FIXTURE:'synthetic-public'},build={env:{NEXT_PUBLIC_FIXTURE:'synthetic-public'}};
const base={name:'fixture',project:'prj_fixture',gitSource:{type:'github',repoId:1230412804,ref:'6166eabb7bfbd2e5b162c6a141731172be6110e2',sha:'6166eabb7bfbd2e5b162c6a141731172be6110e2'}};
const results=[];
for(const [name,body] of Object.entries({preparedShape:{...base,env,build},cliShape:{name:'fixture',project:'prj_fixture',env,build,source:'cli',files:[]}})){
assert.equal(validate(body),false);
const fields=validate.errors.map(x=>x.params.additionalProperty).sort();
assert.deepEqual(fields,name==='cliShape'?['build','env','source']:['build','env']);results.push({name,valid:false,additionalProperties:fields});
}
assert(validate(base));
const out={networkRequests:0,credentialsRead:0,schemaSha256:crypto.createHash('sha256').update(bytes).digest('hex'),results,withoutOverridesValid:true,withoutOverridesSemanticallyEquivalent:false,disposition:'HOLD: CLI evidence conflicts with cached public schema. No corrected schema-conforming request established.'};
fs.writeFileSync(__dirname+'/schema-result.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out,null,2));
