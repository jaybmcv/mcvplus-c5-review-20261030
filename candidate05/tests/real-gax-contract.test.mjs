import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {retainedTokenAuth} from '../app/qualification/sdk.mjs';
const require=createRequire(new URL('../app/package.json',import.meta.url));
const {GrpcClient}=require('google-gax');
test('real pinned google-gax consumes static auth contract through stub creation without a channel or RPC',async()=>{
 const auth=retainedTokenAuth({issuedToken:'SYNTHETIC-not-usable',expiresAt:Date.now()+60000});
 let constructed=0;
 class OfflineStub {constructor(address,credentials,options){constructed++;this.address=address;this.credentials=credentials;this.options=options;}}
 const gax=new GrpcClient({auth});
 const stub=await gax.createStub(OfflineStub,{servicePath:'offline.invalid',port:443,universeDomain:'googleapis.com','grpc.enable_retries':0},true);
 assert.equal(constructed,1);assert.equal(stub.address,'offline.invalid:443');assert.equal(stub.options['grpc.enable_retries'],0);
 assert.equal(await auth.getUniverseDomain(),'googleapis.com');
 const client=await auth.getClient();assert.equal((await client.getRequestHeaders()).get('authorization'),'Bearer SYNTHETIC-not-usable');
 await assert.rejects(client.refreshAccessToken(),/refresh forbidden/);
});
