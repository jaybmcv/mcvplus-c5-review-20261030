'use strict';
// Local public source reads only: no CLI import/execution, auth/config reads or network.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const base='C:/Users/HENRI/AppData/Roaming/npm/node_modules/vercel';
const files={command:'dist/commands/deploy/index.js',wrapper:'dist/chunks/chunk-RHUKJ7OR.js',transport:'dist/chunks/chunk-DPRZMI7B.js',parser:'dist/chunks/chunk-U7WYFYT7.js',options:'dist/chunks/chunk-ZA7B7LXL.js'};
const source={},hashes={};
for(const [k,f] of Object.entries(files)){const b=fs.readFileSync(path.join(base,f));source[k]=b.toString();hashes[f]=crypto.createHash('sha256').update(b).digest('hex');}
function section(key,start,end){const s=source[key],a=s.indexOf(start),b=s.indexOf(end,a);if(a<0||b<0)throw Error('Source markers changed');return s.slice(a,b);}
const excerpts={
parseEnv:section('parser','var parseEnv = (env) => {','// src/util/env/diff-env-files.ts'),
addProcessEnv:section('command','var addProcessEnv = async (log, env) => {','async function handleContinueDeployment('),
create:section('wrapper','  async create(path, {','  async handleDeploymentError('),
postDeployment:section('transport','    async function* postDeployment(','    function getDefaultName('),
upload:section('transport','    async function* upload(files, clientOptions, deploymentOptions) {','    async function* uploadFiles(')
};
fs.writeFileSync(__dirname+'/cli-excerpts.json',JSON.stringify(excerpts,null,2)+'\n');
fs.writeFileSync(__dirname+'/cli-source-receipt.json',JSON.stringify({version:JSON.parse(fs.readFileSync(base+'/package.json')).version,files:hashes,vercelRequests:0,credentialStoresRead:0,cliExecuted:false},null,2)+'\n');
console.log('Local public CLI source excerpts retained; no CLI execution.');
